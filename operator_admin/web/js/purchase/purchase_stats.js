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
                stats_power = public_tool.getKeyPower('mall-purchase-stats', powermap),
                receive_power = public_tool.getKeyPower('mall-purchase-receiving', powermap);


            /*清除收货缓存*/
            public_tool.removeParams('mall-purchase-receive');


            /*dom引用和相关变量定义*/
            var $purchase_stats_wrap = $('#purchase_stats_wrap')/*表格*/,
                $purchase_stats_list = $('#purchase_stats_list'),
                module_id = 'mall-purchase-stats'/*模块id，主要用于本地存储传值*/,
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
                $purchase_showall_btn = $('#purchase_showall_btn'),
                operate_item;


            /*查询对象*/
            var $search_orderNumber = $('#search_orderNumber'),
                $search_providerName = $('#search_providerName'),
                $search_orderState = $('#search_orderState'),
                $admin_search_btn = $('#admin_search_btn'),
                $admin_search_clear = $('#admin_search_clear');


            /*打印对象*/
            var $show_print_wrap = $('#show_print_wrap'),
                $purchase_outerwrap=$('#purchase_outerwrap'),
                $purchase_innerwrap=$('#purchase_innerwrap'),
                $purchase_printok=$('#purchase_printok');


            /*列表请求配置*/
            var purchase_page = {
                    page: 1,
                    pageSize: 10,
                    total: 0
                },
                purchase_config = {
                    $purchase_stats_wrap: $purchase_stats_wrap,
                    $admin_page_wrap: $admin_page_wrap,
                    config: {
                        processing: true, /*大消耗操作时是否显示处理状态*/
                        deferRender: true, /*是否延迟加载数据*/
                        autoWidth: true, /*是否*/
                        paging: false,
                        ajax: {
                            url: "http://10.0.5.226:8082/mall-agentbms-api/purchasing/orderaudited/list",
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
                                purchase_page.page = result.page;
                                purchase_page.pageSize = result.pageSize;
                                purchase_page.total = result.count;
                                /*分页调用*/
                                $admin_page_wrap.pagination({
                                    pageSize: purchase_page.pageSize,
                                    total: purchase_page.total,
                                    pageNumber: purchase_page.page,
                                    onSelectPage: function (pageNumber, pageSize) {
                                        /*再次查询*/
                                        var param = purchase_config.config.ajax.data;
                                        param.page = pageNumber;
                                        param.pageSize = pageSize;
                                        purchase_config.config.ajax.data = param;
                                        getColumnData(purchase_page, purchase_config);
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
                        order: [[1, "desc"]],
                        columns: [
                            {
                                "data": "orderNumber"
                            },
                            {
                                "data": "orderTime"
                            },
                            {
                                "data": "providerName"
                            },
                            {
                                "data": "orderState",
                                "render": function (data, type, full, meta) {
                                    var stauts = parseInt(data, 10),
                                        statusmap = {
                                            0: "待发货",
                                            1: "未收货",
                                            3: "部分收货",
                                            5: "已收货"
                                        },
                                        str = '';

                                    if (stauts === 5) {
                                        str = '<div class="g-c-info">' + statusmap[stauts] + '</div>';
                                    } else if (stauts === 3) {
                                        str = '<div class="g-c-gray6">' + statusmap[stauts] + '</div>';
                                    } else if (stauts === 1) {
                                        str = '<div class="g-c-red2">' + statusmap[stauts] + '</div>';
                                    } else if (stauts === 0) {
                                        str = '<div class="g-c-warn">' + statusmap[stauts] + '</div>';
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

                                    if (receive_power && (state === 1 || state === 3)) {
                                        btns += '<span data-action="receive" data-id="' + id + '"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-file-text-o"></i>\
											<span>收货</span>\
											</span>';
                                    }
                                    if (stats_power) {
                                        btns += '<span  data-subitem=""  data-action="select" data-id="' + id + '"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
                                            <i class="fa-angle-right"></i>\
                                            <span>查看</span>\
										</span>\
										<span data-action="print" data-id="' + id + '"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8 g-d-hidei">\
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
            getColumnData(purchase_page, purchase_config);


            /*清空查询条件*/
            $admin_search_clear.on('click', function () {
                $.each([$search_orderNumber, $search_providerName, $search_orderState], function () {
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
                var data = $.extend(true, {}, purchase_config.config.ajax.data);

                $.each([$search_orderNumber, $search_providerName, $search_orderState], function () {
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
                purchase_config.config.ajax.data = $.extend(true, {}, data);
                getColumnData(purchase_page, purchase_config);
            });


            /*事件绑定*/
            /*绑定查看，修改操作*/
            $purchase_stats_wrap.delegate('span', 'click', function (e) {
                e.stopPropagation();
                e.preventDefault();

                var target = e.target,
                    $this,
                    id,
                    action,
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
                if (action === 'receive') {
                    public_tool.setParams('mall-purchase-receive', id);
                    location.href = 'mall-purchase-receive.html';
                } else if (action === 'select') {
                    $print = $this.next();
                    /*查看收货详情*/
                    (function () {
                        var subclass = $this.children('i').hasClass('fa-angle-down'),
                            tabletr = table.row($tr),
                            subitem = $this.attr('data-subitem');

                        if (subclass) {
                            /*收缩*/
                            $this.children('i').removeClass('fa-angle-down');
                            tabletr.child().hide(200);
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
                                    url: "http://10.0.5.226:8082/mall-agentbms-api/purchasing/orderaudited/details",
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
                                            tabletr.child($('<tr><td colspan="5"><table class="table table-bordered table-striped table-hover admin-table" ><tbody class="middle-align"><tr><td class="g-t-c" colspan="5">("暂无数据")</td></tr></tbody></table></td></tr>')).show();
                                            $this.attr({
                                                'data-subitem': 'true'
                                            }).children('i').addClass('fa-angle-down');
                                            return false;
                                        }

                                        var i = 0,
                                            newstr = '<colgroup>\
												<col class="g-w-percent10">\
												<col class="g-w-percent10">\
												<col class="g-w-percent10">\
												<col class="g-w-percent10">\
												<col class="g-w-percent10">\
											</colgroup>\
											<thead>\
												<tr>\
												<th>商品名称</th>\
												<th>商品属性</th>\
												<th>采购数量</th>\
												<th>发货数量</th>\
												<th>待发数量</th>\
											</tr>\
											</thead>',
                                            res = '',
                                            len = list.length;
                                        if (len !== 0) {
                                            for (i; i < len; i++) {
                                                res += '<tr><td>' + list[i]["goodsName"] + '</td><td>' + list[i]["attributeName"] + '</td><td>' + list[i]["purchasingQuantlity"] + '</td><td>' + list[i]["deliveredQuantlity"] + '</td><td>' + list[i]["waitingQuantlity"] + '</td></tr>';

                                            }
                                        }
                                        res = '<tbody class="middle-align">' + res + '</tbody>';
                                        newstr = '<tr><td colspan="5"><table class="table table-bordered table-striped table-hover admin-table" >' + newstr + res + '</table></td></tr>';

                                        var $newtr = $(newstr);
                                        tabletr.child($newtr).show();
                                        $this.attr({
                                            'data-subitem': 'true'
                                        }).children('i').addClass('fa-angle-down');
                                        $print.removeClass('g-d-hidei');

                                    })
                                    .fail(function (resp) {
                                        console.log(resp.message);
                                    });
                            } else {
                                tabletr.child().show();
                                $this.children('i').addClass('fa-angle-down');
                                $print.removeClass('g-d-hidei');
                            }
                        }
                    }());

                } else if (action === 'print') {
                    purchasePrint({
                        outer:table.row($tr).data(),
                        inner:$tr.next().find('table tbody').html()
                    });
                }
            });


            /*全部展开*/
            if (stats_power) {
                $purchase_showall_btn.removeClass('g-d-hidei').on('click', function () {
                    var len = $purchase_stats_list.find('tr').size();
                    if (len === 0) {
                        return false;
                    }

                    var isshow = $purchase_showall_btn.find('i').hasClass('fa-plus');

                    if (isshow) {
                        $purchase_showall_btn.html('<i class="fa-minus"></i>&nbsp;&nbsp;<span>全部收缩</span>');
                    } else {
                        $purchase_showall_btn.html('<i class="fa-plus"></i>&nbsp;&nbsp;<span>全部展开</span>');
                    }
                    $purchase_stats_list.find('span[data-action="select"]').trigger('click');
                });
            } else {
                $purchase_showall_btn.addClass('g-d-hidei');
            }

            /*绑定关闭打印窗口*/
            $show_print_wrap.on('hide.bs.modal', function () {
                if (operate_item) {
                    setTimeout(function () {
                        operate_item.removeClass('item-lighten');
                        operate_item = null;
                    }, 1000);
                }
            });
            
            /*确认打印*/
            $purchase_printok.on('click',function () {
                html2canvas(document.getElementById('purchase_print')).then(function (canvas){
                    var img_print=window.open(''),
                        blob=canvas.toDataURL(),
                        img = document.createElement("img");

                    img.alt='打印图片';
                    img.src=blob;
                    $(img).appendTo($(img_print.document.body).html(''));
                    img_print.print();
                });
            });


        }


        /*获取数据*/
        function getColumnData(page, opt) {
            if (table === null) {
                table = opt.$purchase_stats_wrap.DataTable(opt.config);
            } else {
                table.ajax.config(opt.config.ajax).load();
            }
        }


        /*打印采购单*/
        function purchasePrint(obj) {
            var outer_data=obj.outer,
            outer_str='<td>'+outer_data["orderNumber"]+'</td><td>'+outer_data["orderTime"]+'</td><td>'+outer_data["providerName"]+'</td><td>'+ {0: "待发货",1: "未收货",3: "部分收货",5: "已收货"}[outer_data["orderState"]]+'</td>';
            $(outer_str).appendTo($purchase_outerwrap.html(''));/*外部数据*/
            $(obj.inner).appendTo($purchase_innerwrap.html(''));/*内部数据*/
            $show_print_wrap.modal('show', {backdrop: 'static'});
        }


    });
})(jQuery);