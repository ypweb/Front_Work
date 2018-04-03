/*admin_member:成员设置*/
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
                salesmanedit_power = public_tool.getKeyPower('mall-salesman-update', powermap),
                salesmanshow_power = public_tool.getKeyPower('mall-salesman-view', powermap);

            /*清除编辑缓存*/
            public_tool.removeParams('mall-salesman-add');


            /*dom引用和相关变量定义*/
            var $salesman_manage_wrap = $('#salesman_manage_wrap')/*表格*/,
                module_id = 'mall-salesman-list'/*模块id，主要用于本地存储传值*/,
                dia = dialog({
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
                $show_detail_wrap = $('#show_detail_wrap')/*详情容器*/,
                $show_detail_title = $('#show_detail_title')/*详情容器*/,
                $show_detail_content = $('#show_detail_content')/*详情内容*/,
                detail_map = {
                    name: "业务员名称",
                    grade: "运营商级别",
                    cellphone: "业务员手机号码",
                    regionName: "归属地区",
                    status: "状态",
                    remark: "业务员描述"
                };


            /*列表请求配置*/
            var salesman_page = {
                    page: 1,
                    pageSize: 20,
                    total: 0
                },
                salesman_config = {
                    $salesman_manage_wrap: $salesman_manage_wrap,
                    $admin_page_wrap: $admin_page_wrap,
                    config: {
                        processing: true, /*大消耗操作时是否显示处理状态*/
                        deferRender: true, /*是否延迟加载数据*/
                        autoWidth: true, /*是否*/
                        paging: false,
                        ajax: {
                            url: "http://10.0.5.226:8082/mall-agentbms-api/salesmans/related",
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
                                salesman_page.page = result.page;
                                salesman_page.pageSize = result.pageSize;
                                salesman_page.total = result.count;
                                /*分页调用*/
                                $admin_page_wrap.pagination({
                                    pageSize: salesman_page.pageSize,
                                    total: salesman_page.total,
                                    pageNumber: salesman_page.page,
                                    onSelectPage: function (pageNumber, pageSize) {
                                        /*再次查询*/
                                        var param = salesman_config.config.ajax.data;
                                        param.page = pageNumber;
                                        param.pageSize = pageSize;
                                        salesman_config.config.ajax.data = param;
                                        getColumnData(salesman_page, salesman_config);
                                    }
                                });
                                return result ? result.list || [] : [];
                            },
                            data: {
                                roleId: decodeURIComponent(logininfo.param.roleId),
                                adminId: decodeURIComponent(logininfo.param.adminId),
                                token: decodeURIComponent(logininfo.param.token),
                                grade: decodeURIComponent(logininfo.param.grade),
                                page: 1,
                                pageSize: 20
                            }
                        },
                        info: false,
                        searching: true,
                        order: [[0, "desc"]],
                        columns: [
                            {
                                "data": "name"
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
                                            0: "正常",
                                            1: "停用"
                                        },
                                        str = '';

                                    if (stauts === 0) {
                                        str = '<div class="g-c-info">' + statusmap[stauts] + '</div>';
                                    } else if (stauts === 1) {
                                        str = '<div class="g-c-gray12">' + statusmap[stauts] + '</div>';
                                    }
                                    return str;
                                }
                            },
                            {
                                "data": "id",
                                "render": function (data, type, full, meta) {
                                    var id = parseInt(data, 10),
                                        btns = '';

                                    if (salesmanedit_power) {
                                        btns += '<span data-action="update" data-id="' + id + '"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-pencil"></i>\
											<span>编辑</span>\
											</span>';
                                    }

                                    if (salesmanshow_power) {
                                        btns += '<span data-action="select" data-id="' + id + '"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-file-text-o"></i>\
											<span>查看</span>\
											</span>';
                                    }

                                    return btns;
                                }
                            }
                        ]
                    }
                };


            /*初始化请求*/
            getColumnData(salesman_page, salesman_config);


            /*事件绑定*/
            /*绑定查看，修改操作*/
            var operate_item;
            $salesman_manage_wrap.delegate('span', 'click', function (e) {
                e.stopPropagation();
                e.preventDefault();

                var target = e.target,
                    $this,
                    id,
                    action,
                    $tr;

                //适配对象
                if (target.className.indexOf('btn') !== -1) {
                    $this = $(target);
                } else {
                    $this = $(target).parent();
                }
                $tr = $this.closest('tr');
                id = $this.attr('data-id');
                action = $this.attr('data-action');

                /*修改,编辑操作*/
                if (action === 'update') {
                    public_tool.setParams('mall-salesman-add', {
                        'id': id
                    });
                    location.href = 'mall-salesman-add.html';
                } else if (action === 'select') {
                    showDetail(id, $tr);
                }
            });


            /*绑定关闭详情*/
            $show_detail_wrap.on('hide.bs.modal', function () {
                if (operate_item) {
                    setTimeout(function () {
                        operate_item.removeClass('item-lighten');
                        operate_item = null;
                    }, 1000);
                }
            });


        }


        /*获取数据*/
        function getColumnData(page, opt) {
            if (table === null) {
                table = opt.$salesman_manage_wrap.DataTable(opt.config);
            } else {
                table.ajax.config(opt.config.ajax).load();
            }
        }


        /*查看详情*/
        function showDetail(id, $tr) {
            if (!id) {
                return false;
            }

            var detailconfig = {
                url: "http://10.0.5.226:8082/mall-agentbms-api/salesman/detail",
                dataType: 'JSON',
                method: 'post',
                data: {
                    "id": id,
                    "adminId": decodeURIComponent(logininfo.param.adminId),
                    "token": decodeURIComponent(logininfo.param.token),
                    "grade": decodeURIComponent(logininfo.param.grade)
                }
            };
            $.ajax(detailconfig)
                .done(function (resp) {
                    var code = parseInt(resp.code, 10);
                    if (code !== 0) {
                        console.log(resp.message);
                        dia.content('<span class="g-c-bs-warning g-btips-warn">' + (resp.message || "操作失败") + '</span>').show();
                        setTimeout(function () {
                            dia.close();
                        }, 2000);
                        return false;
                    }
                    /*是否是正确的返回数据*/
                    var list = resp.result,
                        str = '',
                        istitle = false;

                    if (!$.isEmptyObject(list)) {
                        for (var j in list) {
                            if (typeof detail_map[j] !== 'undefined') {
                                if (j === 'name' || j === 'Name') {
                                    istitle = true;
                                    $show_detail_title.html('"<span class="g-c-info">"' + list[j] + '" 业务员</span>"详情信息');
                                } else if (j === 'grade') {
                                    var grademap = {
                                        3: "运营商级别--省代",
                                        2: "运营商级别--市代",
                                        1: "运营商级别--县代"
                                    }
                                    str += '<tr><th>' + detail_map[j] + ':</th><td>' + grademap[list[j]] + '</td></tr>';
                                } else if (j === 'cellphone') {
                                    str += '<tr><th>' + detail_map[j] + ':</th><td>' + public_tool.phoneFormat(list[j]) + '</td></tr>';
                                } else if (j === 'status') {
                                    var statusmap = {
                                        0: "正常",
                                        1: "停用"
                                    };
                                    str += '<tr><th>' + detail_map[j] + ':</th><td>' + statusmap[list[j]] + '</td></tr>';
                                } else {
                                    str += '<tr><th>' + detail_map[j] + ':</th><td>' + list[j] + '</td></tr>';
                                }
                            }

                        }
                        if (!istitle) {
                            $show_detail_title.html('运营商详情信息');
                        }
                        /*添加高亮状态*/
                        if (operate_item) {
                            operate_item.removeClass('item-lighten');
                            operate_item = null;
                        }
                        operate_item = $tr.addClass('item-lighten');
                        $show_detail_content.html(str);
                        $show_detail_wrap.modal('show', {backdrop: 'static'});
                    } else {
                        $show_detail_content.html('');
                        $show_detail_title.html('');
                    }
                })
                .fail(function (resp) {
                    console.log(resp.message);
                    dia.content('<span class="g-c-bs-warning g-btips-warn">' + (resp.message || "操作失败") + '</span>').show();
                    setTimeout(function () {
                        dia.close();
                    }, 2000);
                });

        }


    });


})(jQuery);