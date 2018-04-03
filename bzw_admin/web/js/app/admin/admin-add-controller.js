/*管理模块应用--控制器*/
(function () {
    'use strict';

    /*创建控制器*/
    angular
        .module('app')
        .controller('adminAddController', adminAddController);


    /*控制注入依赖*/
    adminAddController.$inject = ['toolUtil', 'assistCommon', 'adminService', 'adminAddService'];


    /*控制器实现*/
    function adminAddController(toolUtil, assistCommon, adminService, adminAddService) {
        var vm = this,
            debug = true/*测试模式*/;


        /*模型--操作权限列表*/
        vm.powerlist = adminService.getCurrentPower();

        /*模型--欢迎页面*/
        vm.welcome = false;

        /*模型--管理员*/
        vm.admin = {
            id: ''/*用户索引*/,
            userName: ''/*用户名*/,
            setting: false/*设置面板是否显示*/
        };

        /*模型--权限设置*/
        vm.power = {
            colgroup: []/*分组*/,
            thead: []/*头部*/,
            tbody: []/*主体*/
        };

        /*初始化配置,渲染*/
        _initRender_();


        /*对外接口*/
        vm.formSubmit = formSubmit/*提交表单*/;
        vm.formReset = formReset/*重置表单*/;
        vm.setPower = setPower/*设置权限*/;


        /*接口实现--公有*/
        /*提交表单*/
        function formSubmit(config) {
            var type = config.type;
            assistCommon.formSubmit({
                modal: {
                    admin: vm.admin
                },
                istip: false/*是否显示自定义提示信息*/,
                type: type/*模型类型，即那个表单模型*/,
                action: 'add'/*表单提交类型*/,
                debug: debug/*请求模式*/,
                label: config.label/*模型类型名称*/,
                index: config.index/*表单序列，指代第几个表单一般跟reset(重置)按钮id所匹配一致*/,
                successfn: function (obj) {
                    /*成功回调*/
                    adminAddService.queryByName({
                        debug: debug,
                        admin: vm.admin,
                        power: vm.power,
                        israndom: debug/*随机选择权限*/,
                        create: debug/*是否创建权限*/
                    });
                },
                failfn: function (obj) {
                    /*失败回调*/
                    /*重置表单*/
                    vm.admin.id = '';
                    vm.admin.setting = false/*隐身权限面板*/;
                    vm.admin.userName = '';
                    /*重置权限*/
                    vm.power.colgroup = []/*分组*/;
                    vm.power.thead = []/*头部*/;
                    vm.power.tbody = []/*主体*/;
                }
            }, function () {
                /*管理员类型:组合请求参数*/
                var param = {};
                if (type === 'admin') {
                    for (var i in vm.admin) {
                        if (i !== 'setting') {
                            param[i] = vm.admin[i];
                        }
                    }
                }
                return param;
            });
        }

        /*重置表单*/
        function formReset(config) {
            /*清除填入数据*/
            adminAddService.clearFormData({
                type: config.type,
                model: {
                    admin: vm.admin
                }
            });
            /*清除验证数据*/
            assistCommon.clearFormValid(config.form);
        }

        /*设置权限*/
        function setPower() {
            adminAddService.setPower({
                debug: debug,
                admin: vm.admin,
                power: vm.power
            });
        }


        /*接口实现--私有*/
        /*初始化渲染*/
        function _initRender_() {
            /*表单初始化*/
            assistCommon.initForm([1]);
            /*重置表单数据*/
            assistCommon.addFormDelay({
                index: 1,
                fn: function () {
                    _queryByEdit_();
                }
            });
        }

        /*查询是否有编辑数据*/
        function _queryByEdit_() {
            var tempcache = toolUtil.getParams('tempMap');
            /*如何是编辑数据则调用查询数据*/
            if (typeof tempcache.id !== 'undefined' && tempcache.id !== '') {
                vm.admin.id = tempcache.id;
                vm.admin.setting = true;
                adminAddService.queryByEdit({
                    debug: debug/*测试模式*/,
                    israndom: debug/*随机选择权限*/,
                    create: debug,
                    model: vm.power/*权限模型*/,
                    param: {
                        id: tempcache.id
                    }
                });
            }
        }
    }


}());