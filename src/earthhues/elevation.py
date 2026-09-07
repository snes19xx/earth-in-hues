import math
from pathlib import Path

import numpy as np
import rasterio
from rasterio.enums import Resampling
from rasterio.windows import from_bounds

from .grid import Grid


def build_dem(tile_dir, grid: Grid) -> np.ndarray:
    """Stitch GEBCO tiles onto grid as signed metres, negative below sea level."""
    dem = np.zeros(grid.shape, dtype=np.float32)
    tiles = sorted(Path(tile_dir).glob("*.tif"))
    if not tiles:
        raise FileNotFoundError(f"no GEBCO tiles in {tile_dir}")

    for tile in tiles:
        with rasterio.open(tile) as src:
            window = from_bounds(*src.bounds, transform=grid.transform)
            row0 = math.floor(window.row_off)
            col0 = math.floor(window.col_off)
            height = math.ceil(window.height)
            width = math.ceil(window.width)
            dem[row0 : row0 + height, col0 : col0 + width] = src.read(
                1, out_shape=(height, width), resampling=Resampling.average
            )
    return dem


def roughness(dem: np.ndarray) -> np.ndarray:
    """Gradient magnitude of the elevation array."""
    dy, dx = np.gradient(dem)
    return np.sqrt(dx**2 + dy**2)
