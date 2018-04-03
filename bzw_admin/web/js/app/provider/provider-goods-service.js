/*管理模块应用--服务*/
(function () {
    'use strict';

    /*创建管理模块应用服务*/
    angular
        .module('app')
        .service('providerGoodsService', providerGoodsService);


    /*服务注入依赖*/
    providerGoodsService.$inject = ['toolUtil', 'toolDialog', 'assistCommon', 'dataTableService', '$state', 'providerService', 'loginService', 'testService'];


    /*服务实现*/
    function providerGoodsService(toolUtil, toolDialog, assistCommon, dataTableService, $state, providerService, loginService, testService) {
        var cacheparam = loginService.getCache().loginMap.param/*缓存*/;

        /*对外接口*/
        this.doItemAction = doItemAction/*操作表格*/;
        this.renderView = renderView/*初始化依赖渲染*/;


        /*接口实现--公有*/
        /*单个操作表格*/
        function doItemAction(config) {
            if (!cacheparam) {
                loginService.outAction();
                return false;
            }

            var type = config.type,
                index = config.index,
                debug = config.debug,
                $btn,
                action,
                id,
                action_map = {
                    'forbid': '禁售',
                    'enabled': '可售',
                    'up':'上架',
                    'down':'下架',
                    'detail': '查看'
                },
                type_map = {
                    'base': '',
                    'batch': '批量'
                };

            if (type === 'base') {
                /*单个*/
                $btn = dataTableService.getActionCache(index).$btn;
                action = $btn.attr('data-action');
                id = $btn.attr('data-id');
            } else if (type === 'batch') {
                /*批量*/
                action = config.action;
                /*过滤状态数据*/
                id = dataTableService.filterStateCheck(config);
                if (id !== '') {
                    id = id.join(',');
                }
            }
            if (id === '') {
                toolDialog.showModal({
                    type: 'warn',
                    value: '请选中需要 <span class="g-c-blue1">"' + action_map[action] + '"</span> ' + type_map[type] + '操作的数据'
                });
                return false;
            }

            /*适配参数*/
            if (action === 'forbid' || action === 'enabled') {
                var param = {
                    token: cacheparam.token,
                    adminId: cacheparam.adminId,
                    ids: id,
                    operate: action === 'forbid' ? 1 : 2
                };
                toolDialog.sureDialog('', function () {
                    /*请求数据*/
                    toolUtil
                        .requestHttp({
                            url: '/provider/operate',
                            debug: config.debug,
                            method: config.method,
                            data: config.data
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
                                                value: action_map[action] + '供应商失败'
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
                                            value: action_map[action] + '供应商成功'
                                        });
                                        /*清除全选缓存*/
                                        if (type === 'base') {
                                            dataTableService.clearActionCahce(index);
                                        }
                                        /*重新加载数据*/
                                        dataTableService.getTableData({
                                            index: config.index,
                                            table: config.table,
                                            condition: config.condition
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
                                        console.log(action_map[action] + '供应商失败');
                                    }
                                } else {
                                    console.log(action_map[action] + '供应商失败');
                                }
                            });
                }, action === 'forbid' ? "禁用后，该供应商将禁止使用，在APP中查看不到该供应商，商品也归纳至禁售商品中，是否禁用？" : "启用后，该供应商将可以使用，在APP中能查看该供应商，商品也归纳至可售商品中，是否启用？", true);
            } else if (action === 'goods') {
                /*商品列*/
                /*设置临时缓存*/
                assistCommon.changeCache('tempMap', {
                    id: id,
                    legalname: $btn.attr('data-legalname'),
                    storename: $btn.attr('data-storename'),
                    auditstatus: $btn.attr('data-auditstatus')
                });
                /*路由*/
                $state.go('provider.goods');
                return false;
            }
        }

        /*初始化依赖渲染*/
        function renderView(config, fn) {
            var goodscache = config.cache;

            if (goodscache && goodscache.providerName !== '') {
                for (var i in goodscache) {
                    if (i === 'auditStatus') {
                        config.record[i] = parseInt(goodscache[i], 10);
                    } else {
                        config.record[i] = goodscache[i];
                    }
                }
                if (fn && typeof fn === 'function') {
                    fn.call();
                }
            }
        }


        /*接口实现--私有*/


    }


}());