<template>
  <section class="library-card">
    <div class="head-row">
      <div class="head-text">
        <h2 class="library-name">{{ library.name }}</h2>
        <p class="library-hours">{{ library.hours }}</p>
      </div>
      <button class="calendar-btn" @click="openCalendar" aria-label="カレンダーを開く">
        <Calendar :size="18" :stroke-width="2.2" />
      </button>
    </div>

    <div v-if="today" class="today-card" :class="today.status">
      <p class="today-label">本日 {{ formatDate(todayKey) }}（{{ weekday(todayKey) }}）</p>
      <p class="today-status">{{ today.status === 'open' ? '開館' : '休館' }}</p>
      <p v-if="today.status === 'open'" class="today-hours">
        {{ today.open }}〜{{ today.close }}
      </p>
    </div>
    <div v-else class="today-card unknown">
      <p class="today-status">情報がありません</p>
      <p class="today-hours">本日（{{ formatDate(todayKey) }}）の開館情報は登録されていません。</p>
    </div>

    <h3 class="section-title">今後の予定</h3>
    <ul class="upcoming">
      <li v-for="d in upcoming" :key="d.key" class="day-row" :class="d.status">
        <span class="day-date">{{ formatDate(d.key) }}（{{ weekday(d.key) }}）</span>
        <span class="day-info">
          <span class="badge" :class="d.status">{{ d.status === 'open' ? '開館' : '休館' }}</span>
          <span v-if="d.status === 'open'" class="day-hours">{{ d.open }}〜{{ d.close }}</span>
        </span>
      </li>
    </ul>

    <div v-if="showCalendar" class="modal-overlay" @click.self="closeCalendar">
      <div class="modal">
        <div class="modal-head">
          <span class="modal-lib-name">{{ library.name }}</span>
          <button class="modal-close" @click="closeCalendar" aria-label="閉じる">×</button>
        </div>
        <div class="month-bar">
          <button class="month-nav" :disabled="!hasPrevMonth" @click="prevMonth">‹</button>
          <span class="month-title">{{ calYear }}年{{ calMonth }}月</span>
          <button class="month-nav" :disabled="!hasNextMonth" @click="nextMonth">›</button>
        </div>
        <div class="cal-grid">
          <span v-for="w in WEEKDAYS" :key="w" class="cal-weekday">{{ w }}</span>
          <span
            v-for="(cell, i) in calendarCells"
            :key="i"
            class="cal-cell"
            :class="[cell ? cell.status : 'empty', { today: cell && cell.isToday }]"
          >
            <template v-if="cell">
              <span class="cal-day">{{ cell.day }}</span>
              <span v-if="cell.status" class="cal-mark">{{ cell.status === 'closed' ? '休' : '開' }}</span>
            </template>
          </span>
        </div>
        <div class="cal-legend">
          <span class="legend-item"><span class="legend-dot open"></span>開館</span>
          <span class="legend-item"><span class="legend-dot closed"></span>休館</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Calendar } from '@lucide/vue'

const props = defineProps({
  library: { type: Object, required: true },
})

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

const schedule = computed(() => props.library.schedule)
const availableMonths = computed(() =>
  [...new Set(Object.keys(schedule.value).map(k => k.slice(0, 7)))].sort()
)

function localKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const todayKey = localKey(new Date())

const today = computed(() => schedule.value[todayKey] ?? null)

const upcoming = computed(() =>
  Object.keys(schedule.value)
    .filter(k => k > todayKey)
    .sort()
    .slice(0, 4)
    .map(k => ({ key: k, ...schedule.value[k] }))
)

function formatDate(key) {
  const [, m, d] = key.split('-')
  return `${Number(m)}月${Number(d)}日`
}

function weekday(key) {
  const [y, m, d] = key.split('-').map(Number)
  return WEEKDAYS[new Date(y, m - 1, d).getDay()]
}

const showCalendar = ref(false)
const todayMonth = todayKey.slice(0, 7)
const initialMonth = computed(() =>
  availableMonths.value.includes(todayMonth) ? todayMonth : availableMonths.value[0]
)
const currentMonth = ref(initialMonth.value)

const calYear = computed(() => Number(currentMonth.value.slice(0, 4)))
const calMonth = computed(() => Number(currentMonth.value.slice(5, 7)))

const monthIndex = computed(() => availableMonths.value.indexOf(currentMonth.value))
const hasPrevMonth = computed(() => monthIndex.value > 0)
const hasNextMonth = computed(() => monthIndex.value < availableMonths.value.length - 1)

const calendarCells = computed(() => {
  const y = calYear.value
  const m = calMonth.value
  const firstDay = new Date(y, m - 1, 1).getDay()
  const daysInMonth = new Date(y, m, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ day: d, status: schedule.value[key]?.status ?? null, isToday: key === todayKey })
  }
  return cells
})

