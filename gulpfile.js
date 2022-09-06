const gulp = require("gulp");
const mocha = require("gulp-mocha");

// const ts = require('gulp-typescript');

const srcVal = "test/api_test.spec.js";

const mochaOptions = {
  reporter: "list",
  timeout: 5000,
  exit: true,
};

gulp.task("local", (done) => {
  gulp.src(srcVal).pipe(mocha(mochaOptions));
  done();
});