/*admin_member:成员设置*/
(function($){
	'use strict';
	$(function(){

		var tableall=null,
			tabledfh=null,
			tabledsh=null,
			tablebfsh=null,
			tableysh=null/*数据展现*/;

		/*初始化数据*/
		if(public_tool.initMap.isrender){
			/*菜单调用*/
			var logininfo=public_tool.initMap.loginMap,
				providerId=decodeURIComponent(logininfo.param.providerId),
				userId=decodeURIComponent(logininfo.param.userId),
				token=decodeURIComponent(logininfo.param.token);

			public_tool.loadSideMenu(public_vars.$mainmenu,public_vars.$main_menu_wrap,{
				url:'../../json/menu.json',
				async:false,
				type:'post',
				datatype:'json'
			});


			/*dom引用和相关变量定义*/
			var $admin_dataall=$('#admin_dataall'),
				$admin_datadfh=$('#admin_datadfh'),
				$admin_datadsh=$('#admin_datadsh'),
				$admin_databfsh=$('#admin_databfsh'),
				$admin_dataysh=$('#admin_dataysh'),
				$search_orderState=$('#search_orderState'),
				$goods_manage_wrapall=$('#goods_manage_wrapall'),
				$goods_manage_wrapdfh=$('#goods_manage_wrapdfh'),
				$goods_manage_wrapdsh=$('#goods_manage_wrapdsh'),
				$goods_manage_wrapbfsh=$('#goods_manage_wrapbfsh'),
				$goods_manage_wrapysh=$('#goods_manage_wrapysh'),
				module_id='yttx-order-manage'/*模块id，主要用于本地存储传值*/,
				dia=dialog({
					zIndex:2000,
					title:'温馨提示',
					okValue:'确定',
					width:300,
					ok:function(){
						this.close();
						return false;
					},
					cancel:false
				})/*一般提示对象*/,
				$admin_page_wrapall=$('#admin_page_wrapall'),
				$admin_page_wrapdfh=$('#admin_page_wrapdfh')/*分页数据*/,
				$admin_page_wrapdsh=$('#admin_page_wrapdsh'),
				$admin_page_wrapbfsh=$('#admin_page_wrapbfsh'),
				$admin_page_wrapysh=$('#admin_page_wrapysh'),
				admin_send_form=document.getElementById('admin_send_form'),
				$admin_send_form=$(admin_send_form),
				$admin_sendid=$('#admin_sendid'),
				$show_send_wrap=$('#show_send_wrap'),
				$admin_trackingNumber=$('#admin_trackingNumber'),
				$admin_shippingExpressId=$('#admin_shippingExpressId'),
				$admin_remark=$('#admin_remark'),
				resetform0=null;


			/*列表请求配置*/
			var ordermanage_pageall={
					page:1,
					pageSize:5,
					total:0
				},
				ordermanage_pagedfh={
					page:1,
					pageSize:5,
					total:0
				},
				ordermanage_pagedsh={
					page:1,
					pageSize:5,
					total:0
				},
				ordermanage_pagebfsh={
					page:1,
					pageSize:5,
					total:0
				},
				ordermanage_pageysh={
					page:1,
					pageSize:5,
					total:0
				},
				ordermanage_configall={
					$goods_manage_wrapall:$goods_manage_wrapall,
					$admin_page_wrapall:$admin_page_wrapall,
					config:{
						processing:true,/*大消耗操作时是否显示处理状态*/
						deferRender:true,/*是否延迟加载数据*/
						autoWidth:true,/*是否*/
						paging:false,
						ajax:{
							url:"http://112.74.207.132:8082/yttx-providerbms-api/goodsorder/list",
							dataType:'JSON',
							method:'post',
							dataSrc:function ( json ) {
								var code=parseInt(json.code,10);
								if(code!==0){
									if(code===999){
										/*清空缓存*/
										public_tool.loginTips(function () {
											public_tool.clear();
											public_tool.clearCacheData();
										});
									}
									console.log(json.message);
									return [];
								}
								var result=json.result;
								if(typeof result==='undefined'){
									return [];
								}
								/*设置分页*/
								ordermanage_pageall.page=result.page;
								ordermanage_pageall.pageSize=result.pageSize;
								ordermanage_pageall.total=result.count;
								/*分页调用*/
								$admin_page_wrapall.pagination({
									pageSize:ordermanage_pageall.pageSize,
									total:ordermanage_pageall.total,
									pageNumber:ordermanage_pageall.page,
									onSelectPage:function(pageNumber,pageSize){
										/*再次查询*/
										var param=ordermanage_configall.config.ajax.data;
										param.page=pageNumber;
										param.pageSize=pageSize;
										ordermanage_configall.config.ajax.data=param;
										getColumnDataall(ordermanage_pageall,ordermanage_configall);
									}
								});
								return result.list;
							},
							data:{
								providerId:providerId,
								userId:userId,
								token:token,
								page:1,
								pageSize:5
							}
						},
						fnDrawCallback:function(){
							mpTotal(this);
						},
						info:false,
						searching:true,
						order: [[ 4, 'desc' ]],
						columns: [
							{
								"data":null,
								"orderable" :false,
								"searchable" :false
							},
							{
								"data":"orderNumber"
							},
							{
								"data":"list",
								"render":function(data, type, full, meta ){
									return orderRender(data);
								}
							},
							{
								"defalutContent":""
							},
							{
								"data":"orderTime"
							},
							{
								"data":"customerName"
							},
							{
								"defalutContent":""
							},
							{
								"data":"orderState",
								"render":function(data, type, full, meta ){
									var stauts=parseInt(data,10),
										statusmap={
											0:"待发货",
											1:"待收货",
											3:"部分收货",
											5:"已收货"
										},
										str='';
									if(stauts===0){
										str='<div class="g-c-warn">'+statusmap[stauts]+'</div>';
									}else if(stauts===1){
										str='<div class="g-c-info">'+statusmap[stauts]+'</div>';
									}else if(stauts===3){
										str='<div class="g-c-gray6">'+statusmap[stauts]+'</div>';
									}else if(stauts===5){
										str='<div class="g-c-succ">'+statusmap[stauts]+'</div>';
									}else{
										str='<div class="g-c-red2">异常</div>';
									}
									return str;
								}
							},
							{
								"data":"id",
								"render":function(data, type, full, meta ){
									var id=parseInt(data,10),
										btns='';

									var status=parseInt(full.orderState,10);
									if(status===0){
										/*需要发货状态*/
										btns+='<span data-action="send" data-id="'+id+'" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-arrow-up"></i>\
											<span>发货</span>\
											</span>';
									}else if(status===1||status===3){
										/*需要查看物流*/
										btns+='<span data-action="logistics" data-id="'+id+'" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-truck"></i>\
											<span>查看物流</span>\
											</span>';
									}
									btns+='<span data-action="select" data-id="'+id+'" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-file-text-o"></i>\
											<span>查看</span>\
											</span>';
									return btns;
								},
								"orderable" : false
							}
						]
					}
				},
				ordermanage_configdfh={
					$goods_manage_wrapdfh:$goods_manage_wrapdfh,
					$admin_page_wrapdfh:$admin_page_wrapdfh,
					config:{
						processing:true,/*大消耗操作时是否显示处理状态*/
						deferRender:true,/*是否延迟加载数据*/
						autoWidth:true,/*是否*/
						paging:false,
						ajax:{
							url:"http://112.74.207.132:8082/yttx-providerbms-api/goodsorder/list",
							dataType:'JSON',
							method:'post',
							dataSrc:function ( json ) {
								var code=parseInt(json.code,10);
								if(code!==0){
									if(code===999){
										/*清空缓存*/
										public_tool.loginTips(function () {
											public_tool.clear();
											public_tool.clearCacheData();
										});
									}
									console.log(json.message);
									return [];
								}
								var result=json.result;
								if(typeof result==='undefined'){
									return [];
								}
								/*设置分页*/
								ordermanage_pagedfh.page=result.page;
								ordermanage_pagedfh.pageSize=result.pageSize;
								ordermanage_pagedfh.total=result.count;
								/*分页调用*/
								$admin_page_wrapdfh.pagination({
									pageSize:ordermanage_pagedfh.pageSize,
									total:ordermanage_pagedfh.total,
									pageNumber:ordermanage_pagedfh.page,
									onSelectPage:function(pageNumber,pageSize){
										/*再次查询*/
										var param=ordermanage_configdfh.config.ajax.data;
										param.page=pageNumber;
										param.pageSize=pageSize;
										ordermanage_configdfh.config.ajax.data=param;
										getColumnDatadfh(ordermanage_pagedfh,ordermanage_configdfh);
									}
								});
								return result.list;
							},
							data:{
								providerId:providerId,
								userId:userId,
								token:token,
								orderState:0,
								page:1,
								pageSize:5
							}
						},
						fnDrawCallback:function(){
							mpTotal(this);
						},
						info:false,
						searching:true,
						order: [[ 4, 'desc' ]],
						columns: [
							{
								"data":null,
								"orderable" :false,
								"searchable" :false
							},
							{
								"data":"orderNumber"
							},
							{
								"data":"list",
								"render":function(data, type, full, meta ){
									return orderRender(data);
								}
							},
							{
								"data":"totalQuantity"
							},
							{
								"data":"orderTime"
							},
							{
								"data":"customerName"
							},
							{
								"defalutContent":""
							},
							{
								"data":"id",
								"render":function(data, type, full, meta ){
									var id=parseInt(data,10),
										btns='';

									var status=parseInt(full.orderState,10);
									if(status===0){
										/*需要发货状态*/
										btns+='<span data-action="send" data-id="'+id+'" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-arrow-up"></i>\
											<span>发货</span>\
											</span>';
									}else if(status===1||status===3){
										/*需要查看物流*/
										btns+='<span data-action="logistics" data-id="'+id+'" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-truck"></i>\
											<span>查看物流</span>\
											</span>';
									}
									btns+='<span data-action="select" data-id="'+id+'" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-file-text-o"></i>\
											<span>查看</span>\
											</span>';
									return btns;
								},
								"orderable" : false
							}
						]
					}
				},
				ordermanage_configdsh={
					$goods_manage_wrapdsh:$goods_manage_wrapdsh,
					$admin_page_wrapdsh:$admin_page_wrapdsh,
					config:{
						processing:true,/*大消耗操作时是否显示处理状态*/
						deferRender:true,/*是否延迟加载数据*/
						autoWidth:true,/*是否*/
						paging:false,
						ajax:{
							url:"http://112.74.207.132:8082/yttx-providerbms-api/goodsorder/list",
							dataType:'JSON',
							method:'post',
							dataSrc:function ( json ) {
								var code=parseInt(json.code,10);
								if(code!==0){
									if(code===999){
										/*清空缓存*/
										public_tool.loginTips(function () {
											public_tool.clear();
											public_tool.clearCacheData();
										});
									}
									console.log(json.message);
									return [];
								}
								var result=json.result;
								if(typeof result==='undefined'){
									return [];
								}
								/*设置分页*/
								ordermanage_pagedsh.page=result.page;
								ordermanage_pagedsh.pageSize=result.pageSize;
								ordermanage_pagedsh.total=result.count;
								/*分页调用*/
								$admin_page_wrapdsh.pagination({
									pageSize:ordermanage_pagedsh.pageSize,
									total:ordermanage_pagedsh.total,
									pageNumber:ordermanage_pagedsh.page,
									onSelectPage:function(pageNumber,pageSize){
										/*再次查询*/
										var param=ordermanage_configdsh.config.ajax.data;
										param.page=pageNumber;
										param.pageSize=pageSize;
										ordermanage_configdsh.config.ajax.data=param;
										getColumnDatadsh(ordermanage_pagedsh,ordermanage_configdsh);
									}
								});
								return result.list;
							},
							data:{
								providerId:providerId,
								userId:userId,
								token:token,
								orderState:1,
								page:1,
								pageSize:5
							}
						},
						fnDrawCallback:function(){
							mpTotal(this);
						},
						info:false,
						searching:true,
						order: [[ 4, 'desc' ]],
						columns: [
							{
								"data":null,
								"orderable" :false,
								"searchable" :false
							},
							{
								"data":"orderNumber"
							},
							{
								"data":"list",
								"render":function(data, type, full, meta ){
									return orderRender(data);
								}
							},
							{
								"defalutContent":""
							},
							{
								"data":"orderTime"
							},
							{
								"data":"customerName"
							},
							{
								"defalutContent":""
							},
							{
								"data":"id",
								"render":function(data, type, full, meta ){
									var id=parseInt(data,10),
										btns='';

									var status=parseInt(full.orderState,10);
									if(status===0){
										/*需要发货状态*/
										btns+='<span data-action="send" data-id="'+id+'" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-arrow-up"></i>\
											<span>发货</span>\
											</span>';
									}else if(status===1||status===3){
										/*需要查看物流*/
										btns+='<span data-action="logistics" data-id="'+id+'" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-truck"></i>\
											<span>查看物流</span>\
											</span>';
									}
									btns+='<span data-action="select" data-id="'+id+'" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-file-text-o"></i>\
											<span>查看</span>\
											</span>';
									return btns;
								},
								"orderable" : false
							}
						]
					}
				},
				ordermanage_configbfsh={
					$goods_manage_wrapbfsh:$goods_manage_wrapbfsh,
					$admin_page_wrapbfsh:$admin_page_wrapbfsh,
					config:{
						processing:true,/*大消耗操作时是否显示处理状态*/
						deferRender:true,/*是否延迟加载数据*/
						autoWidth:true,/*是否*/
						paging:false,
						ajax:{
							url:"http://112.74.207.132:8082/yttx-providerbms-api/goodsorder/list",
							dataType:'JSON',
							method:'post',
							dataSrc:function ( json ) {
								var code=parseInt(json.code,10);
								if(code!==0){
									if(code===999){
										/*清空缓存*/
										public_tool.loginTips(function () {
											public_tool.clear();
											public_tool.clearCacheData();
										});
									}
									console.log(json.message);
									return [];
								}
								var result=json.result;
								if(typeof result==='undefined'){
									return [];
								}
								/*设置分页*/
								ordermanage_pagebfsh.page=result.page;
								ordermanage_pagebfsh.pageSize=result.pageSize;
								ordermanage_pagebfsh.total=result.count;
								/*分页调用*/
								$admin_page_wrapbfsh.pagination({
									pageSize:ordermanage_pagebfsh.pageSize,
									total:ordermanage_pagebfsh.total,
									pageNumber:ordermanage_pagebfsh.page,
									onSelectPage:function(pageNumber,pageSize){
										/*再次查询*/
										var param=ordermanage_configbfsh.config.ajax.data;
										param.page=pageNumber;
										param.pageSize=pageSize;
										ordermanage_configbfsh.config.ajax.data=param;
										getColumnDatabfsh(ordermanage_pagebfsh,ordermanage_configbfsh);
									}
								});
								return result.list;
							},
							data:{
								providerId:providerId,
								userId:userId,
								token:token,
								orderState:3,
								page:1,
								pageSize:5
							}
						},
						fnDrawCallback:function(){
							mpTotal(this);
						},
						info:false,
						searching:true,
						order: [[ 4, 'desc' ]],
						columns: [
							{
								"data":null,
								"orderable" :false,
								"searchable" :false
							},
							{
								"data":"orderNumber"
							},
							{
								"data":"list",
								"render":function(data, type, full, meta ){
									return orderRender(data);
								}
							},
							{
								"data":"totalQuantity"
							},
							{
								"data":"orderTime"
							},
							{
								"data":"customerName"
							},
							{
								"defalutContent":""
							},
							{
								"data":"id",
								"render":function(data, type, full, meta ){
									var id=parseInt(data,10),
										btns='';

									var status=parseInt(full.orderState,10);
									if(status===0){
										/*需要发货状态*/
										btns+='<span data-action="send" data-id="'+id+'" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-arrow-up"></i>\
											<span>发货</span>\
											</span>';
									}else if(status===1||status===3){
										/*需要查看物流*/
										btns+='<span data-action="logistics" data-id="'+id+'" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-truck"></i>\
											<span>查看物流</span>\
											</span>';
									}
									btns+='<span data-action="select" data-id="'+id+'" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-file-text-o"></i>\
											<span>查看</span>\
											</span>';
									return btns;
								},
								"orderable" : false
							}
						]
					}
				},
				ordermanage_configysh={
					$goods_manage_wrapysh:$goods_manage_wrapysh,
					$admin_page_wrapysh:$admin_page_wrapysh,
					config:{
						processing:true,/*大消耗操作时是否显示处理状态*/
						deferRender:true,/*是否延迟加载数据*/
						autoWidth:true,/*是否*/
						paging:false,
						ajax:{
							url:"http://112.74.207.132:8082/yttx-providerbms-api/goodsorder/list",
							dataType:'JSON',
							method:'post',
							dataSrc:function ( json ) {
								var code=parseInt(json.code,10);
								if(code!==0){
									if(code===999){
										/*清空缓存*/
										public_tool.loginTips(function () {
											public_tool.clear();
											public_tool.clearCacheData();
										});
									}
									console.log(json.message);
									return [];
								}
								var result=json.result;
								if(typeof result==='undefined'){
									return [];
								}
								/*设置分页*/
								ordermanage_pageysh.page=result.page;
								ordermanage_pageysh.pageSize=result.pageSize;
								ordermanage_pageysh.total=result.count;
								/*分页调用*/
								$admin_page_wrapysh.pagination({
									pageSize:ordermanage_pageysh.pageSize,
									total:ordermanage_pageysh.total,
									pageNumber:ordermanage_pageysh.page,
									onSelectPage:function(pageNumber,pageSize){
										/*再次查询*/
										var param=ordermanage_configysh.config.ajax.data;
										param.page=pageNumber;
										param.pageSize=pageSize;
										ordermanage_configysh.config.ajax.data=param;
										getColumnDataysh(ordermanage_pageysh,ordermanage_configysh);
									}
								});
								return result.list;
							},
							data:{
								providerId:providerId,
								userId:userId,
								token:token,
								orderState:5,
								page:1,
								pageSize:5
							}
						},
						fnDrawCallback:function(){
							mpTotal(this);
						},
						info:false,
						searching:true,
						order: [[ 4, 'desc' ]],
						columns: [
							{
								"data":null,
								"orderable" :false,
								"searchable" :false
							},
							{
								"data":"orderNumber"
							},
							{
								"data":"list",
								"render":function(data, type, full, meta ){
									return orderRender(data);
								}
							},
							{
								"defalutContent":""
							},
							{
								"data":"orderTime"
							},
							{
								"data":"customerName"
							},
							{
								"defalutContent":""
							},
							{
								"data":"id",
								"render":function(data, type, full, meta ){
									var id=parseInt(data,10),
										btns='';

									var status=parseInt(full.orderState,10);
									if(status===0){
										/*需要发货状态*/
										btns+='<span data-action="send" data-id="'+id+'" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-arrow-up"></i>\
											<span>发货</span>\
											</span>';
									}else if(status===1||status===3){
										/*需要查看物流*/
										btns+='<span data-action="logistics" data-id="'+id+'" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-truck"></i>\
											<span>查看物流</span>\
											</span>';
									}
									btns+='<span data-action="select" data-id="'+id+'" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-file-text-o"></i>\
											<span>查看</span>\
											</span>';
									return btns;
								},
								"orderable" : false
							}
						]
					}
				};


			/*重置表单*/
			admin_send_form.reset();
			

			/*初始化请求*/
			/*请求全部*/
			getColumnDataall(ordermanage_pageall,ordermanage_configall);
			/*请求待付款*/
			getColumnDatadfh(ordermanage_pagedfh,ordermanage_configdfh);
			/*请求未收货*/
			getColumnDatadsh(ordermanage_pagedsh,ordermanage_configdsh);
			/*请求部分收货*/
			getColumnDatabfsh(ordermanage_pagebfsh,ordermanage_configbfsh);
			/*请求已收货*/
			getColumnDataysh(ordermanage_pageysh,ordermanage_configysh);




			/*查询物流公司*/
			$.ajax({
					url:"http://112.74.207.132:8082/yttx-providerbms-api/shipping/express/list",
					method: 'POST',
					dataType: 'json',
					data:{
						shippingMethodId:1,
						providerId:decodeURIComponent(logininfo.param.providerId),
						userId:decodeURIComponent(logininfo.param.userId),
						token:decodeURIComponent(logininfo.param.token)
					}
				})
				.done(function(resp){
					var code=parseInt(resp.code,10);
					if(code!==0){
						console.log(resp.message);
						dia.content('<span class="g-c-bs-warning g-btips-warn">暂无合作物流公司</span>').show();
						setTimeout(function () {
							dia.close();
						},2000);
						$admin_shippingExpressId.html('<option value="" selected>请选择物流公司</option>');
						return false;
					}
					var result=resp['result'];
					if(!result){
						$admin_shippingExpressId.html('<option value="" selected>请选择物流公司</option>');
						return false;
					}
					var list=result['list'],
						len= 0,
						i= 0,
						str='';
					if(!list){
						$admin_shippingExpressId.html('<option value="" selected>请选择物流公司</option>');
						return false;
					}
					len=list.length;
					if(len===0){
						$admin_shippingExpressId.html('<option value="" selected>请选择物流公司</option>');
						return false;
					}
					for(i;i<len;i++){
						if(i===0){
							str+='<option value="" selected>请选择物流公司</option><option value="'+list[i]['id']+'">'+list[i]['name']+'</option>';
						}else{
							str+='<option value="'+list[i]['id']+'">'+list[i]['name']+'</option>';
						}
					}
					$(str).appendTo($admin_shippingExpressId.html(''));

				})
				.fail(function(resp){
					console.log(resp.message);
					dia.content('<span class="g-c-bs-warning g-btips-warn">暂无合作物流公司</span>').show();
					setTimeout(function () {
						dia.close();
					},2000);
				});



			/*事件绑定*/
			/*绑定查看，修改操作*/
			var operate_item;
			$.each([$goods_manage_wrapall,$goods_manage_wrapdfh,$goods_manage_wrapdsh,$goods_manage_wrapbfsh,$goods_manage_wrapysh],function () {
				var own=this;
				this.on('click',function(e){
					e.stopPropagation();
					e.preventDefault();

					var target= e.target,
						nname=target.nodeName.toLowerCase();
					if(nname==='td'||nname==='tr'||nname==='p'||nname==='tbody'||nname==='thead'||nname==='tfoot'){
						return false;
					}

					var $this,
						id,
						action,
						$tr;

					if(nname==='span'||nname==='i'){
						//适配对象
						if(target.className.indexOf('btn')!==-1){
							$this=$(target);
						}else{
							$this=$(target).parent();
						}
						$tr=$this.closest('tr');
						id=$this.attr('data-id');
						action=$this.attr('data-action');

						if(action==='logistics'){
							/*查看物流*/
							window.open("http://www.kuaidi100.com");
						}else if(action==='select'){
							/*查看详情*/
							public_tool.setParams('yttx-order-detail',{
								id:id
							});
							location.href='yttx-order-detail.html';
						}else if(action==='send'){
							if(operate_item){
								operate_item.removeClass('item-lighten');
								operate_item=null;
							}
							operate_item=$tr.addClass('item-lighten');


							/*弹出框*/
							$admin_sendid.val(id);
							$show_send_wrap.modal('show',{
								backdrop:'static'
							});
						}
					}else if(nname==='ul'||nname==='li'||nname==='div'){
						if(nname==='ul'&&target.className.indexOf('admin-order-toggle')!==-1){
							$this=$(target);
						}else if(nname==='li'){
							$this=$(target).parent();
							if(!$this.hasClass('admin-order-toggle')){
								return false;
							}
						}else if(nname==='div'){
							$this=$(target).parent();
							if(!$this.is('li')){
								return false;
							}
							$this=$this.parent();
							if(!$this.hasClass('admin-order-toggle')){
								return false;
							}
						}
						$this.toggleClass('admin-order-mini-subitem1');
					}

				});
			});


			/*绑定状态切换*/
			$search_orderState.on('click','span',function () {
				var $this=$(this),
					type=$this.attr('data-value');
				$this.addClass('g-c-bs-info active').siblings().removeClass('g-c-bs-info active');
				if(type===''){
					/*全部*/
					$admin_dataall.removeClass('g-d-hidei');
					$admin_datadfh.addClass('g-d-hidei');
					$admin_datadsh.addClass('g-d-hidei');
					$admin_databfsh.addClass('g-d-hidei');
					$admin_dataysh.addClass('g-d-hidei');
					/*getColumnDataall(ordermanage_pageall,ordermanage_configall);*/
					return false;
				}else{
					type=parseInt(type,10);
					if(type===0){
						/*待发货*/
						$admin_dataall.addClass('g-d-hidei');
						$admin_datadfh.removeClass('g-d-hidei');
						$admin_datadsh.addClass('g-d-hidei');
						$admin_databfsh.addClass('g-d-hidei');
						$admin_dataysh.addClass('g-d-hidei');
						/*getColumnDatadfh(ordermanage_pagedfh,ordermanage_configdfh);*/
					}else if(type===1){
						/*待收货*/
						$admin_dataall.addClass('g-d-hidei');
						$admin_datadfh.addClass('g-d-hidei');
						$admin_datadsh.removeClass('g-d-hidei');
						$admin_databfsh.addClass('g-d-hidei');
						$admin_dataysh.addClass('g-d-hidei');
						/*getColumnDatadsh(ordermanage_pagedsh,ordermanage_configdsh);*/
					}else if(type===3){
						/*部分收货*/
						$admin_dataall.addClass('g-d-hidei');
						$admin_datadfh.addClass('g-d-hidei');
						$admin_datadsh.addClass('g-d-hidei');
						$admin_databfsh.removeClass('g-d-hidei');
						$admin_dataysh.addClass('g-d-hidei');
						/*getColumnDatabfsh(ordermanage_pagebfsh,ordermanage_configbfsh);*/
					}else if(type===5){
						/*已收货*/
						$admin_dataall.addClass('g-d-hidei');
						$admin_datadfh.addClass('g-d-hidei');
						$admin_datadsh.addClass('g-d-hidei');
						$admin_databfsh.addClass('g-d-hidei');
						$admin_dataysh.removeClass('g-d-hidei');
						/*getColumnDataysh(ordermanage_pageysh,ordermanage_configysh);*/
					}
				}
			});



			/*关闭弹出框*/
			$show_send_wrap.on('hide.bs.modal',function(){
				if(operate_item){
					setTimeout(function(){
						operate_item.removeClass('item-lighten');
						operate_item=null;
					},1000);
				}
				admin_send_form.reset();
			});



			/*表单验证*/
			if($.isFunction($.fn.validate)) {
				/*配置信息*/
				var form_opt0={},
					formcache=public_tool.cache,
					basedata={
						userId:decodeURIComponent(logininfo.param.userId),
						token:decodeURIComponent(logininfo.param.token),
						providerId:decodeURIComponent(logininfo.param.providerId)
					};


				if(formcache.form_opt_0){
					$.each([formcache.form_opt_0],function(index){
						var formtype,
							config={
								dataType:'JSON',
								method:'post'
							};
						if(index===0){
							formtype='ordersend';
						}
						$.extend(true,(function () {
							if(formtype==='ordersend'){
								return form_opt0;
							}
						}()),(function () {
							if(formtype==='ordersend'){
								return formcache.form_opt_0;
							}
						}()),{
							submitHandler: function(form){
								var setdata={};

								$.extend(true,setdata,basedata);

								if(formtype==='ordersend'){
									var id=$admin_sendid.val();
									if(id===''){
										return false;
									}
									$.extend(true,setdata,{
										goodsOrderId:id,
										trackingNumber:$admin_trackingNumber.val(),
										shippingExpressId:$admin_shippingExpressId.find('option:selected').val(),
										remark:$admin_remark.val()
									});

									config['url']="http://112.74.207.132:8082/yttx-providerbms-api/order/tracking/add";
									config['data']=setdata;
								}

								$.ajax(config).done(function(resp){
									var code;
									if(formtype==='ordersend'){
										code=parseInt(resp.code,10);
										if(code!==0){
											dia.content('<span class="g-c-bs-warning g-btips-warn">发货失败</span>').show();
											return false;
										}else{
											dia.content('<span class="g-c-bs-success g-btips-succ">发货成功</span>').show();
										}
									}
									setTimeout(function () {
										dia.close();
										if(formtype==='ordersend'){
											/*关闭弹窗*/
											$show_send_wrap.modal('hide');
											/*重新获取数据*/
											/*请求全部*/
											getColumnDataall(ordermanage_pageall,ordermanage_configall);
											/*请求待发货*/
											getColumnDatadfh(ordermanage_pagedfh,ordermanage_configdfh);
											/*请求待收货*/
											getColumnDatadsh(ordermanage_pagedsh,ordermanage_configdsh);
											/*请求部分收货*/
											getColumnDatabfsh(ordermanage_pagebfsh,ordermanage_configbfsh);
											/*请求已收货*/
											getColumnDataysh(ordermanage_pageysh,ordermanage_configysh);
										}
									},2000);
								}).fail(function(resp){
									console.log('error');
									dia.content('<span class="g-c-bs-warning g-btips-warn">发货失败</span>').show();
									setTimeout(function () {
										dia.close();
									},2000);
								});
								return false;
							}
						});
					});
				}

				/*提交验证*/
				if(resetform0===null){
					resetform0=$admin_send_form.validate(form_opt0);
				}
			}




		}


		/*获取数据*/
		/*全部*/
		function getColumnDataall(page,opt){
			if(tableall===null){
				if(!public_tool.isSameDomain("http://112.74.207.132:8082")){
					return false;
				}
				tableall=opt.$goods_manage_wrapall.DataTable(opt.config);
			}else{
				tableall.ajax.config(opt.config.ajax).load();
			}
		}
		/*待发货*/
		function getColumnDatadfh(page,opt){
			if(tabledfh===null){
				tabledfh=opt.$goods_manage_wrapdfh.DataTable(opt.config);
			}else{
				tabledfh.ajax.config(opt.config.ajax).load();
			}
		}
		/*待收货*/
		function getColumnDatadsh(page,opt){
			if(tabledsh===null){
				tabledsh=opt.$goods_manage_wrapdsh.DataTable(opt.config);
			}else{
				tabledsh.ajax.config(opt.config.ajax).load();
			}
		}
		/*部分收货*/
		function getColumnDatabfsh(page,opt){
			if(tablebfsh===null){
				tablebfsh=opt.$goods_manage_wrapbfsh.DataTable(opt.config);
			}else{
				tablebfsh.ajax.config(opt.config.ajax).load();
			}
		}
		/*已收货*/
		function getColumnDataysh(page,opt){
			if(tableysh===null){
				tableysh=opt.$goods_manage_wrapysh.DataTable(opt.config);
			}else{
				tableysh.ajax.config(opt.config.ajax).load();
			}
		}

		/*处理金额和价格合计*/
		function mpTotal(obj) {
			var api=obj.api();
			api.column(0).nodes().each(function(cell, i) {
				cell.innerHTML =  i + 1;
			});

			var list=api.column(2).nodes(),
				money=api.column(6).nodes();

			api.column(3).nodes().each(function(cell, i) {
				list.each(function (subp,j) {
					if(i===j){
						var $dataitem=$(subp).find('div.provider-dataitem'),
							data=$dataitem.html().split('|');
						cell.innerHTML='<div class="g-c-info">'+data[1]+'</div>';
						money.each(function (subm,k) {
							if(i===k){
								subm.innerHTML='<div class="g-c-red1">￥:'+public_tool.moneyCorrect(data[0],12,false)[0]+'</div>';
								return false;
							}
						});
						return false;
					}
				});
			});
			api=null;
		}

		/*渲染订单信息*/
		function orderRender(obj) {
			var goodsobj=obj;
			if(!goodsobj){
				return '<div class="g-d-hidei provider-dataitem">0.00|0</div>暂无商品信息';
			}
			var len=goodsobj.length;
			if(len===0){
				return '<div class="g-d-hidei provider-dataitem">0.00|0</div>暂无商品信息';
			}
			var str='',
				i=0,
				price=0,
				count=0;
			for(i;i<len;i++){
				var goodsitem=goodsobj[i],
					tempprice=goodsitem["supplierPrice"],
					temptotal=0,
					tempcount=goodsitem["purchasingQuantlity"];

				if(typeof tempprice==="undefined"||tempprice===''||isNaN(tempprice)){
					tempprice='0.00';
				}else{
					tempprice=parseFloat(tempprice);
				}
				if(typeof tempcount==="undefined"||tempcount===''||isNaN(tempcount)){
					tempcount=0;
				}else{
					tempcount=parseInt(tempcount,10);
				}
				temptotal=tempprice * tempcount;
				price+=temptotal;
				count+=tempcount;
				if(len>=3){
					if(i===0||i===1){
						str+='<ul data-id="'+parseInt(i + 1,10)+'" class="admin-order-subitem1">';
					}else{
						str+='<ul data-name="查看订单" data-id="'+parseInt(i + 1,10)+'" class="admin-order-subitem1 admin-order-toggle admin-order-mini-subitem1">';
					}
				}else{
					str+='<ul data-id="'+parseInt(i + 1,10)+'" class="admin-order-subitem1">';
				}
				str+='<li>商品名称：<div  class="g-c-gray6">'+goodsitem["goodsName"]+'</div></li>\
					<li>商品属性：'+goodsitem["attributeName"]+'</li>\
					<li>购买数量：<div class="g-c-info">'+tempcount+'</div></li>\
					<li>供应商价：<div class="g-c-red1">￥:'+public_tool.moneyCorrect(tempprice,12,false)[0]+'</div>&nbsp;&nbsp;&nbsp;&nbsp;总价：<div class="g-c-red1">￥:'+public_tool.moneyCorrect(temptotal,12,false)[0]+'</div></li>\
				</ul>';
			}
			return '<div class="g-d-hidei provider-dataitem">'+price+'|'+count+'</div>'+str;
		}


	});


})(jQuery);