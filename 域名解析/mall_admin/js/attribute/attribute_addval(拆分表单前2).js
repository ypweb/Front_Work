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
			var powermap=public_tool.getPower(),
				attradd_power=public_tool.getKeyPower('bzw-attribute-addval',powermap),
				attredit_power=public_tool.getKeyPower('bzw-attribute-edit',powermap),
				attrdelete_power=public_tool.getKeyPower('bzw-goods-attributedelete',powermap);



			/*dom引用和相关变量定义*/
			var module_id='bzw-attribute-addval'/*模块id，主要用于本地存储传值*/,
				$admin_addattr_btn=$('#admin_addattr_btn'),
				$admin_list_wrap=$('#admin_list_wrap'),
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
				$admin_errortip_wrap=$('#admin_errortip_wrap'),
				resetform0=null,
				sureObj=public_tool.sureDialog(dia)/*回调提示对象*/,
				setSure=new sureObj();



			/*新增类弹出框*/
			var $addgoodsattr_wrap=$('#addgoodsattr_wrap'),
				admin_addgoodsattr_form=document.getElementById('admin_addgoodsattr_form'),
				$admin_addgoodsattr_form=$(admin_addgoodsattr_form),
				$admin_itemattr_wrap=$('#admin_itemattr_wrap'),
				$admin_baseattr_wrap=$('#admin_baseattr_wrap'),
				$admin_actiontype=$('#admin_actiontype'),
				$admin_attrparentname=$('#admin_attrparentname'),
				$admin_addattr_tips=$('#admin_addattr_tips'),
				$admin_attrname=$('#admin_attrname'),
				$admin_addattr_already=$('#admin_addattr_already'),
				$admin_addattr_list=$('#admin_addattr_list'),
				$admin_addlabel_tips=$('#admin_addlabel_tips'),
				$admin_labelname=$('#admin_labelname'),
				$admin_addlabel_already=$('#admin_addlabel_already'),
				$admin_addlabel_list=$('#admin_addlabel_list'),
				$admin_attrsort=$('#admin_attrsort');




			/*重置表单*/
			admin_addgoodsattr_form.reset();


			/*根据权限判断显示添加属性按钮*/
			if(attradd_power){
				$admin_addattr_btn.removeClass('g-d-hidei');
			}else{
				$admin_addattr_btn.addClass('g-d-hidei');
			}

			/*请求属性数据*/
			requestAttr({
				type:'base'
			});



			/*绑定新增基本分类*/
			$admin_addattr_btn.on('click',function () {
				goodsAttrAdd({
					type:'base'
				});
			});


			/*绑定操作分类列表*/
			var operate_item;
			$admin_list_wrap.on('click keyup',function (e) {
				var target= e.target,
					etype=e.type,
					nodename=target.nodeName.toLowerCase(),
					$this,
					$li,
					$wrap,
					label,
					id,
					action;

				if(nodename==='td'||nodename==='tr'||nodename==='ul'||nodename==='div'||nodename==='li'){
					return false;
				}

				if(etype==='click'){
					/*点击分支*/
					if(nodename==='span'||nodename==='i'){
						if(nodename==='i'){
							target=target.parentNode;
						}
						if(target.className.indexOf('btn')!==-1){
							/*操作*/
							$this=$(target);
							$li=$this.closest('li');
							id=$li.attr('data-id');
							action=$this.attr('data-action');

							if(operate_item){
								operate_item.removeClass('item-lighten');
								operate_item=null;
							}
							operate_item=$li.addClass('item-lighten');
							/*执行操作*/
							if(action==='edit'){
								/*进入编辑状态*/
								$li.addClass('typeitem-editwrap');
							}else if(action==='cance'){
								/*取消编辑状态*/
								$li.removeClass('typeitem-editwrap');
								/*恢复被修改的数据至没修改之前状态*/
								resetGoodsAttrData($li);
							}else if(action==='confirm'){
								var result=validGoodsAttrData($li);
								if(result===null){
									return false;
								}
								/*提交编辑*/
								setSure.sure('编辑',function(cf){
									/*to do*/
									goodsAttrEdit({
										id:id,
										tip:cf.dia||dia,
										$li:$li,
										result:result
									});
								});
							}else if(action==='delete'){
								/*确认是否启用或禁用*/
								setSure.sure('delete',function(cf){
									/*to do*/
									goodsAttrDelete({
										id:id,
										tip:cf.dia||dia,
										$li:$li
									});
								});
							}else if(action==='add'){
								/*新增分类*/
								label=$li.attr('data-label');
								goodsAttrAdd({
									label:label,
									id:id,
									$li:$li,
									type:"item"
								})
							}
						}else if(target.className.indexOf('main-typeicon')!==-1){
							/*展开或收缩*/
							$this=$(target);
							$wrap=$this.closest('li').find('>ul');
							$this.toggleClass('main-sub-typeicon');
							$wrap.toggleClass('g-d-hidei');
						}
						return false;
					}else if(nodename==='input'){
						if(target.type.indexOf('text')!==-1){
							return false;
						}
					}
				}else if(etype==='keyup'){
					/*键盘分支*/
					if(nodename==='input'){
						/*限制排序输入*/
						if(target.type.indexOf('radio')!==-1){
							return false;
						}
						if(target.attributes.getNamedItem('name').value==='attrsort'){
							target.value=target.value.replace(/\D*/g,'');
						}
					}
				}
			});



			/*绑定显示隐藏新增类型中的已存在编码和名称*/
			$.each([$admin_addattr_already,$admin_addlabel_already],function(){
				var self=this,
					selector=this.selector;

				this.on('click',function(e){
					if(selector.indexOf('addattr')!==-1){
						if($admin_addattr_list.hasClass('g-d-hidei')){
							$admin_addattr_list.removeClass('g-d-hidei');
						}else{
							$admin_addattr_list.addClass('g-d-hidei');
						}
					}else if(selector.indexOf('addlabel')!==-1){
						if($admin_addlabel_list.hasClass('g-d-hidei')){
							$admin_addlabel_list.removeClass('g-d-hidei');
						}else{
							$admin_addlabel_list.addClass('g-d-hidei');
						}
					}
				});

			});



			/*绑定验证是否已经编写存在的分类编码*/
			$.each([$admin_attrname,$admin_labelname],function(){
				var selector=this.selector;
				this.on('focusout',function(){
					var self=this,
						txt=this.value,
						value=public_tool.trims(txt),
						$ul,
						$tip,
						type='';

					if(value!==''){
						if(selector.indexOf('attr')!==-1){
							$ul=$admin_addattr_list;
							$tip=$admin_addattr_tips;
							type='属性';
						}else if(selector.indexOf('label')!==-1){
							$ul=$admin_addlabel_list;
							$tip=$admin_addlabel_tips;
							type='标签';
						}

						if(type!==''){
							$ul.find('li').each(function(){
								var $own=$(this),
									litxt=$own.html();
								if(litxt===value){
									$tip.html('"'+value+'" 已经存在，请填写其他"'+type+'"');
									self.value='';
									$own.addClass('admin-list-widget-active');
									if($ul.hasClass('g-d-hidei')){
										$ul.removeClass('g-d-hidei')
									}
									setTimeout(function () {
										$tip.html('');
										$own.removeClass('admin-list-widget-active');
									},3000);
									return false;
								}
							});
						}
					}
				});
			});


			/*绑定非数字输入*/
			$.each([$admin_attrsort],function () {
				this.on('keyup',function () {
					this.value=this.value.replace(/\D*/g,'');
				});
			});


			/*绑定添加地址*/
			/*表单验证*/
			if($.isFunction($.fn.validate)) {
				/*配置信息*/
				var form_opt0={},
					formcache=public_tool.cache,
					basedata={
						roleId:decodeURIComponent(logininfo.param.roleId),
						adminId:decodeURIComponent(logininfo.param.adminId),
						token:decodeURIComponent(logininfo.param.token)
					};


				if(formcache.form_opt_0){
					$.each([formcache.form_opt_0],function(index){
						var formtype,
							config={
								dataType:'JSON',
								method:'post'
							};
						if(index===0){
							formtype='addgoodsattr';
						}
						$.extend(true,(function () {
							if(formtype==='addgoodsattr'){
								return form_opt0;
							}
						}()),(function () {
							if(formtype==='addgoodsattr'){
								return formcache.form_opt_0;
							}
						}()),{
							submitHandler: function(form){
								var setdata={};

								$.extend(true,setdata,basedata);

								if(formtype==='addgoodsattr'){
									var type=$admin_actiontype.val();
									if(type==='item'){
										$.extend(true,setdata,{
											parentId:$admin_attrparentname.attr('data-value'),
											name:$admin_attrname.val(),
											sort:$admin_attrsort.val()
										});
									}else if(type==='base'){
										$.extend(true,setdata,{
											name:$admin_labelname.val(),
											sort:$admin_attrsort.val(),
										});
									}
									config['url']="../../json/goods/mall_goods_type_all.json";
									config['data']=setdata;
								}

								$.ajax(config).done(function(resp){
									var code;
									if(formtype==='addgoodsattr'){
										code=parseInt(resp.code,10);
										if(code!==0){
											dia.content('<span class="g-c-bs-warning g-btips-warn">添加'+(type==="base"?"标签":"属性")+'失败</span>').show();
											return false;
										}else{
											dia.content('<span class="g-c-bs-success g-btips-succ">添加'+(type==="base"?"标签":"属性")+'成功</span>').show();
											/*请求数据,更新列表*/
											if(type==='base'){
												requestAttr({
													type:type
												});
											}else if(type==='item'){
												requestAttr({
													type:type,
													id:$admin_attrparentname.attr('data-value')
												});
											}
											setTimeout(function () {
												dia.close();
												$addgoodsattr_wrap.modal('hide');
											},2000);
										}
									}
								}).fail(function(resp){
									console.log('error');
									dia.content('<span class="g-c-bs-warning g-btips-warn">添加'+(type==="base"?"标签":"属性")+'失败</span>').show();
									setTimeout(function () {
										dia.close();
										$addgoodsattr_wrap.modal('hide');
									},2000);
								});
								return false;
							}
						});
					});

				}


				/*提交验证*/
				if(resetform0===null){
					resetform0=$admin_addgoodsattr_form.validate(form_opt0);
				}
				
			}


		}


		/*删除操作*/
		function goodsAttrDelete(obj) {
			var id=obj.id;

			if(typeof id==='undefined'||id===''){
				return false;
			}
			var tip=obj.tip,
				$li=obj.$li;

			$.ajax({
					url:"../../json/goods/mall_goods_attr.json",
					dataType:'JSON',
					method:'post',
					data:{
						id:obj.id,
						roleId:decodeURIComponent(logininfo.param.roleId),
						adminId:decodeURIComponent(logininfo.param.adminId),
						token:decodeURIComponent(logininfo.param.token)
					}
				})
				.done(function(resp){
					var code=parseInt(resp.code,10);
					if(code!==0){
						console.log(resp.message);
						tip.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
						setTimeout(function () {
							tip.close();
							if(operate_item){
								operate_item.removeClass('item-lighten');
								operate_item=null;
							}
						},2000);
						return false;
					}
					tip.content('<span class="g-c-bs-success g-btips-succ">删除成功</span>').show();
					setTimeout(function () {
						tip.close();
						setTimeout(function () {
							operate_item=null;
							$li.remove();
						},1000);
					},1000);
				})
				.fail(function(resp){
					console.log(resp.message);
					tip.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
					setTimeout(function () {
						tip.close();
						if(operate_item){
							operate_item.removeClass('item-lighten');
							operate_item=null;
						}
					},2000);
				});
		}

		/*编辑操作*/
		function goodsAttrEdit(obj) {
			var id=obj.id;

			if(typeof id==='undefined'||id===''){
				return false;
			}
			var tip=obj.tip,
				$li=obj.$li;

			$.ajax({
					url:"../../json/goods/mall_goods_type_all.json",
					dataType:'JSON',
					method:'post',
					data:{
						id:obj.id,
						roleId:decodeURIComponent(logininfo.param.roleId),
						adminId:decodeURIComponent(logininfo.param.adminId),
						token:decodeURIComponent(logininfo.param.token)
					}
				})
				.done(function(resp){
					var code=parseInt(resp.code,10);
					if(code!==0){
						console.log(resp.message);
						tip.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
						setTimeout(function () {
							tip.close();
							if(operate_item){
								operate_item.removeClass('item-lighten');
								operate_item=null;
							}
						},2000);
						return false;
					}
					tip.content('<span class="g-c-bs-success g-btips-succ">编辑成功</span>').show();
					/*更新页面数据*/
					updateGoodsAttrDataByEdit($li);
					setTimeout(function () {
						tip.close();
						setTimeout(function () {
							if(operate_item){
								operate_item.removeClass('item-lighten');
								operate_item=null;
								$li.removeClass('typeitem-editwrap');
							}
						},1000);
					},1000);
				})
				.fail(function(resp){
					console.log(resp.message);
					tip.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
					setTimeout(function () {
						tip.close();
						if(operate_item){
							operate_item.removeClass('item-lighten');
							operate_item=null;
						}
					},2000);
				});
		}

		/*新增分类*/
		function goodsAttrAdd(config){
			var type=config.type;
			/*重置表单*/
			admin_addgoodsattr_form.reset();
			/*初始化设置值*/
			if(type==='item'){
				/*项目新增*/
				$admin_itemattr_wrap.removeClass('g-d-hidei');
				$admin_baseattr_wrap.addClass('g-d-hidei');
				$admin_actiontype.val('item');
				/*设置数据*/
				$admin_attrparentname.attr({
					'data-value':config.id
				}).html(config.label);
				searchAttr({
					type:type,
					id:config.id
				});
			}else if(type==='base'){
				/*基本新增*/
				$admin_itemattr_wrap.addClass('g-d-hidei');
				$admin_baseattr_wrap.removeClass('g-d-hidei');
				$admin_actiontype.val('base');
			}else{
				$admin_itemattr_wrap.removeClass('g-d-hidei');
				$admin_baseattr_wrap.addClass('g-d-hidei');
				$admin_actiontype.val('item');
			}
			$addgoodsattr_wrap.modal('show',{
				backdrop:'static'
			});
		}

		/*验证数据状态(编辑状态)*/
		function validGoodsAttrData($li) {
			var $edit=$li.find('>.typeitem-edit'),
				$edititem=$edit.find('.typeitem'),
				i=0,
				len=2,
				result=[];

			for(i;i<len;i++){
				var $item=$edititem.eq(i),
					value='';
				if(i===0||i===1){
					value=$item.find('input').val();
				}
				if(value===''||typeof value==='undefined'){
					tipsGoodsAttrError($admin_errortip_wrap,i);
					break;
				}else{
					result.push(value);
				}
			}
			if(result.length!==len){
				return null;
			}else{
				return JSON.stringify(result);
			}
		}

		/*验证提示信息(编辑状态)*/
		function tipsGoodsAttrError($wrap,type) {
			if(!$wrap){
				$wrap=$admin_errortip_wrap;
			}
			var tips='';
			if(type===0){
				tips='标签(属性)名称没有填写';
			}else if(type===1){
				tips='排序不能为空';
			}
			$wrap.html(tips);
			setTimeout(function () {
				$wrap.html('');
			},3000);
		}

		/*恢复默认(原来)数据(编辑状态)*/
		function resetGoodsAttrData($li){
			var $edit=$li.find('>.typeitem-edit'),
				$edititem=$edit.find('.typeitem'),
				i=0,
				len=2;

			for(i;i<len;i++){
				var $item=$edititem.eq(i),
					oldvalue='',
					$this;
				if(i===0||i===1){
					$this=$item.find('input');
					oldvalue=$this.attr('data-value');
					$this.val(oldvalue);
				}
			}
		}

		/*更新原来值(编辑状态)*/
		function updateGoodsAttrDataByEdit($li){
			var $showwrap=$li.find('>.typeitem-default'),
				$editwrap=$li.find('>.typeitem-edit'),
				$showitem=$showwrap.find('.typeitem'),
				$edititem=$editwrap.find('.typeitem'),
				i=0,
				len=2,
				issub=$li.hasClass('admin-subtypeitem');




			for(i;i<len;i++){
				var $curitem=$edititem.eq(i),
					$this=$curitem.find('input'),
					newvalue=$this.val();

				/*更新值*/
				$this.attr({
					'data-value':newvalue
				});
				if(issub){
					$showitem.eq(i+1).html(newvalue);
				}else{
					$showitem.eq(i).html(newvalue);
				}
			}
		}

		/*解析属性--开始解析*/
		function resolveAttr(obj,limit) {
			if(!obj||typeof obj==='undefined'){
				return false;
			}
			if(typeof limit==='undefined'||limit<=0){
				limit=1;
			}
			var list=obj,
				str='',
				i=0,
				len=list.length,
				layer=1;


			if(typeof len==='undefined'){
				str+=doItems(list,{
					flag:false,
					limit:limit,
					layer:layer
				});
				list=list["attrlist"];
				len=list.length;
			}

			if(len!==0){
				for(i;i<len;i++){
						var curitem=list[i],
						subitem=typeof curitem["attrlist"]==='undefined'?null:curitem["attrlist"];
					if(subitem){
						var tempchild=doAttr(subitem,{
								limit:limit,
								layer:layer
							});

						if(tempchild){
							str+=doItems(curitem,{flag:true,limit:limit,layer:layer})+'<ul class="admin-typeitem-wrap admin-subtype-wrap g-d-hidei">'+tempchild+'</ul>\
						</li>';
						}
					}else{
						str+=doItems(curitem,{
							flag:false,
							limit:limit,
							layer:layer
						});
					}
				}
				return str;
			}else{
				return false;
			}
		}

		/*解析属性--递归解析*/
		function doAttr(obj,config) {
			if(!obj||typeof obj==='undefined'){
				return false;
			}
			var attrlist=obj,
				str='',
				i=0,
				len=attrlist.length;

			var layer=config.layer,
				limit=config.limit;
			if(layer){
				layer++;
			}

			if(limit>=1&&layer>limit){
				return false;
			}

			if(len!==0){
				for(i;i<len;i++){
					var curitem=attrlist[i],
						subitem=typeof curitem["sublist"]==='undefined'?null:curitem["sublist"];
					if(subitem){
						var tempchild=doAttr(subitem,{
							limit:limit,
							layer:layer
						});
						if(tempchild){
							str+=doItems(curitem,{
									flag:true,
									limit:limit,
									layer:layer
								})+'<ul class="admin-typeitem-wrap admin-subtype-wrap g-d-hidei">'+tempchild+'</ul>\
							</li>';
						}
					}else{
						str+=doItems(curitem,{
							flag:false,
							limit:limit,
							layer:layer
						});
					}
				}
				return str;
			}else{
				return false;
			}
		}

		/*解析属性--公共解析*/
		function doItems(obj,config){

			var curitem=obj,
				id=curitem["id"],
				label=curitem["name"],
				str='',
				stredit='',
				flag=config.flag,
				limit=config.limit,
				layer=config.layer;


			if(flag){
				str='<li class="admin-subtypeitem" data-label="'+label+'" data-layer="'+layer+'" data-id="'+id+'">';

				if(layer>1){
					str+='<div class="typeitem-default"><span class="typeitem subtype-mgap'+(layer - 1)+' main-typeicon g-w-percent3"></span>\
							<div class="typeitem subtype-pgap'+layer+' g-w-percent32">'+label+'</div>';
				}else{
					str+='<div class="typeitem-default"><span class="typeitem main-typeicon g-w-percent3"></span>\
							<div class="typeitem g-w-percent32">'+label+'</div>';
				}
			}else{
				str='<li data-label="'+label+'" data-layer="'+layer+'" data-id="'+id+'">';

				if(layer>1){
					str+='<div class="typeitem-default"><div class="typeitem subtype-pgap'+layer+' g-w-percent32">'+label+'</div>';
				}else{
					str+='<div class="typeitem-default"><div class="typeitem g-w-percent32">'+label+'</div>';
				}
			}

			str+='<div class="typeitem g-w-percent5">'+curitem["sort"]+'</div>';


			/*编辑状态*/
			stredit+='<div class="typeitem-edit"><div class="typeitem g-w-percent32"><input type="text" name="attrname" data-value="'+label+'"  placeholder="请输入属性名称" value="'+label+'" /></div>\
								<div class="typeitem g-w-percent5"><input type="text" name="attrsort" data-value="'+curitem["sort"]+'" maxlength="6" value="'+curitem["sort"]+'" /></div>';

			

			str+='<div class="typeitem g-w-percent10">';
			stredit+='<div class="typeitem g-w-percent10">';


			if(attredit_power){
				str+='<span data-action="edit" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
							<i class="fa-pencil"></i>&nbsp;&nbsp;编辑\
						</span>';

				/*编辑状态*/
				stredit+='<span data-action="confirm" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-bs-success">\
									<i class="fa-check"></i>&nbsp;&nbsp;确定\
								</span>\
								<span data-action="cance" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray10">\
									<i class="fa-close"></i>&nbsp;&nbsp;取消\
								</span>';
			}
			if(attradd_power){
				if(flag){
					str+='<span data-action="add" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
							<i class="fa-plus"></i>&nbsp;&nbsp;新增属性\
						</span>';
				}else{
					if(layer<limit){
						str+='<span data-action="add" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
									<i class="fa-plus"></i>&nbsp;&nbsp;新增属性\
								</span>';
					}
				}
			}

			if(attrdelete_power){
				str+='<span data-action="delete" data-id="'+id+'"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
							<i class="fa-trash"></i>&nbsp;&nbsp;删除\
						</span>';
			}

			str+='</div></div>';
			stredit+='</div></div>';

			return flag?str+stredit:str+stredit+'</li>';
		}
		
		/*请求属性*/
		function requestAttr(config){
			$.ajax({
					url:"../../json/goods/mall_goods_attr.json",
					dataType:'JSON',
					method:'post',
					data:{
						roleId:decodeURIComponent(logininfo.param.roleId),
						adminId:decodeURIComponent(logininfo.param.adminId),
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
					var result=resp.result;
					if(result&&result.list){
						/*解析属性*/
						var result='<ul class="admin-typeitem-wrap admin-maintype-wrap">'+resolveAttr(result.list,2)+'</ul>';
						/*初始化标签*/
						if(config){
							var type=config.type;
							if(type==='base'){
								searchAttr({
									type:type,
									dataitem:result.list
								});
							}else if(type==='item'){
								searchAttr({
									type:type,
									id:config.id,
									dataitem:result.list
								});
							}
						}
						if(result){
							$(result).appendTo($admin_list_wrap.html(''));
						}else{
							$admin_list_wrap.addClass('g-t-c').html('暂无数据，请&nbsp;<span class="g-c-info">添加分类</span>');
						}
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

		/*查询标签或属性解析*/
		function doAttrItem(config){
			var dataitem=config['dataitem'],
				type=config['type'],
				id=config['id'],
				str='',
				i=0,
				len=dataitem.length,
				curitem;

			if(type==='base'){
				for(i;i<len;i++){
					curitem=dataitem[i];
					str+='<li data-value="'+curitem["id"]+'">'+curitem["name"]+'</li>';
				}
				return str;
			}else if(type==='item'){
				for(i;i<len;i++){
					curitem=dataitem[i];
					if(parseInt(id,10)===parseInt(curitem["id"],10)){
						dataitem=curitem["attrlist"];
						break;
					}
				}
				len=dataitem.length;
				i=0;
				for(i;i<len;i++){
					curitem=dataitem[i];
					str+='<li data-value="'+curitem["id"]+'">'+curitem["name"]+'</li>';
				}
				return str;
			}
		}

		/*查询标签或属性*/
		function searchAttr(config) {
			var type=config.type;

			if(typeof type==='undefined'){
				return false;
			}
			var id=config.id,
				dataitem=config.dataitem,
				str='';
			if(dataitem){
				if(type==='base'){
					str=doAttrItem({
						type:'base',
						dataitem:dataitem
					});
					$(str).appendTo($admin_addlabel_list.html(''));
				}else if(type==='item'){
					str=doAttrItem({
						type:'base',
						dataitem:dataitem,
						id:id
					});
					$(str).appendTo($admin_addattr_list.html(''));
				}
			}else{
				var baseconfig={
					url:"../../json/goods/mall_goods_attr.json",
					dataType:'JSON',
					method:'post',
					data:{
						roleId:decodeURIComponent(logininfo.param.roleId),
						adminId:decodeURIComponent(logininfo.param.adminId),
						token:decodeURIComponent(logininfo.param.token)
					}
				};
				if(type==='item'){
					baseconfig['data']['id']=id;
				}
				$.ajax(baseconfig)
					.done(function(resp){
						var code=parseInt(resp.code,10);
						if(code!==0){
							console.log(resp.message);
							return false;
						}
						var result=resp.result;
						if(result&&result.list){
							if(type==='base'){
								str=doAttrItem({
									type:type,
									dataitem:result.list
								});
								$(str).appendTo($admin_addlabel_list.html(''));
							}else if(type==='item'){
								str=doAttrItem({
									type:type,
									dataitem:result.list,
									id:id
								});
								$(str).appendTo($admin_addattr_list.html(''));
							}
						}
					})
					.fail(function(resp){
						console.log(resp.message);
					});
			}
		}


	});


})(jQuery);