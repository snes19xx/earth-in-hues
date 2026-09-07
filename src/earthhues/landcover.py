import numpy as np
import rasterio
from rasterio.enums import Resampling
from rasterio.warp import reproject

from .grid import Grid

IGBP_CLASSES = {
    0: "Water",
    1: "Evergreen Needleleaf Forest",
    2: "Evergreen Broadleaf Forest",
    3: "Deciduous Needleleaf Forest",
    4: "Deciduous Broadleaf Forest",
    5: "Mixed Forest",
    6: "Closed Shrubland",
    7: "Open Shrubland",
    8: "Woody Savanna",
    9: "Savanna",
    10: "Grassland",
    11: "Permanent Wetland",
    12: "Cropland",
    13: "Urban and Built-up",
    14: "Cropland / Natural Vegetation Mosaic",
    15: "Snow and Ice",
    16: "Barren or Sparsely Vegetated",
}


def build_landcover(hdf_path, grid: Grid) -> np.ndarray:
    """Reproject MODIS MCD12C1 IGBP class labels onto grid."""
    labels = np.zeros(grid.shape, dtype=np.uint8)
    with rasterio.open(hdf_path) as hdf:
        # subdataset 0 is Majority_Land_Cover_Type_1
        with rasterio.open(hdf.subdatasets[0]) as src:
            reproject(
                source=rasterio.band(src, 1),
                destination=labels,
                src_transform=src.transform,
                src_crs=src.crs,
                dst_transform=grid.transform,
                dst_crs=grid.crs,
                resampling=Resampling.nearest,
            )
    return labels
