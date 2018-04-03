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
				url:'http://112.74.207.132:8082/mall-agentbms-api/module/menu',
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
				inventoryshow_power=public_tool.getKeyPower('mall-inventory-status',powermap);



			
			/*dom引用和相关变量定义*/
			var $inventory_status_wrap=$('#inventory_status_wrap')/*表格*/,
				module_id='mall-inventory-status'/*模块id，主要用于本地存储传值*/,
				$admin_page_wrap=$('#admin_page_wrap'),
				$show_detail_wrap=$('#show_detail_wrap')/*详情容器*/,
				$show_detail_content=$('#show_detail_content'),/*详情内容*/
				$show_detail_title=$('#show_detail_title'),
				detail_map={
					"goodsName":"商品名称",
					"attributeName":"规格属性",
					"Unit":"单位",
					"warehouseName":"仓库名称",
					"availableInventory":"可售库存",
					"physicalInventory":"实际库存",
					"safetyInventory":"安全库存",
					"referenceReplenishment":"参考补货",
					"inventoryToplimit":"库存上限",
					"inventoryLowerlimit":"库存下限",
					"availableStatus":"可售状态",
					"physicalStatus":"实际状态"
				};


			/*查询对象*/
			var $search_goodsName=$('#search_goodsName'),
				$admin_search_btn=$('#admin_search_btn'),
				$admin_search_clear=$('#admin_search_clear');




			/*列表请求配置*/
			var inventory_page={
					page:1,
					pageSize:10,
					total:0
				},
				inventory_config={
					$inventory_status_wrap:$inventory_status_wrap,
					$admin_page_wrap:$admin_page_wrap,
					config:{
						processing:true,/*大消耗操作时是否显示处理状态*/
						deferRender:true,/*是否延迟加载数据*/
						autoWidth:true,/*是否*/
						paging:false,
						ajax:{
							url:"http://112.74.207.132:8082/mall-agentbms-api/inventorystatus/related",
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
								inventory_page.page=result.page;
								inventory_page.pageSize=result.pageSize;
								inventory_page.total=result.count;
								/*分页调用*/
								$admin_page_wrap.pagination({
									pageSize:inventory_page.pageSize,
									total:inventory_page.total,
									pageNumber:inventory_page.page,
									onSelectPage:function(pageNumber,pageSize){
										/*再次查询*/
										var param=inventory_config.config.ajax.data;
										param.page=pageNumber;
										param.pageSize=pageSize;
										inventory_config.config.ajax.data=param;
										getColumnData(inventory_page,inventory_config);
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
						order:[[4, "desc" ],[5, "desc" ],[6, "desc" ],[0, "desc" ]],
						columns: [
							{
								"data":"goodsName"
							},
							{
								"data":"attributeName"
							},
							{
								"data":"Unit"
							},
							{
								"data":"warehouseName"
							},
							{
								"data":"physicalInventory"
							},
							{
								"data":"availableInventory"
							},
							{
								"data":"safetyInventory"
							},
							{
								"data":"id",
								"render":function(data, type, full, meta ){
									var id=parseInt(data,10),
										btns='';


									if(inventoryshow_power){
										btns+='<span data-action="select" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-file-text-o"></i>\
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
			getColumnData(inventory_page,inventory_config);


			/*清空查询条件*/
			$admin_search_clear.on('click',function(){
				$.each([$search_goodsName],function(){
					this.val('');
				});
			});
			$admin_search_clear.trigger('click');


			/*联合查询*/
			$admin_search_btn.on('click',function(){
				var data= $.extend(true,{},inventory_config.config.ajax.data);

				$.each([$search_goodsName],function(){
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
				inventory_config.config.ajax.data= $.extend(true,{},data);
				getColumnData(inventory_page,inventory_config);
			});
			


			/*事件绑定*/
			/*绑定查看，修改操作*/
			var operate_item;
			$inventory_status_wrap.delegate('span','click',function(e){
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
				if(action==='select'){
					showDetail($tr);
				}
			});


			/*绑定关闭详情*/
			$show_detail_wrap.on('hide.bs.modal',function(){
				if(operate_item){
					setTimeout(function(){
						operate_item.removeClass('item-lighten');
						operate_item=null;
					},1000);
				}
			});


		}


		/*获取数据*/
		function getColumnData(page,opt){
			if(table===null){
				table=opt.$inventory_status_wrap.DataTable(opt.config);
			}else{
				table.ajax.config(opt.config.ajax).load();
			}
		}


		/*查看详情*/
		function showDetail($tr) {
			if(!$tr){
				return false;
			}

			var list=table.row($tr).data(),
				str='',
				istitle=false;

			if(!$.isEmptyObject(list)){
				for(var j in list){
					if(typeof detail_map[j]!=='undefined'){
						if(j==='name'||j==='Name'){
							istitle=true;
							$show_detail_title.html('"<span class="g-c-info">"'+list[j]+'" 库存状况</span>"详情信息');
						}else if(j==='availableStatus'){
							var typemap={
								0:"正常",
								1:"异常"
							}
							str+='<tr><th>'+detail_map[j]+':</th><td>'+typemap[list[j]]+'</td></tr>';
						}else if(j==='physicalStatus'){
							var statusmap={
								0:"正常",
								1:"异常"
							};
							str+='<tr><th>'+detail_map[j]+':</th><td>'+statusmap[list[j]]+'</td></tr>';
						}else{
							str+='<tr><th>'+detail_map[j]+':</th><td>'+list[j]+'</td></tr>';
						}
					}

				}
				if(!istitle){
					$show_detail_title.html('库存状况详情信息');
				}
				/*添加高亮状态*/
				if(operate_item){
					operate_item.removeClass('item-lighten');
					operate_item=null;
				}
				operate_item=$tr.addClass('item-lighten');
				$show_detail_content.html(str);
				$show_detail_wrap.modal('show',{backdrop:'static'});
			}else{
				$show_detail_content.html('');
				$show_detail_title.html('');
			}
		}



	});


})(jQuery);