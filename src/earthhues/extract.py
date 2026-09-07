import numpy as np
import rasterio

from .color import rgb_to_hex, weighted_mean_rgb
from .masks import build_masks
from .sources import MONTHS, Sources


def read_month(sources: Sources, month: str):
    """Read a month's RGB bands as float arrays plus its valid-pixel mask."""
    with rasterio.open(sources.month_raster(month)) as src:
        rgb = np.stack([src.read(i).astype(np.float64) for i in (1, 2, 3)])
        valid = src.dataset_mask() > 0
    return rgb, valid


def monthly_colors(sources: Sources, verbose: bool = True) -> list[dict]:
    """Area-weighted mean colour of every category, one record per month."""
    masks = build_masks(sources.dem, sources.landcover)
    weights = sources.weights
    records = []

    for month in MONTHS:
        if verbose:
            print(f"extracting {month}")
        rgb, valid = read_month(sources, month)
        record = {"month": month}
        for name, mask in masks.items():
            combined = mask & valid
            if weights[combined].sum() == 0:
                record[name] = "#000000"
                continue
            record[name] = rgb_to_hex(*weighted_mean_rgb(rgb, combined, weights))
        records.append(record)

    return records
