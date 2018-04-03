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
				$admin_supplier_price=$('#admin_supplier_price'),
				$admin_inventory=$('#admin_inventory'),
				$admin_wholesale_price_thead=$('#admin_wholesale_price_thead'),
				$admin_wholesale_price_list=$('#admin_wholesale_price_list'),
				wholesale_price_theadstr='<tr>\
					<th>颜色</th>\
					<th>规格</th>\
					<th>库存</th>\
					<th>批发价</th>\
					<th>建议零售价</th>\
					<th>价格显示在首页</th>\
				</tr>',
				$admin_wholesale_tips=$('#admin_wholesale_tips'),
				$admin_isRecommended=$('#admin_isRecommended'),
				$admin_details=$('#admin_details'),
				price_data={},
				attr_data={},
				attr_map={},
				history_data={},
				listone={},
				listtwo={},
				admin_goodsadd_form=document.getElementById('admin_goodsadd_form'),
				$admin_goodsadd_form=$(admin_goodsadd_form),
				resetform0=null,
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
			$.each([$admin_wholesale_price,$admin_retail_price,$admin_supplier_price,$admin_inventory],function(){
				/*初始化*/
				var selector=this.selector;

				/*绑定价格格式化*/
				this.on('keyup',function(e){
					var tempval=this.value;
					if(selector.indexOf('price')!==-1){
						tempval=tempval.replace(/[^0-9\.]/g,'');
						tempval=tempval.replace(/[\.{2,}]/g,'');
						this.value=public_tool.moneyCorrect(tempval,12,false)[0];
					}else{
						tempval=tempval.replace(/\s*\D*/g,'');
						this.value=tempval;
					}
				});
			});


			/*绑定属性操作*/
			$admin_attrwrap.on('click focusout',function(e){
				var etype= e.type,
					target= e.target,
					node=target.nodeName.toLowerCase();



				/*点击事件*/
				if(etype==='click'){
					/*过滤*/
					if(node==='ul'||node==='div'||node==='label'||node==='span'||node==='label'){
						return false;
					}
					/*绑定操作事件*/

					/*绑定查看属性列表*/
					if(node==='button'||node==='i'){
						if(node==='i'){
							/*修正node节点*/
							target=target.parentNode;
						}
						(function(){
							var $this=$(target),
								key=$this.attr('data-key');

							if($this.hasClass('attr-item-btn')){
								/*扩展条件*/
								(function(){
									var $last=$(document.getElementById('attr_input_'+key)).find('input:last');


									$last.clone(true).attr({
										'data-value':''
									}).val('').insertAfter($last);

								}());
							}else if($this.hasClass('attr-item-listbtn')){
								/*查看属性类型*/
								$(document.getElementById('attr_list_'+key)).toggleClass('g-d-hidei');
							}
						}());
					}else if(node==='li'){
						/*绑定选择属性列表*/
						(function(){
							var $this=$(target),
								$ul=$this.parent(),
								key=$ul.attr('id').replace('attr_list_',''),
								isok/*数据过滤：只能组合两种数据*/,
								txt=$this.html(),
								code=$this.attr('data-value'),
								count=0,
								size,
								$inputitem=$(document.getElementById('attr_input_'+key)),
								$input;


							if($this.hasClass('admin-list-widget-active')){
								$this.removeClass('admin-list-widget-active');
								$input=$inputitem.find('input');
								$input.each(function(){
									var $self=$(this);
									if($self.val()===txt){
										$self.val('');
										delete attr_data[key][txt];
										$self.attr({'data-value':''});
										if($.isEmptyObject(attr_data[key])){
											dataRecord(key);
										}
										return false;
									}
								});
							}else{
								$this.addClass('admin-list-widget-active');
								if($.isEmptyObject(attr_data[key])){
									$input=$inputitem.find('input:first-child');
									$input.val(txt);
									attr_data[key][txt]=code;
									$input.attr({'data-value':txt});
								}else{
									$input=$inputitem.find('input');
									size=$input.size();
									$input.each(function(){
										var $self=$(this);
										if($self.val()===''){
											$self.val(txt);
											attr_data[key][txt]=code;
											$self.attr({'data-value':txt});
											return false;
										}
										count++;
									});
									if(count===size){
										var $lastinput=$input.eq(size-1),
											lasttxt=$lastinput.val();
										$ul.find('li.admin-list-widget-active').each(function(){
											var $templi=$(this),
												temptxt=$templi.html();
											if(lasttxt===temptxt){
												$templi.removeClass('admin-list-widget-active');
												delete attr_data[key][lasttxt];
												$lastinput.attr({'data-value':''});
												return false;
											}
										});
										$lastinput.val(txt);
										attr_data[key][txt]=code;
										$lastinput.attr({'data-value':txt});
									}
								}
								isok=dataRecord(key);
								if(isok!==null){
									syncAttrList((function () {
										var $previnput=$(document.getElementById('attr_input_'+isok)).find('input'),
											res=[];
										$previnput.each(function(){
											var prevtxt=$(this).val();
											if(prevtxt!==''){
												res.push(prevtxt);
											}
										});
										if(res.length!==0){
											clearAttrData('attrtxt',isok);
										}
										return res;
									}()),$(document.getElementById('attr_list_'+isok)).find('li'),'remove');
								}
							}

							/*组合条件*/
							groupCondition();

						}());
					}

				}else if(etype==='focusout'){
					/*过滤*/
					if(node!=='input'){
						return false;
					}
					/*失去焦点事件*/

					/*绑定输入框失去焦点事件*/
					(function(){
						var	$this=$(target),
							value=$this.val(),
							key=$this.attr('data-key'),
							isvalid=false,
							isok;
						if(value!==''){
							isvalid=validAttrData($this,key,value);
							if(isvalid){
								attr_data[key][value]=attr_map[key]['map'][value];
								$this.attr({
									'data-value':value
								});
								/*同步列表*/
								syncAttrList(value,key,'add');
								/*同步上次记录*/
								isok=dataRecord(key);
								if(isok!==null){
									syncAttrList((function () {
										var $previnput=$(document.getElementById('attr_input_'+isok)).find('input'),
											res=[];
										$previnput.each(function(){
											var prevtxt=$(this).val();
											if(prevtxt!==''){
												res.push(prevtxt);
											}
										});
										if(res.length!==0){
											clearAttrData('attrtxt',isok);
										}
										return res;
									}()),$(document.getElementById('attr_list_'+isok)).find('li'),'remove');
								}
							}
						}else{
							var tempvalue=$this.attr('data-value');
							if(typeof attr_data[key][tempvalue]!=='undefined'){
								delete attr_data[key][tempvalue];
								/*同步列表*/
								/*同步上次记录*/
								isok=dataRecord(key);
								if(isok!==null){
									syncAttrList((function () {
										var $previnput=$(document.getElementById('attr_input_'+isok)).find('input'),
											res=[];
										$previnput.each(function(){
											var prevtxt=$(this).attr('data-value');
											if(prevtxt!==''){
												res.push(prevtxt);
											}
										});
										if(res.length!==0){
											clearAttrData('attrtxt',isok);
										}
										return res;
									}()),$(document.getElementById('attr_list_'+isok)).find('li'),'remove');
								}else{
									/*同步列表*/
									syncAttrList(tempvalue,key,'remove');
								}
							}
						}
						/*组合条件*/
						groupCondition();

					}());
				}

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
						result=value.replace(/[^0-9\.]/g,'');
						result=result.replace(/\.{2,}/g,'.');
						$this.val(result);
					}else if(name==="setretailPrice"){
						result=value.replace(/[^0-9\.]/g,'');
						result=result.replace(/\.{2,}/g,'.');
						$this.val(result);
					}else if(name==="setsupplierPrice"){
						result=value.replace(/[^0-9\.]/g,'');
						result=result.replace(/\.{2,}/g,'.');
						$this.val(result);
					}
				}else if(etype==='focusout'){
					if(name==="setinventory"){
						if(value===''){
							$this.val('0');
						}
					}else if(name==="setwholesalePrice"){
						/*错误状态下禁止输入*/
						$this.val(public_tool.moneyCorrect(value,12,false)[0]);
					}else if(name==="setretailPrice"){
						/*错误状态下禁止输入*/
						$this.val(public_tool.moneyCorrect(value,12,false)[0]);
					}else if(name==="setsupplierPrice"){
						/*错误状态下禁止输入*/
						$this.val(public_tool.moneyCorrect(value,12,false)[0]);
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
									if(isattr){
										var tempprice=getSetPrice();
										if(tempprice===null){
											return false;
										}
										setdata['attrIventoryPrices']=tempprice;
									}else{
										setdata['attrIventoryPrices']='['+$admin_inventory.val()+'#'+public_tool.trimSep($admin_wholesale_price.val(),',')+'#'+public_tool.trimSep($admin_retail_price.val(),',')+'#'+public_tool.trimSep($admin_supplier_price.val(),',')+']';
									}

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

									config['url']="http://112.74.207.132:8082/yttx-providerbms-api/goods/addupdate";
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


		/*动态创建属性节点*/
		function createAttrNode(name,index,id){
			var inputstr='',
				itemstr='',
				label=name.replace(/(\(.*\))|(\（.*\）)|\s*/g,''),
				key='ATTR_ITEM_KEY'+index,
				result={};

			/*生成唯一值*/


			/*组装结果对象*/
			result['name']=name;
			result['key']=key;
			result['label']=label;


			/*创建输入项*/
			inputstr='<input type="text" class="form-control g-w-number4" data-id="'+id+'"  data-key="'+key+'" data-label="'+label+'" data-value="" />\
				<input type="text" class="form-control g-w-number4" data-id="'+id+'" data-key="'+key+'" data-label="'+label+'" data-value="" />\
				<input type="text" class="form-control g-w-number4" data-id="'+id+'"  data-key="'+key+'" data-label="'+label+'" data-value="" />';

			/*创建属性项*/
			itemstr='<div class="form-group" data-key="'+key+'">\
									<label class="control-label"><span class="attr-item-title" >'+name+':</span><span id="attr_tips_'+key+'" class="g-c-red1 attr-item-tips"></span></label>\
									<div class="input-group g-w-percent48">\
										<span class="attr-item-input" id="attr_input_'+key+'">'+inputstr+'</span>\
										<span class="input-group-btn pull-left admin-rpos-wrap" style="z-index:'+(100 - index * 2)+';">\
											<button type="button" class="btn btn-white attr-item-btn" id="attr_btn_'+key+'"  title="增加'+label+'条件" data-key="'+key+'"><i class="fa-angle-double-left"></i></button>\
											<button type="button" data-key="'+key+'" title="查看'+label+'类型" class="btn btn-white attr-item-listbtn"><i class="fa-list"></i></button>\
											<ul id="attr_list_'+key+'"  class="admin-list-widget color-list-widget g-d-hidei attr-item-list"></ul>\
										</span>\
									</div>\
								</div>';

			$(itemstr).appendTo($admin_attrwrap);
			return result;
		}



		/*获取数据*/
		function getEditData(config){
			if(!public_tool.isSameDomain("http://112.74.207.132:8082")){
				return false;
			}
			$.ajax({
				url:"http://112.74.207.132:8082/yttx-providerbms-api/goods/details",
				dataType:'JSON',
				async:false,
				method:'post',
				data:config
			}).done(function(resp){
				var code=parseInt(resp.code,10)||0;
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
		function syncAttrList(value,key,action){
			var $wrap;$(document.getElementById('attr_list_'+key)).find('li');

			if(typeof key==='string'){
				$wrap=$(document.getElementById('attr_list_'+key)).find('li');
			}else if(typeof key==='object'){
				$wrap=key;
			}

			if($.isArray(value)){
				var len=value.length,
					i=0;
				if(len!==0){
					for(i;i<len;i++){
						$wrap.each(function(){
							var $this=$(this),
								txt=$this.html();
							if(txt===value[i]){
								if(action==='add'){
									$this.addClass('admin-list-widget-active')
								}else if(action==='remove'){
									$this.removeClass('admin-list-widget-active');
								}
								return false;
							}
						});
					}
				}
			}else{
				$wrap.each(function(){
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
		}


		/*清空属性数据*/
		function clearAttrData(type,key){
			if(!type&&!key){
				attr_data={};
				price_data={};
				attr_map={};
				$admin_attrwrap.find('input').val('').attr({'data-value':''});
				$admin_wholesale_price.val('');
				$admin_retail_price.val('');
				$admin_supplier_price.val('');
				$admin_inventory.val('');
				$admin_pricewrap.removeClass('g-d-hidei');
				$admin_attrwrap.removeClass('g-d-hidei');
				$admin_wholesale_price_list.html('');
				$admin_wholesale_price_thead.html(wholesale_price_theadstr);
				$admin_attrwrap.find('ul').html('');
			}else if(type==='price'){
				price_data={};
				$admin_wholesale_price.val('');
				$admin_retail_price.val('');
				$admin_supplier_price.val('');
				$admin_inventory.val('');
			}else if(type==='attr'){
				attr_data={};
				attr_map={};
				$admin_attrwrap.find('input').val('').attr({'data-value':''});
				$admin_wholesale_price_list.html('');
				$admin_wholesale_price_thead.html(wholesale_price_theadstr);
				$admin_attrwrap.find('ul').html('');
			}else if(type==='all'){
				attr_data={};
				price_data={};
				attr_map={};
				$admin_attrwrap.find('input').val('').attr({'data-value':''});
				$admin_wholesale_price.val('');
				$admin_retail_price.val('');
				$admin_supplier_price.val('');
				$admin_inventory.val('');
				$admin_wholesale_price_list.html('');
				$admin_wholesale_price_thead.html(wholesale_price_theadstr);
				$admin_attrwrap.find('ul').html('');
			}else if(type==='pricetxt'){
				$admin_wholesale_price.val('');
				$admin_retail_price.val('');
				$admin_supplier_price.val('');
				$admin_inventory.val('');
			}else if(type==='attrtxt'){
				if(key){
					$(document.getElementById('attr_input_'+key)).find('input').val('').attr({'data-value':''});
					attr_data[key]={};
				}else{
					$admin_attrwrap.find('input').val('').attr({'data-value':''});
					for(var i in attr_data){
						attr_data[i]={};
					}
				}
				if(attr_data['record'].length<2){
					$admin_wholesale_price_list.html('');
					$admin_wholesale_price_thead.html(wholesale_price_theadstr);
				}
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
				i= 0;
			if(len!==0){
				$admin_attrwrap.html('');
				attr_map={};
				for(i;i<len;i++){
					var attr_obj=list[i],
						name=list[i]['name'],
						arr=list[i]['list'],
						id=list[i]['id'],
						j= 0,
						sublen=arr.length,
						str='',
						attritem=createAttrNode(name,i,id),
						labels=attritem['label'],
						key=attritem['key'];

					/*
					 * attr_map:查询到的结果集
					 *	attr_data:已经填入的属性对象
					 * */


					/*存入属性对象*/
					if(sublen!==0){
						/*没有填入对象即创建相关对象*/
						attr_obj['map']={};
						attr_obj['res']={};
						if(typeof attr_data[key]==='undefined'){
							attr_data[key]={};
						}
						/*遍历*/
						for(j;j<sublen;j++){
							var subobj=arr[j],
								attrvalue=subobj["goodsTagId"]+'_'+subobj["id"],
								attrtxt=subobj["name"];

							str+='<li data-value="'+attrvalue+'">'+attrtxt+'</li>';
							attr_obj['map'][attrtxt]=attrvalue;
							attr_obj['res'][subobj["id"]]=attrtxt;
						}

						attr_obj['label']=labels;
						attr_obj['key']=key;
						attr_map[key]=attr_obj;

						var $ul=$(document.getElementById('attr_list_'+key));
						$(str).appendTo($ul.html(''));
						$ul=null;
					}else if(sublen===0){
						attr_obj['map']={};
						attr_obj['res']={};
						if(typeof attr_data[key]==='undefined'){
							attr_data[key]={};
						}
						attr_obj['label']=labels;
						attr_obj['key']=key;
						attr_map[key]=attr_obj;
					}
					if(i===len - 1){
						/*添加操作记录*/
						attr_data['record']=[];
					}
				}
			}

		}


		/*校验是否存在正确值*/
		function validAttrData($input,key,txt){
			var prevtxt=$input.attr('data-value'),
				res=false,
				type='';


			if(!(txt in attr_map[key]['map'])){
				/*判断值是否存在*/
				type='exist';
				res=false;
			}else if(txt in attr_data[key]){
				/*判断值是否已选中*/
				$input.siblings().each(function(index){
					var $otherinput=$(this),
						othertxt=$otherinput.val();
					if(othertxt===txt){
						type='have';
						res=false;
					}
				});
			}else{
				res=true;
			}
			if(!res){
				var tips=document.getElementById('attr_tips_'+key);
				if(type==='exist'){
					tips.innerHTML='不存在 "'+txt+'" '+$input.attr('data-label');
				}else if(type==='have'){
					tips.innerHTML='您已经填写了 "'+txt+'" '+$input.attr('data-label');
				}
				if(prevtxt!==''){
					$input.val(prevtxt);
				}else{
					$input.val('');
				}
				setTimeout(function () {
					tips.innerHTML='';
					var list=document.getElementById('attr_list_'+key),
						listclass=list.className;

					if(listclass.indexOf('g-d-hidei')!==-1){
						listclass=listclass.replace(/g-d-hidei/g,'');
					}
					list.className=listclass;
				},2000);
			}
			return res;
		}


		/*记录操作记录,key:序列值,返回null，或多余的数据*/
		function dataRecord(key){
			var record=attr_data['record'].slice(0);

			if(!key){
				/*判断是否有key值*/
				return null;
			}
			if(!record){
				/*判断是否存在记录对象，没有就创建*/
				attr_data['record']=[];
			}

			var len=record.length;

			if(len===0){
				if(!$.isEmptyObject(attr_data[key])){
					attr_data['record'].push(key);
				}
				return null;
			}else if(len===1){
				if(key===record[0]){
					if($.isEmptyObject(attr_data[key])){
						attr_data['record'].length=0;
						return key;
					}
					return null;
				}else if(key!==record[0]){
					if(!$.isEmptyObject(attr_data[key])){
						attr_data['record'].push(key);
					}
					return null;
				}
				return null;
			}else if(len===2){
				var i= 0,
					count=0;
				for(i;i<2;i++){
					if(key===record[i]){
						if($.isEmptyObject(attr_data[key])){
							attr_data['record'].splice(i,1);
							return key;
						}
					}else if(key!==record[i]){
						count++;
					}
				}
				if(count===2){
					var res1=record[0],
						res2=record[1];
					attr_data['record'].length=0;
					attr_data['record'].push(res2,key);
					return res1;
				}
				return null;
			}
			return null;
		}


		/*组合颜色与尺寸*/
		function groupCondition(){
			var conitem=attr_data['record'],
				dataone,
				datatwo,
				rule=[],
				len=0,
				str='';


			if(conitem.length<2){
				$admin_wholesale_price_list.html('');
				$admin_wholesale_price_thead.html(wholesale_price_theadstr);
				return false;
			}

			var key1=conitem[0],
				key2=conitem[1];

			dataone=attr_data[key1];
			datatwo=attr_data[key2];
			for(var i in datatwo){
				var tempstr='';
				tempstr+=i+'_#_'+datatwo[i];
				rule.push(tempstr);
			}
			len=rule.length;
			$admin_wholesale_price_thead.html('<tr>\
			<th>'+attr_map[key1]['label']+'</th>\
			<th>'+attr_map[key2]['label']+'</th>\
			<th>库存</th>\
			<th>批发价</th>\
			<th>建议零售价</th>\
			<th>供应商价</th>\
			<th>价格显示在首页</th>\
			</tr>');
			var initindex=0;
			for(var j in dataone){
				var k= 0,
					itemone=dataone[j];
				str+='<tr><td rowspan="'+len+'">'+j+'</td>';
				for(k;k<len;k++){
					var itemtwo=rule[k].split('_#_'),
						code=itemone.split('_')[1]+'_'+itemtwo[1].split('_')[1];
					if(k===0){
						if(initindex===0){
							str+='<td>'+itemtwo[0]+'</td>' +
								'<td><input class="admin-table-input" name="setinventory" maxlength="7" type="text"></td>' +
								'<td><input class="admin-table-input" name="setwholesalePrice" maxlength="12" type="text"></td>' +
								'<td><input class="admin-table-input" name="setretailPrice" maxlength="12" type="text"></td>' +
								'<td><input class="admin-table-input" name="setsupplierPrice" maxlength="12" type="text"></td>' +
								'<td><input name="setisDefault" checked type="radio" data-value="'+code+'"></td></tr>';
						}else{
							str+='<td>'+itemtwo[0]+'</td>' +
								'<td><input class="admin-table-input" name="setinventory" maxlength="7" type="text"></td>' +
								'<td><input class="admin-table-input" name="setwholesalePrice" maxlength="12" type="text"></td>' +
								'<td><input class="admin-table-input" name="setretailPrice" maxlength="12" type="text"></td>' +
								'<td><input class="admin-table-input" name="setsupplierPrice" maxlength="12" type="text"></td>' +
								'<td><input name="setisDefault"  type="radio" data-value="'+code+'"></td></tr>';
						}
					}else{
						str+='<tr><td>'+itemtwo[0]+'</td>' +
							'<td><input class="admin-table-input" name="setinventory" maxlength="7" type="text"></td>' +
							'<td><input class="admin-table-input" name="setwholesalePrice" maxlength="12" type="text"></td>' +
							'<td><input class="admin-table-input" name="setretailPrice" maxlength="12" type="text"></td>' +
							'<td><input class="admin-table-input" name="setsupplierPrice" maxlength="12" type="text"></td>' +
							'<td><input name="setisDefault"  type="radio" data-value="'+code+'"></td></tr>';
					}
				}
				initindex++;
			}
			$(str).appendTo($admin_wholesale_price_list.html(''));
		}


		/*获取设置的价格数据*/
		function getSetPrice(){
			var result=[],
				$tr=$admin_wholesale_price_list.find('tr'),
				len=$tr.size(),
				j=0,
				count=0,
				trims=public_tool.trimSep,
				countitem=0;

			for(j;j<len;j++){
				var $input=$tr.eq(j).find('input'),
					sublen=$input.size();
				if(sublen!==0){
					var inventory=$input.eq(0).val(),
						wholesale=trims($input.eq(1).val(),','),
						retail=trims($input.eq(2).val(),','),
						supplier=trims($input.eq(3).val(),','),
						$isdefault=$input.eq(4),
						key=$isdefault.attr('data-value').split('_'),
						value=$isdefault.is(':checked')?1:0;

					if(inventory===''){
						count++;
						countitem=0;
						break;
					}
					if(wholesale===''){
						count++;
						countitem=1;
						break;
					}
					if(retail===''){
						count++;
						countitem=2;
						break;
					}
					if(supplier===''){
						count++;
						countitem=3;
						break;
					}

					result.push(inventory+'#'+wholesale+'#'+retail+'#'+value+'#'+key[0]+'#'+key[1]+'#'+supplier);

				}
			}
			if(result.length===0||(len!==0&&count!==0)){
				$("html,body").animate({
					scrollTop:$admin_wholesale_tips.offset().top - 200
				},200);
				$admin_wholesale_tips.html('填写商品信息');
				if(count!==0){
					$tr.eq(count - 1).find('input').eq(countitem).select();
				}
				setTimeout(function () {
					$admin_wholesale_tips.html('');
				},3000);
				return null;
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
								$admin_wholesale_price.val(public_tool.moneyCorrect(priceobj[1],12,false)[0]);
								$admin_retail_price.val(public_tool.moneyCorrect(priceobj[2],12,false)[0]);
								$admin_supplier_price.val((function(){
									var supplier=priceobj[6];
									if(supplier===''||isNaN(supplier)){
										supplier='0.00';
									}else{
										supplier=public_tool.moneyCorrect(supplier,12,false)[0];
									}
									return supplier;
								}()));
							}
						}
					}
					return false;
				}
			}else {
				/*有颜色和规格时*/
				if(price){
					priceobj=price;
					pricelen=price.length;
					if(pricelen!==0){
						var	attrmap={};


						/*解析第一属性*/
						(function(){
							var i=0;
							loopout:for(i;i<pricelen;i++){
								var attrdata=priceobj[i].split('#'),
									attrone=attrdata[4];

								for(var j in attr_map){
									var mapdata=attr_map[j],
										submap=mapdata['res'];
									for(var p in submap){
										if(p===attrone){
											if($.isEmptyObject(listone)){
												listone['label']=mapdata['label'];
												listone['res']=submap;
												listone['id']=mapdata['id'];
												listone['key']=mapdata['key'];
												listone['map']=mapdata['map'];
											}
											break loopout;
										}
									}
								}
							}
						}());


						/*解析第二属性*/
						if(!$.isEmptyObject(listone)){
							(function(){
								var i=0;
								loopout:for(i;i<pricelen;i++){
									var attrdata=priceobj[i].split('#'),
										attrtwo=attrdata[5];

									for(var j in attr_map){
										var mapdata=attr_map[j],
											submap=mapdata['res'];
										for(var p in submap){
											if(p===attrtwo){
												if($.isEmptyObject(listtwo)){
													listtwo['label']=mapdata['label'];
													listtwo['res']=submap;
													listtwo['id']=mapdata['id'];
													listtwo['key']=mapdata['key'];
													listtwo['map']=mapdata['map'];
												}
												break loopout;
											}
										}
									}
								}
							}());
						}else{
							document.getElementById('admin_wholesale_price_list').innerHTML='';
							document.getElementById('admin_wholesale_price_thead').innerHTML=wholesale_price_theadstr;
							return false;
						}


						/*解析组合*/
						if(!$.isEmptyObject(listtwo)){
							(function(){
								var i=0;
								for(i;i<pricelen;i++){
									var attrdata=priceobj[i].split('#'),
										attrone=attrdata[4],
										attrtwo=attrdata[5];


									var mapone=listone['res'];
									for(var m in mapone){
										if(m===attrone){
											if(!(m in attrmap)){
												/*不存在即创建*/
												attrmap[m]=[];
											}
											var maptwo=listtwo['res'];
											for(var n in maptwo){
												if(n===attrtwo){
													attrmap[m].push(attrdata);
													break;
												}
											}
											break;
										}
									}
								}
							}());
						}else{
							document.getElementById('admin_wholesale_price_list').innerHTML='';
							document.getElementById('admin_wholesale_price_thead').innerHTML=wholesale_price_theadstr;
							return false;
						}

						if(!$.isEmptyObject(attrmap)){
							$.extend(true,history_data,attrmap);
							return true;
						}else{
							document.getElementById('admin_wholesale_price_list').innerHTML='';
							document.getElementById('admin_wholesale_price_thead').innerHTML=wholesale_price_theadstr;
							return false;
						}
						return false;
					}else{
						document.getElementById('admin_wholesale_price_list').innerHTML='';
						document.getElementById('admin_wholesale_price_thead').innerHTML=wholesale_price_theadstr;
						return false;
					}
				}
			}
		}


		/*设置属性值*/
		function setAttrData(list){
			var count= 0,
				j=0,
				key1=listone['key'],
				key2=listtwo['key'],
				$input1wrap=$(document.getElementById('attr_input_'+key1)),
				$attrinput1=$input1wrap.find('input'),
				attrsize1=$attrinput1.size(),
				$input1btn=$(document.getElementById('attr_btn_'+key1)),
				$input2wrap=$(document.getElementById('attr_input_'+key2)),
				$attrinput2=$input2wrap.find('input'),
				attr2size=$attrinput2.size(),
				$input2btn=$(document.getElementById('attr_btn_'+key2));




			for(var i in list){
				/*组合数据一*/
				/*如果条件输入框不够，即创建一个条件框*/
				if($attrinput1.eq(attrsize1-1).val()!==''&&count===attrsize1){
					$input1btn.trigger('click');
					$attrinput1=$input1wrap.find('input');
					attrsize1=$attrinput1.size();
				}
				var $input1=$attrinput1.eq(j);
				$input1.val(listone['res'][i]);
				$input1.trigger('focusout');


				/*组合数据二*/
				if(j===0){
					var listitem=list[i],
						len=listitem.length,
						k= 0;
					for(k;k<len;k++){
						/*如果条件输入框不够，即创建一个条件框*/
						if($attrinput2.eq(attr2size-1).val()!==''&&len>attr2size){
							$input2btn.trigger('click');
							$attrinput2=$input2wrap.find('input');
							attr2size=$attrinput2.size();
						}
						var $input2=$attrinput2.eq(k);
						$input2.val(listtwo['res'][listitem[k][5]]);
						$input2.trigger('focusout');
					}
				}
				j++;
				count++;
			}
		}

		/*设置属性组合值*/
		function setGroupCondition(list){
			var $tr=$admin_wholesale_price_list.find('tr'),
				k=0,
				checkid=0;
			for(var j in list){
				var i= 0,
					dataitem=list[j],
					len=dataitem.length;
				for(i;i<len;i++){
					var item=dataitem[i],
						$td=$tr.eq(k).find('td'),
						ischeck=parseInt(item[3],10)===1?true:false;

					if(i===0){
						$td.eq(2).find('input').val(item[0]);
						$td.eq(3).find('input').val(public_tool.moneyCorrect(item[1],12,false)[0]);
						$td.eq(4).find('input').val(public_tool.moneyCorrect(item[2],12,false)[0]);
						$td.eq(5).find('input').val((function(){
							var supplier=item[6];
							if(supplier===''||isNaN(supplier)){
								supplier='0.00';
							}else{
								supplier=public_tool.moneyCorrect(supplier,12,false)[0];
							}
							return supplier;
						}()));
						$td.eq(6).find('input').prop({
							'checked':ischeck
						});
					}else{
						$td.eq(1).find('input').val(item[0]);
						$td.eq(2).find('input').val(public_tool.moneyCorrect(item[1],12,false)[0]);
						$td.eq(3).find('input').val(public_tool.moneyCorrect(item[2],12,false)[0]);
						$td.eq(4).find('input').val((function(){
							var supplier=item[6];
							if(supplier===''||isNaN(supplier)){
								supplier='0.00';
							}else{
								supplier=public_tool.moneyCorrect(supplier,12,false)[0];
							}
							return supplier;
						}()));
						$td.eq(5).find('input').prop({
							'checked':ischeck
						});
					}
					if(!ischeck){
						/*判断是否选中,有则跳过无则计数*/
						checkid++;
					}
					k++;
				}
			}
			/*全部没选中则，默认第一个选中*/
			if(checkid===k){
				$tr.eq(0).find('td').eq(6).find('input').prop({
					'checked':true
				});
			}
		}


		/*设置原始数据查看*/
		function setOldGroupCondition(list){
			var str='',
				x=0,
				checkid=0;
			for(var j in list){
				var k= 0,
					item=list[j],
					len=item.length;

				str+='<tr><td rowspan="'+len+'">'+listone['res'][j]+'</td>';
				for(k;k<len;k++){
					var dataitem=item[k],
						ischeck=parseInt(dataitem[3],10)===1?'是':'';
					if(k===0){
						str+='<td>'+listtwo['res'][dataitem[5]]+'</td>' +
							'<td>'+dataitem[0]+'</td>' +
							'<td>'+public_tool.moneyCorrect(dataitem[1],12,false)[0]+'</td>' +
							'<td>'+public_tool.moneyCorrect(dataitem[2],12,false)[0]+'</td>' +
							'<td>'+(function(){
								var supplier=dataitem[6];
								if(supplier===''||isNaN(supplier)){
									supplier='0.00';
								}else{
									supplier=public_tool.moneyCorrect(supplier,12,false)[0];
								}
								return supplier;
							}())+'</td>' +
							'<td>'+ischeck+'</td></tr>';
					}else{
						str+='<tr><td>'+listtwo['res'][dataitem[5]]+'</td>' +
							'<td>'+dataitem[0]+'</td>' +
							'<td>'+public_tool.moneyCorrect(dataitem[1],12,false)[0]+'</td>' +
							'<td>'+public_tool.moneyCorrect(dataitem[2],12,false)[0]+'</td>' +
							'<td>'+(function(){
								var supplier=dataitem[6];
								if(supplier===''||isNaN(supplier)){
									supplier='0.00';
								}else{
									supplier=public_tool.moneyCorrect(supplier,12,false)[0];
								}
								return supplier;
							}())+'</td>' +
							'<td>'+ischeck+'</td></tr>';
					}
					if(ischeck===''){
						/*判断是否选中,有则跳过无则计数*/
						checkid++;
					}
					x++;
				}
			}
			document.getElementById('admin_wholesale_price_thead_old').innerHTML='<tr><th>'+listone['label']+'</th><th>'+listtwo['label']+'</th><th>库存</th><th>批发价</th><th>建议零售价</th><th>供应商价</th><th>价格显示在首页</th></tr>';
			var pricelist=document.getElementById('admin_wholesale_price_old');
			pricelist.innerHTML=str;
			/*全部没选中则，默认第一个选中*/
			if(checkid===k){
				$(pricelist).find('tr:first-child').find('td').eq(6).html('是');
			}
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