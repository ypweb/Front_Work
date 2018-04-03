/*login*/
(function($){
	$(function(){
		if(public_tool.initMap.isrender){

			/*如果存在缓存，则删除缓存*/
			public_tool.clear();
			public_tool.clearCacheData();

			//dom节点引用或者其他变量定义
			var $findpwdform=$('#findpwd'),
				$username=$('#username'),
				$pwd=$('#passwd'),
				$repwd=$('#repasswd');
			error_tpl='<div class="alert alert-danger">\
								<button type="button" class="close" data-dismiss="alert">\
									<span aria-hidden="true">&times;</span>\
									<span class="sr-only">Close</span>\
								</button>\$info\
							</div>';

			//初始化效果
			setTimeout(function(){
				$(".fade-in-effect").addClass('in');
			},1);





			//异步校验
			$findpwdform.validate({
				rules: {
					username: {
						required: true
					},
					passwd: {
						required: true,
						minlength:6
					},
					repasswd:{
						required:true,
						equalTo:$pwd
					}
				},

				messages: {
					username: {
						required: '请输入用户名'
					},
					passwd: {
						required: '请输入新密码',
						minlength:'密码必须超过6位字符'
					},
					repasswd:{
						required:'确认密码不能为空',
						equalTo:'确认密码必须与新密码一致'
					}
				},

				//提交表单
				submitHandler: function(form){
					show_loading_bar(70);

					var opts = {
						"closeButton": true,
						"debug": false,
						"positionClass": "toast-top-full-width",
						"onclick": null,
						"showDuration": "300",
						"hideDuration": "1000",
						"timeOut": "5000",
						"extendedTimeOut": "1000",
						"showEasing": "swing",
						"hideEasing": "linear",
						"showMethod": "fadeIn",
						"hideMethod": "fadeOut"
					};

					var basedomain='http://10.0.5.226:8082',
						basepathname="/mall-agentbms-api/sysuser/login";
					$.ajax({
						url:basedomain+basepathname,
						method: 'POST',
						dataType: 'json',
						async:false,
						data: {
							adminId:$username.val(),
							password:$pwd.val(),
							newPassword:$repwd.val()
						}
					}).done(function(resp){
						var code=parseInt(resp.code,10),
							result=resp.result;


						//显示错误
						if(code!==0){
							$error_wrap.html(error_tpl.replace('$info',resp.message));
							$error_wrap.find('.alert').hide().slideDown();
							$pwd.select();
							return false;
						}


						$error_wrap.html(error_tpl.replace('$info',resp.message));
						$error_wrap.find('.alert').hide().slideDown();


						//移除提示的错误信息
						$error_wrap.find('.alert').slideUp('fast');


						//放入本地存储
						public_tool.setParams('login_module',{
							'isLogin':true,
							'datetime':moment().format('YYYY-MM-DD|HH:mm:ss'),
							'reqdomain':basedomain,
							'currentdomain':'',
							'username':(function () {
								var grade=result.grade;
								if(grade===3){
									return $username.val()+'(省级代理)'||'匿名用户';
								}else if(grade===2){
									return $username.val()+'(市级代理)'||'匿名用户';
								}else if(grade===1){
									return $username.val()+'(县级代理)'||'匿名用户';
								}else if(grade===4){
									return $username.val()+'(店长)'||'匿名用户';
								}else if(grade===-1){
									return $username.val()+'(超级管理员)'||'匿名用户';
								}else if(grade===-2){
									return $username.val()+'(默认)'||'匿名用户';
								}else if(grade===-3){
									return $username.val()+'(总代理)'||'匿名用户';
								}else if(grade===-4){
									return $username.val()+'(分仓管理员)'||'匿名用户';
								}
							}()),
							'param':{
								'adminId':encodeURIComponent(result.adminId),
								'token':encodeURIComponent(result.token),
								'roleId':encodeURIComponent(result.roleId),
								'grade':encodeURIComponent(result.grade),
								'sourcesChannel':encodeURIComponent(result.sourcesChannel)
							}
						});



						//调用进度条组件
						show_loading_bar({
							delay: .5,
							pct: 100,
							finish: function(){
								if(resp.flag){
									//成功后跳入主页面
									location.href = '../index.html';
								}
							}
						});


					}).fail(function(){
						//移除提示的错误信息
						$error_wrap.find('.alert').slideUp('fast');
						//显示错误信息
						$error_wrap.html(error_tpl.replace('$info','修改密码失败'));
						$error_wrap.find('.alert').hide().slideDown();
						$pwd.select();
					});
					return false;
				}
			});

			//设置获取焦点
			$findpwdform.find(".form-group:has(.form-control):first .form-control").focus();
		}


	});
})(jQuery);