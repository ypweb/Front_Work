/*管理模块应用--控制器*/
(function () {
    'use strict';

    /*创建控制器*/
    angular
        .module('app')
        .controller('providerListController', providerListController);


    /*控制注入依赖*/
    providerListController.$inject = ['toolUtil', 'assistCommon', 'pageService', 'dataTableService', 'providerService', 'providerListService', 'testService'];


    /*控制器实现*/
    function providerListController(toolUtil, assistCommon, pageService, dataTableService, providerService, providerListService, testService) {
        var vm = this,
            debug = true/*测试模式*/;


        /*模型--操作权限列表*/
        vm.powerlist = providerService.getCurrentPower();

        /*模型--表格*/
        vm.table = {
            sequence: [{
                index: 1,
                action: true/*点击操作*/,
                check: true/*全选操作*/,
                column: true/*列控制操作*/,
                colgroup: true/*分组操作*/
            }]/*分页序列,表格序列*/,
            condition: {
                1: ['legalName', 'storeName', 'auditStatus']/*数据列1查询条件*/
            }/*查询条件*//*{1:[**,**]}*/,
            /*分页配置*/
            table_page1: {
                page: 1,
                pageSize: 20,
                total: 0
            },
            /*列控制*/
            table_column1: {
                init_len: 10/*数据有多少列*/,
                columnshow: true/*初始化显示隐藏*/,
                hide_list: [3, 4, 5, 8]/*需要隐藏的的列序号*/,
                header: ['全选', '用户名/姓名', '店铺名称', '公司名称', '联系电话', '所在地', '状态', '审核状态', '创建时间', '操作']/*头部姓名*/,
                action: true/*是否有操作*/,
                check: true/*是否有全选*/
            },
            /*请求配置*/
            table_config1: {
                processing: true, /*大消耗操作时是否显示处理状态*/
                deferRender: true, /*是否延迟加载数据*/
                autoWidth: true, /*是否*/
                paging: false,
                ajax: {
                    url: debug ? 'json/test.json' : toolUtil.adaptReqUrl('/provider/list'),
                    dataType: 'JSON',
                    method: 'post',
                    dataSrc: function (json) {
                        if (debug) {
                            var json = testService.test({
                                map: {
                                    'id': 'sequence',
                                    'legalName': 'name',
                                    'storeName': 'value',
                                    'companyName': 'text',
                                    'telephone': 'mobile',
                                    'address': 'address',
                                    'isEnabled': 'rule,0,1',
                                    'auditStatus': 'rule,0,1,2',
                                    'createTime': 'datetime'
                                },
                                mapmin: 5,
                                mapmax: 20,
                                type: 'list'
                            })/*测试请求*/;
                        }

                        var code = parseInt(json.code, 10),
                            message = json.message;


                        if (code !== 0) {
                            if (typeof message !== 'undefined' && message !== '') {
                                console.log(message);
                            } else {
                                console.log('获取数据失败');
                            }
                            if (code === 999) {
                                /*退出系统*/
                                assistCommon.loginOut();
                            }
                            return [];
                        }
                        var result = json.result;
                        if (typeof result === 'undefined') {
                            /*重置分页*/
                            pageService.resetPage({
                                index: 1,
                                page: vm.table.table_page1
                            });
                            return [];
                        }

                        if (result) {
                            /*设置分页*/
                            pageService.renderPage({
                                index: 1,
                                page: vm.table.table_page1,
                                count: result.count,
                                onSelectPage: function (pageNumber, pageSize) {
                                    /*再次查询*/
                                    dataTableService.getTableData({
                                        pageNumber: pageNumber,
                                        pageSize: pageSize,
                                        table: vm.table,
                                        index: 1
                                    });
                                }
                            });
                            var list = result.list;
                            if (list) {
                                return list;
                            } else {
                                return [];
                            }
                        } else {
                            /*重置分页*/
                            pageService.resetPage({
                                index: 1,
                                page: vm.table.table_page1
                            });
                            return [];
                        }
                    },
                    data: {
                        page: 1,
                        pageSize: 20
                    }
                },
                info: false,
                dom: '<"g-d-hidei" s>',
                searching: true,
                order: [[1, "desc"]],
                columns: [
                    {
                        "data": "id",
                        "orderable": false,
                        "searchable": false,
                        "render": function (data, type, full, meta) {
                            return '<input data-enabled="' + full.isEnabled + '" value="' + data + '" name="providerID" type="checkbox" />';
                        }
                    },
                    {
                        "data": "legalName"
                    },
                    {
                        "data": "storeName"
                    },
                    {
                        "data": "companyName"
                    },
                    {
                        "data": "telephone",
                        "render": function (data, type, full, meta) {
                            return toolUtil.phoneFormat(data);
                        }
                    },
                    {
                        "data": "address"
                    },
                    {
                        "data": "isEnabled",
                        "render": function (data, type, full, meta) {
                            var str = '',
                                isEnabled = parseInt(data, 10);
                            if (isEnabled === 1) {
                                str = '<div class="g-c-info">启用</div>';
                            } else if (isEnabled === 0) {
                                str = '<div class="g-c-gray9">禁用</div>';
                            }
                            return str;
                        }
                    },
                    {
                        "data": "auditStatus",
                        "render": function (data, type, full, meta) {
                            var str = '',
                                isAudit = parseInt(data, 10);
                            if (isAudit === 0) {
                                str = '<div class="g-c-info">待审核</div>';
                            } else if (isAudit === 1) {
                                str = '<div class="g-c-green2">审核成功</div>';
                            } else if (isAudit === 2) {
                                str = '<div class="g-c-warn">审核失败</div>';
                            } else {
                                str = '<div class="g-c-red1">异常</div>';
                            }
                            return str;
                        }
                    },
                    {
                        "data": "createTime"
                    },
                    {
                        "data": "id",
                        "render": function (data, type, full, meta) {
                            var id = parseInt(data, 10),
                                btns = '',
                                isEnabled = parseInt(full.isEnabled, 10),
                                auditstate = parseInt(full.auditStatus, 10);

                            if (true || vm.powerlist.forbid) {
                                if (isEnabled === 1) {
                                    /*启用状态则禁用*/
                                    btns += '<span data-enabled="' + isEnabled + '" data-action="forbid" data-id="' + id + '"  class="btn-operate-gray">禁用</span>';
                                } else if (isEnabled === 0) {
                                    /*禁用状态则启用*/
                                    btns += '<span data-enabled="' + isEnabled + '"  data-action="enabled" data-id="' + id + '"  class="btn-operate-gray">启用</span>';
                                }
                            }
                            /*商品列*/
                            if (true || vm.powerlist.goods_column) {
                                btns += '<span data-action="goods" data-id="' + id + '" data-legalname="' + full.legalName + '" data-storename="' + full.storeName + '" data-auditstatus="' + auditstate + '"  class="btn-operate-gray">商品列</span>';
                            }
                            return btns;
                        }
                    }
                ]
            },
            /*table缓存*/
            table_cache1: null
        };


        /*模型--操作记录*/
        vm.record = {
            filter: ''/*表格过滤*/,
            legalName: ''/*查询条件--店主名称*/,
            storeName: ''/*查询条件--店铺名称*/,
            auditStatus: ''/*查询条件--审核状态*/
        };

        /*模型--查询下拉--审核状态*/
        vm.auditStatusItem = [{
            key: '全部',
            value: ''
        }, {
            key: '待审核',
            value: 0
        }, {
            key: '审核成功',
            value: 1
        }, {
            key: '审核失败',
            value: 2
        }];

        /*初始化配置,渲染*/
        _initRender_();


        /*对外接口*/
        vm.getTableData = getTableData/*获取数据*/;
        vm.doItemAction = doItemAction/*操作表格--单个*/;
        vm.filterTableData = filterTableData/*过滤表格数据*/;


        /*接口实现--公有*/
        /*数据列表初始化*/
        function getTableData() {
            dataTableService.getTableData({
                table: vm.table,
                condition: vm.record,
                index: 1
            });
        }

        /*操作表格--单个(批量)*/
        function doItemAction(config) {
            /*是否调试*/
            config['debug'] = debug;
            config['table'] = vm.table;
            config['condition'] = vm.record;
            providerListService.doItemAction(config);
        }


        /*过滤表格数据*/
        function filterTableData() {
            dataTableService.filterTable({
                table: vm.table,
                index: 1,
                filter: vm.record.filter
            });
        }


        /*接口实现--私有*/
        /*初始化配置,渲染*/
        function _initRender_() {
            /*分页初始化*/
            pageService.initPage({
                sequence: vm.table.sequence
            });
            /*数据列表初始化*/
            dataTableService.initTable(vm.table, {
                doAction: doItemAction/*操作回调*/
            });
            /*获取表格数据*/
            getTableData();
            /*清除临时缓存*/
            assistCommon.changeCache('tempMap');
        }


    }


}());