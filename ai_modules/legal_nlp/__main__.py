import argparse
import json
import sys
from pathlib import Path

from .pipeline import run_full_pipeline


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="contract_classifier",
        description="Classify contract clauses and extract entities from an input JSON file.",
    )
    parser.add_argument(
        "input_path",
        help="Path to the input JSON file (must contain 'full_text').",
    )
    parser.add_argument(
        "-o", "--output-folder",
        default="data/classified",
        help="Folder where the result JSON will be saved (default: data/classified).",
    )
    parser.add_argument(
        "--print",
        action="store_true",
        dest="print_result",
        help="Print the resulting JSON to the console.",
    )

    args = parser.parse_args()

    if not Path(args.input_path).exists():
        print(f"[ERROR] Input file not found: {args.input_path}", file=sys.stderr)
        sys.exit(1)

    result = run_full_pipeline(args.input_path, output_folder=args.output_folder)

    output_path = Path(args.output_folder) / f"{Path(args.input_path).stem}.json"
    print(f"[OK] Saved result to: {output_path}")

    if args.print_result:
        print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
