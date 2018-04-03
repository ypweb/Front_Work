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
            var powermap = public_tool.getPower(350),
                detail_power = public_tool.getKeyPower('bzw-profitC-list', powermap)/*查看*/;


            /*dom引用和相关变量定义*/
            var debug = false,
                $admin_list_wrap = $('#admin_list_wrap')/*表格*/,
                module_id = 'bzw-profitC-list'/*模块id，主要用于本地存储传值*/,
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
                setSure = new sureObj(),
                operate_item = null;


            /*查询对象*/
            var $search_nickname = $('#search_nickname'),
                $search_phone = $('#search_phone'),
                $search_createTimeStart = $('#search_createTimeStart'),
                $search_createTimeEnd = $('#search_createTimeEnd'),
                $admin_search_btn = $('#admin_search_btn'),
                $admin_search_clear = $('#admin_search_clear');

            /*明细对象*/
            var $show_detail_wrap = $('#show_detail_wrap'),
                $show_detail_content = $('#show_detail_content');


            /*列表请求配置*/
            var profit_page = {
                    page: 1,
                    pageSize: 10,
                    total: 0
                },
                profit_config = {
                    $admin_list_wrap: $admin_list_wrap,
                    $admin_page_wrap: $admin_page_wrap,
                    config: {
                        processing: true, /*大消耗操作时是否显示处理状态*/
                        deferRender: true, /*是否延迟加载数据*/
                        autoWidth: true, /*是否*/
                        paging: false,
                        ajax: {
                            url: debug ? "../../json/test.json" : "http://10.0.5.226:8082/mall-buzhubms-api/commission/log/get/list",
                            dataType: 'JSON',
                            method: 'post',
                            dataSrc: function (json) {
                                if (debug) {
                                    var json = testWidget.test({
                                        map: {
                                            id: 'sequence',
                                            nickname: 'name',
                                            phone: 'mobile',
                                            goodsName: 'goods',
                                            commissionAmountTotal: 'money',
                                            createTime: 'datetime',
                                            commissionGrade: 'rule,1,2,3',
                                            commissionRate: 'minmax,0,100',
                                            commissionAmountExtra: 'money',
                                            commissionAmount: 'money'
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
                                profit_page.page = result.page;
                                profit_page.pageSize = result.pageSize;
                                profit_page.total = result.count;
                                /*分页调用*/
                                $admin_page_wrap.pagination({
                                    pageSize: profit_page.pageSize,
                                    total: profit_page.total,
                                    pageNumber: profit_page.page,
                                    onSelectPage: function (pageNumber, pageSize) {
                                        /*再次查询*/
                                        var param = profit_config.config.ajax.data;
                                        param.page = pageNumber;
                                        param.pageSize = pageSize;
                                        profit_config.config.ajax.data = param;
                                        getColumnData(profit_page, profit_config);
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
                        order: [[8, "desc"], [0, "desc"]],
                        columns: [
                            {
                                "data": "nickname"
                            },
                            {
                                "data": "phone",
                                "render": function (data, type, full, meta) {
                                    if (typeof data === 'undefined' || data === '') {
                                        return '';
                                    }
                                    return public_tool.phoneFormat(data);
                                }
                            },
                            {
                                "data": "goodsName"
                            },
                            {
                                "data": "commissionAmountTotal",
                                "render": function (data, type, full, meta) {
                                    return public_tool.moneyCorrect(data, 15, false)[0] || '0.00';
                                }
                            },
                            {
                                "data": "commissionGrade",
                                "render": function (data, type, full, meta) {
                                    return data + '级';
                                }
                            },
                            {
                                "data": "commissionRate",
                                "render": function (data, type, full, meta) {
                                    return data + '%';
                                }
                            },
                            {
                                "data": "commissionAmountExtra",
                                "render": function (data, type, full, meta) {
                                    return public_tool.moneyCorrect(data, 15, false)[0] || '0.00';
                                }
                            },
                            {
                                "data": "commissionAmount",
                                "render": function (data, type, full, meta) {
                                    return public_tool.moneyCorrect(data, 15, false)[0] || '0.00';
                                }
                            },
                            {
                                "data": "createTime"
                            },
                            {
                                "data": "id",
                                "render": function (data, type, full, meta) {
                                    var id = parseInt(data, 10),
                                        btns = '';

                                    /*查看详情*/
                                    if (detail_power) {
                                        btns += '<span data-action="detail" data-id="' + id + '"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
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



            /*清空查询条件*/
            $admin_search_clear.on('click', function () {
                /*清除查询条件*/
                $.each([$search_nickname, $search_phone, $search_createTimeStart, $search_createTimeEnd], function () {
                    this.val('');
                });
                /*重置分页*/
                profit_page.page = 1;
                profit_page.total = 0;
                profit_config.config.ajax.data['page'] = profit_page.page;
            }).trigger('click');

            /*日历查询*/
            datePickWidget.datePick([$search_createTimeStart, $search_createTimeEnd]);

            /*联合查询*/
            $admin_search_btn.on('click', function () {
                var data = $.extend(true, {}, profit_config.config.ajax.data);

                $.each([$search_nickname, $search_phone, $search_createTimeStart, $search_createTimeEnd], function () {
                    var text = this.val(),
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
                profit_config.config.ajax.data = $.extend(true, {}, data);
                getColumnData(profit_page, profit_config);
            });

            /*绑定切换查询类型和查询关键字关联查询*/
            /*格式化手机号码*/
            $search_phone.on('keyup', function (e) {
                this.value = this.value.replace(/\D*/g, '');
            });


            /*绑定关闭弹出层*/
            $.each([$show_detail_wrap], function () {
                this.on('hide.bs.modal', function () {
                    if (operate_item !== null) {
                        operate_item.removeClass('item-lighten');
                        operate_item = null;
                    }
                });
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

                if (operate_item) {
                    operate_item.removeClass('item-lighten');
                    operate_item = null;
                }
                operate_item = $tr.addClass('item-lighten');
                /*启用，禁用操作*/
                if (action === 'detail') {
                    /*查看详情*/
                    showDetail(id);
                }
            });


            /*初始化请求*/
            getColumnData(profit_page, profit_config);
        }


        /*获取数据*/
        function getColumnData(page, opt) {
            if (table === null) {
                table = opt.$admin_list_wrap.DataTable(opt.config);
            } else {
                /*清除批量数据*/
                /*todo*/
                table.ajax.config(opt.config.ajax).load();
            }
        }
        

        /*详情展现*/
        function showDetail(id) {
            if (typeof id === 'undefined' && id === '') {
                return false;
            }
            $.ajax({
                    url: debug ? "../../json/test.json" : "http://10.0.5.226:8082/mall-buzhubms-api/commission/log/get/details",
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
                                total: 'money',
                                nickname: 'name',
                                phone: 'mobile',
                                goodsName: 'goods',
                                goodsOrderNumber: 'guid',
                                nicknameBuy: 'name',
                                commissionAmountTotal: 'money',
                                createTime: 'datetime',
                                commissionGrade: 'rule,1,2,3',
                                commissionRate: 'minmax,0,100',
                                commissionAmountExtra: 'money',
                                commissionAmount: 'money'
                            },
                            maptype: 'object'
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
                        detail_map;

                    if (!$.isEmptyObject(list)) {
                        detail_map = {
                            total: '总分润额',
                            nickname: '会员名称(昵称)',
                            phone: '手机号',
                            goodsName: '商品名称',
                            goodsOrderNumber: '订单号',
                            nicknameBuy: '购买会员昵称',
                            commissionAmountTotal: '利润额',
                            createTime: '成交时间',
                            commissionGrade: '分润等级',
                            commissionRate: '分润比例',
                            commissionAmountExtra: '鼓励奖',
                            commissionAmount: '分润额'
                        };
                        /*添加高亮状态*/
                        for (var j in list) {
                            if (typeof detail_map[j] !== 'undefined') {
                                if (j === 'total' || j === 'commissionAmountTotal' || j === 'commissionAmountExtra' || j === 'commissionAmount') {
                                    str += '<tr><th>' + detail_map[j] + ':</th><td>' + public_tool.moneyCorrect(list[j], 15, false)[0] + '</td></tr>';
                                } else if (j === 'phone') {
                                    str += '<tr><th>' + detail_map[j] + ':</th><td>' + public_tool.phoneFormat(list[j]) + '</td></tr>';
                                } else if (j === 'commissionGrade') {
                                    str += '<tr><th>' + detail_map[j] + ':</th><td>' + list[j] + '级</td></tr>';
                                } else if (j === 'commissionRate') {
                                    str += '<tr><th>' + detail_map[j] + ':</th><td>' + list[j] + '%</td></tr>';
                                }else {
                                    str += '<tr><th>' + detail_map[j] + ':</th><td>' + list[j] + '</td></tr>';
                                }
                            }
                        }
                        if (str !== '') {
                            $(str).appendTo($show_detail_content.html(''));
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