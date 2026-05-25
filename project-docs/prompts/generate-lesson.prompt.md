# Prompt — 生成 Lesson JSON

你是一名英语教学内容编辑，目标用户是中文母语者。请根据下面主题生成一个 English Chunk Notes lesson。

## 主题

【填写主题，例如：AI Coding Workflow】

## 要求

1. 生成一篇 150-250 词英文文章。
2. 文章难度控制在 B1-B2。
3. 句子要短，适合朗读和听力训练。
4. 从文章中提取 15-20 个最值得学习的主题词块。
5. 优先提取 2-4 词自然搭配，不要只提孤立单词。
6. 每个词块必须有中文含义、自然搭配、例句、中译英提示、复述题。
7. 如果适合技术英语，请添加 technical_sentence。
8. 如果适合考试写作，请添加 exam_sentence。
9. 输出必须是 JSON，不要写额外解释。

## JSON 结构

```json
{
  "lesson_id": "",
  "title": "",
  "title_cn": "",
  "category": "",
  "level": "B1-B2",
  "theme_tags": [],
  "exam_tags": [],
  "article": {
    "text": "",
    "text_cn": "",
    "audio": ""
  },
  "model_paragraph": {
    "text": "",
    "text_cn": ""
  },
  "chunks": [
    {
      "id": "",
      "chunk": "",
      "meaning_cn": "",
      "plain_explanation_cn": "",
      "collocations": [],
      "sentence": "",
      "sentence_cn": "",
      "technical_sentence": "",
      "exam_sentence": "",
      "audio": "",
      "rewrite_prompt_cn": "",
      "retelling_prompt": "",
      "tags": [],
      "exam_tags": []
    }
  ]
}
```

## 词块筛选标准

优先收录：

- 可复用
- 可写作
- 可听力识别
- 有主题价值
- 适合复述
- 适合考试或技术表达

排除：

- good / thing / people / very / make / use 这类过泛词
- 过度生僻词
- 太长的术语串
- 没有自然搭配的孤立词
