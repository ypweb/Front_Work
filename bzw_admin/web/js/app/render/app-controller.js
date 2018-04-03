/*主模块应用--控制器*/
(function () {
    'use strict';

    /*创建控制器*/
    angular
        .module('app')
        .controller('appController', appController);


    /*控制注入依赖*/
    appController.$inject = ['$scope', 'loginService', 'appService'];


    /*控制器实现*/
    function appController($scope, loginService, appService) {
        var vm = this,
            debug = true/*测试模式*/,
            create = true/*是否生成新菜单*/;

        /*模型--基本配置*/
        vm.app_config = {
            issupport: appService.isSupport()/*是否兼容*/,
            isloading: 'g-d-hidei'/*加载组件初始化*/
        };

        /*模型--弹窗基本配置*/
        vm.modal = {
            config: {
                width: 'g-w-percent48',
                url: 'view/modal/index.html'
            }
        };

        /*模型--系统信息*/
        vm.info = appService.getSystemInfo();

        /*模型--个人信息*/
        vm.message = {
            isshow: false,
            active: false,
            login: []
        };

        /*模型--视口切换*/
        vm.viewmode = {
            value: 'default',
            list: [{
                name: '定宽',
                value: 'default',
                active: 'header-viewmode-active'
            }, {
                name: '宽屏',
                value: 'auto',
                active: ''
            }]
        };

        /*模型--菜单*/
        vm.menu = {
            headeritem: []/*主导航显示区*/,
            headersubitem: []/*主导航隐藏*/,
            isshow: false/*是否显示子导航*/,
            active: false/*是否是激活状态*/
        };

        /*模型--用户数据*/
        vm.login = {
            islogin: loginService.isLogin()/*登录标识*/,
            username: '',
            password: '',
            identifyingCode: '',
            loginerror: ''
        };

        /*获取菜单数组*/
        _initLoginState_();
        /*绑定弹窗事件*/
        _bindModal_();


        /*对外接口*/
        vm.formSubmit = formSubmit/*绑定提交*/;
        vm.getValidCode = getValidCode/*获取验证码*/;
        vm.loginOut = loginOut/*退出*/;
        vm.changeVM = changeVM/*绑定切换视图事件*/;


        /*接口实现--公有*/
        /*绑定提交*/
        function formSubmit() {
            /*校验成功*/
            loginService.reqAction({
                login: vm.login,
                menu: vm.menu,
                message: vm.message,
                viewmode: vm.viewmode,
                app_config: vm.app_config,
                debug: debug,
                create: create
            });
        }

        /*获取验证码*/
        function getValidCode() {
            loginService.getValidCode({
                wrap: 'validcode_wrap',
                debug: debug,
                url: "/sysuser/identifying/code"
            });
        }

        /*退出*/
        function loginOut() {
            vm.login = {
                islogin: false,
                username: '',
                password: '',
                identifyingCode: '',
                loginerror: ''
            };
            /*重置菜单信息*/
            vm.menu.headeritem = [];
            vm.menu.headersubitem = [];
            vm.menu.isshow = false;
            /*重置模式*/
            vm.viewmode.value = 'default';
            vm.changeVM();
            /*重置个人信息*/
            vm.message.isshow = false;
            vm.message.login = [];
            loginService.loginOut(true);
        }

        /*绑定切换视图事件*/
        function changeVM() {
            appService.renderMenu(vm.menu, function () {
                return appService.changeViewMode(vm.viewmode.value);
            });
        }


        /*接口实现--私有*/
        /*登录状态初始化--获取菜单数组*/
        function _initLoginState_() {
            /*获取菜单数组*/
            if (vm.login.islogin) {
                var cache = loginService.getCache();
                /*渲染菜单*/
                appService.renderMenu(vm.menu, function () {
                    return appService.calculateMenu(loginService.getMenuData(true));
                });
                /*渲染个人信息*/
                appService.getLoginMessage(vm.message, function () {
                    var tempcache = cache.loginMap;
                    return [{
                        name: '用户名',
                        value: tempcache.username
                    }, {
                        name: '登录时间',
                        value: tempcache.datetime
                    }];
                });
            }
        }

        /*绑定弹窗事件监听*/
        function _bindModal_() {

            /*配置弹窗*/
            $scope.$on('configModal', function (event, config) {
                vm.modal.config = appService.configModal(config);
            });
            /*显示隐藏弹窗*/
            /*
             * {
             *   display:'show'//切换方式
             *   delay:1000,延迟操作，毫秒数
             *   clear:是否清除延迟表单
             * }
             * */

            $scope.$on('toggleModal', function (event, config) {
                /*执行弹窗*/
                appService.toggleModal(config);
            });
        }
    }

}());