// Pixel-perfect тест: desktop (1440px) + mobile (480px)
// Секции сопоставляются по data-test="section-name" в HTML
// Референсы: bitmaps_reference/pp-reference/{section}-{viewport}.png

const desktopSections = [
  {section: 'header',    misMatchThreshold: 1.0},
  {section: 'hero',      misMatchThreshold: 1.0},
  {section: 'about',     misMatchThreshold: 1.0},
  {section: 'community', misMatchThreshold: 1.0},
  {section: 'price',     misMatchThreshold: 1.0},
  {section: 'work',      misMatchThreshold: 1.0},
  {section: 'footer',    misMatchThreshold: 1.0},
];

const mobileSections = [
  {section: 'header',    misMatchThreshold: 1.5},
  {section: 'hero',      misMatchThreshold: 1.5},
  {section: 'about',     misMatchThreshold: 1.5},
  {section: 'community', misMatchThreshold: 1.5},
  {section: 'price',     misMatchThreshold: 1.5},
  {section: 'work',      misMatchThreshold: 1.5},
  {section: 'footer',    misMatchThreshold: 1.5},
];

const VIEWPORTS = {
  'desktop': {"label": "desktop", "width": 1440, "height": 900},
  'mobile':  {"label": "mobile",  "width": 480,  "height": 900},
};

const URL = 'http://localhost:3000/index.html';

function generateScenario(section, misMatchThreshold, viewport) {
  return {
    "label": `${section}`,
    "url": URL,
    selectors: [`[data-test="${section}"]`],
    misMatchThreshold: misMatchThreshold || 1.0,
    requireSameDimensions: false,
    delay: 500,
    ...viewport ? {"viewports": [VIEWPORTS[viewport]]} : {},
  };
}

module.exports = {
  "id": "test-pp",
  "onReadyScript": "onReady.cjs",
  "onBeforeScript": "onBefore.cjs",
  "viewports": [
    {"label": "mobile",  "width": 480,  "height": 900},
    {"label": "desktop", "width": 1440, "height": 900},
  ],
  "resembleOutputOptions": {
    "ignoreAntialiasing": true,
    "errorType": "movementDifferenceIntensity",
    "transparency": 0.3,
    scaleToSameSize: false,
  },
  "scenarios": [
    ...desktopSections.map(({section, misMatchThreshold}) => generateScenario(section, misMatchThreshold, 'desktop')),
    ...mobileSections.map(({section, misMatchThreshold}) => generateScenario(section, misMatchThreshold, 'mobile')),
  ],
  fileNameTemplate: '{scenarioLabel}-{viewportLabel}',
  "paths": {
    "bitmaps_reference": "bitmaps_reference/pp-reference",
    "bitmaps_test": "backstop_data/bitmaps_test",
    "engine_scripts": "engine_scripts",
    "html_report": "backstop_data/html_report",
    "json_report": "backstop_data/json_report",
  },
  "report": ["browser", "json"],
  "engine": "puppeteer",
  "engineOptions": {
    "args": ["--no-sandbox"],
    "gotoParameters": {"waitUntil": ["load", "networkidle0"], timeout: 30000},
  },
  "asyncCaptureLimit": 10,
  "asyncCompareLimit": 50,
  "debug": false,
  "debugWindow": false,
};
