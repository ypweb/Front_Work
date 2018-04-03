/*gruntfile配置文件*/

module.exports = function (grunt) {

    /*配置文件*/
    var configfile = 'package_bzw.json';

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON(configfile),
        banner: ''/*'/!*!\n' +
         '项目工程:<%= pkg.project %>;\n' +
         '工程名称:<%= pkg.name %>;\n' +
         '版本:<%= pkg.version %>;\n' +
         '日期:<%= grunt.template.today("yyyy-mm-dd") %>;\n' +
         '版权:* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;\n' +
         '授权:<%= pkg.license %> *!/\n'*/,
        //css语法检查
        csslint: {
            //检查生成的css文件目录文件
            options: {
                csslintrc: '.csslintrc'
            },
            src:'<%= pkg.projcet%>/<%= pkg.less_dest%>/<%= pkg.less_name%>.css'
        },
        //定义js语法检查（看配置信息）
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            //检查源目录文件和生成目录文件
            all: '<%= pkg.projcet%>/<%= pkg.js_src%>/*.js'
        },
        //定义css图片压缩输出（一次性任务）
        imagemin: {
            dynamic: {
                options: {
                    optimizationLevel: 3
                },
                files: [{
                    expand: true,//开启动态扩展
                    cwd: '<%= pkg.projcet%>/<%= pkg.image_src%>',//当前工作路径img
                    src: ['<%= pkg.image_minname%>.{png,jpg,gif,jpeg}'],//要处理的图片格式
                    dest: '<%= pkg.projcet%>/<%= pkg.image_dest %>'//输出目录images
                }]
            }

        },
        //定义css图片拼合
        sprite: {
            all: {
                src: '<%= pkg.projcet%>/<%= pkg.image_src%>/*.<%= pkg.image_spritetype%>',
                dest: '<%= pkg.projcet%>/<%= pkg.image_dest%>/<%= pkg.image_spritename%>.<%= pkg.image_spritetype%>',
                destCss: '<%= pkg.projcet%>/<%= pkg.less_dest%>/<%= pkg.image_spritename%>.css'
            }
        },
        //less编译生成css
        less: {
            build: {
                src: '<%= pkg.projcet%>/<%= pkg.less_src%>/<%=pkg.less_name %>.less',
                dest: '<%= pkg.projcet%>/<%= pkg.less_dest%>/<%= pkg.less_name %>.css'
            },
            dev: {
                options: {
                    compress: true,
                    yuicompress: false
                }
            }
        },
        //使用less时为定义css压缩。（没有使用less时为合并（一次性任务））
        cssmin: {
            options: {
                keepSpecialComments: 0, /* 移除 CSS文件中的所有注释 */
                shorthandCompacting: false,
                roundingPrecision: -1
            },
            target: {
                files: [{
                    expand: true,//开启动态扩展
                    cwd: '<%= pkg.projcet%>/<%= pkg.less_dest%>',//当前工作路径css/
                    src: ['*.css'],
                    dest: '<%= pkg.projcet%>/<%= pkg.less_dest%>',
                    ext: '.css'//后缀名
                }]
            }
        },
        //定义合并js任务（情况比较少）,暂时不做css合并
        concat: {
            options: {
                stripBanners: true,
                separator: ';',//分割符
                banner: '<%= banner %>'
            },
            dist: {
                //源目录 to do,合并文件时需要看情况而定
                /*var names=['zepto','event','ajax','form','ie','detect','fx','fx_methods','assets','data','deferred','callbacks','selector','touch','gesture','stack','ios3'];*/
                /* //压缩zepto var names=['zepto','event','touch','callbacks','ajax','form','selector','fx','fx_methods','assets','data','deferred','detect','gesture','ios3','stack','ie'];*/
                //压缩后台js
                /*names=['bootstrap','tweenmax','resizeable','joinable','api','toggles','toastr','dialog']*/
                /*names=['html5shiv','respond']*/
                /*names=['bootstrap','dialog']*/
                /*names=['bootstrap','tweenmax','resizeable','joinable','api','toggles','toastr','dialog','moment']*/
                /*var names = ['bootstrap', 'toastr', 'dialog', 'moment'];*/
                src: (function () {
                    //压缩zepto
                    var names = ['batch_item', 'datepick', 'moneyFilter', 'simulation_batch'],
                        result = [],
                        path = '<%= pkg.projcet%>/<%= pkg.js_src%>/';
                    for (var i = 0, len = names.length; i < len; i++) {
                        result.push(path + names[i] + '.js');
                    }
                    return result;
                }()),
                //生成目录
                dest: '<%= pkg.projcet%>/<%= pkg.js_src%>/<%= pkg.js_minname%>.js'
            }
        },
        //定义js压缩任务uglify
        uglify: {
            options: {
                //生成版权，名称，描述等信息
                stripBanners: true,
                banner: '<%= banner %>'
            },
            build: {
                src: '<%= pkg.projcet%>/<%= pkg.js_src%>/<%= pkg.js_minname%>.js',
                dest: '<%= pkg.projcet%>/<%= pkg.js_dest%>/<%= pkg.js_minname%>.min.js'
            }
        },
        //定义监控文件变化
        watch: {
            less: {
                files: ['<%= pkg.projcet%>/<%= pkg.less_src %>/**/*.less'],
                tasks: ['less', 'cssmin'],
                options: {
                    spawn: false,
                    debounceDelay: 250,
                    //配置自动刷新程序
                    livereload: true
                }
            }/*,
             scripts: {
             files: '<%= pkg.projcet%>/<%= pkg.js_dest%>/<%= pkg.less_name%>.js',
             tasks: ['uglify'],
             options: {
             spawn: false,
             debounceDelay: 250,
             //配置自动刷新程序
             livereload: true
             }
             }*/
        }
    });


    //导入任务所需的依赖支持服务
    /*可用任务*/
    //grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-concat');
    //grunt.loadNpmTasks('grunt-contrib-imagemin');
    //grunt.loadNpmTasks('grunt-spritesmith');
    //grunt.loadNpmTasks('grunt-contrib-livereload');

    /*常用任务*/
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');


    //集成单个模块任务
    /*grunt.registerTask('default', "拼合图片", function () {
     grunt.task.run(['sprite']);
     });*/

    /*grunt.registerTask('default', "压缩图片", function () {
     grunt.task.run(['imagemin']);
     });*/


    /*grunt.registerTask('default', "合并js", function () {
     grunt.task.run(['concat']);
     });*/


    /*grunt.registerTask('default', "js压缩", function () {
        grunt.task.run(['uglify']);
    });*/


    /*grunt.registerTask('default', "合并压缩js", function () {
     grunt.task.run(['concat', 'uglify']);
     });*/


    /*grunt.registerTask('default', "less编译生成css", function () {
     grunt.task.run(['less']);
     });*/


    /*grunt.registerTask('default', "less编译生成css并压缩", function () {
     grunt.task.run(['less', 'cssmin']);
     });*/


    grunt.registerTask('default', "less编译生成css并压缩,同时实时监控", function () {
        grunt.task.run(['less', 'cssmin', 'watch:less']);
    });

};
