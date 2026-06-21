<template>
  <SiteNav :activePanel="activePanel" @change="activePanel = $event" />
  <KakomonPanel v-show="activePanel === 'kakomon'" />
  <QuizPanel v-show="activePanel === 'quiz'" />
</template>

<script setup>
import { ref } from 'vue'
import SiteNav from './components/SiteNav.vue'
import KakomonPanel from './components/KakomonPanel.vue'
import QuizPanel from './components/QuizPanel.vue'

const activePanel = ref('kakomon')
</script>

<style>
body {
  background: #f5f6f8;
  margin: 0;
}
</style>
