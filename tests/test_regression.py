import json
from pathlib import Path

import pytest

from earthhues.extract import monthly_colors
from earthhues.sources import Sources

DATA = Path("DATA")
REFERENCE = Path(__file__).parent / "fixtures" / "earth_hues_srgb_reference.json"


@pytest.mark.skipif(not DATA.exists(), reason="input rasters absent")
def test_srgb_mean_reproduces_published_output():
    records = monthly_colors(Sources(DATA, "cache"), method="srgb_mean", verbose=False)
    assert records == json.loads(REFERENCE.read_text())
