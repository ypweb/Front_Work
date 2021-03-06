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
                logisticsshow_power = public_tool.getKeyPower('mall-logistics-company', powermap);


            /*dom引用和相关变量定义*/
            var $logistics_company_wrap = $('#logistics_company_wrap')/*表格*/,
                module_id = 'mall-logistics-company'/*模块id，主要用于本地存储传值*/,
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
                $logistics_company_add = $('#logistics_company_add'),
                $show_add_wrap = $('#show_add_wrap'),
                admin_logisticsadd_form = document.getElementById('admin_logisticsadd_form'),
                $admin_logisticsadd_form = $(admin_logisticsadd_form),
                $admin_id = $('#admin_id'),
                $admin_companyName = $('#admin_companyName'),
                $admin_seCode = $('#admin_seCode'),
                $admin_linkman = $('#admin_linkman'),
                $admin_cellphone = $('#admin_cellphone'),
                $admin_address = $('#admin_address'),
                $admin_sort = $('#admin_sort'),
                $admin_action = $('#admin_action'),
                resetform0 = null,
                sureObj = public_tool.sureDialog(dia)/*回调提示对象*/,
                setSure = new sureObj();


            /*查询对象*/
            var $search_searchWords = $('#search_searchWords'),
                $search_status = $('#search_status'),
                $admin_search_btn = $('#admin_search_btn'),
                $admin_search_clear = $('#admin_search_clear');


            /*重置表单*/
            admin_logisticsadd_form.reset();


            /*列表请求配置*/
            var logistics_page = {
                    page: 1,
                    pageSize: 10,
                    total: 0
                },
                logistics_config = {
                    $logistics_company_wrap: $logistics_company_wrap,
                    $admin_page_wrap: $admin_page_wrap,
                    config: {
                        processing: true, /*大消耗操作时是否显示处理状态*/
                        deferRender: true, /*是否延迟加载数据*/
                        autoWidth: true, /*是否*/
                        paging: false,
                        ajax: {
                            url: "http://10.0.5.226:8082/mall-agentbms-api/logistics/list",
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
                                logistics_page.page = result.page;
                                logistics_page.pageSize = result.pageSize;
                                logistics_page.total = result.count;
                                /*分页调用*/
                                $admin_page_wrap.pagination({
                                    pageSize: logistics_page.pageSize,
                                    total: logistics_page.total,
                                    pageNumber: logistics_page.page,
                                    onSelectPage: function (pageNumber, pageSize) {
                                        /*再次查询*/
                                        var param = logistics_config.config.ajax.data;
                                        param.page = pageNumber;
                                        param.pageSize = pageSize;
                                        logistics_config.config.ajax.data = param;
                                        getColumnData(logistics_page, logistics_config);
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
                                pageSize: 10
                            }
                        },
                        info: false,
                        searching: true,
                        order: [[0, "desc"]],
                        columns: [
                            {
                                "data": "companyName"
                            },
                            {
                                "data": "seCode"
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
                                "data": "address"
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
                                        str = '<div class="g-c-gray6">' + statusmap[stauts] + '</div>';
                                    } else if (stauts === 1) {
                                        str = '<div class="g-c-gray12">' + statusmap[stauts] + '</div>';
                                    } else {
                                        str = '<div class="g-c-red2">删除</div>';
                                    }
                                    return str;
                                }
                            },
                            {
                                "data": "id",
                                "render": function (data, type, full, meta) {
                                    var id = parseInt(data, 10),
                                        stauts = parseInt(full.status, 10),
                                        isdelete = parseInt(full.isDelete, 10),
                                        btns = '';

                                    if (logisticsshow_power && isdelete === 0) {
                                        if (stauts === 0) {
                                            /*正常*/
                                            btns += '<span data-action="edit" data-id="' + id + '"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-pencil"></i>\
											<span>编辑</span>\
											</span>\
											<span data-action="delete" data-id="' + id + '"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
                                                <i class="fa-trash"></i>\
                                                <span>删除</span>\
											</span>';
                                        }
                                    }


                                    /*if(stauts===0){
                                        /!*正常*!/
                                        btns+='<span data-action="disable" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
                                            <i class="fa-toggle-on"></i>\
                                            <span>停用</span>\
                                            </span>\
                                            <span data-action="delete" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
                                            <i class="fa-trash"></i>\
                                            <span>删除</span>\
                                            </span>\
                                            <span data-action="edit" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
                                            <i class="fa-pencil"></i>\
                                            <span>编辑</span>\
                                            </span>';
                                    }else if(stauts===1){
                                        /!*停用*!/
                                        btns+='<span data-action="enable" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
                                            <i class="fa-toggle-off"></i>\
                                            <span>启用</span>\
                                            </span>\
                                            <span data-action="delete" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
                                            <i class="fa-trash"></i>\
                                            <span>删除</span>\
                                            </span>\
                                            <span data-action="edit" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
                                            <i class="fa-file-text-o"></i>\
                                            <span>编辑</span>\
                                            </span>';
                                    }*/
                                    return btns;
                                }
                            }
                        ]
                    }
                };


            /*初始化请求*/
            getColumnData(logistics_page, logistics_config);


            /*清空查询条件*/
            $admin_search_clear.on('click', function () {
                $.each([$search_searchWords, $search_status], function () {
                    var selector = this.selector;
                    if (selector.indexOf('status') !== -1) {
                        this.find(':selected').prop({
                            'selected': false
                        });
                    } else {
                        this.val('');
                    }
                });
            });
            $admin_search_clear.trigger('click');


            /*联合查询*/
            $admin_search_btn.on('click', function () {
                var data = $.extend(true, {}, logistics_config.config.ajax.data);

                $.each([$search_searchWords, $search_status], function () {
                    var text = this.val() || this.find(':selected').val(),
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
                logistics_config.config.ajax.data = $.extend(true, {}, data);
                getColumnData(logistics_page, logistics_config);
            });


            /*绑定新增入库*/
            if (logisticsshow_power) {
                $logistics_company_add.removeClass('g-d-hidei');
                $logistics_company_add.on('click', function () {
                    $admin_id.val('');
                    $admin_action.html('添加');
                    $show_add_wrap.modal('show', {backdrop: 'static'});
                });
            } else {
                $logistics_company_add.addClass('g-d-hidei');
            }


            /*格式化手机号码*/
            $.each([$admin_cellphone], function () {
                this.on('keyup', function () {
                    var phoneno = this.value.replace(/\D*/g, '');
                    if (phoneno == '') {
                        this.value = '';
                        return false;
                    }
                    this.value = public_tool.phoneFormat(this.value);
                });
            });


            /*事件绑定*/
            /*绑定查看，修改操作*/
            var operate_item;
            $logistics_company_wrap.delegate('span', 'click', function (e) {
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


                if (action === 'disable') {
                    /*停用*/
                    dia.content('<span class="g-c-bs-warning g-btips-warn">功能正在开发中...</span>').show();
                    setTimeout(function () {
                        dia.close();
                    }, 2000);
                    return false;
                } else if (action === 'delete') {
                    /*删除*/
                    operate_item = $tr;
                    logisticsDelete(id);
                } else if (action === 'edit') {
                    /*编辑*/
                    logisticsEdit(id, $tr);
                } else if (action === 'enable') {
                    /*启用*/
                    dia.content('<span class="g-c-bs-warning g-btips-warn">功能正在开发中...</span>').show();
                    setTimeout(function () {
                        dia.close();
                    }, 2000);
                    return false;
                }
            });


            /*绑定关闭详情*/
            $.each([$show_add_wrap], function () {
                this.on('hide.bs.modal', function () {
                    if (operate_item) {
                        setTimeout(function () {
                            operate_item.removeClass('item-lighten');
                            operate_item = null;
                        }, 1000);
                    }
                });
            });


            /*绑定添加地址*/
            /*表单验证*/
            if ($.isFunction($.fn.validate)) {
                /*配置信息*/
                var form_opt0 = {},
                    formcache = public_tool.cache,
                    basedata = {
                        roleId: decodeURIComponent(logininfo.param.roleId),
                        token: decodeURIComponent(logininfo.param.token),
                        adminId: decodeURIComponent(logininfo.param.adminId),
                        grade: decodeURIComponent(logininfo.param.grade)
                    };


                if (formcache.form_opt_0) {
                    $.each([formcache.form_opt_0], function (index) {
                        var formtype,
                            config = {
                                dataType: 'JSON',
                                method: 'post'
                            };
                        if (index === 0) {
                            formtype = 'addlogistics';
                        }
                        $.extend(true, (function () {
                            if (formtype === 'addlogistics') {
                                return form_opt0;
                            }
                        }()), (function () {
                            if (formtype === 'addlogistics') {
                                return formcache.form_opt_0;
                            }
                        }()), {
                            submitHandler: function (form) {

                                var setdata = {};

                                $.extend(true, setdata, basedata);

                                if (formtype === 'addlogistics') {
                                    var id = $admin_id.val();
                                    $.extend(true, setdata, {
                                        companyName: $admin_companyName.val(),
                                        seCode: $admin_seCode.val(),
                                        linkman: $admin_linkman.val(),
                                        cellphone: public_tool.trims($admin_cellphone.val()),
                                        address: $admin_address.val(),
                                        sort: $admin_sort.val()
                                    });

                                    var actiontype = '';
                                    if (id !== '') {
                                        actiontype = '修改';
                                        setdata['id'] = id;
                                    } else {
                                        actiontype = '添加';
                                    }

                                    config['url'] = "http://10.0.5.226:8082/mall-agentbms-api/logistics/addupdate";
                                    config['data'] = setdata;
                                }

                                $.ajax(config).done(function (resp) {
                                    var code;
                                    if (formtype === 'addlogistics') {
                                        code = parseInt(resp.code, 10);
                                        if (code !== 0) {
                                            dia.content('<span class="g-c-bs-warning g-btips-warn">' + actiontype + '失败</span>').show();
                                            return false;
                                        } else {
                                            dia.content('<span class="g-c-bs-success g-btips-succ">' + actiontype + '成功</span>').show();
                                        }
                                    }

                                    if (formtype === 'addlogistics' && code === 0) {
                                        getColumnData(logistics_page, logistics_config);
                                        admin_logisticsadd_form.reset();
                                        setTimeout(function () {
                                            /*关闭隐藏*/
                                            dia.close();
                                            setTimeout(function () {
                                                $show_add_wrap.modal('hide');
                                            }, 1000);
                                        }, 500);
                                    }


                                }).fail(function (resp) {
                                    console.log('error');
                                });
                                return false;
                            }
                        });
                    });

                }


                /*提交验证*/
                if (resetform0 === null) {
                    resetform0 = $admin_logisticsadd_form.validate(form_opt0);
                }
            }


        }


        /*获取数据*/
        function getColumnData(page, opt) {
            if (table === null) {
                table = opt.$logistics_company_wrap.DataTable(opt.config);
            } else {
                table.ajax.config(opt.config.ajax).load();
            }
        }


        /*编辑*/
        function logisticsEdit(id, $tr) {
            $admin_id.val('');
            if (typeof id === 'undefined') {
                return false;
            }

            $.ajax({
                url: "http://10.0.5.226:8082/mall-agentbms-api/logistics/details",
                dataType: 'JSON',
                method: 'post',
                data: {
                    id: id,
                    roleId: decodeURIComponent(logininfo.param.roleId),
                    adminId: decodeURIComponent(logininfo.param.adminId),
                    token: decodeURIComponent(logininfo.param.token),
                    grade: decodeURIComponent(logininfo.param.grade)
                }
            })
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
                    var result = resp.result;
                    if (!result) {
                        return false;
                    }
                    /*设置值*/
                    $admin_id.val(id);
                    $admin_action.html('修改');
                    for (var i in result) {
                        switch (i) {
                            case 'seCode':
                                $admin_seCode.val(result[i]);
                                break;
                            case 'companyName':
                                $admin_companyName.val(result[i]);
                                break;
                            case 'linkman':
                                $admin_linkman.val(result[i]);
                                break;
                            case 'cellphone':
                                $admin_cellphone.val(public_tool.phoneFormat(result[i]));
                                break;
                            case 'address':
                                $admin_address.val(result[i]);
                                break;
                            case 'sort':
                                $admin_sort.val(result[i]);
                                break;
                        }
                    }

                    /*添加高亮状态*/
                    if (operate_item) {
                        operate_item.removeClass('item-lighten');
                        operate_item = null;
                    }
                    operate_item = $tr.addClass('item-lighten');
                    $show_add_wrap.modal('show', {backdrop: 'static'});
                })
                .fail(function (resp) {
                    console.log(resp.message);
                    dia.content('<span class="g-c-bs-warning g-btips-warn">' + (resp.message || "操作失败") + '</span>').show();
                    setTimeout(function () {
                        dia.close();
                    }, 2000);
                });
        }


        /*删除*/
        function logisticsDelete(id) {
            if (id === '' || typeof id === 'undefined') {
                operate_item.removeClass('item-lighten');
                operate_item = null;
                return false;
            }
            /*确认是否删除*/
            setSure.sure('delete', function (cf) {
                /*to do*/
                var tip = cf.dia || dia;
                tip.content('<span class="g-c-bs-warning g-btips-warn">删除成功</span>').show();
                $.ajax({
                    url: "http://10.0.5.226:8082/mall-agentbms-api/logistics/delete",
                    dataType: 'JSON',
                    method: 'post',
                    data: {
                        id: id,
                        roleId: decodeURIComponent(logininfo.param.roleId),
                        adminId: decodeURIComponent(logininfo.param.adminId),
                        token: decodeURIComponent(logininfo.param.token),
                        grade: decodeURIComponent(logininfo.param.grade)
                    }
                })
                    .done(function (resp) {
                        var code = parseInt(resp.code, 10),
                            isok = false;
                        if (code !== 0) {
                            console.log(resp.message);
                            tip.content('<span class="g-c-bs-warning g-btips-warn">' + (resp.message || "删除物流失败") + '</span>').show();
                            setTimeout(function () {
                                tip.close();
                            }, 2000);
                            return false;
                        }
                        tip.content('<span class="g-c-bs-success g-btips-succ">删除物流成功</span>').show();
                        operate_item.removeClass('item-lighten');
                        operate_item = null;
                        getColumnData(logistics_page, logistics_config);
                        setTimeout(function () {
                            tip.close();
                        }, 2000);
                    })
                    .fail(function (resp) {
                        console.log(resp.message);
                        tip.content('<span class="g-c-bs-warning g-btips-warn">' + (resp.message || "删除物流失败") + '</span>').show();
                        setTimeout(function () {
                            tip.close();
                        }, 2000);
                    });
            }, '是否确定要&nbsp;<span class="g-c-red1">"删除"</span>&nbsp;此物流公司？',true);
        }
    });


})(jQuery);