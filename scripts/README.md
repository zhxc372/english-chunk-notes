# Scripts

这里存放内容生产辅助脚本。

第一版脚本只做本地工作，不调用网站运行时服务。

## 1. generate_audio_edge_tts.py

用途：

```text
读取 data/lessons/*.json
为 article.text 和 chunks[].sentence 生成 mp3
输出到 public/audio/{lesson_id}/
```

建议命令：

```bash
python scripts/generate_audio_edge_tts.py data/lessons/ai-coding-workflow.json
```

注意：

- edge-tts 依赖在线服务。
- 网站运行时不调用 edge-tts。
- 音频应预生成并作为静态文件发布。

## 2. validate_lesson_json.py

用途：

```text
检查 lesson JSON 是否缺字段
检查 chunk id 是否重复
检查 audio 路径格式
检查 chunk 是否为空
```

建议命令：

```bash
python scripts/validate_lesson_json.py data/lessons/ai-coding-workflow.json
```

## 3. export_anki.py

用途：

```text
把 lesson JSON 或收藏 JSON 导出为 Anki CSV
```

第一版可以先占位。
