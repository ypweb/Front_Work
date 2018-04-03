/*admin_member:成员设置*/
(function($){
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


			/*权限调用*/
			var powermap=public_tool.getPower(320),
				imeiadd_power=public_tool.getKeyPower('bzw-imei-add',powermap);



			/*dom引用和相关变量定义*/
			var module_id='bzw-imei-add'/*模块id，主要用于本地存储传值*/,
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
				$admin_action=$('#admin_action'),
				admin_add_form=document.getElementById('admin_add_form'),
				$admin_add_form=$(admin_add_form),
				$admin_agent=$('#admin_agent'),
				$admin_type=$('#admin_type'),
				$admin_excelFile=$('#admin_excelFile'),
				resetform0=null;


			/*上传对象*/
			var logo_QN_Upload=new QiniuJsSDK(),
				ImageUpload_Token=getToken()||null,
				upload_bars= [];


			/*初始化*/
			if(imeiadd_power){
				/*绑定显示添加*/
				$admin_action.removeClass('g-d-hidei');
			}
			resetIMEIData();


			/*查询代理商*/
			getAgentData();




			/*绑定logo上传*/
			if(ImageUpload_Token!==null){
				logo_QN_Upload.uploader({
					runtimes: 'html5,html4,flash,silverlight',
					browse_button: 'admin_excelFile_file',
					uptoken :ImageUpload_Token.qiniuToken,// uptoken是上传凭证，由其他程序生成
					multi_selection:false,
					get_new_uptoken: false,// 设置上传文件的时候是否每次都重新获取新的uptoken
					unique_names:false,// 默认false，key为文件名。若开启该选项，JS-SDK会为每个文件自动生成key（文件名）
					save_key:false,//默认false。若在服务端生成uptoken的上传策略中指定了sava_key，则开启，SDK在前端将不对key进行任何处理
					domain:ImageUpload_Token.qiniuDomain,//bucket域名，下载资源时用到，必需
					flash_swf_url: '../../js/plugins/plupload/Moxie.swf',//引入flash，相对路径
					silverlight_xap_url : '../../js/plugins/plupload/Moxie.xap',
					max_retries: 3,// 上传失败最大重试次数
					dragdrop:false,
					chunk_size: '4mb',
					auto_start:true,
					max_file_size : '4mb',
					filters:{
						mime_types: [
							{
								title : "Image files",
								extensions : "xls,xlsx"
							}
						]
					},
					init: {
						'PostInit': function() {},
						'FilesAdded': function(up, file) {
							var temp_bars=this.files.length,
								j=0;
							upload_bars.length=0;
							for(j;j<temp_bars;j++){
								upload_bars.push(this.files[j]['id']);
							}
						},
						'BeforeUpload': function(up, file) {
							show_loading_bar(30);
						},
						'UploadProgress': function(up, file) {},
						'FileUploaded': function(up, file, info) {
							/*获取上传成功后的文件的Url*/

							var domain=up.getOption('domain'),
								name=JSON.parse(info),
								filelink=domain+'/'+name.key;

							$admin_excelFile.attr({
								'data-excel':filelink
							}).html('成功上传文件：<a class="g-c-info" target="_blank" href="'+filelink+'" title="'+filelink+'">'+filelink+'</a>');
						},
						'Error': function(up, err, errTip) {
							dia.content('<span class="g-c-bs-warning g-btips-warn">'+errTip+'</span>').show();
							setTimeout(function(){
								dia.close();
							},3000);
							console.log(errTip);
						},
						'UploadComplete': function(up, file) {
							dia.content('<span class="g-c-bs-success g-btips-succ">上传成功</span>').show();
							upload_bars.length=0;
							setTimeout(function(){
								dia.close();
							},2000);
						},
						'Key': function(up, file) {
							/*调用滚动条*/
							uploadShowBars(file['id']);
							var prefix=file.name.split('.');
							return "imeicode_uploadfile"+moment().format("YYYYMMDDHHmmSSSS")+'.'+prefix[prefix.length - 1];
						}
					}
				});
			}




			/*绑定添加IMEI码*/
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
							formtype='addimei';
						}
						$.extend(true,(function () {
							if(formtype==='addimei'){
								return form_opt0;
							}
						}()),(function () {
							if(formtype==='addimei'){
								return formcache.form_opt_0;
							}
						}()),{
							submitHandler: function(form){
								var setdata={},
									excelfile=$admin_excelFile.attr('data-excel');

								if(excelfile===''){
									dia.content('<span class="g-c-bs-warning g-btips-warn">请上传添加IMEI码Excel文件</span>').show();
									return false;
								}

								$.extend(true,setdata,basedata);
								if(formtype==='addimei'){
									$.extend(true,setdata,{
										agentId:$admin_agent.val(),
										type:$admin_type.val(),
										excelFile:excelfile
									});
									config['url']="http://10.0.5.226:8082/mall-buzhubms-api/subscriber/import/bzwbms";
									config['data']=setdata;
								}

								$.ajax(config).done(function(resp){
									var code;
									if(formtype==='addimei'){
										code=parseInt(resp.code,10);
										if(code!==0){
											dia.content('<span class="g-c-bs-warning g-btips-warn">添加IMEI码失败</span>').show();
											return false;
										}else{
											dia.content('<span class="g-c-bs-success g-btips-succ">添加IMEI码成功</span>').show();
											resetIMEIData();
											setTimeout(function () {
												dia.close();
											},2000);
										}
									}
								}).fail(function(resp){
									console.log('error');
									dia.content('<span class="g-c-bs-warning g-btips-warn">添加IMEI码失败</span>').show();
									resetIMEIData();
									setTimeout(function () {
										dia.close();
									},2000);
								});
								return false;
							}
						});
					});

				}


				/*提交验证*/
				if(resetform0===null){
					resetform0=$admin_add_form.validate(form_opt0);
				}

			}


		}

		/*清除表单数据*/
		function resetIMEIData() {
			admin_add_form.reset();
			$admin_excelFile.attr({
				'data-excel':''
			}).html('');
		}

		/*查询代理商*/
		function getAgentData() {
			$.ajax({
					url:"http://10.0.5.226:8082/mall-buzhubms-api/agent/listprov",
					dataType:'JSON',
					method:'post',
					data:{
						roleId:decodeURIComponent(logininfo.param.roleId),
						adminId:decodeURIComponent(logininfo.param.adminId),
						grade:decodeURIComponent(logininfo.param.grade),
						token:decodeURIComponent(logininfo.param.token)
					}
				})
				.done(function(resp) {
					var code = parseInt(resp.code, 10);
					if (code !== 0) {
						console.log(resp.message);
						dia.content('<span class="g-c-bs-warning g-btips-warn">' + (resp.message || "操作失败") + '</span>').show();
						setTimeout(function () {
							dia.close();
						}, 2000);
						return false;
					}
					/*是否是正确的返回数据*/
					var result = resp.result;
					if (!result) {
						return false;
					}
					var list=result.list;
					if(!list){
						return false;
					}
					var len=list.length,
						i=0,
						str='';
					if(len!==0){
						for(i;i<len;i++){
							var item=list[i];
							if(i===0){
								str+='<option selected value="">请选择代理商</option><option value="'+item["id"]+'">'+item["fullName"]+'</option>';
							}else{
								str+='<option value="'+item["id"]+'">'+item["fullName"]+'</option>';
							}
						}
						$(str).appendTo($admin_agent.html(''));
					}else{
						$admin_agent.html('<option selected value="">请选择代理商</option>');
					}
				})
				.fail(function(resp){
					console.log(resp.message);
					dia.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
					setTimeout(function () {
						dia.close();
					},2000);
				});
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



	});



})(jQuery);