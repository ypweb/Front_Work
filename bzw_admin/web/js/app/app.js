(function () {
    'use strict';
    /*定义app模块，并指明其相关依赖*/
    angular.module('app', [
        'ngAnimate',
        'ngSanitize',
        'ngRoute'/*基本路由*/,
        'ui.router'/*多视图路由*/,
        'oc.lazyLoad'/*懒加载*/,
        'tool'/*工具类*/,
        'assist'/*辅助类*/,
        'view'/*指令类*/,
        'login'/*登录服务*/,
        'power'/*权限服务*/,
        'test'/*测试服务*/
    ]);
}());
