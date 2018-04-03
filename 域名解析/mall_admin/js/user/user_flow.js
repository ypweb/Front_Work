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
			



			/*dom引用和相关变量定义*/
			var $admin_list_wrap=$('#admin_list_wrap')/*表格*/,
				module_id='bzw-user-flow'/*模块id，主要用于本地存储传值*/,
				$admin_page_wrap=$('#admin_page_wrap');


			/*查询对象*/
			var $search_condition=$('#search_condition'),
				$search_conditionContent=$('#search_conditionContent'),
				$conditionContent_wrap=$('#conditionContent_wrap'),
				$conditionContent_tips=$('#conditionContent_tips'),
				$search_time=$('#search_time'),
				$admin_search_btn=$('#admin_search_btn'),
				$admin_search_clear=$('#admin_search_clear');


			/*列表请求配置*/
			var record_page={
					page:1,
					pageSize:10,
					total:0
				},
				record_config={
					$admin_list_wrap:$admin_list_wrap,
					$admin_page_wrap:$admin_page_wrap,
					config:{
						processing:true,/*大消耗操作时是否显示处理状态*/
						deferRender:true,/*是否延迟加载数据*/
						autoWidth:true,/*是否*/
						paging:false,
						ajax:{
							url:"http://112.74.207.132:8081/mall-buzhubms-api/capitalflowlog/list",
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
								record_page.page=result.page;
								record_page.pageSize=result.pageSize;
								record_page.total=result.count;
								/*分页调用*/
								$admin_page_wrap.pagination({
									pageSize:record_page.pageSize,
									total:record_page.total,
									pageNumber:record_page.page,
									onSelectPage:function(pageNumber,pageSize){
										/*再次查询*/
										var param=record_config.config.ajax.data;
										param.page=pageNumber;
										param.pageSize=pageSize;
										record_config.config.ajax.data=param;
										getColumnData(record_page,record_config);
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
						order:[[4, "desc" ]],
						columns: [
							{
								"data":"userName"
							},
							{
								"data":"content",
								"render":function(data, type, full, meta ){
									var content=data.toString();
									return content.length>30?content.slice(0,30)+'...':content;
								}
							},
							{
								"data":"amount",
								"render":function(data, type, full, meta ){
									if(data===''||isNaN(data)){
										return '<div class="g-c-red1">￥：0.00</div>';
									}else{
										return '<div class="g-c-red1">￥：'+public_tool.moneyCorrect(data,12,false)[0]+'</div>';
									}
								}
							},
							{
								"data":"orderNumber"
							},
							{
								"data":"createTime"
							}
						]
					}
				};
			

			/*初始化请求*/
			getColumnData(record_page,record_config);


			/*日历调用*/
			$.each([$search_time],function(){
				var selector=this.selector;

				this.val('').daterangepicker({
					format: 'YYYY-MM-DD',
					todayBtn: true,
					endDate:moment().format('YYYY-MM-DD'),
					separator:','
				})
			});


			/*清空查询条件*/
			$admin_search_clear.on('click',function(){
				$.each([$search_condition,$search_conditionContent,$search_time],function(){
					this.val('');
				});
			});
			$admin_search_clear.trigger('click');


			/*绑定切换搜索条件*/
			$search_condition.on('change',function () {
				if(this.value===''){
					$conditionContent_wrap.addClass('g-d-hidei').val('');
				}else{
					$conditionContent_wrap.removeClass('g-d-hidei');
				}
			});


			/*联合查询*/
			$admin_search_btn.on('click',function(){
				var data= $.extend(true,{},record_config.config.ajax.data);

				$.each([$search_condition,$search_conditionContent,$search_time],function(){
					var text=this.val(),
						selector=this.selector.slice(1),
						istime=selector.indexOf('time')!==-1?true:false,
						key=selector.split('_');

					if(text===""){
						if(istime){
							delete data['timeStart'];
							delete data['timeEnd'];
						}else{
							delete data[key[1]];
						}
					}else{
						if(istime){
							var temptime=text.split(',');
							data['timeStart']=temptime[0];
							data['timeEnd']=temptime[1];
						}else{
							data[key[1]]=text;
						}
					}

				});
				record_config.config.ajax.data= $.extend(true,{},data);
				getColumnData(record_page,record_config);
			});




		}


		/*获取数据*/
		function getColumnData(page,opt){
			if(table===null){
				table=opt.$admin_list_wrap.DataTable(opt.config);
			}else{
				table.ajax.config(opt.config.ajax).load();
			}
		}


	});


})(jQuery);