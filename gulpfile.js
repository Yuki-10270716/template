const { watch, src, dest, parallel, lastRun } = require("gulp");
const notify  = require("gulp-notify");
const plumber = require("gulp-plumber");
const pug = require("gulp-pug");
const sass = require("gulp-sass");
const sassGlob = require("gulp-sass-glob");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const mmq = require("gulp-merge-media-queries");
const uglify = require("gulp-uglify-es").default;
const imagemin = require("gulp-imagemin");
const imageminMozjpeg = require("imagemin-mozjpeg");
const imageminPngquant = require("imagemin-pngquant");
const imageminGifsicle = require("imagemin-gifsicle");
const imageminSvgo = require("imagemin-svgo");
const browserSync = require("browser-sync");

const paths = {
  "root"    : "./dist/",
  "htmlSrc" : "./src/pug/",
  "cssSrc"  : "./src/scss/**/*.scss",
  "cssDist" : "./dist/css/",
  "jsSrc"   : "./src/js/**/*.js",
  "jsDist"  : "./dist/js/",
  "imageSrc" : "./src/image/*.{jpg,png,gif,svg}",
  "imageDist" : "./dist/image/"
}

function css() {
  return src(paths.cssSrc)
    .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
    .pipe(sassGlob())
    .pipe(sass({outputStyle: "compressed"}))
    .pipe(postcss([
      autoprefixer({
        browsers: ["last 2 versions", "ie >= 11", "Android >= 4"],
        cascade: false
      })
    ]))
    .pipe(mmq())
    .pipe(dest(paths.cssDist))
    .pipe(
      browserSync.reload({
        stream: true,
        once: true
      })
    );
}

function html() {
  return src([paths.htmlSrc + '**/*.pug', '!' + paths.htmlSrc + '**/_*.pug'])
    .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
    .pipe(pug({
      pretty: true
    }))
    .pipe(dest(paths.root))
    .pipe(
      browserSync.reload({
        stream: true,
        once: true
      })
    );
}

function js() {
  return src(paths.jsSrc)
    .pipe(plumber())
    .pipe(uglify())
    .pipe(dest(paths.jsDist))
    .pipe(
      browserSync.reload({
        stream: true,
        once: true
      })
    );
};

function img() {
  return src(paths.imageSrc, { since: lastRun(img) })
    .pipe(imagemin(
      [
        imageminMozjpeg({quality: 80}),
        imageminPngquant({quality: [0.65, 0.8]}),
        imageminGifsicle(),
        imageminSvgo()
      ]
    ))
    .pipe(dest(paths.imageDist))
    .pipe(
      browserSync.reload({
        stream: true,
        once: true
      })
    );
}

function bs() {
  browserSync.init({
    server: {
        baseDir: paths.root
    },
    port: 8080
  });
}

exports.html = html;
exports.css = css;
exports.js = js;
exports.img = img;
exports.bs = bs;

exports.default = parallel([html, css, js, img, bs], () => {
    watch([paths.htmlSrc], html);
    watch([paths.cssSrc], css);
    watch([paths.jsSrc], js);
    watch([paths.imageSrc], img);
});