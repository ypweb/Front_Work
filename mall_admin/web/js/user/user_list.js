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

            /*清除编辑数据*/
            public_tool.removeParams('bzw-user-add');
            /*清除商品库*/
            public_tool.removeParams('bzw-user-goods');


            /*权限调用*/
            var powermap = public_tool.getPower(),
                edit_power = public_tool.getKeyPower('bzw-user-edit', powermap),
                manager_power = public_tool.getKeyPower('bzw-user-manager', powermap);


            /*dom引用和相关变量定义*/
            var $admin_list_wrap = $('#admin_list_wrap')/*表格*/,
                module_id = 'bzw-user-list'/*模块id，主要用于本地存储传值*/,
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
                sureObj = public_tool.sureDialog(dia)/*回调提示对象*/,
                setSure = new sureObj();


            /*查询对象*/
            var $search_nickName = $('#search_nickName'),
                $search_phone = $('#search_phone'),
                $admin_search_btn = $('#admin_search_btn'),
                $admin_search_clear = $('#admin_search_clear');


            /*列表请求配置*/
            var user_page = {
                    page: 1,
                    pageSize: 10,
                    total: 0
                },
                user_config = {
                    $admin_list_wrap: $admin_list_wrap,
                    $admin_page_wrap: $admin_page_wrap,
                    config: {
                        processing: true, /*大消耗操作时是否显示处理状态*/
                        deferRender: true, /*是否延迟加载数据*/
                        autoWidth: true, /*是否*/
                        paging: false,
                        ajax: {
                            url: "http://10.0.5.226:8082/mall-buzhubms-api/user/list",
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
                                user_page.page = result.page;
                                user_page.pageSize = result.pageSize;
                                user_page.total = result.count;
                                /*分页调用*/
                                $admin_page_wrap.pagination({
                                    pageSize: user_page.pageSize,
                                    total: user_page.total,
                                    pageNumber: user_page.page,
                                    onSelectPage: function (pageNumber, pageSize) {
                                        /*再次查询*/
                                        var param = user_config.config.ajax.data;
                                        param.page = pageNumber;
                                        param.pageSize = pageSize;
                                        user_config.config.ajax.data = param;
                                        getColumnData(user_page, user_config);
                                    }
                                });
                                return result ? result.list || [] : [];
                            },
                            data: {
                                userId: decodeURIComponent(logininfo.param.roleId),
                                adminId: decodeURIComponent(logininfo.param.adminId),
                                token: decodeURIComponent(logininfo.param.token),
                                page: 1,
                                pageSize: 10
                            }
                        },
                        info: false,
                        searching: true,
                        order: [[3, "desc"], [2, "desc"], [4, "desc"]],
                        columns: [
                            {
                                "data": "nickName"
                            },
                            {
                                "data": "phone",
                                "render": function (data, type, full, meta) {
                                    return public_tool.phoneFormat(data);
                                }
                            },
                            {
                                "data": "createTime"
                            },
                            {
                                "data": "lastLoginTime"
                            },
                            {
                                "data": "loginTimes"
                            },
                            {
                                "data": "userType",
                                "render": function (data, type, full, meta) {
                                    var usertype = parseInt(data, 10),
                                        statusmap = {
                                            1: "普通用户",
                                            2: "供应商"
                                        },
                                        str = '';

                                    if (usertype === 1) {
                                        str = '<div class="g-c-gray6">' + statusmap[usertype] + '</div>';
                                    } else if (usertype === 2) {
                                        str = '<div class="g-c-info">' + statusmap[usertype] + '</div>';
                                    } else {
                                        str = '<div class="g-c-gray9">' + statusmap[usertype] + '</div>';
                                    }
                                    return str;
                                }
                            },
                            {
                                "data": "isEnabled",
                                "render": function (data, type, full, meta) {
                                    if (data) {
                                        return '<div class="g-c-info">启用</div>';
                                    } else {
                                        return '<div class="g-c-gray9">禁用</div>';
                                    }
                                }
                            },
                            {
                                "data": "id",
                                "render": function (data, type, full, meta) {
                                    var id = parseInt(data, 10),
                                        enabled = full.isEnabled,
                                        btns = '';


                                    if (manager_power) {
                                        btns += '<span data-nickname="' + full.nickName + '" data-action="goods" data-id="' + id + '"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-cubes"></i>\
											<span>商品库</span>\
										</span>';
                                    }


                                    if (edit_power) {
                                        btns += '<span data-action="edit" data-id="' + id + '"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-pencil"></i>\
											<span>编辑</span>\
										</span>';
                                    }
                                    if (edit_power) {
                                        if (enabled) {
                                            /*启用状态则禁用*/
                                            btns += '<span data-action="down" data-id="' + id + '"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
												<i class="fa-arrow-down"></i>\
												<span>禁用</span>\
											</span>';
                                        } else {
                                            /*禁用状态则启用*/
                                            btns += '<span data-action="up" data-id="' + id + '"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
												<i class="fa-arrow-up"></i>\
												<span>启用</span>\
											</span>';
                                        }
                                    }
                                    return btns;
                                }
                            }
                        ]
                    }
                };


            /*初始化请求*/
            getColumnData(user_page, user_config);


            /*清空查询条件*/
            $admin_search_clear.on('click', function () {
                $.each([$search_nickName, $search_phone], function () {
                    this.val('');
                });
            });
            $admin_search_clear.trigger('click');


            /*联合查询*/
            $admin_search_btn.on('click', function () {
                var data = $.extend(true, {}, user_config.config.ajax.data);

                $.each([$search_nickName, $search_phone], function () {
                    var text = this.val(),
                        selector = this.selector.slice(1),
                        key = selector.split('_');

                    if (selector.indexOf('phone') !== -1) {
                        text = public_tool.trims(text);
                    }

                    if (text === "") {
                        if (typeof data[key[1]] !== 'undefined') {
                            delete data[key[1]];
                        }
                    } else {
                        data[key[1]] = text;
                    }

                });
                user_config.config.ajax.data = $.extend(true, {}, data);
                getColumnData(user_page, user_config);
            });


            /*格式化手机号码*/
            $.each([$search_phone], function () {
                this.on('keyup', function () {
                    var phoneno = this.value.replace(/\D*/g, '');
                    if (phoneno === '') {
                        this.value = '';
                        return false;
                    }
                    this.value = public_tool.phoneFormat(this.value);
                });
            });


            /*事件绑定*/
            /*绑定查看，修改操作*/
            var operate_item;
            $admin_list_wrap.delegate('span', 'click', function (e) {
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
                if (action === 'edit') {
                    public_tool.setParams('bzw-user-add', id);
                    window.location.href = 'bzw-user-add.html';
                } else if (action === 'up' || action === 'down') {
                    if (operate_item) {
                        operate_item.removeClass('item-lighten');
                        operate_item = null;
                    }
                    operate_item = $tr.addClass('item-lighten');
                    /*确认是否启用或禁用*/
                    setSure.sure('', function (cf) {
                        /*to do*/
                        setEnabled({
                            id: id,
                            action: action,
                            tip: cf.dia || dia
                        });
                    }, action === 'up' ? '是否真要启用？启用后该用户将能使用该账号' : '是否真要禁用？禁用后该用户将不再能使用该账号', true);
                } else if (action === 'goods') {
                    public_tool.setParams('bzw-user-goods', {
                        id: id,
                        nickname: $this.attr('data-nickname')
                    });
                    window.open('bzw-user-goods.html');
                }
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


        /*启用禁用*/
        function setEnabled(obj) {
            var id = obj.id;

            if (typeof id === 'undefined') {
                return false;
            }
            var tip = obj.tip,
                action = obj.action;

            $.ajax({
                    url: "http://10.0.5.226:8082/mall-buzhubms-api/user/update",
                    dataType: 'JSON',
                    method: 'post',
                    data: {
                        id: id,
                        isEnabled: action === 'up' ? true : false,
                        roleId: decodeURIComponent(logininfo.param.roleId),
                        adminId: decodeURIComponent(logininfo.param.adminId),
                        grade: decodeURIComponent(logininfo.param.grade),
                        token: decodeURIComponent(logininfo.param.token)
                    }
                })
                .done(function (resp) {
                    var code = parseInt(resp.code, 10);
                    if (code !== 0) {
                        console.log(resp.message);
                        tip.content('<span class="g-c-bs-warning g-btips-warn">' + (resp.message || "操作失败") + '</span>').show();
                        setTimeout(function () {
                            tip.close();
                            if (operate_item) {
                                operate_item.removeClass('item-lighten');
                                operate_item = null;
                            }
                        }, 2000);
                        return false;
                    }
                    /*是否是正确的返回数据*/
                    /*添加高亮状态*/
                    tip.content('<span class="g-c-bs-success g-btips-succ">' + (action === "up" ? '启用' : '禁用') + '成功</span>').show();
                    setTimeout(function () {
                        tip.close();
                        setTimeout(function () {
                            operate_item = null;
                            /*请求数据*/
                            getColumnData(user_page, user_config);
                        }, 1000);
                    }, 1000);
                })
                .fail(function (resp) {
                    console.log(resp.message);
                    tip.content('<span class="g-c-bs-warning g-btips-warn">' + (resp.message || "操作失败") + '</span>').show();
                    setTimeout(function () {
                        tip.close();
                        if (operate_item) {
                            operate_item.removeClass('item-lighten');
                            operate_item = null;
                        }
                    }, 2000);
                });
        }


    });


})(jQuery);