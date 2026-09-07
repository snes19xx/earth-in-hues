import numpy as np
import rasterio

from .color import ESTIMATORS, METHODS, rgb_to_hex
from .colorspace import delta_e_2000, srgb_to_lab
from .masks import build_masks
from .sources import MONTHS, Sources

CANONICAL_METHOD = "linear_mean"


def read_month(sources: Sources, month: str):
    """Read a month's RGB bands as float arrays plus its valid-pixel mask."""
    with rasterio.open(sources.month_raster(month)) as src:
        rgb = np.stack([src.read(i).astype(np.float64) for i in (1, 2, 3)])
        valid = src.dataset_mask() > 0
    return rgb, valid


def category_estimates(
    rgb: np.ndarray,
    mask: np.ndarray,
    weights: np.ndarray,
    methods: list[str],
) -> dict[str, np.ndarray]:
    """Each requested estimator applied to the masked pixels, in 0-255 RGB."""
    w = weights[mask]
    if w.sum() == 0:
        return {name: np.zeros(3) for name in methods}
    samples = np.stack([rgb[i][mask] for i in range(3)], axis=1)
    return {name: ESTIMATORS[name](samples, w) for name in methods}


def monthly_colors(sources: Sources, method: str = CANONICAL_METHOD, verbose: bool = True):
    """Flat month record of one estimator's hex colour per category."""
    masks = build_masks(sources.dem, sources.landcover)
    records = []

    for month in MONTHS:
        if verbose:
            print(f"extracting {month}")
        rgb, valid = read_month(sources, month)
        record = {"month": month}
        for name, mask in masks.items():
            estimate = category_estimates(rgb, mask & valid, sources.weights, [method])
            record[name] = rgb_to_hex(*estimate[method])
        records.append(record)

    return records


def monthly_methods(sources: Sources, methods: list[str] = None, verbose: bool = True):
    """Every estimator per category per month, with the sRGB to linear shift in dE2000."""
    methods = methods or METHODS
    masks = build_masks(sources.dem, sources.landcover)
    records = []

    for month in MONTHS:
        if verbose:
            print(f"estimating {month}")
        rgb, valid = read_month(sources, month)
        categories = {}
        for name, mask in masks.items():
            estimate = category_estimates(rgb, mask & valid, sources.weights, methods)
            entry = {m: rgb_to_hex(*value) for m, value in estimate.items()}
            if "srgb_mean" in estimate and "linear_mean" in estimate:
                entry["gamma_shift"] = round(
                    float(
                        delta_e_2000(
                            srgb_to_lab(estimate["srgb_mean"] / 255.0),
                            srgb_to_lab(estimate["linear_mean"] / 255.0),
                        )
                    ),
                    2,
                )
            categories[name] = entry
        records.append({"month": month, "categories": categories})

    return records
