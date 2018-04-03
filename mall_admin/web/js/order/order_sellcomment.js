(function ($) {
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


            /*dom引用和相关变量定义*/
            var debug = true,
                $admin_list_wrap = $('#admin_list_wrap')/*表格*/,
                module_id = 'bzw-order-sellcomment'/*模块id，主要用于本地存储传值*/,
                dia = dialog({
                    zIndex: 2000,
                    title: '温馨提示',
                    okValue: '确定',
                    width: 300,
                    ok: function () {
                        this.close();
                        return false;
                    },
                    cancel: false
                })/*一般提示对象*/,
                $admin_page_wrap = $('#admin_page_wrap'),
                operate_item;


            /*查询对象*/
            var $search_customerName = $('#search_customerName'),
                $search_providerName = $('#search_providerName'),
                $admin_search_btn = $('#admin_search_btn'),
                $admin_search_clear = $('#admin_search_clear');


            /*列表请求配置*/
            var buycomment_page = {
                    page: 1,
                    pageSize: 10,
                    total: 0
                },
                buycomment_config = {
                    $admin_list_wrap: $admin_list_wrap,
                    $admin_page_wrap: $admin_page_wrap,
                    config: {
                        processing: true, /*大消耗操作时是否显示处理状态*/
                        deferRender: true, /*是否延迟加载数据*/
                        autoWidth: true, /*是否*/
                        paging: false,
                        ajax: {
                            url: debug ? "../../json/test.json" : "http://10.0.5.226:8082/mall-buzhubms-api/goodscomment/customer/list",
                            dataType: 'JSON',
                            method: 'post',
                            dataSrc: function (json) {
                                if (debug) {
                                    var json = testWidget.test({
                                        map: {
                                            id: 'sequence',
                                            goodsName:'goods',
                                            customerName: 'name',
                                            providerName: 'name',
                                            content: 'remark',
                                            addTime: 'datetime'
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
                                buycomment_page.page = result.page;
                                buycomment_page.pageSize = result.pageSize;
                                buycomment_page.total = result.count;
                                /*分页调用*/
                                $admin_page_wrap.pagination({
                                    pageSize: buycomment_page.pageSize,
                                    total: buycomment_page.total,
                                    pageNumber: buycomment_page.page,
                                    onSelectPage: function (pageNumber, pageSize) {
                                        /*再次查询*/
                                        var param = buycomment_config.config.ajax.data;
                                        param.page = pageNumber;
                                        param.pageSize = pageSize;
                                        buycomment_config.config.ajax.data = param;
                                        getColumnData(buycomment_page, buycomment_config);
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
                        order: [[0, "desc"], [1, "desc"]],
                        columns: [
                            {
                                "data": "goodsName"
                            },
                            {
                                "data": "customerName"
                            },
                            {
                                "data": "providerName"
                            },
                            {
                                "data": "content"
                            },
                            {
                                "data": "addTime"
                            }
                        ]
                    }
                };


            /*清空查询条件*/
            $admin_search_clear.on('click', function () {
                /*清除查询条件*/
                $.each([$search_customerName, $search_providerName], function () {
                    this.val('');
                });
                /*重置分页*/
                buycomment_page.page = 1;
                buycomment_page.total = 0;
                buycomment_config.config.ajax.data['page'] = buycomment_page.page;
            }).trigger('click');

            /*联合查询*/
            $admin_search_btn.on('click', function () {
                var data = $.extend(true, {}, buycomment_config.config.ajax.data);

                $.each([$search_customerName, $search_providerName], function () {
                    var text = this.val(),
                        selector = this.selector.slice(1),
                        key = selector.split('_');

                    if (text === "") {
                        if (typeof data[key[1]] !== 'undefined') {
                            delete data[key[1]];
                        }
                    } else {
                        data[key[1]] = text;
                    }
                });
                buycomment_config.config.ajax.data = $.extend(true, {}, data);
                getColumnData(buycomment_page, buycomment_config);
            });


            /*初始化请求*/
            getColumnData(buycomment_page, buycomment_config);
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