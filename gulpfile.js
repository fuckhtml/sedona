const browser = require("browser-sync").create();

const gulp = require("gulp");
const plumber = require("gulp-plumber");

const rename = require("gulp-rename");
const clean = require("gulp-clean");

const posthtml = require("gulp-posthtml");
const include = require("posthtml-include");
const svgstore = require("gulp-svgstore");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");

const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const csso = require("gulp-csso");
const sourcemaps = require("gulp-sourcemaps");

// --

const cleanup = () => {
  return gulp.src("./build/**/*", {read: false})
    .pipe(clean());
}

const fonts = () => {
  return gulp.src("./source/fonts/**/*.{woff,woff2}", {base: "./source/fonts"})
    .pipe(gulp.dest("./build/fonts"));
}

const html = () => {
  return gulp.src("./source/*.html")
    .pipe(posthtml([include()]))
    .pipe(gulp.dest("./build"));
}

const compressimages = () => {
  return gulp.src("./source/images/**/*", {base: "./source/images"})
    .pipe(imagemin())
    .pipe(gulp.dest("./source/images"))
    .pipe(webp())
    .pipe(gulp.dest("./source/images"));
}

const convertwebp = () => {
  return gulp.src("./source/images/**/*", {base: "./source/images"})
    .pipe(webp())
    .pipe(gulp.dest("./source/images-compressed"));  
}

const sprite = () => {
  return gulp.src("./source/images/icons/icon-*.svg")
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("./source/images"));
}

const copyimages = () => {
  return gulp.src([
    "./source/images/**/*",
    "!./source/images/icons/**/*",
    ], {base: "./source/images"})
    .pipe(gulp.dest("./build/images"))
}

const scss = () => {
  return gulp.src("./source/scss/main.scss")
    .pipe(plumber())
    .pipe(sourcemaps.init())

    .pipe(sass())
    .pipe(autoprefixer("last 3 versions"))
    .pipe(gulp.dest("./build/css"))
    .pipe(csso())
    .pipe(sourcemaps.write("."))
    .pipe(rename("main.min.css"))
    .pipe(gulp.dest("./build/css"))

    .pipe(browser.stream());
}

const sync = (done) => {
  browser.init({
    server: {
      baseDir: "./build"
    }
  })

  gulp.watch("./source/fonts/**.*", gulp.series(fonts, browser.reload));
  gulp.watch("./source/images/**/*", gulp.series(images, browser.reload));
  gulp.watch("./source/images/icons/icon-*.svg", gulp.series(sprite, html, browser.reload));
  gulp.watch("./source/scss/**/*.scss", gulp.series(scss));
  gulp.watch("./source/*.html").on("change", gulp.series(html, browser.reload));

  done();
}

const images = gulp.series(compressimages, convertwebp, sprite, copyimages);
exports.images = images;

const build = gulp.series(cleanup, gulp.parallel(fonts, images), html, scss);
exports.build = build;

exports.default = gulp.series(build, sync);
