# Spreent Academy

Верстка главной страницы сервиса-агрегатора по подбору образовательных курсов.
Конкурсная работа — [Чемпионат по верстке HTML Academy #3](https://up.htmlacademy.ru/olympics/4).

**Демо**: [spreent-academy-frontend.vercel.app](https://spreent-academy-frontend.vercel.app/)

---

## Стек

HTML5 | SCSS (BEM) | Vanilla JS (ES Modules) | Vite | Node.js 22

---

## Быстрый старт

```bash
npm install
npm run start        # dev-сервер на localhost:3000
npm run build        # production-сборка -> dist/
npm run preview      # предпросмотр сборки
```

---

## Pixel Perfect тесты

Проект покрыт автоматическими PP-тестами через **BackstopJS**. Каждая из 7 секций тестируется на двух viewport: **480px** (mobile) и **1440px** (desktop).

```bash
# dev-сервер должен быть запущен
npm run test
```

Референсные скриншоты — `source/bitmaps_reference/`. Секции таргетируются через `data-test` атрибуты. Допуск: 0.15% misMatchThreshold.

---

## Качество кода

```bash
npm run lint          # все линтеры последовательно
npm run linthtml      # структура HTML
npm run html-validate # семантика HTML
npm run stylelint     # SCSS
npm run lint-js       # ESLint
npm run lint-bem      # BEM-дерево
npm run w3c           # W3C HTML валидация
```

Все линтеры проходят с **0 ошибок**. Lighthouse: **90+** по всем категориям (desktop).

---

## Особенности реализации

### Fluid Layout

Плавное масштабирование 480px - 1440px через `clamp()`. Минимальная ширина 320px, выше 1440px контент центрируется. Собственные инструменты `fluid-val($property, $min, $max)` и функция `fluid-val-value` обеспечивают плавное масштабирование размеров, отступов и типографики без промежуточных брейкпоинтов.

### Интерактивные состояния (hover, focus, active, disabled)

По ТЗ состояния **не отрисованы в макете** — реализованы самостоятельно:

- **Кнопки**: затемнение фона + цветная тень на hover, `scale(0.95)` на active, полупрозрачность + `pointer-events: none` для disabled
- **Ссылки навигации**: underline sweep слева направо через `::after` (`scaleX 0 -> 1`)
- **Логотип**: Paint Fill & Reveal — эффект «заливки» букв через CSS `mask-image` + gradient sweep + `drop-shadow` glow
- **Бургер**: морфинг collapse & bloom (схлопывание `scaleY(0)` -> появление крестика с rotate), цветовая семантика (синий на hover в закрытом, красный — в открытом)
- **Header**: frosted glass при скролле — `backdrop-filter: blur(20px)` + полупрозрачный фон, scroll progress bar через CSS-переменную `--scroll-progress`
- **focus-visible**: 2px solid accent outline на всех интерактивных элементах
- **Hover** только через `@media (hover: hover)` — touch-устройства не затрагиваются

### CSS-геометрия без изображений

- **Community аватары**: overlapping через CSS custom properties (`--avatar-size`, `--ring`, `--overlap`) + прозрачное кольцо через `mask-image: radial-gradient(...)` — показывает градиент контейнера сквозь аватар
- **About Skills UI-мокап**: декоративная композиция на карточке «Практические навыки» (круг, glass-прямоугольник, cursor-плашки) — полностью на CSS. Рамки с corner handles через 12 слоев `background-image`, glass-эффект через `backdrop-filter` + gradient overlay
- **About карточки**: нахлест через CSS Grid с отрицательным `margin-left`, высота карточек адаптируется при увеличении текста с сохранением отступов (допзадание ТЗ)

### Анимации

По ТЗ: вращение круга в About,parallax в About, каскад сертификата (`clip-path` + `scale` reveal), анимация заголовка при скролле в Price.

Дополнительно реализовано:

- **Hero parallax**: scroll + mousemove, три фото с разной скоростью, lerp-сглаживание
- **Scroll reveal**: заголовки H2 секций «выезжают» снизу через `translateY` + `opacity` при входе в viewport
- **Counter count-up**: 78% и 89% анимируются от 0 с easeOutCubic + stagger
- **Work logo glow**: волна `box-shadow: inset` пробегает по ячейкам с шагом 0.8s, цикл 9s
- **Magnetic button**: CTA в Hero тянется за курсором (радиус 100px, смещение до 15px)
- **Hero entry**: h1, текст и кнопка появляются с `translateY` + stagger при загрузке
- **Community gradient-spin**: вращающаяся обводка кнопки Join через `conic-gradient` + `@property` (desktop)

Все анимации отключаются при `prefers-reduced-motion: reduce`.

### Валидация формы

Кастомная валидация:

- **Телефон**: маска `+7 (000) 000-00-00` через [imask](https://imask.js.org/) (единственная внешняя зависимость), автоподстановка +7, валидация по количеству цифр
- **Email**: смена placeholder на `example@domain.com` при фокусе, pattern-валидация
- **Ошибки**: inline-сообщения под каждым полем с анимацией появления, красная рамка `.is-invalid`
- **Отправка**: `fetch` + `FormData`, уведомления об успехе/ошибке с автоскрытием через 5с
- **Smooth scroll**: кастомная анимация с `easeInOutQuart`, учет фиксированного хедера и открытого мобильного меню

### Прочее

- **SVG-спрайт**: автосборка через `@spiriit/vite-plugin-svg-spritemap`
- **WebP + retina**: все растровые изображения в 1x/2x + WebP через `<picture>`
- **Доступность**: семантическая разметка, ARIA, focus trap в мобильном меню, keyboard navigation, `aria-live` на уведомлениях
- **Кроссбраузерность**: Chrome, Firefox, Safari — `-webkit-backdrop-filter`, vendor prefixes
- **content-visibility**: `auto` на тяжелых секциях (price, work, footer) для ускорения первой отрисовки
