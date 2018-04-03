angular.module('app')
    .service('equityService', ['toolUtil', 'toolDialog', 'BASE_CONFIG', 'loginService', 'powerService', 'addressService', 'dataTableColumnService', 'dataTableItemActionService', 'datePicker97Service', '$timeout', function (toolUtil, toolDialog, BASE_CONFIG, loginService, powerService, addressService, dataTableColumnService, dataTableItemActionService, datePicker97Service, $timeout) {

        /*获取缓存数据*/
        var self = this,
            module_id = 110/*模块id*/,
            cache = loginService.getCache(),
            equityform_reset_timer = null;

        var powermap = powerService.getCurrentPower(module_id);

        /*初始化权限*/
        var init_power = {
            investor_details: toolUtil.isPower('investor-details', powermap, true)/*详情*/
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


        /*发货查询服务--请求数据--获取表格数据*/
        this.getColumnData = function (table, record) {
            if (cache === null) {
                return false;
            } else if (!table && !record) {
                return false;
            }

            /*如果存在模型*/
            var data = $.extend(true, {}, table.list1_config.config.ajax.data),
                temp_param;

            if (self.organizationId !== '') {
                data['organizationId'] = record.organizationId;
            } else {
                data['organizationId'] = record.currentId;
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
        /*发货查询服务--过滤表格数据*/
        this.filterDataTable = function (table, record) {
            if (table.list_table === null) {
                return false;
            }
            table.list_table.search(record.filter).columns().draw();
        };
        /*发货查询服务--操作按钮*/
        this.doItemAction = function (model, config) {
            var id = config.id,
                action = config.action;

            if (action === 'detail') {
                self.queryEquityInfo(null, id, action);
            }else if(action === 'update'){
                /*如果存在延迟任务则清除延迟任务*/
                self.clearFormDelay();
                /*通过延迟任务清空表单数据*/
                self.addFormDelay({
                    type: 'equity'
                });
                self.queryEquityInfo(model, id, action);
            }
        };


        /*股权投资人服务--操作股权投资人*/
        this.actionEquity = function (config) {
            var modal = config.modal,
                record = config.record,
                type = modal.type;

            /*判断是否是合法的节点，即是否有父机构*/
            if (type === 'add') {
                if(record.organizationId === '' && record.currentId === ''){
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
                type: 'equity'
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
        /*股权投资人服务--查询股权投资人*/
        this.queryEquityInfo = function (config, id, action) {
            if (cache === null) {
                return false;
            }

            if (typeof id === 'undefined') {
                toolDialog.show({
                    type: 'warn',
                    value: '没有股权投资人信息'
                });
                return false;
            }

            var tempparam = cache.loginMap.param,
                param = {
                    adminId: tempparam.adminId,
                    token: tempparam.token,
                    id: id
                };

            toolUtil
                .requestHttp({
                    url: '/equity/investor/info',
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
                                    loginService.outAction();
                                }
                            } else {
                                /*加载数据*/
                                var result = data.result;
                                if (typeof result !== 'undefined') {
                                    var list = result.investor;
                                    if (list) {
                                        if (action === 'update') {
                                            /*修改：更新模型*/
                                            var equity = config.equity;

                                            for (var i in list) {
                                                switch (i) {
                                                    case 'id':
                                                        equity[i] = list[i];
                                                        equity['type'] = 'edit';
                                                        break;
                                                    case 'fullName':
                                                        equity[i] = list[i];
                                                        break;
                                                    case 'cellphone':
                                                        equity[i] = toolUtil.phoneFormat(list[i]);
                                                        break;
                                                    case 'province':
                                                        equity['province'] = list['province'];
                                                        equity['city'] = list['city'];
                                                        equity['country'] = list['country'];
                                                        /*判断是否需要重新数据，并依此更新相关地址模型*/
                                                        self.isReqAddress({
                                                            type: 'city',
                                                            address: config.address,
                                                            model: equity
                                                        }, true);
                                                        break;
                                                    case 'address':
                                                        equity[i] = list[i];
                                                        break;
                                                    case 'status':
                                                        equity[i] = list[i];
                                                        break;
                                                    case 'investmentAmount':
                                                        equity[i] = toolUtil.moneyCorrect(list[i], 15,true)[0];
                                                        break;
                                                    case 'investmentTime':
                                                        equity[i] = list[i];
                                                        break;
                                                    case 'expirationTime':
                                                        equity[i] = list[i];
                                                        break;
                                                    case 'contractNo':
                                                        equity[i] = list[i];
                                                        break;
                                                    case 'remark':
                                                        equity[i] = list[i];
                                                        break;
                                                }
                                            }
                                            /*显示弹窗*/
                                            self.toggleModal({
                                                display: 'show',
                                                area: 'equity'
                                            });
                                        } else if (action === 'detail') {
                                            /*查看*/
                                            var str = '',
                                                detail_map = {
                                                    'id': '序列号',
                                                    'fullName': '投资人名称',
                                                    'cellphone': '手机号码',
                                                    'province': '省份',
                                                    'city': '市区',
                                                    'country': '县区',
                                                    'address': '联系地址',
                                                    'status':'状态',
                                                    'investmentAmount': '投资额',
                                                    'investmentTime': '投资时间',
                                                    'expirationTime': '到期时间',
                                                    'contractNo': '合同编号',
                                                    'remark': '备注'
                                                };

                                            var r_province = '',
                                                r_country = '',
                                                r_city = '';

                                            for (var j in list) {
                                                if (typeof detail_map[j] !== 'undefined') {
                                                    if (j === 'cellphone') {
                                                        str += '<tr><td class="g-t-r">' + detail_map[j] + ':</td><td class="g-t-l">' + toolUtil.phoneFormat(list[j]) + '</td></tr>';
                                                    } else if (j === 'status') {
                                                        var statusmap={
                                                            0:'<div class="g-c-blue1">正常</div>',
                                                            1:'<div class="g-c-red1">停用</div>'
                                                        };
                                                        str += '<tr><td class="g-t-r">' + detail_map[j] + ':</td><td class="g-t-l">' + statusmap[list[j]] + '</td></tr>';
                                                    } else if (j === 'investmentAmount') {
                                                        str += '<tr><td class="g-t-r">' + detail_map[j] + ':</td><td class="g-t-l">' + toolUtil.moneyCorrect(list[j], 15, true)[0] + '</td></tr>';
                                                    } else if (j === 'province' || j === 'country' || j === 'city') {
                                                        str += '<tr><td class="g-t-r">' + detail_map[j] + ':</td><td class="g-t-l">#' + j + '#</td></tr>';
                                                        if (j === 'province') {
                                                            self.queryByCode(list[j], function (name) {
                                                                r_province = name;
                                                            });
                                                        } else if (j === 'country') {
                                                            self.queryByCode(list[j], function (name) {
                                                                r_country = name;
                                                            });
                                                        } else if (j === 'city') {
                                                            self.queryByCode(list[j], function (name) {
                                                                r_city = name;
                                                            });
                                                        }
                                                    } else {
                                                        str += '<tr><td class="g-t-r">' + detail_map[j] + ':</td><td class="g-t-l">' + list[j] + '</td></tr>';
                                                    }
                                                }
                                            }
                                            if (str !== '') {
                                                setTimeout(function () {
                                                    str = str.replace(/#province#/g, r_province).replace(/#country#/g, r_country).replace(/#city#/g, r_city);
                                                    $(str).appendTo(self.$admin_equitydetail_show.html(''));
                                                    /*显示弹窗*/
                                                    self.toggleModal({
                                                        display: 'show',
                                                        area: 'equitydetail'
                                                    });
                                                }, 200);

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
                            console.log('请求用户失败');
                        }
                    });
        };

        /*弹出层服务*/
        this.toggleModal = function (config, fn) {
            var temp_timer = null,
                type_map = {
                    'equity': self.$admin_equity_dialog,
                    'equitydetail': self.$admin_equitydetail_dialog
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
                /*清除延时任务序列*/
                if (config.area === 'equity') {
                    self.clearFormDelay();
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
                record['currentName'] = logininfo.username;
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
                    $wrap = self.$admin_equity_submenu;
                    config.record.organizationId = id;
                    config.record.organizationName = cache.loginMap.username;
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
                    'equity': {
                        'timeid': equityform_reset_timer,
                        'dom': self.$admin_equity_reset
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
                if (equityform_reset_timer !== null) {
                    $timeout.cancel(equityform_reset_timer);
                    equityform_reset_timer = null;
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
                if (type === 'equity') {
                    /*清除成员数据*/
                    (function () {
                        for (var i in data) {
                            if (i === 'type') {
                                /*操作类型为新增*/
                                data[i] = 'add';
                            }else if (i === 'status') {
                                /*操作类型为新增*/
                                data[i] = 0;
                            } else if (i === 'province' || i === 'city' || i === 'country') {
                                /*操作类型为新增*/
                                continue;
                            } else {
                                data[i] = '';
                            }
                        }
                    })(data);
                }
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
            if (type === 'equity') {
                /*特殊情况--发货*/
                self.clearFormData(config[type], type);
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
                        'equity': '股权投资人'
                    };

                /*适配参数*/
                if (type === 'equity') {
                    /*公共配置*/
                    var equity = config[type];
                    param['fullName'] = equity['fullName'];
                    param['cellphone'] = toolUtil.trims(equity['cellphone']);
                    param['province'] = equity['province'];
                    param['city'] = equity['city'];
                    param['country'] = equity['country'];
                    param['address'] = equity['address'];
                    param['status'] = equity['status'];
                    param['investmentAmount'] = toolUtil.trimSep(equity['investmentAmount'], ',');
                    param['investmentTime'] = equity['investmentTime'];
                    param['expirationTime'] = equity['expirationTime'];
                    param['contractNo'] = equity['contractNo'];
                    param['remark'] = equity['remark'];

                    if (equity['id'] === '') {
                        action = 'add';
                        param['organizationId'] = record.organizationId !== '' ? record.organizationId : record.currentId;
                        req_config['url'] = '/equity/investor/add';
                    } else {
                        action = 'edit';
                        param['id'] = equity['id'];
                        req_config['url'] = '/equity/investor/update';
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
                                        loginService.outAction();
                                    }
                                    return false;
                                } else {
                                    /*操作成功即加载数据*/
                                    /*to do*/
                                    if (type === 'equity') {
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
                loginService.outAction();
            }
        };
        /*表单服务类--时间查询*/
        this.datePicker = function (config) {
            config['$node1'] = self.$equity_investmentTime;
            config['$node2'] = self.$equity_expirationTime;
            datePicker97Service.datePickerRange(config);
        };


        /*地址服务--地址查询*/
        this.queryAddress = function (config) {
            addressService.queryRelation(config);
        };
        /*地址服务--判断是否需要查询新地址*/
        this.isReqAddress = function (config, flag, fn) {
            if (flag) {
                addressService.isReqAddress(config, flag, fn);
            } else {
                return addressService.isReqAddress(config);
            }
        };
        /*地址服务--根据code查询value地址*/
        this.queryByCode = function (code, fn) {
            if (fn) {
                addressService.queryByCode(code, fn);
            } else {
                return addressService.queryByCode(code, fn);
            }
        };
        
    }]);