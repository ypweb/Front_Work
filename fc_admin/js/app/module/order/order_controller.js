/*首页控制器*/
angular.module('app')
    .controller('OrderController', ['orderService', 'testService', 'toolUtil', '$scope', function (orderService, testService, toolUtil, $scope) {
        var self = this;

        /*模型--操作权限列表*/
        this.powerlist = orderService.getCurrentPower();


        /*jquery dom缓存:主要是切换路由时，创建的dom缓存引用与现有的dom引用不一致，需要加载视图更新现有dom引用*/
        var jq_dom = {
            $submenu_scroll_wrap: $('#submenu_scroll_wrap'),
            $admin_order_submenu: $('#admin_order_submenu'),
            $admin_table_checkcolumn: $('#admin_table_checkcolumn'),
            $admin_page_wrap: $('#admin_page_wrap'),
            $admin_list_wrap: $('#admin_list_wrap'),
            $admin_list_colgroup: $('#admin_list_colgroup'),
            $admin_batchlist_wrap: $('#admin_batchlist_wrap'),
            $search_startTime: $('#search_startTime'),
            $search_endTime: $('#search_endTime'),
            $admin_orderdetail_dialog: $('#admin_orderdetail_dialog'),
            $admin_orderdetail_show: $('#admin_orderdetail_show'),
            $admin_stock_checkall: $('#admin_stock_checkall'),
            $admin_stock_dialog: $('#admin_stock_dialog'),
            $admin_stock_show: $('#admin_stock_show'),
            $admin_stock_list: $('#admin_stock_list'),
            $admin_stock_detail: $('#admin_stock_detail')
        };
        /*切换路由时更新dom缓存*/
        orderService.initJQDom(jq_dom);


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


        /*模型--配货*/
        this.stock = {
            type: 0/*0:人工，1:系统*/,
            stockid: ''/*订单序列*/,
            stocknumber:''/*订单号*/,
            stockbtn: 0/*配货单按钮*/,
            stocklist: false/*查看配货列表*/,
            stockdetail: false/*查看配货详情*/,
            /*全选*/
            tablecheckall: {
                checkall_flag: true,
                $bodywrap: jq_dom.$admin_stock_show,
                $checkall: jq_dom.$admin_stock_checkall,
                checkvalue: 0/*默认未选中*/,
                checkid: []/*默认索引数据为空*/,
                checkitem: []/*默认node数据为空*/,
                highactive: 'item-lightenbatch',
                checkactive: 'admin-batchitem-checkactive',
                checkfn: function (flag) {
                    $scope.$apply(function () {
                        self.stock.stockbtn = flag;
                    });
                }
            }
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
                        url: /*toolUtil.adaptReqUrl('/organization/goodsorder/list')*/'json/test.json'/*测试地址*/,
                        dataType: 'JSON',
                        method: 'post',
                        dataSrc: function (json) {
                            var json = testService.test({
                                map: {
                                    'id': 'id',
                                    'merchantName': 'value',
                                    'merchantPhone': 'mobile',
                                    'orderTime': 'datetime',
                                    'orderNumber': 'guid',
                                    'orderState': 'rule,0,1,6,9,20,21',
                                    'totalMoney': 'money',
                                    'paymentType': 'rule,1,2,3'
                                },
                                mapmin: 2,
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
                                    orderService.loginOut();
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
                                        orderService.getColumnData(self.table, self.record);
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
                            "data": "totalMoney",
                            "render": function (data, type, full, meta) {
                                return toolUtil.moneyCorrect(data, 12)[0];
                            }
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
                            "data": "paymentType",
                            "render": function (data, type, full, meta) {
                                var stauts = parseInt(data, 10),
                                    statusmap = {
                                        1: "微信",
                                        2: "支付宝",
                                        3: "其它"
                                    };
                                return '<div class="g-c-blue3">' + statusmap[stauts] + '</div>';
                            }
                        },
                        {
                            "data": "orderTime"
                        },
                        {
                            /*to do*/
                            "data": "id",
                            "render": function (data, type, full, meta) {
                                var btns = '';

                                /*查看订单*/
                                if (self.powerlist.order_details) {
                                    btns += '<span data-action="detail" data-orderNumber="'+full.orderNumber+'" data-id="' + data + '"  class="btn-operate">查看</span>';
                                    if (parseInt(full.orderState, 10) === 6) {
                                        btns += '<span data-action="stock" data-id="' + data + '"  class="btn-operate">配货</span>';
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
                init_len: 8/*数据有多少列*/,
                column_flag: true,
                ischeck: false, /*是否有全选*/
                columnshow: true,
                $column_wrap: jq_dom.$admin_table_checkcolumn/*控制列显示隐藏的容器*/,
                $bodywrap: jq_dom.$admin_batchlist_wrap/*数据展现容器*/,
                hide_list: [5, 6]/*需要隐藏的的列序号*/,
                hide_len: 2,
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
                        orderService.doItemAction({
                            record: self.record,
                            table: self.table,
                            stock: self.stock
                        }, config);
                    }
                }
            }
        };


        /*初始化服务--虚拟挂载点，或者初始化参数*/
        orderService.getRoot(self.record);
        /*初始化服务--日历查询*/
        orderService.datePicker(this.record);
        /*初始化服务--绑定配货全选*/
        orderService.stockCheckAll({
            stock: self.stock
        });


        /*菜单服务--初始化菜单*/
        this.initSubMenu = function () {
            orderService.getSubMenu({
                table: self.table,
                record: self.record
            });
        };
        /*菜单服务--显示隐藏菜单*/
        this.toggleSubMenu = function (e) {
            orderService.toggleSubMenu(e, {
                table: self.table,
                record: self.record
            });
        };


        /*配货服务--切换不同的时间条件*/
        this.changeStockType = function ($event) {
            var target = $event.target,
                node = target.nodeName.toLowerCase();
            if (node === 'div' || node === 'span') {
                return false;
            }

            orderService.changeStockType({
                stock: self.stock
            });
            orderService.closeStockList({
                stock:self.stock
            });
        };

        /*配货服务--查看配货列表*/
        this.showStockList = function () {
            orderService.showStockList({
                stock: self.stock
            });
        };
        /*配货服务--查看配货详情*/
        this.showStockDetail = function ($event) {
            var target = $event.target,
                node = target.nodeName.toLowerCase();
            if (node === 'span') {
                var $this = $(target);
                if ($this.hasClass('btn-operate')) {
                    orderService.showStockDetail({
                        stock: self.stock,
                        id:$this.attr('data-id')
                    });
                }
            }
        };
        /*配货服务--关闭配货列表*/
        this.closeStockList=function () {
            orderService.closeStockList({
                stock:self.stock
            });
        };
        /*配货服务--关闭配货详情*/
        this.closeStockDetail=function () {
            orderService.closeStockDetail({
                stock:self.stock
            });
        };



        /*数据服务--过滤数据*/
        this.filterDataTable = function () {
            orderService.filterDataTable(self.table, self.record);
        };


        /*查询订单*/
        this.queryOrder = function () {
            orderService.getColumnData(self.table, self.record);
        };


        /*弹出层显示隐藏*/
        this.toggleModal = function (config) {
            orderService.toggleModal(config);
            if(config.display==='hide' && config.area==='stock'){
                orderService.closeStock({
                    stock:self.stock
                });
            }
        };


    }]);