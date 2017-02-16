'use strict';

const gulp = require('gulp');
const ts = require('gulp-typescript');
const shell = require("gulp-shell");
const sequence = require('gulp-sequence');
const sourcemaps = require('gulp-sourcemaps');
const mocha = require('gulp-mocha');
const tslint = require('gulp-tslint');
const gulpFilter = require('gulp-filter');
const merge = require('merge2');
const env = require('gulp-env');
const tryStream = require('stream-try-catch').try;

const path = require('path');
const del = require('del');
const argv = require('yargs').argv;


// Configuration

const tsProject = ts.createProject('./tsconfig.json', { typescript : require('typescript') });
const tsCompilerOptions = tsProject.config.compilerOptions;

const config = {
    buildDir: tsCompilerOptions.outDir,
    watchFiles: [
        '**/*.ts',
        '!node_modules/**/*',
        '!typings*/**/*',
        '!build/**/*',
    ],
    typingsFiles: 'typings/main/**/*.d.ts',
    configFiles: 'config/**/*'
};


// Development tasks

gulp.task('tslint', function () {
    return tsProject.src()
        .pipe(gulpFilter(['**/*', '!typings/**/*']))
        .pipe(tslint())
        .pipe(tslint.report('prose', {
            emitError: true
        }));
});

gulp.task('typescript', function () {
    let tsResult = tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(ts(tsProject));

    if (tsCompilerOptions.inlineSourceMap || tsCompilerOptions.sourceMap) {
        tsResult = tsResult.pipe(sourcemaps.write({
            sourceRoot: function (file) {
                return null;
            } }));
    }

    tsResult.pipe(gulp.dest(config.buildDir));

    return tsResult;
});

gulp.task('copy-configs', function () {
    return gulp.src([config.configFiles], { base: './' })
        .pipe(gulp.dest(config.buildDir + 'configuration-api'))
        .pipe(gulp.dest(config.buildDir + 'ingest-shell'))
        .pipe(gulp.dest(config.buildDir + 'mapping-api'))
        .pipe(gulp.dest(config.buildDir + 'integration-tests'));
});

gulp.task('build', function (cb) {
    // sequence('tslint', 'typescript', 'copy-configs')(cb);
     sequence('typescript', 'copy-configs')(cb);
});

gulp.task('clean', function (cb) {
    del([config.buildDir]).then(x => cb());
});

gulp.task('clean-build', function (cb) {
    sequence('clean', 'build')(cb);
});


// Watching tasks

gulp.task('watch', function (cb) {
    sequence('clean-build', 'watch-all')(cb);
});

gulp.task('watch-ts-build', function () {
    gulp.watch(config.watchFiles, function () {
        sequence('typescript', 'tslint')();
    });
});

gulp.task('watch-ts', function () {
    gulp.watch(config.watchFiles, ['typescript']);
});

gulp.task('watch-config', function () {
    gulp.watch(config.configFiles, ['copy-configs']);
});

gulp.task('watch-all', ['watch-ts', 'watch-config'], function () {
});


// Testing tasks

function getMochaConfig(isIntegration) {
    let isDebug = process.env.IS_DEBUG === "true";
    let isBamboo = process.env.NODE_ENV && process.env.NODE_ENV.trim() === "bamboo";

    let config = {};
    if (isBamboo) {
        config.reporter = "mocha-bamboo-reporter";
        if (isIntegration) {
            config.reporterOptions = {
                output: './integration-tests-report.json'
            }
        } else {
            config.reporterOptions = {
                output: './unit-tests-report.json'
            }
        }
    }
    if (isDebug) {
        config.timeout = 1000 * 60 * 60;
    } else {
        config.timeout = 1000 * 30;
    }

    return config;
}

gulp.task('prepare-environment', () => {
    let logger = require(config.buildDir + 'utils/initializeLogger');
    logger.initializeLogger('integration-tests');
    var prepareEnvironment = require(config.buildDir + 'utils/prepareEnvironment').default;
    var core = require(config.buildDir + 'core');
    var database = require(config.buildDir + 'core').generalDatabase;

    return prepareEnvironment(true, true)
        .then(() => database.close())
        .catch(() => database.close());
});

gulp.task('copy-fixtures', function () {
    return gulp.src(['integration-tests/**/fixtures/**/*'], { base: './' })
        .pipe(gulp.dest(config.buildDir));
});

gulp.task('unit-tests', () => {
    const testName = argv.test || '*';
    return gulp.src(config.buildDir + 'unit-tests/**/' + testName + '.js', { read: false })
        .pipe(mocha(getMochaConfig(false)));
});

gulp.task('integration-tests', ['copy-fixtures'], () => {
    const testName = argv.test || '*';
    let mochaConfig = getMochaConfig(true);

    let envs = env.set({
        NODE_ENV: "integration_tests"
    });

    let database = require(config.buildDir + 'core/repositories/generalDatabase').generalDatabase;
    let logger = require(config.buildDir + 'utils/initializeLogger');
    logger.initializeLogger('integration-tests');

    return gulp.src(config.buildDir + 'integration-tests/**/' + testName + '.js', { read: false })
        .pipe(envs)
        .pipe(mocha(mochaConfig))
        .pipe(envs.reset)
        .once('end', () => {
            database.close();
        });
});
