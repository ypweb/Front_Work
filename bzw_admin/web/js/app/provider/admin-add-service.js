/*管理模块应用--服务*/
(function () {
    'use strict';

    /*创建管理模块应用服务*/
    angular
        .module('app')
        .service('adminAddService', adminAddService);


    /*服务注入依赖*/
    adminAddService.$inject = ['toolUtil', 'toolDialog', '$state', 'loginService', 'powerService', 'adminService', 'testService'];


    /*服务实现*/
    function adminAddService(toolUtil, toolDialog, $state, loginService, powerService, adminService, testService) {
        var cacheparam = loginService.getCache().loginMap.param/*缓存*/;


        /*对外接口*/
        this.clearFormData = clearFormData/*重置表单数据*/;
        this.queryByEdit = queryByEdit/*查询编辑数据*/;
        this.queryByName = queryByName/*根据名称检索数据*/;
        this.setPower = setPower/*设置权限*/;


        /*接口实现--公有*/
        /*重置表单数据*/
        function clearFormData(config) {
            var type = config.type,
                model = config.model[type];

            if (model) {
                if (type === 'admin') {
                    (function () {
                        for (var i in model) {
                            if (i !== 'setting') {
                                model[i] = '';
                            }
                        }
                    }());
                }
            }
        }

        /*查询编辑数据*/
        function queryByEdit(config) {
            powerService.reqPowerList(config, function () {
                var list = powerService.createTbody();
                config.model.tbody = list;
            });
            config.model.colgroup = powerService.createColgroup();
            config.model.thead = powerService.createThead(true);
        }


        /*根据name查询数据*/
        function queryByName(config) {
            if (!config) {
                return false;
            }
            var debug = config.debug;
            toolUtil
                .requestHttp({
                    url: '/admin/permission',
                    method: 'post',
                    debug: debug,
                    data: {
                        userName: config.userName
                    }
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
                                    console.log('新增权限失败');
                                }
                                if (code === 999) {
                                    /*退出系统*/
                                    loginService.outAction();
                                }
                            } else {
                                /*加载数据*/
                                var result = data.result;
                                if (!result) {
                                    console.log('新增权限失败');
                                    return false;
                                }
                                if (typeof result !== 'undefined') {
                                    /*变更模型*/
                                    config.admin.id = '';
                                    config.admin.setting = true;
                                    queryByEdit({
                                        debug: debug/*测试模式*/,
                                        israndom: debug/*随机选择权限*/,
                                        create: debug,
                                        model: config.power/*权限模型*/,
                                        param: {
                                            userName: config.admin.userName
                                        }
                                    });
                                }
                            }
                        }
                    },
                    function (resp) {
                        var faildata = resp.data;
                        if (faildata) {
                            var message = faildata.message;
                            if (typeof message !== 'undefined' && message !== '') {
                                console.log(message);
                            } else {
                                console.log('新增权限失败');
                            }
                        } else {
                            console.log('新增权限失败');
                        }
                    });
        }

        /*设置权限*/
        function setPower(config) {
            if (!config) {
                return false;
            }
            var debug = config.debug,
                powerlist = _getPowerParam_(config.power);
            toolUtil
                .requestHttp({
                    url: 'admin/power/set',
                    debug: debug,
                    method: 'POST',
                    data: {
                        adminId: cacheparam.adminId,
                        token: cacheparam.token,
                        userName: config.admin.userName,
                        power: powerlist
                    }
                })
                .then(function (resp) {
                        /*测试代码*/
                        if (config.debug) {
                            var resp = testService.testSuccess();
                        }
                        var data = resp.data,
                            status = parseInt(resp.status, 10);

                        if (status === 200) {
                            var code = parseInt(data.code, 10),
                                message = data.message;
                            if (code !== 0) {
                                if (typeof message !== 'undefined' && message !== '') {
                                    /*提示信息*/
                                    toolDialog.show({
                                        type: 'warn',
                                        value: message
                                    });
                                } else {
                                    /*提示信息*/
                                    toolDialog.show({
                                        type: 'warn',
                                        value: '设置权限失败'
                                    });
                                }
                                if (code === 999) {
                                    /*退出系统*/
                                    loginService.outAction();
                                }
                            } else {
                                /*提示操作结果*/
                                toolDialog.show({
                                    type: 'succ',
                                    value: '设置权限成功'
                                });
                                /*变更模型*/
                                /*to do*/
                            }
                        }
                    },
                    function (resp) {
                        var faildata = resp.data;
                        if (faildata) {
                            var message = faildata.message;
                            if (typeof message !== 'undefined' && message !== '') {
                                console.log(message);
                            } else {
                                console.log('设置权限失败');
                            }
                        } else {
                            console.log('设置权限失败');
                        }
                    });

        }


        /*接口实现--私有*/
        /*获取权限*/
        function _getPowerParam_(power) {
            if (!power) {
                return '';
            }
            var datalist = power.tbody,
                list = [],
                i = 0,
                len = datalist.length,
                item,
                subitem;

            for (i; i < len; i++) {
                item = datalist[i];
                for (var j in item) {
                    /*存在且过滤ng自动创建的$$hashkey属性*/
                    if (item[j] && !(/(\$\$)+/g.test(j))) {
                        subitem = item[j];
                        list.push({
                            prid: subitem['prid'],
                            isPermit: subitem['isPermit']
                        })
                    }
                }
            }
            return JSON.stringify(list);
        }

    }


}());