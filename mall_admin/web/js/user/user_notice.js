(function($){
	'use strict';
	$(function(){

		var table=null/*数据展现*/;

		/*初始化数据*/
		if(public_tool.initMap.isrender){
			/*菜单调用*/
			var logininfo=public_tool.initMap.loginMap;
			public_tool.loadSideMenu(public_vars.$mainmenu,public_vars.$main_menu_wrap,{
				url:'http://10.0.5.226:8082/mall-buzhubms-api/module/menu',
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


			/*dom引用和相关变量定义*/
			var $admin_list_wrap=$('#admin_list_wrap')/*表格*/,
				module_id='mall-user-notice'/*模块id，主要用于本地存储传值*/,
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
				$admin_page_wrap=$('#admin_page_wrap'),
				sureObj=public_tool.sureDialog(dia)/*回调提示对象*/,
				setSure=new sureObj();


			/*批量配置参数*/
			var $admin_batchitem_btn=$('#admin_batchitem_btn'),
				$admin_batchitem_show=$('#admin_batchitem_show'),
				$admin_batchitem_check=$('#admin_batchitem_check'),
				$admin_usernotice_list=$('#admin_usernotice_list'),
				$admin_batchitem_action=$('#admin_batchitem_action'),
				batchItem=new public_tool.BatchItem();

			/*批量初始化*/
			batchItem.init({
				$batchtoggle:$admin_batchitem_btn,
				$batchshow:$admin_batchitem_show,
				$checkall:$admin_batchitem_check,
				$action:$admin_batchitem_action,
				$listwrap:$admin_usernotice_list,
				setSure:setSure,
				fn:function (type) {
					/*批量操作*/
					batchNotice({
						action:type
					});
				}
			});


			
			
			/*列表请求配置*/
			var notice_page={
					page:1,
					pageSize:10,
					total:0
				},
				notice_config={
					$admin_list_wrap:$admin_list_wrap,
					$admin_page_wrap:$admin_page_wrap,
					config:{
						processing:true,/*大消耗操作时是否显示处理状态*/
						deferRender:true,/*是否延迟加载数据*/
						autoWidth:true,/*是否*/
						paging:false,
						ajax:{
							url:"http://10.0.5.226:8082/mall-buzhubms-api/usernotice/list",
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
								notice_page.page=result.page;
								notice_page.pageSize=result.pageSize;
								notice_page.total=result.count;
								/*分页调用*/
								$admin_page_wrap.pagination({
									pageSize:notice_page.pageSize,
									total:notice_page.total,
									pageNumber:notice_page.page,
									onSelectPage:function(pageNumber,pageSize){
										/*再次查询*/
										var param=notice_config.config.ajax.data;
										param.page=pageNumber;
										param.pageSize=pageSize;
										notice_config.config.ajax.data=param;
										getColumnData(notice_page,notice_config);
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
								"data":"id",
								"orderable" :false,
								"searchable" :false,
								"render":function(data, type, full, meta ){
									return '<input value="'+parseInt(data,10)+'" name="noticename" type="checkbox" />';
								}
							},
							{
								"data":"noticeCode"
							},
							{
								"data":"content"
							},
							{
								"data":"sendTime"
							},
							{
								"data":"userList",
								"render":function(data, type, full, meta ){
									var list=data;
									if(!list){
										return '';
									}
									var i= 0,
										res=[],
										len=list.length;

									if(len!==0){
										for(i;i<len;i++){
											var dataitem=list[i];
											res.push('<i>'+(dataitem["userNickName"]||"")+'</i>');
										}
										return res.join(',');
									}else{
										return '<i>全部用户</i>';
									}
								}
							},
							{
								"data":"id",
								"render":function(data, type, full, meta ){
									var id=parseInt(data,10),
										btns='';

									btns+='<span  data-action="delete" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
										<i class="fa-trash"></i>\
										<span>删除</span>\
										</span>';
									return btns;
								}
							}
						]
					}
				};
			

			/*初始化请求*/
			getColumnData(notice_page,notice_config);


			/*事件绑定*/
			/*绑定查看，修改操作*/
			var operate_item;
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
				if(action==='delete'){
					batchItem.filterData(id);
					if(operate_item){
						operate_item.removeClass('item-lighten');
						operate_item=null;
					}
					operate_item=$tr.addClass('item-lighten');
					/*确认是否启用或禁用*/
					setSure.sure('delete',function(cf){
						/*to do*/
						deleteNotice({
							id:id,
							tip:cf.dia||dia,
							type:'base'
						});
					});
				}
			});

		}


		/*获取数据*/
		function getColumnData(page,opt){
			if(table===null){
				table=opt.$admin_list_wrap.DataTable(opt.config);
			}else{
				/*清除批量数据*/
				batchItem.clear();
				table.ajax.config(opt.config.ajax).load();
			}
		}


		/*删除通知*/
		function deleteNotice(obj){
			var id=obj.id;

			if(typeof id==='undefined'){
				return false;
			}
			var tip=obj.tip,
				type=obj.type;

			if(type==='batch'){
				id=id.join(',');
			}

			$.ajax({
					url:"http://10.0.5.226:8082/mall-buzhubms-api/usernotice/delete",
					dataType:'JSON',
					method:'post',
					data:{
						ids:id,
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
						if(type==='base'){
							if(operate_item){
								operate_item.removeClass('item-lighten');
								operate_item=null;
							}
						}else if(type==='batch'){
							batchItem.clear();
						}
						setTimeout(function () {
							tip.close();
						},2000);
						return false;
					}
					/*是否是正确的返回数据*/
					/*添加高亮状态*/
					tip.content('<span class="g-c-bs-success g-btips-succ">删除成功</span>').show();
					setTimeout(function () {
						tip.close();
						if(type==='base'){
							if(operate_item){
								operate_item.removeClass('item-lighten');
								operate_item=null;
							}
						}else if(type==='batch'){
							batchItem.clear();
						}
						setTimeout(function () {
							/*请求数据*/
							getColumnData(notice_page,notice_config);
						},1000);
					},1000);
									})
				.fail(function(resp){
					console.log(resp.message);
					tip.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
					if(type==='base'){
						if(operate_item){
							operate_item.removeClass('item-lighten');
							operate_item=null;
						}
					}else if(type==='batch'){
						batchItem.clear();
					}
					setTimeout(function () {
						tip.close();
					},2000);
				});
		}


		/*批量操作*/
		function batchNotice(config) {

			var action=config.action;

			if(action===''||typeof action==='undefined'){
				return false;
			}
			var inputitems=batchItem.getBatchNode(),
				len=inputitems.length,
				i=0;

			if(len===0){
				dia.content('<span class="g-c-bs-warning g-btips-warn">请选中操作数据</span>').show();
				setTimeout(function () {
					dia.close();
				},2000);
				return false;
			}
			var tempid=batchItem.getBatchData();
			if(tempid.length!==0){
				if(action==='delete'){
					/*确认是否启用或禁用*/
					setSure.sure('delete',function(cf){
						/*to do*/
						deleteNotice({
							id:tempid,
							tip:cf.dia||dia,
							type:'batch'
						});
					});
				}
			}
		}

	});


})(jQuery);