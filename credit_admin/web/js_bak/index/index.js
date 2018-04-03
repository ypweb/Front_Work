(function($){
	"use strict";
	$(function(){


		if(public_tool.initMap.isrender){
			/*菜单调用*/
			var logininfo=public_tool.initMap.loginMap;
			public_tool.loadSideMenu(public_vars.$mainmenu,public_vars.$main_menu_wrap,{
				url:'http://120.24.226.70:8081/yttx-adminbms-api/module/menu',
				async:false,
				type:'post',
				param:{
					roleId:decodeURIComponent(logininfo.param.roleId),
					adminId:decodeURIComponent(logininfo.param.adminId),
					token:decodeURIComponent(logininfo.param.token)
				},
				datatype:'json'
			});


			/*时间定义并初始化*/
			var now=moment(),
				now_format=now.format('YYYY-MM-DD'),
				ago_format=now.subtract(12,'month').format('YYYY-MM-DD'),
			/*报表数据定义并初始化区*/
				chart_color=['#2f7ed8','#0d233a','#8bbc21','#910000','#1aadce','#492970','#f28f43','#77a1e5','#c42525','#a6c96a'],
				chart_posz=datePosZ(ago_format,now_format),
				chart_data=(function(datas){
					var len=datas.length,
						i=0,
						res=[];
					for(i;i<len;i++){
						res.push(parseInt(Math.random() * 100,10));
					}
					return res;
				})(chart_posz),
			/*页面元素引用*/
				$chart_search_time=$("#chart_search_time"),
				$chart_search_btn=$("#chart_search_btn"),
				$chart_wrap=$('#chart_wrap'),
			/*柱状图对象*/
				chartobj={
					chart: {
						type: 'column',
						spacingBottom:20,
						style:{
							margin:"0 auto"
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
						lineColor:"#aaa",
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
						gridLineColor:"#fafafa",
						labels:{
							enabled:true,
							style:{
								color:"#ccc"
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
									return "<span style=\"color:#666\">"+this.y+" 户</span>";
								}
							}
						}
					}
				};



			/*日历支持*/
			$chart_search_time.val(ago_format+','+now_format).daterangepicker({
				format: 'YYYY-MM-DD',
				todayBtn: true,
				endDate:now_format,
				startDate:ago_format,
				maxDate:now_format,
				minDate:now.subtract(60,'month').format('YYYY-MM-DD'),
				separator:','
			});



			/*柱状图报表*/
			chartColumn(chartobj,chart_data,$chart_wrap);



			/*查询操作*/
			$chart_search_btn.on('click',function(){
				var time_val=$chart_search_time.val().split(',');
				//求值
				chart_posz=datePosZ(time_val[0],time_val[1]);
				chart_data=(function(){
					var len=chart_posz.length,
						i=0,
						res=[];
					for(i;i<len;i++){
						res.push(parseInt(Math.random() * 100,10));
					}
					return res;
				}());
				//柱状图重绘
				chartobj.series[0].color=(function(c){
					var len=c.length;
					return c[parseInt(Math.random() * len,10)];
				})(chart_color);
				chartobj.xAxis.categories=chart_posz;
				chartobj.series[0].data=chart_data;
				chartColumn(chartobj,chart_data,$chart_wrap);
			});


		}



		
	});
	
	
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
	
	
	
})(jQuery);