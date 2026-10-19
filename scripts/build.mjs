import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const localBuild = process.argv.includes('--local')
const origin = (localBuild ? 'http://localhost:8080' : process.env.SITE_ORIGIN || '').replace(/\/$/, '')

if (!origin) throw new Error('SITE_ORIGIN is required. Use an HTTPS production URL or run npm run build:local.')
const parsedOrigin = new URL(origin)
if (!localBuild && (parsedOrigin.protocol !== 'https:' || ['localhost', '127.0.0.1', 'example.com'].includes(parsedOrigin.hostname))) {
  throw new Error('Production SITE_ORIGIN must be the real HTTPS domain (not localhost or example.com).')
}

const site = JSON.parse(await readFile(path.join(root, 'config/site.json'), 'utf8'))
if (site.email !== 'imigrant.legnica@gmail.com') throw new Error('The approved contact email must not be changed.')

const locales = {
  uk: {
    lang: 'uk', title: 'Легалізація іноземців у Польщі | Imigrant Olga Kalyniak',
    description: 'Професійна підтримка іноземців у питаннях легалізації перебування в Польщі. Imigrant Olga Kalyniak — консультації та супровід у Легниці.',
    nav: ['Головна', 'Послуги', 'Про компанію', 'Контакти'], menu: 'Відкрити меню',
    heroTitle: 'Легалізація іноземців у Польщі', heroText: 'Професійна підтримка на кожному етапі легалізації вашого перебування в Польщі.',
    call: 'Зателефонувати', email: 'Написати email', servicesTitle: 'Наші послуги',
    servicesIntro: 'Підтримка у справах перебування, документів і формальностей у Польщі.',
    services: ['Тимчасовий побит', 'Сталий побит', 'Побит довгострокового резидента ЄС', 'Громадянство', 'Карта CUKR', 'Присяжні переклади', 'Послуги для бізнесу та роботодавців', 'Додаткові послуги'],
    aboutKicker: 'Про компанію', aboutTitle: 'Підтримка у важливих формальностях',
    aboutText: 'Imigrant Olga Kalyniak допомагає іноземцям зорієнтуватися у питаннях легалізації перебування та пов’язаних адміністративних процедурах у Польщі. Ми пояснюємо наступні кроки зрозуміло та супроводжуємо клієнтів у межах обраної послуги.',
    aboutPoints: ['Зрозуміла комунікація', 'Увага до вашої ситуації', 'Підтримка українською, польською та англійською'],
    contactsTitle: 'Контакти', contactsText: 'Напишіть нам, щоб обговорити вашу ситуацію та потрібну послугу.', emailLabel: 'Контактний email',
    rights: 'Всі права захищені.', skip: 'Перейти до основного вмісту'
  },
  pl: {
    lang: 'pl', title: 'Legalizacja pobytu w Polsce | Imigrant Olga Kalyniak',
    description: 'Profesjonalne wsparcie cudzoziemców w sprawach legalizacji pobytu w Polsce. Imigrant Olga Kalyniak — konsultacje i pomoc w Legnicy.',
    nav: ['Strona główna', 'Usługi', 'O firmie', 'Kontakt'], menu: 'Otwórz menu',
    heroTitle: 'Legalizacja pobytu cudzoziemców w Polsce', heroText: 'Profesjonalne wsparcie na każdym etapie legalizacji Twojego pobytu w Polsce.',
    call: 'Zadzwoń', email: 'Napisz email', servicesTitle: 'Nasze usługi',
    servicesIntro: 'Wsparcie w sprawach pobytowych, dokumentach i formalnościach w Polsce.',
    services: ['Pobyt czasowy', 'Pobyt stały', 'Pobyt rezydenta długoterminowego UE', 'Obywatelstwo', 'Karta CUKR', 'Tłumaczenia przysięgłe', 'Usługi dla firm i pracodawców', 'Usługi dodatkowe'],
    aboutKicker: 'O firmie', aboutTitle: 'Wsparcie w ważnych formalnościach',
    aboutText: 'Imigrant Olga Kalyniak pomaga cudzoziemcom odnaleźć się w sprawach legalizacji pobytu i związanych z nimi procedurach administracyjnych w Polsce. Jasno wyjaśniamy kolejne kroki i wspieramy klientów w zakresie wybranej usługi.',
    aboutPoints: ['Jasna komunikacja', 'Uważne podejście do Twojej sytuacji', 'Wsparcie po ukraińsku, polsku i angielsku'],
    contactsTitle: 'Kontakt', contactsText: 'Napisz do nas, aby omówić swoją sytuację i potrzebną usługę.', emailLabel: 'Email kontaktowy',
    rights: 'Wszelkie prawa zastrzeżone.', skip: 'Przejdź do głównej treści'
  },
  en: {
    lang: 'en', title: 'Legalization of Stay in Poland | Imigrant Olga Kalyniak',
    description: 'Professional support for foreigners with legalization of stay in Poland. Imigrant Olga Kalyniak — guidance and assistance in Legnica.',
    nav: ['Home', 'Services', 'About us', 'Contact'], menu: 'Open menu',
    heroTitle: 'Legalization of stay for foreigners in Poland', heroText: 'Professional support at every stage of legalizing your stay in Poland.',
    call: 'Call us', email: 'Send an email', servicesTitle: 'Our services',
    servicesIntro: 'Support with residence matters, documents, and formalities in Poland.',
    services: ['Temporary residence', 'Permanent residence', 'EU long-term resident status', 'Citizenship', 'CUKR card', 'Sworn translations', 'Services for businesses and employers', 'Additional services'],
    aboutKicker: 'About us', aboutTitle: 'Support with important formalities',
    aboutText: 'Imigrant Olga Kalyniak helps foreigners navigate residence legalization and related administrative procedures in Poland. We explain the next steps clearly and support clients within the scope of their chosen service.',
    aboutPoints: ['Clear communication', 'Attention to your individual situation', 'Support in Ukrainian, Polish, and English'],
    contactsTitle: 'Contact', contactsText: 'Email us to discuss your situation and the service you need.', emailLabel: 'Contact email',
    rights: 'All rights reserved.', skip: 'Skip to main content'
  }
}

