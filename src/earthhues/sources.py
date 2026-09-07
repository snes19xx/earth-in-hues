from functools import cached_property
from pathlib import Path

import numpy as np

from .elevation import build_dem
from .grid import Grid, read_grid
from .landcover import build_landcover
from .weights import cosine_weights

MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sept", "oct", "nov", "dec"]

MONTH_LABELS = {
    "jan": "January",
    "feb": "February",
    "mar": "March",
    "apr": "April",
    "may": "May",
    "jun": "June",
    "jul": "July",
    "aug": "August",
    "sept": "September",
    "oct": "October",
    "nov": "November",
    "dec": "December",
}

REFERENCE_MONTH = "jan"


class Sources:
    """Locates the input rasters and derives the grid, DEM and land cover from them."""

    def __init__(self, root, cache_dir="cache"):
        self.root = Path(root)
        self.cache_dir = Path(cache_dir)

    def month_raster(self, month: str) -> Path:
        return self.root / f"{month}.TIFF"

    @property
    def gebco_dir(self) -> Path:
        return self.root / "gebco_2025_geotiff"

    @property
    def landcover_hdf(self) -> Path:
        return self.root / "MCD12C1.hdf"

    @cached_property
    def grid(self) -> Grid:
        return read_grid(self.month_raster(REFERENCE_MONTH))

    @cached_property
    def weights(self) -> np.ndarray:
        return cosine_weights(self.grid)

    @cached_property
    def dem(self) -> np.ndarray:
        return self._cached("dem", lambda: build_dem(self.gebco_dir, self.grid))

    @cached_property
    def landcover(self) -> np.ndarray:
        return self._cached("landcover", lambda: build_landcover(self.landcover_hdf, self.grid))

    def _cached(self, name, build):
        path = self.cache_dir / f"{name}_{self.grid.height}x{self.grid.width}.npy"
        if path.exists():
            return np.load(path)
        array = build()
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        np.save(path, array)
        return array
