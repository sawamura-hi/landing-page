<template>
  <div id="panel-quiz">
    <h1>問題</h1>
    <div class="question-header left-align">
      <span>{{ currentIndex + 1 }}〜{{ Math.min(currentIndex + PAGE, questions.length) }} / {{ questions.length }}</span>
      <button @click="reset">リセット</button>
    </div>

    <div class="questions-container">
      <div
        v-for="(q, i) in currentPage"
        :key="currentIndex + i"
        class="question-block"
      >
        <p class="question">{{ currentIndex + i + 1 }}/{{ questions.length }} {{ q.question }}</p>
        <div class="left-align">
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

    <br />
    <div>
      <button @click="prev">前の{{ PAGE }}問</button>
      <button @click="next">次の{{ PAGE }}問</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import rawQuestions from '../data/quiz.json'

const PAGE = 8

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

function select(qIdx, cIdx) {
  selections[qIdx] = cIdx
}

function choiceColor(qIdx, cIdx) {
  if (selections[qIdx] === undefined) return ''
  if (selections[qIdx] !== cIdx) return ''
  return questions[qIdx].shuffled[cIdx].isCorrect ? 'lightgreen' : 'lightcoral'
}

function next() {
  currentIndex.value += PAGE
  if (currentIndex.value >= questions.length) currentIndex.value = 0
}

function prev() {
  currentIndex.value -= PAGE
  if (currentIndex.value < 0) currentIndex.value = Math.max(0, questions.length - PAGE)
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
  font-family: Arial, sans-serif;
  padding: 8px;
  text-align: left;
  max-width: 900px;
  margin: 0 auto;
}
.question-header {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.question-block {
  margin-bottom: 1.2em;
}
.question {
  text-align: left;
  text-decoration: underline;
  margin: 0 0 8px 0;
}
.left-align {
  text-align: left;
  display: inline-block;
  margin: 0 auto;
}
.choice-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 6px 0;
}
.choice-button { flex-shrink: 0; }
.choice-text { margin: 0; }
</style>
