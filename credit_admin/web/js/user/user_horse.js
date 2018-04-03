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
				horseupdate_power=public_tool.getKeyPower('马甲用户修改',powermap),
				horsedelete_power=public_tool.getKeyPower('马甲用户删除',powermap),
				horseadd_power=public_tool.getKeyPower('马甲用户添加',powermap);


			/*dom引用和相关变量定义*/
			var $user_account_wrap=$('#user_account_wrap')/*表格*/,
				module_id='user_account'/*模块id，主要用于本地存储传值*/,
				$data_wrap=$('#data_wrap')/*数据展现面板*/,
				$edit_wrap=$('#edit_wrap')/*编辑容器面板*/,
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


			var QN=new QiniuJsSDK()/*七牛对象*/,
				img_token=getToken()/*获取token*/;



			/*查询对象*/
			var $search_nickName=$('#search_nickName'),
				$search_phone=$('#search_phone'),
				$search_startTime=$('#search_startTime'),
				$admin_search_btn=$('#admin_search_btn'),
				$admin_search_clear=$('#admin_search_clear');



			/*表单对象*/
			var edit_form=document.getElementById('user_edit_form')/*表单dom*/,
				$user_edit_form=$(edit_form)/*编辑表单*/,
				$user_id=$('#user_id'),/*成员id*/
				$user_add_btn=$('#user_add_btn')/*添加马甲用户*/,
				$edit_cance_btn=$('#edit_cance_btn')/*编辑取消按钮*/,
				$user_nickname=$('#user_nickname'),/*用户名*/
				$user_remark=$('#user_remark')/*描述*/,
				$user_password=$('#user_password')/*机器码*/,
				$user_icon=$('#user_icon')/*所属代理名称*/,
				$user_armouradminid=$('#user_armouradminid')/*管理人*/,
				$toggle_display_btn=$('#toggle_display_btn')/*密码显示隐藏按钮*/;



			/*图片上传对象*/
			var $toggle_edit_btn=$('#toggle_edit_btn'),
				$img_url_upload=$('#img_url_upload')/*缩略图文件上传按钮*/;



			/*列表请求配置*/
			var article_page={
					page:1,
					pageSize:10,
					total:0
				},
				article_config={
					$user_account_wrap:$user_account_wrap,
					$admin_page_wrap:$admin_page_wrap,
					config:{
						processing:true,/*大消耗操作时是否显示处理状态*/
						deferRender:true,/*是否延迟加载数据*/
						autoWidth:true,/*是否*/
						paging:false,
						ajax:{
							url:"http://10.0.5.226:8016/yttx-adminbms-api/armourUser/list",
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
								adminId:decodeURIComponent(logininfo.param.adminId),
								token:decodeURIComponent(logininfo.param.token),
								page:1,
								pageSize:10
							}
						},
						info:false,
						searching:true,
						ordering:true,
						columns: [
							{"data":"nickName"},
							{"data":"phone"},
							{
								"data":"adminName"
							},
							{
								"data":"createTime"
							},
							{
								"data":"lastLoginTime"
							},
							{
								"data":"id",
								"render":function(data, type, full, meta ){
									var id=parseInt(data,10),
										btns='';

									/*修改*/
									if(horseupdate_power){
										btns+='<span data-action="update" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-pencil"></i>\
											<span>修改</span>\
											</span>';
									}

									/*删除*/
									if(horsedelete_power){
										btns+='<span data-action="delete" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
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
			$.each([$search_startTime],function(){
				var selector=this.selector;

				this.val('').datepicker({
					autoclose:true,
					clearBtn:true,
					format: 'yyyy-mm-dd',
					todayBtn: true,
					endDate:moment().format('YYYY-MM-DD')
				})
			});



			/*格式化手机号码*/
			$.each([$search_phone],function(){
				this.on('keyup',function(){
					var phoneno=this.value.replace(/\D*/g,'');
					if(phoneno==''){
						this.value='';
						return false;
					}
					this.value=public_tool.phoneFormat(this.value);
				});
			});



			/*清空查询条件*/
			$admin_search_clear.on('click',function(){
				$.each([$search_nickName,$search_phone,$search_startTime],function(){
					this.val('');
				});
			})


			/*联合查询*/
			$admin_search_btn.on('click',function(){
				var data= $.extend(true,{},article_config.config.ajax.data);

				$.each([$search_nickName,$search_phone,$search_startTime],function(){
					var text=this.val(),
						selector=this.selector.slice(1),
						key=selector.split('_');


					if(text===""){
						if(typeof data[key[1]]!=='undefined'){
							delete data[key[1]];
						}
					}else{
						if(key[1].indexOf('phone')!==-1){
							text=text.replace(/\s*/g,'');
						}
						data[key[1]]=text;
					}

				});
				article_config.config.ajax.data= $.extend(true,{},data);
				getColumnData(article_page,article_config);
			});


			/*事件绑定*/
			/*绑定查看，修改操作*/
			$user_account_wrap.delegate('span','click',function(e){
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
					$edit_title.html('修改马甲用户');

					return false;

					var datas=table.row($tr).data();
					for(var i in datas) {
						switch (i) {
							case "id":
								$user_id.val(datas[i]);
								break;
							case "nickName":
								$user_nickname.val(datas[i]);
								break;
							case "remark":
								$user_remark.val(datas[i]);
								break;
							case "password":
								$user_password.val(datas[i]);
								break;
							case "icon":
								$user_icon.val(datas[i]);
								break;
							case "armourAdminId":
								$user_armouradminid.val(datas[i]);
								break;
						}
					}
				}else if(action==='delete'){
					/*删除操作*/
					//没有回调则设置回调对象
					dialogObj.setFn(function(){
						var self=this;

						$.ajax({
								url:"http://10.0.5.226:8016/yttx-adminbms-api/armourUser/delete",
								method: 'POST',
								dataType: 'json',
								data:{
									"id":id,
									"adminId":decodeURIComponent(logininfo.param.adminId),
									"token":decodeURIComponent(logininfo.param.token)
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
					},'user_delete');
					//确认删除
					dialogObj.dialog.content('<span class="g-c-bs-warning g-btips-warn">是否删除此数据？</span>').showModal();
				}



			});


			/*添加马甲用户*/
			$user_add_btn.on('click',function(e){
				e.preventDefault();
				//重置表单
				edit_form.reset();
				$edit_title.html('添加马甲用户');

				/*调整布局*/
				$data_wrap.addClass('collapsed');
				$edit_wrap.removeClass('collapsed');
				$("html,body").animate({scrollTop:300},200);
				//第一行获取焦点
				$user_nickname.focus();
			});
			if(horseadd_power){
				$user_add_btn.removeClass('g-d-hidei');
				$edit_wrap.removeClass('g-d-hidei');
			};


			/*密码可见与不可见切换，缩略图切换编辑状态*/
			$.each([$toggle_display_btn,$toggle_edit_btn],function(){
				var selector=this.selector;


				selector=selector.split('_')[1];
				this.on('click',function(){
					var $this=$(this),
						isactive=$this.hasClass('toggle-'+selector+'-btnactive');
					if(isactive){
						$this.removeClass('toggle-'+selector+'-btnactive');
						if(selector==='display'){
							$user_password.attr({
								'type':'password'
							});
						}else if(selector==='edit'){
							$user_icon.prop({
								'readonly':true
							});
						}

					}else{
						$this.addClass('toggle-'+selector+'-btnactive');
						if(selector==='display'){
							$user_password.attr({
								'type':'text'
							});
						}else if(selector==='edit'){
							$user_icon.prop({
								'readonly':false
							});
						}
					}
				});
			});


			/*缩略图文件上传初始化*/
			if(img_token!==null){

				var icon_upload = QN.uploader({
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
					chunk_size: '500kb',
					auto_start:false,
					filters:{
						max_file_size : '500kb',
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
							$user_icon.val(domain+'/'+name.key+"?imageView2/1/w/80/h/80");
						},
						'Error': function(up, err, errTip) {
							var opt=up.settings,
								file=err.file,
								setsize=parseInt(opt.filters.max_file_size,10),
								realsize=parseInt(file.size / 1024,10);

							if(realsize>setsize){
								dia.content('<span class="g-c-bs-warning g-btips-warn">您选择的文件太大(<span class="g-c-red1"> '+realsize+'kb</span>),不能超过(<span class="g-c-red1"> '+setsize+'kb</span>)</span>').show();
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
					icon_upload.start();
				});
			}




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



			/*表单验证*/
			if($.isFunction($.fn.validate)) {
				/*配置信息*/
				var form_opt={};
				if(public_tool.cache.form_opt_0){
					$.extend(true,form_opt,public_tool.cache.form_opt_0,{
						submitHandler: function(form){
							//判断是否存在id号
							var id=$user_id.val();


							if(id!==''){
								dia.content('<span class="g-c-bs-warning g-btips-warn">目前暂未开放此功能</span>').show();
								setTimeout(function(){
									dia.close();
								},2000);
								return false;


								//此处配置修改稿角色地址（开发阶段）
								var config={
									url:"http://10.0.5.226:8016/yttx-adminbms-api/armourUser/update",
									dataType:'JSON',
									method:'post',
									data:{
										id:id,
										adminId:decodeURIComponent(logininfo.param.adminId),
										token:decodeURIComponent(logininfo.param.token),
										nickName:$user_nickname.val(),
										icon:$user_icon.val(),
										password:$user_password.val(),
										remark:$user_remark.val(),
										serviceStationName:$user_armouradminid.val()
									}
								};
							}else{
								//此处配置添加角色地址（开发阶段）
								var config={
									url:"http://10.0.5.226:8016/yttx-adminbms-api/armourUser/add",
									dataType:'JSON',
									method:'post',
									data:{
										adminId:decodeURIComponent(logininfo.param.adminId),
										token:decodeURIComponent(logininfo.param.token),
										nickName:$user_nickname.val(),
										icon:$user_icon.val(),
										password:$user_password.val(),
										remark:$user_remark.val(),
										serviceStationName:$user_armouradminid.val()
									}
								};
							}

							$.ajax(config)
								.done(function(resp){
									var code=parseInt(resp.code,10);
									if(code!==0){
										console.log(resp.message);
										setTimeout(function(){
											id!==''?dia.content('<span class="g-c-bs-warning g-btips-warn">修改用户信息失败</span>').show():dia.content('<span class="g-c-bs-warning g-btips-warn">添加用户信息失败</span>').show();
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
										id!==''?dia.content('<span class="g-c-bs-success g-btips-succ">修改用户信息成功</span>').show():dia.content('<span class="g-c-bs-success g-btips-succ">添加用户信息成功</span>').show();
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
				$user_edit_form.validate(form_opt);
			}



		}


		/*获取数据*/
		function getColumnData(page,opt){
			if(table===null){
				table=opt.$user_account_wrap.DataTable(opt.config);
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