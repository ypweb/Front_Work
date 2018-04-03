/*首页控制器*/
angular.module('app')
    .controller('StructController', ['structService','powerService',function(structService,powerService){
        var self=this;

        /*模型--tab选项卡*/
        this.tabitem=[{
            name:'运营架构',
            href:'struct',
            active:'tabactive'
        },{
            name:'角色',
            href:'role',
            active:''
        }];


        /*模型--虚拟挂载点*/
        this.root=structService.getRoot();

        /*模型--权限*/
        this.power={
            colgroup:'',
            thead:'',
            tbody:''
        };

        /*模型--搜索*/
        this.search={
            searchactive:'',
            orgname:''
        };

        /*模型--编辑设置*/
        this.edit={
            editstate:false,
            id:'',
            layer:'',
            orgname:''
        };

        /*模型--机构设置*/
        this.setting={
            add_substruct_state:false,
            adjust_pos_state:false,
            id:'',/*父级id*/
            orgname:'',/*父级orgname*/
            c_id:'',/*当前id*/
            c_orgname:''/*当前orgname*/
        };

        /*模型--机构数据*/
        this.struct={
            type:'add'/*表单类型：新增，编辑；默认为新增*/,
            orgname:''/*机构名称*/,
            comname:''/*公司名称*/,
            linkman:''/*负责人*/,
            cellphone:''/*手机号码*/,
            address:''/*联系地址*/,
            operatingArea:''/*运营地区*/,
            remark:''/*备注*/,
            isSettingLogin:''/*是否设置登陆名及密码1 :是*/,
            username:''/*设置登录名*/,
            password:''/*设置登录密码*/,
            isDesignatedPermit:''/*是否指定权限,1:指定*/,
            checkedFunctionIds:''/*选中权限Ids*/,
            sysUserId:''/*编辑时相关参数*/,
            id:''/*编辑时相关参数*/,
            parentId:''/*编辑时相关参数*/
        };


        /*模型--菜单加载*/
        this.menuitem={
            prev:null,
            current:null
        };

        /*初始化加载，事件绑定*/
        if(this.root){
            /*初始化模型*/
            powerService.createThead({
                flag:true
            },this.power);

            this.setting.id=this.root.id;
            this.setting.orgname=this.root.orgname;


            /*搜索过滤*/
            this.searchAction=function (e) {
                var kcode=window.event?e.keyCode:e.which;

                if(self.search.orgname===''){
                    self.search.searchactive='';
                }else{
                    self.search.searchactive='search-content-active';
                }
                if(kcode===13){
                    structService.getMenuList({
                        search:self.search.orgname,
                        setting:self.setting,
                        type:'search'
                    });
                }
            };
            /*清空过滤条件*/
            this.searchClear=function () {
                self.search.orgname='';
                self.search.searchactive='';
            };


            /*初始化子菜单加载*/
            this.initSubMenu=function () {
                structService.getMenuList({
                    search:self.search.orgname,
                    setting:self.setting
                });
            };
            /*子菜单展开*/
            this.toggleSubMenu=function (e) {
                e.preventDefault();
                e.stopPropagation();

                var target=e.target,
                    node=target.nodeName.toLowerCase();
                if(node==='ul'||node==='li'){
                    return false;
                }
                var $this=$(target),
                    haschild=$this.hasClass('sub-menu-title'),
                    $child,
                    isrequest=false,
                    temp_layer,
                    temp_id,
                    islayer;

                /*激活高亮*/
                if(self.menuitem.current===null){
                    self.menuitem.current=$this;
                }else{
                    self.menuitem.prev=self.menuitem.current;
                    self.menuitem.current=$this;
                    self.menuitem.prev.removeClass('sub-menuactive');
                }
                self.menuitem.current.addClass('sub-menuactive');

                /*变更模型*/
                temp_layer=$this.attr('data-layer');
                temp_id=$this.attr('data-id');
                self.edit.layer=temp_layer;
                self.edit.id=temp_id;
                self.edit.editstate=true;
                self.edit.orgname=$this.attr('data-label');

                /*查询子集*/
                if(haschild){
                    $child=$this.next();
                    if($child.hasClass('g-d-showi')){
                        /*隐藏*/
                        $child.removeClass('g-d-showi');
                        $this.removeClass('sub-menu-titleactive');
                        /*是否已经加载过数据*/
                        isrequest=$this.attr('data-isrequest');
                        if(isrequest){
                            /*清空隐藏节点数据*/
                            structService.initOperate({
                                data:'',
                                id:temp_id,
                                setting:self.setting
                            });
                        }
                    }else{
                        /*显示*/
                        isrequest=$this.attr('data-isrequest');
                        if(isrequest==='false'){
                            /*重新加载*/
                            /*获取非根目录数据*/
                            structService.getMenuList({
                                search:self.search.orgname,
                                $reqstate:$this,
                                setting:self.setting
                            });
                        }else if(isrequest==='true'){
                            /*已加载的直接遍历存入操作区域*/
                            if(haschild){
                                var data=$child.find('>li >a'),
                                    list=[],
                                    len=data.size();
                                if(len!==0){
                                    /*有数据节点*/
                                    data.each(function () {
                                        var citem=$(this),
                                            orgname=citem.attr('data-label'),
                                            id=citem.attr('data-id');
                                        list.push({
                                            orgname:orgname,
                                            id:id
                                        });
                                    });
                                    structService.initOperate({
                                        data:list,
                                        layer:temp_layer,
                                        id:temp_id,
                                        setting:self.setting
                                    });
                                }else{
                                    /*无数据节点*/
                                    temp_layer=$this.attr('layer');
                                    islayer=structService.validSubMenuLayer(temp_layer);
                                    if(islayer){
                                        /*其他节点*/
                                        structService.initOperate({
                                            data:'',
                                            id:temp_id,
                                            setting:self.setting
                                        });
                                    }else{
                                        /*错误节点*/
                                        structService.initOperate({
                                            data:null,
                                            setting:self.setting
                                        });
                                    }
                                }
                            }
                        }
                        $child.addClass('g-d-showi');
                        $this.addClass('sub-menu-titleactive');
                    }
                }else{
                    /*没有子节点，同时节点层次未达到极限值*/
                    temp_layer=$this.attr('data-layer');
                    islayer=structService.validSubMenuLayer(temp_layer);
                    if(islayer){
                        /*其他节点*/
                        structService.initOperate({
                            data:'',
                            id:temp_id,
                            setting:self.setting
                        });
                    }else{
                        /*错误节点*/
                        structService.initOperate({
                            data:null,
                            setting:self.setting
                        });
                    }
                }


                setTimeout(function () {
                    console.log(self.setting);
                },100);
            };


            /*跳转到虚拟挂载点*/
            this.rootSubMenu=function (e) {
                var $this=$(e.target),
                    $child=$this.next();

                var data=$child.find('>li >a'),
                    list=[],
                    len=data.size();
                if(len!==0){
                    data.each(function () {
                        var citem=$(this),
                            orgname=citem.attr('data-label'),
                            id=citem.attr('data-id');
                        list.push({
                            orgname:orgname,
                            id:id
                        });
                    });
                    structService.initOperate({
                        data:list,
                        layer:0,
                        id:self.root.id,
                        orgname:self.root.orgname,
                        setting:self.setting
                    });
                }

                /*清除高亮模型*/
                if(this.menuitem.prev!==null){
                    this.menuitem.prev.removeClass('sub-menuactive');
                    this.menuitem.prev=null;
                }
                if(this.menuitem.current!==null){
                    this.menuitem.current.removeClass('sub-menuactive');
                    this.menuitem.current=null;
                }

                /*更新编辑模型*/
                this.edit.editstate=false;
                this.edit.id=this.root.id;
                this.edit.layer=0;
                this.edit.orgname=this.root.orgname;
            };


            /*机构列表--展开*/
            this.toggleStructList=function (e) {
                e.preventDefault();

                var target=e.target,
                    node=target.nodeName.toLowerCase(),
                    isreload=true;
                if(node==='span'){
                    var $span=$(target),
                        $item=$span.parent(),
                        $ul,
                        haschild='',
                        isrequest=false;

                    /*数据状态*/
                    isreload=$item.hasClass('ts-reload');
                    if(isreload){
                        var id=$span.attr('data-id');
                        /*显示*/
                        isrequest=$span.attr('data-isrequest');
                        if(isrequest==='false'){
                            /*重新加载*/
                            $ul=$item.find('ul');
                            /*获取非根目录数据*/
                            structService.getOperateList({
                                search:self.search.orgname,
                                $reqstate:$span,
                                $li:$item,
                                id:id,
                                $wrap:$ul
                            });
                        }
                    }else{
                        haschild=$item.hasClass('ts-child');
                        if(haschild){
                            if($item.hasClass('ts-active')){
                                /*隐藏*/
                                $item.removeClass('ts-active');
                            }else{
                                /*显示*/
                                $item.addClass('ts-active');
                            }
                        }
                    }
                    return false;
                }else if(node==='li'){
                    var $li=$(target);
                    if($li.hasClass('ts-adjustpos')){
                        $li.removeClass('ts-adjustpos');
                        /*同步模型*/
                        this.setting.c_id='';
                        this.setting.c_orgname='';
                    }else{
                        $li.addClass('ts-adjustpos').siblings().removeClass('ts-adjustpos');
                        if(typeof $li.attr('data-layer')==='undefined'){
                            var $pli=$li.parent().parent();
                            $pli.removeClass('ts-adjustpos').siblings().removeClass('ts-adjustpos');
                        }else{
                            $li.find('li').each(function () {
                                this.className='';
                            });
                        }
                        /*同步模型*/
                        this.setting.c_id=$li.attr('data-id');
                        this.setting.c_orgname=$li.attr('data-label');
                    }
                }

                setTimeout(function () {
                    console.log(self.setting);
                },100);
            };
            /*操作机构表单*/
            this.actionStruct=function (config) {
                if(config.type){
                    /*调用编辑机构服务类*/
                    structService.actionStruct({
                        modal:config,
                        setting:self.setting,
                        struct:self.struct,
                        power:self.power
                    });
                }
            };
            /*选择登录用户名和密码*/
            this.changeLogin=function () {
                /*设置登录名和密码*/
                self.struct.username='';
                self.struct.password='';
            };
            /*表单重置*/
            this.structReset=function (forms){
                /*重置表单模型*/
                structService.clearFormData(self.struct);
                /*重置权限信息*/
                this.clearSelectPower();
                /*重置验证提示信息*/
                structService.clearFormValid(forms);
            };
            /*提交表单*/
            this.structSubmit=function () {
                /*提交服务*/
                structService.structSubmit(self.struct,self.setting,self.search);

            };


            /*弹出层显示隐藏*/
            this.toggleModal=function (config) {
                structService.toggleModal({
                    display:config.display,
                    area:config.area
                });
            };

            
            /*全选权限*/
            this.selectAllPower=function (e) {
                powerService.selectAllPower(e);
            };
            /*确定所选权限*/
            this.getSelectPower=function () {
                var temppower=powerService.getSelectPower();
                if(temppower){
                    this.struct.checkedFunctionIds=temppower.join();
                }else{
                   this.struct.checkedFunctionIds='';
                }
            };
            /*取消所选权限*/
            this.clearSelectPower=function () {
                self.struct.checkedFunctionIds='';
                powerService.clearSelectPower();
            };
        }




    }]);