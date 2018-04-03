/*admin_member:成员设置*/
(function($){
	'use strict';
	$(function(){


		/*初始化数据*/
		if(public_tool.initMap.isrender){
			/*菜单调用*/
			var logininfo=public_tool.initMap.loginMap;
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
			var powermap=public_tool.getPower(83),
				salesprofit_power=public_tool.getKeyPower('mall-sales-profit-view',powermap);


			/*dom引用及其他变量*/
			var	module_id='mall-sales-profit',
				$admin_search_btn=$('#admin_search_btn'),
				$admin_finance_monthwrap=$('#admin_finance_monthwrap'),
				$admin_finance_detailwrap=$('#admin_finance_detailwrap'),
				$admin_finance_childwrap=$('#admin_finance_childwrap'),
				$admin_finance_monthdata=$('#admin_finance_monthdata'),
				$admin_finance_detaildata=$('#admin_finance_detaildata'),
				$admin_finance_childdata=$('#admin_finance_childdata'),
				$admin_month_theme=$('#admin_month_theme'),
				$admin_detail_theme=$('#admin_detail_theme'),
				$admin_child_theme=$('#admin_child_theme'),
				$search_child=$('#search_child'),
				$search_Time=$('#search_Time'),
				end_date=moment().format('YYYY-MM-DD HH:mm:ss'),
				start_date=moment().subtract(1, 'month').format('YYYY-MM-DD HH:mm:ss'),
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


			if(salesprofit_power){
				/*绑定切换查询不同条件*/
				$admin_search_btn.on('click','div',function(){
					var $this=$(this),
						condition=$this.attr('data-value');

					$this.removeClass('btn-white').addClass('btn-info').siblings().removeClass('btn-info').addClass('btn-white');

					if(condition==='month'){
						$admin_finance_monthwrap.removeClass('g-d-hidei');
						$admin_finance_detailwrap.addClass('g-d-hidei');
						$admin_finance_childwrap.addClass('g-d-hidei');
						/*查询销售分润*/
						getByMonthFinance();
					}else if(condition==='detail'){
						$admin_finance_monthwrap.addClass('g-d-hidei');
						$admin_finance_detailwrap.removeClass('g-d-hidei');
						$admin_finance_childwrap.addClass('g-d-hidei');
						/*查询明细*/
						getByDetailFinance();
					}else if(condition==='child'){
						$admin_finance_monthwrap.addClass('g-d-hidei');
						$admin_finance_detailwrap.addClass('g-d-hidei');
						$admin_finance_childwrap.removeClass('g-d-hidei');
						/*查询下级销售分润*/
						getByChildFinance();
					}
				});


				/*查询下级代理商*/
				searchChildAgent(function () {
					/*初始化查询*/
					$admin_search_btn.find('div').eq(0).trigger('click');
				});




				/*时间调用*/
				$search_Time.val(start_date+','+end_date).attr({
					'data-value':start_date+','+end_date
				}).daterangepicker({
					format: 'YYYY-MM-DD HH:mm:ss',
					todayBtn: true,
					maxDate:end_date,
					endDate:end_date,
					startDate:start_date,
					separator:',',
					timePicker : true,
					timePickerIncrement :1,
					ranges : {
						'今日': [moment().startOf('day'), moment()],
						'昨日': [moment().subtract(1,'days').startOf('day'), moment().subtract(1,'days').endOf('day')],
						'最近7日': [moment().subtract(6,'days'), moment()],
						'最近30日': [moment().subtract(29,'days'), moment()]
					}
				}).on('apply.daterangepicker',function(ev, picker){
					var end=moment(picker.endDate).format('YYYY-MM-DD HH:mm:ss'),
						start=moment(picker.startDate).format('YYYY-MM-DD HH:mm:ss'),
						limitstart=moment(end).subtract(12, 'month').format('YYYY-MM-DD HH:mm:ss'),
						isstart=moment(start).isBetween(limitstart,end);

					/*校验时间区间合法性*/
					if(!isstart){
						picker.setStartDate(limitstart);
					}else{
						var $this=$(this),
							prevalue=$this.attr('data-value'),
							nowvalue=start+','+end;
						if(prevalue===nowvalue){
							return false;
						}
						/*明细*/
						$admin_finance_detaildata.attr({
							'data-value':false
						});
						$this.attr({
							'data-value':nowvalue
						});
						getByDetailFinance();
					}
				});





				/*绑定下级代理商查询*/
				$search_child.on('change',function () {
					var $condition=$admin_search_btn.find('.btn-info'),
						key=$condition.attr('data-value');

					if(key==='month'){
						/*月报*/
						$admin_finance_monthdata.attr({
							'data-value':false
						});
						getByMonthFinance();
					}else if(key==='detail'){
						/*明细*/
						$admin_finance_detaildata.attr({
							'data-value':false
						});
						getByDetailFinance();
					}else if(key==='child'){
						/*下级销售分润*/
						$admin_finance_childdata.attr({
							'data-value':false
						});
						getByChildFinance();
					}
				})
			}



		}


		/*月报查询*/
		function getByMonthFinance() {
			var isdata=$admin_finance_monthdata.attr('data-value');
			if(isdata==='true'){
				/*已经请求了数据，不需要再请求*/
				return false;
			}
			var id=$search_child.find(':selected').val();
			if(id===''||typeof id==='undefined'){
				dia.content('<span class="g-c-bs-warning g-btips-warn">请选择下级代理商</span>').show();
				return false;
			}
			$.ajax({
				url:'http://112.74.207.132:8082/mall-agentbms-api/agent/profit/stats/list',
				method:'post',
				dataType:'JSON',
				data:{
					roleId:decodeURIComponent(logininfo.param.roleId),
					adminId:decodeURIComponent(logininfo.param.adminId),
					grade:decodeURIComponent(logininfo.param.grade),
					token:decodeURIComponent(logininfo.param.token),
					agentId:id
				}
			}).done(function (resp) {
				var code=parseInt(resp.code,10);
				if(code!==0){
					if(code===999){
						/*清空缓存*/
						public_tool.loginTips(function(){
							 public_tool.clear();
							 public_tool.clearCacheData();
						});
						return false;
					}
					console.log(resp.message);
					setTimeout(function () {
						dia.close();
					},2000);
					$admin_finance_monthdata.html('<tr><td colspan="10" class="g-t-c">暂无数据</td></tr>');
					$admin_month_theme.html('');
					return false;
				}

				var result=resp.result;

				if(result){
					var list=result.list;
					if(list){
						var len=list.length,
							i=0,
							profit_map={
								1:{},
								2:{},
								3:{},
								4:{},
								5:{},
								6:{},
								7:{},
								8:{},
								9:{},
								10:{},
								11:{},
								12:{}
							},
							sales_map={
								1:{},
								2:{},
								3:{},
								4:{},
								5:{},
								6:{},
								7:{},
								8:{},
								9:{},
								10:{},
								11:{},
								12:{}
							};

						for(i;i<len;i++){
							var dataitem=list[i];
							for(var key in dataitem){
								if(key==='year'){
									$admin_month_theme.html(dataitem[key]+'年月报');
								}
								var macthlist,
									month=1,
									level=1;
								if((macthlist=key.match(/m(\d{1,})ProfitsLevel(\d{1})/))!==null){
									/*匹配分润*/
									month=macthlist[1];
									level=macthlist[2];
									profit_map[month][level]=dataitem[key];
								}else if((macthlist=key.match(/m(\d{1,})SalesLevel(\d{1})/))!==null){
									/*匹配销售*/
									month=macthlist[1];
									level=macthlist[2];
									sales_map[month][level]=dataitem[key];
								}
							}
						}
						var x=1,
							result_list=[],
							pl_total1=0,
							pl_total2=0,
							pl_total3=0,
							sl_total1=0,
							sl_total2=0,
							sl_total3=0,
							pl_sum=0,
							sl_sum=0;

						for(x;x<=12;x++) {
							var y = 1,
								profitdata = profit_map[x],
								salesdata = sales_map[x],
								profitstr = '<td class="g-b-gray16">' + x + '月分润</td>',
								salesstr = '<td class="g-b-gray16">' + x + '月销售</td>',
								profit_total = 0,
								sales_total = 0;
							for (y; y <= 3; y++) {
								if (!(y in profitdata)) {
									profitstr += '<td>&nbsp;</td>';
								} else {
									var temp_pdata = profitdata[y],
										temp_pfdata = parseFloat(temp_pdata);

									profitstr += '<td>' + temp_pdata + '</td>';
									/*合计*/
									profit_total += temp_pfdata;
									/*汇总*/
									if (y === 1) {
										pl_total1 += temp_pfdata;
									} else if (y === 2) {
										pl_total2 += temp_pfdata;
									} else if (y === 3) {
										pl_total3 += temp_pfdata;
									}
								}
								if (!(y in salesdata)) {
									salesstr += '<td>&nbsp;</td>';
								} else {
									var temp_sdata = salesdata[y],
										temp_sfdata = parseFloat(temp_sdata);

									salesstr += '<td>' + temp_sdata + '</td>';
									/*合计*/
									sales_total += temp_sfdata;
									if (y === 1) {
										sl_total1 += temp_sfdata;
									} else if (y === 2) {
										sl_total2 += temp_sfdata;
									} else if (y === 3) {
										sl_total3 += temp_sfdata;
									}
								}
							}
							/*汇总*/
							pl_sum += profit_total;
							sl_sum += sales_total;
							result_list.push('<tr>' + salesstr + '<td class="g-c-bs-success">' + public_tool.moneyCorrect(sales_total, 12, true)[0] + '</td>' + profitstr + '<td class="g-c-bs-success">' + public_tool.moneyCorrect(profit_total, 12, true)[0] + '</td></tr>');
						}
						$admin_finance_monthdata.attr({
							'data-value':'true'
						});
						$(result_list.join('')+'<tr>' +
							'<td class="g-b-gray16">销售汇总</td>' +
							'<td class="g-c-bs-info">' + public_tool.moneyCorrect(sl_total1, 12, true)[0] + '</td>' +
							'<td class="g-c-bs-info">' + public_tool.moneyCorrect(sl_total2, 12, true)[0] + '</td>' +
							'<td class="g-c-bs-info">' + public_tool.moneyCorrect(sl_total3, 12, true)[0] + '</td>' +
							'<td class="g-c-bs-info">' + public_tool.moneyCorrect(sl_sum, 12, true)[0] + '</td>' +
							'<td class="g-b-gray16">分润汇总</td>' +
							'<td class="g-c-bs-info">' + public_tool.moneyCorrect(pl_total1, 12, true)[0] + '</td>' +
							'<td class="g-c-bs-info">' + public_tool.moneyCorrect(pl_total2, 12, true)[0] + '</td>' +
							'<td class="g-c-bs-info">' + public_tool.moneyCorrect(pl_total3, 12, true)[0] + '</td>' +
							'<td class="g-c-bs-info">' + public_tool.moneyCorrect(pl_sum, 12, true)[0] + '</td>' +

							'</tr>').appendTo($admin_finance_monthdata.html(''));
					}else{
						$admin_finance_monthdata.html('<tr><td colspan="10" class="g-t-c">暂无数据</td></tr>');
						$admin_month_theme.html('');
					}
				}else{
					$admin_finance_monthdata.html('<tr><td colspan="10" class="g-t-c">暂无数据</td></tr>');
					$admin_month_theme.html('');
				}
			}).fail(function (resp) {
				console.log('error');
				$admin_finance_monthdata.html('<tr><td colspan="10" class="g-t-c">暂无数据</td></tr>');
				$admin_month_theme.html('');
			});
		}

		/*详情查询*/
		function getByDetailFinance() {
			var isdata=$admin_finance_detaildata.attr('data-value');
			if(isdata==='true'){
				/*已经请求了数据，不需要再请求*/
				return false;
			}
			var timetext=$search_Time.val(),
				id=$search_child.find(':selected').val();
			if(timetext===''){
				dia.content('<span class="g-c-bs-warning g-btips-warn">请选择查询时间段</span>').show();
				return false;
			}
			if(id===''||typeof id==='undefined'){
				dia.content('<span class="g-c-bs-warning g-btips-warn">请选择下级代理商</span>').show();
				return false;
			}
			timetext=timetext.split(',');

			$.ajax({
				url:'http://112.74.207.132:8082/mall-agentbms-api/transactionrecords/list',
				method:'post',
				dataType:'JSON',
				data:{
					roleId:decodeURIComponent(logininfo.param.roleId),
					adminId:decodeURIComponent(logininfo.param.adminId),
					grade:decodeURIComponent(logininfo.param.grade),
					token:decodeURIComponent(logininfo.param.token),
					agentId:id,
					startTime:timetext[0],
					endTime:timetext[1]
				}
			}).done(function (resp) {
				var code=parseInt(resp.code,10);
				if(code!==0){
					if(code===999){
						/*清空缓存*/
						public_tool.loginTips(function(){
							public_tool.clear();
							public_tool.clearCacheData();
						});
						return false;
					}
					console.log(resp.message);
					setTimeout(function () {
						dia.close();
					},2000);
					$admin_finance_detaildata.html('<tr><td colspan="5" class="g-t-c">暂无数据</td></tr>');
					$admin_detail_theme.html('');
					return false;
				}

				var result=resp.result;

				if(result){
					var list=result.list;

					if(list){
						var len=list.length,
							i=0,
							str='',
							total=0,
							money=0;

						for(i;i<len;i++) {
							money=list[i]["totalMoney"];
							total+=parseFloat(money);
							str+='<tr><td>'+list[i]["orderTime"]+'</td><td>'+list[i]["orderNumber"]+'</td><td>'+list[i]["customerName"]+'</td><td>'+money+'</td><td>'+list[i]["profit"]+'</td></tr>';
						}
						$admin_finance_detaildata.attr({
							'data-value':'true'
						});
						$(str+'<tr>' +
							'<td colspan="3" class="g-t-r">汇总:</td>' +
							'<td colspan="2" class="g-c-bs-info">￥: ' + public_tool.moneyCorrect(total, 12, true)[0] + '</td>' +
							'</tr>').appendTo($admin_finance_detaildata.html(''));
						$admin_detail_theme.html('<span class="g-c-info">'+timetext[0]+'</span>&nbsp;至&nbsp;'+'<span class="g-c-info">'+timetext[1]+'</span>&nbsp;时间段明细');
					}else{
						$admin_finance_detaildata.html('<tr><td colspan="5" class="g-t-c">暂无数据</td></tr>');
						$admin_detail_theme.html('');
					}
				}else{
					$admin_finance_detaildata.html('<tr><td colspan="5" class="g-t-c">暂无数据</td></tr>');
					$admin_detail_theme.html('');
				}
			}).fail(function (resp) {
				console.log('error');
				$admin_finance_detaildata.html('<tr><td colspan="5" class="g-t-c">暂无数据</td></tr>');
				$admin_detail_theme.html('');
			});
		}

		/*查询下级销售分润*/
		function getByChildFinance() {
			$admin_finance_childdata.html('<tr><td colspan="9" class="g-t-c">暂无数据</td></tr>');
			return false;

			var isdata=$admin_finance_childdata.attr('data-value');
			if(isdata==='true'){
				/*已经请求了数据，不需要再请求*/
				return false;
			}
			var id=$search_child.find(':selected').val();
			if(id===''||typeof id==='undefined'){
				dia.content('<span class="g-c-bs-warning g-btips-warn">请选择下级代理商</span>').show();
				return false;
			}
			$.ajax({
				url:'http://112.74.207.132:8082/mall-agentbms-api/agent/profit/stats/list',
				method:'post',
				dataType:'JSON',
				data:{
					roleId:decodeURIComponent(logininfo.param.roleId),
					adminId:decodeURIComponent(logininfo.param.adminId),
					grade:decodeURIComponent(logininfo.param.grade),
					token:decodeURIComponent(logininfo.param.token),
					agentId:id
				}
			}).done(function (resp) {
				var code=parseInt(resp.code,10);
				if(code!==0){
					if(code===999){
						/*清空缓存*/
						public_tool.loginTips(function(){
							public_tool.clear();
							public_tool.clearCacheData();
						});
						return false;
					}
					console.log(resp.message);
					setTimeout(function () {
						dia.close();
					},2000);
					$admin_finance_childdata.html('<tr><td colspan="9" class="g-t-c">暂无数据</td></tr>');
					$admin_child_theme.html('');
					return false;
				}

				var result=resp.result;

				if(result){
					var list=result.list;

					if(list){
						var len=list.length,
							i=0,
							result_map={};


						for(i;i<len;i++){
							var dataitem=list[i],
								area=dataitem['area'];

							if(!(area in result_map)){
								result_map[area]={
									1:'',
									2:'',
									3:'',
									4:'',
									5:'',
									6:''
								};
							}
							for(var key in dataitem){
								var macthlist,
									level=0;
								if((macthlist=key.match(/ProfitsLevel(\d{1})/))!==null){
									/*匹配分润*/
									level=parseInt(macthlist[1],10);
									result_map[area][level]=dataitem[key];
								}else if((macthlist=key.match(/SalesLevel(\d{1})/))!==null){
									/*匹配销售*/
									level=parseInt(macthlist[1],10) + 3;
									result_map[area][level]=dataitem[key];
								}
							}
						}
						var result_list=[],
							pl_total1=0,
							pl_total2=0,
							pl_total3=0,
							sl_total1=0,
							sl_total2=0,
							sl_total3=0,
							pl_sum=0,
							sl_sum=0;

						for(var x in result_map) {
							var profitstr='<td class="g-b-gray16">' + x + '</td>',
								salesstr='',
								y=1,
								dataobj = result_map[x],
								profit_total = 0,
								sales_total = 0;
							for (y; y <= 6; y++) {
								var temp_data=dataobj[y];
								if (temp_data==='') {
									if(y<=3){
										salesstr+= '<td>&nbsp;</td>';
									}else{
										profitstr+= '<td>&nbsp;</td>';
									}
								} else {
									var temp_fdata = parseFloat(temp_data);
									/*合计*/
									/*汇总*/
									if (y === 1) {
										salesstr+= '<td>'+ temp_data +'</td>';
										sales_total += temp_fdata;
										sl_total1 += temp_fdata;
									} else if (y === 2) {
										salesstr+= '<td>'+ temp_data +'</td>';
										sales_total += temp_fdata;
										sl_total2 += temp_fdata;
									} else if (y === 3) {
										salesstr+= '<td>'+ temp_data +'</td>';
										sales_total += temp_fdata;
										sl_total3 += temp_fdata;
									}else if (y === 4) {
										profitstr+= '<td>'+ temp_data +'</td>';
										profit_total += temp_fdata;
										pl_total1 += temp_fdata;
									} else if (y === 5) {
										profitstr+= '<td>'+ temp_data +'</td>';
										profit_total += temp_fdata;
										pl_total2 += temp_fdata;
									}else if (y === 6) {
										profitstr+= '<td>'+ temp_data +'</td>';
										profit_total += temp_fdata;
										pl_total3 += temp_fdata;
									}
								}
							}
							/*汇总*/
							pl_sum += profit_total;
							sl_sum += sales_total;
							result_list.push('<tr>' + salesstr + '<td class="g-c-bs-success">' + public_tool.moneyCorrect(sales_total, 12, true)[0] + '</td>'+ profitstr + '<td class="g-c-bs-success">' + public_tool.moneyCorrect(profit_total, 12, true)[0] + '</td></tr>');
						}
						$admin_finance_childdata.attr({
							'data-value':'true'
						});
						$(result_list.join('')+'<tr>' +
							'<td class="g-b-gray16">汇总</td>' +
							'<td class="g-c-bs-info">' + public_tool.moneyCorrect(sl_total1, 12, true)[0] + '</td>' +
							'<td class="g-c-bs-info">' + public_tool.moneyCorrect(sl_total2, 12, true)[0] + '</td>' +
							'<td class="g-c-bs-info">' + public_tool.moneyCorrect(sl_total3, 12, true)[0] + '</td>' +
							'<td class="g-c-bs-info">' + public_tool.moneyCorrect(sl_sum, 12, true)[0] + '</td>' +
							'<td class="g-c-bs-info">' + public_tool.moneyCorrect(pl_total1, 12, true)[0] + '</td>' +
							'<td class="g-c-bs-info">' + public_tool.moneyCorrect(pl_total2, 12, true)[0] + '</td>' +
							'<td class="g-c-bs-info">' + public_tool.moneyCorrect(pl_total3, 12, true)[0] + '</td>' +
							'<td class="g-c-bs-info">' + public_tool.moneyCorrect(pl_sum, 12, true)[0] + '</td>' +
							'</tr>').appendTo($admin_finance_childdata.html(''));
					}else{
						$admin_finance_childdata.html('<tr><td colspan="9" class="g-t-c">暂无数据</td></tr>');
						$admin_child_theme.html('');
					}
				}else{
					$admin_finance_childdata.html('<tr><td colspan="9" class="g-t-c">暂无数据</td></tr>');
					$admin_child_theme.html('');
				}
			}).fail(function (resp) {
				console.log('error');
				$admin_finance_childdata.html('<tr><td colspan="9" class="g-t-c">暂无数据</td></tr>');
				$admin_child_theme.html('');
			});
		}

		/*查询下级代理商*/
		function searchChildAgent(fn) {
			$.ajax({
				url:'http://112.74.207.132:8082/mall-agentbms-api/agent/lower/list',
				method:'post',
				dataType:'JSON',
				data:{
					roleId:decodeURIComponent(logininfo.param.roleId),
					adminId:decodeURIComponent(logininfo.param.adminId),
					grade:decodeURIComponent(logininfo.param.grade),
					token:decodeURIComponent(logininfo.param.token)
				}
			}).done(function (resp) {
				var code=parseInt(resp.code,10);
				if(code!==0){
					if(code===999){
						/*清空缓存*/
						public_tool.loginTips(function(){
							public_tool.clear();
							public_tool.clearCacheData();
						});
						return false;
					}
					console.log(resp.message);
					setTimeout(function () {
						dia.close();
					},2000);
					$('<option value="">请选择下级代理商</option>').appendTo($search_child.html(''));
					return false;
				}

				var result=resp.result;

				if(result){
					var list=result.list;
					if(list){
						var len=list.length,
							i=0,
							str='';
						for(i;i<len;i++){
							if(i==0){
								str+='<option selected value="'+list[i]["id"]+'">'+list[i]["fullName"]+'</option>';
							}else{
								str+='<option value="'+list[i]["id"]+'">'+list[i]["fullName"]+'</option>';
							}
						}
						if(len!==0){
							$(str).appendTo($search_child.html(''));
							if(fn&&typeof fn==='function'){
								fn.call();
							}
						}
					}
				}
			}).fail(function (resp) {
				console.log('error');
				$('<option value="">请选择下级代理商</option>').appendTo($search_child.html(''));
			});
		}


	});




})(jQuery);