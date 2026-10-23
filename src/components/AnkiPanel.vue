<template>
  <div id="panel-anki">
    <div class="inner">
      <h1>暗記（事例Ⅰ〜Ⅲ：骨子 全{{ kosshiCount }}問／事例Ⅳ：文章対策 全{{ jirei4Count }}問）</h1>
      <div class="bar">
        <div class="tabs">
          <button
            v-for="(j, i) in jireiList"
            :key="j.title"
            class="tab jirei"
            :class="{ active: curJ === i }"
            @click="showJirei(i)"
          >{{ j.title }}</button>
        </div>
        <div v-if="!is4" class="tabs">
          <button
            v-for="(g, i) in yearLabels"
            :key="g"
            class="tab"
            :class="{ active: curY === i }"
            @click="showYear(i)"
          >{{ g }}</button>
        </div>
        <div v-else class="tabs">
          <button
            v-for="(g, i) in jirei4.groups"
            :key="g.label"
            class="tab"
            :class="{ active: curC === i }"
            @click="showCat(i)"
          >{{ g.label }}</button>
        </div>
      </div>

      <section v-for="it in cards" :key="it.id" class="card">
        <div v-if="it.no" class="qno">{{ it.no }}</div>
        <div class="field" v-html="it.question"></div>
        <button class="reveal" :class="{ open: opened[it.id] }" @click="toggle(it.id)">
          {{ label }}を{{ opened[it.id] ? '隠す' : '見る' }}
        </button>
        <div v-if="opened[it.id]" class="back">
          <div v-if="is4" class="field" v-html="it.answer"></div>
          <div v-else class="field flow">
            <template v-for="(steps, ri) in parseKosshi(it.answer)" :key="ri">
              <span v-if="ri > 0" class="sep">／</span>
              <template v-for="(s, si) in steps" :key="si">
                <span v-if="si > 0" class="arrow" aria-label="→"></span>
                <span v-if="s.head" class="head">{{ s.head }}</span>
                <span class="chip">{{ s.text }}</span>
              </template>
            </template>
          </div>
          <div v-if="it.memo" class="memo" v-html="it.memo"></div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import kosshi from '../data/anki-kosshi.json'
import jirei4 from '../data/anki-jirei4.json'

// 各カードに一意なIDを振る（開閉状態の管理用）
function withIds(j, ji) {
  return {
    ...j,
    groups: j.groups.map((g, gi) => ({
      ...g,
      items: g.items.map((it, ii) => ({ ...it, id: `${ji}-${gi}-${ii}` })),
    })),
  }
}
const jireiList = [...kosshi.jirei, jirei4].map(withIds)
const yearLabels = jireiList[0].groups.map(g => g.label)
const kosshiCount = kosshi.jirei.reduce((n, j) => n + j.groups.reduce((m, g) => m + g.items.length, 0), 0)
const jirei4Count = jirei4.groups.reduce((n, g) => n + g.items.length, 0)

const params = new URLSearchParams(window.location.hash.split('?')[1] || '')
const clamp = (v, max) => (Number.isInteger(v) && v >= 0 && v < max ? v : 0)
const curJ = ref(clamp(+params.get('j'), jireiList.length))
const curY = ref(clamp(+params.get('y'), yearLabels.length))
const curC = ref(clamp(+params.get('c'), jirei4.groups.length))
const opened = reactive({})
const order = ref([])

const is4 = computed(() => curJ.value === jireiList.length - 1)
const label = computed(() => (is4.value ? '答え' : '骨子'))
const group = computed(() => jireiList[curJ.value].groups[is4.value ? curC.value : curY.value])
const cards = computed(() => {
  const items = group.value.items
  return is4.value ? order.value.map(i => items[i]).filter(Boolean) : items
})

// 骨子の文字列を「／」で区切り、さらに「→」でチップに分ける。「見出し：」はチップの外に出す。文字の順番は変えない
function parseKosshi(text) {
  return text.split('／').map(seg => seg.split('→').map(s => {
    s = s.trim()
    const k = s.indexOf('：') + 1
    return { head: s.slice(0, k), text: s.slice(k).trim() }
  }))
}

