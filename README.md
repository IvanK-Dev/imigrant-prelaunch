# Imigrant Olga Kalyniak — prelaunch

Отдельный статический информационный сайт бизнеса на украинском, польском и английском языках. Production-образ содержит только nginx и собранные HTML/CSS/JS/изображения: Node.js, база данных и исходники основного проекта в финальный образ не попадают.

## Контент и контакты

Единый источник контактных данных — `config/site.json`. Email `imigrant.legnica@gmail.com` утверждён в ТЗ и проверяется сборщиком. Телефон, адрес, часы работы, Google Maps и соцсети остаются `null`, пока клиентка не подтвердит точные значения. После подтверждения заполните только этот файл и пересоберите сайт.

Тексты Privacy/RODO не опубликованы: в основном проекте найдены лишь временные заглушки, а не согласованный юридический текст. Перед публикацией такой страницы нужен утверждённый текст для каждой локали.

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
