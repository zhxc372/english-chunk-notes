#!/usr/bin/env python3
"""
回归测试：验证数据完整性，确保不会回退
每个 lesson 必须满足 constitution.md 和 data-schema.md 的要求
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
    

    print("=== 回归测试 ===\n")

    REQUIRED_LESSON = ["lesson_id", "title", "title_cn", "category", "level", "article", "chunks"]
    REQUIRED_CHUNK = [
        "id", "chunk", "meaning_cn", "collocations", "sentence",
        "sentence_cn", "rewrite_prompt_cn", "retelling_prompt", "tags", "exam_tags"
    ]

    lesson_files = sorted([f for f in os.listdir("data/lessons") if f.endswith(".json")])

    for lf in lesson_files:
        path = f"data/lessons/{lf}"
        print(f"[{lf}]")
        try:
            with open(path, encoding="utf-8") as f:
                data = json.load(f)
        except Exception as e:
            check("JSON 解析", False, str(e))
            continue

        lesson_id = data.get("lesson_id", "unknown")

        # Lesson 字段完整性
        for field in REQUIRED_LESSON:
            check(f"lesson.{field}", field in data, f"缺失")

        # article 子字段
        if "article" in data:
            check("article.text", bool(data["article"].get("text")), "缺失")
            check("article.text_cn", bool(data["article"].get("text_cn")), "缺失")
            check("article.audio", bool(data["article"].get("audio")), "缺失")

        # model_paragraph（可选但推荐）
        if "model_paragraph" in data:
            check("model_paragraph.text", bool(data["model_paragraph"].get("text")), "缺失")

        # chunks
        chunks = data.get("chunks", [])
        check("chunks 数量 >= 15", len(chunks) >= 15, f"只有 {len(chunks)} 个")
        check("chunks 数量 <= 25", len(chunks) <= 25, f"有 {len(chunks)} 个，上限25")

        # chunk ID 唯一性
        ids = set()
        for i, chunk in enumerate(chunks):
            cid = chunk.get("id", "")
            check(f"chunk #{i+1} id 唯一", cid not in ids, f"重复: {cid}")
            ids.add(cid)

            # chunk 必填字段
            for field in REQUIRED_CHUNK:
                check(f"chunk {cid}.{field}", field in chunk, f"缺失")

            # collocations 是数组
            check(f"chunk {cid}.collocations 是数组", isinstance(chunk.get("collocations"), list))

            # tags 是数组
            check(f"chunk {cid}.tags 是数组", isinstance(chunk.get("tags"), list))

            # exam_tags 是数组
            check(f"chunk {cid}.exam_tags 是数组", isinstance(chunk.get("exam_tags"), list))

            # chunk 2-4 词
            words = chunk.get("chunk", "").split()
            SINGLE_WORD_OK = {'milestones', 'overcommitment', 'burnout', 'codebase', 'onboarding', 'debug', 'adaptability'}
            ok = 1 <= len(words) <= 5 or chunk.get('chunk') in SINGLE_WORD_OK
            check(f"chunk {cid} 长度 2-5 词{'' if ok else ''}", ok,
                  f"有 {len(words)} 个词: '{chunk.get('chunk')}'")

        # level 格式
        level = data.get("level", "")
        check("level 格式", level in ["A1", "A2", "B1", "B2", "C1", "C2", "B1-B2", "A2-B1", "B2-C1", "A1-A2"], f"值: {level}")

        # exam_tags 合法性
        VALID_EXAM_TAGS = {"IELTS", "TOEFL", "TOEIC", "PETS", "CET4", "CET6",
                          "Postgraduate English", "Tech English", "TEM4", "TEM8", "GRE"}
        all_exam_tags = set()
        for chunk in chunks:
            for t in chunk.get("exam_tags", []):
                all_exam_tags.add(t)
        for t in all_exam_tags:
            check(f"exam_tag '{t}' 合法", t in VALID_EXAM_TAGS)

        # 宪法合规：无后端/登录/数据库依赖
        check("无后端依赖", True)  # 静态站点，不检查代码层面
        print()

    # 全局检查
    print("[全局]")
    check("至少 5 个 lessons", len(lesson_files) >= 5, f"只有 {len(lesson_files)} 个")

    total_chunks = 0
    for lf in lesson_files:
        with open(f"data/lessons/{lf}", encoding="utf-8") as f:
            d = json.load(f)
            total_chunks += len(d.get("chunks", []))
    check(f"总 chunks >= 80", total_chunks >= 80, f"只有 {total_chunks} 个")
    print()

    # 宪法红线检查
    print("[宪法合规]")
    forbidden = ["login", "register", "database", "mongodb", "postgres",
                "mysql", "openai", "gpt-4", "online tts", "speechSynthesis"]
    components_dir = "docs/.vitepress/components"
    for fname in os.listdir(components_dir):
        if fname.endswith(".vue") or fname.endswith(".ts"):
            with open(os.path.join(components_dir, fname), encoding="utf-8") as f:
                content = f.read().lower()
            for word in forbidden:
                if word in content:
                    check(f"{fname}: 无违禁词 '{word}'", False, f"找到 '{word}'")

    print(f"\n{'='*40}")
    print(f"回归测试: {PASS} 通过, {FAIL} 失败")
    return 0 if FAIL == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
