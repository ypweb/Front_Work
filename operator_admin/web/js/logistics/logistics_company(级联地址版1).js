/*admin_member:成员设置*/
(function($){
	'use strict';
	$(function(){

		var table=null/*数据展现*/;

		/*初始化数据*/
		if(public_tool.initMap.isrender){
			/*菜单调用*/
			var logininfo=public_tool.initMap.loginMap;
			public_tool.loadSideMenu(public_vars.$mainmenu,public_vars.$main_menu_wrap,{
				url:'http://10.0.5.226:8082/mall-agentbms-api/module/menu',
				async:false,
				type:'post',
				param:{
					roleId:decodeURIComponent(logininfo.param.roleId),
					adminId:decodeURIComponent(logininfo.param.adminId),
					sourcesChannel:decodeURIComponent(logininfo.param.sourcesChannel),
					grade:decodeURIComponent(logininfo.param.grade),
					token:decodeURIComponent(logininfo.param.token)
				},
				datatype:'json'
			});
			/*权限调用*/
			var powermap=public_tool.getPower(),
				logisticsshow_power=public_tool.getKeyPower('mall-logistics-company',powermap);



			
			/*dom引用和相关变量定义*/
			var $logistics_company_wrap=$('#logistics_company_wrap')/*表格*/,
				module_id='mall-logistics-company'/*模块id，主要用于本地存储传值*/,
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
				$logistics_company_add=$('#logistics_company_add'),
				$show_add_wrap=$('#show_add_wrap'),
				admin_logisticsadd_form=document.getElementById('admin_logisticsadd_form'),
				$admin_logisticsadd_form=$(admin_logisticsadd_form),
				$admin_id=$('#admin_id'),
				$admin_companyName=$('#admin_companyName'),
				$admin_seCode=$('#admin_seCode'),
				$admin_linkman=$('#admin_linkman'),
				$admin_cellphone=$('#admin_cellphone'),
				$admin_province=$('#admin_province'),
				$admin_city=$('#admin_city'),
				$admin_country=$('#admin_country'),
				$admin_address=$('#admin_address'),
				$admin_sort=$('#admin_sort'),
				$admin_action=$('#admin_action'),
				resetform0=null,
				sureObj=public_tool.sureDialog(dia)/*回调提示对象*/,
				setSure=new sureObj();



			/*重置表单*/
			admin_logisticsadd_form.reset();


			/*列表请求配置*/
			var logistics_page={
					page:1,
					pageSize:10,
					total:0
				},
				logistics_config={
					$logistics_company_wrap:$logistics_company_wrap,
					$admin_page_wrap:$admin_page_wrap,
					config:{
						processing:true,/*大消耗操作时是否显示处理状态*/
						deferRender:true,/*是否延迟加载数据*/
						autoWidth:true,/*是否*/
						paging:false,
						ajax:{
							url:"http://10.0.5.226:8082/mall-agentbms-api/logistics/list",
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
								/*设置分页*/
								logistics_page.page=result.page;
								logistics_page.pageSize=result.pageSize;
								logistics_page.total=result.count;
								/*分页调用*/
								$admin_page_wrap.pagination({
									pageSize:logistics_page.pageSize,
									total:logistics_page.total,
									pageNumber:logistics_page.page,
									onSelectPage:function(pageNumber,pageSize){
										/*再次查询*/
										var param=logistics_config.config.ajax.data;
										param.page=pageNumber;
										param.pageSize=pageSize;
										logistics_config.config.ajax.data=param;
										getColumnData(logistics_page,logistics_config);
									}
								});
								return result?result.list||[]:[];
							},
							data:{
								roleId:decodeURIComponent(logininfo.param.roleId),
								adminId:decodeURIComponent(logininfo.param.adminId),
								token:decodeURIComponent(logininfo.param.token),
								grade:decodeURIComponent(logininfo.param.grade),
								page:1,
								pageSize:10
							}
						},
						info:false,
						searching:true,
						ordering:true,
						columns: [
							{
								"data":"companyName"
							},
							{
								"data":"seCode"
							},
							{
								"data":"linkman"
							},
							{
								"data":"cellphone",
								"render":function(data, type, full, meta ){
									return public_tool.phoneFormat(data);
								}
							},
							{
								"data":"address"
							},
							{
								"data":"status",
								"render":function(data, type, full, meta ){
									var stauts=parseInt(data,10),
										statusmap={
											0:"正常",
											1:"停用"
										},
										str='';

									if(stauts===0){
										str='<div class="g-c-gray6">'+statusmap[stauts]+'</div>';
									}else if(stauts===1){
										str='<div class="g-c-gray12">'+statusmap[stauts]+'</div>';
									}else{
										str='<div class="g-c-red2">删除</div>';
									}
									return str;
								}
							},
							{
								"data":"id",
								"render":function(data, type, full, meta ){
									var id=parseInt(data,10),
										stauts=parseInt(full.status,10),
										isdelete=parseInt(full.isDelete,10),
										btns='';

									if(logisticsshow_power&&isdelete===0){
										if(stauts===0){
											/*正常*/
											btns+='<span data-action="edit" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-pencil"></i>\
											<span>编辑</span>\
											</span>';
										}
									}


									/*if(stauts===0){
										/!*正常*!/
										btns+='<span data-action="disable" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-toggle-on"></i>\
											<span>停用</span>\
											</span>\
											<span data-action="delete" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-trash"></i>\
											<span>删除</span>\
											</span>\
											<span data-action="edit" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-pencil"></i>\
											<span>编辑</span>\
											</span>';
									}else if(stauts===1){
										/!*停用*!/
										btns+='<span data-action="enable" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-toggle-off"></i>\
											<span>启用</span>\
											</span>\
											<span data-action="delete" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-trash"></i>\
											<span>删除</span>\
											</span>\
											<span data-action="edit" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-file-text-o"></i>\
											<span>编辑</span>\
											</span>';
									}*/
									return btns;
								}
							}
						]
					}
				};
			

			/*初始化请求*/
			getColumnData(logistics_page,logistics_config);


			/*获取地址*/
			getAddress(86,'','province',true);


			/*绑定新增入库*/
			if(logisticsshow_power){
				$logistics_company_add.removeClass('g-d-hidei');
				$logistics_company_add.on('click',function () {
					$admin_id.val('');
					$admin_action.html('添加');
					$show_add_wrap.modal('show',{backdrop:'static'});
				});
			}else{
				$logistics_company_add.addClass('g-d-hidei');
			}


			/*格式化手机号码*/
			$.each([$admin_cellphone],function(){
				this.on('keyup',function(){
					var phoneno=this.value.replace(/\D*/g,'');
					if(phoneno==''){
						this.value='';
						return false;
					}
					this.value=public_tool.phoneFormat(this.value);
				});
			});


			/*绑定切换地址*/
			$.each([$admin_province,$admin_city,$admin_country],function () {
				var self=this,
					selector=this.selector,
					type='';

				if(selector.indexOf('province')!==-1){
					type='province';
				}else if(selector.indexOf('city')!==-1){
					type='city';
				}else if(selector.indexOf('country')!==-1){
					type='country';
				}

				this.on('change',function () {
					var $this=$(this),
						value=$this.val();
					if(type==='province'){
						getAddress(value,'','city',true);
					}else if(type==='city'){
						getAddress(value,'','country',true);
					}
				});
			});
			


			/*事件绑定*/
			/*绑定查看，修改操作*/
			var operate_item;
			$logistics_company_wrap.delegate('span','click',function(e){
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


				if(action==='disable'){
					/*停用*/
					dia.content('<span class="g-c-bs-warning g-btips-warn">功能正在开发中...</span>').show();
					setTimeout(function () {
						dia.close();
					},2000);
					return false;
				}else if(action==='delete'){
					/*删除*/
					dia.content('<span class="g-c-bs-warning g-btips-warn">功能正在开发中...</span>').show();
					setTimeout(function () {
						dia.close();
					},2000);
					return false;
				}else if(action==='edit'){
					/*编辑*/
					logisticsEdit(id,$tr);
				}else if(action==='enable'){
					/*启用*/
					dia.content('<span class="g-c-bs-warning g-btips-warn">功能正在开发中...</span>').show();
					setTimeout(function () {
						dia.close();
					},2000);
					return false;
				}
			});


			/*绑定关闭详情*/
			$.each([$show_add_wrap],function () {
				this.on('hide.bs.modal',function(){
					if(operate_item){
						setTimeout(function(){
							operate_item.removeClass('item-lighten');
							operate_item=null;
						},1000);
					}
				});
			});



			/*绑定添加地址*/
			/*表单验证*/
			if($.isFunction($.fn.validate)) {
				/*配置信息*/
				var form_opt0={},
					formcache=public_tool.cache,
					basedata={
						roleId:decodeURIComponent(logininfo.param.roleId),
						token:decodeURIComponent(logininfo.param.token),
						adminId:decodeURIComponent(logininfo.param.adminId),
						grade:decodeURIComponent(logininfo.param.grade)
					};


				if(formcache.form_opt_0){
					$.each([formcache.form_opt_0],function(index){
						var formtype,
							config={
								dataType:'JSON',
								method:'post'
							};
						if(index===0){
							formtype='addlogistics';
						}
						$.extend(true,(function () {
							if(formtype==='addlogistics'){
								return form_opt0;
							}
						}()),(function () {
							if(formtype==='addlogistics'){
								return formcache.form_opt_0;
							}
						}()),{
							submitHandler: function(form){

								var setdata={};

								$.extend(true,setdata,basedata);

								if(formtype==='addlogistics'){
									var id=$admin_id.val();
									$.extend(true,setdata,{
										companyName:$admin_companyName.val(),
										seCode:$admin_seCode.val(),
										linkman:$admin_linkman.val(),
										cellphone:public_tool.trims($admin_cellphone.val()),
										address:$admin_province.find(':selected').val()+$admin_city.find(':selected').val()+$admin_country.find(':selected').val()+$admin_address.val(),
										sort:$admin_sort.val()
									});

									var actiontype='';
									if(id!==''){
										actiontype='修改';
										setdata['id']=id;
									}else{
										actiontype='添加';
									}

									config['url']="http://10.0.5.226:8082/mall-agentbms-api/logistics/addupdate";
									config['data']=setdata;
								}

								$.ajax(config).done(function(resp){
									var code;
									if(formtype==='addlogistics'){
										code=parseInt(resp.code,10);
										if(code!==0){
											dia.content('<span class="g-c-bs-warning g-btips-warn">'+actiontype+'失败</span>').show();
											return false;
										}else{
											dia.content('<span class="g-c-bs-success g-btips-succ">'+actiontype+'成功</span>').show();
										}
									}

									if(formtype==='addlogistics'&&code===0){
										getColumnData(logistics_page,logistics_config);
										admin_logisticsadd_form.reset();
										if(actiontype==='修改'){
											/*重新请求地址*/
											getAddress(86,'','province',true);
										}
										setTimeout(function () {
											/*关闭隐藏*/
											dia.close();
											setTimeout(function () {
												$show_add_wrap.modal('hide');
											},1000);
										},500);
									}


								}).fail(function(resp){
									console.log('error');
								});
								return false;
							}
						});
					});

				}


				/*提交验证*/
				if(resetform0===null){
					resetform0=$admin_logisticsadd_form.validate(form_opt0);
				}
			}



		}


		/*获取数据*/
		function getColumnData(page,opt){
			if(table===null){
				table=opt.$logistics_company_wrap.DataTable(opt.config);
			}else{
				table.ajax.config(opt.config.ajax).load();
			}
		}


		/*编辑*/
		function logisticsEdit(id,$tr) {
			$admin_id.val('');
			if(typeof id==='undefined'){
				return false;
			}

			$.ajax({
					url:"http://10.0.5.226:8082/mall-agentbms-api/logistics/details",
					dataType:'JSON',
					method:'post',
					data:{
						id:id,
						roleId:decodeURIComponent(logininfo.param.roleId),
						adminId:decodeURIComponent(logininfo.param.adminId),
						token:decodeURIComponent(logininfo.param.token),
						grade:decodeURIComponent(logininfo.param.grade)
					}
				})
				.done(function(resp){
					var code=parseInt(resp.code,10);
					if(code!==0){
						console.log(resp.message);
						dia.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
						setTimeout(function () {
							dia.close();
						},2000);
						return false;
					}
					/*是否是正确的返回数据*/
					var result=resp.result;
					if(!result){
						return false;
					}
					/*设置值*/
					$admin_id.val(id);
					$admin_action.html('修改');
					for(var i in result){
						switch (i){
							case 'seCode':
								$admin_seCode.val(result[i]);
								break;
							case 'companyName':
								$admin_companyName.val(result[i]);
								break;
							case 'linkman':
								$admin_linkman.val(result[i]);
								break;
							case 'cellphone':
								$admin_cellphone.val(public_tool.phoneFormat(result[i]));
								break;
							case 'address':
								var tempaddress=result[i],
									area=tempaddress.match(/^(\d{0,18})/g),
									detail='';

								if(area!==null){
									/*解析省，市，区*/
									area=area[0];
									detail=tempaddress.replace(area,'');
									if(area!==''){
										(function () {
											var j=0,
												len=area.length,
												arr=[],
												str='';

											for(j;j<len;j++){
												var tempj=j+1;
												str+=area[j];
												if(tempj%6===0){
													arr.push(str);
													str='';
												}
											}
											if(arr.length!==0){
												if(arr[0]&&arr[0].length===6){
													getAddress(86,arr[0],'province');
													if(arr[1]&&arr[1].length===6){
														getAddress(arr[0],arr[1],'city');
														if(arr[2]&&arr[2].length===6){
															getAddress(arr[1],arr[2],'country');
														}
													}
												}else{
													getAddress(86,'','province',true);
												}
											}else{
												getAddress(86,'','province',true);
											}
										}());
									}else{
										getAddress(86,'','province',true);
									}
									$admin_address.val(detail);
								}else{
									getAddress(86,'','province',true);
									$admin_address.val(tempaddress);
								}
								break;
							case 'sort':
								$admin_sort.val(result[i]);
								break;
						}
					}
					
					/*添加高亮状态*/
					if(operate_item){
						operate_item.removeClass('item-lighten');
						operate_item=null;
					}
					operate_item=$tr.addClass('item-lighten');
					$show_add_wrap.modal('show',{backdrop:'static'});
				})
				.fail(function(resp){
					console.log(resp.message);
					dia.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
					setTimeout(function () {
						dia.close();
					},2000);
				});
		}


		/*查询地址*/
		function getAddress(id,sel,type,getflag) {
			var tempurl1='112.',
				tempurl2='74.',
				tempurl3='207.',
				tempurl4='132:8088';
			$.ajax({
					url:"http://"+tempurl1+tempurl2+tempurl3+tempurl4+"/yttx-public-api/address/get",
					dataType:'JSON',
					method:'post',
					data:{
						parentCode:id===''?86:id,
						adminId:decodeURIComponent(logininfo.param.adminId),
						token:decodeURIComponent(logininfo.param.token),
						grade:decodeURIComponent(logininfo.param.grade)
					}
				})
				.done(function(resp){
					var code=parseInt(resp.code,10);
					if(code!==0){
						console.log(resp.message);
						return false;
					}
					/*是否是正确的返回数据*/
					var res=resp.result;
					if(!res){
						return false;
					}
					var list=res.list;

					if(!list){
						return false;
					}

					var len=list.length,
						str='',
						$wrap='',
						i=0;

					if(type==='province'){
						$wrap=$admin_province;
					}else if(type==='city'){
						$wrap=$admin_city;
					}else if(type==='country'){
						$wrap=$admin_country;
					}

					if(len!==0){
						if(sel!==''){
							for(i;i<len;i++){
								var codes=list[i]["code"];
								if(codes===sel){
									str+='<option selected value="'+codes+'">'+list[i]["name"]+'</option>';
								}else{
									str+='<option value="'+codes+'">'+list[i]["name"]+'</option>';
								}
							}
						}else{
							for(i;i<len;i++){
								if(i===0){
									sel=list[i]["code"];
									str+='<option selected value="'+list[i]["code"]+'">'+list[i]["name"]+'</option>';
								}else{
									str+='<option value="'+list[i]["code"]+'">'+list[i]["name"]+'</option>';
								}
							}
						}
						$(str).appendTo($wrap.html(''));

						if(sel!==''&&getflag){
							if(type==='province'){
								getAddress(sel,'','city',true);
							}else if(type==='city'){
								getAddress(sel,'','country');
							}
						}
					}
				})
				.fail(function(resp){
					console.log(resp.message);
				});
		}
	});


})(jQuery);