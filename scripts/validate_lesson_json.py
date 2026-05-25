#!/usr/bin/env python3
import json
import sys
from pathlib import Path

REQUIRED_LESSON_FIELDS = ["lesson_id", "title", "level", "article", "chunks"]
REQUIRED_CHUNK_FIELDS = [
    "id", "chunk", "meaning_cn", "collocations", "sentence",
    "sentence_cn", "rewrite_prompt_cn", "retelling_prompt", "tags", "exam_tags"
]

def validate(path: Path) -> int:
    data = json.loads(path.read_text(encoding="utf-8"))
    errors = []

    for field in REQUIRED_LESSON_FIELDS:
        if field not in data:
            errors.append(f"Missing lesson field: {field}")

    chunks = data.get("chunks", [])
    if not isinstance(chunks, list):
        errors.append("chunks must be a list")
    elif len(chunks) == 0:
        errors.append("chunks is empty")

    seen_ids = set()
    for i, chunk in enumerate(data.get("chunks", []), start=1):
        for field in REQUIRED_CHUNK_FIELDS:
            if field not in chunk:
                errors.append(f"Chunk #{i} missing field: {field}")
        cid = chunk.get("id")
        if cid in seen_ids:
            errors.append(f"Duplicate chunk id: {cid}")
        seen_ids.add(cid)

    if errors:
        print("Validation failed:")
        for err in errors:
            print(f"- {err}")
        return 1

    print(f"OK: {path}")
    return 0

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python scripts/validate_lesson_json.py data/lessons/example.json")
        raise SystemExit(2)
    raise SystemExit(validate(Path(sys.argv[1])))
