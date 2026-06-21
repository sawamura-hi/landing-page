<template>
  <SiteNav :activePanel="activePanel" />
  <KakomonPanel v-show="activePanel === 'kakomon'" />
  <QuizPanel v-show="activePanel === 'quiz'" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import SiteNav from './components/SiteNav.vue'
import KakomonPanel from './components/KakomonPanel.vue'
import QuizPanel from './components/QuizPanel.vue'

function getPanel() {
  return window.location.hash === '#/quiz' ? 'quiz' : 'kakomon'
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
}
</style>
