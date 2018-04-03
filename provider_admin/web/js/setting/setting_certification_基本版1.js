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
			var module_id='yttx-setting-certification'/*模块id，主要用于本地存储传值*/,
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
				$admin_legalName=$('#admin_legalName'),
				$admin_identity=$('#admin_identity'),
				$admin_identityJust=$('#admin_identityJust'),
				$admin_identityBack=$('#admin_identityBack'),
				$admin_identityHand=$('#admin_identityHand'),
				$admin_businessLicenseImage=$('#admin_businessLicenseImage'),
				$admin_identityJust_view=$('#admin_identityJust_view'),
				$admin_identityBack_view=$('#admin_identityBack_view'),
				$admin_identityHand_view=$('#admin_identityHand_view'),
				$admin_businessLicenseImage_view=$('#admin_businessLicenseImage_view'),
				$admin_identityJust_upload=$('#admin_identityJust_upload'),
				$admin_identityBack_upload=$('#admin_identityBack_upload'),
				$admin_identityHand_upload=$('#admin_identityHand_upload'),
				$admin_businessLicenseImage_upload=$('#admin_businessLicenseImage_upload'),
				$admin_identityJust_show=$('#admin_identityJust_show'),
				$admin_identityBack_show=$('#admin_identityBack_show'),
				$admin_identityHand_show=$('#admin_identityHand_show'),
				$admin_businessLicenseImage_show=$('#admin_businessLicenseImage_show'),
				$admin_businessLicense=$('#admin_businessLicense'),
				$show_detail_wrap=$('#show_detail_wrap')/*详情容器*/,
				$show_detail_title=$('#show_detail_title')/*详情标题*/,
				$show_detail_content=$('#show_detail_content');



			/*上传对象*/
			var /*just_QN_Upload=new QiniuJsSDK(),
				back_QN_Upload=new QiniuJsSDK(),
				hand_QN_Upload=new QiniuJsSDK(),
				license_QN_Upload=new QiniuJsSDK(),*/
				upload_bars= [],
				ImageUpload_Token=/*getToken()||*/null;




			if(ImageUpload_Token!==null){
				var just_image_upload =just_QN_Upload.uploader({
					runtimes: 'html5,html4,flash,silverlight',
					browse_button: 'admin_identityJust_view',
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
					chunk_size: '2mb',
					auto_start:false,
					filters:{
						max_file_size : '4mb',
						mime_types: [
							{
								title : "Image files",
								extensions : "jpg,gif,png,jpeg"
							}
						]
					},
					init: {
						'PostInit': function() {

							$admin_identityJust_view.attr({
								'data-value':''
							});
							/*绑定上传相片*/
							$admin_identityJust_upload.on('click',function(){
								var isupload=$admin_identityJust_view.attr('data-value');
								if(isupload===''){
									dia.content('<span class="g-c-bs-warning g-btips-warn">您还未选择需要上传的文件</span>').show();
									setTimeout(function(){
										dia.close();
									},3000);
									return false;
								}else{
									just_image_upload.start();
									return false;
								}
							});
						},
						'FilesAdded': function(up, file) {
							$admin_identityJust_view.attr({
								'data-value':'image'
							});
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
							$admin_identityJust_view.attr({
								'data-value':''
							});
							upload_bars.length=0;
						},
						'Error': function(up, err, errTip) {
							var opt=up.settings,
								file=err.file,
								setsize=parseInt(opt.filters.max_file_size,10),
								realsize=parseInt((file.size / 1024)/1024,10);

							if(realsize>setsize){
								dia.content('<span class="g-c-bs-warning g-btips-warn">您选择的文件太大(<span class="g-c-red1"> '+realsize+'mb</span>),不能超过(<span class="g-c-red1"> '+setsize+'mb</span>)</span>').show();
								$admin_identityJust_view.attr({
									'data-value':''
								});
								setTimeout(function(){
									dia.close();
								},3000);
							}
							console.log(errTip);
						},
						'UploadComplete': function(up, file) {
							dia.content('<span class="g-c-bs-success g-btips-succ">上传成功</span>').show();
							upload_bars.length=0;
							$admin_identityJust_view.attr({
								'data-value':''
							});
							setTimeout(function(){
								dia.close();
							},2000);
							try {
								var domain=up.getOption('domain'),
									name=up.getOption('multipart_params');
								$('<img alt="" src="'+domain+'/'+name.key+'?imageView2/1/w/400/h/200" />').appendTo($admin_identityJust.html(''));
							}catch (e){
								console.log('业务服务器回调异常');
							}
						},
						'Key': function(up, file) {
							/*调用滚动条*/
							uploadShowBars(file['id']);
							var str="provider_just_"+moment().format("YYYYMMDDHHmmSSSS");
							return str;
						}
					}
				});
				var back_image_upload =back_QN_Upload.uploader({
					runtimes: 'html5,html4,flash,silverlight',
					browse_button: 'admin_identityBack_view',
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
					chunk_size: '2mb',
					auto_start:false,
					filters:{
						max_file_size : '4mb',
						mime_types: [
							{
								title : "Image files",
								extensions : "jpg,gif,png,jpeg"
							}
						]
					},
					init: {
						'PostInit': function() {

							$admin_identityBack_view.attr({
								'data-value':''
							});
							/*绑定上传相片*/
							$admin_identityBack_upload.on('click',function(){
								var isupload=$admin_identityBack_view.attr('data-value');
								if(isupload===''){
									dia.content('<span class="g-c-bs-warning g-btips-warn">您还未选择需要上传的文件</span>').show();
									setTimeout(function(){
										dia.close();
									},3000);
									return false;
								}else{
									back_image_upload.start();
									return false;
								}
							});
						},
						'FilesAdded': function(up, file) {
							$admin_identityBack_view.attr({
								'data-value':'image'
							});
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
							$admin_identityBack_view.attr({
								'data-value':''
							});
							upload_bars.length=0;
						},
						'Error': function(up, err, errTip) {
							var opt=up.settings,
								file=err.file,
								setsize=parseInt(opt.filters.max_file_size,10),
								realsize=parseInt((file.size / 1024)/1024,10);

							if(realsize>setsize){
								dia.content('<span class="g-c-bs-warning g-btips-warn">您选择的文件太大(<span class="g-c-red1"> '+realsize+'mb</span>),不能超过(<span class="g-c-red1"> '+setsize+'mb</span>)</span>').show();
								$admin_identityBack_view.attr({
									'data-value':''
								});
								setTimeout(function(){
									dia.close();
								},3000);
							}
							console.log(errTip);
						},
						'UploadComplete': function(up, file) {
							dia.content('<span class="g-c-bs-success g-btips-succ">上传成功</span>').show();
							upload_bars.length=0;
							$admin_identityBack_view.attr({
								'data-value':''
							});
							setTimeout(function(){
								dia.close();
							},2000);
							try {
								var domain=up.getOption('domain'),
									name=up.getOption('multipart_params');
								$('<img alt="" src="'+domain+'/'+name.key+'?imageView2/1/w/400/h/200" />').appendTo($admin_identityBack.html(''));
							}catch (e){
								console.log('业务服务器回调异常');
							}
						},
						'Key': function(up, file) {
							/*调用滚动条*/
							uploadShowBars(file['id']);
							var str="provider_back_"+moment().format("YYYYMMDDHHmmSSSS");
							return str;
						}
					}
				});
				var hand_image_upload =hand_QN_Upload.uploader({
					runtimes: 'html5,html4,flash,silverlight',
					browse_button: 'admin_identityHand_view',
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
					chunk_size: '2mb',
					auto_start:false,
					filters:{
						max_file_size : '4mb',
						mime_types: [
							{
								title : "Image files",
								extensions : "jpg,gif,png,jpeg"
							}
						]
					},
					init: {
						'PostInit': function() {

							$admin_identityHand_view.attr({
								'data-value':''
							});
							/*绑定上传相片*/
							$admin_identityHand_upload.on('click',function(){
								var isupload=$admin_identityHand_view.attr('data-value');
								if(isupload===''){
									dia.content('<span class="g-c-bs-warning g-btips-warn">您还未选择需要上传的文件</span>').show();
									setTimeout(function(){
										dia.close();
									},3000);
									return false;
								}else{
									hand_image_upload.start();
									return false;
								}
							});
						},
						'FilesAdded': function(up, file) {
							$admin_identityHand_view.attr({
								'data-value':'image'
							});
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
							$admin_identityHand_view.attr({
								'data-value':''
							});
							upload_bars.length=0;
						},
						'Error': function(up, err, errTip) {
							var opt=up.settings,
								file=err.file,
								setsize=parseInt(opt.filters.max_file_size,10),
								realsize=parseInt((file.size / 1024)/1024,10);

							if(realsize>setsize){
								dia.content('<span class="g-c-bs-warning g-btips-warn">您选择的文件太大(<span class="g-c-red1"> '+realsize+'mb</span>),不能超过(<span class="g-c-red1"> '+setsize+'mb</span>)</span>').show();
								$admin_identityHand_view.attr({
									'data-value':''
								});
								setTimeout(function(){
									dia.close();
								},3000);
							}
							console.log(errTip);
						},
						'UploadComplete': function(up, file) {
							dia.content('<span class="g-c-bs-success g-btips-succ">上传成功</span>').show();
							upload_bars.length=0;
							$admin_identityHand_view.attr({
								'data-value':''
							});
							setTimeout(function(){
								dia.close();
							},2000);
							try {
								var domain=up.getOption('domain'),
									name=up.getOption('multipart_params');
								$('<img alt="" src="'+domain+'/'+name.key+'?imageView2/1/w/400/h/200" />').appendTo($admin_identityHand.html(''));
							}catch (e){
								console.log('业务服务器回调异常');
							}
						},
						'Key': function(up, file) {
							/*调用滚动条*/
							uploadShowBars(file['id']);
							var str="provider_hand_"+moment().format("YYYYMMDDHHmmSSSS");
							return str;
						}
					}
				});
				var license_image_upload =license_QN_Upload.uploader({
					runtimes: 'html5,html4,flash,silverlight',
					browse_button: 'admin_businessLicenseImage_view',
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
					chunk_size: '2mb',
					auto_start:false,
					filters:{
						max_file_size : '4mb',
						mime_types: [
							{
								title : "Image files",
								extensions : "jpg,gif,png,jpeg"
							}
						]
					},
					init: {
						'PostInit': function() {

							$admin_businessLicenseImage_view.attr({
								'data-value':''
							});
							/*绑定上传相片*/
							$admin_businessLicenseImage_upload.on('click',function(){
								var isupload=$admin_businessLicenseImage_view.attr('data-value');
								if(isupload===''){
									dia.content('<span class="g-c-bs-warning g-btips-warn">您还未选择需要上传的文件</span>').show();
									setTimeout(function(){
										dia.close();
									},3000);
									return false;
								}else{
									license_image_upload.start();
									return false;
								}
							});
						},
						'FilesAdded': function(up, file) {
							$admin_businessLicenseImage_view.attr({
								'data-value':'image'
							});
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
							$admin_businessLicenseImage_view.attr({
								'data-value':''
							});
							upload_bars.length=0;
						},
						'Error': function(up, err, errTip) {
							var opt=up.settings,
								file=err.file,
								setsize=parseInt(opt.filters.max_file_size,10),
								realsize=parseInt((file.size / 1024)/1024,10);

							if(realsize>setsize){
								dia.content('<span class="g-c-bs-warning g-btips-warn">您选择的文件太大(<span class="g-c-red1"> '+realsize+'mb</span>),不能超过(<span class="g-c-red1"> '+setsize+'mb</span>)</span>').show();
								$admin_businessLicenseImage_view.attr({
									'data-value':''
								});
								setTimeout(function(){
									dia.close();
								},3000);
							}
							console.log(errTip);
						},
						'UploadComplete': function(up, file) {
							dia.content('<span class="g-c-bs-success g-btips-succ">上传成功</span>').show();
							upload_bars.length=0;
							$admin_businessLicenseImage_view.attr({
								'data-value':''
							});
							setTimeout(function(){
								dia.close();
							},2000);
							try {
								var domain=up.getOption('domain'),
									name=up.getOption('multipart_params');
								$('<img alt="" src="'+domain+'/'+name.key+'?imageView2/1/w/400/h/200" />').appendTo($admin_businessLicenseImage.html(''));
							}catch (e){
								console.log('业务服务器回调异常');
							}
						},
						'Key': function(up, file) {
							/*调用滚动条*/
							uploadShowBars(file['id']);
							var str="provider_license_"+moment().format("YYYYMMDDHHmmSSSS");
							return str;
						}
					}
				});

			}



			/*加载数据*/
			getSettingData();


			/*上传图片*/




			/*绑定切换显示隐藏*/
			$.each([$admin_identityJust,$admin_identityBack,$admin_identityHand,$admin_businessLicenseImage],function(){

				var self=this;


				/*查询切换显示隐藏*/
				this.parent().on('mouseover mouseout',function(e){
					var type= e.type;
					if(type==='mouseover'){
						self.prev().addClass('admin-upload-detail-active');
					}else if(type==='mouseout'){
						self.prev().removeClass('admin-upload-detail-active');
					}
				});
			});



			/*绑定查看详情*/
			$.each([$admin_identityJust_show,$admin_identityBack_show,$admin_identityHand_show,$admin_businessLicenseImage_show],function(){

				var self=this,
					selector=this.selector;


				/*绑定查看*/
				this.on('click',function(e){
					var $parent=self.parent();
					if(selector.indexOf('Just')!==-1){
						$show_detail_title.html('身份证照(正面)');
					}else if(selector.indexOf('Back')!==-1){
						$show_detail_title.html('身份证照(反面)');
					}else if(selector.indexOf('Hand')!==-1){
						$show_detail_title.html('手持身份证正面照片');
					}else if(selector.indexOf('Image')!==-1){
						$show_detail_title.html('营业执照图片');
					}
					var $img=$parent.next().find('img'),
						src='';
					if($img.size()!==0){
						src=$img.attr('src');
						if(src.indexOf('qiniucdn.com')!==-1){
							$('<tr><td><img src="'+src.split('?imageView2')[0]+'"/></td></tr>').appendTo($show_detail_content.html(''));
						}else{
							$('<tr><td><img src="'+src+'"/></td></tr>').appendTo($show_detail_content.html(''));
						}
						$show_detail_wrap.modal('show',{
							backdrop:'static'
						});
					}

				});

			});


		}


		/*关闭弹出框并重置值*/
		/*hide.bs.modal*/


		/*获取*/
		function getSettingData(){
			$.ajax({
				url:"http://10.0.5.226:8082/yttx-providerbms-api/provider/enterprise/certification",
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
							case 'legalName':
								$admin_legalName.html(result[i]);
								break;
							case 'identity':
								$admin_identity.html(result[i]);
								break;
							case 'identityJust':
								var just=result[i];
								if(just.indexOf('qiniucdn.com')!==-1){
									$('<img alt="身份证照(正面)" src="'+just+'?imageView2/1/w/400/h/200" />').appendTo($admin_identityJust.html(''));
								}else {
									just=validImages(just);
									if(just!==''){
										$('<img alt="身份证照(正面)" src="'+just+'" />').appendTo($admin_identityJust.html(''));
									}else{
										$admin_identityJust.html('');
									}
								}
								break;
							case 'identityBack':
								var back=result[i];
								if(back.indexOf('qiniucdn.com')!==-1){
									$('<img alt="身份证照(反面)" src="'+back+'?imageView2/1/w/400/h/200" />').appendTo($admin_identityBack.html(''));
								}else {
									back=validImages(back);
									if(back!==''){
										$('<img alt="身份证照(反面)" src="'+back+'" />').appendTo($admin_identityBack.html(''));
									}else{
										$admin_identityBack.html('');
									}
								}
								break;
							case 'identityHand':
								var hand=result[i];
								if(hand.indexOf('qiniucdn.com')!==-1){
									$('<img alt="手持身份证正面照片" src="'+hand+'?imageView2/1/w/400/h/200" />').appendTo($admin_identityHand.html(''));
								}else {
									hand=validImages(hand);
									if(hand!==''){
										$('<img alt="手持身份证正面照片" src="'+hand+'" />').appendTo($admin_identityHand.html(''));
									}else{
										$admin_identityHand.html('');
									}
								}
								break;
							case 'businessLicense':
								$admin_businessLicense.html(result[i]);
								break;
							case 'businessLicenseImage':
								var license=result[i];
								if(license.indexOf('qiniucdn.com')!==-1){
									$('<img alt="营业执照图片" src="'+license+'?imageView2/1/w/400/h/200" />').appendTo($admin_businessLicenseImage.html(''));
								}else {
									license=validImages(license);
									if(license!==''){
										$('<img alt="营业执照图片" src="'+license+'" />').appendTo($admin_businessLicenseImage.html(''));
									}else{
										$admin_businessLicenseImage.html('');
									}
								}
								break;
						}
					}
				}


			}).fail(function(resp){
				console.log('error');
			});
		}


		/*判断图片合法格式*/
		function validImages(value){
			var str='';
			var tempimg=value,
				imgreg=/(jpeg|jpg|gif|png)/g;

			if(tempimg.indexOf('.')!==-1){
				if(imgreg.test(tempimg)){
					str=value;
				}else{
					str='';
				}
			}else{
				str='';
			}
			return str;
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
					bizType:1,
					providerId:decodeURIComponent(logininfo.param.providerId),
					userId:decodeURIComponent(logininfo.param.userId),
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
						if(j!==len -1){
							setTimeout(function(){
								show_loading_bar(bars);
							},0);
						}else{
							setTimeout(function(){
								show_loading_bar(bars);
							},1000);
						}
						break;
					}
				}
			}
		}

	});

})(jQuery);