function toggle(id) {
  opened[id] = !opened[id]
}

// 事例Ⅳは表示のたびにシャッフルし、開いていたカードは閉じる
function shuffle() {
  const items = group.value.items
  const idx = items.map((_, i) => i)
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]]
  }
  items.forEach(it => { opened[it.id] = false })
  order.value = idx
}

function updateHash() {
  const q = is4.value ? `j=${curJ.value}&c=${curC.value}` : `j=${curJ.value}&y=${curY.value}`
  window.history.replaceState(null, '', `#/anki?${q}`)
}

function render() {
  if (is4.value) shuffle()
  updateHash()
  window.scrollTo(0, 0)
}

function showJirei(i) { curJ.value = i; render() }
function showYear(i) { curY.value = i; render() }
function showCat(i) { curC.value = i; render() }

if (is4.value) shuffle()

function onHashChange() {
  if (window.location.hash.startsWith('#/anki')) updateHash()
}

onMounted(() => {
  if (window.location.hash.startsWith('#/anki')) updateHash()
  window.addEventListener('hashchange', onHashChange)
})
onUnmounted(() => window.removeEventListener('hashchange', onHashChange))
</script>

<style scoped>
#panel-anki {
  font-family: -apple-system, "Hiragino Sans", sans-serif;
  background: #f6f6f4;
  color: #222;
  line-height: 1.7;
  min-height: calc(100vh - 52px);
}
.inner {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 16px;
}
h1 {
  font-size: 20px;
  margin: 0 0 0.67em;
}
.card {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px 16px;
  margin: 16px 0;
}
.qno {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 4px;
}
.back {
  margin-top: 8px;
}
.field {
  border-left: 3px solid #ccc;
  padding: 4px 10px;
  margin: 4px 0;
}
.field :deep(table) {
  border-collapse: collapse;
}
.field :deep(th),
.field :deep(td) {
  border: 1px solid #888;
  padding: 2px 8px;
  text-align: left;
}
.field :deep(th:last-child),
.field :deep(td:last-child) {
  text-align: right;
}
/* 行に分けず、全体を1つの流れで折り返す */
.flow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 0;
  padding: 6px 10px;
}
.sep {
  margin: 0 10px 0 4px;
  color: #888;
}
.head {
  font-size: 14px;
  margin-right: 4px;
}
.chip {
  padding: 2px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #eee;
  font-size: 14px;
  margin-right: 6px;
}
.arrow {
  width: 18px;
  height: 10px;
  margin-right: 6px;
  flex: 0 0 auto;
  background: no-repeat center / contain
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 18 10'%3E%3Cpath d='M0 5h15M11 1l5 4-5 4' fill='none' stroke='%23888' stroke-width='1.6'/%3E%3C/svg%3E");
}
.reveal {
  cursor: pointer;
  margin-top: 10px;
  font-size: 14px;
  padding: 6px 14px;
  border: 1px solid #444;
  border-radius: 6px;
  background: #fff;
  color: #444;
}
.reveal.open {
  background: #444;
  color: #fff;
}
.memo {
  margin: 6px 0 0;
  padding: 4px 10px;
  font-size: 13px;
  color: #8a5a00;
  background: #fff6e0;
  border-radius: 4px;
}
.bar {
  font-size: 13px;
  position: sticky;
  top: 52px; /* SiteNav の高さ分下げる */
  background: #f6f6f4;
  padding: 8px 0;
  z-index: 1;
}
.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}
.tab {
  cursor: pointer;
  margin: 0;
  font-size: 13px;
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #fff;
  color: #444;
}
.tab.active {
  background: #444;
  color: #fff;
  border-color: #444;
}
.tab.jirei {
  border-color: #1f4e79;
  color: #1f4e79;
}
.tab.jirei.active {
  background: #1f4e79;
  color: #fff;
}
</style>
