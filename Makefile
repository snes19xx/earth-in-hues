PY := $(HOME)/miniforge3/envs/geo_env/bin/python
DATA := DATA
OUT := data

.PHONY: setup colors stats fetch timeseries space epic masks all test serve clean

setup:
	mamba env update -f environment.yml
	$(PY) -m pip install -e .

colors:
	$(PY) -m earthhues colors --data $(DATA) --out $(OUT)

stats:
	$(PY) -m earthhues stats --data $(DATA) --out $(OUT)

fetch:
	$(PY) -m earthhues fetch

timeseries:
	$(PY) -m earthhues timeseries --data $(DATA) --out $(OUT)

space:
	$(PY) -m earthhues space --data $(DATA) --out $(OUT)

epic:
	$(PY) -m earthhues epic --data $(DATA) --out $(OUT)

masks:
	$(PY) -m earthhues masks --data $(DATA) --out $(OUT)

all: colors stats masks timeseries space epic

test:
	$(PY) -m pytest -q

serve:
	$(PY) -m http.server 8000

clean:
	rm -rf src/*.egg-info .pytest_cache
	find . -name __pycache__ -type d -exec rm -rf {} +
