# MVP Tasks

## Phase 0 — 项目初始化

目标：搭建 VitePress 项目结构。

任务：

- 初始化 VitePress。
- 建立 docs / data / public / scripts 目录。
- 添加 constitution.md 和 agent.md。
- 添加首页。
- 添加 1 个示例 lesson JSON。

验收：

- 本地可以启动文档站。
- 首页能打开。
- 示例 lesson 数据存在。

## Phase 1 — Lesson 展示

目标：能展示主题文章和词块。

任务：

- 实现 LessonList。
- 实现 LessonPage 或主题页面。
- 实现 ChunkCard。
- 从 JSON 读取数据。
- 展示文章、标签、词块。

验收：

- 能看到 AI Coding Workflow lesson。
- 能看到至少 5 个词块。
- 词块不写死在组件里。

## Phase 2 — 收藏系统

目标：能收藏词块。

任务：

- 实现 FavoriteButton。
- 使用 localStorage 保存。
- 支持取消收藏。
- 实现 Favorites 页面。

验收：

- 点击收藏后刷新页面仍保留。
- 重复点击不会重复收藏。
- 收藏页能列出收藏词块。

## Phase 3 — 闪卡系统

目标：从收藏生成闪卡。

任务：

- 实现 FlashcardTrainer。
- 支持英译中。
- 支持中译英。
- 支持句子填空。
- 支持熟悉 / 不熟标记。

验收：

- 收藏词块后能进入闪卡训练。
- 闪卡正反面正常切换。
- 复习状态保存到 localStorage。

## Phase 4 — 音频播放

目标：播放静态 MP3。

任务：

- 实现 AudioPlayer。
- 支持文章音频。
- 支持词块句音频。
- 音频不存在时显示提示。

验收：

- 有音频时可播放。
- 无音频时不报错。

## Phase 5 — 内容生成脚本

目标：辅助生成内容。

任务：

- 写 validate_lesson_json.py。
- 写 generate_audio_edge_tts.py。
- 写 export_anki.py 的占位版本。
- 给出使用说明。

验收：

- JSON 校验脚本能发现缺字段。
- 音频脚本能按 lesson JSON 生成文件路径。
- 不影响网站运行。

## Phase 6 — 第一批内容

目标：补齐 3 个主题。

任务：

- AI Coding Workflow
- Education & Learning
- Work & Career

每个主题：

- 1 篇文章
- 20 个词块
- 20 个句子
- 5 个复述题

验收：

- 三个主题都能展示。
- 三个主题都能收藏。
- 三个主题都能生成闪卡。
