/*admin_member:成员设置*/
(function($){
	'use strict';
	$(function(){

		var table=null/*数据展现*/;

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
			var powermap=public_tool.getPower(),
				audit_power=public_tool.getKeyPower('mall-purchase-audit',powermap);



			
			/*dom引用和相关变量定义*/
			var $purchase_audit_wrap=$('#purchase_audit_wrap')/*表格*/,
				$purchase_audit_list=$('#purchase_audit_list'),
				module_id='mall-purchase-audit'/*模块id，主要用于本地存储传值*/,
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
				$audit_batch_btn=$('#audit_batch_btn'),
				$batch_all_btn=$('#batch_all_btn'),
				$show_audit_wrap=$('#show_audit_wrap'),
				$show_audit_header=$('#show_audit_header'),
				admin_audit_form=document.getElementById('admin_audit_form'),
				$audit_radio_tip=$('#audit_radio_tip'),
				$audit_radio_wrap=$('#audit_radio_wrap'),
				$admin_id=$('#admin_id'),
				$show_audit_list=$('#show_audit_list'),
				$audit_total=$('#audit_total'),
				$audit_action=$('#audit_action'),
				sureObj=public_tool.sureDialog(dia)/*回调提示对象*/,
				setSure=new sureObj();

			/*查询对象*/
			var $search_orderNumber=$('#search_orderNumber'),
				$search_providerName=$('#search_providerName'),
				$search_auditState=$('#search_auditState'),
				$admin_search_btn=$('#admin_search_btn'),
				$admin_search_clear=$('#admin_search_clear');



			/*重置表单*/
			admin_audit_form.reset();


			/*列表请求配置*/
			var purchaseaudit_page={
					page:1,
					pageSize:10,
					total:0
				},
				purchaseaudit_config={
					$purchase_audit_wrap:$purchase_audit_wrap,
					$admin_page_wrap:$admin_page_wrap,
					config:{
						processing:true,/*大消耗操作时是否显示处理状态*/
						deferRender:true,/*是否延迟加载数据*/
						autoWidth:true,/*是否*/
						paging:false,
						ajax:{
							url:"http://112.74.207.132:8082/mall-agentbms-api/purchasing/order/list",
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
								purchaseaudit_page.page=result.page;
								purchaseaudit_page.pageSize=result.pageSize;
								purchaseaudit_page.total=result.count;
								/*分页调用*/
								$admin_page_wrap.pagination({
									pageSize:purchaseaudit_page.pageSize,
									total:purchaseaudit_page.total,
									pageNumber:purchaseaudit_page.page,
									onSelectPage:function(pageNumber,pageSize){
										/*再次查询*/
										var param=purchaseaudit_config.config.ajax.data;
										param.page=pageNumber;
										param.pageSize=pageSize;
										purchaseaudit_config.config.ajax.data=param;
										getColumnData(purchaseaudit_page,purchaseaudit_config);
									}
								});
								return result?result.list||[]:[];
							},
							data:{
								roleId:decodeURIComponent(logininfo.param.roleId),
								adminId:decodeURIComponent(logininfo.param.adminId),
								token:decodeURIComponent(logininfo.param.token),
								grade:decodeURIComponent(logininfo.param.grade),
								page:1,
								pageSize:10
							}
						},
						info:false,
						searching:true,
						order:[[2, "desc" ]],
						columns: [
							{
								"data":"id",
								"orderable" :false,
								"render":function(data, type, full, meta ){
									var id=parseInt(data,10),
										state=parseInt(full.auditState,10);

									if(audit_power&&(state===0||state===2)){
										return '<input type="checkbox" name="auditid" value="'+id+'" />';
									}
									return '&nbsp;';
								}
							},
							{
								"data":"orderNumber"
							},
							{
								"data":"orderTime"
							},
							{
								"data":"providerName"
							},
							{
								"data":"auditState",
								"render":function(data, type, full, meta ){
									var stauts=parseInt(data,10),
										statusmap={
											0:"待审核",
											1:"审核通过",
											2:"审核不通过"
										},
										str='';

									if(stauts===0){
										str='<div class="g-c-gray6">'+statusmap[stauts]+'</div>';
									}else if(stauts===1){
										str='<div class="g-c-bs-success">'+statusmap[stauts]+'</div>';
									}else if(stauts===2){
										str='<div class="g-c-red2">'+statusmap[stauts]+'</div>';
									}else{
										str='<div class="g-c-red2">状态异常</div>';
									}
									return str;
								}
							},
							{
								"data":"id",
								"render":function(data, type, full, meta ){
									var id=parseInt(data,10),
										btns='',
										state=parseInt(full.auditState,10);

									if(audit_power&&(state===0||state===2)){
										btns+='<span  data-action="audit" data-id="'+id+'" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
										<i class="fa-hand-o-up"></i>\
										<span>审核</span>\
										</span>';
									}else if(audit_power&&state===1){
										/*审核通过后查看详情*/
										btns+='<span  data-subitem=""  data-action="select" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
										<i class="fa-angle-right"></i>\
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
			getColumnData(purchaseaudit_page,purchaseaudit_config);


			/*清空查询条件*/
			$admin_search_clear.on('click',function(){
				$.each([$search_orderNumber,$search_providerName,$search_auditState],function(){
					var selector=this.selector;
					if(selector.indexOf('auditState')!==-1){
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
				var data= $.extend(true,{},purchaseaudit_config.config.ajax.data);

				$.each([$search_orderNumber,$search_providerName,$search_auditState],function(){
					var text=this.val()||this.find(':selected').val(),
						selector=this.selector.slice(1),
						key=selector.split('_');

					if(text===""){
						if(typeof data[key[1]]!=='undefined'){
							delete data[key[1]];
						}
					}else{
						data[key[1]]=text;
					}

				});
				purchaseaudit_config.config.ajax.data= $.extend(true,{},data);
				getColumnData(purchaseaudit_page,purchaseaudit_config);
			});



			$batch_all_btn.on('change',function () {
				var	$tr=$purchase_audit_list.find('tr'),
					len=$tr.size();

				if(len===0){
					return false;
				}

				var $this=$(this),
					ischeck=$this.is(':checked'),
					i=0,
					$checkbox;

				if(ischeck){
					for(i=0;i<len;i++){
						$checkbox=$tr.eq(i).find('td:first-child input');
						$checkbox.prop({
							'checked':true
						});
					}
				}else{
					for(i=0;i<len;i++){
						$checkbox=$tr.eq(i).find('td:first-child input');
						$checkbox.prop({
							'checked':false
						});
					}
				}
			});



			/*绑定批量审核*/
			if(audit_power){
				$audit_batch_btn.removeClass('g-d-hidei');
				$audit_batch_btn.on('click',function () {
					batchAudit();
				});
			}else{
				$audit_batch_btn.addClass('g-d-hidei');
			}
			


			/*事件绑定*/
			/*绑定查看，修改操作*/
			var operate_item;
			$purchase_audit_wrap.delegate('span','click',function(e){
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
				if(action==='audit'){
					if(operate_item){
						operate_item.removeClass('item-lighten');
						operate_item=null;
					}
					operate_item=$tr.addClass('item-lighten');
					showAudit(id,$tr);
				}else if(action==='select'){
					if(operate_item){
						operate_item.removeClass('item-lighten');
						operate_item=null;
					}
					operate_item=$tr.addClass('item-lighten');
					/*查看详情*/
					detailAudit.call($this,id,$tr);
				}
			});


			/*绑定删除商品*/
			$show_audit_list.on('click','span',function (e) {
				e.stopPropagation();
				e.preventDefault();

				var target= e.target,
					$this,
					action,
					$tr;

				//适配对象
				if(target.className.indexOf('btn')!==-1){
					$this=$(target);
				}else{
					$this=$(target).parent();
				}
				$tr=$this.closest('tr');
				action=$this.attr('data-action');

				/*删除*/
				if(action==='delete'){
					deleteAuditList($tr);
				}
			});
			



			/*绑定关闭详情*/
			$.each([$show_audit_wrap],function () {
				var selector=this.selector;
				this.on('hide.bs.modal',function(){
					if(selector.indexOf('show_audit')!==-1){
						resetAuditList('audit');
					}
					if(operate_item){
						setTimeout(function(){
							operate_item.removeClass('item-lighten');
							operate_item=null;
						},1000);
					}
				});
			});


			/*绑定确定收货单审核*/
			$audit_action.on('click',function () {
				/*是否选择了状态*/
				var applystate=parseInt($audit_radio_wrap.find(':checked').val(),10);
				if(isNaN(applystate)){
					$audit_radio_tip.html('您没有选择审核状态');
					setTimeout(function () {
						$audit_radio_tip.html('');
						$audit_radio_wrap.find('input').eq(0).prop({
							'checked':true
						});
					},2000);
					return false;
				}
				/*是否有id*/
				var id=$admin_id.val();
				if(id===''){
					dia.content('<span class="g-c-bs-warning g-btips-warn">您没有选择需要操作的数据</span>').showModal();
					return false;
				}

				/*是否正常的采购数量*/
				var total=$audit_total.html();
				if(applystate===1){
					/*审核通过*/
					if(total===''||isNaN(total)){
						dia.content('<span class="g-c-bs-warning g-btips-warn">采购数量不合法</span>').showModal();
						return false;
					}
					total=parseInt(total,10);
					if(total===0){
						dia.content('<span class="g-c-bs-warning g-btips-warn">采购数量不能为0</span>').showModal();
						return false;
					}
				}


				/*是否有商品列表*/
				var goodslist=getAuditList();

				if(goodslist===null){
					dia.content('<span class="g-c-bs-warning g-btips-warn">没有商品信息</span>').showModal();
					return false;
				}
				$.ajax({
						url:"http://112.74.207.132:8082/mall-agentbms-api/purchasing/order/audit",
						dataType:'JSON',
						method:'post',
						data:{
							orderId:id,
							roleId:decodeURIComponent(logininfo.param.roleId),
							adminId:decodeURIComponent(logininfo.param.adminId),
							token:decodeURIComponent(logininfo.param.token),
							grade:decodeURIComponent(logininfo.param.grade),
							auditState:applystate,
							orderDetails:goodslist
						}
					})
					.done(function(resp){
						var code=parseInt(resp.code,10);
						if(code!==0){
							console.log(resp.message);
							dia.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"审核失败")+'</span>').show();
							setTimeout(function () {
								dia.close();
							},2000);
							return false;
						}
						dia.content('<span class="g-c-bs-success g-btips-succ">审核成功</span>').show();
						getColumnData(purchaseaudit_page,purchaseaudit_config);
						admin_audit_form.reset();
						resetAuditList('audit');
						setTimeout(function () {
							$show_audit_wrap.modal('hide');
							dia.close();
						},2000);
					})
					.fail(function(resp){
						console.log(resp.message);
						dia.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"审核失败")+'</span>').show();
						setTimeout(function () {
							dia.close();
						},2000);
					});

			});



			/*绑定商品输入过滤*/
			$show_audit_list.on('keyup focusout','input',function (e) {
				var target= e.target,
					etype=e.type,
					$this,
					text='',
					index=0,
					temparr='';

				if(etype==='keyup'){
					/*键盘事件*/
					$this=$(target);
					text=$this.val();
					text=text.replace(/\s*\D*/g,'');
					if(text===''||isNaN(text)){
						text=0;
					}
					$this.val(parseInt(text,10));
				}else if(etype==='focusout'){
					/*鼠标失去焦点事件*/
					totalShow();
				}
			});


		}

		/*清除之前的数据*/
		function resetAuditList(type) {
			/*重置值*/
			if(type==='audit'){
				$admin_id.val('');
				$audit_radio_wrap.find('input').each(function () {
					$(this).prop({
						'checked':false
					});
				});
			 	$audit_radio_tip.html('');
				$show_audit_header.html('');
				$show_audit_list.html('');
				$audit_total.html('0');
			}else if(type==='detail'){

			}else{

			}
		}


		/*特殊字符处理*/
		function chartFilter(str,type) {
			if(type==='on'){
				return str.replace(/'/g,'_dan_').replace(/"/g,'_shuang_').replace(/</g,'_qian_').replace(/\/>/g,'_hou_');
			}else if(type==='off'){
				return str.replace(/_dan_/g,",").replace(/_shuang_/g,'"').replace(/_qian_/g,'<').replace(/_hou_/g,'/>');
			}
		}


		/*获取数据*/
		function getColumnData(page,opt){
			$batch_all_btn.prop({
				'checked':false
			});
			if(table===null){
				table=opt.$purchase_audit_wrap.DataTable(opt.config);
			}else{
				table.ajax.config(opt.config.ajax).load();
			}
		}


		/*删除商品*/
		function deleteAuditList($tr){
			var len=$show_audit_list.find('tr').size();
			if(len===1){
				dia.content('<span class="g-c-bs-warning g-btips-warn">不能删除，至少需要一条商品记录</span>').showModal();
				return false;
			}


			/*确认是否删除*/
			setSure.sure('delete',function(cf){
				/*to do*/
				var tip=cf.dia||dia;
				tip.content('<span class="g-c-bs-success g-btips-succ">删除成功</span>').show();
				$tr.remove();
				totalShow();
				setTimeout(function () {
					tip.close();
				},2000);
			});
		}


		/*获取商品列表*/
		function getAuditList() {
			var result=[],
				$input=$show_audit_list.find('input');

			$input.each(function () {
				var $this=$(this),
					tempname=$this.attr('data-goodsname'),
					tempattr=$this.attr('data-goodsattr'),
					tempgysj=$this.attr('data-gysj'),
					tempgid=$this.attr('data-goodsid'),
					tempattrid=$this.attr('data-goodsattrid'),
					value=$this.val();

				result.push(tempgid+'#'+chartFilter(tempname,'off')+'#'+chartFilter(tempattr,'off')+'#'+value+'#'+tempattrid+'#'+tempgysj);
			});

			return result.length===0?null:JSON.stringify(result);
		}


		/*计算合计*/
		function totalShow() {
			var total=0;
			$show_audit_list.find('input').each(function () {
				total+=parseInt(this.value,10);
			});
			$audit_total.html(total);
		}

		/*查看出库单*/
		function showAudit(id,$tr) {
			if(typeof id==='undefined'){
				return false;
			}

			
			$.ajax({
					url:"http://112.74.207.132:8082/mall-agentbms-api/purchasing/order/details",
					dataType:'JSON',
					method:'post',
					data:{
						id:id,
						roleId:decodeURIComponent(logininfo.param.roleId),
						adminId:decodeURIComponent(logininfo.param.adminId),
						token:decodeURIComponent(logininfo.param.token),
						grade:decodeURIComponent(logininfo.param.grade)
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
					var result=resp.result;
					if(!result){
						return false;
					}

					/*判断是否是审核状态*/
					var state=parseInt(result["auditState"],10),
						statemap={
							0:'待审核',
							1:'审核通过',
							2:'审核未通过'
						};

					/*设置值*/
					$admin_id.val(id);
					$('<td>'+result["orderNumber"]+'</td>\
						<td>'+result["orderTime"]+'</td>\
						'+(function () {
							if(state===0){
								return '<td data-id="'+state+'" class="g-c-bs-info">'+statemap[state]+'</td>';
							}else if(state===1){
								return '<td data-id="'+state+'" class="g-c-bs-success">'+statemap[state]+'</td>';
							}else if(state===2){
								return '<td data-id="'+state+'" class="g-c-gray10">'+statemap[state]+'</td>';
							}else{
								return '<td data-id="-1" class="g-c-red2">异常</td>';
							}
						}())).appendTo($show_audit_header.html(''));



					var list=result['detailsList'],
						str='',
						i=0,
						total=0;

					if(list){
						var len=list.length;
						if(len!==0){
							for(i;i<len;i++){

								var tempaudit=list[i],
									tempid=tempaudit["id"],
									tempgoodsid=tempaudit["goodsId"],
									tempname=tempaudit["goodsName"],
									tempattr=tempaudit["attributeName"],
									tempgysj=typeof tempaudit["supplierPrice"]==='undefined'?'0.00':public_tool.moneyCorrect(tempaudit["supplierPrice"],12,false)[0],
									tempattrid=tempaudit["attributeIds"],
									tempkc=tempaudit["inventoryQuantity"]||0,/*库存数量*/
									tempcg=tempaudit["purchasingQuantlity"]||0/*采购数量*/;


								if(tempgysj===''||isNaN(tempgysj)){
									tempgysj='0.00';
								}
								if(tempkc===''||isNaN(tempkc)){
									tempkc=0;
								}
								if(tempcg===''||isNaN(tempcg)){
									tempcg=0;
								}
								tempkc=parseInt(tempkc,10);
								tempcg=parseInt(tempcg,10);

								total+=tempcg;

								str+='<tr>\
								<td>'+parseInt(i+1,10)+'</td>\
								<td>'+tempname+'</td>\
								<td>'+tempattr+'</td>\
								<td class="g-c-red1">￥:'+tempgysj+'</td>\
								<td>'+tempcg+'</td>\
								<td class="form-group">\
									<input type="text" maxlength="8" class="form-control" data-goodsname="'+chartFilter(tempname,'on')+'" data-gysj="'+tempgysj+'" data-goodsattr="'+chartFilter(tempattr,'on')+'" data-goodsattrid="'+tempattrid+'"  data-goodsid="'+tempgoodsid+'"  data-id="'+tempid+'" data-value="'+tempcg+'" value="0" />\
								</td>\
								<td>'+tempkc+'</td>\
								<td>\
									<span data-action="delete" data-id="'+tempid+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
										<i class="fa-trash"></i>\
										<span>删除</span>\
									</span>\
								</td>\
								</tr>';
							}
							$(str).appendTo($show_audit_list.html(''));
						}
					}else{
						$show_audit_header.html('');
						$show_audit_list.html('');
					}
					/*添加高亮状态*/
					if(operate_item){
						operate_item.removeClass('item-lighten');
						operate_item=null;
					}
					operate_item=$tr.addClass('item-lighten');
					$show_audit_wrap.modal('show',{backdrop:'static'});
				})
				.fail(function(resp){
					console.log(resp.message);
					dia.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
					setTimeout(function () {
						dia.close();
					},2000);
				});
		}


		/*批量审核*/
		function batchAudit() {
			var $tr=$purchase_audit_list.find('tr'),
				listid=[],
				listobj=[],
				len=$tr.size(),
				i=0;

			if(len===0){
				return false;
			}

			for(i;i<len;i++){
				var $tritem=$tr.eq(i),
					$checkbox=$tritem.children().eq(0).find('input'),
					ischeck=$checkbox.is(':checked');

				if(ischeck){
					listid.push($checkbox.val());
					listobj.push($tritem);
				}
			}
			var idlen=listid.length;
			if(idlen===0){
				dia.content('<span class="g-c-bs-warning g-btips-warn">您没有选择需要操作的数据</span>').showModal();
				return false;
			}

			/*to do*/
			/*批处理操作*/


			
		}


		/*查看已审核订单*/
		function detailAudit(id,$tr) {
			if(typeof id==='undefined'){
				return false;
			}
			var self=this,
				subclass=self.children('i').hasClass('fa-angle-down'),
				tabletr=table.row($tr),
				subitem=self.attr('data-subitem');

			if(subclass){
				/*收缩*/
				self.children('i').removeClass('fa-angle-down');
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
							url:"http://112.74.207.132:8082/mall-agentbms-api/purchasing/order/details",
							dataType:'JSON',
							method:'post',
							data:{
								id:id,
								roleId:decodeURIComponent(logininfo.param.roleId),
								adminId:decodeURIComponent(logininfo.param.adminId),
								token:decodeURIComponent(logininfo.param.token),
								grade:decodeURIComponent(logininfo.param.grade)
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
							var result=resp.result;
							if(!result){
								tabletr.child($('<tr><td colspan="6"><table class="table table-bordered table-striped table-hover admin-table" ><tbody class="middle-align"><tr><td class="g-t-c">("暂无数据")</td></tr></tbody></table></td></tr>')).show();
								self.attr({
									'data-subitem':'true'
								}).children('i').addClass('fa-angle-down');
								return false;
							}


							/*判断是否是审核状态*/
							var state=parseInt(result["auditState"],10),
								statemap={
									0:'待审核',
									1:'审核通过',
									2:'审核未通过'
								};


							var list=result['detailsList'],
								i=0,
								total=0,
								kctotal=0,
								newstr='<colgroup>\
									<col class="g-w-percent3" />\
									<col class="g-w-percent16" />\
									<col class="g-w-percent15" />\
									<col class="g-w-percent6" />\
									<col class="g-w-percent5" />\
									<col class="g-w-percent5" />\
								</colgroup>\
								<thead>\
									<tr>\
										<th>序号</th>\
										<th>商品名称</th>\
										<th>商品属性</th>\
										<th>供应商价</th>\
										<th>采购数量</th>\
										<th>库存数量</th>\
									</tr>\
								</thead>',
								res='',
								len=list.length;
							if(len!==0){
								for(i;i<len;i++){
									var tempaudit=list[i],
										tempname=tempaudit["goodsName"],
										tempattr=tempaudit["attributeName"],
										tempgysj=tempaudit["supplierPrice"],
										tempkc=tempaudit["inventoryQuantity"]||0,/*库存数量*/
										tempcg=tempaudit["purchasingQuantlity"]||0/*采购数量*/;

									if(typeof tempgysj==="undefined"||tempgysj===''||isNaN(tempgysj)){
										tempgysj='0.00';
									}
									if(tempkc===''||isNaN(tempkc)){
										tempkc=0;
									}
									if(tempcg===''||isNaN(tempcg)){
										tempcg=0;
									}
									tempkc=parseInt(tempkc,10);
									tempcg=parseInt(tempcg,10);

									total+=tempcg;
									kctotal+=tempkc;

									res+='<tr>\
									<td>'+parseInt(i+1,10)+'</td>\
									<td>'+tempname+'</td>\
									<td>'+tempattr+'</td>\
									<td class="g-c-red1">￥：'+tempgysj+'</td>\
									<td>'+tempcg+'</td>\
									<td>'+tempkc+'</td>\
									</tr>';
								}
								res='<tbody class="middle-align">'+res+'</tbody>\
								<tfoot>\
									<tr>\
										<td colspan="4" class="g-t-r">合计：</td>\
										<td class="g-c-bs-info" >'+total+'</td>\
										<td class="g-c-gray9" >'+kctotal+'</td>\
									</tr>\
								</tfoot>';
							}else{
								res='<tbody class="middle-align"><tr><td colspan="6" class="g-t-c">("暂无数据")</td></tr></tbody>\
								<tfoot>\
									<tr>\
										<td colspan="4" class="g-t-r">合计：</td>\
										<td class="g-c-bs-info" >0</td>\
										<td class="g-c-gray9" >0</td>\
									</tr>\
								</tfoot>';
							}
							newstr='<tr><td colspan="6"><table class="table table-bordered table-striped table-hover admin-table" >'+newstr+res+'</table></td></tr>';
							tabletr.child($(newstr)).show();
							self.attr({
								'data-subitem':'true'
							}).children('i').addClass('fa-angle-down');
						})
						.fail(function(resp){
							console.log(resp.message);
							tabletr.child($('<tr><td colspan="6"><table class="table table-bordered table-striped table-hover admin-table" ><tbody class="middle-align"><tr><td class="g-t-c">("暂无数据")</td></tr></tbody></table></td></tr>')).show();
						});
				}else{
					tabletr.child().show();
					self.children('i').addClass('fa-angle-down');
				}
			}
		}

	});


})(jQuery);