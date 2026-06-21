<template>
  <div id="panel-kakomon">
    <h1>過去問</h1>
    <div class="layout">
      <nav class="sidebar">
        <button
          v-for="(subj, idx) in subjects"
          :key="subj.key"
          class="sidebar-btn"
          :class="{ active: activeSubject === idx }"
          @click="selectSubject(idx)"
        >
          {{ subj.label }}
        </button>
      </nav>

      <div class="content">
        <div
          v-for="(subj, idx) in subjects"
          :key="subj.key"
          class="content-panel"
          :class="{ active: activeSubject === idx }"
        >
          <div class="tabs">
            <button
              v-for="(year, yIdx) in years"
              :key="year.key"
              class="tab-btn"
              :class="{ active: activeYear[idx] === yIdx }"
              @click="selectYear(idx, yIdx)"
            >
              {{ year.label }}
            </button>
          </div>

          <div
            v-for="(year, yIdx) in years"
            :key="year.key"
            class="tab-panel"
            :class="{ active: activeYear[idx] === yIdx }"
          >
            <ul>
              <li
                v-for="q in links[year.key][subj.key]"
                :key="q.num"
                class="q-row"
              >
                <span class="q-num">{{ q.num }}</span>
                <a
                  v-if="q.kakomon"
                  class="site-btn kakomon-btn"
                  :href="q.kakomon"
                  target="_blank"
                >過去問.com</a>
                <a
                  v-if="q.matome"
                  class="site-btn matome-btn"
                  :href="q.matome"
                  target="_blank"
                >まとめシート</a>
                <span v-else class="site-btn disabled">まとめシート</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import links from '../data/links.json'

const subjects = [
  { key: 'keizai', label: '経済学・経済政策' },
  { key: 'zaimu',  label: '財務・会計' },
  { key: 'kigyou', label: '企業経営理論' },
  { key: 'unei',   label: '運営管理' },
  { key: 'houmu',  label: '経営法務' },
  { key: 'joho',   label: '経営情報システム' },
  { key: 'chusho', label: '中小企業経営・政策' },
]

const years = [
  { key: 'r7', label: 'R7（2025）' },
  { key: 'r6', label: 'R6（2024）' },
  { key: 'r5', label: 'R5（2023）' },
  { key: 'r4', label: 'R4（2022）' },
  { key: 'r3', label: 'R3（2021）' },
  { key: 'r2', label: 'R2（2020）' },
]

function getHashParams() {
  const hash = window.location.hash
  const queryStr = hash.includes('?') ? hash.split('?')[1] : ''
  return new URLSearchParams(queryStr)
}

function updateHash() {
  const subj = subjects[activeSubject.value].key
  const year = years[activeYear[activeSubject.value]].key
  window.history.replaceState(null, '', `#/kakomon?subj=${subj}&year=${year}`)
}

const params = getHashParams()
const initialSubjIdx = Math.max(0, subjects.findIndex(s => s.key === params.get('subj')))
const initialYearIdx = Math.max(0, years.findIndex(y => y.key === params.get('year')))

const activeSubject = ref(initialSubjIdx)
const activeYear = reactive(subjects.map((_, i) => i === initialSubjIdx ? initialYearIdx : 0))

function selectSubject(idx) {
  activeSubject.value = idx
  activeYear[idx] = 0
  updateHash()
}

function selectYear(subjIdx, yearIdx) {
  activeYear[subjIdx] = yearIdx
  updateHash()
}

function onHashChange() {
  const hash = window.location.hash
  if (!hash.startsWith('#/kakomon')) return

  const queryStr = hash.includes('?') ? hash.split('?')[1] : ''
  const p = new URLSearchParams(queryStr)
  const subjKey = p.get('subj')
  const yearKey = p.get('year')

  if (!subjKey) {
    activeSubject.value = 0
    activeYear[0] = 0
    updateHash()
    return
  }

  const subjIdx = subjects.findIndex(s => s.key === subjKey)
  if (subjIdx >= 0) activeSubject.value = subjIdx
  const yearIdx = years.findIndex(y => y.key === yearKey)
  if (yearIdx >= 0) activeYear[activeSubject.value] = yearIdx
}

onMounted(() => {
  if (window.location.hash.startsWith('#/kakomon')) updateHash()
  window.addEventListener('hashchange', onHashChange)
})
onUnmounted(() => window.removeEventListener('hashchange', onHashChange))
</script>

<style scoped>
* { box-sizing: border-box; }

#panel-kakomon {
  font-family: "Hiragino Sans", "Noto Sans JP", sans-serif;
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5em 1.2em;
  background: #f5f6f8;
  color: #222;
}
#panel-kakomon h1 {
  font-size: 1.25em;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 1em;
  padding-bottom: 0.5em;
  border-bottom: 3px solid #2563eb;
}

.layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}
.sidebar {
  width: 168px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
  position: sticky;
  top: 1em;
}
.sidebar-btn {
  padding: 0.6em 0.9em;
  border: none;
  border-left: 3px solid transparent;
  background: transparent;
  color: #64748b;
  font-size: 0.85em;
  font-weight: 500;
  border-radius: 0 6px 6px 0;
  cursor: pointer;
  text-align: left;
  line-height: 1.4;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  font-family: inherit;
}
.sidebar-btn:hover {
  background: #f1f5f9;
  color: #1e293b;
}
.sidebar-btn.active {
  border-left-color: #2563eb;
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 700;
}

.content { flex: 1; min-width: 0; }
.content-panel { display: none; }
.content-panel.active { display: block; }

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 0;
}
.tab-btn {
  padding: 0.5em 1em;
  border: none;
  background: #dde3f0;
  color: #444;
  cursor: pointer;
  font-size: 0.82em;
  font-weight: 600;
  border-radius: 8px 8px 0 0;
  transition: background 0.15s;
  font-family: inherit;
}
.tab-btn:hover { background: #c7d2ea; }
.tab-btn.active { background: #2563eb; color: #fff; }

.tab-panel {
  display: none;
  background: #fff;
  border-radius: 0 8px 8px 8px;
  padding: 1.4em 1.6em;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 1em;
}
.tab-panel.active { display: block; }

ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
}
li.q-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.35em 0.6em;
  border-top: 1px solid #f0f0f0;
}
li.q-row:first-child { border-top: none; }

.q-num {
  flex: 1;
  font-size: 0.93em;
  color: #374151;
}
.site-btn {
  display: inline-block;
  padding: 0.28em 0.8em;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
}
a.kakomon-btn { background: #2563eb; color: #fff; }
a.kakomon-btn:hover { background: #1d4ed8; }
a.matome-btn { background: #059669; color: #fff; }
a.matome-btn:hover { background: #047857; }
.site-btn.disabled { background: #e5e7eb; color: #9ca3af; }
</style>
