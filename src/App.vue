<template>
  <SiteNav :activePanel="activePanel" />
  <KakomonPanel v-show="activePanel === 'kakomon'" />
  <QuizPanel v-show="activePanel === 'quiz'" />
  <LibraryPanel v-show="activePanel === 'library'" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import SiteNav from './components/SiteNav.vue'
import KakomonPanel from './components/KakomonPanel.vue'
import QuizPanel from './components/QuizPanel.vue'
import LibraryPanel from './components/LibraryPanel.vue'

function getPanel() {
  if (window.location.hash.startsWith('#/quiz')) return 'quiz'
  if (window.location.hash.startsWith('#/library')) return 'library'
  return 'kakomon'
}

const activePanel = ref(getPanel())

function onHashChange() {
  activePanel.value = getPanel()
}

onMounted(() => window.addEventListener('hashchange', onHashChange))
onUnmounted(() => window.removeEventListener('hashchange', onHashChange))
</script>

<style>
body {
  background: #f5f6f8;
  margin: 0;
  overflow-x: hidden;
}
</style>
