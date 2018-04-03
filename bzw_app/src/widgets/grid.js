/***
name:grid
author:yipin
多宫格布局
***/

define(['zepto'],function($){
	'use strict';
	var win=window;
	return {
		
		imgList:function(wrap,selector,n){
					var $items=wrap.find(selector),
					len=$items.size();
					
					
					//初始化
					doLayout(win,$items,len,n);
					
					
					//绑定转屏事件或者窗口事件适配pc和移动端
					$(win).on('resize',function(){
						doLayout(win,$items,len,n);
					});
			}
	};
	
	
	//服务函数
	function doLayout(wrap,$items,len,n){
		var winwidth=$(wrap).width(),
			itemheight=parseInt(winwidth/n,10);
			
		for(var i=0;i<len;i++){
				$items.eq(i).css({
					'height':itemheight
				});
		}
	}
	
	
});
