module.exports = async (page, scenario, vp) => {
    console.log('SCENARIO > ' + scenario.label);

    // add more ready handlers here...
    await page.waitForFunction(() => {
      return document.fonts.ready.then(() => {
        console.log('Fonts loaded');
        return true;
      });
    });

    await page.evaluate((scenario) => {
      /** force load lazy images */
      const lazyImages = document.querySelectorAll('img[loading="lazy"]');
      lazyImages.forEach((i) => {
        i.removeAttribute('loading');
      });

      // Хак: прячем ползунок прокрутки прямо в браузере при прохождении тестов,
      // чтобы ширина viewport не съедалась на 15 пикселей.
      const style = document.createElement('style');
      style.textContent = [
        '::-webkit-scrollbar { display: none !important; width: 0 !important; }',
        'html, body { scrollbar-width: none !important; }',
      ].join('\n');
      document.head.appendChild(style);

      // PP-стабилизация: отключаем все анимации и transitions
      const animStyle = document.createElement('style');
      animStyle.textContent = [
        '*, *::before, *::after {',
        '  animation: none !important;',
        '  transition: none !important;',
        '}',
        // Scroll-reveal: финальное состояние (видимый, без смещения)
        '.reveal-init {',
        '  opacity: 1 !important;',
        '  transform: unset !important;',
        '  clip-path: none !important;',
        '  translate: none !important;',
        '}',
      ].join('\n');
      document.head.appendChild(animStyle);

      // Counter: восстанавливаем реальные значения и удаляем data-атрибут,
      // чтобы IntersectionObserver не перезапустил JS-анимацию (requestAnimationFrame)
      document.querySelectorAll('[data-counter-value]').forEach((el) => {
        const value = el.dataset.counterValue;
        const suffix = el.dataset.counterSuffix || '';
        if (value) {
          el.textContent = value + suffix;
        }
        delete el.dataset.counterValue;
      });

      // content-visibility: auto мешает BackstopJS — секции не рендерятся вовремя
      document.querySelectorAll('.price, .work, .footer').forEach((el) => {
        el.style.contentVisibility = 'visible';
      });

      // Parallax/magnetic: убираем inline translate
      document.querySelectorAll('.hero__photo, .about__card, .hero__btn').forEach((el) => {
        el.style.translate = '';
      });

      // Убираем sticky header для всех секций кроме header,
      // чтобы он не накладывался на захватываемую секцию при скролле.
      if (scenario.label !== 'header') {
        const header = document.querySelector('[data-test="header"]');
        if (header) {
          header.style.position = 'relative';
        }
      }
    }, scenario);

    // await require('./clickAndHoverHelper')(page, scenario);

    if (scenario.showSelectors) {
      await Promise.all(
        scenario.showSelectors.map(async (selector) => {
          await page
            .evaluate((sel) => {
              document.querySelectorAll(sel).forEach(s => {
                s.style.visibility = 'visible';
              });
            }, selector);
        })
      );
    }

    await page.waitForTimeout(scenario.delay || 0);
  };
