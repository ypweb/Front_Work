/*管理模块应用--控制器*/
(function () {
    'use strict';

    /*创建控制器*/
    angular
        .module('app')
        .controller('adminListController', adminListController);


    /*控制注入依赖*/
    adminListController.$inject = ['toolUtil', 'assistCommon', 'pageService', 'dataTableService', 'adminService', 'adminListService', 'testService'];


    /*控制器实现*/
    function adminListController(toolUtil, assistCommon, pageService, dataTableService, adminService, adminListService, testService) {
        var vm = this,
            debug = true/*测试模式*/;


        /*模型--操作权限列表*/
        vm.powerlist = adminService.getCurrentPower();

        /*模型--表格*/
        vm.table = {
            sequence: [{
                index: 1,
                action: true,
                column: true/*列控制操作*/,
                colgroup: true/*分组操作*/
            }]/*分页序列,表格序列*/,
            /*列控制*/
            table_column1: {
                init_len: 7/*数据有多少列*/,
                columnshow: true/*初始化显示隐藏*/,
                hide_list: [4, 5]/*需要隐藏的的列序号*/,
                header: ['昵称', '真实名称', '邮箱', '手机', '登录时间', '登录次数', '操作']/*头部姓名*/,
                action: true/*是否有操作*/
            },
            /*分页配置*/
            table_page1: {
                page: 1,
                pageSize: 20,
                total: 0
            },
            /*请求配置*/
            table_config1: {
                processing: true, /*大消耗操作时是否显示处理状态*/
                deferRender: true, /*是否延迟加载数据*/
                autoWidth: true, /*是否*/
                paging: false,
                ajax: {
                    url: debug ? 'json/test.json' : toolUtil.adaptReqUrl('/admin/list'),
                    dataType: 'JSON',
                    method: 'post',
                    dataSrc: function (json) {
                        if (debug) {
                            var json = testService.test({
                                map: {
                                    'id': 'guid',
                                    'name': 'value',
                                    'realName': 'name',
                                    'email': 'email',
                                    'phone': 'mobile',
                                    'loginTime': 'datetime',
                                    'logincount': 'id'
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
                        "data": "name"
                    },
                    {
                        "data": "realName"
                    },
                    {
                        "data": "email"
                    },
                    {
                        "data": "phone",
                        "render": function (data, type, full, meta) {
                            return toolUtil.phoneFormat(data);
                        }
                    },
                    {
                        "data": "loginTime"
                    },
                    {
                        "data": "logincount"
                    },
                    {
                        /*to do*/
                        "data": "id",
                        "render": function (data, type, full, meta) {
                            var btns = '';

                            /*查看订单*/
                            if (vm.powerlist.update) {
                                btns += '<span data-action="update" data-id="' + data + '"  class="btn-operate-gray">编辑权限</span>';
                            }
                            if (vm.powerlist.delete) {
                                btns += '<span data-action="delete" data-id="' + data + '"  class="btn-operate-gray">删除权限</span>';
                            }
                            return btns;
                        }
                    }
                ]
            },
            table_cache1: null
        };

        /*模型--欢迎页面*/
        vm.welcome = false;

        /*模型--操作记录*/
        vm.record = {
            filter: ''/*表格过滤*/
        };

        /*初始化配置,渲染*/
        _initRender_();


        /*对外接口*/
        vm.getTableData = getTableData/*获取数据*/;
        vm.doItemAction = doItemAction/*操作表格*/;
        vm.filterTableData = filterTableData/*过滤表格数据*/;


        /*接口实现--公有*/
        /*数据列表初始化*/
        function getTableData() {
            dataTableService.getTableData({
                table: vm.table,
                index: 1
            });
        }

        /*操作表格*/
        function doItemAction(config) {
            /*是否调试*/
            config['debug'] = debug;
            config['table'] = vm.table;
            adminListService.doItemAction(config);
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
            dataTableService.initTable(vm.table,{
                doAction:doItemAction/*操作回调*/
            });
            /*获取表格数据*/
            getTableData();
            /*清除临时缓存*/
            assistCommon.changeCache('tempMap');
        }


    }


}());