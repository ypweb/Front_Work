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
				};


			/*清除编辑缓存并获取查看缓存*/
			var detail_cache=public_tool.getParams('yttx-order-detail');

			if(detail_cache){
				/*解析数据*/
				detail_config['id']=detail_cache['id'];
				getDetailData(detail_config);
			}else{
				dia.content('<span class="g-c-bs-warning g-btips-warn">没有这个订单</span>').show();
				setTimeout(function () {
					dia.close();
					location.href='yttx-goods-manage.html';
				},2000);
			}



		}


		/*获取数据*/
		function getDetailData(config){
			$.ajax({
				url:"http://112.74.207.132:8082/yttx-providerbms-api/goodsorder/details",
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


				/*解析基本信息*/
				getBaseOrder(result);

				/*解析子订单*/
				getSubOrder(result);


				/*显示是否查看物流或者发货*/
				var status=parseInt(result['orderState'],10),
					btns='';
				if(status===7||status===9){
					/*需要查看物流*/
					document.getElementById('admin_action').innerHTML='<a class="btn btn-info g-f-r" target="_blank" href="http://www.kuaidi100.com">查看物流</a>';
				}
			}).fail(function(resp){
				console.log(resp.message||'error');
				return false;
			});


		}





		/*解析子订单*/
		function getBaseOrder(resp){
			var str='',
				detailmap={
					orderState:'订单状态',
					orderNumber:'订单号',
					orderTime:'下单时间',
					customerName:'买家名称',
					customerPhone:'联系电话',
					customerAddress:'所在地址',
					consigneeName:'收货人姓名',
					consigneePhone:'收货人电话',
					freight:'物流费用',
					totalMoney:'总计(包含运费)',
					remark:'买家留言'
				},
				statusmap={
					0:"待发货",
					1:"待收货",
					3:"部分收货",
					5:"已收货"
				};

			for(var i in resp){
				if(i!=='list'){
					if(i==='orderState'){
						var stauts=parseInt(resp[i],10);
						if(stauts===0){
							str='<div class="grid-list-group1">状态：<p class="g-c-warn">'+statusmap[stauts]+'</p></div>';
						}else if(stauts===1){
							str='<div class="grid-list-group1">状态：<p class="g-c-info">'+statusmap[stauts]+'</p></div>';
						}else if(stauts===3){
							str='<div class="grid-list-group1">状态：<p class="g-c-gray6">'+statusmap[stauts]+'</p></div>';
						}else if(stauts===5){
							str='<div class="grid-list-group1">状态：<p class="g-c-succ">'+statusmap[stauts]+'</p></div>';
						}else{
							str='<div class="grid-list-group1">状态：<p class="g-c-red2">异常</p></div>';
						}
					}else if(i==='freight'||i==='totalMoney'){
						var price=resp[i];
						if(price===''||isNaN(price)){
							price="0.00";
						}
						str+='<div class="grid-list-group1">'+detailmap[i]+'：<p class="g-c-red1">￥：'+public_tool.moneyCorrect(price,12,false)[0]+'</p></div>';
					}else if(i==='consigneePhone'||i==='customerPhone'){
						str+='<div class="grid-list-group1">'+detailmap[i]+'：<p>'+public_tool.phoneFormat(resp[i])+'</p></div>';
					}else{
						str+='<div class="grid-list-group1">'+detailmap[i]+'：<p>'+resp[i]+'</p></div>';
					}

				}
			}

			document.getElementById('admin_orderbase').innerHTML=str;
		}




		/*解析基本信息*/
		function getSubOrder(data){
			if(!data){
				return false;
			}

			var list=data['list'];
			if(!list){
				return false;
			}
			var len=list.length;
			if(len===0){
				return false;
			}
			var i= 0,
				str='';

			for(i;i<len;i++){
				var suborder=list[i],
					price=suborder["supplierPrice"];

				if(typeof price==='undefined'||price===''||isNaN(price)){
					price='0.00';
				}


				str+='<tr><td>'+suborder["goodsName"]+'</td><td>'+suborder["attributeName"]+'</td><td class="g-c-info">'+suborder["purchasingQuantlity"]+'</td><td class="g-c-red2">￥:'+public_tool.moneyCorrect(price,12,false)[0]+'</td></tr>';
			}
			document.getElementById('admin_orderitem').innerHTML=str;
		}


	});
})(jQuery);