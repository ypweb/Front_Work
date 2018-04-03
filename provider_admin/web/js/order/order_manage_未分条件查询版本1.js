/*admin_member:成员设置*/
/*admin_member:成员设置*/
(function($){
	'use strict';
	$(function(){

		var table=null/*数据展现*/;

		/*初始化数据*/
		if(public_tool.initMap.isrender){
			/*菜单调用*/
			var logininfo=public_tool.initMap.loginMap;
			public_tool.loadSideMenu(public_vars.$mainmenu,public_vars.$main_menu_wrap,{
				url:'../../json/menu.json',
				async:false,
				type:'post',
				datatype:'json'
			});


			/*dom引用和相关变量定义*/
			var $goods_manage_wrap=$('#goods_manage_wrap')/*表格*/,
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
				$admin_page_wrap=$('#admin_page_wrap')/*分页数据*/,
				admin_send_form=document.getElementById('admin_send_form'),
				$admin_send_form=$(admin_send_form),
				$admin_sendid=$('#admin_sendid'),
				$show_send_wrap=$('#show_send_wrap'),
				$admin_trackingNumber=$('#admin_trackingNumber'),
				$admin_shippingExpressId=$('#admin_shippingExpressId'),
				$admin_remark=$('#admin_remark'),
				resetform0=null;


			/*查询对象*/
			var $search_orderNumber=$('#search_orderNumber'),
				$search_orderState=$('#search_orderState'),
				$admin_search_btn=$('#admin_search_btn'),
				$admin_search_clear=$('#admin_search_clear');


			/*列表请求配置*/
			var ordermanage_page={
					page:1,
					pageSize:10,
					total:0
				},
				ordermanage_config={
					$goods_manage_wrap:$goods_manage_wrap,
					$admin_page_wrap:$admin_page_wrap,
					config:{
						processing:true,/*大消耗操作时是否显示处理状态*/
						deferRender:true,/*是否延迟加载数据*/
						autoWidth:true,/*是否*/
						paging:false,
						ajax:{
							url:/*"../../json/goods/goods_list.json"*/"http://10.0.5.226:8082/yttx-providerbms-api/goodsorder/list",
							dataType:'JSON',
							method:'post',
							dataSrc:function ( json ) {
								var code=parseInt(json.code,10);
								if(code!==0){
									if(code===999){
										/*清空缓存*/
										public_tool.clear();
										public_tool.clearCacheData();
										public_tool.loginTips();
									}
									console.log(json.message);
									return [];
								}
								var result=json.result;
								/*设置分页*/
								ordermanage_page.page=result.page;
								ordermanage_page.pageSize=result.pageSize;
								ordermanage_page.total=result.count;
								/*分页调用*/
								$admin_page_wrap.pagination({
									pageSize:ordermanage_page.pageSize,
									total:ordermanage_page.total,
									pageNumber:ordermanage_page.page,
									onSelectPage:function(pageNumber,pageSize){
										/*再次查询*/
										var param=ordermanage_config.config.ajax.data;
										param.page=pageNumber;
										param.pageSize=pageSize;
										ordermanage_config.config.ajax.data=param;
										getColumnData(ordermanage_page,ordermanage_config);
									}
								});
								return result.list;
							},
							data:{
								providerId:decodeURIComponent(logininfo.param.providerId),
								userId:decodeURIComponent(logininfo.param.userId),
								token:decodeURIComponent(logininfo.param.token),
								page:1,
								pageSize:10
							}
						},
						info:false,
						searching:true,
						ordering:true,
						columns: [
							{
								"data":"orderNumber"
							},
							{
								"data":"list",
								"render":function(data, type, full, meta ){
									var goodsobj=data;
									if(!goodsobj){
										return '暂无商品信息';
									}
									var len=goodsobj.length;
									if(len===0){
										return '暂无商品信息';
									}
									var str='',
										i=0;
									for(i;i<len;i++){
										var goodsitem=goodsobj[i];
										str+='<ul data-id="'+parseInt(i + 1,10)+'" class="admin-order-subitem1">\
											<li>商品名称:<div  class="g-c-gray6">'+goodsitem["goodsName"]+'</div></li>\
											<li>'+goodsitem["attributeName"]+'</li>\
											<li>批发价：<div class="g-c-red1">￥:'+public_tool.moneyCorrect(goodsitem["wholesalePrice"],12,true)[0]+'</div></li>\
										</ul>';
									}
									return str;
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
								"data":"totalMoney",
								"render":function(data, type, full, meta ){
									return '<div class="g-c-red1">￥:'+public_tool.moneyCorrect(data,12,true)[0]+'</div>';
								}
							},
							{
								 "data":"orderState",
								 "render":function(data, type, full, meta ){
										 var stauts=parseInt(data,10),
										 statusmap={
											 0:"待付款",
											 1:"取消订单",
											 3:"已付款",
											 5:"已配货",
											 7:"已发货",
											 9:"待收货",
											 11:"已收货",
											 13:"已完成",
											 20:"待评价",
											 21:"已评价",
											 30:"返修",
											 40:"退货"
										 },
										 str='';
										 if(stauts===0){
											str='<div class="g-c-warn">'+statusmap[stauts]+'</div>';
										 }else if(stauts===1||stauts===30){
											 str='<div class="g-c-gray12">'+statusmap[stauts]+'</div>';
										 }else if(stauts===3||stauts===5||stauts===7||stauts===9){
											str='<div class="g-c-gray10">'+statusmap[stauts]+'</div>';
										 }else if(stauts===11||stauts===20){
											 str='<div class="g-c-gray8">'+statusmap[stauts]+'</div>';
										 }else if(stauts===40){
											str='<div class="g-c-red1">'+statusmap[stauts]+'</div>';
										 }else if(stauts===13||stauts===21){
											str='<div class="g-c-info">'+statusmap[stauts]+'</div>';
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
									if(status===3||status===5){
										/*需要发货状态*/
										btns+='<span data-action="send" data-id="'+id+'" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-arrow-up"></i>\
											<span>发货</span>\
											</span>';
									}else if(status===7||status===9){
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
								}
							}
						]
					}
				};


			/*重置表单*/
			admin_send_form.reset();
			

			/*初始化请求*/
			getColumnData(ordermanage_page,ordermanage_config);


			/*查询物流公司*/
			$.ajax({
					url:"http://10.0.5.226:8082/yttx-providerbms-api/shipping/express/list",
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



			/*清空查询条件*/
			$admin_search_clear.on('click',function(){
				$.each([$search_orderNumber,$search_orderState],function(){
					this.val('');
				});
			});
			$admin_search_clear.trigger('click');


			/*联合查询*/
			$admin_search_btn.on('click',function(){
				var data= $.extend(true,{},ordermanage_config.config.ajax.data);

				$.each([$search_orderNumber,$search_orderState],function(){
					var text=this.val()||this.find(':selected').val(),
						selector=this.selector.slice(1),
						key=selector.split('_');

					if(text===""){
						if(typeof data[key[1]]!=='undefined'){
							delete data[key[1]];
						}
					}else{
						data[key[1]]=text;
					}

				});
				ordermanage_config.config.ajax.data= $.extend(true,{},data);
				getColumnData(ordermanage_page,ordermanage_config);
			});



			/*事件绑定*/
			/*绑定查看，修改操作*/
			var operate_item;
			$goods_manage_wrap.delegate('span','click',function(e){
				e.stopPropagation();
				e.preventDefault();

				var target= e.target,
					$this,
					id,
					action,
					$tr;

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

									config['url']="http://10.0.5.226:8082/yttx-providerbms-api/order/tracking/add";
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
											getColumnData(ordermanage_page,ordermanage_config);
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
		function getColumnData(page,opt){
			if(table===null){
				table=opt.$goods_manage_wrap.DataTable(opt.config);
			}else{
				table.ajax.config(opt.config.ajax).load();
			}
		}




	});


})(jQuery);