/*admin_member:成员设置*/
(function($,KE){
	'use strict';
	$(function(){
		/*初始化数据*/
		if(public_tool.initMap.isrender){
			/*菜单调用*/
			var logininfo=public_tool.initMap.loginMap;
			public_tool.loadSideMenu(public_vars.$mainmenu,public_vars.$main_menu_wrap,{
				url:'http://10.0.5.226:8082/mall-buzhubms-api/module/menu',
				async:false,
				type:'post',
				param:{
					roleId:decodeURIComponent(logininfo.param.roleId),
					adminId:decodeURIComponent(logininfo.param.adminId),
					grade:decodeURIComponent(logininfo.param.grade),
					token:decodeURIComponent(logininfo.param.token)
				},
				datatype:'json'
			});

			

			/*dom引用和相关变量定义*/
			var module_id='mall-user-addnotice'/*模块id，主要用于本地存储传值*/,
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
				admin_addnotice_form=document.getElementById('admin_addnotice_form'),
				$admin_addnotice_form=$(admin_addnotice_form),
				$admin_type=$('#admin_type'),
				$member_wrap=$('#member_wrap'),
				$admin_member=$('#admin_member'),
				$member_tip=$('#member_tip'),
				$admin_content=$('#admin_content'),
				resetform0=null;


			/*绑定切换发送类型*/
			$admin_type.find('input').on('change',function () {
				var $this=$(this),
					value=parseInt($this.val(),10);

				if(value===1){
					$member_wrap.removeClass('g-d-hidei');
				}else{
					$member_wrap.addClass('g-d-hidei');
				}

			});


			/*请求会员列表*/
			searchMemberData();


			/*编辑器调用并重置表单*/
			var editor=KE.create("#admin_content",{
				minHeight:'400px',
				height:'400px',
				filterMode :false,
				resizeType:1,/*改变外观大小模式*/
				bodyClass:"ke-admin-wrap",
				items:[
					'source', '|', 'undo', 'redo', '|', 'preview', 'print', 'template', 'code', 'cut', 'copy', 'paste',
					'plainpaste', 'wordpaste', '|', 'justifyleft', 'justifycenter', 'justifyright',
					'justifyfull', 'insertorderedlist', 'insertunorderedlist', 'indent', 'outdent', 'subscript',
					'superscript', 'clearhtml', 'quickformat', 'selectall', '|', 'fullscreen', '/',
					'formatblock', 'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold',
					'italic', 'underline', 'strikethrough', 'lineheight', 'removeformat', '|',
					'table', 'hr', 'emoticons', 'baidumap', 'pagebreak',
					'anchor', 'link', 'unlink', '|', 'about'
				],
				afterBlur:function(){
					/*失去焦点的回调*/
					this.sync();
				}
			});
			editor.html('');
			editor.sync();
			admin_addnotice_form.reset();
			$member_wrap.addClass('g-d-hidei');


			/*绑定添加地址*/
			/*表单验证*/
			if($.isFunction($.fn.validate)) {
				/*配置信息*/
				var form_opt0={},
					formcache=public_tool.cache,
					basedata={
						roleId:decodeURIComponent(logininfo.param.roleId),
						adminId:decodeURIComponent(logininfo.param.adminId),
						grade:decodeURIComponent(logininfo.param.grade),
						token:decodeURIComponent(logininfo.param.token)
					};


				if(formcache.form_opt_0){
					$.each([formcache.form_opt_0],function(index){
						var formtype,
						config={
							dataType:'JSON',
							method:'post'
						};
						if(index===0){
							formtype='addnotice';
						}
						$.extend(true,(function () {
							if(formtype==='addnotice'){
								return form_opt0;
							}
						}()),(function () {
							if(formtype==='addnotice'){
								return formcache.form_opt_0;
							}
						}()),{
							submitHandler: function(form){
								var setdata={};

								$.extend(true,setdata,basedata);

								if(formtype==='addnotice'){

									/*同步编辑器*/
									editor.sync();
									$.extend(true,setdata,{
										content:$admin_content.val()
									});

									var type=parseInt($admin_type.find(':checked').val(),10);
									setdata['sendType']=type;
									if(type===1){
										var memberList=getMemberData();
										if(memberList===null){
											$member_tip.html('请选择发送会员');
											$('html,body').scrollTop($admin_member.offset().top - 200);
											setTimeout(function () {
												$member_tip.html('');
											},3000);
											return false;
										}
										setdata['userIds']=memberList;
									}else{
										delete setdata['userIds'];
									}

									/*新增操作*/
									config['url']="http://10.0.5.226:8082/mall-buzhubms-api/usernotice/add";
									config['data']=setdata;
								}

								$.ajax(config).done(function(resp){
									var code;
									if(formtype==='addnotice'){
										code=parseInt(resp.code,10);
										if(code!==0){
											dia.content('<span class="g-c-bs-warning g-btips-warn">发送通知失败</span>').show();
											return false;
										}else{
											dia.content('<span class="g-c-bs-success g-btips-succ">发送通知成功</span>').show();
										}
									}
									setTimeout(function () {
										dia.close();
										editor.html('');
										editor.sync();
										admin_addnotice_form.reset();
										$member_wrap.addClass('g-d-hidei');
										location.href='bzw-user-notice.html';
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
					resetform0=$admin_addnotice_form.validate(form_opt0);
				}
			}



		}



		/*查询会员*/
		function searchMemberData() {
			$.ajax({
					url:"http://10.0.5.226:8082/mall-buzhubms-api/user/list",
					dataType:'JSON',
					method:'post',
					data:{
						roleId:decodeURIComponent(logininfo.param.roleId),
						adminId:decodeURIComponent(logininfo.param.adminId),
						grade:decodeURIComponent(logininfo.param.grade),
						token:decodeURIComponent(logininfo.param.token)
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
					var result=resp.result;

					if(!result){
						return false;
					}

					var list=result.list;
					if(!list){
						return false;
					}

					/*测试代码,正式环境去掉*/
					var i=0,
						str='',
						len=list.length;
					for(i;i<len;i++){
						var useritem=list[i];
						str+='<label>'+useritem["nickName"]+'&nbsp;:&nbsp;\
								<input type="checkbox" value="'+useritem["id"]+'" name="username" />\
							</label>';
					}
					$(str).appendTo($admin_member.html(''));
				})
				.fail(function(resp){
					console.log(resp.message);
				});

		}


		/*获取会员列表*/
		function getMemberData() {
			var arr=[];
			$admin_member.find(':checked').each(function () {
				arr.push(this.value);
			});
			return arr.length===0?null:arr.join(',');
		}


	});



})(jQuery,KindEditor);