(function($){
	'use strict';
	$(function(){

		var table=null/*数据展现*/;

		/*初始化数据*/
		if(public_tool.initMap.isrender){
			/*菜单调用*/
			var logininfo=public_tool.initMap.loginMap;
			public_tool.loadSideMenu(public_vars.$mainmenu,public_vars.$main_menu_wrap,{
				url:'http://112.74.207.132:8081/mall-buzhubms-api/module/menu',
				async:false,
				type:'post',
				param:{
					roleId:decodeURIComponent(logininfo.param.roleId),
					adminId:decodeURIComponent(logininfo.param.adminId),
					grade:decodeURIComponent(logininfo.param.grade),
					token:decodeURIComponent(logininfo.param.token)
				},
				datatype:'json'
			});


			/*清除商品列数据*/
			public_tool.removeParams('bzw-provider-goods');



			/*权限调用*/
			var powermap=public_tool.getPower(),
				providerforbid_power=public_tool.getKeyPower('bzw-provider-forbid',powermap),
				providersearch_power=public_tool.getKeyPower('bzw-provider-query',powermap);



			/*dom引用和相关变量定义*/
			var $admin_list_wrap=$('#admin_list_wrap')/*表格*/,
				module_id='bzw-provider-list'/*模块id，主要用于本地存储传值*/,
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
				sureObj=public_tool.sureDialog(dia)/*回调提示对象*/,
				setSure=new sureObj();


			/*查询对象*/
			var $search_legalName=$('#search_legalName'),
				$search_storeName=$('#search_storeName'),
				$search_auditStatus=$('#search_auditStatus'),
				$admin_search_btn=$('#admin_search_btn'),
				$admin_search_clear=$('#admin_search_clear'),
				$admin_searchwrap=$('#admin_searchwrap');


			/*初始化查询*/
			if(providersearch_power){
				$admin_searchwrap.removeClass('g-d-hidei');
			}


			/*批量配置参数*/
			var $admin_batchitem_btn=$('#admin_batchitem_btn'),
				$admin_batchitem_show=$('#admin_batchitem_show'),
				$admin_batchitem_check=$('#admin_batchitem_check'),
				$admin_batchitem_action=$('#admin_batchitem_action'),
				$admin_provider_list=$('#admin_provider_list'),
				batchItem=new public_tool.BatchItem();

			/*批量初始化*/
			batchItem.init({
				$batchtoggle:$admin_batchitem_btn,
				$batchshow:$admin_batchitem_show,
				$checkall:$admin_batchitem_check,
				$action:$admin_batchitem_action,
				$listwrap:$admin_provider_list,
				setSure:setSure,
				powerobj:{
					'forbid':providerforbid_power,
					'enable':providerforbid_power
				},
				fn:function (type) {
					/*批量操作*/
					batchProvider({
						action:type
					});
				}
			});




			/*列表请求配置*/
			var provider_page={
					page:1,
					pageSize:10,
					total:0
				},
				provider_config={
					$admin_list_wrap:$admin_list_wrap,
					$admin_page_wrap:$admin_page_wrap,
					config:{
						processing:true,/*大消耗操作时是否显示处理状态*/
						deferRender:true,/*是否延迟加载数据*/
						autoWidth:true,/*是否*/
						paging:false,
						ajax:{
							url:"http://112.74.207.132:8081/mall-buzhubms-api/provider/list",
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
								provider_page.page=result.page;
								provider_page.pageSize=result.pageSize;
								provider_page.total=result.count;
								/*分页调用*/
								$admin_page_wrap.pagination({
									pageSize:provider_page.pageSize,
									total:provider_page.total,
									pageNumber:provider_page.page,
									onSelectPage:function(pageNumber,pageSize){
										/*再次查询*/
										var param=provider_config.config.ajax.data;
										param.page=pageNumber;
										param.pageSize=pageSize;
										provider_config.config.ajax.data=param;
										getColumnData(provider_page,provider_config);
									}
								});
								return result?result.list||[]:[];
							},
							data:{
								roleId:decodeURIComponent(logininfo.param.roleId),
								adminId:decodeURIComponent(logininfo.param.adminId),
								grade:decodeURIComponent(logininfo.param.grade),
								token:decodeURIComponent(logininfo.param.token),
								page:1,
								pageSize:10
							}
						},
						info:false,
						searching:true,
						order:[[7, "desc" ],[1, "desc" ]],
						columns: [
							{
								"data":"id",
								"orderable" :false,
								"searchable" :false,
								"render":function(data, type, full, meta ){
									return '<input data-forbid="'+full.isEnabled+'" value="'+data+'" name="providerID" type="checkbox" />';
								}
							},
							{
								"data":"legalName"
							},
							{
								"data":"storeName"
							},
							{
								"data":"companyName"
							},
							{
								"data":"telephone",
								"render":function(data, type, full, meta ){
									return public_tool.phoneFormat(data);
								}
							},
							{
								"data":"address"
							},
							{
								"data":"isEnabled",
								"render":function(data, type, full, meta ){
									var str='';

									if(data){
										str='<div class="g-c-info">启用</div>';
									}else{
										str='<div class="g-c-gray9">禁用</div>';
									}
									return str;
								}
							},
							{
								"data":"createTime"
							},
							{
								"data":"id",
								"render":function(data, type, full, meta ){
									var id=parseInt(data,10),
										btns='',
										enabled=full.isEnabled,
										auditstate=parseInt(full.auditStatus,10);

									if(providerforbid_power){
										if(enabled){
											/*启用状态则禁用*/
											btns+='<span data-action="forbid" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
													<i class="fa-arrow-down"></i>\
													<span>禁用</span>\
												</span>';
										}else if(!enabled){
											/*禁用状态则启用*/
											btns+='<span data-action="enable" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
													<i class="fa-arrow-up"></i>\
													<span>启用</span>\
												</span>';
										}
									}
									/*商品列*/
									if(providersearch_power){
										btns+='<span data-action="goods" data-id="'+id+'" data-legalname="'+full.legalName+'" data-storename="'+full.storeName+'" data-auditstatus="'+full.auditStatus+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
													<i class="fa-send"></i>\
													<span>商品列</span>\
												</span>';
									}
									return btns;
								}
							}
						]
					}
				};
			

			/*初始化请求*/
			getColumnData(provider_page,provider_config);


			/*清空查询条件*/
			$admin_search_clear.on('click',function(){
				$.each([$search_legalName,$search_storeName,$search_auditStatus],function(){
					this.val('');
				});
			}).trigger('click');


			/*联合查询*/
			$admin_search_btn.on('click',function(){
				var data= $.extend(true,{},provider_config.config.ajax.data);

				$.each([$search_legalName,$search_storeName,$search_auditStatus],function(){
					var text=this.val(),
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
				provider_config.config.ajax.data= $.extend(true,{},data);
				getColumnData(provider_page,provider_config);
			});




			/*事件绑定*/
			/*绑定查看，修改操作*/
			var operate_item;
			$admin_list_wrap.delegate('span','click',function(e){
				e.stopPropagation();
				e.preventDefault();

				var target= e.target,
					$this,
					id,
					action,
					$tr,
					actionmap={
						"forbid":1,
						"enable":2
					},
					actiontip={
						"forbid":'禁用',
						"enable":'启用'
					};

				//适配对象
				if(target.className.indexOf('btn')!==-1){
					$this=$(target);
				}else{
					$this=$(target).parent();
				}
				$tr=$this.closest('tr');
				id=$this.attr('data-id');
				action=$this.attr('data-action');

				/*启用，禁用操作*/
				if(action==='forbid'||action==='enable'){
					if(operate_item){
						operate_item.removeClass('item-lighten');
						operate_item=null;
					}
					operate_item=$tr.addClass('item-lighten');
					/*确认是否启用或禁用*/
					setSure.sure(actiontip[action],function(cf){
						/*to do*/
						setEnabled({
							id:id,
							action:action,
							tip:cf.dia||dia,
							type:'base',
							actiontip:actiontip,
							actionmap:actionmap
						},action==='forbid'?"禁用后，该供应商将禁止使用，在APP中查看不到该供应商，商品也归纳至禁售商品中，是否禁用？":"启用后，该供应商将可以使用，在APP中能查看该供应商，商品也归纳至可售商品中，是否启用？",true);
					});
				}else if(action==='goods'){
					public_tool.setParams('bzw-provider-goods',{
						providerid:id,
						legalname:$this.attr('data-legalname'),
						storename:$this.attr('data-storename'),
						auditstatus:$this.attr('data-auditstatus')
					});
					window.location.href='bzw-provider-goods.html';
				}
			});

		}


		/*获取数据*/
		function getColumnData(page,opt){
			if(table===null){
				table=opt.$admin_list_wrap.DataTable(opt.config);
			}else{
				/*清除批量数据*/
				batchItem.clear();
				table.ajax.config(opt.config.ajax).load();
			}
		}


		/*启用禁用*/
		function setEnabled(obj){
			var id=obj.id;

			if(typeof id==='undefined'){
				return false;
			}
			var type=obj.type,
				tip=obj.tip,
				action=obj.action;
			if(type==='batch'){
				id=id.join(',');
			}

			$.ajax({
					url:"http://112.74.207.132:8081/mall-buzhubms-api/provider/operate",
					dataType:'JSON',
					method:'post',
					data:{
						ids:id,
						operate:obj.actionmap[action],
						roleId:decodeURIComponent(logininfo.param.roleId),
						adminId:decodeURIComponent(logininfo.param.adminId),
						grade:decodeURIComponent(logininfo.param.grade),
						token:decodeURIComponent(logininfo.param.token)
					}
				})
				.done(function(resp){
					var code=parseInt(resp.code,10);
					if(code!==0){
						console.log(resp.message);
						tip.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
						if(type==='base'){
							if(operate_item){
								operate_item.removeClass('item-lighten');
								operate_item=null;
							}
						}else if(type==='batch'){
							batchItem.clear();
						}
						setTimeout(function () {
							tip.close();
						},2000);
						return false;
					}
					/*是否是正确的返回数据*/
					/*添加高亮状态*/
					tip.content('<span class="g-c-bs-success g-btips-succ">'+obj.actiontip[action]+'成功</span>').show();
					setTimeout(function () {
						tip.close();
						if(type==='base'){
							if(operate_item){
								operate_item.removeClass('item-lighten');
								operate_item=null;
							}
						}else if(type==='batch'){
							batchItem.clear();
						}
						setTimeout(function () {
							getColumnData(provider_page,provider_config);
						},1000);
					},1000);
				})
				.fail(function(resp){
					console.log(resp.message);
					tip.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
					if(type==='base'){
						if(operate_item){
							operate_item.removeClass('item-lighten');
							operate_item=null;
						}
					}else if(type==='batch'){
						batchItem.clear();
					}
					setTimeout(function () {
						tip.close();
					},2000);
				});
		}


		/*批量操作*/
		function batchProvider(config) {

			var action=config.action;

			if(action===''||typeof action==='undefined'){
				return false;
			}
			var inputitems=batchItem.getBatchNode(),
				len=inputitems.length,
				i=0;

			if(len===0){
				dia.content('<span class="g-c-bs-warning g-btips-warn">请选中操作数据</span>').show();
				setTimeout(function () {
					dia.close();
				},2000);
				return false;
			}
			var tempid=batchItem.getBatchData(),
				filter=[],
				actionmap={
					"forbid":1,
					"enable":2
				},
				actiontip={
					"forbid":'禁用',
					"enable":'启用'
				};


			for(i;i<len;i++){
				var tempinput=inputitems[i],
					temp_state=tempinput.attr('data-forbid');


				/*审核成功*/
				if(temp_state==='true'){
					/*启用状态则禁用*/
					if(action==='enable'){
						filter.push(tempid[i]);
						continue;
					}
				}else if(temp_state==='false'){
					/*禁用状态则启用*/
					if(action==='forbid'){
						filter.push(tempid[i]);
						continue;
					}
				}
			}

			if(filter.length!==0){
				dia.content('<span class="g-c-bs-warning g-btips-warn">操作状态和选中状态不匹配,系统将过滤不匹配数据</span>').show();
				batchItem.filterData(filter);
				filter.length=0;
				setTimeout(function () {
					dia.close();
					/*批量操作*/
					tempid=batchItem.getBatchData();
					if(tempid.length!==0){
						if(action==='forbid'||action==='enable'){
							/*确认是否启用或禁用*/
							setSure.sure(actiontip[action],function(cf){
								/*to do*/
								setEnabled({
									id:tempid,
									action:action,
									tip:cf.dia||dia,
									type:'batch',
									actiontip:actiontip,
									actionmap:actionmap
								},action==='forbid'?"禁用后，该供应商将禁止使用，在APP中查看不到该供应商，商品也归纳至禁售商品中，是否禁用？":"启用后，该供应商将可以使用，在APP中能查看该供应商，商品也归纳至可售商品中，是否启用？",true);
							});
						}
					}
				},2000);
			}else{
				tempid=batchItem.getBatchData();
				if(tempid.length!==0){
					if(action==='forbid'||action==='enable'){
						/*确认是否启用或禁用*/
						setSure.sure(actiontip[action],function(cf){
						 /*to do*/
						 setEnabled({
						 id:tempid,
						 action:action,
						 tip:cf.dia||dia,
						 type:'batch',
						 actiontip:actiontip,
						 actionmap:actionmap
						 },action==='forbid'?"禁用后，该供应商将禁止使用，在APP中查看不到该供应商，商品也归纳至禁售商品中，是否禁用？":"启用后，该供应商将可以使用，在APP中能查看该供应商，商品也归纳至可售商品中，是否启用？",true);
						 });
					}
				}
			}
		}


	});


})(jQuery);