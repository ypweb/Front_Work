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
			var module_id='yttx-goods-add'/*模块id，主要用于本地存储传值*/,
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
				$admin_goodsTypeId_Level1=$('#admin_goodsTypeId_Level1'),
				$admin_goodsTypeId_Level2=$('#admin_goodsTypeId_Level2'),
				$admin_goodsTypeId_Level3=$('#admin_goodsTypeId_Level3'),
				$admin_goodsTypeId_btn=$('#admin_goodsTypeId_btn'),
				$admin_code=$('#admin_code'),
				$admin_name=$('#admin_name'),
				$admin_goodssort=$('#admin_goodssort'),
				$admin_wholesale_price=$('#admin_wholesale_price'),
				$admin_retail_price=$('#admin_retail_price'),
				$admin_inventory=$('#admin_inventory'),
				$admin_pricewrap=$('#admin_pricewrap'),
				$admin_attrwrap=$('#admin_attrwrap'),
				$admin_addlabel_btn=$('#admin_addlabel_btn'),
				$admin_wholesale_price_thead=$('#admin_wholesale_price_thead'),
				$admin_wholesale_price_list=$('#admin_wholesale_price_list'),
				wholesale_price_theadstr='<tr>\
					<th>颜色</th>\
					<th>规格</th>\
					<th>库存</th>\
					<th>批发价</th>\
					<th>出厂价</th>\
					<th>价格显示在首页</th>\
				</tr>',
				$admin_wholesale_tips=$('#admin_wholesale_tips'),
				$admin_isRecommended=$('#admin_isRecommended'),
				$admin_details=$('#admin_details'),
				$admin_status=$('#admin_status'),
				price_data={},
				attr_data={},
				admin_goodsadd_form=document.getElementById('admin_goodsadd_form'),
				$admin_goodsadd_form=$(admin_goodsadd_form),
				resetform0=null,
				resetform1=null,
				resetform2=null,
				resetform3=null,
				attr_map={},
				have_attr=false,
				istypeid='';


			/*上传对象*/
			var addtype_QN_Upload=new QiniuJsSDK(),
				slide_QN_Upload=new QiniuJsSDK(),
				editor_QN_Upload=new QiniuJsSDK(),
				upload_bars= [],
				ImageUpload_Token=getToken()||null/*获取token*/;



			/*新增类弹出框*/
			var $show_addtype_wrap=$('#show_addtype_wrap'),
				$admin_gtCode=$('#admin_gtCode'),
				$admin_typename=$('#admin_typename'),
				$admin_sort=$('#admin_sort'),
				$admin_image=$('#admin_image'),
				$toggle_edit_btn=$('#toggle_edit_btn'),
				$image_url_file=$('#image_url_file'),
				$image_url_upload=$('#image_url_upload'),
				$admin_goodsTypeId_addone=$('#admin_goodsTypeId_addone'),
				$admin_goodsTypeId_addtwo=$('#admin_goodsTypeId_addtwo'),
				admin_addtype_form=document.getElementById('admin_addtype_form'),
				$admin_addtype_form=$(admin_addtype_form);



			/*新增属性，标签*/
			var $show_addattr_wrap=$('#show_addattr_wrap'),
				admin_addattr_form=document.getElementById('admin_addattr_form'),
				$admin_addattr_form=$(admin_addattr_form),
				$admin_addattr_tips=$('#admin_addattr_tips'),
				$admin_newattr=$('#admin_newattr'),
				$admin_addattr_already=$('#admin_addattr_already'),
				$admin_addattr_list=$('#admin_addattr_list'),
				$show_addlabel_wrap=$('#show_addlabel_wrap'),
				admin_addlabel_form=document.getElementById('admin_addlabel_form'),
				$admin_addlabel_form=$(admin_addlabel_form),
				$admin_addlabel_tips=$('#admin_addlabel_tips'),
				$admin_newlabel=$('#admin_newlabel'),
				$admin_addlabel_already=$('#admin_addlabel_already'),
				$admin_addlabel_list=$('#admin_addlabel_list');




			var typeobj={
				$typeone:$admin_goodsTypeId_Level1,
				$typetwo:$admin_goodsTypeId_Level2,
				$typethree:$admin_goodsTypeId_Level3,
				$addone:$admin_goodsTypeId_addone,
				$addtwo:$admin_goodsTypeId_addtwo,
				userId:decodeURIComponent(logininfo.param.userId),
				token:decodeURIComponent(logininfo.param.token),
				providerId:decodeURIComponent(logininfo.param.providerId)
			}/*初始化查询查询类型*/



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
				$editor_image_select=$('#editor_image_select');


			/*重置表单*/
			admin_goodsadd_form.reset();
			admin_addtype_form.reset();
			admin_addattr_form.reset();
			admin_addlabel_form.reset();



			/*图片上传预览*/
			if(ImageUpload_Token!==null){
				/*类型图片上传预览*/
				var addtype_image_upload = addtype_QN_Upload.uploader({
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
					chunk_size: '2mb',
					auto_start:false,
					max_file_size : '200kb',
					filters:{
						mime_types: [
							{
								title : "Image files",
								extensions : "jpg,gif,png,jpeg"
							}
						]
					},
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
									addtype_image_upload.start();
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
						'BeforeUpload': function(up, file) {
							show_loading_bar(30);
						},
						'UploadProgress': function(up, file) {},
						'FileUploaded': function(up, file, info) {
							/*获取上传成功后的文件的Url*/
							var domain=up.getOption('domain'),
								name=JSON.parse(info);
							$admin_image.val(domain+'/'+name.key);
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
							var str="gt_"+moment().format("YYYYMMDDHHmmSSSS");
							return str;
						}
					}
				});


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
					auto_start:true,
					max_file_size :'2mb',
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
					auto_start:true,
					max_file_size : '4mb',
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


			/*绑定查询选中*/
			$.each([$admin_goodsTypeId_Level1,$admin_goodsTypeId_Level2,$admin_goodsTypeId_Level3,$admin_goodsTypeId_addone],function(){
				var self=this,
					selector=this.selector,
					hastype=false;

				/*初始化查询一级分类*/
				if(selector.indexOf('1')!==-1){
					getGoodsTypes('',typeobj,'one',true);
				}

				this.on('change',function(){
					var value=$(this).val();
					clearAttrData('attr');
					if(selector.indexOf('1')!==-1){
						istypeid=value;
						if(value===''){
							$admin_goodsTypeId_Level2.html('');
							$admin_goodsTypeId_Level3.html('');
							$admin_attrwrap.addClass('g-d-hidei');
							$admin_pricewrap.removeClass('g-d-hidei');
							return false;
						}
						have_attr=getAttrData(value,typeobj);
						if(have_attr){
							$admin_pricewrap.addClass('g-d-hidei');
							$admin_attrwrap.removeClass('g-d-hidei');
						}else{
							$admin_pricewrap.removeClass('g-d-hidei');
							$admin_attrwrap.addClass('g-d-hidei');
						}
						getGoodsTypes(value,typeobj,'two');
					}else if(selector.indexOf('2')!==-1){
						istypeid=value;
						if(value===''){
							$admin_goodsTypeId_Level3.html('');
							have_attr=getAttrData($admin_goodsTypeId_Level1.find('option:selected').val(),typeobj);
							if(have_attr){
								$admin_pricewrap.addClass('g-d-hidei');
								$admin_attrwrap.removeClass('g-d-hidei');
							}else{
								$admin_pricewrap.removeClass('g-d-hidei');
								$admin_attrwrap.addClass('g-d-hidei');
							}
							return false;
						}
						have_attr=getAttrData(value,typeobj);
						if(have_attr){
							$admin_pricewrap.addClass('g-d-hidei');
							$admin_attrwrap.removeClass('g-d-hidei');
						}else{
							$admin_pricewrap.removeClass('g-d-hidei');
							$admin_attrwrap.addClass('g-d-hidei');
						}
						getGoodsTypes(value,typeobj,'three');
					}else if(selector.indexOf('3')!==-1){
						istypeid=value;
						if(value===''){
							have_attr=getAttrData($admin_goodsTypeId_Level2.find('option:selected').val(),typeobj);
							if(have_attr){
								$admin_pricewrap.addClass('g-d-hidei');
								$admin_attrwrap.removeClass('g-d-hidei');
							}else{
								$admin_pricewrap.removeClass('g-d-hidei');
								$admin_attrwrap.addClass('g-d-hidei');
							}
							return false;
						}
						have_attr=getAttrData(value,typeobj);
						if(have_attr){
							$admin_pricewrap.addClass('g-d-hidei');
							$admin_attrwrap.removeClass('g-d-hidei');
						}else{
							$admin_pricewrap.removeClass('g-d-hidei');
							$admin_attrwrap.addClass('g-d-hidei');
						}
					}else if(selector.indexOf('one')!==-1){
						if(value===''){
							$admin_goodsTypeId_addtwo.html('');
							return false;
						}
						getAddGoodsTypes(value,typeobj,'two');
					}
				});
			});


			/*绑定价格输入,属性*/
			$.each([$admin_wholesale_price,$admin_retail_price,$admin_inventory],function(){
				/*初始化*/
				var selector=this.selector;

				/*绑定价格格式化*/
				if(selector.indexOf('price')!==-1){
					this.on('keyup',function(e){
						var tempval=this.value;

						tempval=tempval.replace(/[^0-9\.]/g,'');
						tempval=tempval.replace(/[\.{2,}]/g,'');
						this.value=public_tool.moneyCorrect(tempval,12,true)[0];
					});

				}
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
							}else if($this.hasClass('attr-item-addbtn')){
								/*添加属性*/
								(function(){
									/*加载数据*/
									var str='',
										map=attr_map[key]['map'];
									for(var i in map){
										str+='<li>'+i+'</li>';
									}
									$(str).appendTo($admin_addattr_list.html(''));
									/*设置key和id值*/
									$admin_newattr.attr({
										'data-id':attr_map[key]['id'],
										'data-key':key
									});
									/*显示弹出框*/
									$show_addattr_wrap.modal('show',{
										backdrop:'static'
									});
								}());
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
						if($this.hasClass('g-c-red1')){
							return false;
						}
						result=value.replace(/[^0-9\.]/g,'');
						result=result.replace(/\.{2,}/g,'.');
						$this.val(result);
					}else if(name==="setretailPrice"){
						if($this.hasClass('g-c-red1')){
							return false;
						}
						result=value.replace(/[^0-9\.]/g,'');
						result=result.replace(/\.{2,}/g,'.');
						$this.val(result);
					}
				}else if(etype==='focusout'){
					if(name==="setwholesalePrice"){
						/*错误状态下禁止输入*/
						if($this.hasClass('g-c-red1')){
							return false;
						}
						$this.val(public_tool.moneyCorrect(value,12,true)[0]);

					}else if(name==="setretailPrice"){
						/*错误状态下禁止输入*/
						if($this.hasClass('g-c-red1')){
							return false;
						}
						$this.val(public_tool.moneyCorrect(value,12,true)[0]);
					}
				}

			});



			/*绑定轮播图*/
			goodsSlide.GoodsSlide(slide_config);



			/*绑定新增类型,新增标签*/
			$.each([$admin_goodsTypeId_btn,$admin_addlabel_btn],function(){
				var selector=this.selector;

				if(selector.indexOf('goodsTypeId')!==-1){
					this.on('click',function(){
						$show_addtype_wrap.modal('show',{
							backdrop:'static'
						});
					});
				}else if(selector.indexOf('addlabel')!==-1){
					this.on('click',function(){
						/*加载数据*/
						var str='';
						for(var i in attr_map){
							str+='<li>'+attr_map[i]['label']+'</li>';
						}
						$(str).appendTo($admin_addlabel_list.html(''));
						/*弹出框*/
						$show_addlabel_wrap.modal('show',{
							backdrop:'static'
						});
					});
				}
			});



			/*类型图片缩略图切换编辑状态*/
			$toggle_edit_btn.on('click',function(){
				var $this=$(this),
					isactive=$this.hasClass('toggle-edit-btnactive');
				if(isactive){
					$this.removeClass('toggle-edit-btnactive');
					$admin_image.prop({
						'readonly':true
					});
				}else{
					$this.addClass('toggle-edit-btnactive');
					$admin_image.prop({
						'readonly':false
					});
				}

			});



			/*绑定显示隐藏新增类型中的已存在编码和名称*/
			$.each([$admin_addattr_already,$admin_addlabel_already],function(){
				var self=this,
					selector=this.selector;

				this.on('click',function(e){
					if(selector.indexOf('addattr')!==-1){
						if($admin_addattr_list.hasClass('g-d-hidei')){
							$admin_addattr_list.removeClass('g-d-hidei');
						}else{
							$admin_addattr_list.addClass('g-d-hidei');
						}
					}else if(selector.indexOf('addlabel')!==-1){
						if($admin_addlabel_list.hasClass('g-d-hidei')){
							$admin_addlabel_list.removeClass('g-d-hidei');
						}else{
							$admin_addlabel_list.addClass('g-d-hidei');
						}
					}
				});

			});



			/*绑定验证是否已经编写存在的分类编码*/
			$.each([$admin_newattr,$admin_newlabel],function(){
				var selector=this.selector;
				this.on('focusout',function(){
					var self=this,
						txt=this.value,
						value=public_tool.trims(txt),
						$ul,
						$tip,
						type='';

					if(value!==''){
						if(selector.indexOf('attr')!==-1){
							$ul=$admin_addattr_list;
							$tip=$admin_addattr_tips;
							type='属性';
						}else if(selector.indexOf('label')!==-1){
							$ul=$admin_addlabel_list;
							$tip=$admin_addlabel_tips;
							type='标签';
						}

						if(type!==''){
							$ul.find('li').each(function(){
								var $own=$(this),
									litxt=$own.html();
								if(litxt===value){
									$tip.html('"'+value+'" 已经存在，请填写其他"'+type+'"');
									self.value='';
									$own.addClass('admin-list-widget-active');
									setTimeout(function () {
										$tip.html('');
										$own.removeClass('admin-list-widget-active');
									},3000);
									return false;
								}
							});
						}
					}
				});
			});




			/*绑定添加地址*/
			/*表单验证*/
			if($.isFunction($.fn.validate)) {
				/*配置信息*/
				var form_opt0={},
					form_opt1={},
					form_opt2={},
					form_opt3={},
					formcache=public_tool.cache,
					basedata={
						userId:decodeURIComponent(logininfo.param.userId),
						token:decodeURIComponent(logininfo.param.token),
						providerId:decodeURIComponent(logininfo.param.providerId)
					};


				if(formcache.form_opt_0 && formcache.form_opt_1 && formcache.form_opt_2 && formcache.form_opt_3){
					$.each([formcache.form_opt_0,formcache.form_opt_1,formcache.form_opt_2,formcache.form_opt_3],function(index){
						var formtype,
						config={
							dataType:'JSON',
							method:'post'
						};
						if(index===0){
							formtype='addgoods';
						}else if(index===1){
							formtype='addtype';
						}else if(index===2){
							formtype='addattr';
						}else if(index===3){
							formtype='addlabel';
						}
						$.extend(true,(function () {
							if(formtype==='addgoods'){
								return form_opt0;
							}else if(formtype==='addtype'){
								return form_opt1;
							}else if(formtype==='addattr'){
								return form_opt2;
							}else if(formtype==='addlabel'){
								return form_opt3;
							}
						}()),(function () {
							if(formtype==='addgoods'){
								return formcache.form_opt_0;
							}else if(formtype==='addtype'){
								return formcache.form_opt_1;
							}else if(formtype==='addattr'){
								return formcache.form_opt_2;
							}else if(formtype==='addlabel'){
								return formcache.form_opt_3;
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
										gcode:$admin_code.val(),
										name:$admin_name.val(),
										isRecommended:$admin_isRecommended.is(':checked')?true:false,
										sort:(function(){
											var sort=$admin_goodssort.val();
											if(sort===''){
												sort=1;
											}
											return sort;
										}()),
										status:$admin_status.find(':selected').val(),
										goodsBrandId:1,
										parentId:$admin_goodsTypeId_Level1.find('option:selected').val()||'',
										parentId2:$admin_goodsTypeId_Level2.find('option:selected').val()||'',
										parentId3:$admin_goodsTypeId_Level3.find('option:selected').val()||'',
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

									if(have_attr){
										setdata['attrIventoryPrices']=getSetPrice();
									}else{
										setdata['attrIventoryPrices']='['+$admin_inventory.val()+'#'+public_tool.trimSep($admin_wholesale_price.val(),',')+'#'+public_tool.trimSep($admin_retail_price.val(),',')+']';
									}
									config['url']="http://10.0.5.226:8082/yttx-providerbms-api/goods/addupdate";
									config['data']=setdata;
								}else if(formtype==='addtype'){
									$.extend(true,setdata,{
										gtCode:$admin_gtCode.val(),
										name:$admin_typename.val(),
										sort:$admin_sort.val(),
										imageUrl:$admin_image.val()
									});
									var parentid=$admin_goodsTypeId_addone.find('option:selected').val(),
										parentid2='';
									if(parentid===''){
										setdata['parentId']='';
										if(typeof setdata['parentId2']!=='undefined'){
											delete setdata['parentId2'];
										}
									}else{
										setdata['parentId']=parentid;
										parentid2=$admin_goodsTypeId_addtwo.find('option:selected').val();
										if(parentid2!==''){
											setdata['parentId2']=parentid2;
										}else{
											if(typeof setdata['parentId2']!=='undefined'){
												delete setdata['parentId2'];
											}
										}
									}
									config['url']="http://10.0.5.226:8082/yttx-providerbms-api/goodstype/add";
									config['data']=setdata;
								}else if(formtype==='addattr'){
									$.extend(true,setdata,{
										newAttrs:$admin_newattr.val(),
										goodsTypeId:istypeid,
										tagId:$admin_newattr.attr('data-id')
									});
									config['url']="http://10.0.5.226:8082/yttx-providerbms-api/goods/tag/attr/add";
									config['data']=setdata;
								}else if(formtype==='addlabel'){
									$.extend(true,setdata,{
										newTagStr:$admin_newlabel.val(),
										goodsTypeId:istypeid
									});
									config['url']="http://10.0.5.226:8082/yttx-providerbms-api/goods/tag/attr/add";
									config['data']=setdata;
								}

								$.ajax(config).done(function(resp){
									var code;
									if(formtype==='addgoods'){
										code=parseInt(resp.code,10);
										if(code!==0){
											dia.content('<span class="g-c-bs-warning g-btips-warn">添加商品失败</span>').show();
											return false;
										}else{
											dia.content('<span class="g-c-bs-success g-btips-succ">添加商品成功</span>').show();
										}
									}else if(formtype==='addtype'){
										code=parseInt(resp.code,10);
										if(code!==0){
											dia.content('<span class="g-c-bs-warning g-btips-warn">添加商品分类失败</span>').show();
											return false;
										}else{
											dia.content('<span class="g-c-bs-success g-btips-succ">添加商品类型成功</span>').show();
										}
									}else if(formtype==='addattr'){
										if(resp.attrs.length!==0){
											dia.content('<span class="g-c-bs-success g-btips-succ">添加商品属性成功</span>').show();
										}else{
											dia.content('<span class="g-c-bs-warning g-btips-warn">添加商品属性失败</span>').show();
											return false;
										}

									}else if(formtype==='addlabel'){
										if(resp.tagName!==''){
											dia.content('<span class="g-c-bs-success g-btips-succ">添加商品标签成功</span>').show();
										}else{
											dia.content('<span class="g-c-bs-warning g-btips-warn">添加商品标签失败</span>').show();
											return false;
										}

									}


									setTimeout(function () {
										dia.close();
										if(formtype==='addgoods'){
											/*页面跳转*/
											location.href='yttx-goods-manage.html';
										}else if(formtype==='addtype'){
											/*重新加载*/
											location.reload();
										}else if(formtype==='addattr'){
											var attrkey=$admin_newattr.attr('data-key');
											admin_addattr_form.reset();
											/*更新属性值*/
											updateAttrData(typeobj);
											var attr='',
												map=attr_map[attrkey]['map'];
											for(var i in map){
												attr+='<li>'+i+'</li>';
											}
											$(attr).appendTo($admin_addattr_list.html(''));
										}else if(formtype==='addlabel'){
											admin_addlabel_form.reset();
											/*更新属性值*/
											updateAttrData(typeobj);
											var label='';
											for(var i in attr_map){
												label+='<li>'+attr_map[i]['label']+'</li>';
											}
											$(label).appendTo($admin_addlabel_list.html(''));
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
				if(resetform1===null){
					resetform1=$admin_addtype_form.validate(form_opt1);
				}
				if(resetform2===null){
					resetform2=$admin_addattr_form.validate(form_opt2);
				}
				if(resetform3===null){
					resetform3=$admin_addlabel_form.validate(form_opt3);
				}

			}



		}

		/*动态创建属性节点*/
		function createAttrNode(name,index){
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
			inputstr='<input type="text" class="form-control g-w-number4" data-key="'+key+'" data-label="'+label+'" data-value="" />\
				<input type="text" class="form-control g-w-number4" data-key="'+key+'" data-label="'+label+'" data-value="" />\
				<input type="text" class="form-control g-w-number4" data-key="'+key+'" data-label="'+label+'" data-value="" />';

			/*创建属性项*/
			itemstr='<div class="form-group" data-key="'+key+'">\
									<label class="control-label"><span class="attr-item-title" >'+name+':</span><span id="attr_tips_'+key+'" class="g-c-red1 attr-item-tips"></span></label>\
									<div class="input-group g-w-percent48">\
										<span class="attr-item-input" id="attr_input_'+key+'">'+inputstr+'</span>\
										<span class="input-group-btn pull-left admin-rpos-wrap" style="z-index:'+(100 - index * 2)+';">\
											<button type="button" class="btn btn-white attr-item-btn" title="增加'+label+'条件" data-key="'+key+'"><i class="fa-angle-double-left"></i></button>\
											<button type="button" data-key="'+key+'" title="查看'+label+'类型" class="btn btn-white attr-item-listbtn"><i class="fa-list"></i></button>\
											<button type="button" data-key="'+key+'" class="btn btn-white attr-item-addbtn" title="添加'+label+'">+</button>\
											<ul id="attr_list_'+key+'"  class="admin-list-widget color-list-widget g-d-hidei attr-item-list"></ul>\
										</span>\
									</div>\
								</div>';

			$(itemstr).appendTo($admin_attrwrap);
			return result;
		}


		/*级联类型查询*/
		function getGoodsTypes(value,obj,type,extend){
			var typemap={
				'one':'一级',
				'two':'二级',
				'three':'三级'
			},istype=false;

			$.ajax({
				url:"http://10.0.5.226:8082/yttx-providerbms-api/goodstypes",
				dataType:'JSON',
				async:false,
				method:'post',
				data:{
					userId:obj.userId,
					token:obj.token,
					providerId:obj.providerId,
					parentId:value
				}
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
					istype=false;
					return false;
				}

				var result=resp.result.parentTypesList,
					len=result.length,
					i= 0,
					str='';

				if(!result){
					istype=false;
					return false;
				}

				if(len!==0){
					istype=true;
					var auto_selected=null,auto_str=[];
					for(i;i<len;i++){
						if(i===0){
							if(type==='one'){
								auto_selected=result[i]["id"]||null;
								auto_str.push(result[i]["id"],result[i]["name"]);
							}else{
								str+='<option value="" selected >请选择'+typemap[type]+'分类</option><option value="'+result[i]["id"]+'" >'+result[i]["name"]+'</option>';
							}
						}else{
							str+='<option value="'+result[i]["id"]+'" >'+result[i]["name"]+'</option>';
						}
					}
					if(type==='one'){
						if(extend){
							$('<option value="'+auto_str[0]+'" selected >'+auto_str[1]+'</option>'+str).appendTo(obj.$typeone.html(''));
							$('<option value="" selected >请选择'+typemap[type]+'分类</option><option value="'+auto_str[0]+'" >'+auto_str[1]+'</option>'+str).appendTo(obj.$addone.html(''));
						}else{
							$('<option value="'+auto_str[0]+'" selected >'+auto_str[1]+'</option>'+str).appendTo(obj.$typeone.html(''));
						}
						if(auto_selected!==null){
							istypeid=auto_selected;
							clearAttrData('price');
							$admin_attrwrap.removeClass('g-d-hidei');
							$admin_pricewrap.addClass('g-d-hidei');
							have_attr=getAttrData(auto_selected,obj);
							if(have_attr){
								$admin_pricewrap.addClass('g-d-hidei');
								$admin_attrwrap.removeClass('g-d-hidei');
							}else{
								$admin_pricewrap.removeClass('g-d-hidei');
								$admin_attrwrap.addClass('g-d-hidei');
							}
							getGoodsTypes(auto_selected,obj,'two');
						}else{
							clearAttrData('attr');
							$admin_attrwrap.addClass('g-d-hidei');
							$admin_pricewrap.removeClass('g-d-hidei');
						}
					}else if(type==='two'){
						$(str).appendTo(obj.$typetwo.html(''));
					}else if(type==='three'){
						$(str).appendTo(obj.$typethree.html(''));
					}
				}else{
					console.log(resp.message||'error');
					istype=false;
					if(type==='one'){
						obj.$typeone.html('');
						obj.$typetwo.html('');
						obj.$typethree.html('');
					}else if(type==='two'){
						obj.$typetwo.html('');
						obj.$typethree.html('');
					}else if(type==='three'){
						obj.$typethree.html('');
					}
					return false;
				}
			}).fail(function(resp){
				istype=false;
				console.log(resp.message||'error');
				if(type==='one'){
					obj.$typeone.html('');
					obj.$typetwo.html('');
					obj.$typethree.html('');
				}else if(type==='two'){
					obj.$typetwo.html('');
					obj.$typethree.html('');
				}else if(type==='three'){
					obj.$typethree.html('');
				}
			});
			return istype;
		}


		/*级联类型查询(新增分类)*/
		function getAddGoodsTypes(value,obj,type){
			var typemap={
				'one':'一级',
				'two':'二级',
				'three':'三级'
			},istype=false;

			$.ajax({
				url:"http://10.0.5.226:8082/yttx-providerbms-api/goodstypes",
				dataType:'JSON',
				async:false,
				method:'post',
				data:{
					userId:obj.userId,
					token:obj.token,
					providerId:obj.providerId,
					parentId:value
				}
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
					istype=false;
					return false;
				}

				var result=resp.result.parentTypesList,
					len=result.length,
					i= 0,
					str='';

				if(!result){
					istype=false;
					return false;
				}

				if(len!==0){
					istype=true;
					for(i;i<len;i++){
						if(i===0){
							str+='<option value="" selected >请选择'+typemap[type]+'分类</option><option value="'+result[i]["id"]+'" >'+result[i]["name"]+'</option>';
						}else{
							str+='<option value="'+result[i]["id"]+'" >'+result[i]["name"]+'</option>';
						}
					}
					if(type==='one'){
						$(str).appendTo(obj.$addone.html(''));
					}else if(type==='two'){
						$(str).appendTo(obj.$addtwo.html(''));
					}
				}else{
					console.log(resp.message||'error');
					istype=false;
					if(type==='one'){
						obj.$addone.html('');
						obj.$addtwo.html('');
					}else if(type==='two'){
						obj.$addtwo.html('');
					}
					return false;
				}
			}).fail(function(resp){
				istype=false;
				console.log(resp.message||'error');
				if(type==='one'){
					obj.$addone.html('');
					obj.$addtwo.html('');
				}else if(type==='two'){
					obj.$addtwo.html('');
				}
			});
			return istype;
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
				$admin_inventory.val('');
				$admin_wholesale_price_list.html('');
				$admin_wholesale_price_thead.html(wholesale_price_theadstr);
				$admin_attrwrap.find('ul').html('');
			}else if(type==='pricetxt'){
				$admin_wholesale_price.val('');
				$admin_retail_price.val('');
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
		function getAttrData(id,obj){
			var isresult=false;
			if(typeof id ==='undefined'){
				return isresult;
			}
			$.ajax({
				url:"http://10.0.5.226:8082/yttx-providerbms-api/goods/tags/attrs",
				dataType:'JSON',
				async:false,
				method:'post',
				data:{
					userId:obj.userId,
					token:obj.token,
					providerId:obj.providerId,
					goodsTypeId:id
				}
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
					isresult=false;
					return false;
				}

				var list=resp;

				if(!list){
					isresult=false;
					return false;
				}

				var len=list.length,
					i= 0;
				if(len!==0){
					isresult=true;
					$admin_attrwrap.html('');
					attr_map={};
					for(i;i<len;i++){
						var attr_obj=list[i],
							name=list[i]['name'],
							arr=list[i]['list'],
							j= 0,
							sublen=arr.length,
							str='',
							attritem=createAttrNode(name,i),
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
							}

							attr_obj['label']=labels;
							attr_obj['key']=key;
							attr_map[key]=attr_obj;

							var $ul=$(document.getElementById('attr_list_'+key));
							$(str).appendTo($ul.html(''));
							$ul=null;
						}else if(sublen===0){
							attr_obj['map']={};
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
				}else{
					isresult=false;
				}
			}).fail(function(resp){
				isresult=false;
				console.log(resp.message||'error');
				return false;
			});
			return isresult;
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
			<th>出厂价</th>\
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
								'<td><input name="setisDefault" checked type="radio" data-value="'+code+'"></td></tr>';
						}else{
							str+='<td>'+itemtwo[0]+'</td>' +
								'<td><input class="admin-table-input" name="setinventory" maxlength="7" type="text"></td>' +
								'<td><input class="admin-table-input" name="setwholesalePrice" maxlength="12" type="text"></td>' +
								'<td><input class="admin-table-input" name="setretailPrice" maxlength="12" type="text"></td>' +
								'<td><input name="setisDefault"  type="radio" data-value="'+code+'"></td></tr>';
						}
					}else{
						str+='<tr><td>'+itemtwo[0]+'</td>' +
							'<td><input class="admin-table-input" name="setinventory" maxlength="7" type="text"></td>' +
							'<td><input class="admin-table-input" name="setwholesalePrice" maxlength="12" type="text"></td>' +
							'<td><input class="admin-table-input" name="setretailPrice" maxlength="12" type="text"></td>' +
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
					};
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


		/*更新属性*/
		function updateAttrData(obj){
			var onevalue='',
				twovalue='',
				threevalue='',
				value='';
			if(obj){
				onevalue=obj.$typeone.find('option:selected').val();
				if(onevalue===''){
					return false;
				}else{
					twovalue=obj.$typetwo.find('option:selected').val();
					if(twovalue===''){
						value=onevalue;
						getAttrData(value,obj);
					}else{
						threevalue=obj.$typethree.find('option:selected').val();
						if(threevalue===''){
							value=twovalue;
							getAttrData(value,obj);
						}else{
							value=threevalue;
							getAttrData(value,obj);
						}
					}
				}
			}
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


	});



})(jQuery,KindEditor);