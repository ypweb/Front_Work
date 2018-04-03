angular.module('app')
    .service('financeService', ['toolUtil', 'toolDialog', 'BASE_CONFIG', 'loginService', 'powerService', 'datePicker97Service', 'dataTableColumnService', 'dataTableCheckAllService', 'dataTableItemActionService', '$timeout', function (toolUtil, toolDialog, BASE_CONFIG, loginService, powerService, datePicker97Service, dataTableColumnService, dataTableCheckAllService, dataTableItemActionService, $timeout) {

        /*获取缓存数据*/
        var self = this,
            module_id = 50/*模块id*/,
            cache = loginService.getCache(),
            bonusform_reset_timer = null;


        var powermap = powerService.getCurrentPower(module_id);

        /*初始化权限*/
        var init_power = {
            bonus_add: toolUtil.isPower('bonus-add', powermap, true)/*除权除息分红*/,
            profit_details: toolUtil.isPower('profit-details', powermap, true)/*分润明细*/,
            profit_clear: toolUtil.isPower('profit-clear', powermap, true)/*分润清算*/
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


        /*视图切换服务--根据条件判断视图状态:返回一个代表类型，数字或者字符*/
        this.changeView = function (config) {
            var record = config.record;
            /*
             1-7种状态
             1:当月分润(默认1)
             2:历史分润
             3:各运营商分润
             4:当月清算--扩展
             5:历史清算--扩展
             6:各运营商清算--扩展
             7:除权除息分红
             * */
            if (record.theme === 'profit') {
                /*分润*/
                if (record.tab === 'current') {
                    record.action = 1;
                } else if (record.tab === 'history') {
                    record.action = 2;
                } else if (record.tab === 'organization') {
                    record.action = 3;
                }
            } else if (record.theme === 'clear') {
                /*清算--目前只是扩展*/
                if (record.tab === 'current') {
                    record.action = 4;
                } else if (record.tab === 'history') {
                    record.action = 5;
                } else if (record.tab === 'organization') {
                    record.action = 6;
                }
            } else if (record.theme === 'bonus') {
                /*除权除息分红*/
                record.action = 7;
            }

            /*查询数据*/
            self.getColumnData(config.table, config.record);
        };
        /*视图切换服务--根据视图状态清除不同条件下缓存数据*/
        this.clearDataByView = function (table, type) {
            var clear_table,
                clear_page,
                clear_pagewrap,
                clear_ajax,
                istype = false;


            if (typeof type !== 'undefined') {
                istype = true;
                /*指定对象则清除指定对象的数据*/
                clear_table = table['list_table' + type];
                clear_page = table['list_page' + type];
                clear_ajax = table['list_config' + type]['config']['ajax'];
                clear_pagewrap = self['$admin_page_wrap' + type];
            } else {
                /*默认清除3下面明细数据*/
                clear_table = table.list_tabledetail;
                clear_page = table.list_pagedetail;
                clear_pagewrap = self.$admin_page_wrapdetail;
                clear_ajax = table.list_configdetail.config.ajax;
            }

            /*重置表数据*/
            if (clear_page.total !== 0 && clear_table !== null) {
                /*清除查询参数*/
                clear_ajax.data['page'] = 1;
                delete clear_ajax.data['id'];

                /*清除表格状态*/
                clear_table.state.clear();

                /*清除表格数据*/
                clear_table.data().length = 0;
                clear_table.clear().draw();

                /*重置分页数据*/
                clear_pagewrap.pagination({
                    pageNumber: 1,
                    pageSize: 5,
                    total: 0
                });

                /*重置查询参数*/
                clear_page.page = 1;
                clear_page.pageSize = 5;
                clear_page.total = 0;

                /*指定对象是否存在合计*/
                if (istype && typeof table['list_total' + type] !== 'undefined') {
                    var clear_total = table['list_total' + type];
                    for (var i in clear_total) {
                        clear_total[i] = '';
                    }
                }
            }
        };


        /*除权除息分红服务--操作除权除息分红*/
        this.actionBonus = function (config) {
            var modal = config.modal,
                record = config.record,
                type = modal.type;

            /*判断是否是合法的节点，即是否有父机构*/
            if (type === 'add') {
                if (record.organizationId === '' && record.currentId === '') {
                    toolDialog.show({
                        type: 'warn',
                        value: '没有父机构或父机构不存在'
                    });
                    return false;
                }
            }

            /*如果存在延迟任务则清除延迟任务*/
            self.clearFormDelay();
            /*通过延迟任务清空表单数据*/
            self.addFormDelay({
                type: 'bonus'
            });

            /*根据类型跳转相应逻辑*/
            if (type === 'add') {
                /*默认为全选权限,不查询权限*/
                /*显示弹窗*/
                self.toggleModal({
                    display: modal.display,
                    area: modal.area
                });
            }

        };
        /*除权除息分红服务--查询除权除息分红*/
        this.queryBonusInfo = function (config) {
            if (cache === null) {
                return false;
            }

            var id = config.id,
                action = config.action;
            if (typeof id === 'undefined') {
                toolDialog.show({
                    type: 'warn',
                    value: '没有除权除息分红信息'
                });
                return false;
            }

            var record = config.model.record,
                tempparam = cache.loginMap.param,
                param = {
                    adminId: tempparam.adminId,
                    token: tempparam.token,
                    organizationId: record.organizationId !== '' ? record.organizationId : record.currentId,
                    id: id
                };

            toolUtil
                .requestHttp({
                    url: '/exdividend/bonus/info',
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
                                    var list = result.exdividend;
                                    if (list) {
                                        if (action === 'update') {
                                            /*修改：更新模型*/
                                            var bonus = config.model.bonus;

                                            for (var i in list) {
                                                switch (i) {
                                                    case 'id':
                                                        bonus[i] = list[i];
                                                        bonus['type'] = 'edit';
                                                        break;
                                                    case 'exrightDate':
                                                        bonus[i] = list[i];
                                                        break;
                                                    case 'exright':
                                                        bonus[i] = toolUtil.moneyCorrect(list[i], 15, true)[0];
                                                        break;
                                                    case 'exdividendDate':
                                                        bonus[i] = list[i];
                                                        break;
                                                    case 'exdividend':
                                                        bonus[i] = toolUtil.moneyCorrect(list[i], 15, true)[0];
                                                        break;
                                                    case 'bonusDate':
                                                        bonus[i] = list[i];
                                                        break;
                                                    case 'bonus':
                                                        bonus[i] = toolUtil.moneyCorrect(list[i], 15, true)[0];
                                                        break;
                                                }
                                            }
                                            /*显示弹窗*/
                                            self.toggleModal({
                                                display: 'show',
                                                area: 'bonus'
                                            });
                                        } else if (action === 'detail') {
                                            /*查看*/
                                            var str = '',
                                                detail_map = {
                                                    'id': '序列号',
                                                    'exrightDate': '除权日',
                                                    'exright': '除权',
                                                    'exdividendDate': '除息日',
                                                    'exdividend': '除息',
                                                    'bonusDate': '分红日',
                                                    'bonus': '分红'
                                                };

                                            for (var j in list) {
                                                if (typeof detail_map[j] !== 'undefined') {
                                                    if (j === 'exright' || j === 'exdividend' || j === 'bonus') {
                                                        str += '<tr><td class="g-t-r">' + detail_map[j] + ':</td><td class="g-t-l">' + toolUtil.moneyCorrect(list[j], 15, true)[0] + '</td></tr>';
                                                    } else {
                                                        str += '<tr><td class="g-t-r">' + detail_map[j] + ':</td><td class="g-t-l">' + list[j] + '</td></tr>';
                                                    }
                                                }
                                            }
                                            if (str !== '') {
                                                $(str).appendTo(self.$admin_bonusdetail_show.html(''));
                                                /*显示弹窗*/
                                                self.toggleModal({
                                                    display: 'show',
                                                    area: 'bonusdetail'
                                                });
                                            }
                                        }
                                    } else {
                                        /*提示信息*/
                                        toolDialog.show({
                                            type: 'warn',
                                            value: '获取编辑数据失败'
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
                            console.log('请求编辑数据失败');
                        }
                    });
        };


        /*数据查询服务--请求数据--获取表格数据*/
        this.getColumnData = function (table, record) {
            if (cache === null) {
                return false;
            } else if (!table && !record) {
                return false;
            } else if (record.action === '') {
                return false;
            }


            /*如果存在模型*/
            var action = record.action;

            /*过滤清算模块*/
            if (action === 4 || action === 5 || action === 6) {
                return false;
            }
            /*清除历史分润和各机构分润下明细*/
            if (action === 2 || action === 3) {
                /*根据视图状态清除数据缓存*/
                self.clearDataByView(table);
            }

            var temp_config = 'list_config' + action,
                data = $.extend(true, {}, table[temp_config].config.ajax.data),
                temp_param;

            /*适配参数*/
            if (action === 3 || action === 7) {
                /*3,7与运营商有关联*/
                if (record['organizationId'] === '') {
                    if (record['currentId'] === '') {
                        return false;
                    }
                    data['organizationId'] = record['currentId'];
                } else {
                    data['organizationId'] = record['organizationId'];
                }
            }


            var temp_table,
                temp_column,
                temp_action;

            if (action === 7) {
                /*除权除息分红*/
                temp_table = 'list_table' + action;
                temp_column = 'tablecolumn' + action;
                temp_action = 'tableitemaction' + action;
            } else {
                /*1-3参与条件查询*/
                if (action === 1) {
                    if (record['searchWord'] === '') {
                        delete data['searchWord'];
                    } else {
                        data['searchWord'] = record['searchWord'];
                    }
                } else if (action === 2 || action === 3) {
                    if (record['time'] === '' || record['time'] === 0) {
                        delete data['time'];
                    } else {
                        data['time'] = record['time'];
                    }
                }
                temp_table = 'list_table' + action;
                temp_action = 'tableitemaction' + action;
            }


            /*参数赋值*/
            table[temp_config].config.ajax.data = data;
            if (table[temp_table] === null) {
                temp_param = cache.loginMap.param;
                table[temp_config].config.ajax.data['adminId'] = temp_param.adminId;
                table[temp_config].config.ajax.data['token'] = temp_param.token;
                /*初始请求*/
                table[temp_table] = self['$admin_list_wrap' + action].DataTable(table[temp_config].config);
                /*调用列控制*/
                if (action === 7) {
                    dataTableColumnService.initColumn(table[temp_column], table[temp_table]);
                }
                /*调用按钮操作*/
                if (action === 2 || action === 3 || action === 7) {
                    dataTableItemActionService.initItemAction(table[temp_action]);
                }
            } else {
                table[temp_table].ajax.config(table[temp_config].config.ajax).load();
            }
        };
        /*数据查询服务--过滤表格数据*/
        this.filterDataTable = function (table, record) {
            if (!table && !record) {
                return false;
            } else if (record.action === 4 || record.action === 5 || record.action === 6) {
                return false;
            }
            var temp_table = 'list_table' + record.action;
            if (table[temp_table] === null) {
                return false;
            }
            table[temp_table].search(record.filter).columns().draw();
        };
        /*数据查询服务--操作按钮*/
        this.doItemAction = function (model, config) {
            var id = config.id,
                action = config.action,
                record = model.record,
                record_action = record.action;

            if (action === 'order') {
                /*查看详情和编辑操作*/
                if (record_action === 2 || record_action === 3) {
                    /*清空订单详情记录*/
                    self.$admin_orderdetail_show.html('');
                    /*查看订单或者详情*/
                    self.queryOrderList({
                        id: id,
                        action: action,
                        model: model
                    });
                }
            } else if (action === 'clear') {
                /*清算订单*/
                var $btn = config.$btn,
                    state = parseInt($btn.attr('data-state'), 10);

                self.actionClear(model, {
                    type: 'base',
                    id: id,
                    state: state
                });
            } else if (action === 'update' || action === 'detail') {
                /*查看详情*/
                if (record_action === 7) {
                    /*除权除息分红*/
                    if (action === 'update') {
                        /*编辑*/
                        /*如果存在延迟任务则清除延迟任务*/
                        self.clearFormDelay();
                        /*通过延迟任务清空表单数据*/
                        self.addFormDelay({
                            type: 'bonus'
                        });
                    }
                    self.queryBonusInfo({
                        id: id,
                        action: action,
                        model: model
                    });
                } else if (record_action === 2 || record_action === 3) {
                    /*查看明细*/
                    self.getDetailData({
                        table: model.table,
                        record: model.record
                    }, id);
                }
            }
        };
        /*数据查询服务--查询明细列表*/
        this.getDetailData = function (config, id) {
            if (cache === null) {
                return false;
            } else if (!config['table'] && !config['record']) {
                return false;
            }


            var record = config.record,
                action = record.action,
                temp_config = 'list_configdetail',
                data = $.extend(true, {}, config['table'][temp_config].config.ajax.data),
                temp_param,
                temp_table = 'list_tabledetail',
                temp_action = 'tableitemactiondetail';

            /*条件查询*/
            if (record['searchWord'] === '') {
                delete data['searchWord'];
            } else {
                data['searchWord'] = record['searchWord'];
            }
            if (typeof id === 'undefined') {
                if (typeof data['id'] === 'undefined') {
                    return false;
                }
            } else {
                data['id'] = id;
            }

            if (record.currentId === '') {
                console.log('没有父节点');
                return false;
            }
            if (action === 2) {
                data['organizationId'] = record.currentId;
            } else if (action === 3) {
                data['organizationId'] = record.organizationId;
            }


            /*参数赋值*/
            config['table'][temp_config].config.ajax.data = data;
            if (config['table'][temp_table] === null) {
                temp_param = cache.loginMap.param;
                config['table'][temp_config].config.ajax.data['adminId'] = temp_param.adminId;
                config['table'][temp_config].config.ajax.data['token'] = temp_param.token;
                /*初始请求*/
                config['table'][temp_table] = self['$admin_list_wrapdetail'].DataTable(config['table'][temp_config].config);
                /*调用按钮操作*/
                dataTableItemActionService.initItemAction(config['table'][temp_action]);
            } else {
                config['table'][temp_table].ajax.config(config['table'][temp_config].config.ajax).load();
            }
        };
        /*数据查询服务--查询明细订单*/
        this.queryOrderList = function (config) {
            if (cache === null) {
                return false;
            }

            var record = config.model.record,
                action = config.action,
                id = config.id;

            if (typeof id === 'undefined') {
                /*订单详情*/
                toolDialog.show({
                    type: 'warn',
                    value: '没有订单信息'
                });
                return false;
            }


            if (record.organizationId === '') {
                console.log('没有父节点');
                return false;
            }

            var tempparam = cache.loginMap.param,
                param = {
                    adminId: tempparam.adminId,
                    token: tempparam.token,
                    organizationId: record.organizationId,
                    id: id
                };


            toolUtil
                .requestHttp({
                    url: '/finance/profit/detail/order'/*'json/test.json'*//*测试地址*/,
                    method: 'post',
                    set: true,
                    debug: false, /*测试开关*/
                    data: param
                })
                .then(function (resp) {
                        /*测试代码*/
                        /*var resp = self.testGetFinanceList('order');*/

                        var data = resp.data,
                            status = parseInt(resp.status, 10);

                        if (status === 200) {
                            var code = parseInt(data.code, 10),
                                message = data.message;
                            if (code !== 0) {
                                if (typeof message !== 'undefined' && message !== '') {
                                    console.log(message);
                                } else {
                                    console.log('请求订单数据失败');
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
                                    var list = result.list;
                                    if (list) {
                                        /*订单明细*/
                                        (function () {
                                            var item,
                                                str = '',
                                                len = list.length,
                                                i = 0;
                                            for (i; i < len; i++) {
                                                item = list[i];
                                                str += '<tr><td>' + (i + 1) + '</td><td>' + item["merchantName"] + '</td><td>' + toolUtil.phoneFormat(item["merchantPhone"]) + '</td><td>' + item["orderTime"] + '</td><td>' + item["payTime"] + '</td><td>' + item["orderNumber"] + '</td><td>' + (function () {
                                                        var tempstate = parseInt(item["orderState"], 10),
                                                            statemap = {
                                                                0: '待付款',
                                                                1: '取消订单',
                                                                6: '待发货',
                                                                9: '待收货',
                                                                20: '待评价',
                                                                21: '已评价'
                                                            },
                                                            tempstr = '';
                                                        if (tempstate === 0) {
                                                            tempstr = '<div class="g-c-blue3">' + statemap[tempstate] + '</div>';
                                                        } else if (tempstate === 1) {
                                                            tempstr = '<div class="g-c-red1">' + statemap[tempstate] + '</div>';
                                                        } else if (tempstate === 6 || tempstate === 9 || tempstate === 20) {
                                                            tempstr = '<div class="g-c-warn">' + statemap[tempstate] + '</div>';
                                                        } else if (tempstate === 21) {
                                                            tempstr = '<div class="g-c-green1">' + statemap[tempstate] + '</div>';
                                                        } else {
                                                            tempstr = '<div class="g-c-gray6">其他</div>';
                                                        }
                                                        return tempstr;
                                                    }()) + '</td><td>' + toolUtil.moneyCorrect(item["totalMoney"], 15, false)[0] + '</td><td>' + (function () {
                                                        var temppay = parseInt(item["paymentType"], 10),
                                                            paymap = {
                                                                1: "微信",
                                                                2: "支付宝",
                                                                3: "其它"
                                                            };
                                                        return paymap[temppay] || '其他';
                                                    }()) + '</td><td><span data-action="orderdetail" data-id="' + item["id"] + '" class="btn-operate">订单详情</span></td></tr>';
                                            }
                                            if (str !== '') {
                                                $(str).appendTo(self.$admin_orderdetail_list.html(''));
                                                /*显示弹窗*/
                                                self.toggleModal({
                                                    display: 'show',
                                                    area: 'orderdetail'
                                                });
                                            }
                                        }());

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
        /*数据查询服务--查询明细订单详情*/
        this.queryOrderDetail = function (config) {
            if (cache === null) {
                return false;
            }

            var id = config.id;

            if (typeof id === 'undefined') {
                toolDialog.show({
                    type: 'warn',
                    value: '没有订单信息'
                });
                return false;
            }

            /*判断参数*/
            var tempparam = cache.loginMap.param,
                param = {
                    adminId: tempparam.adminId,
                    token: tempparam.token,
                    id: id
                };


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
        /*数据查询服务--处理清算（注意状态）
         to do :此处批量处理，状态还待定，开发是注意
         * */
        this.actionClear = function (model, config) {
            if (cache === null) {
                return false;
            }

            var type = config.type,
                record = model.record,
                action = record.action;

            if (action === '') {
                return false;
            }

            var table = model.table,
                state,
                temp_check = 'tablecheckall' + action;

            if (type === 'batch') {
                /*批量*/
                var batchdata = dataTableCheckAllService.getBatchData(table[temp_check]),
                    len = batchdata.length;
                if (len === 0) {
                    toolDialog.show({
                        type: 'warn',
                        value: '请选中相关数据'
                    });
                    return false;
                }
                state = 2;
            } else if (type === 'base') {
                /*单个处理*/
                var id = config.id;
                if (isNaN(id)) {
                    toolDialog.show({
                        type: 'warn',
                        value: '请选中相关数据'
                    });
                    return false;
                }
                state = config.state;
            }

            /*确认是否清算*/
            toolDialog.sureDialog('', function () {
                /*适配参数*/
                var param = $.extend(true, {}, cache.loginMap.param);
                if (type === 'batch') {
                    param['psids'] = batchdata.join(',');
                } else if (type === 'base') {
                    param['psids'] = id;
                }
                param['state'] = 2;

                /*执行清算操作*/
                toolUtil
                    .requestHttp({
                        url: '/finance/profit/clear/state'/*'json/test.json'*/,
                        method: 'post',
                        set: true,
                        debug: true, /*测试开关*/
                        data: param
                    })
                    .then(function (resp) {
                            /*测试代码*/
                            /*var resp=self.testClear();*/

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
                                            value: '清算订单失败'
                                        });
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
                                    /*提示信息*/
                                    toolDialog.show({
                                        type: 'succ',
                                        value: '清算订单成功'
                                    });
                                    /*清空全选*/
                                    /*dataTableCheckAllService.clear(table[temp_check]);*/
                                    /*重新加载数据*/
                                    self.getColumnData(table, record);
                                }
                            }
                        },
                        function (resp) {
                            var message = resp.data.message;
                            if (typeof message !== 'undefined' && message !== '') {
                                console.log(message);
                            } else {
                                console.log('清算订单失败');
                            }
                        });
            }, type === 'base' ? '是否真要清算数据' : '是否真要批量清算数据', true);

        };


        /*弹出层服务*/
        this.toggleModal = function (config, fn) {
            var temp_timer = null,
                type_map = {
                    'orderdetail': self.$admin_orderdetail_dialog,
                    'bonus': self.$admin_bonus_dialog,
                    'bonusdetail': self.$admin_bonusdetail_dialog
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
                var logininfo = cache.loginMap,
                    param = $.extend(true, {}, cache.loginMap.param);

                param['isShowSelf'] = 0;
                var layer,
                    id,
                    $wrap;

                /*初始化加载*/
                if (!config.$reqstate) {
                    layer = 0;
                    /*根目录则获取新配置参数*/
                    id = param['organizationId'];
                    $wrap = self.$admin_finance_submenu;
                    var record = config.record;
                    record.organizationId = id;
                    record.organizationName = !logininfo.param.organizationName ? logininfo.username : decodeURIComponent(logininfo.param.organizationName);

                    self.getColumnData(config.table, record);
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
                temp_id = $this.attr('data-id'),
                temp_label = $this.html();

            if (typeof temp_id === 'undefined') {
                return false;
            }


            /*模型缓存*/
            var record = config.record;

            /*变更操作记录模型--激活高亮*/
            record.organizationId = temp_id;
            record.organizationName = temp_label;

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


        /*表单类服务--执行延时任务序列*/
        this.addFormDelay = function (config) {
            /*映射对象*/
            var type = config.type,
                type_map = {
                    'bonus': {
                        'timeid': bonusform_reset_timer,
                        'dom': self.$admin_bonus_reset
                    }
                };
            /*执行延时操作*/
            type_map[type]['timeid'] = $timeout(function () {
                /*触发重置表单*/
                type_map[type]['dom'].trigger('click');
            }, 0);
        };
        /*表单类服务--清除延时任务序列*/
        this.clearFormDelay = function (did) {
            if (did && did !== null) {
                $timeout.cancel(did);
                did = null;
            } else {
                /*如果存在延迟任务则清除延迟任务*/
                if (bonusform_reset_timer !== null) {
                    $timeout.cancel(bonusform_reset_timer);
                    bonusform_reset_timer = null;
                }
            }
        };
        /*表单类服务--清空表单模型数据*/
        this.clearFormData = function (data, type) {
            if (!data) {
                return false;
            }
            if (typeof type !== 'undefined' && type !== '') {
                /*特殊情况*/
            } else {
                /*重置机构数据模型*/
                (function () {
                    for (var i in data) {
                        if (i === 'type') {
                            /*操作类型为新增*/
                            data[i] = 'add';
                        } else {
                            data[i] = '';
                        }
                    }
                })(data);
            }
        };
        /*表单类服务--重置表单数据*/
        this.clearFormValid = function (forms) {
            if (forms) {
                var temp_cont = forms.$$controls;
                if (temp_cont) {
                    var len = temp_cont.length,
                        i = 0;
                    forms.$dirty = false;
                    forms.$invalid = true;
                    forms.$pristine = true;
                    forms.valid = false;

                    if (len !== 0) {
                        for (i; i < len; i++) {
                            var temp_item = temp_cont[i];
                            temp_item['$dirty'] = false;
                            temp_item['$invalid'] = true;
                            temp_item['$pristine'] = true;
                            temp_item['$valid'] = false;
                        }
                    }
                }
            }
        };
        /*表单服务类--重置表单*/
        this.formReset = function (config, type) {
            if (type === 'bonus') {
                /*特殊情况--发货*/
                self.clearFormData(config[type]);
                /*重置提示信息*/
                self.clearFormValid(config.forms);
            }
        };
        /*表单服务类--提交表单*/
        this.formSubmit = function (config, type) {
            if (cache) {
                var action = '',
                    tempparam = cache.loginMap.param,
                    param = {
                        adminId: tempparam.adminId,
                        token: tempparam.token
                    },
                    req_config = {
                        method: 'post',
                        set: true
                    },
                    record = config.record,
                    tip_map = {
                        'add': '新增',
                        'edit': '编辑',
                        'bonus': '除权除息分红'
                    };

                /*适配参数*/
                if (type === 'bonus') {
                    /*公共配置*/
                    var bonus = config[type];
                    param['exrightDate'] = bonus['exrightDate'];
                    param['exright'] = toolUtil.trimSep(bonus['exright'], ',');
                    param['exdividendDate'] = bonus['exdividendDate'];
                    param['exdividend'] = toolUtil.trimSep(bonus['exdividend'], ',');
                    param['bonusDate'] = bonus['bonusDate'];
                    param['bonus'] = toolUtil.trimSep(bonus['bonus'], ',');

                    if (bonus['id'] === '') {
                        action = 'add';
                        param['organizationId'] = record.organizationId !== '' ? record.organizationId : record.currentId;
                        req_config['url'] = '/exdividend/bonus/add';
                    } else {
                        action = 'edit';
                        param['id'] = bonus['id'];
                        req_config['url'] = '/exdividend/bonus/update';
                    }
                }
                req_config['data'] = param;

                toolUtil
                    .requestHttp(req_config)
                    .then(function (resp) {
                            var data = resp.data,
                                status = parseInt(resp.status, 10);

                            if (status === 200) {
                                var code = parseInt(data.code, 10),
                                    message = data.message;
                                if (code !== 0) {
                                    if (typeof message !== 'undefined' && message !== '') {
                                        toolDialog.show({
                                            type: 'warn',
                                            value: message
                                        });
                                    } else {
                                        toolDialog.show({
                                            type: 'warn',
                                            value: tip_map[action] + tip_map[type] + '失败'
                                        });
                                    }
                                    if (code === 999) {
                                        /*退出系统*/
                                        cache = null;
                                        toolUtil.loginTips({
                                            clear: true,
                                            reload: true
                                        });
                                    }
                                    return false;
                                } else {
                                    /*操作成功即加载数据*/
                                    /*to do*/
                                    if (type === 'bonus') {
                                        /*重新加载列表数据*/
                                        self.getColumnData(config.table, config.record);
                                    }
                                    /*重置表单*/
                                    self.addFormDelay({
                                        type: type
                                    });
                                    /*提示操作结果*/
                                    toolDialog.show({
                                        type: 'succ',
                                        value: tip_map[action] + tip_map[type] + '成功'
                                    });
                                    /*弹出框隐藏*/
                                    self.toggleModal({
                                        display: 'hide',
                                        area: type,
                                        delay: 1000
                                    });
                                }
                            }
                        },
                        function (resp) {
                            var message = resp.data.message;
                            if (typeof message !== 'undefined' && message !== '') {
                                toolDialog.show({
                                    type: 'warn',
                                    value: message
                                });
                            } else {
                                toolDialog.show({
                                    type: 'warn',
                                    value: tip_map[action] + tip_map[type] + '失败'
                                });
                            }
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
        /*表单服务类--时间查询*/
        this.datePicker = function (arr) {
            if (!arr) {
                return false;
            }
            var len = arr.length,
                i = 0;
            for (i; i < len; i++) {
                datePicker97Service.datePicker(arr[i]);
            }
        };


        /*测试服务--获取数据*/
        this.testGetFinanceList = function (type) {
            var moneyrule = /(^(([1-9]{1}\d{0,8})|0)((\.{0}(\d){0})|(\.{1}(\d){2}))$){1}/,
                res;
            if (type === 1) {
                res = {
                    message: 'ok',
                    code: 0,
                    result: Mock.mock({
                        'salesCount': moneyrule,
                        'profits1Count': moneyrule,
                        'list|5-10': [{
                            "organizationName": /[a-z]{2,20}/,
                            "sales": moneyrule,
                            "profits1": moneyrule
                        }]
                    })
                };
            } else if (type === 2) {
                res = {
                    message: 'ok',
                    code: 0,
                    result: Mock.mock({
                        'salesCount': moneyrule,
                        'profits1Count': moneyrule,
                        'list|2-5': [{
                            "id": /[0-9]{1,2}/,
                            "year": /((2)(0)(1)([0-7])){1}/,
                            "month": /([1-9]|11|12){1}/,
                            "times": moment().format('YYYY-MM-DD HH:mm:ss'),
                            "sales": moneyrule,
                            "profits1": moneyrule
                        }]
                    })
                };
            } else if (type === 3) {
                res = {
                    message: 'ok',
                    code: 0,
                    result: Mock.mock({
                        'salesCount': moneyrule,
                        'profits1Count': moneyrule,
                        'list|2-5': [{
                            "id": /[0-9]{1,2}/,
                            "times": moment().format('YYYY-MM-DD HH:mm:ss'),
                            "sales": moneyrule,
                            "profits1": moneyrule
                        }]
                    })
                };
            } else if (type === 'order') {
                res = {
                    status: 200,
                    data: {
                        message: 'ok',
                        code: 0,
                        result: Mock.mock({
                            'list|2-50': [{
                                "id": /[0-9]{1,2}/,
                                "merchantName": /[0-9a-zA-Z]{2,10}/,
                                "merchantPhone": /(^(13[0-9]|14[579]|15[012356789]|16[6]|17[01235678]|18[0-9]|19[89])[0-9]{8}$){1}/,
                                "orderTime": moment().format('YYYY-MM-DD HH:mm:ss'),
                                "payTime": moment().format('YYYY-MM-DD HH:mm:ss'),
                                "orderNumber": /[0-9a-zA-Z]{18}/,
                                "orderState": /(21|0|1|6|9|20|[2-5]){1}/,
                                "totalMoney": /(^(([1-9]{1}\d{0,8})|0)((\.{0}(\d){0})|(\.{1}(\d){2}))$){1}/,
                                "paymentType": /[1-3]{1}/
                            }]
                        })
                    }
                };
            } else if (type === 'detail') {
                res = {
                    message: 'ok',
                    code: 0,
                    result: Mock.mock({
                        'list|2-5': [{
                            "id": /[0-9]{1,2}/,
                            "shopName": /[a-zA-Z]{2,20}/,
                            "type": /[1-3]{1}/,
                            "sales": moneyrule,
                            "profits1": moneyrule
                        }]
                    })
                };
            }
            if (res['result']) {
                res['result']['count'] = 30;
            } else if (res['data']) {
                res['data']['result']['count'] = 30;
            }

            return res;
        };
        /*测试服务--清算*/
        this.testClear = function () {
            return {
                status: 200,
                data: {
                    message: 'ok',
                    code: 0
                }
            };
        };


    }]);