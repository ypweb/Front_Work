angular.module('app')
    .service('structService',['toolUtil','toolDialog','BASE_CONFIG','loginService',function(toolUtil,toolDialog,BASE_CONFIG,loginService){

        /*获取缓存数据*/
        var cache=toolUtil.getParams(BASE_CONFIG.unique_key),
            $admin_struct_submenu=$('#admin_struct_submenu'),
            $admin_struct_list=$('#admin_struct_list'),
            $struct_layout_dialog=$('#struct_layout_dialog'),
            self=this;

        /*
        导航服务类
        获取导航*/
        this.getMenuList=function (config) {
            /*判断是否是合法的节点*/
            if(!config.root&&config.layer>=BASE_CONFIG.submenulimit){
                self.initOperate({
                    data:null,
                    $wrap:$admin_struct_list,
                    config:config
                });
                return false;
            }
            var islogin=loginService.isLogin(cache);
            if(islogin){
                var param=$.extend(true,{},cache.loginMap.param);

                param['isShowSelf']=0;
                if(config.search!==''){
                    param['orgname']=config.search;
                }


                if(config.root){
                    /*根目录则获取新配置参数*/
                    config['id']=param['organizationId'];
                }else{
                    /*非根目录则获取新请求参数*/
                    param['organizationId']=config.id;
                }

                toolUtil
                    .requestHttp({
                        url:'json/goods/mall_goods_attr.json',
                        method:'post',
                        set:false,
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
                                                if(config.root){
                                                    $admin_struct_submenu.html('<li><a>暂无数据</a></li>');
                                                }else{
                                                    config.$wrap.html('');
                                                }
                                                /*清除显示下级菜单导航图标*/
                                                config.$reqstate.attr({
                                                    'data-isrequest':true
                                                }).removeClass('sub-menu-title sub-menu-titleactive');
                                                /*填充子数据到操作区域,同时显示相关操作按钮*/
                                                self.initOperate({
                                                    data:'',
                                                    $wrap:$admin_struct_list,
                                                    config:config
                                                });
                                            }else{
                                                /*数据集合，最多嵌套层次*/
                                                if(config.root){
                                                    /*根目录则插入菜单操作目录*/
                                                    str=self.resolveMenuList(list,BASE_CONFIG.submenulimit,config);
                                                    $admin_struct_submenu.html(str);
                                                }else{
                                                    /*非根目录则直接插入$wrap目录中*/
                                                    str=self.resolveMenuList(list,BASE_CONFIG.submenulimit,config);
                                                    config.$wrap.html(str);
                                                }
                                                config.$reqstate.attr({
                                                    'data-isrequest':true
                                                });
                                                /*填充子数据到操作区域,同时显示相关操作按钮*/
                                                self.initOperate({
                                                    data:list,
                                                    $wrap:$admin_struct_list,
                                                    config:config
                                                });
                                            }
                                        }else{
                                            /*填充子数据到操作区域,同时显示相关操作按钮*/
                                            self.initOperate({
                                                data:null,
                                                $wrap:$admin_struct_list,
                                                config:config
                                            });
                                        }
                                    }else{
                                        $admin_struct_submenu.html('<li><a>暂无数据</a></li>');
                                        /*填充子数据到操作区域,同时显示相关操作按钮*/
                                        self.initOperate({
                                            data:null,
                                            $wrap:$admin_struct_list,
                                            config:config
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
                            $admin_struct_submenu.html('<li><a>暂无数据</a></li>');
                            /*填充子数据到操作区域,同时显示相关操作按钮*/
                            self.initOperate({
                                data:null,
                                $wrap:$admin_struct_list,
                                config:config
                            });
                        });
            }else{
                loginService.loginOut();
            }
        };

        /*解析导航--开始解析*/
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

            if(config.root){
                layer=1;
            }else{
                layer++;
            }

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

        /*解析导航--递归解析*/
        this.doMenuList=function (obj,config) {
            
        };

        /*解析导航--公共解析*/
        this.doItemMenuList=function (obj,config) {
            var curitem=obj,
                id=curitem["id"],
                label=curitem["orgname"],
                str='',
                flag=config.flag,
                limit=config.limit,
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


        /*初始化操作区域*/
        this.initOperate=function (config) {
            var data=config.data,
                $wrap,
                param=config.config;

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
                param.setting.add_substruct_state=false;
                param.setting.adjust_pos_state=false;
            }else{
                /*设置操作状态*/
                if(data===''){
                    param.setting.add_substruct_state=true;
                    param.setting.adjust_pos_state=false;
                    /*清空内容*/
                    $wrap.html('');
                }else{
                    param.setting.add_substruct_state=true;
                    param.setting.adjust_pos_state=true;
                    self.renderOperate(config);
                }
            }
        };
        /*填充数据至操作区域*/
        this.renderOperate=function (config) {
            var i=0,
                list=config.data,
                len=list.length,
                param=config.config,
                str='',
                layer=1;


            if(param.root){
                layer=1;
            }else{
                layer=param.layer++;
            }
            var curitem,
                id,
                orgname;

            if(layer>=BASE_CONFIG.submenulimit){
                curitem=list[i];
                id=curitem['id'];
                orgname=curitem['orgname'];
            str+='<li data-label="'+orgname+'" data-id="'+param.id+'" data-layer="'+layer+'">'+orgname+'</li>';
            }else{
                for(i;i<len;i++){
                        curitem=list[i];
                        id=curitem['id'];
                        orgname=curitem['orgname'];
                    str+='<li class="ts-reload" data-label="'+orgname+'" data-id="'+id+'" data-layer="'+layer+'">'+orgname+'<span title="加载数据" data-isrequest="false" data-id="'+id+'"></span><ul></ul></li>';
                }
            }
            $(str).appendTo( config.$wrap.html(''));
        };
        /*获取机构列表*/
        this.getOperateList=function (config) {
            var islogin=loginService.isLogin(cache);
            if(islogin){
                var param=$.extend(true,{},cache.loginMap.param);

                param['isShowSelf']=0;
                if(config.search!==''){
                    param['orgname']=config.search;
                }

                if(config.root){
                    /*根目录则获取新配置参数*/
                    config['id']=param['organizationId'];
                }else{
                    /*非根目录则获取新请求参数*/
                    param['organizationId']=config.id;
                }

                toolUtil
                    .requestHttp({
                        url:'json/goods/mall_goods_attr.json',
                        method:'post',
                        set:false,
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
                                                    str+='<li data-label="'+curitem['orgname']+'" data-id="'+curitem['id']+'">'+curitem['orgname']+'</li>';
                                                }
                                                $(str).appendTo(config.$wrap.html(''));
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



        /*编辑操作*/
        this.toggleEdit=function (type,fn) {
            if(type==='show'){
                $struct_layout_dialog.modal('show',{backdrop:'static'});
                if(fn&&typeof fn==='function'){
                    fn.call(null);
                }
            }else if(type==='hide'){
                $struct_layout_dialog.on('hide.bs.modal',fn);
            }
        };






        /*提交编辑数据*/
        this.updateRootOrgname=function(edit) {
            if(edit.rootorgname===''){
              return false;
            }else{
                /*to do*/
                toolDialog.show({
                    type:'succ',
                    value:'编辑成功'
                });
                edit.editstate=true;
            }
        };


        /*var cache=toolUtil.getParams(BASE_CONFIG.unique_key),
            menudata=null;

        /!*获取登陆信息*!/
        this.isLogin=function () {
            var logininfo=toolUtil.isLogin(cache),
                islogin=false;
            if(logininfo){
                islogin=toolUtil.validLogin(cache.loginMap,BASE_CONFIG.basedomain);
                if(!islogin){
                    /!*不合格缓存信息，需要清除缓存*!/
                    toolUtil.loginOut({
                        router:'login',
                        tips:true
                    });
                }
                return islogin;
            }else{
                return false;
            }
        };
        /!*处理登陆请求*!/
        this.reqAction=function (resp,param) {
            var data=resp.data,
                status=parseInt(resp.status,10);

            if(status===200){
                var code=parseInt(data.code,10),
                    result=data.result,
                    message=data.message;
                if(code!==0){
                    if(typeof message !=='undefined'&&message!==''){
                        toastr.info(message);
                    }
                    return false;
                }else{
                    /!*设置缓存*!/
                    this.setCache({
                        'isLogin':true,
                        'datetime':moment().format('YYYY-MM-DD|HH:mm:ss'),
                        'reqdomain':BASE_CONFIG.basedomain,
                        'username':param,
                        'param':{
                            'adminId':encodeURIComponent(result.adminId),
                            'token':encodeURIComponent(result.token),
                            'organizationId':encodeURIComponent(result.organizationId)
                        }
                    });
                    /!*加载菜单*!/
                    this.loadMenuData(function () {
                        /!*重新刷新页面*!/
                        window.location.reload();
                    });
                    /!*加载动画*!/
                    toolUtil.loading('show');
                    var loadingid=setTimeout(function () {
                        /!*更新缓存*!/
                        cache=toolUtil.getParams(BASE_CONFIG.unique_key);
                        /!*路由跳转*!/
                        $state.go('app');
                        toolUtil.loading('hide',loadingid);
                    },1000);
                    return true;
                }
            }else{
                return false;
            }
        };
        /!*加载菜单数据*!/
        this.loadMenuData=function (fn) {
            /!*判断登陆缓存是否有效*!/
            var self=this,
                islogin=self.isLogin();
            if(islogin){
                if(!cache.cacheMap.menuload){
                    toolUtil
                        .requestHttp({
                            url:'/module/menu',
                            method:'post',
                            set:true,
                            data:cache.loginMap.param
                        })
                        .then(function(resp){
                                var data=resp.data,
                                    status=parseInt(resp.status,10);

                                if(status===200){
                                    var code=parseInt(data.code,10),
                                        message=data.message;
                                    if(code!==0){
                                        if(typeof message !=='undefined'&&message!==''){
                                            console.log('message');
                                        }
                                        if(code===999){
                                            /!*退出系统*!/
                                            toolUtil.loginOut({
                                                router:'login',
                                                tips:true
                                            });
                                        }
                                    }else{
                                        /!*加载数据*!/
                                        var result=data.result;
                                        if(typeof result!=='undefined'){
                                            /!*flag:是否设置首页*!/
                                            var list=toolUtil.resolveMainMenu(result.menu,true);
                                            if(list!==null){
                                                /!*设置缓存*!/
                                                cache['cacheMap']={
                                                    menuload:true,
                                                    powerload:true
                                                };
                                                cache['moduleMap']=list['module'];
                                                cache['menuMap']=list['menu'];
                                                cache['powerMap']=list['power'];
                                                /!*更新缓存*!/
                                                toolUtil.setParams(BASE_CONFIG.unique_key,cache);
                                                /!*执行回掉*!/
                                                if(typeof fn==='function'){
                                                    fn();
                                                }
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
                                    console.log('请求菜单失败');
                                }
                            });
                }
            }else{
                toolUtil.loginOut({
                    router:'login',
                    tips:true
                });
            }
        };
        /!*获取菜单数据*!/
        this.getMenuData=function () {
            if(menudata===null){
                var self=this,
                    islogin=self.isLogin();

                if(islogin){
                    if(cache.cacheMap.menuload){
                        /!*直接加载缓存*!/
                        var list=toolUtil.loadMainMenu(cache.menuMap);
                        if(list!==null){
                            menudata=list;
                            return menudata;
                        }
                    }
                }else{
                    toolUtil.loginOut({
                        router:'login',
                        tips:true
                    });
                }
                return null;
            }else{
                return menudata;
            }
        };
        /!**!/
        /!*获取验证码*!/
        this.getValidCode=function (config) {
            var xhr = new XMLHttpRequest();

            xhr.open("post",BASE_CONFIG.basedomain + BASE_CONFIG.baseproject + config.url, true);

            xhr.responseType = "blob";
            xhr.onreadystatechange = function() {
                if (this.status == 200) {
                    var blob = this.response,
                        img = document.createElement("img");

                    img.alt='验证码';
                    try{
                        img.onload = function(e) {
                            window.URL.revokeObjectURL(img.src);
                        };
                        img.src = window.URL.createObjectURL(blob);
                    }catch (e){
                        console.log('不支持URL.createObjectURL');
                    }

                    if(config.wrap){
                        angular.element('#'+config.wrap).html(img)||$('#'+config.wrap).html(img);
                    }else if(config.fn&&typeof config.fn==='function'){
                        config.fn.call(null,img);
                    }
                }
            };
            xhr.send();
        };
        /!*设置缓存*!/
        this.setCache=function (data) {
            if(cache){
                cache.loginMap=data;
            }else{
                cache={
                    cacheMap:{
                        menuload:false,
                        powerload:false
                    },
                    routeMap:{
                        prev:'',
                        current:'',
                        setting:false
                    },
                    moduleMap:{},
                    menuMap:{},
                    powerMap:{},
                    loginMap:data,
                    settingMap:{}
                };
            }
            toolUtil.setParams(BASE_CONFIG.unique_key,cache);
        };*/
    }]);