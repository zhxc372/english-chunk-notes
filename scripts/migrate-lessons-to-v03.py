#!/usr/bin/env python3
"""
migrate-lessons-to-v03.py — 将 v0.1 lesson 数据迁移为 v0.3 article/chunk/article-chunks

Usage:
  python3 scripts/migrate-lessons-to-v03.py

选择 3 个代表性 lesson 做迁移样例。
"""

import json
import os
import re
from pathlib import Path

PROJECT = Path(__file__).resolve().parent.parent
LESSONS_DIR = PROJECT / "data" / "lessons"
ARTICLES_DIR = PROJECT / "data" / "articles"
CHUNKS_DIR = PROJECT / "data" / "chunks"
AC_DIR = PROJECT / "data" / "article-chunks"

# Category mapping from v0.1 theme to v0.3 category
CATEGORY_MAP = {
    "education-learning": "education-exams",
    "software-engineering": "software-engineering",
    "environment-climate": "science-health",
}

LEVEL_MAP = {
    "B1-B2": "B2",
    "A2-B1": "B1",
    "B2-C1": "C1",
}

CHUNK_TYPE_MAP = {
    "noun_phrase": "noun_phrase",
    "verb_phrase": "verb_phrase",
    "adj_phrase": "adj_phrase",
    "prep_phrase": "prep_phrase",
    "collocation": "collocation",
    "idiom": "idiom",
    "sentence_pattern": "sentence_pattern",
}

def normalize_canonical(text: str) -> str:
    """Simple normalization: lowercase, collapse spaces, remove articles for comparison."""
    t = text.lower().strip()
    t = re.sub(r'\s+', ' ', t)
    return t

def lesson_to_article(lesson: dict) -> dict:
    """Convert v0.1 lesson to v0.3 article format."""
    lid = lesson["lesson_id"]
    article_id = f"2026-05-26-{lid}"
    
    article_text = lesson.get("article", {}).get("text", "")
    article_zh = lesson.get("article", {}).get("text_cn", "") or lesson.get("model_paragraph", "")
    
    # Split article into paragraphs (by double newline or sentence groups)
    en_paras = [p.strip() for p in article_text.split("\n\n") if p.strip()] if article_text else []
    zh_paras = [p.strip() for p in article_zh.split("\n\n") if p.strip()] if article_zh else []
    
    # If no double newlines, split by sentences (every 2-3 sentences)
    if len(en_paras) <= 1 and article_text:
        sentences = re.split(r'(?<=[.!?])\s+', article_text)
        en_paras = []
        for i in range(0, len(sentences), 3):
            en_paras.append(" ".join(sentences[i:i+3]))
    
    if len(zh_paras) <= 1 and article_zh:
        # Split Chinese by period
        zh_sents = re.split(r'(?<=[。！？])', article_zh)
        zh_sents = [s for s in zh_sents if s.strip()]
        zh_paras = []
        for i in range(0, len(zh_sents), 3):
            zh_paras.append("".join(zh_sents[i:i+3]))
    
    paragraphs = []
    for i, en in enumerate(en_paras):
        paragraphs.append({
            "id": f"p{i+1}",
            "text": en,
            "zh": zh_paras[i] if i < len(zh_paras) else ""
        })
    
    if not paragraphs:
        paragraphs.append({"id": "p1", "text": article_text, "zh": article_zh})
    
    return {
        "id": article_id,
        "categoryId": CATEGORY_MAP.get(lid, "world-society"),
        "title": lesson["title"],
        "titleZh": lesson["title_cn"],
        "summaryZh": lesson["title_cn"] + " — " + ", ".join(lesson.get("theme_tags", [])),
        "level": LEVEL_MAP.get(lesson.get("level", "B1-B2"), "B2"),
        "sourceType": "imported",
        "sourceUrl": "",
        "publishedAt": "2026-05-26",
        "updatedAt": "2026-05-26",
        "order": 1,
        "tags": lesson.get("theme_tags", []),
        "examTags": lesson.get("exam_tags", []),
        "paragraphs": paragraphs
    }

def infer_chunk_type(text: str, collocations: list) -> str:
    """根据词块文本和搭配推断类型"""
    t = text.lower().strip()
    words = t.split()
    
    # Idioms: 3+ words with figurative meaning
    if len(words) >= 3 and any(idiom_marker in t for idiom_marker in ['the ', 'a ', 'up ', 'out ', 'off ', 'in ', 'on ']):
        # Check if it's likely an idiom vs collocation
        if any(w in t for w in ['the bottom line', 'the point is', 'in terms of', 'on the other hand']):
            return 'sentence_pattern'
    
    # Verb phrases: starts with a verb
    verb_starters = ['make', 'take', 'get', 'go', 'come', 'do', 'have', 'be', 'put', 'set',
                     'keep', 'turn', 'bring', 'carry', 'figure', 'find', 'think', 'feel',
                     'reach', 'draw', 'hold', 'lay', 'run', 'work', 'look', 'break',
                     'pick', 'build', 'move', 'pull', 'push', 'cut', 'fall', 'stand',
                     'track', 'plan', 'invest', 'bridge', 'solve', 'ask', 'gain']
    if words and words[0] in verb_starters:
        return 'verb_phrase'
    
    # Prep phrases: starts with a preposition
    prep_starters = ['in', 'on', 'at', 'by', 'for', 'with', 'from', 'to', 'of', 'out', 'up', 'into', 'through']
    if words and words[0] in prep_starters and len(words) >= 2:
        return 'prep_phrase'
    
    # Adj phrases: contains 'of', "'s", or common adj patterns
    if any(w.endswith('ing') or w.endswith('ed') or w.endswith('ive') or w.endswith('able') for w in words):
        if words[0] not in verb_starters:
            return 'adj_phrase'
    
    # Default
    return 'collocation'

