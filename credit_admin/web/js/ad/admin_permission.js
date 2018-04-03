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
				module_id='admin_permission'/*模块id，主要用于本地存储传值*/,
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
				setting_header=[1,6,11,19,-1,28,30]/*权限模块对应*/,
				$operate_setting=$('#operate_setting')/*查询数据展现容器*/;

			/*权限请求配置*/
			var permission_config={
						url:"http://10.0.5.226:8016/yttx-adminbms-api/module/permissions",
						dataType:'JSON',
						method:'post',
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
					{
						defaultContent:'<input type="checkbox" name="role" class="cbr">'
					},
					{"data":"name"},
					{"data":"description"},
					{
						defaultContent:''
						/*
						"data":"id",
						"render":function(data, type, full, meta ){
							var id=parseInt(data,10),
								str='';

							console.log(id);

							member_config.data.roleId=id;

							$.ajax(member_config)
								.done(function (resp) {
									var code=parseInt(resp.code,10);
									if(code!==0){
										str='';
										return false;
									}
									var list=resp.result.list,
											len=list.length,
											i=0;

									if(len!==0){
										for(i;i<len;i++){
											if(i===len - 1){
												str+=list[i]["name"];
											}else{
												str+=list[i]["name"]+',';
											}
										}
										return true;
									}
									str='';
									return false;
								})
								.fail(function(resp){
									console.log(resp.message);
									str="";
								});
							return str;
						}
						*/
					},
					{
						"data":"id",
						"render":function(data, type, full, meta ){
							var id=parseInt(data,10),
								btns='';

							/*权限*/
							if(typeof powermap[6]!=='undefined'&&id!==1){
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
			$admin_role_wrap.delegate('span','click',function(e){
				e.stopPropagation();
				e.preventDefault();

				var target= e.target,
					$this,
					id,
					action,
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
				action=$this.attr('data-action');

				if(action==='select'){
					/*查询操作*/
					permission_config.data.roleId=id;
					/*查询权限列表*/
					$.ajax(permission_config)
						.done(function (resp) {
							var code=parseInt(resp.code,10);
							if(code!==0){
								console.log(resp.message);
								return false;
							}
							/*处理权限*/
							var powerlist=public_tool.handlePower(resp,false);

							if(!$.isEmptyObject(powerlist)){
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
								}).html('<td colspan="7">&nbsp;</td>');
							}
						})
						.fail(function(resp){
							$operate_setting.attr({
								'data-id':'-1'
							}).html('<td colspan="7">&nbsp;</td>');
						});
				}



			});



			/*绑定确定修改*/
			var countitem={};
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
						url:"http://10.0.5.226:8016/yttx-adminbms-api/module/permission/update",
						dataType:'JSON',
						method:'post',
						data:{
							prid:prid,
							isPermit:isPermit,
							adminId:decodeURIComponent(logininfo.param.adminId),
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
					});
			});


		}



	});


})(jQuery);