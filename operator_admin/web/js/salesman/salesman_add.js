/*admin_member:成员设置*/
(function ($) {
    'use strict';
    $(function () {
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
                salesmanadd_power = public_tool.getKeyPower('mall-salesman-add', powermap);


            /*dom引用和相关变量定义*/
            var module_id = 'mall-agent-add'/*模块id，主要用于本地存储传值*/,
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
                admin_salesman_form = document.getElementById('admin_salesman_form'),
                $admin_salesman_form = $(admin_salesman_form),
                $admin_id = $('#admin_id'),
                $admin_name = $('#admin_name'),
                $admin_cellphone = $('#admin_cellphone'),
                $admin_remark = $('#admin_remark'),
                $admin_action = $('#admin_action'),
                resetform0 = null;


            /*重置表单*/
            admin_salesman_form.reset();


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


            /*获取编辑缓存*/
            var edit_cache = public_tool.getParams('mall-salesman-add');
            if (edit_cache) {
                $admin_action.html('修改');
                /*判断权限*/
                if (salesmanedit_power) {
                    $admin_action.removeClass('g-d-hidei');
                } else {
                    $admin_action.addClass('g-d-hidei');
                }
                setSalesmanData(edit_cache['id']);
            } else {
                /*判断权限*/
                if (salesmanadd_power) {
                    $admin_action.removeClass('g-d-hidei');
                } else {
                    $admin_action.addClass('g-d-hidei');
                }
            }


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
                            formtype = 'addsalesman';
                        }
                        $.extend(true, (function () {
                            if (formtype === 'addsalesman') {
                                return form_opt0;
                            }
                        }()), (function () {
                            if (formtype === 'addsalesman') {
                                return formcache.form_opt_0;
                            }
                        }()), {
                            submitHandler: function (form) {
                                var setdata = {};

                                $.extend(true, setdata, basedata);

                                if (formtype === 'addsalesman') {

                                    /*同步编辑器*/
                                    $.extend(true, setdata, {
                                        name: $admin_name.val(),
                                        cellphone: public_tool.trims($admin_cellphone.val()),
                                        remark: $admin_remark.val()
                                    });

                                    var id = $admin_id.val(),
                                        actiontype = '';
                                    if (id !== '') {
                                        /*修改操作*/
                                        setdata['id'] = id;
                                        actiontype = '修改';
                                        config['url'] = "http://10.0.5.226:8082/mall-agentbms-api/salesman/update";
                                    } else {
                                        /*新增操作*/
                                        actiontype = '新增';
                                        delete setdata['id'];
                                        config['url'] = "http://10.0.5.226:8082/mall-agentbms-api/salesman/add";
                                    }
                                    config['data'] = setdata;
                                }

                                $.ajax(config).done(function (resp) {
                                    var code;
                                    if (formtype === 'addsalesman') {
                                        code = parseInt(resp.code, 10);
                                        if (code !== 0) {
                                            dia.content('<span class="g-c-bs-warning g-btips-warn">' + resp.message || actiontype + '业务员失败+</span>').show();
                                            return false;
                                        } else {
                                            public_tool.removeParams('mall-salesman-add');
                                            dia.content('<span class="g-c-bs-success g-btips-succ">' + resp.message || actiontype + '业务员失败+</span>').show();
                                        }
                                    }


                                    setTimeout(function () {
                                        dia.close();
                                        if (formtype === 'addsalesman' && code === 0) {
                                            /*页面跳转*/
                                            location.href = 'mall-salesman-list.html';
                                        }
                                    }, 2000);
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
                    resetform0 = $admin_salesman_form.validate(form_opt0);
                }
            }


        }


        /*修改时设置值*/
        function setSalesmanData(id) {
            if (!id) {
                return false;
            }


            $.ajax({
                url: "http://10.0.5.226:8082/mall-agentbms-api/salesman/detail",
                dataType: 'JSON',
                method: 'post',
                data: {
                    "id": id,
                    "adminId": decodeURIComponent(logininfo.param.adminId),
                    "token": decodeURIComponent(logininfo.param.token),
                    "grade": decodeURIComponent(logininfo.param.grade)
                }
            })
                .done(function (resp) {
                    var code = parseInt(resp.code, 10);
                    if (code !== 0) {
                        console.log(resp.message);
                        dia.content('<span class="g-c-bs-warning g-btips-warn">' + (resp.message || "查询设置值失败") + '</span>').show();
                        return false;
                    }
                    /*是否是正确的返回数据*/
                    var list = resp.result;

                    if (!$.isEmptyObject(list)) {
                        $admin_id.val(id);
                        for (var j in list) {
                            switch (j) {
                                case 'name':
                                    $admin_name.val(list[j]);
                                    break;
                                case 'cellphone':
                                    $admin_cellphone.val(public_tool.phoneFormat(list[j]));
                                    break;
                                case 'remark':
                                    $admin_remark.val(list[j]);
                                    break;
                            }
                        }

                    }
                })
                .fail(function (resp) {
                    console.log(resp.message);
                });

        }


    });


})(jQuery);