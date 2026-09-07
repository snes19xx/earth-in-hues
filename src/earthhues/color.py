import numpy as np


def rgb_to_hex(r: float, g: float, b: float) -> str:
    """Round and clamp an RGB triple to a #rrggbb string."""
    channels = (int(round(max(0.0, min(255.0, c)))) for c in (r, g, b))
    return "#" + "".join(f"{c:02x}" for c in channels)


def hex_to_rgb(value: str) -> tuple[int, int, int]:
    """Parse #rrggbb into an integer RGB triple."""
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def weighted_mean_rgb(rgb: np.ndarray, mask: np.ndarray, weights: np.ndarray) -> np.ndarray:
    """Area-weighted mean of each channel over the masked pixels."""
    w = weights[mask]
    total = w.sum()
    if total == 0:
        return np.zeros(3)
    return np.array([np.average(rgb[i][mask], weights=w) for i in range(3)])
