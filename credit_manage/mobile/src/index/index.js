/*配置依赖*/
'use strict'

require.config({
	baseUrl:'../../',
	paths:{
		'jquery':'../js/lib/jquery/jquery',
		'jquery_mobile':'../js/lib/jquery/jquery-mobile',
		'slide':'js/widgets/slide'
	},
	shim:{
		'jquery_mobile':{
			deps:['jquery']
		}
	}
});


/*程序入口*/
require(['jquery','jquery_mobile','slide'],function($,$jm,Slide) {
	$(function(){
		
		//dom对象引用
		var $slideimg_show=$('#slideimg_show'),
			$slide_img=$('#slide_img'),
			$slideimg_btn=$('#slideimg_btn');
			

		//轮播动画
		Slide.slideToggle({
			$wrap:$slideimg_show,
			$slide_img:$slide_img,
			$btnwrap:$slideimg_btn,
			isBackground:true,
			minwidth:320,
			isresize:true,
			size:3,
			times:5000,
			eff_time:500,
			btn_active:'slidebtn-active'
		});
		
	


	});
});



