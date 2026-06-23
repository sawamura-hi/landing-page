<template>
  <div id="panel-quiz">
    <h1>白書クイズ</h1>
    <div class="question-header">
      <span>{{ currentIndex + 1 }}〜{{ Math.min(currentIndex + PAGE, questions.length) }} / {{ questions.length }}</span>
      <span class="score">正答率 {{ accuracy }}%（{{ correctCount }}/{{ answeredCount }}）</span>
      <button class="reset-btn" @click="reset">リセット</button>
    </div>

    <div class="questions-container">
      <div
        v-for="(q, i) in currentPage"
        :key="currentIndex + i"
        class="question-block"
      >
        <p class="question">{{ currentIndex + i + 1 }}/{{ questions.length }} {{ q.question }}</p>
        <div class="choices">
          <div
            v-for="(choice, cIdx) in q.shuffled"
            :key="cIdx"
            class="choice-container"
          >
            <button class="choice-button" @click="select(currentIndex + i, cIdx)">◯</button>
            <p
              class="choice-text"
              :style="{ backgroundColor: choiceColor(currentIndex + i, cIdx) }"
            >{{ choice.text }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="pagination">
      <button class="page-btn arrow" :disabled="currentPageNum === 1" @click="prev">‹</button>
      <button
        v-for="page in totalPages"
        :key="page"
        class="page-btn"
        :class="{ active: page === currentPageNum }"
        @click="goToPage(page)"
      >{{ page }}</button>
      <button class="page-btn arrow" :disabled="currentPageNum === totalPages" @click="next">›</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import rawQuestions from '../data/quiz.json'

const PAGE = 16

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildQuestions() {
  return shuffle(rawQuestions).map(q => ({
    ...q,
    shuffled: shuffle(q.choices),
  }))
}

const questions = reactive(buildQuestions())
const currentIndex = ref(0)
const selections = reactive({})

const currentPage = computed(() =>
  questions.slice(currentIndex.value, currentIndex.value + PAGE)
)

const totalPages = computed(() => Math.ceil(questions.length / PAGE))

const currentPageNum = computed(() => Math.floor(currentIndex.value / PAGE) + 1)

function goToPage(page) {
  currentIndex.value = (page - 1) * PAGE
}

const answeredCount = computed(() => Object.keys(selections).length)

const correctCount = computed(() =>
  Object.entries(selections).filter(
    ([qIdx, cIdx]) => questions[qIdx].shuffled[cIdx].isCorrect
  ).length
)

const accuracy = computed(() =>
  answeredCount.value === 0
    ? 0
    : Math.round((correctCount.value / answeredCount.value) * 100)
)

function select(qIdx, cIdx) {
  selections[qIdx] = cIdx
}

function choiceColor(qIdx, cIdx) {
  if (selections[qIdx] === undefined) return ''
  if (selections[qIdx] !== cIdx) return ''
  return questions[qIdx].shuffled[cIdx].isCorrect ? 'lightgreen' : 'lightcoral'
}

function next() {
  if (currentPageNum.value < totalPages.value) currentIndex.value += PAGE
}

function prev() {
  if (currentPageNum.value > 1) currentIndex.value -= PAGE
}

function reset() {
  const fresh = buildQuestions()
  questions.splice(0, questions.length, ...fresh)
  currentIndex.value = 0
  Object.keys(selections).forEach(k => delete selections[k])
}
</script>

<style scoped>
#panel-quiz {
  font-family: "Hiragino Sans", "Noto Sans JP", sans-serif;
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5em 1.2em;
  background: #f5f6f8;
  color: #222;
}

#panel-quiz h1 {
  font-size: 1.25em;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 1em;
  padding-bottom: 0.5em;
  border-bottom: 3px solid #2563eb;
}

.question-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1em;
  font-size: 0.9em;
  color: #64748b;
}

.score {
  font-weight: 600;
  color: #2563eb;
}

.reset-btn {
  margin-left: auto;
  padding: 0.3em 0.9em;
  border: none;
  background: #dde3f0;
  color: #444;
  cursor: pointer;
  font-size: 0.82em;
  font-weight: 600;
  border-radius: 6px;
  transition: background 0.15s;
  font-family: inherit;
}
.reset-btn:hover { background: #c7d2ea; }

.questions-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1em;
}

.question-block {
  background: #fff;
  border-radius: 8px;
  padding: 1.2em 1.4em;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

@media (max-width: 640px) {
  .questions-container {
    grid-template-columns: 1fr;
  }
}

.question {
  font-size: 0.95em;
  font-weight: 600;
  color: #1a1a2e;
  text-decoration: underline;
  margin: 0 0 0.8em 0;
}

.choices {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.choice-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.choice-button {
  flex-shrink: 0;
  background: none;
  border: 1px solid #dde3f0;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  color: #2563eb;
  font-size: 1em;
  transition: background 0.15s;
  font-family: inherit;
}
.choice-button:hover { background: #eff6ff; }

.choice-text {
  margin: 0;
  font-size: 0.9em;
  color: #374151;
  padding: 0.3em 0.6em;
  border-radius: 4px;
  line-height: 1.5;
}

.pagination {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  margin-top: 1em;
}

.page-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 0.5em;
  border: 1px solid #dde3f0;
  background: #fff;
  color: #444;
  cursor: pointer;
  font-size: 0.85em;
  font-weight: 600;
  border-radius: 6px;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  font-family: inherit;
}
.page-btn:hover:not(:disabled) { background: #eff6ff; }

.page-btn.active {
  background: #2563eb;
  border-color: #2563eb;
  color: #fff;
}

.page-btn.arrow {
  font-size: 1.1em;
  line-height: 1;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: default;
}
</style>
