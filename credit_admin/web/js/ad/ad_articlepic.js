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
				url:'http://10.0.5.226:8016/yttx-adminbms-api/module/menu',
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
				updown_power=public_tool.getKeyPower('文章图片广告上架/下架',powermap),
				update_power=public_tool.getKeyPower('文章图片广告修改',powermap);


			/*dom引用和相关变量定义*/
			var $ad_article_wrap=$('#ad_article_wrap')/*表格*/,
				module_id='ad_article'/*模块id，主要用于本地存储传值*/,
				$data_wrap=$('#data_wrap')/*数据展现面板*/,
				$edit_wrap=$('#edit_wrap')/*编辑容器面板*/,
				$article_add_btn=$('#article_add_btn'),/*添加角色*/
				$edit_title=$('#edit_title')/*编辑标题*/,
				dia=dialog({
					title:'温馨提示',
					okValue:'确定',
					width:300,
					ok:function(){
						this.close();
						return false;
					},
					cancel:false
				})/*一般提示对象*/,
				dialogObj=public_tool.dialog()/*回调提示对象*/,
				$admin_page_wrap=$('#admin_page_wrap')/*分页数据*/;



			/*查询对象*/
			var $search_title=$('#search_title'),
				$search_time=$('#search_time'),
				$search_status=$('#search_status'),
				$admin_search_btn=$('#admin_search_btn'),
				$admin_search_clear=$('#admin_search_clear');



			/*表单对象*/
			var edit_form=document.getElementById('article_edit_form')/*表单dom*/,
				$article_edit_form=$(edit_form)/*编辑表单*/,
				$article_id=$('#article_id'),/*成员id*/
				$edit_cance_btn=$('#edit_cance_btn')/*编辑取消按钮*/,
				$article_title=$('#article_title'),/*标题*/
				$article_url=$('#article_url')/*链接*/,
				$article_time=$('#article_time')/*时间*/,
				$article_imageurl=$('#article_imageurl')/*图片链接地址*/,
				$article_remark=$('#article_remark')/*备注*/,
				$article_belongscompany=$('#article_belongscompany')/*所属公司*/;


			/*图片地址上传对象*/
			var $toggle_edit_btn=$('#toggle_edit_btn')/*图片地址文件浏览*/,
				$img_url_upload=$('#img_url_upload')/*图片地址文件上传按钮*/;




			/*时间对象*/
			var QN=new QiniuJsSDK()/*七牛对象*/,
				img_token=getToken()/*获取token*/,
				now=moment().format('YYYY-MM-DD'),
				start_format='',
				end_format='';


			/*列表请求配置*/
			var article_page={
					page:1,
					pageSize:10,
					total:0
				},
				article_config={
					$ad_article_wrap:$ad_article_wrap,
					$admin_page_wrap:$admin_page_wrap,
					config:{
						processing:true,/*大消耗操作时是否显示处理状态*/
						deferRender:true,/*是否延迟加载数据*/
						autoWidth:true,/*是否*/
						paging:false,
						ajax:{
							url:"http://10.0.5.226:8016/yttx-adminbms-api/advertisement/list",
							dataType:'JSON',
							method:'post',
							dataSrc:function ( json ) {
								var code=parseInt(json.code,10);
								if(code!==0){
									if(code===999){
										/*清空缓存*/
										public_tool.clear();
										public_tool.loginTips();
									}
									console.log(json.message);
									return null;
								}
								var result=json.result;
								/*设置分页*/
								article_page.page=result.page;
								article_page.pageSize=result.pageSize;
								article_page.total=result.count;
								/*分页调用*/
								$admin_page_wrap.pagination({
									pageSize:article_page.pageSize,
									total:article_page.total,
									pageNumber:article_page.page,
									onSelectPage:function(pageNumber,pageSize){
										/*再次查询*/
										var param=article_config.config.ajax.data;
										param.page=pageNumber;
										param.pageSize=pageSize;
										article_config.config.ajax.data=param;
										getColumnData(article_page,article_config);
									}
								});
								return result.list;
							},
							data:{
								roleId:decodeURIComponent(logininfo.param.roleId),
								adminId:decodeURIComponent(logininfo.param.adminId),
								token:decodeURIComponent(logininfo.param.token),
								type:2,
								page:1,
								pageSize:10
							}
						},
						info:false,
						searching:true,
						ordering:true,
						columns: [
							{"data":"title"},
							{"data":"url"},
							{"data":"imageUrl"},
							{
								"data":"startTime"
							},
							{
								"data":"endTime"
							},
							{
								"data":"belongsCompany"
							},
							{
								"data":"remark"
							},
							{
								"data":"id",
								"render":function(data, type, full, meta ){
									var id=parseInt(data,10),
										btns='';

									/*上架,下架*/
									if(updown_power){
										var status=parseInt(full.status,10);
										if(status===0){
											//上架
											btns+='<span data-action="up" data-id="'+id+'" data-isstate="true"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray12">\
											<i class="fa-arrow-up"></i>\
											<span>上架</span>\
											</span>\
											<span data-action="down" data-id="'+id+'" data-isstate="false"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-arrow-down"></i>\
											<span>下架</span>\
											</span>';
										}else if(status===1){
											//下架
											btns+='<span data-action="up" data-id="'+id+'" data-isstate="false"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-arrow-up"></i>\
											<span>上架</span>\
											</span>\
											<span data-action="down" data-id="'+id+'"  data-isstate="true"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray12">\
											<i class="fa-arrow-down"></i>\
											<span>下架</span>\
											</span>';
										}
									}

									/*修改*/
									if(update_power){
										btns+='<span data-action="update" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-pencil"></i>\
											<span>修改</span>\
											</span>\
											<span data-action="delete" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-trash"></i>\
											<span>删除</span>\
											</span>';
									}
									return btns;
								}
							}
						]
					}
				};
			

			/*初始化请求*/
			getColumnData(article_page,article_config);



			/*
			* 初始化
			* */
			(function(){
				/*重置表单*/
				edit_form.reset();
			}());


			/*日历调用*/
			$.each([$article_time,$search_time],function(){
				var selector=this.selector;

					this.val('').daterangepicker({
						format: 'YYYY-MM-DD',
						todayBtn: true,
						endDate:end_format,
						startDate:start_format,
						separator:','
					})
			});


			/*清空查询条件*/
			$admin_search_clear.on('click',function(){
				$.each([$search_title,$search_time,$search_status],function(){
					this.val('');
				});
			})


			/*联合查询*/
			$admin_search_btn.on('click',function(){
				var data= $.extend(true,{},article_config.config.ajax.data);

				$.each([$search_title,$search_time,$search_status],function(){
					var text=this.val(),
						selector=this.selector.slice(1),
						istime=selector.indexOf('time')!==-1?true:false,
						key=selector.split('_');


					if(text===""){
						if(istime){
							if(typeof data['startTime']!=='undefined'){
								delete data['startTime'];
							}
							if(typeof data['endTime']!=='undefined'){
								delete data['endTime'];
							}

						}else{
							if(typeof data[key[1]]!=='undefined'){
								delete data[key[1]];
							}
						}
					}else{
						if(istime){
							var temptime=text.split(',');
							data['startTime']=temptime[0];
							data['endTime']=temptime[1];
						}else{
							data[key[1]]=text;
						}
					}

				});
				article_config.config.ajax.data= $.extend(true,{},data);
				getColumnData(article_page,article_config);
			});


			/*事件绑定*/
			/*绑定查看，修改操作*/
			$ad_article_wrap.delegate('span','click',function(e){
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

				/*修改操作*/
				if(action==='update'){
					/*调整布局*/
					$data_wrap.addClass('collapsed');
					$edit_wrap.removeClass('collapsed');
					$("html,body").animate({scrollTop:300},200);
					//重置信息
					$edit_title.html('修改文章广告图片');

					var datas=table.row($tr).data();
					for(var i in datas) {
						switch (i) {
							case "id":
								$article_id.val(datas[i]);
								break;
							case "title":
								$article_title.val(datas[i]);
								break;
							case "url":
								$article_url.val(datas[i]);
								break;
							case "startTime":
								start_format=datas[i];
								break;
							case "endTime":
								end_format=datas[i];
								break;
							case "imageUrl":
								$article_imageurl.val(datas[i]);
								break;
							case "remark":
								$article_remark.val(datas[i]);
								break;
							case "belongsCompany":
								$article_belongscompany.val(datas[i]);
								break;
						}
					}
					/*设置时间和日历控件*/
					$article_time.val(start_format+','+end_format).daterangepicker({
						format: 'YYYY-MM-DD',
						todayBtn: true,
						endDate:end_format,
						startDate:start_format,
						separator:','
					});
				}else if(action==='delete'){
					/*删除操作*/
					//没有回调则设置回调对象
					dialogObj.setFn(function(){
						var self=this;

						$.ajax({
								url:"http://10.0.5.226:8016/yttx-adminbms-api/advertisement/operate",
								method: 'POST',
								dataType: 'json',
								data:{
									"advertisementId":id,
									"adminId":decodeURIComponent(logininfo.param.adminId),
									"token":decodeURIComponent(logininfo.param.token),
									"operate":3
								}
							})
							.done(function (resp) {
								var code=parseInt(resp.code,10);
								if(code!==0){
									dia.content('<span class="g-c-bs-warning g-btips-warn">删除失败</span>').show();
									setTimeout(function () {
										dia.close();
									},2000);
									console.log(resp.message);
									return false;
								}
								getColumnData(article_page,article_config);
								//table.row($tr).remove().draw(false);
								setTimeout(function(){
									self.content('<span class="g-c-bs-success g-btips-succ">删除数据成功</span>');
								},100);
							})
							.fail(function(resp){
								console.log(resp.message);
							});
					},'article_delete');
					//确认删除
					dialogObj.dialog.content('<span class="g-c-bs-warning g-btips-warn">是否删除此数据？</span>').showModal();
				}else if(action==='up'||action==='down'){
					/*判断是否可以上下架*/
					var isstate=$this.attr('data-isstate');

					if(action==='up'){
						if(isstate==='true'){
							dia.content('<span class="g-c-bs-warning g-btips-warn">目前是已经是\"上架状态\",请选择\"下架状态\"</span>').show();
							return false;
						}
						var state=1;
						/*更改状态*/
						$this.attr({
							"data-isstate":true
						}).removeClass('g-c-gray8').addClass("g-c-gray12").next().attr({
							"data-isstate":false
						}).removeClass('g-c-gray12').addClass("g-c-gray8");
					}else if(action==='down'){
						if(isstate==='true'){
							dia.content('<span class="g-c-bs-warning g-btips-warn">目前是已经是\"下架状态\",请选择\"上架状态\"</span>').show();
							return false;
						}
						var state=2;
						/*更改状态*/
						$this.attr({
							"data-isstate":true
						}).removeClass('g-c-gray8').addClass("g-c-gray12").prev().attr({
							"data-isstate":false
						}).removeClass('g-c-gray12').addClass("g-c-gray8");
					}

					/*上架和下架*/
					$.ajax({
							url:"http://10.0.5.226:8016/yttx-adminbms-api/advertisement/operate",
							method: 'POST',
							dataType: 'json',
							data:{
								"advertisementId":id,
								"adminId":decodeURIComponent(logininfo.param.adminId),
								"token":decodeURIComponent(logininfo.param.token),
								"operate":state
							}
						})
						.done(function(resp){
							var code=parseInt(resp.code,10);
							if(code!==0){
								/*回滚状态*/
								if(action==='up'){
									/*更改状态*/
									$this.attr({
										"data-isstate":false
									}).removeClass('g-c-gray12').addClass("g-c-gray8").next().attr({
										"data-isstate":false
									}).removeClass('g-c-gray8').addClass("g-c-gray12");
								}else if(action==='down'){
									/*更改状态*/
									$this.attr({
										"data-isstate":false
									}).removeClass('g-c-gray12').addClass("g-c-gray8").prev().attr({
										"data-isstate":false
									}).removeClass('g-c-gray8').addClass("g-c-gray12");
								}
								console.log(resp.message);
								return false;
							}

						})
						.fail(function(resp){
							console.log(resp.message);
						});
				}



			});


			/*取消修改*/
			$edit_cance_btn.on('click',function(e){
				//切换显示隐藏表格和编辑区
				/*调整布局*/
				$data_wrap.removeClass('collapsed');
				$edit_wrap.addClass('collapsed');
				if(!$data_wrap.hasClass('collapsed')){
					$("html,body").animate({scrollTop:200},200);
				}
			});


			/*最小化窗口*/
			$edit_title.next().on('click',function(e){
				if($data_wrap.hasClass('collapsed')){
					e.stopPropagation();
					e.preventDefault();
					$edit_cance_btn.trigger('click');
				}
			});


			/*添加文章广告*/
			$article_add_btn.on('click',function(e){
				e.preventDefault();
				//重置表单
				edit_form.reset();
				$edit_title.html('添加文章广告图片');
				/*调整布局*/
				$data_wrap.addClass('collapsed');
				$edit_wrap.removeClass('collapsed');
				$("html,body").animate({scrollTop:300},200);
				//第一行获取焦点
				$article_title.focus();
			});
			if(update_power){
				$article_add_btn.removeClass('g-d-hidei');
				$edit_wrap.removeClass('g-d-hidei');
			}





			/*图片地址切换编辑状态*/
			$toggle_edit_btn.on('click',function(){
				var $this=$(this),
					isactive=$this.hasClass('toggle-edit-btnactive');
				if(isactive){
					$this.removeClass('toggle-edit-btnactive');
					$article_imageurl.prop({
						'readonly':true
					});
				}else{
					$this.addClass('toggle-edit-btnactive');
					$article_imageurl.prop({
						'readonly':false
					});
				}

			});
			/*图片地址文件上传初始化*/
			if(img_token!==null){

				var thumbnail_upload = QN.uploader({
							runtimes: 'html5,flash,html4',
							browse_button: 'img_url_file',
							uptoken :img_token.qiniuToken,// uptoken是上传凭证，由其他程序生成
							multi_selection:false,
							get_new_uptoken: false,// 设置上传文件的时候是否每次都重新获取新的uptoken
							unique_names:false,// 默认false，key为文件名。若开启该选项，JS-SDK会为每个文件自动生成key（文件名）
							save_key:false,//默认false。若在服务端生成uptoken的上传策略中指定了sava_key，则开启，SDK在前端将不对key进行任何处理
							domain:img_token.qiniuDomain,//bucket域名，下载资源时用到，必需
							container:'img_url_wrap',// 上传区域DOM ID，默认是browser_button的父元素
							flash_swf_url: '../../js/plugins/plupload/Moxie.swf',//引入flash，相对路径
							max_retries: 3,// 上传失败最大重试次数
							dragdrop:false,
							chunk_size: '4m',
							auto_start:false,
							filters:{
								max_file_size : '4m',
								mime_types: [
									{
										title : "Image files", extensions : "jpg,gif,png,jpeg"
									}
								]
							},
							init: {
								'FilesAdded': function(up, files) {},
								'BeforeUpload': function(up, file) {},
								'UploadProgress': function(up, file) {},
								'FileUploaded': function(up, file, info) {
									/*获取上传成功后的文件的Url*/
									var domain=up.getOption('domain'),
										name=JSON.parse(info);
									$article_imageurl.val(domain+'/'+name.key);
								},
								'Error': function(up, err, errTip) {
										var opt=up.settings,
											file=err.file,
											setsize=parseInt(opt.filters.max_file_size,10),
											realsize=parseInt((file.size / 1024) / 1024,10);

									if(realsize>setsize){
										dia.content('<span class="g-c-bs-warning g-btips-warn">您选择的文件太大(<span class="g-c-red1"> '+realsize+'m</span>),不能超过(<span class="g-c-red1"> '+setsize+'m</span>)</span>').show();
										setTimeout(function(){
											dia.close();
										},3000);
									}
									console.log(errTip);
								},
								'UploadComplete': function() {
									dia.content('<span class="g-c-bs-success g-btips-succ">上传成功</span>').show()
									setTimeout(function(){
										dia.close();
									},2000);
								},
								'Key': function(up, file) {
									var str=moment().format("YYYYMMDDHHmmSSSS");
									 return "admin"+decodeURIComponent(logininfo.param.adminId)+"_"+str;
								}
							}
				});

				$img_url_upload.on('click',function(){
					/*执行上传*/
					thumbnail_upload.start();
				});
			}





			/*表单验证*/
			if($.isFunction($.fn.validate)) {
				/*配置信息*/
				var form_opt={};
				if(public_tool.cache.form_opt_0){
					$.extend(true,form_opt,public_tool.cache.form_opt_0,{
						submitHandler: function(form){
							//判断是否存在id号
							var id=$article_id.val(),
								times=$article_time.val().split(',');


							if(id!==''){
								//此处配置修改稿角色地址（开发阶段）
								var config={
									url:"http://10.0.5.226:8016/yttx-adminbms-api/advertisement/update",
									dataType:'JSON',
									method:'post',
									data:{
										advertisementId:id,
										adminId:decodeURIComponent(logininfo.param.adminId),
										token:decodeURIComponent(logininfo.param.token),
										title:$article_title.val(),
										url:$article_url.val(),
										type:2,
										startTime:times[0],
										endTime:times[1],
										remark:$article_remark.val(),
										imageUrl:$article_imageurl.val(),
										belongsCompany:$article_belongscompany.val()
									}
								};
							}else{
								//此处配置添加角色地址（开发阶段）
								var config={
									url:"http://10.0.5.226:8016/yttx-adminbms-api/advertisement/add",
									dataType:'JSON',
									method:'post',
									data:{
										adminId:decodeURIComponent(logininfo.param.adminId),
										token:decodeURIComponent(logininfo.param.token),
										title:$article_title.val(),
										url:$article_url.val(),
										type:2,
										startTime:times[0],
										endTime:times[1],
										remark:$article_remark.val(),
										imageUrl:$article_imageurl.val(),
										belongsCompany:$article_belongscompany.val()
									}
								};
							}

							$.ajax(config)
								.done(function(resp){
									var code=parseInt(resp.code,10);
									if(code!==0){
										console.log(resp.message);
										setTimeout(function(){
											id!==''?dia.content('<span class="g-c-bs-warning g-btips-warn">修改文章广告图片失败</span>').show():dia.content('<span class="g-c-bs-warning g-btips-warn">添加文章广告图片失败</span>').show();
										},300);
										setTimeout(function () {
											dia.close();
										},2000);
										return false;
									}
									//重绘表格
									getColumnData(article_page,article_config);
									//重置表单
									$edit_cance_btn.trigger('click');
									setTimeout(function(){
										id!==''?dia.content('<span class="g-c-bs-success g-btips-succ">修改文章广告图片成功</span>').show():dia.content('<span class="g-c-bs-success g-btips-succ">添加文章广告图片成功</span>').show();
									},300);
									setTimeout(function () {
										dia.close();
									},2000);
								})
								.fail(function(resp){
									console.log(resp.message);
								});
							return false;
						}
					});
				}
				/*提交验证*/
				$article_edit_form.validate(form_opt);
			}



		}


		/*获取数据*/
		function getColumnData(page,opt){
			if(table===null){
				table=opt.$ad_article_wrap.DataTable(opt.config);
			}else{
				table.ajax.config(opt.config.ajax).load();
			}
		};
		/*获取七牛token*/
		function getToken(){
			var result=null;
			$.ajax({
				url:'http://10.0.5.226:8016/yttx-adminbms-api/commom/getQiniuToken',
				async:false,
				type:'post',
				datatype:'json',
				data:{
					bizType:"2",
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





	});


})(jQuery);