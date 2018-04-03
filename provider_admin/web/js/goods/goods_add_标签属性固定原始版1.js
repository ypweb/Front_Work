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
				$admin_id=$('#admin_id'),
				$admin_goodsTypeId_Level1=$('#admin_goodsTypeId_Level1'),
				$admin_goodsTypeId_Level2=$('#admin_goodsTypeId_Level2'),
				$admin_goodsTypeId_Level3=$('#admin_goodsTypeId_Level3'),
				$admin_goodsTypeId_btn=$('#admin_goodsTypeId_btn'),
				$admin_code=$('#admin_code'),
				$admin_name=$('#admin_name'),
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
				$admin_goodsPictures0=$('#admin_goodsPictures0'),
				$admin_color_listbtn=$('#admin_color_listbtn'),
				$admin_color_list=$('#admin_color_list'),
				$admin_rule_listbtn=$('#admin_rule_listbtn'),
				$admin_rule_list=$('#admin_rule_list'),
				price_data={},
				attr_data={},
				admin_goodsadd_form=document.getElementById('admin_goodsadd_form'),
				$admin_goodsadd_form=$(admin_goodsadd_form),
				resetform=null,
				colormap={},
				rulemap={};


			/*轮播对象*/
			var $admin_slide_image=$('#admin_slide_image'),
				$admin_slide_btnl=$('#admin_slide_btnl'),
				$admin_slide_btnr=$('#admin_slide_btnr'),
				$admin_slide_tool=$('#admin_slide_tool'),
				$admin_slide_view=$('#admin_slide_view'),
				$admin_slide_upload=$('#admin_slide_upload'),
				slide_upload=new plupload.Uploader({
					runtimes: 'html5,html4,flash,silverlight',
					browse_button : 'admin_slide_view',
					multi_selection:true,
					multipart:true,/*默认上传方式表单或二进制*/
					multipart_params:{
						"picType":'',
						"id":2
					},/*自定义其他参数*/
					container: document.getElementById('admin_slide_tool'),
					url : "http://10.0.5.226:8082/yttx-providerbms-api/goods/pictures/update",
					chunk_size: '2mb',
					filters : {
						max_file_size : '2mb',
						mime_types: [
							{title : "Image files", extensions : "jpg,gif,png,jpeg"}
						]
					},
					flash_swf_url : '../../js/plugins/plupload/Moxie.swf',
					max_retries: 3,
					silverlight_xap_url : '../../js/plugins/plupload/Moxie.xap',
					init: {
						'PostInit': function() {
							$admin_slide_upload.attr({
								'data-value':''
							});
							/*绑定上传相片*/
							$admin_slide_upload.on('click',function(){
								var isupload=$admin_slide_upload.attr('data-value');
								if(isupload===''){
									dia.content('<span class="g-c-bs-warning g-btips-warn">您还未选择需要上传的文件</span>').show();
									setTimeout(function(){
										dia.close();
									},3000);
									return false;
								}else{
									slide_upload.start();
									return false;
								}
							});
						},
						'FilesAdded': function(up, files) {
							$admin_slide_upload.attr({
								'data-value':'image'
							});
						},
						'BeforeUpload': function(up, file) {},
						'UploadProgress': function(up, file) {},
						'FileUploaded': function(up, file, info) {
							/*获取上传成功后的文件的Url*/
							console.log(up);
							console.log(file);
							console.log(info.response);
							/*var domain=up.getOption('domain'),
								name=JSON.parse(info);

							$admin_logoImage.attr({
								'data-image':domain+'/'+name.key+"?imageView2/1/w/160/h/160"
							}).html('<img src="'+domain+'/'+name.key+"?imageView2/1/w/160/h/160"+'" alt="店铺LOGO">');*/
						},
						'Error': function(up, err, errTip) {
							$admin_slide_upload.attr({
								'data-value':''
							});
							var opt=up.settings,
								file=err.file,
								setsize=parseInt(opt.filters.max_file_size,10),
								realsize=parseInt((file.size / 1024) / 1024,10);

							if(realsize>setsize){
								dia.content('<span class="g-c-bs-warning g-btips-warn">您选择的文件太大(<span class="g-c-red1"> '+realsize+'mb</span>),不能超过(<span class="g-c-red1"> '+setsize+'mb</span>)</span>').show();
								setTimeout(function(){
									dia.close();
								},3000);
							}
							console.log(errTip);
						},
						'UploadComplete': function() {
							$admin_slide_upload.attr({
								'data-value':''
							});
							dia.content('<span class="g-c-bs-success g-btips-succ">上传成功</span>').show()
							setTimeout(function(){
								dia.close();
							},2000);
						},
						'Key': function(up, file) {
							var str=moment().format("YYYYMMDDHHmmSSSS");
							return "provider_"+str;
						}
					}
				});
				slide_upload.init();




			/*图片上传对象*/
			var $editor_image_toggle=$('#editor_image_toggle'),
				$editor_image_list=$('#editor_image_list'),
				$editor_image_upload=$('#editor_image_upload'),
				$editor_image_show=$('#editor_image_show'),
				$toggle_edit_btn=$('#toggle_edit_btn'),
				$img_url_upload=$('#img_url_upload')/*缩略图文件上传按钮*/;


			/*重置表单*/
			admin_goodsadd_form.reset();


			/*初始化查询查询类型*/
			var typeobj={
				$typeone:$admin_goodsTypeId_Level1,
				$typetwo:$admin_goodsTypeId_Level2,
				$typethree:$admin_goodsTypeId_Level3,
				userId:decodeURIComponent(logininfo.param.userId),
				token:decodeURIComponent(logininfo.param.token),
				providerId:decodeURIComponent(logininfo.param.providerId)
			};


			/*绑定查询选中*/
			$.each([$admin_goodsTypeId_Level1,$admin_goodsTypeId_Level2,$admin_goodsTypeId_Level3],function(){
				var self=this,
					selector=this.selector,
					goodsresult=false;

				/*初始化查询一级分类*/
				if(selector.indexOf('1')!==-1){
					getGoodsTypes('',typeobj,'one');
				}

				this.on('change',function(){
					var value=$(this).val();
					clearAttrData('attr');
					if(selector.indexOf('1')!==-1){
						if(value===''){
							$admin_goodsTypeId_Level2.html('');
							$admin_goodsTypeId_Level3.html('');
							$admin_attrwrap.addClass('g-d-hidei');
							$admin_pricewrap.removeClass('g-d-hidei');
							return false;
						}
						goodsresult=getAttrData(value,typeobj);
						if(goodsresult){
							$admin_attrwrap.removeClass('g-d-hidei');
						}else{
							$admin_pricewrap.addClass('g-d-hidei');
						}
						getGoodsTypes(value,typeobj,'two');
					}else if(selector.indexOf('2')!==-1){
						if(value===''){
							$admin_goodsTypeId_Level3.html('');
							goodsresult=getAttrData($admin_goodsTypeId_Level1.find('option:selected').val(),typeobj);
							if(goodsresult){
								$admin_attrwrap.removeClass('g-d-hidei');
							}else{
								$admin_pricewrap.addClass('g-d-hidei');
							}
							return false;
						}
						goodsresult=getAttrData(value,typeobj);
						if(goodsresult){
							$admin_attrwrap.removeClass('g-d-hidei');
						}else{
							$admin_pricewrap.addClass('g-d-hidei');
						}
						getGoodsTypes(value,typeobj,'three');
					}else if(selector.indexOf('3')!==-1){
						if(value===''){
							goodsresult=getAttrData($admin_goodsTypeId_Level2.find('option:selected').val(),typeobj);
							if(goodsresult){
								$admin_attrwrap.removeClass('g-d-hidei');
							}else{
								$admin_pricewrap.addClass('g-d-hidei');
							}
							return false;
						}
						goodsresult=getAttrData(value,typeobj);
						if(goodsresult){
							$admin_attrwrap.removeClass('g-d-hidei');
						}else{
							$admin_pricewrap.addClass('g-d-hidei');
						}
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
					type=this.selector.indexOf('color')!==-1?'color':'rule',
					selector=$input.attr('name'),
					isvalid=false;


				/*事件绑定*/
				$input.on('focusout',function(){
					var $this=$(this),
						value=$this.val();
					if(value!==''){
						isvalid=validAttrData($this,type);
						if(isvalid){
							attr_data[selector]=value;
							$this.attr({
								'data-value':value
							});
						}
					}else{
						if(typeof attr_data[selector]!=='undefined'){
							var tempvalue=$this.attr('data-value');
							delete attr_data[selector];
							if(tempvalue!==''){
								$this.attr({
									'data-value':''
								});
							}
						}
					}
					if($.isEmptyObject(attr_data)){
						clearAttrData('attr');
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
					if(name==="inventory"){
						result=value.replace(/\D*/g,'');
						$this.val(result);
					}else if(name==="wholesalePrice"){
						/*错误状态下禁止输入*/
						if($this.hasClass('g-c-red1')){
							return false;
						}
						result=public_tool.moneyCorrect(value,12,true);
						$this.val(result[0]);
						public_tool.cursorPos(this,result[0],'.');
					}else if(name==="retailPrice"){
						if($this.hasClass('g-c-red1')){
							return false;
						}
						result=public_tool.moneyCorrect(value,12,true);
						$this.val(result[0]);
						public_tool.cursorPos(this,result[0],'.');
					}
				}else if(etype==='focusout'){
					if(name==="wholesalePrice"){
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

					}else if(name==="retailPrice"){
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




			/*编辑器调用*/
			var editor=KE.create("#admin_details",{
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
			editor.html('');


			/*缩略图切换编辑状态*/
			$toggle_edit_btn.on('click',function(){
				var $this=$(this),
					isactive=$this.hasClass('toggle-edit-btnactive');
				if(isactive){
					$this.removeClass('toggle-edit-btnactive');
					$admin_goodsPictures0.prop({
						'readonly':true
					});
				}else{
					$this.addClass('toggle-edit-btnactive');
					$admin_goodsPictures0.prop({
						'readonly':false
					});
				}

			});



			/*绑定轮播图*/
			goodsSlide.GoodsSlide({
				$slide_tool:$admin_slide_tool,
				$image:$admin_slide_image,
				$btnl:$admin_slide_btnl,
				$btnr:$admin_slide_btnr,
				active:'admin-slide-active',
				len:5
			});




			/*绑定添加地址*/
			/*表单验证*/
			if($.isFunction($.fn.validate)) {
				/*配置信息*/
				var form_opt={},
					formcache=public_tool.cache;

				if(formcache.form_opt_0){
					$.extend(true,form_opt,formcache.form_opt_0,{
						submitHandler: function(form){
							$.ajax({
								url:"http://10.0.5.226:8082/yttx-providerbms-api/user/password/update",
								dataType:'JSON',
								method:'post',
								data:{
									userId:decodeURIComponent(logininfo.param.userId),
									token:decodeURIComponent(logininfo.param.token),
									providerId:decodeURIComponent(logininfo.param.providerId),
									password:$admin_password.val(),
									newPassword:$admin_newPassword.val()
								}
							}).done(function(resp){
								var code=parseInt(resp.code,10);
								if(code!==0){
									console.log(resp.message);
									dia.content('<span class="g-c-bs-warning g-btips-warn">修改密码失败</span>').show();
									setTimeout(function () {
										dia.close();
									},2000);
									return false;
								}

								dia.content('<span class="g-c-bs-success g-btips-succ">修改密码成功</span>').show();
								setTimeout(function () {
									dia.close();
								},2000);
							}).fail(function(resp){
								console.log('error');
							});

						}
					});
				}


				/*提交验证*/
				if(resetform===null){
					resetform=$admin_goodsadd_form.validate(form_opt);
				}

			}



		}


		/*级联类型查询*/
		function getGoodsTypes(value,obj,type){
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
					var auto_selected=null;
					for(i;i<len;i++){
						if(i===0){
							if(type==='one'){
								auto_selected=result[i]["id"]||null;
								str+='<option  selected value="'+result[i]["id"]+'" >'+result[i]["name"]+'</option>';
							}else{
								str+='<option value="" selected >请选择'+typemap[type]+'分类</option><option value="'+result[i]["id"]+'" >'+result[i]["name"]+'</option>';
							}
						}else{
							str+='<option value="'+result[i]["id"]+'" >'+result[i]["name"]+'</option>';
						}
					}
					if(type==='one'){
						$(str).appendTo(obj.$typeone.html(''));
						if(auto_selected!==null){
							clearAttrData('price');
							$admin_attrwrap.removeClass('g-d-hidei');
							$admin_pricewrap.addClass('g-d-hidei');
							var goodsresult=getAttrData(auto_selected,obj);
							if(goodsresult){
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
							'map':colormap
						},
						'rule':{
							'wrap':$admin_rule_list,
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
								if(attrtxt in attrmap[key]['map']){
									attrtxt=attrtxt+1;
								}
								str+='<li data-value="'+attrvalue+'">'+attrtxt+'</li>';
								attrmap[key]['map'][attrtxt]=attrvalue;
							}
							$(str).appendTo(attrmap[key]['wrap']);
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
							'<td><input class="admin-table-input" name="inventory" maxlength="5" type="text" data-value="inventory#'+code+'"></td>' +
							'<td><input class="admin-table-input" name="wholesalePrice" maxlength="12" type="text" data-value="wholesalePrice#'+code+'"></td>' +
							'<td><input class="admin-table-input" name="retailPrice" maxlength="12" type="text" data-value="retailPrice#'+code+'"></td>' +
							'<td><input name="isDefault"  type="checkbox" data-value="isDefalut#'+code+'"></td></tr>';
					}else{
						str+='<tr><td>'+name+'</td>' +
							'<td><input class="admin-table-input" name="inventory" maxlength="5" type="text" data-value="inventory#'+code+'"></td>' +
							'<td><input class="admin-table-input" name="wholesalePrice" maxlength="12" type="text" data-value="wholesalePrice#'+code+'"></td>' +
							'<td><input class="admin-table-input" name="retailPrice" maxlength="12" type="text" data-value="retailPrice#'+code+'"></td>' +
							'<td><input name="isDefault"  type="checkbox" data-value="isDefalut#'+code+'"></td></tr>';
					}
				}
			}
			$(str).appendTo($admin_wholesale_price_list.html('').removeClass('g-d-hidei'));
		}



	});








})(jQuery,KindEditor);