# Data Schema — Lesson / Chunk

## 1. Lesson Schema

```json
{
  "lesson_id": "ai-coding-workflow",
  "title": "AI Coding Workflow",
  "title_cn": "AI 编程工作流",
  "category": "Technical English",
  "level": "B1-B2",
  "theme_tags": ["AI", "software", "workflow"],
  "exam_tags": ["IELTS", "TOEFL", "PETS", "Tech English"],
  "article": {
    "text": "In the AI coding era...",
    "text_cn": "在 AI 编程时代……",
    "audio": "/audio/ai-coding-workflow/article.mp3"
  },
  "model_paragraph": {
    "text": "The core issue is that...",
    "text_cn": "核心问题在于……"
  },
  "chunks": []
}
```

## 2. Chunk Schema

```json
{
  "id": "ai-coding-workflow-001",
  "chunk": "human review",
  "meaning_cn": "人工审查；人类审查",
  "plain_explanation_cn": "指由人来检查 AI 或系统生成的结果是否正确、安全、可维护。",
  "collocations": [
    "require human review",
    "go through human review",
    "human review process"
  ],
  "sentence": "AI-generated code should still go through human review.",
  "sentence_cn": "AI 生成的代码仍然应该经过人工审查。",
  "technical_sentence": "All AI-generated changes should go through human review before deployment.",
  "exam_sentence": "AI can improve efficiency, but it still requires human review to reduce risks.",
  "audio": "/audio/ai-coding-workflow/chunk-001.mp3",
  "rewrite_prompt_cn": "AI 生成的代码仍然应该经过人工审查。",
  "retelling_prompt": "Explain why human review is important in AI coding.",
  "tags": ["AI", "software", "workflow"],
  "exam_tags": ["IELTS", "TOEFL", "Tech English"]
}
```

## 3. 字段说明

| 字段 | 必填 | 说明 |
|---|---:|---|
| id | 是 | 全局唯一词块 ID |
| chunk | 是 | 英文词块，优先 2-4 词 |
| meaning_cn | 是 | 简洁中文含义 |
| plain_explanation_cn | 否 | 面向中文学习者的解释 |
| collocations | 是 | 常见搭配 |
| sentence | 是 | 核心例句 |
| sentence_cn | 是 | 例句翻译 |
| technical_sentence | 否 | 技术语境句 |
| exam_sentence | 否 | 考试写作句 |
| audio | 否 | 静态音频路径 |
| rewrite_prompt_cn | 是 | 中译英训练提示 |
| retelling_prompt | 是 | 复述任务 |
| tags | 是 | 主题标签 |
| exam_tags | 是 | 考试标签 |

## 4. 进入词块库的标准

必须满足至少 3 条：

- 可复用
- 可写作
- 可听力识别
- 有主题价值
- 适合考试迁移
- 适合技术表达

## 5. 不推荐收录

- 太普通的单词：good, thing, people, important
- 太生僻的术语
- 太长的名词串
- 无自然搭配的孤立词
- 没有上下文的词
