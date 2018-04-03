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
				agentdelete_power=public_tool.getKeyPower('删除',powermap),
				agentdetail_power=public_tool.getKeyPower('查看',powermap),
				agentbind_power=public_tool.getKeyPower('绑定服务站',powermap);


			/*dom引用和相关变量定义*/
			var $agent_list_wrap=$('#agent_list_wrap')/*表格*/,
				module_id='agent_add'/*模块id，主要用于本地存储传值*/,
				$data_wrap=$('#data_wrap')/*数据展现面板*/,
				table=null/*数据展现*/,
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
				dialogObj=public_tool.dialog()/*回调提示对象*/,
				$show_detail_wrap=$('#show_detail_wrap')/*详情容器*/,
				$show_detail_title=$('#show_detail_title')/*详情标题*/,
				$show_detail_content=$('#show_detail_content')/*详情内容*/,
				detail_map={
					fullName:'代理商全称',
					shortName:"代理商简称",
					name:"负责人姓名",
					phone:"负责人手机号码",
					address:"地址",
					grade:"代理商级别",
					serivceStationlist:"管理的服务站",
					serivceStationStats:"销售情况",
					totalMonthSales:"本月销售总计",
					totalAllSales:"全部销售总计",
					sales:"销售",
					inventory:"库存",
					repairs:"返修",
					agentShortName:"所属代理",
					superShortName:"上级代理"
				}/*详情映射*/;

			/*查询对象*/
			var $search_fullName=$('#search_fullName'),
				$search_name=$('#search_name'),
				$search_phone=$('#search_phone'),
				$admin_search_btn=$('#admin_search_btn'),
				$admin_search_clear=$('#admin_search_clear');


			/*绑定代理商*/
			var $admin_bind_wrap=$('#admin_bind_wrap'),
				$admin_bind_title=$('#admin_bind_title'),
				$service_unbindwrap=$('#service_unbindwrap'),
				$service_bindwrap=$('#service_bindwrap'),
				$service_bindbtn=$('#service_bindbtn'),
				$service_unbindbtn=$('#service_unbindbtn');

			/*数据加载*/
			var agent_config={
				url:"http://10.0.5.226:8082/yttx-agentbms-api/agents/related",
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
					var list=json.result.list;

					if(!list){
						return [];
					}
					if(list.length===0){
						return list;
					}else{
						var stationobj=list[0];
						if('serivceStationlist' in stationobj){
							list=list.slice(1);
							stationobj=list[0];
							if('serivceStationlist' in stationobj){
								list=list.slice(1);
							}
						}
						return list;
					}



				},
				data:{
					roleId:decodeURIComponent(logininfo.param.roleId),
					adminId:decodeURIComponent(logininfo.param.adminId),
					grade:decodeURIComponent(logininfo.param.grade),
					token:decodeURIComponent(logininfo.param.token)
				}
			};
			table=$agent_list_wrap.DataTable({
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
					{"data":"fullName"},
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
							return data.toString().slice(0,40)+'...';
						}
					},
					{
						"data":"grade",
						"render":function(data, type, full, meta ){
							var str='',
								grade=parseInt(data,10);
							if(grade===1){
								str='A';
							}else if(grade===2){
								str='AA';
							}else if(grade===3){
								str='AAA';
							}
							return str;
						}
					},
					{
						"data":"id",
						"render":function(data, type, full, meta ){
							var btns='';

							if(agentdetail_power){
								/*查看*/
								btns+='<span data-id="'+data+'" data-action="select" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
									 <i class="fa-file-text-o"></i>\
									 <span>查看</span>\
									 </span>';
							}

							/*if(agentbind_power){
								/!*绑定*!/
								btns+='<span  data-id="'+data+'" data-action="bind" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
									<i class="fa-cogs"></i>\
									<span>绑定服务站</span>\
									</span>';
							}*/
							if(agentdelete_power){
								/*删除*/
								btns+='<span  data-id="'+data+'" data-action="delete" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
									<i class="fa-trash"></i>\
									<span>删除</span>\
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

			/*清空查询条件*/
			$admin_search_clear.on('click',function(){
				$.each([$search_fullName,$search_name,$search_phone],function(){
					this.val('');
				});
			});
			$admin_search_clear.trigger('click');

			/*联合查询*/
			$admin_search_btn.on('click',function(){
				var data= $.extend(true,{},agent_config.data);

				$.each([$search_fullName,$search_name,$search_phone],function(){
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
				table.ajax.config(agent_config).load(false);
			});

			/*事件绑定*/
			/*绑定查看，修改操作*/
			var operate_item;
			$agent_list_wrap.delegate('span','click',function(e){
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
				if(action==='delete'){
					/*删除操作*/
					dia.content('<span class="g-c-bs-warning g-btips-warn">目前暂未开放此功能</span>').show();
					setTimeout(function(){
						dia.close();
					},2000);
					return false;
				}else if(action==='select'){
					/*查看*/
					$.ajax({
							url:"http://10.0.5.226:8082/yttx-agentbms-api/agent/view",
							method: 'POST',
							dataType: 'json',
							data:{
								"agentId":id,
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
									if(j==='serivceStationlist'||j==='serivcestationlist'){
										str+='<tr><th colspan="12" class="g-t-c">管理的服务站</th></tr>';
										var ssl=list[j],
											sslen=ssl.length,
											ssi=0;
										if(sslen!==0){
											for(ssi;ssi<sslen;ssi++){
												str+='<tr><th>服务站'+(parseInt(ssi,10)+10)+':</th><td>'+ssl[ssi]+'</td></tr>';
											}
										}else{
											str+='<tr><td colspan="12">暂无数据</td></tr>';
										}
									}else if(j==='serivceStationStats'||j==='serivcestationstats'){
										str+='<tr><th colspan="12" class="g-t-c">销售情况</th></tr>';
										var sss=list[j],
											ssslen=sss.length,
											sssj=0;
										if(ssslen!==0){
											var tempmap={
												shortName:"服务站",
												agentShortName:"所属代理",
												agentRelated:"代理关系",
												Inventory:"库存",
												monthSales:"本月销售",
												Sales:"总计销售"
											};
											for(sssj;sssj<ssslen;sssj++){
												var tempobj=sss[sssj];
												if(!$.isEmptyObject(tempobj)){
													str+='<tr>';
													for(var k in tempobj){
														if(typeof tempmap[k]!=='undefined'){
															str+='<th>'+tempmap[k]+':</th><td>'+tempobj[k]+'</td>';
														}else{
															str+='<th>'+k+':</th><td>'+tempobj[k]+'</td>';
														}
													}
													str+='</tr>';
												}
											}
										}else{
											str+='<tr><td colspan="12">暂无数据</td></tr>';
										}
									}else{
										if(typeof detail_map[j]!=='undefined'){
											if(j==='fullName'||j==='fullname'){
												istitle=true;
												$show_detail_title.html('"<span class="g-c-info">'+list[j]+'</span>"代理商详情信息');
											}else if(j==='grade'){
												var gradestr=parseInt(list[j],10);
												if(gradestr===1){
													str+='<tr><th colspan="4">'+detail_map[j]+':</th><td colspan="8">A</td></tr>';
												}else if(gradestr===2){
													str+='<tr><th colspan="4">'+detail_map[j]+':</th><td colspan="8">AA</td></tr>';
												}else if(gradestr===3){
													str+='<tr><th colspan="4">'+detail_map[j]+':</th><td colspan="8">AAA</td></tr>';
												}
											}else{
												str+='<tr><th colspan="4">'+detail_map[j]+':</th><td colspan="8">'+list[j]+'</td></tr>';
											}
										}else{
											str+='<tr><th colspan="4">'+j+':</th><td colspan="8">'+list[j]+'</td></tr>';
										}

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

				}else if(action==='bind'){
					/*绑定代理商请求数据*/
					$.when($.ajax({
						url:"http://10.0.5.226:8082/yttx-agentbms-api/servicestation/notbound/list",
						method: 'POST',
						dataType: 'json',
						data:{
							"roleId":decodeURIComponent(logininfo.param.roleId),
							"adminId":decodeURIComponent(logininfo.param.adminId),
							"token":decodeURIComponent(logininfo.param.token)
						}
					}),$.ajax({
						url:"http://10.0.5.226:8082/yttx-agentbms-api/servicestation/bound/list",
						method: 'POST',
						dataType: 'json',
						data:{
							"agentId":id,
							"adminId":decodeURIComponent(logininfo.param.adminId),
							"token":decodeURIComponent(logininfo.param.token)
						}
					})).done(function(resp1,resp2){
						var data1 = resp1[0],
							data2=resp2[0],
							code1 = parseInt(data1.code, 10),
							code2 = parseInt(data2.code, 10);
						if (code1 !== 0&&code2!==0) {
							console.log(data1.message);
							console.log(data2.message);
							dia.content('<span class="g-c-bs-warning g-btips-warn">'+(data1.message||data2.message||"操作失败")+'</span>').show();
							setTimeout(function () {
								dia.close();
							},2000);
							return false;
						}
						var list1 = data1.result.list,
							unlen = list1.length,
							list2=data2.result.list,
							len=list2.length;

						if(!list1&&!list2){
							return false
						}

						if (unlen !== 0) {
							var i = 0,
								unstr = '';
							for (i; i < unlen; i++) {
								unstr += '<li data-id="' + list1[i]['id'] + '">' + list1[i]['shortName'] + '</li>';
							}
							$(unstr).appendTo($service_unbindwrap.html(''));
						}else{
							$service_unbindwrap.html('');
						}

						if(len!==0){
							var j = 0,
								str = '';
							for (j; j < len; j++) {
								str += '<li data-id="' + list2[j]['id'] + '">' + list2[j]['shortName'] + '</li>';
							}
							$(str).appendTo($service_bindwrap.html(''));
						}else {
							$service_bindwrap.html('');
						}

						/*添加高亮状态*/
						if(operate_item){
							operate_item.removeClass('item-lighten');
							operate_item=null;
						}
						operate_item=$tr.addClass('item-lighten');

						/*弹出操作框*/
						$admin_bind_title.html('"<span class="g-c-info">'+datas['fullName']+'</span>"代理商绑定');
						$admin_bind_wrap.attr({
							'data-id':id
						}).modal('show',{backdrop:'static'});

					}).fail(function (resp1,resp2) {
						var data1 = resp1[0],
							data2=resp2[0];
						if(data1.code !==0){
							console.log('unbind error');
							$service_unbindwrap.html('');
						}else if(data2.code !==0){
							console.log('bind error');
							$service_bindwrap.html('');
						}
					});

				}

			});

			/*绑定代理商绑定和取消绑定选中*/
			$.each([$service_unbindwrap,$service_bindwrap], function () {
					this.on('click','li',function(){
						var $this=$(this),
							id=$this.attr('data-id');

						if(id===''){
							return false;
						}

						if($this.hasClass('service-bindactive')){
							$this.removeClass('service-bindactive');
						}else{
							$this.addClass('service-bindactive').siblings().removeClass('service-bindactive');
						}
					});
			});

			/*绑定代理商绑定和取消绑定*/
			$.each([$service_bindbtn,$service_unbindbtn], function () {

				this.on('click', function () {


					var $this=$(this),
						type=$this.attr('data-type'),
						hasitem,
						isbind=type==='1'?true:false,
						config={
							url:"http://10.0.5.226:8082/yttx-agentbms-api/servicestation/binding/operation",
							dataType:'JSON',
							method:'post',
							data:{
								agentId:$admin_bind_wrap.attr('data-id'),
								adminId:decodeURIComponent(logininfo.param.adminId),
								grade:decodeURIComponent(logininfo.param.grade),
								token:decodeURIComponent(logininfo.param.token)
							}
						};


					if(isbind){
						/*绑定*/
						hasitem=$service_unbindwrap.find('li.service-bindactive');
					}else{
						/*取消绑定*/
						hasitem=$service_bindwrap.find('li.service-bindactive');
					}

					if(hasitem.length===0){
						dia.content('<span class="g-c-bs-warning g-btips-warn">请选择需要绑定或取消绑定的数据</span>').show();
						return false;
					}

					/*设置参数*/
					config.data['serviceStationId']=hasitem.attr('data-id');
					config.data['isBinding']=type;

					/*发送绑定代理或者取消绑定代理请求*/
					//没有回调则设置回调对象
					dialogObj.setFn(function(){
						var self=this;
						$.ajax(config).done(function(resp){
							var code=parseInt(resp.code,10);
							if(code!==0){
								console.log(resp.message);
								setTimeout(function(){
									self.content('<span class="g-c-bs-warning g-btips-warn">'+(isbind?"绑定服务站失败":"取消绑定服务站失败")+'</span>').show();
								},500);
								return false;
							}

							/*请求成功执行相应交互*/
							self.content('<span class="g-c-bs-success g-btips-succ">'+(isbind?"绑定服务站成功":"取消绑定服务站成功")+'</span>').show();
							setTimeout(function(){
								self.close();
								if(isbind){
									hasitem.appendTo($service_bindwrap);
								}else{
									hasitem.appendTo($service_unbindwrap);
								}
								hasitem.siblings().removeClass('service-bindactive');
								setTimeout(function(){
									hasitem.removeClass('service-bindactive');
								},1000);
							},1000);

						}).fail(function(resp){
							console.log('error');
							setTimeout(function(){
								self.content('<span class="g-c-bs-warning g-btips-warn">'+(isbind?"绑定服务站失败":"取消绑定服务站失败")+'</span>').show();
							},500);
						});

					},'agent_sure');
					//确认删除
					dialogObj.dialog.content('<span class="g-c-bs-warning g-btips-warn">'+(isbind?"是否绑定服务站?":"是否取消绑定服务站?")+'</span>').showModal();

				});
			});


			/*关闭弹出框并重置值*/
			$admin_bind_wrap.on('hide.bs.modal',function(){
				$admin_bind_wrap.attr({
					'data-id':''
				})
				if(operate_item){
					setTimeout(function(){
						operate_item.removeClass('item-lighten');
						operate_item=null;
					},1000);
				}
			});

			/*手机格式化*/
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

		}


	});



})(jQuery);