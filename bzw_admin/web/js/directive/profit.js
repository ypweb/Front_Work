/*设置指令*/
(function () {
    'use strict';

    /*定义或使用指令*/
    angular
        .module('view')
        .directive('viewProfitList',viewProfitList)/*分润设置--分润业务*/;

    /*指令依赖注入*/


    /*指令实现*/
    /*分润设置--分润业务*/
    /*
    * demo:
    * <ul data-view-profit-list class="profit-side" ></ul>
    * */
    function viewProfitList() {
        return {
            replace:false,
            restrict: 'EA',
            scope:{
                list:'=list',
                record:'=record',
                action:'&action'
            },
            template:'<li ng-repeat="item in list" data-id="{{item.id}}" class="{{item.active}}">{{item.name}}</li>',
            link:profitList
        };

        /*link实现*/
        function profitList(scope, element, attrs) {
            angular.element(element).bind('click',function ($event) {
                var target=$event.target,
                    node=target.nodeName.toLowerCase();
                if(node==='ul'){
                    return false;
                }

                var $this=angular.element(target),
                    id=$this.attr('data-id');

                $this.addClass('profitactive').siblings().removeClass('profitactive');

                scope.$apply(function () {
                    scope.record=id;
                });
                scope.action();
            });
        }
    }
    
    
}());