# English Chunk Notes Starter

这是一个 **考试英语 + 技术英语双轨主题词块站** 的启动文档包。

核心定位：

> 用主题文章生成听力材料，从文章中抽取主题词块，再把词块变成收藏、闪卡、复述和写作训练。

第一版不做复杂平台，只做一个轻量的在线文档型学习站：

- 文章 → 听力
- 主题词块 → 收藏
- 收藏 → 闪卡
- 词块 → 中译英 / 听写 / 复述 / 写作套用
- 考试标签 → IELTS / TOEFL / PETS / CET / TOEIC / Tech English

## 推荐技术栈

```text
VitePress + Vue 组件 + JSON 数据 + localStorage + 静态 MP3
```

## 第一版边界

保留：

- 主题页面
- 文章与音频播放
- 词块卡片
- 收藏
- 闪卡
- 考试标签
- 技术英语入口

禁止：

- 登录系统
- 数据库
- 云端同步
- 在线 AI 调用
- 自动评分
- 复杂考试题库
- 商业化功能

## 重要文件

```text
constitution.md          项目宪法，所有实现必须先读
agent.md                 给 AI coding agent 的执行规范
docs/PRD.md              产品需求文档
docs/architecture.md     技术架构
docs/data-schema.md      Lesson / Chunk 数据结构
docs/content-pipeline.md 内容生产流水线
docs/tasks.md            MVP 阶段任务拆解
docs/prompts/            AI 生成与审核 prompt
docs/examples/           示例 lesson 文档
data/lessons/            示例 JSON 数据
scripts/                 音频生成与数据校验脚本说明
```

## 第一批建议主题

1. AI Coding Workflow
2. Education & Learning
3. Work & Career

每个主题先做：

- 1 篇 150-250 词文章
- 20 个主题词块
- 20 条词块听力句
- 5 个复述题
- 1 个可套作文段落
