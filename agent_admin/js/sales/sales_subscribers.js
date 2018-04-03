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
				salesdelete_power=public_tool.getKeyPower('删除',powermap),
				salesupdate_power=public_tool.getKeyPower('修改',powermap),
				salesdetail_power=public_tool.getKeyPower('查看',powermap),
				salesadd_power=public_tool.getKeyPower('添加',powermap),
				salesacquiring_power=public_tool.getKeyPower('收单查看',powermap);


			/*dom引用和相关变量定义*/
			var $sales_list_wrap=$('#sales_list_wrap')/*表格*/,
				module_id='agent_add'/*模块id，主要用于本地存储传值*/,
				$data_wrap=$('#data_wrap')/*数据展现面板*/,
				$edit_wrap=$('#edit_wrap')/*发货容器面板*/,
				table=null/*数据展现*/,
				$sales_add_btn=$('#sales_add_btn')/*添加*/,
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
				$show_detail_wrap=$('#show_detail_wrap')/*详情容器*/,
				$show_detail_title=$('#show_detail_title')/*详情标题*/,
				$show_detail_content=$('#show_detail_content')/*详情内容*/,
				detail_map={
					cellphone:"手机号码",
					imeiCode:"机器号",
					name:"手机用户名称",
					addTime:"销售时间",
					address:"地址",
					remark:"备注",
					userId:"手机用户ID",
					serviceStationId:"服务站ID",
					status:"状态"
				}/*详情映射*/;

			/*查询对象*/
			var $search_agentName=$('#search_agentName'),
				$search_serviceStationName=$('#search_serviceStationName'),
				$search_name=$('#search_name'),
				$search_cellphone=$('#search_cellphone'),
				$search_addTime=$('#search_addTime'),
				$admin_search_btn=$('#admin_search_btn'),
				$admin_search_clear=$('#admin_search_clear');

			/*表单对象*/
			var edit_form=document.getElementById('edit_form')/*表单dom*/,
				$edit_form=$(edit_form)/*编辑表单*/,
				$edit_cance_btn=$('#edit_cance_btn')/*编辑取消按钮*/,
				$sales_subscriberid=$('#sales_subscriberid'),
				$sales_type=$('#sales_type'),
				$sales_servicestationid=$('#sales_servicestationid'),/*返修id*/
				$sales_name=$('#sales_name')/*发货经手人*/,
				$sales_cellphone=$('#sales_cellphone'),
				$sales_telephone=$('#sales_telephone')/*发货时间*/,
				$sales_remark=$('#sales_remark'),/*快递单号*/
				$sales_imeicode=$('#sales_imeicode'),
				$sales_address=$('#sales_address');

			/*数据加载*/
			var sales_config={
				url:"http://10.0.5.226:8082/yttx-agentbms-api/subscribers/related",
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
					token:decodeURIComponent(logininfo.param.token)
				}
			};
			table=$sales_list_wrap.DataTable({
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
				ajax:sales_config,/*异步请求地址及相关配置*/
				columns: [
					{"data":"serviceStationName"},
					{"data":"agentName"},
					{"data":"name"},
					{
						"data":"cellphone",
						"render":function(data, type, full, meta ){
							return public_tool.phoneFormat(data);
						}
					},
					{
						"data":"address",
						"render":function(data, type, full, meta ){
							return data.toString().slice(0,20)+'...';
						}
					},
					{
						"data":"imeiCode"
					},
					{
						"data":"addTime",
						"render":function(data, type, full, meta ){
							return moment(data).format('YYYY-MM-DD');
						}
					},
					{
						"data":"status",
						"render":function(data, type, full, meta ){
							var status=parseInt(data,10),
							btns='',
							id=full.id;

							/*
							 <span data-id="'+id+'" data-status="0" data-current="0" data-action="unsales" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
							 <i class="fa-star-o"></i>\
							 <span>未售</span>\
							 </span>
							* */

							if(status===1){
								/*已售*/
								btns+='<span data-id="'+id+'" data-status="1" data-current="1" data-action="sales" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
									 <i class="fa-star"></i>\
									 <span>已售</span>\
									 </span>\
									 <span data-id="'+id+'" data-status="2" data-current="1" data-action="stop" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray12">\
									 <i class="fa-lock"></i>\
									 <span>停用</span>\
									 </span>\
									 <span data-id="'+id+'" data-status="3" data-current="1" data-action="repairs" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray12">\
									 <i class="fa-wrench"></i>\
									 <span>返修</span>\
									 </span>';
							}else if(status===2){
								/*停用*/
								btns+='<span data-id="'+id+'" data-status="1" data-current="2" data-action="sales" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray12">\
									 <i class="fa-star"></i>\
									 <span>已售</span>\
									 </span>\
									 <span data-id="'+id+'" data-status="2" data-current="2" data-action="stop" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
									 <i class="fa-lock"></i>\
									 <span>停用</span>\
									 </span>\
									 <span data-id="'+id+'" data-status="3" data-current="2" data-action="repairs" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray12">\
									 <i class="fa-wrench"></i>\
									 <span>返修</span>\
									 </span>';
							}else if(status===3){
								/*返修*/
								btns+='<span data-id="'+id+'" data-status="1" data-current="3" data-action="sales" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray12">\
									 <i class="fa-star"></i>\
									 <span>已售</span>\
									 </span>\
									 <span data-id="'+id+'" data-status="2" data-current="3" data-action="stop" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray12">\
									 <i class="fa-lock"></i>\
									 <span>停用</span>\
									 </span>\
									 <span data-id="'+id+'" data-status="3" data-current="3" data-action="repairs" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
									 <i class="fa-wrench"></i>\
									 <span>返修</span>\
									 </span>';
							}
							return btns;
						}
					},
					{
						"data":"id",
						"render":function(data, type, full, meta ){
							var btns='',
								status=parseInt(full.status,10);


							if(salesdetail_power){
								/*查看*/
								btns+='<span data-id="'+data+'" data-action="select" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
									 <i class="fa-file-text-o"></i>\
									 <span>查看</span>\
									 </span>';
							}
							if(salesupdate_power){
								/*修改*/
								if(status!==2){
									btns+='<span  data-id="'+data+'" data-action="update" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
									<i class="fa-pencil"></i>\
									<span>修改</span>\
									</span>';
								}
							}
							if(salesacquiring_power){
								/*收单查看*/
								btns+='<span data-subitem="" data-id="'+data+'" data-action="selectacquiring" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
									 <i class="fa-angle-right"></i>\
									 <span>收单查看</span>\
									 </span>';
							}
							if(salesdelete_power){
								/*删除*/
								if(status!==2){
									btns+='<span  data-id="'+data+'" data-action="delete" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
									<i class="fa-trash"></i>\
									<span>删除</span>\
									</span>';
								}
							}
							if(typeof full.userId==='undefined'&&status!==2){
								/*同步*/
								btns+='<span  data-id="'+data+'" data-action="sync" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
									<i class="fa-spinner"></i>\
									<span>同步</span>\
									</span>';
							}

							return btns;
						}
					}
				],/*控制分页数*/
				aLengthMenu: [
					[20,30,40,50],
					[20,30,40,50]
				],
				lengthChange:true/*是否可改变长度*/
			});

			/*
			 * 初始化
			 * */
			/*重置表单*/
			edit_form.reset();

			/*查询服务站ID*/
			$.ajax({
				url:"http://10.0.5.226:8082/yttx-agentbms-api/servicestations/list",
				dataType:'JSON',
				method:'post',
				data:{
					roleId:decodeURIComponent(logininfo.param.roleId),
					adminId:decodeURIComponent(logininfo.param.adminId),
					grade:decodeURIComponent(logininfo.param.grade),
					token:decodeURIComponent(logininfo.param.token)
				}
			}).done(function (resp) {
				var code=parseInt(resp.code,10);
				if(code!==0){
					console.log(resp.message);
					dia.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
					setTimeout(function () {
						dia.close();
					},2000);
					return false;
				}
				var list=resp.result.list,
					i= 0,
					len=list.length,
					str='<option selected value="">请选择服务站ID</option>';

				if(len!==0){
					for(i;i<len;i++){
						str+='<option value="'+list[i]['id']+'">'+list[i]['shortName']+'</option>';
					}
				}

				$(str).appendTo($sales_servicestationid.html(''));


			}).fail(function (resp) {
				console.log('error');
			});





			/*清空查询条件*/
			$admin_search_clear.on('click',function(){
				$.each([$search_agentName,$search_serviceStationName,$search_name,$search_cellphone,$search_addTime],function(){
					this.val('');
				});
			});
			$admin_search_clear.trigger('click');


			/*联合查询*/
			$admin_search_btn.on('click',function(){
				var data= $.extend(true,{},sales_config.data);

				$.each([$search_agentName,$search_serviceStationName,$search_name,$search_cellphone,$search_addTime],function(){
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
				sales_config.data= $.extend(true,{},data);
				table.ajax.config(sales_config).load(false);
			});

			/*事件绑定*/
			/*绑定查看，修改操作*/
			var operate_item;
			$sales_list_wrap.delegate('span','click',function(e){
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

				var datas=table.row($tr).data();

				/*修改操作*/
				if(action==='update'){
					/*添加高亮状态*/
					if(operate_item){
						operate_item.removeClass('item-lighten');
						operate_item=null;
					}
					operate_item=$tr.addClass('item-lighten');
					/*调整布局*/
					$data_wrap.addClass('collapsed');
					$edit_wrap.removeClass('collapsed');
					$edit_title.html('修改 "<span class="g-c-info">'+datas['name']+' </span>"信息');
					$edit_cance_btn.prev().html('修改');
					$("html,body").animate({scrollTop:300},200);
					//重置信息
					for(var i in datas) {
						switch (i) {
							case "subscriberId":
								$sales_subscriberid.val(id);
								break;
							case "serviceStationId":
								$sales_servicestationid.val(datas[i]);
								break;
							case "telephone":
								$sales_telephone.val(datas[i]);
								break;
							case "cellphone":
								$sales_cellphone.val(public_tool.phoneFormat(datas[i]));
								break;
							case "imeiCode":
								$sales_imeicode.val(datas[i]);
								break;
							case "name":
								$sales_name.val(datas[i]);
								break;
							case "address":
								$sales_address.val(datas[i]);
								break;
							case "remark":
								$sales_remark.val(datas[i]);
								break;
						}
					}
				}else if(action==='delete'){
					/*删除操作*/
					dia.content('<span class="g-c-bs-warning g-btips-warn">目前暂未开放此功能</span>').show();
					setTimeout(function(){
						dia.close();
					},2000);
					return false;
				}else if(action==='select'){
					/*查看*/
					
					$.ajax({
							url:"http://10.0.5.226:8082/yttx-agentbms-api/subscriber/detail",
							method: 'POST',
							dataType: 'json',
							data:{
								"subscriberId":id,
								"adminId":decodeURIComponent(logininfo.param.adminId),
								"token":decodeURIComponent(logininfo.param.token)
							}
						})
						.done(function(resp){
							var code=parseInt(resp.code,10);
							if(code!==0){
								/*回滚状态*/
								console.log(resp.message);
								dia.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
								setTimeout(function () {
									dia.close();
								},2000);
								return false;
							}
							/*是否是正确的返回数据*/
							var list=resp.result,
								str='',
								istitle=false;

							if(!$.isEmptyObject(list)){
								for(var j in list){
									if(typeof detail_map[j]!=='undefined'){
										if(j==='name'||j==='Name'){
											istitle=true;
											$show_detail_title.html('"<span class="g-c-info">'+list[j]+'</span>"用户销售记录详情信息');
										}else if(j==='status'||j==='Status'){
											var status=parseInt(list[j],10);
											if(status===0){
												str+='<tr><th>'+detail_map[j]+':</th><td class="g-c-gray6">未售</td></tr>';
											}else if(status===1){
												str+='<tr><th>'+detail_map[j]+':</th><td class="g-c-bs-success">已售</td></tr>';
											}else if(status===2){
												str+='<tr><th>'+detail_map[j]+':</th><td class="g-c-gray9">停用</td></tr>';
											}else if(status===3){
												str+='<tr><th>'+detail_map[j]+':</th><td class="g-c-bs-warning">返修</td></tr>';
											}

										}else{
											str+='<tr><th>'+detail_map[j]+':</th><td>'+list[j]+'</td></tr>';
										}
									}else{
										str+='<tr><th>'+j+':</th><td>'+list[j]+'</td></tr>';
									}
								};

								if(!istitle){
									$show_detail_title.html('用户销售记录详情信息');
								}
							}
							/*添加高亮状态*/
							if(operate_item){
								operate_item.removeClass('item-lighten');
								operate_item=null;
							}
							operate_item=$tr.addClass('item-lighten');
							
							$show_detail_content.html(str);
							$show_detail_wrap.modal('show',{
								backdrop:'static'
							});
						})
						.fail(function(resp){
							$show_detail_content.html('');
							$show_detail_title.html('');
							console.log(resp.message);
							dia.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
							setTimeout(function () {
								dia.close();
							},2000);
						});
				}else if(action==='selectacquiring'){
					/*收单查看*/
					var subclass=$this.children('i').hasClass('fa-angle-down'),
						tabletr=table.row($tr),
						subitem=$this.attr('data-subitem');

					if(subclass){
						/*收缩*/
						$this.children('i').removeClass('fa-angle-down');
						tabletr.child().hide(200);
					}else{
						/*添加高亮状态*/
						if(operate_item){
							operate_item.removeClass('item-lighten');
							operate_item=null;
						}
						operate_item=$tr.addClass('item-lighten');
						/*展开*/
						if(subitem===''){
							$.ajax({
								url:"http://10.0.5.226:8082/yttx-agentbms-api/subscriber/acquirings",
								method: 'POST',
								dataType: 'json',
								data:{
									"subscriberId":id,
									"adminId":decodeURIComponent(logininfo.param.adminId),
									"token":decodeURIComponent(logininfo.param.token)
								}
							}).done(function(resp){
								var code=parseInt(resp.code,10);
								if(code!==0){
									/*回滚状态*/
									console.log(resp.message);
									tabletr.child($('<tr><td colspan="10">暂无数据</td></tr>')).show();
									$this.attr({
										'data-subitem':'true'
									}).children('i').addClass('fa-angle-down');
									dia.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
									setTimeout(function () {
										dia.close();
									},2000);
									return false;
								}

								/*是否是正确的返回数据*/
								var result=resp.result;

								if(!result){
									return [];
								}

								var list=result.list,
									len=list.length,
									i= 0,
									newstr='<colgroup>\
									<col class="g-w-percent5">\
									<col class="g-w-percent5">\
									<col class="g-w-percent5">\
									<col class="g-w-percent5">\
									<col class="g-w-percent5">\
									<col class="g-w-percent5">\
									<col class="g-w-percent5">\
									<col class="g-w-percent5">\
									<col class="g-w-percent5">\
									<col class="g-w-percent5">\
									</colgroup>\
										<thead>\
										<tr>\
										<th>订单号</th>\
										<th>交易金额</th>\
										<th>交易费率</th>\
										<th>手续费</th>\
										<th>到帐时间</th>\
										<th>对方户名</th>\
										<th>对方帐号</th>\
										<th>对方银行</th>\
										<th>对方卡类型</th>\
										<th>状态</th>\
									</tr>\
									</thead>',
									res='<tr><td colspan="3">收单人：'+result["acquiringer"]+'</td><td colspan="3">结算银行：'+result["settlingBank"]+'</td><td colspan="4">结算帐号：'+result["cardNumber"]+'</td></tr>';
								if(len!==0){
									for(i;i<len;i++){
										var tempitem=list[i];
										res+='<tr><td>'+tempitem["orderSum"]+'</td><td>'+tempitem["mainFee"]+'</td><td>'+tempitem["poundage"]+'</td><td>'+tempitem["issueTime"]+'</td><td>'+tempitem["counterpartyName"]+'</td><td>'+tempitem["counterpartyAccount"]+'</td><td>'+tempitem["counterpartyBank"]+'</td><td>'+tempitem["counterpartyCardType"]+'</td><td>'+(function(){
												var state=parseInt(tempitem["issueStatus"],10);

												return state===0?'未清算':'已清算';
											}())+'</td></tr>';

									}
								}
								res='<tbody class="middle-align">'+res+'</tbody>';
								newstr='<tr><td colspan="9"><table class="table table-bordered table-striped table-hover admin-table" >'+newstr+res+'</table></td></tr>';

								var $newtr=$(newstr);
								tabletr.child($newtr).show();
								$this.attr({
									'data-subitem':'true'
								}).children('i').addClass('fa-angle-down');


							}).fail(function(resp){
								console.log(resp.message);
								dia.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
								setTimeout(function () {
									dia.close();
								},2000);
							});

						}else{
							tabletr.child().show();
							$this.children('i').addClass('fa-angle-down');
						}
					}

				}else if(action==='sales'||action==='unsales'||action==='stop'||action==='repairs'){
					/*切换状态：未售,已售,停用,返修*/
					var status=$this.attr('data-status'),
						current=$this.attr('data-current'),
						statusmap={
							0:'未售',
							1:'已售',
							2:'停用',
							3:'返修'
						};
					if(status===current){
						return false;
					}
					/*高亮*/
					if(operate_item){
						operate_item.removeClass('item-lighten');
						operate_item=null;
					}
					operate_item=$tr.addClass('item-lighten');
					$.ajax({
						url:"http://10.0.5.226:8082/yttx-agentbms-api/subscriber/binding/user",
						method: 'POST',
						dataType: 'json',
						data:{
							"subscriberId":id,
							"status":status,
							"grade":decodeURIComponent(logininfo.param.grade),
							"adminId":decodeURIComponent(logininfo.param.adminId),
							"token":decodeURIComponent(logininfo.param.token)
						}
					}).done(function(resp){
						var code=parseInt(resp.code,10);
						if(code!==0){
							/*回滚状态*/
							console.log(resp.message);
							setTimeout(function(){
								dia.content('<span class="g-c-bs-warning g-btips-warn">变更 "'+statusmap[status]+'" 失败</span>').show();
							},300);
							setTimeout(function () {
								dia.close();
							},2000);
							return false;
						}

						/*是否是正确的返回数据*/
						setTimeout(function(){
							dia.content('<span class="g-c-bs-success g-btips-succ">变更 "'+statusmap[status]+'" 成功</span>').show();
						},300);
						setTimeout(function () {
							dia.close();
							/*去除高亮*/
							if(operate_item){
								operate_item.removeClass('item-lighten');
								operate_item=null;
							}
							//重绘表格
							table.ajax.reload(null,false);
						},2000);


					}).fail(function(resp){
						console.log(resp.message);
						dia.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
						setTimeout(function () {
							dia.close();
						},2000);
					});

				}else if(action==='sync'){
					/*同步到APP*/
					/*高亮*/
					if(operate_item){
						operate_item.removeClass('item-lighten');
						operate_item=null;
					}
					operate_item=$tr.addClass('item-lighten');
					$.ajax({
						url:"http://10.0.5.226:8082/yttx-agentbms-api/subscriber/binding/user",
						method: 'POST',
						dataType: 'json',
						data:{
							"subscriberId":id,
							"grade":decodeURIComponent(logininfo.param.grade),
							"adminId":decodeURIComponent(logininfo.param.adminId),
							"token":decodeURIComponent(logininfo.param.token)
						}
					}).done(function(resp){
						var code=parseInt(resp.code,10);
						if(code!==0){
							/*回滚状态*/
							console.log(resp.message);
							setTimeout(function(){
								dia.content('<span class="g-c-bs-warning g-btips-warn">同步绑定App用户失败</span>').show();
							},300);
							setTimeout(function () {
								dia.close();
							},2000);
							return false;
						}

						/*是否是正确的返回数据*/
						setTimeout(function(){
							dia.content('<span class="g-c-bs-success g-btips-succ">同步绑定App用户成功</span>').show();
						},300);
						setTimeout(function () {
							dia.close();
							/*去除高亮*/
							if(operate_item){
								operate_item.removeClass('item-lighten');
								operate_item=null;
							}
							//重绘表格
							table.ajax.reload(null,false);
						},2000);


					}).fail(function(resp){
						console.log(resp.message);
						dia.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
						setTimeout(function () {
							dia.close();
						},2000);
					});

				}
			});
			
			
			/*关闭弹出框*/
			$show_detail_wrap.on('hide.bs.modal',function(){
				if(operate_item){
					setTimeout(function(){
						operate_item.removeClass('item-lighten');
						operate_item=null;
					},1000);
				}
			});

			/*添加服务站*/
			$sales_add_btn.on('click',function(e){
				e.preventDefault();
				/*调整布局*/
				$data_wrap.addClass('collapsed');
				$edit_wrap.removeClass('collapsed');
				$edit_title.html('添加用户');
				$edit_cance_btn.prev().html('添加');
				$("html,body").animate({scrollTop:300},200);
				//重置信息
				edit_form.reset();
				//第一行获取焦点
				$sales_servicestationid.focus();
			});
			/*配置添加和修改的权限*/
			if(salesadd_power){
				$sales_add_btn.removeClass('g-d-hidei');
				$edit_wrap.removeClass('g-d-hidei');
			};


			/*取消添加或修改*/
			$edit_cance_btn.on('click',function(e){
				/*调整布局*/
				$data_wrap.removeClass('collapsed');
				$edit_wrap.addClass('collapsed');
				$edit_title.html('添加用户');
				$edit_cance_btn.prev().html('添加');
				edit_form.reset();
				if(!$data_wrap.hasClass('collapsed')){
					$("html,body").animate({scrollTop:200},200);
				}
				/*去除高亮状态*/
				if(operate_item){
					operate_item.removeClass('item-lighten');
					operate_item=null;
				}

			});


			/*手机格式化*/
			/*格式化手机号码*/
			$.each([$search_cellphone,$sales_cellphone],function(){
				this.on('keyup',function(){
					var phoneno=this.value.replace(/\D*/g,'');
					if(phoneno==''){
						this.value='';
						return false;
					}
					this.value=public_tool.phoneFormat(this.value);
				});
			});

			/*绑定时间插件*/
			$.each([$search_addTime],function(){
				this.val('').datepicker({
					autoclose:true,
					clearBtn:true,
					format: 'yyyy-mm-dd',
					todayBtn: true,
					endDate:moment().format('YYYY-MM-DD')
				})
			});

			/*最小化窗口*/
			$edit_title.next().on('click',function(e){
				if($data_wrap.hasClass('collapsed')){
					e.stopPropagation();
					e.preventDefault();
					$edit_cance_btn.trigger('click');
				}
			});

			/*表单验证*/
			if($.isFunction($.fn.validate)) {
				/*配置信息*/
				var form_opt={},
					formcache=public_tool.cache;

				if(formcache.form_opt_0){
					$.extend(true,form_opt,formcache.form_opt_0,{
						submitHandler: function(form){
							/*更新*/
							var id=$sales_subscriberid.val(),
								isadd=id===''?true:false;


							if(isadd){
								var config={
									url:"http://10.0.5.226:8082/yttx-agentbms-api/subscriber/add",
									dataType:'JSON',
									method:'post',
									data:{
										roleId:decodeURIComponent(logininfo.param.roleId),
										adminId:decodeURIComponent(logininfo.param.adminId),
										grade:decodeURIComponent(logininfo.param.grade),
										token:decodeURIComponent(logininfo.param.token),
										serviceStationId:$sales_servicestationid.val(),
										name:$sales_name.val(),
										type:$sales_type.find('option:selected').val(),
										address:$sales_address.val(),
										cellphone:$sales_cellphone.val().replace(/\s*/g,''),
										telephone:$sales_telephone.val(),
										imeiCode:$sales_imeicode.val(),
										remark:$sales_remark.val()
									}
								};
							}else{
								var config={
									url:"http://10.0.5.226:8082/yttx-agentbms-api/subscriber/update",
									dataType:'JSON',
									method:'post',
									data:{
										roleId:decodeURIComponent(logininfo.param.roleId),
										adminId:decodeURIComponent(logininfo.param.adminId),
										grade:decodeURIComponent(logininfo.param.grade),
										token:decodeURIComponent(logininfo.param.token),
										subscriberId:id,
										serviceStationId:$sales_servicestationid.val(),
										name:$sales_name.val(),
										type:$sales_type.find('option:selected').val(),
										address:$sales_address.val(),
										cellphone:$sales_cellphone.val().replace(/\s*/g,''),
										telephone:$sales_telephone.val(),
										imeiCode:$sales_imeicode.val(),
										remark:$sales_remark.val()
									}
								};
							}




							$.ajax(config)
								.done(function(resp){
									var code=parseInt(resp.code,10);
									if(code!==0){
										console.log(resp.message);
										setTimeout(function(){
											isadd?dia.content('<span class="g-c-bs-warning g-btips-warn">添加用户失败</span>').show():dia.content('<span class="g-c-bs-warning g-btips-warn">修改用户失败</span>').show();
										},300);
										setTimeout(function () {
											dia.close();
										},2000);
										return false;
									}
									//重绘表格
									table.ajax.reload(null,false);
									//重置表单
									//重置表单
									$edit_cance_btn.trigger('click');
									setTimeout(function(){
										isadd?dia.content('<span class="g-c-bs-success g-btips-succ">添加用户成功</span>').show():dia.content('<span class="g-c-bs-success g-btips-succ">修改用户成功</span>').show();
									},300);
									setTimeout(function () {
										dia.close();
									},2000);
								})
								.fail(function(resp){
									console.log(resp.message);
									dia.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
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