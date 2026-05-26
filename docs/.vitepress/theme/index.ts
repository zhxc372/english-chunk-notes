import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import './style.css'

// 组件注册
import LessonList from '../components/LessonList.vue'
import ChunkCard from '../components/ChunkCard.vue'
import FavoriteButton from '../components/FavoriteButton.vue'
import AudioPlayer from '../components/AudioPlayer.vue'
import FlashcardTrainer from '../components/FlashcardTrainer.vue'
import ExamTagFilter from '../components/ExamTagFilter.vue'
import FavoritesPage from '../components/FavoritesPage.vue'
import LessonPage from '../components/LessonPage.vue'
import HomeLayout from '../components/HomeLayout.vue'
import HomeSearch from '../components/HomeSearch.vue'
import TagFilterBar from '../components/TagFilterBar.vue'

const theme: Theme = {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('LessonList', LessonList)
    app.component('ChunkCard', ChunkCard)
    app.component('FavoriteButton', FavoriteButton)
    app.component('AudioPlayer', AudioPlayer)
    app.component('FlashcardTrainer', FlashcardTrainer)
    app.component('ExamTagFilter', ExamTagFilter)
    app.component('FavoritesPage', FavoritesPage)
    app.component('LessonPage', LessonPage)
    app.component('HomeLayout', HomeLayout)
    app.component('HomeSearch', HomeSearch)
    app.component('TagFilterBar', TagFilterBar)
  }
}

export default theme
