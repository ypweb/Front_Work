/*admin_role:角色管理*/
(function($){
	'use strict';
	$(function(){

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
			var powermap=public_tool.getPower();


			/*dom引用和相关变量定义*/
			var $ad_article_wrap=$('#ad_article_wrap')/*角色表格*/,
				module_id='ad_artilce'/*模块id，主要用于本地存储传值*/,
				table=null/*datatable 角色解析后的对象*/,
				dia=dialog({
					title:'温馨提示',
					okValue:'确定',
					width:300,
					ok:function(){
						this.close();
						return false;
					},
					cancel:false
				})/*一般提示对象*/;

			/*列表请求配置*/
			var article_config={
						url:"http://10.0.5.226:8016/yttx-adminbms-api/article/advertisement/list",
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
							return json.result.list;
						},
						data:(function(){
							/*查询本地,如果有则带参数查询，如果没有则初始化查询*/
							var param=public_tool.getParams(module_id);
							//获取参数后清除参数
							public_tool.removeParams(module_id);
							if(param){
								return {
									roleId:param.roleId,
									adminId:decodeURIComponent(logininfo.param.adminId),
									token:decodeURIComponent(logininfo.param.token),
									page:1,
									pageSize:20,
								};
							}
							return {
								roleId:decodeURIComponent(logininfo.param.roleId),
								adminId:decodeURIComponent(logininfo.param.adminId),
								token:decodeURIComponent(logininfo.param.token),
								page:1,
								pageSize:20,
							};
						}())
					};

			/*角色数据加载*/
			table=$ad_article_wrap.DataTable({
				deferRender:true,/*是否延迟加载数据*/
				serverSide:false,/*是否服务端处理*/
				searching:false,/*是否搜索*/
				ordering:false,/*是否排序*/
				//order:[[1,'asc']],/*默认排序*/
				paging:true,/*是否开启本地分页*/
				pagingType:'simple_numbers',/*分页按钮排列*/
				autoWidth:true,/*是否*/
				info:true,/*显示分页信息*/
				stateSave:false,/*是否保存重新加载的状态*/
				processing:true,/*大消耗操作时是否显示处理状态*/
				ajax:article_config,/*异步请求地址及相关配置*/
				columns: [
					{
						defaultContent:'<input type="checkbox" name="role" class="cbr">'
					},
					{"data":"title"},
					{
						"data":"content",
						"render":function(data, type, full, meta ){
							return data.subString(0,10)+'...';
						}
					},
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
						"data":"createTime"
					},
					{
						"data":"id",
						"render":function(data, type, full, meta ){
							var id=parseInt(data,10),
								btns='';

							/*上架,下架*/
							if(typeof powermap[12]!=='undefined'){
								btns+='<span data-action="up" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
									<i class="fa-arrow-up"></i>\
									<span>上架</span>\
									</span>\
									<span data-action="down" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
									<i class="fa-arrow-down"></i>\
									<span>下架</span>\
									</span>';
							}

							/*修改*/
							if(typeof powermap[13]!=='undefined'){
								btns+='<span data-action="update" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
									<i class="fa-pencil"></i>\
									<span>修改</span>\
									</span>';
							}
							return btns;
						}
					}
				],
				aLengthMenu: [
					[20,30,50],
					[20,30,50]
				],/*控制分页数*/
				lengthChange:true/*是否可改变长度*/
			});



			/*事件绑定*/
			/*绑定查看，修改，删除操作*/
			$ad_article_wrap.delegate('span','click',function(e){
				e.stopPropagation();
				e.preventDefault();

				var target= e.target,
					$this,
					id,
					action,
					$cbx,
					$tr;

				//适配对象
				if(target.className.indexOf('btn')!==-1){
					$this=$(target);
				}else{
					$this=$(target).parent();
				}
				$tr=$this.closest('tr'),
					$cbx=$tr.find('td:first-child input');

				//先选中数据
				if(!$cbx.is(':checked')){
					dia.content('<span class="g-c-bs-warning g-btips-warn">请选中数据</span>').show();
					return false;
				}

				id=$this.attr('data-id');
				action=$this.attr('data-action');

				if(action==='select'){
					/*查询操作*/
					permission_config.data.roleId=id;
					/*查询权限列表*/
					$.ajax(permission_config)
						.done(function (resp) {
							var code=parseInt(resp.code,10);
							if(code!==0){
								console.log(resp.message);
								return false;
							}
							/*处理权限*/
							var powerlist=public_tool.handlePower(resp,false);

							if(!$.isEmptyObject(powerlist)){
								$operate_setting.attr({
									'data-id':id
								});
								/*解析数据*/
								var headlen=setting_header.length,
									i= 0,
									str='';
								for(i;i<headlen;i++){
									var index=parseInt(setting_header[i],10);
									if(index>=0){
										str+="<td>";
										var item=powerlist[index];
										for(var j in item){
											var subitem=item[j],
												ispermit=parseInt(subitem.isPermit,10);
											if(ispermit===0){
												str+='<span data-count="0" data-roleId="'+id+'" data-modId="'+subitem.modId+'" data-prid="'+subitem.prid+'" data-isPermit="'+ispermit+'" class="">'+subitem.funcName+'</span>';
											}else if(ispermit===1){
												str+='<span data-count="0" data-roleId="'+id+'" data-modId="'+subitem.modId+'" data-prid="'+subitem.prid+'" data-isPermit="'+ispermit+'" class="setting_active">'+subitem.funcName+'</span>';
											}
										}
										str+="</td>";
									}else{
										str+='<td>&nbsp;</td>';
									}
								}
								$(str).appendTo($operate_setting.html(''));
							}else{
								/*关闭权限控制按钮区域*/
								$operate_setting.attr({
									'data-id':'-1'
								}).html('<td colspan="7">&nbsp;</td>');
							}
						})
						.fail(function(resp){
							$operate_setting.attr({
								'data-id':'-1'
							}).html('<td colspan="7">&nbsp;</td>');
						});
				}



			});



		}



	});


})(jQuery);