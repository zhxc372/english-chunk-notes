# English Chunk Notes

考试英语 + 技术英语双轨主题词块学习站。从主题文章中抽取词块，变成听力、闪卡、听写和写作训练。

## 数据规模

- **23 个主题**（18 通用英语 + 5 技术英语）
- **460 个词块**（每主题 20 个）
- **483 个 MP3 音频**（23 主题朗读 + 460 词块例句）
- 覆盖雅思 / 托福 / CET4 / CET6 18 大高频话题

## 功能

### v0.2 新增

- 🆕 Deck Builder — 5种来源构建闪卡组（收藏/课程/标签/错题/到期复习）
- 🆕 4种训练模式 — 英译中、中译英、句子填空、音频听写
- 🆕 词块搜索 — 搜词块、中文含义，tag组合筛选
- 🆕 导出 JSON / Anki TSV / CSV（支持按tag/level过滤）
- 🆕 内容管道 — AI自动抓取文章生成词块（GitHub Actions + GitHub Models）
- 🆕 来源归因 — 每个lesson显示内容来源
- 🆕 发布流程 — drafts → review → published

### v0.1 已有

- 主题文章阅读 + 音频播放
- 词块卡片翻页浏览
- 收藏夹（localStorage 持久化）
- 闪卡训练
- 听写训练
- VitePress 内置全文搜索

## 本地部署

### 前置条件

- Node.js >= 18
- npm >= 9

### 克隆

```bash
git clone https://github.com/zhxc372/english-chunk-notes.git
cd english-chunk-notes
```

### 启动

```bash
npm install
npm run dev
```

浏览器打开 `http://localhost:5173` 即可使用。

### 构建

```bash
npm run build
npm run preview
```

构建产物在 `docs/.vitepress/dist/`，可部署到任意静态托管。

## CLI 工具

```bash
# 验证 lesson 数据格式
npm run validate:lessons

# 从URL抓取文章生成lesson（需GitHub Models API）
npm run ingest:url -- <url>

# 每日自动抓取（GitHub Actions触发）
npm run ingest:daily

# 发布 draft lesson
npm run publish:lesson -- data/lessons/drafts/example.json

# 导出闪卡
npm run export:anki -- --format json --output export.json
npm run export:anki -- --format tsv --output anki-deck.tsv --tag IELTS
npm run export:anki -- --format csv --output anki-deck.csv --level B2
```

## 项目结构

```
├── config/sources.yaml           # v0.2 内容来源注册表
├── data/lessons/                 # 主题 JSON 数据
│   ├── *.json                    # v0.1 published lessons（23个）
│   └── drafts/                   # v0.2 AI生成的草稿
├── docs/                         # VitePress 站点源码
│   ├── .vitepress/
│   │   ├── components/           # Vue 组件
│   │   ├── data/                 # loader + types + search-index
│   │   └── theme/                # 主题配置
│   ├── themes/                   # 主题页面
│   ├── favorites.md              # 收藏夹页
│   └── flashcards.md             # 闪卡训练页（Deck Builder入口）
├── tools/content-pipeline/       # v0.2 内容管道
│   ├── ingest-url.ts             # URL抓取
│   ├── ingest-daily.ts           # 每日自动抓取
│   ├── validate-lesson.ts        # schema校验
│   ├── publish-lesson.ts         # 发布流程
│   ├── export-anki.ts            # 多格式导出
│   ├── generate-search-index.ts  # 搜索索引生成
│   ├── prompts/                  # AI prompt模板
│   └── schemas/                  # JSON schema（v0.2）
├── .github/workflows/            # GitHub Actions
│   ├── deploy.yml                # 部署到GitHub Pages
│   ├── ingest-daily.yml          # 每日自动抓取
│   └── ingest-url.yml            # URL手动抓取
├── scripts/                      # 数据校验脚本
├── constitution.md               # 项目宪法
└── agent.md                      # AI Agent 执行规范
```

## 主题列表

### 通用英语（18）

1. Education & Learning
2. Work & Career
3. Health & Wellbeing
4. Environment & Climate
5. Technology & Society
6. Family & Children
7. Crime & Punishment
8. Media & Advertising
9. Globalization & Trade
10. Housing & Architecture
11. Culture & Tourism
12. Social Problems
13. Language & Communication
14. Transport & Urbanization
15. Food & Diet
16. Sport & Leisure
17. Animal Rights
18. Government & Politics

### 技术英语（5）

19. AI Coding Workflow
20. AI & Automation
21. System Design
22. Software Engineering
23. Project Management

## 技术栈

- [VitePress](https://vitepress.dev/) + Vue 3 + TypeScript
- JSON 数据驱动，无数据库
- localStorage 存储收藏和闪卡进度
- VitePress 内置 minisearch 全文搜索
- GitHub Actions + GitHub Models（内容管道）
- 静态 MP3 音频文件

## License

MIT
