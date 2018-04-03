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
				distributordetail_power=public_tool.getKeyPower('分销查看',powermap),
				distributoracquiring_power=public_tool.getKeyPower('收单查看',powermap),
				distributorlower_power=public_tool.getKeyPower('分销统计',powermap);



			/*dom引用和相关变量定义*/
			var $distributor_wrap=$('#distributor_wrap')/*表格*/,
				$stats_wrap1=$('#stats_wrap1'),
				$stats_wrap2=$('#stats_wrap2'),
				module_id='distributor_list'/*模块id，主要用于本地存储传值*/,
				table=null/*数据展现*/,
				statstable1=null,
				statstable2=null,
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
				dialogObj=public_tool.dialog()/*回调提示对象*/;



			/*查询对象*/
			var $search_serviceStationName=$('#search_serviceStationName'),
				$search_nickName=$('#search_nickName'),
				$search_Phone=$('#search_Phone'),
				$admin_search_btn=$('#admin_search_btn'),
				$admin_search_clear=$('#admin_search_clear'),
				$search_Time=$('#search_Time'),
				$stats_search_btn=$('#stats_search_btn'),
				$stats_search_clear=$('#stats_search_clear');




			/*数据加载*/
			var distributor_config={
				url:"http://10.0.5.226:8082/yttx-agentbms-api/distributor/related",
				dataType:'JSON',
				method:'post',
				dataSrc:function ( json ) {
					var code=parseInt(json.code,10);
					if(code!==0){
						if(code===999){
							/*清空缓存*/
							public_tool.loginTips(function(){
										public_tool.clear();
										public_tool.clearCacheData();
								});
							return [];
						}
						console.log(json.message);
						dia.content('<span class="g-c-bs-warning g-btips-warn">'+(json.message||"操作失败")+'</span>').show();
						setTimeout(function () {
							dia.close();
						},2000);
						return [];
					}

					var map=json.result.map,
						list=[];



					if(map && !$.isEmptyObject(map)){
						for(var i in map){
							var agentarr=map[i],
								len=agentarr.length,
								j=0;

								for(j;j<len;j++){
								 	agentarr[j]['agentName']=i;
									list.push(agentarr[j]);
								}
						}
						if(list.length===0){
							return [];
						}
						return list;
					}
					return [];
				},
				data:{
					roleId:decodeURIComponent(logininfo.param.roleId),
					adminId:decodeURIComponent(logininfo.param.adminId),
					grade:decodeURIComponent(logininfo.param.grade),
					token:decodeURIComponent(logininfo.param.token)
				}
			};
			table=$distributor_wrap.DataTable({
				deferRender:true,/*是否延迟加载数据*/
				//serverSide:true,/*是否服务端处理*/
				searching:true,/*是否搜索*/
				ordering:true,/*是否排序*/
				//order:[[1,'asc']],/*默认排序*/
				paging:true,/*是否开启本地分页*/
				pagingType:'simple_numbers',/*分页按钮排列*/
				autoWidth:true,/*是否*/
				info:true,/*显示分页信息*/
				stateSave:false,/*是否保存重新加载的状态*/
				processing:true,/*大消耗操作时是否显示处理状态*/
				ajax:distributor_config,/*异步请求地址及相关配置*/
				columns: [
					{
						"data":"serviceStationName",
						"render":function(data, type, full, meta ){
							return data + '&nbsp;&nbsp;<em class="g-c-gray9">代理商:(<i class="g-c-bs-info">'+full['agentName']+'</i>)</em>';
						}
					},
					{"data":"nickName"},
					{
						"data":"phone",
						"render":function(data, type, full, meta ){
							return public_tool.phoneFormat(data);
						}
					},
					{
						"data":"address",
						"render":function(data, type, full, meta ){
							return data.toString().slice(0,20)+'...';
						}
					},
					{
						"data":"machineCode"
					},
					{
						"data":"distributorId",
						"render":function(data, type, full, meta ){
							var btns='';

							if(distributordetail_power){
								/*查看*/
								btns+='<select class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8 selectlevel">\
									<option selected value="2">二级</option>\
									<option value="3">三级</option>\
									<option value="4">其他</option>\
									</select>&nbsp;\
									<span data-subitem="" data-id="'+data+'" data-action="select" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
									 <i class="fa-angle-right"></i>\
									 <span>下级分销</span>\
									 </span>';
							}
							if(distributorlower_power){
								btns+='<span data-id="'+data+'" data-action="stats" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
														 <i class="fa-bar-chart"></i>\
														 <span>分销统计</span>\
														 </span>';
							}
							return btns;
						}
					}
				],/*控制分页数*/
				aLengthMenu: [
					[5,10,20,30],
					[5,10,20,30]
				],
				lengthChange:true/*是否可改变长度*/
			});


			/*统计数据加载配置*/
			var stats_config={
					url:"http://10.0.5.226:8082/yttx-agentbms-api/distributor/profit/stats",
					dataType:'JSON',
					method:'post',
					data:{
						distributorId:'',
						adminId:decodeURIComponent(logininfo.param.adminId),
						grade:decodeURIComponent(logininfo.param.grade),
						token:decodeURIComponent(logininfo.param.token)
					}
				},
				stats_opt={
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
			$.each([$admin_search_clear,$stats_search_clear],function(){
				var selector=this.selector,
				isstats=selector.toLowerCase().indexOf('stats')!==-1?true:false;

				this.on('click',function(){
					if(isstats){
						/*统计查询*/
						$.each([$search_Time],function(){
							if(this.selector.toLowerCase().indexOf('time')!==-1){
								this.val(start_date+','+end_date);
							}else{
								this.val('');
							}
						});
					}else{
						/*三级分销查询*/
						$.each([$search_serviceStationName,$search_nickName,$search_Phone],function(){
							this.val('');
						});
						/*清空统计查询条件*/
						stats_config['data']['distributorId']='';
					}

				});
			});
			/*清空查询条件*/
			$admin_search_clear.trigger('click');
			$stats_search_clear.trigger('click');


			/*联合查询*/
			$.each([$admin_search_btn,$stats_search_btn],function(){
				var selector=this.selector,
				isstats=selector.toLowerCase().indexOf('stats')!==-1?true:false;

				this.on('click',function(){

					if(isstats){
						/*统计*/
						var statsdata= $.extend(true,{},stats_config.data),
						startvalue='',
						endvalue='';


						if(stats_config['data']['distributorId']===''){
							dia.content('<span class="g-c-bs-warning g-btips-warn">请选择需要查询的分销统计对象</span>').show();
							setTimeout(function(){
								dia.close();
							},2000);
							return false;
						}

						/*清除数据并摧毁实例*/
						if(statstable1){
							statstable1.destroy();
							statstable1=null;
							$stats_wrap1.html('');
						}
						if(statstable2){
							statstable2.destroy();
							statstable2=null;
							$stats_wrap2.html('');
						}



						$.each([$search_Time],function(){
							var text=this.val(),
								subselector=this.selector.slice(1),
								key=subselector.split('_');

							if(text===""){
								if(typeof statsdata['start'+key[1]]!=='undefined'){
									startvalue=start_date;
									endvalue=end_date;
									statsdata['start'+key[1]]=startvalue;
									statsdata['end'+key[1]]=endvalue;
								}
							}else{
								text=text.split(',');
								startvalue=text[0];
								endvalue=text[1];
								statsdata['start'+key[1]]=startvalue;
								statsdata['end'+key[1]]=endvalue;
							}
						});
						/*合并参数*/
						stats_config.data= $.extend(true,{},statsdata);




						/*组合视图对象*/
						var tempobj=statsSearch(startvalue+','+endvalue,'stats');
						$(tempobj['col']+tempobj['th']+tempobj['tbody']).appendTo($stats_wrap1.html(''));
						$(tempobj['col']+tempobj['th']+tempobj['tbody']).appendTo($stats_wrap2.html(''));
						stats_opt.columns=tempobj['tr'];
						/*创建新实例并初始化请求数据*/
						getStatsData(stats_config,function(list1,list2){
								var stats1=$.extend(true,{},stats_opt),
									stats2=$.extend(true,{},stats_opt);

							stats1['data']=list1;
							stats2['data']=list2;

							statstable1=$stats_wrap1.DataTable(stats1);
							statstable2=$stats_wrap2.DataTable(stats2);

						});



					}else{
						/*三级分销*/
						var data= $.extend(true,{},distributor_config.data);

						$.each([$search_serviceStationName,$search_nickName,$search_Phone],function(){
							var text=this.val(),
								selector=this.selector.slice(1),
								key=selector.split('_');



							if(text===""){
								if(typeof data[key[1]]!=='undefined'){
									delete data[key[1]];
								}
							}else{
								if(key[1].toLowerCase().indexOf('phone')!==-1){
									text=text.replace(/\s*/g,'');
								}
								data[key[1]]=text;
							}

						});
						distributor_config.data= $.extend(true,{},data);
						table.ajax.config(distributor_config).load(false);
						/*清空统计查询条件*/
						stats_config['data']['distributorId']='';
					}


				});
			});
			

			/*事件绑定*/
			/*绑定查看，修改操作*/
			var operate_item;
			$distributor_wrap.delegate('span','click',function(e){
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




				/*发货操作*/
				if(action==='select'){
					/*查看下级分销*/
					var level=$this.prev('select').find('option:selected').val(),
						subclass=$this.children('i').hasClass('fa-angle-down'),
						tabletr=table.row($tr),
						subitem=$this.attr('data-subitem');

					if(subclass){
						/*收缩*/
						$this.children('i').removeClass('fa-angle-down');
						tabletr.child().hide(200);
					}else{
						/*添加高亮状态*/
						if(operate_item){
							operate_item.removeClass('item-lighten');
							operate_item=null;
						}
						operate_item=$tr.addClass('item-lighten');
						/*展开*/
						if(subitem===''){
							$.ajax({
								 url:"http://10.0.5.226:8082/yttx-agentbms-api/distributor/lower",
								 method: 'POST',
								 dataType: 'json',
								 data:{
									 "distributorId":id,
									 "Level":level,
									 "adminId":decodeURIComponent(logininfo.param.adminId),
									 "grade":decodeURIComponent(logininfo.param.grade),
									 "token":decodeURIComponent(logininfo.param.token)
								 }
							 }).done(function(resp){
								 var code=parseInt(resp.code,10);
								 if(code!==0){
									 /*回滚状态*/
									 tabletr.child($('<tr><td colspan="6">'+(resp.message||"暂无数据")+'</td></tr>')).show();
									 $this.attr({
										 'data-subitem':'true'
									 }).children('i').addClass('fa-angle-down');
									 console.log(resp.message);
									 return false;
								 }

								 /*是否是正确的返回数据*/
								 var result=resp.result;

								if(!result){
									return [];
								}

								var list=result.list,
									len=list.length,
									i= 0,
									newstr='<colgroup>\
									<col class="g-w-percent20">\
									<col class="g-w-percent20">\
									<col class="g-w-percent10">\
									</colgroup>\
										<thead>\
										<tr>\
										<th>用户名称</th>\
										<th>机器码</th>\
										<th class="no-sorting">操作</th>\
									</tr>\
									</thead>',
									res='<tr><td colspan="3">代理商：'+result["agentName"]+'</td></tr><tr><td colspan="3">服务站：'+result["serviceStationName"]+'</td></tr><tr><td colspan="3">昵称：'+result["nickName"]+'</td></tr>';
								if(len!==0){
									for(i;i<len;i++){
										var tempitem=list[i];
										res+='<tr><td>用户名:'+tempitem["name"]+'</td><td>机器号:'+tempitem["machineCode"]+'</td><td>分销商ID:'+tempitem["distributorId"]+'</td></tr>';

									}
								}
								res='<tbody class="middle-align">'+res+'</tbody>';
								newstr='<tr><td colspan="6"><table class="table table-bordered table-striped table-hover admin-table" >'+newstr+res+'</table></td></tr>';

								var $newtr=$(newstr);
								tabletr.child($newtr).show();
								$this.attr({
									'data-subitem':'true'
								}).children('i').addClass('fa-angle-down')


							 }).fail(function(resp){
							 		console.log(resp.message);
									dia.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
									setTimeout(function () {
										dia.close();
									},2000);
							 });
						}else{
								tabletr.child().show();
								$this.children('i').addClass('fa-angle-down');
						}
					}
				}else if(action==='stats'){
					/*统计*/
					stats_config['data']['distributorId']=id;
					$stats_search_btn.trigger('click');
				}else if(action==='acq'){
					/*收单*/
					/*
					to do
					* */

				}
			});


			/*绑定切换查询条件*/
			$distributor_wrap.delegate('select','change',function(e){
				e.stopPropagation();
				e.preventDefault();

				var target= e.target;

				if(target.className.indexOf('selectlevel')!==-1){
					/*切换条件*/
					$(target).next('span').attr({
						'data-subitem':''
					});
				}

			});


			/*格式化手机号码*/
			$.each([$search_Phone],function(){
				this.on('keyup',function(){
					var phoneno=this.value.replace(/\D*/g,'');
					if(phoneno==''){
						this.value='';
						return false;
					}
					this.value=public_tool.phoneFormat(this.value);
				});
			});


		}

	});



	/*统计查询--按月份*/
	function statsSearch(datestr,type){


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
		if(type==='stats'){
			itemlen=len===0?3:len * 2 + 1;
		}else if(type==='other'){
			itemlen=len===0?6:len * 2 + 4;
		}
		colitem=parseInt(50/(itemlen * 2),10);
		if(colitem * itemlen<=(50 - itemlen)){
			colitem=colitem+1;
		}


		for(i;i<=len;i++){
			var tempobj=startobj.add(1,'month'),
				tempth=tempobj.year()+'年'+tempobj.month()+'月';

			if(type==='stats'){
				if(i===0){
					colstr+='<col class="g-w-percent'+colitem+'"><col class="g-w-percent'+colitem+'"><col class="g-w-percent'+colitem+'">';
					thstr+='<th>所属关系</th><th class="no-sorting">'+tempth+'销售</th><th class="no-sorting">'+tempth+'分润</th>';
					tdstr.push({"data":"relationName"},{"data":"m"+tempobj.month()+"Sales"},{"data":"m"+tempobj.month()+"Profits"});
				}else{
					colstr+='<col class="g-w-percent'+colitem+'"><col class="g-w-percent'+colitem+'">';
					thstr+='<th class="no-sorting">'+tempth+'销售</th><th class="no-sorting">'+tempth+'分润</th>';
					tdstr.push({"data":"m"+tempobj.month()+"Sales"},{"data":"m"+tempobj.month()+"Profits"});
				}
			}else if(type==='other'){
				if(i===0){
					colstr+='<col class="g-w-percent'+colitem+'"><col class="g-w-percent'+colitem+'"><col class="g-w-percent'+colitem+'"><col class="g-w-percent'+colitem+'"><col class="g-w-percent'+colitem+'"><col class="g-w-percent'+colitem+'">';
					thstr+='<th>服务站</th><th>所属代理</th><th>所属关系</th><th>上级代理</th><th class="no-sorting">'+tempth+'销售</th><th class="no-sorting">'+tempth+'分润</th>';
					tdstr.push({defaultContent:''},{defaultContent:''},{defaultContent:''},{defaultContent:''},{"data":"m"+tempobj.month()+"Sales"},{"data":"m"+tempobj.month()+"Profits"});
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
	}


	/*获取数据*/
	function getStatsData(config,fn){

		$.ajax(config).done(function (resp) {
			var code=parseInt(resp.code,10);
			if(code!==0){
				console.log(resp.message);
				dia.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
				setTimeout(function () {
					dia.close();
				},2000);
				return false;
			}

			var list1=[],
				list2=[],
				sales=resp.result.salesprofit,
				acq=resp.result.acquiringprofit,
				relation={
					0:'一级',
					1:'二级',
					2:'三级',
					3:'四级',
					4:'五级',
					5:'六级',
					6:'七级',
					7:'八级',
					8:'九级'
				};

			if(!sales){
				list1=[];
			}else{
				var m=0;
				for(var i in sales){
					var result1={},
						item1=sales[i],
						len1=item1.length,
						j=0;

					for(j;j<len1;j++){
						if(item1[j]){
							item1[j]['relationName']=relation[m];
							$.extend(true,result1,item1[j]);
						}
					}
					if(!$.isEmptyObject(result2)){
						list1.push(result1);
					}
					m++;
				}
			}
			if(!acq){
				list2=[];
			}else{
				var n=0;
				for(var x in acq){
					var result2={},
						item2=acq[x],
						len2=item2.length,
						y=0;
					for(y;y<len2;y++){
						if(item2[y]){
							item2[y]['relationName']=relation[n];
							$.extend(true,result2,item2[y]);
						}
					}
					if(!$.isEmptyObject(result2)){
						list2.push(result2);
					}
					n++;
				}
			}

			if(fn&&typeof fn==='function'){
					fn.call(null,list1,list2);
			}


		}).fail(function (resp) {
			console.log('error');
		});

	}





})(jQuery);