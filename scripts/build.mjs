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
    privacyLabel: 'Політика конфіденційності / RODO', rights: 'Всі права захищені.', skip: 'Перейти до основного вмісту'
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
    privacyLabel: 'Polityka prywatności / RODO', rights: 'Wszelkie prawa zastrzeżone.', skip: 'Przejdź do głównej treści'
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
    privacyLabel: 'Privacy Policy / RODO', rights: 'All rights reserved.', skip: 'Skip to main content'
  }
}

const privacy = {
  uk: {
    title: 'Політика конфіденційності / RODO', description: 'Інформація про обробку персональних даних на сайті Imigrant Olga Kalyniak.', updated: 'Останнє оновлення: 19 жовтня 2026 року', back: 'Повернутися на головну',
    intro: 'Ця політика пояснює, як обробляються персональні дані під час користування цим сайтом та листування електронною поштою.',
    sections: [
      ['1. Адміністратор даних', [`Адміністратором персональних даних є ${site.businessName}. З питань приватності можна звертатися за адресою: ${site.email}.`]],
      ['2. Які дані ми обробляємо', ['Якщо ви пишете нам електронною поштою, ми можемо обробляти адресу email та інші дані, які ви добровільно вкажете у повідомленні, наприклад ім’я, номер телефону й інформацію про вашу справу.', 'Під час відвідування сайту сервер може автоматично записувати технічні дані: IP-адресу, дату і час запиту, адресу запитуваного ресурсу, тип браузера та інформацію про пристрій.']],
      ['3. Цілі та правові підстави', ['Дані з листування обробляються, щоб відповісти на запит і вжити заходів до укладення договору або виконати договір — стаття 6(1)(b) GDPR; а також для ведення кореспонденції та захисту від можливих претензій — законний інтерес за статтею 6(1)(f) GDPR.', 'Технічні журнали обробляються для безпеки, діагностики помилок і належної роботи сайту — законний інтерес за статтею 6(1)(f) GDPR. Дані також можуть оброблятися для виконання юридичних обов’язків — стаття 6(1)(c) GDPR.']],
      ['4. Одержувачі даних', ['Доступ до даних можуть отримувати постачальники хостингу, електронної пошти та ІТ-підтримки, а також професійні консультанти й державні органи, якщо цього вимагає закон. Вони отримують лише дані, необхідні для відповідної мети.']],
      ['5. Передача за межі ЄЕЗ', ['Деякі технологічні постачальники можуть обробляти дані за межами Європейської економічної зони. У такому разі передача здійснюється на підставі механізмів, передбачених розділом V GDPR, зокрема рішення про належний рівень захисту або стандартних договірних положень.']],
      ['6. Строк зберігання', ['Листування зберігається стільки, скільки потрібно для відповіді та ведення справи. Якщо воно пов’язане з послугою, дані можуть зберігатися до закінчення строків виконання юридичних обов’язків і позовної давності. Технічні журнали зберігаються лише протягом періоду, необхідного для безпеки й роботи сервера, відповідно до конфігурації хостингу.']],
      ['7. Ваші права', ['Ви можете вимагати доступу до своїх даних, їх виправлення, видалення або обмеження обробки, а у відповідних випадках — перенесення даних. Ви також можете заперечити проти обробки, що ґрунтується на законному інтересі.', 'Ви маєте право подати скаргу до Голови Управління захисту персональних даних Польщі (Prezes Urzędu Ochrony Danych Osobowych).']],
      ['8. Добровільність надання даних', ['Надання даних електронною поштою є добровільним, але без контактних даних та інформації, потрібної для розгляду запиту, ми можемо не мати змоги відповісти або надати послугу.']],
      ['9. Cookies та автоматизовані рішення', ['Сайт не використовує аналітичні або рекламні cookies і не містить сторонніх трекерів. Ми не приймаємо рішень виключно автоматизованим способом і не здійснюємо профілювання.']],
      ['10. Зміни політики', ['Політика може оновлюватися у разі зміни сайту, способів обробки або вимог законодавства. Актуальна версія завжди публікується на цій сторінці.']]
    ]
  },
  pl: {
    title: 'Polityka prywatności / RODO', description: 'Informacje o przetwarzaniu danych osobowych w serwisie Imigrant Olga Kalyniak.', updated: 'Ostatnia aktualizacja: 19 października 2026 r.', back: 'Wróć do strony głównej',
    intro: 'Niniejsza polityka wyjaśnia, w jaki sposób przetwarzane są dane osobowe podczas korzystania z tej strony oraz kontaktu za pośrednictwem poczty elektronicznej.',
    sections: [
      ['1. Administrator danych', [`Administratorem danych osobowych jest ${site.businessName}. W sprawach dotyczących prywatności można skontaktować się pod adresem: ${site.email}.`]],
      ['2. Jakie dane przetwarzamy', ['Jeżeli kontaktujesz się z nami pocztą elektroniczną, możemy przetwarzać Twój adres email oraz inne dane dobrowolnie podane w wiadomości, takie jak imię, numer telefonu i informacje dotyczące Twojej sprawy.', 'Podczas korzystania ze strony serwer może automatycznie zapisywać dane techniczne: adres IP, datę i czas żądania, adres żądanego zasobu, typ przeglądarki i informacje o urządzeniu.']],
      ['3. Cele i podstawy prawne', ['Dane z korespondencji przetwarzamy w celu udzielenia odpowiedzi oraz podjęcia działań przed zawarciem umowy lub wykonania umowy — art. 6 ust. 1 lit. b RODO; a także w celu prowadzenia korespondencji i ochrony przed ewentualnymi roszczeniami — prawnie uzasadniony interes z art. 6 ust. 1 lit. f RODO.', 'Logi techniczne przetwarzamy w celu zapewnienia bezpieczeństwa, diagnozowania błędów i prawidłowego działania strony — art. 6 ust. 1 lit. f RODO. Dane mogą być również przetwarzane w celu wykonania obowiązków prawnych — art. 6 ust. 1 lit. c RODO.']],
      ['4. Odbiorcy danych', ['Dane mogą być udostępniane dostawcom hostingu, poczty elektronicznej i wsparcia IT, a także profesjonalnym doradcom i organom publicznym, gdy wymaga tego prawo. Odbiorcy otrzymują wyłącznie dane niezbędne do realizacji danego celu.']],
      ['5. Przekazywanie poza EOG', ['Niektórzy dostawcy technologiczni mogą przetwarzać dane poza Europejskim Obszarem Gospodarczym. W takim przypadku przekazanie odbywa się na podstawie mechanizmów przewidzianych w rozdziale V RODO, w szczególności decyzji stwierdzającej odpowiedni stopień ochrony lub standardowych klauzul umownych.']],
      ['6. Okres przechowywania', ['Korespondencję przechowujemy przez czas potrzebny do udzielenia odpowiedzi i prowadzenia sprawy. Jeżeli dotyczy ona usługi, dane mogą być przechowywane do upływu terminów wynikających z obowiązków prawnych i przedawnienia roszczeń. Logi techniczne są przechowywane wyłącznie przez okres niezbędny do zapewnienia bezpieczeństwa i działania serwera, zgodnie z konfiguracją hostingu.']],
      ['7. Twoje prawa', ['Możesz żądać dostępu do danych, ich sprostowania, usunięcia lub ograniczenia przetwarzania, a w odpowiednich przypadkach także przeniesienia danych. Możesz również wnieść sprzeciw wobec przetwarzania opartego na prawnie uzasadnionym interesie.', 'Masz prawo wnieść skargę do Prezesa Urzędu Ochrony Danych Osobowych.']],
      ['8. Dobrowolność podania danych', ['Podanie danych w wiadomości email jest dobrowolne, jednak bez danych kontaktowych i informacji niezbędnych do rozpatrzenia zapytania możemy nie być w stanie odpowiedzieć lub świadczyć usługi.']],
      ['9. Cookies i decyzje automatyczne', ['Strona nie używa analitycznych ani reklamowych plików cookies i nie zawiera zewnętrznych trackerów. Nie podejmujemy decyzji wyłącznie w sposób zautomatyzowany i nie profilujemy użytkowników.']],
      ['10. Zmiany polityki', ['Polityka może być aktualizowana w przypadku zmian strony, sposobów przetwarzania lub wymogów prawa. Aktualna wersja jest zawsze publikowana na tej stronie.']]
    ]
  },
  en: {
    title: 'Privacy Policy / RODO', description: 'Information about personal data processing on the Imigrant Olga Kalyniak website.', updated: 'Last updated: 19 October 2026', back: 'Return to the home page',
    intro: 'This policy explains how personal data is processed when you use this website or contact us by email.',
    sections: [
      ['1. Data controller', [`The controller of your personal data is ${site.businessName}. For privacy matters, contact us at: ${site.email}.`]],
      ['2. Data we process', ['If you contact us by email, we may process your email address and other information you voluntarily include in your message, such as your name, telephone number, and details of your matter.', 'When you visit the website, the server may automatically record technical data including your IP address, request date and time, requested resource, browser type, and device information.']],
      ['3. Purposes and legal bases', ['Correspondence data is processed to respond to your enquiry and take steps before entering into a contract or to perform a contract — Article 6(1)(b) GDPR; and to manage correspondence and protect against potential claims — legitimate interests under Article 6(1)(f) GDPR.', 'Technical logs are processed for security, error diagnosis, and the proper operation of the website — Article 6(1)(f) GDPR. Data may also be processed to comply with legal obligations — Article 6(1)(c) GDPR.']],
      ['4. Recipients', ['Data may be shared with hosting, email, and IT support providers, as well as professional advisers and public authorities where required by law. Recipients receive only the data necessary for the relevant purpose.']],
      ['5. Transfers outside the EEA', ['Some technology providers may process data outside the European Economic Area. In such cases, transfers rely on mechanisms provided by Chapter V GDPR, including an adequacy decision or standard contractual clauses.']],
      ['6. Retention', ['Correspondence is retained for as long as necessary to respond and handle the matter. Where it concerns a service, data may be retained until legal retention duties and limitation periods for claims expire. Technical logs are retained only for the period necessary for server security and operation, in line with the hosting configuration.']],
      ['7. Your rights', ['You may request access to, rectification or erasure of your data, restriction of processing and, where applicable, data portability. You may also object to processing based on legitimate interests.', 'You have the right to lodge a complaint with the President of the Polish Personal Data Protection Office (Prezes Urzędu Ochrony Danych Osobowych).']],
      ['8. Voluntary provision of data', ['Providing data by email is voluntary. Without contact details and information necessary to consider your enquiry, however, we may be unable to respond or provide a service.']],
      ['9. Cookies and automated decisions', ['The website does not use analytics or advertising cookies and contains no third-party trackers. We do not make decisions based solely on automated processing and do not profile users.']],
      ['10. Policy changes', ['This policy may be updated when the website, processing activities, or legal requirements change. The current version is always published on this page.']]
    ]
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
  <footer><div class="shell footer-inner"><div><strong>Imigrant Olga Kalyniak</strong><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></div><div class="footer-links"><a href="/${code}/privacy/">${esc(t.privacyLabel)}</a><div class="footer-languages">${Object.keys(locales).map((locale) => `<a href="/${locale}/">${locale.toUpperCase()}</a>`).join('')}</div></div><p>© ${new Date().getFullYear()} ${esc(site.businessName)}. ${esc(t.rights)}</p></div></footer>
  <script src="/assets/app.js" defer></script>
</body></html>`
}

function privacyPage(code, t, policy) {
  const url = `${origin}/${code}/privacy/`
  const alternates = Object.keys(locales).map((locale) => `<link rel="alternate" hreflang="${locale}" href="${origin}/${locale}/privacy/">`).join('\n    ')
  const content = policy.sections.map(([heading, paragraphs]) => `<section><h2>${esc(heading)}</h2>${paragraphs.map((paragraph, index) => {
    const linked = heading.startsWith('7.') && index === paragraphs.length - 1
    return `<p>${esc(paragraph)}${linked ? ` <a href="https://uodo.gov.pl/" rel="noopener noreferrer">uodo.gov.pl</a>` : ''}</p>`
  }).join('')}</section>`).join('')

  return `<!doctype html>
<html lang="${t.lang}"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(policy.title)} | ${esc(site.businessName)}</title><meta name="description" content="${esc(policy.description)}">
  <meta name="robots" content="index,follow"><link rel="canonical" href="${url}">${alternates}
  <link rel="alternate" hreflang="x-default" href="${origin}/uk/privacy/">
  <meta property="og:type" content="website"><meta property="og:site_name" content="${esc(site.businessName)}"><meta property="og:title" content="${esc(policy.title)}"><meta property="og:description" content="${esc(policy.description)}"><meta property="og:url" content="${url}">
  <meta name="theme-color" content="#fb3d0a"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/styles.css"><link rel="stylesheet" href="/assets/privacy.css">
</head><body class="privacy-page">
  <a class="skip-link" href="#main">${esc(t.skip)}</a>
  <header class="privacy-header"><div class="shell privacy-header-inner"><a class="brand" href="/${code}/" aria-label="${esc(site.businessName)}"><img src="/assets/logo.png" width="683" height="666" alt=""><span>Imigrant<small>Olga Kalyniak</small></span></a><div class="languages" aria-label="Language">${Object.keys(locales).map((locale) => `<a ${locale === code ? 'aria-current="page"' : ''} href="/${locale}/privacy/">${locale.toUpperCase()}</a>`).join('')}</div></div></header>
  <main class="privacy-main shell" id="main"><a class="privacy-back" href="/${code}/">← ${esc(policy.back)}</a><article class="privacy-article"><p class="eyebrow">RODO / GDPR</p><h1>${esc(policy.title)}</h1><p class="privacy-updated">${esc(policy.updated)}</p><p class="privacy-intro">${esc(policy.intro)}</p>${content}<aside><strong>${esc(t.emailLabel)}:</strong> <a href="mailto:${esc(site.email)}">${esc(site.email)}</a></aside></article></main>
  <footer><div class="shell footer-inner"><div><strong>Imigrant Olga Kalyniak</strong><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></div><div class="footer-languages">${Object.keys(locales).map((locale) => `<a href="/${locale}/privacy/">${locale.toUpperCase()}</a>`).join('')}</div><p>© ${new Date().getFullYear()} ${esc(site.businessName)}. ${esc(t.rights)}</p></div></footer>
</body></html>`
}

await rm(dist, { recursive: true, force: true })
await mkdir(dist, { recursive: true })
await cp(path.join(root, 'public'), dist, { recursive: true })
for (const [code, t] of Object.entries(locales)) {
  await mkdir(path.join(dist, code), { recursive: true })
  await writeFile(path.join(dist, code, 'index.html'), page(code, t))
  await mkdir(path.join(dist, code, 'privacy'), { recursive: true })
  await writeFile(path.join(dist, code, 'privacy', 'index.html'), privacyPage(code, t, privacy[code]))
}
await writeFile(path.join(dist, 'index.html'), '<!doctype html><html lang="uk"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/uk/"><link rel="canonical" href="' + origin + '/uk/"><title>Imigrant Olga Kalyniak</title></head><body><a href="/uk/">Українська версія</a></body></html>')
await writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`)
await writeFile(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Object.keys(locales).flatMap((code) => [`<url><loc>${origin}/${code}/</loc><changefreq>monthly</changefreq><priority>${code === 'uk' ? '1.0' : '0.8'}</priority></url>`, `<url><loc>${origin}/${code}/privacy/</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>`]).join('')}</urlset>\n`)
console.log(`Built ${Object.keys(locales).length} locales for ${origin}`)
