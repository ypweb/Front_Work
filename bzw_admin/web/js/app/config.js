/*应用程序初始化配置*/
(function () {
    'use strict';
    /*定义常量*/
    angular
        .module('app')
        .constant('BASE_CONFIG', {
            unique_key: 'bzw_admin_unique_key'/*系统缓存key键*/,
            info: {
                name: '布住网后台管理平台',
                version: '2.0.1',
                author: 'yp',
                datetime: moment().format('YYYY-MM-DD|HH:mm:ss'),
                keywords: '布住网后台管理平台',
                description: '布住网后台管理平台'
            },
            basedomain: 'http://10.0.5.226:8082'/*请求域名*/
            /*
             test:http://10.0.5.226:8883
             debug:http://10.0.5.222:8080
             production:http://112.74.207.132:8082
             */,
            baseproject: '/mall-buzhubms-api'/*请求工程地址*/,
            commondomain: 'http://120.76.237.100:8080',
            commonproject: '/yttx-public-api'
        });
}());

/*配置*/
(function () {
    'use strict';
    /*使用模块配置*/
    var system_app = angular
        .module('app')
        .config(initConfig);

    /*模块依赖注入*/
    initConfig.$inject = ['$controllerProvider', '$compileProvider', '$filterProvider', '$provide'];

    /*模块实现*/
    function initConfig($controllerProvider, $compileProvider, $filterProvider, $provide) {
        system_app.controller = $controllerProvider.register;
        system_app.directive = $compileProvider.directive;
        system_app.filter = $filterProvider.register;
        system_app.factory = $provide.factory;
        system_app.service = $provide.service;
        system_app.constant = $provide.constant;
        system_app.value = $provide.value;
    }
}());
