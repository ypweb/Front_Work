/*admin_member:成员设置*/
(function($){
	'use strict';
	$(function(){

		/*dom引用和相关变量定义*/
		var $serve_manage_wrap=$('#serve_manage_wrap')/*表格*/,
			module_id='serve_manage'/*模块id，主要用于本地存储传值*/,
			table=null,
			$data_wrap=$('#data_wrap')/*数据展现面板*/,
			$edit_wrap=$('#edit_wrap')/*编辑容器面板*/,
			$manage_add_btn=$('#manage_add_btn'),/*添加角色*/
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
			$manage_detail_wrap=$('#manage_detail_wrap')/*查看详情容器*/,
			$manage_detail_title=$('#manage_detail_title')/*查看详情标题*/,
			$manage_detail_show=$('#manage_detail_show')/*查看详情内容*/;

		/*表单对象*/
		var edit_form=document.getElementById('manage_edit_form')/*表单dom*/,
			$manage_edit_form=$(edit_form)/*编辑表单*/,
			$manage_id=$('#manage_id'),/*成员id*/
			$edit_continue_btn=$('#edit_continue_btn')/*保存继续添加*/,
			$edit_cance_btn=$('#edit_cance_btn')/*编辑取消按钮*/,
			$manage_servename=$('#manage_servename'),/*服务站名称*/
			$manage_mininame=$('#manage_mininame')/*服务站简称*/,
			$manage_leader=$('#manage_leader')/*负责人*/,
			$manage_bindagent=$('#manage_bindagent')/*绑定代理商*/,
			$manage_mobliephone=$('#manage_mobliephone')/*手机号*/,
			$manage_phone=$('#manage_phone')/*电话*/,
			$member_remark=$('#member_remark')/*成员描述*/,
			$province=$('#province')/*地址下拉--省*/,
			$city=$('#city')/*地址下拉--市*/,
			$area=$('#area')/*地址下拉--区*/,
			$province_value=$('#province_value')/*地址选中--省*/,
			$city_value=$('#city_value')/*地址选中--市*/,
			$area_value=$('#area_value')/*地址选中--区*/,
			$manage_address=$('#manage_address')/*详细地址*/,
			$manage_remark=$('#manage_remark')/*描述，备注*/,
			$manage_agent=$('#manage_agent')/*成为代理商*/,
			$manage_agentlevela=$('#manage_agentlevela')/*A级代理商*/,
			$manage_agentlevelaa=$('#manage_agentlevelaa')/*AA级代理商*/,
			$manage_agentlevelaaa=$('#manage_agentlevelaaa')/*AAA级代理商*/;


		//初始化请求
		table=$serve_manage_wrap.DataTable({
			deferRender:true,/*是否延迟加载数据*/
			//serverSide:true,/*是否服务端处理*/
			searching:true,/*是否搜索*/
			ordering:true,/*是否排序*/
			//order:[[1,'asc']],/*默认排序*/
			paging:true,/*是否开启本地分页*/
			pagingType:'simple_numbers',/*分页按钮排列*/
			autoWidth:true,/*是否自适应宽度*/
			info:true,/*显示分页信息*/
			stateSave:false,/*是否保存重新加载的状态*/
			processing:true,/*大消耗操作时是否显示处理状态*/
			/*异步请求地址及相关配置*/
			ajax:{
				url:"../../json/admin/admin_power_user.json",
				dataType:'JSON',
				method:'post',
				data:(function(){
					/*查询本地,如果有则带参数查询，如果没有则初始化查询*/
					var param=public_tool.getParams(module_id);
					//获取参数后清除参数
					public_tool.removeParams(module_id);
					if(param){
						return {"id":param.id};
					}
					return '';
				}()),
				dataSrc:"data"
			},/*默认配置排序规则*/
			columns: [
				{
					"data":"id",
					"orderable":false,
					"render":function(data, type, full, meta ){
						return '<input type="checkbox" data-id="'+full.id+'" name="member" class="cbr">';
					}
				},
				{"data":"companyName"},
				{"data":"name"},
				{"data":"phone"},
				{"data":"companyAddress"},
				{"data":"serve"},
				{"data":"grade"},
				{
					"data":{
						id:'id',
						type:'type'
					},
					"render":function(data, type, full, meta ){
						var id=full.id,
							type=full.type,
							btns='<span data-action="select" data-type="'+type+'" data-id="'+id+'" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-group"></i>\
											<span>查看</span>\
											</span>\
											<span data-id="'+id+'" data-type="'+type+'"  data-action="update" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa fa-pencil"></i>\
											<span>修改</span>\
											</span>\
											<span data-href="serve_send.html" data-module="serve_send" data-action="select" data-type="'+type+'"  data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-gear"></i>\
											<span>发货</span>\
											</span>\
											<span data-href="serve_repair.html" data-module="serve_repair" data-action="select" data-type="'+type+'"  data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-gear"></i>\
											<span>返修</span>\
											</span>';

						return btns;
					}
				}
			],/*控制列数*/
			aLengthMenu: [
				[10,20,50],
				[10,20,50]
			],/*控制是否每页可改变显示条数*/
			lengthChange:true/*是否可改变长度*/
		});



		/*初始化地址信息*/
		if(public_tool){
			new public_tool.areaSelect().areaSelect({
				$province:$province,
				$city:$city,
				$area:$area,
				$provinceinput:$province_value,
				$cityinput:$city_value,
				$areainput:$area_value
			});
		}else{
			new areaSelect().areaSelect({
				$province:$province,
				$city:$city,
				$area:$area,
				$provinceinput:$province_value,
				$cityinput:$city_value,
				$areainput:$area_value
			});
		}




		/*事件绑定*/
		/*绑定查看，修改操作*/
		$serve_manage_wrap.delegate('span','click',function(e){
			e.stopPropagation();
			e.preventDefault();

			var target= e.target,
				$this,
				id,
				type,
				module,
				action,
				href,
				$cbx,
				$tr;

			//适配对象
			if(target.className.indexOf('btn')!==-1){
				$this=$(target);
			}else{
				$this=$(target).parent();
			}
			$tr=$this.closest('tr'),
			$cbx=$tr.find('td:first-child input');

			//先选中数据
			if(!$cbx.is(':checked')){
				dia.content('<span class="g-c-bs-warning g-btips-warn">请选中数据</span>').show();
				return false;
			}

			id=$this.attr('data-id');
			type=$this.attr('data-type');
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
					'type':type,
					'action':action
				});
				//地址跳转
				setTimeout(function(){
					location.href=href;
				},100);

			}else{
				/*修改操作*/
				if(action==='update'){
					/*调整布局*/
					$data_wrap.addClass('collapsed');
					$edit_wrap.removeClass('collapsed');
					$("html,body").animate({scrollTop:300},200);
					//重置信息
					$edit_title.html('修改服务站');
					//请求并赋值
					$.ajax({
							url:"../../json/admin/admin_power_user.json",
							dataType:'JSON',
							method:'post',
							data:{
								"id":id,
								"type":type
							}
						})
						.done(function(resp){
							if(resp.flag){
								var datas=resp.data,
									str='',
									len=datas.length,
									i=0;
								/*是否有返回数据*/
								if(len!==0){
									for(i;i<len;i++){
										if(datas[i]['id']===id){
											datas=datas[i];
											break;
										}
									}
								}
								/*是否是正确的返回数据*/
								if($.isPlainObject(datas)){
									var res;
									for(var j in datas){
										res=datas[j];
										switch (j){
											case "id":
												$manage_id.val(res);
												break;
											case "companyName":
												$manage_servename.val(res);
												break;
											case "name":
												$manage_leader.val(res);
												break;
											case "agent":
												$manage_bindagent.children().each(function(index){
													var $this=$(this);
													if($this.val()===res){
														$this.prop('selected',true).siblings().prop('selected',false);
														return false;
													}
												});
												break;
											case "phone":
												$manage_mobliephone.val(public_tool.phoneFormat(res));
												break;
											case "address":
												$manage_address.val(res);
												break;
											case "remark":
												$manage_remark.val(res);
												break;
											case "isAgent":
												if(res==='0'){
													$manage_agent.prop('checked',false);
													$.each([$manage_agentlevela,$manage_agentlevelaa,$manage_agentlevelaaa],function(){
														this.prop('checked',false).attr('disabled',true);
													});
												}else if(res==='1'){
													$manage_agent.prop('checked',true);
													var current_level=datas['grade'].replace(/级/g,'');
													$.each([$manage_agentlevela,$manage_agentlevelaa,$manage_agentlevelaaa],function(index){
														if(current_level==='A'&&index===0){
															this.prop('checked',true).removeAttr('disabled');
														}else if(current_level==='AA'&&index===1){
															this.prop('checked',true).removeAttr('disabled');
														}else if(current_level==='AAA'&&index===2){
															this.prop('checked',true).removeAttr('disabled');
														}else{
															this.prop('checked',false).removeAttr('disabled');
														}
													});
												}
												break;
										}
									}
								}else{
									/*调用表单的重置功能*/
									edit_form.reset();
									dia.content('<span class="g-c-bs-warning g-btips-warn">没有获取到数据</span>').show();
								};
							}else{
								/*调用表单的重置功能*/
								edit_form.reset();
								dia.content('<span class="g-c-bs-warning g-btips-warn">没有获取到数据</span>').show();
							}
						})
						.fail(function(resp){
							if(!resp.flag){
								console.log('获取数据失败');
							}
							/*调用表单的重置功能*/
							edit_form.reset();
							dia.content('<span class="g-c-bs-warning g-btips-warn">没有获取到数据</span>').show();

						});
				}else if(action==='select'){
							/*查看详情*/
							$manage_detail_wrap.modal('show',{backdrop:'static'});
							$.ajax({
									url:"../../json/admin/admin_power_user.json",
									dataType:'JSON',
									method:'post',
									data:{
										"id":id,
										"type":type
									}
							})
							.done(function(resp){
									if(resp.flag){

										var datas=resp.data,
											str='',
											len=datas.length,
											i=0;
										/*是否有返回数据*/
										if(len!==0){
											for(i;i<len;i++){
												if(datas[i]['id']===id){
													datas=datas[i];
													break;
												}
											}
										}
										/*是否是正确的返回数据*/
										if($.isPlainObject(datas)){
											var str='';
											for(var i in datas){
												if(i==='userName'||i==='username'){
													$manage_detail_title.html(i+'服务站详情信息');
												}else{
													str+='<tr><th>'+i+'</th><td>'+datas[i]+'</td></tr>';
												}
											};
											$manage_detail_show.html(str);
										}
										$manage_detail_show.html(str);
									}else{
										$manage_detail_title.html('');
										$manage_detail_show.html('');
									}
							})
							.fail(function(resp){
									if(!resp.flag){
											$manage_detail_title.html('');
											$manage_detail_show.html('');
									}
							});
				}
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

		/*添加服务站*/
		$manage_add_btn.on('click',function(e){
			e.preventDefault();
			//重置表单
			edit_form.reset();
			$edit_title.html('添加服务站');
			/*调整布局*/
			$data_wrap.addClass('collapsed');
			$edit_wrap.removeClass('collapsed');
			$("html,body").animate({scrollTop:300},200);
			//第一行获取焦点
			$manage_servename.focus();
		});



		/*表单验证*/
		if($.isFunction($.fn.validate)) {
			/*配置信息*/
			var form_opt={};
			if(public_tool.cache.form_opt_0){
				$.extend(true,form_opt,public_tool.cache.form_opt_0,{
					submitHandler: function(form){
						//判断是否存在id号
						var id=$manage_id.val(),
							config={
								url:"",
								method: 'POST',
								dataType: 'json'
							},
							data=$manage_edit_form.serializeArray(),
							datalen=data.length,
							i= 0,
							res={};


						if(id!==''){
							//此处配置修改稿角色地址（开发阶段）
							config.url="../../json/admin/admin_role_update.json";
						}else{
							//此处配置添加角色地址（开发阶段）
							config.url="../../json/admin/admin_role_update.json";
							for(i;i<datalen;i++){
								if(data[i]['name']==='id'){
									delete data[i];
									i=0;
									datalen=data.length;
									break;
								}
							}
						}


						for(i;i<datalen;i++){
							var tempdata=data[i];
							if(tempdata['name']==='mobliePhone'){
								tempdata['value']=tempdata['value'].replace(/\s*/g,'');
							}
							res[tempdata['name']]=tempdata['value'];
						}
						config.data=res;

						$.ajax(config)
							.done(function(resp){
								if(resp.flag){
									//重绘表格
									table.draw();
									$edit_cance_btn.trigger('click');

									if(public_tool.cache.form_opt_0['continue']){
										form.reset();
										setTimeout(function(){
											$manage_add_btn.trigger('click');
										},200);
									}
									setTimeout(function(){
										dia.content('<span class="g-c-bs-success g-btips-succ">操作成功</span>').show();
									},200);
								}else{
									dia.content('<span class="g-c-bs-warning g-btips-warn">操作失败</span>').show();
								}
								public_tool.cache.form_opt_0['continue']=false;
								setTimeout(function () {
									dia.close();
								},2000);
							})
							.fail(function(){
								dia.content('<span class="g-c-bs-warning g-btips-warn">操作失败</span>').show();
								setTimeout(function () {
									dia.close();
								},2000)
								public_tool.cache.form_opt_0['continue']=false;
							});

						return false;
					}
				});
			}
			/*提交验证*/
			$manage_edit_form.validate(form_opt);
		}



		/*格式化手机号码*/
		$manage_mobliephone.on('keyup',function(){
			this.value=public_tool.phoneFormat(this.value);
		});



		/*绑定选中成为代理*/
		$manage_agent.on('click',function(e){
			var $this=$(this),
				isflag=$this.is(':checked');

			$.each([$manage_agentlevela,$manage_agentlevelaa,$manage_agentlevelaaa],function (index) {
				if(isflag){
					if(index===0){
						this.removeAttr('disabled').prop('checked',true);
					}else{
						this.removeAttr('disabled').prop('checked',false);
					}
				}else{
					this.attr({'disabled':true}).prop('checked',false);
				}
			});


		});


		/*绑定保存继续添加*/
		$edit_continue_btn.on('click',function(e){
			//e.preventDefault();

			//设置标识
			public_tool.cache.form_opt_0['continue']=true;
			//表单提交
			$(this).prev().trigger('click');
		});
	});


})(jQuery);