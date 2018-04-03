/*管理模块应用--控制器*/
(function () {
    'use strict';

    /*创建控制器*/
    angular
        .module('app')
        .controller('providerGoodsController', providerGoodsController);


    /*控制注入依赖*/
    providerGoodsController.$inject = ['toolUtil', 'assistCommon', 'pageService', 'dataTableService', 'providerService', 'providerGoodsService', 'testService', '$scope'];


    /*控制器实现*/
    function providerGoodsController(toolUtil, assistCommon, pageService, dataTableService, providerService, providerGoodsService, testService, $scope) {
        var vm = this,
            goodscache = toolUtil.getParams('tempMap')/*获取缓存*/,
            debug = true/*测试模式*/;


        /*模型--操作权限列表*/
        vm.powerlist = providerService.getCurrentPower();


        /*模型--操作记录*/
        vm.record = {
            id: ''/*供应商序列*/,
            filter: ''/*表格过滤*/,
            legalName: ''/*店主名称*/,
            providerName: ''/*店铺名称(storeName)*/,
            auditStatus: ''/*审核状态*/,
            auditMap: {
                '': '异常',
                0: '待审核',
                1: '审核成功',
                2: '审核失败'
            }/*审核状态值*/
        };

        /*解析缓存*/
        providerGoodsService.renderView({
            record: vm.record,
            cache: goodscache
        }, function () {
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
                    1: ['providerName']/*数据列1查询条件*/
                }/*查询条件*//*{1:[**,**]}*/,
                /*分页配置*/
                table_page1: {
                    page: 1,
                    pageSize: 20,
                    total: 0
                },
                /*列控制*/
                table_column1: {
                    init_len: 9/*数据有多少列*/,
                    columnshow: true/*初始化显示隐藏*/,
                    hide_list: [4, 5]/*需要隐藏的的列序号*/,
                    header: ['全选', '商品编号', '商品名称', '商品审核状态', '分类', '排序', '状态', '禁售/可售', '操作']/*头部姓名*/,
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
                        url: debug ? 'json/test.json' : toolUtil.adaptReqUrl('/goods/list'),
                        dataType: 'JSON',
                        method: 'post',
                        dataSrc: function (json) {
                            if (debug) {
                                var json = testService.test({
                                    map: {
                                        'id': 'sequence',
                                        'gcode': 'guid',
                                        'name': 'goods',
                                        'auditStatus': 'rule,0,1,2',
                                        'goodsTypeName': 'goodstype',
                                        'sort': 'id',
                                        'status': 'rule,0,1,2,3,4',
                                        'isForbidden': 'rule,true,false'
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
                                var temp_forbid = full.isForbidden === 'true' ? 1 : 0;
                                return '<input data-forbid="' + temp_forbid + '" data-status="' + full.status + '" value="' + data + '" data-auditstatus="' + full.auditStatus + '" name="goodsID" type="checkbox" />';
                            }
                        },
                        {
                            "data": "gcode"
                        },
                        {
                            "data": "name"
                        },
                        {
                            "data": "auditStatus",
                            "render": function (data, type, full, meta) {
                                var stauts = parseInt(data, 10),
                                    statusmap = {
                                        0: '待审核',
                                        1: '审核成功',
                                        2: '审核失败'
                                    },
                                    str = '';

                                if (stauts === 0) {
                                    str = '<div class="g-c-info">' + statusmap[stauts] + '</div>';
                                } else if (stauts === 1) {
                                    str = '<div class="g-c-green2">' + statusmap[stauts] + '</div>';
                                } else if (stauts === 2) {
                                    str = '<div class="g-c-warn">' + statusmap[stauts] + '</div>';
                                } else {
                                    str = '<div class="g-c-red1">异常</div>';
                                }
                                return str;
                            }
                        },
                        {
                            "data": "goodsTypeName"
                        },
                        {
                            "data": "sort"
                        },
                        {
                            "data": "status",
                            "render": function (data, type, full, meta) {
                                var stauts = parseInt(data, 10),
                                    statusmap = {
                                        0: "仓库",
                                        1: "上架",
                                        2: "下架",
                                        3: "删除",
                                        4: "待审核"
                                    },
                                    str = '';

                                if (stauts === 3) {
                                    str = '<div class="g-c-red1">' + statusmap[stauts] + '</div>';
                                } else if (stauts === 0) {
                                    str = '<div class="g-c-warn">' + statusmap[stauts] + '</div>';
                                } else if (stauts === 1) {
                                    str = '<div class="g-c-gray5">' + statusmap[stauts] + '</div>';
                                } else if (stauts === 2) {
                                    str = '<div class="g-c-gray10">' + statusmap[stauts] + '</div>';
                                } else if (stauts === 4) {
                                    str = '<div class="g-c-info">' + statusmap[stauts] + '</div>';
                                } else {
                                    str = '<div class="g-c-red1">异常</div>';
                                }
                                return str;
                            }
                        },
                        {
                            "data": "isForbidden",
                            "render": function (data, type, full, meta) {
                                var statusmap = {
                                        true: "禁售",
                                        false: "取消禁售"
                                    },
                                    str = '';

                                if (data) {
                                    str = '<div class="g-c-gray9">' + statusmap[data] + '</div>';
                                } else {
                                    str = '<div class="g-c-info">' + statusmap[data] + '</div>';
                                }
                                return str;
                            }
                        },
                        {
                            "data": "id",
                            "render": function (data, type, full, meta) {
                                var id = parseInt(data, 10),
                                    btns = '',
                                    temp_forbid = full.isForbidden,
                                    temp_status = parseInt(full.status, 10),
                                    temp_audit = parseInt(full.auditStatus, 10);

                                /*审核成功*/
                                if (vm.record.auditStatus === 1) {
                                    /*上架，下架*/
                                    if (temp_audit === 1 || vm.powerlist.updown_power) {
                                        /*审核成功状态才可上架，下架*/
                                        if (temp_status === 1) {
                                            /*上架状态则下架*/
                                            btns += '<span data-action="down" data-id="' + id + '"  class="btn-operate-gray">下架\
                                            </span>';
                                        } else if (temp_status === 2 || temp_status === 0 || temp_status === 3) {
                                            /*下架状态，仓库状态，删除状态则上架*/
                                            btns += '<span data-action="up" data-id="' + id + '"  class="btn-operate-gray">上架\
											</span>';
                                        }

                                    }
                                    if (true || vm.powerlist.forbid_power) {
                                        /*可售，禁售*/
                                        if (temp_forbid === 'true') {
                                            /*禁售状态则可售*/
                                            btns += '<span data-action="enabled"  data-id="' + id + '"  class="btn-operate-gray">取消禁售\
											</span>';
                                        } else if (temp_forbid === 'false') {
                                            /*可售状态则禁售*/
                                            btns += '<span data-action="forbid" data-id="' + id + '"  class="btn-operate-gray">禁售\
											</span>';
                                        }
                                    }
                                }
                                if (true || vm.powerlist.detail_power) {
                                    btns += '<span data-action="detail" data-id="' + id + '"  class="btn-operate-gray">查看\
									</span>';
                                }
                                return btns;
                            }
                        }
                    ]
                },
                /*table缓存*/
                table_cache1: null
            };

            /*初始化配置,渲染*/
            /*分页初始化*/
            pageService.initPage({
                sequence: vm.table.sequence
            });
            /*数据列表初始化*/
            dataTableService.initTable(vm.table, {
                doAction: doItemAction/*操作回调*/
            });
            /*获取缓存数据，初始化模型*/
            getTableData();
        });


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
            providerGoodsService.doItemAction(config);
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
    }
}());