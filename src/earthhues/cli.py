import argparse
import json
from pathlib import Path

from .extract import monthly_colors
from .sources import Sources


def write_json(path: Path, payload) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w") as f:
        json.dump(payload, f, indent=4)
    print(f"wrote {path}")


def cmd_colors(args) -> None:
    sources = Sources(args.data, args.cache)
    write_json(Path(args.out) / "earth_hues.json", monthly_colors(sources))


def build_parser() -> argparse.ArgumentParser:
    common = argparse.ArgumentParser(add_help=False)
    common.add_argument("--data", default="DATA", help="directory holding the input rasters")
    common.add_argument("--out", default="data", help="directory for generated JSON")
    common.add_argument("--cache", default="cache", help="directory for derived arrays")

    parser = argparse.ArgumentParser(prog="earthhues")
    subcommands = parser.add_subparsers(dest="command", required=True)

    colors = subcommands.add_parser("colors", parents=[common], help="monthly mean colour per category")
    colors.set_defaults(func=cmd_colors)

    return parser


def main(argv=None) -> None:
    parser = build_parser()
    args = parser.parse_args(argv)
    args.func(args)
