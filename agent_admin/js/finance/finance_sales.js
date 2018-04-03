/*admin_member:成员设置*/
(function($){
	'use strict';
	$(function(){


		/*初始化数据*/
		if(public_tool.initMap.isrender){
			/*菜单调用*/
			var logininfo=public_tool.initMap.loginMap;
			public_tool.loadSideMenu(public_vars.$mainmenu,public_vars.$main_menu_wrap,{
				url:'http://10.0.5.226:8082/yttx-agentbms-api/module/menu',
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


			/*权限调用*/
			var powermap=public_tool.getPower(),
				financesales_power=public_tool.getKeyPower('销售分润查看',powermap),
				financeswing_power=public_tool.getKeyPower('刷卡分润查看',powermap);


			/*dom引用和相关变量定义*/
			var $finance_wrap1=$('#finance_wrap1')/*表格*/,
				$finance_wrap2=$('#finance_wrap2')/*表格*/,
				module_id='finance_list'/*模块id，主要用于本地存储传值*/,
				table1=null/*数据展现*/,
				table2=null/*数据展现*/;


			/*查询对象*/
			var $search_Time=$('#search_Time'),
				$admin_search_btn=$('#admin_search_btn'),
				$admin_search_clear=$('#admin_search_clear');




			/*数据加载配置*/
			var finance_config={
						url:"http://10.0.5.226:8082/yttx-agentbms-api/finance/profits",
						dataType:'JSON',
						method:'post',
						data:{
							roleId:decodeURIComponent(logininfo.param.roleId),
							adminId:decodeURIComponent(logininfo.param.adminId),
							grade:decodeURIComponent(logininfo.param.grade),
							token:decodeURIComponent(logininfo.param.token),
							type:1
						}
				},
				finance_opt1={
					deferRender:true,/*是否延迟加载数据*/
					//serverSide:true,/*是否服务端处理*/
					searching:false,/*是否搜索*/
					ordering:false,/*是否排序*/
					//order:[[1,'asc']],/*默认排序*/
					paging:false,/*是否开启本地分页*/
					autoWidth:true,/*是否*/
					info:false,/*显示分页信息*/
					stateSave:false,/*是否保存重新加载的状态*/
					processing:true,/*大消耗操作时是否显示处理状态*/
					columns:[],
					lengthChange:false/*是否可改变长度*/
				},
				finance_opt2={
					deferRender:true,/*是否延迟加载数据*/
					//serverSide:true,/*是否服务端处理*/
					searching:true,/*是否搜索*/
					ordering:false,/*是否排序*/
					//order:[[1,'asc']],/*默认排序*/
					paging:true,/*是否开启本地分页*/
					pagingType:'simple_numbers',/*分页按钮排列*/
					autoWidth:true,/*是否*/
					info:true,/*显示分页信息*/
					stateSave:false,/*是否保存重新加载的状态*/
					processing:true,/*大消耗操作时是否显示处理状态*/
					columns:[],
					aLengthMenu: [
						[5,10,20,30],
						[5,10,20,30]
					],
					lengthChange:true/*是否可改变长度*/
				};






			/*时间调用*/
			var end_date=moment().format('YYYY-MM-DD'),
				start_date=moment().subtract(2, 'month').format('YYYY-MM-DD');
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
						limitstart=moment(end).subtract(2, 'month').format('YYYY-MM-DD'),
						isstart=moment(start).isBetween(limitstart,end);

				/*校验时间区间合法性*/
				if(!isstart){
					picker.setStartDate(limitstart);
				}
			});



			/*清空查询条件*/
			$admin_search_clear.on('click',function(){
				$.each([$search_Time],function(){
					if(this.selector.toLowerCase().indexOf('time')!==-1){
						this.val(start_date+','+end_date);
					}else{
						this.val('');
					}
				});
			});
			$admin_search_clear.trigger('click');

			/*联合查询*/
			$admin_search_btn.on('click',function(){
				var data= $.extend(true,{},finance_config.data),
					startvalue='',
					endvalue='';

				/*清除数据并摧毁实例*/
				if(table1){
					table1.destroy();
					table1=null;
					$finance_wrap1.html('');
				}
				if(table2){
					table2.destroy();
					table2=null;
					$finance_wrap2.html('');
				}


				$.each([$search_Time],function(){
					var text=this.val(),
						selector=this.selector.slice(1),
						key=selector.split('_');

					if(text===""){
						if(typeof data['start'+key[1]]!=='undefined'){
							startvalue=start_date;
							endvalue=end_date;
							data['start'+key[1]]=startvalue;
							data['end'+key[1]]=endvalue;
						}
					}else{
						text=text.split(',');
						startvalue=text[0];
						endvalue=text[1];
						data['start'+key[1]]=startvalue;
						data['end'+key[1]]=endvalue;
					}

				});
				/*合并参数*/
				finance_config.data=$.extend(true,{},data);


				/*组合视图对象*/
				var tempobj1=financeSearch(startvalue+','+endvalue,'finance');
				$(tempobj1['col']+tempobj1['th']+tempobj1['tbody']).appendTo($finance_wrap1.html(''));
				finance_opt1.columns=tempobj1['tr'];

				/*组合视图对象*/
				var tempobj2=financeSearch(startvalue+','+endvalue,'station');
				$(tempobj2['col']+tempobj2['th']+tempobj2['tbody']).appendTo($finance_wrap2.html(''));
				finance_opt2.columns=tempobj2['tr'];
				/*创建新实例并初始化请求数据*/
				getFinanceData(finance_config,function(res1,res2){
						var finance1=$.extend(true,{},finance_opt1),
							finance2=$.extend(true,{},finance_opt2);

					finance1['data']=res1;
					finance2['data']=res2;

					table1=$finance_wrap1.DataTable(finance1);
					table2=$finance_wrap2.DataTable(finance2);
				});

			});



			/*数据加载*/
			$admin_search_btn.trigger('click');


		}

	});

	/*财务查询*/
	function financeSearch(datestr,type){


		if(datestr){
			var date=datestr.split(','),
				startobj=moment(date[0]),
				endobj=moment(date[1]);

		}else{
			var startobj=moment().subtract(2, 'month'),
			endobj=moment();
		}


		var startmonth=parseInt(startobj.month()) ,
			endmonth=parseInt(endobj.month()),
			len= 0,
			res={},
			i= 0,
			colstr='',
			thstr='',
			tdstr=[],
			colitem= 5,
			itemlen=5;

		if(endmonth<startmonth){
			endmonth=endmonth + 12;
		}

		len=endmonth - startmonth;
		if(type==='finance'){
			itemlen=len===0?3:len * 2 + 1;
		}else if(type==='station'){
			itemlen=len===0?6:len * 2 + 4;
		}
		colitem=parseInt(50/(itemlen * 2),10);
		if(colitem * itemlen<=(50 - itemlen)){
			colitem=colitem+1;
		}


		for(i;i<=len;i++){
			var tempobj=startobj.add(1,'month'),
				tempth=tempobj.year()+'年'+tempobj.month()+'月';

			if(type==='finance'){
				if(i===0){
					colstr+='<col class="g-w-percent'+colitem+'"><col class="g-w-percent'+colitem+'"><col class="g-w-percent'+colitem+'">';
					thstr+='<th>所属关系</th><th class="no-sorting">'+tempth+'销售</th><th class="no-sorting">'+tempth+'分润</th>';
					tdstr.push({"data":'relationName'},{"data":"m"+tempobj.month()+"Sales"},{"data":"m"+tempobj.month()+"Profits"});
				}else{
					colstr+='<col class="g-w-percent'+colitem+'"><col class="g-w-percent'+colitem+'">';
					thstr+='<th class="no-sorting">'+tempth+'销售</th><th class="no-sorting">'+tempth+'分润</th>';
					tdstr.push({"data":"m"+tempobj.month()+"Sales"},{"data":"m"+tempobj.month()+"Profits"});
				}
			}else if(type==='station'){
				if(i===0){
					colstr+='<col class="g-w-percent'+colitem+'"><col class="g-w-percent'+colitem+'"><col class="g-w-percent'+colitem+'"><col class="g-w-percent'+colitem+'"><col class="g-w-percent'+colitem+'"><col class="g-w-percent'+colitem+'"><col class="g-w-percent'+colitem+'">';
					thstr+='<th>序号</th><th>服务站</th><th>所属代理</th><th>所属关系</th><th>上级代理</th><th class="no-sorting">'+tempth+'销售</th><th class="no-sorting">'+tempth+'分润</th>';
					tdstr.push({"data":"id"},{"data":"shortName"},{"data":"agentShortName"},{"data":"agentGrade"},{"data":"superShortName"},{"data":"m"+tempobj.month()+"Sales"},{"data":"m"+tempobj.month()+"Profits"});
				}else{
					colstr+='<col class="g-w-percent'+colitem+'"><col class="g-w-percent'+colitem+'">';
					thstr+='<th class="no-sorting">'+tempth+'销售</th><th class="no-sorting">'+tempth+'分润</th>';
					tdstr.push({"data":"m"+tempobj.month()+"Sales"},{"data":"m"+tempobj.month()+"Profits"});
				}
			}
		}
		res['col']='<colgroup>'+colstr+'</colgroup>';
		res['th']='<thead><tr>'+thstr+'</tr></thead>';
		res['tbody']='<tbody class="middle-align"></tbody>';
		res['tr']=tdstr.slice(0);
		return res;
	};


	/*获取数据*/
	function getFinanceData(config,fn){

		$.ajax(config).done(function (resp) {
			var code=parseInt(resp.code,10);
			if(code!==0){
				if(code===999){
					/*清空缓存*/
					public_tool.loginTips(function(){
										public_tool.clear();
										public_tool.clearCacheData();
								});
					return [];
				}
				console.log(resp.message);
				dia.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
				setTimeout(function () {
					dia.close();
				},2000);
				return [];
			}

			var res1=[],
				res2=[],
				result=resp.result;

			if(!result){
				res1=[];
				res2=[];
			}else{
				var agent1=result.agent1,
					agent2=result.agent2,
					agent3=result.agent3,
					total=result.total,
					list=result.list,
					relation={
						0:'一级',
						1:'二级',
						2:'三级',
						3:'四级',
						4:'五级',
						5:'六级',
						6:'七级',
						7:'八级',
						8:'九级',
						"total":"合计"
					};


				if(!$.isEmptyObject(agent1)&&agent1){
					res1.push($.extend(true,{"relationName":relation[0]},agent1));
				}
				if(!$.isEmptyObject(agent2)&&agent2){
					res1.push($.extend(true,{"relationName":relation[1]},agent2));
				}
				if(!$.isEmptyObject(agent3)&&agent3){
					res1.push($.extend(true,{"relationName":relation[2]},agent3));
				}
				if(!$.isEmptyObject(total)&&total){
					res1.push($.extend(true,{"relationName":relation['total']},total));
				}
				if(list){
					res2=list.slice(0);
				}
			}

			if(fn&&typeof fn==='function'){
				fn.call(null,res1,res2);
			}


		}).fail(function (resp) {
			console.log('error');
		});

	}



})(jQuery);