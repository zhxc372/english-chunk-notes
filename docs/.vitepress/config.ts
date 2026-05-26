import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/english-chunk-notes/',
  cleanUrls: true,
  title: 'English Chunk Notes',
  description: '考试英语 + 技术英语双轨主题词块学习站',
  lang: 'zh-CN',
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['script', {}, "document.basePath='/english-chunk-notes/';"]
  ],
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '分类', link: '/categories/' },
      { text: '词块库', link: '/chunks/' },
      { text: '主题(v0.2)', link: '/themes/' },
      { text: '收藏', link: '/favorites' },
      { text: '闪卡', link: '/flashcards' }
    ],
    sidebar: [],
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索', buttonAriaLabel: '搜索' },
          modal: { noResultsText: '没有找到结果', resetButtonTitle: '清除搜索条件', footer: { selectText: '选择', navigateText: '切换' } }
        }
      }
    }
  }
})
