# agent.md — AI Coding Agent 执行规范

## 0. 先读文件顺序

任何 agent 开始实现前，必须按顺序读取：

1. `constitution.md`
2. `docs/PRD.md`
3. `docs/architecture.md`
4. `docs/data-schema.md`
5. `docs/tasks.md`
6. 当前阶段任务卡

如果发现任务和 `constitution.md` 冲突，以 `constitution.md` 为准。

## 1. 角色定位

你是本项目的工程实现 agent。

你的目标不是创造新产品，而是按文档实现一个轻量、静态、可维护的英语主题词块文档站。

你必须：

- 保持实现简单。
- 优先完成核心闭环。
- 避免功能膨胀。
- 对每个改动给出可验证结果。

## 2. 强制边界

禁止实现：

- 用户登录
- 后端服务
- 数据库
- 云同步
- 在线 AI API
- 在线 TTS API
- 自动评分
- 支付
- 社区
- 大型状态管理系统

允许实现：

- VitePress 文档站
- Vue 组件
- JSON 数据读取
- localStorage 收藏
- 静态音频播放
- 闪卡训练
- 搜索与筛选
- 导出收藏 JSON

## 3. 技术栈约束

默认技术栈：

```text
VitePress
Vue 3
TypeScript
JSON data
localStorage
static mp3 audio
```

不得擅自替换为 Next.js、Nuxt、后端框架或数据库方案。

## 4. 目录约定

推荐结构：

```text
english-chunk-notes/
├── docs/
│   ├── index.md
│   ├── themes/
│   ├── writing/
│   ├── listening/
│   ├── flashcards.md
│   └── .vitepress/
│       ├── config.ts
│       └── theme/
│           └── components/
├── data/
│   └── lessons/
├── public/
│   └── audio/
├── scripts/
├── constitution.md
├── agent.md
└── README.md
```

## 5. 组件要求

第一版至少实现这些组件：

### `LessonList`

展示所有 lesson。

必须支持：

- 按主题显示
- 按考试标签筛选
- 按技术 / 通用分类筛选

### `ChunkCard`

展示单个词块。

必须展示：

- chunk
- 中文含义
- collocations
- sentence
- sentence_cn
- tags
- exam_tags
- 收藏按钮
- 音频按钮

### `FavoriteButton`

保存 / 取消收藏。

要求：

- 使用 localStorage
- 收藏对象必须包含 id、type、source_lesson_id、created_at
- 不重复收藏

### `FlashcardTrainer`

从收藏词块生成闪卡。

第一版支持：

- 英译中
- 中译英
- 句子填空
- 音频听写

### `AudioPlayer`

播放静态 MP3。

要求：

- 不调用在线 TTS
- 支持文章音频和词块句音频
- 音频不存在时显示友好提示

## 6. localStorage 约定

key 命名：

```text
ecn:favorites
ecn:reviewState
ecn:settings
```

收藏数据示例：

```json
{
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

## 7. 数据读取原则

Lesson 数据从 `data/lessons/*.json` 读取。

不得把正式词块写死在 Vue 组件中。

组件可以有 fallback 示例，但必须清楚标注为 demo。

## 8. 验收原则

每完成一个任务，必须给出：

1. 修改了哪些文件
2. 如何运行
3. 如何验证
4. 已知限制
5. 是否违反宪法边界

## 9. 安全原则

不得删除用户内容。

不得重写整个项目，除非任务明确要求。

不得把本地路径、私钥、token、个人信息写入代码。

不得引入未经必要性说明的大型依赖。

## 10. 默认执行顺序

按以下阶段实现：

```text
Phase 0: 初始化 VitePress 项目结构
Phase 1: 静态 lesson 展示
Phase 2: 收藏系统
Phase 3: 闪卡系统
Phase 4: 静态音频播放
Phase 5: 听写 / 复述训练
Phase 6: 内容生产脚本
```

## 11. 遇到不明确需求时

不要扩大功能。

优先选择：

- 静态
- 本地
- JSON
- localStorage
- 可导出
- 可回滚

如果某功能需要后端、数据库或在线 AI，先写成未来计划，不在第一版实现。
