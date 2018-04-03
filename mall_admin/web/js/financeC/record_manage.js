(function ($) {
    'use strict';
    $(function () {

        var table = null/*数据展现*/;

        /*初始化数据*/
        if (public_tool.initMap.isrender) {
            /*菜单调用*/
            var logininfo = public_tool.initMap.loginMap;
            public_tool.loadSideMenu(public_vars.$mainmenu, public_vars.$main_menu_wrap, {
                url: 'http://10.0.5.226:8082/mall-buzhubms-api/module/menu',
                async: false,
                type: 'post',
                param: {
                    roleId: decodeURIComponent(logininfo.param.roleId),
                    adminId: decodeURIComponent(logininfo.param.adminId),
                    grade: decodeURIComponent(logininfo.param.grade),
                    token: decodeURIComponent(logininfo.param.token)
                },
                datatype: 'json'
            });


            /*权限调用*/

            /*dom引用和相关变量定义*/
            var debug = false,
                $admin_list_wrap = $('#admin_list_wrap')/*表格*/,
                module_id = 'bzw-finance-recordmanage'/*模块id，主要用于本地存储传值*/,
                $admin_page_wrap = $('#admin_page_wrap');


            /*查询对象*/
            var $search_searchContent = $('#search_searchContent'),
                $search_searchColumn = $('#search_searchColumn'),
                $search_timeStart = $('#search_timeStart'),
                $search_timeEnd = $('#search_timeEnd'),
                $admin_search_btn = $('#admin_search_btn'),
                $admin_search_clear = $('#admin_search_clear');


            /*列表请求配置*/
            var record_page = {
                    page: 1,
                    pageSize: 10,
                    total: 0
                },
                record_config = {
                    $admin_list_wrap: $admin_list_wrap,
                    $admin_page_wrap: $admin_page_wrap,
                    config: {
                        processing: true, /*大消耗操作时是否显示处理状态*/
                        deferRender: true, /*是否延迟加载数据*/
                        autoWidth: true, /*是否*/
                        paging: false,
                        ajax: {
                            url: debug ? "../../json/test.json" : "http://10.0.5.226:8082/mall-buzhubms-api/sh/finance/capitalflowlog/get/list",
                            dataType: 'JSON',
                            method: 'post',
                            dataSrc: function (json) {
                                if (debug) {
                                    var json = testWidget.test({
                                        map: {
                                            id: 'sequence',
                                            orderNumber: 'guid',
                                            content: 'remark',
                                            amount: 'money',
                                            nickName: 'name',
                                            source: 'rule,1,2',
                                            paymentType: 'rule,1,2,3',
                                            createTime: 'datetime'
                                        },
                                        mapmin: 5,
                                        mapmax: 10,
                                        type: 'list'
                                    });
                                }
                                var code = parseInt(json.code, 10);
                                if (code !== 0) {
                                    if (code === 999) {
                                        /*清空缓存*/
                                        public_tool.loginTips(function () {
                                            public_tool.clear();
                                            public_tool.clearCacheData();
                                        });
                                    }
                                    console.log(json.message);
                                    return [];
                                }
                                var result = json.result;
                                if (typeof result === 'undefined') {
                                    return [];
                                }
                                /*设置分页*/
                                record_page.page = result.page;
                                record_page.pageSize = result.pageSize;
                                record_page.total = result.count;
                                /*分页调用*/
                                $admin_page_wrap.pagination({
                                    pageSize: record_page.pageSize,
                                    total: record_page.total,
                                    pageNumber: record_page.page,
                                    onSelectPage: function (pageNumber, pageSize) {
                                        /*再次查询*/
                                        var param = record_config.config.ajax.data;
                                        param.page = pageNumber;
                                        param.pageSize = pageSize;
                                        record_config.config.ajax.data = param;
                                        getColumnData(record_page, record_config);
                                    }
                                });
                                return result ? result.list || [] : [];
                            },
                            data: {
                                adminId: decodeURIComponent(logininfo.param.adminId),
                                token: decodeURIComponent(logininfo.param.token),
                                page: 1,
                                pageSize: 10
                            }
                        },
                        info: false,
                        searching: true,
                        order: [[1, "desc"]],
                        columns: [
                            {
                                "data": "orderNumber"
                            },
                            {
                                "data": "content"
                            },
                            {
                                "data": "amount",
                                "render": function (data, type, full, meta) {
                                    return '￥:' + public_tool.moneyCorrect(data, 15, false)[0];
                                }
                            },
                            {
                                "data": "nickName"
                            },
                            {
                                "data": "paymentType",
                                "render": function (data, type, full, meta) {
                                    var stauts = parseInt(data, 10),
                                        statusmap = {
                                            1: "微信支付",
                                            2: "支付宝支付",
                                            3: "其他"
                                        };
                                    return statusmap[stauts] || '';
                                }
                            },
                            {
                                "data": "createTime"
                            }
                        ]
                    }
                };


            /*初始化请求*/
            getColumnData(record_page, record_config);


            /*清空查询条件*/
            $admin_search_clear.on('click', function () {
                /*清除查询条件*/
                $.each([$search_searchColumn, $search_searchContent, $search_timeStart, $search_timeEnd], function () {
                    this.val('');
                });
                /*重置分页*/
                record_page.page = 1;
                record_page.total = 0;
                record_config.config.ajax.data['page'] = record_page.page;
            }).trigger('click');

            /*日历查询*/
            datePickWidget.datePick([$search_timeStart, $search_timeEnd]);

            /*联合查询*/
            $admin_search_btn.on('click', function () {
                var data = $.extend(true, {}, record_config.config.ajax.data);

                $.each([$search_searchColumn, $search_timeStart, $search_timeEnd], function () {
                    var text = this.val(),
                        selector = this.selector.slice(1),
                        key = selector.split('_'),
                        isColumn = selector.indexOf('Column') !== -1;

                    if (isColumn) {
                        /*关联类型和关键字*/
                        var content = public_tool.trims($search_searchContent.val());
                        if (text !== "" && content !== '') {
                            data[key[1]] = text;
                            data['searchContent'] = content;
                        } else {
                            delete data['searchColumn'];
                            delete data['searchContent'];
                        }
                    } else {
                        if (text === "") {
                            if (typeof data[key[1]] !== 'undefined') {
                                delete data[key[1]];
                            }
                        } else {
                            data[key[1]] = text;
                        }
                    }
                });
                record_config.config.ajax.data = $.extend(true, {}, data);
                getColumnData(record_page, record_config);
            });


        }


        /*获取数据*/
        function getColumnData(page, opt) {
            if (table === null) {
                table = opt.$admin_list_wrap.DataTable(opt.config);
            } else {
                table.ajax.config(opt.config.ajax).load();
            }
        }

    });


})(jQuery);