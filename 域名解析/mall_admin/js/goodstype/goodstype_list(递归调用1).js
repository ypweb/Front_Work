(function($){
	'use strict';
	$(function(){

		var table=null/*数据展现*/;

		/*初始化数据*/
		if(public_tool.initMap.isrender){
			/*菜单调用*/
			var logininfo=public_tool.initMap.loginMap;
			public_tool.loadSideMenu(public_vars.$mainmenu,public_vars.$main_menu_wrap,{
				url:'../../json/menu.json',
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
				addtype_power=public_tool.getKeyPower('goods-addtype',powermap),
				edittype_power=public_tool.getKeyPower('goods-updatetype',powermap),
				deletetype_power=public_tool.getKeyPower('goods-deletetype',powermap);



			/*dom引用和相关变量定义*/
			var module_id='mall-goods-type'/*模块id，主要用于本地存储传值*/,
				$admin_addtype_btn=$('#admin_addtype_btn'),
				$admin_list_wrap=$('#admin_list_wrap'),
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
				$admin_errortip_wrap=$('#admin_errortip_wrap'),
				resetform0=null,
				sureObj=public_tool.sureDialog(dia)/*回调提示对象*/,
				setSure=new sureObj();



			/*新增类弹出框*/
			var $addgoodstype_wrap=$('#addgoodstype_wrap'),
				admin_addgoodstype_form=document.getElementById('admin_addgoodstype_form'),
				$admin_addgoodstype_form=$(admin_addgoodstype_form),
				$admin_itemtype_wrap=$('#admin_itemtype_wrap'),
				$admin_basetype_wrap=$('#admin_basetype_wrap'),
				$admin_actiontype=$('#admin_actiontype'),
				$admin_typeid_addone=$('#admin_typeid_addone'),
				$admin_typeid_addtwo=$('#admin_typeid_addtwo'),
				$admin_typeparentname=$('#admin_typeparentname'),
				$admin_typeparentlayer=$('#admin_typeparentlayer'),
				$admin_typecode=$('#admin_typecode'),
				$admin_typename=$('#admin_typename'),
				$admin_typesort=$('#admin_typesort'),
				$admin_typeshow=$('#admin_typeshow'),
				$admin_typeimage=$('#admin_typeimage'),
				$admin_logoImage_file=$('#admin_logoImage_file');


			/*上传对象*/
			var logo_QN_Upload=new QiniuJsSDK(),
				ImageUpload_Token=getToken()||null,
				upload_bars= [];


			/*重置表单*/
			admin_addgoodstype_form.reset();


			/*根据权限判断显示添加属性按钮*/
			if(addtype_power){
				$admin_addtype_btn.removeClass('g-d-hidei');
			}else{
				$admin_addtype_btn.addClass('g-d-hidei');
			}

			/*请求属性数据*/
			requestAttr();


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
									name=JSON.parse(info);


								goodsTypeUpload({
									domain:domain,
									name:name
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


			/*绑定分类类型切换*/
			$.each([$admin_typeid_addone,$admin_typeid_addtwo],function(){
				var selector=this.selector;

				/*初始化查询一级分类*/
				if(selector.indexOf('addone')!==-1){
					getGoodsTypes('','one');
				}

				this.on('change',function(){
					var value=this.val();
					if(selector.indexOf('addone')!==-1){
						if(value===''){
							$admin_typeid_addtwo.html('');
							return false;
						}
						getGoodsTypes(value,'two');
					}
				});
			});


			/*绑定新增基本分类*/
			$admin_addtype_btn.on('click',function () {
				$admin_list_wrap.attr({
					'data-type':'base'
				});
				goodsTypeAdd({
					type:'base'
				});
			});


			/*绑定操作分类列表*/
			var operate_item,
				operate_current=null;
			$admin_list_wrap.on('click keyup',function (e) {
				var target= e.target,
					etype=e.type,
					nodename=target.nodeName.toLowerCase(),
					$this,
					$li,
					$wrap,
					label,
					id,
					layer,
					parentid,
					action;

				if(nodename==='td'||nodename==='tr'||nodename==='ul'||nodename==='div'||nodename==='li'){
					return false;
				}

				if(etype==='click'){
					/*点击分支*/
					if(nodename==='span'||nodename==='i'){
						if(nodename==='i'){
							target=target.parentNode;
						}
						if(target.className.indexOf('btn')!==-1){
							/*操作*/
							$this=$(target);
							$li=$this.closest('li');
							id=$li.attr('data-id');
							action=$this.attr('data-action');
							parentid=$li.attr('data-parendid');
							layer=$li.attr('data-layer');

							if(operate_item){
								operate_item.removeClass('item-lighten');
								operate_item=null;
							}
							operate_item=$li.addClass('item-lighten');
							/*执行操作*/
							if(action==='edit'){
								/*进入编辑状态*/
								$li.addClass('typeitem-editwrap');
							}else if(action==='cance'){
								/*取消编辑状态*/
								$li.removeClass('typeitem-editwrap');
								/*恢复被修改的数据至没修改之前状态*/
								resetGoodsTypeData($li);
							}else if(action==='confirm'){
								var result=validGoodsTypeData($li);
								if(result===null){
									return false;
								}
								/*提交编辑*/
								setSure.sure('编辑',function(cf){
									/*to do*/
									goodsTypeEdit({
										id:id,
										parentid:parentid,
										layer:layer,
										tip:cf.dia||dia,
										$li:$li,
										result:result
									});
								});
							}else if(action==='delete'){
								/*确认是否启用或禁用*/
								setSure.sure('delete',function(cf){
									/*to do*/
									goodsTypeDelete({
										id:id,
										parentid:parentid,
										layer:layer,
										tip:cf.dia||dia,
										$li:$li
									});
								});
							}else if(action==='add'){
								/*新增分类*/
								label=$li.attr('data-label');
								/*设置图片上传类型*/
								$admin_list_wrap.attr({
									'data-type':'item'
								});
								goodsTypeAdd({
									parentid:parentid,
									layer:layer,
									label:label,
									$li:$li,
									type:"item"
								})
							}else if(action==='preview'){
								var value=$this.attr('data-value');
								if(value===''){
									dia.content('<span class="g-c-bs-warning g-btips-warn">暂无图片请上传图片</span>').show();
									return false;
								}
								$this.next().toggleClass('typeitem-preview-active');
							}else if(action==='upload'){
								/*图片上传*/
								/*设置上传配置*/
								operate_current={
									$btn:$this
								};
								/*事件委托*/
								$admin_logoImage_file.trigger('click');
							}

						}else if(target.className.indexOf('main-typeicon')!==-1){
							/*展开或收缩*/
							$this=$(target);
							$wrap=$this.closest('li').find('>ul');
							$this.toggleClass('main-sub-typeicon');
							$wrap.toggleClass('g-d-hidei');
						}
						return false;
					}else if(nodename==='input'){
						if(target.type.indexOf('text')!==-1){
							return false;
						}
					}
				}else if(etype==='keyup'){
					/*键盘分支*/
					if(nodename==='input'){
						/*限制排序输入*/
						if(target.type.indexOf('radio')!==-1){
							return false;
						}
						if(target.attributes.getNamedItem('name').value==='typesort'){
							target.value=target.value.replace(/\D*/g,'');
						}
					}
				}
			});


			/*绑定关闭弹出层*/
			$.each([$addgoodstype_wrap],function () {
				this.on('hide.bs.modal',function(){
					emptyGoodsTypeData();
				});
			});



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
									var type=$admin_actiontype.val(),
										imgurl=$admin_typeimage.attr('data-image');
									if(imgurl===''){
										dia.content('<span class="g-c-bs-warning g-btips-warn">请先上传图像</span>').show();
										setTimeout(function () {
											dia.close();
										},2000);
										return false;
									}

									if(type==='item'){
										$.extend(true,setdata,{
											parentId:$admin_typeparentname.attr('data-value'),
											code:$admin_typecode.val(),
											name:$admin_typename.val(),
											sort:$admin_typesort.val(),
											isshow:$admin_typeshow.find(':checked').val(),
											url:imgurl
										});
									}else if(type==='base'){
										$.extend(true,setdata,{
											parentId:$admin_typeid_addone.find('option:selected').val()||'',
											parentId2:$admin_typeid_addtwo.find('option:selected').val()||'',
											code:$admin_typecode.val(),
											name:$admin_typename.val(),
											sort:$admin_typesort.val(),
											isshow:$admin_typeshow.find(':checked').val(),
											url:imgurl
										});
									}
									config['url']="../../json/goods/mall_goods_type_all.json";
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
											/*请求数据*/
											requestAttr();
											setTimeout(function () {
												dia.close();
												$addgoodstype_wrap.modal('hide');
												/*重置数据*/
												admin_addgoodstype_form.reset();
												emptyGoodsTypeData(type);
											},2000);
										}
									}
								}).fail(function(resp){
									console.log('error');
									dia.content('<span class="g-c-bs-warning g-btips-warn">添加分类失败</span>').show();
									setTimeout(function () {
										dia.close();
										$addgoodstype_wrap.modal('hide');
										/*重置数据*/
										admin_addgoodstype_form.reset();
										emptyGoodsTypeData(type);
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


		/*删除操作*/
		function goodsTypeDelete(obj) {
			var id=obj.id;

			if(typeof id==='undefined'||id===''){
				return false;
			}
			var tip=obj.tip,
				$li=obj.$li;

			$.ajax({
					url:"../../json/goods/mall_goods_type_all.json",
					dataType:'JSON',
					method:'post',
					data:{
						id:obj.id,
						parentid:obj.parentid,
						roleId:decodeURIComponent(logininfo.param.roleId),
						adminId:decodeURIComponent(logininfo.param.adminId),
						token:decodeURIComponent(logininfo.param.token)
					}
				})
				.done(function(resp){
					var code=parseInt(resp.code,10);
					if(code!==0){
						console.log(resp.message);
						tip.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
						setTimeout(function () {
							tip.close();
							if(operate_item){
								operate_item.removeClass('item-lighten');
								operate_item=null;
							}
						},2000);
						return false;
					}
					tip.content('<span class="g-c-bs-success g-btips-succ">删除成功</span>').show();
					setTimeout(function () {
						tip.close();
						setTimeout(function () {
							operate_item=null;
							$li.remove();
						},1000);
					},1000);
				})
				.fail(function(resp){
					console.log(resp.message);
					tip.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
					setTimeout(function () {
						tip.close();
						if(operate_item){
							operate_item.removeClass('item-lighten');
							operate_item=null;
						}
					},2000);
				});
		}

		/*编辑操作*/
		function goodsTypeEdit(obj) {
			var id=obj.id;

			if(typeof id==='undefined'||id===''){
				return false;
			}
			var tip=obj.tip,
				$li=obj.$li;

			$.ajax({
					url:"../../json/goods/mall_goods_type_all.json",
					dataType:'JSON',
					method:'post',
					data:{
						id:obj.id,
						parentid:obj.parentid,
						roleId:decodeURIComponent(logininfo.param.roleId),
						adminId:decodeURIComponent(logininfo.param.adminId),
						token:decodeURIComponent(logininfo.param.token)
					}
				})
				.done(function(resp){
					var code=parseInt(resp.code,10);
					if(code!==0){
						console.log(resp.message);
						tip.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
						setTimeout(function () {
							tip.close();
							if(operate_item){
								operate_item.removeClass('item-lighten');
								operate_item=null;
							}
						},2000);
						return false;
					}
					tip.content('<span class="g-c-bs-success g-btips-succ">编辑成功</span>').show();
					/*更新数据*/
					updateGoodsTypeDataByEdit($li);
					setTimeout(function () {
						tip.close();
						setTimeout(function () {
							if(operate_item){
								operate_item.removeClass('item-lighten');
								operate_item=null;
								$li.removeClass('typeitem-editwrap');
							}
						},1000);
					},1000);
				})
				.fail(function(resp){
					console.log(resp.message);
					tip.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
					setTimeout(function () {
						tip.close();
						if(operate_item){
							operate_item.removeClass('item-lighten');
							operate_item=null;
						}
					},2000);
				});
		}

		/*新增分类*/
		function goodsTypeAdd(config){
			var type=config.type;
			/*重置表单*/
			admin_addgoodstype_form.reset();
			/*初始化设置值*/
			if(type==='item'){
				/*项目新增*/
				$admin_itemtype_wrap.removeClass('g-d-hidei');
				$admin_basetype_wrap.addClass('g-d-hidei');
				$admin_actiontype.val('item');
				/*设置数据*/
				$admin_typeparentname.attr({
					'data-value':config.parentid
				}).html(config.label);
				$admin_typeparentlayer.html(config.layer+'级分类');
			}else if(type==='base'){
				/*基本新增*/
				$admin_itemtype_wrap.addClass('g-d-hidei');
				$admin_basetype_wrap.removeClass('g-d-hidei');
				$admin_actiontype.val('base');
			}else{
				$admin_itemtype_wrap.removeClass('g-d-hidei');
				$admin_basetype_wrap.addClass('g-d-hidei');
				$admin_actiontype.val('item');
			}
			$addgoodstype_wrap.modal('show',{
				backdrop:'static'
			});
		}

		/*级联类型查询(新增分类)*/
		function getGoodsTypes(value,type){
			var typemap={
				'one':'一级',
				'two':'二级',
				'three':'三级'
			};

			$.ajax({
				url:"../../json/goods/mall_goods_type_all.json",
				dataType:'JSON',
				async:false,
				method:'post',
				data:{
					roleId:decodeURIComponent(logininfo.param.roleId),
					adminId:decodeURIComponent(logininfo.param.adminId),
					token:decodeURIComponent(logininfo.param.token),
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
					return false;
				}

				var result=resp.result;
				if(!result){
					return false;
				}else{
					result=result.parentTypesList;
					if(!result){
						return false;
					}
				}
				var len=result.length,
					i= 0,
					str='';

				if(len!==0){
					for(i;i<len;i++){
						if(i===0){
							str+='<option value="" selected >请选择'+typemap[type]+'分类</option><option value="'+result[i]["id"]+'" >'+result[i]["name"]+'</option>';
						}else{
							str+='<option value="'+result[i]["id"]+'" >'+result[i]["name"]+'</option>';
						}
					}
					if(type==='one'){
						$(str).appendTo($admin_typeid_addone.html(''));
					}else if(type==='two'){
						$(str).appendTo($admin_typeid_addtwo.html(''));
					}
				}else{
					console.log(resp.message||'error');
					if(type==='one'){
						$admin_typeid_addone.html('');
						$admin_typeid_addtwo.html('');
					}else if(type==='two'){
						$admin_typeid_addtwo.html('');
					}
					return false;
				}
			}).fail(function(resp){
				console.log(resp.message||'error');
				if(type==='one'){
					$admin_typeid_addone.html('');
					$admin_typeid_addtwo.html('');
				}else if(type==='two'){
					$admin_typeid_addtwo.html('');
				}
			});
		}

		/*验证数据状态(编辑状态)*/
		function validGoodsTypeData($li) {
			var $edit=$li.find('>.typeitem-edit'),
				$edititem=$edit.find('.typeitem'),
				i=0,
				len=4,
				result=[];

			for(i;i<len;i++){
				var $item=$edititem.eq(i),
					value='';
				if(i===0||i===2){
					value=$item.find('input').val();
				}else if(i===1){
					value=$item.find('.typeitem-preview').attr('data-value');
				}else if(i===3){
					value=$item.find(':checked').val();
				}
				if(value===''||typeof value==='undefined'){
					tipsGoodsTypeError($admin_errortip_wrap,i);
					break;
				}else{
					result.push(value);
				}
			}
			if(result.length!==len){
				return null;
			}else{
				return JSON.stringify(result);
			}
		}

		/*验证提示信息(编辑状态)*/
		function tipsGoodsTypeError($wrap,type) {
			if(!$wrap){
				$wrap=$admin_errortip_wrap;
			}
			var tips='';
			if(type===0){
				tips='分类名称没有填写';
			}else if(type===1){
				tips='没有上传分类图标图片';
			}else if(type===2){
				tips='排序不能为空';
			}else if(type===3){
				tips='没有选中显示状态';
			}
			$wrap.html(tips);
			setTimeout(function () {
				$wrap.html('');
			},3000);
		}

		/*清空表单数据*/
		function emptyGoodsTypeData(type) {
			$admin_typeimage.attr({
				'data-image':''
			}).html('');
		}

		/*恢复默认(原来)数据(编辑状态)*/
		function resetGoodsTypeData($li){
			var $edit=$li.find('>.typeitem-edit'),
				$edititem=$edit.find('.typeitem'),
				i=0,
				len=4;

			/*清除上传配置信息*/
			if(operate_current!==null){
				operate_current=null;
			}

			for(i;i<len;i++){
				var $item=$edititem.eq(i),
					oldvalue='',
					$this;
				if(i===0||i===2){
					$this=$item.find('input');
					oldvalue=$this.attr('data-value');
					$this.val(oldvalue);
				}else if(i===1){
					$this=$item.find('.typeitem-preview');
					oldvalue=$this.attr('data-value');
					var $upload=$this.prev();
					if($upload.attr('data-value')!==oldvalue){
						$this.find('img').attr({
							'src':oldvalue
						});
						$upload.attr({
							'data-value':oldvalue
						});
					}
				}else if(i===3){
					oldvalue=$item.attr('data-value');
					$item.find('input').each(function () {
						$this=$(this);
						var tempvalue=$this.val();
						if(tempvalue===oldvalue){
							$this.prop({
								'checked':true
							});
							return false;
						}
					});
				}
			}
		}

		/*更新原来值(编辑状态)*/
		function updateGoodsTypeDataByEdit($li){
			var $showwrap=$li.find('>.typeitem-default'),
				$editwrap=$li.find('>.typeitem-edit'),
				$showitem=$showwrap.find('.typeitem'),
				$edititem=$editwrap.find('.typeitem'),
				i=0,
				len=4,
				issub=$li.hasClass('admin-subtypeitem');




			for(i;i<len;i++){
				var $curitem=$edititem.eq(i),
					newvalue,
					$this;

				if(i===0){
					$this=$curitem.find('input');
					newvalue=$this.val();
					$this.attr({
						'data-value':newvalue
					});
					if(issub){
						$showitem.eq(1).html(newvalue);
					}else{
						$showitem.eq(0).html(newvalue);
					}
				}else if(i===2){
					$this=$curitem.find('input');
					newvalue=$this.val();
					$this.attr({
						'data-value':newvalue
					});
					if(issub){
						$showitem.eq(2).html(newvalue);
					}else{
						$showitem.eq(1).html(newvalue);
					}
				}else if(i===3){
					$this=$curitem.find(':checked');
					newvalue=parseInt($this.val(),10);
					$curitem.attr({
						'data-value':newvalue
					});
					if(issub){
						if(newvalue===0){
							$showitem.eq(3).html('<div class="g-c-gray12">隐藏</div>');
						}else if(newvalue===1){
							$showitem.eq(3).html('<div class="g-c-gray8">显示</div>');
						}
					}else{
						if(newvalue===0){
							$showitem.eq(2).html('<div class="g-c-gray12">隐藏</div>');
						}else if(newvalue===1){
							$showitem.eq(2).html('<div class="g-c-gray8">显示</div>');
						}
					}
				}
			}
		}

		/*解析属性--开始解析*/
		function resolveAttr(obj,limit) {
			if(!obj||typeof obj==='undefined'){
				return false;
			}
			if(typeof limit==='undefined'||limit<=0){
				limit=1;
			}
			var attrlist=obj,
				str='',
				i=0,
				len=attrlist.length,
				layer=1;

			if(typeof len==='undefined'){
				str+=doItems(attrlist,{
					flag:false,
					limit:limit,
					layer:layer
				});
				attrlist=attrlist["sublist"];
				len=attrlist.length;
			}

			if(len!==0){
				for(i;i<len;i++){
						var curitem=attrlist[i],
						subitem=typeof curitem["sublist"]==='undefined'?null:curitem["sublist"];
					if(subitem){
						var tempchild=doAttr(subitem,{
								limit:limit,
								layer:layer
							});

						if(tempchild){
							str+=doItems(curitem,{flag:true,limit:limit,layer:layer})+'<ul class="admin-typeitem-wrap admin-subtype-wrap g-d-hidei">'+tempchild+'</ul>\
						</li>';
						}
					}else{
						str+=doItems(curitem,{
							flag:false,
							limit:limit,
							layer:layer
						});
					}
				}
				return str;
			}else{
				return false;
			}
		}

		/*解析属性--递归解析*/
		function doAttr(obj,config) {
			if(!obj||typeof obj==='undefined'){
				return false;
			}
			var attrlist=obj,
				str='',
				i=0,
				len=attrlist.length;

			var layer=config.layer,
				limit=config.limit;
			if(layer){
				layer++;
			}

			if(limit>=1&&layer>limit){
				return false;
			}

			if(len!==0){
				for(i;i<len;i++){
					var curitem=attrlist[i],
						subitem=typeof curitem["sublist"]==='undefined'?null:curitem["sublist"];
					if(subitem){
						var tempchild=doAttr(subitem,{
							limit:limit,
							layer:layer
						});
						if(tempchild){
							str+=doItems(curitem,{
									flag:true,
									limit:limit,
									layer:layer
								})+'<ul class="admin-typeitem-wrap admin-subtype-wrap g-d-hidei">'+tempchild+'</ul>\
							</li>';
						}
					}else{
						str+=doItems(curitem,{
							flag:false,
							limit:limit,
							layer:layer
						});
					}
				}
				return str;
			}else{
				return false;
			}
		}

		/*解析属性--公共解析*/
		function doItems(obj,config){
			var curitem=obj,
				id=curitem["id"],
				parentid=curitem["parentId"],
				isshow=parseInt(curitem["isshow"],10),
				imgurl=curitem["url"],
				label=curitem["labelname"],
				str='',
				stredit='',
				flag=config.flag,
				limit=config.limit,
				layer=config.layer;


			if(flag){
				str='<li class="admin-subtypeitem" data-label="'+label+'" data-layer="'+layer+'" data-parentid="'+parentid+'" data-id="'+id+'">';

				if(layer>1){
					str+='<div class="typeitem-default"><span class="typeitem subtype-mgap'+(layer - 1)+' main-typeicon g-w-percent3"></span>\
							<div class="typeitem subtype-pgap'+layer+' g-w-percent21">'+label+'</div>';
				}else{
					str+='<div class="typeitem-default"><span class="typeitem main-typeicon g-w-percent3"></span>\
							<div class="typeitem g-w-percent21">'+label+'</div>';
				}
			}else{
				str='<li data-label="'+label+'" data-layer="'+layer+'"  data-parentid="'+parentid+'" data-id="'+id+'">';

				if(layer>1){
					str+='<div class="typeitem-default"><div class="typeitem subtype-pgap'+layer+' g-w-percent21">'+label+'</div>';
				}else{
					str+='<div class="typeitem-default"><div class="typeitem g-w-percent21">'+label+'</div>';
				}
			}

			str+='<div class="typeitem g-w-percent5">'+curitem["sort"]+'</div>';


			/*编辑状态*/
			stredit+='<div class="typeitem-edit"><div class="typeitem g-w-percent11"><input type="text" name="typename" data-value="'+label+'"  placeholder="请输入分类名称" value="'+label+'" /></div>\
								<div class="typeitem g-w-percent10">\
									<span data-action="upload" data-value="" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8"><i class="fa-upload"></i>&nbsp;&nbsp;上传</span>'
									+(function (){
										if(typeof imgurl==='undefined'||!imgurl||imgurl===''){
											return '<span data-action="preview" data-value="" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8"><i class="fa-image"></i>&nbsp;&nbsp;查看分类图标</span><div class="typeitem-preview" data-value=""><div></div></div>';
										}else{
											return '<span data-action="preview" data-value="'+imgurl+'" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8"><i class="fa-image"></i>&nbsp;&nbsp;查看分类图标</span><div class="typeitem-preview"  data-value="'+imgurl+'"><div><img src="'+imgurl+'" alt="预览" /></div></div>';
										}
									}())+
								'</div>\
								<div class="typeitem g-w-percent5"><input type="text" name="typesort" data-value="'+curitem["sort"]+'" maxlength="6" value="'+curitem["sort"]+'" /></div>';




			if(isshow===0){
				str+='<div class="typeitem g-w-percent8"><div class="g-c-gray12">隐藏</div></div>';

				stredit+='<div class="typeitem g-w-percent8" data-value="'+isshow+'"><label class="btn btn-white btn-xs g-br2 g-c-gray6">显示：<input type="radio" name="typeshow'+id+'" value="1" /></label>\
				<label class="btn btn-white btn-xs g-br2 g-c-gray6">隐藏：<input checked type="radio"  name="typeshow'+id+'" value="0" /></label></div>';
			}else if(isshow===1){
				str+='<div class="typeitem g-w-percent8"><div class="g-c-gray8">显示</div></div>';

				stredit+='<div class="typeitem g-w-percent8" data-value="'+isshow+'"><label class="btn btn-white btn-xs g-br2 g-c-gray6">显示：<input type="radio" checked name="typeshow'+id+'" value="1" /></label>\
				<label class="btn btn-white btn-xs g-br2 g-c-gray6">隐藏：<input type="radio" name="typeshow'+id+'" value="0" /></label></div>';
			}else{
				stredit+='<div class="typeitem g-w-percent8" data-value="'+isshow+'"><label class="btn btn-white btn-xs g-br2 g-c-gray6">显示：<input type="radio" checked name="typeshow'+id+'" value="1" /></label>\
				<label class="btn btn-white btn-xs g-br2 g-c-gray6">隐藏：<input type="radio" name="typeshow'+id+'" value="0" /></label></div>';
			}


			str+='<div class="typeitem g-w-percent12">';
			stredit+='<div class="typeitem g-w-percent12">';


			if(edittype_power){
				str+='<span data-action="edit" data-parentid="'+parentid+'" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
							<i class="fa-pencil"></i>&nbsp;&nbsp;编辑\
						</span>';

				/*编辑状态*/
				stredit+='<span data-action="confirm" data-parentid="'+parentid+'" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-bs-success">\
									<i class="fa-check"></i>&nbsp;&nbsp;确定\
								</span>\
								<span data-action="cance" data-parentid="'+parentid+'" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray10">\
									<i class="fa-close"></i>&nbsp;&nbsp;取消\
								</span>';
			}
			if(addtype_power){
				if(flag){
					str+='<span data-action="add" data-parentid="'+parentid+'" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
							<i class="fa-plus"></i>&nbsp;&nbsp;新增下级分类\
						</span>';
				}else{
					if(layer<limit){
						str+='<span data-action="add" data-parentid="'+parentid+'" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
									<i class="fa-plus"></i>&nbsp;&nbsp;新增下级分类\
								</span>';
					}
				}
			}

			if(deletetype_power){
				str+='<span data-action="delete" data-parentid="'+parentid+'" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
							<i class="fa-trash"></i>&nbsp;&nbsp;删除\
						</span>';
			}

			str+='</div></div>';
			stredit+='</div></div>';

			return flag?str+stredit:str+stredit+'</li>';
		}
		
		/*请求属性*/
		function requestAttr(){
			$.ajax({
					url:"../../json/goods/mall_goods_type_all.json",
					dataType:'JSON',
					method:'post',
					data:{
						roleId:decodeURIComponent(logininfo.param.roleId),
						adminId:decodeURIComponent(logininfo.param.adminId),
						token:decodeURIComponent(logininfo.param.token)
					}
				})
				.done(function(resp){
					var code=parseInt(resp.code,10);
					if(code!==0){
						console.log(resp.message);
						dia.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
						setTimeout(function () {
							dia.close();
						},2000);
						return false;
					}
					var result=resp.result;
					if(result&&result.list){
						/*解析属性*/
						var result='<ul class="admin-typeitem-wrap admin-maintype-wrap">'+resolveAttr(result.list,4)+'</ul>';
						if(result){
							$(result).appendTo($admin_list_wrap.html(''));
						}else{
							$admin_list_wrap.addClass('g-t-c').html('暂无数据，请&nbsp;<span class="g-c-info">添加分类</span>');
						}
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

		/*上传适配操作*/
		function goodsTypeUpload(config){
			var domain=config.domain,
				name=config.name,
				type=$admin_list_wrap.attr('data-type'),
				suffix='?imageView2/1/w/160/h/160',
				url=domain+'/'+name.key;

			if(type==='base'){
				$admin_typeimage.attr({
					'data-image':url
				}).html('<img src="'+url+suffix+'" alt="缩略图">');
			}else if(type==='item'){
				if(operate_current!==null){
					var $btn=operate_current.$btn,
						$item=$btn.parent(),
						$show=$btn.next(),
						$wrap=$item.find('.typeitem-preview');

					/*设置查看*/
					$show.attr({
						'data-value':url
					});
					$wrap.attr({
						'data-value':url
					}).find('div').html('<img src="'+url+suffix+'" alt="缩略图">');
					/*释放内存*/
					operate_current=null;
				}
			}
		}

		/*获取七牛token*/
		function getToken(){
			var result=null;
			$.ajax({
				url:'../../json/goods/mall_goods_type_all.json',
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