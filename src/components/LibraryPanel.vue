<template>
  <div id="panel-library">
    <h1>図書館</h1>
    <div class="library-list">
      <LibraryCard
        v-for="lib in libraries"
        :key="lib.id"
        :library="lib"
      />
    </div>
  </div>
</template>

<script setup>
import LibraryCard from './LibraryCard.vue'
import data from '../data/library.json'

const libraries = data.libraries
</script>

<style scoped>
#panel-library {
  font-family: "Hiragino Sans", "Noto Sans JP", sans-serif;
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5em 1.2em;
  background: #f5f6f8;
  color: #222;
}

#panel-library h1 {
  font-size: 1.25em;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 1em;
  padding-bottom: 0.5em;
  border-bottom: 3px solid #2563eb;
}

.library-list {
  display: flex;
  flex-direction: column;
  gap: 2em;
}
</style>
