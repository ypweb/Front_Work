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

            /*dom引用和相关变量定义*/
            var debug = false,
                module_id = 'bzw-profitC-setting'/*模块id，主要用于本地存储传值*/;


            /*权限调用*/
            var powermap = public_tool.getPower(350),
                setting_power = public_tool.getKeyPower('bzw-profitC-list', powermap)/*设置*/;

            /*基本变量定义*/
            var dia = dialog({
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
                sureObj = public_tool.sureDialog(dia)/*回调提示对象*/,
                setSure = new sureObj();


            /*编辑对象*/
            var $admin_commission1 = $('#admin_commission1'),
                $admin_commission2 = $('#admin_commission2'),
                $admin_commission3 = $('#admin_commission3'),
                $admin_commissionExtra1 = $('#admin_commissionExtra1'),
                $admin_commissionExtra2 = $('#admin_commissionExtra2'),
                $admin_commissionExtra3 = $('#admin_commissionExtra3'),
                $profit_setting_btn = $('#profit_setting_btn'),
                $profit_setting_tip = $('#profit_setting_tip'),
                relation_list = [$admin_commission1, $admin_commission2, $admin_commission3, $admin_commissionExtra1, $admin_commissionExtra2, $admin_commissionExtra3];


            /*绑定设置限制值输入*/
            $.each(relation_list, function (index) {
                this.on('keyup focusout', function (e) {
                    var etype = e.type,
                        self = this,
                        data;

                    if (etype === 'keyup') {
                        data = self.value.replace(/\D*/g, '');
                        self.value = data === '' ? 0 : parseInt(data, 10);
                    } else if (etype === 'focusout') {
                        data = self.value;
                        if (data === '' || isNaN(data)) {
                            self.value = 0;
                            return false;
                        }
                        if (data > 100) {
                            data = 100;
                        }
                        /*处理关联关系值*/
                        relationData(data, index);
                    }
                });
            });

            /*请求分润数据*/
            queryProfit();

            /*绑定提交编辑*/
            $profit_setting_btn.on('click', function () {
                setSure.sure('', function (cf) {
                    $.ajax({
                            url: debug ? "../../json/test.json" : "http://10.0.5.226:8082/mall-buzhubms-api/commission/cfg/update",
                            dataType: 'JSON',
                            async: false,
                            method: 'post',
                            data: {
                                adminId: decodeURIComponent(logininfo.param.adminId),
                                token: decodeURIComponent(logininfo.param.token),
                                commission1: $admin_commission1.val(),
                                commission2: $admin_commission2.val(),
                                commission3: $admin_commission3.val(),
                                commissionExtra1: $admin_commissionExtra1.val(),
                                commissionExtra2: $admin_commissionExtra2.val(),
                                commissionExtra3: $admin_commissionExtra3.val()
                            }
                        })
                        .done(function (resp) {
                            if (debug) {
                                var resp = testWidget.testSuccess('list');
                            }
                            var code = parseInt(resp.code, 10);
                            if (code !== 0) {
                                dia.content('<span class="g-c-bs-warning g-btips-warn">' + (resp.message || "分润设置失败") + '</span>').show();
                                return false;
                            }
                            dia.content('<span class="g-c-bs-success g-btips-succ">分润设置成功</span>').show();
                            /*重置值*/
                            setTimeout(function () {
                                dia.close();
                            }, 2000);
                        })
                        .fail(function (resp) {
                            console.log(resp.message);
                            dia.content('<span class="g-c-bs-warning g-btips-warn">' + (resp.message || "分润设置失败") + '</span>').show();
                        });
                }, "是否真需要设置分润机制", true);
            });
        }


        /*请求分润设置*/
        function queryProfit() {
            $.ajax({
                    url: debug ? "../../json/test.json" : "http://10.0.5.226:8082/mall-buzhubms-api/commission/cfg/get",
                    dataType: 'JSON',
                    async: false,
                    method: 'post',
                    data: {
                        adminId: decodeURIComponent(logininfo.param.adminId),
                        token: decodeURIComponent(logininfo.param.token)
                    }
                })
                .done(function (resp) {
                    if (debug) {
                        var resp = testWidget.testSuccess('list');
                        resp.result = testWidget.getMap({
                            map: {
                                commission1: 'minmax,10,20',
                                commission2: 'minmax,10,20',
                                commission3: 'minmax,5,20',
                                commissionExtra1: 'minmax,10,20',
                                commissionExtra2: 'minmax,5,10',
                                commissionExtra3: 'minmax,5,10'
                            },
                            maptype: 'object'
                        }).list;
                    }
                    var code = parseInt(resp.code, 10);
                    if (code !== 0) {
                        return false;
                    }
                    var result = resp.result;
                    if (result) {
                        var profit_map = ['commission1', 'commission2', 'commission3', 'commissionExtra1', 'commissionExtra2', 'commissionExtra3'],
                            i = 0,
                            len = profit_map.length,
                            count = 0,
                            item;
                        for (i; i < len; i++) {
                            item = parseInt(result[profit_map[i]], 10);
                            relation_list[i].val(item);
                            count += item;
                            if (i === len - 1) {
                                /*控制按钮*/
                                if (count !== 100 && setting_power) {
                                    /*最后一个触发校验*/
                                    relation_list[i].trigger('focusout');
                                } else {
                                    $profit_setting_btn.removeClass('g-d-hidei');
                                    $profit_setting_tip.html('');
                                }
                            }
                        }
                    }
                })
                .fail(function (resp) {
                    console.log(resp.message);
                    dia.content('<span class="g-c-bs-warning g-btips-warn">' + (resp.message || "操作失败") + '</span>').show();
                });
        }


        /*关联属性处理*/
        function relationData(value, index) {
            var i = 0,
                current_value = 0/*当前循环值*/,
                len = 6,
                standard = 0/*标准值*/,
                count = 0/*其余求和值*/;
            if (value >= 100) {
                /*设置100时其他为0*/
                for (i; i < len; i++) {
                    if (i !== index) {
                        relation_list[i].val(0);
                    } else {
                        relation_list[i].val(100);
                    }
                }
                count = 100;
            } else if (value < 100) {
                /*非100时*/
                //相加法
                for (i; i < len; i++) {
                    /*计算非当前值*/
                    current_value = parseInt(relation_list[i].val(), 10);
                    if (current_value !== '') {
                        if ((count + current_value) > 100) {
                            standard = (count + current_value) - 100;
                            var k = i + 1;
                            if (i === index) {
                                relation_list[i].val(current_value - standard);
                                if (k < len) {
                                    for (k; k < len; k++) {
                                        relation_list[k].val(0);
                                    }
                                }
                            } else {
                                relation_list[i].val(current_value - standard);
                                if (k < len) {
                                    for (k; k < len; k++) {
                                        if (i !== index) {
                                            relation_list[k].val(0);
                                        }
                                    }
                                }
                            }
                            break;
                        } else {
                            count += current_value;
                        }
                    }
                }
            }
            /*交易成功后显示设置按钮*/
            if (count === 100) {
                $profit_setting_btn.removeClass('g-d-hidei');
                $profit_setting_tip.html('');
            } else {
                $profit_setting_btn.addClass('g-d-hidei');
                $profit_setting_tip.html('分润总和必须为:<span class="g-c-info">100</span>，现为：<span class="g-c-gray5">' + count + '</span>，差值为：<span class="g-c-gray5">' + (100 - count) + '</span>');
            }

        }

    });
})(jQuery);