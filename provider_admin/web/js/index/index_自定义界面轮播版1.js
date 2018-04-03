/*login*/
(function($){
	$(function(){

		if(public_tool.initMap.isrender){
			//dom节点引用或者其他变量定义
			var $loginform=$('#login'),
				$username=$('#username'),
				$pwd=$('#passwd'),
				$validcode=$('#validcode'),
				$validcode_btn=$('#validcode_btn'),
			$error_wrap=$('#error_wrap'),
				error_tpl='<div class="alert alert-danger">\
								<button type="button" class="close" data-dismiss="alert">\
									<span aria-hidden="true">&times;</span>\
									<span class="sr-only">Close</span>\
								</button>\$info\
							</div>';


			//轮播dom节点
			var $slideimg_show=$('#slideimg_show'),
				$slide_tips=$('#slide_tips'),
				$slide_img=$('#slide_img'),
				$slideimg_btn=$('#slideimg_btn');


			//轮播动画
			slide.slideToggle({
				$wrap:$slideimg_show,
				$slide_img:$slide_img,
				$btnwrap:$slideimg_btn,
				$slide_tipwrap:$slide_tips,
				minwidth:640,
				isresize:false,
				size:3,
				times:5000,
				eff_time:500,
				isblur:'g-filter-blur5',
				btn_active:'slidebtn-active'
			});


			//初始化效果
			setTimeout(function(){
				$(".fade-in-effect").addClass('in');
			},1);


			var cacheLogin=public_tool.getParams('login_module');
			if(cacheLogin){
				/*如果存在缓存，则删除缓存*/
				public_tool.clear();
				public_tool.clearCacheData();
			}


			/*获取验证码*/
			getValidCode();


			/*格式化手机号*/
			$username.on('keyup',function(){
				var phoneno=this.value.replace(/\D*/g,'');
				if(phoneno==''){
					this.value='';
					return false;
				}
				this.value=public_tool.phoneFormat(this.value);
			});



			//异步校验
			$loginform.validate({
				rules: {
					username: {
						required: true,
						zh_phone:true
					},
					passwd: {
						required: true,
						minlength:6
					},
					validcode:{
						required: true
					}
				},

				messages: {
					username: {
						required: '请输入手机号',
						zh_phone:'手机号格式不合法'
					},
					passwd: {
						required: '请输入密码',
						minlength:'密码必须超过6位字符'
					},
					validcode:{
						required: '请输入验证码'
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
						basepathname="/yttx-providerbms-api/user/login";
					$.ajax({
						url:basedomain+basepathname,
						method: 'POST',
						dataType: 'json',
						async:false,
						data: {
							loginType:4,
							phone:public_tool.trims($username.val()),
							password:$pwd.val(),
							identifyingCode:$validcode.val()
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
							'username':$username.val()||'匿名用户',
							'param':{
								'userId':encodeURIComponent(result.userId),
								'token':encodeURIComponent(result.token),
								'providerId':encodeURIComponent(result.providerId)
							}
						});

						//调用进度条组件
						show_loading_bar({
							delay: .5,
							pct: 100,
							finish: function(){
								if(code===0){
									//成功后跳入主页面
									location.href = 'setting/yttx-setting-base.html';
								}
							}
						});


					}).fail(function(){
						//移除提示的错误信息
						$error_wrap.find('.alert').slideUp('fast');
						//显示错误信息
						$error_wrap.html(error_tpl.replace('$info','登陆失败请重新登陆'));
						$error_wrap.find('.alert').hide().slideDown();
						$pwd.select();
					});
					return false;

				}
			});



			//设置获取焦点
			$loginform.find(".form-group:has(.form-control):first .form-control").focus();


			/*重新生成验证码*/
			$validcode_btn.on('click',function(){
				getValidCode();
			});

		}



		function getValidCode(){
			var xhr = new XMLHttpRequest();
			xhr.open("post",'http://10.0.5.226:8082/yttx-providerbms-api/user/identifying/code', true);
			xhr.responseType = "blob";
			xhr.onreadystatechange = function() {
				if (this.status == 200) {
					var blob = this.response,
						img = document.createElement("img");

						img.alt='验证码';
					try{
						img.onload = function(e) {
							window.URL.revokeObjectURL(img.src);
						};
						img.src = window.URL.createObjectURL(blob);
					}catch (e){
						console.log('不支持URL.createObjectURL');
					}
					$validcode_btn.html(img);
				}
			};
			xhr.send();
		}

	});
})(jQuery);


