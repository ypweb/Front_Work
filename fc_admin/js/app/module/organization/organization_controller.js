/*首页控制器*/
angular.module('app')
    .controller('OrganizationController', ['organizationService', function (organizationService) {
        var self = this;

        /*模型--操作权限列表*/
        this.powerlist = organizationService.getCurrentPower();


        /*jquery dom缓存:主要是切换路由时，创建的dom缓存引用与现有的dom引用不一致，需要加载视图更新现有dom引用*/
        var jq_dom = {
            $submenu_scroll_wrap1:$('#submenu_scroll_wrap1'),
            $submenu_scroll_wrap2:$('#submenu_scroll_wrap2'),
            $admin_struct_submenu: $('#admin_struct_submenu'),
            $admin_struct_list: $('#admin_struct_list'),
            $admin_struct_dialog: $('#admin_struct_dialog'),
            $admin_struct_reset: $('#admin_struct_reset'),
            $admin_yystruct_menu: $('#admin_yystruct_menu'),
            $admin_shop_wrap:$('#admin_shop_wrap')
        };
        jq_dom['$admin_submenu_wrap'] = jq_dom.$admin_struct_submenu.prev();
        jq_dom['$admin_yystruct_wrap'] = jq_dom.$admin_yystruct_menu.prev();
        jq_dom['$all_yystruct'] = jq_dom.$admin_yystruct_wrap.find('label');

        var jq_dom_power = {
            $power_colgroup: $('#struct_power_colgroup'),
            $power_thead: $('#struct_power_thead'),
            $power_tbody: $('#struct_power_tbody')
        };
        /*切换路由时更新dom缓存*/
        organizationService.initJQDom(jq_dom);

        /*权限初始化*/
        organizationService.initForPower({
            dom: jq_dom_power,
            isall: true
        });


        /*模型--tab选项卡*/
        this.tabitem = [{
            name: '运营机构',
            href: 'organization',
            power: self.powerlist.organization_add,
            active: 'tabactive'
        }, {
            name: '角色',
            href: 'role',
            power: self.powerlist.role_add,
            active: ''
        }];


        /*模型--机构地址*/
        this.address = {
            province: {},
            city: {},
            country: {}
        };

        /*模型--操作记录*/
        this.record = {
            /*分仓*/
            iscroll_flag1:true/*是否开启滚动条调用*/,
            searchactive1: ''/*搜索激活状态(菜单栏搜索)*/,
            searchname1: ''/*搜索关键词(菜单栏搜索)*/,
            prev1: null/*上一次操作记录*/,
            current1: null/*当前操作记录*/,
            hasdata1: false/*下级是否有数据,或者是否查询到数据*/,
            currentId1: ''/*虚拟挂载点*/,
            currentName1: ''/*虚拟挂载点*/,
            organizationId: ''/*操作id*/,
            organizationName: ''/*操作名称*/,
            layer1: 0/*操作层*/,
            /*运营商*/
            iscroll_flag2:true/*是否开启滚动条调用*/,
            searchactive2: ''/*搜索激活状态(菜单栏搜索)*/,
            searchname2: ''/*搜索关键词(菜单栏搜索)*/,
            prev2: null/*上一次操作记录*/,
            current2: null/*当前操作记录*/,
            hasdata2: false/*下级是否有数据,或者是否查询到数据*/,
            currentId2: ''/*虚拟挂载点*/,
            currentName2: '运营商'/*虚拟挂载点*/,
            carrieroperatorId: ''/*运营商Id*/,
            carrieroperatorName: ''/*运营商Id*/,
            layer2: 0/*操作层*/,
            operator_cache:{
                state:'empty'/*记录当前模型状态*/
            }/*查询运营商label缓存*/,
            operator_shopid:{
                state:'load'
            }/*选中绑定加盟店Ids(店铺)*/,
            operator_shopshow:false/*运营商店铺列表*/
        };


        /*模型--机构数据*/
        this.struct = {
            type: 'add'/*表单类型：新增，编辑；默认为新增*/,
            id: ''/*运营商ID，编辑时相关参数*/,
            sysUserId: ''/*运营商用户ID，编辑时相关参数*/,
            parentId: ''/*上级运营商ID，编辑时相关参数*/,
            fullName: ''/*运营商全称*/,
            shortName: ''/*运营商简称*/,
            linkman: ''/*负责人*/,
            cellphone: ''/*手机号码*/,
            telephone: ''/*电话号码*/,
            province: ''/*省份*/,
            city: ''/*市区*/,
            country: ''/*县区*/,
            address: ''/*详细地址*/,
            isAudited: 0/*是否已审核：0：默认，1：已审核*/,
            status: 0/*状态：0：正常，1：停用*/,
            remark: ''/*备注*/,
            isSettingLogin: 0/*是否设置登陆名及密码：1 :是*/,
            username: ''/*设置登录名*/,
            password: ''/*设置登录密码*/,
            isDesignatedPermit: 0/*是否指定权限,0:全部权限 1:指定权限*/,
            checkedFunctionIds: ''/*选中权限Ids*/,
            bindingShopIds: ''/*选中绑定加盟店Ids*/
        };


        /*初始化服务--虚拟挂载点，或者初始化参数*/
        organizationService.getRoot(self.record);
        /*初始化服务--初始化地址信息*/
        organizationService.queryAddress({
            type: 'province',
            address: self.address,
            model: self.struct
        });


        /*地址服务--选中地址*/
        this.changeAddress = function (model_str, address_str, type) {
            organizationService.queryAddress({
                model: self[model_str],
                address: self[address_str],
                type: type
            });
        };


        /*菜单服务--初始化请求菜单*/
        this.initMenuList = function (type) {
            organizationService.getMenuList({
                record: self.record,
                type: type
            });
        };
        /*菜单服务--子菜单展开*/
        this.toggleMenuList = function (e, type) {
            organizationService.toggleMenuList(e, {
                record: self.record,
                type: type
            });
        };
        /*菜单服务--跳转至虚拟挂载点*/
        this.rootMenuList = function (e,type) {
            organizationService.rootMenuList(e, {
                record: self.record,
                type:type
            });
        };




        /*机构服务--操作机构表单*/
        this.actionStruct = function (config) {
            /*调用编辑机构服务类*/
            organizationService.actionStruct({
                modal: config,
                record: self.record,
                struct: self.struct,
                address: self.address
            });
        };


        /*弹出层显示隐藏*/
        this.toggleModal = function (config) {
            organizationService.toggleModal({
                display: config.display,
                area: config.area
            });
        };


        /*表单服务--提交表单*/
        this.formSubmit = function (type) {
            organizationService.formSubmit({
                struct: self.struct,
                record: self.record
            }, type);
        };
        /*表单服务--重置表单*/
        this.formReset = function (forms, type) {
            /*重置表单模型*/
            organizationService.formReset({
                forms: forms,
                struct: self.struct,
                record: self.record
            }, type);
        };
        /*表单服务--选择登录用户名和密码*/
        this.clearLoginInfo = function () {
            organizationService.clearLoginInfo(self.struct);
        };
        /*表单服务--权限服务--确定所选权限*/
        this.getSelectPower = function () {
            organizationService.getSelectPower(self.struct);
        };
        /*表单服务--权限服务--取消所选权限*/
        this.clearSelectPower = function () {
            organizationService.clearSelectPower(self.struct);
        };
        /*表单服务--权限服务--切换所选权限*/
        this.toggleSelectPower = function () {
            organizationService.toggleSelectPower({
                struct: self.struct,
                record: self.record
            });
        };



        /*运营商服务--绑定运营商*/
        this.bindCheckShop=function () {
            organizationService.bindCheckShop({
                struct:self.struct,
                record:self.record
            });
        };
        /*运营商服务--切换显示隐藏运营商店铺*/
        this.toggleShopShow=function () {
            self.record.operator_shopshow=!self.record.operator_shopshow;
        };
        /*运营商服务--确定所选运营商店铺*/
        this.getSelectShop = function () {
            organizationService.getSelectShop({
                record: self.record,
                struct: self.struct
            });
        };
        /*运营商服务--取消所选运营商*/
        this.clearSelectShop = function () {
            organizationService.clearSelectShop({
                record: self.record,
                struct: self.struct
            });
        };
        /*运营商服务--选中或取消运营商店铺*/
        this.toggleShopCheck = function (e) {
            organizationService.toggleShopCheck(e,{
                record: self.record,
                struct: self.struct
            });
        };



        /*搜索服务--搜索过滤*/
        this.searchAction1 = function () {
            organizationService.getMenuList({
                record: self.record,
                type:'fc'
            });
        };
        /*搜索服务--清空过滤条件*/
        this.searchClear1 = function () {
            self.record.searchname1 = '';
            self.record.searchactive1 = '';
        };
        /*搜索服务--搜索过滤*/
        this.searchAction2 = function () {
            /*清除模型，重置模型*/
            self.record.operator_cache={
                state:'empty'
            };
            jq_dom.$all_yystruct.removeClass('sub-menu-checkboxactive');
            organizationService.getMenuList({
                record: self.record,
                type:'yy'
            });
        };
        /*搜索服务--清空过滤条件*/
        this.searchClear2 = function () {
            self.record.searchname2 = '';
            self.record.searchactive2 = '';
        };

    }]);