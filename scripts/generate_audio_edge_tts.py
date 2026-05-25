#!/usr/bin/env python3

Generate static MP3 files from lesson JSON.

Install:
    pip install edge-tts

Usage:
    python scripts/generate_audio_edge_tts.py data/lessons/ai-coding-workflow.json

This script uses edge-tts at content-generation time only.
The website runtime should only play static MP3 files.

import asyncio
import json
import sys
from pathlib import Path

VOICE = "en-US-JennyNeural"

async def tts(text: str, out_path: Path):
    import edge_tts
    out_path.parent.mkdir(parents=True, exist_ok=True)
    communicate = edge_tts.Communicate(text, VOICE)
    await communicate.save(str(out_path))

async def main(path: Path):
    data = json.loads(path.read_text(encoding="utf-8"))
    lesson_id = data["lesson_id"]
    audio_dir = Path("public") / "audio" / lesson_id
    await tts(data["article"]["text"], audio_dir / "article.mp3")

    for idx, chunk in enumerate(data.get("chunks", []), start=1):
        text = chunk.get("sentence", "")
        if not text:
            continue
        await tts(text, audio_dir / f"chunk-{idx:03d}.mp3")

    print(f"Audio generated in {audio_dir}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python scripts/generate_audio_edge_tts.py data/lessons/example.json")
        raise SystemExit(2)
    asyncio.run(main(Path(sys.argv[1])))
