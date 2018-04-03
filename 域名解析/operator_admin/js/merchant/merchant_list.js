/*admin_member:成员设置*/
(function($){
	'use strict';
	$(function(){

		var table=null/*数据展现*/;

		/*初始化数据*/
		if(public_tool.initMap.isrender){
			/*菜单调用*/
			var logininfo=public_tool.initMap.loginMap,
				merchant_grade=parseInt(decodeURIComponent(logininfo.param.grade),10);
			public_tool.loadSideMenu(public_vars.$mainmenu,public_vars.$main_menu_wrap,{
				url:'http://112.74.207.132:8082/mall-agentbms-api/module/menu',
				async:false,
				type:'post',
				param:{
					roleId:decodeURIComponent(logininfo.param.roleId),
					adminId:decodeURIComponent(logininfo.param.adminId),
					sourcesChannel:decodeURIComponent(logininfo.param.sourcesChannel),
					grade:decodeURIComponent(logininfo.param.grade),
					token:decodeURIComponent(logininfo.param.token)
				},
				datatype:'json'
			});
			/*权限调用*/
			var powermap=public_tool.getPower(),
				merchantedit_power=public_tool.getKeyPower('mall-merchant-update',powermap),
				merchantshow_power=public_tool.getKeyPower('mall-merchant-view',powermap);

			/*清除编辑缓存*/
			public_tool.removeParams('mall-merchant-add');


			/*dom引用和相关变量定义*/
			var $merchant_manage_wrap=$('#merchant_manage_wrap')/*表格*/,
				module_id='mall-merchant-list'/*模块id，主要用于本地存储传值*/,
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
				$show_detail_wrap=$('#show_detail_wrap')/*详情容器*/,
				$show_detail_title=$('#show_detail_title')/*详情容器*/,
				$show_detail_content=$('#show_detail_content')/*详情内容*/,
				detail_map={
					username:"登录账户名",
					name:"登录账号昵称",
					type:"商户类型",
					fullName:"运营商全称",
					shortName:"运营商简称",
					imeiCode:"IMEI码",
					deviceType:"设备类型",
					remark:"备注",
					linkman:"运营商负责人",
					cellphone:"运营商手机号码",
					telephone:"运营商电话号码",
					province:"省份",
					city:"市区",
					country:"县区",
					address:"详细地址",
					status:"状态",
					salesmanId:"业务员编号"
				};




			/*列表请求配置*/
			var merchant_config={
					processing:true,/*大消耗操作时是否显示处理状态*/
					deferRender:true,/*是否延迟加载数据*/
					autoWidth:true,/*是否*/
					paging:true,
					pagingType:'simple_numbers',/*分页按钮排列*/
					aLengthMenu: [
						[5,10,15],
						[5,10,15]
					],
					lengthChange:true,/*是否可改变长度*/
					ajax:{
						url:"http://112.74.207.132:8082/mall-agentbms-api/merchant/related",
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
							return result?result.list?result.list:[]:[];
						},
						data:{
							adminId:decodeURIComponent(logininfo.param.adminId),
							token:decodeURIComponent(logininfo.param.token),
							grade:decodeURIComponent(logininfo.param.grade),
						}
					},
					info:true,
					searching:true,
					order:[[4, "desc" ]],
					columns: [
						{
							"data":"fullName"
						},
						{
							"data":"linkman"
						},
						{
							"data":"cellphone",
							"render":function(data, type, full, meta ){
								return public_tool.phoneFormat(data);
							}
						},
						{
							"data":"type",
							"render":function(data, type, full, meta ){
								var typemap={
									1:"3C数码",
									2:"白酒"
								};
								return typemap[parseInt(data,10)];
							}
						},
						{
							"data":"addTime"
						},
						{
							"data":"status",
							"render":function(data, type, full, meta ){
								var stauts=parseInt(data,10),
									statusmap={
										0:"正常",
										1:"停用"
									},
									str='';

								if(stauts===0){
									str='<div class="g-c-info">'+statusmap[stauts]+'</div>';
								}else if(stauts===1){
									str='<div class="g-c-gray12">'+statusmap[stauts]+'</div>';
								}
								return str;
							}
						},
						{
							"data":"id",
							"render":function(data, type, full, meta ){
								var id=parseInt(data,10),
									btns='';

								if(merchantedit_power&&(merchant_grade===3||merchant_grade===2||merchant_grade===1)){
									btns+='<span data-action="update" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
										<i class="fa-pencil"></i>\
										<span>编辑</span>\
										</span>';
								}

								if(merchantshow_power){
									btns+='<span data-action="select" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
										<i class="fa-file-text-o"></i>\
										<span>查看</span>\
										</span>';
								}

								return btns;
							}
						}
					]
				};
			

			/*初始化请求*/
			getColumnData(merchant_config);
			


			/*事件绑定*/
			/*绑定查看，修改操作*/
			var operate_item;
			$merchant_manage_wrap.delegate('span','click',function(e){
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
					public_tool.setParams('mall-merchant-add',{
						'id':id
					});
					location.href='mall-merchant-add.html';
				}else if(action==='select'){
					showDetail(id,$tr);
				}
			});


			/*绑定关闭详情*/
			$show_detail_wrap.on('hide.bs.modal',function(){
				if(operate_item){
					setTimeout(function(){
						operate_item.removeClass('item-lighten');
						operate_item=null;
					},1000);
				}
			});


		}


		/*获取数据*/
		function getColumnData(opt){
			if(table===null){
				table=$merchant_manage_wrap.DataTable(opt);
			}
		}


		/*查看详情*/
		function showDetail(id,$tr) {
			if(!id){
				return false;
			}

			var detailconfig={
					url:"http://112.74.207.132:8082/mall-agentbms-api/merchant/detail",
					dataType:'JSON',
					method:'post',
					data:{
						"id":id,
						"adminId":decodeURIComponent(logininfo.param.adminId),
						"token":decodeURIComponent(logininfo.param.token),
						"grade":decodeURIComponent(logininfo.param.grade)
				}
			};
			$.ajax(detailconfig)
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
					/*是否是正确的返回数据*/
					var list=resp.result,
						str='',
						istitle=false;

					if(!$.isEmptyObject(list)){
						for(var j in list){
							if(typeof detail_map[j]!=='undefined'){
								if(j==='name'||j==='Name'){
									istitle=true;
									$show_detail_title.html('"<span class="g-c-info">"'+list[j]+'"运营商</span>"详情信息');
								}else if(j==='type'){
									var typemap={
										2:"白酒",
										1:"3C数码"
									}
									str+='<tr><th>'+detail_map[j]+':</th><td>'+typemap[list[j]]+'</td></tr>';
								}else if(j==='deviceType'||j==='devicetype'){
									var devicemap={
										1:"S67",
										2:"T6",
										3:"其它"
									}
									str+='<tr><th>'+detail_map[j]+':</th><td>'+(devicemap[list[j]]||"")+'</td></tr>';
								}else if(j==='status'){
									var statusmap={
										0:"正常",
										1:"停用"
									}
									str+='<tr><th>'+detail_map[j]+':</th><td>'+statusmap[list[j]]+'</td></tr>';
								}else{
									str+='<tr><th>'+detail_map[j]+':</th><td>'+list[j]+'</td></tr>';
								}
							}

						}
						if(!istitle){
							$show_detail_title.html('运营商详情信息');
						}
						/*添加高亮状态*/
						if(operate_item){
							operate_item.removeClass('item-lighten');
							operate_item=null;
						}
						operate_item=$tr.addClass('item-lighten');
						$show_detail_content.html(str);
						$show_detail_wrap.modal('show',{backdrop:'static'});
					}else{
						$show_detail_content.html('');
						$show_detail_title.html('');
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


	});


})(jQuery);