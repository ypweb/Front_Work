/*延迟加载*/
angular.module('app')
    /*加载jquery插件*/
  .constant('JQ_CONFIG', {
          /*base:['../js/base/base.js'],*/
          /*表格插件*/
          dataTables:['../js/plugins/datatables/js/jquery.dataTables.js','../js/plugins/datatables/dataTables.bootstrap.css'],
          /*分页插件*/
          pagination:['../js/plugins/pagination/pagination.js'],
          /*表单验证插件*/
          jqValidate:['../js/plugins/jquery-validate/jquery.validate.js'],
          /*单个日历插件*/
          datePicker:['../js/plugins/datepicker/datepicker.js'],
          /*范围日历插件*/
          dateRangePicker:['../js/plugins/daterangepicker/daterangepicker.js','../js/plugins/daterangepicker/daterangepicker-bs3.css'],
          /*文本编辑插件*/
          kindEditor:['../js/plugins/kindeditor/kindeditor-all-min.js','../js/plugins/kindeditor/themes/default/default.css'],
          /*图表插件*/
          highCharts:['../js/plugins/highcharts/highcharts.js'],
          /*上传插件*/
          plUpload:['../js/plugins/plupload/plupload.full.min.js','../js/plugins/plupload/i18n/zh_CN.js'],
          /*七牛上传服务插件*/
          qnUploadServer:['../jjs/plugins/qn/qiniu.min.js']
      }
  )
  //延迟加载
  /*.config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
      $ocLazyLoadProvider.config({
          debug:  false,
          events: true,
          modules: [
              {
                  name: 'ngGrid',
                  files: [
                      'vendor/modules/ng-grid/ng-grid.min.js',
                      'vendor/modules/ng-grid/ng-grid.min.css',
                      'vendor/modules/ng-grid/theme.css'
                  ]
              },
              {
                  name: 'ui.select',
                  files: [
                      'vendor/modules/angular-ui-select/select.min.js',
                      'vendor/modules/angular-ui-select/select.min.css'
                  ]
              },
              {
                  name:'angularFileUpload',
                  files: [
                    'vendor/modules/angular-file-upload/angular-file-upload.min.js'
                  ]
              },
              {
                  name:'ui.calendar',
                  files: ['vendor/modules/angular-ui-calendar/calendar.js']
              },
              {
                  name: 'ngImgCrop',
                  files: [
                      'vendor/modules/ngImgCrop/ng-img-crop.js',
                      'vendor/modules/ngImgCrop/ng-img-crop.css'
                  ]
              },
              {
                  name: 'angularBootstrapNavTree',
                  files: [
                      'vendor/modules/angular-bootstrap-nav-tree/abn_tree_directive.js',
                      'vendor/modules/angular-bootstrap-nav-tree/abn_tree.css'
                  ]
              },
              {
                  name: 'toaster',
                  files: [
                      'vendor/modules/angularjs-toaster/toaster.js',
                      'vendor/modules/angularjs-toaster/toaster.css'
                  ]
              },
              {
                  name: 'textAngular',
                  files: [
                      'vendor/modules/textAngular/textAngular-sanitize.min.js',
                      'vendor/modules/textAngular/textAngular.min.js'
                  ]
              },
              {
                  name: 'vr.directives.slider',
                  files: [
                      'vendor/modules/angular-slider/angular-slider.min.js',
                      'vendor/modules/angular-slider/angular-slider.css'
                  ]
              },
              {
                  name: 'com.2fdevs.videogular',
                  files: [
                      'vendor/modules/videogular/videogular.min.js'
                  ]
              },
              {
                  name: 'com.2fdevs.videogular.plugins.controls',
                  files: [
                      'vendor/modules/videogular/plugins/controls.min.js'
                  ]
              },
              {
                  name: 'com.2fdevs.videogular.plugins.buffering',
                  files: [
                      'vendor/modules/videogular/plugins/buffering.min.js'
                  ]
              },
              {
                  name: 'com.2fdevs.videogular.plugins.overlayplay',
                  files: [
                      'vendor/modules/videogular/plugins/overlay-play.min.js'
                  ]
              },
              {
                  name: 'com.2fdevs.videogular.plugins.poster',
                  files: [
                      'vendor/modules/videogular/plugins/poster.min.js'
                  ]
              },
              {
                  name: 'com.2fdevs.videogular.plugins.imaads',
                  files: [
                      'vendor/modules/videogular/plugins/ima-ads.min.js'
                  ]
              }
          ]
      });
  }])*/
;