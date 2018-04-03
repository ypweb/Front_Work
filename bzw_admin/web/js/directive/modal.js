/*弹窗指令*/
(function () {
    'use strict';

    /*定义指令*/
    angular
        .module('view')
        .directive('viewModalDialog', viewModalDialog)/*弹出框容器指令*/;


    /*指令依赖注入*/
    viewModalDialog.$inject = ['$compile'];



    /*指令实现*/

    /*弹出框容器指令*/
    /*
     * demo:
     * <view-modal-dialog></view-modal-dialog>
     * */
    function viewModalDialog($compile) {
        var template = '',
            tpl;

        return {
            replace: false,
            restrict: 'EA',
            scope: {
                url:'=url',
                message:'=message'
            },
            link: modalDialog
        };

        /*link实现*/
        function modalDialog(scope, element, attrs, ctrl) {
            /*获取模板地址*/
            scope.getUrl = function() {
                return scope.url;
            };
            /*监控地址变化*/
            scope.$watch(scope.url,function () {
                template = '<div ng-include="getUrl()"></div>';
                tpl = $compile(template);
                element.append(tpl(scope));
            });


        }
    }


}());