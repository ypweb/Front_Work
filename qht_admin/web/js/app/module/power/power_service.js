/*权限列表服务*/
'use strict';
angular.module('power.service',[])
	.service('powerService',['toolUtil','toolDialog','BASE_CONFIG','loginService','$sce',function (toolUtil,toolDialog,BASE_CONFIG,loginService,$sce) {
		/*获取缓存数据*/
		var cache=loginService.getCache(),
			powerCache=$.extend(true,{},cache['powerMap']),
			self=this,
			h_items=[],
			h_len=0,
			colgroup=''/*分组*/,
			thead=''/*普通的头*/,
			all_thead=''/*拥有全选的头*/,
			$admin_struct_allpower=$('#admin_struct_allpower');

		/*初始化执行*/
		(function () {
			/*有数据即调数据，没数据就创建数据*/
			if(thead!=='' && colgroup!=='' && h_items.length!==0){
				return false;
			}

			if(powerCache){
				var str='',
					strall='',
					index=0;

				for(var i in powerCache){
					/*过滤首页*/
					if(parseInt(i,10)===0){
						continue;
					}
					h_items.push(i);
					strall+='<th class="g-t-c"><label><input data-index="'+index+'" data-modid="'+powerCache[i]["id"]+'" type="checkbox" name="'+powerCache[i]["module"]+'" />&nbsp;'+powerCache[i]["name"]+'</label></th>';
					str+='<th data-index="'+index+'" class="g-t-c">'+powerCache[i]["name"]+'</th>';
					index++;
				}

				if(h_items.length!==0){
					var len=h_items.length,
						j=0,
						colitem=parseInt(50/len,10);

					/*初始化赋值*/
					thead='<tr>'+str+'</tr>';
					all_thead='<tr>'+strall+'</tr>';
					h_len=len;

					/*解析分组*/
					if(colitem * len<=(50 - len)){
						colitem=len+1;
					}
					for(j;j<len;j++){
						colgroup+='<col class="g-w-percent'+colitem+'" />';
					}
				}
			}else{
				all_thead=thead='<tr><th></th></tr>';
				colgroup='<col class="g-w-percent50" />';
			}
		}());

		/*扩展服务--初始化jquery dom节点*/
		this.initJQDom=function (dom) {
			if(dom){
				/*复制dom引用*/
				for(var i in dom){
					self[i]=dom[i];
				}
			}
		};

		/*生成头部和分组*/
		this.createThead=function (config,mode) {
			/*flag:是否有全选*/
			/*有数据即调数据，没数据就创建数据*/
			if(config.flag){
				if(mode){
					mode['colgroup']=$sce.trustAsHtml(colgroup);
					mode['thead']=$sce.trustAsHtml(all_thead);
				}else{
					return {
						colgroup:$sce.trustAsHtml(colgroup),
						thead:$sce.trustAsHtml(all_thead)
					}
				}
			}else{
				if(mode){
					mode['colgroup']=$sce.trustAsHtml(colgroup);
					mode['thead']=$sce.trustAsHtml(thead);
				}else{
					return {
						colgroup:$sce.trustAsHtml(colgroup),
						thead:$sce.trustAsHtml(thead)
					}
				}
			}
		};

		/*请求权限列表(主要是根据不同对象查询相关权限):config:请求参数，mode:angular 模型*/
		this.reqPowerList=function (config,mode) {
			/*合并参数*/
			var param=$.extend(true,{},config.param,cache.loginMap.param);

			toolUtil
				.requestHttp({
					url:config.url?config.url:'/module/permissions',
					method:'post',
					set:true,
					data:param
				})
				.then(function(resp){
						var data=resp.data,
							status=parseInt(resp.status,10);

						if(status===200){
							var code=parseInt(data.code,10),
								message=data.message;
							if(code!==0){
								if(typeof message !=='undefined'&&message!==''){
									console.log(message);
								}else{
									console.log('请求权限失败');
								}
								if(code===999){
									/*退出系统*/
									cache=null;
									toolUtil.loginTips({
										clear:true,
										reload:true
									});
								}
							}else{
								/*加载数据*/
								var result=data.result;
								if(typeof result!=='undefined'){
									var menu=result.menu;
									if(menu){
										var len=menu.length;
										if(len===0){
											/*直接获取原始数据*/
											if(config.source){
												if(config.sourcefn && typeof config.sourcefn==='function'){
													config.sourcefn.call(null,null);
												}
												return true;
											}else{
												if(mode){
													mode['tbody']=$sce.trustAsHtml('<tr><td colspan="'+h_len+'" class="g-c-gray9 g-fs4 g-t-c g-b-white">没有查询到权限信息</td></tr>');
												}
											}
										}else{
											var templist=toolUtil.resolveMainMenu(menu);
											/*直接获取原始数据*/
											if(config.source){
												if(templist!==null){
													if(config.sourcefn && typeof config.sourcefn==='function'){
														config.sourcefn.call(null,templist['power']);
													}
												}else{
													if(config.sourcefn && typeof config.sourcefn==='function'){
														config.sourcefn.call(null,null);
													}
												}
												return true;
											}else{
												/*解析数据*/
												/*将查询数据按照模块解析出来*/
												if(templist!==null){
													var temp_power=templist['power'],
														temp_html='';
													/*将模块数据解析转换成html数据*/
													if(config.clear){
														temp_html=self.resolvePowerList({
															menu:temp_power,
															clear:true
														});
													}else{
														temp_html=self.resolvePowerList({
															menu:temp_power
														});
													}
													if(mode){
														mode['tbody']=$sce.trustAsHtml(temp_html);
													}
												}else{
													if(mode){
														mode['tbody']=$sce.trustAsHtml('<tr><td colspan="'+h_len+'" class="g-c-gray9 g-fs4 g-t-c g-b-white">没有查询到权限信息</td></tr>');
													}
												}
											}

										}
									}else{
										/*直接获取原始数据*/
										if(config.source){
											if(config.sourcefn && typeof config.sourcefn==='function'){
												config.sourcefn.call(null,null);
											}
											return true;
										}else{
											/*填充子数据到操作区域,同时显示相关操作按钮*/
											if(mode){
												mode['tbody']=$sce.trustAsHtml('<tr><td colspan="'+h_len+'" class="g-c-gray9 g-fs4 g-t-c g-b-white">没有查询到权限信息</td></tr>');
											}
										}
									}
								}else{
									/*直接获取原始数据*/
									if(config.source){
										if(config.sourcefn && typeof config.sourcefn==='function'){
											config.sourcefn.call(null,null);
										}
										return true;
									}else{
										if(mode){
											mode['tbody']=$sce.trustAsHtml('<tr><td colspan="'+h_len+'" class="g-c-gray9 g-fs4 g-t-c g-b-white">没有查询到权限信息</td></tr>');
										}
									}
								}
							}
						}
					},
					function(resp){
						var message=resp.data.message;
						if(typeof message !=='undefined'&&message!==''){
							console.log(message);
						}else{
							console.log('请求权限失败');
						}
						/*直接获取原始数据*/
						if(config.source){
							if(config.sourcefn && typeof config.sourcefn==='function'){
								config.sourcefn.call(null,null);
							}
							return true;
						}else{
							if(mode){
								mode['tbody']=$sce.trustAsHtml('<tr><td colspan="'+h_len+'" class="g-c-gray9 g-fs4 g-t-c g-b-white">没有查询到权限信息</td></tr>');
							}
						}
					});
		};

		/*解析权限列表*/
		this.resolvePowerList=function (config) {
			/*解析数据*/
			var len=h_items.length,
				i= 0,
				str='',
				ispermit,
				request=(config&&config.menu)?true:false;

			if(len===0){
				str='<tr><td class="g-c-gray9 g-fs4 g-t-c g-b-white">没有查询到权限信息</td></tr>';
			}else{
				if(request){
					var menuitem=config.menu,
						temp_id=typeof config.id!=='undefined'?config.id:'';
				}
				for(i;i<len;i++){
					var index=parseInt(h_items[i],10),
						item=request?menuitem[index]:powerCache[index],
						power=item['power'],
						j=0,
						sublen=power.length;

					str+='<td class="g-b-white">';

					for(j;j<sublen;j++){
						var subitem=power[j];

						if(request){
							/*如果是请求*/
							if(config.clear){
								/*全不选*/
								str+='<label class="btn btn-default g-gap-mb2 g-gap-mr2"><input data-roleid="'+temp_id+'" data-prid="'+subitem["prid"]+'" data-modid="'+subitem["modId"]+'" type="checkbox" name="'+item["module"]+'" />&nbsp;'+subitem["funcName"]+'</label>';
							}else{
								/*根据设置或者配置结果来*/
								ispermit=parseInt(subitem["isPermit"],10);
								if(ispermit===0){
									/*没有权限*/
									str+='<label class="btn btn-default g-gap-mb2 g-gap-mr2"><input data-roleid="'+temp_id+'" data-prid="'+subitem["prid"]+'" data-modid="'+subitem["modId"]+'" type="checkbox" name="'+item["module"]+'" />&nbsp;'+subitem["funcName"]+'</label>';
								}else if(ispermit===1){
									/*有权限*/
									str+='<label class="btn btn-default g-gap-mb2 g-gap-mr2"><input data-roleid="'+temp_id+'" data-prid="'+subitem["prid"]+'" data-modid="'+subitem["modId"]+'" checked="true" type="checkbox" name="'+item["module"]+'" />&nbsp;'+subitem["funcName"]+'</label>';
								}
							}
						}else{
							/*非请求*/
							if(config.clear){
								/*全不选*/
								str+='<label class="btn btn-default g-gap-mb2 g-gap-mr2"><input data-prid="'+subitem["prid"]+'" data-modid="'+subitem["modId"]+'" type="checkbox" name="'+item["module"]+'" />&nbsp;'+subitem["funcName"]+'</label>';
							}else{
								/*根据设置或者配置结果来*/
								ispermit=parseInt(subitem["isPermit"],10);
								if(ispermit===0){
									/*没有权限*/
									str+='<label class="btn btn-default g-gap-mb2 g-gap-mr2"><input data-prid="'+subitem["prid"]+'" data-modid="'+subitem["modId"]+'" type="checkbox" name="'+item["module"]+'" />&nbsp;'+subitem["funcName"]+'</label>';
								}else if(ispermit===1){
									/*有权限*/
									str+='<label class="btn btn-default g-gap-mb2 g-gap-mr2"><input data-prid="'+subitem["prid"]+'" data-modid="'+subitem["modId"]+'"  checked="true" type="checkbox" name="'+item["module"]+'" />&nbsp;'+subitem["funcName"]+'</label>';
								}
							}
						}

					}
					str+="</td>";
				}
			}
			return '<tr data-random="'+Math.floor(Math.random() * 1000000)+'">'+str+'</tr>';
		};

		/*权限服务--全选权限*/
		this.selectAllPower=function (e) {
			e.stopPropagation();

			var target=e.target,
				nodename=target.nodeName.toLowerCase();

			/*过滤*/
			if(nodename==='tr'){
				return null;
			}

			/*标签*/
			var $selectall,
				index,
				$operate,
				check,
				selectarr=[];

			if(nodename==='label'||nodename==='th'||nodename==='td'){
				$selectall=$(target).find('input');
			}else if(nodename==='input'){
				$selectall=$(target);
			}

			check=$selectall.is(':checked');
			index=$selectall.attr('data-index');
			$operate=$admin_struct_allpower.find('td').eq(index).find('input');

			if(check){
				$operate.each(function () {
					var $this=$(this),
						prid=$this.attr('data-prid');
					$this.prop({
						"checked":true
					});
					selectarr.push(prid);
				});
			}else{
				$operate.each(function () {
					$(this).prop({
						"checked":false
					});
				});
				selectarr=null;
			}
			return selectarr;
		};


		/*权限服务--过滤权限--(主要为父级和子级之间的关系):odata:原数据(父级),ndata:过滤数据(子级)*/
		this.filterPower=function (odata,ndata) {
			if(!odata){
				return false;
			}
			if(!ndata){
				return false;
			}
			if(h_len===0){
				return false;
			}
			var i=0,
				source=$.extend(true,{},ndata);

			for(i;i<h_len;i++){
				var index=parseInt(h_items[i],10),
					item=odata[index],
					child_item=source[index],
					power=item['power']/*array*/,
					child_power=child_item['power']/*array*/,
					sublen=power.length,
					j=0,
					ispermit;

				for(j;j<sublen;j++){
					var child_sublen=child_power.length,
						subitem=power[j],
						prid=parseInt(subitem["prid"],10);

					/*根据设置或者配置结果来*/
					ispermit=parseInt(subitem["isPermit"],10);

					/*开始过滤子权限*/
					if(ispermit===0){
						/*没有权限*/
						/*查找子权限*/
						var k=child_sublen - 1,
							child_subitem,
							child_prid;
						for(k;k>=0;k--){
							child_subitem=child_power[k];
							child_prid=parseInt(child_subitem["prid"],10);

							/*是否是同一个权限值*/
							if(prid===child_prid){
								/*如果存在相同的权限，且父权限没有权限，那么需要清除此子权限*/
								child_power.splice(k,1);
							}
						}
					}else if(ispermit===1){
						/*有权限则查找下面的权限*/
						continue;
					}
				}
			}
			return source;
		};

		/*权限服务--获取选中选择权限*/
		this.getSelectPower=function (dom) {
			var $input=typeof dom!=='undefined'?$(dom):$admin_struct_allpower.find('input:checked');

			/*标签*/
			var prid,
				selectarr=[];

			$input.each(function () {
				var $this=$(this);

				prid=$this.attr('data-prid');
				selectarr.push(prid);
			});
			return selectarr.length===0?null:selectarr;
		};

		/*权限服务--清除选中选择权限*/
		this.clearSelectPower=function (dom) {
			var $input,
				$head;
			if(typeof dom!=='undefined'){
				$input=$(dom);
			}else{
				$input=$admin_struct_allpower.find('input:checked');
			}
			$head=$admin_struct_allpower.prev('thead').find('input:checked');

			$input.each(function () {
				$(this).prop({
					'checked':false
				});
			});

			if($head){
				$head.each(function () {
					$(this).prop({
						'checked':false
					});
				});
			}
		};

		/*权限服务--获取当前用户的权限缓存,key(id，模块名称)*/
		this.getCurrentPower=function (key) {
			if(cache){
				if(typeof key!=='undefined'){
					return toolUtil.getPowerListByModule(key,powerCache);
				}
				return powerCache;
			}
			return null;
		};
	}]);
