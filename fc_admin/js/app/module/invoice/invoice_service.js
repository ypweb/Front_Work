angular.module('app')
    .service('invoiceService', ['toolUtil', 'toolDialog', 'BASE_CONFIG', 'loginService', 'powerService', 'dataTableColumnService', 'dataTableItemActionService', 'datePicker97Service', 'testService', function (toolUtil, toolDialog, BASE_CONFIG, loginService, powerService, dataTableColumnService, dataTableItemActionService, datePicker97Service, testService) {

        /*获取缓存数据*/
        var self = this,
            module_id = 50/*模块id*/,
            cache = loginService.getCache();

        var powermap = powerService.getCurrentPower(module_id);

        /*初始化权限*/
        var init_power = {
            invoice_print: toolUtil.isPower('invoice-print', powermap, true)/*发货打印*/,
            invoice_export: toolUtil.isPower('invoice-export', powermap, true)/*发货导出*/,
            invoice_details: toolUtil.isPower('invoice-details', powermap, true)/*发货详情*/,
            invoice_delivery: toolUtil.isPower('invoice-delivery', powermap, true)/*发货*/
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
        /*扩展服务--退出系统*/
        this.loginOut = function () {
            loginService.outAction();
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
                /*订单详情*/
                self.queryDetail(null, id, action);
            } else if (action === 'send') {
                /*订单发货*/
                self.querySend(model, id, action);
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
                    url: /*'/organization/invoice/details'*/'json/test.json'/*测试地址*/,
                    method: 'post',
                    set: true,
                    debug: true, /*测试开关*/
                    data: param
                })
                .then(function (resp) {
                        var orderlist = testService.getMap({
                                map: {
                                    'id': 'id',
                                    'merchantName': 'value',
                                    'merchantPhone': 'mobile',
                                    'orderTime': 'datetime',
                                    'payTime': 'datetime',
                                    'orderNumber': 'guid',
                                    'orderState': 'rule,0,1,6,9,20,21',
                                    'totalMoney': 'money',
                                    'paymentType': 'rule,1,2,3'
                                },
                                maptype: 'object'
                            }),
                            detaillist = testService.getMap({
                                map: {
                                    'id': 'id',
                                    'goodsName': 'goods',
                                    'goodsPrice': 'money',
                                    'quantlity': 'id',
                                    'attributeName': 'goodstype',
                                    'goodsThumbnail': ''
                                },
                                mapmin: 2,
                                mapmax: 10
                            })/*测试请求*/;

                        var resp = {
                            status: 200,
                            data: {
                                message: 'ok',
                                code: 0,
                                result: {
                                    order: orderlist.list,
                                    details: detaillist.list
                                }
                            }
                        }/*测试组合*/;

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
                                    loginService.outAction();
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
                                            $(str).appendTo(self.$admin_invoicedetail_show.html(''));
                                            /*显示弹窗*/
                                            self.toggleModal({
                                                display: 'show',
                                                area: 'invoicedetail'
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

        /*发货服务--查询订单配货*/
        this.querySend = function (config, id, action) {
            if (cache === null) {
                return false;
            }

            if (typeof id === 'undefined') {
                toolDialog.show({
                    type: 'warn',
                    value: '没有配货单信息'
                });
                return false;
            }

            var param = $.extend(true, {}, cache.loginMap.param);
            /*判断参数*/

            toolUtil
                .requestHttp({
                    url: /*'/organization/invoice/sendlist'*/'json/test.json'/*测试地址*/,
                    method: 'post',
                    set: true,
                    debug: true, /*测试开关*/
                    data: param
                })
                .then(function (resp) {
                        var resp = {
                            status: 200,
                            data: {
                                message: 'ok',
                                count: 50,
                                code: 0,
                                result: {
                                    list: true
                                }
                            }
                        }/*测试请求*/;

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
                                    loginService.outAction();
                                }
                            } else {

                                /*加载数据*/
                                var result = data.result;
                                if (typeof result !== 'undefined') {
                                    var list = result.list;
                                    if (list) {
                                        /*查看*/
                                        var len = 1 + parseInt(Math.random() * 5, 10),
                                            i = 0,
                                            str = '<tr>\
                                                    <td colspan="5">\
                                                        <div class="g-w-number20 g-f-l">\
                                                            <div>收货地址：<span class="g-c-red1">' + testService.getRule('address') + '</span></div>\
                                                            <div>收货人姓名：<span class="g-c-red1">' + testService.getRule('name') + '</span></div>\
                                                            <div>联系电话：<span class="g-c-red1">' + testService.getRule('mobile') + '</span></div>\
                                                        </div>\
                                                        <div class="g-w-number20 g-f-r">\
                                                            <div class="g-w-number20 g-f-l">快递公司：<span class="g-c-red1">' + testService.getRule('text') + '</span></div>\
                                                            <div class="g-w-number20 g-f-r">快递单号：<span class="g-c-red1">' + testService.getRule('guid') + '</span></div>\
                                                        </div>\
                                                    </td>\
                                                </tr>';

                                        for (i; i < len; i++) {
                                            var item = list[i],
                                                j = 1 + parseInt(Math.random() * 5, 0),
                                                k = 0;

                                            if (j === 1) {
                                                str += '<tr>\
                                                        <td colspan="5"><div class="g-w-number20 g-f-l">配货包裹' + (i + 1) + ':<span class="g-c-blue3">' + testService.getRule('name') + '</span></div><div class="g-w-number20 g-f-r">配货包裹地址：<span class="g-c-blue3">' + testService.getRule('address') + '</span></div></td>\
                                                    </tr>\
                                                    <tr>\
                                                        <td>' + testService.getRule('info') + '</td>\
                                                        <td>1</td>\
                                                        <td>' + testService.getRule('goods') + '</td>\
                                                        <td>' + testService.getRule('goodstype') + '</td>\
                                                        <td>' + toolUtil.moneyCorrect(testService.getRule('minmax,1,90000'), 15, false)[0] + '</td>\
                                                    </tr>\
                                                    <tr>\
                                                        <td colspan="3">&nbsp;</td>\
                                                        <td class="g-c-blue3">合计:</td>\
                                                        <td><span class="g-c-blue3">' + toolUtil.moneyCorrect(testService.getRule('minmax,10000,900000'), 15, false)[0] + '</span></td>\
                                                    </tr>';
                                            } else {
                                                for (k; k < j; k++) {
                                                    if (k === 0) {
                                                        str += '<tr>\
                                                            <td colspan="5"><div class="g-w-number20 g-f-l">配货包裹' + (i + 1) + ':<span class="g-c-blue3">' + testService.getRule('text') + '</span></div><div class="g-w-number20 g-f-r">配货包裹地址：<span class="g-c-blue3">' + testService.getRule('address') + '</span></div></td>\
                                                        </tr>\
                                                        <tr>\
                                                            <td rowspan="' + (j - 1) + '">' + testService.getRule('info') + '</td>\
                                                            <td>' + (k + 1) + '</td>\
                                                            <td>' + testService.getRule('goods') + '</td>\
                                                            <td>' + testService.getRule('goodstype') + '</td>\
                                                            <td>' + toolUtil.moneyCorrect(testService.getRule('minmax,1,90000'), 15, false)[0] + '</td>\
                                                        </tr>';
                                                    } else if (k !== j - 1) {
                                                        str += '<tr>\
                                                        <td>' + (k + 1) + '</td>\
                                                        <td>' + testService.getRule('goods') + '</td>\
                                                        <td>' + testService.getRule('goodstype') + '</td>\
                                                        <td>' + toolUtil.moneyCorrect(testService.getRule('minmax,1,90000'), 15, false)[0] + '</td>\
                                                    </tr>';
                                                    } else if (k === j - 1) {
                                                        str += '<tr>\
                                                        <td colspan="3">&nbsp;</td>\
                                                        <td class="g-c-blue3">合计:</td>\
                                                        <td><span class="g-c-blue3">' + toolUtil.moneyCorrect(testService.getRule('minmax,10000,900000'), 15, false)[0] + '</span></td>\
                                                    </tr>';
                                                    }
                                                }
                                            }
                                        }
                                        if (str !== '') {
                                            $(str).appendTo(self.$admin_send_show.html(''));
                                            /*显示弹窗*/
                                            self.toggleModal({
                                                display: 'show',
                                                area: 'send'
                                            });
                                        }
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
                    },
                    function (resp) {
                        var message = resp.data.message;
                        if (typeof message !== 'undefined' && message !== '') {
                            console.log(message);
                        } else {
                            console.log('请求订单失败');
                        }
                    }
                );
        };
        /*发货服务--查询订单配货*/
        this.sendList=function (config) {
            if(!config && !config.send){
                return false;
            }
            /*确认是否删除*/
            toolDialog.sureDialog('', function () {
                /*执行删除操作*/
                toolUtil
                    .requestHttp({
                        url: /*'/organization/invoice/send'*/'json/test.json'/*测试地址*/,
                        method: 'post',
                        set: true,
                        debug: true/*测试开关*/,
                        data: config.send.sendid
                    })
                    .then(function (resp) {
                            var resp = testService.testSuccess()/*测试请求*/;

                            var data = resp.data,
                                status = parseInt(resp.status, 10);

                            if (status === 200) {
                                var code = parseInt(data.code, 10),
                                    message = data.message;
                                if (code !== 0) {
                                    if (typeof message !== 'undefined' && message !== '') {
                                        /*提示信息*/
                                        toolDialog.show({
                                            type: 'warn',
                                            value: message
                                        });
                                    } else {
                                        /*提示信息*/
                                        toolDialog.show({
                                            type: 'warn',
                                            value: '发货失败'
                                        });
                                    }

                                    if (code === 999) {
                                        /*退出系统*/
                                        cache = null;
                                        loginService.outAction();
                                    }
                                } else {
                                    /*提示信息*/
                                    toolDialog.show({
                                        type: 'succ',
                                        value: '发货成功'
                                    });
                                    /*重新获取数据*/
                                    self.getColumnData(config.table, config.record);
                                    self.$admin_send_show.html('');
                                    config.send.sendid='';
                                    /*隐藏弹窗*/
                                    self.toggleModal({
                                        display: 'hide',
                                        area: 'send'
                                    });
                                }
                            }
                        },
                        function (resp) {
                            var message = resp.data.message;
                            if (typeof message !== 'undefined' && message !== '') {
                                console.log(message);
                            } else {
                                console.log('发货失败');
                            }
                        });
            }, '确认是否真要发货', true);
        };

        /*弹出层服务*/
        this.toggleModal = function (config, fn) {
            var temp_timer = null,
                type_map = {
                    'invoicedetail': self.$admin_invoicedetail_dialog,
                    'send': self.$admin_send_dialog
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
                loginService.outAction();
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
                loginService.outAction();
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
                    $wrap = self.$admin_invoice_submenu;
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
                        url: /*'/organization/lowers/search'*/'json/test.json'/*测试地址*/,
                        method: 'post',
                        set: true,
                        debug: true/*测试开关*/,
                        data: param
                    })
                    .then(function (resp) {
                            var resp = testService.test({
                                map: {
                                    'id': 'id',
                                    'fullName': 'name'
                                },
                                mapmin: layer === 0 ? 5 : 1,
                                mapmax: layer === 0 ? 10 : 3
                            })/*测试请求*/;

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
                                        loginService.outAction();
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
                loginService.outAction();
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


    }]);