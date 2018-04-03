/*首页模块应用--控制器*/
(function () {
    'use strict';


    /*创建控制器*/
    angular
        .module('app')
        .controller('indexController', indexController);

    /*控制注入依赖*/
    indexController.$inject = ['$scope','indexService'];


    /*控制器实现*/
    function indexController($scope, indexService) {
        var vm = this,
            debug = true/*测试模式*/;

        /*模型--主内容侧边栏*/
        vm.menuitem = debug ? indexService.getSideInfo() : [];


        /*对外接口*/
        vm.getQuickItem = getQuickItem/*获取快捷方式*/;
        vm.toggleModal = toggleModal/*显示弹窗*/;


        /*接口实现--公有*/
        /*获取快捷方式*/
        function getQuickItem() {
            return indexService.getQuickItem();
        }

        /*显示弹窗*/
        function toggleModal(config) {
            /*配置弹窗*/
            $scope.$emit('configModal', {
                url: config.url,
                width: config.width
            });
            /*弹出弹窗*/
            $scope.$emit('toggleModal', {
                display: config.display
            });
        }

    }


}());