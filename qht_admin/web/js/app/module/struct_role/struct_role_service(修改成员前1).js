angular.module('app')
    .service('structroleService',['toolUtil','toolDialog','BASE_CONFIG','loginService','powerService','dataTableColumnService','dataTableCheckAllService','dataTableItemActionService','$timeout','$sce',function(toolUtil,toolDialog,BASE_CONFIG,loginService,powerService,dataTableColumnService,dataTableCheckAllService,dataTableItemActionService,$timeout,$sce){

        /*获取缓存数据*/
        var self=this,
            module_id=10/*模块id*/,
            cache=loginService.getCache(),
            rolegroupform_reset_timer=null,
            roleform_reset_timer=null,
            memberform_reset_timer=null;

        var powermap=powerService.getCurrentPower(module_id);

        /*初始化权限*/
        var init_power={
            structadd:toolUtil.isPower('organization-add',powermap,true)/*添加机构*/,
            roleadd:toolUtil.isPower('role-add',powermap,true)/*添加角色*/,
            roleedit:toolUtil.isPower('role-edit',powermap,true)/*编辑角色*/,
            rolegroupadd:toolUtil.isPower('rolegroup-add',powermap,true)/*添加角色组*/,
            memberadd:toolUtil.isPower('member-add',powermap,true)/*添加成员*/,
            memberdelete:toolUtil.isPower('member-delete',powermap,true)/*移除成员*/
        };




        /*扩展服务--初始化jquery dom节点*/
        this.initJQDom=function (dom) {
            if(dom){
                /*复制dom引用*/
                for(var i in dom){
                    self[i]=dom[i];
                }
            }
        };
        /*扩展服务--查询操作权限*/
        this.getCurrentPower=function () {
            return init_power;
        };


        /*导航服务--查询角色组*/
        this.queryRoleGroup=function (config) {
            if(cache){
                var param=$.extend(true,{},cache.loginMap.param);
                /*更新操作记录模型*/
                self.resetRecordMode(config.record,'rolegroup');
                /*请求数据*/
                toolUtil
                    .requestHttp({
                        url:'/rolegroup/list',
                        method:'post',
                        set:true,
                        data:param
                    })
                    .then(function(resp){
                            var data=resp.data,
                                status=parseInt(resp.status,10);

                            if(status===200){
                                var code=parseInt(data.code,10),
                                    message=data.message;
                                if(code!==0){
                                    if(typeof message !=='undefined'&&message!==''){
                                        console.log(message);
                                    }

                                    if(code===999){
                                        /*退出系统*/
                                        cache=null;
                                        toolUtil.loginTips({
                                            clear:true,
                                            reload:true
                                        });
                                    }
                                }else{
                                    /*加载数据*/
                                    var result=data.result;
                                    if(typeof result!=='undefined'){
                                        var list=result.list,
                                            str='';
                                        if(list){
                                            var len=list.length;
                                            if(len===0){
                                                self.$admin_struct_submenu.html('<li><a data-layer="1" data-isrequest="true" data-role="" data-rolegroup="">暂无数据</a></li>');
                                            }else{
                                                /*数据集合，最多嵌套层次*/
                                                str=self.resolveMenuList(list,BASE_CONFIG.submenulimit - 4,{
                                                    layer:0,
                                                    type:'rolegroup'
                                                });
                                                if(str!==''){
                                                    $(str).appendTo(self.$admin_struct_submenu.html(''));
                                                }
                                            }
                                        }else{
                                            /*填充子数据到操作区域,同时显示相关操作按钮*/
                                            self.$admin_struct_submenu.html('<li><a data-layer="1" data-isrequest="true" data-role="" data-rolegroup="">暂无数据</a></li>');
                                        }
                                    }else{
                                        self.$admin_struct_submenu.html('<li><a data-layer="1" data-isrequest="true" data-role="" data-rolegroup="">暂无数据</a></li>');
                                    }
                                }
                            }
                        },
                        function(resp){
                            var message=resp.data.message;
                            if(typeof message !=='undefined'&&message!==''){
                                console.log(message);
                            }else{
                                console.log('请求菜单失败');
                            }
                            self.$admin_struct_submenu.html('<li><a data-layer="1" data-isrequest="true" data-role="" data-rolegroup="">暂无数据</a></li>');
                        });
            }else{
                /*退出系统*/
                cache=null;
                toolUtil.loginTips({
                    clear:true,
                    reload:true
                });
            }
        };
        /*导航服务--查询角色组*/
        this.queryRole=function (config,dom) {
            if(cache){
                /*模型缓存*/
                var record=config.record;

                /*组合参数*/
                var param=$.extend(true,{},cache.loginMap.param);
                param['groupId']=record['rolegroup'];

                toolUtil
                    .requestHttp({
                        url:'/role/list',
                        method:'post',
                        set:true,
                        data:param
                    })
                    .then(function(resp){
                            var data=resp.data,
                                status=parseInt(resp.status,10);

                            if(status===200){
                                var code=parseInt(data.code,10),
                                    message=data.message;
                                if(code!==0){
                                    if(typeof message !=='undefined'&&message!==''){
                                        console.log(message);
                                    }

                                    if(code===999){
                                        /*退出系统*/
                                        cache=null;
                                        toolUtil.loginTips({
                                            clear:true,
                                            reload:true
                                        });
                                    }
                                }else{
                                    /*加载数据*/
                                    var result=data.result;
                                    if(typeof result!=='undefined'){
                                        var list=result.list,
                                            str='';
                                        if(list){
                                            var len=list.length;
                                            if(len===0){
                                                /*设置父元素状态*/
                                                dom.$a.attr({
                                                    'data-isrequest':true
                                                }).removeClass('sub-menu-title sub-menu-titleactive');
                                            }else{
                                                /*数据集合，最多嵌套层次*/
                                                str=self.resolveMenuList(list,BASE_CONFIG.submenulimit - 4,{
                                                    layer:1,
                                                    type:'role'
                                                });
                                                if(str!==''){
                                                    /*设置子元素*/
                                                    $(str).appendTo(dom.$ul.html(''));
                                                }
                                                /*设置父元素状态*/
                                                dom.$a.attr({
                                                    'data-isrequest':true
                                                });
                                            }
                                        }else{
                                            /*设置父元素状态*/
                                            dom.$a.attr({
                                                'data-isrequest':true
                                            }).removeClass('sub-menu-title sub-menu-titleactive');
                                        }
                                    }else{
                                        /*设置父元素状态*/
                                        dom.$a.attr({
                                            'data-isrequest':true
                                        }).removeClass('sub-menu-title sub-menu-titleactive');
                                    }
                                }
                            }
                        },
                        function(resp){
                            var message=resp.data.message;
                            if(typeof message !=='undefined'&&message!==''){
                                console.log(message);
                            }else{
                                console.log('请求菜单失败');
                            }
                            /*设置父元素状态*/
                            dom.$a.attr({
                                'data-isrequest':true
                            }).removeClass('sub-menu-title sub-menu-titleactive');
                        });
            }else{
                /*退出系统*/
                cache=null;
                toolUtil.loginTips({
                    clear:true,
                    reload:true
                });
            }
        };
        /*导航服务--解析导航--开始解析*/
        this.resolveMenuList=function (obj,limit,config) {
            if(!obj||typeof obj==='undefined'){
                return false;
            }
            if(typeof limit==='undefined'||limit<=0){
                limit=1;
            }
            var menulist=obj,
                str='',
                i=0,
                len=menulist.length,
                layer=config.layer;

            layer++;

            if(limit>=1 && layer>limit){
                /*如果层级达到设置的极限清除相关*/
                return false;
            }



            if(len!==0){
                for(i;i<len;i++){
                    var curitem=menulist[i];
                    /*到达极限的前一项则不创建子菜单容器*/
                    if(limit>=1 && layer>=limit){
                        str+=self.doItemMenuList(curitem,{
                                flag:false,
                                limit:limit,
                                layer:layer,
                                type:config.type
                            })+'</li>';
                    }else{
                        str+=self.doItemMenuList(curitem,{
                                flag:true,
                                limit:limit,
                                layer:layer,
                                type:config.type
                            })+'<ul></ul></li>';
                    }
                }
                return str;
            }else{
                return false;
            }
        };
        /*导航服务--解析导航--公共解析*/
        this.doItemMenuList=function (obj,config) {
            var curitem=obj,
                type=config.type,
                label='',
                role='',
                rolegroup='',
                str='',
                flag=config.flag,
                layer=config.layer;

            if(type==='role'){
                label=curitem["roleName"];
                role=curitem['id'];
            }else if(type==='rolegroup'){
                label=curitem["groupName"];
                rolegroup=curitem['id'];
            }

            if(flag){
                str='<li><a data-isrequest="false" data-role="'+role+'" data-layer="'+layer+'" data-rolegroup="'+rolegroup+'" class="sub-menu-title" href="#" title="">'+label+'</a>';
            }else{
                str='<li><a data-role="'+role+'" data-layer="'+layer+'" data-rolegroup="'+rolegroup+'" href="#" title="">'+label+'</a></li>';
            }

            return str;
        };
        /*导航服务--显示隐藏菜单*/
        this.toggleSubMenu=function (e,config) {
            /*阻止冒泡和默认行为*/
            e.preventDefault();
            e.stopPropagation();

            /*过滤对象*/
            var target=e.target,
                node=target.nodeName.toLowerCase();
            if(node==='ul'||node==='li'){
                return false;
            }
            var $this=$(target),
                haschild,
                $child,
                isrequest=false,
                temp_layer,
                temp_role,
                temp_rolegroup,
                temp_label;


            /*模型缓存*/
            var record=config.record;

            /*变更操作记录模型--激活高亮*/
            if(record.current===null){
                record.current=$this;
            }else{
                record.prev=record.current;
                record.current=$this;
                record.prev.removeClass('sub-menuactive');
            }
            record.current.addClass('sub-menuactive');
            
            
            temp_layer=parseInt($this.attr('data-layer'),10);
            temp_label=$this.html();
            

            record.layer=temp_layer;
            if(temp_layer===1){
                /*操作角色组层*/
                temp_rolegroup=$this.attr('data-rolegroup');
                /*变更操作记录模型--设置角色组*/
                record.role='';
                record.rolename='';
                record.member='';
                record.membername='';
                record.rolegroup=temp_rolegroup;
                record.rolegroupname=temp_label;

                /*查询子集*/
                haschild=$this.hasClass('sub-menu-title');
                if(haschild){
                    $child=$this.next();
                    /*切换显示隐藏*/
                    $child.toggleClass('g-d-showi');
                    $this.toggleClass('sub-menu-titleactive');
                    /*是否已经加载过数据*/
                    isrequest=$this.attr('data-isrequest');
                    if(isrequest==='false'){
                        /*重新加载*/
                        self.queryRole(config,{
                            $ul:$child,
                            $a:$this
                        });
                    }
                }
            }else if(temp_layer===2){
                /*操作角色层*/
                temp_role=$this.attr('data-role');
                /*变更操作记录模型--设置角色*/
                record.member='';
                record.membername='';
                record.role=temp_role;
                record.rolename=temp_label;
            }
            /*渲染右侧*/
            self.renderOperate(config);



        };
        /*导航服务--渲染右侧展现*/
        this.renderOperate=function (config) {
            
        };


        /*模型服务--重置操作记录模型*/
        this.resetRecordMode=function (record,type) {
            if(!record && typeof type!=='undefined'){
                return false;
            }

            if(type==='all'){
                /*重置所有*/
                record={
                    layer:0,
                    prev:null,
                    current:null,
                    searchactive:'',
                    searchname:'',
                    role:'',
                    rolename:'',
                    rolegroup:'',
                    rolegroupname:'',
                    member:'',
                    membername:''
                };
            }else if(type==='rolegroup'){
                record['rolegroup']='';
                record['rolegroupname']='';
                record['role']='';
                record['rolename']='';
                record['layer']=0;
                record['member']='';
                record['membername']='';
                if(record['prev']!==null){
                    record['prev']=null;
                }
                if(record['current']!==null){
                    record['current']=null;
                }
            }else if(type==='role'){
                record['role']='';
                record['rolename']='';
                record['member']='';
                record['membername']='';
                record['layer']=1;
            }else if(type==='member'){
                record['member']='';
                record['membername']='';
            }
        };


        /*弹出层服务*/
        this.toggleModal=function (config,fn) {
            var temp_timer=null,
                type_map={
                    'member':self.$admin_member_dialog,
                    'role':self.$admin_role_dialog,
                    'rolegroup':self.$admin_rolegroup_dialog
                };
            if(config.display==='show'){
                if(typeof config.delay!=='undefined'){
                    temp_timer=setTimeout(function () {
                        type_map[config.area].modal('show',{backdrop:'static'});
                        clearTimeout(temp_timer);
                        temp_timer=null;
                    },config.delay);
                    if(fn&&typeof fn==='function'){
                        fn.call(null);
                    }
                }else{
                    type_map[config.area].modal('show',{backdrop:'static'});
                    if(fn&&typeof fn==='function'){
                        fn.call(null);
                    }
                }
            }else if(config.display==='hide'){
                if(typeof config.delay!=='undefined'){
                    temp_timer=setTimeout(function () {
                        type_map[config.area].modal('hide');
                        clearTimeout(temp_timer);
                        temp_timer=null;
                    },config.delay);
                }else{
                    type_map[config.area].modal('hide');
                }
                /*清除延时任务序列*/
                if(config.area==='role' || config.area==='rolegroup' || config.area==='member'){
                    self.clearFormDelay();
                }
            }
        };



        /*表单类服务--执行延时任务序列*/
        this.addFormDelay=function (config) {
            /*映射对象*/
            var type=config.type,
                /*value=config.value,
                mode=config.mode,*/
                type_map={
                    'rolegroup':{
                        'timeid':rolegroupform_reset_timer,
                        'dom':self.$admin_rolegroup_reset
                    },
                    'role':{
                        'timeid':roleform_reset_timer,
                        'dom':self.$admin_role_reset
                    },
                    'member':{
                        'timeid':memberform_reset_timer,
                        'dom':self.$admin_member_reset
                    }
                };
            /*执行延时操作*/
            type_map[type]['timeid']=$timeout(function(){
                /*触发重置表单*/
                type_map[type]['dom'].trigger('click');
                /*设置模型*/
                /*if(typeof mode!=='undefined' && typeof value!=='undefined'){
                    mode.type=value;
                }*/
            },0);
        };
        /*表单类服务--清除延时任务序列*/
        this.clearFormDelay=function (did) {
            if(did  &&  did!==null){
                $timeout.cancel(did);
                did=null;
            }else{
                /*如果存在延迟任务则清除延迟任务*/
                if(roleform_reset_timer!==null){
                    $timeout.cancel(roleform_reset_timer);
                    roleform_reset_timer=null;
                }
                if(rolegroupform_reset_timer!==null){
                    $timeout.cancel(rolegroupform_reset_timer);
                    rolegroupform_reset_timer=null;
                }
                if(memberform_reset_timer!==null){
                    $timeout.cancel(memberform_reset_timer);
                    memberform_reset_timer=null;
                }
            }
        };
        /*表单类服务--清空表单模型数据*/
        this.clearFormData=function (data,type) {
            if(!data){
                return false;
            }
            if(typeof type!=='undefined' && type!==''){
                /*特殊情况*/
                /*to do*/
            }else {
                /*重置机构数据模型*/
                for(var i in data){
                    if(i==='type'){
                        /*操作类型为新增*/
                        data[i]='add';
                    }else{
                        data[i]='';
                    }
                }
            }
        };
        /*表单类服务--重置表单数据*/
        this.clearFormValid=function (forms) {
            if(forms){
                var temp_cont=forms.$$controls;
                if(temp_cont){
                    var len=temp_cont.length,
                        i=0;
                    forms.$dirty=false;
                    forms.$invalid=true;
                    forms.$pristine=true;
                    forms.valid=false;

                    if(len!==0){
                        for(i;i<len;i++){
                            var temp_item=temp_cont[i];
                            temp_item['$dirty']=false;
                            temp_item['$invalid']=true;
                            temp_item['$pristine']=true;
                            temp_item['$valid']=false;
                        }
                    }
                }
            }
        };
        /*表单服务类--重置表单*/
        this.formReset=function (config,type) {
            if(type ==='role' || type ==='rolegroup' || type ==='member'){
                /*重置模型*/
                self.clearFormData(config[type]);
                /*重置提示信息*/
                self.clearFormValid(config.forms);
            }else{
                /*特殊情况*/
                /*to do*/
            }
        };
        /*表单服务类--提交表单*/
        this.formSubmit=function (config,type) {
            if(cache){
                var action='',
                    param=$.extend(true,{},cache.loginMap.param),
                    req_config={
                        method:'post',
                        set:true
                    },
                    tip_map={
                        'add':'新增',
                        'edit':'编辑',
                        'role':'角色',
                        'rolegroup':'角色组',
                        'member':'成员'
                    },
                    temp_value='';

                /*适配参数*/
                if(type==='role'){
                    delete param['organizationId'];
                    /*判断是新增还是修改*/
                    if(config[type]['id']===''){
                        action='add';
                        param['roleName']=config[type]['roleName'];
                        param['groupId']=config['record']['rolegroup'];

                        req_config['url']='/role/add';
                    }else{
                        action='edit';
                        temp_value=config[type]['roleName'];

                        param['roleName']=temp_value;
                        param['id']=config[type]['id'];

                        req_config['url']='/role/update';
                    }
                }else if(type==='rolegroup'){
                    /*判断是新增还是修改*/
                    if(config[type]['id']===''){
                        action='add';
                        param['groupName']=config[type]['groupName'];

                        req_config['url']='/rolegroup/add';
                    }else{
                        action='edit';
                        temp_value=config[type]['groupName'];

                        param['groupName']=temp_value;
                        param['id']=config[type]['id'];

                        req_config['url']='/rolegroup/update';
                    }

                }else if(type==='member'){
                    delete param['organizationId'];
                    if(config[type]['id']===''){
                        action='add';
                        param['userIds']=config[type]['id'];
                        param['roleId']=config['rocord']['role'];

                        req_config['url']='/role/users/add';
                    }else{
                        action='edit';
                        /*to do*/
                        console.log('to do');
                        return false;
                    }
                }
                req_config['data']=param;

                toolUtil
                    .requestHttp(req_config)
                    .then(function(resp){
                            var data=resp.data,
                                status=parseInt(resp.status,10);

                            if(status===200){
                                var code=parseInt(data.code,10),
                                    message=data.message;
                                if(code!==0){
                                    if(typeof message !=='undefined' && message!==''){
                                        toolDialog.show({
                                            type:'warn',
                                            value:message
                                        });
                                    }else{
                                        toolDialog.show({
                                            type:'warn',
                                            value:tip_map[action]+tip_map[type]+'失败'
                                        });
                                    }
                                    if(code===999){
                                        /*退出系统*/
                                        cache=null;
                                        toolUtil.loginTips({
                                            clear:true,
                                            reload:true
                                        });
                                    }
                                    return false;
                                }else{
                                    /*操作成功即加载数据*/
                                    /*to do*/
                                    if(action==='add'){
                                        /*重新加载侧边栏数据*/
                                        self.queryRoleGroup(config);
                                    }else if(action==='edit'){
                                        /*更新侧边栏数据*/
                                        if(config.record.current!==null){
                                            config.record.current.html(temp_value);
                                        }
                                        config.record[type+'name']=temp_value;
                                    }
                                    /*重置表单*/
                                    self.addFormDelay({
                                        type:type
                                    });
                                    /*提示操作结果*/
                                    toolDialog.show({
                                        type:'succ',
                                        value:tip_map[action]+tip_map[type]+'成功'
                                    });
                                    /*弹出框隐藏*/
                                    self.toggleModal({
                                        display:'hide',
                                        area:type,
                                        delay:1000
                                    });
                                }
                            }
                        },
                        function(resp){
                            var message=resp.data.message;
                            if(typeof message !=='undefined'&&message!==''){
                                toolDialog.show({
                                    type:'warn',
                                    value:message
                                });
                            }else{
                                toolDialog.show({
                                    type:'warn',
                                    value:tip_map[action]+tip_map[type]+'失败'
                                });
                            }
                        });
            }else{
                /*退出系统*/
                cache=null;
                toolUtil.loginTips({
                    clear:true,
                    reload:true
                });
            }
        };



        /*角色服务--添加角色或角色组*/
        this.addRole=function (config,type) {
            if(cache){
                if(type==='role'){
                    /*添加角色*/
                    if(config.record.rolegroup===''){
                        toolDialog.show({
                            type:'warn',
                            value:'不存在角色组，请先添加角色组'
                        });
                        return false;
                    }
                    /*显示角色弹窗*/
                    self.toggleModal({
                        display:'show',
                        area:type
                    });
                }else if(type==='rolegroup'){
                    /*添加角色组*/
                    /*显示角色组弹窗*/
                    self.toggleModal({
                        display:'show',
                        area:type
                    });
                }
            }else{
                /*退出系统*/
                cache=null;
                toolUtil.loginTips({
                    clear:true,
                    reload:true
                });
            }

        };
        /*角色服务--编辑角色或角色组*/
        this.editRole=function (config) {
            if(cache){
                /*模型缓存*/
                var record=config.record,
                    type='rolegroup',
                    role,
                    rolegroup;

                if(record.role==='' && record.rolegroup!==''){
                    type='rolegroup';
                    rolegroup=config.rolegroup;

                    /*设置角色组模型*/
                    rolegroup['id']=record.rolegroup;
                    rolegroup['groupName']=record.rolegroupname;
                    rolegroup['type']='edit';
                }else if(record.role!=='' && record.rolegroup!==''){
                    type='role';
                    role=config.role;

                    /*设置角色模型*/
                    role['id']=record.role;
                    role['roleName']=record.rolename;
                    role['type']='edit';
                }else{
                    toolDialog.show({
                        type:'warn',
                        value:'不存在角色组或角色'
                    });
                    return false;
                }

                /*显示角色弹窗*/
                self.toggleModal({
                    display:'show',
                    area:type
                });
            }else{
                /*退出系统*/
                cache=null;
                toolUtil.loginTips({
                    clear:true,
                    reload:true
                });
            }

        };


    }]);