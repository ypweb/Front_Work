/**
 * 路由跳转
 */
(function () {
    'use strict';
    /*使用模块*/
    angular
        .module('app')
        .run(runConfig);

    /*注入*/
    runConfig.$inject = ['$rootScope', '$state', '$stateParams'];

    /*实现或接口*/
    function runConfig($rootScope, $state, $stateParams) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
    }
}());

/**
 * 路由跳转
 */
(function () {
    'use strict';
    /*使用模块*/
    angular
        .module('app')
        .config(routerConfig);

    /*注入*/
    routerConfig.$inject = ['$stateProvider', '$urlRouterProvider'];

    /*路由实现*/
    function routerConfig($stateProvider, $urlRouterProvider) {
        /*异常路径路由到主页*/
        $urlRouterProvider.otherwise('app');

        /*路由--登录和首页*/
        $stateProvider
        /*登录和首页*/
            .state('app', {
                url: '/app',
                templateUrl: 'view/index.html',
                controller: 'indexController',
                controllerAs: 'vm',
                resolve: {
                    /*延迟加载，依赖相关组件*/
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'js/app/index/index-service.js',
                                'js/app/index/index-controller.js'
                            ]);
                        }]
                }
            })
            /*管理模块--首页*/
            .state('admin', {
                url: '/admin',
                templateUrl: 'view/admin/admin.html',
                controller: 'adminController',
                controllerAs: 'vm',
                resolve: {
                    /*延迟加载，依赖相关组件*/
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'js/app/admin/admin-service.js',
                                'js/app/admin/admin-controller.js'
                            ]);
                        }]
                }
            })
            /*管理模块--管理员管理*/
            .state('admin.list', {
                url: '/list',
                templateUrl: 'view/admin/admin_list.html',
                controller: 'adminListController',
                controllerAs: 'vm',
                resolve: {
                    /*延迟加载，依赖相关组件*/
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'js/plugins/datatables/dataTables.bootstrap.css',
                                'js/plugins/datatables/js/jquery.dataTables.js',
                                'js/plugins/pagination/pagination.js',
                                'js/service/datatable/table.js',
                                'js/service/page/page.js',
                                'js/app/admin/admin-service.js',
                                'js/app/admin/admin-list-service.js',
                                'js/app/admin/admin-list-controller.js'
                            ]);
                        }]
                }
            })
            /*管理模块--新增管理员*/
            .state('admin.add', {
                url: '/add',
                templateUrl: 'view/admin/admin_add.html',
                controller: 'adminAddController',
                controllerAs: 'vm',
                resolve: {
                    /*延迟加载，依赖相关组件*/
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'js/app/admin/admin-service.js',
                                'js/app/admin/admin-add-service.js',
                                'js/app/admin/admin-add-controller.js'
                            ]);
                        }]
                }
            })
            /*商家模块--商家首页*/
            .state('business', {
                url: '/business',
                templateUrl: 'view/index.html',
                resolve: {
                    /*延迟加载，依赖相关组件*/
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load([]);
                        }]
                }
            })
            /*供应商模块--供应商首页*/
            .state('provider', {
                url: '/provider',
                templateUrl: 'view/provider/provider.html',
                controller: 'providerController',
                controllerAs: 'vm',
                resolve: {
                    /*延迟加载，依赖相关组件*/
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'js/app/provider/provider-service.js',
                                'js/app/provider/provider-controller.js'
                            ]);
                        }]
                }
            })
            /*供应商模块--供应商管理*/
            .state('provider.list', {
                url: '/list',
                templateUrl: 'view/provider/provider_list.html',
                controller: 'providerListController',
                controllerAs: 'vm',
                resolve: {
                    /*延迟加载，依赖相关组件*/
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'js/plugins/datatables/dataTables.bootstrap.css',
                                'js/plugins/datatables/js/jquery.dataTables.js',
                                'js/plugins/pagination/pagination.js',
                                'js/service/datatable/table.js',
                                'js/service/page/page.js',
                                'js/app/provider/provider-service.js',
                                'js/app/provider/provider-list-service.js',
                                'js/app/provider/provider-list-controller.js'
                            ]);
                        }]
                }
            })
            /*供应商模块--供应商商品列*/
            .state('provider.goods', {
                url: '/goods',
                templateUrl: 'view/provider/provider_goods.html',
                controller: 'providerGoodsController',
                controllerAs: 'vm',
                resolve: {
                    /*延迟加载，依赖相关组件*/
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'js/plugins/datatables/dataTables.bootstrap.css',
                                'js/plugins/datatables/js/jquery.dataTables.js',
                                'js/plugins/pagination/pagination.js',
                                'js/service/datatable/table.js',
                                'js/service/page/page.js',
                                'js/app/provider/provider-service.js',
                                'js/app/provider/provider-goods-service.js',
                                'js/app/provider/provider-goods-controller.js'
                            ]);
                        }]
                }
            })
            /*供应商模块--供应商审核*/
            .state('order', {
                url: '/order',
                templateUrl: 'view/index.html',
                resolve: {
                    /*延迟加载，依赖相关组件*/
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load([]);
                        }]
                }
            })
            /*商品管理*/
            .state('goods', {
                url: '/goods',
                templateUrl: 'view/index.html',
                resolve: {
                    /*延迟加载，依赖相关组件*/
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load([]);
                        }]
                }
            })
            /*用户管理*/
            .state('user', {
                url: '/user',
                templateUrl: 'view/index.html',
                resolve: {
                    /*延迟加载，依赖相关组件*/
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load([]);
                        }]
                }
            })
            /*商家商城订单*/
            .state('warehouse', {
                url: '/warehouse',
                templateUrl: 'view/index.html',
                resolve: {
                    /*延迟加载，依赖相关组件*/
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load([]);
                        }]
                }
            })
            /*财务管理*/
            .state('finance', {
                url: '/finance',
                templateUrl: 'view/index.html',
                resolve: {
                    /*延迟加载，依赖相关组件*/
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load([]);
                        }]
                }
            })
            /*分润管理*/
            .state('profit', {
                url: '/profit',
                templateUrl: 'view/index.html',
                resolve: {
                    /*延迟加载，依赖相关组件*/
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load([]);
                        }]
                }
            })
            /*统计管理*/
            .state('statistics', {
                url: '/statistics',
                templateUrl: 'view/index.html',
                resolve: {
                    /*延迟加载，依赖相关组件*/
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load([]);
                        }]
                }
            })
            /*平台管理*/
            .state('platform', {
                url: '/platform',
                templateUrl: 'view/index.html',
                resolve: {
                    /*延迟加载，依赖相关组件*/
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load([]);
                        }]
                }
            })
            /*设置管理*/
            .state('setting', {
                url: '/setting',
                templateUrl: 'view/index.html',
                resolve: {
                    /*延迟加载，依赖相关组件*/
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load([]);
                        }]
                }
            });
    }
}());