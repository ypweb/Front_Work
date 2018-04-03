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

			/*清除编辑数据*/
			public_tool.removeParams('bzw-advert-add');


			/*权限调用*/
			var powermap=public_tool.getPower(),
				manage_power=public_tool.getKeyPower('bzw-advert-list',powermap);



			/*dom引用和相关变量定义*/
			var $admin_list_wrap=$('#admin_list_wrap')/*表格*/,
				module_id='bzw-advert-list'/*模块id，主要用于本地存储传值*/,
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
				$admin_page_wrap=$('#admin_page_wrap');


			/*列表请求配置*/
			var advert_page={
					page:1,
					pageSize:10,
					total:0
				},
				advert_config={
					$admin_list_wrap:$admin_list_wrap,
					$admin_page_wrap:$admin_page_wrap,
					config:{
						processing:true,/*大消耗操作时是否显示处理状态*/
						deferRender:true,/*是否延迟加载数据*/
						autoWidth:true,/*是否*/
						paging:false,
						ajax:{
							url:"http://112.74.207.132:8081/mall-buzhubms-api/banners/list",
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
								advert_page.page=result.page;
								advert_page.pageSize=result.pageSize;
								advert_page.total=result.count;
								/*分页调用*/
								$admin_page_wrap.pagination({
									pageSize:advert_page.pageSize,
									total:advert_page.total,
									pageNumber:advert_page.page,
									onSelectPage:function(pageNumber,pageSize){
										/*再次查询*/
										var param=advert_config.config.ajax.data;
										param.page=pageNumber;
										param.pageSize=pageSize;
										advert_config.config.ajax.data=param;
										getColumnData(advert_page,advert_config);
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
						order:[[4, "desc" ]],
						columns: [
							{
								"data":"title"
							},
							{
								"data":"imageUrl"
							},
							{
								"data":"forwardType",
								"render":function(data, type, full, meta ){
									var ftype=parseInt(data,10),
										fmap={
											0:'商品',
											1:'类目分类',
											2:'链接'
										};

									return fmap[ftype];
								}
							},
							{
								"data":"forwardUrl"
							},
							{
								"data":"status",
								"render":function(data, type, full, meta ){
									var stype=parseInt(data,10),
										smap={
											0:'<div class="g-c-gray3">上架</div>',
											1:'<div class="g-c-warn">下架</div>'
										};
									return smap[stype];
								}
							},
							{
								"data":"remark"
							},
							{
								"data":"id",
								"render":function(data, type, full, meta ){
									var id=parseInt(data,10),
										status=parseInt(full.status,10),
										btns='';



									if(manage_power){
										btns+='<span data-action="edit" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-pencil"></i>\
											<span>编辑</span>\
										</span>';
										if(status===0){
											/*上架状态则下架*/
											btns+='<span data-action="down" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
												<i class="fa-arrow-down"></i>\
												<span>下架</span>\
											</span>';
										}else if(status===1){
											/*下架状态则上架*/
											btns+='<span data-action="up" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
												<i class="fa-arrow-up"></i>\
												<span>上架</span>\
											</span>';
										}
									}
									return btns;
								}
							}
						]
					}
				};
			

			/*初始化请求*/
			getColumnData(advert_page,advert_config);


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
				if(action==='edit'){
					var tempdata=table.row($tr).data();
					public_tool.setParams('bzw-advert-add',tempdata);
					location.href='bzw-advert-add.html';
				}else if(action==='up'||action==='down'){
					if(operate_item){
						operate_item.removeClass('item-lighten');
						operate_item=null;
					}
					operate_item=$tr.addClass('item-lighten');
					/*to do*/
					setEnabled({
						id:id,
						action:action
					});
				}
			});

		}


		/*获取数据*/
		function getColumnData(page,opt){
			if(table===null){
				table=opt.$admin_list_wrap.DataTable(opt.config);
			}else{
				table.ajax.config(opt.config.ajax).load();
			}
		}


		/*启用禁用*/
		function setEnabled(obj){
			var id=obj.id;

			if(typeof id==='undefined'){
				return false;
			}
			var action=obj.action;

			$.ajax({
					url:"http://112.74.207.132:8081/mall-buzhubms-api/banners/updown",
					dataType:'JSON',
					method:'post',
					data:{
						id:id,
						status:action==='up'?0:1,
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
						dia.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
						setTimeout(function () {
							dia.close();
							if(operate_item){
								operate_item.removeClass('item-lighten');
								operate_item=null;
							}
						},2000);
						return false;
					}
					/*是否是正确的返回数据*/
					/*添加高亮状态*/
					dia.content('<span class="g-c-bs-success g-btips-succ">'+(action==="up"?'上架':'下架')+'成功</span>').show();
					setTimeout(function () {
						dia.close();
						setTimeout(function () {
							operate_item=null;
							/*请求数据*/
							getColumnData(advert_page,advert_config);
						},1000);
					},1000);
				})
				.fail(function(resp){
					console.log(resp.message);
					dia.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
					setTimeout(function () {
						dia.close();
						if(operate_item){
							operate_item.removeClass('item-lighten');
							operate_item=null;
						}
					},2000);
				});
		}


	});


})(jQuery);