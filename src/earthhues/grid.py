from dataclasses import dataclass

import rasterio
from affine import Affine
from rasterio.crs import CRS


@dataclass(frozen=True)
class Grid:
    """Raster geometry every input is aligned to."""

    shape: tuple[int, int]
    transform: Affine
    crs: CRS

    @property
    def height(self) -> int:
        return self.shape[0]

    @property
    def width(self) -> int:
        return self.shape[1]


def read_grid(path) -> Grid:
    """Read the reference grid from a raster."""
    with rasterio.open(path) as src:
        return Grid((src.height, src.width), src.transform, src.crs)
