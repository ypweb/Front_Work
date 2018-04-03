/*首页控制器*/
angular.module('app')
    .controller('InvoiceController', ['invoiceService', 'testService', 'toolUtil', function (invoiceService, testService, toolUtil) {
        var self = this;

        /*模型--操作权限列表*/
        this.powerlist = invoiceService.getCurrentPower();


        /*jquery dom缓存:主要是切换路由时，创建的dom缓存引用与现有的dom引用不一致，需要加载视图更新现有dom引用*/
        var jq_dom = {
            $submenu_scroll_wrap: $('#submenu_scroll_wrap'),
            $admin_invoice_submenu: $('#admin_invoice_submenu'),
            $admin_table_checkcolumn: $('#admin_table_checkcolumn'),
            $admin_page_wrap: $('#admin_page_wrap'),
            $admin_list_wrap: $('#admin_list_wrap'),
            $admin_list_colgroup: $('#admin_list_colgroup'),
            $admin_batchlist_wrap: $('#admin_batchlist_wrap'),
            $search_startTime: $('#search_startTime'),
            $search_endTime: $('#search_endTime'),
            $admin_invoicedetail_dialog: $('#admin_invoicedetail_dialog'),
            $admin_invoicedetail_show: $('#admin_invoicedetail_show'),
            $admin_send_dialog: $('#admin_send_dialog'),
            $admin_send_show: $('#admin_send_show')
        };
        /*切换路由时更新dom缓存*/
        invoiceService.initJQDom(jq_dom);


        /*模型--操作记录*/
        this.record = {
            iscroll_flag: true/*是否开启滚动条调用*/,
            filter: '',
            startTime: '',
            endTime: '',
            searchWord: '',
            organizationId: ''/*操作节点*/,
            prev: null/*菜单操作:上一次操作菜单*/,
            current: null/*菜单操作:当前操作菜单*/,
            currentId: ''/*根节点*/,
            currentName: ''/*根节点*/
        };


        /*模型--发货*/
        this.send = {
            sendid: ''/*订单序列*/,
            sendnumber: ''/*订单号*/
        };


        /*模型--表格缓存*/
        this.table = {
            list1_page: {
                page: 1,
                pageSize: 10,
                total: 0
            },
            list1_config: {
                config: {
                    processing: true, /*大消耗操作时是否显示处理状态*/
                    deferRender: true, /*是否延迟加载数据*/
                    autoWidth: true, /*是否*/
                    paging: false,
                    ajax: {
                        url: /*toolUtil.adaptReqUrl('/organization/invoice/list')*/'json/test.json'/*测试地址*/,
                        dataType: 'JSON',
                        method: 'post',
                        dataSrc: function (json) {
                            var json = testService.test({
                                map: {
                                    'id': 'id',
                                    'sendNumber': 'guid',
                                    'sendTime': 'datetime',
                                    'merchantName': 'value',
                                    'merchantPhone': 'mobile',
                                    'orderNumber': 'guid',
                                    'orderState': 'rule,0,1,6,9,20,21',
                                    'store': 'value'
                                },
                                mapmin: 5,
                                mapmax: 10,
                                type: 'list'
                            })/*测试请求*/;


                            var code = parseInt(json.code, 10),
                                message = json.message;


                            if (code !== 0) {
                                if (typeof message !== 'undefined' && message !== '') {
                                    console.log(message);
                                } else {
                                    console.log('获取用户失败');
                                }
                                if (code === 999) {
                                    /*退出系统*/
                                    invoiceService.loginOut();
                                }
                                return [];
                            }
                            var result = json.result;
                            if (typeof result === 'undefined') {
                                /*重置分页*/
                                self.table.list1_page.total = 0;
                                self.table.list1_page.page = 1;
                                jq_dom.$admin_page_wrap.pagination({
                                    pageNumber: self.table.list1_page.page,
                                    pageSize: self.table.list1_page.pageSize,
                                    total: self.table.list1_page.total
                                });
                                return [];
                            }

                            if (result) {
                                /*设置分页*/
                                self.table.list1_page.total = result.count;
                                /*分页调用*/
                                jq_dom.$admin_page_wrap.pagination({
                                    pageNumber: self.table.list1_page.page,
                                    pageSize: self.table.list1_page.pageSize,
                                    total: self.table.list1_page.total,
                                    onSelectPage: function (pageNumber, pageSize) {
                                        /*再次查询*/
                                        var temp_param = self.table.list1_config.config.ajax.data;
                                        self.table.list1_page.page = pageNumber;
                                        self.table.list1_page.pageSize = pageSize;
                                        temp_param['page'] = self.table.list1_page.page;
                                        temp_param['pageSize'] = self.table.list1_page.pageSize;
                                        self.table.list1_config.config.ajax.data = temp_param;
                                        invoiceService.getColumnData(self.table, self.record);
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
                                self.table.list1_page.total = 0;
                                self.table.list1_page.page = 1;
                                jq_dom.$admin_page_wrap.pagination({
                                    pageNumber: self.table.list1_page.page,
                                    pageSize: self.table.list1_page.pageSize,
                                    total: self.table.list1_page.total
                                });
                                return [];
                            }
                        },
                        data: {
                            page: 1,
                            pageSize: 10
                        }
                    },
                    info: false,
                    dom: '<"g-d-hidei" s>',
                    searching: true,
                    order: [[1, "desc"]],
                    columns: [
                        {
                            "data": "id"
                        },
                        {
                            "data": "sendNumber"
                        },
                        {
                            "data": "sendTime"
                        },
                        {
                            "data": "merchantName"
                        },
                        {
                            "data": "merchantPhone",
                            "render": function (data, type, full, meta) {
                                return toolUtil.phoneFormat(data);
                            }
                        },
                        {
                            "data": "orderNumber"
                        },
                        {
                            "data": "orderState",
                            "render": function (data, type, full, meta) {
                                var stauts = parseInt(data, 10),
                                    statusmap = {
                                        0: "待付款",
                                        1: "取消订单",
                                        6: "待发货",
                                        9: "待收货",
                                        20: "待评价",
                                        21: "已评价"
                                    },
                                    str;

                                if (stauts === 0) {
                                    str = '<div class="g-c-blue3">' + statusmap[stauts] + '</div>';
                                } else if (stauts === 1) {
                                    str = '<div class="g-c-red1">' + statusmap[stauts] + '</div>';
                                } else if (stauts === 6 || stauts === 9 || stauts === 20) {
                                    str = '<div class="g-c-warn">' + statusmap[stauts] + '</div>';
                                } else if (stauts === 21) {
                                    str = '<div class="g-c-green1">' + statusmap[stauts] + '</div>';
                                } else {
                                    str = '<div class="g-c-gray6">其他</div>';
                                }
                                return str;
                            }
                        },
                        {
                            "data": "store"
                        },
                        {
                            /*to do*/
                            "data": "guid",
                            "render": function (data, type, full, meta) {
                                var btns = '';

                                /*查看订单*/
                                if (self.powerlist.invoice_details) {
                                    btns += '<span data-action="detail" data-id="' + data + '"  class="btn-operate">查看</span>';
                                    if (self.powerlist.invoice_delivery &&　parseInt(full.orderState, 10) === 6) {
                                        btns += '<span data-action="send" data-id="' + data + '"  class="btn-operate">发货</span>';
                                    }
                                }
                                return btns;
                            }
                        }
                    ]
                }
            },
            list_table: null,
            /*列控制*/
            tablecolumn: {
                init_len: 9/*数据有多少列*/,
                column_flag: true,
                ischeck: false, /*是否有全选*/
                columnshow: true,
                $column_wrap: jq_dom.$admin_table_checkcolumn/*控制列显示隐藏的容器*/,
                $bodywrap: jq_dom.$admin_batchlist_wrap/*数据展现容器*/,
                hide_list: [0,5, 6, 7]/*需要隐藏的的列序号*/,
                hide_len: 4,
                column_api: {
                    isEmpty: function () {
                        if (self.table.list_table === null) {
                            return true;
                        }
                        return self.table.list_table.data().length === 0;
                    }
                },
                $colgroup: jq_dom.$admin_list_colgroup/*分组模型*/,
                $column_btn: jq_dom.$admin_table_checkcolumn.prev(),
                $column_ul: jq_dom.$admin_table_checkcolumn.find('ul')
            },
            /*按钮*/
            tableitemaction: {
                $bodywrap: jq_dom.$admin_batchlist_wrap,
                itemaction_api: {
                    doItemAction: function (config) {
                        invoiceService.doItemAction({
                            record: self.record,
                            table: self.table,
                            send: self.send
                        }, config);
                    }
                }
            }
        };


        /*初始化服务--虚拟挂载点，或者初始化参数*/
        invoiceService.getRoot(self.record);
        /*初始化服务--日历查询*/
        invoiceService.datePicker(this.record);


        /*菜单服务--初始化菜单*/
        this.initSubMenu = function () {
            invoiceService.getSubMenu({
                table: self.table,
                record: self.record
            });
        };
        /*菜单服务--显示隐藏菜单*/
        this.toggleSubMenu = function (e) {
            invoiceService.toggleSubMenu(e, {
                table: self.table,
                record: self.record
            });
        };



        /*发货服务--发货*/
        this.sendList = function () {
            invoiceService.sendList({
                record: self.record,
                table: self.table,
                send: self.send
            });
        };


        /*数据服务--过滤数据*/
        this.filterDataTable = function () {
            invoiceService.filterDataTable(self.table, self.record);
        };


        /*查询订单*/
        this.queryInvoice = function () {
            invoiceService.getColumnData(self.table, self.record);
        };


        /*弹出层显示隐藏*/
        this.toggleModal = function (config) {
            invoiceService.toggleModal(config);
        };


    }]);