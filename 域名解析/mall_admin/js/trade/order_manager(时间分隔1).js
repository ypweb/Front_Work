(function($){
	'use strict';
	$(function(){

		var table=null/*数据展现*/;

		/*初始化数据*/
		if(public_tool.initMap.isrender){
			/*菜单调用*/
			var logininfo=public_tool.initMap.loginMap;
			public_tool.loadSideMenu(public_vars.$mainmenu,public_vars.$main_menu_wrap,{
				url:'http://112.74.207.132:8081/mall-buzhubms-api/module/menu',
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
			var powermap=public_tool.getPower(240),
				detail_power=public_tool.getKeyPower('bzw-order-details',powermap);



			/*dom引用和相关变量定义*/
			var $admin_list_wrap=$('#admin_list_wrap')/*表格*/,
				module_id='bzw-order-manager'/*模块id，主要用于本地存储传值*/,
				dia=dialog({
					zIndex:2000,
					title:'温馨提示',
					okValue:'确定',
					width:300,
					ok:function(){
						this.close();
						return false;
					},
					cancel:false
				})/*一般提示对象*/,
				$admin_page_wrap=$('#admin_page_wrap'),
				$show_detail_wrap=$('#show_detail_wrap')/*详情容器*/,
				$show_detail_content=$('#show_detail_content'),/*详情内容*/
				$show_detail_title=$('#show_detail_title');


			/*查询对象*/
			var $search_orderNumber=$('#search_orderNumber'),
				$search_time=$('#search_time'),
				$search_totalMoneyStart=$('#search_totalMoneyStart'),
				$search_totalMoneyEnd=$('#search_totalMoneyEnd'),
				$search_paymentType=$('#search_paymentType'),
				end_date=moment().format('YYYY-MM-DD'),
				start_date=moment().subtract(1, 'month').format('YYYY-MM-DD'),
				$admin_search_btn=$('#admin_search_btn'),
				$admin_search_clear=$('#admin_search_clear');


			/*列表请求配置*/
			var order_page={
					page:1,
					pageSize:10,
					total:0
				},
				order_config={
					$admin_list_wrap:$admin_list_wrap,
					$admin_page_wrap:$admin_page_wrap,
					config:{
						processing:true,/*大消耗操作时是否显示处理状态*/
						deferRender:true,/*是否延迟加载数据*/
						autoWidth:true,/*是否*/
						paging:false,
						ajax:{
							url:"http://112.74.207.132:8081/mall-buzhubms-api/goodsorder/list",
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
								if(typeof result==='undefined'){
									return [];
								}
								/*设置分页*/
								order_page.page=result.page;
								order_page.pageSize=result.pageSize;
								order_page.total=result.count;
								/*分页调用*/
								$admin_page_wrap.pagination({
									pageSize:order_page.pageSize,
									total:order_page.total,
									pageNumber:order_page.page,
									onSelectPage:function(pageNumber,pageSize){
										/*再次查询*/
										var param=order_config.config.ajax.data;
										param.page=pageNumber;
										param.pageSize=pageSize;
										order_config.config.ajax.data=param;
										getColumnData(order_page,order_config);
									}
								});
								return result?result.list||[]:[];
							},
							data:{
								roleId:decodeURIComponent(logininfo.param.roleId),
								adminId:decodeURIComponent(logininfo.param.adminId),
								grade:decodeURIComponent(logininfo.param.grade),
								token:decodeURIComponent(logininfo.param.token),
								page:1,
								pageSize:10
							}
						},
						info:false,
						searching:true,
						order:[[1, "desc" ]],
						columns: [
							{
								"data":"orderNumber"
							},
							{
								"data":"orderTime"
							},
							{
								"data":"customerName"
							},
							{
								"data":"totalMoney",
								"render":function(data, type, full, meta ){
									return '￥:'+public_tool.moneyCorrect(data,12,false)[0];
								}
							},
							{
								"data":"paymentType",
								"render":function(data, type, full, meta ){
									var stauts=parseInt(data,10),
										statusmap={
											1:"微信支付",
											2:"支付宝支付",
											3:"其他"
										};

									return statusmap[stauts];
								}
							},
							{
								"data":"orderState",
								"render":function(data, type, full, meta ){
									var stauts=parseInt(data,10),
										statusmap={
											0:"待付款",
											1:"取消订单",
											6:"待发货",
											9:"待收货",
											20:"待评价",
											21:"已评价"
										},
										str='';

									if(stauts===6||stauts===9){
										str='<div class="g-c-gray6">'+statusmap[stauts]+'</div>';
									}else if(stauts===1){
										str='<div class="g-c-gray10">'+statusmap[stauts]+'</div>';
									}else if(stauts===0){
										str='<div class="g-c-warn">'+statusmap[stauts]+'</div>';
									}else if(stauts===20||stauts===21){
										str='<div class="g-c-succ">'+statusmap[stauts]+'</div>';
									}else{
										str='<div class="g-c-red1">'+statusmap[stauts]+'</div>';
									}
									return str;
								}
							},
							{
								"data":"id",
								"render":function(data, type, full, meta ){
									var id=parseInt(data,10),
										btns='';

									if(detail_power){
										btns+='<span data-action="select" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
										<i class="fa-pencil"></i>\
										<span>查看</span>\
										</span>';
									}
									return btns;
								}
							}
						]
					}
				};
			

			/*初始化请求*/
			getColumnData(order_page,order_config);


			/*清空查询条件*/
			$admin_search_clear.on('click',function(){
				$.each([$search_orderNumber,$search_time,$search_totalMoneyStart,$search_totalMoneyEnd,$search_paymentType],function(){
					var selector=this.selector;
					if(selector.indexOf('paymentType')!==-1){
						this.find(':selected').prop({
							'selected':false
						});
					}else{
						this.val('');
					}
				});
			});
			$admin_search_clear.trigger('click');


			/*联合查询*/
			$admin_search_btn.on('click',function(){
				var data= $.extend(true,{},order_config.config.ajax.data);

				$.each([$search_orderNumber,$search_time,$search_totalMoneyStart,$search_paymentType],function(){
					var text=this.val(),
						selector=this.selector.slice(1),
						key=selector.split('_'),
						ismoney=selector.indexOf('totalMoney')!==-1?true:false,
						istime=selector.indexOf('time')!==-1?true:false,
						endvalue;

					if(text===""){
						if(ismoney){
							endvalue=$search_totalMoneyEnd.val();
							if(endvalue===''){
								delete data['totalMoneyStart'];
								delete data['totalMoneyEnd'];
							}else{
								this.val('0.00');
								data['totalMoneyStart']='0.00';
								data['totalMoneyEnd']=endvalue;
							}
						}else if(istime){
							delete data['orderTimeStart'];
							delete data['orderTimeEnd'];
						}else{
							if(typeof data[key[1]]!=='undefined'){
								delete data[key[1]];
							}
						}
					}else{
						if(ismoney){
							endvalue=$search_totalMoneyEnd.val();
							data['totalMoneyStart']=text;
							if(endvalue===''){
								$search_totalMoneyEnd.val(text);
								data['totalMoneyEnd']=text;
							}else{
								data['totalMoneyEnd']=endvalue;
							}
						}else if(istime){
							text=text.split(',');
							data['orderTimeStart']=text[0];
							data['orderTimeEnd']=text[1];
						}else{
							data[key[1]]=text;
						}
					}

				});
				order_config.config.ajax.data= $.extend(true,{},data);
				getColumnData(order_page,order_config);
			});


			/*绑定时间*/
			$search_time.val('').daterangepicker({
				format: 'YYYY-MM-DD',
				todayBtn: true,
				maxDate:end_date,
				endDate:end_date,
				startDate:start_date,
				separator:','
			}).on('apply.daterangepicker',function(ev, picker){
				var end=moment(picker.endDate).format('YYYY-MM-DD'),
					start=moment(picker.startDate).format('YYYY-MM-DD'),
					limitstart=moment(end).subtract(36, 'month').format('YYYY-MM-DD'),
					isstart=moment(start).isBetween(limitstart,end);

				/*校验时间区间合法性*/
				if(!isstart){
					picker.setStartDate(limitstart);
				}
			});



			/*绑定价格输入*/
			$.each([$search_totalMoneyStart,$search_totalMoneyEnd],function(){
				var selector=this.selector,
					self=this;

				this.on('keyup focusout',function(e){
					var etype=e.type;
					if(etype==='keyup'){
						this.value=this.value.replace(/[^0-9\.]/g,'').replace(/\.{2,}/g,'.');
					}else if(etype==='focusout'){
						if(selector.indexOf('Start')!==-1){
							momeyLimit({
								type:'start',
								cvalue:this.value
							});
						}else if(selector.indexOf('End')!==-1){
							momeyLimit({
								type:'end',
								cvalue:this.value
							});
						}
					}
				});
			});


			/*事件绑定*/
			/*绑定查看，修改操作*/
			var operate_item;
			$admin_list_wrap.delegate('span','click',function(e){
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
				if(action==='select'&&detail_power){
					showTrade(id,$tr);
				}
			});

		}


		/*获取数据*/
		function getColumnData(page,opt){
			if(table===null){
				table=opt.$admin_list_wrap.DataTable(opt.config);
			}else{
				table.ajax.config(opt.config.ajax).load();
			}
		}



		/*查看出库单*/
		function showTrade(id,$tr) {
			if(typeof id==='undefined'){
				return false;
			}

			var detail_map={
				orderNumber:'订单号',
				orderState:"订单状态",
				totalMoney:"订单总价",
				userName:"买家名称",
				orderTime:"下单时间",
				providerName:"卖家店铺",
				customerName:"收货人姓名",
				customerPhone:"手机号码",
				shippingMethodName:"配送方式",
				localArea:"所在地区",
				customerAddress:"详细地址",
				goods:"商品信息"
			};

			$.ajax({
					url:"http://112.74.207.132:8081/mall-buzhubms-api/goodsorder/detail",
					dataType:'JSON',
					method:'post',
					data:{
						id:id,
						roleId:decodeURIComponent(logininfo.param.roleId),
						adminId:decodeURIComponent(logininfo.param.adminId),
						grade:decodeURIComponent(logininfo.param.grade),
						token:decodeURIComponent(logininfo.param.token)
					}
				})
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
					var list=resp.result;
					if(!list){
						return false;
					}

					var str='',
						istitle=false;

					if(!$.isEmptyObject(list)){
						/*添加高亮状态*/
						for(var j in list){
							if(typeof detail_map[j]!=='undefined'){
								if(j==='title'||j==='name'){
									istitle=true;
									$show_detail_title.html('查看"<span class="g-c-info">'+list[j]+'</span>"订单详情');
								}else if(j==='orderState'){
									var statemap={
										0:"待付款",
										1:"取消订单",
										6:"待发货",
										9:"待收货",
										20:"待评价",
										21:"已评价"
									};
									str+='<tr><th>'+detail_map[j]+':</th><td>'+statemap[parseInt(list[j],10)]+'</td></tr>';
								}else if(j==='goods'){
									var tempsub=list[j],
										k=0,
										sublen=tempsub.length;
									for(k;k<sublen;k++){
										str+='<tr><th>商品名称:</th><td>'+tempsub[k]["goodsName"]+'</td></tr>';
									}
								}else{
									str+='<tr><th>'+detail_map[j]+':</th><td>'+list[j]+'</td></tr>';
								}
							}else{
								str+='<tr><th>'+j+':</th><td>'+list[j]+'</td></tr>';
							}
						}
						if(!istitle){
							$show_detail_title.html('查看订单详情');
						}
						$(str).appendTo($show_detail_content.html(''));
						if(operate_item){
							operate_item.removeClass('item-lighten');
							operate_item=null;
						}
						operate_item=$tr.addClass('item-lighten');
						$show_detail_wrap.modal('show',{backdrop:'static'});
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


		/*规范金额范围值*/
		function momeyLimit(config){
			var type=config.type,
				cvalue=config.cvalue,
				minvalue,
				maxvalue;

			if(type==='start'){
				maxvalue=$search_totalMoneyEnd.val();
				if(maxvalue===''){
					$search_totalMoneyStart.val(public_tool.moneyCorrect(cvalue,12,true)[0]);
				}else{
					minvalue=public_tool.moneyCorrect(cvalue,12,true);
					maxvalue=public_tool.moneyCorrect(maxvalue,12,true);
					if((minvalue[1] * 100)>(maxvalue[1] * 100)){
						$search_totalMoneyStart.val(maxvalue[0]);
					}else{
						$search_totalMoneyStart.val(minvalue[0]);
					}
				}
			}else if(type==='end'){
				minvalue=$search_totalMoneyStart.val();
				if(minvalue===''){
					$search_totalMoneyEnd.val(public_tool.moneyCorrect(cvalue,12,true)[0]);
				}else{
					minvalue=public_tool.moneyCorrect(minvalue,12,true);
					maxvalue=public_tool.moneyCorrect(cvalue,12,true);
					if((minvalue[1] * 100)>(maxvalue[1] * 100)){
						$search_totalMoneyEnd.val(minvalue[0]);
					}else{
						$search_totalMoneyEnd.val(maxvalue[0]);
					}
				}
			}
		}


	});


})(jQuery);