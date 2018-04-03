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
            var powermap = public_tool.getPower(240),
                detail_power = public_tool.getKeyPower('bzw-order-details', powermap);


            /*dom引用和相关变量定义*/
            var debug = false,
                $admin_list_wrap = $('#admin_list_wrap')/*表格*/,
                module_id = 'bzw-order-manager'/*模块id，主要用于本地存储传值*/,
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
            var $search_orderNumber = $('#search_orderNumber'),
                $search_totalMoneyStart = $('#search_totalMoneyStart'),
                $search_totalMoneyEnd = $('#search_totalMoneyEnd'),
                $search_paymentType = $('#search_paymentType'),
                $search_orderTimeStart = $('#search_orderTimeStart'),
                $search_orderTimeEnd = $('#search_orderTimeEnd'),
                $admin_search_btn = $('#admin_search_btn'),
                $admin_search_clear = $('#admin_search_clear');

            /*明细对象*/
            var $show_detail_wrap = $('#show_detail_wrap'),
                $show_detail_content = $('#show_detail_content'),
                $show_detail_goods = $('#show_detail_goods');


            /*列表请求配置*/
            var order_page = {
                    page: 1,
                    pageSize: 10,
                    total: 0
                },
                order_config = {
                    $admin_list_wrap: $admin_list_wrap,
                    $admin_page_wrap: $admin_page_wrap,
                    config: {
                        processing: true, /*大消耗操作时是否显示处理状态*/
                        deferRender: true, /*是否延迟加载数据*/
                        autoWidth: true, /*是否*/
                        paging: false,
                        ajax: {
                            url: debug ? "../../json/test.json" : "http://10.0.5.226:8082/mall-buzhubms-api/goodsorder/list",
                            dataType: 'JSON',
                            method: 'post',
                            dataSrc: function (json) {
                                if (debug) {
                                    var json = testWidget.test({
                                        map: {
                                            id: 'sequence',
                                            orderNumber: 'guid',
                                            orderTime: 'datetime',
                                            customerName: 'name',
                                            freight: 'money',
                                            totalMoney: 'money',
                                            amount: 'money',
                                            paymentType: 'rule,1,2,3',
                                            orderState: 'rule,20,21,0,6,9,2,1'/*0待付款 1取消订单 6待发货 9待收货 20待评价 21已评价*/
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
                                order_page.page = result.page;
                                order_page.pageSize = result.pageSize;
                                order_page.total = result.count;
                                /*分页调用*/
                                $admin_page_wrap.pagination({
                                    pageSize: order_page.pageSize,
                                    total: order_page.total,
                                    pageNumber: order_page.page,
                                    onSelectPage: function (pageNumber, pageSize) {
                                        /*再次查询*/
                                        var param = order_config.config.ajax.data;
                                        param.page = pageNumber;
                                        param.pageSize = pageSize;
                                        order_config.config.ajax.data = param;
                                        getColumnData(order_page, order_config);
                                    }
                                });
                                return result ? result.list || [] : [];
                            },
                            data: {
                                roleId: decodeURIComponent(logininfo.param.roleId),
                                adminId: decodeURIComponent(logininfo.param.adminId),
                                grade: decodeURIComponent(logininfo.param.grade),
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
                                "data": "orderTime"
                            },
                            {
                                "data": "customerName"
                            },
                            {
                                "data": "amount",
                                "render": function (data, type, full, meta) {
                                    return '￥:' + public_tool.moneyCorrect(data, 15, false)[0] + '&nbsp;<em class="g-c-gray10">(</em><em class="g-c-gray8">￥:' + public_tool.moneyCorrect(full.totalMoney, 15, false)[0] + '</em>&nbsp;<em class="g-c-gray12">|</em>&nbsp;<em class="g-c-gray8">￥:' + public_tool.moneyCorrect(full.freight, 15, false)[0] + '</em><em class="g-c-gray10">)</em>';
                                }
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
                                        str = '';

                                    if (stauts === 6 || stauts === 9) {
                                        str = '<div class="g-c-gray6">' + statusmap[stauts] + '</div>';
                                    } else if (stauts === 1) {
                                        str = '<div class="g-c-gray10">' + statusmap[stauts] + '</div>';
                                    } else if (stauts === 0) {
                                        str = '<div class="g-c-warn">' + statusmap[stauts] + '</div>';
                                    } else if (stauts === 20 || stauts === 21) {
                                        str = '<div class="g-c-succ">' + statusmap[stauts] + '</div>';
                                    } else {
                                        str = '<div class="g-c-red1">异常</div>';
                                    }
                                    return str;
                                }
                            },
                            {
                                "data": "id",
                                "render": function (data, type, full, meta) {
                                    var id = parseInt(data, 10),
                                        btns = '';

                                    if (detail_power) {
                                        btns += '<span data-action="select" data-id="' + id + '"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
										<i class="fa-file-o"></i>\
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
            getColumnData(order_page, order_config);


            /*清空查询条件*/
            $admin_search_clear.on('click', function () {
                $.each([$search_orderNumber, $search_totalMoneyStart, $search_totalMoneyEnd, $search_paymentType, $search_orderTimeStart, $search_orderTimeEnd], function () {
                    var selector = this.selector;
                    if (selector.indexOf('paymentType') !== -1) {
                        this.find(':selected').prop({
                            'selected': false
                        });
                    } else {
                        this.val('');
                    }
                });
                /*重置分页*/
                order_page.page = 1;
                order_page.total = 0;
                order_config.config.ajax.data['page'] = order_page.page;
            });
            $admin_search_clear.trigger('click');

            /*日历查询*/
            datePickWidget.datePick([$search_orderTimeStart, $search_orderTimeEnd]);


            /*联合查询*/
            $admin_search_btn.on('click', function () {
                var data = $.extend(true, {}, order_config.config.ajax.data);

                $.each([$search_orderNumber, $search_totalMoneyStart, $search_totalMoneyEnd, $search_paymentType, $search_orderTimeStart, $search_orderTimeEnd], function () {
                    var text = this.val(),
                        selector = this.selector.slice(1),
                        key = selector.split('_'),
                        ismoney = selector.indexOf('totalMoney') !== -1;

                    if (ismoney) {
                        /*去掉格式化人民币*/
                        text = public_tool.trimSep(text, ',');
                    }

                    if (text === "") {
                        if (typeof data[key[1]] !== 'undefined') {
                            delete data[key[1]];
                        }
                    } else {
                        data[key[1]] = text;
                    }

                });
                order_config.config.ajax.data = $.extend(true, {}, data);
                getColumnData(order_page, order_config);
            });

            /*限制金钱范围:true:是否格式化显示*/
            moneyFilterWidget.moneyFilter([$search_totalMoneyStart, $search_totalMoneyEnd], true);


            /*绑定关闭弹出层*/
            $show_detail_wrap.on('hide.bs.modal', function () {
                if (operate_item !== null) {
                    setTimeout(function () {
                        operate_item.removeClass('item-lighten');
                        operate_item = null;
                    }, 1000);
                }
            });


            /*事件绑定*/
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
                if (action === 'select' && detail_power) {
                    showTrade(id, $tr);
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


        /*查看出库单*/
        function showTrade(id, $tr) {
            if (typeof id === 'undefined') {
                return false;
            }

            $.ajax({
                url: debug ? "../../json/test.json" : "http://10.0.5.226:8082/mall-buzhubms-api/goodsorder/detail",
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
                        var resp = testWidget.testSuccess('list');
                        resp.result = testWidget.getMap({
                            map: {
                                id: 'sequence',
                                orderNumber: 'guid',
                                freight: 'money',
                                totalMoney: 'money',
                                amount: 'money',
                                userName: 'name',
                                orderTime: 'datetime',
                                providerName: 'name',
                                customerName: 'name',
                                customerPhone: 'mobile',
                                shippingMethodName: 'value',
                                orderState: 'rule,20,21,0,6,9,2,1'/*0待付款 1取消订单 6待发货 9待收货 20待评价 21已评价*/
                            },
                            maptype: 'object'
                        }).list;
                        resp.result['goods'] = testWidget.getMap({
                            map: {
                                goodsName: 'goods',
                                quantlity: 'id'
                            },
                            maptype: 'array',
                            mapmin: 5,
                            mapmax: 10
                        }).list;
                    }
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
                    var list = resp.result;
                    if (!list) {
                        return false;
                    }

                    var str = '',
                        item,
                        goodsstr = '',
                        detail_map,
                        goodslist,
                        len,
                        i = 0;

                    if (!$.isEmptyObject(list)) {
                        goodslist = list.goods;
                        detail_map = {
                            orderNumber: '订单号',
                            orderState: "订单状态",
                            userName: "买家名称",
                            amount: "订单总价",
                            orderTime: "下单时间",
                            providerName: "卖家店铺",
                            customerName: "收货人姓名",
                            customerPhone: "手机号码",
                            shippingMethodName: "配送方式",
                            localArea: "所在地区",
                            customerAddress: "详细地址",
                            goods: "商品信息"
                        };
                        for (var j in list) {
                            if (j !== 'goods') {
                                if (typeof detail_map[j] !== 'undefined') {
                                    if (j === 'orderState') {
                                        var statemap = {
                                            0: '<div class="g-c-warn">待付款</div>',
                                            1: '<div class="g-c-gray10">取消订单</div>',
                                            6: '<div class="g-c-info">待发货</div>',
                                            9: '<div class="g-c-info">待收货</div>',
                                            20: '<div class="g-c-gray6">待评价</div>',
                                            21: '<div class="g-c-green2">已评价</div>'
                                        };
                                        str += '<tr><th>' + detail_map[j] + ':</th><td>' + statemap[parseInt(list[j], 10)] + '</td></tr>';
                                    } else if (j === 'customerPhone') {
                                        str += '<tr><th>' + detail_map[j] + ':</th><td>' + public_tool.phoneFormat(list[j]) + '</td></tr>';
                                    } else if (j === 'amount') {
                                        str += '<tr><th>' + detail_map[j] + ':<br /><em class="g-c-gray9">(商品总价|物流费用)</em></th><td>￥:' + public_tool.moneyCorrect(list[j], 15, false)[0] + '&nbsp;<em class="g-c-gray10">(</em><em class="g-c-gray8">￥:' + (function () {
                                            if (typeof list['totalMoney'] !== 'undefined' || list['totalMoney'] !== '') {
                                                return public_tool.moneyCorrect(list['totalMoney'], 15, false)[0];
                                            }
                                            return 0.00;
                                        })() + '</em>&nbsp;<em class="g-c-gray12">|</em>&nbsp;<em class="g-c-gray8">￥:' + (function () {
                                            if (typeof list['freight'] !== 'undefined' || list['freight'] !== '') {
                                                return public_tool.moneyCorrect(list['freight'], 15, false)[0];
                                            }
                                            return 0.00;
                                        })() + '</em><em class="g-c-gray10">)</em></td></tr>';
                                    } else {
                                        str += '<tr><th>' + detail_map[j] + ':</th><td>' + list[j] + '</td></tr>';
                                    }
                                }
                            }
                        }
                        len = goodslist.length;
                        if (len !== 0) {
                            for (i; i < len; i++) {
                                item = goodslist[i];
                                goodsstr += '<tr>\
                                        <td>' + (i + 1) + '</td>\
                                        <td>' + item["goodsName"] + '</td>\
                                        <td>' + (item["quantlity"] || '0') + '</td>\
                                    </tr>';
                            }
                            $(goodsstr).appendTo($show_detail_goods.html(''));
                        }
                        if (str !== '') {
                            $(str).appendTo($show_detail_content.html(''));
                            if (operate_item) {
                                operate_item.removeClass('item-lighten');
                                operate_item = null;
                            }
                            operate_item = $tr.addClass('item-lighten');
                            $show_detail_wrap.modal('show', {backdrop: 'static'});
                        }
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