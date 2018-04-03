angular.module('app')
    /*分润设置--分润业务*/
    .directive('settingProfitList',function() {
        return {
            replace:false,
            restrict: 'EC',
            scope:{
                list:'=list',
                record:'=record',
                action:'&action'
            },
            template:'<li ng-repeat="item in list" data-id="{{item.id}}" class="{{item.active}}">{{item.name}}</li>',
            link:function (scope, element, attrs) {
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
        };
    });
   