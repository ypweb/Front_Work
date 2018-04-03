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
				goodstypeadd_power=public_tool.getKeyPower('bzw-goodstype-addlower',powermap),
				goodstypeedit_power=public_tool.getKeyPower('bzw-goodstype-edit',powermap),
				goodstypedelete_power=public_tool.getKeyPower('bzw-goodstype-delete',powermap);



			/*dom引用和相关变量定义*/
			var module_id='bzw-goodstype-list'/*模块id，主要用于本地存储传值*/,
				$admin_list_wrap=$('#admin_list_wrap'),
				$admin_page_wrap=$('#admin_page_wrap'),
				page_config={
					page:1,
					pageSize:10,
					total:0
				},
				subconfig={
					adminId:decodeURIComponent(logininfo.param.adminId),
					token:decodeURIComponent(logininfo.param.token),
					pageSize:10000
				}/*子菜单配置对象*/,
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
				$admin_typeparentname=$('#admin_typeparentname'),
				$admin_typeparentlayer=$('#admin_typeparentlayer'),
				$admin_typecode=$('#admin_typecode'),
				$admin_typename=$('#admin_typename'),
				$admin_typesort=$('#admin_typesort'),
				$admin_typeremark=$('#admin_typeremark'),
				$admin_typeshow=$('#admin_typeshow'),
				$admin_typeimage=$('#admin_typeimage'),
				$image_url_file=$('#image_url_file'),
				operate_current=null;


			/*上传对象*/
			var logo_QN_Upload=new QiniuJsSDK(),
				ImageUpload_Token=getToken()||null,
				upload_bars= [];


			/*重置表单*/
			admin_addgoodstype_form.reset();


			/*请求属性数据*/
			requestAttr(page_config);


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


			/*绑定操作分类列表*/
			var operate_item;
			$admin_list_wrap.on('click keyup',function (e) {
				var target= e.target,
					etype=e.type,
					nodename=target.nodeName.toLowerCase(),
					$this,
					$li,
					$wrap,
					label,
					id,
					parentid,
					layer,
					gtcode,
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
							parentid=$this.attr('data-parentid');
							gtcode=$li.attr('data-gtcode');
							layer=$li.attr('data-layer');

							if(operate_item){
								operate_item.removeClass('item-lighten');
								operate_item=null;
							}
							operate_item=$li.addClass('item-lighten');
							/*执行操作*/
							if(action==='edit'){
								/*设置图片上传类型*/
								$admin_list_wrap.attr({
									'data-type':'edit'
								});
								/*进入编辑状态*/
								$li.addClass('typeitem-editwrap');
							}else if(action==='cance'){
								/*取消编辑状态*/
								$li.removeClass('typeitem-editwrap');
								/*恢复被修改的数据至没修改之前状态*/
								resetGoodsTypeData($li);
								/*设置图片上传类型*/
								$admin_list_wrap.attr({
									'data-type':'add'
								});
							}else if(action==='confirm'){
								var result=validGoodsTypeData($li);
								if(result===null){
									return false;
								}
								/*设置图片上传类型*/
								$admin_list_wrap.attr({
									'data-type':'edit'
								});
								/*提交编辑*/
								setSure.sure('编辑',function(cf){
									/*to do*/
									goodsTypeEdit({
										id:id,
										gtcode:gtcode,
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
										gtcode:gtcode,
										layer:layer,
										tip:cf.dia||dia,
										$li:$li
									});
								});
							}else if(action==='add'){
								/*设置图片上传类型*/
								$admin_list_wrap.attr({
									'data-type':'add'
								});
								/*新增分类*/
								label=$li.attr('data-label');
								goodsTypeAdd({
									parentid:id,
									gtcode:gtcode,
									layer:layer,
									label:label,
									$li:$li
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
								$image_url_file.trigger('click');
							}

						}else if(target.className.indexOf('main-typeicon')!==-1){
							/*展开或收缩*/
							$this=$(target);
							$li=$this.closest('li');
							id=$li.attr('data-id');
							layer=$li.attr('data-layer');
							$wrap=$li.find('>ul');

							var isload=parseInt($this.attr('data-loadsub'),10);
							if(isload===0){
								/*加载子分类*/
								var subitem=doSubAttr(id);
								if(subitem!==null){
									var subtype=doAttr(subitem,{
										limit:3,
										layer:layer,
										parentid:id
									});
									if(subtype){
										$(subtype).appendTo($wrap);
										/*设置已经加载*/
										$this.attr({
											'data-loadsub':1
										});
										subtype=null;
									}
								}
							}
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
										parentId:$admin_typeparentname.attr('data-value'),
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
											/*请求数据*/
											requestAttr(page_config);
											setTimeout(function () {
												dia.close();
												$addgoodstype_wrap.modal('hide');
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
										$addgoodstype_wrap.modal('hide');
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


		/*删除操作*/
		function goodsTypeDelete(obj) {
			var id=obj.id;

			if(typeof id==='undefined'||id===''){
				return false;
			}
			var tip=obj.tip,
				$li=obj.$li;

			$.ajax({
					url:"http://112.74.207.132:8081/mall-buzhubms-api/goodstype/delete",
					dataType:'JSON',
					method:'post',
					data:{
						ids:obj.id,
						roleId:decodeURIComponent(logininfo.param.roleId),
						adminId:decodeURIComponent(logininfo.param.adminId),
						grade:decodeURIComponent(logininfo.param.grade),
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
				$li=obj.$li,
				result=obj.result,
				param={
					id:obj.id,
					name:result[0],
					sort:result[2],
					isVisible:parseInt(result[3],10)===1?true:false,
					roleId:decodeURIComponent(logininfo.param.roleId),
					adminId:decodeURIComponent(logininfo.param.adminId),
					grade:decodeURIComponent(logininfo.param.grade),
					token:decodeURIComponent(logininfo.param.token)
				};

			if(result[1]!==''){
				param['imageUrl']=result[1];
			}
			$.ajax({
					url:"http://112.74.207.132:8081/mall-buzhubms-api/goodstype/update",
					dataType:'JSON',
					method:'post',
					data:param
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
						/*释放内存*/
						if(operate_current!==null){
							operate_current=null;
						}
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
			/*重置表单*/
			admin_addgoodstype_form.reset();
			/*初始化设置值*/
			/*设置数据*/
			$admin_typeparentname.attr({
				'data-value':config.parentid
			}).html(config.label);
			$admin_typeparentlayer.html(config.layer+'级分类');
			$addgoodstype_wrap.modal('show',{
				backdrop:'static'
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
				if(i===1){
					/*设置图片（可为空）*/
					if(value===''||typeof value==='undefined'){
						result.push('');
						break;
					}else{
						result.push(value);
					}
				}else{
					if(value===''||typeof value==='undefined'){
						tipsGoodsTypeError($admin_errortip_wrap,i);
						break;
					}else{
						result.push(value);
					}
				}
			}
			if(result.length!==len){
				return null;
			}else{
				return result;
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
					var $show=$this.prev();
					if($this.hasClass('typeitem-preview-active')){
						$show.trigger('click');
					}
					if($show.attr('data-value')!==oldvalue){
						$this.find('img').attr({
							'src':oldvalue
						});
						$show.attr({
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

			if(len!==0){
				for(i;i<len;i++){
						var curitem=attrlist[i],
							hassub=curitem["hasSub"];
					if(hassub){
						str+=doItems(curitem,{
								flag:true,
								limit:limit,
								layer:layer,
								parentid:''
							})+'<ul class="admin-typeitem-wrap admin-subtype-wrap g-d-hidei"></ul></li>';
					}else{
						str+=doItems(curitem,{
							flag:false,
							limit:limit,
							layer:layer,
							parentid:''
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
				limit=config.limit,
				parentid=config.parentid;
			if(typeof layer!=='undefined'){
				layer++;
			}

			if(limit>=1&&layer>limit){
				return false;
			}

			if(len!==0){
				for(i;i<len;i++){
					var curitem=attrlist[i],
						hassub=curitem["hasSub"];
					if(hassub){
						str+=doItems(curitem,{
								flag:true,
								limit:limit,
								layer:layer,
								parentid:parentid
							})+'<ul class="admin-typeitem-wrap admin-subtype-wrap g-d-hidei"></ul></li>';
					}else{
						str+=doItems(curitem,{
							flag:false,
							limit:limit,
							layer:layer,
							parentid:parentid
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
				isshow=curitem["isVisible"],
				sort=curitem["sort"],
				gtCode=curitem["gtCode"],
				imgurl=curitem["imageUrl"],
				label=curitem["name"],
				str='',
				stredit='',
				flag=config.flag,
				limit=config.limit,
				layer=config.layer,
				parentid=config.parentid;


			if(flag){
				str='<li class="admin-subtypeitem" data-parentid="'+parentid+'" data-label="'+label+'" data-layer="'+layer+'" data-id="'+id+'" data-gtcode="'+gtCode+'">';
				if(layer>1){
					str+='<div class="typeitem-default"><span data-loadsub="0" class="typeitem subtype-mgap'+(layer - 1)+' main-typeicon g-w-percent3"></span>\
							<div class="typeitem subtype-pgap'+layer+' g-w-percent21">'+label+'</div>';
				}else{
					str+='<div class="typeitem-default"><span data-loadsub="0" class="typeitem main-typeicon g-w-percent3"></span>\
							<div class="typeitem g-w-percent21">'+label+'</div>';
				}
			}else{
				str='<li data-label="'+label+'" data-parentid="'+parentid+'"  data-layer="'+layer+'" data-id="'+id+'" data-gtcode="'+gtCode+'">';

				if(layer>1){
					str+='<div class="typeitem-default"><div class="typeitem subtype-pgap'+layer+' g-w-percent21">'+label+'</div>';
				}else{
					str+='<div class="typeitem-default"><div class="typeitem g-w-percent21">'+label+'</div>';
				}
			}

			str+='<div class="typeitem g-w-percent5">'+sort+'</div>';


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
								<div class="typeitem g-w-percent5"><input type="text" name="typesort" data-value="'+sort+'" maxlength="6" value="'+sort+'" /></div>';




			if(isshow){
				str+='<div class="typeitem g-w-percent8"><div class="g-c-gray8">显示</div></div>';

				stredit+='<div class="typeitem g-w-percent8" data-value="1"><label class="btn btn-white btn-xs g-br2 g-c-gray6">显示：<input type="radio" checked name="typeshow'+id+'" value="1" /></label>\
				<label class="btn btn-white btn-xs g-br2 g-c-gray6">隐藏：<input type="radio" name="typeshow'+id+'" value="0" /></label></div>';
			}else if(!isshow){
				str+='<div class="typeitem g-w-percent8"><div class="g-c-gray12">隐藏</div></div>';

				stredit+='<div class="typeitem g-w-percent8" data-value="0"><label class="btn btn-white btn-xs g-br2 g-c-gray6">显示：<input type="radio" name="typeshow'+id+'" value="1" /></label>\
				<label class="btn btn-white btn-xs g-br2 g-c-gray6">隐藏：<input checked type="radio"  name="typeshow'+id+'" value="0" /></label></div>';
			}else{
				stredit+='<div class="typeitem g-w-percent8" data-value="1"><label class="btn btn-white btn-xs g-br2 g-c-gray6">显示：<input type="radio" checked name="typeshow'+id+'" value="1" /></label>\
				<label class="btn btn-white btn-xs g-br2 g-c-gray6">隐藏：<input type="radio" name="typeshow'+id+'" value="0" /></label></div>';
			}


			str+='<div class="typeitem g-w-percent12">';
			stredit+='<div class="typeitem g-w-percent12">';


			if(goodstypeedit_power){
				str+='<span data-parentid="'+parentid+'"  data-action="edit" data-gtcode="'+gtCode+'" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
							<i class="fa-pencil"></i>&nbsp;&nbsp;编辑\
						</span>';

				/*编辑状态*/
				stredit+='<span data-parentid="'+parentid+'"  data-action="confirm"  data-gtcode="'+gtCode+'" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-bs-success">\
									<i class="fa-check"></i>&nbsp;&nbsp;确定\
								</span>\
								<span data-action="cance"  data-gtcode="'+gtCode+'" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray10">\
									<i class="fa-close"></i>&nbsp;&nbsp;取消\
								</span>';
			}
			if(goodstypeadd_power){
				if(flag){
					str+='<span data-parentid="'+parentid+'"  data-action="add"  data-gtcode="'+gtCode+'" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
							<i class="fa-plus"></i>&nbsp;&nbsp;新增下级分类\
						</span>';
				}else{
					if(layer<limit){
						str+='<span data-parentid="'+parentid+'"  data-action="add"  data-gtcode="'+gtCode+'" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
									<i class="fa-plus"></i>&nbsp;&nbsp;新增下级分类\
								</span>';
					}
				}
			}

			if(goodstypedelete_power){
				str+='<span data-parentid="'+parentid+'"  data-action="delete"  data-gtcode="'+gtCode+'" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
							<i class="fa-trash"></i>&nbsp;&nbsp;删除\
						</span>';
			}

			str+='</div></div>';
			stredit+='</div></div>';

			return flag?str+stredit:str+stredit+'</li>';
		}

		/*请求并判断是否存在子菜单*/
		function doSubAttr(id) {
			var list=null;
			if(typeof id==='undefined'){
				return null;
			}
			subconfig['parentId']=id;
			$.ajax({
					url:"http://112.74.207.132:8081/mall-buzhubms-api/goodstype/list",
					dataType:'JSON',
					async:false,
					method:'post',
					data:subconfig
				})
				.done(function(resp){
					var code=parseInt(resp.code,10);
					if(code!==0){
						console.log(resp.message);
						return null;
					}
					var result=resp.result;
					if(result){
						list=result.list;
						return null;
					}
				})
				.fail(function(resp){
					console.log(resp.message);
					return null;
				});
			return list.length===0?null:list;
		}
		
		/*请求属性*/
		function requestAttr(config){
			$.ajax({
					url:"http://112.74.207.132:8081/mall-buzhubms-api/goodstype/list",
					dataType:'JSON',
					async:false,
					method:'post',
					data:{
						parentId:'',
						roleId:decodeURIComponent(logininfo.param.roleId),
						adminId:decodeURIComponent(logininfo.param.adminId),
						grade:decodeURIComponent(logininfo.param.grade),
						token:decodeURIComponent(logininfo.param.token),
						page:config.page,
						pageSize:config.pageSize
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
					if(result){
						/*分页调用*/
						if(result.count!==0){
							config.total=result.count;
							$admin_page_wrap.pagination({
								pageSize:config.pageSize,
								total:config.total,
								pageNumber:config.page,
								onSelectPage:function(pageNumber,pageSize){
									/*再次查询*/
									requestAttr({
										pageSize:pageSize,
										page:pageNumber,
										total:config.total
									});
								}
							});
						}else{
							config.total=0;
						}
						if(result.list){
							/*解析属性*/
							var str='<ul class="admin-typeitem-wrap admin-maintype-wrap">'+resolveAttr(result.list,3)+'</ul>';
							if(str){
								$(str).appendTo($admin_list_wrap.html(''));
							}else{
								$admin_list_wrap.addClass('g-t-c').html('暂无数据，请&nbsp;<span class="g-c-info">添加分类</span>');
							}
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

			if(type==='add'){
				$admin_typeimage.attr({
					'data-image':url
				}).html('<img src="'+url+suffix+'" alt="缩略图">');
			}else if(type==='edit'){
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

					if(!$wrap.hasClass('typeitem-preview-active')){
						$show.trigger('click');
					}
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