function openCalendar() {
  currentMonth.value = initialMonth.value
  showCalendar.value = true
}
function closeCalendar() {
  showCalendar.value = false
}
function prevMonth() {
  if (hasPrevMonth.value) currentMonth.value = availableMonths.value[monthIndex.value - 1]
}
function nextMonth() {
  if (hasNextMonth.value) currentMonth.value = availableMonths.value[monthIndex.value + 1]
}
</script>

<style scoped>
.library-card {
  background: #f5f6f8;
}

.head-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 1.2em;
}
.head-text { min-width: 0; }
.library-name {
  margin: 0;
  font-size: 1.1em;
  font-weight: 700;
  color: #1a1a2e;
}
.library-hours {
  margin: 0.3em 0 0;
  font-size: 0.82em;
  color: #64748b;
}
.calendar-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: #eff6ff;
  color: #2563eb;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.15s;
  font-family: inherit;
}
.calendar-btn:hover { background: #dbeafe; }

.today-card {
  background: #fff;
  border-radius: 10px;
  padding: 1.4em 1.6em;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-left: 6px solid #94a3b8;
}
.today-card.open { border-left-color: #059669; }
.today-card.closed { border-left-color: #dc2626; }

.today-label {
  margin: 0 0 0.4em;
  font-size: 0.9em;
  color: #64748b;
}
.today-status {
  margin: 0;
  font-size: 1.8em;
  font-weight: 700;
  color: #1a1a2e;
}
.today-card.open .today-status { color: #059669; }
.today-card.closed .today-status { color: #dc2626; }

.today-hours {
  margin: 0.3em 0 0;
  font-size: 1.1em;
  font-weight: 600;
  color: #374151;
}

.section-title {
  font-size: 1.05em;
  font-weight: 700;
  color: #1a1a2e;
  margin: 1.6em 0 0.8em;
}

.upcoming {
  list-style: none;
  padding: 0;
  margin: 0;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.day-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0.8em 1.2em;
  border-top: 1px solid #f0f0f0;
}
.day-row:first-child { border-top: none; }

.day-date {
  font-size: 0.95em;
  color: #374151;
}

.day-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.badge {
  display: inline-block;
  padding: 0.2em 0.7em;
  border-radius: 12px;
  font-size: 0.78em;
  font-weight: 700;
  color: #fff;
}
.badge.open { background: #059669; }
.badge.closed { background: #dc2626; }

.day-hours {
  font-size: 0.88em;
  color: #64748b;
  min-width: 6.5em;
  text-align: right;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1em;
  z-index: 200;
}
.modal {
  background: #fff;
  border-radius: 12px;
  padding: 1.2em;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}
.modal-head {
  display: flex;
  align-items: center;
  margin-bottom: 0.8em;
}
.modal-lib-name {
  font-size: 1em;
  font-weight: 700;
  color: #1a1a2e;
}
.month-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 1em;
}
.month-title {
  font-size: 1.05em;
  font-weight: 700;
  color: #1a1a2e;
  min-width: 7em;
  text-align: center;
}
.month-nav {
  width: 32px;
  height: 32px;
  border: 1px solid #dde3f0;
  background: #fff;
  color: #2563eb;
  cursor: pointer;
  font-size: 1.1em;
  border-radius: 6px;
  font-family: inherit;
}
.month-nav:disabled { opacity: 0.35; cursor: default; }
.modal-close {
  margin-left: auto;
  width: 32px;
  height: 32px;
  border: none;
  background: #f1f5f9;
  color: #475569;
  cursor: pointer;
  font-size: 1.2em;
  border-radius: 6px;
  font-family: inherit;
}
.modal-close:hover { background: #e2e8f0; }

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}
.cal-weekday {
  text-align: center;
  font-size: 0.78em;
  font-weight: 700;
  color: #64748b;
  padding: 0.3em 0;
}
.cal-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  border-radius: 6px;
  font-size: 0.85em;
}
.cal-cell.empty { background: transparent; }
.cal-cell.open { background: #ecfdf5; }
.cal-cell.closed { background: #fef2f2; }
.cal-day { font-weight: 600; color: #1a1a2e; }
.cal-mark {
  font-size: 0.72em;
  font-weight: 700;
}
.cal-cell.open .cal-mark { color: #059669; }
.cal-cell.closed .cal-mark { color: #dc2626; }

.cal-cell.today {
  outline: 2px solid #2563eb;
  outline-offset: -2px;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}
.cal-cell.today .cal-day {
  color: #2563eb;
  font-weight: 800;
}

.cal-legend {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 1em;
  font-size: 0.82em;
  color: #475569;
}
.legend-item { display: flex; align-items: center; gap: 5px; }
.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}
.legend-dot.open { background: #ecfdf5; border: 1px solid #059669; }
.legend-dot.closed { background: #fef2f2; border: 1px solid #dc2626; }
</style>
