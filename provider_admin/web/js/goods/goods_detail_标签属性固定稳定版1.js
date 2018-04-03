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
						public_tool.clear();
						public_tool.clearCacheData();
						public_tool.loginTips();
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
					'0':'状态',
					'1':'上架',
					'2':'下架'
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
								document.getElementById('admin_wholesale_price').innerHTML=public_tool.moneyCorrect(priceobj[1],12,true)[0];
								document.getElementById('admin_retail_price').innerHTML=public_tool.moneyCorrect(priceobj[2],12,true)[0];
							}
						}
					}
				}
			}else {
				/*有颜色和规格时*/
				if(price){
					pricelen=price.length;
					if(pricelen!==0){
						var colorlist,
							rulelist,
							colorlen= 0,
							rulelen=0;
						/*查询颜色和规则列表*/
						for(var p=0;p<attrlen;p++){
							if(attr[p]['name'].indexOf('颜色')!==-1&&attr[p]['name'].indexOf('公共')!==-1){
								colorlist=attr[p]['list'];
								colorlen=colorlist.length;
							}
							if(attr[p]['name'].indexOf('规格')!==-1&&attr[p]['name'].indexOf('公共')!==-1){
								rulelist=attr[p]['list'];
								rulelen=rulelist.length;
							}
						}

						/*是否存在颜色和规则*/
						if(colorlen===0){
							document.getElementById('admin_wholesale_price_list').innerHTML='';
							return false;
						}
						if(rulelen===0){
							document.getElementById('admin_wholesale_price_list').innerHTML='';
							return false;
						}

						/*过滤空数据和null数据*/
						priceobj=price;
						var i= 0,
							tempprice=[];

						for(i;i<pricelen;i++){
							if(priceobj[i]!==null){
								if(priceobj[i]!==''){
									tempprice.push(priceobj[i]);
								}
							}
						}
						priceobj=tempprice.slice(0);
						tempprice.length=0;
						pricelen=priceobj.length;


						if(pricelen===0){
							document.getElementById('admin_wholesale_price_list').innerHTML='';
							return false;
						}


						/*解析属性和规格*/
						var j= 0,
							colormap={};
						for(j;j<pricelen;j++){
							var temparr=priceobj[j].split('#'),
								attrid=parseInt(temparr[4],10),
								ruleid=parseInt(temparr[5],10),
								m= 0;
							for(m;m<colorlen;m++){
								if(colorlist[m]['id']===attrid){
									var cname=colorlist[m]['name'];

									if(!(cname in colormap)){
										/*不存在即创建*/
										colormap[cname]=[];
									}
									var n=0;
									for(n;n<rulelen;n++){
										if(rulelist[n]['id']===ruleid){
											var rname=rulelist[n]['name'],
												rarr=[];

											rarr.push(temparr[0],temparr[1],temparr[2],temparr[3],rname)
											colormap[cname].push(rarr);
											break;
										}
									}
									break;
								}

							}
						}

						if(!$.isEmptyObject(colormap)){
							groupCondition(colormap);
						}else{
							document.getElementById('admin_wholesale_price_list').innerHTML='';
						}

					}
				}
			}
		}



		/*组合颜色与尺寸*/
		function groupCondition(color){
			var str='';
			for(var j in color){
				var k= 0,
					colorvalue=color[j],
					len=colorvalue.length;

				str+='<tr><td rowspan="'+len+'">'+j+'</td>';
				for(k;k<len;k++){
					var dataitem=colorvalue[k];
					if(k===0){
						str+='<td>'+dataitem[4]+'</td>' +
							'<td>'+dataitem[0]+'</td>' +
							'<td>'+public_tool.moneyCorrect(dataitem[1],12,true)[0]+'</td>' +
							'<td>'+public_tool.moneyCorrect(dataitem[2],12,true)[0]+'</td>' +
							'<td>'+(parseInt(dataitem[3],10)===1?'是':'')+'</td></tr>';
					}else{
						str+='<tr><td>'+dataitem[4]+'</td>' +
						'<td>'+dataitem[0]+'</td>' +
						'<td>'+public_tool.moneyCorrect(dataitem[1],12,true)[0]+'</td>' +
						'<td>'+public_tool.moneyCorrect(dataitem[2],12,true)[0]+'</td>' +
						'<td>'+(parseInt(dataitem[3],10)===1?'是':'')+'</td></tr>';
					}
				}
			}
			document.getElementById('admin_wholesale_price_list').innerHTML=str;
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