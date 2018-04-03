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
			var module_id='yttx-setting-pwd'/*模块id，主要用于本地存储传值*/,
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
				$admin_password=$('#admin_password'),
				$admin_phone=$('#admin_phone'),
				$admin_newPassword=$('#admin_newPassword'),
				$toggle_display_btn=$('#toggle_display_btn'),
				$admin_renewPassword=$('#admin_renewPassword'),
				admin_pwd_form=document.getElementById('admin_pwd_form'),
				$admin_pwd_form=$(admin_pwd_form),
				resetform=null;


			/*加载数据*/
			getSettingData();


			/*绑定显示新密码*/
			$toggle_display_btn.on('click',function(){
				var $this=$(this),
					isactive=$this.hasClass('toggle-display-btnactive');
				if(isactive){
					$this.removeClass('toggle-display-btnactive');
					$admin_newPassword.attr({
						'type':'password'
					});
				}else{
					$this.addClass('toggle-display-btnactive');
					$admin_newPassword.attr({
						'type':'text'
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
							$.ajax({
								url:"http://10.0.5.226:8082/yttx-providerbms-api/user/password/update",
								dataType:'JSON',
								method:'post',
								data:{
									userId:decodeURIComponent(logininfo.param.userId),
									token:decodeURIComponent(logininfo.param.token),
									providerId:decodeURIComponent(logininfo.param.providerId),
									password:$admin_password.val(),
									newPassword:$admin_newPassword.val()
								}
							}).done(function(resp){
								var code=parseInt(resp.code,10);
								if(code!==0){
									console.log(resp.message);
									dia.content('<span class="g-c-bs-warning g-btips-warn">修改密码失败</span>').show();
									setTimeout(function () {
										dia.close();
									},2000);
									return false;
								}

								dia.content('<span class="g-c-bs-success g-btips-succ">修改密码成功</span>').show();
								setTimeout(function () {
									dia.close();
								},2000);
							}).fail(function(resp){
								console.log('error');
							});

						}
					});
				}


				/*提交验证*/
				if(resetform===null){
					resetform=$admin_pwd_form.validate(form_opt);
				}

			}



		}


		/*获取*/
		function getSettingData(){
			$.ajax({
				url:"http://10.0.5.226:8082/yttx-providerbms-api/user/password/info",
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
						public_tool.clear();
						public_tool.clearCacheData();
						public_tool.loginTips();
						return false;
					}
					console.log(resp.message);
					return false;
				}


				var result=resp.result;
				if(result&&!$.isEmptyObject(result)){
					for(var i in result){
						switch (i){
							case 'password':
								$admin_password.val(result[i]);
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
		};

	});



})(jQuery);