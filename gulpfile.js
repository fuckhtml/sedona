const browser = require("browser-sync").create();

const gulp = require("gulp");
const plumber = require("gulp-plumber");

const rename = require("gulp-rename");
const del = require("del");

const posthtml = require("gulp-posthtml");
const include = require("posthtml-include");
const svgstore = require("gulp-svgstore");

const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const csso = require("gulp-csso");
const sourcemaps = require("gulp-sourcemaps");

// --

const fonts = () => {
  return gulp.src("./source/fonts/**/*.{woff, woff2}", {base: "./source/fonts"})
    .pipe(gulp.dest("./build/fonts"));
}

const images = () => {
  return gulp.src([
    "!./source/images/icons/",
    "./source/images/**/*.{jpeg, jpg, png, gif, svg}"
    ], {base: "./source/images"})
    .pipe(gulp.dest("./build/images"));
}

const sprite = () => {
  return gulp.src("./source/images/icons/icon-*.svg")
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("./source/images"));
}

const html = () => {
  return gulp.src("./source/*.html")
    .pipe(posthtml([include()]))
    .pipe(gulp.dest("./build"));
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

exports.default = gulp.series(
  gulp.parallel(fonts, images),
  sprite, html, scss, sync
);