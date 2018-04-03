/*辅助服务--公共指令集*/
(function () {
    'use strict';


    /*定义指令*/
    angular
        .module('view')/*公共指令集名称*/
        .directive('viewLoadingAnimation', viewLoadingAnimation)/*加载动画指令*/
        .directive('viewSupportPanel', viewSupportPanel)/*兼容性提示*/;


    /*指令依赖注入*/


    /*指令实现*/
    /*加载动画指令*/
    /*
    * demo:
    * <view-loading-animation></view-loading-animation>
    * */
    function viewLoadingAnimation() {
        return {
            replace: true,
            restrict: 'EA',
            templateUrl: 'view/common/load.html'
        };
    }

    /*兼容性提示*/
    /*
    * demo:
    * <view-support-panel></view-support-panel>
    * */
    function viewSupportPanel() {
        return {
            replace: true,
            restrict: 'EA',
            templateUrl: 'view/common/support.html'
        };
    }

}());
   