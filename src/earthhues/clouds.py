import xml.etree.ElementTree as ET
from pathlib import Path

import numpy as np
import requests
from PIL import Image

from .gibs import WMS, fetch

COLORMAP_URL = "https://gibs.earthdata.nasa.gov/colormaps/v1.3/MODIS_Cloud_Fraction.xml"
LAYER = "MODIS_Terra_Cloud_Fraction_Day"

# three days per month drawn from different years
CLIMATOLOGY_DATES = [
    [f"{year}-{month:02d}-{day:02d}" for year, day in ((2015, 8), (2018, 18), (2021, 26))]
    for month in range(1, 13)
]

ASYMMETRY = 0.85
# MODIS's raw value (~12) overestimates brightness because thin clouds are 
# counted as fully overcast. Adjusted here to 7.5 to match Earth's observed albedo.
CLOUD_OPTICAL_THICKNESS = 7.5
MODIS_OPTICAL_THICKNESS = 12.0
OBSERVED_VISIBLE_ALBEDO = 0.40


def cloud_albedo(optical_thickness: float = CLOUD_OPTICAL_THICKNESS) -> float:
    """Two-stream albedo of a conservatively scattering cloud layer."""
    reduced = (1 - ASYMMETRY) * optical_thickness
    return reduced / (1 + reduced)


def load_colormap(cache_dir) -> dict:
    """RGB triple to cloud fraction percent, fetched once and cached."""
    path = Path(cache_dir) / "cloud_fraction_colormap.xml"
    if not path.exists():
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(requests.get(COLORMAP_URL, timeout=120).content)

    root = ET.parse(path).getroot()
    return {
        tuple(int(v) for v in entry.attrib["rgb"].split(",")): float(entry.attrib["value"])
        for entry in root.iter()
        if entry.tag.endswith("ColorMapEntry") and entry.attrib.get("nodata") != "true"
    }


def download(date: str, directory, width: int = 3600, height: int = 1800) -> Path:
    """Fetch one day of rendered cloud fraction, skipping dates already on disk."""
    target = Path(directory) / f"{date}.png"
    if target.exists() and target.stat().st_size > 0:
        return target
    url = (
        f"{WMS}?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS={LAYER}"
        f"&CRS=EPSG:4326&BBOX=-90,-180,90,180&WIDTH={width}&HEIGHT={height}"
        f"&FORMAT=image/png&TIME={date}"
    )
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(fetch(url))
    return target


def decode(path, colormap: dict) -> np.ndarray:
    """Rendered cloud fraction back to a 0-1 field, NaN where the palette has no match."""
    pixels = np.array(Image.open(path).convert("RGB")).astype(np.int32)
    codes = pixels[..., 0] * 65536 + pixels[..., 1] * 256 + pixels[..., 2]

    keys = np.array(
        [r * 65536 + g * 256 + b for r, g, b in colormap], dtype=np.int32
    )
    values = np.array(list(colormap.values()), dtype=np.float32)
    order = np.argsort(keys)
    keys, values = keys[order], values[order]

    index = np.clip(np.searchsorted(keys, codes), 0, len(keys) - 1)
    matched = keys[index] == codes

    fraction = np.full(codes.shape, np.nan, dtype=np.float32)
    fraction[matched] = values[index[matched]] / 100.0
    return fraction


def monthly_climatology(directory, cache_dir, verbose: bool = True) -> np.ndarray:
    """Mean cloud fraction per month, shape (12, rows, cols), gaps filled by zonal mean."""
    colormap = load_colormap(cache_dir)
    months = []

    for index, dates in enumerate(CLIMATOLOGY_DATES):
        if verbose:
            print(f"  cloud month {index + 1}/12")
        fields = np.stack([decode(download(date, directory), colormap) for date in dates])
        present = np.isfinite(fields)
        counts = present.sum(axis=0)
        totals = np.where(present, fields, 0.0).sum(axis=0)
        mean = np.where(counts > 0, totals / np.maximum(counts, 1), np.nan)
        months.append(fill_gaps(mean))

    return np.stack(months)


def fill_gaps(field: np.ndarray) -> np.ndarray:
    """Replace missing pixels with their row mean, then with the field mean."""
    filled = field.copy()
    present = np.isfinite(filled)
    counts = present.sum(axis=1)
    totals = np.where(present, filled, 0.0).sum(axis=1)

    overall = totals.sum() / max(counts.sum(), 1)
    rows = np.where(counts > 0, totals / np.maximum(counts, 1), overall)
    filled[~present] = np.broadcast_to(rows[:, None], filled.shape)[~present]
    return filled


SEASONS = {"winter": (12, 1, 2), "spring": (3, 4, 5), "summer": (6, 7, 8), "autumn": (9, 10, 11)}
SEASON_ORDER = ["winter", "spring", "summer", "autumn"]
ATLAS_WIDTH = 720
ATLAS_LEVELS = 16


def seasonal_composite(months, directory, colormap) -> np.ndarray:
    """Mean cloud fraction over every downloaded day falling in these months."""
    dates = [d for group in CLIMATOLOGY_DATES for d in group if int(d[5:7]) in months]
    fields = np.stack([decode(download(d, directory), colormap) for d in dates])
    present = np.isfinite(fields)
    counts = present.sum(axis=0)
    totals = np.where(present, fields, 0.0).sum(axis=0)
    return fill_gaps(np.where(counts > 0, totals / np.maximum(counts, 1), np.nan)), len(dates)


def write_atlas(directory, cache_dir, out_path, verbose: bool = True) -> dict:
    """Four seasonal cloud fields stacked into one quantised greyscale PNG."""
    from PIL import Image

    colormap = load_colormap(cache_dir)
    height = ATLAS_WIDTH // 2
    step = 255 // (ATLAS_LEVELS - 1)
    tiles, days = [], {}

    for season in SEASON_ORDER:
        field, count = seasonal_composite(SEASONS[season], directory, colormap)
        days[season] = count
        if verbose:
            print(f"  {season} from {count} days, mean {field.mean():.3f}")
        small = Image.fromarray((np.clip(field, 0, 1) * 255).astype(np.uint8))
        small = small.resize((ATLAS_WIDTH, height), Image.BILINEAR)
        tiles.append(np.round(np.array(small) / 255 * (ATLAS_LEVELS - 1)).astype(np.uint8) * step)

    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(np.vstack(tiles), mode="L").save(out_path, optimize=True)

    return {
        "width": ATLAS_WIDTH,
        "height": height,
        "seasons": SEASON_ORDER,
        "levels": ATLAS_LEVELS,
        "step": step,
        "days_per_season": days,
        "month_to_season": [0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 0],
    }
