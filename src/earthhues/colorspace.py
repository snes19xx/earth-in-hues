import numpy as np

# IEC 61966-2-1 sRGB transfer function
SRGB_LINEAR_CUTOFF = 0.04045
SRGB_ENCODED_CUTOFF = 0.0031308
SRGB_SLOPE = 12.92
SRGB_ALPHA = 0.055
SRGB_GAMMA = 2.4

# sRGB primaries against the D65 white point
RGB_TO_XYZ = np.array(
    [
        [0.4124564, 0.3575761, 0.1804375],
        [0.2126729, 0.7151522, 0.0721750],
        [0.0193339, 0.1191920, 0.9503041],
    ]
)
XYZ_TO_RGB = np.linalg.inv(RGB_TO_XYZ)

D65_WHITE = np.array([0.95047, 1.00000, 1.08883])

LAB_DELTA = 6.0 / 29.0


def srgb_to_linear(srgb: np.ndarray) -> np.ndarray:
    """Decode gamma-encoded sRGB in [0, 1] to linear light."""
    srgb = np.asarray(srgb, dtype=np.float64)
    return np.where(
        srgb <= SRGB_LINEAR_CUTOFF,
        srgb / SRGB_SLOPE,
        ((srgb + SRGB_ALPHA) / (1 + SRGB_ALPHA)) ** SRGB_GAMMA,
    )


def linear_to_srgb(linear: np.ndarray) -> np.ndarray:
    """Encode linear light back to sRGB in [0, 1]."""
    linear = np.clip(np.asarray(linear, dtype=np.float64), 0.0, 1.0)
    return np.where(
        linear <= SRGB_ENCODED_CUTOFF,
        linear * SRGB_SLOPE,
        (1 + SRGB_ALPHA) * linear ** (1 / SRGB_GAMMA) - SRGB_ALPHA,
    )


def linear_to_xyz(linear: np.ndarray) -> np.ndarray:
    """Linear sRGB to CIE XYZ, last axis holds the channels."""
    return np.asarray(linear, dtype=np.float64) @ RGB_TO_XYZ.T


def xyz_to_linear(xyz: np.ndarray) -> np.ndarray:
    """CIE XYZ to linear sRGB, last axis holds the channels."""
    return np.asarray(xyz, dtype=np.float64) @ XYZ_TO_RGB.T


def _lab_f(t: np.ndarray) -> np.ndarray:
    return np.where(t > LAB_DELTA**3, np.cbrt(t), t / (3 * LAB_DELTA**2) + 4.0 / 29.0)


def _lab_f_inverse(t: np.ndarray) -> np.ndarray:
    return np.where(t > LAB_DELTA, t**3, 3 * LAB_DELTA**2 * (t - 4.0 / 29.0))


def xyz_to_lab(xyz: np.ndarray) -> np.ndarray:
    """CIE XYZ to CIE L*a*b* under D65."""
    f = _lab_f(np.asarray(xyz, dtype=np.float64) / D65_WHITE)
    fx, fy, fz = f[..., 0], f[..., 1], f[..., 2]
    return np.stack([116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)], axis=-1)


def lab_to_xyz(lab: np.ndarray) -> np.ndarray:
    """CIE L*a*b* under D65 back to CIE XYZ."""
    lab = np.asarray(lab, dtype=np.float64)
    fy = (lab[..., 0] + 16) / 116
    fx = fy + lab[..., 1] / 500
    fz = fy - lab[..., 2] / 200
    return _lab_f_inverse(np.stack([fx, fy, fz], axis=-1)) * D65_WHITE


def srgb_to_lab(srgb: np.ndarray) -> np.ndarray:
    """Gamma-encoded sRGB in [0, 1] to CIE L*a*b*."""
    return xyz_to_lab(linear_to_xyz(srgb_to_linear(srgb)))


def lab_to_srgb(lab: np.ndarray) -> np.ndarray:
    """CIE L*a*b* to gamma-encoded sRGB in [0, 1]."""
    return linear_to_srgb(xyz_to_linear(lab_to_xyz(lab)))


def delta_e_76(lab1: np.ndarray, lab2: np.ndarray) -> np.ndarray:
    """Euclidean CIE76 colour difference."""
    return np.linalg.norm(np.asarray(lab1) - np.asarray(lab2), axis=-1)


def delta_e_2000(lab1: np.ndarray, lab2: np.ndarray) -> np.ndarray:
    """CIEDE2000 colour difference, unweighted (kL = kC = kH = 1)."""
    lab1 = np.atleast_2d(np.asarray(lab1, dtype=np.float64))
    lab2 = np.atleast_2d(np.asarray(lab2, dtype=np.float64))
    l1, a1, b1 = lab1[..., 0], lab1[..., 1], lab1[..., 2]
    l2, a2, b2 = lab2[..., 0], lab2[..., 1], lab2[..., 2]

    c1 = np.hypot(a1, b1)
    c2 = np.hypot(a2, b2)
    c_bar = (c1 + c2) / 2
    g = 0.5 * (1 - np.sqrt(c_bar**7 / (c_bar**7 + 25.0**7)))

    a1p, a2p = (1 + g) * a1, (1 + g) * a2
    c1p, c2p = np.hypot(a1p, b1), np.hypot(a2p, b2)
    h1p = np.degrees(np.arctan2(b1, a1p)) % 360
    h2p = np.degrees(np.arctan2(b2, a2p)) % 360

    dlp = l2 - l1
    dcp = c2p - c1p
    dhp = h2p - h1p
    dhp = np.where(dhp > 180, dhp - 360, np.where(dhp < -180, dhp + 360, dhp))
    dhp = np.where(c1p * c2p == 0, 0.0, dhp)
    dHp = 2 * np.sqrt(c1p * c2p) * np.sin(np.radians(dhp) / 2)

    lp_bar = (l1 + l2) / 2
    cp_bar = (c1p + c2p) / 2
    h_sum = h1p + h2p
    h_diff = np.abs(h1p - h2p)
    hp_bar = np.where(
        c1p * c2p == 0,
        h_sum,
        np.where(
            h_diff <= 180,
            h_sum / 2,
            np.where(h_sum < 360, (h_sum + 360) / 2, (h_sum - 360) / 2),
        ),
    )

    t = (
        1
        - 0.17 * np.cos(np.radians(hp_bar - 30))
        + 0.24 * np.cos(np.radians(2 * hp_bar))
        + 0.32 * np.cos(np.radians(3 * hp_bar + 6))
        - 0.20 * np.cos(np.radians(4 * hp_bar - 63))
    )

    sl = 1 + (0.015 * (lp_bar - 50) ** 2) / np.sqrt(20 + (lp_bar - 50) ** 2)
    sc = 1 + 0.045 * cp_bar
    sh = 1 + 0.015 * cp_bar * t
    rt = (
        -2
        * np.sqrt(cp_bar**7 / (cp_bar**7 + 25.0**7))
        * np.sin(np.radians(60 * np.exp(-(((hp_bar - 275) / 25) ** 2))))
    )

    result = np.sqrt(
        (dlp / sl) ** 2
        + (dcp / sc) ** 2
        + (dHp / sh) ** 2
        + rt * (dcp / sc) * (dHp / sh)
    )
    return result if result.size > 1 else result.item()
