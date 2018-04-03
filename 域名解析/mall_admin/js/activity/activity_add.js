/*admin_member:成员设置*/
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
				activityadd_power=public_tool.getKeyPower('bzw-activity-add',powermap);



			/*dom引用和相关变量定义*/
			var module_id='bzw-activity-add'/*模块id，主要用于本地存储传值*/,
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
				admin_addactivity_form=document.getElementById('admin_addactivity_form'),
				$admin_addactivity_form=$(admin_addactivity_form),
				goods_params={
					roleId:decodeURIComponent(logininfo.param.roleId),
					adminId:decodeURIComponent(logininfo.param.adminId),
					grade:decodeURIComponent(logininfo.param.grade),
					token:decodeURIComponent(logininfo.param.token)
				},
				$admin_id=$('#admin_id'),
				$admin_title=$('#admin_title'),
				$admin_moduleLocationId=$('#admin_moduleLocationId'),
				$admin_advertform=$('#admin_advertform'),
				$admin_advertdata=$('#admin_advertdata'),
				$admin_forwardType=$('#admin_forwardType'),
				$admin_goodsTypeId=$('#admin_goodsTypeId'),
				$admin_forwardUrl=$('#admin_forwardUrl'),
				$admin_status=$('#admin_status'),
				$forwardId_wrap=$('#forwardId_wrap'),
				$forwardUrl_wrap=$('#forwardUrl_wrap'),
				$forwardId_goodswrap=$('#forwardId_goodswrap'),
				$forwardId_typewrap=$('#forwardId_typewrap'),
				$admin_urlImage_tips=$('#admin_urlImage_tips'),
				$admin_urlImage=$('#admin_urlImage'),
				$admin_urlImage_file=$('#admin_urlImage_file'),
				$admin_action=$('#admin_action'),
				$admin_remark=$('#admin_remark'),
				resetform0=null,
			 	operate_item;


			/*商品查询对象*/
			var $admin_list_wrap=$('#admin_list_wrap')/*表格*/,
				$admin_page_wrap=$('#admin_page_wrap'),
				$search_name=$('#search_name'),
				$search_status=$('#search_status'),
				$search_providerName=$('#search_providerName'),
				$search_gtione=$('#search_gtione'),
				$search_gtitwo=$('#search_gtitwo'),
				$search_gtithree=$('#search_gtithree'),
				$admin_search_btn=$('#admin_search_btn'),
				$admin_search_clear=$('#admin_search_clear'),
				goodstypeid='',
				advertpos='';



			/*列表请求配置*/
			var goods_page={
					page:1,
					pageSize:10,
					total:0
				},
				goods_config={
					$admin_list_wrap:$admin_list_wrap,
					$admin_page_wrap:$admin_page_wrap,
					config:{
						processing:true,/*大消耗操作时是否显示处理状态*/
						deferRender:true,/*是否延迟加载数据*/
						autoWidth:true,/*是否*/
						paging:false,
						ajax:{
							url:"http://112.74.207.132:8081/mall-buzhubms-api/goods/list",
							dataType:'JSON',
							method:'post',
							dataSrc:function ( json ) {
								var code=parseInt(json.code,10);
								if(code!==0){
									if(code===999){
										/*清空缓存*/
										public_tool.loginTips(function () {
											public_tool.clear();
											public_tool.clearCacheData();
										});
									}
									console.log(json.message);
									return [];
								}
								var result=json.result;
								if(typeof result==='undefined'){
									return [];
								}
								/*设置分页*/
								goods_page.page=result.page;
								goods_page.pageSize=result.pageSize;
								goods_page.total=result.count;
								/*分页调用*/
								$admin_page_wrap.pagination({
									pageSize:goods_page.pageSize,
									total:goods_page.total,
									pageNumber:goods_page.page,
									onSelectPage:function(pageNumber,pageSize){
										/*再次查询*/
										var param=goods_config.config.ajax.data;
										param.page=pageNumber;
										param.pageSize=pageSize;
										goods_config.config.ajax.data=param;
										getColumnData(goods_page,goods_config);
									}
								});
								return result?result.list||[]:[];
							},
							data:{
								roleId:decodeURIComponent(logininfo.param.roleId),
								adminId:decodeURIComponent(logininfo.param.adminId),
								grade:decodeURIComponent(logininfo.param.grade),
								token:decodeURIComponent(logininfo.param.token),
								page:1,
								pageSize:10
							}
						},
						info:false,
						searching:false,
						ordering:true,
						columns: [
							{
								"data":"gcode"
							},
							{
								"data":"name"
							},
							{
								"data":"providerName"
							},
							{
								"data":"goodsTypeName"
							},
							{
								"data":"status",
								"render":function(data, type, full, meta ){
									var stauts=parseInt(data,10),
										statusmap={
											0:"仓库",
											1:"上架",
											2:"下架",
											3:"删除",
											4:"待审核"
										},
										str='';

									if(stauts===3){
										str='<div class="g-c-red1">'+statusmap[stauts]+'</div>';
									}else if(stauts===0){
										str='<div class="g-c-warn">'+statusmap[stauts]+'</div>';
									}else if(stauts===1){
										str='<div class="g-c-gray6">'+statusmap[stauts]+'</div>';
									}else if(stauts===2){
										str='<div class="g-c-gray9">'+statusmap[stauts]+'</div>';
									}else if(stauts===4){
										str='<div class="g-c-info">'+statusmap[stauts]+'</div>';
									}
									return str;
								}
							},
							{
								"data":"id",
								"render":function(data, type, full, meta ){
									var id=parseInt(data,10),
										btns='';

									/*选择商品*/
									if(activityadd_power){
										btns+='<span data-action="checkgoods" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
													<i class="fa-check"></i>\
													<span>选择</span>\
												</span>';
									}
									return btns;
								}
							}
						]
					}
				};


			/*初始化请求*/
			getColumnData(goods_page,goods_config);


			/*查询分类并绑定分类查询*/
			$.each([$search_gtione,$search_gtitwo,$search_gtithree],function(){
				var selector=this.selector;
				/*初始化查询一级分类*/
				if(selector.indexOf('one')!==-1){
					getGoodsTypes('','one',true);
				}
				this.on('change',function(){
					var $option=$(this).find(':selected'),
						value=this.value,
						hasub=false;
					if(selector.indexOf('one')!==-1){
						if(value===''){
							$search_gtitwo.html('');
							$search_gtithree.html('');
							goodstypeid='';
							$admin_goodsTypeId.attr({
								'data-id':''
							}).val('').select();
							return false;
						}
						hasub=$option.attr('data-hassub');
						goodstypeid=value;
						$admin_goodsTypeId.attr({
							'data-id':value
						}).val($option.html()).select();
						if(hasub==='true'){
							getGoodsTypes(value,'two');
							$search_gtithree.html('');
						}else{
							$search_gtitwo.html('');
							$search_gtithree.html('');
						}
					}else if(selector.indexOf('two')!==-1){
						if(value===''){
							$search_gtithree.html('');
							$option=$search_gtione.find(':selected');
							goodstypeid=$option.val();
							$admin_goodsTypeId.attr({
								'data-id':goodstypeid
							}).val($option.html()).select();
							return false;
						}
						hasub=$option.attr('data-hassub');
						goodstypeid=value;
						$admin_goodsTypeId.attr({
							'data-id':value
						}).val($option.html()).select();
						if(hasub==='true'){
							getGoodsTypes(value,'three');
						}else{
							$search_gtithree.html('');
						}
					}else if(selector.indexOf('three')!==-1){
						if(value===''){
							$option=$search_gtitwo.find(':selected');
							goodstypeid=$option.val();
							$admin_goodsTypeId.attr({
								'data-id':goodstypeid
							}).val($option.html()).select();
							return false;
						}
						goodstypeid=value;
						$admin_goodsTypeId.attr({
							'data-id':goodstypeid
						}).val($option.html()).select();
					}
				});
			});


			/*上传对象*/
			var logo_QN_Upload=new QiniuJsSDK(),
				ImageUpload_Token=getToken()||null,
				upload_bars= [];


			/*重置表单*/
			admin_addactivity_form.reset();



			/*查询广告位置ID*/
			searchActivityPosId();


			/*绑定logo上传*/
			if(ImageUpload_Token!==null){
				logo_QN_Upload.uploader({
					runtimes: 'html5,html4,flash,silverlight',
					browse_button: 'admin_urlImage_file',
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
								extensions : "jpg,png,jpeg"
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

							if(advertpos===1){
								/*左上*/
								$admin_urlImage.attr({
									'data-image':domain+'/'+name.key}).html('<img src="'+domain+'/'+name.key+"?imageView2/1/w/340/h/480"+'" alt="图像">');
							}else if(advertpos===2){
								/*右上*/
								$admin_urlImage.attr({
									'data-image':domain+'/'+name.key}).html('<img src="'+domain+'/'+name.key+"?imageView2/1/w/644/h/240"+'" alt="图像">');
							}else if(advertpos===3||advertpos===4){
								/*右中，右下*/
								$admin_urlImage.attr({
									'data-image':domain+'/'+name.key}).html('<img src="'+domain+'/'+name.key+"?imageView2/1/w/306/h/208"+'" alt="图像">');
							}else if(advertpos===0){
								/*顶部*/
								$admin_urlImage.attr({
									'data-image':domain+'/'+name.key}).html('<img src="'+domain+'/'+name.key+"?imageView2/1/w/1080/h/500"+'" alt="图像">');
							}else{
								/*默认*/
								$admin_urlImage.attr({
									'data-image':domain+'/'+name.key}).html('<img src="'+domain+'/'+name.key+"?imageView2/1/w/160/h/160"+'" alt="图像">');
							}
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
							var str="banner_"+moment().format("YYYYMMDDHHmmSSSS");
							return str;
						}
					}
				});
			}

			/*清空查询条件*/
			$admin_search_clear.on('click',function(){
				$.each([$search_name,$search_providerName,$search_status],function(){
					this.val('');
				});
			}).trigger('click');



			/*绑定选择广告位置Id*/
			$admin_moduleLocationId.on('change',function () {
				advertpos=this.value;
				if(advertpos===''){
					$admin_urlImage_file.addClass('g-d-hidei');
				}else{
					advertpos=parseInt(advertpos,10);
					$admin_urlImage_file.removeClass('g-d-hidei');
				}
			});


			/*联合查询*/
			$admin_search_btn.on('click',function(){
				var data= $.extend(true,{},goods_config.config.ajax.data);

				$.each([$search_name,$search_providerName,$search_status],function(){
					var text=this.val(),
						selector=this.selector.slice(1),
						key=selector.split('_');

					if(text===""){
						if(typeof data[key[1]]!=='undefined'){
							delete data[key[1]];
						}
					}else{
						data[key[1]]=text;
					}
				});
				goods_config.config.ajax.data= $.extend(true,{},data);
				getColumnData(goods_page,goods_config);
			});


			/*绑定选择跳转类型*/
			$admin_forwardType.on('change',function () {
				var value=parseInt(this.value,10);
				if(value===2){
					/*链接类(搜索类)*/
					$forwardUrl_wrap.removeClass('g-d-hidei');
					$forwardId_wrap.addClass('g-d-hidei');
					$admin_goodsTypeId.attr({
						'data-id':''
					}).val('');
					/*切换操作区*/
					$forwardId_goodswrap.addClass('g-d-hidei');
					$forwardId_typewrap.addClass('g-d-hidei');
					/*切换整体布局*/
					$admin_advertform.addClass('g-w-percent50');
					$admin_advertdata.addClass('g-d-hidei');
				}else{
					/*非链接类*/
					$forwardUrl_wrap.addClass('g-d-hidei');
					$forwardId_wrap.removeClass('g-d-hidei');
					$admin_forwardUrl.val('');
					/*切换操作区*/
					if(value===1){
						/*商品类（活动类）*/
						$forwardId_goodswrap.removeClass('g-d-hidei');
						$forwardId_typewrap.addClass('g-d-hidei');
					}else if(value===0){
						/*类目类（分类）*/
						$forwardId_goodswrap.addClass('g-d-hidei');
						$forwardId_typewrap.removeClass('g-d-hidei');
					}
					/*切换整体布局*/
					$admin_advertform.removeClass('g-w-percent50');
					$admin_advertdata.removeClass('g-d-hidei');
				}
			});


			/*绑定查看，修改操作*/
			$admin_list_wrap.delegate('span','click',function(e){
				e.stopPropagation();
				e.preventDefault();

				var target= e.target,
					$this,
					id,
					action,
					$tr;
				//适配对象
				if(target.className.indexOf('btn')!==-1){
					$this=$(target);
				}else{
					$this=$(target).parent();
				}
				$tr=$this.closest('tr');
				id=$this.attr('data-id');
				action=$this.attr('data-action');

				/*修改,编辑操作*/
				if(action==='checkgoods'){
					/*选择*/
					if(operate_item){
						operate_item.removeClass('item-lighten');
						operate_item=null;
					}
					operate_item=$tr.addClass('item-lighten');
					var trdata=table.row($tr).data();
					$admin_goodsTypeId.attr({
						'data-id':id
					}).val(trdata['name']).select();
				}
			});

			/*获取编辑缓存*/
			(function () {
				var edit_cache=public_tool.getParams('bzw-activity-add');
				if(edit_cache){
					$admin_action.removeClass('g-d-hidei').html('编辑');
					/*查询数据*/
					setActivityData(edit_cache);
				}else{
					if(activityadd_power){
						$admin_action.removeClass('g-d-hidei').html('添加');
					}else{
						$admin_action.addClass('g-d-hidei');
					}
				}
			}());

			/*绑定添加地址*/
			/*表单验证*/
			if($.isFunction($.fn.validate)) {
				/*配置信息*/
				var form_opt0={},
					formcache=public_tool.cache;


				if(formcache.form_opt_0){
					$.each([formcache.form_opt_0],function(index){
						var formtype,
						config={
							dataType:'JSON',
							method:'post'
						};
						if(index===0){
							formtype='activityadd';
						}
						$.extend(true,(function () {
							if(formtype==='activityadd'){
								return form_opt0;
							}
						}()),(function () {
							if(formtype==='activityadd'){
								return formcache.form_opt_0;
							}
						}()),{
							submitHandler: function(form){
								var tempimg=$admin_urlImage.attr('data-image');

								if(tempimg===''){
									$admin_urlImage_tips.html('请上传广告图片');
									setTimeout(function () {
										$admin_urlImage_tips.html('');
									},3000);
									return false;
								}

								var id=$admin_id.val(),
									setdata={};

								$.extend(true,setdata,goods_params);

								if(formtype==='activityadd'){
									var ftype=parseInt($admin_forwardType.val(),10);
									/*同步编辑器*/
									$.extend(true,setdata,{
										title:$admin_title.val(),
										moduleLocationId:advertpos,
										forwardType:ftype,
										appType:1,
										imageUrl:tempimg,
										remark:$admin_remark.val(),
										status:$admin_status.find(':checked').val()
									});

									if(ftype===0){
										setdata['goodsTypeId']=$admin_goodsTypeId.attr('data-id');
									}else if(ftype===2){
										setdata['forwardUrl']=$admin_forwardUrl.val();
									}

									if(id!==''){
										setdata['id']=id;
										config['data']=setdata;
										config['url']="http://112.74.207.132:8081/mall-buzhubms-api/placing/location/update";
									}else {
										config['data']=setdata;
										config['url']="http://112.74.207.132:8081/mall-buzhubms-api/placing/location/add";
									}
								}


								$.ajax(config).done(function(resp){
									var code,
										formkey='';
									if(formtype==='activityadd'){
										if(id!==''){
											formkey='修改';
										}else{
											formkey='添加';
										}
										code=parseInt(resp.code,10);
										if(code!==0){
											dia.content('<span class="g-c-bs-warning g-btips-warn">'+formkey+'广告失败</span>').show();
											return false;
										}else{
											dia.content('<span class="g-c-bs-success g-btips-succ">'+formkey+'广告成功</span>').show();
										}
									}

									setTimeout(function () {
										dia.close();
										location.href='bzw-advert-list.html';
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
					resetform0=$admin_addactivity_form.validate(form_opt0);
				}
			}



		}


		/*级联类型查询*/
		function getGoodsTypes(value,type,flag){
			var typemap={
				'one':'一级',
				'two':'二级',
				'three':'三级'
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
							$search_gtithree.html('<option value="" selected >请选择三级分类</option>');
						}
					}else if(type==='two'){
						$(str).appendTo($search_gtitwo.html(''));
					}else if(type==='three'){
						$(str).appendTo($search_gtithree.html(''));
					}
				}else{
					console.log(resp.message||'error');
					if(type==='one'){
						$search_gtione.html('<option value="" selected >请选择一级分类</option>');
						$search_gtitwo.html('<option value="" selected >请选择二级分类</option>');
						$search_gtithree.html('<option value="" selected >请选择三级分类</option>');
					}else if(type==='two'){
						$search_gtitwo.html('<option value="" selected >请选择二级分类</option>');
						$search_gtithree.html('<option value="" selected >请选择三级分类</option>');
					}else if(type==='three'){
						$search_gtithree.html('<option value="" selected >请选择三级分类</option>');
					}
				}
			}).fail(function(resp){
				console.log(resp.message||'error');
				if(type==='one'){
					$search_gtione.html('<option value="" selected >请选择一级分类</option>');
					$search_gtitwo.html('<option value="" selected >请选择二级分类</option>');
					$search_gtithree.html('<option value="" selected >请选择三级分类</option>');
				}else if(type==='two'){
					$search_gtitwo.html('<option value="" selected >请选择二级分类</option>');
					$search_gtithree.html('<option value="" selected >请选择三级分类</option>');
				}else if(type==='three'){
					$search_gtithree.html('<option value="" selected >请选择三级分类</option>');
				}
			});
		}



		/*修改时设置值*/
		function setActivityData(list) {
			if(!list){
				return false;
			}
			if(!$.isEmptyObject(list)){
				for(var m in list){
					switch(m){
						case 'id':
							$admin_id.val(list[m]);
							break;
						case 'title':
							$admin_title.val(list[m]);
							break;
						case 'forwardType':
							activityDataByType(parseInt(list[m],10));
							break;
						case 'status':
							var tempstatus=parseInt(list[m],10);
							$admin_status.find('input').each(function(){
								var $this=$(this),
									text=parseInt($this.val(),10);

								if(text===tempstatus){
									$this.prop({
										'checked':true
									});
									return false;
								}
							});
							break;
						case 'remark':
							$admin_remark.val(list[m]);
							break;
						case 'imageUrl':
							activityDataByPos({
								pos:list['moduleLocationId'],
								url:list[m]
							});
							break;
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

		/*获取数据*/
		function getColumnData(page,opt){
			if(table===null){
				table=opt.$admin_list_wrap.DataTable(opt.config);
			}else{
				table.ajax.config(opt.config.ajax).load();
			}
		}


		/*查询广告位置ID*/
		function searchActivityPosId() {
			var apconfig={
				url:"http://112.74.207.132:8081/mall-buzhubms-api/module/location/list",
				dataType:'JSON',
				method:'post',
				data:{
					appType:1,
					locationType:1
				}
			};

			$.extend(true,apconfig['data'],goods_params);


			$.ajax(apconfig)
				.done(function(resp){
					var code=parseInt(resp.code,10);
					if(code!==0){
						console.log(resp.message);
						if(code===999){
							public_tool.loginTips(function () {
								public_tool.clear();
								public_tool.clearCacheData();
							});
						}
						return false;
					}
					/*是否是正确的返回数据*/
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
								str+='<option value="" selected >请选择广告位置ID</option><option value="'+item["id"]+'" >'+item["title"]+'</option>';
							}else{
								str+='<option value="'+item["id"]+'" >'+item["title"]+'</option>';
							}
						}
						$(str).appendTo($admin_moduleLocationId.html(''));
					}else{
						console.log(resp.message||'error');
						$admin_moduleLocationId.html('<option value="" selected >请选择广告位置ID</option>');
					}
				})
				.fail(function(resp){
					console.log(resp.message);
				});

		}
		
		
		/*根据状态初始化编辑界面*/
		function activityDataByType(type) {
			if(!type){
				return false;
			}

			/*设置值*/
			$admin_forwardType.find('option').each(function () {
				var $this=$(this),
					value=parseInt($this.val(),10);

				if(value===type){
					$this.prop({
						'selected':true
					});
					return false;
				}
			});

			if(type===2){
				/*链接类*/
				$forwardId_wrap.addClass('g-d-hidei');
				$forwardUrl_wrap.removeClass('g-d-hidei');

				$admin_advertform.addClass('g-w-percent50');
				$admin_advertdata.addClass('g-d-hidei');

				$admin_goodsTypeId.attr({
					'data-id':''
				}).val('');
			}else{
				/*非链接类*/
				$forwardId_wrap.removeClass('g-d-hidei');
				$forwardUrl_wrap.addClass('g-d-hidei');

				$admin_advertform.removeClass('g-w-percent50');
				$admin_advertdata.removeClass('g-d-hidei');

				$admin_forwardUrl.val('');

				if(type===1){
					/*商品类*/
					$forwardId_goodswrap.removeClass('g-d-hidei');
					$forwardId_typewrap.addClass('g-d-hidei');
				}else if(type===0){
					/*类目类*/
					$forwardId_goodswrap.addClass('g-d-hidei');
					$forwardId_typewrap.removeClass('g-d-hidei');
				}
			}
			
		}

		/*根据位置初始化编辑界面*/
		function activityDataByPos(config) {
			if(!config){
				return false;
			}

			var pos=config.pos,
				url=config.url;

			/*设置值*/
			if(typeof pos!=='undefined'&&pos!==''){
				$admin_moduleLocationId.find('option').each(function () {
					var $this=$(this),
						value=parseInt($this.val(),10);

					if(value===pos){
						$this.prop({
							'selected':true
						});
						advertpos=pos;
						if(advertpos===''){
							$admin_urlImage_file.addClass('g-d-hidei');
						}else{
							advertpos=parseInt(advertpos,10);
							$admin_urlImage_file.removeClass('g-d-hidei');
						}
						return false;
					}
				});
			}


			if(pos===1){
				/*左上*/
				$admin_urlImage.attr({
					'data-image':url}).html('<img src="'+url+"?imageView2/1/w/340/h/480"+'" alt="图像">');
			}else if(pos===2){
				/*右上*/
				$admin_urlImage.attr({
					'data-image':url}).html('<img src="'+url+"?imageView2/1/w/644/h/240"+'" alt="图像">');
			}else if(pos===3||pos===4){
				/*右中，右下*/
				$admin_urlImage.attr({
					'data-image':url}).html('<img src="'+url+"?imageView2/1/w/306/h/208"+'" alt="图像">');
			}else if(pos===0){
				/*顶部*/
				$admin_urlImage.attr({
					'data-image':url}).html('<img src="'+url+"?imageView2/1/w/1080/h/500"+'" alt="图像">');
			}else{
				/*默认*/
				$admin_urlImage.attr({
					'data-image':url}).html('<img src="'+url+"?imageView2/1/w/160/h/160"+'" alt="图像">');
			}
		}



	});



})(jQuery);