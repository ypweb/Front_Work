/*管理模块应用--控制器*/
(function () {
    'use strict';

    /*创建控制器*/
    angular
        .module('app')
        .controller('adminController', adminController);

    /*控制注入依赖*/
    adminController.$inject = ['adminService', 'assistCommon'];

    /*控制器实现*/
    function adminController(adminService, assistCommon) {
        var vm = this;

        /*模型--菜单列表*/
        vm.listitem = adminService.getSideMenu();

        /*模型--欢迎页面*/
        vm.welcome = true;

        /*清除临时缓存*/
        assistCommon.changeCache('tempMap');

        /*路由跳转到默认页面*/
        adminService.routeDefault('admin.list');

        /*接口实现--公有*/


        /*接口实现--私有*/
    }
}());