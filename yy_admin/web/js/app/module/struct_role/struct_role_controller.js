/*首页控制器*/
angular.module('app')
    .controller('StructroleController', ['structroleService', 'toolUtil', function (structroleService, toolUtil) {
        var self = this;

        /*模型--操作权限列表*/
        this.powerlist = structroleService.getCurrentPower();


        /*jquery dom缓存:主要是切换路由时，创建的dom缓存引用与现有的dom引用不一致，需要加载视图更新现有dom引用*/
        var jq_dom = {
            $admin_struct_submenu: $('#admin_struct_submenu'),
            $admin_rolegroup_dialog: $('#admin_rolegroup_dialog'),
            $admin_role_dialog: $('#admin_role_dialog'),
            $admin_member_dialog: $('#admin_member_dialog'),
            $admin_rolegroup_reset: $('#admin_rolegroup_reset'),
            $admin_role_reset: $('#admin_role_reset'),
            $admin_member_reset: $('#admin_member_reset'),
            $admin_table_checkcolumn: $('#admin_table_checkcolumn'),
            $admin_list_wrap: $('#admin_list_wrap'),
            $admin_list_colgroup: $('#admin_list_colgroup'),
            $admin_batchlist_wrap: $('#admin_batchlist_wrap'),
            $admin_member_checkall: $('#admin_member_checkall'),
            $submenu_scroll_wrap:$('#submenu_scroll_wrap'),
            $admin_member_menu: $('#admin_member_menu'),
            $admin_member_exist:$('#admin_member_exist'),
            $admin_member_checked: $('#admin_member_checked'),
            $admin_user_wrap: $('#admin_user_wrap')
        };
        /*切换路由时更新dom缓存*/
        structroleService.initJQDom(jq_dom);

        /*模型--列表地址*/
        this.list_address = {
            province: {},
            city: {},
            country: {}
        };
        this.list_addressdata = {
            province: '',
            city: '',
            country: ''
        };

        /*模型--操作记录*/
        this.record = {
            iscroll_flag:true/*是否开启滚动条调用*/,
            layer: 0/*当前菜单操作层级*/,
            prev: null/*菜单操作:上一次操作菜单*/,
            current: null/*菜单操作:当前操作菜单*/,
            searchactive1: ''/*搜索激活状态,激活态为：search-content-active，未激活为空，默认为空*/,
            searchname1: ''/*搜索关键词*/,
            searchactive2: ''/*搜索激活状态,激活态为：search-content-active，未激活为空，默认为空*/,
            searchname2: ''/*搜索关键词*/,
            role: ''/*角色id*/,
            rolename: ''/*角色名称*/,
            rolegroup: ''/*角色组id*/,
            rolegroupname: ''/*角色组名称*/,
            currentId: ''/*虚拟挂载点*/,
            currentName: ''/*虚拟挂载点*/,
            checkAll:false/*全选状态*/,
            existmember:{}/*模型--已经存在的机构信息*/
        };


        /*模型--选中的机构信息*/
        this.member = {};


        /*表单模型--角色组*/
        this.rolegroup = {
            id: '',
            type: 'add',
            groupName: ''
        };

        /*表单模型--角色*/
        this.role = {
            id: '',
            type: 'add',
            filter: ''/*过滤数据*/,
            roleName: ''
        };


        /*模型--tab选项卡*/
        this.tabitem = [{
            name: '运营机构',
            href: 'struct',
            power: self.powerlist.organization_add,
            active: ''
        }, {
            name: '角色',
            href: 'role',
            power: self.powerlist.role_add,
            active: 'tabactive'
        }];

        /*模型--btn按钮组*/
        this.btnitem = [{
            name: '添加角色组',
            type: 'rolegroup',
            power: self.powerlist.rolegroup_add,
            icon: 'fa-plus'
        }, {
            name: '添加角色',
            type: 'role',
            power: self.powerlist.role_add,
            icon: 'fa-plus'
        }];


        /*模型--表格缓存*/
        this.table = {
            list1_config: {
                config: {
                    processing: true, /*大消耗操作时是否显示处理状态*/
                    deferRender: true, /*是否延迟加载数据*/
                    autoWidth: true, /*是否*/
                    paging: true,
                    pagingType:'simple_numbers',/*分页按钮排列*/
                    ajax: {
                        url: toolUtil.adaptReqUrl('/role/shops'),
                        dataType: 'JSON',
                        method: 'post',
                        dataSrc: function (json) {
                            var code = parseInt(json.code, 10),
                                message = json.message;

                            if (code !== 0) {
                                if (typeof message !== 'undefined' && message !== '') {
                                    console.log(message);
                                } else {
                                    console.log('获取用户失败');
                                }
                                if (code === 999) {
                                    /*退出系统*/
                                    toolUtil.loginTips({
                                        clear: true,
                                        reload: true
                                    });
                                }
                                (function () {
                                    /*清除已经存在的模型*/
                                    var exist=self.record.existmember;
                                    for(var p in exist){
                                        delete exist[p];
                                    }
                                    jq_dom.$admin_member_exist.html('');
                                }());
                                return [];
                            }
                            var result = json.result;
                            if (typeof result === 'undefined') {
                                (function () {
                                    /*清除已经存在的模型*/
                                    var exist=self.record.existmember;
                                    for(var p in exist){
                                        delete exist[p];
                                    }
                                    jq_dom.$admin_member_exist.html('');
                                }());
                                return [];
                            }

                            if (result) {
                                var list = result.list;
                                (function () {
                                    /*清除已经存在的模型*/
                                    var exist=self.record.existmember;
                                    for(var p in exist){
                                        delete exist[p];
                                    }
                                    jq_dom.$admin_member_exist.html('');
                                }());
                                if (list) {
                                    return list;
                                } else {
                                    return [];
                                }
                            } else {
                                (function () {
                                    /*清除已经存在的模型*/
                                    var exist=self.record.existmember;
                                    for(var p in exist){
                                        delete exist[p];
                                    }
                                    jq_dom.$admin_member_exist.html('');
                                }());
                                return [];
                            }
                        },
                        data: {}
                    },
                    info: true,
                    stateSave:false,/*是否保存重新加载的状态*/
                    dom: '<"g-d-hidei" s> t <"admin-page-wrap g-fs2"<"g-w-percent20 g-f-l" li><"g-w-percent29 g-f-r" p>>',
                    searching: true,
                    order: [[1, "desc"]],
                    columns: [
                        {
                            "data": "id",
                            "orderable": false,
                            "searchable": false,
                            "render": function (data, type, full, meta) {
                                return '<input value="' + data + '" name="check_shopid" type="checkbox" />';
                            }
                        },
                        {
                            "data": "fullName"
                        },
                        {
                            "data": "shortName"
                        },
                        {
                            "data": "name"
                        },
                        {
                            "data": "type",
                            "render": function (data, type, full, meta) {
                                var temptype = parseInt(data, 10),
                                    typemap = {
                                        1: '旗舰店',
                                        2: '体验店',
                                        3: '加盟店'
                                    };
                                return typemap[temptype];
                            }
                        },
                        {
                            "data": "cellphone",
                            "render": function (data, type, full, meta) {
                                var phone=data,
                                    fullname=full.fullName;
                                if(phone){
                                    /*设置已经存在的成员模型*/
                                    self.record.existmember[phone]={
                                        'cellphone':phone,
                                        'label':fullname
                                    };
                                    return toolUtil.phoneFormat(phone);
                                }else{
                                    return '';
                                }

                            }
                        },
                        {
                            "data": "telephone",
                            "render": function (data, type, full, meta) {
                                return toolUtil.telePhoneFormat(data, 4);
                            }
                        },
                        {
                            "data": "province",
                            "render": function (data, type, full, meta) {
                                if (!data) {
                                    return '无省市区';
                                }
                                var str = '',
                                    province = data || '';

                                if (province) {
                                    self.list_addressdata.province = province;
                                    str += '<div class="inline g-c-gray3">省：</div><div class="inline g-c-gray9">' + self.list_address["province"][province]["key"] + '</div>';
                                    /*查询新值*/
                                    /*structroleService.isReqAddress({
                                     model:self.list_addressdata,
                                     address:self.list_address,
                                     type:'city'
                                     },true,function () {
                                     if(city){
                                     str+='<div class="inline g-c-gray3">市：</div><div class="inline g-c-gray9">'+self.list_address["city"][city]["key"]+'</div>';
                                     }
                                     if(country){
                                     str+='<div class="inline g-c-gray3">区：</div><div class="inline g-c-gray9">'+self.list_address["country"][country]["key"]+'</div>';
                                     }
                                     });*/
                                }
                                return str;
                            }
                        },
                        {
                            "data": "address",
                            "render": function (data, type, full, meta) {
                                if (!data) {
                                    return '';
                                }
                                var str = data.toString();
                                return str.slice(0, 10) + '...';
                            }
                        },
                        {
                            "data": "status",
                            "render": function (data, type, full, meta) {
                                var stauts = parseInt(data, 10),
                                    str = '';

                                if (stauts === 0) {
                                    str = '<div class="g-c-blue3">正常</div>';
                                } else if (stauts === 1) {
                                    str = '<div class="g-c-warn">停用</div>';
                                } else {
                                    str = '<div class="g-c-gray6">其他</div>';
                                }
                                return str;
                            }
                        },
                        {
                            "data": "addTime"
                        }
                    ],
                    aLengthMenu: [
                        [10,15,20,30],
                        [10,15,20,30]
                    ],
                    lengthChange:true/*是否可改变长度*/
                }
            },
            list_table: null,
            /*列控制*/
            tablecolumn: {
                init_len: 11/*数据有多少列*/,
                column_flag: true,
                ischeck: true, /*是否有全选*/
                columnshow: true,
                $column_wrap: jq_dom.$admin_table_checkcolumn/*控制列显示隐藏的容器*/,
                $bodywrap: jq_dom.$admin_batchlist_wrap/*数据展现容器*/,
                hide_header:['','店铺全称','店铺简称','姓名','店铺类型','店铺手机号码','店铺电话号码','省市区','详细地址','状态','添加时间'],
                hide_list: [1, 5, 6, 7, 8, 10]/*需要隐藏的的列序号*/,
                hide_len: 6,
                column_api: {
                    isEmpty: function () {
                        if (self.table.list_table === null) {
                            return true;
                        }
                        return self.table.list_table.data().length === 0;
                    }
                },
                $colgroup: jq_dom.$admin_list_colgroup/*分组模型*/,
                $column_btn: jq_dom.$admin_table_checkcolumn.prev(),
                $column_ul: jq_dom.$admin_table_checkcolumn.find('ul')
            },
            /*全选*/
            tablecheckall: {
                checkall_flag: true,
                $bodywrap: jq_dom.$admin_batchlist_wrap,
                $checkall: jq_dom.$admin_member_checkall,
                checkvalue: 0/*默认未选中*/,
                checkid: []/*默认索引数据为空*/,
                checkitem: []/*默认node数据为空*/,
                highactive: 'item-lightenbatch',
                checkactive: 'admin-batchitem-checkactive'
            }
        };


        /*初始化服务--虚拟挂载点，或者初始化参数*/
        structroleService.getMemberRoot(self.record);
        /*初始化服务--初始化地址信息*/
        structroleService.queryAddress({
            type: 'province',
            address: self.list_address,
            model: self.list_addressdata
        });


        /*菜单服务--初始化*/
        this.initSubMenu = function () {
            structroleService.queryRoleGroup({
                record: self.record
            });
            structroleService.getColumnData({
                table:self.table,
                id:self.record.role
            });
        };
        /*菜单服务--查询角色组*/
        this.queryRoleGroup = function () {
            structroleService.queryRoleGroup({
                record: self.record
            });
        };
        /*菜单服务--显示隐藏菜单*/
        this.toggleSubMenu = function (e) {
            structroleService.toggleSubMenu(e, {
                table: self.table,
                record: self.record
            });
        };


        /*角色服务--添加角色或角色组*/
        this.addRole = function (type) {
            structroleService.addRole({
                table: self.table,
                record: self.record,
                rolegroup: self.rolegroup,
                role: self.role
            }, type);
        };
        /*角色服务--编辑角色或角色组*/
        this.editRole = function () {
            structroleService.editRole({
                table: self.table,
                record: self.record,
                rolegroup: self.rolegroup,
                role: self.role
            });
        };
        /*角色服务--删除角色或角色组*/
        this.deleteRole = function () {
            structroleService.deleteRole({
                table: self.table,
                record: self.record,
                rolegroup: self.rolegroup,
                role: self.role
            });
        };


        /*成员服务--移除成员*/
        this.deleteMemberList = function () {
            structroleService.deleteMemberList(self.record, self.table);
        };
        /*成员服务--查询用户*/
        this.checkMemberList = function (e) {
            structroleService.checkMemberList(e,{
                record:self.record,
                member:self.member
            });
        };
        /*成员服务--取消选中用户*/
        this.cancelMemberList=function (e) {
            structroleService.cancelMemberList(e,{
                record:self.record,
                member:self.member
            });
        };
        /*成员服务--全选数据*/
        this.checkAllMember=function () {
            structroleService.checkAllMember({
                record:self.record,
                member:self.member
            });
        };
        /*成员服务--过滤数据*/
        this.filterDataTable = function () {
            structroleService.filterDataTable(self.table, self.role);
        };

        
        

        /*机构服务--加载机构角色*/
        this.getMemberList = function () {
            if (self.record.searchname2==='') {
                structroleService.getMemberList({
                    type: 'init',
                    record: self.record
                });
            }
        };
        /*机构服务--加载机构角色*/
        this.initMemberList = function () {
            structroleService.getMemberList({
                type: 'init',
                record: self.record
            });
        };
        /*机构服务--显示隐藏*/
        this.toggleMemberList = function (e) {
            structroleService.toggleMemberList(e, {
                member: self.member,
                record: self.record
            });
        };


        /*弹出层显示隐藏*/
        this.toggleModal = function (config) {
            structroleService.toggleModal(config);
        };


        /*表单服务--提交表单*/
        this.formSubmit = function (type) {
            structroleService.formSubmit({
                role: self.role,
                rolegroup: self.rolegroup,
                table: self.table,
                record: self.record,
                member: self.member
            }, type);
        };
        /*表单服务--重置表单*/
        this.formReset = function (forms, type) {
            /*重置表单模型*/
            structroleService.formReset({
                forms: forms,
                role: self.role,
                rolegroup: self.rolegroup,
                member: self.member,
                record:self.record
            }, type);
        };


        /*搜索服务--搜索过滤*/
        this.searchAction1 = function () {
            console.log('search');
        };
        /*搜索服务--清空过滤条件*/
        this.searchClear1 = function () {
            self.record.searchname1 = '';
            self.record.searchactive1 = '';
        };
        /*搜索服务--搜索过滤*/
        this.searchAction2 = function () {
            structroleService.getMemberList({
                type: 'search',
                record: self.record
            });
        };
        /*搜索服务--清空过滤条件*/
        this.searchClear2 = function () {
            self.record.searchname2 = '';
            self.record.searchactive2 = '';
        };


    }]);