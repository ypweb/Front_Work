/*管理模块应用--服务*/
(function () {
    'use strict';

    /*创建管理模块应用服务*/
    angular
        .module('app')
        .service('adminListService', adminListService);


    /*服务注入依赖*/
    adminListService.$inject = ['toolUtil', 'toolDialog', 'assistCommon', 'dataTableService', '$state', 'adminService', 'loginService', 'testService'];


    /*服务实现*/
    function adminListService(toolUtil, toolDialog, assistCommon, dataTableService, $state, adminService, loginService, testService) {
        var cacheparam = loginService.getCache().loginMap.param/*缓存*/;

        /*对外接口*/
        this.doItemAction = doItemAction/*操作表格*/;


        /*接口实现--公有*/
        /*操作表格*/
        function doItemAction(config) {
            if (!cacheparam) {
                loginService.outAction();
                return false;
            }
            var index = config.index,
                $btn = config.$btn,
                debug=config.debug,
                action = $btn.attr('data-action'),
                id = $btn.attr('data-id'),
                url = '';

            /*适配参数*/
            var param = {
                token: cacheparam.token,
                adminId: cacheparam.adminId,
                id: id
            };
            param['id'] = id;

            if (action === 'update') {
                /*编辑或更新操作*/
                /*设置临时缓存*/
                assistCommon.changeCache('tempMap', {
                    id: id
                });
                /*路由*/
                $state.go('admin.add');
            } else if (action === 'delete') {
                /*删除操作*/
                url = debug?'':'admin/delete';
                toolDialog.sureDialog('', function () {
                    /*请求数据*/
                    _doItemAction_({
                        url: url,
                        action: action,
                        table: config.table,
                        index: index,
                        method: 'post',
                        debug: debug,
                        data: param
                    });
                }, '删除后将不可登录此后台系统了，是否真要删除此权限？', true);
            }


        }

        /*接口实现--私有*/
        /*处理表格操作*/
        function _doItemAction_(config) {
            var tempconfig={
                url: config.url,
                debug:config.debug,
                method: config.method,
                data: config.data
            };
            toolUtil
                .requestHttp(tempconfig)
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
                                        value: config.action === 'update' ? '编辑权限失败' : '删除权限失败'
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
                                    value: config.action === 'update' ? '编辑权限成功' : '删除权限成功'
                                });
                                /*重新加载数据*/
                                dataTableService.getTableData({
                                    index: config.index,
                                    table: config.table
                                });
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
                                console.log(config.action === 'update' ? '编辑权限失败' : '删除权限失败');
                            }
                        }else{
                            console.log(config.action === 'update' ? '编辑权限失败' : '删除权限失败');
                        }
                    });
        }


    }


}());