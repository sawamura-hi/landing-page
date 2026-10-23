// 骨子_直した例.md（事例Ⅰ〜Ⅲ）から src/data/anki-kosshi.json を生成する
// 使い方: npm run build:anki [-- <mdのパス>]
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const DEFAULT_MD = path.join(
  os.homedir(),
  'Library/CloudStorage/OneDrive-個人用/ドキュメント/資格/中小企業診断士/2026/2次試験2026',
  '3_ふぞろいな答案分析と回答_md/自分の回答/暗記/バックアップ/骨子_直した例.md',
)
const mdPath = process.argv[2] || DEFAULT_MD
const outPath = new URL('../src/data/anki-kosshi.json', import.meta.url)

const escape = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const jirei = []
let group = null
let item = null

for (const line of fs.readFileSync(mdPath, 'utf8').split('\n')) {
  let m
  if ((m = line.match(/^## (.+)/))) {
    jirei.push({ title: m[1].trim(), mode: 'year', groups: [] })
  } else if ((m = line.match(/^### (.+)/))) {
    group = { label: m[1].trim(), items: [] }
    jirei.at(-1).groups.push(group)
  } else if ((m = line.match(/^#### (.+)/))) {
    item = { no: m[1].trim(), question: [], answer: '' }
    group.items.push(item)
  } else if (item && (m = line.match(/^> ?(.*)/))) {
    item.question.push(escape(m[1].trim()))
  } else if (item && (m = line.match(/^\*\*骨子\*\*[：:]\s*(.+)/))) {
    item.answer = escape(m[1].trim())
  }
}

let count = 0
for (const j of jirei) {
  j.groups.reverse() // 新しい年度を先頭に
  for (const g of j.groups) {
    for (const it of g.items) {
      if (!it.question.length || !it.answer) throw new Error(`設問文か骨子が空です: ${j.title} ${g.label} ${it.no}`)
      it.question = it.question.join('<br>')
      count++
    }
  }
}

fs.writeFileSync(outPath, JSON.stringify({ jirei }, null, 2) + '\n')
console.log(`${jirei.map(j => j.title).join('・')} 計${count}問 → src/data/anki-kosshi.json`)
