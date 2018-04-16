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
            var powermap = public_tool.getPower(98),
                stats_power = public_tool.getKeyPower('mall-order-stats', powermap);


            /*dom引用和相关变量定义*/
            var $order_stats_wrap = $('#order_stats_wrap')/*表格*/,
                module_id = 'mall-order-stats'/*模块id，主要用于本地存储传值*/,
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
                $order_stats_list = $('#order_stats_list'),
                $order_showall_btn = $('#order_showall_btn'),
                admin_send_form = document.getElementById('admin_send_form'),
                $admin_send_form = $(admin_send_form),
                $admin_goodsOrderId = $('#admin_goodsOrderId'),
                $show_send_wrap = $('#show_send_wrap'),
                $admin_trackingNumber = $('#admin_trackingNumber'),
                $admin_shippingExpressId = $('#admin_shippingExpressId'),
                $admin_remark = $('#admin_remark'),
                $show_freight_wrap = $('#show_freight_wrap'),
                $admin_freight = $('#admin_freight'),
                $edit_freight = $('#edit_freight'),
                resetform0 = null,
                islogistics = false,
                sureObj = public_tool.sureDialog(dia)/*回调提示对象*/,
                setSure = new sureObj(),
                operate_item;


            /*查询对象*/
            var $search_orderNumber = $('#search_orderNumber'),
                $search_orderState = $('#search_orderState'),
                $admin_search_btn = $('#admin_search_btn'),
                $admin_search_clear = $('#admin_search_clear');


            /*打印对象*/
            var $show_print_wrap = $('#show_print_wrap'),
                $order_outerwrap = $('#order_outerwrap'),
                $order_innerwrap = $('#order_innerwrap'),
                $order_printok = $('#order_printok');


            /*列表请求配置*/
            var order_page = {
                    page: 1,
                    pageSize: 10,
                    total: 0
                },
                order_config = {
                    $order_stats_wrap: $order_stats_wrap,
                    $admin_page_wrap: $admin_page_wrap,
                    config: {
                        processing: true, /*大消耗操作时是否显示处理状态*/
                        deferRender: true, /*是否延迟加载数据*/
                        autoWidth: true, /*是否*/
                        paging: false,
                        ajax: {
                            url: "http://10.0.5.226:8082/mall-agentbms-api/goodsorder/list",
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
                                userId: decodeURIComponent(logininfo.param.roleId),
                                adminId: decodeURIComponent(logininfo.param.adminId),
                                token: decodeURIComponent(logininfo.param.token),
                                grade: decodeURIComponent(logininfo.param.grade),
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
                                "data": "totalQuantity"
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

                                    if (stauts === 0) {
                                        str = '<div class="g-c-red2">' + statusmap[stauts] + '</div>';
                                    } else if (stauts === 1) {
                                        str = '<div class="g-c-gray10">' + statusmap[stauts] + '</div>';
                                    } else if (stauts === 6) {
                                        str = '<div class="g-c-gray9">' + statusmap[stauts] + '</div>';
                                    } else if (stauts === 9) {
                                        str = '<div class="g-c-gray6">' + statusmap[stauts] + '</div>';
                                    } else if (stauts === 20) {
                                        str = '<div class="g-c-info">' + statusmap[stauts] + '</div>';
                                    } else if (stauts === 21) {
                                        str = '<div class="g-c-gray3">' + statusmap[stauts] + '</div>';
                                    }
                                    return str;
                                }
                            },
                            {
                                "data": "id",
                                "render": function (data, type, full, meta) {
                                    var id = parseInt(data, 10),
                                        btns = '',
                                        state = parseInt(full.orderState, 10);

                                    if (stats_power) {
                                        if (state === 6) {
                                            btns += '<span data-action="send" data-id="' + id + '"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-file-text-o"></i>\
											<span>发货</span>\
											</span>';
                                        }

                                        btns += '<span  data-subitem=""  data-action="select" data-state="' + state + '" data-id="' + id + '"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
										<i class="fa-angle-right"></i>\
										<span>查看</span>\
										</span>\
                                        <span data-action="excel" data-id="' + id + '"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8 g-d-hidei">\
                                            <i class="fa-file-excel-o"></i>\
                                            <span>导出</span>\
                                        </span>\
                                        <span data-action="print" data-id="' + id + '" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8 g-d-hidei">\
                                            <i class="fa-print"></i>\
                                            <span>打印</span>\
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
                $.each([$search_orderNumber, $search_orderState], function () {
                    var selector = this.selector;
                    if (selector.indexOf('orderState') !== -1) {
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
                var data = $.extend(true, {}, order_config.config.ajax.data);

                $.each([$search_orderNumber, $search_orderState], function () {
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
                order_config.config.ajax.data = $.extend(true, {}, data);
                getColumnData(order_page, order_config);
            });


            /*查询物流公司*/
            $.ajax({
                url: "http://10.0.5.226:8082/mall-agentbms-api/logistics/list",
                method: 'POST',
                dataType: 'json',
                data: {
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
                        islogistics = false;
                        $admin_shippingExpressId.html('<option value="" selected>请选择物流公司</option>');
                        return false;
                    }
                    var result = resp['result'];
                    if (!result) {
                        islogistics = false;
                        $admin_shippingExpressId.html('<option value="" selected>请选择物流公司</option>');
                        return false;
                    }
                    var list = result['list'],
                        len = 0,
                        i = 0,
                        str = '';
                    if (!list) {
                        islogistics = false;
                        $admin_shippingExpressId.html('<option value="" selected>请选择物流公司</option>');
                        return false;
                    }
                    len = list.length;
                    if (len === 0) {
                        islogistics = false;
                        $admin_shippingExpressId.html('<option value="" selected>请选择物流公司</option>');
                        return false;
                    }
                    islogistics = true;
                    for (i; i < len; i++) {
                        if (i === 0) {
                            str += '<option value="" selected>请选择物流公司</option><option value="' + list[i]['id'] + '">' + list[i]['companyName'] + '</option>';
                        } else {
                            str += '<option value="' + list[i]['id'] + '">' + list[i]['companyName'] + '</option>';
                        }
                    }
                    $(str).appendTo($admin_shippingExpressId.html(''));

                })
                .fail(function (resp) {
                    console.log(resp.message);
                    islogistics = false;
                });


            /*事件绑定*/
            /*绑定查看，修改操作*/

            $order_stats_wrap.delegate('span', 'click', function (e) {
                e.stopPropagation();
                e.preventDefault();

                var target = e.target,
                    $this,
                    id,
                    action,
                    $excel,
                    $print,
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
                if (action === 'send' && id !== '') {
                    /*没有物流公司时*/
                    if (!islogistics) {
                        dia.content('<span class="g-c-bs-warning g-btips-warn">暂无合作物流公司</span>').show();
                        setTimeout(function () {
                            dia.close();
                        }, 2000);
                        return false;
                    }
                    if (operate_item) {
                        operate_item.removeClass('item-lighten');
                        operate_item = null;
                    }
                    operate_item = $tr.addClass('item-lighten');
                    $admin_goodsOrderId.val(id);
                    $show_send_wrap.modal('show', {
                        backdrop: 'static'
                    });
                } else if (action === 'select') {
                    $excel = $this.next();
                    $print = $excel.next();
                    /*查看收货详情*/
                    (function () {
                        var subclass = $this.children('i').hasClass('fa-angle-down'),
                            tabletr = table.row($tr),
                            subitem = $this.attr('data-subitem');

                        if (subclass) {
                            /*收缩*/
                            $this.children('i').removeClass('fa-angle-down');
                            tabletr.child().hide(200);
                            $excel.addClass('g-d-hidei');
                            $print.addClass('g-d-hidei');
                        } else {
                            /*添加高亮状态*/
                            if (operate_item) {
                                operate_item.removeClass('item-lighten');
                                operate_item = null;
                            }
                            operate_item = $tr.addClass('item-lighten');
                            /*展开*/
                            if (subitem === '') {
                                $.ajax({
                                    url: "http://10.0.5.226:8082/mall-agentbms-api/goodsorder/details",
                                    dataType: 'JSON',
                                    method: 'post',
                                    data: {
                                        id: id,
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
                                            isok = false;
                                        }
                                        /*是否是正确的返回数据*/
                                        var result = resp.result;
                                        if (!result) {
                                            isok = false;
                                        } else {
                                            var list = result.list;
                                            if (!list) {
                                                isok = false;
                                            } else {
                                                isok = true;
                                            }
                                        }

                                        if (!isok) {
                                            tabletr.child($('<tr><td colspan="6"><table class="table table-bordered table-striped table-hover admin-table" ><tbody class="middle-align"><tr><td class="g-t-c" colspan="5">("暂无数据")</td></tr></tbody></table></td></tr>')).show();
                                            $this.attr({
                                                'data-subitem': 'true'
                                            }).children('i').addClass('fa-angle-down');
                                            return false;
                                        }

                                        var i = 0,
                                            newstate = parseInt($this.attr('data-state'), 10),
                                            newstr = '<colgroup>\
												<col class="g-w-percent5">\
												<col class="g-w-percent5">\
												<col class="g-w-percent5">\
												<col class="g-w-percent5">\
												<col class="g-w-percent5">\
												<col class="g-w-percent5">\
												<col class="g-w-percent5">\
												<col class="g-w-percent5">\
												<col class="g-w-percent10">\
											</colgroup>\
											<thead>\
												<tr>\
													<th>买家名称</th>\
													<th>联系电话</th>\
													<th>所在地址</th>\
													<th>收货人姓名</th>\
													<th>收货人电话</th>\
													<th>商品总价</th>\
													<th>物流费用</th>\
													<th>总计(商品总价+物流费用)</th>\
													<th>买家留言</th>\
												</tr>\
												<tr>' + (function () {
                                                var temp_totalMoney = result["totalMoney"]/*商品总价*/,
                                                    temp_freight = result["freight"]/*物流费用*/,
                                                    temp_amount = result["amount"]/*订单总价：(商品总价+物流费用)*/;
                                                var panelstr = '<td>' + (result["customerName"] || "") + '</td>\
														<td>' + (public_tool.phoneFormat(result["customerPhone"]) || "") + '</td>\
														<td>' + (result["customerAddress"] || "") + '</td>\
														<td>' + (result["consigneeName"] || "") + '</td>\
														<td>' + (result["consigneePhone"] || "") + '</td>\
														<td>￥' + (public_tool.moneyCorrect(temp_totalMoney, 12, true)[0] || "0.00") + '</td>\
														<td>￥' + (function () {
                                                    var edit_freight = public_tool.moneyCorrect(temp_freight, 12, true)[0] || "0.00";
                                                    /*待发货状态可以修改物流价格*/
                                                    if (newstate === 0) {
                                                        var edit_totalMoney = public_tool.moneyCorrect(temp_totalMoney, 12, true)[0] || "0.00";

                                                        return edit_freight + '&nbsp;&nbsp;<span data-totalMoney="' + edit_totalMoney + '" data-freight="' + edit_freight + '" data-action="edit_price" data-id="' + id + '"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
                                                                <i class="fa-pencil"></i>\
                                                                <span>修改</span>\
                                                            </span>';
                                                    } else {
                                                        return edit_freight;
                                                    }
                                                })() + '</td>\
														<td>￥' + (function () {

                                                    if (typeof temp_amount === 'undefined') {
                                                        return public_tool.moneyCorrect((temp_totalMoney + temp_freight), 12, true)[0] || "0.00";
                                                    } else {
                                                        return public_tool.moneyCorrect((temp_amount), 12, true)[0] || "0.00";
                                                    }
                                                }()) + '</td>\
														<td>' + (result["remark"] || "") + '</td>';
                                                return panelstr;
                                            }()) + '</tr>\
												<tr>\
													<th colspan="5">商品名称</th>\
													<th>批发价</th>\
													<th>购买数量</th>\
													<th colspan="2">商品属性</th>\
												</tr>\
											</thead>',
                                            res = '',
                                            len = list.length;

                                        if (len !== 0) {
                                            for (i; i < len; i++) {
                                                res += '<tr><td colspan="5">' + (list[i]["goodsName"] || "") + '</td><td>￥' + (public_tool.moneyCorrect(list[i]["wholesalePrice"], 12, true)[0] || "0.00") + '</td><td>' + (list[i]["quantlity"] || "0") + '</td><td colspan="2">' + (list[i]["attributeName"] || "") + '</td></tr>';

                                            }
                                        }
                                        res = '<tbody class="middle-align">' + res + '</tbody>';
                                        newstr = '<tr><td colspan="6"><table class="table table-bordered table-striped table-hover admin-table" >' + newstr + res + '</table></td></tr>';

                                        var $newtr = $(newstr);
                                        tabletr.child($newtr).show();
                                        $this.attr({
                                            'data-subitem': 'true'
                                        }).children('i').addClass('fa-angle-down');
                                        $excel.removeClass('g-d-hidei');
                                        $print.removeClass('g-d-hidei');
                                    })
                                    .fail(function (resp) {
                                        console.log(resp.message);
                                    });
                            } else {
                                tabletr.child().show();
                                $this.children('i').addClass('fa-angle-down');
                                $excel.removeClass('g-d-hidei');
                                $print.removeClass('g-d-hidei');
                            }
                        }
                    }());
                } else if (action === 'edit_price') {
                    /*修改物流价格*/
                    if (id === '') {
                        return false;
                    }
                    /*显示弹窗*/
                    $show_freight_wrap.modal('show', {
                        backdrop: 'static'
                    });
                    /*赋值*/
                    $admin_freight.attr({
                        'data-totalMoney': $this.attr('data-totalMoney'),
                        'data-freight': $this.attr('data-freight'),
                        'data-id': id
                    }).val('');
                } else if (action === 'excel') {
                    if (typeof id === 'undefined' || id === '' || id === null) {
                        return false;
                    }
                    window.open('http://10.0.5.226:8082/mall-agentbms-api/goodsorder/detail/export?adminId=' + decodeURIComponent(logininfo.param.adminId) + '&token=' + decodeURIComponent(logininfo.param.token) + '&id=' + id, '_blank');
                } else if (action === 'print') {
                    if (typeof id === 'undefined' || id === '' || id === null) {
                        return false;
                    }
                    orderPrint({
                        outer: table.row($tr).data(),
                        inner: $tr.next().find('>td').html()
                    });
                }
            });


            /*关闭弹出框*/
            $.each([$show_send_wrap, $show_freight_wrap, $show_print_wrap], function (index) {
                this.on('hide.bs.modal', function () {
                    if (operate_item) {
                        setTimeout(function () {
                            operate_item.removeClass('item-lighten');
                            operate_item = null;
                        }, 1000);
                    }
                    if (index === 0) {
                        admin_send_form.reset();
                    } else if (index === 1) {
                        $admin_freight.attr({
                            'data-totalMoney': '',
                            'data-freight': '',
                            'data-id': ''
                        }).val('');
                    }
                });
            });


            /*全部展开*/
            if (stats_power) {
                $order_showall_btn.removeClass('g-d-hidei').on('click', function () {
                    var len = $order_stats_list.find('tr').size();
                    if (len === 0) {
                        return false;
                    }
                    var isshow = $order_showall_btn.find('i').hasClass('fa-plus');

                    if (isshow) {
                        $order_showall_btn.html('<i class="fa-minus"></i>&nbsp;&nbsp;<span>全部收缩</span>');
                    } else {
                        $order_showall_btn.html('<i class="fa-plus"></i>&nbsp;&nbsp;<span>全部展开</span>');
                    }
                    $order_stats_list.find('span[data-action="select"]').trigger('click');
                });
            } else {
                $order_showall_btn.addClass('g-d-hidei');
            }


            /*绑定限制物流费用输入*/
            $admin_freight.on('keyup focusout', function (e) {
                var etype = e.type,
                    value = this.value,
                    newvalue = '';
                if (etype === 'keyup') {
                    this.value = value.replace(/[^0-9\.]*/g, '');
                } else if (etype === 'focusout') {
                    newvalue = public_tool.moneyCorrect(value, 15, true)[0];
                    this.value = newvalue;
                }
            });


            /*确认打印*/
            $order_printok.on('click', function () {
                html2canvas(document.getElementById('order_print')).then(function (canvas) {
                    var img_print = window.open(''),
                        blob = canvas.toDataURL(),
                        img = document.createElement("img"),
                        $body = $(img_print.document.body);

                    img.alt = '打印图片';
                    img.src = blob;
                    $body.css({
                        'padding-top': '20',
                        'padding-bottom': '20',
                        'box-sizing': 'border-box'
                    });
                    $(img).appendTo($body.html(''));
                    setTimeout(function () {
                        img_print.print();
                        img_print.close();
                    }, 100);
                });
            });


            /*提交修改物流费用*/
            $edit_freight.on('click', function () {
                setSure.sure('修改物流价格？', function (cf) {
                    /*to do*/
                    var tip = cf.dia || dia,
                        orderid = $admin_freight.attr('data-id'),
                        value = public_tool.trimSep($admin_freight.val(), ',');

                    if (orderid === '') {
                        /*过滤非法数据*/
                        tip.content('<span class="g-c-bs-warning g-btips-warn">请选中</span>').show();
                        setTimeout(function () {
                            tip.close();
                        }, 2000);
                        return false;
                    }

                    var config = {
                        url: "http://10.0.5.226:8082/mall-agentbms-api/order/freight/update",
                        dataType: 'JSON',
                        method: 'post',
                        data: {
                            token: decodeURIComponent(logininfo.param.token),
                            adminId: decodeURIComponent(logininfo.param.adminId),
                            goodsOrderId: orderid,
                            freight: value
                        }
                    };

                    $.ajax(config).done(function (resp) {
                        var code = parseInt(resp.code, 10);
                        if (code !== 0) {
                            console.log(resp.message);
                            tip.content('<span class="g-c-bs-warning g-btips-warn">' + (resp.message || "修改物流费用失败") + '</span>').show();
                            setTimeout(function () {
                                tip.close();
                            }, 2000);
                            return false;
                        }
                        tip.content('<span class="g-c-bs-success g-btips-succ">修改物流费用成功</span>').show();
                        /*重新获取数据*/
                        getColumnData(order_page, order_config);
                        setTimeout(function () {
                            tip.close();
                            $show_freight_wrap.modal('hide');
                        }, 2000);
                    }).fail(function (resp) {
                        console.log(resp.message);
                        tip.content('<span class="g-c-bs-warning g-btips-warn">' + (resp.message || "修改物流费用失败") + '</span>').show();
                        setTimeout(function () {
                            tip.close();
                        }, 2000);
                    });
                });
            });


            /*表单验证*/
            if ($.isFunction($.fn.validate)) {
                /*配置信息*/
                var form_opt0 = {},
                    formcache = public_tool.cache,
                    basedata = {
                        roleId: decodeURIComponent(logininfo.param.roleId),
                        adminId: decodeURIComponent(logininfo.param.adminId),
                        token: decodeURIComponent(logininfo.param.token),
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
                            formtype = 'ordersend';
                        }
                        $.extend(true, (function () {
                            if (formtype === 'ordersend') {
                                return form_opt0;
                            }
                        }()), (function () {
                            if (formtype === 'ordersend') {
                                return formcache.form_opt_0;
                            }
                        }()), {
                            submitHandler: function (form) {
                                setSure.sure('发货', function (cf) {
                                    /*to do*/
                                    var setdata = {},
                                        tip = cf.dia || dia;

                                    $.extend(true, setdata, basedata);

                                    if (formtype === 'ordersend') {
                                        var id = $admin_goodsOrderId.val();
                                        if (id === '') {
                                            return false;
                                        }
                                        $.extend(true, setdata, {
                                            trackingNumber: $admin_trackingNumber.val(),
                                            logisticsId: $admin_shippingExpressId.find(':selected').val(),
                                            remark: $admin_remark.val(),
                                            goodsOrderId: id
                                        });

                                        config['url'] = "http://10.0.5.226:8082/mall-agentbms-api/order/tracking/add";
                                        config['data'] = setdata;
                                    }

                                    $.ajax(config).done(function (resp) {
                                        var code;
                                        if (formtype === 'ordersend') {
                                            code = parseInt(resp.code, 10);
                                            if (code !== 0) {
                                                console.log(resp.message);
                                                tip.content('<span class="g-c-bs-warning g-btips-warn">' + (resp.message || "发货失败") + '</span>').show();
                                                setTimeout(function () {
                                                    tip.close();
                                                }, 2000);
                                                return false;
                                            }
                                            tip.content('<span class="g-c-bs-success g-btips-succ">发货成功</span>').show();
                                            /*重新获取数据*/
                                            getColumnData(order_page, order_config);
                                            setTimeout(function () {
                                                tip.close();
                                                $show_send_wrap.modal('hide');
                                            }, 2000);
                                        }
                                    }).fail(function (resp) {
                                        console.log(resp.message);
                                        tip.content('<span class="g-c-bs-warning g-btips-warn">' + (resp.message || "发货失败") + '</span>').show();
                                        setTimeout(function () {
                                            tip.close();
                                        }, 2000);
                                    });
                                });
                                return false;
                            }
                        });
                    });
                }


                /*提交验证*/
                if (resetform0 === null) {
                    resetform0 = $admin_send_form.validate(form_opt0);
                }
            }
        }


        /*获取数据*/
        function getColumnData(page, opt) {
            if (table === null) {
                table = opt.$order_stats_wrap.DataTable(opt.config);
            } else {
                table.ajax.config(opt.config.ajax).load();
            }
        }


        /*打印采购单*/
        function orderPrint(obj) {
            var outer_data = obj.outer,
                outer_str = '<td>' + outer_data["orderNumber"] + '</td><td>' + outer_data["orderTime"] + '</td><td>' + outer_data["customerName"] + '</td><td>' + outer_data["totalQuantity"] + '</td><td>' + {
                    0: "待付款",
                    1: "取消订单",
                    6: "待发货",
                    9: "待收货",
                    20: "待评价",
                    21: "已评价"
                }[outer_data["orderState"]] + '</td>';
            $(outer_str).appendTo($order_outerwrap.html(''));
            /*外部数据*/
            $(obj.inner).appendTo($order_innerwrap.html(''));
            /*内部数据*/
            setTimeout(function () {
                $show_print_wrap.modal('show', {backdrop: 'static'});
            }, 1000);
        }


    });


})(jQuery);