/*admin_member:成员设置*/
(function($){
	'use strict';
	$(function(){
		/*初始化数据*/
		if(public_tool.initMap.isrender){
			/*菜单调用*/
			var logininfo=public_tool.initMap.loginMap;
			public_tool.loadSideMenu(public_vars.$mainmenu,public_vars.$main_menu_wrap,{
				url:'http://112.74.207.132:8082/mall-agentbms-api/module/menu',
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
				warehouseadd_power=public_tool.getKeyPower('mall-warehouse-add',powermap);

			
			/*dom引用和相关变量定义*/
			var module_id='mall-warehouse-add'/*模块id，主要用于本地存储传值*/,
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
				admin_warehouseadd_form=document.getElementById('admin_warehouseadd_form'),
				$admin_theme=$('#admin_theme'),
				$admin_warehouseadd_form=$(admin_warehouseadd_form),
				$admin_id=$('#admin_id'),
				$admin_username=$('#admin_username'),
				$admin_name=$('#admin_name'),
				$admin_pwd=$('#admin_pwd'),
				$admin_fullName=$('#admin_fullName'),
				$admin_shortName=$('#admin_shortName'),
				$admin_whCode=$('#admin_whCode'),
				$admin_area=$('#admin_area'),
				$admin_adscriptionRegionCodeNames=$('#admin_adscriptionRegionCodeNames'),
				$admin_status=$('#admin_status'),
				$admin_remark=$('#admin_remark'),
				$admin_action=$('#admin_action'),
				$admin_province=$('#admin_province'),
				$admin_city=$('#admin_city'),
				$admin_country=$('#admin_country'),
				$admin_address=$('#admin_address'),
				$admin_linkman=$('#admin_linkman'),
				$admin_cellphone=$('#admin_cellphone'),
				$admin_telephone=$('#admin_telephone'),
				resetform0=null;


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


			/*绑定归属地高亮*/
			$admin_adscriptionRegionCodeNames.on('click',function (e) {
				var target=e.target,
					nodename=target.nodeName.toLowerCase(),
					$this,
					$input,
					chk=false;

				if(nodename==='div'){
					return false;
				}else if(nodename==='label'){
					$this=$(target);
					$input=$this.find('input');
				}else if(nodename==='input'){
					$input=$(target);
					$this=$input.parent();
				}
				chk=$input.is(':checked');
				if(chk){
					$this.addClass('checkbox-active');
				}else{
					$this.removeClass('checkbox-active');
				}
			});



			/*获取编辑缓存*/
			admin_warehouseadd_form.reset();
			var edit_cache=public_tool.getParams('mall-warehouse-add');
			if(edit_cache){
				/*判断权限*/
				if(warehouseadd_power){
					$admin_action.removeClass('g-d-hidei');
				}else{
					$admin_action.addClass('g-d-hidei');
				}
				/*查询数据*/
				if(typeof edit_cache==='object'){
					setWarehouseData(edit_cache['id']);
				}else{
					setWarehouseData(edit_cache);
				}
				//public_tool.removeParams('mall-warehouse-add');
			}else{
				/*判断权限*/
				if(warehouseadd_power){
					$admin_action.removeClass('g-d-hidei');
				}else{
					$admin_action.addClass('g-d-hidei');
				}
				/*地址*/
				getAddress(86,'','province',true);
				/*归属地*/
				getRegion({
					id:86
				},$admin_adscriptionRegionCodeNames,'adscriptionRegionCodeNames');
			}



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
							formtype='addwarehouse';
						}
						$.extend(true,(function () {
							if(formtype==='addwarehouse'){
								return form_opt0;
							}
						}()),(function () {
							if(formtype==='addwarehouse'){
								return formcache.form_opt_0;
							}
						}()),{
							submitHandler: function(form){
								var setdata={};

								$.extend(true,setdata,basedata);

								if(formtype==='addwarehouse'){

									$.extend(true,setdata,{
										username:$admin_username.val(),
										name:$admin_name.val(),
										fullName:$admin_fullName.val(),
										shortName:$admin_shortName.val(),
										whCode:$admin_whCode.val(),
										area:$admin_area.val(),
										adscriptionRegionCodeNames:(function () {
											var rlist=[];
											$admin_adscriptionRegionCodeNames.find(':checked').each(function () {
												var $this=$(this),
													value=$this.val(),
													name=$this.attr('data-name');
												rlist.push(value+'#'+name);
											});
											return JSON.stringify(rlist);
										}()),
										password:$admin_pwd.val()||'',
										remark:$admin_remark.val(),
										status:$admin_status.find(':selected').val(),
										province:$admin_province.find(':selected').val(),
										city:$admin_city.find(':selected').val(),
										country:$admin_country.find(':selected').val(),
										address:$admin_address.val(),
										linkman:$admin_linkman.val(),
										cellphone:public_tool.trims($admin_cellphone.val()),
										telephone:$admin_telephone.val()
									});


                                    var id=$admin_id.val(),
										actiontype='';
                                    if(id!==''){
										/*修改操作*/
                                        setdata['id']=id;
										actiontype='修改';
                                    }else{
										/*新增操作*/
										actiontype='新增';
                                    }
									config['url']="http://112.74.207.132:8082/mall-agentbms-api/warehouse/addupdate";
									config['data']=setdata;
								}

								$.ajax(config).done(function(resp){
									var code;
									if(formtype==='addwarehouse'){
										code=parseInt(resp.code,10);
										if(code!==0){
											dia.content('<span class="g-c-bs-warning g-btips-warn">'+actiontype+'分仓失败</span>').show();
											return false;
										}else{
											dia.content('<span class="g-c-bs-success g-btips-succ">'+actiontype+'分仓成功</span>').show();
											if(actiontype==='修改'){
												public_tool.removeParams('mall-warehouse-add');
											}
										}
									}

									setTimeout(function () {
										dia.close();
										if(formtype==='addwarehouse'&&code===0){
											/*页面跳转*/
											location.href='mall-warehouse-list.html';
										}
									},2000);
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
					resetform0=$admin_warehouseadd_form.validate(form_opt0);
				}
			}



		}


		/*查询地址*/
		function getAddress(id,sel,type,getflag,wraps) {
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
						i=0,
						mode='select',
						name='';

					if(wraps){
						$wrap=wraps.$wrap;
						mode=wraps.mode;
						name=wraps.name||'';
					}else{
						if(type==='province'){
							$wrap=$admin_province;
						}else if(type==='city'){
							$wrap=$admin_city;
						}else if(type==='country'){
							$wrap=$admin_country;
						}
					}


					if(len!==0){
						if(sel!==''){
							for(i;i<len;i++){
								var codes=list[i]["code"];
								if(codes===sel){
									if(mode==='select'){
										str+='<option selected value="'+codes+'">'+list[i]["name"]+'</option>';
									}else if(mode==='checkbox'){
										str+='<label class="checkbox-active">'+list[i]["name"]+':<input data-name="'+list[i]["name"]+'" name="'+name+'" type="checkbox" checked value="'+codes+'" /></label>';
									}
								}else{
									if(mode==='select'){
										str+='<option value="'+codes+'">'+list[i]["name"]+'</option>';
									}else if(mode==='checkbox'){
										str+='<label>'+list[i]["name"]+':<input data-name="'+list[i]["name"]+'" name="'+name+'" type="checkbox" value="'+codes+'" /></label>';
									}
								}
							}
						}else{
							for(i;i<len;i++){
								if(i===0){
									sel=list[i]["code"];
									if(mode==='select'){
										str+='<option selected value="'+list[i]["code"]+'">'+list[i]["name"]+'</option>';
									}else if(mode==='checkbox'){
										str+='<label class="checkbox-active">'+list[i]["name"]+':<input data-name="'+list[i]["name"]+'" name="'+name+'" type="checkbox" checked value="'+list[i]["code"]+'" /></label>';
									}
								}else{
									if(mode==='select'){
										str+='<option value="'+list[i]["code"]+'">'+list[i]["name"]+'</option>';
									}else if(mode==='checkbox'){
										str+='<label>'+list[i]["name"]+':<input  data-name="'+list[i]["name"]+'" name="'+name+'" type="checkbox" value="'+list[i]["code"]+'" /></label>';
									}
								}
							}
						}
						$(str).appendTo($wrap.html(''));

						if(sel!==''&&getflag){
							if(type==='province'){
								getAddress(sel,'','city',true);
							}else if(type==='city'){
								getAddress(sel,'','country',false);
							}
						}
					}
				})
				.fail(function(resp){
					console.log(resp.message);
				});
		}


		/*查询归属地*/
		function getRegion(idobj,wrap,name) {
			var parentCode=idobj.id,
				warehouseId=idobj.warehouseId,
				isedit=false,
				params={
					roleId:decodeURIComponent(logininfo.param.roleId),
					adminId:decodeURIComponent(logininfo.param.adminId),
					token:decodeURIComponent(logininfo.param.token),
					grade:decodeURIComponent(logininfo.param.grade),
					parentCode:parentCode===''?86:parentCode
				};



			if(warehouseId&&typeof warehouseId!=='undefined'){
				isedit=true;
				params['warehouseId']=warehouseId;
			}


			$.ajax({
					url:"http://112.74.207.132:8082/mall-agentbms-api/adscriptionregions/available",
					dataType:'JSON',
					method:'post',
					data:params
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
						i=0,
						isSelected=0;

					if(len!==0){
						if(isedit){
							for(i;i<len;i++){
								isSelected=parseInt(list[i]["isSelected"],10);
								if(isSelected===0){
									str+='<label>'+list[i]["name"]+'<input  data-name="'+list[i]["name"]+'" name="'+name+'" type="checkbox" value="'+list[i]["code"]+'" /></label>';
								}else if(isSelected===1){
									str+='<label class="checkbox-active">'+list[i]["name"]+'<input  data-name="'+list[i]["name"]+'" name="'+name+'" type="checkbox" checked value="'+list[i]["code"]+'" /></label>';
								}
							}
						}else{
							for(i;i<len;i++){
								isSelected=parseInt(list[i]["isSelected"],10);
								if(isSelected===0){
									str+='<label>'+list[i]["name"]+'<input  data-name="'+list[i]["name"]+'" name="'+name+'" type="checkbox" value="'+list[i]["code"]+'" /></label>';
								}
							}
						}
						$(str).appendTo(wrap.html(''));
					}
				})
				.fail(function(resp){
					console.log(resp.message);
				});
		}


		/*修改时设置值*/
		function setWarehouseData(id) {
			if(!id){
				return false;
			}


			$.ajax({
					url:"http://112.74.207.132:8082/mall-agentbms-api/warehouse/detail",
					dataType:'JSON',
					method:'post',
					data:{
						"id":id,
						"adminId":decodeURIComponent(logininfo.param.adminId),
						"token":decodeURIComponent(logininfo.param.token),
						"grade":decodeURIComponent(logininfo.param.grade)
					}
				})
				.done(function(resp){
					var code=parseInt(resp.code,10);
					if(code!==0){
						console.log(resp.message);
						if(code===999){
							public_tool.loginTips(function () {
								public_tool.clear();
								public_tool.clearCacheData();
							});
						}
						return false;
					}
					/*是否是正确的返回数据*/
					var list=resp.result;

					if(!list){
						return false;
					}else{
						var list=list.view;
						if(!list){
							return false;
						}
					}

					if(!$.isEmptyObject(list)){
						$admin_action.html('修改');
						$admin_theme.html('修改分仓');
						$admin_id.val(id);
						for(var j in list){
							switch(j){
								case 'username':
									$admin_username.val(list[j]).prop({
										'readonly':true
									});
									break;
								case 'name':
									$admin_name.val(list[j]);
									break;
								case 'whCode':
									$admin_whCode.val(list[j]);
									break;
								case 'area':
									$admin_area.val(list[j]);
									break;
								case 'fullName':
									$admin_fullName.val(list[j]);
									break;
								case 'shortName':
									$admin_shortName.val(list[j]);
									break;
								case 'remark':
									$admin_remark.val(list[j]);
									break;
								case 'linkman':
									$admin_linkman.val(list[j]);
									break;
								case 'cellphone':
									$admin_cellphone.val(public_tool.phoneFormat(list[j]));
									break;
								case 'telephone':
									$admin_telephone.val(list[j]);
									break;
								case 'province':
									getAddress('86',list[j],'province',false);
									break;
								case 'city':
									getAddress(list['province'],list[j],'city',false);
									break;
								case 'country':
									getAddress(list['city'],list[j],'country',false);
									break;
								case 'address':
									$admin_address.val(list[j]);
									break;
								case 'status':
									var status=list[j];
									$admin_status.find('option').each(function () {
										var $this=$(this),
											value=parseInt($this.val(),10);
										if(value===status){
											$this.prop({
												'selected':true
											});
											return false;
										}
									});
									break;
								case 'adscriptionRegionList':
									/*归属地*/
									if(list[j]){
										getRegion({
											id:86,
											warehouseId:id
										},$admin_adscriptionRegionCodeNames,'adscriptionRegionCodeNames');
									}else{
										getRegion({
											id:86
										},$admin_adscriptionRegionCodeNames,'adscriptionRegionCodeNames');
									}
									break;

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