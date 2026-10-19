# Imigrant Olga Kalyniak — prelaunch

Отдельный статический информационный сайт бизнеса на украинском, польском и английском языках. Production-образ содержит только nginx и собранные HTML/CSS/JS/изображения: Node.js, база данных и исходники основного проекта в финальный образ не попадают.

## Контент и контакты

Единый источник контактных данных — `config/site.json`. Email `imigrant.legnica@gmail.com`, публичный телефон `+48 791 795 857` и город `Legnica, Polska` выводятся из этого файла. Полный адрес, часы работы, Google Maps и соцсети остаются `null`, пока клиентка не подтвердит точные значения. Перед production-публикацией номер телефона необходимо окончательно подтвердить у клиентки.

Страницы Privacy/RODO доступны по адресам `/uk/privacy/`, `/pl/privacy/` и `/en/privacy/`. Текст подготовлен для текущего статического сайта без форм, аналитики и рекламных cookies. Перед production-публикацией клиентке или её юридическому консультанту необходимо подтвердить юридическое наименование администратора, фактических технических поставщиков и окончательную редакцию политики.

## Локальный запуск

Требуется Node.js 20+ только для генерации статических файлов.

```bash
npm run build:local
npx --yes serve dist -l 8080
```

Откройте `http://localhost:8080/`. Корень ведёт на `/uk/`; также доступны `/pl/` и `/en/`.

## Production build

`SITE_ORIGIN` — единственный источник домена для canonical, hreflang, Open Graph, JSON-LD, robots.txt и sitemap.xml. Production-сборка намеренно завершается ошибкой без реального HTTPS-домена и не принимает localhost или example.com.

```bash
SITE_ORIGIN=https://real-domain.pl npm run build
docker build --build-arg SITE_ORIGIN=https://real-domain.pl -t imigrant-prelaunch .
docker run --rm -p 8080:80 imigrant-prelaunch
```

## GitHub Pages

Workflow `.github/workflows/deploy-pages.yml` собирает и публикует сайт при каждом push в `main`. `SITE_ORIGIN` и подпуть репозитория берутся из конфигурации GitHub Pages автоматически, поэтому canonical, sitemap, языковые ссылки и ресурсы работают как с адресом `https://ivank-dev.github.io/imigrant-prelaunch/`, так и с будущим custom domain.

После первого push откройте в GitHub **Settings → Pages → Build and deployment** и выберите **Source: GitHub Actions**. Затем запустите workflow **Deploy to GitHub Pages** в разделе **Actions**, если он не стартовал автоматически. Публичный адрес без custom domain: `https://ivank-dev.github.io/imigrant-prelaunch/`.

## Coolify

1. Создайте новый **Application** в Coolify. Не используйте репозиторий полного Imigrant.
2. Подключите отдельный Git-репозиторий `imigrant-prelaunch` и выберите сборку по `Dockerfile`.
3. Добавьте build argument `SITE_ORIGIN=https://ваш-реальный-домен` (без завершающего `/`). Это именно build argument, а не только runtime environment variable.
4. Назначьте основной домен приложению и включите автоматический HTTPS-сертификат.
5. Запустите deployment и убедитесь, что HTTP перенаправляется на HTTPS средствами Coolify/proxy.
6. Проверьте `/uk/`, `/pl/`, `/en/`, переключатель языков, email, `robots.txt` и `sitemap.xml`.
7. Перед привязкой Google Business Profile подтвердите, что опубликованные название, телефон, адрес и часы работы полностью совпадают с профилем компании.

## Замена полноценным приложением

Когда основной Imigrant будет готов: снимите домен с prelaunch-приложения, назначьте тот же домен основному приложению, проверьте HTTPS, языковые URL, редиректы, canonical/hreflang и индексацию. База данных или заявки из prelaunch не мигрируются — этот сайт их не собирает.

## Проверка перед публикацией

```bash
npm run build:local
node scripts/check.mjs
docker build --build-arg SITE_ORIGIN=https://real-domain.pl -t imigrant-prelaunch .
```

Переводы подготовлены как профессиональные рабочие тексты и требуют окончательного утверждения клиенткой.
