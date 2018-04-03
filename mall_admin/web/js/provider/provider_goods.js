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


            /*dom引用和相关变量定义*/
            var debug = false,
                $admin_list_wrap = $('#admin_list_wrap')/*表格*/,
                $admin_batchlist_wrap = $('#admin_batchlist_wrap'),
                module_id = 'bzw-provider-goods'/*模块id，主要用于本地存储传值*/,
                $search_providerName = $('#search_providerName'),
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
                goods_params = {
                    roleId: decodeURIComponent(logininfo.param.roleId),
                    adminId: decodeURIComponent(logininfo.param.adminId),
                    grade: decodeURIComponent(logininfo.param.grade),
                    token: decodeURIComponent(logininfo.param.token)
                },
                sureObj = public_tool.sureDialog(dia)/*回调提示对象*/,
                setSure = new sureObj();


            /*获取供应商信息*/
            var provider_cache = public_tool.getParams('bzw-provider-goods');
            if (provider_cache) {
                /*{
                 providerid
                 legalname:
                 storename
                 }*/
                if (typeof provider_cache.providerid !== 'undefined') {
                    /*显示查询条件*/
                    var p_auditmap = {
                            0: '待审核',
                            1: '审核成功',
                            2: '审核失败'
                        },
                        p_auditstatus = parseInt(provider_cache.auditstatus, 10);

                    $search_providerName.html('<div class="inline g-f-l">供应商名称：<span class="g-c-info">' + provider_cache.storename + '</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div><div class="inline g-f-l">店主姓名：<span class="g-c-info">' + provider_cache.legalname + '</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div><div class="inline g-f-l">供应商审核状态：<span class="g-c-info">' + p_auditmap[p_auditstatus] + '</span></div>');
                    /*权限调用*/
                    var powermap = public_tool.getPower(250),
                        forbid_power = public_tool.getKeyPower('bzw-forbid-goods', powermap),
                        detail_power = public_tool.getKeyPower('bzw-goods-details', powermap),
                        updown_power = public_tool.getKeyPower('bzw-goods-updown', powermap);


                    /*查看详情*/
                    var $goods_detail_wrap = $('#goods_detail_wrap'),
                        listone = {}/*价格数据对象1*/,
                        listtwo = {}/*价格数据对象2*/,
                        listthree = {}/*价格数据对象3*/,
                        attr_map = {},
                        $admin_slide_image = $('#admin_slide_image'),
                        $admin_slide_btnl = $('#admin_slide_btnl'),
                        $admin_slide_btnr = $('#admin_slide_btnr'),
                        $admin_slide_tool = $('#admin_slide_tool'),
                        slide_config = {
                            $slide_tool: $admin_slide_tool,
                            $image: $admin_slide_image,
                            $btnl: $admin_slide_btnl,
                            $btnr: $admin_slide_btnr,
                            active: 'admin-slide-active',
                            len: 5
                        };

                    /*判断供应商审核状态*/
                    if (p_auditstatus === 1) {
                        /*审核通过:即可执行商品操作*/
                        /*批量配置参数*/
                        var $admin_batchitem_btn = $('#admin_batchitem_btn'),
                            $admin_batchitem_show = $('#admin_batchitem_show'),
                            $admin_batchitem_check = $('#admin_batchitem_check'),
                            $admin_batchitem_action = $('#admin_batchitem_action'),
                            batchItem = new public_tool.BatchItem();

                        /*批量初始化*/
                        batchItem.init({
                            $batchtoggle: $admin_batchitem_btn,
                            $batchshow: $admin_batchitem_show,
                            $checkall: $admin_batchitem_check,
                            $action: $admin_batchitem_action,
                            $listwrap: $admin_batchlist_wrap,
                            setSure: setSure,
                            powerobj: {
                                'forbid': forbid_power,
                                'enable': forbid_power,
                                'up': updown_power,
                                'down': updown_power
                            },
                            fn: function (type) {
                                /*批量操作*/
                                batchGoods({
                                    action: type
                                });
                            }
                        });
                    }


                    /*列表请求配置*/
                    var goods_page = {
                            page: 1,
                            pageSize: 10,
                            total: 0
                        },
                        goods_config = {
                            $admin_list_wrap: $admin_list_wrap,
                            $admin_page_wrap: $admin_page_wrap,
                            config: {
                                processing: true, /*大消耗操作时是否显示处理状态*/
                                deferRender: true, /*是否延迟加载数据*/
                                autoWidth: true, /*是否*/
                                paging: false,
                                ajax: {
                                    url: debug ? "../../json/test.json" : "http://10.0.5.226:8082/mall-buzhubms-api/goods/list/v2",
                                    dataType: 'JSON',
                                    method: 'post',
                                    dataSrc: function (json) {
                                        if (debug) {
                                            var json = testWidget.test({
                                                map: {
                                                    id: 'sequence'/*订单ID*/,
                                                    gcode: 'guid'/*商品编号*/,
                                                    name: 'goods'/*商品名称*/,
                                                    source: 'value'/*商品来源*/,
                                                    goodsKinds: 'rule,1,2'/*商品种类*/,
                                                    goodsTypeName: 'value'/*分类名称*/,
                                                    sort: 'id'/*商城排序*/,
                                                    isForbidden: 'rule,true,false'/*是否禁售*/,
                                                    auditStatus: 'rule,0,1,2'/*审核状态,0:待审核，1审核成功，2：审核失败*/,
                                                    status: 'rule,0,1,2,3'/*状态，0：仓库，1:上架,2:下架,3:删除,4:待审核*/,
                                                    lastUpdate: 'datetime'/*状态，0：仓库，1:上架,2:下架,3:删除,4:待审核*/,
                                                    createTime: 'datetime'
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
                                        goods_page.page = result.page;
                                        goods_page.pageSize = result.pageSize;
                                        goods_page.total = result.count;
                                        /*分页调用*/
                                        $admin_page_wrap.pagination({
                                            pageSize: goods_page.pageSize,
                                            total: goods_page.total,
                                            pageNumber: goods_page.page,
                                            onSelectPage: function (pageNumber, pageSize) {
                                                /*再次查询*/
                                                var param = goods_config.config.ajax.data;
                                                param.page = pageNumber;
                                                param.pageSize = pageSize;
                                                goods_config.config.ajax.data = param;
                                                getColumnData(goods_page, goods_config);
                                            }
                                        });
                                        return result ? result.list || [] : [];
                                    },
                                    data: {
                                        roleId: decodeURIComponent(logininfo.param.roleId),
                                        adminId: decodeURIComponent(logininfo.param.adminId),
                                        grade: decodeURIComponent(logininfo.param.grade),
                                        token: decodeURIComponent(logininfo.param.token),
                                        source: provider_cache.storename,
                                        page: 1,
                                        pageSize: 10
                                    }
                                },
                                info: false,
                                searching: true,
                                order: [[8, "desc"],[2, "desc"]],
                                columns: [
                                    {
                                        "data": "id",
                                        "orderable": false,
                                        "searchable": false,
                                        "render": function (data, type, full, meta) {
                                            return '<input data-forbid="' + full.isForbidden + '" data-status="' + full.status + '" value="' + data + '" data-auditstatus="' + full.auditStatus + '" name="goodsID" type="checkbox" />';
                                        }
                                    },
                                    {
                                        "data": "gcode"
                                    },
                                    {
                                        "data": "name"
                                    },
                                    {
                                        "data": "auditStatus",
                                        "render": function (data, type, full, meta) {
                                            var stauts = parseInt(data, 10),
                                                statusmap = {
                                                    0: '待审核',
                                                    1: '审核成功',
                                                    2: '审核失败'
                                                },
                                                str = '';

                                            if (stauts === 0) {
                                                str = '<div class="g-c-warn">' + statusmap[stauts] + '</div>';
                                            } else if (stauts === 1) {
                                                str = '<div class="g-c-gray5">' + statusmap[stauts] + '</div>';
                                            } else if (stauts === 2) {
                                                str = '<div class="g-c-gray10">' + statusmap[stauts] + '</div>';
                                            }
                                            return str;
                                        }
                                    },
                                    {
                                        "data": "goodsTypeName"
                                    },
                                    {
                                        "data": "sort"
                                    },
                                    {
                                        "data": "status",
                                        "render": function (data, type, full, meta) {
                                            var stauts = parseInt(data, 10),
                                                statusmap = {
                                                    0: "仓库",
                                                    1: "上架",
                                                    2: "下架",
                                                    3: "删除",
                                                    4: "待审核"
                                                },
                                                str = '';

                                            if (stauts === 3) {
                                                str = '<div class="g-c-red1">' + statusmap[stauts] + '</div>';
                                            } else if (stauts === 0) {
                                                str = '<div class="g-c-warn">' + statusmap[stauts] + '</div>';
                                            } else if (stauts === 1) {
                                                str = '<div class="g-c-gray6">' + statusmap[stauts] + '</div>';
                                            } else if (stauts === 2) {
                                                str = '<div class="g-c-gray9">' + statusmap[stauts] + '</div>';
                                            } else if (stauts === 4) {
                                                str = '<div class="g-c-info">' + statusmap[stauts] + '</div>';
                                            }
                                            return str;
                                        }
                                    },
                                    {
                                        "data": "isForbidden",
                                        "render": function (data, type, full, meta) {
                                            var statusmap = {
                                                    true: "禁售",
                                                    false: "取消禁售"
                                                },
                                                str = '';

                                            if (data) {
                                                str = '<div class="g-c-gray9">' + statusmap[data] + '</div>';
                                            } else {
                                                str = '<div class="g-c-info">' + statusmap[data] + '</div>';
                                            }
                                            return str;
                                        }
                                    },
                                    {
                                        "data": "lastUpdate"
                                    },
                                    {
                                        "data": "id",
                                        "render": function (data, type, full, meta) {
                                            var id = parseInt(data, 10),
                                                btns = '',
                                                temp_forbid = full.isForbidden,
                                                temp_status = parseInt(full.status, 10),
                                                temp_audit = parseInt(full.auditStatus, 10);

                                            if (p_auditstatus === 1) {
                                                /*上架，下架*/
                                                if (updown_power && temp_audit === 1) {
                                                    /*审核成功状态才可上架，下架*/
                                                    if (temp_status === 1) {
                                                        /*上架状态则下架*/
                                                        btns += '<span data-action="down" data-id="' + id + '"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
															<i class="fa-arrow-down"></i>\
															<span>下架</span>\
														</span>';
                                                    } else if (temp_status === 2 || temp_status === 0 || temp_status === 3) {
                                                        /*下架状态，仓库状态，删除状态则上架*/
                                                        btns += '<span data-action="up" data-id="' + id + '"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
															<i class="fa-arrow-up"></i>\
															<span>上架</span>\
														</span>';
                                                    }

                                                }
                                                if (forbid_power) {
                                                    /*可售，禁售*/
                                                    if (temp_forbid === true) {
                                                        /*禁售状态则可售*/
                                                        btns += '<span data-action="enable" data-id="' + id + '"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
															<i class="fa-toggle-off"></i>\
															<span>取消禁售</span>\
														</span>';
                                                    } else if (temp_forbid === false) {
                                                        /*可售状态则禁售*/
                                                        btns += '<span data-action="forbid" data-id="' + id + '"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
															<i class="fa-toggle-on"></i>\
															<span>禁售</span>\
														</span>';
                                                    }
                                                }
                                            }
                                            if (detail_power) {
                                                btns += '<span data-action="select" data-id="' + id + '"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
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

                    /*初始化请求*/
                    getColumnData(goods_page, goods_config);

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
                            $tr,
                            actionmap = {
                                "up": 1,
                                "down": 2,
                                "forbid": 3,
                                "enable": 4,
                                "recommend": 8,
                                "delete": 7,
                                "audit_yes": 5,
                                "audit_no": 6
                            },
                            actiontip = {
                                "up": '上架',
                                "down": '下架',
                                "forbid": '禁售',
                                "enable": '取消禁售',
                                "recommend": '推荐',
                                "delete": "删除",
                                "select": '查看',
                                "audit": '审核',
                                "audit_yes": '审核',
                                "audit_no": '审核'
                            };
                        /*
                         1：上架，
                         2：下架，
                         3：禁售，
                         4：取消禁售，
                         5：审核通过，
                         6：审核不通过，
                         7：删除，
                         8：推荐到
                         * */

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
                        if (action === 'select') {
                            /*查看*/
                            showDetail(id, $tr);
                        } else if (action === 'forbid' || action === 'enable') {
                            /*清除批量选中*/
                            batchItem.filterData(id);
                            if (operate_item) {
                                operate_item.removeClass('item-lighten');
                                operate_item = null;
                            }
                            operate_item = $tr.addClass('item-lighten');
                            /*确认是否启用或禁用*/
                            setSure.sure(actiontip[action], function (cf) {
                                /*to do*/
                                goodsAction({
                                    id: id,
                                    action: action,
                                    tip: cf.dia || dia,
                                    type: 'base',
                                    actiontip: actiontip,
                                    actionmap: actionmap
                                }, action === 'forbid' ? "禁售后，商品将不再显示在前端，是否禁售？" : "取消禁售后，商品将显示在前端，是否取消禁售？", true);
                            });
                        } else if (action === 'up' || action === 'down') {
                            /*清除批量选中*/
                            batchItem.filterData(id);
                            if (operate_item) {
                                operate_item.removeClass('item-lighten');
                                operate_item = null;
                            }
                            operate_item = $tr.addClass('item-lighten');

                            /*确认是否启用或禁用*/
                            /*to do*/
                            goodsAction({
                                id: id,
                                action: action,
                                type: 'base',
                                actiontip: actiontip,
                                actionmap: actionmap
                            });
                        }
                    });


                    /*绑定关闭详情*/
                    $.each([$goods_detail_wrap], function () {
                        this.on('hide.bs.modal', function () {
                            if (operate_item) {
                                setTimeout(function () {
                                    operate_item.removeClass('item-lighten');
                                    operate_item = null;
                                }, 1000);
                            }
                            listone = {};
                            listtwo = {};
                            listthree = {};
                            attr_map = {};
                        });
                    });


                }
            } else {
                $admin_batchlist_wrap.html('<tr><td style="height:200px;" colspan="9" class="g-t-c">没有相关供应商商品列<a href="bzw-provider-list.html" class="btn btn-white btn-xs g-br2 g-c-info">&nbsp;&nbsp;<span>返回</span>&nbsp;&nbsp;</a></td></tr>');
            }
        }


        /*获取数据*/
        function getColumnData(page, opt) {
            if (table === null) {
                table = opt.$admin_list_wrap.DataTable(opt.config);
            } else {
                /*清除批量数据*/
                batchItem.clear();
                table.ajax.config(opt.config.ajax).load();
            }
        }


        /*各种操作*/
        function goodsAction(obj) {
            var id = obj.id;

            if (typeof id === 'undefined') {
                return false;
            }
            var tip = obj.tip || dia,
                action = obj.action,
                type = obj.type;

            var temp_config = $.extend(true, {}, goods_params);

            temp_config['operate'] = obj.actionmap[action];
            if (type === 'batch') {
                temp_config['ids'] = id.join(',');
            } else if (type === 'base') {
                temp_config['ids'] = id;
            }

            $.ajax({
                url: debug ? "../../json/test.json" : "http://10.0.5.226:8082/mall-buzhubms-api/goods/operate",
                dataType: 'JSON',
                method: 'post',
                data: temp_config
            })
                .done(function (resp) {
                    if (debug) {
                        var resp = testWidget.testSuccess('list');
                    }
                    var code = parseInt(resp.code, 10);
                    if (code !== 0) {
                        console.log(resp.message);
                        tip.content('<span class="g-c-bs-warning g-btips-warn">' + (resp.message || "操作失败") + '</span>').show();
                        if (type === 'base') {
                            if (operate_item) {
                                operate_item.removeClass('item-lighten');
                                operate_item = null;
                            }
                        } else if (type === 'batch') {
                            batchItem.clear();
                        }
                        setTimeout(function () {
                            tip.close();
                        }, 2000);
                        return false;
                    }
                    /*是否是正确的返回数据*/
                    /*添加高亮状态*/
                    tip.content('<span class="g-c-bs-success g-btips-succ">' + obj.actiontip[action] + '成功</span>').show();
                    setTimeout(function () {
                        tip.close();
                        if (type === 'base') {
                            if (operate_item) {
                                operate_item.removeClass('item-lighten');
                                operate_item = null;
                            }
                        } else if (type === 'batch') {
                            batchItem.clear();
                        }
                        setTimeout(function () {
                            /*请求数据*/
                            getColumnData(goods_page, goods_config);
                        }, 1000);
                    }, 1000);
                })
                .fail(function (resp) {
                    console.log(resp.message);
                    tip.content('<span class="g-c-bs-warning g-btips-warn">' + (resp.message || "操作失败") + '</span>').show();
                    if (type === 'base') {
                        if (operate_item) {
                            operate_item.removeClass('item-lighten');
                            operate_item = null;
                        }
                    } else if (type === 'batch') {
                        batchItem.clear();
                    }
                    setTimeout(function () {
                        tip.close();
                    }, 2000);
                });
        }


        /*批量操作*/
        function batchGoods(config) {

            var action = config.action;

            if (action === '' || typeof action === 'undefined') {
                return false;
            }
            var inputitems = batchItem.getBatchNode(),
                len = inputitems.length,
                i = 0;

            if (len === 0) {
                dia.content('<span class="g-c-bs-warning g-btips-warn">请选中操作数据</span>').show();
                setTimeout(function () {
                    dia.close();
                }, 2000);
                return false;
            }
            var tempid = batchItem.getBatchData(),
                filter = [],
                actionmap = {
                    "up": 1,
                    "down": 2,
                    "forbid": 3,
                    "enable": 4,
                    "recommend": 8,
                    "delete": 7,
                    "audit_yes": 5,
                    "audit_no": 6
                },
                actiontip = {
                    "up": '上架',
                    "down": '下架',
                    "forbid": '禁售',
                    "enable": '取消禁售',
                    "recommend": '推荐',
                    "delete": "删除",
                    "select": '查看',
                    "audit": '审核',
                    "audit_yes": '审核',
                    "audit_no": '审核'
                };

            for (i; i < len; i++) {
                var tempinput = inputitems[i],
                    temp_forbid = tempinput.attr('data-forbid'),
                    temp_status = parseInt(tempinput.attr('data-status'), 10),
                    temp_audit = parseInt(tempinput.attr('data-auditstatus'), 10);

                if (temp_audit !== 1) {
                    /*待审核，审核失败：则不参与操作*/
                    if (action === 'up' || action === 'down') {
                        filter.push(tempid[i]);
                        continue;
                    }
                } else {
                    /*审核成功:则可上架，下架，推荐等操作*/
                    /*上架，下架*/
                    if (temp_status === 1) {
                        /*上架状态则下架*/
                        if (action === 'up') {
                            filter.push(tempid[i]);
                            continue;
                        }
                    } else if (temp_status === 2) {
                        /*下架状态则上架*/
                        if (action === 'down') {
                            filter.push(tempid[i]);
                            continue;
                        }
                    } else if (temp_status === 0) {
                        /*仓库状态则上架*/
                        if (action === 'down') {
                            filter.push(tempid[i]);
                            continue;
                        }
                    } else if (temp_status === 3) {
                        /*删除状态则不做推荐操作*/
                        if (action === 'recommend') {
                            filter.push(tempid[i]);
                            continue;
                        }
                    }
                }

                /*可售，禁售*/
                if (temp_forbid === 'true') {
                    /*禁售状态则可售*/
                    if (action === 'forbid') {
                        filter.push(tempid[i]);
                        continue;
                    }
                } else if (temp_forbid === 'false') {

                    /*可售状态则禁售*/
                    if (action === 'enable') {
                        filter.push(tempid[i]);
                        continue;
                    }
                }

            }

            if (filter.length !== 0) {
                dia.content('<span class="g-c-bs-warning g-btips-warn">操作状态和选中状态不匹配,系统将过滤不匹配数据</span>').show();
                batchItem.filterData(filter);
                filter.length = 0;
                setTimeout(function () {
                    dia.close();
                    /*批量操作*/
                    tempid = batchItem.getBatchData();
                    if (tempid.length !== 0) {
                        if (action === 'forbid' || action === 'enable') {
                            /*确认是否启用或禁用*/
                            setSure.sure(actiontip[action], function (cf) {
                                /*to do*/
                                goodsAction({
                                    id: tempid,
                                    action: action,
                                    tip: cf.dia || dia,
                                    type: 'batch',
                                    actiontip: actiontip,
                                    actionmap: actionmap
                                }, action === 'forbid' ? "禁售后，商品将不再显示在前端，是否禁售？" : "取消禁售后，商品将显示在前端，是否取消禁售？", true);
                            });
                        } else if (action === 'up' || action === 'down') {
                            goodsAction({
                                id: tempid,
                                type: 'batch',
                                action: action,
                                actiontip: actiontip,
                                actionmap: actionmap
                            });
                        }
                    }
                }, 2000);
            } else {
                /*批量操作*/
                tempid = batchItem.getBatchData();
                if (tempid.length !== 0) {
                    if (action === 'forbid' || action === 'enable') {
                        /*确认是否启用或禁用*/
                        setSure.sure(actiontip[action], function (cf) {
                            /*to do*/
                            goodsAction({
                                id: tempid,
                                action: action,
                                tip: cf.dia || dia,
                                type: 'batch',
                                actiontip: actiontip,
                                actionmap: actionmap
                            }, action === 'forbid' ? "禁售后，商品将不再显示在前端，是否禁售？" : "取消禁售后，商品将显示在前端，是否取消禁售？", true);
                        });
                    } else if (action === 'up' || action === 'down') {
                        goodsAction({
                            id: tempid,
                            type: 'batch',
                            action: action,
                            actiontip: actiontip,
                            actionmap: actionmap
                        });
                    }
                }
            }
        }


        /*查看详情*/
        function showDetail(id, $tr) {
            if (typeof id === 'undefined') {
                return false;
            }

            var temp_config = $.extend(true, {}, goods_params);

            temp_config['id'] = id;
            $.ajax({
                url: debug ? "../../json/good_attr.json" : "http://10.0.5.226:8082/mall-buzhubms-api/goods/detail",
                dataType: 'JSON',
                method: 'post',
                data: temp_config
            })
                .done(function (resp) {
                    /*if (debug) {
                        var resp = {
                            code: 0,
                            message: 'ok',
                            result: testWidget.getMap({
                                map: {
                                    bannerList: 'arr'/!*订单ID*!/,
                                    details: 'content'/!*商品编号*!/,
                                    goodsTypeId: 'goods'/!*商品名称*!/,
                                    name: 'value'/!*商品来源*!/,
                                    status: 'rule,0,1,2,3'/!*状态，0：仓库，1:上架,2:下架,3:删除,4:待审核*!/,
                                    source: 'value',
                                    gcode: 'guid',
                                    sort: 'id'/!*商城排序*!/,
                                    tagsAttrsList: 'arr',
                                    attrInventoryPrices: 'arr'
                                },
                                maptype: 'object'
                            }).list
                        };
                    }
*/
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
                    if ($.isEmptyObject(result)) {
                        return false;
                    }
                    /*解析轮播图*/
                    var banner = result['bannerList'];
                    if (banner && banner.length !== 0) {
                        getSlideData(banner, slide_config);
                    }
                    /*解析详情*/
                    var detail = result['details'];
                    if (detail !== '') {
                        getDetailHtml(detail);
                    }

                    /*解析文字描述*/
                    var characterdescribe = result['characterDescribe'];
                    if (typeof characterdescribe !== 'undefined') {
                        document.getElementById('admin_characterdescribe').innerHTML = characterdescribe;
                    }else{
                        document.getElementById('admin_characterdescribe').innerHTML = '';
                    }

                    /*解析类型*/
                    var type = result['goodsTypeId'];
                    if (typeof type !== 'undefined') {
                        document.getElementById('admin_goodstype').innerHTML = type;
                    }
                    /*解析名称*/
                    var name = result['name'];
                    if (typeof name !== 'undefined') {
                        document.getElementById('admin_name').innerHTML = name;
                    }
                    /*解析状态*/
                    var status = result['status'],
                        statemap = {
                            '0': '仓库',
                            '1': '上架',
                            '2': '下架',
                            '3': '删除',
                            '4': "待审核"
                        };
                    if (typeof status !== 'undefined' && status !== '') {
                        document.getElementById('admin_status').innerHTML = statemap[status];
                    } else {
                        document.getElementById('admin_status').innerHTML = statemap[0];
                    }
                    /*解析编码*/
                    var gcode = result['gcode'];
                    if (typeof gcode !== 'undefined') {
                        document.getElementById('admin_code').innerHTML = gcode;
                    }
                    /*解析排序*/
                    var sort = result['sort'];
                    if (typeof sort !== 'undefined') {
                        document.getElementById('admin_sort').innerHTML = sort;
                    }
                    /*解析是否被推荐*/
                    /*var isrec = result['isRecommended'];
                    if (typeof isrec !== 'undefined') {
                        document.getElementById('admin_isRecommended').innerHTML = (isrec ? '是' : '否');
                    }*/

                    /*解析来源*/
                    var source = result['source'];
                    if (source) {
                        document.getElementById('admin_source').innerHTML = source;
                    }

                    /*解析库存，批发价，建议零售价*/
                    getAttrData(result['tagsAttrsList'], result['attrInventoryPrices']);

                    /*添加高亮状态*/
                    if (operate_item) {
                        operate_item.removeClass('item-lighten');
                        operate_item = null;
                    }
                    operate_item = $tr.addClass('item-lighten');
                    $goods_detail_wrap.modal('show', {backdrop: 'static'});
                })
                .fail(function (resp) {
                    console.log(resp.message);
                    dia.content('<span class="g-c-bs-warning g-btips-warn">' + (resp.message || "操作失败") + '</span>').show();
                    setTimeout(function () {
                        dia.close();
                    }, 2000);
                });

        }


        /*查询标签与属性*/
        function getAttrData(attr, price) {
            var attrlen = 0,
                pricelen = 0,
                priceobj;

            if (attr) {
                attrlen = attr.length;
            }

            if (attrlen === 0) {
                /*没有颜色和规格时*/
                if (price) {
                    pricelen = price.length;
                    if (pricelen !== 0) {
                        priceobj = price[0];
                        if (priceobj !== null || priceobj !== '') {
                            priceobj = priceobj.split("#");
                            if (priceobj.length !== 0) {
                                document.getElementById('admin_inventory').innerHTML = priceobj[0];
                                document.getElementById('admin_wholesale_price').innerHTML = '￥:' + public_tool.moneyCorrect(priceobj[1], 12, false)[0];
                                document.getElementById('admin_retail_price').innerHTML = '￥:' + public_tool.moneyCorrect(priceobj[2], 12, false)[0];
                                document.getElementById('admin_supplier_price').innerHTML = (function () {
                                    var supplier = priceobj[5];
                                    if (supplier === '' || isNaN(supplier)) {
                                        supplier = '￥:' + '0.00';
                                    } else {
                                        supplier = '￥:' + public_tool.moneyCorrect(supplier, 12, false)[0];
                                    }
                                    return supplier;
                                }());
                            }
                        }
                    }
                }
            } else {
                /*存储对象*/
                (function () {
                    var i = 0;
                    for (i; i < attrlen; i++) {
                        var attr_obj = attr[i],
                            name = attr[i]['name'],
                            arr = attr[i]['list'],
                            id = attr[i]['id'],
                            j = 0,
                            sublen = arr.length;

                        /*存入属性对象*/
                        if (sublen !== 0) {
                            /*没有填入对象即创建相关对象*/
                            attr_obj['map'] = {};
                            attr_obj['res'] = {};
                            /*遍历*/
                            for (j; j < sublen; j++) {
                                var subobj = arr[j],
                                    attrvalue = subobj["id"],
                                    attrtxt = subobj["name"];
                                attr_obj['map'][attrtxt] = attrvalue;
                                attr_obj['res'][attrvalue] = attrtxt;
                            }
                            attr_obj['label'] = name.replace(/(\(.*\))|(\（.*\）)|\s*/g, '');
                            attr_obj['key'] = id;
                            attr_map[id] = attr_obj;
                        } else if (sublen === 0) {
                            attr_obj['map'] = {};
                            attr_obj['res'] = {};
                            attr_obj['label'] = name.replace(/(\(.*\))|(\（.*\）)|\s*/g, '');
                            attr_obj['key'] = id;
                            attr_map[id] = attr_obj;
                        }
                    }
                }());


                /*解析结果集*/
                if (price) {
                    priceobj = price;
                    pricelen = price.length;
                    if (pricelen !== 0) {
                        var attrmap = {},
                            attrobj = priceobj[0].split('#');

                        if (attrobj.length < 7) {
                            document.getElementById('admin_wholesale_price_list').innerHTML = '<tr><td colspan="7" class="g-t-c g-c-gray9">暂无数据</td></tr>';
                            document.getElementById('admin_wholesale_price_thead').innerHTML = '<tr><th>颜色</th><th>规格</th><th>库存</th><th>批发价</th><th>建议零售价</th><th>供应商价</th><th>价格显示在首页</th></tr>';
                            return false;
                        }

                        /*解析第一第二第三属性*/
                        (function () {
                            var isgroup = false,
                                grouplen = 1,
                                attritem = (function () {
                                    var tempattr = attrobj[4];
                                    if (tempattr.indexOf(',') !== -1) {
                                        isgroup = true;
                                        tempattr = tempattr.split(',');
                                        grouplen = tempattr.length;
                                        return tempattr;
                                    } else {
                                        return tempattr;
                                    }
                                }());

                            /*重置数据选项*/
                            listone = {};
                            listtwo = {};
                            listthree = {};
                            /*设置数据选项*/
                            if (isgroup) {
                                var i = 0;
                                for (i; i < grouplen; i++) {
                                    _doGroupCondition_(attritem, i);
                                }
                            } else {
                                _doGroupCondition_(attritem);
                            }
                        }());

                        /*解析第二属性*/
                        if ($.isEmptyObject(listone)) {
                            document.getElementById('admin_wholesale_price_list').innerHTML = '<tr><td colspan="7" class="g-t-c g-c-gray9">暂无数据</td></tr>';
                            document.getElementById('admin_wholesale_price_thead').innerHTML = '<tr><th>颜色</th><th>规格</th><th>库存</th><th>批发价</th><th>建议零售价</th><th>供应商价</th><th>价格显示在首页</th></tr>';
                            return false;
                        }
                        /*解析组合*/
                        /*解析组合*/
                        if ($.isEmptyObject(listtwo)) {
                            _dopushAttrData_(priceobj, pricelen, attrmap, false);
                            /*生成html文档*/
                            groupCondition(attrmap, false);
                        } else {
                            _dopushAttrData_(priceobj, pricelen, attrmap, true);
                            /*生成html文档*/
                            groupCondition(attrmap, true);
                        }
                    } else {
                        document.getElementById('admin_wholesale_price_list').innerHTML = '<tr><td colspan="7" class="g-t-c g-c-gray9">暂无数据</td></tr>';
                        document.getElementById('admin_wholesale_price_thead').innerHTML = '<tr><th>颜色</th><th>规格</th><th>库存</th><th>批发价</th><th>建议零售价</th><th>供应商价</th><th>价格显示在首页</th></tr>';
                        return false;
                    }
                }
            }
        }


        /*组合颜色与尺寸*/
        function groupCondition(resp, istwo) {
            var str = '',
                checkid = 0,
                x = 0;

            for (var j in resp) {
                var k = 0,
                    datavalue = resp[j],
                    len = datavalue.length;

                str += '<tr><td rowspan="' + len + '">' + listone['res'][j] + '</td>';
                for (k; k < len; k++) {
                    var dataitem = datavalue[k],
                        ischeck = parseInt(dataitem[3], 10) === 1 ? '是' : '';

                    if (k === 0) {
                        str += '<td>' + (istwo ? listtwo['res'][dataitem[4][1]] : "") + '</td>' +
                            '<td>' + dataitem[0] + '</td>' +
                            '<td>￥:' + public_tool.moneyCorrect(dataitem[1], 12, false)[0] + '</td>' +
                            '<td>￥:' + public_tool.moneyCorrect(dataitem[2], 12, false)[0] + '</td>' +
                            '<td>' + (function () {
                                var supplier = dataitem[5];
                                if (supplier === '' || isNaN(supplier)) {
                                    supplier = '￥:' + '0.00';
                                } else {
                                    supplier = '￥:' + public_tool.moneyCorrect(supplier, 12, false)[0];
                                }
                                return supplier;
                            }()) + '</td>' +
                            '<td>' + ischeck + '</td></tr>';
                    } else {
                        str += '<tr><td>' + (istwo ? listtwo['res'][dataitem[4][1]] : "") + '</td>' +
                            '<td>' + dataitem[0] + '</td>' +
                            '<td>￥:' + public_tool.moneyCorrect(dataitem[1], 12, false)[0] + '</td>' +
                            '<td>￥:' + public_tool.moneyCorrect(dataitem[2], 12, false)[0] + '</td>' +
                            '<td>' + (function () {
                                var supplier = dataitem[5];
                                if (supplier === '' || isNaN(supplier)) {
                                    supplier = '￥:' + '0.00';
                                } else {
                                    supplier = '￥:' + public_tool.moneyCorrect(supplier, 12, false)[0];
                                }
                                return supplier;
                            }()) + '</td>' +
                            '<td>' + ischeck + '</td></tr>';
                    }
                    if (ischeck === '') {
                        /*判断是否选中,有则跳过无则计数*/
                        checkid++;
                    }
                    x++;
                }
            }
            document.getElementById('admin_wholesale_price_thead').innerHTML = '<tr><th>' + listone['label'] + '</th><th>' + (istwo ? listtwo['label'] : "") + '</th><th>库存</th><th>批发价</th><th>建议零售价</th><th>供应商价</th><th>价格显示在首页</th></tr>';
            var priclist = document.getElementById('admin_wholesale_price_list');
            priclist.innerHTML = str;
            /*全部没选中则，默认第一个选中*/
            if (checkid === x) {
                $(priclist).find('tr:first-child').find('td').eq(6).html('是');
            }
        }


        /*解析轮播图*/
        function getSlideData(list, config) {
            var len = list.length,
                i = 0,
                str = '';
            for (i; i < len; i++) {
                var url = list[i]['imageUrl'];
                if (url) {
                    if (url.indexOf('qiniucdn.com') !== -1) {
                        if (url.indexOf('?imageView2') !== -1) {
                            url = url.split('?imageView2')[0] + '?imageView2/1/w/50/h/50';
                        } else {
                            url = url + '?imageView2/1/w/50/h/50';
                        }
                        str += '<li><img alt="" src="' + url + '" /></li>';
                    } else {
                        str += '<li><img alt="" src="' + url + '" /></li>';
                    }
                }
            }
            $(str).appendTo(config.$slide_tool.html(''));
            /*调用轮播*/
            goodsSlide.GoodsSlide(config);
        }


        /*解析详情*/
        function getDetailHtml(data) {
            document.getElementById('admin_detail').innerHTML = data;
        }


        /*私有服务--组合*/
        function _dopushAttrData_(priceobj, pricelen, attrmap, flag) {
            /*flag:是否存在第二个数据项*/
            var i = 0;
            for (i; i < pricelen; i++) {
                var attrdata = priceobj[i].split('#'),
                    attritem = attrdata[4].split(','),
                    attrone = attritem[0],
                    attrtwo = attritem[1],
                    mapone = listone['res'];

                attrdata.splice(4, 1, attritem);
                for (var m in mapone) {
                    if (m === attrone) {
                        if (!(m in attrmap)) {
                            /*不存在即创建*/
                            attrmap[m] = [];
                        }
                        if (flag) {
                            var maptwo = listtwo['res'];
                            for (var n in maptwo) {
                                if (n === attrtwo) {
                                    attrmap[m].push(attrdata);
                                    break;
                                }
                            }
                        } else {
                            attrmap[m].push(attrdata);
                        }
                        break;
                    }
                }
            }
        }


        /*私有服务--解析数据项*/
        function _doGroupCondition_(data, index) {
            /*data:数据项,ndex:索引*/
            okloop:for (var j in attr_map) {
                var mapdata = attr_map[j],
                    submap = mapdata['res'];
                for (var p in submap) {
                    /*组合属性*/
                    if (typeof index !== 'undefined') {
                        if (p === data[index]) {
                            if (index === 0) {
                                listone['label'] = mapdata['label'];
                                listone['res'] = submap;
                                listone['id'] = mapdata['id'];
                                listone['map'] = mapdata['map'];
                            } else if (index === 1) {
                                listtwo['label'] = mapdata['label'];
                                listtwo['res'] = submap;
                                listtwo['id'] = mapdata['id'];
                                listtwo['map'] = mapdata['map'];
                            } else if (index === 2) {
                                listthree['label'] = mapdata['label'];
                                listthree['res'] = submap;
                                listthree['id'] = mapdata['id'];
                                listthree['map'] = mapdata['map'];
                            }
                            break okloop;
                        }
                    } else {
                        if (p === data) {
                            listone['label'] = mapdata['label'];
                            listone['res'] = submap;
                            listone['id'] = mapdata['id'];
                            listone['map'] = mapdata['map'];
                        }
                    }

                }
            }
        }


    });


})(jQuery);