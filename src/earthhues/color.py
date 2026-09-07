import numpy as np

from .colorspace import (
    lab_to_srgb,
    linear_to_srgb,
    srgb_to_lab,
    srgb_to_linear,
)

METHODS = ["srgb_mean", "linear_mean", "lab_mean", "median", "dominant"]


def rgb_to_hex(r: float, g: float, b: float) -> str:
    """Round and clamp an RGB triple in 0-255 to a #rrggbb string."""
    channels = (int(round(max(0.0, min(255.0, c)))) for c in (r, g, b))
    return "#" + "".join(f"{c:02x}" for c in channels)


def hex_to_rgb(value: str) -> tuple[int, int, int]:
    """Parse #rrggbb into an integer RGB triple."""
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def weighted_mean_srgb(samples: np.ndarray, weights: np.ndarray) -> np.ndarray:
    """Mean of gamma-encoded values, biased dark on high-contrast sets."""
    return np.average(samples, axis=0, weights=weights)


def weighted_mean_linear(samples: np.ndarray, weights: np.ndarray) -> np.ndarray:
    """Mean radiance: decode to linear light, average, re-encode."""
    linear = srgb_to_linear(samples / 255.0)
    return linear_to_srgb(np.average(linear, axis=0, weights=weights)) * 255.0


def weighted_mean_lab(samples: np.ndarray, weights: np.ndarray) -> np.ndarray:
    """Mean in CIE L*a*b*, the perceptually uniform average."""
    lab = srgb_to_lab(samples / 255.0)
    return lab_to_srgb(np.average(lab, axis=0, weights=weights)) * 255.0


def weighted_median(samples: np.ndarray, weights: np.ndarray) -> np.ndarray:
    """Per-channel weighted median."""
    return np.array([_median_1d(samples[:, i], weights) for i in range(3)])


def _median_1d(values: np.ndarray, weights: np.ndarray) -> float:
    order = np.argsort(values, kind="stable")
    cumulative = np.cumsum(weights[order])
    return float(values[order][np.searchsorted(cumulative, 0.5 * cumulative[-1])])


def dominant_color(
    samples: np.ndarray,
    weights: np.ndarray,
    clusters: int = 5,
    sample_size: int = 50_000,
    seed: int = 0,
) -> np.ndarray:
    """Centroid of the heaviest k-means cluster in CIE L*a*b*."""
    from sklearn.cluster import KMeans

    lab, cluster_weights = _draw(srgb_to_lab(samples / 255.0), weights, sample_size, seed)
    k = min(clusters, len(np.unique(lab, axis=0)))
    if k < 2:
        return lab_to_srgb(lab[0]) * 255.0

    model = KMeans(n_clusters=k, n_init=4, random_state=seed).fit(lab)
    mass = np.bincount(model.labels_, weights=cluster_weights, minlength=k)
    return lab_to_srgb(model.cluster_centers_[mass.argmax()]) * 255.0


def _draw(values: np.ndarray, weights: np.ndarray, size: int, seed: int):
    if len(values) <= size:
        return values, weights
    rng = np.random.default_rng(seed)
    probability = weights / weights.sum()
    picked = rng.choice(len(values), size=size, replace=False, p=probability)
    return values[picked], weights[picked]


ESTIMATORS = {
    "srgb_mean": weighted_mean_srgb,
    "linear_mean": weighted_mean_linear,
    "lab_mean": weighted_mean_lab,
    "median": weighted_median,
    "dominant": dominant_color,
}
