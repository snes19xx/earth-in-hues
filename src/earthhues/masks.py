import numpy as np

from .elevation import roughness

MOUNTAIN_ELEVATION_M = 1000
MOUNTAIN_ROUGHNESS = 50

CATEGORIES = [
    "Oceans",
    "Fresh Water",
    "Snow and Ice",
    "Deserts",
    "Forests",
    "Grasslands",
    "Shrublands",
    "Croplands",
    "Wetlands",
    "Urban Areas",
    "Mountains",
    "Total Land Mean",
    "Total Ocean Mean",
    "Total Earth Mean",
]

AGGREGATE_CATEGORIES = ["Mountains", "Total Land Mean", "Total Ocean Mean", "Total Earth Mean"]

SURFACE_CATEGORIES = [c for c in CATEGORIES if c not in AGGREGATE_CATEGORIES]


def build_masks(dem: np.ndarray, landcover: np.ndarray) -> dict[str, np.ndarray]:
    """Boolean mask per surface category, keyed in CATEGORIES order."""
    rough = roughness(dem)
    return {
        "Oceans": (landcover == 0) & (dem < 0),
        "Fresh Water": (landcover == 0) & (dem >= 0),
        "Snow and Ice": landcover == 15,
        "Deserts": landcover == 16,
        "Forests": np.isin(landcover, [1, 2, 3, 4, 5]),
        "Grasslands": np.isin(landcover, [8, 9, 10, 14]),
        "Shrublands": np.isin(landcover, [6, 7]),
        "Croplands": landcover == 12,
        "Wetlands": landcover == 11,
        "Urban Areas": landcover == 13,
        "Mountains": (dem > MOUNTAIN_ELEVATION_M) & (rough > MOUNTAIN_ROUGHNESS),
        "Total Land Mean": (dem >= 0) & (landcover != 0),
        "Total Ocean Mean": dem < 0,
        "Total Earth Mean": np.ones(dem.shape, dtype=bool),
    }
