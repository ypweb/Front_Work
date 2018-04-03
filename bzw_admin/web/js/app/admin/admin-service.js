/*管理模块应用--服务*/
(function () {
    'use strict';

    /*创建管理模块应用服务*/
    angular
        .module('app')
        .service('adminService', adminService);


    /*服务注入依赖*/
    adminService.$inject = ['$location', 'powerService', '$state'];


    /*服务实现*/
    function adminService($location, powerService, $state) {
        var path = $location.path()/*模块*/,
            module_id = powerService.getIdByPath(path)/*模块id*/,
            powermap = powerService.getCurrentPower(module_id),
            init_power = {
                add: true || powerService.isPower('add', powermap, true)/*增*/,
                delete: true || powerService.isPower('delete', powermap, true)/*删*/,
                update: true || powerService.isPower('update', powermap, true)/*改*/,
                query: true || powerService.isPower('query', powermap, true)/*查*/
            }/*权限配置*/,
            submenu = [];

        /*对外接口*/
        this.getCurrentPower = getCurrentPower/*获取当前权限*/;
        this.getSideMenu = getSideMenu/*获取侧边栏菜单*/;
        this.routeDefault = routeDefault/*跳转到默认页面*/;


        /*接口实现--公有*/

        /*扩展服务--查询操作权限*/
        function getCurrentPower() {
            return init_power;
        }

        /*获取侧边栏菜单*/
        function getSideMenu() {
            if (submenu.length === 0) {
                submenu = powerService.getSideMenu(module_id);
            }
            return submenu;
        }

        /*跳转到默认页面*/
        function routeDefault(url) {
            if(url){
               $state.go(url);
            }else{
                $state.go('admin.list');
            }
        }


    }


}());