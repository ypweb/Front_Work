(function($){
	'use strict';
	$(function(){

		var table=null/*数据展现*/;

		/*初始化数据*/
		if(public_tool.initMap.isrender){
			/*菜单调用*/
			var logininfo=public_tool.initMap.loginMap;
			public_tool.loadSideMenu(public_vars.$mainmenu,public_vars.$main_menu_wrap,{
				url:'http://112.74.207.132:8081/mall-buzhubms-api/module/menu',
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
				goodstypeadd_power=public_tool.getKeyPower('bzw-goodstype-addlower',powermap);



			/*dom引用和相关变量定义*/
			var module_id='bzw-goodstype-add'/*模块id，主要用于本地存储传值*/,
				$admin_addtype_btn=$('#admin_addtype_btn'),
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
				goods_params={
					roleId:decodeURIComponent(logininfo.param.roleId),
					adminId:decodeURIComponent(logininfo.param.adminId),
					grade:decodeURIComponent(logininfo.param.grade),
					token:decodeURIComponent(logininfo.param.token)
				},
				goodstypeid='',
				$search_gtione=$('#search_gtione'),
				$search_gtitwo=$('#search_gtitwo'),
				resetform0=null;



			/*表单*/
			var admin_addgoodstype_form=document.getElementById('admin_addgoodstype_form'),
				$admin_addgoodstype_form=$(admin_addgoodstype_form),
				$admin_addaction=$('#admin_addaction'),
				$admin_typecode=$('#admin_typecode'),
				$admin_typename=$('#admin_typename'),
				$admin_typesort=$('#admin_typesort'),
				$admin_typeremark=$('#admin_typeremark'),
				$admin_typeshow=$('#admin_typeshow'),
				$admin_typeimage=$('#admin_typeimage');


			/*查询分类并绑定分类查询*/
			$.each([$search_gtione,$search_gtitwo],function(){
				var selector=this.selector;
				/*初始化查询一级分类*/
				if(selector.indexOf('one')!==-1){
					getGoodsTypes(goodstypeid,'one',true);
				}
				this.on('change',function(){
					var $option=$(this).find(':selected'),
						value=this.value,
						hasub=false;
					if(selector.indexOf('one')!==-1){
						if(value===''){
							$search_gtitwo.html('');
							goodstypeid='';
							return false;
						}
						hasub=$option.attr('data-hassub');
						goodstypeid=value;
						if(hasub==='true'){
							getGoodsTypes(value,'two');
						}else{
							$search_gtitwo.html('');
						}
					}else if(selector.indexOf('two')!==-1){
						if(value===''){
							goodstypeid=$search_gtione.find(':selected').val();
							return false;
						}
						hasub=$option.attr('data-hassub');
						goodstypeid=value;
					}
				});
			});
			

			/*初始化表单*/
			admin_addgoodstype_form.reset();
			if(goodstypeadd_power){
				$admin_addaction.removeClass('g-d-hidei');
			}

			/*上传对象*/
			var logo_QN_Upload=new QiniuJsSDK(),
				ImageUpload_Token=getToken()||null,
				upload_bars= [];

			/*根据权限判断显示添加属性按钮*/
			if(goodstypeadd_power){
				$admin_addtype_btn.removeClass('g-d-hidei');
			}else{
				$admin_addtype_btn.addClass('g-d-hidei');
			}

			/*绑定图片上传上传*/
			if(ImageUpload_Token!==null){
				logo_QN_Upload.uploader({
						runtimes: 'html5,html4,flash,silverlight',
						browse_button: 'image_url_file',
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
						auto_start:true,
						max_file_size : '500kb',
						filters:{
							mime_types: [
								{
									title : "Image files",
									extensions : "jpg,gif,png,jpeg"
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
									suffix='?imageView2/1/w/160/h/160',
									url=domain+'/'+name.key;

								$admin_typeimage.attr({
									'data-image':url
								}).html('<img src="'+url+suffix+'" alt="缩略图">');
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
								var str="typeicon_"+moment().format("YYYYMMDDHHmmSSSS");
								return str;
							}
						}
					});
			}

			/*绑定非数字输入*/
			$.each([$admin_typesort],function () {
				this.on('keyup',function () {
					this.value=this.value.replace(/\D*/g,'');
				});
			});


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
							formtype='addgoodstype';
						}
						$.extend(true,(function () {
							if(formtype==='addgoodstype'){
								return form_opt0;
							}
						}()),(function () {
							if(formtype==='addgoodstype'){
								return formcache.form_opt_0;
							}
						}()),{
							submitHandler: function(form){
								var setdata={};

								$.extend(true,setdata,basedata);

								if(formtype==='addgoodstype'){
									var imgurl=$admin_typeimage.attr('data-image');

									$.extend(true,setdata,{
										name:$admin_typename.val(),
										parentId:goodstypeid,
										gtCode:$admin_typecode.val(),
										sort:$admin_typesort.val(),
										isVisible:parseInt($admin_typeshow.find(':checked').val(),10)===1?true:false,
										imageUrl:imgurl,
										remark:$admin_typeremark.val()
									});
									config['url']="http://112.74.207.132:8081/mall-buzhubms-api/goodstype/add";
									config['data']=setdata;
								}

								$.ajax(config).done(function(resp){
									var code;
									if(formtype==='addgoodstype'){
										code=parseInt(resp.code,10);
										if(code!==0){
											dia.content('<span class="g-c-bs-warning g-btips-warn">添加分类失败</span>').show();
											return false;
										}else{
											dia.content('<span class="g-c-bs-success g-btips-succ">添加分类成功</span>').show();
											setTimeout(function () {
												dia.close();
												/*重置数据*/
												admin_addgoodstype_form.reset();
												emptyGoodsTypeData();
											},2000);
										}
									}
								}).fail(function(resp){
									console.log('error');
									dia.content('<span class="g-c-bs-warning g-btips-warn">添加分类失败</span>').show();
									setTimeout(function () {
										dia.close();
										/*重置数据*/
										admin_addgoodstype_form.reset();
										emptyGoodsTypeData();
									},2000);
								});
								return false;
							}
						});
					});
				}

				/*提交验证*/
				if(resetform0===null){
					resetform0=$admin_addgoodstype_form.validate(form_opt0);
				}
			}

		}

		/*级联类型查询*/
		function getGoodsTypes(value,type,flag){
			var typemap={
				'one':'一级',
				'two':'二级'
			};
			var temp_config=$.extend(true,{},goods_params);
			temp_config['parentId']=value;
			$.ajax({
				url:"http://112.74.207.132:8081/mall-buzhubms-api/goodstype/list",
				dataType:'JSON',
				async:false,
				method:'post',
				data:temp_config
			}).done(function(resp){
				var code=parseInt(resp.code,10);
				if(code!==0){
					if(code===999){
						/*清空缓存*/
						public_tool.loginTips(function () {
							public_tool.clear();
							public_tool.clearCacheData();
						});
					}
					console.log(resp.message);
					return false;
				}



				var result=resp.result;

				if(result){
					var list=result.list;
					if(!list){
						return false;
					}
				}else{
					return false;
				}

				var len=list.length,
					i= 0,
					str='';

				if(len!==0){
					for(i;i<len;i++){
						var item=list[i];
						if(i===0){
							str+='<option value="" selected >请选择'+typemap[type]+'分类</option><option  data-hasSub="'+item["hasSub"]+'" value="'+item["id"]+'" >'+item["name"]+'</option>';
						}else{
							str+='<option data-hasSub="'+item["hasSub"]+'" value="'+item["id"]+'" >'+item["name"]+'</option>';
						}
					}
					if(type==='one'){
						$(str).appendTo($search_gtione.html(''));
						if(flag){
							$search_gtitwo.html('<option value="" selected >请选择二级分类</option>');
						}
					}else if(type==='two'){
						$(str).appendTo($search_gtitwo.html(''));
					}
				}else{
					console.log(resp.message||'error');
					if(type==='one'){
						$search_gtione.html('<option value="" selected >请选择一级分类</option>');
						$search_gtitwo.html('<option value="" selected >请选择二级分类</option>');
					}else if(type==='two'){
						$search_gtitwo.html('<option value="" selected >请选择二级分类</option>');
					}
				}
			}).fail(function(resp){
				console.log(resp.message||'error');
				if(type==='one'){
					$search_gtione.html('<option value="" selected >请选择一级分类</option>');
					$search_gtitwo.html('<option value="" selected >请选择二级分类</option>');
				}else if(type==='two'){
					$search_gtitwo.html('<option value="" selected >请选择二级分类</option>');
				}
			});
		}



		/*清空表单数据*/
		function emptyGoodsTypeData() {
			/*清除上传图片数据*/
			$admin_typeimage.attr({
				'data-image':''
			}).html('');
			/*重新查询分类数据*/
			goodstypeid='';
			getGoodsTypes(goodstypeid,'one',true);
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