const icons = ['01-residence-card-document.svg', '02-passport-visa.svg', '06-id-card.svg', '07-citizenship-certificate.svg', '03-protection-shield.svg', '08-sworn-translations.svg', '09-business-employer.svg', '10-additional-services.svg']
const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])
const alternateLinks = Object.keys(locales).map((code) => `<link rel="alternate" hreflang="${code}" href="${origin}/${code}/">`).join('\n    ')

function page(code, t) {
  const url = `${origin}/${code}/`
  const phoneHref = site.phone ? `tel:${site.phone.replace(/[^+\d]/g, '')}` : null
  const contactDetails = [
    `<article class="contact-card"><span>${esc(t.emailLabel)}</span><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></article>`,
    site.phone ? `<article class="contact-card"><span>${esc(t.call)}</span><a href="${phoneHref}">${esc(site.phone)}</a></article>` : '',
    site.address ? `<article class="contact-card"><span>${esc(code === 'pl' ? 'Adres' : code === 'en' ? 'Address' : 'Адреса')}</span><p>${esc(site.address)}</p></article>` : '',
    site.workingHours?.[code] ? `<article class="contact-card"><span>${esc(code === 'pl' ? 'Godziny pracy' : code === 'en' ? 'Opening hours' : 'Графік роботи')}</span><p>${esc(site.workingHours[code])}</p></article>` : ''
  ].filter(Boolean).join('')
  const schema = { '@context': 'https://schema.org', '@type': 'ProfessionalService', name: site.businessName, url, email: site.email, image: `${origin}/assets/hero.webp`, areaServed: { '@type': 'Country', name: 'Poland' } }
  if (site.phone) schema.telephone = site.phone
  if (site.address) schema.address = { '@type': 'PostalAddress', streetAddress: site.address, addressCountry: 'PL' }

  return `<!doctype html>
<html lang="${t.lang}"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(t.title)}</title><meta name="description" content="${esc(t.description)}">
  <link rel="canonical" href="${url}">${alternateLinks}
  <link rel="alternate" hreflang="x-default" href="${origin}/uk/">
  <meta property="og:type" content="website"><meta property="og:site_name" content="${esc(site.businessName)}">
  <meta property="og:title" content="${esc(t.title)}"><meta property="og:description" content="${esc(t.description)}">
  <meta property="og:url" content="${url}"><meta property="og:image" content="${origin}/assets/hero.webp"><meta property="og:locale" content="${code === 'uk' ? 'uk_UA' : code === 'pl' ? 'pl_PL' : 'en_GB'}">
  <meta name="twitter:card" content="summary_large_image"><meta name="theme-color" content="#fb3d0a">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/styles.css"><link rel="stylesheet" href="/assets/responsive.css">
  <script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>
</head><body>
  <a class="skip-link" href="#main">${esc(t.skip)}</a>
  <header class="header"><div class="shell header-inner">
    <a class="brand" href="/${code}/" aria-label="${esc(site.businessName)}"><img src="/assets/logo.png" width="683" height="666" alt=""><span>Imigrant<small>Olga Kalyniak</small></span></a>
    <nav class="desktop-nav" aria-label="${esc(t.nav[0])}"><a href="#home">${esc(t.nav[0])}</a><a href="#services">${esc(t.nav[1])}</a><a href="#about">${esc(t.nav[2])}</a><a href="#contact">${esc(t.nav[3])}</a></nav>
    <div class="header-actions"><div class="languages" aria-label="Language">${Object.keys(locales).map((locale) => `<a ${locale === code ? 'aria-current="page"' : ''} href="/${locale}/">${locale.toUpperCase()}</a>`).join('')}</div>${phoneHref ? `<a class="button button-small" href="${phoneHref}">${esc(t.call)}</a>` : ''}<button class="menu-button" type="button" aria-expanded="false" aria-controls="mobile-nav" aria-label="${esc(t.menu)}"><span></span><span></span><span></span></button></div>
    <nav class="mobile-nav" id="mobile-nav" aria-label="${esc(t.menu)}"><a href="#services">${esc(t.nav[1])}</a><a href="#about">${esc(t.nav[2])}</a><a href="#contact">${esc(t.nav[3])}</a></nav>
  </div></header>
  <main id="main"><section class="hero" id="home"><img class="hero-image" src="/assets/hero.webp" width="1586" height="992" alt="" fetchpriority="high"><div class="hero-shade"></div><div class="shell hero-content"><p class="eyebrow">Imigrant Olga Kalyniak</p><h1>${esc(t.heroTitle)}</h1><p>${esc(t.heroText)}</p><div class="hero-actions">${phoneHref ? `<a class="button" href="${phoneHref}">${esc(t.call)}</a>` : ''}<a class="button button-light" href="mailto:${esc(site.email)}">${esc(t.email)}</a></div></div></section>
  <section class="section" id="services"><div class="shell"><div class="section-heading"><p class="eyebrow">Imigrant</p><h2>${esc(t.servicesTitle)}</h2><p>${esc(t.servicesIntro)}</p></div><div class="services">${t.services.map((service, index) => `<article class="service"><img src="/assets/icons/${icons[index]}" width="48" height="48" alt=""><span>${String(index + 1).padStart(2, '0')}</span><h3>${esc(service)}</h3></article>`).join('')}</div></div></section>
  <section class="section section-warm" id="about"><div class="shell about"><div class="about-photo"><img src="/assets/about.webp" width="1122" height="1402" loading="lazy" alt=""></div><div class="about-copy"><p class="eyebrow">${esc(t.aboutKicker)}</p><h2>${esc(t.aboutTitle)}</h2><p>${esc(t.aboutText)}</p><ul>${t.aboutPoints.map((point) => `<li>${esc(point)}</li>`).join('')}</ul></div></div></section>
  <section class="section contact" id="contact"><div class="shell"><div class="contact-intro"><p class="eyebrow">Imigrant Olga Kalyniak</p><h2>${esc(t.contactsTitle)}</h2><p>${esc(t.contactsText)}</p></div><div class="contact-grid">${contactDetails}</div></div></section></main>
  <footer><div class="shell footer-inner"><div><strong>Imigrant Olga Kalyniak</strong><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></div><div class="footer-languages">${Object.keys(locales).map((locale) => `<a href="/${locale}/">${locale.toUpperCase()}</a>`).join('')}</div><p>© ${new Date().getFullYear()} ${esc(site.businessName)}. ${esc(t.rights)}</p></div></footer>
  <script src="/assets/app.js" defer></script>
</body></html>`
}

await rm(dist, { recursive: true, force: true })
await mkdir(dist, { recursive: true })
await cp(path.join(root, 'public'), dist, { recursive: true })
for (const [code, t] of Object.entries(locales)) {
  await mkdir(path.join(dist, code), { recursive: true })
  await writeFile(path.join(dist, code, 'index.html'), page(code, t))
}
await writeFile(path.join(dist, 'index.html'), '<!doctype html><html lang="uk"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/uk/"><link rel="canonical" href="' + origin + '/uk/"><title>Imigrant Olga Kalyniak</title></head><body><a href="/uk/">Українська версія</a></body></html>')
await writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`)
await writeFile(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Object.keys(locales).map((code) => `<url><loc>${origin}/${code}/</loc><changefreq>monthly</changefreq><priority>${code === 'uk' ? '1.0' : '0.8'}</priority></url>`).join('')}</urlset>\n`)
console.log(`Built ${Object.keys(locales).length} locales for ${origin}`)
