/*配置依赖*/
require.config({
	baseUrl:'../../',
	paths:{
		'zepto':'../js/lib/zepto/zepto',
		'slide':'js/widgets/slide',
		'grid':'js/widgets/grid'
	}
});


/*程序入口*/
require(['zepto','slide','grid'],function($,Slide,Grid) {
	'use strict';
	$(function(){
		
		//dom对象引用
		var $slideimg_show=$('#slideimg_show'),
			$slide_img=$('#slide_img'),
			$slideimg_btn=$('#slideimg_btn'),
			$serve_grid=$("#serve_grid");
			

		//轮播动画
		Slide.slideToggle({
			$wrap:$slideimg_show,
			$slide_img:$slide_img,
			$btnwrap:$slideimg_btn,
			minwidth:640,
			isresize:true,
			isTouch:true,
			size:3,
			times:5000,
			eff_time:500,
			btn_active:'slidebtn-active'
		});
		
		
		
		//多宫格
		Grid.imgList($serve_grid,'li',3);


	});
});



