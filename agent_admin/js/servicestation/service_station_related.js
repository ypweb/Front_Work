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
				send_power=public_tool.getKeyPower('发货',powermap),
				stationdetail_power=public_tool.getKeyPower('查看',powermap);

			/*dom引用和相关变量定义*/
			var $station_wrap=$('#station_wrap')/*表格*/,
				$record_list=$('#record_list'),
				module_id='station_list'/*模块id，主要用于本地存储传值*/,
				$data_wrap=$('#data_wrap')/*数据展现面板*/,
				$send_wrap=$('#send_wrap')/*发货容器面板*/,
				$repair_wrap=$('#repair_wrap')/*返修容器面板*/,
				table=null/*数据展现*/,
				recordtable=null,
				$send_title=$('#send_title')/*编辑标题*/,
				$repair_title=$('#repair_title')/*编辑标题*/,
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
					agentFullName:'代理商全称',
					fullName:'服务站全称',
					shortName:"服务站简称",
					name:"负责人姓名",
					phone:"负责人手机号码",
					address:"地址",
					sales:"销售",
					inventory:"库存",
					monthSales:"本月销售",
					totalSales:"总计销售",
					repairs:"返修",
					agentShortName:"所属代理",
					superShortName:"上级代理"
				}/*详情映射*/;

			/*查询对象*/
			var $search_shortName=$('#search_shortName'),
				$search_name=$('#search_name'),
				$search_phone=$('#search_phone'),
				$search_inventory=$('#search_inventory'),
				$search_agentShortName=$('#search_agentShortName'),
				$search_superShortName=$('#search_superShortName'),
				$search_repairs=$('#search_repairs'),
				$search_type=$('#search_type'),
				$admin_search_btn=$('#admin_search_btn'),
				$admin_search_clear=$('#admin_search_clear');

			/*表单对象*/
			var send_form=document.getElementById('station_send_form')/*表单dom*/,
				repair_form=document.getElementById('station_repair_form')/*表单dom*/,
				$station_send_form=$(send_form)/*编辑表单*/,
				$station_repair_form=$(repair_form)/*编辑表单*/,
				$send_id=$('#send_id'),/*发货id*/
				$repair_id=$('#repair_id'),/*返修id*/
				$send_cance_btn=$('#send_cance_btn')/*编辑取消按钮*/,
				$repair_cance_btn=$('#repair_cance_btn')/*编辑取消按钮*/,
				$send_trackingnumber=$('#send_trackingnumber'),/*快递单号*/
				$repair_trackingnumber=$('#repair_trackingnumber'),
				$send_deliveryhandler=$('#send_deliveryhandler')/*发货经手人*/,
				$repair_deliveryhandler=$('#repair_deliveryhandler'),
				$send_deliverytime=$('#send_deliverytime')/*发货时间*/,
				$repair_deliverytime=$('#repair_deliverytime'),
				$repair_name=$('#repair_name'),
				$repair_startnumber=$('#repair_startnumber'),
				$repair_endnumber=$('#repair_endnumber'),
				$repair_listnumber=$('#repair_listnumber'),
				$repair_quantity=$('#repair_quantity');

			/*发货单附件*/
			var $send_ischeckeddevice=$('#send_ischeckeddevice'),
				$send_devicewrap=$('#send_devicewrap'),
				$send_devicelist=$send_devicewrap.find('ul'),
				$send_deviceadd_btn=$('#send_deviceadd_btn'),
				$send_devicestr=$send_devicelist.find('li:first'),
				$send_ischeckedfittings=$('#send_ischeckedfittings'),
				$send_fittingwrap=$('#send_fittingwrap'),
				$send_fittinglist=$send_fittingwrap.find('ul'),
				$send_fittingadd_btn=$('#send_fittingadd_btn'),
				$send_fittingstr=$send_fittinglist.find('li:first'),
				$send_ischeckedrepair=$('#send_ischeckedrepair'),
				$send_repairwrap=$('#send_repairwrap'),
				$send_repairlist=$send_repairwrap.find('ul'),
				$send_repairadd_btn=$('#send_repairadd_btn'),
				$send_repairstr=$send_repairlist.find('li:first'),
				send_repairtime=$('.send_repairtime',$send_repairwrap),
				send_checkconfig={
					check:[$send_ischeckeddevice,$send_ischeckedfittings,$send_ischeckedrepair],
					wrap:[$send_devicewrap,$send_fittingwrap,$send_repairwrap],
					list:[$send_devicelist,$send_fittinglist,$send_repairlist],
					strdom:[$send_devicestr,$send_fittingstr,$send_repairstr]
				};

			/*数据加载*/
			var station_config={
				url:"http://10.0.5.226:8082/yttx-agentbms-api/servicestations/related",
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
					type:$search_type.find('option:selected').val()
				}
			},
			record_config={
				url:"http://10.0.5.226:8082/yttx-agentbms-api/servicestations/invoice/search",
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

			table=$station_wrap.DataTable({
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
				ajax:station_config,/*异步请求地址及相关配置*/
				columns: [
					{"data":"shortName"},
					{"data":"name"},
					{
						"data":"phone",
						"render":function(data, type, full, meta ){
							return public_tool.phoneFormat(data);
						}
					},
					{
						"data":"address",
						"render":function(data, type, full, meta ){
							return data.toString().slice(0,10)+'...';
						}
					},
					{
						"data":"sales",
						"render":function(data, type, full, meta ){
							return data?"<span class='g-c-info'>"+data+"</span>":'';
						}
					},
					{
						"data":"inventory",
						"render":function(data, type, full, meta ){
							return data?"<span class='g-c-gray3'>"+data+"</span>":'';
						}
					},
					{
						"data":"repairs",
						"render":function(data, type, full, meta ){
							return data?"<span class='g-c-red1'>"+data+"</span>":'';
						}
					},
					{
						"data":"agentShortName"
					},
					{
						"data":"supershortName"
					},
					{
						"data":"id",
						"render":function(data, type, full, meta ){
							var btns='';

							if(stationdetail_power){
								/*查看*/
								btns+='<span data-id="'+data+'" data-action="select" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
									 <i class="fa-file-text-o"></i>\
									 <span>查看</span>\
									 </span>';
							}

							if(send_power){
									/*发货*/
									btns+='<span data-id="'+data+'" data-action="send" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
									 <i class="fa-truck"></i>\
									 <span>发货</span>\
									 </span>';
								/*返修*/
								btns+='<span  data-id="'+data+'" data-action="repair" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
									<i class="fa-rotate-left"></i>\
									<span>返修</span>\
									</span>';
							}
							return btns;
						}
					}
				],/*控制分页数*/
				aLengthMenu: [
					[5,10,20,30],
					[5,10,20,30]
				],
				lengthChange:true/*是否可改变长度*/
			});
			recordtable=$record_list.DataTable({
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
				ajax:record_config,/*异步请求地址及相关配置*/
				columns: [
					{"data":"id"},
					{"data":"shortName"},
					{"data":"name"},
					{
						"data":"phone",
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
						"data":"sales",
						"render":function(data, type, full, meta ){
							return data?"<span class='g-c-info'>"+data+"</span>":'';
						}
					},
					{
						"data":"inventory",
						"render":function(data, type, full, meta ){
							return data?"<span class='g-c-gray3'>"+data+"</span>":'';
						}
					},
					{
						"data":"repairs",
						"render":function(data, type, full, meta ){
							return data?"<span class='g-c-red1'>"+data+"</span>":'';
						}
					},
					{
						"data":"agentShortName"
					},
					{
						"data":"supershortName"
					}
				],/*控制分页数*/
				aLengthMenu: [
					[5,10,20,30],
					[5,10,20,30]
				],
				lengthChange:true/*是否可改变长度*/
			});

			/*初始化--重置表单*/
			send_form.reset();
			repair_form.reset();


			/*绑定切换设备类型*/
			$search_type.on('change', function () {
				station_config.data.type=$(this).val();
				table.ajax.config(station_config).load();
			});


			/*清空查询条件*/
			$admin_search_clear.on('click',function(){
				$.each([$search_shortName,$search_name,$search_phone,$search_inventory,$search_repairs,$search_agentShortName,$search_superShortName],function(){
					this.val('');
				});
			});
			$admin_search_clear.trigger('click');

			/*联合查询*/
			$admin_search_btn.on('click',function(){
				var data= $.extend(true,{},station_config.data);

				$.each([$search_shortName,$search_name,$search_phone,$search_inventory,$search_repairs,$search_agentShortName,$search_superShortName],function(){
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
				station_config.data= $.extend(true,{},data);
				table.ajax.config(station_config).load(false);
			});

			/*事件绑定*/
			/*绑定查看，修改操作*/
			var operate_item;
			$station_wrap.delegate('span','click',function(e){
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

				/*发货操作*/
				if(action==='send'){
					/*添加高亮状态*/
					if(operate_item){
						operate_item.removeClass('item-lighten');
						operate_item=null;
					}
					operate_item=$tr.addClass('item-lighten');
					/*调整布局*/
					$data_wrap.addClass('collapsed');
					$repair_wrap.addClass('collapsed');
					$send_wrap.removeClass('collapsed');
					$("html,body").animate({scrollTop:300},200);
					//重置信息
					repair_form.reset();
					$repair_title.html('');
					$send_title.html('给"<span class="g-c-info">'+datas['fullName']+'</span>"服务站发货');
					$send_id.val(id);
				}else if(action==='repair'){
					/*添加高亮状态*/
					if(operate_item){
						operate_item.removeClass('item-lighten');
						operate_item=null;
					}
					operate_item=$tr.addClass('item-lighten');
					/*调整布局*/
					$data_wrap.addClass('collapsed');
					$repair_wrap.removeClass('collapsed');
					$send_wrap.addClass('collapsed');
					$("html,body").animate({scrollTop:380},200);
					//重置信息
					send_form.reset();
					$send_title.html('');
					$repair_title.html('"<span class="g-c-info">'+datas['fullName']+'</span>"服务站返修设备');
					$repair_id.val(id);
				}else if(action==='select'){
					/*查看*/
					$.ajax({
							url:"http://10.0.5.226:8082/yttx-agentbms-api/servicestation/view",
							method: 'POST',
							dataType: 'json',
							data:{
								"serviceStationId":id,
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
											$show_detail_title.html('"<span class="g-c-info">'+list[j]+' </span>"服务站详情信息');
										}else{
											str+='<tr><th>'+detail_map[j]+':</th><td>'+list[j]+'</td></tr>';
										}
									}else{
										str+='<tr><th>'+j+':</th><td>'+list[j]+'</td></tr>';
									}
								};

								if(!istitle){
									$show_detail_title.html('服务站详情信息');
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
				}
			});

			/*取消发货，返修*/
			$.each([$send_cance_btn,$repair_cance_btn],function(){
				var selector=this.selector,
					issend=selector.indexOf('send')!==-1?true:false;

				this.on('click',function(e){
					/*调整布局*/
					if(issend){
						/*重置表单*/
						send_form.reset();
						/*隐藏发货插件*/
						var wrap=send_checkconfig.wrap,
							list=send_checkconfig.list,
							dom=send_checkconfig.strdom,
							len=wrap.length,
							i=0;
						for(i;i<len;i++){
							wrap[i].addClass('g-d-hidei');
							/*清除多余选项*/
							dom[i].siblings().remove();
						};
					}else{
						repair_form.reset();
					}
					$data_wrap.removeClass('collapsed');
					$send_wrap.addClass('collapsed');
					$repair_wrap.addClass('collapsed');
					if(!$data_wrap.hasClass('collapsed')){
						$("html,body").animate({scrollTop:200},200);
					}
					/*删除高亮状态*/
					if(operate_item){
						operate_item.removeClass('item-lighten');
						operate_item=null;
					}
				});

			});

			/*发货，返修权限*/
			if(send_power){
				$send_wrap.removeClass('g-d-hidei');
				$repair_wrap.removeClass('g-d-hidei');
			}

			/*最小化窗口*/
			$.each([$send_title,$repair_title], function () {
				var selector=this.selector,
					issend=selector.indexOf('send')!==-1?true:false;

				this.next().on('click',function(e){
					if($data_wrap.hasClass('collapsed')){
						e.stopPropagation();
						e.preventDefault();
						issend?$send_cance_btn.trigger('click'):$repair_cance_btn.trigger('click');
					}
				});
			});

			/*绑定时间插件*/
			$.each([$send_deliverytime,send_repairtime,$repair_deliverytime],function(){
				this.val('').datepicker({
					autoclose:true,
					clearBtn:true,
					format: 'yyyy-mm-dd',
					todayBtn: true,
					endDate:moment().format('YYYY-MM-DD')
				});
			});

			/*格式化手机号码*/
			$.each([$search_phone],function(){
				this.on('keyup',function(){
					var phoneno=this.value.replace(/\D*/g,'');
					if(phoneno==''){
						this.value='';
						return false;
					}
					this.value=public_tool.phoneFormat(this.value);
				});
			});

			/*绑定发货插件显示隐藏*/
			$.each(send_checkconfig.check, function () {
				var self=this,
					selector=self.selector;

				self.on('click',function(){
					var $this=$(this),
					ischeck=$this.is(':checked'),
						wrap=null;


					if(selector.indexOf('device')!==-1){
						wrap=$send_devicewrap;
					}else if(selector.indexOf('fittings')!==-1){
						wrap=$send_fittingwrap;
					}else if(selector.indexOf('repair')!==-1){
						wrap=$send_repairwrap;
					}

					if(ischeck){
						wrap.removeClass('g-d-hidei');
					}else {
						wrap.addClass('g-d-hidei');
					}
				});
			});

			/*绑定添加发货插件--移动支付设备,配件*/
			$.each([$send_deviceadd_btn,$send_fittingadd_btn,$send_repairadd_btn],function(){
				var selector=this.selector;

				this.on('click',function(){
					var $itemdom,
						$wrap;
					if(selector.indexOf('device')!==-1){
						$itemdom=$send_devicestr.clone();
						$wrap=$send_devicelist;
					}else if(selector.indexOf('fitting')!==-1){
						$itemdom=$send_fittingstr.clone();
						$wrap=$send_fittinglist;
					}else if(selector.indexOf('repair')!==-1){
						$itemdom=$send_repairstr.clone();
						$wrap=$send_repairlist;
						$itemdom.find('.send_repairtime').datepicker({
							autoclose:true,
							clearBtn:true,
							format: 'yyyy-mm-dd',
							todayBtn: true,
							endDate:moment().format('YYYY-MM-DD')
						});

					}
					$('<label>&nbsp;<button type="button" class="form-control g-br2">-删除</button></label>').appendTo($itemdom);
					$itemdom.find('input').each(function(){
							this.value='';
						});
					$itemdom.appendTo($wrap);
				});
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

			/*绑定删除发货插件--移动支付设备,配件*/
			$.each([$send_devicelist,$send_fittinglist,$send_repairlist], function () {
				this.on('click','button',function(){
					$(this).closest('li').remove();
				});
			});

			/*表单验证*/
			if($.isFunction($.fn.validate)) {
				/*配置信息*/
				var form_opt0={},
					form_opt1={},
					formcache=public_tool.cache;

				if(formcache.form_opt_0 && formcache.form_opt_1){
					$.each([formcache.form_opt_0,formcache.form_opt_1], function (index) {
						var issend=index===0?true:false;
						$.extend(true,(function () {
							return issend?form_opt0:form_opt1;
						}()),(function () {
							return issend?formcache.form_opt_0:formcache.form_opt_1;
						}()),{
							submitHandler: function(form){

								var id=issend?$send_id.val():$repair_id.val();

								if(id===''){
									issend?$send_cance_btn.trigger('click'):$repair_cance_btn.trigger('click');
									dia.content('<span class="g-c-bs-warning g-btips-warn">请选择需要操作的服务站</span>').show();
									setTimeout(function(){
										dia.close();
									},3000);
									return false;
								}

								if(issend){
									var checkdata=getCheckPlugin(send_checkconfig),
										config1={
											url:"http://10.0.5.226:8082/yttx-agentbms-api/servicestation/invoice/add",
											dataType:'JSON',
											method:'post',
											data:{
												serviceStationId:id,
												adminId:decodeURIComponent(logininfo.param.adminId),
												grade:decodeURIComponent(logininfo.param.grade),
												token:decodeURIComponent(logininfo.param.token),
												trackingNumber:$send_trackingnumber.val(),
												deliveryHandler:$send_deliveryhandler.val(),
												deliveryTime:$send_deliverytime.val()
											}
									};
									$.extend(true,config1.data,checkdata);
								}else{
									var config2={
										url:"http://10.0.5.226:8082/yttx-agentbms-api/servicestation/repairorder/add",
										dataType:'JSON',
										method:'post',
										data:{
											serviceStationId:id,
											adminId:decodeURIComponent(logininfo.param.adminId),
											grade:decodeURIComponent(logininfo.param.grade),
											token:decodeURIComponent(logininfo.param.token),
											trackingNumber:$repair_trackingnumber.val(),
											deliveryHandler:$repair_deliveryhandler.val(),
											deliveryTime:$repair_deliverytime.val(),
											name:$repair_name.val(),
											startNumber:$repair_startnumber.val(),
											endNumber:$repair_endnumber.val(),
											listNumber:$repair_listnumber.val(),
											quantity:$repair_quantity.val()
										}
									};
								}

								$.ajax((function(){
									if(issend){
										return config1;
									}else{
										return config2;
									}
								})())
									.done(function(resp){
										var code=parseInt(resp.code,10);
										if(code!==0){
											console.log(resp.message);
											setTimeout(function(){
												issend?dia.content('<span class="g-c-bs-warning g-btips-warn">发货失败</span>').show():dia.content('<span class="g-c-bs-warning g-btips-warn">返修失败</span>').show();
											},300);
											setTimeout(function () {
												dia.close();
											},2000);
											return false;
										}
										//重绘表格
										table.ajax.reload(null,false);
										if(issend){
											//重置表单;
											$send_cance_btn.trigger('click');
											recordtable.ajax.reload(null,false);
										}else{
											//重置表单;
											$repair_cance_btn.trigger('click');
										}
										setTimeout(function(){
											issend?dia.content('<span class="g-c-bs-success g-btips-succ">发货成功</span>').show():dia.content('<span class="g-c-bs-success g-btips-succ">返修成功</span>').show();
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
						
					});
				}
				/*提交验证*/
				$station_send_form.validate(form_opt0);
				$station_repair_form.validate(form_opt1);
			}
		}

	});

	/*解析发货插件*/
	function getCheckPlugin(opt){
		if(!opt){
			var result={
				IsCheckedDevice:0,
				IsCheckedFittings:0,
				invoiceDevicelist:[],
				invoiceFittinglist:[],
				invoiceRepairlist:[],
				IsCheckedRepair:0
			};
			return result;
		}
		var result={
			IsCheckedDevice:0,
			IsCheckedFittings:0,
			invoiceDevicelist:[],
			invoiceFittinglist:[],
			invoiceRepairlist:[],
			IsCheckedRepair:0
		};
		var check=opt.check,
			wrap=opt.wrap,
			list=opt.list,
			len=check.length,
			i=0;
		for(i;i<len;i++){
			var $checkbox=check[i],
				ischeck=$checkbox.is(':checked'),
				key=$checkbox.attr('name');

			if(ischeck){
				var items=list[i].children(),
					arr=[];

				result[key]=1;
				items.each(function(index){
					/*循环li*/
					var subresult={},
						subitems=items.eq(index).find('input'),
						sublen=subitems.size(),
						count=0;
					/*循环input*/
					subitems.each(function(){
						var $this=$(this),
							name=$this.attr('name'),
							value=$this.val();

						if(value===''){
							count++;
						}
						if(subresult[name]&&value!==''){
							subresult[name]=subresult[name]+','+value;
						}else{
							subresult[name]=value;
						}
					});
					if(count===sublen){
						subresult={};
					}else{
						if(index===0||index===2){
							/*添加类型*/
							var $select=items.eq(index).find('select'),
								selectname=$select.attr('name'),
								selectvalue=$select.find('option:selected').val();
							if(subresult[selectname]&&selectvalue!==''){
								subresult[selectname]=subresult[selectname]+','+selectvalue;
							}else{
								subresult[selectname]=selectvalue;
							}
						}
						arr.push(subresult);
					}
				});

				if(arr.length!==0){
					if(i===0){
						/*多个移动支付设备*/
						result['invoiceDevicelist']=JSON.stringify(arr.slice(0));
					}else if(i===1){
						/*多个配件*/
						result['invoiceFittinglist']=JSON.stringify(arr.slice(0));
					}else{
						result['invoiceRepairlist']=JSON.stringify(arr.slice(0));
					}
				}
			}else {
				result[key]=0;
				if(i===0){
					result['invoiceDevicelist'].length=0;
				}else if(i===1){
					result['invoiceFittinglist'].length=0;
				}else if(i===2){
					result['invoiceRepairlist'].length=0;
				}
			}
		}
		return result;
	};

})(jQuery);