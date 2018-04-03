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
			var powermap=public_tool.getPower(),
				audit_power=public_tool.getKeyPower('mall-purchase-audit',powermap);
			

			/*清除收货缓存*/
			public_tool.removeParams('mall-purchase-receive');


			/*dom引用和相关变量定义*/
			var $purchase_audit_wrap=$('#purchase_audit_wrap')/*表格*/,
				module_id='mall-purchase-audit'/*模块id，主要用于本地存储传值*/,
				dia=dialog({
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
				$audit_batch_btn=$('#audit_batch_btn');




			/*列表请求配置*/
			var purchaseaudit_page={
					page:1,
					pageSize:10,
					total:0
				},
				purchaseaudit_config={
					$purchase_audit_wrap:$purchase_audit_wrap,
					$admin_page_wrap:$admin_page_wrap,
					config:{
						processing:true,/*大消耗操作时是否显示处理状态*/
						deferRender:true,/*是否延迟加载数据*/
						autoWidth:true,/*是否*/
						paging:false,
						ajax:{
							url:"http://10.0.5.226:8082/mall-agentbms-api/purchasing/order/list",
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
								/*设置分页*/
								purchaseaudit_page.page=result.page;
								purchaseaudit_page.pageSize=result.pageSize;
								purchaseaudit_page.total=result.count;
								/*分页调用*/
								$admin_page_wrap.pagination({
									pageSize:purchaseaudit_page.pageSize,
									total:purchaseaudit_page.total,
									pageNumber:purchaseaudit_page.page,
									onSelectPage:function(pageNumber,pageSize){
										/*再次查询*/
										var param=purchaseaudit_config.config.ajax.data;
										param.page=pageNumber;
										param.pageSize=pageSize;
										purchaseaudit_config.config.ajax.data=param;
										getColumnData(purchaseaudit_page,purchaseaudit_config);
									}
								});
								return result?result.list||[]:[];
							},
							data:{
								roleId:decodeURIComponent(logininfo.param.roleId),
								adminId:decodeURIComponent(logininfo.param.adminId),
								token:decodeURIComponent(logininfo.param.token),
								grade:decodeURIComponent(logininfo.param.grade),
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
								"data":"orderTime"
							},
							{
								"data":"providerName"
							},
							{
								"data":"auditState",
								"render":function(data, type, full, meta ){
									var stauts=parseInt(data,10),
										statusmap={
											0:"待审核",
											1:"审核通过",
											2:"审核不通过"
										},
										str='';

									if(stauts===0){
										str='<div class="g-c-info">'+statusmap[stauts]+'</div>';
									}else if(stauts===1){
										str='<div class="g-c-success">'+statusmap[stauts]+'</div>';
									}else if(stauts===1){
										str='<div class="g-c-red2">'+statusmap[stauts]+'</div>';
									}
									return str;
								}
							},
							{
								"data":"id",
								"render":function(data, type, full, meta ){
									var id=parseInt(data,10),
										btns='',
										state=parseInt(full.auditState,10);

									if(audit_power&&(state===0||state===2)){
										btns+='<span  data-subitem=""  data-action="audit" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
										<i class="fa-hand-o-up"></i>\
										<span>审核</span>\
										</span>';
									}
									return btns;
								}
							}
						]
					}
				};
			

			/*初始化请求*/
			getColumnData(purchaseaudit_page,purchaseaudit_config);
			


			/*事件绑定*/
			/*绑定查看，修改操作*/
			var operate_item;
			$purchase_audit_wrap.delegate('span','click',function(e){
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
				if(action==='receive'){
					public_tool.setParams('mall-purchase-receive',id);
					location.href='mall-purchase-receive.html';
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
										url:"http://10.0.5.226:8082/mall-agentbms-api/purchasing/order/details"/*"../../json/purchase/mall_purchase_stats_details.json"*/,
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
											tabletr.child($('<tr><td colspan="5"><table class="table table-bordered table-striped table-hover admin-table" ><tbody class="middle-align"><tr><td class="g-t-c" colspan="5">("暂无数据")</td></tr></tbody></table></td></tr>')).show();
											$this.attr({
												'data-subitem':'true'
											}).children('i').addClass('fa-angle-down');
											return false;
										}

										var i= 0,
											newstr='<colgroup>\
												<col class="g-w-percent10">\
												<col class="g-w-percent10">\
												<col class="g-w-percent10">\
												<col class="g-w-percent10">\
												<col class="g-w-percent10">\
											</colgroup>\
											<thead>\
												<tr>\
												<th>商品名称</th>\
												<th>商品属性</th>\
												<th>采购数量</th>\
												<th>发货数量</th>\
												<th>等发数量</th>\
											</tr>\
											</thead>',
											res='',
											len=list.length;
										if(len!==0){
											for(i;i<len;i++){
												res+='<tr><td>'+list[i]["goodsName"]+'</td><td>'+list[i]["attributeName"]+'</td><td>'+list[i]["purchasingQuantlity"]+'</td><td>'+list[i]["deliveredQuantlity"]+'</td><td>'+list[i]["waitingQuantlity"]+'</td></tr>';

											}
										}
										res='<tbody class="middle-align">'+res+'</tbody>';
										newstr='<tr><td colspan="5"><table class="table table-bordered table-striped table-hover admin-table" >'+newstr+res+'</table></td></tr>';

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




			/*全部展开*/
			if(audit_power){
				$audit_batch_btn.removeClass('g-d-hidei').on('click',function () {
					var isshow=$audit_batch_btn.find('i').hasClass('fa-plus');

					if(isshow){
						$audit_batch_btn.html('<i class="fa-minus"></i>&nbsp;&nbsp;<span>全部收缩</span>');
					}else{
						$audit_batch_btn.html('<i class="fa-plus"></i>&nbsp;&nbsp;<span>全部展开</span>');
					}
					$purchase_audit_wrap.find('span[data-action="select"]').trigger('click');
				});
			}else{
				$audit_batch_btn.addClass('g-d-hidei');
			}




		}


		/*获取数据*/
		function getColumnData(page,opt){
			if(table===null){
				table=opt.$purchase_audit_wrap.DataTable(opt.config);
			}else{
				table.ajax.config(opt.config.ajax).load();
			}
		}





	});


})(jQuery);