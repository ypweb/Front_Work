/*admin_role:角色管理*/
(function($){
	'use strict';
	$(function(){

		/*初始化数据*/
		if(public_tool.initMap.isrender){
			/*菜单调用*/
			var logininfo=public_tool.initMap.loginMap;
			public_tool.loadSideMenu(public_vars.$mainmenu,public_vars.$main_menu_wrap,{
				url:'http://10.0.5.226:8016/yttx-adminbms-api/module/menu',
				async:false,
				type:'post',
				param:{
					roleId:decodeURIComponent(logininfo.param.roleId),
					adminId:decodeURIComponent(logininfo.param.adminId),
					token:decodeURIComponent(logininfo.param.token)
				},
				datatype:'json'
			});


			/*权限调用*/
			var powermap=public_tool.getPower();


			/*dom引用和相关变量定义*/
			var $admin_role_wrap=$('#admin_role_wrap')/*角色表格*/,
				$admin_member_wrap=$('#admin_member_wrap')/*成员表格*/,
				module_id='admin_role'/*模块id，主要用于本地存储传值*/,
				table=null/*datatable 角色解析后的对象*/,
				table_member=null/*datatable 成员解析后的对象*/,
				$member_wrap=$('#member_wrap')/*成员操作区域*/,
				$table_wrap=$('#table_wrap')/*表格容器*/,
				$table_member_wrap=$('#table_member_wrap')/*表格容器*/,
				$edit_wrap=$('#edit_wrap')/*角色编辑容器*/,
				$edit_member_wrap=$('#edit_member_wrap')/*成员编辑容器*/,
				$role_add_btn=$('#role_add_btn'),/*添加角色*/
				$member_add_btn=$('#member_add_btn'),/*添加成员*/
				$edit_close_btn=$('#edit_close_btn')/*角色编辑关闭按钮*/,
				$editmember_close_btn=$('#editmember_close_btn')/*成员编辑关闭按钮*/,
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
				dialogObj=public_tool.dialog()/*回调提示对象*/,
				$show_detail_wrap=$('#show_detail_wrap')/*详情容器*/,
				$show_detail_title=$('#show_detail_title')/*详情标题*/,
				$show_detail_content=$('#show_detail_content')/*详情内容*/;

			/*表单对象*/
			var $edit_cance_btn=$('#edit_cance_btn')/*编辑取消按钮*/,
				edit_form=document.getElementById('role_edit_form'),
				$role_edit_form=$('#role_edit_form')/*编辑表单*/,
				$role_id=$('#role_id'),/*角色id*/
				$role_name=$('#role_name'),/*角色名称*/
				$role_remark=$('#role_remark'),/*角色描述*/
				$editmember_cance_btn=$('#editmember_cance_btn')/*编辑取消按钮*/,
				editmember_form=document.getElementById('member_edit_form'),
				$member_edit_form=$('#member_edit_form')/*编辑表单*/,
				$member_id=$('#member_id'),/*成员id*/
				$member_username=$('#member_username'),/*成员登陆名*/
				$member_password=$('#member_password'),/*成员密码*/
				$member_name=$('#member_name')/*成员名称*/;


			/*成员请求信息*/
			var member_config={
						url:"http://10.0.5.226:8016/yttx-adminbms-api/sysusers",
						dataType:'JSON',
						method:'post',
						dataSrc:function ( json ) {
							var code=parseInt(json.code,10);
							if(code!==0){
								console.log(json.message);
								return null;
							}
							return json.result.list;
						},
						data:{
							roleId:'-1',
							adminId:decodeURIComponent(logininfo.param.adminId),
							token:decodeURIComponent(logininfo.param.token)
						}
				};



			/*角色数据加载*/
			table=$admin_role_wrap.DataTable({
				deferRender:true,/*是否延迟加载数据*/
				//serverSide:true,/*是否服务端处理*/
				searching:true,/*是否搜索*/
				ordering:false,/*是否排序*/
				//order:[[1,'asc']],/*默认排序*/
				paging:true,/*是否开启本地分页*/
				pagingType:'simple_numbers',/*分页按钮排列*/
				autoWidth:true,/*是否*/
				info:true,/*显示分页信息*/
				stateSave:false,/*是否保存重新加载的状态*/
				processing:true,/*大消耗操作时是否显示处理状态*/
				ajax:{
					url:"http://10.0.5.226:8016/yttx-adminbms-api/roles",
					dataType:'JSON',
					method:'post',
					dataSrc:function ( json ) {
						var code=parseInt(json.code,10);
						if(code!==0){
							if(code===999){
								/*清空缓存*/
								public_tool.clear();
								public_tool.loginTips();
							}
							console.log(json.message);
							return null;
						}
						return json.result.list;
					},
					data:(function(){
						/*查询本地,如果有则带参数查询，如果没有则初始化查询*/
						var param=public_tool.getParams(module_id);
						//获取参数后清除参数
						public_tool.removeParams(module_id);
						if(param){
							return {
								roleId:param.roleId,
								adminId:decodeURIComponent(logininfo.param.adminId),
								token:decodeURIComponent(logininfo.param.token)
							};
						}
						return {
							roleId:decodeURIComponent(logininfo.param.roleId),
							adminId:decodeURIComponent(logininfo.param.adminId),
							token:decodeURIComponent(logininfo.param.token)
						};
					}())
				},/*异步请求地址及相关配置*/
				columns: [
					{"data":"name"},
					{"data":"description"},
					{
						"data":"id",
						"render":function(data, type, full, meta ){
							var id=parseInt(data,10),
								btns='';

							/*修改*/
							if(typeof powermap[3]!=='undefined'){
								btns+='<span data-id="'+id+'" data-action="update" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
									 <i class="fa-pencil"></i>\
									 <span>修改</span>\
									 </span>';
							}
							/*成员*/
							if(typeof powermap[7]!=='undefined'){
								btns+='<span data-action="select" data-id="'+id+'" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
									 <i class="fa-group"></i>\
									 <span>成员</span>\
									 </span>';
							}

							/*删除*/
							if(typeof powermap[4]!=='undefined'){
								if(id!==1){
									btns+='<span  data-id="'+id+'" data-action="delete" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
									<i class="fa-trash"></i>\
									<span>删除</span>\
									</span>';
								}
							}

							return btns;
						}
					}
				],/*控制分页数*/
				aLengthMenu: [
					[5,10,15],
					[5,10,15]
				],
				lengthChange:true/*是否可改变长度*/
			});

			/*成员数据加载*/
			table_member=$admin_member_wrap.DataTable({
				deferRender:true,/*是否延迟加载数据*/
				//serverSide:true,/*是否服务端处理*/
				searching:true,/*是否搜索*/
				ordering:false,/*是否排序*/
				//order:[[1,'asc']],/*默认排序*/
				columnDefs:[],/*配置列状态*/
				paging:true,/*是否开启本地分页*/
				pagingType:'simple_numbers',/*分页按钮排列*/
				autoWidth:true,/*是否*/
				info:true,/*显示分页信息*/
				stateSave:false,/*是否保存重新加载的状态*/
				processing:true,/*大消耗操作时是否显示处理状态*/
				ajax:member_config,/*异步请求地址及相关配置*/
				columns: [
					{"data":"username"},
					{"data":"name"},
					{
						"data":"id",
						"render":function(data, type, full, meta ){
							var id=parseInt(data,10),
								btns='';

							/*修改*/
							if(typeof powermap[8]!=='undefined'){
								btns+='<span data-id="'+id+'" data-action="update" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
									 <i class="fa-pencil"></i>\
									 <span>修改</span>\
									 </span>';
							}


							/*删除*/
							if(typeof powermap[9]!=='undefined'){
									btns+='<span  data-id="'+id+'" data-action="delete" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
									<i class="fa-trash"></i>\
									<span>删除</span>\
									</span>';
							}

							btns+='<span data-id="'+id+'" data-action="select" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
									 <i class="fa-group"></i>\
									 <span>查看</span>\
									 </span>';

							return btns;
						}
					},
					{
						"data":"password",
						"className":'g-d-hidei',
						"render":function(data, type, full, meta ){
							return encodeURIComponent(data);
						}
					}
				],/*控制分页数*/
				aLengthMenu: [
					[5,10,15],
					[5,10,15]
				],
				lengthChange:true/*是否可改变长度*/
			});




			/*事件绑定*/
			/*绑定查看，修改，删除操作*/
			$.each([$admin_role_wrap,$admin_member_wrap],function(){
				var self=this,
						selector=this.selector,
						isrole=selector.indexOf('role')!==-1?true:false;

				this.delegate('span','click',function(e){
					e.stopPropagation();
					e.preventDefault();

					var target= e.target,
						$this,
						id,
						module,
						action,
						href,
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
					href=$this.attr('data-href');

					if(href){
						//跳转查询操作
						//清除本地存储
						module=$this.attr('data-module');
						public_tool.removeParams(module);
						//设置本地存储
						public_tool.setParams(module,{
							'module':module,
							'id':id,
							'action':action
						});
						//地址跳转
						setTimeout(function(){
							location.href=href;
						},100);

					}else{
						if(action==='delete'){
							/*删除操作*/
							//没有回调则设置回调对象
							dialogObj.setFn(function(){
								var self=this,
									config;


								if(isrole){
									//删除角色
									config={
											url:"http://10.0.5.226:8016/yttx-adminbms-api/role/delete",
											method: 'POST',
											dataType: 'json',
											data:{
												"roleId":id,
												"adminId":decodeURIComponent(logininfo.param.adminId),
												"token":decodeURIComponent(logininfo.param.token)
											}
										}
								}else{
									//删除成员
									config={
										url:"http://10.0.5.226:8016/yttx-adminbms-api/sysuser/delete",
										method: 'POST',
										dataType: 'json',
										data:{
											"userId":id,
											"adminId":decodeURIComponent(logininfo.param.adminId),
											"token":decodeURIComponent(logininfo.param.token)
									}
								}
								}
								$.ajax(config)
									.done(function (resp) {
										var code=parseInt(resp.code,10);
										if(code!==0){
											dia.content('<span class="g-c-bs-warning g-btips-warn">删除失败</span>').show();
											setTimeout(function () {
												dia.close();
											},2000);
											return false;
										}
										isrole?table.row($tr).remove().draw():table_member.row($tr).remove().draw();
										setTimeout(function(){
											self.content('<span class="g-c-bs-success g-btips-succ">删除数据成功</span>');
										},100);
									})
									.fail(function(resp){
										console.log(resp.message);
									});
							},'admin_delete');
							//确认删除
							dialogObj.dialog.content('<span class="g-c-bs-warning g-btips-warn">是否删除此数据？</span>').showModal();

						}else if(action==='update'){
							if(isrole){
								/*修改操作*/
								$table_wrap.addClass('col-md-9');
								$edit_wrap.addClass('g-d-showi');
								//重置信息
								$edit_close_btn.prev().html('修改角色');
								$edit_cance_btn.prev().html('修改角色');
								var datas=table.row($tr).data();
							}else{
								/*修改操作*/
								$table_member_wrap.addClass('col-md-9');
								$edit_member_wrap.addClass('g-d-showi');
								//重置信息
								$editmember_close_btn.prev().html('修改成员');
								$editmember_cance_btn.prev().html('修改成员');
								var datas=table_member.row($tr).data();
							}
							//赋值
							for(var i in datas){
								if(isrole){
									switch (i){
										case 'name':
											$role_name.val(datas[i]);
											break;
										case 'description':
											$role_remark.val(datas[i]);
											break;
										case 'id':
											$role_id.val(datas[i]);
											break;
									}
								}else{
									switch (i){
										case 'name':
											$member_name.val(datas[i]);
											break;
										case 'username':
											$member_username.val(datas[i]);
											break;
										case 'id':
											$member_id.val(datas[i]);
											break;
										case 'password':
											$member_password.val(datas[i]);
											break;
									}
								}
							}
						}else if(action==='select'){
							/*查询操作*/
							if(isrole){
								$member_wrap.attr({'data-id':id});
								member_config.data.roleId=id;
								table_member.ajax.config(member_config).load();
							}else{
								/*查看详情*/
								$.ajax({
										url:"http://10.0.5.226:8016/yttx-adminbms-api/sysuser/info",
										dataType:'JSON',
										method:'post',
										data:{
											"userId":id,
											"adminId":decodeURIComponent(logininfo.param.adminId),
											"token":decodeURIComponent(logininfo.param.token)
										}
									})
									.done(function(resp){
										var code=parseInt(resp.code,10);
										if(code!==0){
											console.log(resp.message);
											return false;
										}
										/*是否是正确的返回数据*/
										var list=resp.result,
											str='';

										if(!$.isEmptyObject(list)){
											for(var j in list){
												if(j==='name'||j==='Name'){
													$show_detail_title.html(list[j]+'成员详情信息');
												}else{
													str+='<tr><th>'+j+'</th><td>'+list[j]+'</td></tr>';
												}
											};
											$show_detail_content.html(str);
											$show_detail_wrap.modal('show',{backdrop:'static'});
										}else{
											$show_detail_content.html('');
											$show_detail_title.html('');
										}
									})
									.fail(function(resp){
										console.log(resp.message);
									});
							}
						}
					}



				});

			});


			/*//取消修改*/
			$.each([$edit_cance_btn,$editmember_cance_btn],function () {
				var selector=this.selector;
				//切换显示隐藏表格和编辑区
				this.on('click',function(e){
					if(selector.indexOf('member')!==-1){
						//成员
						$table_member_wrap.removeClass('col-md-9');
						$edit_member_wrap.removeClass('g-d-showi');
					}else{
						//角色
						$table_wrap.removeClass('col-md-9');
						$edit_wrap.removeClass('g-d-showi');
					}
				});
			});


			/*添加角色,成员*/
			$.each([$role_add_btn,$member_add_btn],function(){
				var selector=this.selector;

				/*绑定事件*/
				this.on('click',function(){
					if(selector.indexOf('role')!==-1){
						//角色
						edit_form.reset();
						$edit_close_btn.prev().html('添加角色');
						$edit_cance_btn.prev().html('添加角色');
						//显示表单
						$table_wrap.addClass('col-md-9');
						$edit_wrap.addClass('g-d-showi');
						//第一行获取焦点
						$role_name.focus();
					}else{
						if($member_wrap.attr('data-id')===''){
							dia.content('<span class="g-c-bs-warning g-btips-warn">请先选中角色</span>').show();
							return false;
						}
						//成员
						editmember_form.reset();
						$editmember_close_btn.prev().html('添加成员');
						$editmember_cance_btn.prev().html('添加成员');
						//显示表单
						$table_member_wrap.addClass('col-md-9');
						$edit_member_wrap.addClass('g-d-showi');
						//第一行获取焦点
						$member_username.focus();
					}
				});

				/*显示*/
				if(selector.indexOf('role')!==-1&&typeof powermap[2]!=='undefined'){
					this.removeClass('g-d-hidei');
				}else if(selector.indexOf('member')!==-1&&typeof powermap[7]!=='undefined'){
					this.removeClass('g-d-hidei');
				}
			})


			/*//关闭编辑区*/
			$.each([$edit_close_btn,$editmember_close_btn],function(){
				var selector=this.selector;
				this.on('click',function(e){
					e.preventDefault();
					if(selector.indexOf('member')!==-1){
						$editmember_cance_btn.trigger('click');
					}else{
						$edit_cance_btn.trigger('click');
					}
				});

			});


			/*表单验证*/
			if($.isFunction($.fn.validate)) {
				/*配置信息*/
				var form_opt_0={},
						form_opt_1={};
				if(public_tool.cache.form_opt_0){
					$.extend(true,form_opt_0,public_tool.cache.form_opt_0,{
						submitHandler: function(form){
							//判断是否存在id号
							var id=$role_id.val();
							if(id!==''){
								//修改角色
								var config={
											url:"http://10.0.5.226:8016/yttx-adminbms-api/role/update",
											method: 'POST',
											dataType: 'json',
											data:{
												"roleId":id,
												"adminId":decodeURIComponent(logininfo.param.adminId),
												"token":decodeURIComponent(logininfo.param.token),
												"updateUserId":decodeURIComponent(logininfo.param.adminId),
												"name":$role_name.val(),
												"description":$role_remark.val()
											}
										};
							}else{
								//添加角色
								var config={
									url:"http://10.0.5.226:8016/yttx-adminbms-api/role/add",
									method: 'POST',
									dataType: 'json',
									data:{
										"roleId":decodeURIComponent(logininfo.param.roleId),
										"adminId":decodeURIComponent(logininfo.param.adminId),
										"token":decodeURIComponent(logininfo.param.token),
										"addUserId":decodeURIComponent(logininfo.param.adminId),
										"name":$role_name.val(),
										"description":$role_remark.val()
									}
								};
							}

							$.ajax(config)
								.done(function(resp){
									var code=parseInt(resp.code,10);
									if(code!==0){
										console.log(resp.message);
										dia.content('<span class="g-c-bs-warning g-btips-warn">操作失败</span>').show();
										setTimeout(function () {
											dia.close();
										},2000);
										return false;
									}

									if(id!==''){
										//修改
										dia.content('<span class="g-c-bs-success g-btips-succ">修改成功</span>').show();

									}else{
										//添加
										dia.content('<span class="g-c-bs-success g-btips-succ">添加成功</span>').show();
									}
									//重置表单
									$edit_cance_btn.trigger('click');
									//重绘表格
									table.ajax.reload(null,false);
									setTimeout(function () {
										dia.close();
									},2000);
								})
								.fail(function(){
									dia.content('<span class="g-c-bs-warning g-btips-warn">操作失败</span>').show();
									setTimeout(function () {
										dia.close();
									},2000);

								});

							return false;
						}
					});

					/*提交验证*/
					$role_edit_form.validate(form_opt_0);
				}

				if(public_tool.cache.form_opt_1){
					$.extend(true,form_opt_1,public_tool.cache.form_opt_1,{
						submitHandler: function(form){
							//判断是否存在id号
							var id=$member_id.val();
							if(id!==''){
								//修改成员
								var config={
									url:"http://10.0.5.226:8016/yttx-adminbms-api/sysuser/update",
									method: 'POST',
									dataType: 'json',
									data:{
										"userId":id,
										"adminId":decodeURIComponent(logininfo.param.adminId),
										"token":decodeURIComponent(logininfo.param.token),
										"username":$member_username.val(),
										"password":$member_password.val(),
										"name":$member_name.val()
									}
								};
							}else{
								//添加成员
								var config={
									url:"http://10.0.5.226:8016/yttx-adminbms-api/sysuser/add",
									method: 'POST',
									dataType: 'json',
									data:{
										"roleId":$member_wrap.attr('data-id'),
										"adminId":decodeURIComponent(logininfo.param.adminId),
										"token":decodeURIComponent(logininfo.param.token),
										"username":$member_username.val(),
										"password":$member_password.val(),
										"name":$member_name.val()
									}
								};
							}

							$.ajax(config)
								.done(function(resp){
									var code=parseInt(resp.code,10);
									if(code!==0){
										console.log(resp.message);
										dia.content('<span class="g-c-bs-warning g-btips-warn">操作失败</span>').show();
										setTimeout(function () {
											dia.close();
										},2000);
										return false;
									}

									if(id!==''){
										//修改
										dia.content('<span class="g-c-bs-success g-btips-succ">修改成功</span>').show();

									}else{
										//添加
										dia.content('<span class="g-c-bs-success g-btips-succ">添加成功</span>').show();
									}
									//重置表单
									$editmember_cance_btn.trigger('click');
									//重绘表格
									table_member.ajax.reload(null,false);
									setTimeout(function () {
										dia.close();
									},2000);
								})
								.fail(function(){
									dia.content('<span class="g-c-bs-warning g-btips-warn">操作失败</span>').show();
									setTimeout(function () {
										dia.close();
									},2000);

								});

							return false;
						}
					});


					/*提交验证*/
					$member_edit_form.validate(form_opt_1);
				}
			}



		}



	});


})(jQuery);