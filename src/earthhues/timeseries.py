import json
from collections import defaultdict
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import stats

from .color import rgb_to_hex, weighted_mean_linear
from .colorspace import srgb_to_lab
from .gibs import LAYERS
from .masks import build_masks
from .sources import Sources

MIN_COVERAGE = 0.2
CONTROL_CATEGORY = "Deserts"


def read_composite(path):
    """Composite RGB as floats plus a mask of pixels carrying data."""
    rgb = np.array(Image.open(path).convert("RGB")).astype(np.float64)
    return np.moveaxis(rgb, 2, 0), rgb.sum(axis=2) > 0


def composite_colors(path, masks, weights) -> dict:
    """Area-weighted linear-light mean per category for one composite."""
    rgb, valid = read_composite(path)
    result = {}
    for name, mask in masks.items():
        combined = mask & valid
        w = weights[combined]
        coverage = w.sum() / weights[mask].sum()
        if coverage < MIN_COVERAGE:
            continue
        samples = np.stack([rgb[i][combined] for i in range(3)], axis=1)
        mean = weighted_mean_linear(samples, w)
        result[name] = {
            "hex": rgb_to_hex(*mean),
            "lightness": round(float(srgb_to_lab(mean / 255.0)[0]), 3),
            "coverage": round(float(coverage), 4),
        }
    return result


def observations(sources: Sources, directory, verbose: bool = True) -> list[dict]:
    """One record per downloaded composite."""
    masks = build_masks(sources.dem, sources.landcover)
    records = []

    for sensor in LAYERS:
        paths = sorted(Path(directory, sensor).glob("*.png"))
        for index, path in enumerate(paths, 1):
            if verbose and index % 12 == 0:
                print(f"  {sensor} {index}/{len(paths)}")
            records.append(
                {
                    "sensor": sensor,
                    "date": path.stem,
                    "year": int(path.stem[:4]),
                    "categories": composite_colors(path, masks, sources.weights),
                }
            )
    return records


def annual_means(records: list[dict]) -> dict:
    """Mean lightness per sensor, year and category across that year's composites."""
    grouped = defaultdict(list)
    for record in records:
        for name, entry in record["categories"].items():
            grouped[(record["sensor"], record["year"], name)].append(entry["lightness"])

    annual = defaultdict(dict)
    for (sensor, year, name), values in grouped.items():
        annual[sensor].setdefault(name, {})[year] = {
            "lightness": round(float(np.mean(values)), 3),
            "composites": len(values),
        }
    return dict(annual)


def trend(years, values) -> dict:
    """Theil-Sen slope per decade with a Mann-Kendall significance test."""
    years = np.asarray(years, dtype=float)
    values = np.asarray(values, dtype=float)
    slope, intercept, low, high = stats.theilslopes(values, years, 0.95)
    tau, p_value = stats.kendalltau(years, values)
    return {
        "slope_per_decade": round(float(slope * 10), 4),
        "confidence_low": round(float(low * 10), 4),
        "confidence_high": round(float(high * 10), 4),
        "tau": round(float(tau), 3),
        "p_value": round(float(p_value), 5),
        "years": len(years),
        "significant": bool(p_value < 0.05),
    }


def trends(annual: dict) -> dict:
    """Lightness trend per sensor and category."""
    result = defaultdict(dict)
    for sensor, categories in annual.items():
        for name, by_year in categories.items():
            years = sorted(by_year)
            if len(years) < 8:
                continue
            result[sensor][name] = trend(years, [by_year[y]["lightness"] for y in years])
    return dict(result)


def sensor_agreement(trend_table: dict) -> dict:
    """Terra minus Aqua slope per category, with the stable control for scale."""
    shared = set(trend_table.get("terra", {})) & set(trend_table.get("aqua", {}))
    control = abs(trend_table["terra"].get(CONTROL_CATEGORY, {}).get("slope_per_decade", 0.0))
    return {
        name: {
            "terra": trend_table["terra"][name]["slope_per_decade"],
            "aqua": trend_table["aqua"][name]["slope_per_decade"],
            "difference": round(
                trend_table["terra"][name]["slope_per_decade"]
                - trend_table["aqua"][name]["slope_per_decade"],
                4,
            ),
            "exceeds_control": abs(
                trend_table["terra"][name]["slope_per_decade"]
                - trend_table["aqua"][name]["slope_per_decade"]
            )
            > 2 * max(control, 0.01),
        }
        for name in sorted(shared)
    }


def control_adjusted(trend_table: dict) -> dict:
    """Each slope measured against the pseudo-invariant control on the same sensor.

    Deserts drift slightly on both sensors, so that drift is the floor below which a
    trend cannot be separated from shared calibration error.
    """
    result = {}
    for sensor, categories in trend_table.items():
        floor = categories.get(CONTROL_CATEGORY, {}).get("slope_per_decade")
        if floor is None:
            continue
        result[sensor] = {
            name: {
                "slope_per_decade": entry["slope_per_decade"],
                "excess": round(entry["slope_per_decade"] - floor, 4),
                "above_floor": bool(
                    entry["significant"] and abs(entry["slope_per_decade"]) > 2 * abs(floor)
                ),
            }
            for name, entry in categories.items()
        }
    return result


def derive(records: list[dict]) -> dict:
    """Annual means, trends and cross-checks from a set of composite records."""
    annual = annual_means(records)
    trend_table = trends(annual)
    return {
        "observations": records,
        "annual": annual,
        "trends": trend_table,
        "agreement": sensor_agreement(trend_table),
        "control_adjusted": control_adjusted(trend_table),
        "control_category": CONTROL_CATEGORY,
    }


def web_payload(derived: dict) -> dict:
    """The derived sections only, small enough to ship to a browser."""
    return {key: value for key, value in derived.items() if key != "observations"}


def build(sources: Sources, directory, verbose: bool = True) -> dict:
    return derive(observations(sources, directory, verbose))


def rebuild(path) -> dict:
    """Recompute the derived sections from observations already on disk."""
    return derive(json.loads(Path(path).read_text())["observations"])
