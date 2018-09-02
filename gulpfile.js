/*gulpfile配置文件*/

(function () {
    var gulp = require('gulp');
    var concat = require('gulp-concat');
    var header = require('gulp-header');
    var connect = require("gulp-connect");
    var less = require("gulp-less");
    var autoprefixer = require('gulp-autoprefixer');
    var ejs = require("gulp-ejs");
    var uglify = require('gulp-uglify');
    var ext_replace = require('gulp-ext-replace');
    var cssmin = require('gulp-cssmin');

    var pkg = require("./package_gulp_zwwx.json");

    var banner =
        '/*!\n' +
        '版本:' + pkg.version + ';\n' +
        '日期:' + (new Date()).toLocaleDateString() + ';\n' +
        '描述:' + pkg.description + ';\n' +
        '作者:' + pkg.author + ';\n*/\n';


    /*js资源加载构建任务*/
    var src_js = pkg.project + '/' + pkg.js_src,
        temp_js = pkg.project + '/' + pkg.js_temp,
        dist_js = pkg.project + '/' + pkg.js_dest;

    gulp.task('js', function (cb) {

        count = 0;
        var end = function () {
            count++;
            if (count >= 3) cb();
        };

        gulp.src([
            src_js + 'city-data.js',
            src_js + 'city-picker.js'
        ])
            .pipe(concat({path: 'city-picker.js'}))
            .pipe(gulp.dest(temp_js))
            .on("end", end);

        /* './src/js/city-data.js',
           './src/js/city-picker.js'
           */

        gulp.src([
            src_js + 'swiper.jquery.js',
            src_js + 'swiper-wrap.js',
            src_js + 'photos.js'
        ])
            .pipe(concat({path: 'swiper.js'}))
            .pipe(gulp.dest(temp_js))
            .on("end", end);


        /*'./src/js/swiper.jquery.js',
            './src/js/swiper-wrap.js',
            './src/js/photos.js'*/

        var weui_src_js = ['jquery-extend.js', 'template7.js', 'hammer.js', 'modal.js', 'toast.js', 'action.js', 'pull-to-refresh.js', 'infinite.js', 'tab.js', 'search-bar.js', 'device.js', 'picker.js', 'select.js',
            'calendar.js', 'datetime-picker.js', 'popup.js', 'notification.js', 'toptip.js', 'slider.js', 'swipeout.js'
        ];

        gulp.src(
            (function () {
                var i = 0,
                    len = weui_src_js.length,
                    temp_arr = weui_src_js.slice(0);
                for (i; i < len; i++) {
                    temp_arr.push(src_js + temp_arr[i]);
                }
                return temp_arr;
            }())
        )
            .pipe(concat('city-picker.js'))
            .pipe(concat({path: 'jquery-weui.js'}))

            .pipe(header(banner))
            .pipe(gulp.dest(temp_js))
            .on("end", end);

        /*'./src/js/jquery-extend.js',
            './src/js/template7.js',
            './src/js/hammer.js',
            './src/js/modal.js',
            './src/js/toast.js',
            './src/js/action.js',
            './src/js/pull-to-refresh.js',
            './src/js/infinite.js',
            './src/js/tab.js',
            './src/js/search-bar.js',
            './src/js/device.js',
            './src/js/picker.js',
            './src/js/select.js',
            './src/js/calendar.js',
            './src/js/datetime-picker.js',
            './src/js/popup.js',
            './src/js/notification.js',
            './src/js/toptip.js',
            './src/js/slider.js',
            './src/js/swipeout.js'*/

    });

    /*js加载，压缩任务*/
    gulp.task('uglify', ["js"], function () {
        /*[temp_js + '/*.js']*/
        return gulp.src([temp_js + '/jquery-weui.js'])
            .pipe(concat(pkg.js_minname+'.js'))
            .pipe(uglify({
                preserveComments: "license"
            }))
            .pipe(gulp.dest(dist_js + '/'));
    });


    /*less编译任务*/
    gulp.task('less', function () {
        return gulp.src([pkg.project + '/' + pkg.less_src + pkg.less_name + '.less'])
            .pipe(less())
            /*.pipe(autoprefixer())*/
            .pipe(header(banner))
            .pipe(gulp.dest(pkg.project + '/' + pkg.less_dest));
    });

    /*less编译，压缩任务*/
    gulp.task('cssmin', ["less"], function () {
        gulp.src([pkg.project + '/' + pkg.less_dest + '/' + pkg.less_name + '*.css'])
            .pipe(cssmin())
            .pipe(gulp.dest(pkg.project + '/' + pkg.less_dest));
    });


    /*ejs任务*/
    /*gulp.task('ejs', function () {
        return gulp.src(["./demos/!*.html", "!./demos/_*.html"])
            .pipe(ejs({}))
            .pipe(gulp.dest("./dist/demos/"));
    });*/


    /*拷贝任务*/
    /*gulp.task('copy', function () {
        gulp.src(['./src/lib/!**!/!*'])
            .pipe(gulp.dest('./dist/lib/'));

        gulp.src(['./demos/images/!*.*'])
            .pipe(gulp.dest('./dist/demos/images/'));

        gulp.src(['./demos/css/!*.css'])
            .pipe(gulp.dest('./dist/demos/css/'));
    });*/


    /*监控任务*/
    gulp.task('watch', function () {
        gulp.watch(pkg.project + '/' + pkg.less_src + '**/*.less', ['less']);
    });

    /*监控任务--其他任务*/
    /*gulp.watch('src/js/!**!/!*.js', ['js']);*/
    /*gulp.watch('demos/!*.html', ['ejs']);
      gulp.watch('demos/css/!*.css', ['copy']);*/


    /*启动浏览器任务*/
    /*gulp.task('server', function () {
        connect.server();
    });*/

    /*开启默认任务：监控，服务*/
    /*gulp.task("default", ['watch', 'server']);*/

    /*构建项目任务*/
    /*gulp.task("build", ['uglify', 'cssmin', 'copy', 'ejs']);*/


    /*自定义默认任务1*/
    /*gulp.task("default", ['watch','less','cssmin']);*/
    /*自定义默认任务2*/
    gulp.task("default", ['js', 'uglify']);
})();
