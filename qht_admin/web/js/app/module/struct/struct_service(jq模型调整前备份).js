angular.module('app')
    .service('structService',['toolUtil','toolDialog','BASE_CONFIG','loginService','powerService','dataTableCacheService','dataTableColumnService','dataTableCheckAllService','dataTableItemActionService','$timeout','$sce',function(toolUtil,toolDialog,BASE_CONFIG,loginService,powerService,dataTableCacheService,dataTableColumnService,dataTableCheckAllService,dataTableItemActionService,$timeout,$sce){

        /*获取缓存数据*/
        var self=this,
            module_id=10/*模块id*/,
            cache=loginService.getCache();



            /*$admin_struct_submenu=$('#admin_struct_submenu'),
            $admin_struct_list=$('#admin_struct_list'),
            $struct_setting_dialog=$('#struct_setting_dialog'),
            $struct_user_dialog=$('#struct_user_dialog'),
            $struct_userdetail_dialog=$('#struct_userdetail_dialog'),
            $admin_struct_reset=$('#admin_struct_reset'),
            $admin_user_reset=$('#admin_user_reset'),
            $admin_userdetail_show=$('#admin_userdetail_show'),*/





        var structform_reset_timer=null,
            userform_reset_timer=null,
            powermap=powerService.getCurrentPower(module_id),
            list_table=dataTableCacheService.getTable(module_id);
        
        
        


        /*初始化权限*/
        var init_power={
            structadd:toolUtil.isPower('organization-add',powermap,true)/*添加机构*/,
            structedit:toolUtil.isPower('organization-edit',powermap,true)/*编辑机构*/,
            useradd:toolUtil.isPower('user-add',powermap,true)/*添加用户*/,
            userdetail:toolUtil.isPower('user-view',powermap,true)/*查看用户*/,
            userupdate:toolUtil.isPower('user-update',powermap,true)/*编辑用户*/,
            userdelete:toolUtil.isPower('batch-delete',powermap,true)/*删除用户*/,
            operateadjust:toolUtil.isPower('operator-adjustment',powermap,true)/*调整运营商*/
        };


        /*dom引用和相关变量定义*/
        var $admin_list_wrap=$('#admin_list_wrap')/*表格*/,
            $admin_batchlist_wrap=$('#admin_batchlist_wrap'),
            $admin_page_wrap=$('#admin_page_wrap');



        /*列表请求配置*/
        var list1_page={
                page:1,
                pageSize:10,
                total:0
            },
            list1_config={
                $admin_list_wrap:$admin_list_wrap,
                $admin_page_wrap:$admin_page_wrap,
                hasdata:false,
                config:{
                    processing:true,/*大消耗操作时是否显示处理状态*/
                    deferRender:true,/*是否延迟加载数据*/
                    autoWidth:true,/*是否*/
                    paging:false,
                    ajax:{
                        url:toolUtil.adaptReqUrl('/organization/users'),
                        dataType:'JSON',
                        method:'post',
                        dataSrc:function ( json ) {
                            var code=parseInt(json.code,10),
                                message=json.message;

                            if(code!==0){
                                if(typeof message !=='undefined'&&message!==''){
                                    console.log(message);
                                }else{
                                    console.log('获取用户失败');
                                }
                                if(code===999){
                                    /*退出系统*/
                                    cache=null;
                                    toolUtil.loginTips({
                                        clear:true,
                                        reload:true
                                    });
                                }
                                list1_config.hasdata=false;
                                return [];
                            }
                            var result=json.result;
                            if(typeof result==='undefined'){
                                list1_config.hasdata=false;
                                /*重置分页*/
                                list1_page.total=0;
                                list1_page.page=1;
                                $admin_page_wrap.pagination({
                                    pageNumber:list1_page.page,
                                    pageSize:list1_page.pageSize,
                                    total:list1_page.total
                                });
                                return [];
                            }

                            if(result){
                                /*设置分页*/
                                list1_page.total=result.count;
                                /*分页调用*/
                                $admin_page_wrap.pagination({
                                    pageNumber:list1_page.page,
                                    pageSize:list1_page.pageSize,
                                    total:list1_page.total,
                                    onSelectPage:function(pageNumber,pageSize){
                                        /*再次查询*/
                                        var temp_param=list1_config.config.ajax.data;
                                        list1_page.page=pageNumber;
                                        list1_page.pageSize=pageSize;
                                        temp_param['page']=list1_page.page;
                                        temp_param['pageSize']=list1_page.pageSize;
                                        list1_config.config.ajax.data=temp_param;
                                        self.getColumnData();
                                    }
                                });

                                var list=result.list;
                                if(list){
                                    list.length===0?list1_config.hasdata=false:list1_config.hasdata=true;
                                    return list;
                                }else{
                                    list1_config.hasdata=false;
                                    return [];
                                }
                            }else{
                                list1_config.hasdata=false;
                                /*重置分页*/
                                list1_page.total=0;
                                list1_page.page=1;
                                $admin_page_wrap.pagination({
                                    pageNumber:list1_page.page,
                                    pageSize:list1_page.pageSize,
                                    total:list1_page.total
                                });
                                return [];
                            }
                        },
                        data:{
                             page:list1_page.page,
                             pageSize:list1_page.pageSize
                        }
                    },
                    info:false,
                    dom:'<"g-d-hidei" s>',
                    searching:true,
                    order:[[1, "desc" ]],
                    columns: [
                        {
                            "data":"id",
                            "orderable" :false,
                            "searchable" :false,
                            "render":function(data, type, full, meta ){
                                return '<input value="'+data+'" name="check_userid" type="checkbox" />';
                            }
                        },
                        {
                            "data":"phone",
                            "render":function(data, type, full, meta ){
                                return toolUtil.phoneFormat(data);
                            }
                        },
                        {
                            "data":"address"
                        },
                        {
                            "data":"nickName"
                        },
                        {
                            "data":"machineCode"
                        },
                        {
                            "data":"identityState",
                            "render":function(data, type, full, meta ){
                                var stauts=parseInt(data,10),
                                    statusmap={
                                        0:"未验证",
                                        1:"正在验证",
                                        2:"验证通过",
                                        3:"验证不通过"
                                    },
                                    str='';

                                if(stauts===0){
                                    str='<div class="g-c-warn">'+statusmap[stauts]+'</div>';
                                }else if(stauts===1){
                                    str='<div class="g-c-gray9">'+statusmap[stauts]+'</div>';
                                }else if(stauts===2){
                                    str='<div class="g-c-blue1">'+statusmap[stauts]+'</div>';
                                }else if(stauts===3){
                                    str='<div class="g-c-red1">'+statusmap[stauts]+'</div>';
                                }else{
                                    str='<div class="g-c-gray6">其他</div>';
                                }
                                return str;
                            }
                        },
                        {
                            "data":"createTime"
                        },
                        {
                            "data":"status"
                        },
                        {
                            "data":"remark"
                        },
                        {
                            "data":"id",
                            "render":function(data, type, full, meta ){
                                var btns='',
                                    addUserId=full.addUserId,
                                    organizationId=full.organizationId;

                                /*查看用户*/
                                if(init_power.userdetail){
                                    btns+='<span data-action="detail" data-addUserId="'+addUserId+'" data-id="'+data+'"  data-organizationId="'+organizationId+'"  class="btn-operate">查看</span>';
                                }
                                /*编辑用户*/
                                if(init_power.userupdate){
                                    btns+='<span data-addUserId="'+addUserId+'"  data-action="update" data-id="'+data+'" data-organizationId="'+organizationId+'" class="btn-operate">编辑</span>';
                                }
                                /*删除用户*/
                                if(init_power.userdelete){
                                    btns+='<span data-addUserId="'+addUserId+'"  data-action="delete" data-id="'+data+'" data-organizationId="'+organizationId+'" class="btn-operate">删除</span>';
                                }
                                return btns;
                            }
                        }
                    ]
                }
            };




        /*查询操作权限*/
        this.getCurrentPower=function () {
            return init_power;
        };

        /*导航服务--获取虚拟挂载点*/
        this.getRoot=function () {
            if(cache===null){
                toolUtil.loginTips({
                    clear:true,
                    reload:true
                });
                return null;
            }
            var islogin=loginService.isLogin(cache);
            if(islogin){
                var logininfo=cache.loginMap;
                return {
                    'orgname':logininfo.username,
                    'id':logininfo.param.organizationId
                };
            }else{
                /*退出系统*/
                cache=null;
                toolUtil.loginTips({
                    clear:true,
                    reload:true
                });
                return null;
            }
        };
        /*导航服务--获取导航*/
        this.getMenuList=function (config) {
            if(cache){
                var param=$.extend(true,{},cache.loginMap.param);

                param['isShowSelf']=0;
                if(config.search!==''){
                    param['orgname']=config.search;
                }

                if(typeof config.type!=='undefined' && config.type==='search'){
                    /*检索则清空查询内容*/
                    $admin_struct_submenu.html('');
                    $admin_struct_list.html('');
                }

                var layer,
                    id,
                    $wrap;

                /*初始化加载*/
                if(typeof config.$reqstate==='undefined'){
                    layer=0;
                    /*根目录则获取新配置参数*/
                    id=param['organizationId'];
                    $wrap=$admin_struct_submenu;
                }else{
                    /*非根目录则获取新请求参数*/
                    layer=config.$reqstate.attr('data-layer');
                    $wrap=config.$reqstate.next();
                    id=config.$reqstate.attr('data-id');

                    /*判断是否是合法的节点*/
                    if(layer>=BASE_CONFIG.submenulimit){
                        /*遇到极限节点，不查询数据*/
                        self.initOperate({
                            data:null,
                            $wrap:$admin_struct_list,
                            setting:config.setting
                        });
                        return false;
                    }
                    param['organizationId']=id;
                }


                toolUtil
                    .requestHttp({
                        url:'/organization/lowers/search',
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
                                                if(layer===0){
                                                    $wrap.html('<li><a>暂无数据</a></li>');
                                                    /*填充子数据到操作区域,同时显示相关操作按钮*/
                                                    self.initOperate({
                                                        data:'',
                                                        id:id,
                                                        $wrap:$admin_struct_list,
                                                        setting:config.setting
                                                    });
                                                }else{
                                                    $wrap.html('');
                                                    /*清除显示下级菜单导航图标*/
                                                    config.$reqstate.attr({
                                                        'data-isrequest':true
                                                    }).removeClass('sub-menu-title sub-menu-titleactive');
                                                    /*填充子数据到操作区域,同时显示相关操作按钮*/
                                                    self.initOperate({
                                                        data:'',
                                                        id:id,
                                                        orgname:config.$reqstate.attr('data-label'),
                                                        $wrap:$admin_struct_list,
                                                        setting:config.setting
                                                    });
                                                }
                                            }else{
                                                /*数据集合，最多嵌套层次*/
                                                str=self.resolveMenuList(list,BASE_CONFIG.submenulimit,{
                                                    layer:layer,
                                                    id:id
                                                });
                                                if(str!==''){
                                                    $(str).appendTo($wrap.html(''));
                                                }
                                                if(layer!==0){
                                                    config.$reqstate.attr({
                                                        'data-isrequest':true
                                                    });
                                                }

                                                /*填充子数据到操作区域,同时显示相关操作按钮*/
                                                self.initOperate({
                                                    data:list,
                                                    $wrap:$admin_struct_list,
                                                    id:id,
                                                    layer:layer,
                                                    setting:config.setting
                                                });
                                            }
                                        }else{
                                            /*填充子数据到操作区域,同时显示相关操作按钮*/
                                            self.initOperate({
                                                data:null,
                                                $wrap:$admin_struct_list,
                                                setting:config.setting
                                            });
                                        }
                                    }else{
                                        if(layer===0){
                                            $wrap.html('<li><a>暂无数据</a></li>');
                                        }
                                        /*填充子数据到操作区域,同时显示相关操作按钮*/
                                        self.initOperate({
                                            data:null,
                                            $wrap:$admin_struct_list,
                                            setting:config.setting
                                        });
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
                            if(layer===0){
                                $wrap.html('<li><a>暂无数据</a></li>');
                            }
                            /*填充子数据到操作区域,同时显示相关操作按钮*/
                            self.initOperate({
                                data:null,
                                $wrap:$admin_struct_list,
                                setting:config.setting
                            });
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

            if(limit>=1&&layer>limit){
                /*如果层级达到设置的极限清除相关*/
                return false;
            }



            if(len!==0){
                for(i;i<len;i++){
                    var curitem=menulist[i];
                    /*到达极限的前一项则不创建子菜单容器*/
                    if(limit>=1&&layer>=limit){
                        str+=self.doItemMenuList(curitem,{
                                flag:false,
                                limit:limit,
                                layer:layer,
                                parentid:config.id
                            })+'</li>';
                    }else{
                        str+=self.doItemMenuList(curitem,{
                                flag:true,
                                limit:limit,
                                layer:layer,
                                parentid:config.id
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
                id=curitem["id"],
                label=curitem["orgname"],
                str='',
                flag=config.flag,
                layer=config.layer,
                parentid=config.parentid;


            if(flag){
                str='<li><a data-isrequest="false" data-parentid="'+parentid+'" data-label="'+label+'" data-layer="'+layer+'" data-id="'+id+'" class="sub-menu-title" href="#" title="">'+label+'</a>';
            }else{
                str='<li><a data-parentid="'+parentid+'"  data-label="'+label+'"  data-layer="'+layer+'" data-id="'+id+'" href="#" title="">'+label+'</a></li>';
            }

            /*
            to do

            可能需要判断权限操作
            */
            /*if(goodstypeedit_power){
                str+='<span data-parentid="'+parentid+'"  data-action="edit" data-gtcode="'+gtCode+'" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
							<i class="fa-pencil"></i>&nbsp;&nbsp;编辑\
						</span>';

                /!*编辑状态*!/
                stredit+='<span data-parentid="'+parentid+'"  data-action="confirm"  data-gtcode="'+gtCode+'" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-bs-success">\
									<i class="fa-check"></i>&nbsp;&nbsp;确定\
								</span>\
								<span data-action="cance"  data-gtcode="'+gtCode+'" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray10">\
									<i class="fa-close"></i>&nbsp;&nbsp;取消\
								</span>';
            }*/

            return str;
        };
        /*导航服务--校验导航--校验导航服务的正确性*/
        this.validSubMenuLayer=function (layer) {
            if(typeof layer==='undefined'){
                return false;
            }
            var layer=parseInt(layer,10);
            if(layer<1){
              return false;
            }
            if(layer>BASE_CONFIG.submenulimit){
                return false;
            }
            return true;
        };



        /*机构设置--初始化操作区域*/
        this.initOperate=function (config) {
            var data=config.data,
                $wrap;

            if(typeof config.$wrap==='undefined'){
                $wrap=$admin_struct_list;
                config['$wrap']=$wrap;
            }else{
                $wrap=config.$wrap;
            }

            if(data===null){
                /*清空内容*/
                $wrap.html('');
                /*设置操作状态*/
                config.setting.add_substruct_state=false;
                config.setting.adjust_pos_state=false;
                config.setting.id='';
                config.setting.orgname='';
                config.setting.c_id='';
                config.setting.c_orgname='';
            }else{
                /*设置操作状态*/
                if(data===''){
                    config.setting.add_substruct_state=true;
                    config.setting.adjust_pos_state=false;
                    config.setting.id=config.id;
                    config.setting.orgname=config.orgname?config.orgname:'';
                    config.setting.c_id='';
                    config.setting.c_orgname='';
                    /*清空内容*/
                    $wrap.html('');
                    /*查询用户信息*/
                    self.getColumnData(config.id);
                }else{
                    if(config.layer===0){
                        /*虚拟挂载点*/
                        config.setting.id=config.id;
                        config.setting.orgname=config.orgname;
                        /*查询用户信息*/
                        self.getColumnData(config.id);
                    }else{
                        if(typeof config.id!=='undefined'){
                            config.setting.id=config.id;
                            /*查询用户信息*/
                            self.getColumnData(config.id);
                        }else{
                            config.setting.id='';
                        }
                        config.setting.orgname='';
                    }
                    config.setting.add_substruct_state=true;
                    config.setting.adjust_pos_state=true;
                    config.setting.c_id='';
                    config.setting.c_orgname='';
                    /*渲染机构*/
                    self.renderOperate(config);
                }
            }
        };
        /*机构设置--填充数据至操作区域*/
        this.renderOperate=function (config) {
            var i=0,
                list=config.data,
                len=list.length,
                str='',
                parentid=config.id,
                layer=config.layer;

            var curitem,
                id,
                orgname;

            if(layer>=BASE_CONFIG.submenulimit){
                config.$wrap.html('');
            }else{
                layer++;
                for(i;i<len;i++){
                        curitem=list[i];
                        id=curitem['id'];
                        orgname=curitem['orgname'];
                    str+='<li class="ts-reload" data-parentid="'+parentid+'" data-label="'+orgname+'" data-id="'+id+'" data-layer="'+layer+'">'+orgname+'<span title="加载数据" data-isrequest="false" data-id="'+id+'"></span><ul></ul></li>';
                }
                $(str).appendTo(config.$wrap.html(''));
            }
        };
        /*机构设置--获取机构列表*/
        this.getOperateList=function (config) {
            if(cache){
                var param=$.extend(true,{},cache.loginMap.param),
                    layer=parseInt(config.layer,10) + 1,
                    parentid=config.id;

                param['isShowSelf']=0;
                if(config.search!==''){
                    param['orgname']=config.search;
                }

                /*非根目录则获取新请求参数*/
                param['organizationId']=parentid;

                /*查询用户信息*/
                self.getColumnData(parentid);

                toolUtil
                    .requestHttp({
                        url:'/organization/lowers/search'/*'json/goods/mall_goods_attr.json'*/,
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
                                    }else{
                                        console.log('获取子机构失败');
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
                                                config.$wrap.html('');
                                                /*清除显示下级菜单导航图标*/
                                                config.$reqstate.attr({
                                                    'data-isrequest':true
                                                });
                                                config.$li.removeClass();
                                            }else{
                                                /*数据集合，最多嵌套层次*/
                                                config.$reqstate.attr({
                                                    'data-isrequest':true,
                                                    'title':'查看'
                                                });
                                                config.$li.removeClass().addClass('ts-child');
                                                var i=0;
                                                for(i;i<len;i++){
                                                    var curitem=list[i];
                                                    str+='<li data-layer="'+layer+'" data-parentid="'+parentid+'" data-label="'+curitem['orgname']+'" data-id="'+curitem['id']+'">'+curitem["orgname"]+'</li>';
                                                }
                                                $(str).appendTo(config.$wrap.html(''));

                                                /*查询用户列表*/
                                                self.getColumnData();
                                            }
                                        }else{
                                            config.$reqstate.attr({
                                                'data-isrequest':true
                                            });
                                            /*防止重复请求*/
                                            setTimeout(function () {
                                                config.$reqstate.attr({
                                                    'data-isrequest':false
                                                });
                                            },2000);
                                        }
                                    }else{
                                        config.$reqstate.attr({
                                            'data-isrequest':true
                                        });
                                        config.$li.removeClass();
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
                            config.$reqstate.attr({
                                'data-isrequest':true
                            });
                            config.$li.removeClass();
                        });
            }else{
                loginService.loginOut();
            }
        };
        /*机构设置--操作机构*/
        this.actionStruct=function (config) {
            var modal=config.modal,
                setting=config.setting,
                struct=config.struct,
                power=config.power,
                type=modal.type;

            /*判断是否是合法的节点，即是否有父机构*/
            if(!setting.id  &&  typeof setting.id ==='undefined'){
                toolDialog.show({
                    type:'warn',
                    value:'没有父机构或父机构不存在'
                });
                return false;
            }else if(setting.id===''){
                toolDialog.show({
                    type:'warn',
                    value:'没有父机构或父机构不存在'
                });
                return false;
            }

            /*如果存在延迟任务则清除延迟任务*/
            self.clearFormDelay();
            /*通过延迟任务清空表单数据*/
            self.addFormDelay({
                type:'struct',
                value:type,
                mode:struct
            });

            /*根据类型跳转相应逻辑*/
            if(type==='edit'){
                /*查询相关存在的数据*/
                self.queryOperateInfo(config);
            }else if(type==='add'){
                /*to do*/
                /*查询权限--先查询当前权限*/
                powerService.reqPowerList({
                    url:'/organization/permission/select',
                    param:{
                        organizationId:setting.id
                    }
                },power);
                /*显示弹窗*/
                self.toggleModal({
                    display:modal.display,
                    area:modal.area
                });
            }
            
        };
        /*机构设置--查询机构数据*/
        this.queryOperateInfo=function (config) {
            if(cache===null){
               return false;
            }
            var setting=config.setting,
                struct=config.struct,
                power=config.power,
                modal=config.modal,
                param=$.extend(true,{},cache.loginMap.param);

            /*判断参数*/
            if(setting.c_id!==''){
                param['id']=setting.c_id;
            }else if(setting.c_id===''){
                param['id']=setting.id;
            }

            toolUtil
                .requestHttp({
                    url:'/organization/info',
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
                                }else{
                                    console.log('请求数据失败');
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
                                    var list=result.organization;
                                    if(angular.isObject(list)){
                                        /*更新模型*/
                                        for(var i in list){
                                            switch (i){
                                                case 'id':
                                                    struct[i]=list[i];
                                                    break;
                                                case 'orgname':
                                                    struct[i]=list[i];
                                                    break;
                                                case 'comname':
                                                    struct[i]=list[i];
                                                    break;
                                                case 'linkman':
                                                    struct[i]=list[i];
                                                    break;
                                                case 'cellphone':
                                                    struct[i]=toolUtil.phoneFormat(list[i]);
                                                    break;
                                                case 'address':
                                                    struct[i]=list[i];
                                                    break;
                                                case 'operatingArea':
                                                    struct[i]=list[i];
                                                    break;
                                                case 'remark':
                                                    struct[i]=list[i];
                                                    break;
                                                case 'isSettingLogin':
                                                    /*是否登录*/
                                                    var temp_login=parseInt(list[i],10);
                                                    struct[i]=temp_login;
                                                    struct['password']='';
                                                    if(temp_login===1){
                                                        /*设置*/
                                                        struct['username']=list['username'];
                                                    }else if(temp_login===0){
                                                        /*未设置*/
                                                        struct['username']='';
                                                    }
                                                    break;
                                                case 'isDesignatedPermit':
                                                    /*是否指定权限*/
                                                    var temp_power=parseInt(list[i],10);

                                                    struct[i]=temp_power;
                                                    if(temp_power===0){
                                                        /*全部权限*/
                                                        struct['checkedFunctionIds']='';
                                                    }

                                                    /*查询权限--先查询当前权限(子级权限) --> 再查父级权限  --> 存在父子级权限，过滤子级权限*/
                                                    powerService.reqPowerList({
                                                        url:'/organization/permission/select',
                                                        source:true,/*是否获取数据源*/
                                                        sourcefn:function (cs) {
                                                            /*数据源*/
                                                            var child_data=cs,
                                                                parent_data;
                                                            console.log(child_data);
                                                            if(child_data!==null){
                                                                /*存在数据源*/
                                                                powerService.reqPowerList({
                                                                    url:'/organization/permission/select',
                                                                    source:true,/*是否获取数据源*/
                                                                    sourcefn:function (ps) {
                                                                        /*数据源*/
                                                                        parent_data=ps;
                                                                        console.log(parent_data);
                                                                        if(parent_data!==null){
                                                                            /*存在数据源，开始过滤权限数据*/
                                                                            var filter_data=powerService.filterPower(parent_data,child_data);
                                                                            console.log(filter_data);
                                                                            if(filter_data){
                                                                                /*过滤后的数据即映射到视图*/
                                                                                var power_html=powerService.resolvePowerList({
                                                                                    menu:filter_data
                                                                                });
                                                                                /*更新模型*/
                                                                                if(power_html && power){
                                                                                    power['tbody']=$sce.trustAsHtml(power_html);
                                                                                }
                                                                            }else{
                                                                                toolDialog.show({
                                                                                    type:'warn',
                                                                                    value:'过滤后的权限数据不正确'
                                                                                });
                                                                                return false;
                                                                            }
                                                                        }else{
                                                                            /*提示信息*/
                                                                            toolDialog.show({
                                                                                type:'warn',
                                                                                value:'没有父级权限数据'
                                                                            });
                                                                            return false;
                                                                        }
                                                                    },
                                                                    param:{
                                                                        organizationId:list['parentId']
                                                                    }
                                                                },power);
                                                            }else{
                                                                /*提示信息*/
                                                                toolDialog.show({
                                                                    type:'warn',
                                                                    value:'没有子级权限数据'
                                                                });
                                                                return false;
                                                            }
                                                        },
                                                        param:{
                                                            organizationId:list['id']
                                                        }
                                                    },power);
                                                    break;
                                                case 'sysUserId':
                                                    struct[i]=list[i];
                                                    break;
                                                case 'parentId':
                                                    struct[i]=list[i];
                                                    break;
                                            }
                                        }
                                        /*显示弹窗*/
                                        self.toggleModal({
                                            display:modal.display,
                                            area:modal.area
                                        });
                                    }else{
                                        /*提示信息*/
                                        toolDialog.show({
                                            type:'warn',
                                            value:'获取编辑数据失败'
                                        });
                                    }
                                }
                            }
                        }
                    },
                    function(resp){
                        var message=resp.data.message;
                        if(typeof message !=='undefined'&&message!==''){
                            console.log(message);
                        }else{
                            console.log('请求机构失败');
                        }
                    });
        };



        /*机构设置--调整机构位置*/
        this.adjustStructPos=function (structpos,fn) {
            var ispos=this.getStructPos(structpos);
            if(!ispos){
                toolDialog.show({
                    type:'warn',
                    value:'请选择所要调整的位置的2个对象'
                });
                return false;
            }else{
                /*to do request*/
                if(cache){
                    var param=$.extend(true,{},cache.loginMap.param);

                    param['organizationIdUp']=ispos['up'];
                    param['organizationIdDown']=ispos['down'];
                    toolUtil
                        .requestHttp({
                            url:'/organization/position/setting',
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
                                        }else{
                                            toolDialog.show({
                                                type:'warn',
                                                value:'位置调整失败'
                                            });
                                            /*更新模型*/
                                            self.clearStructPos(structpos);
                                        }
                                    }else{
                                        toolDialog.show({
                                            type:'succ',
                                            value:'位置调整成功'
                                        });
                                        /*更新模型*/
                                        self.clearStructPos(structpos);
                                        /*回调fn*/
                                        if(fn && typeof fn==='function'){
                                            fn.call(null);
                                        }
                                    }
                                }
                            },
                            function(resp){
                                var message=resp.data.message;
                                if(typeof message !=='undefined'&&message!==''){
                                    console.log(message);
                                }else{
                                    console.log('位置调整失败');
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
            }
        };
        /*机构设置--设置机构数据,$node:node节点，structpos:位置模型*/
        this.setStructPos=function ($node,structpos,setting) {
            if(!structpos){
               return false;
            }else if(!setting){
                return false;
            }



            var type='',
                pos='',
                active,
                valid=this.validStructPos(structpos),
                activemap={
                    up:'ts-posup',
                    down:'ts-posdown'
                };

            /*适配位置参数*/
            if($node.hasClass(activemap['up'])){
                pos='up';
                type='delete';
            }else{
                if($node.hasClass(activemap['down'])){
                    pos='down';
                    type='delete';
                }else{
                    /*都不存在的情况需要判断之前是否已经选中了相关*/
                    if(valid.flag){
                        /*已经有值：表示操作最后项*/
                        pos='down';
                        type='add';
                    }else{
                        /*没有值则根据相关值操作*/
                        pos=valid.pos;
                        type='add';
                    }
                }
            }
            active=activemap[pos];

            /*处理异常*/
            if(pos===''){
                pos='up';
                type='add';
                active=activemap[pos];
            }

            var temppos=structpos[pos],
                id=temppos['id'],
                label;

            /*操作*/
            if(type==='add'){
                /*添加*/
                var parentid=$node.attr('data-parentid'),
                    layer=$node.attr('data-layer'),
                    sibling,
                    siblingitem,
                    siblingid;

                /*过滤层级和父标识*/
                if(pos==='up'){
                    sibling='down';
                }else if(pos==='down'){
                    sibling='up';
                }
                siblingitem=structpos[sibling];
                siblingid=siblingitem['id'];

                if(id===''){
                    /*过滤层级关系不一致的情况*/
                    if(siblingid!=='' && siblingitem['layer']!==layer && siblingitem['parentid']!==parentid){
                        toolDialog.show({
                            type:'warn',
                            value:'只能操作同一父级且同级别下的机构'
                        });
                        return false;
                    }
                    /*直接新增*/
                    /*修改样式*/
                    $node.addClass(active);
                    /*赋值*/
                    id=$node.attr('data-id');
                    label=$node.attr('data-label');

                    temppos['$node']=$node;
                    temppos['active']=active;
                    temppos['layer']=layer;
                    temppos['parentid']=parentid;
                }else{
                    /*过滤层级关系不一致的情况*/
                    if(siblingitem['layer']!==layer && siblingitem['parentid']!==parentid){
                        toolDialog.show({
                            type:'warn',
                            value:'只能操作同一父级且同级别下的机构'
                        });
                        return false;
                    }
                    /*更新新增*/
                    /*修改样式*/
                    temppos['$node'].removeClass(temppos['active']);
                    $node.addClass(active);
                    /*清空,释放内存*/
                    temppos['$node']=null;
                    /*赋值*/
                    temppos['id']=$node.attr('data-id');
                    temppos['$node']=$node;
                    temppos['active']=active;
                    temppos['layer']=layer;
                    temppos['parentid']=parentid;
                }
                /*赋值*/
                temppos['id']=id;

                /*模型变更*/
                setting.c_id=id;
                setting.c_orgname=label;
            }else if(type==='delete'){
                /*删除*/
                /*修改样式*/
                temppos['$node'].removeClass(temppos['active']);
                /*清空,释放内存*/
                temppos['$node']=null;
                temppos['id']='';
                temppos['active']='';
                temppos['layer']='';
                temppos['parentid']='';

                /*模型变更*/
                setting.c_id='';
                setting.c_orgname='';
            }
        };
        /*机构设置--校验机构数据*/
        this.validStructPos=function (structpos) {
            if(!structpos){
               return false;
            }
            var result={},
                positem,
                id,
                count=0;

            for(var i in structpos){
                positem=structpos[i];
                id=positem['id'];
                if(id===''){
                    result['pos']=i;
                    result['flag']=false;
                    return result;
                }else{
                    count++;
                    if(count===1){
                        result['pos']=i;
                        result['flag']=false;
                    }else if(count===2){
                        result['flag']=true;
                    }
                }
            }
            return result;
        };
        /*机构设置--获取机构数据*/
        this.getStructPos=function (structpos) {
            if(!structpos){
                return false;
            }
            var result={},
                positem,
                id,
                count=0;

            for(var i in structpos){
                positem=structpos[i];
                id=positem['id'];

                if(id===''){
                    return false;
                }else{
                    count++;
                    result[i]=id;
                }
            }
            if(count!==2){
                return false;
            }
            return result;
        };
        /*清除机构数据*/
        this.clearStructPos=function (structpos,pos) {
            if(!structpos){
                return false;
            }
            if(typeof pos!=='undefined'){
                structpos[pos]={
                    id:'',
                    $node:null,
                    active:'',
                    layer:'',
                    parentid:''
                };
            }else{
                for(var i in structpos){
                    structpos[i]={
                        id:'',
                        $node:null,
                        active:'',
                        layer:'',
                        parentid:''
                    };
                }
            }
        };
        


        /*弹出层服务*/
        this.toggleModal=function (config,fn) {
            var temp_timer=null,
                type_map={
                    'setting':$struct_setting_dialog,
                    'user':$struct_user_dialog,
                    'userdetail':$struct_userdetail_dialog
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
                if(config.area==='setting' || config.area==='user'){
                    self.clearFormDelay();
                }
            }
        };
        /*执行延时任务序列*/
        this.addFormDelay=function (config) {
            /*映射对象*/
            var type=config.type,
            value=config.value,
            mode=config.mode,
            type_map={
                'struct':{
                    'timeid':structform_reset_timer,
                    'dom':$admin_struct_reset
                },
                'user':{
                    'timeid':userform_reset_timer,
                    'dom':$admin_user_reset
                }
            };
            /*执行延时操作*/
            type_map[type]['timeid']=$timeout(function(){
                /*触发重置表单*/
                type_map[type]['dom'].trigger('click');
                /*设置模型*/
                if(typeof mode!=='undefined' && typeof value!=='undefined'){
                    mode.type=value;
                }
            },0);
        };
        /*清除延时任务序列*/
        this.clearFormDelay=function (did) {
            if(did  &&  did!==null){
                $timeout.cancel(did);
                did=null;
            }else{
                /*如果存在延迟任务则清除延迟任务*/
                if(structform_reset_timer!==null){
                    $timeout.cancel(structform_reset_timer);
                    structform_reset_timer=null;
                }
                if(userform_reset_timer!==null){
                    $timeout.cancel(userform_reset_timer);
                    userform_reset_timer=null;
                }
            }
        };



        /*表单类服务--清空表单模型数据*/
        this.clearFormData=function (data,type) {
            if(!data){
                return false;
            }
            if(type==='struct'){
                /*重置机构数据模型*/
                for(var i in data){
                    if(i==='isSettingLogin'){
                        /*是否设置登录名*/
                        data[i]=1;
                    }else if(i==='isDesignatedPermit'){
                        /*是否指定权限*/
                        data[i]=1;
                    }else if(i==='type'){
                        /*操作类型为新增*/
                        data[i]='add';
                    }else{
                        data[i]='';
                    }
                }
            }else if(type==='user'){
                /*重置用户数据模型*/
                for(var j in data){
                    if(j==='type'){
                        /*操作类型为新增*/
                        data[j]='add';
                    }else{
                        data[j]='';
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
        /*表单类服务--提交表单数据*/
        this.structSubmit=function (struct,setting,search) {
            /*判断表单类型*/
            if(struct.type===''||typeof struct.type==='undefined'){
                /*非法表单类型*/
                toolDialog.show({
                    type:'warn',
                    value:'非法表单类型'
                });
                return false;
            }

            /*登陆缓存*/
            if(cache){
                var param=$.extend(true,{},cache.loginMap.param);
                /*数据适配*/
                /*公共配置*/
                param['orgname']=struct.orgname;
                param['comname']=struct.comname;
                param['linkman']=struct.linkman;
                param['cellphone']=toolUtil.trims(struct.cellphone);
                param['address']=struct.address;
                param['operatingArea']=struct.operatingArea;
                param['remark']=struct.remark;
                /*判断设置登录名*/
                var isSettingLogin=parseInt(struct.isSettingLogin,10);
                param['isSettingLogin']=isSettingLogin;
                if(isSettingLogin===1){
                    /*选中设置登录名*/
                    param['username']=struct.username;
                    param['password']=struct.password;
                }

                /*判断是否指定权限*/
                var isDesignatedPermit=parseInt(struct.isDesignatedPermit,10);
                param['isDesignatedPermit']=struct.isDesignatedPermit;
                if(isDesignatedPermit===1){
                    param['checkedFunctionIds']=struct.checkedFunctionIds;
                }


                if(struct.type==='add'){
                    /*新增机构或子机构*/
                    param['parentId']=setting.id;
                }else if(struct.type==='edit'){
                    /*编辑机构或子机构*/
                    if(struct.id===''){
                        toolDialog.show({
                            type:'warn',
                            value:'非法的编辑数据'
                        });
                        return false;
                    }
                    param['id']=struct.id;
                    param['sysUserId']=struct.sysUserId;
                    param['parentId']=struct.parentId;
                }
                toolUtil
                    .requestHttp({
                        url:struct.type==='add'?'/organization/add':'/organization/update',
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
                                        toolDialog.show({
                                            type:'warn',
                                            value:message
                                        });
                                    }else{
                                        toolDialog.show({
                                            type:'warn',
                                            value:struct.type==='add'?'新增机构失败':'编辑机构失败'
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
                                    /*重新加载侧边栏数据*/
                                    self.getMenuList({
                                        search:search.orgname,
                                        setting:setting
                                    });
                                    /*重置表单*/
                                    self.addFormDelay({
                                        type:'struct'
                                    });
                                    /*弹出框隐藏*/
                                    toolDialog.show({
                                        type:'succ',
                                        value:struct.type==='add'?'新增机构成功':'编辑机构成功'
                                    });
                                    self.toggleModal({
                                        display:'hide',
                                        area:'setting',
                                        delay:1000
                                    });
                                }
                            }
                        },
                        function(resp){
                            var message=resp.data.message;
                            if(typeof message !=='undefined'&&message!==''){
                                console.log(message);
                            }else{
                                console.log('新增机构或编辑机构失败');
                            }
                        });
            }else{
                /*缓存不存在*/
                return false
            }
        };



        /*数据服务--请求数据--获取表格数据*/
        this.getColumnData=function (id){
            if(cache===null){
                return false;
            }
            /*如果存在模型*/
            var data= $.extend(true,{},list1_config.config.ajax.data);
            if(typeof id!=='undefined'){
                /*设置值*/
                data['organizationId']=id;
                /*参数赋值*/
                list1_config.config.ajax.data=data;

                if(list_table===null){
                    /*初始请求*/
                    var temp_param=cache.loginMap.param;
                    list1_config.config.ajax.data['adminId']=temp_param.adminId;
                    list1_config.config.ajax.data['token']=temp_param.token;
                    list_table=list1_config.$admin_list_wrap.DataTable(list1_config.config);
                    /*设置表格缓存*/
                    dataTableCacheService.setTable(module_id,list_table);
                }else {
                    /*清除批量数据*/
                    //batchItem.clear();
                    list_table.ajax.config(list1_config.config.ajax).load();
                }
            }else if(typeof id==='undefined' && list_table!==null && typeof data['organizationId']!=='undefined'){
                list_table.ajax.config(list1_config.config.ajax).load();
            }
        };
        /*数据服务--全选和取消全选*/
        this.checkAllUser=function (user) {
            var ischeck=parseInt(user.checkall,10);

            if(ischeck===1){
                /*选中*/

            }else if(ischeck===0){
                /*未选中*/

            }
        };
        /*数据服务--过滤表格数据*/
        this.filterDataTable=function (user) {
            if(list_table===null){
                return false;
            }
            var filter=user.filter;
            list_table.search(filter).columns().draw();
        };
        /*数据服务--表格列数量控制*/
        this.initColumn=function () {
            dataTableColumnService.initColumn(module_id,tablecolumn);
        };
        /*数据服务--表格全选与取消全选*/
        this.initCheckAll=function () {
            dataTableCheckAllService.initCheckAll(module_id,tablecheckall);
        };
        /*数据服务--表格单项操作*/
        this.initItemAction=function ($scope) {
            dataTableItemActionService.initItemAction(module_id,tableitemaction,$scope);
        };
        /*用户服务--表格单项操作回调*/
        this.doItemAction=function (config,mode) {
            var id=config.id,
                action=config.action;

            if(action==='update'){
                self.actionUser({
                    modal:{
                        display:'show',
                        area:'user',
                        type:'edit'
                    },
                    setting:mode.setting,
                    user:mode.user
                },id,action);
            }else if(action==='detail'){
                self.queryUserInfo(null,id,action);
            }
        };


        /*用户服务--操作用户*/
        this.actionUser=function (config,id,action) {
            var modal=config.modal,
                type=modal.type;



            if(typeof type!=='undefined'){
                var setting=config.setting,
                    user=config.user;

                if(type==='add'){
                    /*判断是否是合法的节点，即是否有父机构*/
                    if(!setting.id  &&  typeof setting.id ==='undefined'){
                        toolDialog.show({
                            type:'warn',
                            value:'没有父机构或父机构不存在'
                        });
                        return false;
                    }else if(setting.id===''){
                        toolDialog.show({
                            type:'warn',
                            value:'没有父机构或父机构不存在'
                        });
                        return false;
                    }
                }
                /*如果存在延迟任务则清除延迟任务*/
                self.clearFormDelay();
                /*通过延迟任务清空表单数据*/
                self.addFormDelay({
                    type:'user',
                    value:type,
                    mode:user
                });

                /*根据类型跳转相应逻辑*/
                if(type==='edit'){
                    /*查询相关存在的数据*/
                    self.queryUserInfo(config,id,action);
                }else if(type==='add'){
                    /*显示弹窗*/
                    self.toggleModal({
                        display:modal.display,
                        area:modal.area
                    });
                }
            }else{

            }
        };
        /*用户服务--查询用户数据*/
        this.queryUserInfo=function (config,id,action) {
            if(cache===null){
               return false;
            }


            var  param=$.extend(true,{},cache.loginMap.param);
            /*判断参数*/
            param['id']=id;

            if(action==='update'){
                var user=config.user,
                    modal=config.modal;
            }


            toolUtil
                .requestHttp({
                    url:'/organization/user/info',
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
                                }else{
                                    console.log('请求数据失败');
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
                                    var list=result.user;
                                    if(angular.isObject(list)){
                                        if(action==='update'){
                                            /*修改：更新模型*/
                                            for(var i in list){
                                                switch (i){
                                                    case 'id':
                                                        user[i]=list[i];
                                                        break;
                                                    case 'nickName':
                                                        user[i]=list[i];
                                                        break;
                                                    case 'phone':
                                                        user[i]=toolUtil.phoneFormat(list[i]);
                                                        break;
                                                    case 'address':
                                                        user[i]=list[i];
                                                        break;
                                                    case 'mainFee':
                                                        user[i]=list[i];
                                                        break;
                                                    case 'machineCode':
                                                        user[i]=list[i];
                                                        break;
                                                    case 'remark':
                                                        user[i]=list[i];
                                                        break;
                                                }
                                            }
                                            /*显示弹窗*/
                                            self.toggleModal({
                                                display:modal.display,
                                                area:modal.area
                                            });
                                        }else if(action==='detail'){
                                            /*查看*/
                                            var str='',
                                                detail_map={
                                                    'nickName':'用户名称',
                                                    'phone':'手机号码',
                                                    'address':'联系地址',
                                                    'mainFee':'费率',
                                                    'machineCode':'机器码(IMEI)',
                                                    'identityState':'身份证验证状态',
                                                    'remark':'备注',
                                                    'createTime':'创建时间',
                                                    'grade':'用户级别',
                                                    'gender':'',
                                                    'strategyNotice':'',
                                                    'status':'状态'
                                                };
                                            for(var j in list){
                                                if(typeof detail_map[j]!=='undefined'){
                                                    if(j==='identityState'){
                                                        var tempstate=parseInt(list[j],10);
                                                        if(tempstate===0){
                                                            str+='<tr><td class="g-t-r">身份证验证状态:</td><td class="g-t-l g-c-warn">未验证</td></tr>';
                                                        }else if(tempstate===1){
                                                            str+='<tr><td class="g-t-r">身份证验证状态:</td><td class="g-t-l g-c-gray9">正在验证</td></tr>';
                                                        }else if(tempstate===2){
                                                            str+='<tr><td class="g-t-r">身份证验证状态:</td><td class="g-t-l g-c-blue1">验证通过</td></tr>';
                                                        }else if(tempstate===3){
                                                            str+='<tr><td class="g-t-r">身份证验证状态:</td><td class="g-t-l g-c-red1">验证不通过</td></tr>';
                                                        }else{
                                                            str+='<tr><td class="g-t-r">身份证验证状态:</td><td class="g-t-l g-c-gray6">其他</td></tr>';
                                                        }
                                                    }else{
str+='<tr><td class="g-t-r">'+detail_map[j]+':</td><td class="g-t-l">'+list[j]+'</td></tr>';
                                                    }
                                                }
                                            }
                                            if(str!==''){
                                                $(str).appendTo($admin_userdetail_show.html(''));
                                                /*显示弹窗*/
                                                self.toggleModal({
                                                    display:'show',
                                                    area:'userdetail'
                                                });
                                            }
                                        }
                                    }else{
                                        /*提示信息*/
                                        toolDialog.show({
                                            type:'warn',
                                            value:'获取编辑数据失败'
                                        });
                                    }
                                }
                            }
                        }
                    },
                    function(resp){
                        var message=resp.data.message;
                        if(typeof message !=='undefined'&&message!==''){
                            console.log(message);
                        }else{
                            console.log('请求用户失败');
                        }
                    });
        };
        /*用户服务--提交表单数据*/
        this.userSubmit=function (user,setting) {
            /*判断表单类型*/
            if(user.type===''||typeof user.type==='undefined'){
                /*非法表单类型*/
                toolDialog.show({
                    type:'warn',
                    value:'非法表单类型'
                });
                return false;
            }

            /*登陆缓存*/
            if(cache){
                var param=$.extend(true,{},cache.loginMap.param);
                /*数据适配*/
                /*公共配置*/
                param['nickName']=user.nickName;
                param['phone']=toolUtil.trims(user.phone);
                param['address']=user.address;
                param['mainFee']=user.mainFee;
                param['machineCode']=user.machineCode;
                param['remark']=user.remark;

                if(user.type==='add'){
                    /*新增机构或子机构*/
                    /*判断参数*/
                    if(setting.c_id!==''){
                        param['organizationId']=setting.c_id;
                    }else if(setting.c_id===''){
                        param['organizationId']=setting.id;
                    }
                }else if(user.type==='edit'){
                    /*编辑机构或子机构*/
                    delete param['organizationId'];
                    if(user.id===''){
                        toolDialog.show({
                            type:'warn',
                            value:'非法的编辑数据'
                        });
                        return false;
                    }
                    param['id']=user.id;
                }
                toolUtil
                    .requestHttp({
                        url:user.type==='add'?'/organization/user/add':'/organization/user/update',
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
                                        toolDialog.show({
                                            type:'warn',
                                            value:message
                                        });
                                    }else{
                                        toolDialog.show({
                                            type:'warn',
                                            value:user.type==='add'?'新增用户失败':'编辑用户失败'
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
                                    /*重新加载表格数据*/
                                    self.getColumnData();
                                    /*重置表单*/
                                    self.addFormDelay({
                                        type:'user'
                                    });
                                    /*弹出框隐藏*/
                                    toolDialog.show({
                                        type:'succ',
                                        value:user.type==='add'?'新增用户成功':'编辑用户成功'
                                    });
                                    self.toggleModal({
                                        display:'hide',
                                        area:'user',
                                        delay:1000
                                    });
                                }
                            }
                        },
                        function(resp){
                            var message=resp.data.message;
                            if(typeof message !=='undefined'&&message!==''){
                                console.log(message);
                            }else{
                                console.log('新增机构或编辑机构失败');
                            }
                        });
            }else{
                /*缓存不存在*/
                return false
            }
        };
        /*用户服务--批量删除*/
        this.batchDeleteUser=function (setting) {
            if(cache===null){
                toolUtil.loginTips({
                    clear:true,
                    reload:true
                });
                return false;
            }
            var batchdata=dataTableCheckAllService.getBatchData(),
                len=batchdata.length;

            if(len===0){
                toolDialog.show({
                    type:'warn',
                    value:'请选中相关数据'
                });
                return false;
            }
            var param=$.extend(true,{},cache.loginMap.param);
            /*判断参数*/
            if(setting.c_id!==''){
                param['organizationId']=setting.c_id;
            }else if(setting.c_id===''){
                param['organizationId']=setting.id;
            }
            param['userIds']=batchdata.join(',');

            /*确认是否删除*/
            toolDialog.sureDialog('',function () {
                /*执行删除操作*/
                toolUtil
                    .requestHttp({
                        url:'/organization/users/delete',
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
                                        /*提示信息*/
                                        toolDialog.show({
                                            type:'warn',
                                            value:message
                                        });
                                    }else{
                                        /*提示信息*/
                                        toolDialog.show({
                                            type:'warn',
                                            value:'删除用户失败'
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
                                }else{
                                    /*提示信息*/
                                    toolDialog.show({
                                        type:'succ',
                                        value:'删除用户成功'
                                    });

                                    /*清空全选*/
                                    dataTableCheckAllService.clear();
                                    /*重新加载数据*/
                                    self.getColumnData();
                                }
                            }
                        },
                        function(resp){
                            var message=resp.data.message;
                            if(typeof message !=='undefined'&&message!==''){
                                console.log(message);
                            }else{
                                console.log('删除用户失败');
                            }
                        });
            },'是否真要批量删除用户数据',true);
        };



        /*初始化表格配置*/
        /*列控制配置*/
        var tablecolumn={
                init_len:10/*数据有多少列*/,
                ischeck:true,/*是否有全选*/
                columnshow:true,
                column_wrap:'#admin_struct_checkcolumn'/*控制列显示隐藏的容器*/,
                bodywrap:'#admin_struct_batchlist'/*数据展现容器*/,
                hide_list:[4,5,6,7,8]/*需要隐藏的的列序号*/,
                column_api:{
                    isEmpty:function () {
                        return list1_config.hasdata;
                    }
                },
                colgroup:'#admin_struct_colgroup'/*分组模型*/
            },/*全选*/
            tablecheckall={
                bodywrap:'#admin_struct_batchlist',
                checkall:'#admin_struct_checkall'
            },/*单项操作*/
            tableitemaction={
                bodywrap:'#admin_struct_batchlist',
                itemaction_api:{
                    doItemAction:self.doItemAction
                }
            };


    }]);