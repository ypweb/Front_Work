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
				$admin_status=$('#admin_status'),
				$admin_color_listbtn=$('#admin_color_listbtn'),
				$admin_color_list=$('#admin_color_list'),
				$admin_rule_listbtn=$('#admin_rule_listbtn'),
				$admin_rule_list=$('#admin_rule_list'),
				$admin_color_extendbtn=$('#admin_color_extendbtn'),
				$admin_rule_extendbtn=$('#admin_rule_extendbtn'),
				price_data={},
				attr_data={},
				admin_goodsadd_form=document.getElementById('admin_goodsadd_form'),
				$admin_goodsadd_form=$(admin_goodsadd_form),
				resetform0=null,
				resetform1=null,
				resetform2=null,
				resetform3=null,
				colormap={},
				rulemap={},
				issetprice=false,
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



			/*新增颜色,规格/尺寸 属性*/
			var $show_addcolor_wrap=$('#show_addcolor_wrap'),
				admin_addcolor_form=document.getElementById('admin_addcolor_form'),
				$admin_addcolor_form=$(admin_addcolor_form),
				$admin_addcolor_tips=$('#admin_addcolor_tips'),
				$admin_newcolor=$('#admin_newcolor'),
				$admin_addcolor_btn=$('#admin_addcolor_btn'),
				$admin_addcolor_list=$('#admin_addcolor_list'),
				$show_addrule_wrap=$('#show_addrule_wrap'),
				admin_addrule_form=document.getElementById('admin_addrule_form'),
				$admin_addrule_form=$(admin_addrule_form),
				$admin_addrule_tips=$('#admin_addrule_tips'),
				$admin_newrule=$('#admin_newrule'),
				$admin_addrule_btn=$('#admin_addrule_btn'),
				$admin_addrule_list=$('#admin_addrule_list');




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
			admin_addcolor_form.reset();
			admin_addrule_form.reset();



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
						issetprice=getAttrData(value,typeobj);
						if(issetprice){
							$admin_attrwrap.removeClass('g-d-hidei');
						}else{
							$admin_pricewrap.addClass('g-d-hidei');
						}
						getGoodsTypes(value,typeobj,'two');
					}else if(selector.indexOf('2')!==-1){
						istypeid=value;
						if(value===''){
							$admin_goodsTypeId_Level3.html('');
							issetprice=getAttrData($admin_goodsTypeId_Level1.find('option:selected').val(),typeobj);
							if(issetprice){
								$admin_attrwrap.removeClass('g-d-hidei');
							}else{
								$admin_pricewrap.addClass('g-d-hidei');
							}
							return false;
						}
						issetprice=getAttrData(value,typeobj);
						if(issetprice){
							$admin_attrwrap.removeClass('g-d-hidei');
						}else{
							$admin_pricewrap.addClass('g-d-hidei');
						}
						getGoodsTypes(value,typeobj,'three');
					}else if(selector.indexOf('3')!==-1){
						istypeid=value;
						if(value===''){
							issetprice=getAttrData($admin_goodsTypeId_Level2.find('option:selected').val(),typeobj);
							if(issetprice){
								$admin_attrwrap.removeClass('g-d-hidei');
							}else{
								$admin_pricewrap.addClass('g-d-hidei');
							}
							return false;
						}
						issetprice=getAttrData(value,typeobj);
						if(issetprice){
							$admin_attrwrap.removeClass('g-d-hidei');
						}else{
							$admin_pricewrap.addClass('g-d-hidei');
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



			/*绑定轮播图*/
			goodsSlide.GoodsSlide(slide_config);



			/*绑定新增类型*/
			$.each([$admin_goodsTypeId_btn,$admin_color_extendbtn,$admin_rule_extendbtn],function(){
				var self=this,
					selector=this.selector;

				if(selector.indexOf('goodsTypeId')!==-1){
					this.on('click',function(){
						$show_addtype_wrap.modal('show',{
							backdrop:'static'
						});
					});
				}else if(selector.indexOf('color')!==-1){
					this.on('click',function(){
						$show_addcolor_wrap.modal('show',{
							backdrop:'static'
						});
					});
				}else if(selector.indexOf('rule')!==-1){
					this.on('click',function(){
						$show_addrule_wrap.modal('show',{
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
			$.each([$admin_addcolor_btn,$admin_addrule_btn],function(){
				var self=this,
					selector=this.selector;

				this.on('click',function(e){
					if(selector.indexOf('addcolor')!==-1){
						if($admin_addcolor_list.hasClass('g-d-hidei')){
							$admin_addcolor_list.removeClass('g-d-hidei');
						}else{
							$admin_addcolor_list.addClass('g-d-hidei');
						}
					}else if(selector.indexOf('addrule')!==-1){
						if($admin_addrule_list.hasClass('g-d-hidei')){
							$admin_addrule_list.removeClass('g-d-hidei');
						}else{
							$admin_addrule_list.addClass('g-d-hidei');
						}
					}
				});

			});



			/*绑定验证是否已经编写存在的分类编码*/
			$.each([$admin_newcolor,$admin_newrule],function(){
				var own=this,
					selector=this.selector;

				this.on('focusout',function(){
					var self=this,
						txt=this.value,
						value=public_tool.trims(txt);

					if(value!==''){
						if(selector.indexOf('color')!==-1){
							$admin_addcolor_list.find('li').each(function(){
								if(this.innerHTML===value){
									$admin_addcolor_tips.html('"'+value+'" 已经存在，请填写其他"颜色"');
									self.value='';
									setTimeout(function () {
										$admin_addcolor_tips.html('');
									},3000);
									return false;
								}
							});
						}else if(selector.indexOf('rule')!==-1){
							$admin_addrule_list.find('li').each(function(){
								if(this.innerHTML===value){
									$admin_addrule_tips.html('"'+value+'" 已经存在，请填写其他"规格/尺寸"');
									self.value='';
									setTimeout(function () {
										$admin_addrule_tips.html('');
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
							formtype='addcolor';
						}else if(index===3){
							formtype='addrule';
						}
						$.extend(true,(function () {
							if(formtype==='addgoods'){
								return form_opt0;
							}else if(formtype==='addtype'){
								return form_opt1;
							}else if(formtype==='addcolor'){
								return form_opt2;
							}else if(formtype==='addrule'){
								return form_opt3;
							}
						}()),(function () {
							if(formtype==='addgoods'){
								return formcache.form_opt_0;
							}else if(formtype==='addtype'){
								return formcache.form_opt_1;
							}else if(formtype==='addcolor'){
								return formcache.form_opt_2;
							}else if(formtype==='addrule'){
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

									if(issetprice){
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
								}else if(formtype==='addcolor'){
									$.extend(true,setdata,{
										newAttrs:$admin_newcolor.val(),
										goodsTypeId:istypeid,
										tagId:'4'
									});
									config['url']="http://10.0.5.226:8082/yttx-providerbms-api/goods/tag/attr/add";
									config['data']=setdata;
								}else if(formtype==='addrule'){
									$.extend(true,setdata,{
										newAttrs:$admin_newrule.val(),
										goodsTypeId:istypeid,
										tagId:'5'
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
									}else if(formtype==='addcolor'){
										if(resp.attrs.length!==0){
											dia.content('<span class="g-c-bs-success g-btips-succ">添加商品颜色属性成功</span>').show();
										}else{
											dia.content('<span class="g-c-bs-warning g-btips-warn">添加商品颜色属性失败</span>').show();
											return false;
										}

									}else if(formtype==='addrule'){
										if(resp.attrs.length!==0){
											dia.content('<span class="g-c-bs-success g-btips-succ">添加商品规格/尺寸成功</span>').show();
										}else{
											dia.content('<span class="g-c-bs-warning g-btips-warn">添加商品规格/尺寸失败</span>').show();
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
										}else if(formtype==='addcolor'||formtype==='addrule'){
											/*更新属性值*/
											updateAttrData(typeobj);
											if(formtype==='addcolor'){
												admin_addcolor_form.reset();
											}else if(formtype==='addrule'){
												admin_addrule_form.reset();
											}
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
					resetform2=$admin_addcolor_form.validate(form_opt2);
				}
				if(resetform3===null){
					resetform3=$admin_addrule_form.validate(form_opt3);
				}

			}



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
						public_tool.clear();
						public_tool.clearCacheData();
						public_tool.loginTips();
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
							issetprice=getAttrData(auto_selected,obj);
							if(issetprice){
								$admin_attrwrap.removeClass('g-d-hidei');
							}else{
								$admin_pricewrap.addClass('g-d-hidei');
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
						public_tool.clear();
						public_tool.clearCacheData();
						public_tool.loginTips();
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
		function getAttrData(id,obj,flag){
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
						public_tool.clear();
						public_tool.clearCacheData();
						public_tool.loginTips();
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
					i= 0,
					attrmap={
						'color':{
							'wrap':$admin_color_list,
							'addwrap':$admin_addcolor_list,
							'map':colormap
						},
						'rule':{
							'wrap':$admin_rule_list,
							'addwrap':$admin_addrule_list,
							'map':rulemap
						}
					};

				if(len!==0){
					isresult=true;
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
								if(attrtxt in attrmap[key]['map']&&!flag){
									attrtxt=attrtxt+1;
								}

								str+='<li data-value="'+attrvalue+'">'+attrtxt+'</li>';
								attrmap[key]['map'][attrtxt]=attrvalue;
							}
							$(str).appendTo(attrmap[key]['wrap'].html(''));
							$(str).appendTo(attrmap[key]['addwrap'].html(''));
						}else{
							continue;
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
					};
				}
				result.push(str);
			}
			return JSON.stringify(result);
		}


		/*获取七牛token*/
		function getToken(){
			var result=null;
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
						getAttrData(value,obj,true);
					}else{
						threevalue=obj.$typethree.find('option:selected').val();
						if(threevalue===''){
							value=twovalue;
							getAttrData(value,obj,true);
						}else{
							value=threevalue;
							getAttrData(value,obj,true);
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








			/*console.log(li);
			console.log(slideobj);
			console.log(tips);*/


		}


	});



})(jQuery,KindEditor);