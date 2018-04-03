/*admin_member:成员设置*/
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
				datatype:'json'
			});



			/*dom引用和相关变量定义*/
			var module_id='yttx-setting-account'/*模块id，主要用于本地存储传值*/,
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
				sureObj=public_tool.sureDialog(dia)/*回调提示对象*/,
				setSure=new sureObj(),
				$admin_nickName=$('#admin_nickName'),
				$admin_phone=$('#admin_phone'),
				$admin_consigneeName=$('#admin_consigneeName'),
				$admin_consigneePhone=$('#admin_consigneePhone'),
				$admin_addresstoggle=$('#admin_addresstoggle'),
				$admin_province=$('#admin_province'),
				$admin_city=$('#admin_city'),
				$admin_country=$('#admin_country'),
				$admin_address_list=$('#admin_address_list'),
				$admin_address_wrap=$('#admin_address_wrap'),
				$admin_address=$('#admin_address'),
				$admin_isDefault=$('#admin_isDefault'),
				$admin_nickName_btn=$('#admin_nickName_btn'),
				admin_address_form=document.getElementById('admin_address_form'),
				$admin_address_form=$(admin_address_form),
				resetform=null;


			/*加载数据*/
			getSettingData();


			/*加载地址*/
			getAddress(86,'','province',true);


			/*绑定修改昵称*/
			$admin_nickName_btn.on('click',function(){
					var tempnickname=$admin_nickName.val();
					if(tempnickname===''){
						dia.content('<span class="g-c-bs-warning g-btips-warn">昵称不能为空</span>').show();
						setTimeout(function () {
							dia.close();
						},2000);
						return false;
					}

				$.ajax({
					url:"http://112.74.207.132:8082/yttx-providerbms-api/user/account/update",
					dataType:'JSON',
					method:'post',
					data:{
						userId:decodeURIComponent(logininfo.param.userId),
						providerId:decodeURIComponent(logininfo.param.providerId),
						token:decodeURIComponent(logininfo.param.token),
						nickName:tempnickname
					}
				}).done(function(resp){
					var code=parseInt(resp.code,10);
					if(code!==0){
						dia.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||'修改 "昵称" 失败')+'</span>').show();
						setTimeout(function () {
							dia.close();
						},2000);
						console.log(resp.message);
						return false;
					}
					dia.content('<span class="g-c-bs-success g-btips-succ">修改 "昵称" 成功</span>').show();
					setTimeout(function () {
						dia.close();
					},2000);
				}).fail(function(resp){
					dia.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||'修改 "昵称" 失败')+'</span>').show();
					setTimeout(function () {
						dia.close();
					},2000);
					console.log('error');
				});


			});


			/*格式化手机号*/
			$admin_consigneePhone.on('keyup',function(){
				var phoneno=this.value.replace(/\D*/g,'');
				if(phoneno==''){
					this.value='';
					return false;
				}
				this.value=public_tool.phoneFormat(this.value);
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


			/*切换添加地址*/
			$admin_addresstoggle.on('click',function(){
				if($admin_address_wrap.hasClass('g-d-hidei')){
					$admin_address_wrap.removeClass('g-d-hidei');
					$admin_addresstoggle.html('-&nbsp;取消');

					/*重置表单*/
					if(resetform!==null){
						resetform.resetForm();
					}
					admin_address_form.reset();
				}else{
					$admin_address_wrap.addClass('g-d-hidei');
					$admin_addresstoggle.html('+&nbsp;添加');
				}
			});


			/*绑定地址操作*/
			$admin_address_list.on('click','li',function(e){
				e.stopPropagation();
				e.preventDefault();
				var target= e.target,
					node=target.nodeName.toLowerCase(),
					$this,
					type='active',
					id=null,
					$parent;

				if(node==='li'){
					type='active';
					$this=$(target);
					id=$this.attr('data-id');
				}else if(node==='label'){
					type='active';
					$this=$(target).parent();
					id=$this.attr('data-id');
				}else if(node==='span'){
					type='delete';
					$this=$(target);
					$parent=$this.parent();
					id=$parent.attr('data-id');
				}


				if(type==='active'){
					/*切换默认地址操作*/
					var isactive=$this.hasClass('address-active');
					if(isactive){
						return false;
					}else{
						/*to do*/
						$.ajax({
							url:"http://112.74.207.132:8082/yttx-providerbms-api/receiptaddress/default/set",
							dataType:'JSON',
							method:'post',
							data:{
								userId:decodeURIComponent(logininfo.param.userId),
								providerId:decodeURIComponent(logininfo.param.providerId),
								token:decodeURIComponent(logininfo.param.token),
								isDefault:1,
								id:id
							}
						}).done(function(resp){
							var code=parseInt(resp.code,10);
							if(code!==0){
								console.log(resp.message);
								dia.content('<span class="g-c-bs-warning g-btips-warn">设置默认地址失败</span>').show();
								setTimeout(function () {
									dia.close();
								},2000);
								return false;
							}
							$this.addClass('address-active').siblings().removeClass('address-active')
						}).fail(function(resp){
							console.log('error');
							dia.content('<span class="g-c-bs-warning g-btips-warn">设置默认地址失败</span>').show();
							setTimeout(function () {
								dia.close();
							},2000);
						});
					}
				}else if(type==='delete'){
					if(!id||id===null){
						dia.content('<span class="g-c-bs-warning g-btips-warn">数据不正确</span>').show();
						setTimeout(function () {
							dia.close();
						},2000);
						return false;
					}

					/*删除操作*/
					setSure.sure('delete',function(cf){
						/*to do*/
						$.ajax({
							url:"http://112.74.207.132:8082/yttx-providerbms-api/receiptaddress/delete",
							dataType:'JSON',
							method:'post',
							data:{
								userId:decodeURIComponent(logininfo.param.userId),
								providerId:decodeURIComponent(logininfo.param.providerId),
								token:decodeURIComponent(logininfo.param.token),
								id:id
							}
						}).done(function(resp){
							var code=parseInt(resp.code,10);
							if(code!==0){
								console.log(resp.message);
								cf.dia.content('<span class="g-c-bs-warning g-btips-warn">删除地址失败</span>').show();
								setTimeout(function(){
									cf.dia.close();
								},2000);
								return false;
							}

							/*请求成功执行相应交互*/
							cf.dia.content('<span class="g-c-bs-success g-btips-succ">删除地址成功</span>').show();
							setTimeout(function(){
								cf.dia.close();
							},2000);

							$parent.remove();

						}).fail(function(resp){
							console.log('error');
							cf.dia.content('<span class="g-c-bs-warning g-btips-warn">删除地址失败</span>').show();
							setTimeout(function(){
								cf.dia.close();
							},2000);
						});
					});
				}
			});



			/*绑定添加地址*/
			/*表单验证*/
			if($.isFunction($.fn.validate)) {
				/*配置信息*/
				var form_opt={},
					formcache=public_tool.cache;

				if(formcache.form_opt_0){
					$.extend(true,form_opt,formcache.form_opt_0,{
						submitHandler: function(form){
							var active=$admin_isDefault.is(':checked')?1:0,
								$province=$admin_province.find(':selected'),
								$city=$admin_city.find(':selected'),
								$country=$admin_country.find(':selected'),
								detailed=$admin_address.val(),
								name=$admin_consigneeName.val(),
								phone=public_tool.trims($admin_consigneePhone.val());

							$.ajax({
								url:"http://112.74.207.132:8082/yttx-providerbms-api/receiptaddress/add",
								dataType:'JSON',
								method:'post',
								data:{
									userId:decodeURIComponent(logininfo.param.userId),
									token:decodeURIComponent(logininfo.param.token),
									providerId:decodeURIComponent(logininfo.param.providerId),
									consigneeName:name,
									consigneePhone:phone,
									detailedAddress:detailed,
									province:$province.val(),
									city:$city.val(),
									county:$country.val(),
									isDefault:active
								}
							}).done(function(resp){
								var code=parseInt(resp.code,10);
								if(code!==0){
									console.log(resp.message);
									dia.content('<span class="g-c-bs-warning g-btips-warn">添加地址失败</span>').show();
									setTimeout(function () {
										dia.close();
									},2000);
									return false;
								}

								var id=resp.result;
								if(id){
									dia.content('<span class="g-c-bs-success g-btips-succ">添加地址成功</span>').show();
									setTimeout(function () {
										dia.close();
									},2000);
									if(active===1){
										$admin_address_list.find('li').each(function(){
											$(this).removeClass('address-active');
										});
										$admin_address_list.append($('<li class="address-active" data-id="' + id + '"><label>'+$province.html()+$city.html()+$country.html()+detailed+'</label>,<label>'+name+'</label>,<label>'+phone+'</label><span class="btn btn-sm btn-white g-br2">-删除</span></li>'));
									}else{
										$('<li data-id="' + id + '"><label>'+$province.html()+$city.html()+$country.html()+detailed+'</label>,<label>'+name+'</label>,<label>'+phone+'</label><span class="btn btn-sm btn-white g-br2">-删除</span></li>').appendTo($admin_address_list);
									}
								}else{
									dia.content('<span class="g-c-bs-warning g-btips-warn">添加地址失败</span>').show();
									setTimeout(function () {
										dia.close();
									},2000);
									return false;
								}
							}).fail(function(resp){
								console.log('error');
							});

						}
					});
				}


				/*提交验证*/
				if(resetform===null){
					resetform=$admin_address_form.validate(form_opt);
				}

			}



		}


		/*获取*/
		function getSettingData(){
			if(!public_tool.isSameDomain("http://112.74.207.132:8082")){
				return false;
			}
			$.ajax({
				url:"http://112.74.207.132:8082/yttx-providerbms-api/user/account/info",
				dataType:'JSON',
				method:'post',
				data:{
					providerId:decodeURIComponent(logininfo.param.providerId),
					userId:decodeURIComponent(logininfo.param.userId),
					token:decodeURIComponent(logininfo.param.token)
				}
			}).done(function(resp){
				var code=parseInt(resp.code,10);
				if(code!==0){
					if(code===999){
						/*清空缓存*/
						public_tool.loginTips(function () {
							public_tool.clear();
							public_tool.clearCacheData();
						});
						return false;
					}
					console.log(resp.message);
					return false;
				}


				var result=resp.result;
				if(result&&!$.isEmptyObject(result)){
					for(var i in result){
						switch (i){
							case 'nickName':
								$admin_nickName.val(result[i]);
								break;
							case 'receiptaddress':
								renderAddress(result[i]);
								break;
							case 'phone':
								$admin_phone.html(public_tool.phoneFormat(result[i]));
								break;
						}
					}
				}


			}).fail(function(resp){
				console.log('error');
			});
		}


		/*渲染地址*/
		function renderAddress(data){
			var tempaddress=data,
				len=tempaddress.length,
				j= 0,
				str='';
			if(len!==0){
				for(j;j<len;j++){
					var addressitem=tempaddress[j],
						active=parseInt(addressitem['isDefault'],10),
						detail=addressitem["address"];
					if(active===0){
						str+='<li data-id="'+addressitem['id']+'"><label>'+detail+'</label>,<label>'+addressitem["consigneeName"]+'</label>,<label>'+addressitem["consigneePhone"]+'</label><span class="btn btn-sm btn-white g-br2">-删除</span></li>';
					}else{
						str+='<li class="address-active" data-id="'+addressitem['id']+'"><label>'+detail+'</label>,<label>'+addressitem["consigneeName"]+'</label>,<label>'+addressitem["consigneePhone"]+'</label><span class="btn btn-sm btn-white g-br2">-删除</span></li>';
					}
				}
				$(str).appendTo($admin_address_list.html(''));
			}else {
				$admin_address_list.html('');
			}
		}


		/*地址编码解析成地址*/
		function resolveAddress(data) {
			var tempaddress=data,
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
		}
		
		

		/*查询地址(上级id，选中值，查询的地域等级，是否级联查询)*/
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
						parentCode:id===''?86:id
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