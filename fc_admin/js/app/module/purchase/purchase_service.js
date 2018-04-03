angular.module('app')
    .service('purchaseService', ['toolUtil', 'toolDialog', 'BASE_CONFIG', 'loginService', 'powerService', 'dataTableColumnService', 'dataTableItemActionService', 'datePicker97Service', 'dataTableCheckAllService', 'testService', function (toolUtil, toolDialog, BASE_CONFIG, loginService, powerService, dataTableColumnService, dataTableItemActionService, datePicker97Service, dataTableCheckAllService, testService) {

        /*获取缓存数据*/
        var self = this,
            module_id = 70/*模块id*/,
            cache = loginService.getCache();

        var powermap = powerService.getCurrentPower(module_id);

        /*初始化权限*/
        var init_power = {
            purchase_print: toolUtil.isPower('purchase-print', powermap, true)/*采购打印*/,
            purchase_export: toolUtil.isPower('purchase-export', powermap, true)/*采购导出*/,
            purchase_details: toolUtil.isPower('purchase-details', powermap, true)/*采购详情*/,
            purchase_audit: toolUtil.isPower('purchase-audit', powermap, true)/*采购审核*/,
            purchase_stats: toolUtil.isPower('purchase-stats', powermap, true)/*采购统计*/
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
            } else if (typeof record.action === 'undefined') {
                return false;
            }

            /*如果存在模型*/
            var action = record.action,
                temp_config = 'list_config' + action,
                data = $.extend(true, {}, table[temp_config].config.ajax.data),
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

            var temp_table = 'list_table' + action,
                temp_column = 'tablecolumn' + action,
                temp_action = 'tableitemaction' + action,
                temp_checkall = 'tablecheckall' + action;

            /*参数赋值*/
            table[temp_config].config.ajax.data = data;
            if (table[temp_table] === null) {
                temp_param = cache.loginMap.param;
                table[temp_config].config.ajax.data['adminId'] = temp_param.adminId;
                table[temp_config].config.ajax.data['token'] = temp_param.token;
                /*初始请求*/
                table[temp_table] = self['$admin_list_wrap' + action].DataTable(table[temp_config].config);
                /*调用列控制*/
                dataTableColumnService.initColumn(table[temp_column], table[temp_table]);
                /*调用按钮操作*/
                dataTableItemActionService.initItemAction(table[temp_action]);
                /*调用全选*/
                if (action === 2) {
                    dataTableCheckAllService.initCheckAll(table[temp_checkall]);
                }
            } else {
                if (action === 2) {
                    dataTableCheckAllService.clear(table[temp_checkall]);
                }
                table[temp_table].ajax.config(table[temp_config].config.ajax).load();
            }
        };
        /*数据查询服务--过滤表格数据*/
        this.filterDataTable = function (table, record) {
            if (!table && !record) {
                return false;
            } else if (typeof record.action === 'undefined') {
                return false;
            }
            var temp_table = 'list_table' + record.action;
            if (table[temp_table] === null) {
                return false;
            }
            table[temp_table].search(record.filter).columns().draw();
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
                /*查询订单详情*/
                self.queryDetail(model, {
                    id: id
                });
            } else if (action === 'receive') {
                /*查询收货*/
                self.queryReceive(model, {
                    id: id
                });
            } else if (action === 'audit') {
                /*查询审核*/
                self.queryAudit(model, {
                    id: id,
                    type: 'base'
                });
            }
        };


        /*详情服务--查询订单详情*/
        this.queryDetail = function (model, config) {
            if (cache === null || !config) {
                return false;
            }
            var id = config.id;

            if (typeof id === 'undefined') {
                toolDialog.show({
                    type: 'warn',
                    value: '没有采购信息'
                });
                return false;
            }

            var param = $.extend(true, {}, cache.loginMap.param);
            /*判断参数*/
            param['id'] = id;


            toolUtil
                .requestHttp({
                    url: /*'/organization/purchase/details'*/'json/test.json'/*测试地址*/,
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
                                        $(str).appendTo(self.$admin_purchasedetail_show.html(''));
                                        /*显示弹窗*/
                                        self.toggleModal({
                                            display: 'show',
                                            area: 'purchasedetail'
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


        /*收货服务--查询收货*/
        this.queryReceive = function (model, config) {
            if (cache === null || !config) {
                return false;
            }

            var id = config.id;
            if (typeof id === 'undefined') {
                toolDialog.show({
                    type: 'warn',
                    value: '没有收货单信息'
                });
                return false;
            }

            var param = $.extend(true, {}, cache.loginMap.param);
            /*判断参数*/

            toolUtil
                .requestHttp({
                    url: /*'/organization/purchase/receive'*/'json/test.json'/*测试地址*/,
                    method: 'post',
                    set: true,
                    debug: true, /*测试开关*/
                    data: param
                })
                .then(function (resp) {
                        var resp = testService.testSuccess();
                        /*测试请求*/

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
                                        var j = 1 + parseInt(Math.random() * 5, 0),
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
                                        $(str).appendTo(self.$admin_receive_show.html(''));
                                        /*显示弹窗*/
                                        self.toggleModal({
                                            display: 'show',
                                            area: 'receive'
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
                    },
                    function (resp) {
                        var message = resp.data.message;
                        if (typeof message !== 'undefined' && message !== '') {
                            console.log(message);
                        } else {
                            console.log('请求收货信息失败');
                        }
                    }
                );
        };
        /*收货服务--确认收货*/
        this.sureReceive = function (config) {
            if (cache === null) {
                return false;
            }

            toolUtil
                .requestHttp({
                    url: /*'/organization/purchase/receive'*/'json/test.json'/*测试地址*/,
                    method: 'post',
                    set: true,
                    debug: true, /*测试开关*/
                    data: 'to do'
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
                                    toolDialog.show({
                                        type: 'warn',
                                        value: '收货失败：' + message
                                    });
                                } else {
                                    console.log('请求数据失败');
                                }

                                if (code === 999) {
                                    /*退出系统*/
                                    cache = null;
                                    loginService.outAction();
                                }
                            } else {
                                toolDialog.show({
                                    type: 'succ',
                                    value: '收货成功'
                                });
                                /*重新请求数据*/
                                self.getColumnData(config.table, config.record);
                                /*弹出框隐藏*/
                                self.toggleModal({
                                    'display': 'hide',
                                    'area': 'receive',
                                    'delay': 1000
                                },function () {
                                    /*清空数据*/
                                    self.$admin_receive_show.html('');
                                })
                            }
                        }
                    },
                    function (resp) {
                        var message = resp.data.message;
                        if (typeof message !== 'undefined' && message !== '') {
                            /*提示信息*/
                            toolDialog.show({
                                type: 'warn',
                                value: '收货失败' + message
                            });

                        } else {
                            /*提示信息*/
                            console.log('请求数据失败');
                        }
                    }
                );
        };


        /*审核服务--查询审核*/
        this.queryAudit = function (model, config) {
            if (cache === null) {
                return false;
            }
            var type = config.type,
                id,
                len = 0;

            if (type === 'base') {
                /*普通*/
                id = config.id;
                len = 1;
                /*清除全选数据*/
                dataTableCheckAllService.clear(model.table['tablecheckall' + model.record.action]);
                /*变更模型*/
                model.audit.isdata = id;
                model.audit.type = type;
                model.audit.batchflag = false;
            } else if (type === 'batch') {
                /*批量*/
                id = dataTableCheckAllService.getBatchData(model.table['tablecheckall' + model.record.action]);
                len = id.length;
            }

            if (typeof id === 'undefined') {
                toolDialog.show({
                    type: 'warn',
                    value: '没有审核信息'
                });
                return false;
            }
            var param = $.extend(true, {}, cache.loginMap.param);
            /*判断参数*/

            toolUtil
                .requestHttp({
                    url: /*'/organization/purchase/auditlist'*/'json/test.json'/*测试地址*/,
                    method: 'post',
                    set: true,
                    debug: true, /*测试开关*/
                    data: param
                })
                .then(function (resp) {
                        var resp = testService.test({
                            map: {
                                'purchaseId': 'guid',
                                'purchaseTime': 'datetime',
                                'purchaseNumber': 'id',
                                'purchasePrice': 'money',
                                'provider': 'text',
                                'providerPhone': 'mobile',
                                'auditState': 'rule,0,2'
                            },
                            mapmin: len,
                            mapmax: len
                        })/*测试请求*/;

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
                                        var i = 0,
                                            str = '';
                                        for (i; i < len; i++) {
                                            var item = list[i],
                                                keyid = (type === "base" ? item["purchaseId"] : id[i]);
                                            str += '<tr>\
                                                        <td>' + (i + 1) + '</td>\
                                                        <td>' + keyid + '</td>\
                                                        <td>' + item["purchaseTime"] + '</td>\
                                                        <td class="purchase-number">' + item["purchaseNumber"] + '</td>\
                                                        <td>' + toolUtil.moneyCorrect(item["purchasePrice"], 15, false)[0] + '</td>\
                                                        <td>' + item["provider"] + '</td>\
                                                        <td>' + toolUtil.phoneFormat(item["providerPhone"]) + '</td>\
                                                        <td>' + (item["auditState"] === 0 ? "待审核" : "审核失败") + '</td>\
                                                        <td><span data-action="update" data-id="' + keyid + '"  class="btn-operate">修改</span><span data-action="delete" data-id="' + keyid + '"  class="btn-operate">删除</span></td>\
                                                    </tr>';
                                        }
                                        if (str !== '') {
                                            $(str).appendTo(self.$admin_audit_show.html(''));
                                            /*显示弹窗*/
                                            self.toggleModal({
                                                display: 'show',
                                                area: 'audit'
                                            });
                                        }
                                    }
                                } else {
                                    /*提示信息*/
                                    toolDialog.show({
                                        type: 'warn',
                                        value: '获取审核数据失败'
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
                            console.log('请求审核失败');
                        }
                    }
                );
        };
        /*审核服务--操作审核*/
        this.actionAudit = function ($event, model) {
            var target = $event.target,
                node = target.nodeName.toLowerCase();

            if (node === 'span') {
                var $this = $(target);
                if ($this.hasClass('btn-operate')) {
                    /*执行审核相关操作*/
                    var action = $this.attr('data-action'),
                        id = $this.attr('data-id'),
                        audit = model.audit,
                        record = model.record;

                    if (action === 'delete') {
                        if (audit.type === 'batch') {
                            var data = dataTableCheckAllService.getBatchData(model.table['tablecheckall' + record.action]),
                                len = data.length;
                        }
                        /*确认是否删除*/
                        toolDialog.sureDialog('', function () {
                            /*执行删除操作*/
                            if (audit.type === 'base') {
                                /*单条记录*/
                                self.$admin_audit_show.html('');
                                /*更新模型*/
                                if (model.fn && typeof model.fn === 'function') {
                                    model.fn.call(null);
                                }
                            } else if (audit.type === 'batch') {
                                if (len === 1) {
                                    self.$admin_audit_show.html('');
                                } else if (len > 1) {
                                    /*清除当前数据*/
                                    $this.closest('tr').remove();
                                }
                                /*比对数据并过滤数据*/
                                dataTableCheckAllService.filterData(model.table['tablecheckall' + record.action], id);
                            }
                        }, '确认是否真要删除此数据', true);
                    } else if (action === 'update') {
                        /*修改操作*/
                        var $number = $this.closest('tr').find('td.purchase-number');
                        self.openEditAudit(model, {
                            value: $number.html(),
                            node: $number
                        });
                    }
                }
            }
        };
        /*审核服务--提交审核*/
        this.submitAudit = function (config) {
            if (cache === null) {
                return false;
            }

            toolUtil
                .requestHttp({
                    url: /*'/organization/purchase/auditlist'*/'json/test.json'/*测试地址*/,
                    method: 'post',
                    set: true,
                    debug: true, /*测试开关*/
                    data: 'to do'
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
                                    toolDialog.show({
                                        type: 'warn',
                                        value: '审核失败：' + message
                                    });
                                } else {
                                    console.log('请求数据失败');
                                }

                                if (code === 999) {
                                    /*退出系统*/
                                    cache = null;
                                    loginService.outAction();
                                }
                            } else {
                                toolDialog.show({
                                    type: 'succ',
                                    value: '审核成功'
                                });
                                /*清空数据*/
                                self.$admin_audit_show.html('');
                                /*重置模型*/
                                self.resetAudit(config.audit);
                                /*重新请求数据*/
                                self.getColumnData(config.table, config.record);
                                /*弹出框隐藏*/
                                self.toggleModal({
                                    'display': 'hide',
                                    'area': 'audit',
                                    'delay': 1000
                                })
                            }
                        }
                    },
                    function (resp) {
                        var message = resp.data.message;
                        if (typeof message !== 'undefined' && message !== '') {
                            /*提示信息*/
                            toolDialog.show({
                                type: 'warn',
                                value: '审核失败' + message
                            });

                        } else {
                            /*提示信息*/
                            console.log('请求数据失败');
                        }
                    }
                );
        };
        /*审核服务--关闭弹窗*/
        this.openEditAudit = function (model, config) {
            var audit = model.audit;
            /*显示*/
            audit.editshow = true;
            if (config) {
                /*存放节点*/
                audit.editnode = config.node;
                /*初始化值*/
                audit.editvalue = config.value;
            } else {
                /*初始化值*/
                audit.editvalue = '';
            }
        };
        /*审核服务--关闭弹窗*/
        this.closeEditAudit = function (model) {
            var audit = model.audit;
            /*隐藏*/
            audit.editshow = false;
            /*重置值*/
            audit.editvalue = '';
            /*清除节点*/
            audit.editnode = null;
        };
        /*审核服务--关闭弹窗*/
        this.sureEditAudit = function (model) {
            var audit = model.audit;
            if (audit.editvalue !== '') {
                if (audit.editnode !== null) {
                    /*赋值*/
                    audit.editnode.html(audit.editvalue);
                }
            } else {
                if (audit.editnode !== null) {
                    /*赋值*/
                    audit.editnode.html(0);
                }
            }
            /*关闭*/
            self.closeEditAudit(model);
        };
        /*审核服务--重置审核模型*/
        this.resetAudit = function (audit) {
            if (audit) {
                audit.type = 'base';
                audit.auditinfo = '';
                audit.auditflag = true;
                audit.isdata = '';
                audit.batchflag = false;
                audit.editshow = false;
                audit.editvalue = '';
                audit.editnode = null;
            }
        };
        

        /*视图切换服务--根据条件判断视图状态:返回一个代表类型，数字或者字符*/
        this.toggleTheme = function (config) {
            if (!config) {
                return false;
            }
            var type = config.type;

            if (typeof type === 'undefined') {
                return false;
            }

            /*
             1-2种状态
             1:统计
             2:审核
             * */
            if (type === 'stats') {
                /*统计*/
                config.record.action = 1;
            } else if (type === 'audit') {
                /*审核*/
                config.record.action = 2;
            }
            /*查询数据*/
            self.getColumnData(config.table, config.record);
        };


        /*弹出层服务*/
        this.toggleModal = function (config, fn) {
            var temp_timer = null,
                type_map = {
                    'purchasedetail': self.$admin_purchasedetail_dialog,
                    'receive': self.$admin_receive_dialog,
                    'audit': self.$admin_audit_dialog
                };
            if (config.display === 'show') {
                if (typeof config.delay !== 'undefined') {
                    temp_timer = setTimeout(function () {
                        type_map[config.area].modal('show', {backdrop: 'static'});
                        clearTimeout(temp_timer);
                        temp_timer = null;
                        if (fn && typeof fn === 'function') {
                            fn.call(null);
                        }
                    }, config.delay);
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
                        if (fn && typeof fn === 'function') {
                            fn.call(null);
                        }
                    }, config.delay);
                } else {
                    type_map[config.area].modal('hide');
                    if (fn && typeof fn === 'function') {
                        fn.call(null);
                    }
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
                    $wrap = self.$admin_purchase_submenu;
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
                                                            setHeight: 500,
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