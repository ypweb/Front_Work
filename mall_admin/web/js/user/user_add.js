/*admin_member:成员设置*/
(function ($) {
    'use strict';
    $(function () {
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
            var powermap = public_tool.getPower(),
                useradd_power = public_tool.getKeyPower('bzw-user-add', powermap),
                useredit_power = public_tool.getKeyPower('bzw-user-edit', powermap);


            /*dom引用和相关变量定义*/
            var debug = false,
                module_id = 'bzw-user-add'/*模块id，主要用于本地存储传值*/,
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
                admin_adduser_form = document.getElementById('admin_adduser_form'),
                $admin_adduser_form = $(admin_adduser_form),
                $admin_id = $('#admin_id'),
                $admin_telePhone = $('#admin_telePhone'),
                $admin_password = $('#admin_password'),
                $admin_nickName = $('#admin_nickName'),
                $admin_Name = $('#admin_Name'),
                $admin_sex = $('#admin_sex'),
                $admin_enabled = $('#admin_enabled'),
                $admin_logoImage = $('#admin_logoImage'),
                $admin_shopName = $('#admin_shopName'),
                $admin_cellphone = $('#admin_cellphone'),
                $admin_localArea = $('#admin_localArea'),
                $admin_address = $('#admin_address'),
                $admin_storeIntroduce = $('#admin_storeIntroduce'),
                $admin_storeLogoUrl = $('#admin_storeLogoUrl'),
                $admin_action = $('#admin_action'),
                resetform0 = null;


            /*重置表单*/
            admin_adduser_form.reset();


            /*获取编辑缓存*/
            (function () {
                var edit_cache = public_tool.getParams('bzw-user-add');
                if (edit_cache) {
                    if (useredit_power) {
                        $admin_action.removeClass('g-d-hidei').html('编辑');
                        /*查询数据*/
                        if (typeof edit_cache === 'object') {
                            setUserData(edit_cache['id']);
                        } else {
                            setUserData(edit_cache);
                        }
                    } else {
                        $admin_action.addClass('g-d-hidei');
                    }
                } else {
                    if (useradd_power) {
                        $admin_action.removeClass('g-d-hidei').html('添加');
                    } else {
                        $admin_action.addClass('g-d-hidei');
                    }
                }
            }());


            /*绑定添加地址*/
            /*表单验证*/
            if ($.isFunction($.fn.validate)) {
                /*配置信息*/
                var form_opt0 = {},
                    formcache = public_tool.cache,
                    basedata = {
                        roleId: decodeURIComponent(logininfo.param.roleId),
                        adminId: decodeURIComponent(logininfo.param.adminId),
                        grade: decodeURIComponent(logininfo.param.grade),
                        token: decodeURIComponent(logininfo.param.token)
                    };


                if (formcache.form_opt_0) {
                    $.each([formcache.form_opt_0], function (index) {
                        var formtype,
                            config = {
                                dataType: 'JSON',
                                method: 'post'
                            };
                        if (index === 0) {
                            formtype = 'useradd';
                        }
                        $.extend(true, (function () {
                            if (formtype === 'useradd') {
                                return form_opt0;
                            }
                        }()), (function () {
                            if (formtype === 'useradd') {
                                return formcache.form_opt_0;
                            }
                        }()), {
                            submitHandler: function (form) {
                                var setdata = {},
                                    id = $admin_id.val(),
                                    tempimg = $admin_logoImage.attr('data-image');


                                $.extend(true, setdata, basedata);

                                if (formtype === 'useradd') {

                                    /*同步编辑器*/
                                    $.extend(true, setdata, {
                                        password: $admin_password.val(),
                                        gender: $admin_sex.find(':checked').val(),
                                        isEnabled: parseInt($admin_enabled.find(':checked').val(), 10) === 1 ? true : false
                                    });

                                    if (id !== '') {
                                        setdata['id'] = id;
                                    }
                                    config['url'] = debug ? "../../json/test.json" : "http://10.0.5.226:8082/mall-buzhubms-api/user/update";
                                    config['data'] = setdata;
                                }


                                $.ajax(config).done(function (resp) {
                                    if(debug){
                                        var resp=testWidget.testSuccess('list');
                                        console.log(resp);
                                    }
                                    var code, formkey = '';
                                    if (formtype === 'useradd') {
                                        if (id !== '') {
                                            formkey = '修改';
                                        } else {
                                            formkey = '添加';
                                        }
                                        code = parseInt(resp.code, 10);
                                        if (code !== 0) {
                                            dia.content('<span class="g-c-bs-warning g-btips-warn">' + formkey + '用户失败</span>').show();
                                            return false;
                                        } else {
                                            dia.content('<span class="g-c-bs-success g-btips-succ">' + formkey + '用户成功</span>').show();
                                        }
                                    }

                                    setTimeout(function () {
                                        dia.close();
                                        location.href = 'bzw-user-list.html';
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
                    resetform0 = $admin_adduser_form.validate(form_opt0);
                }
            }


        }

        /*修改时设置值*/
        function setUserData(id) {
            if (!id) {
                return false;
            }


            $.ajax({
                    url: debug ? "../../json/test.json" : "http://10.0.5.226:8082/mall-buzhubms-api/user/detail",
                    dataType: 'JSON',
                    method: 'post',
                    data: {
                        id: id,
                        roleId: decodeURIComponent(logininfo.param.roleId),
                        adminId: decodeURIComponent(logininfo.param.adminId),
                        grade: decodeURIComponent(logininfo.param.grade),
                        token: decodeURIComponent(logininfo.param.token)
                    }
                })
                .done(function (resp) {
                    if (debug) {
                        var resp = {
                            code: 0,
                            message: 'ok',
                            result:testWidget.getMap({
                                map: {
                                    id: 'sequence',
                                    password: 'text',
                                    nickName: 'value',
                                    phone: 'mobile',
                                    name: 'name',
                                    gender: 'rule,0,1,2',
                                    isEnabled: 'rule,true,false',
                                    icon: 'text',
                                    shopName: 'text',
                                    cellphone: 'mobile',
                                    localArea: 'text',
                                    address: 'text',
                                    storeIntroduce: 'remark',
                                    storeLogoUrl: 'text'
                                },
                                maptype: 'object'
                            }).list
                        };
                    }
                    var code = parseInt(resp.code, 10);
                    if (code !== 0) {
                        console.log(resp.message);
                        if (code === 999) {
                            public_tool.loginTips(function () {
                                public_tool.clear();
                                public_tool.clearCacheData();
                            });
                        }
                        return false;
                    }
                    /*是否是正确的返回数据*/
                    var list = resp.result;
                    if (!list) {
                        return false;
                    }


                    if (!$.isEmptyObject(list)) {
                        $admin_id.val(id);
                        for (var m in list) {
                            switch (m) {
                                case 'phone':
                                    $admin_telePhone.html(public_tool.phoneFormat(list[m]));
                                    break;
                                case 'password':
                                    $admin_password.val(list[m]);
                                    break;
                                case 'nickName':
                                    $admin_nickName.html(list[m]);
                                    break;
                                case 'name':
                                    $admin_Name.html(list[m]);
                                    break;
                                case 'gender':
                                    $admin_sex.find('input').each(function () {
                                        var $this = $(this),
                                            text = parseInt($this.val(), 10),
                                            curtext = parseInt(list[m], 10);

                                        if (text === curtext) {
                                            $this.prop({
                                                'checked': true
                                            });
                                            return false;
                                        }
                                    });
                                    break;
                                case 'isEnabled':
                                    $admin_enabled.find('input').each(function () {
                                        var $this = $(this),
                                            text = parseInt($this.val(), 10),
                                            curtext = list[m] ? 1 : 0;

                                        if (text === curtext) {
                                            $this.prop({
                                                'checked': true
                                            });
                                            return false;
                                        }
                                    });
                                    break;
                                case 'icon':
                                    $('<img src="' + list[m] + "?imageView2/1/w/160/h/160" + '" alt="图像">').appendTo($admin_logoImage.attr({
                                        'data-image': list[m]
                                    }).html(''));
                                    break;
                                case 'shopName':
                                    $admin_shopName.html(list[m]);
                                    break;
                                case 'cellphone':
                                    $admin_cellphone.html(public_tool.phoneFormat(list[m]));
                                    break;
                                case 'localArea':
                                    $admin_localArea.html(list[m]);
                                    break;
                                case 'address':
                                    $admin_address.html(list[m]);
                                    break;
                                case 'storeIntroduce':
                                    $admin_storeIntroduce.html(list[m]);
                                    break;
                                case 'storeLogoUrl':
                                    $('<img src="' + list[m] + "?imageView2/1/w/160/h/160" + '" alt="图像">').appendTo($admin_storeLogoUrl.html(''));
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