/*管理模块应用--控制器*/
(function () {
    'use strict';

    /*创建控制器*/
    angular
        .module('app')
        .controller('providerController', providerController);

    /*控制注入依赖*/
    providerController.$inject = ['providerService', 'assistCommon'];

    /*控制器实现*/
    function providerController(providerService, assistCommon) {
        var vm = this;

        /*模型--菜单列表*/
        vm.listitem = providerService.getSideMenu();

        /*模型--欢迎页面*/
        //vm.welcome = true;

        /*清除临时缓存*/
        assistCommon.changeCache('tempMap');

        /*路由跳转到默认页面*/
        providerService.routeDefault('provider.list');

        /*接口实现--公有*/


        /*接口实现--私有*/
    }
}());