/*首页控制器*/
angular.module('app')
    .controller('FinanceController', ['financeService','toolUtil',function(financeService,toolUtil){
        var self=this;

        /*模型--操作权限列表*/
        this.powerlist=financeService.getCurrentPower();


        /*jquery dom缓存:主要是切换路由时，创建的dom缓存引用与现有的dom引用不一致，需要加载视图更新现有dom引用*/
        var jq_dom={
            $admin_finance_submenu:$('#admin_finance_submenu'),

            $admin_table1_checkcolumn:$('#admin_table1_checkcolumn'),
            $admin_table2_checkcolumn:$('#admin_table2_checkcolumn'),
            $admin_table3_checkcolumn:$('#admin_table3_checkcolumn'),
            $admin_table4_checkcolumn:$('#admin_table4_checkcolumn'),

            $admin_page1_wrap:$('#admin_page1_wrap'),
            $admin_page2_wrap:$('#admin_page2_wrap'),
            $admin_page3_wrap:$('#admin_page3_wrap'),
            $admin_page4_wrap:$('#admin_page4_wrap'),

            $admin_list1_wrap:$('#admin_list1_wrap'),
            $admin_list2_wrap:$('#admin_list2_wrap'),
            $admin_list3_wrap:$('#admin_list3_wrap'),
            $admin_list4_wrap:$('#admin_list4_wrap'),

            $admin_list1_colgroup:$('#admin_list1_colgroup'),
            $admin_list2_colgroup:$('#admin_list2_colgroup'),
            $admin_list3_colgroup:$('#admin_list3_colgroup'),
            $admin_list4_colgroup:$('#admin_list4_colgroup'),

            $admin_batchlist1_wrap:$('#admin_batchlist1_wrap'),
            $admin_batchlist2_wrap:$('#admin_batchlist2_wrap'),
            $admin_batchlist3_wrap:$('#admin_batchlist3_wrap'),
            $admin_batchlist4_wrap:$('#admin_batchlist4_wrap')
        };
        /*切换路由时更新dom缓存*/
        financeService.initJQDom(jq_dom);


        /*模型--操作记录*/
        this.record={
            theme:'profit',
            area:'count',
            type:'1',
            filter1:'',
            filter2:'',
            filter3:'',
            filter4:'',
            organizationId:'',
            organizationName:'',
            prev:null/*菜单操作:上一次操作菜单*/,
            current:null/*菜单操作:当前操作菜单*/
        };


        /*模型--表格缓存*/
        this.table={
            list1_page:{
                page:1,
                pageSize:20,
                total:0
            },
            list2_page:{
                page:1,
                pageSize:20,
                total:0
            },
            list3_page:{
                page:1,
                pageSize:20,
                total:0
            },
            list4_page:{
                page:1,
                pageSize:20,
                total:0
            },
            list1_config:{
                config:{
                    processing:true,/*大消耗操作时是否显示处理状态*/
                    deferRender:true,/*是否延迟加载数据*/
                    autoWidth:true,/*是否*/
                    paging:false,
                    ajax:{
                        url:toolUtil.adaptReqUrl('/finance/profit/stats/list'),
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
                                    toolUtil.loginTips({
                                        clear:true,
                                        reload:true
                                    });
                                }
                                return [];
                            }
                            var result=json.result;
                            if(typeof result==='undefined'){
                                /*重置分页*/
                                self.table.list1_page.total=0;
                                self.table.list1_page.page=1;
                                jq_dom.$admin_page1_wrap.pagination({
                                    pageNumber:self.table.list1_page.page,
                                    pageSize:self.table.list1_page.pageSize,
                                    total:self.table.list1_page.total
                                });
                                return [];
                            }

                            if(result){
                                /*设置分页*/
                                self.table.list1_page.total=result.count;
                                /*分页调用*/
                                jq_dom.$admin_page1_wrap.pagination({
                                    pageNumber:self.table.list1_page.page,
                                    pageSize:self.table.list1_page.pageSize,
                                    total:self.table.list1_page.total,
                                    onSelectPage:function(pageNumber,pageSize){
                                        /*再次查询*/
                                        var temp_param=self.table.list1_config.config.ajax.data;
                                        self.table.list1_page.page=pageNumber;
                                        self.table.list1_page.pageSize=pageSize;
                                        temp_param['page']=self.table.list1_page.page;
                                        temp_param['pageSize']=self.table.list1_page.pageSize;
                                        self.table.list1_config.config.ajax.data=temp_param;
                                        financeService.getColumnData(self.table,self.record,'one');
                                    }
                                });

                                var list=result.list;
                                if(list){
                                    var vi=0,
                                        vlen=list.length;
                                    for(vi;vi<vlen;vi++){
                                        if(!list[vi] || list[vi]===null){
                                            return [];
                                        }
                                    }
                                    return list;
                                }else{
                                    return [];
                                }
                            }else{
                                /*重置分页*/
                                self.table.list1_page.total=0;
                                self.table.list1_page.page=1;
                                jq_dom.$admin_page1_wrap.pagination({
                                    pageNumber:self.table.list1_page.page,
                                    pageSize:self.table.list1_page.pageSize,
                                    total:self.table.list1_page.total
                                });
                                return [];
                            }
                        },
                        data:{
                            page:1,
                            pageSize:20
                        }
                    },
                    info:false,
                    dom:'<"g-d-hidei" s>',
                    searching:true,
                    order:[[0, "desc" ],[1, "desc" ]],
                    columns: [
                        {
                            "data":"consigneeName"
                        },
                        {
                            "data":"logistics"
                        },
                        {
                            "data":"deliveryQuantity"
                        },
                        {
                            "data":"status"
                        },
                        {
                            "data":"addTime"
                        },
                        {
                            "data":"deviceType"
                        },
                        {
                            /*to do*/
                            "data":"id",
                            "render":function(data, type, full, meta ){
                                var btns='';

                                /*self.powerlist.deliveryadd*/
                                /*查看发货详情*/
                                if(true){
                                    btns+='<span data-action="detail" data-id="'+data+'"  class="btn-operate">查看</span>';
                                }
                                return btns;
                            }
                        }
                    ]
                }
            },
            list2_config:{
                config:{
                    processing:true,/*大消耗操作时是否显示处理状态*/
                    deferRender:true,/*是否延迟加载数据*/
                    autoWidth:true,/*是否*/
                    paging:false,
                    ajax:{
                        url:toolUtil.adaptReqUrl('/finance/profit/stats/history'),
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
                                    toolUtil.loginTips({
                                        clear:true,
                                        reload:true
                                    });
                                }
                                return [];
                            }
                            var result=json.result;
                            if(typeof result==='undefined'){
                                /*重置分页*/
                                self.table.list2_page.total=0;
                                self.table.list2_page.page=1;
                                jq_dom.$admin_page2_wrap.pagination({
                                    pageNumber:self.table.list2_page.page,
                                    pageSize:self.table.list2_page.pageSize,
                                    total:self.table.list2_page.total
                                });
                                return [];
                            }

                            if(result){
                                /*设置分页*/
                                self.table.list2_page.total=result.count;
                                /*分页调用*/
                                jq_dom.$admin_page2_wrap.pagination({
                                    pageNumber:self.table.list2_page.page,
                                    pageSize:self.table.list2_page.pageSize,
                                    total:self.table.list2_page.total,
                                    onSelectPage:function(pageNumber,pageSize){
                                        /*再次查询*/
                                        var temp_param=self.table.list2_config.config.ajax.data;
                                        self.table.list2_page.page=pageNumber;
                                        self.table.list2_page.pageSize=pageSize;
                                        temp_param['page']=self.table.list2_page.page;
                                        temp_param['pageSize']=self.table.list2_page.pageSize;
                                        self.table.list2_config.config.ajax.data=temp_param;
                                        financeService.getColumnData(self.table,self.record,'two');
                                    }
                                });

                                var list=result.list;
                                if(list){
                                    var vi=0,
                                        vlen=list.length;
                                    for(vi;vi<vlen;vi++){
                                        if(!list[vi] || list[vi]===null){
                                            return [];
                                        }
                                    }
                                    return list;
                                }else{
                                    return [];
                                }
                            }else{
                                /*重置分页*/
                                self.table.list2_page.total=0;
                                self.table.list2_page.page=1;
                                jq_dom.$admin_page2_wrap.pagination({
                                    pageNumber:self.table.list2_page.page,
                                    pageSize:self.table.list2_page.pageSize,
                                    total:self.table.list2_page.total
                                });
                                return [];
                            }
                        },
                        data:{
                            page:1,
                            pageSize:20
                        }
                    },
                    info:false,
                    dom:'<"g-d-hidei" s>',
                    searching:true,
                    order:[[0, "desc" ],[1, "desc" ]],
                    columns: [
                        {
                            "data":"consigneeName"
                        },
                        {
                            "data":"logistics"
                        },
                        {
                            "data":"deliveryQuantity"
                        },
                        {
                            "data":"status"
                        },
                        {
                            "data":"addTime"
                        },
                        {
                            "data":"deviceType"
                        },
                        {
                            /*to do*/
                            "data":"id",
                            "render":function(data, type, full, meta ){
                                var btns='';

                                /*self.powerlist.deliveryadd*/
                                /*查看发货详情*/
                                if(true){
                                    btns+='<span data-action="detail" data-id="'+data+'"  class="btn-operate">查看</span>';
                                }
                                return btns;
                            }
                        }
                    ]
                }
            },
            list3_config:{
                config:{
                    processing:true,/*大消耗操作时是否显示处理状态*/
                    deferRender:true,/*是否延迟加载数据*/
                    autoWidth:true,/*是否*/
                    paging:false,
                    ajax:{
                        url:toolUtil.adaptReqUrl('/finance/profit/clear/list'),
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
                                    toolUtil.loginTips({
                                        clear:true,
                                        reload:true
                                    });
                                }
                                return [];
                            }
                            var result=json.result;
                            if(typeof result==='undefined'){
                                /*重置分页*/
                                self.table.list3_page.total=0;
                                self.table.list3_page.page=1;
                                jq_dom.$admin_page3_wrap.pagination({
                                    pageNumber:self.table.list3_page.page,
                                    pageSize:self.table.list3_page.pageSize,
                                    total:self.table.list3_page.total
                                });
                                return [];
                            }

                            if(result){
                                /*设置分页*/
                                self.table.list3_page.total=result.count;
                                /*分页调用*/
                                jq_dom.$admin_page3_wrap.pagination({
                                    pageNumber:self.table.list3_page.page,
                                    pageSize:self.table.list3_page.pageSize,
                                    total:self.table.list3_page.total,
                                    onSelectPage:function(pageNumber,pageSize){
                                        /*再次查询*/
                                        var temp_param=self.table.list3_config.config.ajax.data;
                                        self.table.list3_page.page=pageNumber;
                                        self.table.list3_page.pageSize=pageSize;
                                        temp_param['page']=self.table.list3_page.page;
                                        temp_param['pageSize']=self.table.list3_page.pageSize;
                                        self.table.list3_config.config.ajax.data=temp_param;
                                        financeService.getColumnData(self.table,self.record,'three');
                                    }
                                });

                                var list=result.list;
                                if(list){
                                    var vi=0,
                                        vlen=list.length;
                                    for(vi;vi<vlen;vi++){
                                        if(!list[vi] || list[vi]===null){
                                            return [];
                                        }
                                    }
                                    return list;
                                }else{
                                    return [];
                                }
                            }else{
                                /*重置分页*/
                                self.table.list3_page.total=0;
                                self.table.list3_page.page=1;
                                jq_dom.$admin_page3_wrap.pagination({
                                    pageNumber:self.table.list3_page.page,
                                    pageSize:self.table.list3_page.pageSize,
                                    total:self.table.list3_page.total
                                });
                                return [];
                            }
                        },
                        data:{
                            page:1,
                            pageSize:20
                        }
                    },
                    info:false,
                    dom:'<"g-d-hidei" s>',
                    searching:true,
                    order:[[0, "desc" ],[1, "desc" ]],
                    columns: [
                        {
                            "data":"consigneeName"
                        },
                        {
                            "data":"logistics"
                        },
                        {
                            "data":"deliveryQuantity"
                        },
                        {
                            "data":"status"
                        },
                        {
                            "data":"addTime"
                        },
                        {
                            "data":"deviceType"
                        },
                        {
                            /*to do*/
                            "data":"id",
                            "render":function(data, type, full, meta ){
                                var btns='';

                                /*self.powerlist.deliveryadd*/
                                /*查看发货详情*/
                                if(true){
                                    btns+='<span data-action="detail" data-id="'+data+'"  class="btn-operate">查看</span>';
                                }
                                return btns;
                            }
                        }
                    ]
                }
            },
            list4_config:{
                config:{
                    processing:true,/*大消耗操作时是否显示处理状态*/
                    deferRender:true,/*是否延迟加载数据*/
                    autoWidth:true,/*是否*/
                    paging:false,
                    ajax:{
                        url:toolUtil.adaptReqUrl('/finance/profit/clear/history'),
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
                                    toolUtil.loginTips({
                                        clear:true,
                                        reload:true
                                    });
                                }
                                return [];
                            }
                            var result=json.result;
                            if(typeof result==='undefined'){
                                /*重置分页*/
                                self.table.list4_page.total=0;
                                self.table.list4_page.page=1;
                                jq_dom.$admin_page4_wrap.pagination({
                                    pageNumber:self.table.list4_page.page,
                                    pageSize:self.table.list4_page.pageSize,
                                    total:self.table.list4_page.total
                                });
                                return [];
                            }

                            if(result){
                                /*设置分页*/
                                self.table.list4_page.total=result.count;
                                /*分页调用*/
                                jq_dom.$admin_page4_wrap.pagination({
                                    pageNumber:self.table.list4_page.page,
                                    pageSize:self.table.list4_page.pageSize,
                                    total:self.table.list4_page.total,
                                    onSelectPage:function(pageNumber,pageSize){
                                        /*再次查询*/
                                        var temp_param=self.table.list4_config.config.ajax.data;
                                        self.table.list4_page.page=pageNumber;
                                        self.table.list4_page.pageSize=pageSize;
                                        temp_param['page']=self.table.list4_page.page;
                                        temp_param['pageSize']=self.table.list4_page.pageSize;
                                        self.table.list4_config.config.ajax.data=temp_param;
                                        financeService.getColumnData(self.table,self.record,'four');
                                    }
                                });

                                var list=result.list;
                                if(list){
                                    var vi=0,
                                        vlen=list.length;
                                    for(vi;vi<vlen;vi++){
                                        if(!list[vi] || list[vi]===null){
                                            return [];
                                        }
                                    }
                                    return list;
                                }else{
                                    return [];
                                }
                            }else{
                                /*重置分页*/
                                self.table.list4_page.total=0;
                                self.table.list4_page.page=1;
                                jq_dom.$admin_page4_wrap.pagination({
                                    pageNumber:self.table.list4_page.page,
                                    pageSize:self.table.list4_page.pageSize,
                                    total:self.table.list4_page.total
                                });
                                return [];
                            }
                        },
                        data:{
                            page:1,
                            pageSize:20
                        }
                    },
                    info:false,
                    dom:'<"g-d-hidei" s>',
                    searching:true,
                    order:[[0, "desc" ],[1, "desc" ]],
                    columns: [
                        {
                            "data":"consigneeName"
                        },
                        {
                            "data":"logistics"
                        },
                        {
                            "data":"deliveryQuantity"
                        },
                        {
                            "data":"status"
                        },
                        {
                            "data":"addTime"
                        },
                        {
                            "data":"deviceType"
                        },
                        {
                            /*to do*/
                            "data":"id",
                            "render":function(data, type, full, meta ){
                                var btns='';

                                /*self.powerlist.deliveryadd*/
                                /*查看发货详情*/
                                if(true){
                                    btns+='<span data-action="detail" data-id="'+data+'"  class="btn-operate">查看</span>';
                                }
                                return btns;
                            }
                        }
                    ]
                }
            },
            list1_table:null,
            list2_table:null,
            list3_table:null,
            list4_table:null,
            /*列控制*/
            table1column:{
                init_len:7/*数据有多少列*/,
                column_flag:true,
                ischeck:false,/*是否有全选*/
                columnshow:true,
                $column_wrap:jq_dom.$admin_table1_checkcolumn/*控制列显示隐藏的容器*/,
                $bodywrap:jq_dom.$admin_batchlist1_wrap/*数据展现容器*/,
                hide_list:[4,5]/*需要隐藏的的列序号*/,
                hide_len:2,
                column_api:{
                    isEmpty:function () {
                        if(self.table.list1_table===null){
                            return false;
                        }
                        return self.table.list1_table.data().length===0;
                    }
                },
                $colgroup:jq_dom.$admin_list1_colgroup/*分组模型*/,
                $column_btn:jq_dom.$admin_table1_checkcolumn.prev(),
                $column_ul:jq_dom.$admin_table1_checkcolumn.find('ul')
            },
            table2column:{
                init_len:7/*数据有多少列*/,
                column_flag:true,
                ischeck:false,/*是否有全选*/
                columnshow:true,
                $column_wrap:jq_dom.$admin_table1_checkcolumn/*控制列显示隐藏的容器*/,
                $bodywrap:jq_dom.$admin_batchlist1_wrap/*数据展现容器*/,
                hide_list:[4,5]/*需要隐藏的的列序号*/,
                hide_len:2,
                column_api:{
                    isEmpty:function () {
                        if(self.table.list1_table===null){
                            return false;
                        }
                        return self.table.list1_table.data().length===0;
                    }
                },
                $colgroup:jq_dom.$admin_list1_colgroup/*分组模型*/,
                $column_btn:jq_dom.$admin_table1_checkcolumn.prev(),
                $column_ul:jq_dom.$admin_table1_checkcolumn.find('ul')
            },
            table3column:{
                init_len:7/*数据有多少列*/,
                column_flag:true,
                ischeck:false,/*是否有全选*/
                columnshow:true,
                $column_wrap:jq_dom.$admin_table1_checkcolumn/*控制列显示隐藏的容器*/,
                $bodywrap:jq_dom.$admin_batchlist1_wrap/*数据展现容器*/,
                hide_list:[4,5]/*需要隐藏的的列序号*/,
                hide_len:2,
                column_api:{
                    isEmpty:function () {
                        if(self.table.list1_table===null){
                            return false;
                        }
                        return self.table.list1_table.data().length===0;
                    }
                },
                $colgroup:jq_dom.$admin_list1_colgroup/*分组模型*/,
                $column_btn:jq_dom.$admin_table1_checkcolumn.prev(),
                $column_ul:jq_dom.$admin_table1_checkcolumn.find('ul')
            },
            table4column:{
                init_len:7/*数据有多少列*/,
                column_flag:true,
                ischeck:false,/*是否有全选*/
                columnshow:true,
                $column_wrap:jq_dom.$admin_table1_checkcolumn/*控制列显示隐藏的容器*/,
                $bodywrap:jq_dom.$admin_batchlist1_wrap/*数据展现容器*/,
                hide_list:[4,5]/*需要隐藏的的列序号*/,
                hide_len:2,
                column_api:{
                    isEmpty:function () {
                        if(self.table.list1_table===null){
                            return false;
                        }
                        return self.table.list1_table.data().length===0;
                    }
                },
                $colgroup:jq_dom.$admin_list1_colgroup/*分组模型*/,
                $column_btn:jq_dom.$admin_table1_checkcolumn.prev(),
                $column_ul:jq_dom.$admin_table1_checkcolumn.find('ul')
            },
            /*按钮*/
            table1itemaction:{
                $bodywrap:jq_dom.$admin_batchlist1_wrap,
                itemaction_api:{
                    doItemAction:function(config){
                        financeService.doItemAction({
                            record:self.record,
                            table:self.table
                        },config);
                    }
                }
            },
            table2itemaction:{
                $bodywrap:jq_dom.$admin_batchlist1_wrap,
                itemaction_api:{
                    doItemAction:function(config){
                        financeService.doItemAction({
                            record:self.record,
                            table:self.table
                        },config);
                    }
                }
            },
            table3itemaction:{
                $bodywrap:jq_dom.$admin_batchlist1_wrap,
                itemaction_api:{
                    doItemAction:function(config){
                        financeService.doItemAction({
                            record:self.record,
                            table:self.table
                        },config);
                    }
                }
            },
            table4itemaction:{
                $bodywrap:jq_dom.$admin_batchlist1_wrap,
                itemaction_api:{
                    doItemAction:function(config){
                        financeService.doItemAction({
                            record:self.record,
                            table:self.table
                        },config);
                    }
                }
            }
        };



        /*模型--tab选项卡*/
        this.tabitem=[{
            name:'分润统计',
            power:self.powerlist.profitdetails,
            type:'profit',
            active:'tabactive'
        },{
            name:'清算统计',
            power:self.powerlist.profitclear,
            type:'clear',
            active:''
        }];



        /*菜单服务--初始化*/
        this.initSubMenu=function () {
            financeService.getSubMenu({
                table:self.table,
                record:self.record
            });
        };
        /*菜单服务--显示隐藏菜单*/
        this.toggleSubMenu=function (e) {
            financeService.toggleSubMenu(e,{
                table:self.table,
                record:self.record
            });
        };
        /*菜单服务--切换菜单主题*/
        this.toggleTab=function (type) {
            self.record.theme=type;
        };


        /*成员服务--过滤数据*/
        this.filterDataTable=function (type) {
            financeService.filterDataTable(self.table,self.record,type);
        };


        /*查询列表*/
        this.queryFinance=function (type) {
            financeService.getColumnData(self.table,self.record,type);
        };
        
        
        /*查询服务--切换类型*/
        this.changeType=function () {
          console.log(self.record.type);
        };



    }]);