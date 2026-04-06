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
