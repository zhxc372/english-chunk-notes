#!/usr/bin/env python3

# Export lesson chunks to Anki-compatible CSV.
# Usage:
#     python scripts/export_anki.py data/lessons/ai-coding-workflow.json out.csv

import csv
import json
import sys
from pathlib import Path

def main(src: Path, dst: Path):
    data = json.loads(src.read_text(encoding="utf-8"))
    with dst.open("w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["Front", "Back", "Tags"])
        for chunk in data.get("chunks", []):
            front = chunk["chunk"]
            back = f'{chunk["meaning_cn"]}<br>{chunk["sentence"]}<br>{chunk["sentence_cn"]}'
            tags = " ".join(chunk.get("tags", []))
            writer.writerow([front, back, tags])
    print(f"Exported: {dst}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python scripts/export_anki.py data/lessons/example.json out.csv")
        raise SystemExit(2)
    main(Path(sys.argv[1]), Path(sys.argv[2]))
