import bemlinter from 'gulp-html-bemlinter';
import vfs from 'vinyl-fs';

vfs
  .src(['./source/**/*.html', '!./source/**/vendor/*.html'])
  .pipe(bemlinter())
  .on('end', () => process.exit(0))
  .on('error', () => process.exit(1));
