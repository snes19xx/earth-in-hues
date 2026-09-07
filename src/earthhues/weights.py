import numpy as np
import rasterio

from .grid import Grid


def latitudes(grid: Grid) -> np.ndarray:
    """Centre latitude of every grid row, in degrees."""
    rows = np.arange(grid.height)
    _, lats = rasterio.transform.xy(grid.transform, rows, np.zeros(grid.height))
    return np.asarray(lats, dtype=np.float64)


def cosine_weights(grid: Grid) -> np.ndarray:
    """Per-pixel area weight cos(latitude), broadcast to the full grid."""
    row_weights = np.cos(np.radians(latitudes(grid)))
    return np.broadcast_to(row_weights[:, np.newaxis], grid.shape)
