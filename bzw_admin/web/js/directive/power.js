/*公共指令集*/
(function () {
    'use strict';


    /*定义指令*/
    angular
        .module('view')/*公共指令集名称*/
        .directive('viewPowerColgroup', viewPowerColgroup)/*权限分组指令*/
        .directive('viewPowerTheadAll', viewPowerTheadAll)/*包含全选操作权限头部指令*/
        .directive('viewPowerThead', viewPowerThead)/*权限头部指令*/
        .directive('viewPowerTbody', viewPowerTbody)/*权限主体指令*/
        .directive('viewPowerTbodyItem', viewPowerTbodyItem)/*拥有单独设置权限主体指令*/;


    /*指令依赖注入*/
    viewPowerTbodyItem.$inject = ['loginService', 'toolUtil', 'testService'];


    /*指令实现*/
    /*权限分组指令*/
    function viewPowerColgroup() {
        return {
            replace: false,
            restrict: 'EA',
            scope: {
                colgroup: '=colgroup'
            },
            template: '<col class="{{i.col_class}}" ng-repeat="i in colgroup" />'
        };
    }

    /*包含全选操作权限头部指令*/
    function viewPowerTheadAll() {
        return {
            replace: false,
            restrict: 'EA',
            scope: {
                thead: '=thead',
                tbody: '=tbody'
            },
            template: '<tr>\
               <th ng-repeat="i in thead" class="g-t-c">\
                   <label class="g-t-nowrap simulation-checkbox-widget simulation-checkbox-widget-before" ng-class="{\'simulation-checkbox-widget-before-active\':i.isPermit}" data-index="{{i.index}}">\
                        <input data-index="{{i.index}}" data-id="{{i.id}}" type="checkbox" ng-model="i.isPermit"  ng-true-value="1" ng-false-value="0" name="{{i.module}}" />{{i.name}}</label>\
               </th>\
            </tr>',
            link: powerTheadAll
        };

        /*link实现*/
        function powerTheadAll(scope, element, attrs) {
            /*全选权限（权限绑定）*/
            angular.element(element).bind('change', function ($event) {
                $event.stopPropagation();
                var target = $event.target,
                    nodename = target.nodeName.toLowerCase();
                /*过滤*/
                if (nodename === 'tr') {
                    return false;
                }
                /*标签*/
                var $selectall,
                    index,
                    checked,
                    data;

                if (nodename === 'label') {
                    $selectall = angular.element(target).find('input');
                } else if (nodename === 'input') {
                    $selectall = angular.element(target);
                }

                index = $selectall.attr('data-index');
                checked = scope.thead[index]['isPermit'];
                data = scope.tbody[index];

                for (var i in data) {
                    if (i !== '$$hashKey') {
                        data[i]['isPermit']=checked;
                    }
                }
                scope.$apply(data);
            });
        }
    }

    /*权限头部指令*/
    function viewPowerThead() {
        return {
            replace: false,
            restrict: 'EA',
            scope: {
                thead: '=thead'
            },
            template: '<tr>\
               <th ng-repeat="i in thead" class="g-t-c" data-index="{{i.index}}">{{i.name}}</th>\
            </tr>'
        };
    }

    /*权限主体指令*/
    function viewPowerTbody() {
        return {
            replace: false,
            restrict: 'EA',
            scope: {
                tbody: '=tbody'
            },
            template: '<tr>\
                <td ng-repeat="item in tbody">\
                    <label ng-repeat="(key,value) in item" data-index="{{value.index}}" class="btn btn-default g-gap-mb2 g-gap-mr2 simulation-checkbox-widget simulation-checkbox-widget-before" ng-class="{\'simulation-checkbox-widget-before-active\':value.isPermit}">\
         <input data-prid="{{value.prid}}" ng-true-value="1" ng-false-value="0" data-modId="{{value.modId}}" data-index="{{value.index}}" ng-model="value.isPermit" type="checkbox" name="{{value.module}}" />{{value.funcName}}\
         </label>\
                </td>\
            </tr>'
        };

    }

    /*拥有单独设置权限主体指令*/
    function viewPowerTbodyItem(loginService, toolUtil, testService) {
        return {
            replace: false,
            restrict: 'EA',
            scope: {
                tbody: '=tbody'
            },
            template: '<tr>\
                <td ng-repeat="item in tbody">\
                    <label ng-repeat="(key,value) in item" data-index="{{value.index}}" class="btn btn-default g-gap-mb2 g-gap-mr2 simulation-checkbox-widget simulation-checkbox-widget-before" ng-class="{\'simulation-checkbox-widget-before-active\':value.isPermit}">\
         <input data-prid="{{value.prid}}" ng-true-value="1" ng-false-value="0" data-modId="{{value.modId}}" data-index="{{value.index}}" ng-model="value.isPermit" type="checkbox" name="{{value.module}}" />&nbsp;{{value.funcName}}\
         </label>\
                </td>\
            </tr>',
            link: powerTbodyItem
        };


        /*link实现*/
        function powerTbodyItem(scope, element, attrs) {
            angular.element(element).bind('click', function ($event) {
                var target = $event.target,
                    node = target.nodeName.toLowerCase(),
                    $operate;
                if (node === 'tbody' || node === 'tr' || node === 'td' || node === 'th') {
                    return false;
                } else if (node === 'label') {
                    $operate = angular.element(target).find('input');
                } else if (node === 'input') {
                    $operate = angular.element(target);
                }
                var check = $operate.is(':checked'),
                    prid = $operate.attr('data-prid'),
                    tempparam = loginService.getCache().loginMap.param,
                    param = {
                        adminId: tempparam.adminId,
                        token: tempparam.token,
                        organizationId: tempparam.organizationId,
                        prid: prid,
                        isPermit: check ? 1 : 0
                    };

                toolUtil
                    .requestHttp({
                        url: '/permission/state/update',
                        method: 'post',
                        debug: debug,
                        data: param
                    })
                    .then(function (resp) {
                            if (debug) {
                                var resp = testService.testSuccess();
                            }
                            var data = resp.data,
                                status = parseInt(resp.status, 10);

                            if (status === 200) {
                                var code = parseInt(data.code, 10),
                                    message = data.message;
                                if (code !== 0) {
                                    if (typeof message !== 'undefined' && message !== '') {
                                        console.log(message);
                                    } else {
                                        console.log('设置权限失败');
                                    }
                                    if (code === 999) {
                                        /*退出系统*/
                                        loginService.outAction();
                                    }
                                    /*恢复原来设置*/
                                    $operate.prop({
                                        'checked': !check
                                    });
                                }
                            }
                        },
                        function (resp) {
                            var faildata = resp.data;
                            if (faildata) {
                                var message = resp.data.message;
                                if (typeof message !== 'undefined' && message !== '') {
                                    console.log(message);
                                } else {
                                    console.log('设置权限失败');
                                }
                            } else {
                                console.log('设置权限失败');
                            }
                            /*恢复原来设置*/
                            $operate.prop({
                                'checked': !check
                            });
                        });


            });
        }
    }

}());
   