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
			var powermap=public_tool.getPower(99),
				storageshow_power=public_tool.getKeyPower('mall-storage-stats',powermap),
				storageadd_power=public_tool.getKeyPower('mall-storage-add',powermap);



			
			/*dom引用和相关变量定义*/
			var $storage_stats_wrap=$('#storage_stats_wrap')/*表格*/,
				module_id='mall-storage-stats'/*模块id，主要用于本地存储传值*/,
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
				$storage_stats_add=$('#storage_stats_add'),
				$show_add_wrap=$('#show_add_wrap'),
				admin_storagestatsadd_form=document.getElementById('admin_storagestatsadd_form'),
				$admin_storagestatsadd_form=$(admin_storagestatsadd_form),
				admin_storagestatsapply_form=document.getElementById('admin_storagestatsapply_form'),
				$admin_id=$('#admin_id'),
				$admin_inboundNumber=$('#admin_inboundNumber'),
				$admin_inboundType=$('#admin_inboundType'),
				$admin_providerId=$('#admin_providerId'),
				$admin_remark=$('#admin_remark'),
				$show_add_list=$('#show_add_list'),
				$storage_stats_additem=$('#storage_stats_additem'),
				$storage_stats_removeitem=$('#storage_stats_removeitem'),
				$storage_total=$('#storage_total'),
				$show_detail_wrap=$('#show_detail_wrap')/*详情容器*/,
				$show_detail_content=$('#show_detail_content'),/*详情内容*/
				$show_detail_list=$('#show_detail_list'),
				$show_error_tips=$('#show_error_tips'),
				$admin_apply=$('#admin_apply'),
				$storage_apply=$('#storage_apply'),
				$show_detail_action=$('#show_detail_action'),
				resetform0=null,
				goodsmap={
					goodsseqid:[],
					goodsactive:[],
					goodsobj:[]
				},
				sureObj=public_tool.sureDialog(dia)/*回调提示对象*/,
				setSure=new sureObj();


			/*查询对象*/
			var $search_inboundNumber=$('#search_inboundNumber'),
				$admin_search_btn=$('#admin_search_btn'),
				$admin_search_clear=$('#admin_search_clear');



			/*重置表单*/
			admin_storagestatsadd_form.reset();


			/*列表请求配置*/
			var storage_page={
					page:1,
					pageSize:10,
					total:0
				},
				storage_config={
					$storage_stats_wrap:$storage_stats_wrap,
					$admin_page_wrap:$admin_page_wrap,
					config:{
						processing:true,/*大消耗操作时是否显示处理状态*/
						deferRender:true,/*是否延迟加载数据*/
						autoWidth:true,/*是否*/
						paging:false,
						ajax:{
							url:"http://112.74.207.132:8082/mall-agentbms-api/inboundstats/related",
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
								storage_page.page=result.page;
								storage_page.pageSize=result.pageSize;
								storage_page.total=result.count;
								/*分页调用*/
								$admin_page_wrap.pagination({
									pageSize:storage_page.pageSize,
									total:storage_page.total,
									pageNumber:storage_page.page,
									onSelectPage:function(pageNumber,pageSize){
										/*再次查询*/
										var param=storage_config.config.ajax.data;
										param.page=pageNumber;
										param.pageSize=pageSize;
										storage_config.config.ajax.data=param;
										getColumnData(storage_page,storage_config);
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
						order:[[1, "desc" ]],
						columns: [
							{
								"data":"inboundNumber"
							},
							{
								"data":"inboundTime"
							},
							{
								"data":"warehouseName"
							},
							{
								"data":"inboundType",
								"render":function(data, type, full, meta ){
									var itype=parseInt(data,10),
										itypemap={
											1:"采购入库",
											2:"退货入库",
											3:"其他入库"
										},
										str='';

									if(itype===1){
										str='<div class="g-c-gray3">'+itypemap[itype]+'</div>';
									}else if(itype===2){
										str='<div class="g-c-red2">'+itypemap[itype]+'</div>';
									}else if(itype===3){
										str='<div class="g-c-gray9">'+itypemap[itype]+'</div>';
									}
									return str;
								}
							},
							{
								"data":"operator"
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
											2:"审核未通过"
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
										btns='';

									if(storageshow_power){
										btns+='<span data-action="select" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
											<i class="fa-file-text-o"></i>\
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
			getColumnData(storage_page,storage_config);


			/*清空查询条件*/
			$admin_search_clear.on('click',function(){
				$.each([$search_inboundNumber],function(){
					this.val('');
				});
			});
			$admin_search_clear.trigger('click');


			/*联合查询*/
			$admin_search_btn.on('click',function(){
				var data= $.extend(true,{},storage_config.config.ajax.data);

				$.each([$search_inboundNumber],function(){
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
				storage_config.config.ajax.data= $.extend(true,{},data);
				getColumnData(storage_page,storage_config);
			});


			/*获取供应商列表*/
			getProvider();


			/*绑定新增入库*/
			if(storageadd_power){
				$storage_stats_add.removeClass('g-d-hidei');
				$storage_stats_add.on('click',function () {
					$show_add_wrap.modal('show',{backdrop:'static'});
				});
			}else{
				$storage_stats_add.addClass('g-d-hidei');
			}
			


			/*事件绑定*/
			/*绑定查看，修改操作*/
			var operate_item;
			$storage_stats_wrap.delegate('span','click',function(e){
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
				if(action==='select'){
					if(operate_item){
						operate_item.removeClass('item-lighten');
						operate_item=null;
					}
					operate_item=$tr.addClass('item-lighten');
					showStorage(id,$tr);
				}
			});


			/*绑定关闭详情*/
			$.each([$show_add_wrap,$show_detail_wrap],function () {
				this.on('hide.bs.modal',function(){
					if(operate_item){
						setTimeout(function(){
							operate_item.removeClass('item-lighten');
							operate_item=null;
						},1000);
					}
				});
			});


			/*绑定确定收货单审核*/
			$storage_apply.on('click',function () {
				var applystate=parseInt($admin_apply.find(':checked').val(),10);
				if(isNaN(applystate)){
					dia.content('<span class="g-c-bs-warning g-btips-warn">您没有选择审核状态</span>').showModal();
					return false;
				}
				/*to do*/
				var id=$admin_id.val();
				if(id===''){
					dia.content('<span class="g-c-bs-warning g-btips-warn">您没有选择需要操作的数据</span>').showModal();
					return false;
				}

				var $state=$show_detail_content.find('tr td:last-child'),
					state=parseInt($state.attr('data-id'),10);

				if(state===-1||isNaN(state)){
					dia.content('<span class="g-c-bs-warning g-btips-warn">状态异常，不能审核</span>').showModal();
					return false;
				}else if(state===1){
					dia.content('<span class="g-c-bs-warning g-btips-warn">已经审核通过，不能再审核</span>').showModal();
					return false;
				}

				$.ajax({
						url:"http://112.74.207.132:8082/mall-agentbms-api/inboundstats/audit/state",
						dataType:'JSON',
						method:'post',
						data:{
							id:id,
							roleId:decodeURIComponent(logininfo.param.roleId),
							adminId:decodeURIComponent(logininfo.param.adminId),
							token:decodeURIComponent(logininfo.param.token),
							grade:decodeURIComponent(logininfo.param.grade),
							auditState:applystate
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
						getColumnData(storage_page,storage_config);
						admin_storagestatsapply_form.reset();
						setTimeout(function () {
							$show_detail_wrap.modal('hide');
							resetStorageItem('detail');
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


			/*绑定标签选中*/
			$show_add_list.on('click','span',function () {
				var $this=$(this),
					ischeck=$this.hasClass('attrlabel-active');

				if(ischeck){
					$this.removeClass('attrlabel-active');
				}else{
					$this.addClass('attrlabel-active');
				}
			});


			/*绑定添加商品*/
			$storage_stats_additem.on('click',function () {
				addStorageItem();
			});

			/*绑定删除商品*/
			$storage_stats_removeitem.on('click',function () {
				removeStorageItem();
			});


			/*绑定商品选择*/
			$show_add_list.on('change keyup focusout','input',function (e) {
				var target= e.target,
					etype=e.type,
					$this,
					text='',
					index=0,
					temparr='';

				if(etype==='change'){
					/*选中事件*/
					if(target.className.indexOf('goodsid')!==-1){
						$this=$(target);
						text=$this.val();
						if($this.is(':checked')){
							goodsmap.goodsactive.push(text);
							goodsmap.goodsobj.push($this);
						}else{
							temparr=goodsmap.goodsactive;
							index=arrIndex(text,temparr);
							goodsmap.goodsactive.splice(index,1);
							goodsmap.goodsobj.splice(index,1);
						}
					}else{
						return false;
					}
				}else if(etype==='keyup'){
					/*键盘事件*/
					if(target.className.indexOf('goodsnumber')!==-1){
						$this=$(target);
						text=$this.val();
						text=text.replace(/\s*\D*/g,'');
						if(text===''||isNaN(text)){
							text=0;
						}
						$this.val(parseInt(text,10));
					}else{
						return false;
					}
				}else if(etype==='focusout'){
					/*鼠标失去焦点事件*/
					if(target.className.indexOf('goodscode')!==-1){
						/*扫描 to do*/
						getGoodsList($(target));
					}else if(target.className.indexOf('goodsnumber')!==-1){
						totalShow();
					}else{
						return false;
					}
				}
			});

			/*绑定添加地址*/
			/*表单验证*/
			if($.isFunction($.fn.validate)) {
				/*配置信息*/
				var form_opt0={},
					formcache=public_tool.cache,
					basedata={
						roleId:decodeURIComponent(logininfo.param.roleId),
						token:decodeURIComponent(logininfo.param.token),
						adminId:decodeURIComponent(logininfo.param.adminId),
						grade:decodeURIComponent(logininfo.param.grade)
					};


				if(formcache.form_opt_0){
					$.each([formcache.form_opt_0],function(index){
						var formtype,
							config={
								dataType:'JSON',
								method:'post'
							};
						if(index===0){
							formtype='addstoragestats';
						}
						$.extend(true,(function () {
							if(formtype==='addstoragestats'){
								return form_opt0;
							}
						}()),(function () {
							if(formtype==='addstoragestats'){
								return formcache.form_opt_0;
							}
						}()),{
							submitHandler: function(form){

								var setdata={};

								$.extend(true,setdata,basedata);

								if(formtype==='addstoragestats'){
									$.extend(true,setdata,{
										inboundNumber:$admin_inboundNumber.val(),
										inboundType:$admin_inboundType.find(':selected').val(),
										providerId:$admin_providerId.find(':selected').val(),
										remark:$admin_remark.val()
									});

									var goodslist=getStorageItem();

									if(goodslist===null){
										return false;
									}else{
										setdata['goodsDetails']=goodslist;
									}
									config['url']="http://112.74.207.132:8082/mall-agentbms-api/inboundstats/addupdate";
									config['data']=setdata;
								}
								
								$.ajax(config).done(function(resp){
									var code;
									if(formtype==='addstoragestats'){
										code=parseInt(resp.code,10);
										if(code!==0){
											dia.content('<span class="g-c-bs-warning g-btips-warn">入库失败</span>').show();
											return false;
										}else{
											dia.content('<span class="g-c-bs-success g-btips-succ">入库成功</span>').show();
										}
									}

									setTimeout(function () {
										dia.close();
										if(formtype==='addstoragestats'&&code===0){
											/*关闭隐藏*/
											admin_storagestatsadd_form.reset();
											getColumnData(storage_page,storage_config);
											setTimeout(function () {
												$show_add_wrap.modal('hide');
												resetStorageItem('add');
											},1000);
										}
									},1500);
								}).fail(function(resp){
									console.log('error');
								});
								return false;
							}
						});
					});

				}


				/*提交验证*/
				if(resetform0===null){
					resetform0=$admin_storagestatsadd_form.validate(form_opt0);
				}
			}



		}
		
		/*重置界面*/
		function resetStorageItem(type) {
			if(type==='add'){
				$show_add_list.html('');
				$storage_total.html('0');
				$show_error_tips.html('');
				goodsmap.goodsactive.length=0;
				goodsmap.goodsobj.length=0;
				goodsmap.goodsseqid.length=0;
			}else if(type==='detail'){
				$show_detail_content.html('');
				$show_detail_list.html('');
				$admin_apply.find('input').each(function () {
					$(this).prop({
						'checked':false
					});
				});
			}else{
				$show_add_list.html('');
				$storage_total.html('0');
				$show_error_tips.html('');
				goodsmap.goodsactive.length=0;
				goodsmap.goodsobj.length=0;
				goodsmap.goodsseqid.length=0;
				$show_detail_content.html('');
				$show_detail_list.html('');
				$admin_apply.find('input').each(function () {
					$(this).prop({
						'checked':false
					});
				});
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

		/*获取商品列表*/
		function getGoodsList($code) {
			if(!$code){
				return false;
			}
			var key=$code.val(),
				tempkey=$code.attr('data-value');

			/*空数据过滤*/
			if(key===''){
				return false;
			}
			/*防止重复提交*/
			if(tempkey!==''&&tempkey===key){
				return false;
			}
			$code.attr({
				'data-value':key
			});



			$.ajax({
					url:"http://112.74.207.132:8082/mall-agentbms-api/goods/attributes",
					dataType:'JSON',
					method:'post',
					data:{
						gCode:key,
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
						$show_error_tips.html(resp.message+',请重新输入商品编码');
						return false;
					}
					/*是否是正确的返回数据*/
					var result=resp.result;
					if(!result){
						return false;
					}
					$show_error_tips.html('');

					/*设置值*/
					var $tr=$code.closest('tr').children(),
						list=result['list'],
						i=0,
						str='';

					$tr.eq(2).attr({
						'data-id':result['id']
					}).html(result['name']);

					if(list){
						var len=list.length;
						if(len!==0){
							for(i;i<len;i++){
								var labelname=list[i]["name"],
									labelid=list[i]["id"];

								str+='<div class="admin-attrlabel-item1" data-id="'+labelid+'" data-name="'+chartFilter(labelname,"on")+'">';
								var attrlist=list[i]['list'],
									attrlen=attrlist.length,
									j=0;
								for(j;j<attrlen;j++){
									var attrname=attrlist[j]["name"],
										attrid=attrlist[j]["id"];

									str+='<span data-attrid="'+attrid+'" data-attrname="'+chartFilter(attrname,"on")+'" data-labelid="'+labelid+'"  data-labelname="'+chartFilter(labelname,"on")+'" >'+attrname+'</span>';
								}
								str+='</div>';
							}
							$(str).appendTo($tr.eq(3).html(''));
						}
					}
				})
				.fail(function(resp){
					console.log(resp.message);
				});

		}


		/*获取代理商列表*/
		function getProvider(){
			$.ajax({
				url:"http://112.74.207.132:8082/mall-agentbms-api/providers/list",
				dataType:'JSON',
				method:'post',
				data:{
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
					return false;
				}
				/*是否是正确的返回数据*/
				var result=resp.result;
				if(!result){
					return false;
				}

				/*设置值*/
				var list=result['list'],
					i=0,
					str='';

				if(list){
					var len=list.length;
					if(len!==0){
						for(i;i<len;i++){
							if(i===0){
								str+='<option value="'+list[i]["id"]+'" selected >'+list[i]["companyName"]+'</option>';
							}else{
								str+='<option value="'+list[i]["id"]+'">'+list[i]["companyName"]+'</option>';
							}
						}
						$(str).appendTo($admin_providerId.html(''));
					}
				}
			})
			.fail(function(resp){
				console.log(resp.message);
			});
		}


		/*获取数据*/
		function getColumnData(page,opt){
			if(table===null){
				table=opt.$storage_stats_wrap.DataTable(opt.config);
			}else{
				table.ajax.config(opt.config.ajax).load();
			}
		}


		/*添加商品*/
		function addStorageItem(){
			var seqid=(Math.random()).toString().slice(2,15),
				str='<tr>\
						<td>\
							<input type="checkbox" class="goodsid" name="seqid" value="'+seqid+'"/>\
						</td>\
						<td>\
							<input class="form-control goodscode" placeholder="请输入商品编码" data-value="" type="text" />\
						</td>\
						<td data-id=""></td>\
						<td></td>\
						<td>\
							<input class="form-control goodsnumber" maxlength="9" value="0" type="text" data-value="" />\
						</td>\
					</tr>';
			$(str).appendTo($show_add_list);
			goodsmap.goodsseqid.push(seqid);
		}

		/*删除商品*/
		function removeStorageItem(){
			var len=goodsmap.goodsactive.length;
			if(len===0){
				dia.content('<span class="g-c-bs-warning g-btips-warn">您没有选择需要操作的数据</span>').showModal();
				return false;
			}
			/*确认是否删除*/
			setSure.sure('delete',function(cf){
				/*to do*/
				var tip=cf.dia||dia,
					i=len - 1;
				for(i;i>=0;i--){
					goodsmap.goodsseqid.splice(arrIndex(goodsmap.goodsactive[i],goodsmap.goodsseqid),1);
					goodsmap.goodsobj[i].closest('tr').remove();
				}
				goodsmap.goodsactive.length=0;
				goodsmap.goodsobj.length=0;
				tip.content('<span class="g-c-bs-success g-btips-succ">删除成功</span>').show();
				totalShow();
				setTimeout(function () {
					tip.close();
				},2000);
			});
		}



		/*获取商品列表*/
		function getStorageItem() {
			var result=[],
				$tritem=$show_add_list.find('tr'),
				len=$tritem.size();

			if(len===0){
				validStorageItem('tr');
				return null;
			}

			$tritem.each(function () {
				var $tr=$(this).children(),
					id=$tr.eq(2).attr('data-id'),
					name=$tr.eq(2).html(),
					attrobj=resolveLabelAttr($tr),
					attrid=attrobj['id'],
					attrname=attrobj['name'],
					number=$tr.eq(4).find('input').val();

				if(id!==''&&name!==''&&attrname!==''&&attrid!==''){
					result.push(id+'#'+name+'#'+attrname+'#'+number+'#'+attrid);
				}

				if(len===1){
					if(id===''){
						validStorageItem('id');
						return false;
					}else if(name===''){
						validStorageItem('name');
						return false;
					}else if(attrname===''){
						validStorageItem('attrname',$tr);
						return false;
					}else if(attrid===''){
						validStorageItem('attrid',$tr);
						return false;
					}
				}
			});
			return result.length===0?null:JSON.stringify(result);
		}


		/*校验数据合法性并提示信息*/
		function validStorageItem(type,$tr) {
			if(typeof type==='undefined'){
				return false;
			}
			switch (type){
				case 'tr':
					/*没有tr*/
					$show_error_tips.html('没有商品列表，创建商品列表');
					setTimeout(function () {
						$show_error_tips.html('');
						$storage_stats_additem.trigger('click');
						$show_add_list.find('tr').children().eq(1).find('input').select();
					},2000);
					break;
				case 'id':
					/*没有id*/
					$show_error_tips.html('没有商品ID值');
					setTimeout(function () {
						$show_error_tips.html('');
					},2000);
					break;
				case 'name':
					/*没有name*/
					$show_error_tips.html('没有商品名称');
					setTimeout(function () {
						$show_error_tips.html('');
					},2000);
					break;
				case 'attrname':
					/*没有attrname*/
					$show_error_tips.html('没有属性名称或标签名称');
					setTimeout(function () {
						$show_error_tips.html('');
						if($tr){
							setTimeout(function () {
								$tr.eq(3).find('div:first-child span:first-child').trigger('click');
							},100);
						}
					},2000);
					break;
				case 'attrid':
					/*没有attrid*/
					$show_error_tips.html('没有属性ID');
					setTimeout(function () {
						$show_error_tips.html('');
						if($tr){
							setTimeout(function () {
								$tr.eq(3).find('div:first-child span:first-child').trigger('click');
							},100);
						}
					},2000);
					break;
			}
		}


		/*解析标签属性*/
		function resolveLabelAttr($tr) {
			var $attr=$tr.eq(3).find('span.attrlabel-active'),
				tempattr=[],
				tempid=[],
				res={};

			$attr.each(function () {
				var $this=$(this);
				tempattr.push(chartFilter($this.attr('data-labelname'),'off')+':'+chartFilter($this.attr('data-attrname'),'off'));
				tempid.push($this.attr('data-attrid'));
			});
			res['name']=tempattr.join(' ');
			res['id']=tempid.join(',');
			return res;
		}


		/*计算合计*/
		function totalShow() {
			var total=0;
			$show_add_list.find('input.goodsnumber').each(function () {
				total+=parseInt(this.value,10);
			});
			$storage_total.html(total);
		}

		/*查看出库单*/
		function showStorage(id,$tr) {
			$admin_id.val('');
			if(typeof id==='undefined'){
				return false;
			}

			$.ajax({
					url:"http://112.74.207.132:8082/mall-agentbms-api/inboundstats/details",
					dataType:'JSON',
					method:'post',
					data:{
						inboundId:id,
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
					if(state===0||state===2){
						$show_detail_action.removeClass('g-d-hidei');
					}else{
						$show_detail_action.addClass('g-d-hidei');
					}

					/*设置值*/
					$admin_id.val(id);
					$('<tr>\
						<td>'+(result["inboundNumber"]||'')+'</td>\
						<td>'+(result["inboundTime"]||'')+'</td>\
						<td>'+(result["warehouseName"]||'')+'</td>\
						<td>'+(result["providerName"]||'')+'</td>\
						<td>'+(result["remark"]||'')+'</td>\
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
						}())+'</tr>').appendTo($show_detail_content.html(''));



					var list=result['detailsList'],
						str='',
						i=0;

					if(list){
						var len=list.length;
						if(len!==0){
							for(i;i<len;i++){
								var tempstorage=list[i],
									gcode=typeof tempstorage["goodsCode"]==='undefined'?'':tempstorage["goodsCode"];

								str+='<tr>\
								<td>'+parseInt(i+1,10)+'</td>\
								<td>'+gcode+'</td>\
								<td>'+tempstorage["goodsName"]+'</td>\
								<td>'+tempstorage["attributeName"]+'</td>\
								<td>'+tempstorage["quantity"]+'</td>\
								</tr>';
							}
							$(str).appendTo($show_detail_list.html(''));
						}
					}else{
						$show_detail_content.html('');
						$show_detail_list.html('');
					}
					/*添加高亮状态*/
					if(operate_item){
						operate_item.removeClass('item-lighten');
						operate_item=null;
					}
					operate_item=$tr.addClass('item-lighten');
					$show_detail_wrap.modal('show',{backdrop:'static'});
				})
				.fail(function(resp){
					console.log(resp.message);
					dia.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
					setTimeout(function () {
						dia.close();
					},2000);
				});
		}

		/*数组索引*/
		function arrIndex(val,arr) {
			var i=0,
				len=arr.length;
			for(i;i<len;i++){
				if(val===arr[i]){
					return i;
				}
			}
			return -1;
		}
	});


})(jQuery);