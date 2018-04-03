/*admin_member:成员设置*/
/*admin_member:成员设置*/
(function($,KE){
	'use strict';
	$(function(){

		var table=null/*数据展现*/;

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
			var powermap=public_tool.getPower(),
				contentpublish_power=public_tool.getKeyPower('发布文章',powermap);


			/*dom引用和相关变量定义*/
			var module_id='content_publish'/*模块id，主要用于本地存储传值*/,
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
				dialogObj=public_tool.dialog()/*回调提示对象*/;



			
			/*表单对象*/
			var edit_form=document.getElementById('content_edit_form')/*表单dom*/,
				$content_edit_form=$(edit_form)/*编辑表单*/,
				$edit_cance_btn=$('#edit_cance_btn')/*编辑取消按钮*/,
				$edit_title=$('#edit_title'),
				$content_title=$('#content_title'),/*标题*/
				$content_content=$('#content_content')/*内容*/,
				$publish_wrap=$('#publish_wrap'),
				$content_thumbnail=$('#content_thumbnail')/*缩略图*/,
				$content_typeid=$('#content_typeid')/*所属公司*/;


			/*图片上传对象*/
			var $editor_image_toggle=$('#editor_image_toggle'),
				$editor_image_list=$('#editor_image_list'),
				$editor_image_upload=$('#editor_image_upload'),
				$editor_image_show=$('#editor_image_show'),
				$toggle_edit_btn=$('#toggle_edit_btn'),
				$img_url_upload=$('#img_url_upload')/*缩略图文件上传按钮*/;


			/*编辑器调用*/
			var QN=new QiniuJsSDK()/*七牛对象*/,
				img_token=getToken()/*获取token*/,
			editor=KE.create("#content_content",{
					minHeight:'300px',
					height:'300px',
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
			/*图片上传初始化*/
			if(img_token!==null){
				/*切换显示隐藏*/
				$editor_image_toggle.on('click', function () {
					$editor_image_list.toggleClass('g-d-hidei');
				});

				/*上传*/
				var editor_upload = QN.uploader({
					runtimes: 'html5,flash,html4',
					browse_button: 'editor_image_select',
					uptoken :img_token.qiniuToken,// uptoken是上传凭证，由其他程序生成
					multi_selection:true,
					get_new_uptoken: false,// 设置上传文件的时候是否每次都重新获取新的uptoken
					unique_names:false,// 默认false，key为文件名。若开启该选项，JS-SDK会为每个文件自动生成key（文件名）
					save_key:false,//默认false。若在服务端生成uptoken的上传策略中指定了sava_key，则开启，SDK在前端将不对key进行任何处理
					domain:img_token.qiniuDomain,//bucket域名，下载资源时用到，必需
					container:'editor_image_list',// 上传区域DOM ID，默认是browser_button的父元素
					flash_swf_url: '../../js/plugins/plupload/Moxie.swf',//引入flash，相对路径
					max_retries: 3,// 上传失败最大重试次数
					dragdrop:false,
					chunk_size: '4m',
					auto_start:false,
					filters:{
						max_file_size : '4m',
						mime_types: [
							{
								title : "Image files", extensions : "jpg,gif,png,jpeg"
							}
						]
					},
					init: {
						'FilesAdded': function(up, files) {},
						'BeforeUpload': function(up, file) {},
						'UploadProgress': function(up, file) {},
						'FileUploaded': function(up, file, info) {
							/*获取上传成功后的文件的Url*/
							var domain=up.getOption('domain'),
								name=JSON.parse(info),
								str=domain+'/'+name.key;
							$('<li><div><img alt="" src="'+str+'"></div>&lt;img alt="" src="'+str+'"&gt;</li>').appendTo($editor_image_show);
						},
						'Error': function(up, err, errTip) {
							var opt=up.settings,
								file=err.file,
								setsize=parseInt(opt.filters.max_file_size,10),
								realsize=parseInt((file.size / 1024) / 1024,10);

							if(realsize>setsize){
								dia.content('<span class="g-c-bs-warning g-btips-warn">您选择的文件太大(<span class="g-c-red1"> '+realsize+'m</span>),不能超过(<span class="g-c-red1"> '+setsize+'m</span>)</span>').show();
								setTimeout(function(){
									dia.close();
								},3000);
							}
							console.log(errTip);
						},
						'UploadComplete': function() {
							dia.content('<span class="g-c-bs-success g-btips-succ">上传成功</span>').show()
							setTimeout(function(){
								dia.close();
							},2000);
						},
						'Key': function(up, file) {
							var str=moment().format("YYYYMMDDHHmmSSSS");
							return "admin"+decodeURIComponent(logininfo.param.adminId)+"_"+str;
						}
					}
				});


				/*执行上传*/
				$editor_image_upload.on('click',function(){
					editor_upload.start();
				});
			}
			

			/*
			* 初始化
			* */
			/*清空编辑器内容*/
			editor.html('');
			/*重置表单*/
			edit_form.reset();


			/*最小化窗口*/
			$edit_title.next().on('click',function(e){
				e.stopPropagation();
				e.preventDefault();
				edit_form.reset();
			});


			/*添加文章广告*/
			if(contentpublish_power){
				$publish_wrap.removeClass('g-d-hidei');
			}


			/*缩略图切换编辑状态*/
			$toggle_edit_btn.on('click',function(){
				var $this=$(this),
					isactive=$this.hasClass('toggle-edit-btnactive');
					if(isactive){
						$this.removeClass('toggle-edit-btnactive');
						$content_thumbnail.prop({
							'readonly':true
						});
					}else{
						$this.addClass('toggle-edit-btnactive');
						$content_thumbnail.prop({
							'readonly':false
						});
					}

			});

			/*缩略图文件上传初始化*/
			if(img_token!==null){

				var thumbnail_upload = QN.uploader({
							runtimes: 'html5,flash,html4',
							browse_button: 'img_url_file',
							uptoken :img_token.qiniuToken,// uptoken是上传凭证，由其他程序生成
							multi_selection:false,
							get_new_uptoken: false,// 设置上传文件的时候是否每次都重新获取新的uptoken
							unique_names:false,// 默认false，key为文件名。若开启该选项，JS-SDK会为每个文件自动生成key（文件名）
							save_key:false,//默认false。若在服务端生成uptoken的上传策略中指定了sava_key，则开启，SDK在前端将不对key进行任何处理
							domain:img_token.qiniuDomain,//bucket域名，下载资源时用到，必需
							container:'img_url_wrap',// 上传区域DOM ID，默认是browser_button的父元素
							flash_swf_url: '../../js/plugins/plupload/Moxie.swf',//引入flash，相对路径
							max_retries: 3,// 上传失败最大重试次数
							dragdrop:false,
							chunk_size: '500kb',
							auto_start:false,
							filters:{
								max_file_size : '500kb',
								mime_types: [
									{
										title : "Image files", extensions : "jpg,gif,png,jpeg"
									}
								]
							},
							init: {
								'FilesAdded': function(up, files) {},
								'BeforeUpload': function(up, file) {},
								'UploadProgress': function(up, file) {},
								'FileUploaded': function(up, file, info) {
									/*获取上传成功后的文件的Url*/
									var domain=up.getOption('domain'),
										name=JSON.parse(info);
									$content_thumbnail.val(domain+'/'+name.key+"?imageView2/1/w/250/h/170");
								},
								'Error': function(up, err, errTip) {
										var opt=up.settings,
											file=err.file,
											setsize=parseInt(opt.filters.max_file_size,10),
											realsize=parseInt(file.size / 1024,10);

									if(realsize>setsize){
										dia.content('<span class="g-c-bs-warning g-btips-warn">您选择的文件太大(<span class="g-c-red1"> '+realsize+'kb</span>),不能超过(<span class="g-c-red1"> '+setsize+'kb</span>)</span>').show();
										setTimeout(function(){
											dia.close();
										},3000);
									}
									console.log(errTip);
								},
								'UploadComplete': function() {
									dia.content('<span class="g-c-bs-success g-btips-succ">上传成功</span>').show()
									setTimeout(function(){
										dia.close();
									},2000);
								},
								'Key': function(up, file) {
									var str=moment().format("YYYYMMDDHHmmSSSS");
									 return "admin"+decodeURIComponent(logininfo.param.adminId)+"_"+str;
								}
							}
				});

				$img_url_upload.on('click',function(){
					/*执行上传*/
					thumbnail_upload.start();
				});
			}





			/*表单验证*/
			if($.isFunction($.fn.validate)) {
				/*配置信息*/
				var form_opt={};
				if(public_tool.cache.form_opt_0){
					$.extend(true,form_opt,public_tool.cache.form_opt_0,{
						submitHandler: function(form){
							//判断是否存在id号
							var config={
									url:"http://10.0.5.226:8016/yttx-adminbms-api/article/add",
									dataType:'JSON',
									method:'post',
									data:{
										adminId:decodeURIComponent(logininfo.param.adminId),
										token:decodeURIComponent(logininfo.param.token),
										userId:decodeURIComponent(logininfo.param.roleId),
										title:$content_title.val(),
										content:$content_content.val(),
										thumbnail:$content_thumbnail.val(),
										typeIds:$content_typeid.val()
									}
								};
							

							$.ajax(config)
								.done(function(resp){
									var code=parseInt(resp.code,10);
									if(code!==0){
										console.log(resp.message);
										setTimeout(function(){
											dia.content('<span class="g-c-bs-warning g-btips-warn">发布文章失败</span>').show()
										},300);
										setTimeout(function () {
											dia.close();
										},2000);
										return false;
									}
									
									//重置表单
									edit_form.reset();
									setTimeout(function(){
										dia.content('<span class="g-c-bs-success g-btips-succ">发布文章成功</span>').show();
									},300);
									setTimeout(function () {
										dia.close();
										window.href='yttx_content_article.html';
									},2000);
								})
								.fail(function(resp){
									console.log(resp.message);
								});
							return false;
						}
					});
				}
				/*提交验证*/
				$content_edit_form.validate(form_opt);
			}



		}


		
		/*获取七牛token*/
		function getToken(){
			var result=null;
			$.ajax({
				url:'http://10.0.5.226:8016/yttx-adminbms-api/commom/getQiniuToken',
				async:false,
				type:'post',
				datatype:'json',
				data:{
					bizType:"2",
					adminId:decodeURIComponent(logininfo.param.adminId),
					token:decodeURIComponent(logininfo.param.token)
				}
			}).done(function(resp){
				var code=parseInt(resp.code,10);
				if(code!==0){
					console.log(resp.message);
					return false;
				}
				result=resp.result;
			}).fail(function(resp){
				console.log(resp.message);
			});
			return result;
		}



	});


})(jQuery,KindEditor);