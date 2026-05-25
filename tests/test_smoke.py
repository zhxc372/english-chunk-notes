#!/usr/bin/env python3
"""
冒烟测试：验证项目核心功能的基本可用性
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
    base = "."

    print("=== 冒烟测试 ===\n")

    # 1. 文件结构
    print("[文件结构]")
    check("package.json 存在", os.path.isfile("package.json"))
    check("VitePress 配置存在", os.path.isfile("docs/.vitepress/config.ts"))
    check("主题入口存在", os.path.isfile("docs/.vitepress/theme/index.ts"))
    check("全局样式存在", os.path.isfile("docs/.vitepress/theme/style.css"))
    check("数据目录存在", os.path.isdir("data/lessons"))
    check("脚本目录存在", os.path.isdir("scripts"))
    check("宪法存在", os.path.isfile("constitution.md"))
    check("Agent规范存在", os.path.isfile("agent.md"))

    # 2. Vue 组件
    print("\n[Vue 组件]")
    components = [
        "AudioPlayer", "ChunkCard", "ExamTagFilter", "FavoriteButton",
        "FavoritesPage", "FlashcardTrainer", "HomeLayout",
        "LessonList", "LessonPage"
    ]
    for c in components:
        path = f"docs/.vitepress/components/{c}.vue"
        check(f"{c}.vue 存在", os.path.isfile(path))

    # 3. 数据层
    print("\n[数据层]")
    check("types.ts 存在", os.path.isfile("docs/.vitepress/data/types.ts"))
    check("loader.ts 存在", os.path.isfile("docs/.vitepress/data/loader.ts"))

    # 4. 页面
    print("\n[页面]")
    pages = [
        "docs/index.md", "docs/favorites.md", "docs/flashcards.md",
        "docs/tech-english.md", "docs/themes/index.md",
        "docs/themes/ai-coding-workflow.md", "docs/themes/education-learning.md",
        "docs/themes/work-career.md", "docs/themes/software-engineering.md",
        "docs/themes/project-management.md"
    ]
    for p in pages:
        check(f"{p} 存在", os.path.isfile(p))

    # 5. Lesson 数据
    print("\n[Lesson 数据]")
    lesson_files = sorted([f for f in os.listdir("data/lessons") if f.endswith(".json")])
    check("至少5个lesson", len(lesson_files) >= 5, f"只有 {len(lesson_files)} 个")

    total_chunks = 0
    for lf in lesson_files:
        path = f"data/lessons/{lf}"
        try:
            d = json.load(open(path, encoding="utf-8"))
            n = len(d.get("chunks", []))
            total_chunks += n
            check(f"{lf}: {n} chunks", n > 0)
        except Exception as e:
            check(f"{lf}: JSON 解析", False, str(e))

    check("总chunks >= 80", total_chunks >= 80, f"只有 {total_chunks} 个")

    # 6. 脚本
    print("\n[脚本]")
    check("validate_lesson_json.py 存在", os.path.isfile("scripts/validate_lesson_json.py"))
    check("export_anki.py 存在", os.path.isfile("scripts/export_anki.py"))
    check("generate_audio_edge_tts.py 存在", os.path.isfile("scripts/generate_audio_edge_tts.py"))

    # 7. 构建产物
    print("\n[构建产物]")
    dist = "docs/.vitepress/dist"
    if os.path.isdir(dist):
        html_files = [f for f in os.listdir(dist) if f.endswith(".html")]
        check("构建产物存在", len(html_files) > 0, "dist 目录为空")
        check("首页存在", os.path.isfile(f"{dist}/index.html"))
        check("主题页存在", os.path.isfile(f"{dist}/themes/index.html"))
        check("收藏页存在", os.path.isfile(f"{dist}/favorites.html"))
        check("闪卡页存在", os.path.isfile(f"{dist}/flashcards.html"))
    else:
        check("构建产物目录存在", False, "dist 目录不存在，需先运行 vitepress build")

    # 8. .gitignore
    print("\n[Git]")
    check(".gitignore 存在", os.path.isfile(".gitignore"))
    check("node_modules 在 .gitignore", 
          "node_modules" in open(".gitignore").read() if os.path.isfile(".gitignore") else False)

    # 结果
    print(f"\n{'='*40}")
    print(f"冒烟测试: {PASS} 通过, {FAIL} 失败")
    return 0 if FAIL == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
