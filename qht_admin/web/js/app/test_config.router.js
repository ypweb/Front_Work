'use strict';

/**
 * 路由跳转
 */
angular.module('app')
    .run(['$rootScope','$state','$stateParams',function ($rootScope,$state,$stateParams) {
         $rootScope.$state = $state;
         $rootScope.$stateParams = $stateParams;
        /*// config
        var cache=toolUtil.getParams(unique_key),
            config,
            islogin=false,
            logininfo;
        if(cache){
            /!*存在缓存则更新缓存*!/
            this.isLogin=cache.loginMap.isLogin;
        }else{
            /!*不存在缓存则创建缓存*!/
            config={
                cache:{},
                routeMap:{
                    prev:'',
                    current:''
                },
                menuMap:{},
                powerMap:{},
                loginMap:{},
                settingMap:{}
            };
            islogin=loginService.isLogin();
            logininfo=loginService.getLoginInfo();
            this.isLogin=islogin;
            if(islogin){
                config['loginMap']={
                    'isLogin':true,
                    'datetime':moment().format('YYYY-MM-DD|HH:mm:ss'),
                    'reqdomain':logininfo.basedomain,
                    'currentdomain':'',
                    'username':logininfo.username,
                    'param':logininfo.param
                }
            }
        }*/
     }]).config(['$stateProvider', '$urlRouterProvider',
        function ($stateProvider, $urlRouterProvider) {
            /*异常路径路由到主页*/
            $urlRouterProvider.otherwise('app');

            /*路由*/
            $stateProvider
                .state('app', {
                    url: '/app',
                    views:{
                        'container':{
                            templateUrl: 'tpl/index.html'
                        },
                        'support':{
                            templateUrl: 'tpl/common/support_tip.html'
                        },
                        'login':{
                            templateUrl: 'tpl/login.html'
                        },
                        'loading':{
                            templateUrl: 'tpl/common/load.html'
                        },
                        'nologin':{
                            templateUrl: 'tpl/common/support_login.html'
                        }
                    },
                    resolve: {
                        /*延迟加载，依赖相关组件*/
                        loadMyCtrl: ['$ocLazyLoad',
                            function ($ocLazyLoad) {
                                return $ocLazyLoad.load(['js/app/module/index/index_controller.js']);
                            }]
                    }
                })
                //机构
                .state('struct', {
                    url: '/struct',
                    views:{
                        'container':{
                            templateUrl:'tpl/struct.html'
                        },
                        'support':{
                            templateUrl: 'tpl/common/support_tip.html'
                        },
                        'login':{
                            templateUrl: 'tpl/login.html'
                        },
                        'loading':{
                            templateUrl: 'tpl/common/load.html'
                        },
                        'nologin':{
                            templateUrl: 'tpl/common/support_login.html'
                        }
                    },
                    resolve: {
                            /*延迟加载，依赖相关组件*/
                            deps: ['$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(['js/plugins/datatables/dataTables.bootstrap.css',
                                        'js/plugins/datatables/js/jquery.dataTables.js',
                                        'js/plugins/pagination/pagination.js',
                                        'js/app/services/datatable/datatable_column_service.js',
                                        'js/app/services/datatable/datatable_checkall_service.js',
                                        'js/app/services/datatable/datatable_itemaction_service.js',
                                        'js/app/module/struct/struct_service.js',
                                        'js/app/module/struct/struct_controller.js']);
                            }]
                     }
                })
                //机构下面的角色
                .state('role', {
                    url: '/struct.role',
                    views:{
                        'container':{
                            templateUrl:'tpl/struct_role.html'
                        },
                        'support':{
                            templateUrl: 'tpl/common/support_tip.html'
                        },
                        'login':{
                            templateUrl: 'tpl/login.html'
                        },
                        'loading':{
                            templateUrl: 'tpl/common/load.html'
                        },
                        'nologin':{
                            templateUrl: 'tpl/common/support_login.html'
                        }
                    },
                    resolve: {
                        /*延迟加载，依赖相关组件*/
                        deps: ['$ocLazyLoad',
                            function ($ocLazyLoad) {
                                return $ocLazyLoad.load(['js/plugins/datatables/dataTables.bootstrap.css',
                                    'js/plugins/datatables/js/jquery.dataTables.js',
                                    'js/plugins/pagination/pagination.js',
                                    'js/app/services/datatable/datatable_column_service.js',
                                    'js/app/services/datatable/datatable_checkall_service.js',
                                    'js/app/module/struct_role/struct_role_service.js',
                                    'js/app/module/struct_role/struct_role_controller.js']);
                            }]
                    }
                })
                //订单管理
                .state('order', {
                    url: '/order',
                    views:{
                        'container':{
                            templateUrl:'tpl/order.html'
                        },
                        'support':{
                            templateUrl: 'tpl/common/support_tip.html'
                        },
                        'login':{
                            templateUrl: 'tpl/login.html'
                        },
                        'loading':{
                            templateUrl: 'tpl/common/load.html'
                        },
                        'nologin':{
                            templateUrl: 'tpl/common/support_login.html'
                        }
                    },
                    resolve: {
                        /*延迟加载，依赖相关组件*/
                        deps: ['$ocLazyLoad',
                            function ($ocLazyLoad) {
                                return $ocLazyLoad.load(['js/plugins/datatables/dataTables.bootstrap.css',
                                    'js/plugins/datatables/js/jquery.dataTables.js',
                                    'js/plugins/pagination/pagination.js',
                                    'js/app/services/datatable/datatable_column_service.js',
                                    'js/app/services/datatable/datatable_checkall_service.js',
                                    'js/app/services/datatable/datatable_itemaction_service.js',
                                    'js/plugins/My97DatePicker/WdatePicker.js',
                                    'js/app/services/datepick97/datepicker97_service.js',
                                    'js/app/module/order/order_service.js',
                                    'js/app/module/order/order_controller.js']);
                            }]
                    }
                })
                //财务管理
                .state('finance', {
                    url: '/finance',
                    views:{
                        'container':{
                            templateUrl:'tpl/finance.html'
                        },
                        'support':{
                            templateUrl: 'tpl/common/support_tip.html'
                        },
                        'login':{
                            templateUrl: 'tpl/login.html'
                        },
                        'loading':{
                            templateUrl: 'tpl/common/load.html'
                        },
                        'nologin':{
                            templateUrl: 'tpl/common/support_login.html'
                        }
                    },
                    resolve: {
                        /*延迟加载，依赖相关组件*/
                        deps: ['$ocLazyLoad',
                            function ($ocLazyLoad) {
                                return $ocLazyLoad.load(['js/plugins/datatables/dataTables.bootstrap.css',
                                    'js/plugins/datatables/js/jquery.dataTables.js',
                                    'js/plugins/pagination/pagination.js',
                                    'js/app/services/datatable/datatable_column_service.js',
                                    'js/app/services/datatable/datatable_checkall_service.js',
                                    'js/app/services/datatable/datatable_itemaction_service.js',
                                    'js/plugins/My97DatePicker/WdatePicker.js',
                                    'js/app/services/datepick97/datepicker97_service.js',
                                    'js/app/module/finance/finance_service.js',
                                    'js/app/module/finance/finance_controller.js']);
                            }]
                    }
                })
                //设备管理
                .state('equipment', {
                    url: '/equipment',
                    views:{
                        'container':{
                            templateUrl:'tpl/equipment.html'
                        },
                        'support':{
                            templateUrl: 'tpl/common/support_tip.html'
                        },
                        'login':{
                            templateUrl: 'tpl/login.html'
                        },
                        'loading':{
                            templateUrl: 'tpl/common/load.html'
                        },
                        'nologin':{
                            templateUrl: 'tpl/common/support_login.html'
                        }
                    },
                    resolve: {
                        /*延迟加载，依赖相关组件*/
                        deps: ['$ocLazyLoad',
                            function ($ocLazyLoad) {
                                return $ocLazyLoad.load(['js/plugins/datatables/dataTables.bootstrap.css',
                                    'js/plugins/datatables/js/jquery.dataTables.js',
                                    'js/plugins/pagination/pagination.js',
                                    'js/app/services/datatable/datatable_column_service.js',
                                    'js/app/services/datatable/datatable_checkall_service.js',
                                    'js/app/services/datatable/datatable_itemaction_service.js',
                                    'js/plugins/My97DatePicker/WdatePicker.js',
                                    'js/app/services/datepick97/datepicker97_service.js',
                                    'js/app/module/equipment/equipment_service.js',
                                    'js/app/module/equipment/equipment_controller.js']);
                            }]
                    }
                })
                //设置
                .state('setting', {
                    url: '/setting',
                    views:{
                        'container':{
                            templateUrl:'tpl/setting.html'
                        },
                        'support':{
                            templateUrl: 'tpl/common/support_tip.html'
                        },
                        'login':{
                            templateUrl: 'tpl/login.html'
                        },
                        'loading':{
                            templateUrl: 'tpl/common/load.html'
                        },
                        'nologin':{
                            templateUrl: 'tpl/common/support_login.html'
                        }
                    },
                    resolve: {
                        /*延迟加载，依赖相关组件*/
                        deps: ['$ocLazyLoad',
                            function ($ocLazyLoad) {
                                return $ocLazyLoad.load(['js/app/module/setting/setting_service.js',
                                    'js/app/module/setting/setting_controller.js']);
                            }]
                    }
                })
        }
    ]
);