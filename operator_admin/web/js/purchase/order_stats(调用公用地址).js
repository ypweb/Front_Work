(function($){
	'use strict';
	$(function(){

		var table=null/*数据展现*/;

		/*初始化数据*/
		if(public_tool.initMap.isrender){
			/*菜单调用*/
			var logininfo=public_tool.initMap.loginMap;
			public_tool.loadSideMenu(public_vars.$mainmenu,public_vars.$main_menu_wrap,{
				url:'http://10.0.5.226:8082/mall-agentbms-api/module/menu',
				async:false,
				type:'post',
				param:{
					roleId:decodeURIComponent(logininfo.param.roleId),
					adminId:decodeURIComponent(logininfo.param.adminId),
					sourcesChannel:decodeURIComponent(logininfo.param.sourcesChannel),
					grade:decodeURIComponent(logininfo.param.grade),
					token:decodeURIComponent(logininfo.param.token)
				},
				datatype:'json'
			});
			/*权限调用*/
			var powermap=public_tool.getPower(98),
				stats_power=public_tool.getKeyPower('mall-order-stats',powermap);



			/*dom引用和相关变量定义*/
			var $order_stats_wrap=$('#order_stats_wrap')/*表格*/,
				module_id='mall-order-stats'/*模块id，主要用于本地存储传值*/,
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
				$admin_page_wrap=$('#admin_page_wrap'),
				$order_stats_list=$('#order_stats_list'),
				$order_showall_btn=$('#order_showall_btn'),
				admin_send_form=document.getElementById('admin_send_form'),
				$admin_send_form=$(admin_send_form),
				$admin_goodsOrderId=$('#admin_goodsOrderId'),
				$show_send_wrap=$('#show_send_wrap'),
				$admin_trackingNumber=$('#admin_trackingNumber'),
				$admin_shippingExpressId=$('#admin_shippingExpressId'),
				$admin_remark=$('#admin_remark'),
				resetform0=null,
				sureObj=public_tool.sureDialog(dia)/*回调提示对象*/,
				setSure=new sureObj();




			/*列表请求配置*/
			var order_page={
					page:1,
					pageSize:10,
					total:0
				},
				order_config={
					$order_stats_wrap:$order_stats_wrap,
					$admin_page_wrap:$admin_page_wrap,
					config:{
						processing:true,/*大消耗操作时是否显示处理状态*/
						deferRender:true,/*是否延迟加载数据*/
						autoWidth:true,/*是否*/
						paging:false,
						ajax:{
							url:"http://10.0.5.226:8082/mall-agentbms-api/goodsorder/list",
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
								order_page.page=result.page;
								order_page.pageSize=result.pageSize;
								order_page.total=result.count;
								/*分页调用*/
								$admin_page_wrap.pagination({
									pageSize:order_page.pageSize,
									total:order_page.total,
									pageNumber:order_page.page,
									onSelectPage:function(pageNumber,pageSize){
										/*再次查询*/
										var param=order_config.config.ajax.data;
										param.page=pageNumber;
										param.pageSize=pageSize;
										order_config.config.ajax.data=param;
										getColumnData(order_page,order_config);
									}
								});
								return result?result.list||[]:[];
							},
							data:{
								userId:decodeURIComponent(logininfo.param.roleId),
								adminId:decodeURIComponent(logininfo.param.adminId),
								token:decodeURIComponent(logininfo.param.token),
								grade:decodeURIComponent(logininfo.param.grade),
								page:1,
								pageSize:10
							}
						},
						info:false,
						searching:true,
						order:[[1, "desc" ]],
						columns: [
							{
								"data":"orderNumber"
							},
							{
								"data":"orderTime"
							},
							{
								"data":"customerName"
							},
							{
								"data":"totalQuantity"
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
										str='';

									if(stauts===0){
										str='<div class="g-c-red2">'+statusmap[stauts]+'</div>';
									}else if(stauts===1){
										str='<div class="g-c-gray10">'+statusmap[stauts]+'</div>';
									}else if(stauts===6){
										str='<div class="g-c-gray9">'+statusmap[stauts]+'</div>';
									}else if(stauts===9){
										str='<div class="g-c-gray6">'+statusmap[stauts]+'</div>';
									}else if(stauts===20){
										str='<div class="g-c-info">'+statusmap[stauts]+'</div>';
									}else if(stauts===21){
										str='<div class="g-c-gray3">'+statusmap[stauts]+'</div>';
									}
									return str;
								}
							},
							{
								"data":"id",
								"render":function(data, type, full, meta ){
									var id=parseInt(data,10),
										btns='',
										state=parseInt(full.orderState,10);

									if(stats_power){
										if(state===6){
											btns+='<span data-action="send" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-file-text-o"></i>\
											<span>发货</span>\
											</span>';
										}
										
										btns+='<span  data-subitem=""  data-action="select" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
										<i class="fa-angle-right"></i>\
										<span>查看</span>\
										</span>';
									}
									return btns;
								}
							}
						]
					}
				};
			

			/*初始化请求*/
			getColumnData(order_page,order_config);


			/*查询物流公司*/
			$.ajax({
					url:"http://10.0.5.226:8082/mall-agentbms-api/shipping/express/list",
					method: 'POST',
					dataType: 'json',
					data:{
						shippingMethodId:1,
						adminId:decodeURIComponent(logininfo.param.adminId),
						userId:decodeURIComponent(logininfo.param.userId),
						token:decodeURIComponent(logininfo.param.token),
						grade:decodeURIComponent(logininfo.param.grade)
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
			$order_stats_wrap.delegate('span','click',function(e){
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

				/*修改,编辑操作*/
				if(action==='send'&&id!==''){
					if(operate_item){
						operate_item.removeClass('item-lighten');
						operate_item=null;
					}
					operate_item=$tr.addClass('item-lighten');
					$admin_goodsOrderId.val(id);
					$show_send_wrap.modal('show',{
						backdrop:'static'
					});
				}else if(action==='select'){
					/*查看收货详情*/
					(function () {
						var subclass=$this.children('i').hasClass('fa-angle-down'),
							tabletr=table.row($tr),
							subitem=$this.attr('data-subitem');

						if(subclass){
							/*收缩*/
							$this.children('i').removeClass('fa-angle-down');
							tabletr.child().hide(200);
						}else{
							/*添加高亮状态*/
							if(operate_item){
								operate_item.removeClass('item-lighten');
								operate_item=null;
							}
							operate_item=$tr.addClass('item-lighten');
							/*展开*/
							if(subitem===''){
								$.ajax({
										url:"http://10.0.5.226:8082/mall-agentbms-api/goodsorder/details",
										dataType:'JSON',
										method:'post',
										data:{
											id:id,
											adminId:decodeURIComponent(logininfo.param.adminId),
											token:decodeURIComponent(logininfo.param.token),
											grade:decodeURIComponent(logininfo.param.grade)
										}
									})
									.done(function(resp){
										var code=parseInt(resp.code,10),
											isok=false;
										if(code!==0){
											console.log(resp.message);
											isok=false;
										}
										/*是否是正确的返回数据*/
										var result=resp.result;
										if(!result){
											isok=false;
										}else{
											var list=result.list;
											if(!list){
												isok=false;
											}else{
												isok=true;
											}
										}

										if(!isok){
											tabletr.child($('<tr><td colspan="6"><table class="table table-bordered table-striped table-hover admin-table" ><tbody class="middle-align"><tr><td class="g-t-c" colspan="5">("暂无数据")</td></tr></tbody></table></td></tr>')).show();
											$this.attr({
												'data-subitem':'true'
											}).children('i').addClass('fa-angle-down');
											return false;
										}

										var i= 0,
											newstr='<colgroup>\
												<col class="g-w-percent5">\
												<col class="g-w-percent5">\
												<col class="g-w-percent5">\
												<col class="g-w-percent5">\
												<col class="g-w-percent5">\
												<col class="g-w-percent5">\
												<col class="g-w-percent5">\
												<col class="g-w-percent15">\
											</colgroup>\
											<thead>\
												<tr>\
													<th>买家名称</th>\
													<th>联系电话</th>\
													<th>所在地址</th>\
													<th>收货人姓名</th>\
													<th>收货人电话</th>\
													<th>物流费用</th>\
													<th>总计(包含运费)</th>\
													<th>买家留言</th>\
												</tr>\
												<tr>'+(function () {
													var panelstr='<td>'+(result["customerName"]||"")+'</td>\
														<td>'+(public_tool.phoneFormat(result["customerPhone"])||"")+'</td>\
														<td>'+(result["customerAddress"]||"")+'</td>\
														<td>'+(result["consigneeName"]||"")+'</td>\
														<td>'+(result["consigneePhone"]||"")+'</td>\
														<td>￥'+(public_tool.moneyCorrect(result["freight"],12,true)[0]||"0.00")+'</td>\
														<td>￥'+(public_tool.moneyCorrect(result["totalMoney"],12,true)[0]||"0.00")+'</td>\
														<td>'+(result["remark"]||"")+'</td>';
													return panelstr;
												}())+'</tr>\
												<tr>\
													<th colspan="4">商品名称</th>\
													<th>批发价</th>\
													<th>购买数量</th>\
													<th colspan="2">商品属性</th>\
												</tr>\
											</thead>',
											res='',
											len=list.length;

										if(len!==0){
											for(i;i<len;i++){
												res+='<tr><td colspan="4">'+(list[i]["goodsName"]||"")+'</td><td>￥'+(public_tool.moneyCorrect(list[i]["wholesalePrice"],12,true)[0]||"0.00")+'</td><td>'+(list[i]["quantlity"]||"0")+'</td><td colspan="2">'+(list[i]["attributeName"]||"")+'</td></tr>';

											}
										}
										res='<tbody class="middle-align">'+res+'</tbody>';
										newstr='<tr><td colspan="6"><table class="table table-bordered table-striped table-hover admin-table" >'+newstr+res+'</table></td></tr>';

										var $newtr=$(newstr);
										tabletr.child($newtr).show();
										$this.attr({
											'data-subitem':'true'
										}).children('i').addClass('fa-angle-down');

									})
									.fail(function(resp){
										console.log(resp.message);
									});
							}else{
								tabletr.child().show();
								$this.children('i').addClass('fa-angle-down');
							}
						}
					}());

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




			/*全部展开*/
			if(stats_power){
				$order_showall_btn.removeClass('g-d-hidei').on('click',function () {
					var len=$order_stats_list.find('tr').size();
					if(len===0){
						return false;
					}
					var isshow=$order_showall_btn.find('i').hasClass('fa-plus');

					if(isshow){
						$order_showall_btn.html('<i class="fa-minus"></i>&nbsp;&nbsp;<span>全部收缩</span>');
					}else{
						$order_showall_btn.html('<i class="fa-plus"></i>&nbsp;&nbsp;<span>全部展开</span>');
					}
					$order_stats_list.find('span[data-action="select"]').trigger('click');
				});
			}else{
				$order_showall_btn.addClass('g-d-hidei');
			}


			/*表单验证*/
			if($.isFunction($.fn.validate)) {
				/*配置信息*/
				var form_opt0={},
					formcache=public_tool.cache,
					basedata={
						roleId:decodeURIComponent(logininfo.param.roleId),
						adminId:decodeURIComponent(logininfo.param.adminId),
						token:decodeURIComponent(logininfo.param.token),
						grade:decodeURIComponent(logininfo.param.grade)
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
								setSure.sure('发货',function(cf){
									/*to do*/
									var setdata={},
										tip=cf.dia||dia;

									$.extend(true,setdata,basedata);

									if(formtype==='ordersend'){
										var id=$admin_goodsOrderId.val();
										if(id===''){
											return false;
										}
										$.extend(true,setdata,{
											trackingNumber:$admin_trackingNumber.val(),
											shippingExpressId:$admin_shippingExpressId.find(':selected').val(),
											remark:$admin_remark.val(),
											goodsOrderId:id
										});

										config['url']="http://10.0.5.226:8082/mall-agentbms-api/order/tracking/add";
										config['data']=setdata;
									}
									
									$.ajax(config).done(function(resp){
										var code;
										if(formtype==='ordersend'){
											code=parseInt(resp.code,10);
											if(code!==0){
												console.log(resp.message);
												tip.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"发货失败")+'</span>').show();
												setTimeout(function () {
													tip.close();
												},2000);
												return false;
											}
											tip.content('<span class="g-c-bs-success g-btips-succ">发货成功</span>').show();
											/*重新获取数据*/
											getColumnData(order_page,order_config);
											setTimeout(function () {
												tip.close();
												$show_send_wrap.modal('hide');
											},2000);
										}
									}).fail(function(resp){
										console.log(resp.message);
										tip.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"发货失败")+'</span>').show();
										setTimeout(function () {
											tip.close();
										},2000);
									});
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
				table=opt.$order_stats_wrap.DataTable(opt.config);
			}else{
				table.ajax.config(opt.config.ajax).load();
			}
		}






	});


})(jQuery);