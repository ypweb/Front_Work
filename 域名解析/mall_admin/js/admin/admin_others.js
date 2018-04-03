/*admin_profit:分润管理*/
(function($){
	'use strict';
	$(function(){

		if(public_tool.initMap.isrender){
			/*菜单调用*/
			var logininfo=public_tool.initMap.loginMap,
				logingrade=decodeURIComponent(logininfo.param.grade);
			public_tool.loadSideMenu(public_vars.$mainmenu,public_vars.$main_menu_wrap,{
				url:'http://112.74.207.132:8082/mall-agentbms-api/module/menu',
				async:false,
				type:'post',
				param:{
					roleId:decodeURIComponent(logininfo.param.roleId),
					adminId:decodeURIComponent(logininfo.param.adminId),
					grade:logingrade,
					token:decodeURIComponent(logininfo.param.token)
				},
				datatype:'json'
			});


			/*权限调用*/
			var powermap=public_tool.getPower(),
				profit_power=public_tool.getKeyPower('mall-other-set',powermap);

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
				}),
				sureObj=public_tool.sureDialog(dia)/*回调提示对象*/,
				setSure=new sureObj();

			/*表单对象*/
			var $profit_edit_form0=$('#profit_edit_form0')/*编辑表单*/,
				$profit_edit_form1=$('#profit_edit_form1')/*编辑表单*/,
				$rate_edit_form2=$('#rate_edit_form2'),
				$profit_setting_wrap0=$('#profit_setting_wrap0')/*分润设置容器*/,
				$profit_setting_wrap1=$('#profit_setting_wrap1')/*分润设置容器*/,
				$rate_setting_wrap2=$('#rate_setting_wrap2'),
				$profit_a0=$('#profit_a0')/*A级*/,
				$profit_aa0=$('#profit_aa0')/*AA级*/,
				$profit_aaa0=$('#profit_aaa0')/*AAA级*/,
				$profit_a1=$('#profit_a1')/*A级*/,
				$profit_aa1=$('#profit_aa1')/*AA级*/,
				$profit_aaa1=$('#profit_aaa1')/*AAA级*/,
				$profitid0=$('#profitid0'),
				$profitid1=$('#profitid1'),
				$profit0_action=$('#profit0_action'),
				$profit1_action=$('#profit1_action'),
				$profit2_action=$('#profit2_action');


			/*分润率设置*/
			var $rateid1=$('#rateid1'),
				$rateid2=$('#rateid2'),
				$rateid3=$('#rateid3'),
				$ratemin_a2=$('#ratemin_a2'),
				$ratemax_a2=$('#ratemax_a2'),
				$rate_a2=$('#rate_a2'),
				$ratemin_aa2=$('#ratemin_aa2'),
				$ratemax_aa2=$('#ratemax_aa2'),
				$rate_aa2=$('#rate_aa2'),
				$ratemin_aaa2=$('#ratemin_aaa2'),
				$ratemax_aaa2=$('#ratemax_aaa2'),
				$rate_aaa2=$('#rate_aaa2');


			/*设置分润权限*/
			if(profit_power){
				$profit_setting_wrap0.removeClass('g-d-hidei');
				$profit_setting_wrap1.removeClass('g-d-hidei');
				$rate_setting_wrap2.removeClass('g-d-hidei');
			}


			/*只能超级管理员操作*/
			if(parseInt(logingrade,10)===-1){
				$profit0_action.removeClass('g-d-hidei');
				$profit1_action.removeClass('g-d-hidei');
				$profit2_action.removeClass('g-d-hidei');
			}



			/*查询分润设置情况*/
			$.ajax({
				url:'http://112.74.207.132:8082/mall-agentbms-api/profits',
				type:'post',
				data:{
					roleId:decodeURIComponent(logininfo.param.roleId),
					adminId:decodeURIComponent(logininfo.param.adminId),
					grade:logingrade,
					token:decodeURIComponent(logininfo.param.token)
				},
				datatype:'json'
			}).done(function(resp){
				var code=parseInt(resp.code,10);
				if(code!==0){
					if(code===999){
						/*清空缓存*/
						public_tool.loginTips(function () {
							public_tool.clear();
							public_tool.clearCacheData();
						});
						return false;
					}
					console.log(resp.message);
					dia.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
					setTimeout(function () {
						dia.close();
					},2000);
					return false;
				}
				var result=resp.result;

				if(!$.isEmptyObject(result)){
					var platform=result.platformProfitCfg,
						agent=result.agentProfitCfg;

					if(platform){
						$profitid1.val(platform.id);
						var i=0;
						for(var k in platform){
							switch(k){
								case 'platformProfit':
									var platformProfit=platform.platformProfit;
									if(platformProfit===''||parseInt(platformProfit * 1000,10)===0){
										i=1;
									}
									$profit_a1.attr({
										'data-value':platformProfit
									}).val(platformProfit);
									break;
								case 'agentProfit':
									var agentProfit=platform.agentProfit;
									if(agentProfit===''||parseInt(agentProfit * 1000,10)===0){
										i=2;
									}
									$profit_aa1.attr({
										'data-value':agentProfit
									}).val(agentProfit);
									break;
								case 'storageProfit':
									var storageProfit=platform.storageProfit;
									if(storageProfit===''||parseInt(storageProfit * 1000,10)===0){
										i=3;
									}
									$profit_aaa1.attr({
										'data-value':storageProfit
									}).val(storageProfit);
									break;
							}
						}

						/*判断设置值是否符合实际*/
						if(i===3){
							$profit_edit_form1.attr({
								'data-setting':''
							});
						}else{
							$profit_edit_form1.attr({
								'data-setting':'true'
							});
						}

					}
					if(agent){
						$profitid0.val(agent.id);
						var j=0;
						for(var m in agent){
							switch(m){
								case 'agentProfit1':
									var agentProfit1=agent.agentProfit1;
									if(agentProfit1===''||parseInt(agentProfit1 * 1000,10)===0){
										j=1;
									}
									$profit_a0.attr({
										'data-value':agentProfit1
									}).val(agentProfit1);
									break;
								case 'agentProfit2':
									var agentProfit2=agent.agentProfit2;
									if(agentProfit2===''||parseInt(agentProfit2 * 1000,10)===0){
										j=2;
									}
									$profit_aa0.attr({
										'data-value':agentProfit2
									}).val(agentProfit2);
									break;
								case 'agentProfit3':
									var agentProfit3=agent.agentProfit3;
									if(agentProfit3===''||parseInt(agentProfit3 * 1000,10)===0){
										j=3;
									}
									$profit_aaa0.attr({
										'data-value':agentProfit3
									}).val(agentProfit3);
									break;
							}
						}

						/*判断设置值是否符合实际*/
						if(j===3){
							$profit_edit_form0.attr({
								'data-setting':''
							});
						}else{
							$profit_edit_form0.attr({
								'data-setting':'true'
							});
						}
					}

				}else {
					$profit_edit_form0.attr({
						'data-setting':''
					});
					$profit_edit_form1.attr({
						'data-setting':''
					});
				}

			}).fail(function(resp){
				$profit_edit_form0.attr({
					'data-setting':''
				});
				$profit_edit_form1.attr({
					'data-setting':''
				});
				dia.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
				setTimeout(function () {
					dia.close();
				},2000);
			});


			/*查询分润设置情况*/
			$.ajax({
				url:'http://112.74.207.132:8082/mall-agentbms-api/profit/ratecfg/list',
				type:'post',
				data:{
					roleId:decodeURIComponent(logininfo.param.roleId),
					adminId:decodeURIComponent(logininfo.param.adminId),
					grade:logingrade,
					token:decodeURIComponent(logininfo.param.token)
				},
				datatype:'json'
			}).done(function(resp){
				var code=parseInt(resp.code,10);
				if(code!==0){
					if(code===999){
						/*清空缓存*/
						public_tool.loginTips(function () {
							public_tool.clear();
							public_tool.clearCacheData();
						});
						return false;
					}
					console.log(resp.message);
					dia.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
					setTimeout(function () {
						dia.close();
					},2000);
					return false;
				}
				var result=resp.result;

				if(!$.isEmptyObject(result)){
					var list=result.list;

					if(list){
						var len=list.length,
							i=0,
							k=0;

						if(len!==0){
							for(i;i<len;i++){
								var ratedata=list[i],
									id=ratedata['id'],
									rateFrom=ratedata['rateFrom'],
									rateUntil=ratedata['rateUntil'],
									rateAccording=ratedata['rateAccording'],
									level=parseInt(ratedata['level'],10);

								if(rateFrom===''||rateUntil===''||rateAccording===''||isNaN(rateFrom)||isNaN(rateUntil)||isNaN(rateAccording)){
									k++;
									continue;
								}
								var tempFrom=parseInt(rateFrom * 100,10),
									tempUntil=parseInt(rateUntil * 100,10),
									tempAccording=parseInt(rateAccording * 100,10);

								if(tempFrom>tempUntil||tempUntil<tempAccording||tempFrom>tempAccording||tempAccording===0||tempFrom===0||tempUntil===0){
									k++;
									continue;
								}

								if(level===1){
									/*一段*/
									$rateid1.val(id);
									$ratemin_a2.attr({
										'data-value':rateFrom
									}).val(rateFrom);
									$ratemax_a2.attr({
										'data-value':rateUntil
									}).val(rateUntil);
									$rate_a2.attr({
										'data-value':rateAccording
									}).val(rateAccording);
								}else if(level===2){
									/*二段*/
									$rateid2.val(id);
									$ratemin_aa2.attr({
										'data-value':rateFrom
									}).val(rateFrom);
									$ratemax_aa2.attr({
										'data-value':rateUntil
									}).val(rateUntil);
									$rate_aa2.attr({
										'data-value':rateAccording
									}).val(rateAccording);
								}else if(level===3){
									/*三段*/
									$rateid3.val(id);
									$ratemin_aaa2.attr({
										'data-value':rateFrom
									}).val(rateFrom);
									$ratemax_aaa2.attr({
										'data-value':rateUntil
									}).val(rateUntil);
									$rate_aaa2.attr({
										'data-value':rateAccording
									}).val(rateAccording);
								}
							}

						}

						/*判断设置值是否符合实际*/
						if(k!==0){
							$rate_edit_form2.attr({
								'data-setting':''
							});
						}else{
							$rate_edit_form2.attr({
								'data-setting':'true'
							});
						}

					}
				}else {
					$rate_edit_form2.attr({
						'data-setting':''
					});
				}

			}).fail(function(resp){
				$rate_edit_form2.attr({
					'data-setting':''
				});
				dia.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
				setTimeout(function () {
					dia.close();
				},2000);
			});



			/*表单验证*/
			if($.isFunction($.fn.validate)) {
				/*配置信息*/
				var form_opt0={},
					form_opt1={},
					form_opt2={},
					formcache=public_tool.cache,
					defconfig={
						method: 'POST',
						dataType: 'json',
						data:{
							roleId:decodeURIComponent(logininfo.param.roleId),
							adminId:decodeURIComponent(logininfo.param.adminId),
							grade:logingrade,
							token:decodeURIComponent(logininfo.param.token)
						}
					};

				if(formcache.form_opt_0 && formcache.form_opt_1 && formcache.form_opt_2){
					$.each([formcache.form_opt_0,formcache.form_opt_1,formcache.form_opt_2],function(index){
						$.extend(true,(function(index){
							var opt;
							if(index===0){
								opt=form_opt0;
							}else if(index===1){
								opt=form_opt1;
							}else if(index===2){
								opt=form_opt2;
							}
							return opt;
						})(index),(function(index){
							var opt;
							if(index===0){
								opt=formcache.form_opt_0;
							}else if(index===1){
								opt=formcache.form_opt_1;
							}else if(index===2){
								opt=formcache.form_opt_2;
							}
							return opt;
						})(index),{
							submitHandler: function(form){
								var config0,
									config1,
									config2,
									ele_a,
									ele_aa,
									ele_aaa;
								if(index===0){
									config0= $.extend(true,{},defconfig);
									ele_a=$profit_a0.val();
									ele_aa=$profit_aa0.val();
									ele_aaa=$profit_aaa0.val();

									/*规则通过后校验*/
									config0['url']="http://112.74.207.132:8082/mall-agentbms-api/profit/agent/addupdate";
									$.extend(true,config0['data'],{
										agentProfit1: ele_a,
										agentProfit2: ele_aa,
										agentProfit3: ele_aaa,
										id:$profitid0.val()
									});
								}else if(index===1){
									config1= $.extend(true,{},defconfig);
									ele_a=$profit_a1.val();
									ele_aa=$profit_aa1.val();
									ele_aaa=$profit_aaa1.val();
									config1['url']="http://112.74.207.132:8082/mall-agentbms-api/profit/platform/addupdate";
									$.extend(true,config1['data'],{
										platformProfit: ele_a,
										agentProfit: ele_aa,
										storageProfit: ele_aaa,
										id:$profitid1.val()
									});
								}else if(index===2){
									var ratedata=getRate();
									if(ratedata===null){
										dia.content('<span class="g-c-bs-warning g-btips-warn">没有查询到利润率</span>').show();
										return false;
									}
									config2= $.extend(true,{},defconfig);
									config2['url']="http://112.74.207.132:8082/mall-agentbms-api/profit/ratecfg/addupdate";
									$.extend(true,config2['data'],{
										profitRateCfgs:ratedata
									});
								}

								if(index===0||index===1){
									var temp_a=parseInt(ele_a * 1000,10),
										temp_aa=parseInt(ele_aa * 1000,10),
										temp_aaa=parseInt(ele_aaa * 1000,10);

									/*设置分润规则*/
									if(isNaN(temp_a)||isNaN(temp_aa)||isNaN(temp_aaa)){
										dia.content('<span class="g-c-bs-warning g-btips-warn">分润设置数据非法值</span>').show();
										return false;
									}
								}

								
								if(index===0){
									/*确认提示框*/
									if($profit_edit_form0.attr('data-setting')==='true'){
										setSure.sure('设置',function(cf){
											/*to do*/
											setProfit(config0,cf);
										},'您已经设置了分润');
									}else{
										setProfit(config0);
									}
								}

								if(index===1){
									if($profit_edit_form1.attr('data-setting')==='true'){
										setSure.sure('设置',function(cf){
											/*to do*/
											setProfit(config1,cf);
										},'您已经设置了分润');
									}else{
										setProfit(config1);
									}
								}

								if(index===2){
									if($rate_edit_form2.attr('data-setting')==='true'){
										setSure.sure('设置',function(cf){
											/*to do*/
											setProfit(config2,cf);
										},'您已经设置了利润率');
									}else{
										setProfit(config2);
									}
								}

								return false;
							}
						});
					});
				}

				/*提交验证*/
				$profit_edit_form0.validate(form_opt0);
				$profit_edit_form1.validate(form_opt1);
				$rate_edit_form2.validate(form_opt2);
			}


			/*绑定限制*/
			$.each([$profit_a0,$profit_aa0,$profit_aaa0,$profit_a1,$profit_aa1,$profit_aaa1],function(){
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


			/*绑定利润率大小关系*/
			$.each([$ratemin_a2,$ratemax_a2,$rate_a2,$ratemin_aa2,$ratemax_aa2,$rate_aa2,$ratemin_aaa2,$ratemax_aaa2,$rate_aaa2],function(){
				var self=this;
				this.on('focusout keyup',function(e){
					var etype=e.type;
					if(etype==='keyup'){
						var text=this.value.replace(/[^0-9*\-*^\.]/g,'');
						if(text.indexOf('.')!==-1){
							text=text.split('.');
							if(text.length>=3){
								text.length=2;
							}
							if(text[1].length>2){
								text=text[0]+'.'+text[1].slice(0,2);
							}else{
								text=text[0]+'.'+text[1];
							}
						}
						this.value=text;
					}else if(etype==='focusout'){
						var selector=self.selector,
							val,
							maxval,
							minval,
							tempmax,
							tempmin,
							key='';

						/*一段*/
						if(selector.indexOf('_a2')!==-1){
							key='one';
							tempmax=100 * 100;
							tempmin=15 * 100;
							if(selector.indexOf('max')!==-1){
								maxval=this.value;
								minval=$ratemin_a2.val();
								val=$rate_a2.val();
							}else if(selector.indexOf('min')!==-1){
								maxval=$ratemax_a2.val();
								minval=this.value;
								val=$rate_a2.val();
							}else{
								maxval=$ratemax_a2.val();
								minval=$ratemin_a2.val();
								val=this.value;
							}
						}else if(selector.indexOf('_aa2')!==-1){
							/*二段*/
							key='two';
							tempmax=15 * 100;
							tempmin=10 * 100;
							if(selector.indexOf('max')!==-1){
								maxval=this.value;
								minval=$ratemin_aa2.val();
								val=$rate_aa2.val();
							}else if(selector.indexOf('min')!==-1){
								maxval=$ratemax_aa2.val();
								minval=this.value;
								val=$rate_aa2.val();
							}else{
								maxval=$ratemax_aa2.val();
								minval=$ratemin_aa2.val();
								val=this.value;
							}
						}else if(selector.indexOf('_aaa2')!==-1){
							/*三段*/
							key='three';
							tempmax=10 * 100;
							tempmin=5 * 100;
							if(selector.indexOf('max')!==-1){
								maxval=this.value;
								minval=$ratemin_aaa2.val();
								val=$rate_aaa2.val();
							}else if(selector.indexOf('min')!==-1){
								maxval=$ratemax_aaa2.val();
								minval=this.value;
								val=$rate_aaa2.val();
							}else{
								maxval=$ratemax_aaa2.val();
								minval=$ratemin_aaa2.val();
								val=this.value;
							}
						}
						if(maxval===''||isNaN(maxval)){
							maxval=tempmax;
						}else{
							maxval=parseInt(maxval * 100,10);
						}
						if(minval===''||isNaN(minval)){
							minval=tempmin;
						}else{
							minval=parseInt(minval * 100,10);
						}

						if(minval<tempmin){
							minval=tempmin;
						}
						if(minval>=tempmax){
							minval=tempmin;
						}
						if(maxval<=minval){
							maxval=tempmax;
						}
						if(maxval>tempmax){
							maxval=tempmax;
						}
						if(val===''||isNaN(val)){
							val=minval;
						}else{
							val=parseInt(val * 100,10);
						}
						if(val<minval){
							val=minval;
						}
						if(val>maxval){
							val=minval;
						}

						/*赋值*/
						if(key==='one'){
							$ratemax_a2.val(maxval/100);
							$ratemin_a2.val(minval/100);
							$rate_a2.val(val/100);
						}else if(key==='two'){
							$ratemax_aa2.val(maxval/100);
							$ratemin_aa2.val(minval/100);
							$rate_aa2.val(val/100);
						}else if(key==='three'){
							$ratemax_aaa2.val(maxval/100);
							$ratemin_aaa2.val(minval/100);
							$rate_aaa2.val(val/100);
						}
					}
				});
			});

		}
		


		/*设置分润*/
		function setProfit(config,tips) {
			var tip=tips.dia||dia;
			$.ajax(config)
				.done(function(resp){
					var code=parseInt(resp.code,10);
					if(code!==0){
						console.log(resp.message);
						tip.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"设置失败")+'</span>').show();
						setTimeout(function () {
							tip.close();
						},2000);
						return false;
					}
					tip.content('<span class="g-c-bs-success g-btips-succ">设置成功</span>').show();
					setTimeout(function () {
						tip.close();
					},2000);
				})
				.fail(function(resp){
					tip.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
					setTimeout(function () {
						tip.close();
					},2000);

				});
		}


		/*获取*/
		function getRate() {
			var result=[],
				id1=$rateid1.val(),
				id2=$rateid2.val(),
				id3=$rateid3.val();

			if(id1!==''){
				result.push(id1+'#'+$ratemin_a2.val()+'#'+$ratemax_a2.val()+'#'+$rate_a2.val()+'#1');
			}else{
				return null;
			}
			if(id2!==''){
				result.push(id2+'#'+$ratemin_aa2.val()+'#'+$ratemax_aa2.val()+'#'+$rate_aa2.val()+'#2');
			}else{
				return null;
			}
			if(id3!==''){
				result.push(id3+'#'+$ratemin_aaa2.val()+'#'+$ratemax_aaa2.val()+'#'+$rate_aaa2.val()+'#3');
			}else{
				return null;
			}
			return JSON.stringify(result);
		}
		
		


	});


})(jQuery);