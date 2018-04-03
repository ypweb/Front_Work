/*应用程序初始化配置*/
var qht_app=angular.module('app')
        .constant('BASE_CONFIG',{
        unique_key:'qht_admin_unique_key',
        basedomain:'http://10.0.5.226:8080'
        /*
            test:http://10.0.5.226:8080
            debug:http://10.0.5.222:8080
        */,
        debug:false,
        baseproject:'/qht-bms-api',
        loadingdom:'struct_layout_loading',
        nologindom:'struct_layout_nologin',
        nologintipdom:'struct_goto_login',
        loginoutdom:'struct_layout_loginout',
        submenulimit:6
    })
    .config(['$controllerProvider', '$compileProvider', '$filterProvider', '$provide',
        function ($controllerProvider,   $compileProvider,   $filterProvider,   $provide) {
            qht_app.controller = $controllerProvider.register;
            qht_app.directive  = $compileProvider.directive;
            qht_app.filter     = $filterProvider.register;
            qht_app.factory    = $provide.factory;
            qht_app.service    = $provide.service;
            qht_app.constant   = $provide.constant;
            qht_app.value      = $provide.value;
        }
    ])
    .factory('httpInterceptor',['BASE_CONFIG','$httpParamSerializerJQLike',function (BASE_CONFIG,$httpParamSerializerJQLike) {
    /*var http_config={};

    /!*请求配置*!/
    http_config.request=function (config) {
        var url=config.url,
            set=config.set;

        /!*需要转换的*!/
        if(set){
            var headers=config.headers,
                data=config.data;
            /!*配置url*!/
            if(typeof url!=='undefined'){
                config.url=BASE_CONFIG.basedomain + BASE_CONFIG.baseproject + url;
            }
            /!*设置头信息*!/
            if(typeof headers!=='undefined'){
                headers['Content-Type']="application/x-www-form-urlencoded";
            }else{
                config['headers']={ "Content-Type": "application/x-www-form-urlencoded" };
            }
            /!*转换参数*!/
            if(typeof data!=='undefined'&&data){
                config.data=$httpParamSerializerJQLike(data);
            }
            /!*清除需要配置项*!/
            delete config.set;
            return config;
        }
    };
    return http_config*/;
}])/*.config(['$httpProvider',function($httpProvider) {
    $httpProvider.interceptors.push('httpInterceptor');
}])*/;

/*

test:
10.0.5.226:8080

debug:
10.0.5.222:8080

*/