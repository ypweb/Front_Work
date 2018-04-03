/*admin_member:成员设置*/
(function($,KE){
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
			var module_id='yttx-goods-edit'/*模块id，主要用于本地存储传值*/,
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
				edit_config={
					userId:decodeURIComponent(logininfo.param.userId),
					token:decodeURIComponent(logininfo.param.token),
					providerId:decodeURIComponent(logininfo.param.providerId)
				},
				$admin_goodsTypeId=$('#admin_goodsTypeId'),
				$admin_code=$('#admin_code'),
				$admin_name=$('#admin_name'),
				$admin_goodssort=$('#admin_goodssort'),
				$admin_status=$('#admin_status'),
				$admin_pricewrap=$('#admin_pricewrap'),
				$admin_attrwrap=$('#admin_attrwrap'),
				$admin_wholesale_price=$('#admin_wholesale_price'),
				$admin_retail_price=$('#admin_retail_price'),
				$admin_inventory=$('#admin_inventory'),
				$admin_color=$('#admin_color'),
				$admin_color_btn=$('#admin_color_btn'),
				$admin_rule=$('#admin_rule'),
				$admin_rule_btn=$('#admin_rule_btn'),
				$admin_color_tips=$('#admin_color_tips'),
				$admin_rule_tips=$('#admin_rule_tips'),
				$admin_wholesale_price_list=$('#admin_wholesale_price_list'),
				$admin_wholesale_tips=$('#admin_wholesale_tips'),
				$admin_isRecommended=$('#admin_isRecommended'),
				$admin_details=$('#admin_details'),
				$admin_color_listbtn=$('#admin_color_listbtn'),
				$admin_color_list=$('#admin_color_list'),
				$admin_rule_listbtn=$('#admin_rule_listbtn'),
				$admin_rule_list=$('#admin_rule_list'),
				price_data={},
				attr_data={},
				history_data={},
				admin_goodsadd_form=document.getElementById('admin_goodsadd_form'),
				$admin_goodsadd_form=$(admin_goodsadd_form),
				resetform0=null,
				colormap={},
				rulemap={},
				isattr=true,
				$admin_oldprice_btn=$('#admin_oldprice_btn'),
				$admin_oldprice_show=$('#admin_oldprice_show');


			/*轮播对象*/
			var $admin_slide_image=$('#admin_slide_image'),
				$admin_slide_btnl=$('#admin_slide_btnl'),
				$admin_slide_btnr=$('#admin_slide_btnr'),
				$admin_slide_tool=$('#admin_slide_tool'),
				slide_config={
					$slide_tool:$admin_slide_tool,
					$image:$admin_slide_image,
					$btnl:$admin_slide_btnl,
					$btnr:$admin_slide_btnr,
					active:'admin-slide-active',
					isDelete:true,
					len:5
				};


			/*编辑器图片上传对象*/
			var $editor_image_toggle=$('#editor_image_toggle'),
				$editor_image_list=$('#editor_image_list'),
				$editor_image_show=$('#editor_image_show'),
				$editor_image_select=$('#editor_image_select');;

			/*上传对象*/
			var slide_QN_Upload=new QiniuJsSDK(),
				editor_QN_Upload=new QiniuJsSDK(),
				upload_bars= [],
				ImageUpload_Token=getToken()||null/*获取token*/;


			/*图片上传预览*/
			if(ImageUpload_Token!==null){

				/*类型图片上传预览*/
				var slide_image_upload = slide_QN_Upload.uploader({
					runtimes: 'html5,html4,flash,silverlight',
					browse_button: 'admin_slide_view',
					uptoken :ImageUpload_Token.qiniuToken,// uptoken是上传凭证，由其他程序生成
					multi_selection:true,
					get_new_uptoken: false,// 设置上传文件的时候是否每次都重新获取新的uptoken
					unique_names:false,// 默认false，key为文件名。若开启该选项，JS-SDK会为每个文件自动生成key（文件名）
					save_key:false,//默认false。若在服务端生成uptoken的上传策略中指定了sava_key，则开启，SDK在前端将不对key进行任何处理
					domain:ImageUpload_Token.qiniuDomain,//bucket域名，下载资源时用到，必需
					flash_swf_url: '../../js/plugins/plupload/Moxie.swf',//引入flash，相对路径
					silverlight_xap_url : '../../js/plugins/plupload/Moxie.xap',
					max_retries: 3,// 上传失败最大重试次数
					dragdrop:false,
					chunk_size: '4mb',
					max_file_size : '2mb',
					auto_start:true,
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
						'BeforeUpload': function(up, file) {},
						'UploadProgress': function(up, file) {},
						'FileUploaded': function(up, file, info) {
							/*获取上传成功后的文件的Url*/
							var domain=up.getOption('domain'),
								name=JSON.parse(info);

							$('<li><img alt="" src="'+domain+'/'+name.key+"?imageView2/1/w/50/h/50"+'" /><span></span></li>').appendTo($admin_slide_tool);
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
							/*初始化轮播图*/
							goodsSlide.GoodsSlide(slide_config);
						},
						'Key': function(up, file) {
							/*调用滚动条*/
							uploadShowBars(file['id']);
							var str="goods_"+moment().format("YYYYMMDDHHmmSSSS");
							return str;
						}
					}
				});


				/*类型图片上传预览*/
				var editor_image_upload = editor_QN_Upload.uploader({
					runtimes: 'html5,html4,flash,silverlight',
					browse_button: 'editor_image_view',
					uptoken :ImageUpload_Token.qiniuToken,// uptoken是上传凭证，由其他程序生成
					multi_selection:true,
					get_new_uptoken: false,// 设置上传文件的时候是否每次都重新获取新的uptoken
					unique_names:false,// 默认false，key为文件名。若开启该选项，JS-SDK会为每个文件自动生成key（文件名）
					save_key:false,//默认false。若在服务端生成uptoken的上传策略中指定了sava_key，则开启，SDK在前端将不对key进行任何处理
					domain:ImageUpload_Token.qiniuDomain,//bucket域名，下载资源时用到，必需
					container:'editor_image_list',// 上传区域DOM ID，默认是browser_button的父元素
					flash_swf_url: '../../js/plugins/plupload/Moxie.swf',//引入flash，相对路径
					silverlight_xap_url : '../../js/plugins/plupload/Moxie.xap',
					max_retries: 3,// 上传失败最大重试次数
					dragdrop:false,
					chunk_size: '4mb',
					max_file_size : '4mb',
					auto_start:true,
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
						'BeforeUpload': function(up, file) {},
						'UploadProgress': function(up, file) {},
						'FileUploaded': function(up, file, info) {
							/*获取上传成功后的文件的Url*/
							var domain=up.getOption('domain'),
								name=JSON.parse(info),
								tempstr=domain+'/'+name.key+"?imageView2/1/w/170/h/140";

							$('<li><div><img alt="" src="'+tempstr+'" /></div>&lt;img alt="" src="'+tempstr+'"/&gt;</li>').appendTo($editor_image_show);
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
							var str="goods_"+moment().format("YYYYMMDDHHmmSSSS");
							return str;
						}
					}
				});
			}


			/*编辑器调用*/
			var editor=KE.create("#admin_details",{
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
			/*编辑器图片查看*/
			$editor_image_toggle.on('click', function () {
				$editor_image_list.toggleClass('g-d-hidei');
			});
			/*绑定选中图片*/
			$editor_image_show.on('click','li',function(){
				var $this=$(this);
				if($this.hasClass('editor-image-active')){
					$this.removeClass('editor-image-active')
				}else{
					$this.addClass('editor-image-active')
				}
			});
			/*绑定图片到编辑器*/
			$editor_image_select.on('click',function(){
				var tempitem=[],
					$imagelist=$editor_image_show.find('li'),
					size= $imagelist.size();

				if(size===0){
					return false;
				}else{
					var imagearr=[];
					$imagelist.each(function(){
						var $this=$(this);

						if($this.hasClass('editor-image-active')){
							var $img=$this.find('img'),
								src=$img.attr('src');
							if(src!==''&&src.indexOf('?imageView')!==-1){
								imagearr.push($this);
								editor.appendHtml('<p><img alt="" src="'+src.split('?imageView')[0]+'" /></p>')
							}
						}
					});
					/*清除class,并释放资源*/
					for(var i= 0;i<imagearr.length;i++){
						imagearr[i].removeClass('editor-image-active');
					}
					imagearr.length=0;
					/*编辑器同步一次*/
					editor.sync();
				}
			});


			/*轮播调用*/
			goodsSlide.GoodsSlide(slide_config);


			/*绑定价格输入,属性*/
			$.each([$admin_wholesale_price,$admin_retail_price,$admin_inventory],function(){
				/*初始化*/
				var selector=this.selector;

				/*绑定价格格式化*/
				if(selector.indexOf('price')!==-1){
					this.on('keyup',function(e){
						var tempval=this.value,
							result=public_tool.moneyCorrect(tempval,12,true);
						this.value=result[0];
						public_tool.cursorPos(this,result[0],'.');
					});

				}
			});
			$.each([$admin_color,$admin_rule],function(){
				/*初始化*/
				var $input=this.find('input'),
					type=this.selector.indexOf('color')!==-1?'color':'rule';


				/*事件绑定*/
				$input.on('focusout',function(){

					var $this=$(this),
						value=$this.val(),
						selector=$this.attr('name'),
						isvalid=false;
					if(value!==''){
						isvalid=validAttrData($this,type);
						if(isvalid){
							attr_data[selector]=value;
							$this.attr({
								'data-value':value
							});
							/*同步列表*/
							syncAttrList(value,type,'add');
						}
					}else{
						if(typeof attr_data[selector]!=='undefined'){
							var tempvalue=$this.attr('data-value');
							delete attr_data[selector];
							if(tempvalue!==''){
								/*同步列表*/
								syncAttrList(tempvalue,type,'remove');
								$this.attr({
									'data-value':''
								});
							}
						}
					}
					if($.isEmptyObject(attr_data)){
						clearAttrData('attrtxt');
					}else{
						/*组合条件*/
						groupCondition();
					}
				});
			});


			/*绑定新增颜色和规格尺寸*/
			$.each([$admin_color_btn,$admin_rule_btn],function(){
				var self=this,
					iscolor=this.selector.indexOf('color')!==-1?true:false;

				this.on('click',function(){
					var $last=self.parent().prev('input'),
						$input=$last.clone(true).val(''),
						name=iscolor?$input.attr('name').replace('color',''):$input.attr('name').replace('rule','');

					$input.attr({
						'name':iscolor?'color'+(parseInt(name,10)+1):'rule'+(parseInt(name,10)+1)
					}).insertAfter($last);
				});




			});


			/*绑定查看属性列表*/
			$.each([$admin_color_listbtn,$admin_rule_listbtn],function(){

				var iscolor=this.selector.indexOf('color')!==-1?true:false;

				this.on('click',function(){
					if(iscolor){
						if($admin_color_list.hasClass('g-d-hidei')){
							$admin_color_list.removeClass('g-d-hidei');
						}else{
							$admin_color_list.addClass('g-d-hidei');
						}
					}else {
						if($admin_rule_list.hasClass('g-d-hidei')){
							$admin_rule_list.removeClass('g-d-hidei');
						}else{
							$admin_rule_list.addClass('g-d-hidei');
						}
					}
				});



			});


			/*绑定选择属性列表*/
			$.each([$admin_color_list,$admin_rule_list],function(){

				var self=this,
					iscolor=this.selector.indexOf('color')!==-1?true:false;

				this.on('click','li',function(){
					var $this=$(this),
						txt=$this.html(),
						count=0,
						size,
						$input;


					if($this.hasClass('admin-list-widget-active')){
						$this.removeClass('admin-list-widget-active');
						$input=iscolor?$admin_color.find('input'):$admin_rule.find('input');
						$input.each(function(){
							var $self=$(this);
							if($self.val()===txt){
								$self.val('');
								delete attr_data[$self.attr('name')];
								$self.attr({'data-value':''});
								return false;
							}
						});
					}else{
						$this.addClass('admin-list-widget-active');

						if($.isEmptyObject(attr_data)){
							$input=iscolor?$admin_color.find('input:first-child'):$admin_rule.find('input:first-child');
							$input.val(txt);
							attr_data[$input.attr('name')]=txt;
							$input.attr({'data-value':txt});
						}else{
							$input=iscolor?$admin_color.find('input'):$admin_rule.find('input');
							size=$input.size();
							$input.each(function(){
								var $self=$(this);
								if($self.val()===''){
									$self.val(txt);
									attr_data[$self.attr('name')]=txt;
									$self.attr({'data-value':txt});
									return false;
								}
								count++;
							});
							if(count===size){
								var $lastinput=$input.eq(size-1),
									lasttxt=$lastinput.val(),
									lastname=$lastinput.attr('name');
								self.find('li.admin-list-widget-active').each(function(){
									var $templi=$(this),
										temptxt=$templi.html();
									if(lasttxt===temptxt){
										$templi.removeClass('admin-list-widget-active');
										delete attr_data[lastname];
										$lastinput.attr({'data-value':''});
										return false;
									}
								});
								$lastinput.val(txt);
								attr_data[lastname]=txt;
								$lastinput.attr({'data-value':txt});
							}
						}
					}


					/*组合条件*/
					groupCondition();
				});

			});


			/*绑定表格输入限制*/
			$admin_wholesale_price_list.delegate('input[type="text"]','keyup focusout',function(e){
				var $this=$(this),
					etype= e.type,
					name=$this.attr('name'),
					value=$this.val(),
					result,
					self=this;

				if(etype==='keyup'){
					if(name==="setinventory"){
						result=value.replace(/\D*/g,'');
						$this.val(result);
					}else if(name==="setwholesalePrice"){
						/*错误状态下禁止输入*/
						if($this.hasClass('g-c-red1')){
							return false;
						}
						result=public_tool.moneyCorrect(value,12,true);
						$this.val(result[0]);
						public_tool.cursorPos(this,result[0],'.');
					}else if(name==="setretailPrice"){
						if($this.hasClass('g-c-red1')){
							return false;
						}
						result=public_tool.moneyCorrect(value,12,true);
						$this.val(result[0]);
						public_tool.cursorPos(this,result[0],'.');
					}
				}else if(etype==='focusout'){
					if(name==="setwholesalePrice"){
						/*错误状态下禁止输入*/
						if($this.hasClass('g-c-red1')){
							return false;
						}
						var maxvalue=$this.parent().next().find('input[type="text"]').val();

						result=public_tool.moneyCorrect(value,12,true);

						if(maxvalue!==''&&result[0]!==''){
							maxvalue=public_tool.trimSep(maxvalue,',') * 100;
							var whole=public_tool.trimSep(result[0],',') * 100;
							if(whole>maxvalue){
								$this.addClass('g-c-red1');
								$admin_wholesale_tips.html('"批发价"不能大于"建议零售价"');
								whole=maxvalue / 100;
								result=public_tool.moneyCorrect(whole,12,true);
								setTimeout(function(){
									$this.removeClass('g-c-red1');
									$admin_wholesale_tips.html('');
									$this.val(result[0]);
									public_tool.cursorPos(self,result[0],'.');
								},3000);
							}
						}

					}else if(name==="setretailPrice"){
						/*错误状态下禁止输入*/
						if($this.hasClass('g-c-red1')){
							return false;
						}
						var minvalue=$this.parent().prev().find('input[type="text"]').val();
						result=public_tool.moneyCorrect(value,12,true);

						if(minvalue!==''&&result[0]!==''){
							minvalue=public_tool.trimSep(minvalue,',') * 100;
							var retail=public_tool.trimSep(result[0],',') * 100;
							if(retail<minvalue){
								$this.addClass('g-c-red1');
								$admin_wholesale_tips.html('"建议零售价"不能小于"批发价"');
								retail=minvalue / 100;
								result=public_tool.moneyCorrect(retail,12,true);
								setTimeout(function(){
									$this.removeClass('g-c-red1');
									$admin_wholesale_tips.html('');
									$this.val(result[0]);
									public_tool.cursorPos(self,result[0],'.');
								},3000);
							}
						}

					}
				}

			});


			/*绑定查看原来的数据*/
			$admin_oldprice_btn.on('click',function(){
				$admin_oldprice_show.toggleClass('g-d-hidei');
			});


			/*获取数据*/
			var edit_cache=public_tool.getParams('yttx-goods-edit');
			if(edit_cache){
				/*重置表单*/
				admin_goodsadd_form.reset();
				/*解析数据*/
				edit_config['id']=edit_cache['id'];
				getEditData(edit_config);
			}else{
				dia.content('<span class="g-c-bs-warning g-btips-warn">没有这个商品</span>').show();
				setTimeout(function () {
					dia.close();
					location.href='yttx-goods-manage.html';
				},2000);
			}



			/*绑定添加地址*/
			/*表单验证*/
			if($.isFunction($.fn.validate)) {
				/*配置信息*/
				var form_opt0={},
					formcache=public_tool.cache,
					basedata={
						userId:decodeURIComponent(logininfo.param.userId),
						token:decodeURIComponent(logininfo.param.token),
						providerId:decodeURIComponent(logininfo.param.providerId)
					};


				if(formcache.form_opt_0){
					$.each([formcache.form_opt_0],function(index){
						var formtype,
						config={
							dataType:'JSON',
							method:'post'
						};
						if(index===0){
							formtype='addgoods';
						}
						$.extend(true,(function () {
							if(formtype==='addgoods'){
								return form_opt0;
							}
						}()),(function () {
							if(formtype==='addgoods'){
								return formcache.form_opt_0;
							}
						}()),{
							submitHandler: function(form){
								var setdata={};

								$.extend(true,setdata,basedata);

								if(formtype==='addgoods'){

									if($admin_slide_tool.html()===''){
										$admin_slide_image.html('<div class="g-c-red1">请上传商品组图</div>');
										$("html,body").animate({scrollTop:300},200);
										setTimeout(function () {
											dia.close();
										},2000);
										return false;
									}


									/*同步编辑器*/
									editor.sync();
									$.extend(true,setdata,{
										id:edit_cache['id'],
										gcode:$admin_code.val(),
										name:$admin_name.val(),
										isRecommended:$admin_isRecommended.is(':checked')?true:false,
										goodsBrandId:1,
										sort:(function(){
											var sort=$admin_goodssort.val();
											if(sort===''){
												sort=1;
											}
											return sort;
										}()),
										status:$admin_status.find('option:selected').val(),
										parentId:$admin_goodsTypeId.html(),
										details:$admin_details.val(),
										goodsPictures1:(function(){
											var $imagelist=$admin_slide_tool.find('li'),
												imagearr=[],
												size= $imagelist.size();

											if(size===0){
												return '[]';
											}else{
												$imagelist.each(function(){
														var $img=$(this).find('img'),
															src=$img.attr('src');
													if(src!==''&&src.indexOf('?imageView')!==-1){
														imagearr.push(src.split('?imageView')[0]);
													}
												});
												if(imagearr.length!==0){
													return JSON.stringify(imagearr);
												}else{
													return '[]';
												}
											}
											return '[]';
										}())
									});

									if(isattr){
										setdata['attrIventoryPrices']=getSetPrice();
									}else{
										setdata['attrIventoryPrices']='['+$admin_inventory.val()+'#'+public_tool.trimSep($admin_wholesale_price.val(),',')+'#'+public_tool.trimSep($admin_retail_price.val(),',')+']';
									}
									config['url']="http://10.0.5.226:8082/yttx-providerbms-api/goods/addupdate";
									config['data']=setdata;
								}

								$.ajax(config).done(function(resp){
									var code;
									if(formtype==='addgoods'){
										code=parseInt(resp.code,10);
										if(code!==0){
											dia.content('<span class="g-c-bs-warning g-btips-warn">修改商品失败</span>').show();
											return false;
										}else{
											dia.content('<span class="g-c-bs-success g-btips-succ">修改商品成功</span>').show();
										}
									}


									setTimeout(function () {
										dia.close();
										if(formtype==='addgoods'){
											/*页面跳转*/
											location.href='yttx-goods-manage.html';
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
					resetform0=$admin_goodsadd_form.validate(form_opt0);
				}
			}



		}

		/*获取数据*/
		function getEditData(config){
			$.ajax({
				url:"http://10.0.5.226:8082/yttx-providerbms-api/goods/details",
				dataType:'JSON',
				async:false,
				method:'post',
				data:config
			}).done(function(resp){
				var code=parseInt(resp.code,10)||0;
				if(code!==0){
					if(code===999){
						/*清空缓存*/
						public_tool.clear();
						public_tool.clearCacheData();
						public_tool.loginTips();
					}
					console.log(resp.message);
					return false;
				}
				var result=resp.result;

				if(!result){
					return false;
				}

				if($.isEmptyObject(result)){
					return false;
				}


				/*解析分类*/
				$admin_goodsTypeId.html(result['goodsTypeId']);

				/*解析轮播图*/
				var banner=result['bannerList'];
				if(banner&&banner.length!==0){
					getSlideData(banner,slide_config);
				}

				/*解析属性*/
				getAttrData(result['tagsAttrsList']);


				/*解析详情*/
				var detail=result['details'];
				if(detail!==''){
					editor.html(detail);
					editor.sync();
				}

				/*解析名称*/
				var name=result['name'];
				if(typeof name !=='undefined'){
					$admin_name.val(name);
				}



				/*解析状态*/
				var status=result['status'];
				if(typeof status !=='undefined'&&status!==''){
					status=parseInt(status,10);
					$admin_status.find('option').each(function(){
						var $this=$(this),
							value=parseInt($this.val(),10);
						if(value===status){
							$this.prop({
								'selected':true
							});
							return false;
						}
					});
				}else{
					$admin_status.find('option:first-child').prop({
						'selected':true
					});
				}

				/*解析编码*/
				var gcode=result['gcode'];
				if(typeof gcode !=='undefined'){
					$admin_code.val(gcode);
				}

				/*解析排序*/
				var sort=result['sort'];
				if(typeof sort !=='undefined'){
					$admin_goodssort.val(sort);
				}

				/*解析是否被推荐*/
				$admin_isRecommended.prop({
					'checked':result['isRecommended']
				});

				/*解析库存，批发价，建议零售价*/
				var attr=getGroupCondition(result['tagsAttrsList'],result['attrInventoryPrices']);
				if(attr){
					/*设置属性值*/
					setAttrData(history_data);
					/*设置属性组合值*/
					setGroupCondition(history_data);
					/*设置原始属性组合值*/
					setOldGroupCondition(history_data);
				}



			}).fail(function(resp){
				console.log(resp.message||'error');
				return false;
			});


		}


		/*同步属性选择列表*/
		function syncAttrList(value,type,action){
			var $wrap;
			if(type==='color'){
				$wrap=$admin_color_list;
			}else if(type==='rule'){
				$wrap=$admin_rule_list;
			}
			$wrap.find('li').each(function(){
				var $this=$(this),
					txt=$this.html();
				if(txt===value){
					if(action==='add'){
						$this.addClass('admin-list-widget-active')
					}else if(action==='remove'){
						$this.removeClass('admin-list-widget-active');
					}
					return false;
				}
			});
		}


		/*清空属性数据*/
		function clearAttrData(type){
			if(!type){
				attr_data={};
				price_data={};
				colormap={};
				rulemap={};
				$admin_color.find('input').val('').attr({'data-value':''});
				$admin_rule.find('input').val('').attr({'data-value':''});
				$admin_wholesale_price.val('');
				$admin_retail_price.val('');
				$admin_inventory.val('');
				$admin_pricewrap.removeClass('g-d-hidei');
				$admin_attrwrap.removeClass('g-d-hidei');
				$admin_wholesale_price_list.html('').addClass('g-d-hidei');
				$admin_color_list.html('');
				$admin_rule_list.html('');
			}else if(type==='price'){
				price_data={};
				$admin_wholesale_price.val('');
				$admin_retail_price.val('');
				$admin_inventory.val('');
			}else if(type==='attr'){
				attr_data={};
				colormap={};
				rulemap={};
				$admin_color.find('input').val('').attr({'data-value':''});
				$admin_rule.find('input').val('').attr({'data-value':''});
				$admin_wholesale_price_list.html('').addClass('g-d-hidei');
				$admin_color_list.html('');
				$admin_rule_list.html('');
			}else if(type==='all'){
				attr_data={};
				price_data={};
				colormap={};
				rulemap={};
				$admin_color.find('input').val('').attr({'data-value':''});
				$admin_rule.find('input').val('').attr({'data-value':''});
				$admin_wholesale_price.val('');
				$admin_retail_price.val('');
				$admin_inventory.val('');
				$admin_wholesale_price_list.html('');
				$admin_color_list.html('');
				$admin_rule_list.html('');
			}else if(type==='pricetxt'){
				$admin_wholesale_price.val('');
				$admin_retail_price.val('');
				$admin_inventory.val('');
			}else if(type==='attrtxt'){
				$admin_color.find('input').val('').attr({'data-value':''});
				$admin_rule.find('input').val('').attr({'data-value':''});
				$admin_wholesale_price_list.html('').addClass('g-d-hidei');
			}
		}


		/*查询标签与属性*/
		function getAttrData(list){
			if(!list){
				isattr=false;
				$admin_pricewrap.removeClass('g-d-hidei');
				$admin_attrwrap.addClass('g-d-hidei');
				return false;
			}else{
				isattr=true;
				$admin_pricewrap.addClass('g-d-hidei');
				$admin_attrwrap.removeClass('g-d-hidei');
			}


			var len=list.length,
				i= 0,
				attrmap={
					'color':{
						'wrap':$admin_color_list,
						'map':colormap
					},
					'rule':{
						'wrap':$admin_rule_list,
						'map':rulemap
					}
				};

			if(len!==0){
				for(i;i<len;i++){
					var name=list[i]['name'],
						arr=list[i]['list'],
						j= 0,
						sublen=arr.length,
						str='',
						subobj,
						key='';

					if(name.indexOf('颜色')!==-1&&name.indexOf('公共属性')!==-1){
						key='color';
					}else if(name.indexOf('规格')!==-1){
						key='rule';
					}else{
						continue;
					}
					if(sublen!==0){
						for(j;j<sublen;j++){
							subobj=arr[j];
							var attrvalue=subobj["goodsTagId"]+'_'+subobj["id"],
								attrtxt=subobj["name"];

							/*flag:为是否更新标识*/
							if(attrtxt in attrmap[key]['map']){
								attrtxt=attrtxt+1;
							}

							str+='<li data-value="'+attrvalue+'">'+attrtxt+'</li>';
							attrmap[key]['map'][attrtxt]=attrvalue;
						}
						$(str).appendTo(attrmap[key]['wrap'].html(''));
					}
				}
				$admin_attrwrap.removeClass('g-d-hidei');
			}else{
				$admin_pricewrap.addClass('g-d-hidei');
			}
		}


		/*校验是否存在正确值*/
		function validAttrData($elem,type){
			var txt=$elem.val()||$elem.html(),
				prevtxt=$elem.attr('data-value');
			if(type==='color'){
				if(!(txt in colormap)){
					$admin_color_tips.html('不存在 "'+txt+'" 颜色');
					if(prevtxt!==''){
						$elem.val(prevtxt)||$elem.html(prevtxt);
					}else{
						$elem.val('')||$elem.html('');
					}
					setTimeout(function () {
						$admin_color_tips.html('');
						$admin_color_list.removeClass('g-d-hidei');
					},2000);
					return false;
				}
				return true;
			}else if(type==='rule'){
				if(!(txt in rulemap)){
					$admin_rule_tips.html('不存在 "'+txt+'" 规格/尺寸');
					if(prevtxt!==''){
						$elem.val(prevtxt)||$elem.html(prevtxt);
					}else{
						$elem.val('')||$elem.html('');
					}
					setTimeout(function () {
						$admin_rule_tips.html('');
						$admin_rule_list.removeClass('g-d-hidei');
					},2000);
					$admin_rule_list.removeClass('g-d-hidei');
					return false;
				}
				return true;
			}
			return false;
		}


		/*组合颜色与尺寸*/
		function groupCondition(){
			if($.isEmptyObject(attr_data)){
				$admin_wholesale_price_list.html('');
				return false;
			}
			var color={},
				rule=[],
				len= 0,
				str='';
			for(var i in attr_data){
				if(i.indexOf('color')!==-1){
					color[i]=attr_data[i];
				}else if(i.indexOf('rule')!==-1){
					var tempobj={};
					tempobj['name']=attr_data[i];
					rule.push(tempobj);
				}
			}

			len=rule.length;
			if($.isEmptyObject(color)||len===0){
				$admin_wholesale_price_list.html('');
				return false;
			}


			for(var j in color){
				var k= 0,
					colorvalue=color[j];
				str+='<tr><td rowspan="'+len+'">'+colorvalue+'</td>';
				for(k;k<len;k++){
					var name=rule[k]["name"],
						code=colormap[colorvalue].split('_')[1]+'_'+rulemap[name].split('_')[1];
					if(k===0){
						str+='<td>'+name+'</td>' +
							'<td><input class="admin-table-input" name="setinventory" maxlength="5" type="text"></td>' +
							'<td><input class="admin-table-input" name="setwholesalePrice" maxlength="12" type="text"></td>' +
							'<td><input class="admin-table-input" name="setretailPrice" maxlength="12" type="text"></td>' +
							'<td><input name="setisDefault"  type="radio" data-value="'+code+'"></td></tr>';
					}else{
						str+='<tr><td>'+name+'</td>' +
							'<td><input class="admin-table-input" name="setinventory" maxlength="5" type="text"></td>' +
							'<td><input class="admin-table-input" name="setwholesalePrice" maxlength="12" type="text"></td>' +
							'<td><input class="admin-table-input" name="setretailPrice" maxlength="12" type="text"></td>' +
							'<td><input name="setisDefault"  type="radio" data-value="'+code+'"></td></tr>';
					}
				}
			}
			$(str).appendTo($admin_wholesale_price_list.html('').removeClass('g-d-hidei'));
		}


		/*获取设置的价格数据*/
		function getSetPrice(){
			var result=[],
				$tr=$admin_wholesale_price_list.find('tr'),
				len=$tr.size(),
				j=0;

			for(j;j<len;j++){
				var $input=$tr.eq(j).find('input'),
					sublen=$input.size(),
					m= 0,
					str='';
				for(m;m<sublen;m++){
					var $this=$input.eq(m);

					if(m!==3){
						var tempstr=$this.val();
						if(tempstr.indexOf(',')!==-1){
							tempstr=public_tool.trimSep(tempstr,',');
						}
						str+=tempstr+'#';
					}else{
						var key=$this.attr('data-value').split('_'),
							value=$this.is(':checked')?1:0;

						str+=value+'#'+key[0]+'#'+key[1];
					}
				}
				result.push(str);
			}
			return JSON.stringify(result);
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
						setTimeout(function(){
							show_loading_bar(bars);
						},0);
						break;
					}
				}
			}
		}


		/*删除图片(需要后台支持)和另外的base64方法支持*/
		function deleteSlideImage(obj){
			var $li=obj.$liitem,
				slideobj=obj.slideobj,
				tips=obj.tips,
				$img=$li.find('img'),
				src=$img.attr('src');

			if(src.indexOf('qiniucdn.com/')!==-1){
				src=src.split('qiniucdn.com/')[1];
				if(src.indexOf('?imageView2')!==-1){
					src=src.split('?imageView2')[0];
				}
				$.ajax({
					url:"http://rs.qiniu.com/delete/"+Base64Fun.encode64(src),
					dataType:'JSON',
					method:'post',
					data:{
						Authorization:'QBox '+ImageUpload_Token.qiniuToken
					}
				}).done(function(resp){
					console.log(resp);
					$li.remove();
					slideobj.init(slideobj);
					tips.content('<span class="g-c-bs-success g-btips-succ">删除数据成功</span>');
					setTimeout(function(){
						tips.close();
					},2000);
				}).fail(function(resp){
					tips.content('<span class="g-c-bs-warning g-btips-warn">删除数据成功</span>');
					setTimeout(function(){
						tips.close();
					},2000);
					console.log(resp);
				});
			}








			/*console.log(li);
			console.log(slideobj);
			console.log(tips);*/


		}


		/*通过价格反向解析标签与属性*/
		function getGroupCondition(attr,price){
			var attrlen= 0,
				pricelen= 0,
				priceobj;

			if(attr){
				attrlen=attr.length;
			}

			if(attrlen===0){
				/*没有颜色和规格时*/
				if(price){
					pricelen=price.length;
					if(pricelen!==0){
						priceobj=price[0];
						if(priceobj!==null||priceobj!==''){
							priceobj=priceobj.split("#");
							if(priceobj.length!==0){
								$admin_inventory.val(priceobj[0]);
								$admin_wholesale_price.val(public_tool.moneyCorrect(priceobj[1],12,true)[0]);
								$admin_retail_price.val(public_tool.moneyCorrect(priceobj[2],12,true)[0]);
							}
						}
					}
					return false;
				}
			}else {
				/*有颜色和规格时*/
				if(price){
					pricelen=price.length;
					if(pricelen!==0){
						var colorlist,
							rulelist,
							colorlen= 0,
							rulelen=0;

						/*查询颜色和规则列表*/
						for(var p=0;p<attrlen;p++){
							if(attr[p]['name'].indexOf('颜色')!==-1&&attr[p]['name'].indexOf('公共')!==-1){
								colorlist=attr[p]['list'];
								colorlen=colorlist.length;
							}
							if(attr[p]['name'].indexOf('规格')!==-1&&attr[p]['name'].indexOf('公共')!==-1){
								rulelist=attr[p]['list'];
								rulelen=rulelist.length;
							}
						}

						/*是否存在颜色和规则*/
						if(colorlen===0){
							$admin_wholesale_price_list.addClass('g-d-hidei').html('');
							return false;
						}
						if(rulelen===0){
							$admin_wholesale_price_list.addClass('g-d-hidei').html('');
							return false;
						}

						/*过滤空数据和null数据*/
						priceobj=price;
						var i= 0,
							tempprice=[];

						for(i;i<pricelen;i++){
							if(priceobj[i]!==null){
								if(priceobj[i]!==''){
									tempprice.push(priceobj[i]);
								}
							}
						}
						priceobj=tempprice.slice(0);
						tempprice.length=0;
						pricelen=priceobj.length;


						if(pricelen===0){
							$admin_wholesale_price_list.addClass('g-d-hidei').html('');
							return false;
						}


						/*解析属性和规格*/
						var j= 0,
							cmap={};
						for(j;j<pricelen;j++){
							var temparr=priceobj[j].split('#'),
								attrid=parseInt(temparr[4],10),
								ruleid=parseInt(temparr[5],10),
								m= 0;
							for(m;m<colorlen;m++){
								if(colorlist[m]['id']===attrid){
									var cname=colorlist[m]['name'];

									if(!(cname in cmap)){
										/*不存在即创建*/
										cmap[cname]=[];
									}
									var n=0;
									for(n;n<rulelen;n++){
										if(rulelist[n]['id']===ruleid){
											var rname=rulelist[n]['name'],
												rarr=[];

											rarr.push(temparr[0],temparr[1],temparr[2],temparr[3],cname,rname);
											cmap[cname].push(rarr);
											break;
										}
									}
									break;
								}

							}
						}

						if(!$.isEmptyObject(cmap)){
							$.extend(true,history_data,cmap);
							return true;
						}else{
							$admin_wholesale_price_list.addClass('g-d-hidei').html('');
							return false;
						}
						return false;
					}
				}
			}
		}


		/*设置属性值*/
		function setAttrData(list){
			var count= 0,j=0;
			for(var i in list){

				/*组合规格*/
				if(j===0){
					var listitem=list[i],
						len=listitem.length,
						k=0;
					for(k;k<len;k++){
						var $ruleinput=$admin_rule.find('input'),
							rulesize=$ruleinput.size();
						/*如果条件输入框不够，即创建一个条件框*/
						if($ruleinput.eq(rulesize-1).val()!==''&&len===rulesize){
							$admin_rule_btn.trigger('click');
							$ruleinput=$admin_rule.find('input');
							rulesize=$ruleinput.size();
						}
						var $rinput=$ruleinput.eq(k);
						$rinput.val(listitem[k][5]);
						$rinput.trigger('focusout');
					}
				}

				/*组合颜色*/
				var $colorinput=$admin_color.find('input'),
					colorsize=$colorinput.size();
				count++;
				/*如果条件输入框不够，即创建一个条件框*/
				if($colorinput.eq(colorsize-1).val()!==''&&count===colorsize){
					$admin_color_btn.trigger('click');
					$colorinput=$admin_color.find('input');
					colorsize=$colorinput.size();
				}
				var $cinput=$colorinput.eq(j);
				$cinput.val(i);
				$cinput.trigger('focusout');
				j++;
			}
		}

		/*设置属性组合值*/
		function setGroupCondition(list){
			var $tr=$admin_wholesale_price_list.find('tr'),
				k=0;
			for(var j in list){
				var i= 0,
					dataitem=list[j],
					len=dataitem.length;
				for(i;i<len;i++){
					var item=dataitem[i],
						$td=$tr.eq(k).find('td');
					if(i===0){
						$td.eq(2).find('input').val(item[0]);
						$td.eq(3).find('input').val(public_tool.moneyCorrect(item[1],12,true)[0]);
						$td.eq(4).find('input').val(public_tool.moneyCorrect(item[2],12,true)[0]);
						$td.eq(5).find('input').prop({
							'checked':(parseInt(item[3],10)===1?true:false)
						});
					}else{
						$td.eq(1).find('input').val(item[0]);
						$td.eq(2).find('input').val(public_tool.moneyCorrect(item[1],12,true)[0]);
						$td.eq(3).find('input').val(public_tool.moneyCorrect(item[2],12,true)[0]);
						$td.eq(4).find('input').prop({
							'checked':(parseInt(item[3],10)===1?true:false)
						});
					}
					k++;
				}
			}
		}


		/*设置原始数据查看*/
		function setOldGroupCondition(list){
			var str='';
			for(var j in list){
				var k= 0,
					item=list[j],
					len=item.length;

				str+='<tr><td rowspan="'+len+'">'+j+'</td>';
				for(k;k<len;k++){
					var dataitem=item[k];
					if(k===0){
						str+='<td>'+dataitem[5]+'</td>' +
							'<td>'+dataitem[0]+'</td>' +
							'<td>'+public_tool.moneyCorrect(dataitem[1],12,true)[0]+'</td>' +
							'<td>'+public_tool.moneyCorrect(dataitem[2],12,true)[0]+'</td>' +
							'<td>'+(parseInt(dataitem[3],10)===1?'是':'')+'</td></tr>';
					}else{
						str+='<tr><td>'+dataitem[5]+'</td>' +
							'<td>'+dataitem[0]+'</td>' +
							'<td>'+public_tool.moneyCorrect(dataitem[1],12,true)[0]+'</td>' +
							'<td>'+public_tool.moneyCorrect(dataitem[2],12,true)[0]+'</td>' +
							'<td>'+(parseInt(dataitem[3],10)===1?'是':'')+'</td></tr>';
					}
				}
			}
			document.getElementById('admin_wholesale_price_old').innerHTML=str;
		}


		/*解析轮播图*/
		function getSlideData(list,config){
			var len=list.length,
				i= 0,
				str='';
			for(i;i<len;i++){
				var url=list[i]['imageUrl'];
				if(url.indexOf('qiniucdn.com')!==-1){
					if(url.indexOf('?imageView2')!==-1){
						url=url.split('?imageView2')[0]+'?imageView2/1/w/50/h/50';
					}else{
						url=url+'?imageView2/1/w/50/h/50';
					}
					str+='<li><img alt="" src="'+url+'" /><span></span></li>';
				}else {
					str+='<li><img alt="" src="'+url+'" /><span></span></li>';
				}
			}
			$(str).appendTo(config.$slide_tool.html(''));
			/*调用轮播*/
			goodsSlide.GoodsSlide(config);
		}


	});



})(jQuery,KindEditor);