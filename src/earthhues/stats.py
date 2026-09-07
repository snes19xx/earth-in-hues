import numpy as np

from .color import rgb_to_hex, weighted_mean_linear
from .colorspace import delta_e_2000, srgb_to_lab

PERCENTILES = [5, 25, 50, 75, 95]
DISPERSION_SAMPLE = 100_000


def weighted_percentile(values: np.ndarray, weights: np.ndarray, q: float) -> float:
    """Value below which q percent of the weight falls."""
    order = np.argsort(values, kind="stable")
    cumulative = np.cumsum(weights[order])
    return float(values[order][np.searchsorted(cumulative, q / 100.0 * cumulative[-1])])


def weighted_std(values: np.ndarray, weights: np.ndarray, axis=0) -> np.ndarray:
    """Weighted standard deviation about the weighted mean."""
    mean = np.average(values, axis=axis, weights=weights)
    variance = np.average((values - mean) ** 2, axis=axis, weights=weights)
    return np.sqrt(variance)


def dispersion(samples: np.ndarray, weights: np.ndarray, centre: np.ndarray, seed: int = 0) -> float:
    """Weighted mean CIEDE2000 distance from a category's pixels to its mean colour."""
    if len(samples) > DISPERSION_SAMPLE:
        rng = np.random.default_rng(seed)
        picked = rng.choice(len(samples), size=DISPERSION_SAMPLE, replace=False, p=weights / weights.sum())
        samples, weights = samples[picked], weights[picked]
    distances = delta_e_2000(srgb_to_lab(samples / 255.0), srgb_to_lab(centre / 255.0))
    return float(np.average(distances, weights=weights))


def category_stats(rgb: np.ndarray, mask: np.ndarray, weights: np.ndarray, total_weight: float) -> dict:
    """Spread, area share and pixel count for one category in one month."""
    w = weights[mask]
    if w.sum() == 0:
        return {"pixels": 0, "area_fraction": 0.0}

    samples = np.stack([rgb[i][mask] for i in range(3)], axis=1)
    mean = weighted_mean_linear(samples, w)
    lightness = srgb_to_lab(samples / 255.0)[:, 0]

    return {
        "pixels": int(mask.sum()),
        "area_fraction": round(float(w.sum() / total_weight), 5),
        "mean": rgb_to_hex(*mean),
        "rgb_std": [round(float(v), 2) for v in weighted_std(samples, w)],
        "lightness": {
            "mean": round(float(np.average(lightness, weights=w)), 2),
            "std": round(float(weighted_std(lightness, w)), 2),
            **{
                f"p{q:02d}": round(weighted_percentile(lightness, w, q), 2)
                for q in PERCENTILES
            },
        },
        "dispersion": round(dispersion(samples, w, mean), 2),
    }
