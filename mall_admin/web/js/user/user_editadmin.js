/*admin_role:角色管理*/
(function($){
	'use strict';
	$(function(){

		/*初始化数据*/
		if(public_tool.initMap.isrender){
			/*菜单调用*/
			var logininfo=public_tool.initMap.loginMap;
			public_tool.loadSideMenu(public_vars.$mainmenu,public_vars.$main_menu_wrap,{
				url:'../../json/menu.json',
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
				permission_power=public_tool.getKeyPower('user-updateadmin',powermap);


			/*dom引用和相关变量定义*/
			var module_id='user_editadmin'/*模块id，主要用于本地存储传值*/,
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


			/*获取编辑缓存*/
			(function () {
				var edit_cache=public_tool.getParams('mall-user-editadmin');
				if(edit_cache){
					/*查询数据*/
					if(typeof edit_cache==='object'){
						/*数据查询*/
						getPower(edit_cache['id']);
					}else{
						/*数据查询*/
						getPower(edit_cache);
					}
				}
			}());



			/*绑定确定修改*/
			var countitem={},
				issetting=false;
			$operate_setting.on('click',function(e){
				/*判断是否有权限*/
				if(!permission_power){
					return false;
				}
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
						url:"../../json/user/mall_user_admin.json",
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
							/*清除编辑缓存*/
							public_tool.removeParams('mall-user-editadmin');
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



		/*获取权限*/
		function getPower(id) {
			if(typeof id==='undefined'){
				return false;
			}
			$.ajax({
					url:"../../json/menu.json",
					dataType:'JSON',
					method:'post',
					data:{
						id:id,
						adminId:decodeURIComponent(logininfo.param.adminId),
						token:decodeURIComponent(logininfo.param.token)
					}
				})
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


})(jQuery);