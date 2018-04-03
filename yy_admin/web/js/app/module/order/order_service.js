angular.module('app')
    .service('orderService', ['toolUtil', 'toolDialog', 'BASE_CONFIG', 'loginService', 'powerService', 'dataTableColumnService', 'dataTableItemActionService', 'datePicker97Service', function (toolUtil, toolDialog, BASE_CONFIG, loginService, powerService, dataTableColumnService, dataTableItemActionService, datePicker97Service) {

        /*获取缓存数据*/
        var self = this,
            module_id = 30/*模块id*/,
            cache = loginService.getCache();

        var powermap = powerService.getCurrentPower(module_id);

        /*初始化权限*/
        var init_power = {
            order_print: toolUtil.isPower('order-print', powermap, true)/*订单打印*/,
            order_export: toolUtil.isPower('order-export', powermap, true)/*订单导出*/,
            order_details: toolUtil.isPower('order-details', powermap, true)/*订单详情*/
        };


        /*扩展服务--初始化jquery dom节点*/
        this.initJQDom = function (dom) {
            if (dom) {
                /*复制dom引用*/
                for (var i in dom) {
                    self[i] = dom[i];
                }
            }
        };
        /*扩展服务--查询操作权限*/
        this.getCurrentPower = function () {
            return init_power;
        };
        /*扩展服务--验证图片类型及存放域名*/
        this.validImages = function (value) {
            var str = '';
            var tempimg = value,
                imgreg = /(jpeg|jpg|gif|png)/g;

            if (tempimg.indexOf('.') !== -1) {
                if (imgreg.test(tempimg)) {
                    str = value;
                } else {
                    str = '';
                }
            } else {
                str = '';
            }
            return str;
        };


        /*数据查询服务--请求数据--获取表格数据*/
        this.getColumnData = function (table, record) {
            if (cache === null) {
                return false;
            } else if (!table && !record) {
                return false;
            }

            /*如果存在模型*/
            var data = $.extend(true, {}, table.list1_config.config.ajax.data),
                temp_param;

            /*适配参数*/
            for (var i in record) {
                /*时间条件,搜索条件*/
                if (i === 'startTime' || i === 'endTime' || i === 'searchWord') {
                    if (record[i] === '') {
                        delete data[i];
                    } else {
                        data[i] = record[i];
                    }
                } else if (i === 'organizationId') {
                    /*过滤没有菜单节点查询*/
                    if (record[i] === '') {
                        data[i] = '';
                        return false;
                    } else {
                        data[i] = record[i];
                    }
                }
            }

            /*参数赋值*/
            table.list1_config.config.ajax.data = data;
            if (table.list_table === null) {
                temp_param = cache.loginMap.param;
                table.list1_config.config.ajax.data['adminId'] = temp_param.adminId;
                table.list1_config.config.ajax.data['token'] = temp_param.token;
                /*初始请求*/
                table.list_table = self.$admin_list_wrap.DataTable(table.list1_config.config);
                /*调用列控制*/
                dataTableColumnService.initColumn(table.tablecolumn, table.list_table);
                /*调用按钮操作*/
                dataTableItemActionService.initItemAction(table.tableitemaction);
            } else {
                table.list_table.ajax.config(table.list1_config.config.ajax).load();
            }
        };
        /*数据查询服务--过滤表格数据*/
        this.filterDataTable = function (table, record) {
            if (table.list_table === null) {
                return false;
            }
            table.list_table.search(record.filter).columns().draw();
        };
        /*数据查询服务--时间查询*/
        this.datePicker = function (record) {
            datePicker97Service.datePickerRange({
                $node1: self.$search_startTime,
                $node2: self.$search_endTime,
                format: '%y-%M-%d',
                model: record,
                position: {
                    left: 0,
                    top: 2
                }
            });
        };
        /*数据查询服务--操作按钮*/
        this.doItemAction = function (model, config) {
            var id = config.id,
                action = config.action;

            if (action === 'detail') {
                self.queryDetail(null, id, action);
            }
        };
        /*数据查询服务--查询订单详情*/
        this.queryDetail = function (config, id, action) {
            if (cache === null) {
                return false;
            }

            if (typeof id === 'undefined') {
                toolDialog.show({
                    type: 'warn',
                    value: '没有订单信息'
                });
                return false;
            }

            var param = $.extend(true, {}, cache.loginMap.param);
            /*判断参数*/
            param['id'] = id;


            toolUtil
                .requestHttp({
                    url: '/organization/goodsorder/details'/*'json/test.json'*/,
                    method: 'post',
                    set: true,
                    debug: false, /*测试开关*/
                    data: param
                })
                .then(function (resp) {
                        /*测试代码*/
                        /*var resp=self.testGetOrderDetail();*/

                        var data = resp.data,
                            status = parseInt(resp.status, 10);

                        if (status === 200) {
                            var code = parseInt(data.code, 10),
                                message = data.message;
                            if (code !== 0) {
                                if (typeof message !== 'undefined' && message !== '') {
                                    console.log(message);
                                } else {
                                    console.log('请求数据失败');
                                }

                                if (code === 999) {
                                    /*退出系统*/
                                    cache = null;
                                    toolUtil.loginTips({
                                        clear: true,
                                        reload: true
                                    });
                                }
                            } else {

                                /*加载数据*/
                                var result = data.result;
                                if (typeof result !== 'undefined') {
                                    var order = result.order,
                                        details = result.details,
                                        detail_map = {
                                            'merchantName': '商户名称',
                                            'merchantPhone': '手机号码',
                                            'orderTime': '订单时间',
                                            'orderNumber': '订单号',
                                            'orderState': '订单状态',
                                            'totalMoney': '订单总价',
                                            'paymentType': '支付类型',
                                            'attributeIds': '属性序列',
                                            'attributeName': '属性名称',
                                            'goodsId': '商品序列',
                                            'goodsName': '商品名称',
                                            'goodsPrice': '商品价格',
                                            'goodsThumbnail': '商品缩略图',
                                            'quantlity': '购买数量',
                                            'supplierPrice': '供应商价格'
                                        };
                                    if (action === 'detail') {
                                        var str = '';
                                        if (order) {
                                            /*查看*/
                                            for (var j in order) {
                                                if (typeof detail_map[j] !== 'undefined') {
                                                    if (j === 'orderState') {
                                                        var temptype = parseInt(order[j], 10),
                                                            typemap = {
                                                                0: '待付款',
                                                                1: '取消订单',
                                                                6: '待发货',
                                                                9: '待收货',
                                                                20: '待评价',
                                                                21: '已评价'
                                                            };
                                                        str += '<tr><td colspan="3" class="g-t-r">' + detail_map[j] + ':</td><td colspan="3" class="g-t-l">' + (function () {
                                                            var tempstr;

                                                            if (temptype === 0) {
                                                                tempstr = '<div class="g-c-blue3">' + typemap[temptype] + '</div>';
                                                            } else if (temptype === 1) {
                                                                tempstr = '<div class="g-c-red1">' + typemap[temptype] + '</div>';
                                                            } else if (temptype === 6 || temptype === 9 || temptype === 20) {
                                                                tempstr = '<div class="g-c-warn">' + typemap[temptype] + '</div>';
                                                            } else if (temptype === 21) {
                                                                tempstr = '<div class="g-c-green1">' + typemap[temptype] + '</div>';
                                                            } else {
                                                                tempstr = '<div class="g-c-gray6">其他</div>';
                                                            }
                                                            return tempstr;
                                                        })() + '</td></tr>';
                                                    } else if (j === 'paymentType') {
                                                        var temppay = parseInt(order[j], 10),
                                                            paymap = {
                                                                1: "微信",
                                                                2: "支付宝",
                                                                3: "其它"
                                                            };
                                                        str += '<tr><td colspan="3" class="g-t-r">' + detail_map[j] + ':</td><td colspan="3" class="g-t-l">' + paymap[temppay] + '</td></tr>';
                                                    } else if (j === 'totalMoney') {
                                                        str += '<tr><td colspan="3" class="g-t-r">' + detail_map[j] + ':</td><td colspan="3" class="g-t-l">' + toolUtil.moneyCorrect(order[j], 12)[0] + '</td></tr>';
                                                    } else {
                                                        str += '<tr><td  colspan="3" class="g-t-r">' + detail_map[j] + ':</td><td colspan="3" class="g-t-l">' + order[j] + '</td></tr>';
                                                    }
                                                }
                                            }
                                        }
                                        if (details) {
                                            var i = 0,
                                                len = details.length;
                                            str += '<tr><th class="g-t-c">序号</th><th class="g-t-c">缩略图</th><th class="g-t-c">商品名称</th><th class="g-t-c">属性名称</th><th class="g-t-c">商品价格</th><th class="g-t-c">购买数量</th></tr>';
                                            if (len !== 0) {
                                                var detailitem;
                                                for (i; i < len; i++) {
                                                    detailitem = details[i];
                                                    str += '<tr class="g-v-m">\
                                                        <td class="g-t-c">' + (i + 1) + '</td>\
                                                        <td class="g-t-c">' + (function () {
                                                        var img = detailitem["goodsThumbnail"],
                                                            str = '';
                                                        if (img.indexOf('qiniucdn.com') !== -1) {
                                                            str = '<div class="admin-thumbnail-widget1"><img alt="" src="' + img + '?imageView2/1/w/60/h/60" /><div class="thumbnail-show"><div class="thumbnail-showwrap"><div class="thumbnail-outer"><div class="thumbnail-inner"><img alt="" src="' + img + '" /></div></div></div></div></div>';
                                                        } else {
                                                            img = self.validImages(img);
                                                            if (img !== '') {
                                                                str = '<div class="admin-thumbnail-widget1"><img alt="" src="' + img + '" /><div class="thumbnail-show"><div class="thumbnail-showwrap"><div class="thumbnail-outer"><div class="thumbnail-inner"><img alt="" src="' + img + '" /></div></div></div></div></div>';
                                                            } else {
                                                                str = '<div class="admin-thumbnail-widget1"></div>';
                                                            }
                                                        }
                                                        return str;
                                                    }()) + '</td>\
                                                        <td class="g-t-c">' + detailitem["goodsName"] + '</td>\
                                                        <td class="g-t-c">' + detailitem["attributeName"] + '</td>\
                                                        <td class="g-t-c">' + toolUtil.moneyCorrect(detailitem["goodsPrice"], 15, false)[0] + '</td>\
                                                        <td class="g-t-c">' + detailitem["quantlity"] + '</td>\
                                                        </tr>';
                                                }
                                            }
                                        }
                                        if (str !== '') {
                                            $(str).appendTo(self.$admin_orderdetail_show.html(''));
                                            /*显示弹窗*/
                                            self.toggleModal({
                                                display: 'show',
                                                area: 'orderdetail'
                                            });
                                        }
                                    } else {
                                        /*提示信息*/
                                        toolDialog.show({
                                            type: 'warn',
                                            value: '获取数据失败'
                                        });
                                    }
                                }
                            }
                        }
                    },
                    function (resp) {
                        var message = resp.data.message;
                        if (typeof message !== 'undefined' && message !== '') {
                            console.log(message);
                        } else {
                            console.log('请求订单失败');
                        }
                    });
        };
        /*清除查询条件*/
        this.clearOrder = function (config) {
            var record = config.record;
            /*清除时间*/
            record['startTime'] = '';
            record['endTime'] = '';
            /*清除关键字*/
            record['searchWord'] = '';
        };


        /*弹出层服务*/
        this.toggleModal = function (config, fn) {
            var temp_timer = null,
                type_map = {
                    'orderdetail': self.$admin_orderdetail_dialog
                };
            if (config.display === 'show') {
                if (typeof config.delay !== 'undefined') {
                    temp_timer = setTimeout(function () {
                        type_map[config.area].modal('show', {backdrop: 'static'});
                        clearTimeout(temp_timer);
                        temp_timer = null;
                    }, config.delay);
                    if (fn && typeof fn === 'function') {
                        fn.call(null);
                    }
                } else {
                    type_map[config.area].modal('show', {backdrop: 'static'});
                    if (fn && typeof fn === 'function') {
                        fn.call(null);
                    }
                }
            } else if (config.display === 'hide') {
                if (typeof config.delay !== 'undefined') {
                    temp_timer = setTimeout(function () {
                        type_map[config.area].modal('hide');
                        clearTimeout(temp_timer);
                        temp_timer = null;
                    }, config.delay);
                } else {
                    type_map[config.area].modal('hide');
                }
            }
        };


        /*导航服务--获取虚拟挂载点*/
        this.getRoot = function (record) {
            if (cache === null) {
                toolUtil.loginTips({
                    clear: true,
                    reload: true
                });
                record['currentId'] = '';
                record['currentName'] = '';
                return false;
            }
            var islogin = loginService.isLogin(cache);
            if (islogin) {
                var logininfo = cache.loginMap;
                record['currentId'] = logininfo.param.organizationId;
                record['currentName'] = !logininfo.param.organizationName ? logininfo.username : decodeURIComponent(logininfo.param.organizationName);
            } else {
                /*退出系统*/
                cache = null;
                toolUtil.loginTips({
                    clear: true,
                    reload: true
                });
                record['currentId'] = '';
                record['currentName'] = '';
            }
        };
        /*导航服务--获取导航*/
        this.getSubMenu = function (config) {
            if (cache) {
                var param = $.extend(true, {}, cache.loginMap.param);
                param['isShowSelf'] = 0;
                var layer,
                    id,
                    $wrap;

                /*初始化加载*/
                if (!config.$reqstate) {
                    layer = 0;
                    /*根目录则获取新配置参数*/
                    id = param['organizationId'];
                    $wrap = self.$admin_order_submenu;
                    config.record.organizationId = id;
                    self.getColumnData(config.table, config.record);
                } else {
                    /*非根目录则获取新请求参数*/
                    layer = config.$reqstate.attr('data-layer');
                    $wrap = config.$reqstate.next();
                    id = config.$reqstate.attr('data-id');

                    /*判断是否是合法的节点*/
                    if (layer >= BASE_CONFIG.submenulimit) {
                        return false;
                    }
                    param['organizationId'] = id;
                }

                toolUtil
                    .requestHttp({
                        url: '/organization/lowers/search',
                        method: 'post',
                        set: true,
                        data: param
                    })
                    .then(function (resp) {
                            var data = resp.data,
                                status = parseInt(resp.status, 10);

                            if (status === 200) {
                                var code = parseInt(data.code, 10),
                                    message = data.message;
                                if (code !== 0) {
                                    if (typeof message !== 'undefined' && message !== '') {
                                        console.log(message);
                                    }

                                    if (code === 999) {
                                        /*退出系统*/
                                        cache = null;
                                        toolUtil.loginTips({
                                            clear: true,
                                            reload: true
                                        });
                                    }
                                } else {
                                    /*加载数据*/
                                    var result = data.result;
                                    if (typeof result !== 'undefined') {
                                        var list = result.list,
                                            str = '';
                                        if (list) {
                                            var len = list.length;
                                            if (len === 0) {
                                                $wrap.html('');
                                                /*清除显示下级菜单导航图标*/
                                                if (config.$reqstate) {
                                                    config.$reqstate.attr({
                                                        'data-isrequest': true
                                                    }).removeClass('sub-menu-title sub-menu-titleactive');
                                                }
                                            } else {
                                                /*数据集合，最多嵌套层次*/
                                                str = self.resolveSubMenu(list, BASE_CONFIG.submenulimit, {
                                                    layer: layer,
                                                    id: id
                                                });
                                                if (str !== '') {
                                                    $(str).appendTo($wrap.html(''));
                                                    /*调用滚动条*/
                                                    if (config.record.iscroll_flag) {
                                                        config.record.iscroll_flag = false;
                                                        toolUtil.autoScroll(self.$submenu_scroll_wrap, {
                                                            setWidth: false,
                                                            setHeight: 600,
                                                            theme: "minimal-dark",
                                                            axis: "y",
                                                            scrollbarPosition: "inside",
                                                            scrollInertia: '500'
                                                        });
                                                    }
                                                }
                                                if (layer !== 0 && config.$reqstate) {
                                                    config.$reqstate.attr({
                                                        'data-isrequest': true
                                                    });
                                                }
                                            }
                                        } else {
                                            $wrap.html('');
                                        }
                                    } else {
                                        if (layer === 0) {
                                            $wrap.html('');
                                        }
                                    }
                                }
                            }
                        },
                        function (resp) {
                            var message = resp.data.message;
                            if (typeof message !== 'undefined' && message !== '') {
                                console.log(message);
                            } else {
                                console.log('请求菜单失败');
                            }
                            $wrap.html('');
                        });
            } else {
                /*退出系统*/
                cache = null;
                toolUtil.loginTips({
                    clear: true,
                    reload: true
                });
            }
        };
        /*导航服务--解析导航--开始解析*/
        this.resolveSubMenu = function (obj, limit, config) {
            if (!obj || typeof obj === 'undefined') {
                return false;
            }
            if (typeof limit === 'undefined' || limit <= 0) {
                limit = 1;
            }
            var menulist = obj,
                str = '',
                i = 0,
                len = menulist.length,
                layer = config.layer;

            layer++;

            if (limit >= 1 && layer > limit) {
                /*如果层级达到设置的极限清除相关*/
                return false;
            }

            if (len !== 0) {
                for (i; i < len; i++) {
                    var curitem = menulist[i];
                    /*到达极限的前一项则不创建子菜单容器*/
                    if (limit >= 1 && layer >= limit) {
                        str += self.doItemSubMenu(curitem, {
                            flag: false,
                            limit: limit,
                            layer: layer,
                            parentid: config.id
                        }) + '</li>';
                    } else {
                        str += self.doItemSubMenu(curitem, {
                            flag: true,
                            limit: limit,
                            layer: layer,
                            parentid: config.id
                        }) + '<ul></ul></li>';
                    }
                }
                return str;
            } else {
                return false;
            }
        };
        /*导航服务--解析导航--公共解析*/
        this.doItemSubMenu = function (obj, config) {
            var curitem = obj,
                id = curitem["id"],
                label = curitem["fullName"],
                str = '',
                flag = config.flag,
                layer = config.layer,
                parentid = config.parentid;

            if (flag) {
                str = '<li><a data-isrequest="false" data-parentid="' + parentid + '" data-layer="' + layer + '" data-id="' + id + '" class="sub-menu-title" href="#" title="">' + label + '</a>';
            } else {
                str = '<li><a data-parentid="' + parentid + '" data-layer="' + layer + '" data-id="' + id + '" href="#" title="">' + label + '</a></li>';
            }
            return str;
        };
        /*导航服务--显示隐藏机构*/
        this.toggleSubMenu = function (e, config) {
            /*阻止冒泡和默认行为*/
            e.preventDefault();
            e.stopPropagation();

            /*过滤对象*/
            var target = e.target,
                node = target.nodeName.toLowerCase();
            if (node === 'ul' || node === 'li') {
                return false;
            }
            var $this = $(target),
                haschild,
                $child,
                isrequest = false,
                temp_id = $this.attr('data-id');


            /*模型缓存*/
            var record = config.record;

            /*变更操作记录模型--激活高亮*/
            record.organizationId = temp_id;

            /*变更操作记录模型--激活高亮*/
            if (record.current === null) {
                record.current = $this;
            } else {
                record.prev = record.current;
                record.current = $this;
                record.prev.removeClass('sub-menuactive');
            }
            record.current.addClass('sub-menuactive');

            self.getColumnData(config.table, config.record);

            /*查询子集*/
            haschild = $this.hasClass('sub-menu-title');
            if (haschild) {
                $child = $this.next();
                /*是否已经加载过数据*/
                isrequest = $this.attr('data-isrequest');
                if (isrequest === 'false') {
                    /*重新加载*/
                    config['$reqstate'] = $this;
                    self.getSubMenu(config);
                    /*切换显示隐藏*/
                    if ($child.hasClass('g-d-showi')) {
                        $child.removeClass('g-d-showi');
                        $this.removeClass('sub-menu-titleactive');
                    } else {
                        $child.addClass('g-d-showi');
                        $this.addClass('sub-menu-titleactive');
                    }
                } else {
                    /*切换显示隐藏*/
                    if ($child.hasClass('g-d-showi')) {
                        $child.removeClass('g-d-showi');
                        $this.removeClass('sub-menu-titleactive');
                    } else {
                        $child.addClass('g-d-showi');
                        $this.addClass('sub-menu-titleactive');
                    }
                }
            }
        };


        /*测试服务--获取订单列表*/
        this.testGetOrderList = function () {
            return {
                message: 'ok',
                code: 0,
                result: Mock.mock({
                    'count': 50,
                    'list|5-15': [{
                        "id": /[0-9]{1,2}/,
                        "merchantName": /(周一|杨二|张三|李四|王五|赵六|马七|朱八|陈九){1}/,
                        "merchantPhone": /(^(13[0-9]|14[579]|15[012356789]|16[6]|17[01235678]|18[0-9]|19[89])[0-9]{8}$){1}/,
                        "orderTime": moment().format('YYYY-MM-DD HH:mm:ss'),
                        "orderNumber": /[0-9a-zA-Z]{18}/,
                        "orderState": /(0|1|6|9|20|21|[2-5]){1}/,
                        "totalMoney": /(^(([1-9]{1}\d{0,8})|0)((\.{0}(\d){0})|(\.{1}(\d){2}))$){1}/,
                        "paymentType": /[1-3]{1}/
                    }]
                })
            };
        };
        /*测试服务--获取订单列表*/
        this.testGetOrderDetail = function () {
            return {
                status: 200,
                data: {
                    message: 'ok',
                    code: 0,
                    result: Mock.mock({
                        'order|1': [{
                            "id": /[0-9]{1,2}/,
                            "merchantName": /[0-9a-zA-Z]{2,10}/,
                            "merchantPhone": /(^(13[0-9]|14[579]|15[012356789]|16[6]|17[01235678]|18[0-9]|19[89])[0-9]{8}$){1}/,
                            "orderTime": moment().format('YYYY-MM-DD HH:mm:ss'),
                            "orderNumber": /[0-9a-zA-Z]{18}/,
                            "orderState": /(0|1|6|9|20|21|[2-5]){1}/,
                            "totalMoney": /(^(([1-9]{1}\d{0,8})|0)((\.{0}(\d){0})|(\.{1}(\d){2}))$){1}/,
                            "paymentType": /[1-3]{1}/
                        }],
                        'details|1-10': [{
                            "id": /[0-9]{1,2}/,
                            "goodsName": /[0-9a-zA-Z]{2,10}/,
                            "goodsPrice": /(^(([1-9]{1}\d{0,8})|0)((\.{0}(\d){0})|(\.{1}(\d){2}))$){1}/,
                            "quantlity": /[0-9]{1,2}/
                        }]
                    })
                }
            };
        };
    }]);