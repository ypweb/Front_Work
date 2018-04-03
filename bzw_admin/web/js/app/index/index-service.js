/*首页模块应用--服务*/
(function () {
    'use strict';

    /*创建首页模块应用服务*/
    angular
        .module('app')
        .service('indexService', indexService);


    /*服务注入依赖*/
    indexService.$inject = ['loginService', 'powerService', 'testService'];


    /*服务实现*/
    function indexService(loginService, powerService, testService) {
        /*获取缓存数据*/
        var module_id = 0/*模块id*/,
            powermap = powerService.getCurrentPower(module_id),
        /*初始化权限 to do*/
            init_power = {
                add: true || powerService.isPower('add', powermap, true)/*增*/,
                delete: true || powerService.isPower('delete', powermap, true)/*删*/,
                update: true || powerService.isPower('update', powermap, true)/*改*/,
                query: true || powerService.isPower('query', powermap, true)/*查*/
            };

        /*对外接口*/
        this.getCurrentPower = getCurrentPower/*获取权限列表*/;
        this.getSideInfo = getSideInfo/*获取侧边栏信息*/;
        this.getQuickItem = getQuickItem/*获取快捷导航*/;


        /*接口实现*/
        /*获取权限列表*/
        function getCurrentPower() {
            return init_power;
        }

        /*获取侧边栏信息*/
        function getSideInfo() {
            return testService.getMap({
                map: {
                    'name': 'name',
                    'value': 'value'
                },
                mapmin: 5,
                mapmax: 15
            }).list;
        }

        /*获取快捷导航*/
        function getQuickItem() {
            return loginService.getMenuData();
        }


    }
}());
