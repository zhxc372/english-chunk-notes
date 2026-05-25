#!/usr/bin/env python3
"""
属性测试：基于属性的边界测试
验证数据在极端/边界条件下仍然合法
"""
import json
import os
import sys

PASS = 0
FAIL = 0

def check(name, condition, detail=""):
    global PASS, FAIL
    if condition:
        PASS += 1
        print(f"  ✅ {name}")
    else:
        FAIL += 1
        print(f"  ❌ {name} — {detail}" if detail else f"  ❌ {name}")

def main():
    os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    

    print("=== 属性测试 ===\n")

    lesson_files = sorted([f for f in os.listdir("data/lessons") if f.endswith(".json")])

    # 属性1: 所有 chunk ID 格式一致
    print("[ID 格式一致性]")
    for lf in lesson_files:
        with open(f"data/lessons/{lf}", encoding="utf-8") as f:
            data = json.load(f)
        lesson_id = data["lesson_id"]
        for chunk in data.get("chunks", []):
            cid = chunk["id"]
            expected_prefix = lesson_id + "-"
            check(f"chunk id 格式: {cid}",
                  cid.startswith(expected_prefix),
                  f"期望前缀 '{expected_prefix}'")

    # 属性2: lesson_id 命名规范（kebab-case）
    print("\n[lesson_id 命名规范]")
    import re
    for lf in lesson_files:
        with open(f"data/lessons/{lf}", encoding="utf-8") as f:
            data = json.load(f)
        lid = data["lesson_id"]
        check(f"lesson_id kebab-case: {lid}",
              re.match(r'^[a-z][a-z0-9-]*$', lid),
              f"'{lid}' 不符合 kebab-case")

    # 属性3: 文章长度合理（50-5000字符）
    print("\n[文章长度]")
    for lf in lesson_files:
        with open(f"data/lessons/{lf}", encoding="utf-8") as f:
            data = json.load(f)
        text_len = len(data["article"]["text"])
        check(f"article 长度 ({data['lesson_id']}): {text_len} chars",
              50 <= text_len <= 5000,
              f"长度 {text_len} 超出范围 [50, 5000]")

    # 属性4: 中文含义非空且包含中文
    print("\n[中文含义质量]")
    for lf in lesson_files:
        with open(f"data/lessons/{lf}", encoding="utf-8") as f:
            data = json.load(f)
        for chunk in data.get("chunks", []):
            meaning = chunk.get("meaning_cn", "")
            has_chinese = any('\u4e00' <= c <= '\u9fff' for c in meaning)
            check(f"meaning_cn 含中文: {chunk['id'][:30]}",
                  has_chinese and len(meaning) > 0)

    # 属性5: 例句非空且包含英文
    print("\n[例句质量]")
    for lf in lesson_files:
        with open(f"data/lessons/{lf}", encoding="utf-8") as f:
            data = json.load(f)
        for chunk in data.get("chunks", []):
            sent = chunk.get("sentence", "")
            has_alpha = any(c.isalpha() for c in sent)
            check(f"sentence 含英文: {chunk['id'][:30]}",
                  has_alpha and len(sent) > 5)

    # 属性6: 至少一个 collocation
    print("\n[搭配数量]")
    no_collocations = []
    for lf in lesson_files:
        with open(f"data/lessons/{lf}", encoding="utf-8") as f:
            data = json.load(f)
        for chunk in data.get("chunks", []):
            if len(chunk.get("collocations", [])) == 0:
                no_collocations.append(chunk["id"])
    check("所有 chunk 至少1个搭配", len(no_collocations) == 0,
          f"缺搭配的 chunks: {no_collocations[:5]}")

    # 属性7: exam_tags 非空
    print("\n[考试标签]")
    no_tags = []
    for lf in lesson_files:
        with open(f"data/lessons/{lf}", encoding="utf-8") as f:
            data = json.load(f)
        for chunk in data.get("chunks", []):
            if not chunk.get("exam_tags"):
                no_tags.append(chunk["id"])
    check("所有 chunk 有 exam_tags", len(no_tags) == 0,
          f"缺标签: {no_tags[:5]}")

    print(f"\n{'='*40}")
    print(f"属性测试: {PASS} 通过, {FAIL} 失败")
    return 0 if FAIL == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
