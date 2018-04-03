'use strict';

/**
 * 路由跳转
 */
angular.module('app')
    .run(['$rootScope', '$state', '$stateParams', function ($rootScope, $state, $stateParams) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
    }]).config(['$stateProvider', '$urlRouterProvider',
        function ($stateProvider, $urlRouterProvider) {
            /*异常路径路由到主页*/
            $urlRouterProvider.otherwise('app');

            /*路由*/
            $stateProvider
                .state('app', {
                    url: '/app',
                    templateUrl: 'tpl/index.html',
                    resolve: {
                        /*延迟加载，依赖相关组件*/
                        deps: ['$ocLazyLoad',
                            function ($ocLazyLoad) {
                                return $ocLazyLoad.load(['js/app/directives/index.js', 'js/app/module/index/index_controller.js']);
                            }]
                    }
                })
                .state('organization', {
                    url: '/organization',
                    templateUrl: 'tpl/organization.html',
                    resolve: {
                        /*延迟加载，依赖相关组件*/
                        deps: ['$ocLazyLoad',
                            function ($ocLazyLoad) {
                                return $ocLazyLoad.load(['js/plugins/pagination/pagination.js',
                                    'js/plugins/CustomScrollbar/customScrollbar.concat.min.js',
                                    'js/app/services/address/address_service.js', 'js/app/module/organization/organization_service.js', 'js/app/module/organization/organization_controller.js']);
                            }]
                    }
                })
                .state('role', {
                    url: '/role',
                    templateUrl: 'tpl/organization_role.html',
                    resolve: {
                        /*延迟加载，依赖相关组件*/
                        deps: ['$ocLazyLoad',
                            function ($ocLazyLoad) {
                                return $ocLazyLoad.load(['js/plugins/datatables/dataTables.bootstrap.css',
                                    'js/plugins/datatables/js/jquery.dataTables.js',
                                    'js/plugins/pagination/pagination.js',
                                    'js/plugins/CustomScrollbar/customScrollbar.concat.min.js',
                                    'js/app/services/datatable/datatable_column_service.js',
                                    'js/app/services/datatable/datatable_checkall_service.js',
                                    'js/app/services/address/address_service.js',
                                    'js/app/module/organization_role/organization_role_service.js',
                                    'js/app/module/organization_role/organization_role_controller.js']);
                            }]
                    }
                })
                //订单管理
                .state('order', {
                    url: '/order',
                    templateUrl: 'tpl/order.html',
                    resolve: {
                        /*延迟加载，依赖相关组件*/
                        deps: ['$ocLazyLoad',
                            function ($ocLazyLoad) {
                                return $ocLazyLoad.load(['js/plugins/datatables/dataTables.bootstrap.css',
                                    'js/plugins/datatables/js/jquery.dataTables.js',
                                    'js/plugins/pagination/pagination.js',
                                    'js/plugins/CustomScrollbar/customScrollbar.concat.min.js',
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
                //发货管理
                .state('invoice', {
                    url: '/invoice',
                    templateUrl: 'tpl/invoice.html',
                    resolve: {
                        /*延迟加载，依赖相关组件*/
                        deps: ['$ocLazyLoad',
                            function ($ocLazyLoad) {
                                return $ocLazyLoad.load(['js/plugins/datatables/dataTables.bootstrap.css',
                                    'js/plugins/datatables/js/jquery.dataTables.js',
                                    'js/plugins/pagination/pagination.js',
                                    'js/plugins/CustomScrollbar/customScrollbar.concat.min.js',
                                    'js/app/services/datatable/datatable_column_service.js',
                                    'js/app/services/datatable/datatable_itemaction_service.js',
                                    'js/plugins/My97DatePicker/WdatePicker.js',
                                    'js/app/services/datepick97/datepicker97_service.js',
                                    'js/app/module/invoice/invoice_service.js',
                                    'js/app/module/invoice/invoice_controller.js']);
                            }]
                    }
                })
                //采购管理
                .state('purchase', {
                    url: '/purchase',
                    templateUrl: 'tpl/purchase.html',
                    resolve: {
                        /*延迟加载，依赖相关组件*/
                        deps: ['$ocLazyLoad',
                            function ($ocLazyLoad) {
                                return $ocLazyLoad.load(['js/plugins/datatables/dataTables.bootstrap.css',
                                    'js/plugins/datatables/js/jquery.dataTables.js',
                                    'js/plugins/pagination/pagination.js',
                                    'js/plugins/CustomScrollbar/customScrollbar.concat.min.js',
                                    'js/app/services/datatable/datatable_column_service.js',
                                    'js/app/services/datatable/datatable_checkall_service.js',
                                    'js/app/services/datatable/datatable_itemaction_service.js',
                                    'js/plugins/My97DatePicker/WdatePicker.js',
                                    'js/app/services/datepick97/datepicker97_service.js',
                                    'js/app/module/purchase/purchase_service.js',
                                    'js/app/module/purchase/purchase_controller.js']);
                            }]
                    }
                })
                //仓库管理
                .state('warehouse', {
                    url: '/warehouse',
                    templateUrl: 'tpl/warehouse.html',
                    resolve: {
                        /*延迟加载，依赖相关组件*/
                        deps: ['$ocLazyLoad',
                            function ($ocLazyLoad) {
                                return $ocLazyLoad.load(['js/plugins/datatables/dataTables.bootstrap.css',
                                    'js/plugins/datatables/js/jquery.dataTables.js',
                                    'js/plugins/pagination/pagination.js',
                                    'js/plugins/CustomScrollbar/customScrollbar.concat.min.js',
                                    'js/app/services/datatable/datatable_column_service.js',
                                    'js/app/services/datatable/datatable_checkall_service.js',
                                    'js/app/services/datatable/datatable_itemaction_service.js',
                                    'js/plugins/My97DatePicker/WdatePicker.js',
                                    'js/app/services/datepick97/datepicker97_service.js',
                                    'js/app/module/warehouse/warehouse_service.js',
                                    'js/app/module/warehouse/warehouse_controller.js']);
                            }]
                    }
                });
        }
    ]
);