#!/usr/bin/env python3
"""
Release测试：导入导出 + 组件逻辑 + 静态E2E + 输入边界
"""
import json
import os
import re
import csv
import io
import sys
import subprocess

PASS = 0
FAIL = 0

def check(name, condition, detail=""):
    global PASS, FAIL
    if condition:
        PASS += 1
        print(f"  ✅ {name}")
    else:
        FAIL += 1
        print(f"  ❌ {name}" + (f" — {detail}" if detail else ""))

def main():
    global PASS, FAIL
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(project_root)
    dist = "docs/.vitepress/dist"

    # ===== 1. 导入导出测试 =====
    print("=" * 50)
    print("=== 导入导出测试 ===\n")

    print("[Anki CSV 格式校验]")
    lesson_files = sorted([f for f in os.listdir("data/lessons") if f.endswith(".json")])
    for lf in lesson_files:
        csv_path = f"/tmp/release-test-{lf.replace('.json', '.csv')}"
        subprocess.run(
            ["python3", "scripts/export_anki.py", f"data/lessons/{lf}", csv_path],
            capture_output=True, text=True
        )
        if not os.path.isfile(csv_path):
            check(f"Anki CSV 生成: {lf}", False, "文件未生成")
            continue

        with open(csv_path, encoding="utf-8") as f:
            content = f.read().strip()
            lines = content.split("\n")

        # 跳过注释行
        data_lines = [l for l in lines if not l.startswith("#")]
        # 跳过表头行（如果第一行是 Front,Back,Tags）
        if data_lines and data_lines[0].startswith("Front"):
            data_lines = data_lines[1:]

        check(f"Anki CSV 数据行: {lf} ({len(data_lines)} 行)", len(data_lines) >= 18,
              f"只有 {len(data_lines)} 行")

        # 用 csv reader 解析（处理字段内的逗号）
        bad_rows = []
        parsed_rows = []
        for i, line in enumerate(data_lines[:5]):
            reader = csv.reader(io.StringIO(line))
            try:
                row = next(reader)
                parsed_rows.append(row)
                if len(row) < 3:
                    bad_rows.append(f"行{i}: {len(row)}个字段")
            except Exception:
                bad_rows.append(f"行{i}: 解析失败")

        check(f"Anki CSV 字段数: {lf}", len(bad_rows) == 0,
              "; ".join(bad_rows[:3]) if bad_rows else "")

        if parsed_rows:
            row = parsed_rows[0]
            check(f"Anki CSV Front非空: {lf}", bool(row[0].strip()))
            check(f"Anki CSV Back非空: {lf}", len(row) > 1 and bool(row[1].strip()))
            check(f"Anki CSV Tags非空: {lf}", len(row) > 2 and bool(row[2].strip()))

    print("\n[JSON 导出往返]")
    for lf in lesson_files[:2]:
        with open(f"data/lessons/{lf}", encoding="utf-8") as f:
            data = json.load(f)
        exported = json.dumps(data, ensure_ascii=False)
        reloaded = json.loads(exported)
        check(f"JSON 往返: {lf}", reloaded["lesson_id"] == data["lesson_id"])
        check(f"JSON chunks 完整: {lf}", len(reloaded["chunks"]) == len(data["chunks"]))

    print("\n[localStorage API 检测]")
    ts = open("docs/.vitepress/data/types.ts", encoding="utf-8").read()
    for fn in ["localStorage", "getFavorites", "addFavorite", "removeFavorite", "exportFavorites"]:
        check(f"types.ts 含 {fn}", fn in ts)

    # FavoritesPage 中的 clear/import
    fav_vue = open("docs/.vitepress/components/FavoritesPage.vue", encoding="utf-8").read()
    check("FavoritesPage 含 clear", "clear" in fav_vue.lower())
    check("FavoritesPage 含 import", "import" in fav_vue.lower())

    # ===== 2. 组件逻辑测试 =====
    print("\n" + "=" * 50)
    print("=== 组件逻辑测试 ===\n")

    print("[loader.ts 注册]")
    loader = open("docs/.vitepress/data/loader.ts", encoding="utf-8").read()
    for lf in lesson_files:
        lid = lf.replace(".json", "")
        check(f"loader 注册: {lid}", lid in loader)

    print("\n[组件关键字]")
    comp_keywords = {
        "ChunkCard": ["chunk", "meaning_cn", "collocations", "sentence"],
        "FavoriteButton": ["favorite", "toggle"],
        "FlashcardTrainer": ["flashcard", "mode", "en2cn"],
        "ExamTagFilter": ["tag", "filter", "select"],
        "LessonPage": ["lesson", "chunks", "ChunkCard"],
        "HomeLayout": ["shortcut", "theme"],
        "FavoritesPage": ["favorite", "export"],
    }
    for comp, keywords in comp_keywords.items():
        fpath = f"docs/.vitepress/components/{comp}.vue"
        if not os.path.isfile(fpath):
            check(f"{comp}.vue 存在", False)
            continue
        content = open(fpath, encoding="utf-8").read().lower()
        missing = [kw for kw in keywords if kw.lower() not in content]
        check(f"{comp} 关键字", len(missing) == 0,
              f"缺失: {missing[:3]}" if missing else "")

    print("\n[路由与构建]")
    config = open("docs/.vitepress/config.ts", encoding="utf-8").read()
    check("config.ts 路由配置", "nav" in config or "rewrites" in config)

    # md -> html 映射
    md_files = []
    for root, dirs, files in os.walk("docs"):
        for f in files:
            if f.endswith(".md"):
                rel = os.path.relpath(os.path.join(root, f), "docs")
                md_files.append(rel)

    missing_html = []
    for md in md_files:
        html_path = os.path.join(dist, md.replace(".md", ".html"))
        if not os.path.isfile(html_path) and "/." not in md:
            missing_html.append(md)
    check(f"md→html 映射 ({len(md_files)} md)", len(missing_html) == 0,
          f"缺失: {missing_html[:5]}" if missing_html else "")

    # ===== 3. 静态 E2E（文件级） =====
    print("\n" + "=" * 50)
    print("=== 静态 E2E 测试 ===\n")

    print("[HTML 内容完整性]")
    html_files = []
    for root, dirs, files in os.walk(dist):
        for f in files:
            if f.endswith(".html"):
                html_files.append(os.path.join(root, f))

    check(f"HTML 文件数 >= 10", len(html_files) >= 10, f"只有 {len(html_files)}")

    tiny_files = []
    for hf in html_files:
        size = os.path.getsize(hf)
        if size < 500:
            tiny_files.append(os.path.relpath(hf, dist))
    check("所有 HTML > 500 bytes", len(tiny_files) == 0,
          f"过小: {tiny_files[:3]}" if tiny_files else "")

    # CSS/JS 产物
    assets = os.path.join(dist, "assets")
    if os.path.isdir(assets):
        css_count = len([f for f in os.listdir(assets) if f.endswith(".css")])
        js_count = len([f for f in os.listdir(assets) if f.endswith(".js")])
        check("CSS 产物存在", css_count > 0, f"{css_count} 个")
        check("JS 产物存在", js_count > 0, f"{js_count} 个")
    else:
        check("assets 目录存在", False)

    print("\n[HTML 内容检查]")
    # 检查首页包含导航关键词
    index_html = os.path.join(dist, "index.html")
    if os.path.isfile(index_html):
        idx_content = open(index_html, encoding="utf-8").read()
        check("首页含 Vue 挂载点", "id=\"app\"" in idx_content or "data-v-" in idx_content)
        check("首页含 CSS 引用", "stylesheet" in idx_content)

    # 检查闪卡页面
    flash_html = os.path.join(dist, "flashcards.html")
    if os.path.isfile(flash_html):
        flash_content = open(flash_html, encoding="utf-8").read()
        check("闪卡页含 Vue", "data-v-" in flash_content)

    # 检查各主题页
    theme_pages = [
        "themes/ai-coding-workflow.html",
        "themes/education-learning.html",
        "themes/work-career.html",
        "themes/software-engineering.html",
        "themes/project-management.html",
    ]
    for tp in theme_pages:
        tp_path = os.path.join(dist, tp)
        if os.path.isfile(tp_path):
            content = open(tp_path, encoding="utf-8").read()
            check(f"{tp} 内容>1KB", len(content) > 1024, f"{len(content)} bytes")
            # 检查没有未解析的 Vue 模板（说明 SSR 正常）
            unrendered = re.findall(r'\{\{[^}]+\}\}', content)
            check(f"{tp} 无未渲染模板", len(unrendered) == 0,
                  f"发现 {len(unrendered)} 个未渲染的 {{}}" if unrendered else "")
        else:
            check(f"{tp} 存在", False)

    print("\n[链接完整性]")
    # 检查 HTML 内的内部链接都有对应文件
    broken_links = []
    for hf in html_files:
        content = open(hf, encoding="utf-8").read()
        hrefs = re.findall(r'href="([^"]+\.html)"', content)
        for href in hrefs:
            # 解析相对路径
            if href.startswith("/"):
                target = os.path.join(dist, href.lstrip("/"))
            else:
                target = os.path.join(os.path.dirname(hf), href)
            if not os.path.isfile(target):
                broken_links.append(f"{os.path.relpath(hf, dist)} → {href}")

    check("内部链接全部有效", len(broken_links) == 0,
          f"断链: {broken_links[:5]}" if broken_links else "")

    # ===== 4. 输入边界测试 =====
    print("\n" + "=" * 50)
    print("=== 输入边界测试 ===\n")

    # 空 chunks
    empty_path = "/tmp/test-empty.json"
    with open(empty_path, "w") as f:
        json.dump({
            "lesson_id": "test-empty", "title": "Empty", "title_cn": "空",
            "category": "Test", "level": "A1",
            "article": {"text": "test", "text_cn": "测试", "audio": "/audio/test.mp3"},
            "chunks": []
        }, f)
    r = subprocess.run(["python3", "scripts/validate_lesson_json.py", empty_path],
                       capture_output=True, text=True)
    check("空 chunks 校验（应失败）", r.returncode != 0, r.stdout.strip()[:100])

    # 缺字段
    bad_path = "/tmp/test-bad.json"
    with open(bad_path, "w") as f:
        f.write('{"lesson_id": "bad"}')
    r = subprocess.run(["python3", "scripts/validate_lesson_json.py", bad_path],
                       capture_output=True, text=True)
    check("缺字段校验（应失败）", r.returncode != 0, r.stdout.strip()[:100])

    # 非 JSON
    not_json = "/tmp/test-notjson.txt"
    with open(not_json, "w") as f:
        f.write("this is not json")
    r = subprocess.run(["python3", "scripts/validate_lesson_json.py", not_json],
                       capture_output=True, text=True)
    check("非 JSON 输入（应失败）", r.returncode != 0, r.stderr.strip()[:100])

    # 重复 ID
    dup_path = "/tmp/test-dup.json"
    with open(dup_path, "w", encoding="utf-8") as f:
        json.dump({
            "lesson_id": "test-dup", "title": "Dup", "title_cn": "重复",
            "category": "Test", "level": "A1",
            "article": {"text": "test", "text_cn": "测试", "audio": "/audio/test.mp3"},
            "chunks": [
                {"id": "test-dup-001", "chunk": "test chunk", "meaning_cn": "测试",
                 "collocations": [], "sentence": "test", "sentence_cn": "测试",
                 "rewrite_prompt_cn": "测试", "retelling_prompt": "测试",
                 "tags": [], "exam_tags": ["IELTS"]},
                {"id": "test-dup-001", "chunk": "duplicate", "meaning_cn": "重复",
                 "collocations": [], "sentence": "dup", "sentence_cn": "重复",
                 "rewrite_prompt_cn": "测试", "retelling_prompt": "测试",
                 "tags": [], "exam_tags": ["IELTS"]},
            ]
        }, f)
    r = subprocess.run(["python3", "scripts/validate_lesson_json.py", dup_path],
                       capture_output=True, text=True)
    check("重复 ID 检测（应失败）", r.returncode != 0, r.stdout.strip()[:100])

    # 正常数据应该通过
    r = subprocess.run(
        ["python3", "scripts/validate_lesson_json.py", "data/lessons/ai-coding-workflow.json"],
        capture_output=True, text=True
    )
    check("正常数据校验（应通过）", r.returncode == 0, r.stdout.strip()[:100])

    # ===== 结果 =====
    print(f"\n{'='*50}")
    print(f"Release 测试: {PASS} 通过, {FAIL} 失败")
    return 0 if FAIL == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
