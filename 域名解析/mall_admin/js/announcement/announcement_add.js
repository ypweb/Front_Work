/*admin_member:成员设置*/
(function($,KE){
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
					grade:decodeURIComponent(logininfo.param.grade),
					token:decodeURIComponent(logininfo.param.token)
				},
				datatype:'json'
			});


			/*权限调用*/
			var powermap=public_tool.getPower(),
				announcementadd_power=public_tool.getKeyPower('bzw-announcement-add',powermap),
				announcementedit_power=public_tool.getKeyPower('bzw-announcement-edit',powermap);


			/*dom引用和相关变量定义*/
			var module_id='bzw-announcement-add'/*模块id，主要用于本地存储传值*/,
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
				admin_announcementadd_form=document.getElementById('admin_announcementadd_form'),
				$admin_announcementadd_form=$(admin_announcementadd_form),
				$admin_id=$('#admin_id'),
				$admin_title=$('#admin_title'),
				$admin_type=$('#admin_type'),
				$admin_sort=$('#admin_sort'),
				$admin_status=$('#admin_status'),
				$admin_content=$('#admin_content'),
				$admin_attachmentUrl=$('#admin_attachmentUrl'),
				$admin_isAllReceived=$('#admin_isAllReceived'),
				$admin_action=$('#admin_action'),
				resetform0=null;


			var $toggle_edit_btn=$('#toggle_edit_btn'),
				$image_url_file=$('#image_url_file'),
				$image_url_upload=$('#image_url_upload');


			/*上传对象*/
			var addplugin_QN_Upload=new QiniuJsSDK(),
				upload_bars= [],
				ImageUpload_Token=getToken()||null/*获取token*/;



			/*图片上传预览*/
			if(ImageUpload_Token!==null){
				/*附件上传预览*/
				var addplugin_image_upload = addplugin_QN_Upload.uploader({
					runtimes: 'html5,html4,flash,silverlight',
					browse_button: 'image_url_file',
					uptoken :ImageUpload_Token.qiniuToken,// uptoken是上传凭证，由其他程序生成
					multi_selection:false,
					get_new_uptoken: false,// 设置上传文件的时候是否每次都重新获取新的uptoken
					unique_names:false,// 默认false，key为文件名。若开启该选项，JS-SDK会为每个文件自动生成key（文件名）
					save_key:false,//默认false。若在服务端生成uptoken的上传策略中指定了sava_key，则开启，SDK在前端将不对key进行任何处理
					domain:ImageUpload_Token.qiniuDomain,//bucket域名，下载资源时用到，必需
					container:'image_url_wrap',// 上传区域DOM ID，默认是browser_button的父元素
					flash_swf_url: '../../js/plugins/plupload/Moxie.swf',//引入flash，相对路径
					silverlight_xap_url : '../../js/plugins/plupload/Moxie.xap',
					max_retries: 3,// 上传失败最大重试次数
					dragdrop:false,
					chunk_size: '4mb',
					auto_start:false,
					max_file_size : '4mb',
					init: {
						'PostInit': function() {
							$image_url_file.attr({
								'data-value':''
							});
							/*绑定上传相片*/
							$image_url_upload.on('click',function(){
								var isupload=$image_url_file.attr('data-value');
								if(isupload===''){
									dia.content('<span class="g-c-bs-warning g-btips-warn">您还未选择需要上传的文件</span>').show();
									setTimeout(function(){
										dia.close();
									},3000);
									return false;
								}else{
									addplugin_image_upload.start();
									return false;
								}
							});
						},
						'FilesAdded': function(up, file) {
							$image_url_file.attr({
								'data-value':'image'
							});
							var temp_bars=this.files.length,
								j=0;
							upload_bars.length=0;
							for(j;j<temp_bars;j++){
								upload_bars.push(this.files[j]['id']);
							}
						},
						'BeforeUpload': function(up, file) {},
						'UploadProgress': function(up, file) {},
						'FileUploaded': function(up, file, info) {
							/*获取上传成功后的文件的Url*/
							var domain=up.getOption('domain'),
								name=JSON.parse(info),
								str=domain+'/'+name.key;
							$admin_attachmentUrl.val(str).attr({
								'data-value':str
							});
						},
						'Error': function(up, err, errTip) {
							dia.content('<span class="g-c-bs-warning g-btips-warn">'+errTip+'</span>').show();
							setTimeout(function(){
								dia.close();
							},3000);
							console.log(errTip);
						},
						'UploadComplete': function(up, file) {
							dia.content('<span class="g-c-bs-success g-btips-succ">上传成功</span>');
							$image_url_file.attr({
								'data-value':''
							});
							upload_bars.length=0;
							setTimeout(function(){
								dia.close();
							},2000);
						},
						'Key': function(up, file) {
							/*调用滚动条*/
							uploadShowBars(file['id']);
							var prefix=file.name.split('.'),
								str="announcement_"+moment().format("YYYYMMDDHHmmSSSS")+'.'+prefix[prefix.length - 1];
							return str;
						}
					}
				});
			}else{
				$image_url_file.on('click',function () {
					dia.content('<span class="g-c-bs-warning g-btips-warn">暂未开通此接口</span>').show();
					setTimeout(function(){
						dia.close();
					},3000);
					return false;
				});
				$image_url_upload.on('click',function () {
					var value=$image_url_file.attr('data-value');
					if(value===''){
						dia.content('<span class="g-c-bs-warning g-btips-warn">您还未选择需要上传的文件</span>').show();
						setTimeout(function(){
							dia.close();
						},3000);
						return false;
					}
				});
			}


			/*编辑器调用*/
			var editor=KE.create("#admin_content",{
				minHeight:'500px',
				height:'500px',
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


			/*附件切换编辑状态*/
			$toggle_edit_btn.on('click',function(){
				var $this=$(this),
					isactive=$this.hasClass('toggle-edit-btnactive');
				if(isactive){
					$this.removeClass('toggle-edit-btnactive');
					$admin_attachmentUrl.prop({
						'readonly':true
					});
					/*附件编辑*/
					$admin_attachmentUrl.off('keyup');
				}else{
					$this.addClass('toggle-edit-btnactive');
					$admin_attachmentUrl.prop({
						'readonly':false
					}).on('keyup',function () {
						var $self=$(this),
							value=$self.val();
						if(value===''){
							$self.attr({
								'data-value':''
							});
						}
					});
				}
			});


			/*获取编辑缓存*/
			admin_announcementadd_form.reset();
			$admin_attachmentUrl.attr({
				'data-value':''
			});
			var edit_cache=public_tool.getParams('bzw-announcement-add');
			if(edit_cache){
				$admin_action.html('修改');
				/*判断权限*/
				if(announcementedit_power){
					$admin_action.removeClass('g-d-hidei');
				}else{
					$admin_action.addClass('g-d-hidei');
				}
				setAnnouncementData(edit_cache);
			}else{
				/*判断权限*/
				if(announcementadd_power){
					$admin_action.removeClass('g-d-hidei');
				}else{
					$admin_action.addClass('g-d-hidei');
				}
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
							formtype='addannouncement';
						}
						$.extend(true,(function () {
							if(formtype==='addannouncement'){
								return form_opt0;
							}
						}()),(function () {
							if(formtype==='addannouncement'){
								return formcache.form_opt_0;
							}
						}()),{
							submitHandler: function(form){
								var setdata={};

								$.extend(true,setdata,basedata);

								if(formtype==='addannouncement'){

									/*同步编辑器*/
									editor.sync();
									$.extend(true,setdata,{
										title:$admin_title.val(),
										type:$admin_type.find(':selected').val(),
										sort:$admin_sort.val(),
										status:$admin_status.find(':selected').val(),
										content:$admin_content.val(),
										isAllReceived:$admin_isAllReceived.is(':checked')?1:0
									});

									var attachment=$admin_attachmentUrl.val();
									if(attachment!==''&&$admin_attachmentUrl.attr('data-value')!==''){
                                        if(attachment.indexOf('#,#')!==-1){
                                            attachment=attachment.split('#,#');
                                            setdata['attachmentUrl']=JSON.stringify(attachment);
                                        }else{
                                            setdata['attachmentUrl']=attachment;
                                        }
									}else{
										delete setdata['attachmentUrl'];
									}

                                    var id=$admin_id.val(),
										actiontype='';
                                    if(id!==''){
										/*修改操作*/
                                        setdata['id']=id;
										actiontype='修改';
										config['url']="http://112.74.207.132:8081/mall-buzhubms-api/announcement/update";
                                    }else{
										/*新增操作*/
										config['url']="http://112.74.207.132:8081/mall-buzhubms-api/announcement/add";
										actiontype='新增';
                                        delete setdata['id'];
                                    }
									config['data']=setdata;
								}

								$.ajax(config).done(function(resp){
									var code;
									if(formtype==='addannouncement'){
										code=parseInt(resp.code,10);
										if(code!==0){
											dia.content('<span class="g-c-bs-warning g-btips-warn">'+actiontype+'公告失败</span>').show();
											return false;
										}else{
											dia.content('<span class="g-c-bs-success g-btips-succ">'+actiontype+'公告成功</span>').show();
										}
									}


									setTimeout(function () {
										dia.close();
										if(formtype==='addannouncement'&&code===0){
											/*页面跳转*/
											location.href='bzw-announcement-list.html';
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
					resetform0=$admin_announcementadd_form.validate(form_opt0);
				}
			}



		}





		/*获取七牛token*/
		function getToken(){
			var result=null,
					tempurl1='112.',
					tempurl2='74.',
					tempurl3='207.',
					tempurl4='132:8088';
			$.ajax({
				url:'http://'+tempurl1+tempurl2+tempurl3+tempurl4+'/yttx-public-api/qiniu/token/get',
				async:false,
				type:'post',
				datatype:'json',
				data:{
					bizType:2,
					roleId:decodeURIComponent(logininfo.param.roleId),
					adminId:decodeURIComponent(logininfo.param.adminId),
					grade:decodeURIComponent(logininfo.param.grade),
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




		/*上传进度条*/
		function uploadShowBars(id){
			var len=upload_bars.length;
			if(len>0){
				var j= 0;
				for(j;j<len;j++){
					if(upload_bars[j]===id){
						var bars=parseInt(((j+1)/len) * 100,10);
						setTimeout(function(){
							show_loading_bar(bars);
						},0);
						break;
					}
				}
			}
		}


		/*设置值*/
		function setAnnouncementData(obj) {
			var edit_cache=obj;
			for(var m in edit_cache){
				switch(m){
					case 'id':
						$admin_id.val(edit_cache[m]);
						break;
					case 'title':
						$admin_title.val(edit_cache[m]);
						break;
					case 'type':
						var types=edit_cache[m];
						$admin_type.find('option').each(function () {
							var $this=$(this),
								value=$this.val();
							if(value===types){
								$this.prop({
									'selected':true
								});
								return false;
							}
						});
						break;
					case 'sort':
						$admin_sort.val(edit_cache[m]);
						break;
					case 'status':
						var status=edit_cache[m];
						$admin_status.find('option').each(function () {
							var $this=$(this),
								value=$this.val();
							if(value===types){
								$this.prop({
									'selected':true
								});
								return false;
							}
						});
						break;
					case 'content':
						editor.html(edit_cache[m]);
						editor.sync();
						break;
					case 'attachmentUrl':
						var attach=edit_cache[m];
						if(attach){
							if($.isArray(attach)){
								$admin_attachmentUrl.val(attach.join('#,#')).attr({
									'data-value':attach.join('#,#')
								});
							}else{
								$admin_attachmentUrl.val(attach).attr({
									'data-value':attach
								});
							}
						}
						break;
					case 'isAllReceived':
						var receive=parseInt(edit_cache[m],10);
						$admin_isAllReceived.prop({
							'checked':(function () {
								if(receive===1){
									return true;
								}else if(receive===0){
									return false;
								}
							}())
						});
						break;
				}
			}
		}




	});



})(jQuery,KindEditor);