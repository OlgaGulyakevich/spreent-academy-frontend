module.exports = {
  extends: [
    "stylelint-config-standard-scss",
    "stylelint-config-htmlacademy",
  ],
  plugins: ["stylelint-selector-bem-pattern"],
  rules: {
    "plugin/selector-bem-pattern": {
      preset: "bem",
      implicitComponents: "blocks/*.scss",
      implicitUtilities: "global/utils.scss",
    },
    "selector-class-pattern": [
      "^[a-z]([-]?[a-z0-9]+)*(__[a-z0-9]([-]?[a-z0-9]+)*)?(--[a-z0-9]([-]?[a-z0-9]+)*)?$",
      {
        resolveNestedSelectors: true,
        message: function expected(selectorValue) {
        return `Expected class selector "${selectorValue}" to match BEM CSS pattern https://en.bem.info/methodology/css. Selector validation tool: https://regexr.com/3apms`;
      },
      },
    ],
    "selector-max-id": 0,
    "selector-disallowed-list": [
      "/^&_/",
      "/^&-(?:\\w)/",
      "/^&\\s*[>+~]?\\s*\\.?\\w/",
    ],
    "selector-no-qualifying-type": true,
    "alpha-value-notation": null,
    "scss/at-import-no-partial-leading-underscore": null,
    "scss/load-no-partial-leading-underscore": true,
    "declaration-block-no-redundant-longhand-properties": null,
    "max-nesting-depth": [1, {
      ignore: ["blockless-at-rules", "pseudo-classes"],
      ignoreAtRules: ["include", "media"]
    }],
    "declaration-property-value-disallowed-list": null,
    "declaration-empty-line-before": [
      "always",
      {
        except: ["first-nested"],
        ignore: [
          "after-comment",
          "inside-single-line-block",
          "after-declaration",
          "after-comment"
        ],
      },
    ],
    // Разрешаем использование современных функций Sass модулей
    "function-no-unknown": [
      true,
      {
        ignoreFunctions: ["adjust", "color.adjust", "scale", "color.scale", "fluid-val-value", "min", "max"]
      }
    ],
    "at-rule-no-unknown": null,
    "scss/at-rule-no-unknown": true,
    // Внутри math-функций голый 0 — это <number>, а не <length>: смешение типов
    // делает весь clamp()/calc() невалидным, и браузер молча отбрасывает свойство.
    // Без ignoreFunctions правило при --fix срезало px у нуля и ломало формулы
    // (кейс: translateX(clamp(-113px, …, 0)) — фото hero стояло без интерполяции).
    "length-zero-no-unit": [
      true,
      {
        ignore: ["custom-properties"],
        ignoreFunctions: ["clamp", "calc", "min", "max", "fluid-val-value"]
      }
    ]
  },
};
