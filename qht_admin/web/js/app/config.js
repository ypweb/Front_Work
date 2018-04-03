/*应用程序初始化配置*/
var app = angular.module('app')
  /*.config(
    ['$controllerProvider', '$compileProvider', '$filterProvider', '$provide',
    function ($controllerProvider,   $compileProvider,   $filterProvider,   $provide) {
        
        // lazy controller, directive and service
        app.controller = $controllerProvider.register;
        app.directive  = $compileProvider.directive;
        app.filter     = $filterProvider.register;
        app.factory    = $provide.factory;
        app.service    = $provide.service;
        app.constant   = $provide.constant;
        app.value      = $provide.value;
    }
  ])*/
  /*.config(['$translateProvider', function($translateProvider){
    /!*注册加载静态模块，根据地址价值不同的模块*!/
    $translateProvider.useStaticFilesLoader({
      prefix: 'l10n/',
      suffix: '.js'
    });
    //设置模块默认语言
    $translateProvider.preferredLanguage('en');
    //设置模块语言本地化
    $translateProvider.useLocalStorage();
  }])*/;