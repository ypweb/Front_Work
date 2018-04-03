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
				orderprofit_power=public_tool.getKeyPower('mall-order-report-view',powermap);


			/*dom引用及其他变量*/
			var module_id='mall-order-report',
				$search_Time=$('#search_Time'),
				$admin_search_btn=$('#admin_search_btn'),
			/*报表数据定义并初始化区*/
				end_date=moment().format('YYYY-MM-DD'),
				start_date=moment().subtract(12, 'month').format('YYYY-MM-DD'),
				chart_color=['#2f7ed8','#0d233a','#8bbc21','#910000','#1aadce','#492970','#f28f43','#77a1e5','#c42525','#a6c96a'],
				chart_posz=datePosZ(start_date,end_date),
				chart_data=(function(datas){
					var len=datas.length,
						i=0,
						res=[];
					for(i;i<len;i++){
						res.push(parseInt(Math.random() * 1000,10));
					}
					return res;
				})(chart_posz),
				$chart_wrap=$('#chart_wrap'),
			/*柱状图对象*/
				chartobj={
					chart: {
						type: 'column',
						spacingBottom:20,
						backgroundColor:null,
						style:{
							width:"100%",
							height:"100%"
						}
					},
					title: {
						text:""
					},
					legend:{
						enabled:false
					},
					colors:chart_color,
					xAxis: {
						categories:chart_posz,
						lineColor:"#ccc",
						tickLength:0,
						labels:{
							y:25,
							style:{
								color:"#999"
							}
						}
					},
					yAxis:{
						title:{
							text:""
						},
						gridLineColor:"#ccc",
						gridLineDashStyle:"Dot",
						labels:{
							enabled:true,
							style:{
								color:"#aaa"
							}
						}
					},
					credits: {
						enabled:false
					},
					series: [{
						name:"",
						data:chart_data,
						color:(function(c){
							var len=c.length;
							return c[parseInt(Math.random() * len,10)];
						})(chart_color)
					}],
					tooltip:{
						shadow:false,
						formatter: function(){
							return "<span style=\"color:#666;\">"+this.x+":</span><span style=\"color:"+this.color+"\">"+this.y+"</span>";
						}
					},
					plotOptions: {
						series: {
							dataLabels: {
								enabled: true,
								formatter:function(){
									return "<span style=\"color:#666\">"+this.y+" 个</span>";
								}
							}
						}
					}
				};



			if(orderprofit_power){

				/*时间调用*/
				$search_Time.val(start_date+','+end_date).daterangepicker({
					format: 'YYYY-MM-DD',
					todayBtn: true,
					maxDate:end_date,
					endDate:end_date,
					startDate:start_date,
					separator:','
				}).on('apply.daterangepicker',function(ev, picker){
					var end=moment(picker.endDate).format('YYYY-MM-DD'),
						start=moment(picker.startDate).format('YYYY-MM-DD'),
						limitstart=moment(end).subtract(12, 'month').format('YYYY-MM-DD'),
						isstart=moment(start).isBetween(limitstart,end);

					/*校验时间区间合法性*/
					if(!isstart){
						picker.setStartDate(limitstart);
					}
				});


				/*绑定切换查询不同条件*/
				$admin_search_btn.on('click','div',function(){
					var $this=$(this),
						condition=$this.attr('data-value');

					$this.removeClass('btn-white').addClass('btn-info').siblings().removeClass('btn-info').addClass('btn-white');

					if(condition==='month'){
						$admin_finance_wrap1.removeClass('g-d-hidei');
						$admin_finance_wrap2.addClass('g-d-hidei');
					}else if(condition==='detail'){
						$admin_finance_wrap1.addClass('g-d-hidei');
						$admin_finance_wrap2.removeClass('g-d-hidei');
					}
				});

				$admin_search_btn.find('div:first-child').trigger('click');


				/*柱状图报表*/
				chartColumn(chartobj,chart_data,$chart_wrap);




			}








		}


		//根据时间差处理坐标系
		function datePosZ(start,end){
			var sdate=start.split(/[\-|\-\-|\/]/),
				edate=end.split(/[\-|\-\-|\/]/),
				sy=sdate[0],
				sm=sdate[1],
				ey=edate[0],
				em=edate[1],
				y=ey-sy,
				i=sm,
				j=y-1,
				posz=[];

			if(y===0){
				//处理同一年
				for(i;i<=em;i++){
					posz.push(sy+'年'+i+'月');
				}
			}else if(y===1){
				//处理上一年
				for(i;i<=12;i++){
					posz.push(sy+'年'+i+'月');
				}
				//处理当前年
				i=1;
				for(i;i<=em;i++){
					posz.push(ey+'年'+i+'月');
				}
			}else if(y>=2){
				//处理上一年
				for(i;i<=12;i++){
					posz.push(sy+'年'+i+'月');
				}
				//处理中间全年
				for(j;j>=1;j--){
					var tempyear=ey - j;
					for(var k=1;k<=12;k++){
						posz.push(tempyear+'年'+k+'月');
					}
				}
				//处理当前年
				i=1;
				for(i;i<=em;i++){
					posz.push(ey+'年'+i+'月');
				}
			}
			return posz;
		}

		//报表调用
		function chartColumn(chartobj,data,wrap){
			if(data.length!==0){
				wrap.highcharts(chartobj);
			}
		}

	});


})(jQuery);