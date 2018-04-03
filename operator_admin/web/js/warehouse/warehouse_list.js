(function ($) {
    'use strict';
    $(function () {

        var table = null/*数据展现*/;

        /*初始化数据*/
        if (public_tool.initMap.isrender) {
            /*菜单调用*/
            var logininfo = public_tool.initMap.loginMap;
            public_tool.loadSideMenu(public_vars.$mainmenu, public_vars.$main_menu_wrap, {
                url: 'http://10.0.5.226:8082/mall-agentbms-api/module/menu',
                async: false,
                type: 'post',
                param: {
                    roleId: decodeURIComponent(logininfo.param.roleId),
                    adminId: decodeURIComponent(logininfo.param.adminId),
                    sourcesChannel: decodeURIComponent(logininfo.param.sourcesChannel),
                    grade: decodeURIComponent(logininfo.param.grade),
                    token: decodeURIComponent(logininfo.param.token)
                },
                datatype: 'json'
            });
            /*权限调用*/
            var powermap = public_tool.getPower(),
                warehouseedit_power = public_tool.getKeyPower('mall-warehouse-add', powermap);


            /*清除编辑缓存*/
            public_tool.removeParams('mall-warehouse-add');


            /*dom引用和相关变量定义*/
            var $warehouse_list_wrap = $('#warehouse_list_wrap')/*表格*/,
                module_id = 'mall-warehouse-list'/*模块id，主要用于本地存储传值*/,
                $admin_page_wrap = $('#admin_page_wrap');


            /*列表请求配置*/
            var warehouse_page = {
                    page: 1,
                    pageSize: 10,
                    total: 0
                },
                warehouse_config = {
                    $warehouse_list_wrap: $warehouse_list_wrap,
                    $admin_page_wrap: $admin_page_wrap,
                    config: {
                        processing: true, /*大消耗操作时是否显示处理状态*/
                        deferRender: true, /*是否延迟加载数据*/
                        autoWidth: true, /*是否*/
                        paging: false,
                        ajax: {
                            url: "http://10.0.5.226:8082/mall-agentbms-api/warehouse/related",
                            dataType: 'JSON',
                            method: 'post',
                            dataSrc: function (json) {
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
                                warehouse_page.page = result.page;
                                warehouse_page.pageSize = result.pageSize;
                                warehouse_page.total = result.count;
                                /*分页调用*/
                                $admin_page_wrap.pagination({
                                    pageSize: warehouse_page.pageSize,
                                    total: warehouse_page.total,
                                    pageNumber: warehouse_page.page,
                                    onSelectPage: function (pageNumber, pageSize) {
                                        /*再次查询*/
                                        var param = warehouse_config.config.ajax.data;
                                        param.page = pageNumber;
                                        param.pageSize = pageSize;
                                        warehouse_config.config.ajax.data = param;
                                        getColumnData(warehouse_page, warehouse_config);
                                    }
                                });
                                return result ? result.list || [] : [];
                            },
                            data: {
                                roleId: decodeURIComponent(logininfo.param.roleId),
                                adminId: decodeURIComponent(logininfo.param.adminId),
                                token: decodeURIComponent(logininfo.param.token),
                                grade: decodeURIComponent(logininfo.param.grade),
                                sourcesChannel: decodeURIComponent(logininfo.param.sourcesChannel),
                                page: 1,
                                pageSize: 10
                            }
                        },
                        info: false,
                        searching: true,
                        order: [[0, "desc"], [2, "desc"]],
                        columns: [
                            {
                                "data": "fullName"
                            },
                            {
                                "data": "area"
                            },
                            {
                                "data": "linkman"
                            },
                            {
                                "data": "cellphone",
                                "render": function (data, type, full, meta) {
                                    return public_tool.phoneFormat(data);
                                }
                            },
                            {
                                "data": "status",
                                "render": function (data, type, full, meta) {
                                    var stauts = parseInt(data, 10),
                                        statusmap = {
                                            0: "启用",
                                            1: "停用"
                                        },
                                        str = '';

                                    if (stauts === 0) {
                                        str = '<div class="g-c-gray6">' + statusmap[stauts] + '</div>';
                                    } else if (stauts === 1) {
                                        str = '<div class="g-c-gray12">' + statusmap[stauts] + '</div>';
                                    }
                                    return str;
                                }
                            },
                            {
                                "data": "address",
                                "render": function (data, type, full, meta) {
                                    return data.toString().slice(0, 30);
                                }
                            },
                            {
                                "data": "id",
                                "render": function (data, type, full, meta) {
                                    var id = parseInt(data, 10),
                                        btns = '';

                                    if (warehouseedit_power) {
                                        btns += '<span data-action="update" data-id="' + id + '"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-pencil"></i>\
											<span>编辑</span>\
											</span>';
                                    }

                                    return btns;
                                }
                            }
                        ]
                    }
                };


            /*初始化请求*/
            getColumnData(warehouse_page, warehouse_config);


            /*事件绑定*/
            /*绑定查看，修改操作*/
            var operate_item;
            $warehouse_list_wrap.delegate('span', 'click', function (e) {
                e.stopPropagation();
                e.preventDefault();

                var target = e.target,
                    $this,
                    id,
                    action;

                //适配对象
                if (target.className.indexOf('btn') !== -1) {
                    $this = $(target);
                } else {
                    $this = $(target).parent();
                }
                id = $this.attr('data-id');
                action = $this.attr('data-action');

                /*修改,编辑操作*/
                if (action === 'update') {
                    public_tool.setParams('mall-warehouse-add', id);
                    location.href = 'mall-warehouse-add.html';
                }
            });

        }


        /*获取数据*/
        function getColumnData(page, opt) {
            if (table === null) {
                table = opt.$warehouse_list_wrap.DataTable(opt.config);
            } else {
                table.ajax.config(opt.config.ajax).load();
            }
        }


    });


})(jQuery);