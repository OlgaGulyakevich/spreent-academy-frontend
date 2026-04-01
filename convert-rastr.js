import sharp from 'sharp';
import { globSync } from 'glob';
import cliProgress from 'cli-progress';
import fs from 'fs';

const QUALITY = 85;

const getBase = (file) => file.substring(0, file.lastIndexOf('.'));
const getExt = (file) => file.split('.').pop();

// @2x files → generate @1x + @1x.webp + @2x.webp
const files2x = globSync('source/**/*@2x.{png,jpg,jpeg}');

// @1x files that have no @2x counterpart → generate webp only
const files1xOnly = globSync('source/**/*@1x.{png,jpg,jpeg}').filter((f) => {
  const counterpart = f.replace('@1x.', '@2x.');
  return !fs.existsSync(counterpart);
});

// Regular files (no @1x/@2x suffix) → generate webp only
const filesRegular = globSync('source/**/*.{png,jpg,jpeg}').filter(
  (f) => !f.includes('@1x.') && !f.includes('@2x.')
);

const totalOps = files2x.length * 3 + files1xOnly.length + filesRegular.length;
const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
bar.start(totalOps, 0);

const work = [
  // @2x → @1x original + @1x.webp + @2x.webp
  ...files2x.map(async (file) => {
    const base2x = getBase(file);
    const base1x = base2x.replace('@2x', '@1x');
    const ext = getExt(file);
    const { width, height } = await sharp(file).metadata();
    const w = Math.round(width / 2);
    const h = Math.round(height / 2);

    // @1x original (half size)
    if (ext === 'png') {
      await sharp(file).resize(w, h).png().toFile(`${base1x}.png`);
    } else {
      await sharp(file).resize(w, h).jpeg({ quality: QUALITY }).toFile(`${base1x}.jpg`);
    }
    bar.increment();

    // @1x webp
    await sharp(file).resize(w, h).webp({ quality: QUALITY }).toFile(`${base1x}.webp`);
    bar.increment();

    // @2x webp
    await sharp(file).webp({ quality: QUALITY }).toFile(`${base2x}.webp`);
    bar.increment();
  }),

  // @1x without @2x counterpart → webp only
  ...files1xOnly.map(async (file) => {
    await sharp(file).webp({ quality: QUALITY }).toFile(`${getBase(file)}.webp`);
    bar.increment();
  }),

  // Regular files → webp only
  ...filesRegular.map(async (file) => {
    await sharp(file).webp({ quality: QUALITY }).toFile(`${getBase(file)}.webp`);
    bar.increment();
  }),
];

Promise.all(work).then(() => bar.stop());