def chunk_to_v03(chunk: dict, lesson_id: str) -> dict:
    """Convert v0.1 chunk to v0.3 chunk format."""
    text = chunk["chunk"]
    # Create ID from canonical form
    chunk_id = "chunk-" + re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')
    
    # Build surfaceForms from collocations
    collocations = chunk.get("collocations", [])
    surface_forms = [text.lower()]
    for col in collocations:
        col_lower = col.lower().strip()
        if col_lower != text.lower() and col_lower not in surface_forms:
            surface_forms.append(col_lower)
    
    examples = []
    if chunk.get("sentence"):
        examples.append({
            "text": chunk["sentence"],
            "zh": chunk.get("sentence_cn", "")
        })
    
    return {
        "id": chunk_id,
        "canonical": text,
        "normalizedCanonical": normalize_canonical(text),
        "meaningZh": chunk.get("meaning_cn", ""),
        "type": infer_chunk_type(text, collocations),
        "level": LEVEL_MAP.get("B1-B2", "B2"),
        "tags": list(set(
            chunk.get("tags", []) + chunk.get("exam_tags", [])
        )),
        "surfaceForms": surface_forms,
        "aliases": [],
        "relatedChunkIds": [],
        "coreExamples": examples
    }

def build_article_chunks(article_id: str, article: dict, chunks: list[dict]) -> dict:
    """Build article-chunks occurrence data."""
    occurrences = []
    paragraphs = article["paragraphs"]
    
    for i, chunk in enumerate(chunks):
        canonical = chunk["canonical"]
        surface = canonical  # Default: exact match
        match_type = "exact"
        paragraph_id = "p1"
        sentence = ""
        sentence_zh = ""
        start_offset = 0
        end_offset = 0
        
        # Find which paragraph contains this chunk (case insensitive)
        for para in paragraphs:
            text_lower = para["text"].lower()
            canonical_lower = canonical.lower()
            idx = text_lower.find(canonical_lower)
            if idx >= 0:
                paragraph_id = para["id"]
                surface = para["text"][idx:idx+len(canonical)]
                start_offset = idx
                end_offset = idx + len(canonical)
                
                # Extract sentence containing the chunk
                sent_start = para["text"].rfind(". ", 0, idx) + 2 if idx > 0 else 0
                sent_end = para["text"].find(". ", idx)
                if sent_end < 0:
                    sent_end = len(para["text"])
                else:
                    sent_end += 1
                sentence = para["text"][sent_start:sent_end].strip()
                
                # Try to find Chinese translation
                if para.get("zh"):
                    sentence_zh = para["zh"]
                
                # Check if it's a surface form (different casing)
                if surface != canonical:
                    match_type = "surface_form"
                break
        
        occ = {
            "articleId": article_id,
            "chunkId": chunk["id"],
            "paragraphId": paragraph_id,
            "order": i + 1,
            "surface": surface,
            "sentence": sentence,
            "sentenceZh": sentence_zh,
            "startOffset": start_offset,
            "endOffset": end_offset,
            "matchType": match_type,
            "confidence": 1.0 if match_type == "exact" else 0.9,
            "importance": 3
        }
        occurrences.append(occ)
    
    return {
        "articleId": article_id,
        "occurrences": occurrences
    }

def main():
    selected = ["education-learning", "software-engineering", "environment-climate"]
    
    all_new_chunks = []
    
    for lesson_name in selected:
        lesson_path = LESSONS_DIR / f"{lesson_name}.json"
        if not lesson_path.exists():
            print(f"⚠️  Skip {lesson_name}: not found")
            continue
        
        lesson = json.loads(lesson_path.read_text())
        print(f"📝 Processing: {lesson_name} ({len(lesson.get('chunks', []))} chunks)")
        
        # 1. Convert to article
        article = lesson_to_article(lesson)
        article_path = ARTICLES_DIR / "2026" / "05" / f"{article['id']}.json"
        article_path.parent.mkdir(parents=True, exist_ok=True)
        article_path.write_text(json.dumps(article, ensure_ascii=False, indent=2))
        print(f"  → Article: {article_path}")
        
        # 2. Convert chunks
        v03_chunks = []
        for c in lesson.get("chunks", []):
            v03_chunk = chunk_to_v03(c, lesson_name)
            v03_chunks.append(v03_chunk)
            all_new_chunks.append(v03_chunk)
        print(f"  → {len(v03_chunks)} chunks converted")
        
        # 3. Build article-chunks
        ac = build_article_chunks(article["id"], article, v03_chunks)
        ac_path = AC_DIR / "2026" / "05" / f"{article['id']}.json"
        ac_path.parent.mkdir(parents=True, exist_ok=True)
        ac_path.write_text(json.dumps(ac, ensure_ascii=False, indent=2))
        print(f"  → ArticleChunks: {ac_path}")
    
    # Merge new chunks into chunk-index.json
    chunk_index_path = CHUNKS_DIR / "chunk-index.json"
    if chunk_index_path.exists():
        existing = json.loads(chunk_index_path.read_text())
    else:
        existing = []
    
    existing_ids = {c["id"] for c in existing}
    for c in all_new_chunks:
        if c["id"] not in existing_ids:
            existing.append(c)
            existing_ids.add(c["id"])
        else:
            print(f"  ⚠️  Duplicate chunk: {c['id']}")
    
    chunk_index_path.write_text(json.dumps(existing, ensure_ascii=False, indent=2))
    print(f"\n✅ Total chunks in index: {len(existing)}")
    print(f"✅ Migrated {len(selected)} lessons")

if __name__ == "__main__":
    main()
