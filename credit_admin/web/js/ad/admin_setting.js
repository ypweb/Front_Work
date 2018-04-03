/*admin_profit:分润管理*/
(function($){
	'use strict';
	$(function(){

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

			/*dom引用和相关变量定义*/
			var module_id='admin_profit'/*模块id，主要用于本地存储传值*/,
				dia=dialog({
					title:'温馨提示',
					okValue:'确定',
					width:300,
					ok:function(){
						this.close();
						return false;
					},
					cancel:false
				});

			/*表单对象*/
			var $profit_edit_form=$('#profit_edit_form')/*编辑表单*/,
				$profit_a=$('#profit_a')/*A级*/,
				$profit_aa=$('#profit_aa')/*AA级*/,
				$profit_aaa=$('#profit_aaa')/*AAA级*/;




			/*表单验证*/
			if($.isFunction($.fn.validate)) {
				/*配置信息*/
				var form_opt={};
				if(public_tool.cache.form_opt_0){
					$.extend(true,form_opt,public_tool.cache.form_opt_0,{
						submitHandler: function(form){
							var ele_a=$profit_a.val(),
								ele_aa=$profit_aa.val(),
								ele_aaa=$profit_aaa.val(),
								temp_a=parseInt(ele_a * 10000,10) / 10000,
								temp_aa=parseInt(ele_aa * 10000,10) / 10000,
								temp_aaa=parseInt(ele_aaa * 10000,10) / 10000;

							/*设置分润规则*/
							if((temp_a===0||temp_a>=100)||(temp_aa===0||temp_aa>=100)||(temp_aaa===0||temp_aaa>=100)){
								dia.content('<span class="g-c-bs-warning g-btips-warn">分润设置数据不能大于100或为0</span>').show();
								return false;
							}else if((temp_a+temp_aa+temp_aaa)>100){
								dia.content('<span class="g-c-bs-warning g-btips-warn">分润设置总和不能大于100</span>').show();
								return false;
							}else if((temp_a+temp_aa+temp_aaa)<100){
								dia.content('<span class="g-c-bs-warning g-btips-warn">分润设置总和应为100</span>').show();
								return false;
							}

							/*规则通过后校验*/
							var config={
								url:"../../json/admin/admin_role_update.json",
								method: 'POST',
								dataType: 'json',
								data: {
									"profit_A":ele_a + '%',
									"profit_AA":ele_aa + '%',
									"profit_AAA":ele_aaa + '%'
								}
							};

							$.ajax(config)
								.done(function(resp){
									if(resp.flag){
										dia.content('<span class="g-c-bs-success g-btips-succ">设置成功</span>').show();
									}else{
										dia.content('<span class="g-c-bs-warning g-btips-warn">设置失败</span>').show();
									}
									setTimeout(function () {
										dia.close();
									},2000);
								})
								.fail(function(){
									dia.content('<span class="g-c-bs-warning g-btips-warn">操作失败</span>').show();
									setTimeout(function () {
										dia.close();
									},2000)

								});

							return false;
						}
					});
				}
				/*提交验证*/
				$profit_edit_form.validate(form_opt);
			}


			/*绑定限制*/
			$.each([$profit_a,$profit_aa,$profit_aaa],function(){
				this.on('keyup',function(){
					var val=this.value.replace(/[^0-9*\-*^\.]/g,'');
					if(val.indexOf('.')!==-1){
						val=val.split('.');
						if(val.length>=3){
							val.length=2;
							val=val[0]+'.'+val[1];
						}else{
							val=val.join('.');
						}
					}
					this.value=val;
				});
			});



		}
		
		


	});


})(jQuery);