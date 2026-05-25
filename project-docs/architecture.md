# 技术架构

## 1. 总体架构

```text
AI 内容生产
    ↓
Lesson JSON / Markdown
    ↓
edge-tts 批量音频
    ↓
VitePress 静态网站
    ↓
localStorage 收藏与闪卡
```

运行时网站不调用 AI，不调用 TTS，不调用数据库。

## 2. 推荐技术栈

```text
VitePress
Vue 3
TypeScript
JSON
localStorage
Static MP3
GitHub Pages
```

## 3. 目录结构

```text
english-chunk-notes/
├── docs/
│   ├── index.md
│   ├── themes/
│   │   ├── ai-coding-workflow.md
│   │   ├── education-learning.md
│   │   └── work-career.md
│   ├── writing/
│   ├── listening/
│   ├── flashcards.md
│   └── .vitepress/
│       ├── config.ts
│       └── theme/
│           ├── index.ts
│           └── components/
│               ├── LessonList.vue
│               ├── ChunkCard.vue
│               ├── FavoriteButton.vue
│               ├── FlashcardTrainer.vue
│               └── AudioPlayer.vue
│
├── data/
│   └── lessons/
│       ├── ai-coding-workflow.json
│       ├── education-learning.json
│       └── work-career.json
│
├── public/
│   └── audio/
│       └── ai-coding-workflow/
│           ├── article.mp3
│           ├── chunk-001.mp3
│           └── chunk-002.mp3
│
├── scripts/
│   ├── generate_audio_edge_tts.py
│   ├── validate_lesson_json.py
│   └── export_anki.py
│
├── constitution.md
├── agent.md
└── README.md
```

## 4. 数据流

### 内容生产流

```text
主题名
→ AI 生成文章
→ AI 抽词块
→ AI 生成 JSON
→ 人工审核
→ edge-tts 生成音频
→ 发布到网站
```

### 用户学习流

```text
主题页
→ 播放音频
→ 收藏词块
→ localStorage 保存
→ 闪卡页读取收藏
→ 生成训练卡
```

## 5. localStorage 设计

### 收藏

key:

```text
ecn:favorites
```

value:

```json
{
  "version": 1,
  "items": [
    {
      "id": "ai-coding-workflow-001",
      "type": "chunk",
      "source_lesson_id": "ai-coding-workflow",
      "created_at": "2026-05-25T00:00:00.000Z"
    }
  ]
}
```

### 复习状态

key:

```text
ecn:reviewState
```

value:

```json
{
  "version": 1,
  "items": {
    "ai-coding-workflow-001": {
      "seen": 3,
      "known": 1,
      "unknown": 2,
      "last_seen_at": "2026-05-25T00:00:00.000Z"
    }
  }
}
```

## 6. 音频策略

第一版采用静态 MP3。

- 文章音频：`/audio/{lesson_id}/article.mp3`
- 词块音频：`/audio/{lesson_id}/chunk-001.mp3`

音频不存在时，页面不报错，只显示“音频待生成”。

## 7. 部署策略

第一版部署到 GitHub Pages。

构建产物完全静态。

不需要服务器。
