/*侧边栏--公共指令集*/
(function () {
    'use strict';


    /*定义指令*/
    angular
        .module('view')/*公共指令集名称*/
        .directive('viewSideLogo', viewSideLogo)/*首页logo指令*/
        .directive('viewSideInfo', viewSideInfo)/*首页用户信息指令*/
        .directive('viewSideList', viewSideList)/*列表指令*/
        .directive('viewSideSearch', viewSideSearch)/*侧边栏搜索指令*/
        .directive('viewSideTabHref', viewSideTabHref)/*侧边栏tab选项卡跳转指令*/
        .directive('viewSideTab', viewSideTab)/*侧边栏tab选项卡指令*/
        .directive('viewSideMenu', viewSideMenu)/*侧边栏级联菜单指令*/
        .directive('viewSideBtn', viewSideBtn)/*侧边栏按钮指令*/;


    /*指令依赖注入*/
    viewSideSearch.$inject = ['toolUtil'];


    /*指令实现*/
    /*首页logo指令*/
    /*
     * demo
     * <view-side-logo></view-side-logo>
     * */
    function viewSideLogo() {
        return {
            replace: true,
            restrict: 'EA',
            template: '<div class="sub-logo-wrap">\
                        <div class="logo-img-wrap">\
                            <img ng-src="images/index_logo.png" alt="logo" />\
                        </div>\
                        <h1>布住网后台管理平台</h1>\
                       </div>'
        };
    }

    /*首页用户信息指令*/
    /*demo
     * <ul data-view-side-info="" class="sub-info-wrap"></ul>
     * */
    function viewSideInfo() {
        return {
            replace: false,
            restrict: 'EA',
            scope:{
                menuitem:'=menuitem'
            },
            template: '<li ng-repeat="i in menuitem">{{i.name}}：<span>{{i.value}}</span></li>'
        };
    }

    /*列表指令*/
    /*demo
     * <ul data-view-side-list="" class="sub-list-wrap"></ul>
     * */
    function viewSideList() {
        return {
            replace: false,
            restrict: 'EA',
            scope: {
                listitem: '=listitem'
            },
            template: '<li ng-show="{{i.power}}"  ui-sref-active="menuactive" class="{{i.active}}" ng-repeat="i in listitem"><a data-type="{{i.type}}" title=""  ui-sref="{{i.href}}">{{i.name}}</a></li>'
        };
    }

    /*侧边栏搜索指令*/
    /*
     * demo:
     * <div data-view-side-search="" class="sub-search-wrap"></div>
     * */
    function viewSideSearch(toolUtil) {
        return {
            replace: false,
            restrict: 'EA',
            scope: {
                sactive: '=active',
                svalue: '=value',
                saction: '&action',
                sclear: '&clear'
            },
            template: '<label class="search-content {{sactive}}">\
                <input type="text" placeholder="搜索" ng-model="svalue" name="search_name" class="g-br3" />\
            <span class="search-clear" ng-click="sclear()"></span></label>',
            link: sideSearch
        };

        /*link实现*/
        function sideSearch(scope, element, attrs) {
            angular.element(element).find('input').bind('keyup', function ($event) {

                var kcode = $event.keyCode,
                    self = this;

                self.value = toolUtil.trimHtmlIllegal(self.value);
                if (scope.svalue === '') {
                    scope.sactive = '';
                } else {
                    scope.sactive = 'search-content-active';
                }
                if (kcode === 13) {
                    scope.saction();
                }
            });
        }
    }

    /*侧边栏tab选项卡跳转指令*/
    /*
     * demo:
     * <ul data-view-side-tab-href="" class="sub-tab-wrap sub-item-group2 sub-itembr-group2"></ul>
     * */
    function viewSideTabHref() {
        return {
            replace: false,
            restrict: 'EA',
            scope: {
                tabitem: '=tabitem'
            },
            template: '<li ng-show="{{i.power}}" ui-sref="{{i.href}}" class="{{i.active}}" ng-repeat="i in tabitem">{{i.name}}</li>'
        };
    }

    /*侧边栏tab选项卡指令*/
    /*
     * demo:
     * <ul class="sub-tab-wrap sub-item-group3 sub-itembr-group3" data-view-side-tab=""></ul>
     * */
    function viewSideTab() {
        return {
            replace: false,
            restrict: 'EA',
            scope: {
                tabitem: '=tabitem'
            },
            template: '<li ng-show="{{i.power}}" data-type="{{i.type}}" class="{{i.active}}" ng-repeat="i in tabitem">{{i.name}}</li>',
            link: sideTab
        };

        /*link实现*/
        function sideTab(scope, element, attrs) {
            /*绑定事件*/
            element.bind('click', function ($event) {
                var target = $event.target,
                    node = target.nodeName.toLowerCase();

                if (node !== 'li') {
                    return false;
                }

                var $li = angular.element(target),
                    type = $li.attr('data-type');

                $li.addClass('tabactive').siblings().removeClass('tabactive');
                if (type && type !== '') {
                    scope.$apply(function () {
                        scope.$parent[attrs.ctrlname][attrs.action](type);
                    })
                }
            });
        }
    }

    /*侧边栏级联菜单指令*/
    /*
     * demo:
     * <ul class="sub-menu-wrap" data-view-side-menu="" ></ul>
     * */
    function viewSideMenu() {
        return {
            replace: false,
            restrict: 'EA',
            template: ''
        };
    }

    /*侧边栏按钮指令*/
    /*
     * demo:
     * <ul data-view-side-btn="" class="sub-btn-wrap sub-item-group2"></ul>
     * */
    function viewSideBtn() {
        return {
            replace: false,
            restrict: 'EA',
            scope: {
                btnitem: '=btnitem'
            },
            template: '<li ng-show="{{i.power}}" data-type="{{i.type}}" ng-repeat="i in btnitem">\
                <span><i class="{{i.icon}}"></i>{{i.name}}</span>\
            </li>',
            link: sideBtn
        };

        /*link实现*/
        function sideBtn(scope, element, attrs) {
            element.bind('click', function ($event) {
                var target = $event.target,
                    node = target.nodeName.toLowerCase(),
                    $li;

                if (node === 'ul') {
                    return false;
                } else if (node === 'span' || node === 'i') {
                    $li = angular.element(target).closest('li');
                } else if (node === 'li') {
                    $li = angular.element(target);
                }

                var type = $li.attr('data-type');
                if (type && type !== '') {
                    scope.$apply(function () {
                        scope.$parent[attrs.ctrlname][attrs.action](type);
                    })
                }
            });
        }
    }

}());
   