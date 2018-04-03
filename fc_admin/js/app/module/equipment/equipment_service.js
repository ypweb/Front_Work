angular.module('app')
    .service('equipmentService',['toolUtil','toolDialog','BASE_CONFIG','loginService','powerService','dataTableColumnService','dataTableItemActionService','datePicker97Service','$timeout',function(toolUtil,toolDialog,BASE_CONFIG,loginService,powerService,dataTableColumnService,dataTableItemActionService,datePicker97Service,$timeout){

        /*获取缓存数据*/
        var self=this,
            module_id=70/*模块id*/,
            cache=loginService.getCache(),
            sendform_reset_timer=null;

        var powermap=powerService.getCurrentPower(module_id);

        /*初始化权限*/
        var init_power={
            device_add:toolUtil.isPower('device-add',powermap,true)/*添加发货信息*/,
            iemi_add:toolUtil.isPower('iemi-add',powermap,true)/*添加iemi码*/,
            delivery_add:toolUtil.isPower('delivery-add',powermap,true)/*详情*/
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


        /*发货查询服务--请求数据--获取表格数据*/
        this.getColumnData=function (table,record){
            if(cache===null){
                return false;
            }else if(!table && !record){
                return false;
            }

            /*如果存在模型*/
            var data= $.extend(true,{},table.list1_config.config.ajax.data),
                temp_param;

            /*适配参数*/
            for(var i in record){
                if(i==='startTime' || i==='endTime'){
                    if(record[i]===''){
                        delete data[i];
                    }else{
                        data[i]=record[i];
                    }
                }else if(i==='organizationId' || i==='currentId'){
                    if(record[i]===''){
                        data['organizationIdReceiver']='';
                        data['organizationIdSender']='';
                        return false;
                    }else{
                        if(i==='organizationId'){
                            data['organizationIdReceiver']=record[i];
                        }else if(i==='currentId'){
                            data['organizationIdSender']=record[i];
                        }
                    }
                }
            }

            /*参数赋值*/
            table.list1_config.config.ajax.data=data;
            if(table.list_table===null){
                temp_param=cache.loginMap.param;
                table.list1_config.config.ajax.data['adminId']=temp_param.adminId;
                table.list1_config.config.ajax.data['token']=temp_param.token;
                /*初始请求*/
                table.list_table=self.$admin_list_wrap.DataTable(table.list1_config.config);
                /*调用列控制*/
                dataTableColumnService.initColumn(table.tablecolumn,table.list_table);
                /*调用按钮操作*/
                dataTableItemActionService.initItemAction(table.tableitemaction);
            }else {
                table.list_table.ajax.config(table.list1_config.config.ajax).load();
            }
        };
        /*发货查询服务--过滤表格数据*/
        this.filterDataTable=function (table,record) {
            if(table.list_table===null){
                return false;
            }
            table.list_table.search(record.filter).columns().draw();
        };
        /*发货查询服务--时间查询*/
        this.datePicker=function (record) {
            datePicker97Service.datePickerRange(record,{
                $node1:self.$search_startTime,
                $node2:self.$search_endTime,
                format:'%y-%M-%d',
                position:{
                    left:0,
                    top:2
                }
            });
        };
        /*发货查询服务--操作按钮*/
        this.doItemAction=function (mode,config) {
            var id=config.id,
                action=config.action;

            if(action==='detail'){
                self.queryDetail(id);
            }
        };
        /*发货查询服务--查询详情*/
        this.queryDetail=function (id) {
            if(cache===null){
                return false;
            }
            if(typeof id==='undefined'){
                return false;
            }

            var param=$.extend(true,{},cache.loginMap.param);
            /*判断参数*/
            param['id']=id;


            toolUtil
                .requestHttp({
                    url:/*'/device/delivery/view'*/'json/test.json',
                    method:'post',
                    set:true,
                    debug:true/*测试模式*/,
                    data:param
                })
                .then(function(resp){
                        /*测试代码*/
                        var resp=self.testGetEquipmentDetail();


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
                                    loginService.outAction();
                                }
                            }else{
                                /*加载数据*/
                                var result=data.result;
                                if(typeof result!=='undefined'){
                                    var delivery=result.delivery,
                                        deviceImeis=result.deviceImeis,
                                        str='',
                                        detail_map={
                                            'deviceType':'设备类型',
                                            'deliveryQuantity':'发货数量',
                                            'logistics':'物流',
                                            'consigneeName':'收货人',
                                            'deviceImeis':'设置机器码列表',
                                            'remark':'备注',
                                            'deviceImei':'机器码',
                                            'status':'状态'
                                        },
                                        statusmap={
                                            0:"<span class='g-c-gray6'>正常</span>",
                                            1:"<span class='g-c-gray12'>已用</span>"
                                        },
                                        typemap={
                                            1:"S67",
                                            2:"T6",
                                            3:"其他"
                                        };
                                    if(delivery){
                                        /*查看*/
                                        for(var j in delivery){
                                            if(typeof detail_map[j]!=='undefined'){
                                                if(j==='deviceType'){
                                                    var temptype=parseInt(delivery[j],10);
                                                    str+='<tr><td colspan="2" class="g-t-r">'+detail_map[j]+':</td><td class="g-t-l g-c-blue3">'+typemap[temptype]+'</td></tr>';
                                                }else if(j==='status'){
                                                    var tempstatus=parseInt(delivery[j],10);
                                                    str+='<tr><td colspan="2" class="g-t-r">'+detail_map[j]+':</td><td class="g-t-l">'+statusmap[tempstatus]+'</td></tr>';
                                                }else{
                                                    str+='<tr><td colspan="2" class="g-t-r">'+detail_map[j]+':</td><td  class="g-t-l">'+delivery[j]+'</td></tr>';
                                                }
                                            }
                                        }
                                    }
                                    if(deviceImeis){
                                        var len=deviceImeis.length;
                                        if(len!==0){
                                            var i=0,
                                                tempimei;
                                            str+='<tr><th colspan="3" class="g-t-c">'+detail_map["deviceImeis"]+'</th></tr><tr><th class="g-t-c">序号</th><th class="g-t-c">机器码</th><th class="g-t-c">状态</th></tr>';
                                            for(i;i<len;i++){
                                                tempimei=deviceImeis[i];
                                                str+='<tr><td class="g-t-c">'+(i + 1)+'</td><td class="g-t-l">'+tempimei["deviceImei"]+'</td><td class="g-t-l">'+statusmap[tempimei["status"]]+'</td></tr>';
                                            }
                                        }
                                    }
                                    if(str!==''){
                                        $(str).appendTo(self.$admin_senddetail_show.html(''));
                                        /*显示弹窗*/
                                        self.toggleModal({
                                            display:'show',
                                            area:'senddetail'
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
                            console.log('查看发货失败');
                        }
                    });
        };


        /*弹出层服务*/
        this.toggleModal=function (config,fn) {
            var temp_timer=null,
                type_map={
                    'send':self.$admin_send_dialog,
                    'senddetail':self.$admin_senddetail_dialog
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
                if(config.area==='send'){
                    self.clearFormDelay();
                }
            }
        };



        /*导航服务--获取虚拟挂载点*/
        this.getRoot=function (record) {
            if(cache===null){
                loginService.outAction();
                record['currentId']='';
                record['currentName']='';
                return false;
            }
            var islogin=loginService.isLogin(cache);
            if(islogin){
                var logininfo=cache.loginMap;
                record['currentId']=logininfo.param.organizationId;
                record['currentName']=logininfo.username;
            }else{
                /*退出系统*/
                cache=null;
                loginService.outAction();
                record['currentId']='';
                record['currentName']='';
            }
        };
        /*导航服务--获取导航*/
        this.getSubMenu=function (config) {
            if(cache){
                var param=$.extend(true,{},cache.loginMap.param);
                param['isShowSelf']=0;
                var layer,
                    id,
                    $wrap;

                /*初始化加载*/
                if(!config.$reqstate){
                    layer=0;
                    /*根目录则获取新配置参数*/
                    id=param['organizationId'];
                    $wrap=self.$admin_equipment_submenu;
                    config.record.organizationId=id;
                    config.record.organizationName=cache.loginMap.username;
                    /*查询货物*/
                    self.queryIMEI(id);
                    if(config.table && config.table.list_table===null && config.record){
                        self.getColumnData(config.table,config.record);
                    }
                }else{
                    /*非根目录则获取新请求参数*/
                    layer=config.$reqstate.attr('data-layer');
                    $wrap=config.$reqstate.next();
                    id=config.$reqstate.attr('data-id');

                    /*判断是否是合法的节点*/
                    if(layer>=BASE_CONFIG.submenulimit){
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
                                        loginService.outAction();
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
                                                $wrap.html('');
                                                /*清除显示下级菜单导航图标*/
                                                if(config.$reqstate){
                                                    config.$reqstate.attr({
                                                        'data-isrequest':true
                                                    }).removeClass('sub-menu-title sub-menu-titleactive');
                                                }
                                            }else{
                                                /*数据集合，最多嵌套层次*/
                                                str=self.resolveSubMenu(list,BASE_CONFIG.submenulimit,{
                                                    layer:layer,
                                                    id:id
                                                });
                                                if(str!==''){
                                                    $(str).appendTo($wrap.html(''));
                                                }
                                                if(layer!==0 && config.$reqstate){
                                                    config.$reqstate.attr({
                                                        'data-isrequest':true
                                                    });
                                                }
                                            }
                                        }else{
                                            $wrap.html('');
                                        }
                                    }else{
                                        if(layer===0){
                                            $wrap.html('');
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
                            $wrap.html('');
                        });
            }else{
                /*退出系统*/
                cache=null;
                loginService.outAction();
            }
        };
        /*导航服务--解析导航--开始解析*/
        this.resolveSubMenu=function (obj,limit,config) {
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
                        str+=self.doItemSubMenu(curitem,{
                                flag:false,
                                limit:limit,
                                layer:layer,
                                parentid:config.id
                            })+'</li>';
                    }else{
                        str+=self.doItemSubMenu(curitem,{
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
        this.doItemSubMenu=function (obj,config) {
            var curitem=obj,
                id=curitem["id"],
                label=curitem["fullName"],
                str='',
                flag=config.flag,
                layer=config.layer,
                parentid=config.parentid;

            if(flag){
                str='<li><a data-isrequest="false" data-parentid="'+parentid+'" data-layer="'+layer+'" data-id="'+id+'" class="sub-menu-title" href="#" title="">'+label+'</a>';
            }else{
                str='<li><a data-parentid="'+parentid+'" data-layer="'+layer+'" data-id="'+id+'" href="#" title="">'+label+'</a></li>';
            }
            return str;
        };
        /*导航服务--显示隐藏机构*/
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
                temp_id=$this.attr('data-id'),
                temp_label=$this.html();

            if(typeof temp_id==='undefined'){
                return false;
            }


            /*模型缓存*/
            var record=config.record;

            /*变更操作记录模型--激活高亮*/
            record.organizationId=temp_id;
            record.organizationName=temp_label;
            /*查询货物*/
            self.queryIMEI(temp_id);

            /*变更操作记录模型--激活高亮*/
            if(record.current===null){
                record.current=$this;
            }else{
                record.prev=record.current;
                record.current=$this;
                record.prev.removeClass('sub-menuactive');
            }
            record.current.addClass('sub-menuactive');

            self.getColumnData(config.table,config.record);

            /*查询子集*/
            haschild=$this.hasClass('sub-menu-title');
            if(haschild){
                $child=$this.next();
                /*是否已经加载过数据*/
                isrequest=$this.attr('data-isrequest');
                if(isrequest==='false'){
                    /*重新加载*/
                    config['$reqstate']=$this;
                    self.getSubMenu(config);
                    /*切换显示隐藏*/
                    if($child.hasClass('g-d-showi')){
                        $child.removeClass('g-d-showi');
                        $this.removeClass('sub-menu-titleactive');
                    }else{
                        $child.addClass('g-d-showi');
                        $this.addClass('sub-menu-titleactive');
                    }
                }else{
                    /*切换显示隐藏*/
                    if($child.hasClass('g-d-showi')){
                        $child.removeClass('g-d-showi');
                        $this.removeClass('sub-menu-titleactive');
                    }else{
                        $child.addClass('g-d-showi');
                        $this.addClass('sub-menu-titleactive');
                    }
                }
            }
        };



        /*IMEI服务--进货库获取货物*/
        this.queryIMEI=function (id) {
            if(!cache){
                return false;
            }
            if(typeof id==='undefined'){
                return false;
            }
            var param=$.extend(true,{},cache.loginMap.param);

            param['organizationId']=id;
            toolUtil
                .requestHttp({
                    url:/*'/device/stock/list'*/'json/test.json',
                    method:'post',
                    set:true,
                    debug:true,/*测试模式*/
                    data:param
                })
                .then(function(resp){
                        /*测试代码*/
                        var resp=self.testGetIMEI();

                        var data=resp.data,
                            status=parseInt(resp.status,10);
                        if(status===200){
                            var code=parseInt(data.code,10),
                                message=data.message;
                            if(code!==0){
                                if(typeof message !=='undefined' && message!==''){
                                    console.log(message);
                                }

                                if(code===999){
                                    /*退出系统*/
                                    cache=null;
                                    loginService.outAction();
                                }
                            }else{
                                /*加载数据*/
                                var result=data.result;
                                if(typeof result!=='undefined'){
                                    var list=result.list,
                                        str='';
                                    if(list){
                                        var len=list.length,
                                            i=0,
                                            j=1,
                                            item=5,
                                            count=len%item;

                                        if(count!==0){
                                            count=(item - count) + 1;
                                        }

                                        if(len===0){
                                            self.$admin_imei_list.html('');
                                        }else{
                                            /*数据集合，最多嵌套层次*/
                                            for(i;i<len;i++){
                                                if(j===1 && i===0){
                                                    str+='<tr><td><label data-id="'+list[i]["id"]+'" data-deviceImei="'+list[i]["deviceImei"]+'"><input name="imei_list"  data-id="'+list[i]["id"]+'" data-deviceImei="'+list[i]["deviceImei"]+'" type="checkbox" />'+list[i]["deviceImei"]+'</label></td>';
                                                }else if(j%item===0){
                                                    str+='<td><label data-id="'+list[i]["id"]+'" data-deviceImei="'+list[i]["deviceImei"]+'"><input name="imei_list"  data-id="'+list[i]["id"]+'" data-deviceImei="'+list[i]["deviceImei"]+'" type="checkbox" />'+list[i]["deviceImei"]+'</label></td></tr><tr>';
                                                }else{
                                                    if(i===len - 1){
                                                        if(count!==0){
                                                            str+='<td colspan="'+count+'"><label data-id="'+list[i]["id"]+'" data-deviceImei="'+list[i]["deviceImei"]+'"><input name="imei_list"  data-id="'+list[i]["id"]+'" data-deviceImei="'+list[i]["deviceImei"]+'" type="checkbox" />'+list[i]["deviceImei"]+'</label></td>';
                                                        }else{
                                                            str+='<td><label data-id="'+list[i]["id"]+'" data-deviceImei="'+list[i]["deviceImei"]+'"><input name="imei_list"  data-id="'+list[i]["id"]+'" data-deviceImei="'+list[i]["deviceImei"]+'" type="checkbox" />'+list[i]["deviceImei"]+'</label></td>';
                                                        }
                                                    }else{
                                                        str+='<td><label data-id="'+list[i]["id"]+'" data-deviceImei="'+list[i]["deviceImei"]+'"><input name="imei_list"  data-id="'+list[i]["id"]+'" data-deviceImei="'+list[i]["deviceImei"]+'" type="checkbox" />'+list[i]["deviceImei"]+'</label></td>';
                                                    }
                                                }
                                                j++;
                                            }
                                            if(str!==''){
                                                str+='</tr>';
                                                $(str).appendTo(self.$admin_imei_list.html(''));
                                            }
                                        }
                                    }else{
                                        self.$admin_imei_list.html('');
                                    }
                                }else{
                                    self.$admin_imei_list.html('');
                                }
                            }
                        }
                    },
                    function(resp){
                        var message=resp.data.message;
                        if(typeof message !=='undefined'&&message!==''){
                            console.log(message);
                        }else{
                            console.log('请货物失败');
                        }
                        self.$admin_imei_list.html('');
                    });
        };
        /*IMEI服务--清除IMEI数据*/
        this.clearIMEI=function (send) {
            if(!send){
                return false;
            }
            /*存在数据模型则清除模型*/
            if(send.deviceImeis!==''){
                self.$admin_imei_list.find('input:checked').each(function () {
                    $(this).prop({
                        'checked':false
                    });
                });
                /*清除模型*/
                send.deviceImeis='';
            }
        };
        /*IMEI服务--获取IMEI数据*/
        this.getIMEI=function (send) {
            if(!send){
                return false;
            }
            /*清除选中*/
            var res=[];
            self.$admin_imei_list.find('input:checked').each(function () {
                res.push($(this).attr('data-deviceImei'));
            });
            /*清除模型*/
            if(res.length!==0){
                send.deviceImeis=res.join(',');
            }else{
                send.deviceImeis='';
            }
        };




        /*表单类服务--执行延时任务序列*/
        this.addFormDelay=function (config) {
            /*映射对象*/
            var type=config.type,
                type_map={
                    'send':{
                        'timeid':sendform_reset_timer,
                        'dom':self.$admin_send_reset
                    }
                };
            /*执行延时操作*/
            type_map[type]['timeid']=$timeout(function(){
                /*触发重置表单*/
                type_map[type]['dom'].trigger('click');
            },0);
        };
        /*表单类服务--清除延时任务序列*/
        this.clearFormDelay=function (did) {
            if(did  &&  did!==null){
                $timeout.cancel(did);
                did=null;
            }else{
                /*如果存在延迟任务则清除延迟任务*/
                if(sendform_reset_timer!==null){
                    $timeout.cancel(sendform_reset_timer);
                    sendform_reset_timer=null;
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
                if(type==='send'){
                    /*清除成员数据*/
                    var send=data[type];
                    for(var j in send){
                        if(j==='deviceType'){
                            send[j]=1;
                        }else if(j==='imei'){
                            send[j]=false;
                        }else{
                            send[j]='';
                        }
                    }
                    self.clearIMEI(send);
                }
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
            if(type ==='role' || type ==='rolegroup'){
                /*重置模型*/
                self.clearFormData(config[type]);
                /*重置提示信息*/
                self.clearFormValid(config.forms);
            }else if(type ==='send'){
                /*特殊情况--发货*/
                self.clearFormData(config,type);
                /*重置提示信息*/
                self.clearFormValid(config.forms);
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
                        'send':'发货'
                    };

                /*适配参数*/
                if(type==='send'){
                    action='add';
                    var send=config['send'];
                    for(var i in send){
                        if(i!=='imei'){
                            param[i]=send[i];
                        }
                    }

                    param['organizationIdSender']=config.record.currentId;
                    param['organizationIdReceiver']=config.record.organizationId;
                    param['status']=0;
                    req_config['url']='/device/delivery/add';
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
                                        loginService.outAction();
                                    }
                                    return false;
                                }else{
                                    /*操作成功即加载数据*/
                                    /*to do*/
                                    if(action==='add'){
                                        /*重新加载侧边栏数据*/
                                        if(type==='send'){
                                            self.getColumnData(config.table,config.record);
                                        }
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
                loginService.outAction();
            }
        };



        /*测试服务--获取设备列表*/
        this.testGetEquipmentList=function () {
            return {
                message:'ok',
                code:0,
                result:Mock.mock({
                    'count':80,
                    'list|5-12':[{
                        "id":/[0-9]{1,2}/,
                        "consigneeName":/(周一|杨二|张三|李四|王五|赵六|马七|朱八|陈九){1}/,
                        "logistics":/[0-9a-zA-Z]{5,10}/,
                        "deliveryQuantity":/[0-9]{1,5}/,
                        "status":/[0-1]{1}/,
                        "addTime":moment().format('YYYY-MM-DD HH:mm:ss'),
                        "deviceType":/[1-3]{1}/
                    }]
                })
            };
        };
        /*测试服务--获取IMEI码*/
        this.testGetIMEI=function () {
            return {
                 status:200,
                 data:{
                     message:'ok',
                     code:0,
                     result:Mock.mock({
                         'list|10-50':[{
                             "id":/[0-9]{1,2}/,
                             "deviceImei":/[0-9a-zA-Z]{5,10}/
                         }]
                     })
                 }
            };
        };
        /*测试服务--获取IMEI码*/
        this.testGetEquipmentDetail=function () {
            var remark_info=/('最近太忙了，确认晚了，东西是很好的，呵呵，谢了。'|'物流公司的态度比较差,建议换一家！不过掌柜人还不错！'|'呵，货真不错，老公很喜欢！'|'很好的卖家，谢谢喽。我的同事们都很喜欢呢。下次再来哦 ！'|'掌柜人不错，质量还行，服务很算不错的。'|'没想到这么快就到了，尺寸正好，老板态度很好。'|'还不错，质量挺好的，速度也快！'|'终于找到家好店，服务好，质量不错，下次有机会再来买。'|'卖家人很好 这个还没用 看包装应该不错'|'店已经收藏了很久，不过是第一次下手。应该说还不错。'|'第二次来买了，货比我想像中要好！！老板人表扬下。'|'包装看起来很好，包得很用心，相信货一定很好，谢谢了！'|'货超值，呵，下次再来。帮你做个广告，朋友们：这家店的货值。'|'一个字！！值！！！'|'掌柜的服务态度真好，发货很快。商品质量也相当不错。太喜欢了，谢谢！'|'好卖家，真有耐心，我终于买到想要的东西了。谢谢卖家。'|'掌柜太善良了，真是干一行懂一行呀。在掌柜的指导下我都快变内行人士了！'|'卖家服务真周到。以后带同事一起来。'|'货到了，比图片上看到的好多了3Q！'|'忠心地感谢你，让我买到了梦寐以求的宝贝，太感谢了！'|'价格大众化，YY质量很好呀,款式、面料我都挺满意的．如果有需要我还会继续光顾你的店铺！'){1}/;

            return {
                status:200,
                data:{
                    message:'ok',
                    code:0,
                    result:Mock.mock({
                        'delivery|1':[{
                            "id":/[0-9]{1,2}/,
                            "consigneeName":/(周一|杨二|张三|李四|王五|赵六|马七|朱八|陈九){1}/,
                            "logistics":/[0-9a-zA-Z]{5,10}/,
                            "deliveryQuantity":/[0-9]{1,5}/,
                            "remark":remark_info,
                            "addTime":moment().format('YYYY-MM-DD HH:mm:ss'),
                            "deviceType":/[1-3]{1}/
                        }],
                        'deviceImeis|1-10':[{
                            "status":/[0-1]{1}/,
                            "deviceImei":/[0-9a-zA-Z]{5,10}/
                        }]
                    })
                }
            };
        };

    }]);