/*应用程序初始化配置*/
var system_app = angular.module('app')
    .constant('BASE_CONFIG', {
        unique_key: 'fc_admin_unique_key'/*系统缓存key键*/,
        basedomain: 'http://10.0.5.226:8883'/*请求域名*/
        /*
         test:http://10.0.5.226:8883
         debug:http://10.0.5.222:8080
         */,
        debug: false/*调试模式开关*/,
        baseproject: '/bms-bzwfc-api'/*请求工程地址*/,
        submenulimit: 6/*系统允许递归嵌套菜单最大层级*/,
        commondomain: 'http://120.76.237.100:8080',
        commonproject: '/yttx-public-api'
    })
    .config(['$controllerProvider', '$compileProvider', '$filterProvider', '$provide',
        function ($controllerProvider, $compileProvider, $filterProvider, $provide) {
            system_app.controller = $controllerProvider.register;
            system_app.directive = $compileProvider.directive;
            system_app.filter = $filterProvider.register;
            system_app.factory = $provide.factory;
            system_app.service = $provide.service;
            system_app.constant = $provide.constant;
            system_app.value = $provide.value;
        }
    ]);