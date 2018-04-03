/*商品列表*/
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
				datatype:'json'
			});


			/*dom引用和相关变量定义*/
			var $goods_manage_wrap=$('#goods_manage_wrap')/*表格*/,
				module_id='yttx-goods-manage'/*模块id，主要用于本地存储传值*/,
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
				sureObj=public_tool.sureDialog(dia)/*回调提示对象*/,
				setSure=new sureObj(),
				$admin_page_wrap=$('#admin_page_wrap')/*分页数据*/;





			/*查询对象*/
			var $search_name=$('#search_name'),
				$search_status=$('#search_status'),
				$admin_search_btn=$('#admin_search_btn'),
				$admin_search_clear=$('#admin_search_clear');


			/*列表请求配置*/
			var goodsmanage_page={
					page:1,
					pageSize:10,
					total:0
				},
				goodsmanage_config={
					$goods_manage_wrap:$goods_manage_wrap,
					$admin_page_wrap:$admin_page_wrap,
					config:{
						processing:true,/*大消耗操作时是否显示处理状态*/
						deferRender:true,/*是否延迟加载数据*/
						autoWidth:true,/*是否*/
						paging:false,
						ajax:{
							url:"http://10.0.5.226:8082/yttx-providerbms-api/goods/list",
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
								/*设置分页*/
								goodsmanage_page.page=result.page;
								goodsmanage_page.pageSize=result.pageSize;
								goodsmanage_page.total=result.count;
								/*分页调用*/
								$admin_page_wrap.pagination({
									pageSize:goodsmanage_page.pageSize,
									total:goodsmanage_page.total,
									pageNumber:goodsmanage_page.page,
									onSelectPage:function(pageNumber,pageSize){
										/*再次查询*/
										var param=goodsmanage_config.config.ajax.data;
										param.page=pageNumber;
										param.pageSize=pageSize;
										goodsmanage_config.config.ajax.data=param;
										getColumnData(goodsmanage_page,goodsmanage_config);
									}
								});
								return result.list;
							},
							data:{
								providerId:decodeURIComponent(logininfo.param.providerId),
								userId:decodeURIComponent(logininfo.param.userId),
								token:decodeURIComponent(logininfo.param.token),
								page:1,
								pageSize:10
							}
						},
						fnDrawCallback:function(){
						 　　this.api().column(0).nodes().each(function(cell, i) {
						 　　　　cell.innerHTML =  i + 1;
						 　　});
						},
						info:false,
						searching:true,
						order: [[ 4, 'desc' ]],
						columns: [
							{
								"data":null,
								"orderable" :false,
								"searchable" :false
							},
							{
								"data":"imageUrl",
								"render":function(data, type, full, meta ){
									var img=data,
										str='';
									if(img.indexOf('qiniucdn.com')!==-1){
										str='<div class="admin-goods-thumbnail1"><img alt="" src="'+img+'?imageView2/1/w/80/h/80" /></div>';
									}else{
										img=validImages(data);
										if(img!==''){
											str='<div class="admin-goods-thumbnail1"><img alt="" src="'+img+'" /></div>';
										}else{
											str='<div class="admin-goods-thumbnail1"></div>';
										}
									}
									return str;
								}
							},
							{"data":"name"},
							{
								"data":"goodsTypeName"
							},
							{
								"data":"sort"
							},
							{
								"data":"status",
								"render":function(data, type, full, meta ){
									var stauts=parseInt(data,10),
										statusmap={
											0:"仓库",
											1:"上架",
											2:"下架",
											3:"删除"
										},
										str='';

									if(stauts===0){
										str='<div class="g-c-succ">'+statusmap[stauts]+'</div>';
									}else if(stauts===1){
										str='<div class="g-c-info">'+statusmap[stauts]+'</div>';
									}else if(stauts===2){
										str='<div class="g-c-gray12">'+statusmap[stauts]+'</div>';
									}else if(stauts===3){
										str='<div class="g-c-red1">'+statusmap[stauts]+'</div>';
									}
									return str;
								}
							},
							{
								"data":"id",
								"render":function(data, type, full, meta ){
									var id=parseInt(data,10),
										btns='';


									var status=parseInt(full.status,10);
									if(status===0){
										/*仓库*/
										btns+='<span data-action="up" data-id="'+id+'" data-status="1" data-currentstatus="0" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-arrow-up"></i>\
											<span>上架</span>\
											</span>\
											<span data-action="down" data-id="'+id+'" data-status="2" data-currentstatus="0"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-arrow-down"></i>\
											<span>下架</span>\
											</span>\
											<span data-action="delete" data-id="'+id+'" data-status="3" data-currentstatus="0"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-trash"></i>\
											<span>删除</span>\
											</span>\
											<span data-action="update" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-pencil"></i>\
											<span>编辑</span>\
											</span>\
											<span data-action="select" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-file-text-o"></i>\
											<span>查看</span>\
											</span>';
									}else if(status===1){
										/*上架*/
										btns+='<span data-action="down" data-id="'+id+'" data-status="2" data-currentstatus="1"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-arrow-down"></i>\
											<span>下架</span>\
											</span>\
											<span data-action="delete" data-id="'+id+'" data-status="3" data-currentstatus="1"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-trash"></i>\
											<span>删除</span>\
											</span>\
											<span data-action="update" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-pencil"></i>\
											<span>编辑</span>\
											</span>\
											<span data-action="select" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-file-text-o"></i>\
											<span>查看</span>\
											</span>';
									}else if(status===2){
										/*下架*/
										btns+='<span data-action="up" data-id="'+id+'" data-status="1" data-currentstatus="2" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-arrow-up"></i>\
											<span>上架</span>\
											</span>\
											</span>\
											<span data-action="delete" data-id="'+id+'" data-status="3" data-currentstatus="2"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-trash"></i>\
											<span>删除</span>\
											</span>\
											<span data-action="update" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-pencil"></i>\
											<span>编辑</span>\
											</span>\
											<span data-action="select" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-file-text-o"></i>\
											<span>查看</span>\
											</span>';
									}else if(status===3){
										/*删除*/
										btns+='<span data-action="up" data-id="'+id+'" data-status="1" data-currentstatus="3" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-arrow-up"></i>\
											<span>上架</span>\
											</span>\
											<span data-action="down" data-id="'+id+'" data-status="2" data-currentstatus="3"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray12">\
											<i class="fa-arrow-down"></i>\
											<span>下架</span>\
											</span>';
									}
									return btns;
								},
								"orderable" : false
							}
						]
					}
				};


			/*初始化请求*/
			getColumnData(goodsmanage_page,goodsmanage_config);



			/*清空查询条件*/
			$admin_search_clear.on('click',function(){
				$.each([$search_name,$search_status],function(){
					this.val('');
				});
			});
			$admin_search_clear.trigger('click');


			/*联合查询*/
			$admin_search_btn.on('click',function(){
				var data= $.extend(true,{},goodsmanage_config.config.ajax.data);

				$.each([$search_name,$search_status],function(){
					var text=this.val()||this.find(':selected').val(),
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
				goodsmanage_config.config.ajax.data= $.extend(true,{},data);
				getColumnData(goodsmanage_page,goodsmanage_config);
			});

			/*事件绑定*/
			/*绑定查看，修改操作*/
			var operate_item;
			$goods_manage_wrap.delegate('span','click',function(e){
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
				if(action==='update'){
					public_tool.setParams('yttx-goods-edit',{
						id:id
					});
					location.href='yttx-goods-edit.html';
				}else if(action==='select'){
					public_tool.setParams('yttx-goods-detail',{
						id:id
					});
					location.href='yttx-goods-detail.html';
				}else if(action==='delete'){
					/*删除操作*/
					//没有回调则设置回调对象
					/*添加高亮状态*/
					if(operate_item){
						operate_item.removeClass('item-lighten');
						operate_item=null;
					}
					operate_item=$tr.addClass('item-lighten');

					setSure.sure('delete',function(cf){
						/*to do*/
						$.ajax({
								url:"http://10.0.5.226:8082/yttx-providerbms-api/goods/delete",
								method: 'POST',
								dataType: 'json',
								data:{
									id:id,
									providerId:decodeURIComponent(logininfo.param.providerId),
									userId:decodeURIComponent(logininfo.param.userId),
									token:decodeURIComponent(logininfo.param.token)
								}
							})
							.done(function (resp) {
								var code=parseInt(resp.code,10);
								if(code!==0){
									cf.dia.content('<span class="g-c-bs-warning g-btips-warn">删除失败</span>').show();
									setTimeout(function () {
										cf.dia.close();
									},2000);
									console.log(resp.message);
									return false;
								}
								getColumnData(goodsmanage_page,goodsmanage_config);
								cf.dia.content('<span class="g-c-bs-success g-btips-succ">删除数据成功</span>').show();
								setTimeout(function(){
									cf.dia.close();
								},2000);
							})
							.fail(function(resp){
								console.log(resp.message);
								cf.dia.content('<span class="g-c-bs-warning g-btips-warn">删除失败</span>').show();
								setTimeout(function () {
									cf.dia.close();
								},2000);
							});
					});
				}else if(action==='up'||action==='down'){

					// data-status="0" data-currentstatus

					if(operate_item){
						operate_item.removeClass('item-lighten');
						operate_item=null;
					}
					operate_item=$tr.addClass('item-lighten');
					/*判断是否可以上下架*/
					var status=$this.attr('data-status'),
						currentstatus=$this.attr('data-currentstatus'),
						statusmap={
							"0":'仓库',
							"1":'上架',
							"2":'下架'
						};

					if(status===currentstatus){
						dia.content('<span class="g-c-bs-warning g-btips-warn">目前已经是 <span class="g-c-info">"'+statusmap[status]+'"</span> 状态，不能做操作</span>').show();
						setTimeout(function () {
							dia.close();
						},2000);
						return false;
					}

					/*上架和下架*/
					$.ajax({
							url:"http://10.0.5.226:8082/yttx-providerbms-api/goods/status/update",
							method: 'POST',
							dataType: 'json',
							data:{
								ids:id,
								providerId:decodeURIComponent(logininfo.param.providerId),
								userId:decodeURIComponent(logininfo.param.userId),
								token:decodeURIComponent(logininfo.param.token),
								status:status
							}
						})
						.done(function(resp){
							var code=parseInt(resp.code,10);
							if(code!==0){
								console.log(resp.message);
								dia.content('<span class="g-c-bs-warning g-btips-warn">'+statusmap[status]+'失败</span>').show();
								setTimeout(function () {
									dia.close();
								},2000);
								return false;
							}
							getColumnData(goodsmanage_page,goodsmanage_config);
							dia.content('<span class="g-c-bs-success g-btips-succ">'+statusmap[status]+'成功</span>').show();
							setTimeout(function () {
								dia.close();
							},2000);
						})
						.fail(function(resp){
							console.log(resp.message);
						});
				}else if(action==='store'){
					dia.content('<span class="g-c-bs-warning g-btips-warn">暂未开通此接口</span>').show();
					setTimeout(function () {
						dia.close();
					},2000);
					return false;
					/*仓库*/
					if(operate_item){
						operate_item.removeClass('item-lighten');
						operate_item=null;
					}
					operate_item=$tr.addClass('item-lighten');

				}



			});


		}


		/*获取数据*/
		function getColumnData(page,opt){
			if(table===null){
				if(!public_tool.isSameDomain("http://10.0.5.226:8082")){
					return false;
				}
				table=opt.$goods_manage_wrap.DataTable(opt.config);
			}else{
				table.ajax.config(opt.config.ajax).load();
			}
		}


		/*判断图片合法格式*/
		function validImages(value){
			var str='';
			var tempimg=value,
				imgreg=/(jpeg|jpg|gif|png)/g;

			if(tempimg.indexOf('.')!==-1){
				if(imgreg.test(tempimg)){
					str=value;
				}else{
					str='';
				}
			}else{
				str='';
			}
			return str;
		}




	});


})(jQuery);