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
			var powermap=public_tool.getPower(),
				articleaudit_power=public_tool.getKeyPower('文章审核',powermap),
				articletop_power=public_tool.getKeyPower('文章置顶',powermap),
				articlead_power=public_tool.getKeyPower('文章推广',powermap),
				articledelete_power=public_tool.getKeyPower('文章删除',powermap),
				articleupdate_power=public_tool.getKeyPower('文章修改',powermap);



			/*dom引用和相关变量定义*/
			var $content_wrap=$('#content_wrap')/*表格*/,
				module_id='content_channel'/*模块id，主要用于本地存储传值*/,
				$data_wrap=$('#data_wrap')/*数据展现面板*/,
				$edit_wrap=$('#edit_wrap')/*编辑容器面板*/,
				$content_add_btn=$('#content_add_btn'),/*添加角色*/
				$edit_title=$('#edit_title')/*编辑标题*/,
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
				$admin_page_wrap=$('#admin_page_wrap')/*分页数据*/;



			/*查询对象*/
			var $search_name=$('#search_name'),
				$search_isEnable=$('#search_isEnable'),
				$admin_search_btn=$('#admin_search_btn'),
				$admin_search_clear=$('#admin_search_clear');



			/*表单对象*/
			var edit_form=document.getElementById('content_form')/*表单dom*/,
				$edit_cance_btn=$('#edit_cance_btn')/*编辑取消按钮*/,
				$content_form=$(edit_form)/*编辑表单*/,
				$content_id=$('#content_id'),/*成员id*/
				$content_name=$('#content_name'),/*标题*/
				$content_parentid=$('#content_parentid')/*内容*/,
				$content_ordinal=$('#content_ordinal')/*时间*/,
				$content_bankid=$('#content_bankid')/*缩略图*/,
				$content_remark=$('#content_remark')/*所属公司*/;



			/*列表请求配置*/
			var content_page={
					page:1,
					pageSize:10,
					total:0
				},
				content_config={
					$content_wrap:$content_wrap,
					$admin_page_wrap:$admin_page_wrap,
					config:{
						processing:true,/*大消耗操作时是否显示处理状态*/
						deferRender:true,/*是否延迟加载数据*/
						autoWidth:true,/*是否*/
						paging:false,
						ajax:{
							url:"http://10.0.5.226:8016/yttx-adminbms-api/article/list",
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
								var result=json.result;
								/*设置分页*/
								content_page.page=result.page;
								content_page.pageSize=result.pageSize;
								content_page.total=result.count;
								/*分页调用*/
								$admin_page_wrap.pagination({
									pageSize:content_page.pageSize,
									total:content_page.total,
									pageNumber:content_page.page,
									onSelectPage:function(pageNumber,pageSize){
										/*再次查询*/
										var param=content_config.config.ajax.data;
										param.page=pageNumber;
										param.pageSize=pageSize;
										content_config.config.ajax.data=param;
										getColumnData(content_page,content_config);
									}
								});
								return result.list;
							},
							data:{
								roleId:decodeURIComponent(logininfo.param.roleId),
								adminId:decodeURIComponent(logininfo.param.adminId),
								token:decodeURIComponent(logininfo.param.token),
								page:1,
								pageSize:10
							}
						},
						info:false,
						searching:true,
						ordering:true,
						columns: [
							{"data":"title"},
							{
								"data":"userNickName"
							},
							{
								"data":"auditStatus",
								"render":function(data, type, full, meta ){
									var audit=parseInt(data,10);
									if(audit===0){
										return '<span class="g-c-gray1">待审核</span>';
									}else if(audit===1){
										return '<span class="g-c-info">审核成功</span>';
									}else if(audit===2){
										return '<span class="g-c-warn">审核失败</span>';
									}
								}
							},
							{
								"data":"typeName"
							},
							{
								"data":"thumbnail"
							},
							{
								"data":"content",
								"render":function(data, type, full, meta ){
									var htmlstr=data.toString().replace(/[<*]/g,'&lt;').replace(/[>*]/g,'&gt;');
									if(htmlstr.length>200){
										return htmlstr.slice(0,30)+'&lt;/br&gt;'+htmlstr.slice(30,60)+'&lt;/br&gt;'+htmlstr.slice(60,90)+'...';
									}else{
										return htmlstr.slice(0,30)+'...'
									}
								}
							},
							{
								"data":"id",
								"render":function(data, type, full, meta ){
									var id=parseInt(data,10),
										btns='';

										var state=parseInt(full.state,10),
											audit=parseInt(full.auditStatus,10);

										if(state===0&&articletop_power){
											/*默认*/
											btns+='<span data-action="normal" data-id="'+id+'" data-state="0" data-current="0" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-file-o"></i>\
											<span>默认</span>\
											</span>\
											<span data-action="top" data-id="'+id+'" data-state="1" data-current="0" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray12">\
											<i class="fa-star"></i>\
											<span>置顶</span>\
											</span>\
											<span data-action="ad" data-id="'+id+'" data-state="2" data-current="0" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray12">\
											<i class="fa-tag"></i>\
											<span>推广</span>\
											</span>';
										}else if(state===1&&articletop_power){
											/*置顶*/
											btns+='<span data-action="normal" data-id="'+id+'" data-state="0" data-current="1" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray12">\
											<i class="fa-file-o"></i>\
											<span>默认</span>\
											</span>\
											<span data-action="top" data-id="'+id+'" data-state="1" data-current="1" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-star"></i>\
											<span>置顶</span>\
											</span>\
											<span data-action="ad" data-id="'+id+'" data-state="2" data-current="1" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray12">\
											<i class="fa-tag"></i>\
											<span>推广</span>\
											</span>';
										}else if(state===2&&articlead_power){
											/*推广*/
											btns+='<span data-action="normal" data-id="'+id+'" data-state="0" data-current="2" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray12">\
											<i class="fa-file-o"></i>\
											<span>默认</span>\
											</span>\
											<span data-action="top" data-id="'+id+'" data-state="1" data-current="2" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray12">\
											<i class="fa-star"></i>\
											<span>置顶</span>\
											</span>\
											<span data-action="ad" data-id="'+id+'" data-state="2" data-current="2" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-tag"></i>\
											<span>推广</span>\
											</span>';
										}

										if(audit===0&&articleaudit_power){
											/*待审核*/
											btns+='<span data-action="audit" data-id="'+id+'" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-gavel"></i>\
											<span>待审核</span>\
											</span>';
										}

									if(articledelete_power){
										btns+='<span data-action="delete" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-trash"></i>\
											<span>删除</span>\
											</span>';

									}

									if(articleupdate_power){
										btns+='<span data-action="update" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-pencil"></i>\
											<span>修改</span>\
											</span>';
									}

									return btns;
								}
							}
						]
					}
				};


			/*初始化请求*/
			getColumnData(content_page,content_config);


			/*
			 * 初始化
			 * */
			/*重置表单*/
			edit_form.reset();

			/*清空查询条件*/
			$admin_search_clear.on('click',function(){
				$.each([$search_name,$search_isEnable],function(){
					var isselect=this.selector.toLowerCase().indexOf('isenable')!==-1?true:false;
					if(isselect){
						this.find('option:first-child').prop({
							'selected':true
						});
					}else {
						this.val('');
					}
				});
			});
			$admin_search_clear.trigger('click');

			/*联合查询*/
			$admin_search_btn.on('click',function(){
				var data= $.extend(true,{},content_config.config.ajax.data);

				$.each([$search_name,$search_isEnable],function(){
					var selector=this.selector.slice(1),
						isselect=this.selector.toLowerCase().indexOf('isenable')!==-1?true:false,
						key=selector.split('_'),
						text=isselect?this.find('option:selected').val():this.val();

					if(text===""){
						if(typeof data[key[1]]!=='undefined'){
							delete data[key[1]];
						}
					}else{
						data[key[1]]=text;
					}
				});
				content_config.config.ajax.data= $.extend(true,{},data);
				getColumnData(content_page,content_config);
			});


			/*事件绑定*/
			/*绑定查看，修改操作*/
			var operate_item;
			$content_wrap.delegate('span','click',function(e){
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

				/*修改操作*/
				if(action==='update'){
					if(operate_item){
						operate_item.removeClass('item-lighten');
						operate_item=null;
					}
					operate_item=$tr.addClass('item-lighten');
					/*调整布局*/
					$data_wrap.addClass('collapsed');
					$edit_wrap.removeClass('collapsed');
					$("html,body").animate({scrollTop:300},200);
					//重置信息
					$edit_title.html('修改频道');

					var datas=table.row($tr).data();
					for(var i in datas) {
						switch (i) {
							case "id":
								$content_id.val(datas[i]);
								break;
							case "name":
								$content_name.val(datas[i]);
								break;
							case "parentId":
								$content_parentid.val(datas[i]);
								break;
							case "ordinal":
								$content_ordinal.val(datas[i]);
								break;
							case "bankId":
								$content_bankid.val(datas[i]);
								break;
							case "remark":
								$content_remark.val(datas[i]);
								break;
						}
					}
				}else if(action==='delete'){
					/*删除操作*/
					//没有回调则设置回调对象
					if(operate_item){
						operate_item.removeClass('item-lighten');
						operate_item=null;
					}
					operate_item=$tr.addClass('item-lighten');

					dialogObj.setFn(function(){
						var self=this;

						$.ajax({
								url:"http://10.0.5.226:8016/yttx-adminbms-api/article/type/operate",
								method: 'POST',
								dataType: 'json',
								data:{
									"typeId":id,
									"adminId":decodeURIComponent(logininfo.param.adminId),
									"token":decodeURIComponent(logininfo.param.token),
									"operate":3
								}
							})
							.done(function (resp) {
								var code=parseInt(resp.code,10);
								if(code!==0){
									self.content('<span class="g-c-bs-warning g-btips-warn">删除失败</span>').show();
									setTimeout(function () {
										self.close();
										if(operate_item){
											operate_item.removeClass('item-lighten');
											operate_item=null;
										}
									},2000);
									console.log(resp.message);
									return false;
								}
								if(operate_item){
									operate_item.removeClass('item-lighten');
									operate_item=null;
								}
								getColumnData(content_page,content_config);
								setTimeout(function(){
									self.content('<span class="g-c-bs-success g-btips-succ">删除数据成功</span>');
								},100);
							})
							.fail(function(resp){
								console.log(resp.message);
							});
					},'content_delete');
					//确认删除
					dialogObj.dialog.content('<span class="g-c-bs-warning g-btips-warn">是否删除此频道？</span>').showModal();

				}else if(action==='on'||action==='off'){
					if(operate_item){
						operate_item.removeClass('item-lighten');
						operate_item=null;
					}
					operate_item=$tr.addClass('item-lighten');
					/*判断是否可以上下架*/
					var isenable=$this.attr('data-isenable'),
						current=$this.attr('data-current'),
						statemap={
							'on':'启用',
							'off':'禁用'
						};

					if(isenable===current){
						dia.content('<span class="g-c-bs-warning g-btips-warn">目前已经是\"'+statemap[action]+'\"</span>').show();
						return false;
					}


					$.ajax({
							url:"http://10.0.5.226:8016/yttx-adminbms-api/article/type/operate",
							method: 'POST',
							dataType: 'json',
							data:{
								"typeId":id,
								"adminId":decodeURIComponent(logininfo.param.adminId),
								"token":decodeURIComponent(logininfo.param.token),
								"operate":action==='on'?1:2
							}
						})
						.done(function (resp) {
							var code=parseInt(resp.code,10);
							if(code!==0){
								dia.content('<span class="g-c-bs-warning g-btips-warn">'+statemap[action]+'失败</span>').show();
								setTimeout(function () {
									dia.close();
									if(operate_item){
										operate_item.removeClass('item-lighten');
										operate_item=null;
									}
								},2000);
								console.log(resp.message);
								return false;
							}
							if(operate_item){
								operate_item.removeClass('item-lighten');
								operate_item=null;
							}
							getColumnData(content_page,content_config);
							dia.content('<span class="g-c-bs-success g-btips-succ">'+statemap[action]+'成功</span>').show();
							setTimeout(function(){
								dia.close();
							},2000);
						})
						.fail(function(resp){
							console.log(resp.message);
						});
				}



			});


			/*取消修改*/
			$edit_cance_btn.on('click',function(e){
				//切换显示隐藏表格和编辑区
				/*调整布局*/
				$data_wrap.removeClass('collapsed');
				$edit_wrap.addClass('collapsed');
				if(!$data_wrap.hasClass('collapsed')){
					$("html,body").animate({scrollTop:200},200);
				}
			});


			/*最小化窗口*/
			$edit_title.next().on('click',function(e){
				if($data_wrap.hasClass('collapsed')){
					e.stopPropagation();
					e.preventDefault();
					$edit_cance_btn.trigger('click');
				}
			});


			/*添加文章广告*/
			$content_add_btn.on('click',function(e){
				e.preventDefault();
				//重置表单
				edit_form.reset();
				$edit_title.html('添加频道');
				/*调整布局*/
				$data_wrap.addClass('collapsed');
				$edit_wrap.removeClass('collapsed');
				$("html,body").animate({scrollTop:300},200);
				//第一行获取焦点
				$content_name.focus();
			});
			if(articleupdate_power){
				$content_add_btn.removeClass('g-d-hidei');
				$edit_wrap.removeClass('g-d-hidei');
			}

			/*表单验证*/
			if($.isFunction($.fn.validate)) {
				/*配置信息*/
				var form_opt={};
				if(public_tool.cache.form_opt_0){
					$.extend(true,form_opt,public_tool.cache.form_opt_0,{
						submitHandler: function(form){
							//判断是否存在id号
							var id=$content_id.val();


							if(id!==''){
								//此处配置修改稿角色地址（开发阶段）
								var config={
									url:"http://10.0.5.226:8016/yttx-adminbms-api/article/type/update",
									dataType:'JSON',
									method:'post',
									data:{
										typeId:id,
										adminId:decodeURIComponent(logininfo.param.adminId),
										token:decodeURIComponent(logininfo.param.token),
										name:$content_name.val(),
										parentId:$content_parentid.val(),
										ordinal:$content_ordinal.val(),
										bankId:$content_bankid.val(),
										remark:$content_remark.val()
									}
								};
							}else{
								//此处配置添加角色地址（开发阶段）
								var config={
									url:"http://10.0.5.226:8016/yttx-adminbms-api/article/type/add",
									dataType:'JSON',
									method:'post',
									data:{
										typeId:id,
										adminId:decodeURIComponent(logininfo.param.adminId),
										token:decodeURIComponent(logininfo.param.token),
										name:$content_name.val(),
										parentId:$content_parentid.val(),
										ordinal:$content_ordinal.val(),
										bankId:$content_bankid.val(),
										remark:$content_remark.val()
									}
								};
							}

							$.ajax(config)
								.done(function(resp){
									var code=parseInt(resp.code,10);
									if(code!==0){
										console.log(resp.message);
										id!==''?dia.content('<span class="g-c-bs-warning g-btips-warn">修改频道失败</span>').show():dia.content('<span class="g-c-bs-warning g-btips-warn">添加频道失败</span>').show();
										setTimeout(function () {
											dia.close();
										},2000);
										return false;
									}
									if(operate_item&&id!==''){
										operate_item.removeClass('item-lighten');
										operate_item=null;
									}
									//重绘表格
									getColumnData(content_page,content_config);
									//重置表单
									$edit_cance_btn.trigger('click');
									id!==''?dia.content('<span class="g-c-bs-success g-btips-succ">修改频道成功</span>').show():dia.content('<span class="g-c-bs-success g-btips-succ">添加频道成功</span>').show();
									setTimeout(function () {
										dia.close();
									},2000);
								})
								.fail(function(resp){
									console.log(resp.message);
								});
							return false;
						}
					});
				}
				/*提交验证*/
				$content_form.validate(form_opt);
			}



		}


		/*获取数据*/
		function getColumnData(page,opt){
			if(table===null){
				table=opt.$content_wrap.DataTable(opt.config);
			}else{
				table.ajax.config(opt.config.ajax).load();
			}
		};



	});


})(jQuery);