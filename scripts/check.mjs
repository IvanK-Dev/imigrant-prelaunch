import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const root = new URL('../dist/', import.meta.url)
const expected = ['uk', 'pl', 'en']
const failures = []
const files = []

async function walk(url, relative = '') {
  for (const entry of await readdir(url, { withFileTypes: true })) {
    const name = path.posix.join(relative, entry.name)
    if (entry.isDirectory()) await walk(new URL(`${entry.name}/`, url), name)
    else files.push(name)
  }
}
await walk(root)
const allText = (await Promise.all(files.filter((file) => /\.(html|xml|txt|css|js)$/.test(file)).map((file) => readFile(new URL(file, root), 'utf8')))).join('\n')

for (const locale of expected) {
  const html = await readFile(new URL(`${locale}/index.html`, root), 'utf8')
  for (const marker of [`lang="${locale}"`, '<title>', 'rel="canonical"', 'hreflang=', 'application/ld+json', 'mailto:imigrant.legnica@gmail.com']) {
    if (!html.includes(marker)) failures.push(`${locale}: missing ${marker}`)
  }
}
for (const forbidden of ['Lorem ipsum', 'awork3302@gmail.com', '.env.local', 'AggregateRating']) {
  if (allText.includes(forbidden)) failures.push(`forbidden text found: ${forbidden}`)
}
for (const required of ['robots.txt', 'sitemap.xml', 'assets/styles.css', 'assets/app.js', 'assets/hero.webp', 'assets/logo.png']) {
  if (!files.includes(required)) failures.push(`missing file: ${required}`)
}
if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log(`Checks passed: ${files.length} files, ${expected.length} locales.`)
