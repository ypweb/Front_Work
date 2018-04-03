(function($,KE){
	'use strict';
	$(function(){

		var table=null;

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
			var powermap=public_tool.getPower(240),
				buyeredit_power=public_tool.getKeyPower('bzw-buyer-commentedit',powermap),
				buyerdelete_power=public_tool.getKeyPower('bzw-buyer-commentdelete',powermap),
				buyersearch_power=public_tool.getKeyPower('bzw-buyer-commentquery',powermap);



			/*dom引用和相关变量定义*/
			var $admin_listbuy_wrap=$('#admin_listbuy_wrap'),
				module_id='bzw-comment-buyer'/*模块id，主要用于本地存储传值*/,
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
				admin_editcomment_form=document.getElementById('admin_editcomment_form'),
				$admin_editcomment_form=$(admin_editcomment_form),
				$admin_id=$('#admin_id'),
				$admin_commentFrom=$('#admin_commentFrom'),
				$admin_commentTo=$('#admin_commentTo'),
				$admin_commentTime=$('#admin_commentTime'),
				$admin_content=$('#admin_content'),
				$admin_pagebuy_wrap=$('#admin_pagebuy_wrap'),
				$show_editcomment_wrap=$('#show_editcomment_wrap')/*详情容器*/,
				$admin_search_theme=$('#admin_search_theme'),
				resetform0=null,
				sureObj=public_tool.sureDialog(dia)/*回调提示对象*/,
				setSure=new sureObj();


			/*查询对象*/
			var $admin_search_wrap=$('#admin_search_wrap'),
				$search_customerName=$('#search_customerName'),
				$search_providerName=$('#search_providerName'),
				$admin_search_btn=$('#admin_search_btn'),
				$admin_search_clear=$('#admin_search_clear');


			/*初始化查询*/
			if(buyersearch_power){
				$admin_search_wrap.removeClass('g-d-hidei');
			}




			/*列表请求配置*/
			var tradebuy_page={
					page:1,
					pageSize:10,
					total:0
				},
				tradebuy_config={
					$admin_listbuy_wrap:$admin_listbuy_wrap,
					$admin_pagebuy_wrap:$admin_pagebuy_wrap,
					config:{
						processing:true,/*大消耗操作时是否显示处理状态*/
						deferRender:true,/*是否延迟加载数据*/
						autoWidth:true,/*是否*/
						paging:false,
						ajax:{
							url:"http://112.74.207.132:8081/mall-buzhubms-api/goodscomment/customer/list",
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
								tradebuy_page.page=result.page;
								tradebuy_page.pageSize=result.pageSize;
								tradebuy_page.total=result.count;
								/*分页调用*/
								$admin_pagebuy_wrap.pagination({
									pageSize:tradebuy_page.pageSize,
									total:tradebuy_page.total,
									pageNumber:tradebuy_page.page,
									onSelectPage:function(pageNumber,pageSize){
										/*再次查询*/
										var param=tradebuy_config.config.ajax.data;
										param.page=pageNumber;
										param.pageSize=pageSize;
										tradebuy_config.config.ajax.data=param;
										getBuyColumnData(tradebuy_page,tradebuy_config);
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
						searching:true,
						order:[[3, "desc" ]],
						columns: [
							{
								"data":"customerName"
							},
							{
								"data":"providerName"
							},
							{
								"data":"content"
							},
							{
								"data":"addTime"
							},
							{
								"data":"id",
								"render":function(data, type, full, meta ){
									var id=parseInt(data,10),
										btns='';

									if(buyeredit_power){
										btns+='<span data-action="edit" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
										<i class="fa-pencil"></i>\
										<span>修改</span>\
										</span>';
									}
									return btns;
								}
							}
						]
					}
				};



			/*查询买家*/
			getBuyColumnData(tradebuy_page,tradebuy_config);


			/*编辑器调用并重置表单*/
			var editor=KE.create("#admin_content",{
				minHeight:'400px',
				height:'400px',
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
			editor.sync();
			admin_editcomment_form.reset();
			


			/*清空查询条件*/
			$admin_search_clear.on('click',function(){
				$.each([$search_customerName,$search_providerName],function(){
					this.val('');
				});
			}).trigger('click');


			/*联合查询*/
			$admin_search_btn.on('click',function(){
				var data= $.extend(true,{},tradebuy_config.config.ajax.data);

				$.each([$search_customerName,$search_providerName],function(){
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

				tradebuy_config.config.ajax.data= $.extend(true,{},data);
				getBuyColumnData(tradebuy_page,tradebuy_config);
			});



			/*事件绑定*/
			/*绑定查看，修改操作*/
			var operate_item;
			$admin_listbuy_wrap.delegate('span','click',function(e){
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
				if(action==='edit'){
					showComment(id,$tr);
				}
			});



			/*绑定关闭详情*/
			$.each([$show_editcomment_wrap],function () {
				this.on('hide.bs.modal',function(){
					if(operate_item){
						setTimeout(function(){
							operate_item.removeClass('item-lighten');
							operate_item=null;
						},1000);
					}
				});
			});



			/*绑定修改评论*/
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
							formtype='editcomment';
						}
						$.extend(true,(function () {
							if(formtype==='editcomment'){
								return form_opt0;
							}
						}()),(function () {
							if(formtype==='editcomment'){
								return formcache.form_opt_0;
							}
						}()),{
							submitHandler: function(form){
								var setdata={},
									id=$admin_id.val();

								if(id===''){
									dia.content('<span class="g-c-bs-warning g-btips-warn">没有评论数据</span>').show();
									setTimeout(function () {
										dia.close();
									},2000);
									return false;
								}

								$.extend(true,setdata,basedata);

								if(formtype==='editcomment'){
									/*同步编辑器*/
									editor.sync();
									$.extend(true,setdata,{
										id:$admin_id.val(),
										content:$admin_content.val()
									});


									config['url']="http://112.74.207.132:8081/mall-buzhubms-api/goodscomment/customer/update";
									config['data']=setdata;

								}


								$.ajax(config).done(function(resp){
									var code;
									if(formtype==='editcomment'){
										code=parseInt(resp.code,10);
										if(code!==0){
											dia.content('<span class="g-c-bs-warning g-btips-warn">修改评论失败</span>').show();
											return false;
										}else{
											dia.content('<span class="g-c-bs-success g-btips-succ">修改评论成功</span>').show();
										}
									}

									operate_item=null;
									setTimeout(function () {
										$show_editcomment_wrap.modal('hide');
										dia.close();
										admin_editcomment_form.reset();
										/*查询买家*/
										getBuyColumnData(tradebuy_page,tradebuy_config);
									},2000);
								}).fail(function(resp){
									console.log('error');
									dia.content('<span class="g-c-bs-warning g-btips-warn">修改评论失败</span>').show();
									admin_editcomment_form.reset();
									setTimeout(function () {
										dia.close();
										if(operate_item){
											operate_item.removeClass('item-lighten');
											operate_item=null;
										}
									},2000);
								});

								return false;
							}
						});
					});

				}


				/*提交验证*/
				if(resetform0===null){
					resetform0=$admin_editcomment_form.validate(form_opt0);
				}
			}




		}


		/*获取数据*/
		function getBuyColumnData(page,opt){
			if(table===null){
				table=opt.$admin_listbuy_wrap.DataTable(opt.config);
			}else{
				table.ajax.config(opt.config.ajax).load();
			}
		}


		/*查看出库单*/
		function showComment(id,$tr) {
			if(typeof id==='undefined'){
				return false;
			}
			var list=table.row($tr).data()||{};
			if(!$.isEmptyObject(list)){
				/*添加高亮状态*/
				$admin_commentFrom.html(list["customerName"]);
				$admin_commentTo.html(list["providerName"]);
				$admin_id.val(id);
				for(var j in list){
					switch (j){
						case "content":
							editor.html(list[j]);
							editor.sync();
							break;
						case "addTime":
							$admin_commentTime.html(list[j]);
							break;
					}
				}
				if(operate_item){
					operate_item.removeClass('item-lighten');
					operate_item=null;
				}
				operate_item=$tr.addClass('item-lighten');
				$show_editcomment_wrap.modal('show',{backdrop:'static'});
			}
		}





	});


})(jQuery,KindEditor);