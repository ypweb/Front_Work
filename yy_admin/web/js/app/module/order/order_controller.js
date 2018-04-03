/*首页控制器*/
angular.module('app')
    .controller('OrderController', ['orderService','toolUtil',function(orderService,toolUtil){
        var self=this;

        /*模型--操作权限列表*/
        this.powerlist=orderService.getCurrentPower();


        /*jquery dom缓存:主要是切换路由时，创建的dom缓存引用与现有的dom引用不一致，需要加载视图更新现有dom引用*/
        var jq_dom={
            $submenu_scroll_wrap:$('#submenu_scroll_wrap'),
            $admin_order_submenu:$('#admin_order_submenu'),
            $admin_table_checkcolumn:$('#admin_table_checkcolumn'),
            $admin_page_wrap:$('#admin_page_wrap'),
            $admin_list_wrap:$('#admin_list_wrap'),
            $admin_list_colgroup:$('#admin_list_colgroup'),
            $admin_batchlist_wrap:$('#admin_batchlist_wrap'),
            $search_startTime:$('#search_startTime'),
            $search_endTime:$('#search_endTime'),
            $admin_orderdetail_dialog:$('#admin_orderdetail_dialog'),
            $admin_orderdetail_show:$('#admin_orderdetail_show')
        };
        /*切换路由时更新dom缓存*/
        orderService.initJQDom(jq_dom);



        /*模型--操作记录*/
        this.record={
            iscroll_flag:true/*是否开启滚动条调用*/,
            filter:'',
            startTime:'',
            endTime:'',
            searchWord:'',
            organizationId:'',
            prev:null/*菜单操作:上一次操作菜单*/,
            current:null/*菜单操作:当前操作菜单*/,
            currentId:'',
            currentName:''
        };


        /*模型--表格缓存*/
        this.table={
            list1_page:{
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
                        url:toolUtil.adaptReqUrl('/organization/goodsorder/list')/*'json/test.json'*/,
                        dataType:'JSON',
                        method:'post',
                        dataSrc:function ( json ) {
                            /*测试代码*/
                            /*var json=orderService.testGetOrderList();*/


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
                                jq_dom.$admin_page_wrap.pagination({
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
                                jq_dom.$admin_page_wrap.pagination({
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
                                        orderService.getColumnData(self.table,self.record.role);
                                    }
                                });

                                var list=result.list;
                                if(list){
                                    return list;
                                }else{
                                    return [];
                                }
                            }else{
                                /*重置分页*/
                                self.table.list1_page.total=0;
                                self.table.list1_page.page=1;
                                jq_dom.$admin_page_wrap.pagination({
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
                    order:[[1, "desc" ]],
                    columns: [
                        {
                            "data":"merchantName"
                        },
                        {
                            "data":"merchantPhone",
                            "render":function(data, type, full, meta ){
                                return toolUtil.phoneFormat(data);
                            }
                        },
                        {
                            "data":"orderNumber"
                        },
                        {
                            "data":"totalMoney",
                            "render":function(data, type, full, meta ){
                                return toolUtil.moneyCorrect(data,12)[0];
                            }
                        },
                        {
                            "data":"orderState",
                            "render":function(data, type, full, meta ){
                                var stauts=parseInt(data,10),
                                    statusmap={
                                        0:"待付款",
                                        1:"取消订单",
                                        6:"待发货",
                                        9:"待收货",
                                        20:"待评价",
                                        21:"已评价"
                                    },
                                    str;

                                if(stauts===0){
                                    str='<div class="g-c-blue3">'+statusmap[stauts]+'</div>';
                                }else if(stauts===1){
                                    str='<div class="g-c-red1">'+statusmap[stauts]+'</div>';
                                }else if(stauts===6 || stauts===9 || stauts===20){
                                    str='<div class="g-c-warn">'+statusmap[stauts]+'</div>';
                                }else if(stauts===21){
                                    str='<div class="g-c-green1">'+statusmap[stauts]+'</div>';
                                }else{
                                    str='<div class="g-c-gray6">其他</div>';
                                }
                                return str;
                            }
                        },
                        {
                            "data":"paymentType",
                            "render":function(data, type, full, meta ){
                                if(typeof data!=='undefined'){
                                    var stauts=parseInt(data,10),
                                        statusmap={
                                            1:"微信",
                                            2:"支付宝",
                                            3:"其它"
                                        };
                                    return '<div class="g-c-blue3">'+statusmap[stauts]+'</div>'||'';
                                }else{
                                    return '';
                                }
                            }
                        },
                        {
                            "data":"orderTime"
                        },
                        {
                            /*to do*/
                            "data":"id",
                            "render":function(data, type, full, meta ){
                                 var btns='';

                                 /*查看订单*/
                                 if(self.powerlist.order_details){
                                    btns+='<span data-action="detail" data-id="'+data+'"  class="btn-operate">查看</span>';
                                 }
                                 return btns;
                            }
                        }
                    ]
                }
            },
            list_table:null,
            /*列控制*/
            tablecolumn:{
                init_len:8/*数据有多少列*/,
                column_flag:true,
                ischeck:false,/*是否有全选*/
                columnshow:true,
                $column_wrap:jq_dom.$admin_table_checkcolumn/*控制列显示隐藏的容器*/,
                $bodywrap:jq_dom.$admin_batchlist_wrap/*数据展现容器*/,
                hide_header:['商户名称','手机号码','订单号','订单总价','订单状态','支付类型','订单时间','操作'],
                hide_list:[5,6]/*需要隐藏的的列序号*/,
                hide_len:2,
                column_api:{
                    isEmpty:function () {
                        if(self.table.list_table===null){
                            return true;
                        }
                        return self.table.list_table.data().length===0;
                    }
                },
                $colgroup:jq_dom.$admin_list_colgroup/*分组模型*/,
                $column_btn:jq_dom.$admin_table_checkcolumn.prev(),
                $column_ul:jq_dom.$admin_table_checkcolumn.find('ul')
            },
            /*按钮*/
            tableitemaction:{
                $bodywrap:jq_dom.$admin_batchlist_wrap,
                itemaction_api:{
                    doItemAction:function(config){
                        orderService.doItemAction({
                            record:self.record,
                            table:self.table
                        },config);
                    }
                }
            }
        };


        /*初始化服务--虚拟挂载点，或者初始化参数*/
        orderService.getRoot(self.record);
        /*初始化服务--日历查询*/
        orderService.datePicker(this.record);



        /*菜单服务--初始化菜单*/
        this.initSubMenu=function () {
            orderService.getSubMenu({
                table:self.table,
                record:self.record
            });
        };
        /*菜单服务--显示隐藏菜单*/
        this.toggleSubMenu=function (e) {
            orderService.toggleSubMenu(e,{
                table:self.table,
                record:self.record
            });
        };


        /*数据服务--过滤数据*/
        this.filterDataTable=function () {
            orderService.filterDataTable(self.table,self.record);
        };


        /*查询订单*/
        this.queryOrder=function () {
            orderService.getColumnData(self.table,self.record);
        };
        
        /*清除查询条件*/
        this.clearOrder=function () {
            orderService.clearOrder({
                record:self.record
            });
        };


        /*弹出层显示隐藏*/
        this.toggleModal=function (config) {
            orderService.toggleModal(config);
        };


    }]);