/*应用程序初始化配置*/
var yy_app = angular.module('app')
    .constant('BASE_CONFIG', {
        unique_key: 'yy_admin_unique_key'/*系统缓存key键*/,
        basedomain: 'http://10.0.5.226:8882'/*请求域名*/
        /*
         test:http://10.0.5.226:8882
         debug:http://10.0.5.222:8080
         production:http://112.74.207.132:8082
         */,
        debug: false/*调试模式开关*/,
        baseproject: '/bms-bzwyys-api'/*请求工程地址*/,
        loadingdom: 'struct_layout_loading'/*加载动画id值*/,
        nologindom: 'struct_layout_nologin'/*没有登录系统id值*/,
        nologintipdom: 'struct_goto_login'/*没有登录系统提示id值*/,
        loginoutdom: 'struct_layout_loginout'/*退出系统id值*/,
        submenulimit: 6/*系统允许递归嵌套菜单最大层级*/,
        commondomain: 'http://120.76.237.100:8080'/*公用接口请求域名*/,
        /*
         test:http://120.76.237.100:8080
         production:http://112.74.207.132:8088
         */
        commonproject: '/yttx-public-api'/*公用接口请求工程地址*/
    })
    .config(['$controllerProvider', '$compileProvider', '$filterProvider', '$provide',
        function ($controllerProvider, $compileProvider, $filterProvider, $provide) {
            yy_app.controller = $controllerProvider.register;
            yy_app.directive = $compileProvider.directive;
            yy_app.filter = $filterProvider.register;
            yy_app.factory = $provide.factory;
            yy_app.service = $provide.service;
            yy_app.constant = $provide.constant;
            yy_app.value = $provide.value;
        }
    ]);