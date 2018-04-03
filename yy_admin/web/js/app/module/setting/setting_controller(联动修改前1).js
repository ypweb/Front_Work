/*设置总控制器*/
angular.module('app')
    .controller('SettingController', ['settingService', 'toolUtil', function (settingService, toolUtil) {
        var self = this;

        /*模型--操作权限列表*/
        this.powerlist = settingService.getCurrentPower();

        /*模型--菜单列表*/
        this.listitem = [{
            name: '完善信息',
            power: self.powerlist.organization_info,
            href: 'setting.info',
            active: ''
        }, {
            name: '更改密码',
            power: self.powerlist.pwd_update,
            href: 'setting.pwd',
            active: ''
        }, {
            name: '设置子管理',
            power: (self.powerlist.child_add || self.powerlist.child_edit || self.powerlist.child_delete),
            href: 'setting.manage',
            active: ''
        }, {
            name: '分润设置',
            power: self.powerlist.setting_profit,
            href: 'setting.profit',
            active: ''
        }];


        /*jquery dom缓存:主要是切换路由时，创建的dom缓存引用与现有的dom引用不一致，需要加载视图更新现有dom引用*/
        var jq_dom = {
                $admin_manage_reset: $('#admin_manage_reset'),
                $setting_manage_dialog: $('#setting_manage_dialog'),
                $submenu_scroll_wrap:$('#submenu_scroll_wrap'),
                $admin_struct_menu: $('#admin_struct_menu')
            },
        /*权限缓存*/
            jq_dom_power = {
                $power_colgroup: $('#setting_power_colgroup'),
                $power_thead: $('#setting_power_thead'),
                $power_tbody: $('#setting_power_tbody')
            };
        /*标签缓存*/
        jq_dom['$allstruct'] = jq_dom.$admin_struct_menu.prev().find('label');

        /*切换路由时更新dom缓存*/
        settingService.initJQDom(jq_dom);

        /*权限初始化*/
        settingService.initForPower({
            dom: jq_dom_power,
            isall: true
        });

        /*模型--分页显示条数*/
        this.pageSizeItem = [{
            'value': 10,
            'name': '10条记录'
        }, {
            'value': 15,
            'name': '15条记录'
        }, {
            'value': 20,
            'name': '20条记录'
        }, {
            'value': 30,
            'name': '30条记录'
        }];


        /*模型--操作记录*/
        this.record = {
            iscroll_flag:true/*是否开启滚动条调用*/,
            profitid: 1,
            pageSize: 10,
            searchactive: ''/*搜索激活状态*/,
            searchname: ''/*搜索关键词*/,
            organizationId: ''/*虚拟挂载点id*/,
            organizationName: ''/*操作名称*/,
            token: ''/*凭证*/,
            adminId: '',
            prev: null/*上一次操作记录*/,
            current: null/*当前操作记录*/,
            layer: 0,
            currentId: ''/*操作id*/,
            currentName: '',
            managestruct: {}/*子管理--选中的机构信息*/
        };

        /*模型--密码修改*/
        this.pwd = {
            password: ''/*旧密码*/,
            newPassword: ''/*新密码*/,
            confirm_newPassword: ''/*确认密码*/
        };


        /*模型--机构信息*/
        this.struct = {
            linkman: ''/*负责人*/,
            cellphone: ''/*手机号码*/,
            address: ''/*详细地址*/,
            remark: ''/*备注*/,
            payeeName: ''/*收款人姓名*/,
            depositBank: ''/*开户银行*/,
            payeeAccount: ''/*收款帐号*/
        };


        /*模型--子管理信息*/
        this.manage = {
            type: 'add'/*表单类型：新增，编辑；默认为新增*/,
            id: ''/*子管理ID，编辑时相关参数*/,
            fullname: ''/*子管理全称*/,
            cellphone: ''/*手机号码*/,
            username: ''/*设置登录名*/,
            password: ''/*设置登录密码*/,
            remark: ''/*备注*/,
            status: 0/*状态*/,
            parentId:''/*上级id,用于编辑*/,
            isDesignatedOrg: 0/*是否指定运营商：0：默认，1：指定*/,
            designatedOrgIds: ''/*指定运营商Ids*/,
            isDesignatedPermit: 0/*是否指定权限,0:全部权限 1:指定权限*/,
            checkedFunctionIds: ''/*选中权限Ids*/,
            token:''/*凭证*/,
            mtype:''/*业务类型*/,
            filter: ''/*管理列表过滤*/
        };

        /*模型--表格缓存*/
        this.table = {};


        /*模型--分润业务列表*/
        this.profitlist = [];

        /*模型--分润配置*/
        this.profit = {
            /*基数设置*/
            base: {
                title: '分润基数设置',
                id: '',
                profit: '',
                type: 1
            },
            /*标准设置*/
            standard: {
                title: '分润标准设置',
                id: '',
                profit1: '',
                profit2: '',
                profit3: '',
                type: 1
            }
        };


        /*初始化服务--初始化参数*/
        settingService.getRoot(self.record);


        /*完善信息服务--查询完善信息*/
        this.queryStructInfo=function () {
            settingService.queryStructInfo({
                record:self.record,
                struct:self.struct
            });
        };


        /*表单服务--提交表单*/
        this.formSubmit = function (type) {
            settingService.formSubmit({
                record: self.record,
                manage: self.manage,
                pwd: self.pwd,
                table: self.table,
                
                struct: self.struct
            }, type);
        };
        /*表单服务--重置表单*/
        this.formReset = function (forms, type) {
            settingService.formReset({
                record: self.record,
                struct: self.struct,
                manage: self.manage,
                forms: forms
            }, type);
        };
        /*表单服务--机构服务--全选机构*/
        this.selectAllStruct = function (e) {
            settingService.selectAllStruct(e);
        };
        /*表单服务--机构服务--确定所选机构*/
        this.getSelectStruct = function () {
            settingService.getSelectStruct({
                record: self.record,
                manage: self.manage
            });
        };
        /*表单服务--机构服务--取消所选机构*/
        this.clearSelectStruct = function () {
            settingService.clearSelectStruct({
                record: self.record,
                manage: self.manage
            });
        };


        /*表单服务--权限服务--确定所选权限*/
        this.getSelectPower = function () {
            settingService.getSelectPower(self.manage);
        };
        /*表单服务--权限服务--取消所选权限*/
        this.clearSelectPower = function () {
            settingService.clearSelectPower(self.manage);
        };
        /*表单服务--权限服务--切换权限*/
        this.toggleSelectPower = function () {
            settingService.toggleSelectPower({
                record:self.record,
                manage:self.manage
            });
        };


        /*机构服务--初始化加载机构*/
        this.initStructList = function (e) {
            settingService.initStructList(e, {
                record: self.record,
                manage: self.manage
            });
        };
        /*机构服务--加载机构角色*/
        this.getStructList = function () {
            settingService.getStructList({
                record: self.record
            });
        };
        /*机构服务--显示隐藏*/
        this.toggleStructList = function (e) {
            settingService.toggleStructList(e, {
                record: self.record
            });
        };


        /*弹出层显示隐藏*/
        this.toggleModal = function (config) {
            settingService.toggleModal({
                display: config.display,
                area: config.area
            });
        };


        /*子管理--添加子管理*/
        this.actionManage = function (config) {
            settingService.actionManage({
                modal: config,
                record: self.record,
                manage: self.manage
            });
        };

        /*数据列表服务--切换每页数据*/
        this.changeDTTL = function () {
            settingService.changeDTTL(self.table.list_table, self.record.pageSize);
        };
        /*数据列表服务--过滤数据*/
        this.filterDataTable = function () {
            settingService.filterDataTable(self.table.list_table, self.manage);
        };
        /*数据列表服务--查询子管理列表*/
        this.getColumnData = function (type) {
            if (typeof type !== 'undefined' && type === 'init') {
                /*判断是否是初始化加载*/
                /*更新节点*/
                var temp_dom = {
                    $admin_list_wrap: $('#admin_list_wrap'),
                    $admin_batchlist_wrap: $('#admin_batchlist_wrap')
                };
                /*更新节点*/
                jq_dom['$admin_list_wrap'] = temp_dom.$admin_list_wrap;
                jq_dom['$admin_batchlist_wrap'] = temp_dom.$admin_batchlist_wrap;
                /*更新服务节点*/
                settingService.initJQDom(temp_dom);
                /*创建table模型*/
                self.table['list1_config'] = {
                    config: {
                        processing: true, /*大消耗操作时是否显示处理状态*/
                        deferRender: true, /*是否延迟加载数据*/
                        autoWidth: true, /*是否*/
                        paging: true,
                        pagingType: 'simple_numbers', /*分页按钮排列*/
                        aLengthMenu: [self.record.pageSize],
                        lengthChange: true, /*是否可改变长度*/
                        ajax: {
                            url: toolUtil.adaptReqUrl('/sysuser/child/list'),
                            dataType: 'JSON',
                            method: 'post',
                            dataSrc: function (json) {
                                var code = parseInt(json.code, 10),
                                    message = json.message;

                                if (code !== 0) {
                                    if (typeof message !== 'undefined' && message !== '') {
                                        console.log(message);
                                    } else {
                                        console.log('获取子管理失败');
                                    }
                                    if (code === 999) {
                                        /*退出系统*/
                                        toolUtil.loginTips({
                                            clear: true,
                                            reload: true
                                        });
                                    }
                                    return [];
                                }
                                var result = json.result;
                                if (typeof result === 'undefined') {
                                    return [];
                                }

                                if (result) {
                                    var list = result.list;
                                    if (!list) {
                                        return [];
                                    }
                                    return list.length === 0 ? [] : list;
                                } else {
                                    /*重置分页*/
                                    return [];
                                }
                            },
                            data: {}
                        },
                        info: true,
                        dom: '<"g-d-hidei" s>tp',
                        searching: true,
                        order: [[1, "desc"]],
                        columns: [
                            {
                                "data": "fullname"
                            },
                            {
                                "data": "isDesignatedOrg",
                                "render": function (data, type, full, meta) {
                                    var designatedOrg = parseInt(data, 10);
                                    if (designatedOrg === 0) {
                                        return '<div class="g-c-blue3">本机构级下属机构</div>';
                                    } else if (designatedOrg === 1) {
                                        return '<div class="g-c-blue3">指定机构</div>';
                                    } else {
                                        return '<div class="g-c-warn">其他</div>';
                                    }
                                }
                            },
                            {
                                "data": "isDesignatedPermit",
                                "render": function (data, type, full, meta) {
                                    var designatedPermit = parseInt(data, 10);
                                    if (designatedPermit === 0) {
                                        return '<div class="g-c-blue3">全部权限</div>';
                                    } else if (designatedPermit === 1) {
                                        return '<div class="g-c-blue3">指定权限</div>';
                                    } else {
                                        return '<div class="g-c-warn">其他</div>';
                                    }
                                }
                            },
                            {
                                /*to do*/
                                "data": "id",
                                "render": function (data, type, full, meta) {
                                    var btns = '';

                                    /*查看订单*/
                                    if (self.powerlist.child_edit) {
                                        btns += '<span data-action="update" data-id="' + data + '"  class="btn-operate">编辑</span>';
                                    }
                                    if (self.powerlist.child_delete) {
                                        btns += '<span data-action="delete" data-id="' + data + '"  class="btn-operate">删除</span>';
                                    }
                                    return btns;
                                }
                            }
                        ]
                    }
                };
                self.table['list_table'] = null;
                self.table['tableitemaction'] = {
                    $bodywrap: jq_dom.$admin_batchlist_wrap,
                    itemaction_api: {
                        doItemAction: function (config) {
                            settingService.doItemAction({
                                modal: {
                                    type: 'edit',
                                    area: 'manage',
                                    display: 'show'
                                },
                                record: self.record,
                                manage: self.manage,
                                table: self.table,
                                type: 'manage'
                            }, config);
                        }
                    }
                };
                /*请求数据*/
                settingService.getColumnData(self.table, self.record, true);
            } else {
                /*请求数据*/
                settingService.getColumnData(self.table, self.record, false);
            }
        };


        /*分润设置服务--查询分润设置*/
        this.queryProfitList = function () {
            self.profitlist = [{
                active: 'profitactive',
                id: 1,
                name: '默认分润业务'
            }];

            if (self.profitlist.length === 0) {
                self.record.profitid = 1;
            } else {
                self.record.profitid = self.profitlist[0]['id'];
            }
            settingService.queryProfitConfig({
                record: self.record,
                profit: self.profit
            });
        };
        /*分润设置服务--分润配置*/
        this.queryProfitConfig = function () {
            settingService.queryProfitConfig({
                record: self.record,
                profit: self.profit
            });
        };
        /*分润设置服务--切换不同分润配置*/
        this.changeProfit = function (type) {
            settingService.changeProfit({
                type: type,
                profit: self.profit
            });
        };
        /*分润设置服务--设置分润配置*/
        this.settingProfit = function (type) {
            settingService.settingProfit({
                record: self.record,
                profit: self.profit
            }, type);
        };

        /*搜索服务--搜索过滤*/
        this.searchAction = function () {
            /*清除全选*/
            jq_dom.$allstruct.removeClass('sub-menu-checkboxactive');
            /*清除机构模型*/
            self.record.managestruct = {};
            /*清除表单机构关联*/
            self.manage.designatedOrgIds = '';
            /*重置记录*/
            settingService.initRecord(self.record);
            /*初始化加载数据*/
            settingService.getStructList({
                record: self.record
            });
        };
        /*搜索服务--清空过滤条件*/
        this.searchClear = function () {
            self.record.searchname = '';
            self.record.searchactive = '';
        };


    }]);