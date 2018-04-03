/*admin_member:成员设置*/
(function($){
	'use strict';
	$(function(){


		/*初始化数据*/
		if(public_tool.initMap.isrender){
			/*菜单调用*/
			var logininfo=public_tool.initMap.loginMap;
			public_tool.loadSideMenu(public_vars.$mainmenu,public_vars.$main_menu_wrap,{
				url:'http://10.0.5.226:8082/yttx-agentbms-api/module/menu',
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
			var powermap=public_tool.getPower(),
				logisticsreceive_power=public_tool.getKeyPower('收货',powermap),
				logisticsrepair_power=public_tool.getKeyPower('返修管理',powermap),
				logisticsdetail_power=public_tool.getKeyPower('查看',powermap),
				logisticsreceivefail_power=public_tool.getKeyPower('收货异常管理',powermap);


			/*dom引用和相关变量定义*/
			var $logistics_agent_wrap=$('#logistics_agent_wrap')/*代理商信息表格*/,
				$logistics_list_wrap=$('#logistics_list_wrap')/*物流信息表格*/,
				$logistics_detail_wrap=$('#logistics_detail_wrap'),
				module_id='agent_add'/*模块id，主要用于本地存储传值*/,
				$dataagent_wrap=$('#dataagent_wrap')/*数据展现面板*/,
				$datalist_wrap=$('#datalist_wrap')/*数据展现面板*/,
				$edit_wrap=$('#edit_wrap')/*发货容器面板*/,
				agenttable=null/*数据展现*/,
				listtable=null/*数据展现*/,
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
				dialogObj=public_tool.dialog()/*回调提示对象*/;

			/*查询对象*/
			var $search_deliveryHandler=$('#search_deliveryHandler'),
				$search_receiver=$('#search_receiver'),
				$search_deliveryPhone=$('#search_deliveryPhone'),
				$search_receivingPhone=$('#search_receivingPhone'),
				$admin_search_btn=$('#admin_search_btn'),
				$admin_search_clear=$('#admin_search_clear'),
				$search_receiptType=$('#search_receiptType'),
				searchtype=$search_receiptType.find('option:selected').val();

			/*表单对象*/
			var edit_form=document.getElementById('edit_form')/*表单dom*/,
				$edit_form=$(edit_form)/*编辑表单*/,
				$edit_sure_btn=$('#edit_sure_btn'),
				$edit_error_btn=$('#edit_error_btn'),
				$edit_cance_btn=$('#edit_cance_btn')/*编辑取消按钮*/,
				$logistics_receiveerror=$('#logistics_receiveerror'),
				$logistics_receiveerrorwrap=$('#logistics_receiveerrorwrap'),
				$logistics_receiveno=$('#logistics_receiveno'),/*快递单号*/
				$logistics_receiveauthor=$('#logistics_receiveauthor'),
				$logistics_remark=$('#logistics_remark')/*发货经手人*/;

			/*数据加载*/
			var agent_config={
				url:"http://10.0.5.226:8082/yttx-agentbms-api/logistics/receivings",
				dataType:'JSON',
				method:'post',
				dataSrc:function ( json ) {
					var code=parseInt(json.code,10);
					if(code!==0){
						if(code===999){
							/*清空缓存*/
							public_tool.loginTips(function(){
										public_tool.clear();
										public_tool.clearCacheData();
								});
							return [];
						}
						console.log(json.message);
						dia.content('<span class="g-c-bs-warning g-btips-warn">'+(json.message||"操作失败")+'</span>').show();
						setTimeout(function () {
							dia.close();
						},2000);
						return [];
					}

					return json.result.list;
				},
				data:{
					roleId:decodeURIComponent(logininfo.param.roleId),
					adminId:decodeURIComponent(logininfo.param.adminId),
					grade:decodeURIComponent(logininfo.param.grade),
					token:decodeURIComponent(logininfo.param.token),
					receiptType:searchtype
				}
			},list_config={
				url:"http://10.0.5.226:8082/yttx-agentbms-api/logistics/receiving/view",
				dataType:'JSON',
				method:'post',
				dataSrc:function ( json ) {
					var code=parseInt(json.code,10);
					if(code!==0){
						if(code===999){
							/*清空缓存*/
							public_tool.loginTips(function(){
										public_tool.clear();
										public_tool.clearCacheData();
								});
							return [];
						}
						console.log(json.message);
						dia.content('<span class="g-c-bs-warning g-btips-warn">'+(json.message||"操作失败")+'</span>').show();
						setTimeout(function () {
							dia.close();
						},2000);
						return [];
					}
					var result=json.result;
					if(!$.isEmptyObject(result)){
						return [result];
					}else{
						return [];
					}
				},
				data:{
					roleId:decodeURIComponent(logininfo.param.roleId),
					adminId:decodeURIComponent(logininfo.param.adminId),
					invoiceId:'',
					receiptType:searchtype,
					grade:decodeURIComponent(logininfo.param.grade),
					token:decodeURIComponent(logininfo.param.token)
				}
			},list_opt={
				deferRender:true,/*是否延迟加载数据*/
				//serverSide:true,/*是否服务端处理*/
				searching:true,/*是否搜索*/
				ordering:true,/*是否排序*/
				//order:[[1,'asc']],/*默认排序*/
				paging:true,/*是否开启本地分页*/
				pagingType:'simple_numbers',/*分页按钮排列*/
				autoWidth:true,/*是否*/
				info:true,/*显示分页信息*/
				stateSave:false,/*是否保存重新加载的状态*/
				processing:true,/*大消耗操作时是否显示处理状态*/
				ajax:list_config,/*异步请求地址及相关配置*/
				columns: [
					{
						"data":"deliveryUnit"
					},
					{"data":"deliveryHandler"},
					{
						"data":"deliveryPhone",
						"render":function(data, type, full, meta ){
							return public_tool.phoneFormat(data);
						}
					},
					{
						"data":"receiver"
					},
					{
						"data":"receivingPhone",
						"render":function(data, type, full, meta ){
							return public_tool.phoneFormat(data);
						}
					},
					{
						"data":"deliveryTime"
					},
					{
						"data":"logisticsCompany"
					},
					{
						"data":"trackingNumber"
					},
					{
						"data":"receivingUnit",
						"render":function(data, type, full, meta ){
							var btns='';


							if(logisticsdetail_power){
								/*查看*/
								btns+='<span data-id="'+$logistics_list_wrap.attr('data-id')+'" data-action="select" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
									 <i class="fa-file-text-o"></i>\
									 <span>查看</span>\
									 </span>';
							}
							/*if(logisticsreceive_power){
							 /!*收货*!/
							 btns+='<span  data-id="'+data+'" data-action="receive" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
							 <i class="fa-pencil"></i>\
							 <span>收货</span>\
							 </span>';
							 }*/
							/*if(logisticsreceivefail_power){
							 /!*收单查看*!/
							 btns+='<span  data-id="'+data+'" data-action="selectreceive" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
							 <i class="fa-exclamation"></i>\
							 <span>收货异常管理</span>\
							 </span>';
							 }
							 if(logisticsrepair_power){
							 /!*返修管理*!/
							 btns+='<span  data-id="'+data+'" data-action="repair" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
							 <i class="fa-wrench"></i>\
							 <span>返修管理</span>\
							 </span>';
							 }*/
							return btns;
						}
					}
				],/*控制分页数*/
				aLengthMenu: [
					[5,10,15,20],
					[5,10,15,20]
				],
				lengthChange:true/*是否可改变长度*/
			};

			agenttable=$logistics_agent_wrap.DataTable({
				deferRender:true,/*是否延迟加载数据*/
				//serverSide:true,/*是否服务端处理*/
				searching:true,/*是否搜索*/
				ordering:true,/*是否排序*/
				//order:[[1,'asc']],/*默认排序*/
				paging:true,/*是否开启本地分页*/
				pagingType:'simple_numbers',/*分页按钮排列*/
				autoWidth:true,/*是否*/
				info:true,/*显示分页信息*/
				stateSave:false,/*是否保存重新加载的状态*/
				processing:true,/*大消耗操作时是否显示处理状态*/
				ajax:agent_config,/*异步请求地址及相关配置*/
				columns: [
					{
						"data":"receivingUnit",
						"render":function(data, type, full, meta ){
							return data.toString().slice(0,10);
						}
					},
					{
						"data":"agentName"
					},
					{
						"data":"grade",
					},
					{
						"data":"id",
						"render":function(data, type, full, meta ){
							var btns='';


							if(logisticsdetail_power){
								/*查看*/
								btns+='<span data-id="'+data+'" data-action="select" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
									 <i class="fa-file-text-o"></i>\
									 <span>查看</span>\
									 </span>';
							}
							return btns;
						}
					}
				],/*控制分页数*/
				aLengthMenu: [
					[5,10,15,20],
					[5,10,15,20]
				],
				lengthChange:true/*是否可改变长度*/
			});



			/*
			 * 初始化
			 * */
			/*重置表单*/
			edit_form.reset();

			/*绑定选择发货类型*/
			$search_receiptType.on('change',function(){
				searchtype=$(this).val();
				var data= $.extend(true,{},agent_config.data);

				data.receiptType=searchtype;
				agent_config.data= $.extend(true,{},data);
				agenttable.ajax.config(agent_config).load(false);
				if(listtable!==null){
					listtable.clear().draw();
				}
			});

			/*清空查询条件*/
			$admin_search_clear.on('click',function(){
				$.each([$search_deliveryHandler,$search_receiver,$search_deliveryPhone,$search_receivingPhone],function(){
					this.val('');
				});
				if(listtable!==null){
					listtable.clear().draw();
				}
			});
			$admin_search_clear.trigger('click');

			/*联合查询*/
			$admin_search_btn.on('click',function(){
				var data= $.extend(true,{},agent_config.data);

				$.each([$search_deliveryHandler,$search_receiver,$search_deliveryPhone,$search_receivingPhone],function(){
					var text=this.val(),
						selector=this.selector.slice(1),
						key=selector.split('_');

					if(text===""){
						if(typeof data[key[1]]!=='undefined'){
							delete data[key[1]];
						}
					}else{
						if(key[1].toLowerCase().indexOf('phone')!==-1){
							text=text.replace(/\s*/g,'');
						}
						data[key[1]]=text;
					}

				});
				agent_config.data= $.extend(true,{},data);
				agenttable.ajax.config(agent_config).load(false);
				if(listtable!==null){
					listtable.clear().draw();
				}
			});

			/*事件绑定*/
			/*绑定查看，修改操作*/
			var operate_item;
			$.each([$logistics_agent_wrap,$logistics_list_wrap],function(){
				var selector=this.selector,
					isagent=selector.indexOf('agent')!==-1?true:false;

				this.delegate('span','click',function(e){
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

					if(isagent){
						if(action==='select'){
							if(operate_item){
								operate_item.removeClass('item-lighten');
								operate_item=null;
							}
							operate_item=$tr.addClass('item-lighten');
							/*查看*/
							$logistics_list_wrap.attr({
								'data-id':id
							});


							list_config.data.invoiceId=id;
							list_config.data.receiptType=searchtype;
							if(listtable===null){
								listtable=$logistics_list_wrap.DataTable($.extend(true,{},list_opt));
							}else{
								listtable.ajax.config(list_config).load();
							}
							$edit_cance_btn.trigger('click');
							$("html,body").animate({scrollTop:300},200);
						}
					}else{
						/*收货操作*/
						if(action==='select'){
							/*添加高亮状态*/
							if(operate_item){
								operate_item.removeClass('item-lighten');
								operate_item=null;
							}
							operate_item=$tr.addClass('item-lighten');
							/*查看*/
							$dataagent_wrap.addClass('collapsed');
							$edit_wrap.attr({
								'data-id':id
							}).removeClass('collapsed');
							var datas=listtable.row($tr).data(),
								trstr='<tr><td colspan="10">物流信息</td></tr>';
							for(var i in datas){
								switch (i){
									case 'logisticsCompany':
										trstr+='<tr><td colspan="2">物流公司：</td><td colspan="8">'+datas[i]+'</td></tr>';
										break;
									case 'trackingNumber':
										trstr+='<tr><td colspan="2">物流号：</td><td colspan="8">'+datas[i]+'</td></tr>';
										break;
									case 'deliveryTime':
										trstr+='<tr><td colspan="2">发货时间：</td><td colspan="8">'+datas[i]+'</td></tr>';
										break;
									case 'deliveryUnit':
										trstr+='<tr><td colspan="2">发货方：</td><td colspan="8">'+datas[i]+'</td></tr>';
										break;
									case 'deliveryHandler':
										trstr+='<tr><td colspan="2">发货人：</td><td colspan="8">'+datas[i]+'</td></tr>';
										break;
									case 'deliveryPhone':
										trstr+='<tr><td colspan="2">发货人电话：</td><td colspan="8">'+datas[i]+'</td></tr>';
										break;
									case 'receivingUnit':
										trstr+='<tr><td colspan="2">收货方：</td><td colspan="8">'+datas[i]+'</td></tr>';
										break;
									case 'receivingPhone':
										trstr+='<tr><td colspan="2">收货人电话：</td><td colspan="8">'+datas[i]+'</td></tr>';
										break;
									case 'list':

										var templist=datas[i],
											len=templist.length,
											k=0;
										if(len!==0){
											trstr+='<tr><td colspan="10">商品信息</td></tr><tr><th colspan="2">商品名称</th><th>数量</th><th>属性</th><th colspan="2">机器码</th><th colspan="4">备注</th></tr>';
											for(k;k<len;k++){
												trstr+='<tr><td colspan="2">'+(function(){
														var tempres=templist[k]["name"];
														return typeof tempres==='undefined'?'':tempres;
													}())+'</td>' +
													'<td colspan="2">'+(function(){
													var tempres=templist[k]["quantity"];
														return typeof tempres==='undefined'?'':tempres;
												}())+'</td>' +
													'<td colspan="2">'+(function(){
													var tempres=templist[k]["property"];
														return typeof tempres==='undefined'?'':tempres;
												}())+'</td>'+
													'<td colspan="2">'+(function(){
													var tempres=templist[k]["value"];
														return typeof tempres==='undefined'?'':tempres;
												}())+'</td>'+
													'<td colspan="2">'+(function(){
													var tempres=templist[k]["remark"];
														return typeof tempres==='undefined'?'':tempres;
												}())+'</td></tr>';
											}
										}
										break;
								}
							}
							$(trstr).appendTo($logistics_detail_wrap.html(''));
							$("html,body").animate({scrollTop:600},200);
						}

					}


				});

			});



			/*配置查看和收货权限*/
			if(logisticsdetail_power){
				$edit_wrap.removeClass('g-d-hidei');
			};



			/*取消添加或修改*/
			$edit_cance_btn.on('click',function(e){
				/*调整布局*/
				$dataagent_wrap.removeClass('collapsed');
				$datalist_wrap.removeClass('collapsed');
				$edit_wrap.attr({
					'data-id':''
				}).addClass('collapsed');
				edit_form.reset();
				$logistics_receiveerrorwrap.addClass('g-d-hidei');
				$edit_sure_btn.removeClass('g-d-hidei');
				$edit_error_btn.addClass('g-d-hidei');
				$("html,body").animate({scrollTop:200},200);
				/*添加高亮状态*/
				if(operate_item){
					operate_item.removeClass('item-lighten');
					operate_item=null;
				}

			});


			/*绑定收货异常*/
			$logistics_receiveerror.on('click',function(){
				var $this=$(this),
					ischeck=$this.is(':checked');

				if(ischeck){
					$logistics_receiveerrorwrap.removeClass('g-d-hidei');
					$edit_sure_btn.addClass('g-d-hidei');
					$edit_error_btn.removeClass('g-d-hidei');
				}else{
					$logistics_receiveerrorwrap.addClass('g-d-hidei');
					$edit_sure_btn.removeClass('g-d-hidei');
					$edit_error_btn.addClass('g-d-hidei');
				}

			});



			/*手机格式化*/
			/*格式化手机号码*/
			$.each([$search_deliveryPhone,$search_receivingPhone],function(){
				this.on('keyup',function(){
					var phoneno=this.value.replace(/\D*/g,'');
					if(phoneno==''){
						this.value='';
						return false;
					}
					this.value=public_tool.phoneFormat(this.value);
				});
			});


			/*最小化窗口*/
			$edit_title.next().on('click',function(e){
				if($edit_wrap.attr('data-id')!==''&&!$edit_wrap.hasClass('collapsed')){
					e.stopPropagation();
					e.preventDefault();
					$edit_cance_btn.trigger('click');
				}
			});


			/*绑定确认收货*/
			$edit_sure_btn.on('click',function(){
				var id=$edit_wrap.attr('data-id');

				if(id===''){
					dia.content('<span class="g-c-bs-warning g-btips-warn">请选择需要操作的物流单</span>').show();
					setTimeout(function () {
						dia.close();
					},2000);
					return false;
				}

				$.ajax({
						url:"http://10.0.5.226:8082/yttx-agentbms-api/logistics/confirmreceipt",
						dataType:'JSON',
						method:'post',
						data:{
							receiptType:searchtype,
							adminId:decodeURIComponent(logininfo.param.adminId),
							grade:decodeURIComponent(logininfo.param.grade),
							token:decodeURIComponent(logininfo.param.token),
							receiptId:id
						}
					})
					.done(function(resp){
						var code=parseInt(resp.code,10);
						if(code!==0){
							console.log(resp.message);
							dia.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"确认收货失败")+'</span>').show();
							setTimeout(function () {
								dia.close();
							},2000);
							return false;
						}
						//重绘表格
						agenttable.ajax.reload(null,false);
						//重置表单
						//重置表单
						$edit_cance_btn.trigger('click');
						setTimeout(function(){
							dia.content('<span class="g-c-bs-success g-btips-succ">确认收货成功</span>').show();
							setTimeout(function () {
								dia.close();
							},2000);
						},300);
					})
					.fail(function(resp){
						console.log(resp.message);
						dia.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
						setTimeout(function () {
							dia.close();
						},2000);
					});

			});



			/*表单验证*/
			if($.isFunction($.fn.validate)) {
				/*配置信息*/
				var form_opt={},
					formcache=public_tool.cache;

				if(formcache.form_opt_0){
					$.extend(true,form_opt,formcache.form_opt_0,{
						submitHandler: function(form){

							var id=$edit_wrap.attr('data-id');

							if(id===''){
								dia.content('<span class="g-c-bs-warning g-btips-warn">请选择需要操作的物流单</span>').show();
								setTimeout(function () {
									dia.close();
								},2000);
								return false;
							}

							/*更新*/
							var config={
								url:"http://10.0.5.226:8082/yttx-agentbms-api/logistics/confirmexception",
								dataType:'JSON',
								method:'post',
								data:{
									roleId:decodeURIComponent(logininfo.param.roleId),
									adminId:decodeURIComponent(logininfo.param.adminId),
									grade:decodeURIComponent(logininfo.param.grade),
									token:decodeURIComponent(logininfo.param.token),
									receiptId:id,
									receiptType:searchtype
								}
							};

							$.ajax(config)
								.done(function(resp){
									var code=parseInt(resp.code,10);
									if(code!==0){
										console.log(resp.message);
										setTimeout(function(){
											dia.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"确认收货异常失败")+'</span>').show();
										},300);
										setTimeout(function () {
											dia.close();
										},2000);
										return false;
									}
									//重绘表格
									agenttable.ajax.reload(null,false);
									listtable.ajax.reload(null,false);
									//重置表单
									$edit_cance_btn.trigger('click');
									setTimeout(function(){
										dia.content('<span class="g-c-bs-success g-btips-succ">确认收货异常成功</span>').show();
									},300);
									setTimeout(function () {
										dia.close();
									},2000);
								})
								.fail(function(resp){
									console.log(resp.message);
									setTimeout(function(){
										dia.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"确认收货异常失败")+'</span>').show();
									},300);
									setTimeout(function () {
										dia.close();
									},2000);
								});
							return false;
						}
					});
				}


				/*提交验证*/
				$edit_form.validate(form_opt);
			}
		}



	});



})(jQuery);