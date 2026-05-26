# English Chunk Notes

文章驱动的英语词块学习站。从真实文章中学习词块，支持划词查询、Web Speech 朗读、闪卡训练和多格式导出。

## v0.3 核心特性

- 📰 **文章驱动** — Category → Article → Chunk，真实语境
- 📚 **全局词块库** — 词块独立于文章，M:N 关系，去重复用
- 🔍 **划词查询** — 选中文字即可查词，支持变形还原
- 🔊 **Web Speech 朗读** — 浏览器原生TTS，无需MP3
- 🃏 **Deck Builder** — 5种来源构建闪卡组，4种训练模式
- 📤 **多格式导出** — JSON / Anki TSV / CSV
- 🔎 **全文搜索** — 覆盖文章、词块、例句、中文释义

## 数据规模

- **7 个分类**（AI科技、商业经济、世界社会、科学健康、教育考试、文化生活、软件工程）
- **4 篇示例文章** + 23 个旧版主题
- **63 个全局词块**
- **Web Speech API 朗读**（不依赖 MP3）

## 本地部署

```bash
git clone https://github.com/zhxc372/english-chunk-notes.git
cd english-chunk-notes
npm install
npm run dev
```

浏览器打开 `http://localhost:5173`

## CLI 工具

```bash
# 构建搜索索引
npm run build:index

# 验证 lesson 数据
npm run validate:lessons

# 从URL生成lesson
npm run ingest:url -- <url>

# 导出闪卡
npm run export:anki -- --format json --output export.json
npm run export:anki -- --format tsv --tag IELTS --output anki.tsv
```

## 项目结构

```
├── types/content.ts              # v0.3 数据类型
├── contracts/v0.3-contract.md    # v0.3 契约
├── project-docs/                 # 产品决策和发布记录
├── data/
│   ├── categories.json           # 7个分类
│   ├── articles/                 # 文章数据（按日期目录）
│   ├── chunks/                   # 全局词块库
│   ├── article-chunks/           # 文章-词块关联（occurrences）
│   ├── indexes/                  # 搜索索引
│   └── lessons/                  # v0.1 旧版数据（兼容保留）
├── docs/.vitepress/
│   ├── components/               # Vue 组件
│   ├── composables/              # 数据加载层
│   ├── dictionary/               # 划词查询 Provider
│   ├── utils/                    # TTS、词形还原、文本标准化
│   └── data/                     # 旧版 loader + search-index
├── tools/content-pipeline/       # 内容管道（ingest/validate/export）
└── scripts/                      # 迁移脚本
```

## v0.3 架构

```
Category 1:N Article
Article M:N Chunk (通过 ArticleChunkOccurrence)
Chunk 全局唯一（canonical 标准形）

划词查询链：
  CurrentArticleOccurrence → GlobalChunk → ExternalLink

朗读：Web Speech API（无MP3依赖）

用户状态：localStorage（namespace: ecn-v03-）
```

## 技术栈

- [VitePress](https://vitepress.dev/) + Vue 3 + TypeScript
- Web Speech API（TTS）
- JSON 数据驱动，无数据库
- VitePress minisearch 全文搜索

## 版本历史

- **v0.3** — 文章驱动架构、全局词块库、划词查询、Web Speech
- **v0.2** — Content Pipeline、Deck Builder、词块搜索、多格式导出
- **v0.1** — 23个主题、460词块、483音频、闪卡训练

## License

MIT
