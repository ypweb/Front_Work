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
				param:{
					roleId:decodeURIComponent(logininfo.param.roleId),
					adminId:decodeURIComponent(logininfo.param.adminId),
					token:decodeURIComponent(logininfo.param.token)
				},
				datatype:'json'
			});

			/*清除编辑数据*/
			public_tool.removeParams('mall-user-editadmin');


			/*权限调用*/
			var powermap=public_tool.getPower(),
				delete_power=public_tool.getKeyPower('user-deleteadmin',powermap),
				edit_power=public_tool.getKeyPower('user-updateadmin',powermap);



			/*dom引用和相关变量定义*/
			var $admin_list_wrap=$('#admin_list_wrap')/*表格*/,
				module_id='mall-user-admin'/*模块id，主要用于本地存储传值*/,
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
			var $search_Name=$('#search_Name'),
				$search_telePhone=$('#search_telePhone'),
				$admin_search_btn=$('#admin_search_btn'),
				$admin_search_clear=$('#admin_search_clear');




			/*列表请求配置*/
			var admin_page={
					page:1,
					pageSize:10,
					total:0
				},
				admin_config={
					$admin_list_wrap:$admin_list_wrap,
					$admin_page_wrap:$admin_page_wrap,
					config:{
						processing:true,/*大消耗操作时是否显示处理状态*/
						deferRender:true,/*是否延迟加载数据*/
						autoWidth:true,/*是否*/
						paging:false,
						ajax:{
							url:"../../json/user/mall_user_admin.json",
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
								admin_page.page=result.page;
								admin_page.pageSize=result.pageSize;
								admin_page.total=result.count;
								/*分页调用*/
								$admin_page_wrap.pagination({
									pageSize:admin_page.pageSize,
									total:admin_page.total,
									pageNumber:admin_page.page,
									onSelectPage:function(pageNumber,pageSize){
										/*再次查询*/
										var param=admin_config.config.ajax.data;
										param.page=pageNumber;
										param.pageSize=pageSize;
										admin_config.config.ajax.data=param;
										getColumnData(admin_page,admin_config);
									}
								});
								return result?result.list||[]:[];
							},
							data:{
								userId:decodeURIComponent(logininfo.param.roleId),
								adminId:decodeURIComponent(logininfo.param.adminId),
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
								"data":"nickName"
							},
							{
								"data":"Name"
							},
							{
								"data":"email"
							},
							{
								"data":"telePhone",
								"render":function(data, type, full, meta ){
									return public_tool.phoneFormat(data);
								}
							},
							{
								"data":"lastLoginTime"
							},
							{
								"data":"loginCount"
							},
							{
								"data":"id",
								"render":function(data, type, full, meta ){
									var id=parseInt(data,10),
										btns='';

									if(edit_power){
										btns+='<span data-action="edit" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-pencil"></i>\
											<span>编辑权限</span>\
										</span>';
									}
									if(delete_power){
										btns+='<span data-action="delete" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
												<i class="fa-trash"></i>\
												<span>删除权限</span>\
											</span>';
									}
									return btns;
								}
							}
						]
					}
				};
			

			/*初始化请求*/
			getColumnData(admin_page,admin_config);


			/*清空查询条件*/
			$admin_search_clear.on('click',function(){
				$.each([$search_Name,$search_telePhone],function(){
					this.val('');
				});
			});
			$admin_search_clear.trigger('click');


			/*联合查询*/
			$admin_search_btn.on('click',function(){
				var data= $.extend(true,{},admin_config.config.ajax.data);

				$.each([$search_Name,$search_telePhone],function(){
					var text=this.val(),
						selector=this.selector.slice(1),
						key=selector.split('_');

					if(selector.indexOf('telePhone')!==-1){
						text=public_tool.trims(text);
					}

					if(text===""){
						if(typeof data[key[1]]!=='undefined'){
							delete data[key[1]];
						}
					}else{
						data[key[1]]=text;
					}

				});
				admin_config.config.ajax.data= $.extend(true,{},data);
				getColumnData(admin_page,admin_config);
			});


			/*格式化手机号码*/
			$.each([$search_telePhone],function(){
				this.on('keyup',function(){
					var phoneno=this.value.replace(/\D*/g,'');
					if(phoneno===''){
						this.value='';
						return false;
					}
					this.value=public_tool.phoneFormat(this.value);
				});
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
					public_tool.setParams('mall-user-editadmin',id);
					window.location.href='mall-user-editadmin.html';
				}else if(action==='delete'){
					if(operate_item){
						operate_item.removeClass('item-lighten');
						operate_item=null;
					}
					operate_item=$tr.addClass('item-lighten');
					/*确认是否启用或禁用*/
					setSure.sure('delete',function(cf){
						/*to do*/
						deletePower({
							id:id,
							tip:cf.dia||dia,
							$tr:$tr
						});
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


		/*删除权限*/
		function deletePower(obj){
			var id=obj.id;

			if(typeof id==='undefined'||id===''){
				return false;
			}
			var tip=obj.tip,
				$tr=obj.$tr;

			$.ajax({
					url:"../../json/user/mall_user_admin.json",
					dataType:'JSON',
					method:'post',
					data:{
						id:id,
						roleId:decodeURIComponent(logininfo.param.roleId),
						adminId:decodeURIComponent(logininfo.param.adminId),
						token:decodeURIComponent(logininfo.param.token)
					}
				})
				.done(function(resp){
					var code=parseInt(resp.code,10);
					if(code!==0){
						console.log(resp.message);
						tip.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
						setTimeout(function () {
							tip.close();
							if(operate_item){
								operate_item.removeClass('item-lighten');
								operate_item=null;
							}
						},2000);
						return false;
					}
					/*是否是正确的返回数据*/
					/*添加高亮状态*/
					tip.content('<span class="g-c-bs-success g-btips-succ">删除成功</span>').show();
					setTimeout(function () {
						tip.close();
						operate_item=null;
						$tr.remove();
						setTimeout(function () {
							/*请求数据*/
							getColumnData(admin_page,admin_config);
						},1000);
					},1000);
									})
				.fail(function(resp){
					console.log(resp.message);
					tip.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
					setTimeout(function () {
						tip.close();
						if(operate_item){
							operate_item.removeClass('item-lighten');
							operate_item=null;
						}
					},2000);
				});
		}

	});


})(jQuery);