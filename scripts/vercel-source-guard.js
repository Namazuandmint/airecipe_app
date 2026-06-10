import { readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const commit = execSync('git rev-parse --short HEAD').toString().trim()
console.log(`[source-guard] building commit: ${commit}`)

const requiredChecks = [
  ['src/App.tsx', 'IngredientRegisterPage'],
  ['src/App.tsx', 'RecipeGeneratePage'],
  ['src/lib/i18n.ts', "'topbar.recipes': '生成'"],
  ['src/lib/i18n.ts', "'topbar.receipt': '登録'"],
  ['src/lib/i18n.ts', "'home.hero.scanReceipt': '食材を登録'"],
]

const forbiddenChecks = [
  ['src/lib/i18n.ts', "'topbar.recipes': 'レシピ'"],
  ['src/lib/i18n.ts', "'topbar.receipt': 'レシート'"],
  ['src/lib/i18n.ts', "'home.hero.scanReceipt': 'レシート撮影'"],
]

for (const [file, text] of requiredChecks) {
  const content = readFileSync(file, 'utf8')
  if (!content.includes(text)) {
    console.error(`[source-guard] missing expected source: ${file} -> ${text}`)
    process.exit(1)
  }
}

for (const [file, text] of forbiddenChecks) {
  const content = readFileSync(file, 'utf8')
  if (content.includes(text)) {
    console.error(`[source-guard] old source still exists: ${file} -> ${text}`)
    process.exit(1)
  }
}

console.log('[source-guard] correct source tree confirmed')