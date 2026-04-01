# Spreent Academy

Вёрстка главной страницы сервиса-агрегатора по подбору образовательных курсов.
Конкурсная работа — [Чемпионат по вёрстке HTML Academy #3](https://up.htmlacademy.ru/olympics/4).

---

## Демо

- 🔗 **Vercel**: _ссылка появится после деплоя_
- 📁 **GitHub**: [spreent-academy-frontend](https://github.com/OlgaGulyakevich/spreent-academy-frontend) — готовый ZIP-архив во вкладке **Actions**

---

## Стек

- **HTML5** — семантическая разметка, BEM-методология
- **SCSS** — Desktop-first, Fluid Layout (`clamp()`), компонентная архитектура
- **Vanilla JS** — ES Modules, без фреймворков
- **Vite** — сборка и dev-сервер
- **Node.js**: v22.x

---

## Быстрый старт

```bash
npm install
npm run dev      # dev-сервер → localhost:3000
npm run build    # production-сборка → dist/
npm run preview  # предпросмотр сборки
```

---

## Качество кода

```bash
npm run lint          # все линтеры последовательно
npm run linthtml      # структура HTML
npm run html-validate # семантика HTML
npm run stylelint     # SCSS
npm run lint-js       # JavaScript (ESLint)
npm run lint-bem      # BEM-дерево
npm run w3c           # W3C валидация
```

---

## Особенности реализации

- **Fluid Layout** — плавное масштабирование 480px → 1440px через `clamp()`, минимальная ширина 320px, выше 1440px контент центрируется
- **SVG-спрайт** — автосборка иконок через `@spiriit/vite-plugin-svg-spritemap`
- **WebP + retina** — все растровые изображения в 1x/2x + WebP
- **CSS-анимации** — clip-path reveal заголовков, параллакс, вращение логотипа по скроллу
- **Доступность** — семантика, ARIA, focus-visible, keyboard navigation