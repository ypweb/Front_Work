(function($){
	"use strict";
	$(function(){


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

			/*dom节点变量*/
			var $admin_mainwrap=$('#admin_mainwrap'),
				$admin_sidewrap=$('#admin_sidewrap'),
				$admin_noticebtn=$('#admin_noticebtn'),
				$admin_notice_wrap=$('#admin_notice_wrap'),
				$show_detail_wrap=$('#show_detail_wrap')/*详情容器*/,
				$show_detail_content=$('#show_detail_content'),
				notice_data=[],
				now=moment(),
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
						res.push(parseInt(Math.random() * 1000,10));
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
						res.push(parseInt(Math.random() * 1000,10));
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



			/*绑定切换通知*/
			$admin_noticebtn.on('click',function () {
				var $this=$(this),
					toggle=$this.attr('data-toggle');

				if(toggle==='hide'){
					$this.attr({
						'data-toggle':'show'
					});
					$admin_mainwrap.addClass('col-md-8');
					$admin_sidewrap.removeClass('g-d-hidei').addClass('col-md-4');
				}else if(toggle==='show'){
					$this.attr({
						'data-toggle':'hide'
					});
					$admin_mainwrap.removeClass('col-md-8');
					$admin_sidewrap.addClass('g-d-hidei').removeClass('col-md-4');
				}

				/*柱状图报表重绘*/
				chartColumn(chartobj,chart_data,$chart_wrap);

			});


			/*请求通知数据*/
			$.ajax({
				url:"http://112.74.207.132:8082/mall-agentbms-api/announcements/received",
				dataType:'JSON',
				method:'post',
				data:{
					roleId:decodeURIComponent(logininfo.param.roleId),
					adminId:decodeURIComponent(logininfo.param.adminId),
					token:decodeURIComponent(logininfo.param.token),
					grade:decodeURIComponent(logininfo.param.grade)
				}
			}).done(function (resp) {
				var code=parseInt(resp.code,10);
				if(code!==0){
					if(code===999){
						/*清空缓存*/
						public_tool.loginTips(function () {
							public_tool.clear();
							public_tool.clearCacheData();
						});
					}
					return false;
				}

				var result=resp.result;
				if(!result){
					$admin_notice_wrap.html('');
					return false;
				}

				var list=result.list;
				if(!list){
					$admin_notice_wrap.html('');
					return false;
				}

				var len=list.length,
					i=0,
					str='',
					typemap={
						1:"通知"
					};

				if(len===0){
					$admin_notice_wrap.html('');
					return false;
				}

				notice_data.length=0;

				for(i;i<len;i++){
					var title=list[i]["title"],
						attachmentUrl=list[i]["attachmentUrl"];
					notice_data[i]={
						title:title,
						content:list[i]["content"],
						attachmentUrl:(typeof attachmentUrl!=='undefined'&&attachmentUrl!=='')?attachmentUrl:''
					};
					str+='<li data-index="'+i+'"><span>'+typemap[list[i]["type"]]+'</span>'+title.slice(0,20)+'  <em>'+list[i]["lastUpdate"]+'</em></li>';
				}

				$(str).appendTo($admin_notice_wrap.html(''));


			}).fail(function (resp) {
				console.log(resp);
			});
			
			
			/*绑定查看详情*/
			$admin_notice_wrap.on('click','li',function () {
				var $this=$(this),
					index=$this.attr('data-index');

				$show_detail_content.html('<tr>\
						<th>标题:</th>\
						<td>'+notice_data[index]["title"]+'</td>\
					</tr>\
					<tr>\
						<th style="vertical-align: middle">内容:</th>\
						<td style="vertical-align: middle">'+notice_data[index]["content"]+'</td>\
					</tr>\
					<tr>\
						<th style="vertical-align: middle">附件:</th>\
						<td style="vertical-align: middle">'+(notice_data[index]["attachmentUrl"]!==""?'<a class="btn btn-info" target="_blank" href="'+notice_data[index]["attachmentUrl"]+'">查看附件</a>':'无附件')+'</td>\
					</tr>');
				$show_detail_wrap.modal('show',{backdrop:'static'});




			});

			

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