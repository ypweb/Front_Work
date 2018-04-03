/*login*/
(function($){
	'use strict';
	$(function(){

		/*dom引用*/
		public_tool.getEachParams();

		var $admin_role_wrap=$('#admin_role_wrap'),
			module_id='admin_role',
			datalist=null,
			table=null,
			//一般提示对象
			dia=dialog({
				title:'温馨提示',
				okValue:'确定',
				width:300,
				ok:function(){
					this.close();
					return false;
				},
				cancel:false
			}),
			//回调提示对象
			dialogObj=public_tool.dialog();

		//初始化请求
		$.ajax({
			url: "../../json/admin/admin_role.json",
			method: 'POST',
			dataType: 'json',
			data:(function(){
				var param=public_tool.getParams(module_id);
				if(param){
					return {"id":param.id,"type":param.type};
				}
				return '';
			}())
		})
		.done(function (resp) {
			if(resp.flag){
				datalist=resp.datalist.slice(0);
				if(datalist!==null){
					/*
					 * 初始化表格数据
					 * */
					table=$admin_role_wrap.dataTable({
						deferRender:true,
						data:datalist,
						columns: [
							{"defaultContent":(function(){
								var i=0;

								return i;
							}())/*'<input type="checkbox" name="role" class="cbr">'*/},
							{ "data": 'name' },
							{ "data": 'remark' },
							{
							  "data":'btn',
							  "render":function(data, type, full, meta ){
									var id=full.btn.id,
										types=parseInt(full.btn.type,10),
										btns='';

									if(types===1){
										//超级管理员角色
										btns='<span data-id="'+id+'" data-type="'+types+'" data-action="update" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-pencil"></i>\
											<span>修改</span>\
											</span>';
									}else if(types===2||types===3){
										//普通管理员角色
										btns='<span data-id="'+id+'" data-type="'+types+'" data-action="update" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa fa-pencil"></i>\
											<span>修改</span>\
											</span>\
											<span data-href="admin_member.html" data-module="admin_member" data-action="select" data-id="'+id+'" data-type="'+types+'" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-group"></i>\
											<span>成员</span>\
											</span>\
											<span data-href="admin_power.html" data-module="admin_power" data-action="select" data-id="'+id+'" data-type="'+types+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-gear"></i>\
											<span>权限</span>\
											</span>\
											<span  data-id="'+id+'" data-type="'+types+'" data-action="delete" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-trash"></i>\
											<span>删除</span>\
											</span>';
									}else{
										//其他角色
									}
									return btns;
								}
							}
						],
						aLengthMenu: [
							[10,20,50],
							[10,20,50]
						]
					});
				}
			}
		})
		.fail(function(resp){
			if(!resp.flag&&resp.message){
				console.log(resp.message);
			}else{
				console.log('获取数据失败');
			}
		});



		/*事件绑定*/
		/*绑定查看，修改，删除操作*/
		$admin_role_wrap.delegate('span','click',function(e){
			e.stopPropagation();
			e.preventDefault();

			var target= e.target,
				nodename=target.nodeName.toLocaleLowerCase(),
				$this,
				id,
				type,
				module,
				action,
				href,
				$cbx;

			//适配对象
			if(target.className.indexOf('btn')!==-1){
				$this=$(target);
			}else{
				$this=$(target).parent();
			}
			$cbx=$this.closest('tr').find('td:first-child input');

			//先选中数据
			if(!$cbx.is(':checked')){
				dia.content('<span class="g-c-warn g-btips-warn">请选中数据</span>').show();
				return false;
			}

			id=$this.attr('data-id');
			type=$this.attr('data-type');
			action=$this.attr('data-action');
			href=$this.attr('data-href');

			if(href){
				//跳转查询操作
				//清除本地存储
				module=$this.attr('data-module');
				public_tool.removeParams(module);
				//设置本地存储
				public_tool.setParams(module,{
					'module':module,
					'id':id,
					'type':type,
					'action':action
				});
				//地址跳转
				setTimeout(function(){
					location.href=href;
				},100);

			}else{
				if(action==='delete'){
					/*删除操作*/
					if(!dialogObj.isFn){
						//没有回调则设置回调对象
						dialogObj.setFn(function(){
							var self=this;
							$.ajax({
									url: "../../json/admin/admin_role.json",
									method: 'POST',
									dataType: 'json',
									data:{
										"id":id,
										"type":type
									}
								})
								.done(function (resp) {
									if(resp.flag){
										//清除dom内容
										$this.closest('tr').remove();
										//重绘
										//table.draw();
										setTimeout(function(){
											self.content('<span class="g-c-succ g-btips-succ">删除数据成功</span>');
										},100);
									}
								})
								.fail(function(resp){
									if(!resp.flag&&resp.message){
										setTimeout(function(){
											self.content('<span class="g-c-error g-btips-error">'+resp.message+'</span>');
										},100);
									}else{
										setTimeout(function(){
											self.content('<span class="g-c-error g-btips-error">删除数据失败</span>');
										},100);

									}
								});
						});
					}

					//确认删除
					dialogObj.dialog.content('<span class="g-c-warn g-btips-warn">是否删除此数据？</span>').showModal();

				}else if(type==='update'){
					/*修改操作*/
				}
			}












		});





	});


})(jQuery);