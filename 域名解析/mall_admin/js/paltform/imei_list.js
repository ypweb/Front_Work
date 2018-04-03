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
			


			/*权限调用*/
			var powermap=public_tool.getPower(320),
				imeiadd_power=public_tool.getKeyPower('bzw-imei-add',powermap);



			/*dom引用和相关变量定义*/
			var $admin_list_wrap=$('#admin_list_wrap')/*表格*/,
				module_id='bzw-imei-list'/*模块id，主要用于本地存储传值*/,
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
				$admin_addimei=$('#admin_addimei'),
				$show_add_wrap=$('#show_add_wrap'),
				admin_add_form=document.getElementById('admin_add_form'),
				$admin_add_form=$(admin_add_form),
				$admin_agent=$('#admin_agent'),
				$admin_type=$('#admin_type'),
				$admin_imeiCode=$('#admin_imeiCode'),
				resetform0=null,
				sureObj=public_tool.sureDialog(dia)/*回调提示对象*/,
				setSure=new sureObj();


			/*批量配置参数*/
			var $admin_batchitem_btn=$('#admin_batchitem_btn'),
				$admin_batchitem_show=$('#admin_batchitem_show'),
				$admin_batchitem_check=$('#admin_batchitem_check'),
				$admin_batchitem_action=$('#admin_batchitem_action'),
				$admin_imeilist=$('#admin_imeilist'),
				batchItem=new public_tool.BatchItem();

			/*批量初始化*/
			batchItem.init({
				$batchtoggle:$admin_batchitem_btn,
				$batchshow:$admin_batchitem_show,
				$checkall:$admin_batchitem_check,
				$action:$admin_batchitem_action,
				$listwrap:$admin_imeilist,
				setSure:setSure,
				fn:function (type) {
					/*批量操作*/
					batchIMEI({
						action:type
					});
				}
			});


			/*查询对象*/
			var $search_imeiCode=$('#search_imeiCode'),
				$admin_search_btn=$('#admin_search_btn'),
				$admin_search_clear=$('#admin_search_clear');


			/*初始化*/
			if(imeiadd_power){
				/*绑定显示添加*/
				$admin_addimei.removeClass('g-d-hidei').on('click',function () {
					$show_add_wrap.modal('show',{backdrop:'static'});
				});
			}
			admin_add_form.reset();




			/*列表请求配置*/
			var user_page={
					page:1,
					pageSize:10,
					total:0
				},
				user_config={
					$admin_list_wrap:$admin_list_wrap,
					$admin_page_wrap:$admin_page_wrap,
					config:{
						processing:true,/*大消耗操作时是否显示处理状态*/
						deferRender:true,/*是否延迟加载数据*/
						autoWidth:true,/*是否*/
						paging:false,
						ajax:{
							url:"http://112.74.207.132:8081/mall-buzhubms-api/subscriber/list/bzwbms",
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
								user_page.page=result.page;
								user_page.pageSize=result.pageSize;
								user_page.total=result.count;
								/*分页调用*/
								$admin_page_wrap.pagination({
									pageSize:user_page.pageSize,
									total:user_page.total,
									pageNumber:user_page.page,
									onSelectPage:function(pageNumber,pageSize){
										/*再次查询*/
										var param=user_config.config.ajax.data;
										param.page=pageNumber;
										param.pageSize=pageSize;
										user_config.config.ajax.data=param;
										getColumnData(user_page,user_config);
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
						order:[[1, "desc" ]],
						columns: [
							{
								"data":"id",
								"orderable" :false,
								"searchable" :false,
								"render":function(data, type, full, meta ){
									return '<input value="'+parseInt(data,10)+'" name="imeiid" type="checkbox" />';
								}
							},
							{
								"data":"id"
							},
							{
								"data":"imeiCode"
							},
							{
								"data":"id",
								"orderable" :false,
								"searchable" :false,
								"render":function(data, type, full, meta ){
									var id=parseInt(data,10),
										btns='';

									btns+='<span  data-action="delete" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
										<i class="fa-trash"></i>\
										<span>删除</span>\
										</span>';
									return btns;
								}
							}
						]
					}
				};
			

			/*初始化请求*/
			getColumnData(user_page,user_config);


			/*查询代理商*/
			getAgentData();


			/*清空查询条件*/
			$admin_search_clear.on('click',function(){
				$.each([$search_imeiCode],function(){
					this.val('');
				});
			});
			$admin_search_clear.trigger('click');


			/*联合查询*/
			$admin_search_btn.on('click',function(){
				var data= $.extend(true,{},user_config.config.ajax.data);

				$.each([$search_imeiCode],function(){
					var text=this.val(),
						selector=this.selector.slice(1),
						key=selector.split('_');

					if(text===""){
						delete data[key[1]];
					}else{
						data[key[1]]=text;
					}

				});
				user_config.config.ajax.data= $.extend(true,{},data);
				getColumnData(user_page,user_config);
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
				if(action==='delete'){
					batchItem.filterData(id);
					if(operate_item){
						operate_item.removeClass('item-lighten');
						operate_item=null;
					}
					operate_item=$tr.addClass('item-lighten');
					/*确认是否删除*/
					setSure.sure('delete',function(cf){
						/*to do*/
						deleteIMEI({
							id:id,
							tip:cf.dia||dia,
							type:'base'
						});
					});
				}
			});


			/*绑定添加IMEI码*/
			/*表单验证*/
			if($.isFunction($.fn.validate)) {
				/*配置信息*/
				var form_opt0={},
					formcache=public_tool.cache,
					basedata={
						roleId:decodeURIComponent(logininfo.param.roleId),
						adminId:decodeURIComponent(logininfo.param.adminId),
						grade:decodeURIComponent(logininfo.param.grade),
						token:decodeURIComponent(logininfo.param.token)
					};


				if(formcache.form_opt_0){
					$.each([formcache.form_opt_0],function(index){
						var formtype,
							config={
								dataType:'JSON',
								method:'post'
							};
						if(index===0){
							formtype='addimei';
						}
						$.extend(true,(function () {
							if(formtype==='addimei'){
								return form_opt0;
							}
						}()),(function () {
							if(formtype==='addimei'){
								return formcache.form_opt_0;
							}
						}()),{
							submitHandler: function(form){
								var setdata={};
								$.extend(true,setdata,basedata);
								if(formtype==='addimei'){
									$.extend(true,setdata,{
										agentId:$admin_agent.val(),
										type:$admin_type.val(),
										imeiCode:$admin_imeiCode.val()
									});
									config['url']="http://112.74.207.132:8081/mall-buzhubms-api/subscriber/add/bzwbms";
									config['data']=setdata;
								}

								$.ajax(config).done(function(resp){
									var code;
									if(formtype==='addimei'){
										code=parseInt(resp.code,10);
										if(code!==0){
											dia.content('<span class="g-c-bs-warning g-btips-warn">添加IMEI码失败</span>').show();
											return false;
										}else{
											dia.content('<span class="g-c-bs-success g-btips-succ">添加IMEI码成功</span>').show();
											/*请求数据,更新列表*/
											getColumnData(user_page,user_config);
											setTimeout(function () {
												dia.close();
												$show_add_wrap.modal('hide');
											},2000);
										}
									}
								}).fail(function(resp){
									console.log('error');
									dia.content('<span class="g-c-bs-warning g-btips-warn">添加IMEI码失败</span>').show();
									setTimeout(function () {
										dia.close();
										$show_add_wrap.modal('hide');
									},2000);
								});
								return false;
							}
						});
					});

				}


				/*提交验证*/
				if(resetform0===null){
					resetform0=$admin_add_form.validate(form_opt0);
				}

			}



		}


		/*获取数据*/
		function getColumnData(page,opt){
			if(table===null){
				table=opt.$admin_list_wrap.DataTable(opt.config);
			}else{
				table.ajax.config(opt.config.ajax).load();
			}
		}


		/*删除IMEI码*/
		function deleteIMEI(obj){
			var id=obj.id;

			if(typeof id==='undefined'){
				return false;
			}
			var tip=obj.tip,
				type=obj.type;

			if(type==='batch'){
				id=id.join(',');
			}

			$.ajax({
					url:"http://112.74.207.132:8081/mall-buzhubms-api/subscriber/delete/bzwbms",
					dataType:'JSON',
					method:'post',
					data:{
						ids:id,
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
					tip.content('<span class="g-c-bs-success g-btips-succ">删除成功</span>').show();
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
							/*请求数据*/
							getColumnData(user_page,user_config);
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


		/*查询代理商*/
		function getAgentData() {
			$.ajax({
					url:"http://112.74.207.132:8081/mall-buzhubms-api/agent/listprov",
					dataType:'JSON',
					method:'post',
					data:{
						roleId:decodeURIComponent(logininfo.param.roleId),
						adminId:decodeURIComponent(logininfo.param.adminId),
						grade:decodeURIComponent(logininfo.param.grade),
						token:decodeURIComponent(logininfo.param.token)
					}
				})
				.done(function(resp) {
					var code = parseInt(resp.code, 10);
					if (code !== 0) {
						console.log(resp.message);
						dia.content('<span class="g-c-bs-warning g-btips-warn">' + (resp.message || "操作失败") + '</span>').show();
						setTimeout(function () {
							dia.close();
						}, 2000);
						return false;
					}
					/*是否是正确的返回数据*/
					var result = resp.result;
					if (!result) {
						return false;
					}
					var list=result.list;
					if(!list){
						return false;
					}
					var len=list.length,
						i=0,
						str='';
					if(len!==0){
						for(i;i<len;i++){
							var item=list[i];
							if(i===0){
								str+='<option selected value="">请选择代理商</option><option value="'+item["id"]+'">'+item["fullName"]+'</option>';
							}else{
								str+='<option value="'+item["id"]+'">'+item["fullName"]+'</option>';
							}
						}
						$(str).appendTo($admin_agent.html(''));
					}else{
						$admin_agent.html('<option selected value="">请选择代理商</option>');
					}
				})
				.fail(function(resp){
					console.log(resp.message);
					dia.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
					setTimeout(function () {
						dia.close();
					},2000);
				});
		}


		/*批量操作*/
		function batchIMEI(config) {

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
			var tempid=batchItem.getBatchData();
			if(tempid.length!==0){
				if(action==='delete'){
					/*确认是否启用或禁用*/
					setSure.sure('delete',function(cf){
						/*to do*/
						deleteIMEI({
							id:tempid,
							tip:cf.dia||dia,
							type:'batch'
						});
					});
				}
			}
		}


	});


})(jQuery);