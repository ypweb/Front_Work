/*admin_member:成员设置*/
(function($){
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


			/*dom引用和相关变量定义*/
			var module_id='yttx-goods-detail'/*模块id，主要用于本地存储传值*/,
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
				detail_config={
					userId:decodeURIComponent(logininfo.param.userId),
					token:decodeURIComponent(logininfo.param.token),
					providerId:decodeURIComponent(logininfo.param.providerId)
				},
			 	listone={},
				listtwo={},
				attr_map={},
			 	$admin_slide_image=$('#admin_slide_image'),
				$admin_slide_btnl=$('#admin_slide_btnl'),
				$admin_slide_btnr=$('#admin_slide_btnr'),
				$admin_slide_tool=$('#admin_slide_tool'),
				slide_config={
					$slide_tool:$admin_slide_tool,
					$image:$admin_slide_image,
					$btnl:$admin_slide_btnl,
					$btnr:$admin_slide_btnr,
					active:'admin-slide-active',
					len:5
				};


			/*清除编辑缓存并获取查看缓存*/
			var detail_cache=public_tool.getParams('yttx-goods-detail');

			if(detail_cache){
				/*解析数据*/
				detail_config['id']=detail_cache['id'];
				getDetailData(detail_config);
			}else{
				dia.content('<span class="g-c-bs-warning g-btips-warn">没有这个商品</span>').show();
				setTimeout(function () {
					dia.close();
					location.href='yttx-goods-manage.html';
				},2000);
			}



		}


		/*获取数据*/
		function getDetailData(config){
			if(!public_tool.isSameDomain("http://10.0.5.226:8082")){
				return false;
			}
			$.ajax({
				url:"http://10.0.5.226:8082/yttx-providerbms-api/goods/details",
				dataType:'JSON',
				async:false,
				method:'post',
				data:config
			}).done(function(resp){
				var code=parseInt(resp.code,10)||0;
				if(code!==0){
					if(code===999){
						/*清空缓存*/
						public_tool.loginTips(function () {
							public_tool.clear();
							public_tool.clearCacheData();
						});
					}
					console.log(resp.message);
					return false;
				}
				var result=resp.result;

				if(!result){
					return false;
				}

				if($.isEmptyObject(result)){
					return false;
				}

				/*解析轮播图*/
				var banner=result['bannerList'];
				if(banner&&banner.length!==0){
					getSlideData(banner,slide_config);
				}

				/*解析详情*/
				var detail=result['details'];
				if(detail!==''){
					getDetailHtml(detail);
				}

				/*解析类型*/
				var type=result['goodsTypeId'];
				if(typeof type!=='undefined'){
					document.getElementById('admin_goodstype').innerHTML=type;
				}

				/*解析名称*/
				var name=result['name'];
				if(typeof name!=='undefined'){
					document.getElementById('admin_name').innerHTML=name;
				}

				/*解析状态*/
				var status=result['status'],statemap={
					'0':'仓库',
					'1':'上架',
					'2':'下架',
					'3':'删除'
				};
				if(typeof status !=='undefined'&&status!==''){

					document.getElementById('admin_status').innerHTML=statemap[status];
				}else{
					document.getElementById('admin_status').innerHTML=statemap[0];
				}


				/*解析编码*/
				var gcode=result['gcode'];
				if(typeof gcode !=='undefined'){
					document.getElementById('admin_code').innerHTML=gcode;
				}


				/*解析排序*/
				var sort=result['sort'];
				if(typeof sort !=='undefined'){
					document.getElementById('admin_sort').innerHTML=sort;
				}




				/*解析是否被推荐*/
				var isrec=result['isRecommended'];
				if(typeof isrec!=='undefined'){
					document.getElementById('admin_isRecommended').innerHTML=(isrec?'是':'否');
				}

				/*解析库存，批发价，建议零售价*/
				getAttrData(result['tagsAttrsList'],result['attrInventoryPrices']);



			}).fail(function(resp){
				console.log(resp.message||'error');
				return false;
			});


		}


		/*查询标签与属性*/
		function getAttrData(attr,price){
			var attrlen= 0,
				pricelen= 0,
				priceobj;

			if(attr){
				attrlen=attr.length;
			}

			if(attrlen===0){
				/*没有颜色和规格时*/
				if(price){
					pricelen=price.length;
					if(pricelen!==0){
						priceobj=price[0];
						if(priceobj!==null||priceobj!==''){
							priceobj=priceobj.split("#");
							if(priceobj.length!==0){
								document.getElementById('admin_inventory').innerHTML=priceobj[0];
								document.getElementById('admin_wholesale_price').innerHTML='￥:'+public_tool.moneyCorrect(priceobj[1],12,false)[0];
								document.getElementById('admin_retail_price').innerHTML='￥:'+public_tool.moneyCorrect(priceobj[2],12,false)[0];
								document.getElementById('admin_supplier_price').innerHTML=(function () {
									var supplier=dataitem[6];
									if(supplier===''||isNaN(supplier)){
										supplier='￥:'+'0.00';
									}else{
										supplier='￥:'+public_tool.moneyCorrect(supplier,12,false)[0];
									}
									return supplier;
								}());
							}
						}
					}
				}
			}else {
				/*存储对象*/
				(function(){
					var i=0;
					for(i;i<attrlen;i++){
						var attr_obj=attr[i],
							name=attr[i]['name'],
							arr=attr[i]['list'],
							id=attr[i]['id'],
							j= 0,
							sublen=arr.length,
							str='';

						/*存入属性对象*/
						if(sublen!==0){
							/*没有填入对象即创建相关对象*/
							attr_obj['map']={};
							attr_obj['res']={};
							/*遍历*/
							for(j;j<sublen;j++){
								var subobj=arr[j],
									attrvalue=subobj["id"],
									attrtxt=subobj["name"];
								attr_obj['map'][attrtxt]=attrvalue;
								attr_obj['res'][attrvalue]=attrtxt;
							}

							attr_obj['label']=name.replace(/(\(.*\))|(\（.*\）)|\s*/g,'');
							attr_obj['key']=id;
							attr_map[id]=attr_obj;
						}else if(sublen===0){
							attr_obj['map']={};
							attr_obj['res']={};
							attr_obj['label']=name.replace(/(\(.*\))|(\（.*\）)|\s*/g,'');
							attr_obj['key']=id;
							attr_map[id]=attr_obj;
						}
					}
				}());

				/*解析结果集*/
				if(price){
					priceobj=price;
					pricelen=price.length;
					if(pricelen!==0){
						var	attrmap={};

						/*解析第一属性*/
						(function(){
							var i=0;
							loopout:for(i;i<pricelen;i++){
								var attrdata=priceobj[i].split('#'),
									attrone=attrdata[4];

								for(var j in attr_map){
									var mapdata=attr_map[j],
										submap=mapdata['res'];
									for(var p in submap){
										if(p===attrone){
											if($.isEmptyObject(listone)){
												listone['label']=mapdata['label'];
												listone['res']=submap;
												listone['id']=mapdata['id'];
												listone['map']=mapdata['map'];
											}
											break loopout;
										}
									}
								}
							}
						}());

						/*解析第二属性*/
						if(!$.isEmptyObject(listone)){
							(function(){
								var i=0;
								loopout:for(i;i<pricelen;i++){
									var attrdata=priceobj[i].split('#'),
										attrtwo=attrdata[5];

									for(var j in attr_map){
										var mapdata=attr_map[j],
											submap=mapdata['res'];
										for(var p in submap){
											if(p===attrtwo){
												if($.isEmptyObject(listtwo)){
													listtwo['label']=mapdata['label'];
													listtwo['res']=submap;
													listtwo['id']=mapdata['id'];
													listtwo['map']=mapdata['map'];
												}
												break loopout;
											}
										}
									}
								}
							}());
						}else{
							document.getElementById('admin_wholesale_price_list').innerHTML='';
							document.getElementById('admin_wholesale_price_thead').innerHTML='<tr><th>颜色</th><th>规格</th><th>库存</th><th>批发价</th><th>建议零售价</th><th>供应商价</th><th>价格显示在首页</th></tr>';
							return false;
						}


						/*解析组合*/
						if(!$.isEmptyObject(listtwo)){
							(function(){
								var i=0;
								for(i;i<pricelen;i++){
									var attrdata=priceobj[i].split('#'),
										attrone=attrdata[4],
										attrtwo=attrdata[5];


									var mapone=listone['res'];
									for(var m in mapone){
										if(m===attrone){
											if(!(m in attrmap)){
												/*不存在即创建*/
												attrmap[m]=[];
											}
											var maptwo=listtwo['res'];
											for(var n in maptwo){
												 if(n===attrtwo){
													 attrmap[m].push(attrdata);
													 break;
												 }
											}
											break;
										}
									}
								}
							}());
						}else{
							document.getElementById('admin_wholesale_price_list').innerHTML='';
							document.getElementById('admin_wholesale_price_thead').innerHTML='<tr><th>颜色</th><th>规格</th><th>库存</th><th>批发价</th><th>建议零售价</th><th>价格显示在首页</th></tr>';
							return false;
						}

						/*生成html文档*/
						groupCondition(attrmap);
					}else{
						document.getElementById('admin_wholesale_price_list').innerHTML='';
						document.getElementById('admin_wholesale_price_thead').innerHTML='<tr><th>颜色</th><th>规格</th><th>库存</th><th>批发价</th><th>建议零售价</th><th>供应商价</th><th>价格显示在首页</th></tr>';
						return false;
					}
				}
			}
		}



		/*组合颜色与尺寸*/
		function groupCondition(resp){
			var str='',
				checkid=0,
				x=0;

			for(var j in resp){
				var k= 0,
					datavalue=resp[j],
					len=datavalue.length;

				str+='<tr><td rowspan="'+len+'">'+listone['res'][j]+'</td>';
				for(k;k<len;k++){
					var dataitem=datavalue[k],
						ischeck=parseInt(dataitem[3],10)===1?'是':'';
					if(k===0){
						str+='<td>'+listtwo['res'][dataitem[5]]+'</td>' +
							'<td>'+dataitem[0]+'</td>' +
							'<td>￥:'+public_tool.moneyCorrect(dataitem[1],12,false)[0]+'</td>' +
							'<td>￥:'+public_tool.moneyCorrect(dataitem[2],12,false)[0]+'</td>' +
							'<td>'+(function(){
								var supplier=dataitem[6];
								if(supplier===''||isNaN(supplier)){
									supplier='￥:'+'0.00';
								}else{
									supplier='￥:'+public_tool.moneyCorrect(supplier,12,false)[0];
								}
								return supplier;
							}())+'</td>' +
							'<td>'+ischeck+'</td></tr>';
					}else{
						str+='<tr><td>'+listtwo['res'][dataitem[5]]+'</td>' +
						'<td>'+dataitem[0]+'</td>' +
						'<td>￥:'+public_tool.moneyCorrect(dataitem[1],12,false)[0]+'</td>' +
						'<td>￥:'+public_tool.moneyCorrect(dataitem[2],12,false)[0]+'</td>' +
						'<td>'+(function(){
							var supplier=dataitem[6];
							if(supplier===''||isNaN(supplier)){
								supplier='￥:'+'0.00';
							}else{
								supplier='￥:'+public_tool.moneyCorrect(supplier,12,false)[0];
							}
							return supplier;
						}())+'</td>' +
						'<td>'+ischeck+'</td></tr>';
					}
					if(ischeck===''){
						/*判断是否选中,有则跳过无则计数*/
						checkid++;
					}
					x++;
				}
			}
			document.getElementById('admin_wholesale_price_thead').innerHTML='<tr><th>'+listone['label']+'</th><th>'+listtwo['label']+'</th><th>库存</th><th>批发价</th><th>建议零售价</th><th>供应商价</th><th>价格显示在首页</th></tr>';
			var priclist=document.getElementById('admin_wholesale_price_list');
			priclist.innerHTML=str;
			/*全部没选中则，默认第一个选中*/
			if(checkid===x){
				$(priclist).find('tr:first-child').find('td').eq(6).html('是');
			}
		}


		/*解析轮播图*/
		function getSlideData(list,config){
			var len=list.length,
				i= 0,
				str='';
			for(i;i<len;i++){
				var url=list[i]['imageUrl'];
				if(url.indexOf('qiniucdn.com')!==-1){
					if(url.indexOf('?imageView2')!==-1){
						url=url.split('?imageView2')[0]+'?imageView2/1/w/50/h/50';
					}else{
						url=url+'?imageView2/1/w/50/h/50';
					}
					str+='<li><img alt="" src="'+url+'" /></li>';
				}else {
					str+='<li><img alt="" src="'+url+'" /></li>';
				}
			}
			$(str).appendTo(config.$slide_tool.html(''));
			/*调用轮播*/
			goodsSlide.GoodsSlide(config);
		}


		/*解析详情*/
		function getDetailHtml(data){
			/*var str=data.replace(/(\.jpeg|\.jpg|\.gif|\.png)/g,"$1"+"?imageView2/1/w/400/h/300");*/
				document.getElementById('admin_detail').innerHTML=data;
		}




	});



})(jQuery);