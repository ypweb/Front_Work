/*admin_role:角色管理*/
(function($){
	'use strict';
	$(function(){

		/*初始化数据*/
		if(public_tool.initMap.isrender){
			/*菜单调用*/
			var logininfo=public_tool.initMap.loginMap,
				roleid=decodeURIComponent(logininfo.param.roleId);
			public_tool.loadSideMenu(public_vars.$mainmenu,public_vars.$main_menu_wrap,{
				url:'http://112.74.207.132:8081/mall-buzhubms-api/module/menu',
				async:false,
				type:'post',
				param:{
					roleId:roleid,
					adminId:decodeURIComponent(logininfo.param.adminId),
					grade:decodeURIComponent(logininfo.param.grade),
					token:decodeURIComponent(logininfo.param.token)
				},
				datatype:'json'
			});


			/*权限调用*/
			var powermap=public_tool.getPower(),
				permission_power=public_tool.getKeyPower('bzw-other-set',powermap);


			/*dom引用和相关变量定义*/
			var $admin_role_wrap=$('#admin_role_wrap')/*角色表格*/,
				module_id='bzw_admin_permission'/*模块id，主要用于本地存储传值*/,
				table=null/*datatable 角色解析后的对象*/,
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
				$operate_header=$('#operate_header'),
				$operate_colgroup=$('#operate_colgroup'),
				setting_header=(function () {
					var poweritem=public_tool.getAllPower();
					if(poweritem){
						var powermap,
							str='',
							res=[];
						for(var i in poweritem){
							powermap=public_tool.menuMap[i];
							if(typeof powermap!=='undefined'){
								res.push(i);
								str+='<th>'+powermap['name']+'</th>';
							}
						}
						if(res.length!==0){
							$(str).appendTo($operate_header.html(''));
							/*解析分组*/
							(function () {
								var len=res.length,
									colstr='',
									j=0,
									colitem=parseInt(50/len,10);
								if(colitem * len<=(50 - len)){
									colitem=len+1;
								}
								for(j;j<len;j++){
									colstr+='<col class="g-w-percent'+colitem+'">';
								}
								$(colstr).appendTo($operate_colgroup.html(''));
							}());
							return res;
						}else{
							$operate_header.html('');
							$operate_colgroup.html('<col class="g-w-percent50">');
							return [];
						}
					}else{
						$operate_colgroup.html('<col class="g-w-percent50">');
						return [];
					}
				}())/*权限模块对应*/,
				$operate_setting=$('#operate_setting')/*查询数据展现容器*/;

			/*权限请求配置*/
			var permission_config={
						url:"http://112.74.207.132:8081/mall-buzhubms-api/module/permissions",
						dataType:'JSON',
						method:'post',
						data:{
							roleId:'-1',
							adminId:decodeURIComponent(logininfo.param.adminId),
							grade:decodeURIComponent(logininfo.param.grade),
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
					url:"http://112.74.207.132:8081/mall-buzhubms-api/roles",
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
						var list=json.result.list,
							len=list.length,
							m=0;
						if(len!==0){
							for(m;m<len;m++){
								if(parseInt(list[m]['id'],10)===parseInt(roleid,10)){
									list.splice(m,1);
									break;
								}
							}
							return list;
						}
						return [];
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
								grade:decodeURIComponent(logininfo.param.grade),
								token:decodeURIComponent(logininfo.param.token)
							};
						}
						return {
							roleId:decodeURIComponent(logininfo.param.roleId),
							adminId:decodeURIComponent(logininfo.param.adminId),
							grade:decodeURIComponent(logininfo.param.grade),
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
								btns='',
								code=full.roleCode?full.roleCode.toLowerCase():'';

							/*权限*/
							if(permission_power&&code!=='super'){
								btns+='<span data-action="select" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
									<i class="fa-gear"></i>\
									<span>权限</span>\
									</span>';
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



			/*事件绑定*/
			/*绑定查看，修改，删除操作*/
			var operate_item;
			$admin_role_wrap.delegate('span','click',function(e){
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

				if(action==='select'){
					if(operate_item){
						operate_item.removeClass('item-lighten');
						operate_item=null;
					}
					operate_item=$tr.addClass('item-lighten');
					/*查询操作*/
					permission_config.data.roleId=id;
					/*查询权限列表*/
					$.ajax(permission_config)
						.done(function (resp) {
							var code=parseInt(resp.code,10);
							if(code!==0){
								console.log(resp.message);
								dia.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
								setTimeout(function () {
									dia.close();
								},2000);
								return false;
							}
							/*处理权限*/
							var powerlist=public_tool.handlePower(resp,false);


							if(!$.isEmptyObject(powerlist)){
								/*设置值*/
								$operate_setting.attr({
									'data-id':id
								});
								/*解析数据*/
								var headlen=setting_header.length,
									i= 0,
									str='';
								for(i;i<headlen;i++){
									var index=parseInt(setting_header[i],10);
									if(index>=0){
										str+="<td>";
										var item=powerlist[index];
										for(var j in item){
											var subitem=item[j],
												ispermit=parseInt(subitem.isPermit,10);
											if(ispermit===0){
												str+='<span data-count="0" data-roleId="'+id+'" data-modId="'+subitem.modId+'" data-prid="'+subitem.prid+'" data-isPermit="'+ispermit+'" class="">'+subitem.funcName+'</span>';
											}else if(ispermit===1){
												str+='<span data-count="0" data-roleId="'+id+'" data-modId="'+subitem.modId+'" data-prid="'+subitem.prid+'" data-isPermit="'+ispermit+'" class="setting_active">'+subitem.funcName+'</span>';
											}
										}
										str+="</td>";
									}else{
										str+='<td>&nbsp;</td>';
									}
								}
								$(str).appendTo($operate_setting.html(''));
							}else{
								/*关闭权限控制按钮区域*/
								$operate_setting.attr({
									'data-id':'-1'
								}).html('<td colspan="'+setting_header.length+'">&nbsp;</td>');
							}
						})
						.fail(function(resp){
							$operate_setting.attr({
								'data-id':'-1'
							}).html('<td colspan="'+setting_header.length+'">&nbsp;</td>');
						});
				}



			});



			/*绑定确定修改*/
			var countitem={},
				issetting=false;
			$operate_setting.on('click',function(e){
				var target= e.target,
					nodename=target.nodeName.toLowerCase(),
					$this,
					$tr,
					ischeck=-1;

				if(nodename==='span'){
					$this=$(target);
					$tr=$this.closest('tr');
					ischeck=parseInt($tr.attr('data-id'),10);
				}else if(nodename==='td'||nodename==='tr'){
					return
				}
				if(ischeck===-1){
					dia.content('<span class="g-c-bs-warning g-btips-warn">请选中需要操作的角色</span>').show();
					return false;
				}


				/*防止频繁点击*/
				var count=parseInt($this.attr('data-count'),10);
				count++;
				$this.attr({'data-count':count});
				if(count>=3){
					dia.content('<span class="g-c-bs-warning g-btips-warn">请不要频繁点击设置</span>').show();
					if(typeof countitem[prid]==='undefined'){
						countitem[prid]=null;
					}else{
						clearTimeout(countitem[prid]);
						countitem[prid]=null;
					}
					//定时函数
					countitem[prid]=setTimeout(function(){
						$this.attr({'data-count':0});
						clearTimeout(countitem[prid]);
						countitem[prid]=null;
					},5000);
					return false;
				}

				var modId=$this.attr('data-modId'),
					isPermit=parseInt($this.attr('data-isPermit'),10),
					prid=$this.attr('data-prid');

				/*过滤*/
				if(modId===''||prid===''||isPermit===''||typeof modId==='undefined'||typeof prid==='undefined'||typeof isPermit==='undefined'){
					dia.content('<span class="g-c-bs-warning g-btips-warn">不能操作</span>').show();
					return false;
				}


				/*更改状态*/
				if(isPermit===0){
					isPermit=1;
					$this.addClass('setting_active').attr({'data-isPermit':isPermit});
				}else if(isPermit===1){
					isPermit=0;
					$this.removeClass('setting_active').attr({'data-isPermit':isPermit});
				}


				/*发送请求*/
				$.ajax({
						url:"http://112.74.207.132:8081/mall-buzhubms-api/permission/state/update",
						dataType:'JSON',
						method:'post',
						data:{
							prid:prid,
							isPermit:isPermit,
							adminId:decodeURIComponent(logininfo.param.adminId),
							grade:decodeURIComponent(logininfo.param.grade),
							token:decodeURIComponent(logininfo.param.token)
						}
					})
					.done(function (resp) {
						var code=parseInt(resp.code,10);
						if(code!==0){
							/*回滚至以前状态*/
							if(isPermit===0){
								isPermit=1;
								$this.addClass('setting_active').attr({'data-isPermit':isPermit});
							}else if(isPermit===1){
								isPermit=0;
								$this.removeClass('setting_active').attr({'data-isPermit':isPermit});
							}
							console.log(resp.message);
							dia.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
							setTimeout(function () {
								dia.close();
							},2000);
						}
						if(!issetting){
							/*更改系统设置*/
							issetting=true;
							var history_route=public_tool.getParams('route_module');
							history_route.issetting=true;
							public_tool.removeParams('route_module');
							public_tool.setParams('route_module',history_route);
						}
					})
					.fail(function(resp){
						/*回滚至以前状态*/
						if(isPermit===0){
							isPermit=1;
							$this.addClass('setting_active').attr({'data-isPermit':isPermit});
						}else if(isPermit===1){
							isPermit=0;
							$this.removeClass('setting_active').attr({'data-isPermit':isPermit});
						}
						console.log(resp.message);
						dia.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
						setTimeout(function () {
							dia.close();
						},2000);
					});
			});


		}



	});


})(jQuery);