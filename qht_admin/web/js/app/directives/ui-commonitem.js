angular.module('ui.commonitem',[])
    /*头部导航栏指令*/
    .directive('uiHeaderMenu',function() {
        return {
            replace:false,
            restrict: 'EC',
            template:'<li ng-repeat="i in app_ctrl.headeritem"><a data-id="{{i.id}}" data-code="{{i.code}}" href="" ui-sref="{{i.href}}" title="">{{i.name}}</a></li>',
            link:function (scope, element, attrs) {
                /*绑定事件menuactive*/
                element.on('click','a',function (e) {
                    var $this=$(this);
                    $this.addClass('menuactive').parent().siblings().find('a').removeClass('menuactive');
                });
            }
        };
    })
    /*头部退出*/
    .directive('uiHeaderLogout',function() {
        return {
            replace:true,
            restrict: 'EC',
            template:'<div class="g-br3 header-outwrap" id="struct_layout_loginout" ui-sref="app" ng-click="app_ctrl.loginOut()">退出</div>'
        };
    })
    /*首页logo指令*/
    .directive('uiSubLogo',function() {
        return {
          replace:false,
          restrict: 'EC',
          template:'<div class="logo-img-wrap">\
                        <img src="images/index_logo.png" alt="logo" />\
                    </div>\
                    <h1>深圳银通移动支付有限公司</h1>'
        };
    })
    /*首页用户信息指令*/
    .directive('uiSubInfo',function() {
        return {
            replace:false,
            restrict: 'EC',
            template:'<li ng-repeat="i in index_ctrl.menuitem">{{i.name}}：<span>{{i.value}}</span></li>'
        };
    })
    /*列表指令*/
    .directive('uiSubList',function() {
        return {
            replace:false,
            restrict: 'EC',
            template:'<li ng-repeat="i in subdata.listitem"><a data-type="{{i.href}}" title="">{{i.name}}</a></li>'
        };
    })
    /*侧边栏搜索指令*/
    .directive('uiSubSearch',function() {
        return {
            replace:false,
            restrict: 'EC',
            scope:{
                sactive:'=active',
                svalue:'=value',
                saction:'&action',
                sclear:'&clear'
            },
            template:'<label class="search-content {{sactive}}">\
                <input type="text" placeholder="搜索" ng-model="svalue" name="search_name" class="g-br3" />\
            <span class="search-clear" ng-click="sclear()"></span></label>',
            link:function (scope, element, attrs) {
                angular.element(element).find('input').bind('keyup',function ($event) {
                    var kcode=$event.keyCode;

                    if(scope.svalue===''){
                        scope.sactive='';
                    }else{
                        scope.sactive='search-content-active';
                    }
                    if(kcode===13){
                        scope.saction();
                    }
                });
            }
        };
    })
    /*侧边栏tab选项卡指令*/
    .directive('uiSubTabHref',function() {
        return {
            replace:false,
            restrict: 'EC',
            scope:{
                tabitem:'=tabitem'
            },
            template:'<li ng-show="{{i.power}}" ui-sref="{{i.href}}" class="{{i.active}}" ng-repeat="i in tabitem">{{i.name}}</li>'
        };
    })
    /*侧边栏tab选项卡指令*/
    .directive('uiSubTab',function() {
        return {
            replace:false,
            restrict: 'EC',
            scope:{
                tabitem:'=tabitem'
            },
            template:'<li ng-show="{{i.power}}" data-type="{{i.type}}" class="{{i.active}}" ng-repeat="i in tabitem">{{i.name}}</li>',
            link:function (scope, element, attrs) {
                /*绑定事件*/
                element.bind('click',function ($event) {
                    var target=$event.target,
                        node=target.nodeName.toLowerCase();

                    if(node!=='li'){
                        return false;
                    }

                    var $li=angular.element(target),
                        type=$li.attr('data-type');

                    $li.addClass('tabactive').siblings().removeClass('tabactive');
                    if(type && type!==''){
                        scope.$apply(function () {
                            scope.$parent[attrs.ctrlname][attrs.action](type);
                        })
                    }
                });
            }
        };
    })
    /*侧边栏级联菜单指令*/
    .directive('uiSubMenu',function() {
        return {
            replace:false,
            restrict: 'EC',
            template:''
        };
    })
    /*侧边栏按钮指令*/
    .directive('uiSubBtn',function() {
        return {
            replace:false,
            restrict: 'EC',
            scope:{
                btnitem:'=btnitem'
            },
            template:'<li ng-show="{{i.power}}" data-type="{{i.type}}" ng-repeat="i in btnitem">\
                <span><i class="{{i.icon}}"></i>{{i.name}}</span>\
            </li>',
            link:function (scope, element, attrs) {
                element.bind('click',function ($event) {
                    var target=$event.target,
                        node=target.nodeName.toLowerCase(),
                        $li;

                    if(node==='ul'){
                        return false;
                    }else if(node==='span' || node==='i'){
                        $li=angular.element(target).closest('li');
                    }else if(node==='li'){
                        $li=angular.element(target);
                    }

                    var  type=$li.attr('data-type');
                    if(type && type!==''){
                        scope.$apply(function () {
                            scope.$parent[attrs.ctrlname][attrs.action](type);
                        })
                    }
                });
            }
        };
    })
    /*首页快捷方式指令*/
    .directive('uiMainApp',function() {
        return {
            replace:false,
            restrict: 'EC',
            template:'<div class="admin-welcome-banner"><img src="images/index_banner.jpg" alt="" /></div>\
                        <h3 class="admin-layout-theme3">快捷入口</h3>\
                        <ul class="admin-quick-icon">\
                          <li ng-repeat="i in index_ctrl.quickitem">\
                            <div class="g-br5" data-id="{{i.id}}" data-code="{{i.code}}" href="" ui-sref="{{i.href}}">\
                                <img alt="" src="images/quick_{{$index + 1}}.png" />\
                                <span>{{i.name}}</span>\
                            </div>\
                          </li>\
                        </ul>'
        };
    });
   