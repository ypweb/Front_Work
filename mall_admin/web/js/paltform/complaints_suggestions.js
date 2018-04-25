(function($){
	'use strict';
	$(function(){

		var table=null/*数据展现*/;

		/*初始化数据*/
		if(public_tool.initMap.isrender){
			/*菜单调用*/
			var logininfo=public_tool.initMap.loginMap;
			public_tool.loadSideMenu(public_vars.$mainmenu,public_vars.$main_menu_wrap,{
				url:'http://10.0.5.226:8082/mall-buzhubms-api/module/menu',
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




			/*dom引用和相关变量定义*/
			var $admin_list_wrap=$('#admin_list_wrap')/*表格*/,
				module_id='bzw-complaints-suggestions'/*模块id，主要用于本地存储传值*/,
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
				$show_comsug_wrap=$('#show_comsug_wrap'),
				admin_comsug_form=document.getElementById('admin_comsug_form'),
				$admin_comsug_form=$(admin_comsug_form),
				$admin_id=$('#admin_id'),
				$admin_dealRemark=$('#admin_dealRemark'),
				resetform0=null;




			/*查询对象*/
			var $search_phone=$('#search_phone'),
				$search_nickName=$('#search_nickName'),
				$admin_search_btn=$('#admin_search_btn'),
				$admin_search_clear=$('#admin_search_clear');



			/*列表请求配置*/
			var comsug_page={
					page:1,
					pageSize:10,
					total:0
				},
				comsug_config={
					$admin_list_wrap:$admin_list_wrap,
					$admin_page_wrap:$admin_page_wrap,
					config:{
						processing:true,/*大消耗操作时是否显示处理状态*/
						deferRender:true,/*是否延迟加载数据*/
						autoWidth:true,/*是否*/
						paging:false,
						ajax:{
							url:"http://10.0.5.226:8082/mall-buzhubms-api/feedback/list",
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
								comsug_page.page=result.page;
								comsug_page.pageSize=result.pageSize;
								comsug_page.total=result.count;
								/*分页调用*/
								$admin_page_wrap.pagination({
									pageSize:comsug_page.pageSize,
									total:comsug_page.total,
									pageNumber:comsug_page.page,
									onSelectPage:function(pageNumber,pageSize){
										/*再次查询*/
										var param=comsug_config.config.ajax.data;
										param.page=pageNumber;
										param.pageSize=pageSize;
										comsug_config.config.ajax.data=param;
										getColumnData(comsug_page,comsug_config);
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
						order:[[5, "desc" ],[4, "desc" ]],
						columns: [
							{
								"data":"nickName"
							},
							{
								"data":"phone",
								"render":function(data, type, full, meta ){
									return public_tool.phoneFormat(data);
								}
							},
                            {
                                "data":"contact"
                            },
							{
								"data":"storeName"
							},
                            {
                                "data":"storeAddress"
                            },
							{
								"data":"content"
							},
							{
								"data":"createTime"
							},
							{
								"data":"dealStatus",
								"render":function(data, type, full, meta ){
									var status=parseInt(data,10),
										str='';
									if(status===0){
										str='<div class="g-c-warn">未处理</div>';
									}else if(status===1){
										str='<div class="g-c-gray6">已处理</div>';
									}else{
										str='<div class="g-c-red1">异常处理</div>';
									}
									return str;
								}
							},
							{
								"data":"id",
								"render":function(data, type, full, meta ){
									var id=parseInt(data,10),
										status=parseInt(full.dealStatus,10),
										btns='';

									if(status===0){
										btns+='<span  data-action="comsug" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
										<i class="fa-hand-o-up"></i>\
										<span>处理</span>\
										</span>';
									}
									return btns;
								}
							}
						]
					}
				};
			

			/*初始化请求*/
			getColumnData(comsug_page,comsug_config);




			/*清空查询条件*/
			$admin_search_clear.on('click',function(){
				$.each([$search_phone,$search_nickName],function(){
					this.val('');
				});
			});
			$admin_search_clear.trigger('click');


			/*联合查询*/
			$admin_search_btn.on('click',function(){
				var data= $.extend(true,{},comsug_config.config.ajax.data);

				$.each([$search_phone,$search_nickName],function(){
					var text=this.val(),
						selector=this.selector.slice(1),
						key=selector.split('_');

					if(selector.indexOf('phone')!==-1){
						text=public_tool.trims(text);
					}

					if(text===""){
						delete data[key[1]];
					}else{
						data[key[1]]=text;
					}

				});
				comsug_config.config.ajax.data= $.extend(true,{},data);
				getColumnData(comsug_page,comsug_config);
			});


			/*格式化手机号码*/
			$.each([$search_phone],function(){
				this.on('keyup',function(){
					var phoneno=this.value.replace(/\D*/g,'');
					if(phoneno===''){
						this.value='';
						return false;
					}
					this.value=public_tool.phoneFormat(this.value);
				});
			});


			/*绑定关闭详情*/
			$.each([$show_comsug_wrap],function () {
				this.on('hide.bs.modal',function(){
					admin_comsug_form.reset();
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
				if(action==='comsug'){
					if(operate_item){
						operate_item.removeClass('item-lighten');
						operate_item=null;
					}
					operate_item=$tr.addClass('item-lighten');
					$admin_id.val(id);
					$show_comsug_wrap.modal('show',{backdrop:'static'});
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
							formtype='comsug';
						}
						$.extend(true,(function () {
							if(formtype==='comsug'){
								return form_opt0;
							}
						}()),(function () {
							if(formtype==='comsug'){
								return formcache.form_opt_0;
							}
						}()),{
							submitHandler: function(form){
								var setdata={};
								$.extend(true,setdata,basedata);
								if(formtype==='comsug'){
									$.extend(true,setdata,{
										id:$admin_id.val(),
										dealRemark:$admin_dealRemark.val()
									});
									config['url']="http://10.0.5.226:8082/mall-buzhubms-api/feedback/deal";
									config['data']=setdata;
								}

								$.ajax(config).done(function(resp){
									var code;
									if(formtype==='comsug'){
										code=parseInt(resp.code,10);
										if(code!==0){
											dia.content('<span class="g-c-bs-warning g-btips-warn">处理投诉与建议失败</span>').show();
											if(operate_item){
												operate_item.removeClass('item-lighten');
												operate_item=null;
											}
											return false;
										}else{
											dia.content('<span class="g-c-bs-success g-btips-succ">处理投诉与建议成功</span>').show();
											if(operate_item){
												operate_item.removeClass('item-lighten');
												operate_item=null;
											}
											/*请求数据,更新列表*/
											getColumnData(comsug_page,comsug_config);
											setTimeout(function () {
												dia.close();
												admin_comsug_form.reset();
												$show_comsug_wrap.modal('hide');
											},2000);
										}
									}
								}).fail(function(resp){
									console.log('error');
									dia.content('<span class="g-c-bs-warning g-btips-warn">处理投诉与建议失败</span>').show();
									if(operate_item){
										operate_item.removeClass('item-lighten');
										operate_item=null;
									}
									setTimeout(function () {
										dia.close();
										admin_comsug_form.reset();
										$show_comsug_wrap.modal('hide');
									},2000);
								});
								return false;
							}
						});
					});

				}


				/*提交验证*/
				if(resetform0===null){
					resetform0=$admin_comsug_form.validate(form_opt0);
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




	});


})(jQuery);