# English Chunk Notes

考试英语 + 技术英语双轨主题词块学习站。从主题文章中抽取词块，变成听力、闪卡、听写和写作训练。

## 数据规模

- **23 个主题**（18 通用英语 + 5 技术英语）
- **460 个词块**（每主题 20 个）
- **483 个 MP3 音频**（23 主题朗读 + 460 词块例句）
- 覆盖雅思 / 托福 18 大高频话题

## 功能

- 主题文章阅读 + 音频播放
- 词块卡片翻页浏览
- 收藏夹（localStorage 持久化）
- 闪卡训练
- 听写训练
- 多格式导出（Anki CSV、JSON、TXT）

## 本地部署

### 前置条件

- Node.js >= 18
- npm >= 9

### 克隆

```bash
# 安装 Git LFS（如未安装）
# macOS: brew install git-lfs
# Ubuntu: apt install git-lfs
# Windows: 下载 https://git-lfs.github.com/

git lfs install
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

## 项目结构

```
├── data/lessons/          # 主题 JSON 数据（23 个主题文件）
├── public/audio/          # MP3 音频（Git LFS 管理）
├── docs/                  # VitePress 站点源码
│   ├── .vitepress/        # VitePress 配置和 Vue 组件
│   ├── themes/            # 主题页面
│   ├── favorites.md       # 收藏夹页
│   ├── flashcards.md      # 闪卡训练页
│   └── index.md           # 首页
├── scripts/               # 数据校验脚本
├── tests/                 # 测试
├── constitution.md        # 项目宪法
└── agent.md               # AI Agent 执行规范
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
- Git LFS 管理 MP3 音频文件

## License

Private — All rights reserved.
