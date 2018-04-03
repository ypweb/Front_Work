/*admin_member:成员设置*/
(function($,KE){
	'use strict';
	$(function(){
		/*初始化数据*/
		if(public_tool.initMap.isrender){
			/*菜单调用*/
			var logininfo=public_tool.initMap.loginMap;
			public_tool.loadSideMenu(public_vars.$mainmenu,public_vars.$main_menu_wrap,{
				url:'../../json/menu.json',
				async:false,
				type:'post',
				datatype:'json'
			});


			/*清除查看和编辑缓存*/
			public_tool.removeParams('yttx-goods-edit');
			public_tool.removeParams('yttx-goods-detail');



			/*dom引用和相关变量定义*/
			var module_id='yttx-goods-add'/*模块id，主要用于本地存储传值*/,
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
				$admin_id=$('#admin_id'),
				$admin_goodsTypeId_Level1=$('#admin_goodsTypeId_Level1'),
				$admin_goodsTypeId_Level2=$('#admin_goodsTypeId_Level2'),
				$admin_goodsTypeId_Level3=$('#admin_goodsTypeId_Level3'),
				$admin_goodsTypeId_btn=$('#admin_goodsTypeId_btn'),
				$admin_code=$('#admin_code'),
				$admin_name=$('#admin_name'),
				$admin_pricewrap=$('#admin_pricewrap'),
				$admin_attrwrap=$('#admin_attrwrap'),
				$admin_wholesale_price=$('#admin_wholesale_price'),
				$admin_retail_price=$('#admin_retail_price'),
				$admin_inventory=$('#admin_inventory'),
				$admin_color=$('#admin_color'),
				$admin_color_btn=$('#admin_color_btn'),
				$admin_rule=$('#admin_rule'),
				$admin_rule_btn=$('#admin_rule_btn'),
				$admin_color_tips=$('#admin_color_tips'),
				$admin_rule_tips=$('#admin_rule_tips'),
				$admin_wholesale_price_list=$('#admin_wholesale_price_list'),
				$admin_wholesale_tips=$('#admin_wholesale_tips'),
				$admin_isRecommended=$('#admin_isRecommended'),
				$admin_details=$('#admin_details'),
				$admin_status=$('#admin_status'),
				$admin_color_listbtn=$('#admin_color_listbtn'),
				$admin_color_list=$('#admin_color_list'),
				$admin_rule_listbtn=$('#admin_rule_listbtn'),
				$admin_rule_list=$('#admin_rule_list'),
				$admin_color_extendbtn=$('#admin_color_extendbtn'),
				$admin_rule_extendbtn=$('#admin_rule_extendbtn'),
				price_data={},
				attr_data={},
				admin_goodsadd_form=document.getElementById('admin_goodsadd_form'),
				$admin_goodsadd_form=$(admin_goodsadd_form),
				resetform0=null,
				resetform1=null,
				resetform2=null,
				resetform3=null,
				colormap={},
				rulemap={},
				issetprice=false,
				istypeid=null;

			/*新增类弹出框*/
			var $show_addtype_wrap=$('#show_addtype_wrap'),
				$admin_gtCode=$('#admin_gtCode'),
				$admin_typename=$('#admin_typename'),
				$admin_sort=$('#admin_sort'),
				$admin_image=$('#admin_image'),
				$admin_goodsTypeId_addone=$('#admin_goodsTypeId_addone'),
				$admin_goodsTypeId_addtwo=$('#admin_goodsTypeId_addtwo'),
				$admin_addcode_btn=$('#admin_addcode_btn'),
				$admin_addcode_list=$('#admin_addcode_list'),
				$admin_addcode_tips=$('#admin_addcode_tips'),
				admin_addtype_form=document.getElementById('admin_addtype_form'),
				$admin_addtype_form=$(admin_addtype_form);



			/*新增颜色,规格/尺寸 属性*/
			var $show_addcolor_wrap=$('#show_addcolor_wrap'),
				admin_addcolor_form=document.getElementById('admin_addcolor_form'),
				$admin_addcolor_form=$(admin_addcolor_form),
				$admin_addcolor_tips=$('#admin_addcolor_tips'),
				$admin_newcolor=$('#admin_newcolor'),
				$admin_addcolor_btn=$('#admin_addcolor_btn'),
				$admin_addcolor_list=$('#admin_addcolor_list'),
				$show_addrule_wrap=$('#show_addrule_wrap'),
				admin_addrule_form=document.getElementById('admin_addrule_form'),
				$admin_addrule_form=$(admin_addrule_form),
				$admin_addrule_tips=$('#admin_addrule_tips'),
				$admin_newrule=$('#admin_newrule'),
				$admin_addrule_btn=$('#admin_addrule_btn'),
				$admin_addrule_list=$('#admin_addrule_list'),
				typeimage_setsize=200,
				typeimage_resource=[],
				typeimage_read=[];




			var typeobj={
				$typeone:$admin_goodsTypeId_Level1,
				$typetwo:$admin_goodsTypeId_Level2,
				$typethree:$admin_goodsTypeId_Level3,
				$addone:$admin_goodsTypeId_addone,
				$addtwo:$admin_goodsTypeId_addtwo,
				userId:decodeURIComponent(logininfo.param.userId),
				token:decodeURIComponent(logininfo.param.token),
				providerId:decodeURIComponent(logininfo.param.providerId)
			}/*初始化查询查询类型*/



			/*轮播对象*/
			var $admin_slide_image=$('#admin_slide_image'),
				$admin_slide_btnl=$('#admin_slide_btnl'),
				$admin_slide_btnr=$('#admin_slide_btnr'),
				$admin_slide_tool=$('#admin_slide_tool'),
				$admin_slide_view=$('#admin_slide_view'),
				slide_config={
					$slide_tool:$admin_slide_tool,
					$image:$admin_slide_image,
					$btnl:$admin_slide_btnl,
					$btnr:$admin_slide_btnr,
					active:'admin-slide-active',
					len:5
				},
				file_setsize=1024 * 1024,
				file_size=10,
				file_resource=[],
				file_read=[];


			/*编辑器图片上传对象*/
			var $editor_image_toggle=$('#editor_image_toggle'),
				$editor_image_list=$('#editor_image_list'),
				$editor_image_show=$('#editor_image_show'),
				$editor_image_select=$('#editor_image_select'),
				$editor_image_view=$('#editor_image_view'),
				editor_setsize=1024 * 1024 * 2,
				editor_size=20,
				editor_resource=[],
				editor_read=[];


			/*重置表单*/
			admin_goodsadd_form.reset();
			admin_addtype_form.reset();
			admin_addcolor_form.reset();


			/*商品上传预览*/
			$admin_slide_view.on('change',function(e){
				var files = e.target.files,
					image,
					file_realsize= 0,
					len=files.length,
					k=0;

				if($admin_slide_tool.find('li').size()>=file_size){
					dia.content('<span class="g-c-bs-warning g-btips-warn">最多只能上传'+file_size+'张图片</span>').show();
					setTimeout(function(){
						dia.close();
					},3000);
					return false;
				}

				if (files && len > 0) {
					for(k;k<len;k++){
						image = files[k];
						file_realsize=image.size;
						if(file_realsize > file_setsize) {
							dia.content('<span class="g-c-bs-warning g-btips-warn">您选择的文件太大(<span class="g-c-red1"> '+parseInt((file_realsize / 1024)/1024,10)+'mb</span>),不能超过(<span class="g-c-red1"> '+parseInt((file_setsize / 1024)/1024,10)+'mb</span>)</span>').show();
							setTimeout(function(){
								dia.close();
							},3000);
							continue;
						}
						file_resource.push(image);
						(function(){
							var reader=new FileReader();
							reader.readAsBinaryString(image);
							reader.onload=function(){
								file_read.push(reader.result);
								reader=null;
							}
						}());
						var URLOBJ,imgURL;
						try{
							URLOBJ = window.URL || window.webkitURL;
							imgURL = URLOBJ.createObjectURL(image);
							$('<li><img alt="" src="'+imgURL+'" /></li>').appendTo($admin_slide_tool);
						}catch(e){
							console.log('window.URL 对象支持不友好');
							throw(e);
						}
					}
					/*初始化轮播图*/
					goodsSlide.GoodsSlide(slide_config);
				}
			});


			/*编辑器调用*/
			var editor=KE.create("#admin_details",{
				minHeight:'300px',
				height:'300px',
				filterMode :false,
				resizeType:1,/*改变外观大小模式*/
				bodyClass:"ke-admin-wrap",
				items:[
					'source', '|', 'undo', 'redo', '|', 'preview', 'print', 'template', 'code', 'cut', 'copy', 'paste',
					'plainpaste', 'wordpaste', '|', 'justifyleft', 'justifycenter', 'justifyright',
					'justifyfull', 'insertorderedlist', 'insertunorderedlist', 'indent', 'outdent', 'subscript',
					'superscript', 'clearhtml', 'quickformat', 'selectall', '|', 'fullscreen', '/',
					'formatblock', 'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold',
					'italic', 'underline', 'strikethrough', 'lineheight', 'removeformat', '|',
					'table', 'hr', 'emoticons', 'baidumap', 'pagebreak',
					'anchor', 'link', 'unlink', '|', 'about'
				],
				afterBlur:function(){
					/*失去焦点的回调*/
					this.sync();
				}
			});
			editor.html('');
			/*编辑器图片查看*/
			$editor_image_toggle.on('click', function () {
				$editor_image_list.toggleClass('g-d-hidei');
			});
			/*编辑器图片上传预览*/
			$editor_image_view.on('change',function(e){
				var files = e.target.files,
					image,
					editor_realsize= 0,
					len=files.length,
					k=0;

				if($editor_image_show.find('li').size()>=editor_size){
					dia.content('<span class="g-c-bs-warning g-btips-warn">最多只能上传'+editor_size+'张图片</span>').show();
					setTimeout(function(){
						dia.close();
					},3000);
					return false;
				}

				if (files && len > 0) {

					for(k;k<len;k++){
						image = files[k];
						editor_realsize=image.size;
						if(editor_realsize > editor_setsize) {
							dia.content('<span class="g-c-bs-warning g-btips-warn">您选择的文件太大(<span class="g-c-red1"> '+parseInt((editor_realsize / 1024)/1024,10)+'mb</span>),不能超过(<span class="g-c-red1"> '+parseInt((editor_setsize / 1024)/1024,10)+'mb</span>)</span>').show();
							setTimeout(function(){
								dia.close();
							},3000);
							continue;
						}
						editor_resource.push(image);
						(function(){
							var reader=new FileReader();
							reader.readAsDataURL(image);
							reader.onload=function(){
								editor_read.push(reader.result);
								reader=null;
							}
						}());
						var URLOBJ,imgURL;
						try{
							URLOBJ = window.URL || window.webkitURL;
							imgURL = URLOBJ.createObjectURL(image);
							$('<li><div><img alt="" src="'+imgURL+'"></div>&lt;img alt="" src="blob:http:..."&gt;</li>').appendTo($editor_image_show);
							/*资源释放*/
							window.URL.revokeObjectURL(imgURL);
						}catch(e){
							console.log('window.URL 对象支持不友好');
							throw(e);
						}
					}
				}
			});
			/*绑定选中图片*/
			$editor_image_show.on('click','li',function(){
				var $this=$(this);
				if($this.hasClass('editor-image-active')){
					$this.removeClass('editor-image-active')
				}else{
					$this.addClass('editor-image-active')
				}
			});
			/*绑定图片到编辑器*/
			$editor_image_select.on('click',function(){
				var tempitem=[];
				$editor_image_show.find('li').each(function(){
					var $this=$(this),
						index=0;
					if($this.hasClass('editor-image-active')){
						tempitem.push($this);
						index=$this.index();
						console.log(index);
						console.log(editor_read);
						if(index<=editor_read.length - 1){
							editor.appendHtml('<p><img alt="" src="'+editor_read[index]+'" /></p>');
						}
					}
				});
				/*清除class,并释放资源*/
				for(var i= 0;i<tempitem.length;i++){
					tempitem[i].removeClass('editor-image-active');
				}
				tempitem.length=0;
				/*编辑器同步一次*/
				editor.sync();
			});


			/*绑定查询选中*/
			$.each([$admin_goodsTypeId_Level1,$admin_goodsTypeId_Level2,$admin_goodsTypeId_Level3,$admin_goodsTypeId_addone],function(){
				var self=this,
					selector=this.selector,
					hastype=false;

				/*初始化查询一级分类*/
				if(selector.indexOf('1')!==-1){
					hastype=getGoodsTypes('',typeobj,'one',true);
					if(hastype){
						searchAddGoodsTypes($admin_goodsTypeId_addone,true);
					}
				}

				this.on('change',function(){
					var value=$(this).val();
					clearAttrData('attr');
					if(selector.indexOf('1')!==-1){
						if(value===''){
							$admin_goodsTypeId_Level2.html('');
							$admin_goodsTypeId_Level3.html('');
							$admin_attrwrap.addClass('g-d-hidei');
							$admin_pricewrap.removeClass('g-d-hidei');
							istypeid=null;
							return false;
						}
						issetprice=getAttrData(value,typeobj);
						if(issetprice){
							$admin_attrwrap.removeClass('g-d-hidei');
						}else{
							$admin_pricewrap.addClass('g-d-hidei');
						}
						getGoodsTypes(value,typeobj,'two');
					}else if(selector.indexOf('2')!==-1){
						if(value===''){
							$admin_goodsTypeId_Level3.html('');
							issetprice=getAttrData($admin_goodsTypeId_Level1.find('option:selected').val(),typeobj);
							if(issetprice){
								$admin_attrwrap.removeClass('g-d-hidei');
							}else{
								$admin_pricewrap.addClass('g-d-hidei');
							}
							return false;
						}
						istypeid=value;
						issetprice=getAttrData(value,typeobj);
						if(issetprice){
							$admin_attrwrap.removeClass('g-d-hidei');
						}else{
							$admin_pricewrap.addClass('g-d-hidei');
						}
						getGoodsTypes(value,typeobj,'three');
					}else if(selector.indexOf('3')!==-1){
						if(value===''){
							issetprice=getAttrData($admin_goodsTypeId_Level2.find('option:selected').val(),typeobj);
							if(issetprice){
								$admin_attrwrap.removeClass('g-d-hidei');
							}else{
								$admin_pricewrap.addClass('g-d-hidei');
							}
							return false;
						}
						istypeid=value;
						issetprice=getAttrData(value,typeobj);
						if(issetprice){
							$admin_attrwrap.removeClass('g-d-hidei');
						}else{
							$admin_pricewrap.addClass('g-d-hidei');
						}
					}else if(selector.indexOf('one')!==-1){
						searchAddGoodsTypes($admin_goodsTypeId_addone,true);
						if(value===''){
							$admin_goodsTypeId_addtwo.html('');
							return false;
						}
						hastype=getAddGoodsTypes(value,typeobj,'two');
						if(hastype){
							searchAddGoodsTypes($admin_goodsTypeId_addtwo);
						}
					}
				});
			});


			/*绑定价格输入,属性*/
			$.each([$admin_wholesale_price,$admin_retail_price,$admin_inventory],function(){
				/*初始化*/
				var selector=this.selector;

				/*绑定价格格式化*/
				if(selector.indexOf('price')!==-1){
					this.on('keyup',function(e){
						var tempval=this.value,
							result=public_tool.moneyCorrect(tempval,12,true);
						this.value=result[0];
						public_tool.cursorPos(this,result[0],'.');
					});

				}
			});
			$.each([$admin_color,$admin_rule],function(){
				/*初始化*/
				var $input=this.find('input'),
					type=this.selector.indexOf('color')!==-1?'color':'rule',
					selector=$input.attr('name'),
					isvalid=false;


				/*事件绑定*/
				$input.on('focusout',function(){
					var $this=$(this),
						value=$this.val();
					if(value!==''){
						isvalid=validAttrData($this,type);
						if(isvalid){
							attr_data[selector]=value;
							$this.attr({
								'data-value':value
							});
						}
					}else{
						if(typeof attr_data[selector]!=='undefined'){
							var tempvalue=$this.attr('data-value');
							delete attr_data[selector];
							if(tempvalue!==''){
								$this.attr({
									'data-value':''
								});
							}
						}
					}
					if($.isEmptyObject(attr_data)){
						clearAttrData('attr');
					}
				});
			});


			/*绑定新增颜色和规格尺寸*/
			$.each([$admin_color_btn,$admin_rule_btn],function(){
				var self=this,
					iscolor=this.selector.indexOf('color')!==-1?true:false;

				this.on('click',function(){
					var $last=self.parent().prev('input'),
						$input=$last.clone(true).val(''),
						name=iscolor?$input.attr('name').replace('color',''):$input.attr('name').replace('rule','');

					$input.attr({
						'name':iscolor?'color'+(parseInt(name,10)+1):'rule'+(parseInt(name,10)+1)
					}).insertAfter($last);
				});




			});




			/*$admin_color_extendbtn*/
			/*$.ajax({
					url:"http://10.0.5.226:8082/yttx-agentbms-api/agent/view",
					method: 'POST',
					dataType: 'json',
					data:{
						"agentId":id,
						"adminId":decodeURIComponent(logininfo.param.adminId),
						"token":decodeURIComponent(logininfo.param.token)
					}
				})
				.done(function(resp){
					var code=parseInt(resp.code,10);
					if(code!==0){
						/!*回滚状态*!/
						console.log(resp.message);
						dia.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
						setTimeout(function () {
							dia.close();
						},2000);
						return false;
					}
					/!*是否是正确的返回数据*!/
					var list=resp.result,
						str='',
						istitle=false;

					if(!$.isEmptyObject(list)){
						for(var j in list){
							if(j==='serivceStationlist'||j==='serivcestationlist'){
								str+='<tr><th colspan="12" class="g-t-c">管理的服务站</th></tr>';
								var ssl=list[j],
									sslen=ssl.length,
									ssi=0;
								if(sslen!==0){
									for(ssi;ssi<sslen;ssi++){
										str+='<tr><th>服务站'+(parseInt(ssi,10)+10)+':</th><td>'+ssl[ssi]+'</td></tr>';
									}
								}else{
									str+='<tr><td colspan="12">暂无数据</td></tr>';
								}
							}else if(j==='serivceStationStats'||j==='serivcestationstats'){
								str+='<tr><th colspan="12" class="g-t-c">销售情况</th></tr>';
								var sss=list[j],
									ssslen=sss.length,
									sssj=0;
								if(ssslen!==0){
									var tempmap={
										shortName:"服务站",
										agentShortName:"所属代理",
										agentRelated:"代理关系",
										Inventory:"库存",
										monthSales:"本月销售",
										Sales:"总计销售"
									};
									for(sssj;sssj<ssslen;sssj++){
										var tempobj=sss[sssj];
										if(!$.isEmptyObject(tempobj)){
											str+='<tr>';
											for(var k in tempobj){
												if(typeof tempmap[k]!=='undefined'){
													str+='<th>'+tempmap[k]+':</th><td>'+tempobj[k]+'</td>';
												}else{
													str+='<th>'+k+':</th><td>'+tempobj[k]+'</td>';
												}
											}
											str+='</tr>';
										}
									}
								}else{
									str+='<tr><td colspan="12">暂无数据</td></tr>';
								}
							}else{
								if(typeof detail_map[j]!=='undefined'){
									if(j==='fullName'||j==='fullname'){
										istitle=true;
										$show_detail_title.html('"<span class="g-c-info">'+list[j]+'</span>"代理商详情信息');
									}else if(j==='grade'){
										var gradestr=parseInt(list[j],10);
										if(gradestr===1){
											str+='<tr><th colspan="4">'+detail_map[j]+':</th><td colspan="8">A</td></tr>';
										}else if(gradestr===2){
											str+='<tr><th colspan="4">'+detail_map[j]+':</th><td colspan="8">AA</td></tr>';
										}else if(gradestr===3){
											str+='<tr><th colspan="4">'+detail_map[j]+':</th><td colspan="8">AAA</td></tr>';
										}
									}else{
										str+='<tr><th colspan="4">'+detail_map[j]+':</th><td colspan="8">'+list[j]+'</td></tr>';
									}
								}else{
									str+='<tr><th colspan="4">'+j+':</th><td colspan="8">'+list[j]+'</td></tr>';
								}

							}


						};
						if(!istitle){
							$show_detail_title.html('服务站详情信息');
						}
					}

					/!*添加高亮状态*!/
					if(operate_item){
						operate_item.removeClass('item-lighten');
						operate_item=null;
					}
					operate_item=$tr.addClass('item-lighten');

					$show_detail_content.html(str);
					$show_detail_wrap.modal('show',{
						backdrop:'static'
					});
				})
				.fail(function(resp){
					$show_detail_content.html('');
					$show_detail_title.html('');
					console.log(resp.message);
					dia.content('<span class="g-c-bs-warning g-btips-warn">'+(resp.message||"操作失败")+'</span>').show();
					setTimeout(function () {
						dia.close();
					},2000);
				});*/


			/*绑定查看属性列表*/
			$.each([$admin_color_listbtn,$admin_rule_listbtn],function(){

				var iscolor=this.selector.indexOf('color')!==-1?true:false;

				this.on('click',function(){
					if(iscolor){
						if($admin_color_list.hasClass('g-d-hidei')){
							$admin_color_list.removeClass('g-d-hidei');
						}else{
							$admin_color_list.addClass('g-d-hidei');
						}
					}else {
						if($admin_rule_list.hasClass('g-d-hidei')){
							$admin_rule_list.removeClass('g-d-hidei');
						}else{
							$admin_rule_list.addClass('g-d-hidei');
						}
					}
				});



			});


			/*绑定选择属性列表*/
			$.each([$admin_color_list,$admin_rule_list],function(){

				var self=this,
					iscolor=this.selector.indexOf('color')!==-1?true:false;

				this.on('click','li',function(){
					var $this=$(this),
						txt=$this.html(),
						count=0,
						size,
						$input;


					if($this.hasClass('admin-list-widget-active')){
						$this.removeClass('admin-list-widget-active');
						$input=iscolor?$admin_color.find('input'):$admin_rule.find('input');
						$input.each(function(){
							var $self=$(this);
							if($self.val()===txt){
								$self.val('');
								delete attr_data[$self.attr('name')];
								$self.attr({'data-value':''});
								return false;
							}
						});
					}else{
						$this.addClass('admin-list-widget-active');

						if($.isEmptyObject(attr_data)){
							$input=iscolor?$admin_color.find('input:first-child'):$admin_rule.find('input:first-child');
							$input.val(txt);
							attr_data[$input.attr('name')]=txt;
							$input.attr({'data-value':txt});
						}else{
							$input=iscolor?$admin_color.find('input'):$admin_rule.find('input');
							size=$input.size();
							$input.each(function(){
								var $self=$(this);
								if($self.val()===''){
									$self.val(txt);
									attr_data[$self.attr('name')]=txt;
									$self.attr({'data-value':txt});
									return false;
								}
								count++;
							});
							if(count===size){
								var $lastinput=$input.eq(size-1),
									lasttxt=$lastinput.val(),
									lastname=$lastinput.attr('name');
								self.find('li.admin-list-widget-active').each(function(){
									var $templi=$(this),
										temptxt=$templi.html();
									if(lasttxt===temptxt){
										$templi.removeClass('admin-list-widget-active');
										delete attr_data[lastname];
										$lastinput.attr({'data-value':''});
										return false;
									}
								});
								$lastinput.val(txt);
								attr_data[lastname]=txt;
								$lastinput.attr({'data-value':txt});
							}
						}
					}


					/*组合条件*/
					groupCondition();
				});

			});


			/*绑定表格输入限制*/
			$admin_wholesale_price_list.delegate('input[type="text"]','keyup focusout',function(e){
				var $this=$(this),
					etype= e.type,
					name=$this.attr('name'),
					value=$this.val(),
					result,
					self=this;

				if(etype==='keyup'){
					if(name==="setinventory"){
						result=value.replace(/\D*/g,'');
						$this.val(result);
					}else if(name==="setwholesalePrice"){
						/*错误状态下禁止输入*/
						if($this.hasClass('g-c-red1')){
							return false;
						}
						result=public_tool.moneyCorrect(value,12,true);
						$this.val(result[0]);
						public_tool.cursorPos(this,result[0],'.');
					}else if(name==="setretailPrice"){
						if($this.hasClass('g-c-red1')){
							return false;
						}
						result=public_tool.moneyCorrect(value,12,true);
						$this.val(result[0]);
						public_tool.cursorPos(this,result[0],'.');
					}
				}else if(etype==='focusout'){
					if(name==="setwholesalePrice"){
						/*错误状态下禁止输入*/
						if($this.hasClass('g-c-red1')){
							return false;
						}
						var maxvalue=$this.parent().next().find('input[type="text"]').val();

						result=public_tool.moneyCorrect(value,12,true);

						if(maxvalue!==''&&result[0]!==''){
							maxvalue=public_tool.trimSep(maxvalue,',') * 100;
							var whole=public_tool.trimSep(result[0],',') * 100;
							if(whole>maxvalue){
								$this.addClass('g-c-red1');
								$admin_wholesale_tips.html('"批发价"不能大于"建议零售价"');
								whole=maxvalue / 100;
								result=public_tool.moneyCorrect(whole,12,true);
								setTimeout(function(){
									$this.removeClass('g-c-red1');
									$admin_wholesale_tips.html('');
									$this.val(result[0]);
									public_tool.cursorPos(self,result[0],'.');
								},3000);
							}
						}

					}else if(name==="setretailPrice"){
						/*错误状态下禁止输入*/
						if($this.hasClass('g-c-red1')){
							return false;
						}
						var minvalue=$this.parent().prev().find('input[type="text"]').val();
						result=public_tool.moneyCorrect(value,12,true);

						if(minvalue!==''&&result[0]!==''){
							minvalue=public_tool.trimSep(minvalue,',') * 100;
							var retail=public_tool.trimSep(result[0],',') * 100;
							if(retail<minvalue){
								$this.addClass('g-c-red1');
								$admin_wholesale_tips.html('"建议零售价"不能小于"批发价"');
								retail=minvalue / 100;
								result=public_tool.moneyCorrect(retail,12,true);
								setTimeout(function(){
									$this.removeClass('g-c-red1');
									$admin_wholesale_tips.html('');
									$this.val(result[0]);
									public_tool.cursorPos(self,result[0],'.');
								},3000);
							}
						}

					}
				}

			});



			/*绑定轮播图*/
			goodsSlide.GoodsSlide(slide_config);



			/*绑定新增类型*/
			$.each([$admin_goodsTypeId_btn,$admin_color_extendbtn,$admin_rule_extendbtn],function(){
				var self=this,
					selector=this.selector;

				if(selector.indexOf('goodsTypeId')!==-1){
					this.on('click',function(){
						$show_addtype_wrap.modal('show',{
							backdrop:'static'
						});
					});
				}else if(selector.indexOf('color')!==-1){
					this.on('click',function(){
						$show_addcolor_wrap.modal('show',{
							backdrop:'static'
						});
					});
				}else if(selector.indexOf('rule')!==-1){
					this.on('click',function(){
						$show_addrule_wrap.modal('show',{
							backdrop:'static'
						});
					});
				}



			});


			/*类型图片上传预览*/
			$admin_image.on('change',function(e){
				var files = e.target.files,
					image,
					typeimage_realsize= 0,
					len=files.length,
					k=0;

				if (files && len > 0) {
					typeimage_resource.length=0;
					typeimage_read.length=0;
					for(k;k<len;k++){
						image = files[k];
						typeimage_realsize=parseInt((image.size / 1024),10);
						if(typeimage_realsize > typeimage_setsize) {
							dia.content('<span class="g-c-bs-warning g-btips-warn">您选择的文件太大(<span class="g-c-red1"> '+typeimage_realsize+'kb</span>),不能超过(<span class="g-c-red1"> '+typeimage_setsize+'kb</span>)</span>').show();
							setTimeout(function(){
								dia.close();
							},3000);
							continue;
						}

						typeimage_resource.push(image);
						var reader=new FileReader();
						reader.readAsDataURL(image);
						reader.onload=function(){
							typeimage_read.push(reader.result);
							reader=null;
						}
					}
				}
			});



			/*绑定显示隐藏新增类型中的已存在编码和名称*/
			$.each([$admin_addcode_btn,$admin_addcolor_btn,$admin_addrule_btn],function(){
				var self=this,
					selector=this.selector;

				this.on('click',function(e){
					if(selector.indexOf('addcode')!==-1){
						if($admin_addcode_list.hasClass('g-d-hidei')){
							$admin_addcode_list.removeClass('g-d-hidei');
						}else{
							$admin_addcode_list.addClass('g-d-hidei');
						}
					}else if(selector.indexOf('addcolor')!==-1){
						if($admin_addcolor_list.hasClass('g-d-hidei')){
							$admin_addcolor_list.removeClass('g-d-hidei');
						}else{
							$admin_addcolor_list.addClass('g-d-hidei');
						}
					}else if(selector.indexOf('addrule')!==-1){
						if($admin_addrule_list.hasClass('g-d-hidei')){
							$admin_addrule_list.removeClass('g-d-hidei');
						}else{
							$admin_addrule_list.addClass('g-d-hidei');
						}
					}
				});

			});



			/*绑定验证是否已经编写存在的分类编码*/
			$.each([$admin_gtCode,$admin_newcolor,$admin_newrule],function(){
				var own=this,
					selector=this.selector;

				this.on('focusout',function(){
					var self=this,
						txt=this.value,
						value=public_tool.trims(txt);

					if(value!==''){
						if(selector.indexOf('gtCode')!==-1){
							$admin_addcode_list.find('li').each(function(){
								if(this.innerHTML===value){
									$admin_addcode_tips.html('"'+value+'" 已经存在，请填写其他"分类编码"');
									self.value='';
									setTimeout(function () {
										$admin_addcode_tips.html('');
									},3000);
									return false;
								}
							});
						}else if(selector.indexOf('color')!==-1){
							$admin_addcolor_list.find('li').each(function(){
								if(this.innerHTML===value){
									$admin_addcolor_tips.html('"'+value+'" 已经存在，请填写其他"颜色"');
									self.value='';
									setTimeout(function () {
										$admin_addcolor_tips.html('');
									},3000);
									return false;
								}
							});
						}else if(selector.indexOf('rule')!==-1){
							$admin_addrule_list.find('li').each(function(){
								if(this.innerHTML===value){
									$admin_addrule_tips.html('"'+value+'" 已经存在，请填写其他"规格/尺寸"');
									self.value='';
									setTimeout(function () {
										$admin_addrule_tips.html('');
									},3000);
									return false;
								}
							});
						}
					}
				});
			});



			/*绑定添加地址*/
			/*表单验证*/
			if($.isFunction($.fn.validate)) {
				/*配置信息*/
				var form_opt0={},
					form_opt1={},
					form_opt2={},
					form_opt3={},
					formcache=public_tool.cache,
					basedata={
						userId:decodeURIComponent(logininfo.param.userId),
						token:decodeURIComponent(logininfo.param.token),
						providerId:decodeURIComponent(logininfo.param.providerId)
					};


				if(formcache.form_opt_0 && formcache.form_opt_1 && formcache.form_opt_2 && formcache.form_opt_3){
					$.each([formcache.form_opt_0,formcache.form_opt_1,formcache.form_opt_2,formcache.form_opt_3],function(index){
						var formtype,
						config={
							dataType:'JSON',
							method:'post'
						};
						if(index===0){
							formtype='addgoods';
						}else if(index===1){
							formtype='addtype';
						}else if(index===2){
							formtype='addcolor';
						}else if(index===3){
							formtype='addrule';
						}
						$.extend(true,(function () {
							if(formtype==='addgoods'){
								return form_opt0;
							}else if(formtype==='addtype'){
								return form_opt1;
							}else if(formtype==='addcolor'){
								return form_opt2;
							}else if(formtype==='addrule'){
								return form_opt3;
							}
						}()),(function () {
							if(formtype==='addgoods'){
								return formcache.form_opt_0;
							}else if(formtype==='addtype'){
								return formcache.form_opt_1;
							}else if(formtype==='addcolor'){
								return formcache.form_opt_2;
							}else if(formtype==='addrule'){
								return formcache.form_opt_3;
							}
						}()),{
							submitHandler: function(form){
								var setdata={};

								$.extend(true,setdata,basedata);

								if(formtype==='addgoods'){
									$.extend(true,setdata,{
										code:$admin_code.val(),
										name:$admin_name.val(),
										isRecommended:$admin_isRecommended.find(':selected')?true:false,
										status:$admin_status.find(':selected').val(),
										goodsBrandId:1,
										goodsTypeId:istypeid,
										details:$admin_details.val(),
										goodsPictures1:$admin_slide_view.val()||file_read
									});
									if(issetprice){
										setdata['attrIventoryPrices']=getSetPrice();
									}else{
										setdata['attrIventoryPrices']=[$admin_inventory.val()+'#'+$admin_wholesale_price.val()+'#'+$admin_retail_price.val()];
									}
									config['url']="http://10.0.5.226:8082/yttx-providerbms-api/goods/addupdate";
									config['data']=setdata;
								}else if(formtype==='addtype'){
									$.extend(true,setdata,{
										gtCode:$admin_gtCode.val(),
										name:$admin_typename.val(),
										sort:$admin_sort.val(),
										image:typeimage_read[0]||''
									});
									var parentid=$admin_goodsTypeId_addone.find('option:selected').val(),
										parentid2='';
									if(parentid===''){
										if(typeof setdata['parentId2']!=='undefined'){
											delete setdata['parentId'];
										}
										if(typeof setdata['parentId2']!=='undefined'){
											delete setdata['parentId2'];
										}
									}else{
										setdata['parentId']=parentid;
										parentid2=$admin_goodsTypeId_addtwo.find('option:selected').val();
										if(parentid2!==''){
											setdata['parentId2']=parentid2;
										}else{
											if(typeof setdata['parentId2']!=='undefined'){
												delete setdata['parentId2'];
											}
										}
									}
									config['url']="http://10.0.5.226:8082/yttx-providerbms-api/goodstype/add";
									config['data']=setdata;
								}else if(formtype==='addcolor'){
									$.extend(true,setdata,{
										newAttrs:$admin_newcolor.val(),
										goodsTypeId:istypeid,
										tagId:'4'
									});
									config['url']="http://10.0.5.226:8082/yttx-providerbms-api/goods/tag/attr/add";
									config['data']=setdata;
								}else if(formtype==='addrule'){
									$.extend(true,setdata,{
										newAttrs:$admin_newrule.val(),
										goodsTypeId:istypeid,
										tagId:'5'
									});
									config['url']="http://10.0.5.226:8082/yttx-providerbms-api/goods/tag/attr/add";
									config['data']=setdata;
								}

								$.ajax(config).done(function(resp){
									var code;
									if(formtype==='addgoods'){
										code=parseInt(resp.code,10);
										if(code!==0){
											dia.content('<span class="g-c-bs-warning g-btips-warn">添加商品失败</span>').show();
											return false;
										}else{
											dia.content('<span class="g-c-bs-success g-btips-succ">添加商品成功</span>').show();
										}
									}else if(formtype==='addtype'){
										console.log(resp);
										/*code=parseInt(resp.code,10);
										if(code!==0){
											dia.content('<span class="g-c-bs-warning g-btips-warn">添加商品分类失败</span>').show();
											return false;
										}else{
											dia.content('<span class="g-c-bs-success g-btips-succ">添加商品类型成功</span>').show();
										}*/

									}else if(formtype==='addcolor'){
										if(resp.attrs.length!==0){
											dia.content('<span class="g-c-bs-success g-btips-succ">添加商品颜色属性成功</span>').show();
										}else{
											dia.content('<span class="g-c-bs-warning g-btips-warn">添加商品颜色属性失败</span>').show();
											return false;
										}

									}else if(formtype==='addrule'){
										if(resp.attrs.length!==0){
											dia.content('<span class="g-c-bs-success g-btips-succ">添加商品规格/尺寸成功</span>').show();
										}else{
											dia.content('<span class="g-c-bs-warning g-btips-warn">添加商品规格/尺寸失败</span>').show();
											return false;
										}

									}


									setTimeout(function () {
										dia.close();
										if(formtype==='addgoods'){
											/*页面跳转*/
											location.href='yttx-goods-manage.html';
										}else if(formtype==='addtype'||formtype==='addcolor'||formtype==='addrule'){
											/*重新加载*/
											location.reload();
										}
									},2000);
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
					resetform0=$admin_goodsadd_form.validate(form_opt0);
				}
				if(resetform1===null){
					resetform1=$admin_addtype_form.validate(form_opt1);
				}
				if(resetform2===null){
					resetform2=$admin_addcolor_form.validate(form_opt2);
				}
				if(resetform3===null){
					resetform3=$admin_addrule_form.validate(form_opt3);
				}

			}



		}


		/*级联类型查询*/
		function getGoodsTypes(value,obj,type,extend){
			var typemap={
				'one':'一级',
				'two':'二级',
				'three':'三级'
			},istype=false;

			$.ajax({
				url:"http://10.0.5.226:8082/yttx-providerbms-api/goodstypes",
				dataType:'JSON',
				async:false,
				method:'post',
				data:{
					userId:obj.userId,
					token:obj.token,
					providerId:obj.providerId,
					parentId:value
				}
			}).done(function(resp){
				var code=parseInt(resp.code,10);
				if(code!==0){
					if(code===999){
						/*清空缓存*/
						public_tool.clear();
						public_tool.clearCacheData();
						public_tool.loginTips();
					}
					console.log(resp.message);
					istype=false;
					return false;
				}

				var result=resp.result.parentTypesList,
					len=result.length,
					i= 0,
					str='';

				if(!result){
					istype=false;
					return false;
				}

				if(len!==0){
					istype=true;
					var auto_selected=null,auto_str=[];
					for(i;i<len;i++){
						if(i===0){
							if(type==='one'){
								auto_selected=result[i]["id"]||null;
								auto_str.push(result[i]["id"],result[i]["name"]);
							}else{
								str+='<option value="" selected >请选择'+typemap[type]+'分类</option><option value="'+result[i]["id"]+'" >'+result[i]["name"]+'</option>';
							}
						}else{
							str+='<option value="'+result[i]["id"]+'" >'+result[i]["name"]+'</option>';
						}
					}
					if(type==='one'){
						if(extend){
							$('<option value="'+auto_str[0]+'" selected >'+auto_str[1]+'</option>'+str).appendTo(obj.$typeone.html(''));
							$('<option value="" selected >请选择'+typemap[type]+'分类</option><option value="'+auto_str[0]+'" >'+auto_str[1]+'</option>'+str).appendTo(obj.$addone.html(''));
						}else{
							$('<option value="'+auto_str[0]+'" selected >'+auto_str[1]+'</option>'+str).appendTo(obj.$typeone.html(''));
						}
						if(auto_selected!==null){
							istypeid=auto_selected;
							clearAttrData('price');
							$admin_attrwrap.removeClass('g-d-hidei');
							$admin_pricewrap.addClass('g-d-hidei');
							issetprice=getAttrData(auto_selected,obj);
							if(issetprice){
								$admin_attrwrap.removeClass('g-d-hidei');
							}else{
								$admin_pricewrap.addClass('g-d-hidei');
							}
							getGoodsTypes(auto_selected,obj,'two');
						}else{
							clearAttrData('attr');
							$admin_attrwrap.addClass('g-d-hidei');
							$admin_pricewrap.removeClass('g-d-hidei');
						}
					}else if(type==='two'){
						$(str).appendTo(obj.$typetwo.html(''));
					}else if(type==='three'){
						$(str).appendTo(obj.$typethree.html(''));
					}
				}else{
					console.log(resp.message||'error');
					istype=false;
					if(type==='one'){
						obj.$typeone.html('');
						obj.$typetwo.html('');
						obj.$typethree.html('');
					}else if(type==='two'){
						obj.$typetwo.html('');
						obj.$typethree.html('');
					}else if(type==='three'){
						obj.$typethree.html('');
					}
					return false;
				}
			}).fail(function(resp){
				istype=false;
				console.log(resp.message||'error');
				if(type==='one'){
					obj.$typeone.html('');
					obj.$typetwo.html('');
					obj.$typethree.html('');
				}else if(type==='two'){
					obj.$typetwo.html('');
					obj.$typethree.html('');
				}else if(type==='three'){
					obj.$typethree.html('');
				}
			});
			return istype;
		}


		/*级联类型查询(新增分类)*/
		function getAddGoodsTypes(value,obj,type){
			var typemap={
				'one':'一级',
				'two':'二级',
				'three':'三级'
			},istype=false;

			$.ajax({
				url:"http://10.0.5.226:8082/yttx-providerbms-api/goodstypes",
				dataType:'JSON',
				async:false,
				method:'post',
				data:{
					userId:obj.userId,
					token:obj.token,
					providerId:obj.providerId,
					parentId:value
				}
			}).done(function(resp){
				var code=parseInt(resp.code,10);
				if(code!==0){
					if(code===999){
						/*清空缓存*/
						public_tool.clear();
						public_tool.clearCacheData();
						public_tool.loginTips();
					}
					console.log(resp.message);
					istype=false;
					return false;
				}

				var result=resp.result.parentTypesList,
					len=result.length,
					i= 0,
					str='';

				if(!result){
					istype=false;
					return false;
				}

				if(len!==0){
					istype=true;
					for(i;i<len;i++){
						if(i===0){
							str+='<option value="" selected >请选择'+typemap[type]+'分类</option><option value="'+result[i]["id"]+'" >'+result[i]["name"]+'</option>';
						}else{
							str+='<option value="'+result[i]["id"]+'" >'+result[i]["name"]+'</option>';
						}
					}
					if(type==='one'){
						$(str).appendTo(obj.$addone.html(''));
					}else if(type==='two'){
						$(str).appendTo(obj.$addtwo.html(''));
					}
				}else{
					console.log(resp.message||'error');
					istype=false;
					if(type==='one'){
						obj.$addone.html('');
						obj.$addtwo.html('');
					}else if(type==='two'){
						obj.$addtwo.html('');
					}
					return false;
				}
			}).fail(function(resp){
				istype=false;
				console.log(resp.message||'error');
				if(type==='one'){
					obj.$addone.html('');
					obj.$addtwo.html('');
				}else if(type==='two'){
					obj.$addtwo.html('');
				}
			});
			return istype;
		}


		/*在新增类型中查询已经获取的类型*/
		function searchAddGoodsTypes(wrap,flag){
			var add_selected='';
			wrap.find('option').each(function(e){
				var txt=this.value;
				if(txt!==''){
					add_selected+='<li>'+txt+'</li>';
				}
			});
			if(add_selected!==''){
				if(flag){
					$(add_selected).appendTo($admin_addcode_list.html(''));
				}else{
					$(add_selected).appendTo($admin_addcode_list);
				}
			}
		}



		/*清空属性数据*/
		function clearAttrData(type){
			if(!type){
				attr_data={};
				price_data={};
				colormap={};
				rulemap={};
				$admin_color.find('input').val('').attr({'data-value':''});
				$admin_rule.find('input').val('').attr({'data-value':''});
				$admin_wholesale_price.val('');
				$admin_retail_price.val('');
				$admin_inventory.val('');
				$admin_pricewrap.removeClass('g-d-hidei');
				$admin_attrwrap.removeClass('g-d-hidei');
				$admin_wholesale_price_list.html('').addClass('g-d-hidei');
				$admin_color_list.html('');
				$admin_rule_list.html('');
			}else if(type==='price'){
				price_data={};
				$admin_wholesale_price.val('');
				$admin_retail_price.val('');
				$admin_inventory.val('');
			}else if(type==='attr'){
				attr_data={};
				colormap={};
				rulemap={};
				$admin_color.find('input').val('').attr({'data-value':''});
				$admin_rule.find('input').val('').attr({'data-value':''});
				$admin_wholesale_price_list.html('').addClass('g-d-hidei');
				$admin_color_list.html('');
				$admin_rule_list.html('');
			}else if(type==='all'){
				attr_data={};
				price_data={};
				colormap={};
				rulemap={};
				$admin_color.find('input').val('').attr({'data-value':''});
				$admin_rule.find('input').val('').attr({'data-value':''});
				$admin_wholesale_price.val('');
				$admin_retail_price.val('');
				$admin_inventory.val('');
				$admin_wholesale_price_list.html('');
				$admin_color_list.html('');
				$admin_rule_list.html('');
			}
		}


		/*查询标签与属性*/
		function getAttrData(id,obj){
			var isresult=false;
			if(typeof id ==='undefined'){
				return isresult;
			}
			$.ajax({
				url:"http://10.0.5.226:8082/yttx-providerbms-api/goods/tags/attrs",
				dataType:'JSON',
				async:false,
				method:'post',
				data:{
					userId:obj.userId,
					token:obj.token,
					providerId:obj.providerId,
					goodsTypeId:id
				}
			}).done(function(resp){
				var code=parseInt(resp.code,10)||0;
				if(code!==0){
					if(code===999){
						/*清空缓存*/
						public_tool.clear();
						public_tool.clearCacheData();
						public_tool.loginTips();
					}
					console.log(resp.message);
					isresult=false;
					return false;
				}

				var list=resp;

				if(!list){
					isresult=false;
					return false;
				}

				var len=list.length,
					i= 0,
					attrmap={
						'color':{
							'wrap':$admin_color_list,
							'addwrap':$admin_addcolor_list,
							'map':colormap
						},
						'rule':{
							'wrap':$admin_rule_list,
							'addwrap':$admin_addrule_list,
							'map':rulemap
						}
					};

				if(len!==0){
					isresult=true;
					for(i;i<len;i++){
						var name=list[i]['name'],
							arr=list[i]['list'],
							j= 0,
							sublen=arr.length,
							str='',
							subobj,
							key='';

						if(name.indexOf('颜色')!==-1&&name.indexOf('公共属性')!==-1){
							key='color';
						}else if(name.indexOf('规格')!==-1){
							key='rule';
						}else{
							continue;
						}
						if(sublen!==0){

							for(j;j<sublen;j++){
								subobj=arr[j];
								var attrvalue=subobj["goodsTagId"]+'_'+subobj["id"],
									  attrtxt=subobj["name"];
								if(attrtxt in attrmap[key]['map']){
									attrtxt=attrtxt+1;
								}
								str+='<li data-value="'+attrvalue+'">'+attrtxt+'</li>';
								attrmap[key]['map'][attrtxt]=attrvalue;
							}
							$(str).appendTo(attrmap[key]['wrap']);
							$(str).appendTo(attrmap[key]['addwrap'].html(''));
						}else{
							continue;
						}
					}
				}else{
					isresult=false;
				}
			}).fail(function(resp){
				isresult=false;
				console.log(resp.message||'error');
				return false;
			});
			return isresult;
		}


		/*校验是否存在正确值*/
		function validAttrData($elem,type){
			var txt=$elem.val()||$elem.html(),
				prevtxt=$elem.attr('data-value');
			if(type==='color'){
				if(!(txt in colormap)){
					$admin_color_tips.html('不存在 "'+txt+'" 颜色');
					if(prevtxt!==''){
						$elem.val(prevtxt)||$elem.html(prevtxt);
					}else{
						$elem.val('')||$elem.html('');
					}
					setTimeout(function () {
						$admin_color_tips.html('');
						$admin_color_list.removeClass('g-d-hidei');
					},2000);
					return false;
				}
				return true;
			}else if(type==='rule'){
				if(!(txt in rulemap)){
					$admin_rule_tips.html('不存在 "'+txt+'" 规格/尺寸');
					if(prevtxt!==''){
						$elem.val(prevtxt)||$elem.html(prevtxt);
					}else{
						$elem.val('')||$elem.html('');
					}
					setTimeout(function () {
						$admin_rule_tips.html('');
						$admin_rule_list.removeClass('g-d-hidei');
					},2000);
					$admin_rule_list.removeClass('g-d-hidei');
					return false;
				}
				return true;
			}
			return false;
		}


		/*组合颜色与尺寸*/
		function groupCondition(){
			if($.isEmptyObject(attr_data)){
				$admin_wholesale_price_list.html('');
				return false;
			}
			var color={},
				rule=[],
				len= 0,
				str='';
			for(var i in attr_data){
				if(i.indexOf('color')!==-1){
					color[i]=attr_data[i];
				}else if(i.indexOf('rule')!==-1){
					var tempobj={};
					tempobj['name']=attr_data[i];
					rule.push(tempobj);
				}
			}

			len=rule.length;
			if($.isEmptyObject(color)||len===0){
				$admin_wholesale_price_list.html('');
				return false;
			}


			for(var j in color){
				var k= 0,
					colorvalue=color[j];
				str+='<tr><td rowspan="'+len+'">'+colorvalue+'</td>';
				for(k;k<len;k++){
					var name=rule[k]["name"],
						code=colormap[colorvalue].split('_')[1]+'_'+rulemap[name].split('_')[1];
					if(k===0){
						str+='<td>'+name+'</td>' +
							'<td><input class="admin-table-input" name="setinventory" maxlength="5" type="text"></td>' +
							'<td><input class="admin-table-input" name="setwholesalePrice" maxlength="12" type="text"></td>' +
							'<td><input class="admin-table-input" name="setretailPrice" maxlength="12" type="text"></td>' +
							'<td><input name="setisDefault"  type="checkbox" data-value="'+code+'"></td></tr>';
					}else{
						str+='<tr><td>'+name+'</td>' +
							'<td><input class="admin-table-input" name="setinventory" maxlength="5" type="text"></td>' +
							'<td><input class="admin-table-input" name="setwholesalePrice" maxlength="12" type="text"></td>' +
							'<td><input class="admin-table-input" name="setretailPrice" maxlength="12" type="text"></td>' +
							'<td><input name="setisDefault"  type="checkbox" data-value="'+code+'"></td></tr>';
					}
				}
			}
			$(str).appendTo($admin_wholesale_price_list.html('').removeClass('g-d-hidei'));
		}


		/*获取设置的价格数据*/
		function getSetPrice(){
			var result=[],
				$tr=$admin_wholesale_price_list.find('tr'),
				len=$tr.size(),
				j=0;

			for(j;j<len;j++){
				var $input=$tr.eq(j).find('input'),
					sublen=$input.size(),
					m= 0,
					str='';
				for(m;m<sublen;m++){
					var $this=$input.eq(m);

					if(m!==3){
						str+=$this.val()+'#';
					}else{
						var key=$this.attr('data-value').split('_'),
							value=$this.is(':checked')?1:0;

						str+=value+'#'+key[0]+'#'+key[1];
					};
				}
				result.push(str);
			}
			return result;
		}



	});



})(jQuery,KindEditor);