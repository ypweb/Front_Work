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


            /*权限调用*/
            var powermap = public_tool.getPower(353),
                detail_power = public_tool.getKeyPower('bzw-orderC-list', powermap)/*会员关系*/;


            /*dom引用和相关变量定义*/
            var debug = false,
                $admin_list_wrap = $('#admin_list_wrap')/*表格*/,
                module_id = 'bzw-orderC-list'/*模块id，主要用于本地存储传值*/,
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
            var $search_paymentType = $('#search_paymentType'),
                $search_orderNumber = $('#search_orderNumber'),
                $search_orderMoneyStart = $('#search_orderMoneyStart'),
                $search_orderMoneyEnd = $('#search_orderMoneyEnd'),
                $search_timeStart = $('#search_timeStart'),
                $search_timeEnd = $('#search_timeEnd'),
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
                            url: debug ? "../../json/test.json" : "http://10.0.5.226:8082/mall-buzhubms-api/sh/goodsorder/list",
                            dataType: 'JSON',
                            method: 'post',
                            dataSrc: function (json) {
                                if (debug) {
                                    var json = testWidget.test({
                                        map: {
                                            id: 'sequence',
                                            orderNumber: 'guid',
                                            nickname: 'name',
                                            freight: 'money',
                                            totalMoney: 'money',
                                            amount: 'money',
                                            deductionAmount: 'money',
                                            paymentType: 'rule,1,2,3',
                                            createTime: 'datetime',
                                            orderStatus: 'rule,21,9,11,0,1,3,30,40,5'/*0待付款 1取消订单 3待发货 9待收货 11待评价 21已评价 30返修 40退货*/
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
                                adminId: decodeURIComponent(logininfo.param.adminId),
                                token: decodeURIComponent(logininfo.param.token),
                                page: 1,
                                pageSize: 10
                            }
                        },
                        info: false,
                        searching: true,
                        order: [[5, "desc"], [4, "desc"]],
                        columns: [
                            {
                                "data": "orderNumber"
                            },
                            {
                                "data": "nickname"
                            },
                            {
                                "data": "amount",
                                "render": function (data, type, full, meta) {
                                    return '￥:' + public_tool.moneyCorrect(data, 15, false)[0] + '&nbsp;<em class="g-c-gray10">(</em><em class="g-c-gray8">￥:' + public_tool.moneyCorrect(full.totalMoney, 15, false)[0] + '</em>&nbsp;<em class="g-c-gray12">|</em>&nbsp;<em class="g-c-gray8">￥:' + public_tool.moneyCorrect(full.freight, 15, false)[0] + '</em>&nbsp;<em class="g-c-gray12">|</em>&nbsp;<em class="g-c-gray8">￥:' + public_tool.moneyCorrect(full.deductionAmount, 15, false)[0] + '</em><em class="g-c-gray10">)</em>';
                                }
                            },
                            {
                                "data": "paymentType",
                                "render": function (data, type, full, meta) {
                                    var pay_type = {
                                        1: '微信',
                                        2: '支付宝',
                                        3: '其他'
                                    };
                                    return pay_type[data] || '';
                                }
                            },
                            {
                                "data": "orderStatus",
                                "render": function (data, type, full, meta) {
                                    var status = parseInt(data, 10);

                                    /*0待付款 1取消订单 3待发货 9待收货 11待评价 21已评价 30返修 40退货*/
                                    if (status === 0) {
                                        return '<div class="g-c-warn">待付款</div>';
                                    } else if (status === 1) {
                                        return '<div class="g-c-gray10">取消订单</div>';
                                    } else if (status === 3) {
                                        return '<div class="g-c-info">待发货</div>';
                                    } else if (status === 9) {
                                        return '<div class="g-c-info">待收货</div>';
                                    } else if (status === 11) {
                                        return '<div class="g-c-gray6">待评价</div>';
                                    } else if (status === 21) {
                                        return '<div class="g-c-green2">已评价</div>';
                                    } else if (status === 30) {
                                        return '<div class="g-c-gray10">返修</div>';
                                    } else if (status === 40) {
                                        return '<div class="g-c-gray10">禁用(锁定)</div>';
                                    } else {
                                        return '<div class="g-c-red1">异常</div>';
                                    }
                                }
                            },
                            {
                                "data": "createTime"
                            },
                            {
                                "data": "id",
                                "render": function (data, type, full, meta) {

                                    /*会员关系*/
                                    if (detail_power) {
                                        return '<span data-action="detail" data-id="' + data + '" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
													<i class="fa-file-text-o"></i>\
													<span>查看</span>\
												</span>';
                                    }
                                    return '';
                                }
                            }
                        ]
                    }
                };

            /*清空查询条件*/
            $admin_search_clear.on('click', function () {
                /*清除查询条件*/
                $.each([$search_paymentType, $search_orderNumber, $search_orderMoneyStart, $search_orderMoneyEnd, $search_timeStart, $search_timeEnd], function () {
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
            datePickWidget.datePick([$search_timeStart, $search_timeEnd]);

            /*联合查询*/
            $admin_search_btn.on('click', function () {
                var data = $.extend(true, {}, order_config.config.ajax.data);

                $.each([$search_paymentType, $search_orderNumber, $search_orderMoneyStart, $search_orderMoneyEnd, $search_timeStart, $search_timeEnd], function () {
                    var text = this.val(),
                        selector = this.selector.slice(1),
                        key = selector.split('_'),
                        ismoney = selector.indexOf('orderMoney') !== -1;

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
            moneyFilterWidget.moneyFilter([$search_orderMoneyStart, $search_orderMoneyEnd], true);


            /*事件绑定*/
            /*绑定查看，修改操作*/
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

                /*启用，禁用操作*/
                if (action === 'detail') {
                    if (operate_item) {
                        operate_item.removeClass('item-lighten');
                        operate_item = null;
                    }
                    operate_item = $tr.addClass('item-lighten');
                    showDetail(id, $tr);
                }
            });

            /*绑定关闭弹出层*/
            $show_detail_wrap.on('hide.bs.modal', function () {
                if (operate_item !== null) {
                    setTimeout(function () {
                        operate_item.removeClass('item-lighten');
                        operate_item = null;
                    }, 1000);
                }
            });


            /*初始化请求*/
            getColumnData(order_page, order_config);
        }


        /*获取数据*/
        function getColumnData(page, opt) {
            if (table === null) {
                table = opt.$admin_list_wrap.DataTable(opt.config);
            } else {
                table.ajax.config(opt.config.ajax).load();
            }
        }


        /*查看详情*/
        function showDetail(id, $tr) {
            if (typeof id === 'undefined' || id === '') {
                return false;
            }
            $.ajax({
                url: debug ? "../../json/test.json" : "http://10.0.5.226:8082/mall-buzhubms-api/sh/goodsorder/detail",
                dataType: 'JSON',
                method: 'post',
                data: {
                    id: id,
                    adminId: decodeURIComponent(logininfo.param.adminId),
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
                                nickname: 'name',
                                freight: 'money',
                                totalMoney: 'money',
                                amount: 'money',
                                deductionAmount: 'money',
                                createTime: 'datetime',
                                consigneeName: 'name',
                                consigneePhone: 'mobile',
                                orderStatus: 'rule,21,9,11,0,1,3,30,40,5'/*0待付款 1取消订单 3待发货 9待收货 11待评价 21已评价 30返修 40退货*/
                            },
                            maptype: 'object'
                        }).list;
                        resp.result['goods'] = testWidget.getMap({
                            map: {
                                goodsName: 'goods',
                                attribute: 'goodstype',
                                quantity: 'id',
                                goodsPriceTotal: 'money'
                            },
                            maptype: 'array',
                            mapmin: 5,
                            mapmax: 10
                        }).list;
                    }
                    var code = parseInt(resp.code, 10);
                    if (code !== 0) {
                        console.log(resp.message);
                        dia.content('<span class="g-c-bs-warning g-btips-warn">' + (resp.message || "查询详情失败") + '</span>').show();
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
                            orderStatus: '订单状态',
                            amount: '订单总价',
                            nickname: '买家名称(昵称)',
                            createTime: '下单时间',
                            consigneeName: '收货人姓名',
                            consigneePhone: '手机号码',
                            goodsName: '商品名称',
                            attribute: '商品属性',
                            quantity: '商品件数',
                            goodsPriceTotal: '商品总金额'
                        };
                        for (var j in list) {
                            if (j !== 'goods') {
                                if (typeof detail_map[j] !== 'undefined') {
                                    if (j === 'orderStatus') {
                                        var statusmap = {
                                            0: '<div class="g-c-warn">待付款</div>',
                                            1: '<div class="g-c-gray10">取消订单</div>',
                                            3: '<div class="g-c-info">待发货</div>',
                                            9: '<div class="g-c-info">待收货</div>',
                                            11: '<div class="g-c-gray6">待评价</div>',
                                            21: '<div class="g-c-green2">已评价</div>',
                                            30: '<div class="g-c-gray10">返修</div>',
                                            40: '<div class="g-c-gray10">禁用(锁定)</div>'
                                        };
                                        str += '<tr><th>' + detail_map[j] + ':</th><td>' + (statusmap[list[j]] || "<div class=\"g-c-red1\">异常</div>") + '</td></tr>';
                                    } else if (j === 'consigneePhone') {
                                        str += '<tr><th>' + detail_map[j] + ':</th><td>' + public_tool.phoneFormat(list[j]) + '</td></tr>';
                                    } else if (j === 'amount') {
                                        str += '<tr><th>' + detail_map[j] + ':<br /><em class="g-c-gray9">(商品总价|物流费用|用券抵扣)</em></th><td>￥:' + public_tool.moneyCorrect(list[j], 15, false)[0] + '&nbsp;<em class="g-c-gray10">(</em><em class="g-c-gray8">￥:' + (function () {
                                            if (typeof list['totalMoney'] !== 'undefined' || list['totalMoney'] !== '') {
                                                return public_tool.moneyCorrect(list['totalMoney'], 15, false)[0];
                                            }
                                            return 0.00;
                                        })() + '</em>&nbsp;<em class="g-c-gray12">|</em>&nbsp;<em class="g-c-gray8">￥:' + (function () {
                                            if (typeof list['freight'] !== 'undefined' || list['freight'] !== '') {
                                                return public_tool.moneyCorrect(list['freight'], 15, false)[0];
                                            }
                                            return 0.00;
                                        })() + '</em>&nbsp;<em class="g-c-gray12">|</em>&nbsp;<em class="g-c-gray8">￥:' + (function () {
                                            if (typeof list['deductionAmount'] !== 'undefined' || list['deductionAmount'] !== '') {
                                                return public_tool.moneyCorrect(list['deductionAmount'], 15, false)[0];
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
                                        <td>' + item["attribute"] + '</td>\
                                        <td>' + item["quantity"] + '</td>\
                                        <td>' + public_tool.moneyCorrect(item["goodsPriceTotal"], 15, false)[0] + '</td>\
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
                    dia.content('<span class="g-c-bs-warning g-btips-warn">' + (resp.message || "查询详情失败") + '</span>').show();
                });
        }


    });


})(jQuery);