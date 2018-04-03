/*配置依赖*/
require.config({
	baseUrl:'js/',
	paths:{
		'jquery':'lib/jquery/jquery-2.1.4.min',
		'jquery_mobile':'lib/jquery/jquery-mobile.min',
		'slide':'widgets/slide'
	},
	shim:{
		'dialog':{
				deps:['jquery']
		},
		'jquery_mobile':{
			deps:['jquery']
		}
	}
});


/*程序入口*/
require(['jquery','jquery_mobile','slide'],function($,$jm,Slide) {
	$(function(){
		
		//dom对象引用
		var $header_menu=$('#header_menu'),
			$header_item=$header_menu.children(),
			$header_btn=$('#header_btn'),
			$screen_index=$('#screen_index'),
			$screen_indexcontent=$screen_index.find('>div.index-content'),
			$screen_product=$('#screen_product'),
			$screen_productcontent=$screen_product.find('ul'),
			$screen_scene=$('#screen_scene'),
			$screen_app=$('#screen_app'),
			$screen_contact=$('#screen_contact'),
			$help_detail=$('#help_detail'),
			$win=$(window),
			screen_pos=[{
				node:$screen_index,
				pos:0
			},{
				node:$screen_product,
				pos:0
			},{
				node:$screen_scene,
				pos:0
			},{
				node:$screen_app,
				pos:0
			},{
				node:$screen_contact,
				pos:0
			}],
			isMobile=false;





		//初始化
		(function(){
			//初始化菜单
			var i= 0,
				len=screen_pos.length,
				j= 0,
				pos=$(window).scrollTop();
			for(i;i<len;i++){
				var temptop=screen_pos[i]["node"].offset().top;
				screen_pos[i]["pos"]=temptop;

				var minpos=parseInt(pos - 350,0),
					maxpos=parseInt(pos + 350,0);
				if(temptop>=minpos&&temptop<=maxpos){
					$header_item.eq(i).addClass('menu-active').siblings().removeClass('menu-active');
					/*一屏动画*/
					if(i===0){
						$screen_indexcontent.addClass('index-contentactive');
					}else{
						$screen_indexcontent.removeClass('index-contentactive');
					}
					/*二屏动画*/
					if(i===1){
						$screen_productcontent.addClass('product-listactive');
					}else{
						$screen_productcontent.removeClass('product-listactive');
					}
				}
			}


			/*
			* 初始化pc或移动视口标识
			*
			* */
			var winwidth=$win.width();
			if(winwidth>=1200){
				isMobile=false;
			}else{
				isMobile=true;
			}



		}());


		//监听菜单导航
		$header_menu.on($.EventName.click,'li',function(e){
			e.preventDefault();
			var $this=$(this),
				index=$this.index();
			if(isMobile){
				$('html,body').animate({'scrollTop':screen_pos[index]['pos'] - 40 +'px'},500);
			}else{
				$('html,body').animate({'scrollTop':screen_pos[index]['pos'] - 120 +'px'},500);
			}
			/*一屏动画*/
			if(index===0){
				$screen_indexcontent.addClass('index-contentactive');
			}else{
				$screen_indexcontent.removeClass('index-contentactive');
			}
			/*二屏动画*/
			if(index===1){
				$screen_productcontent.addClass('product-listactive');
			}else{
				$screen_productcontent.removeClass('product-listactive');
			}
			return false;
		});


		//监听导航切换显示隐藏
		$header_btn.on($.EventName.click,function(){
			if($header_btn.hasClass('header-btnactive')){
				//隐藏
				$header_btn.removeClass('header-btnactive');
				$header_menu.removeClass('g-d-showi');
			}else{
				//显示
				$header_btn.addClass('header-btnactive');
				$header_menu.addClass('g-d-showi');
			}
		});


		//监听菜单滚动条滚动
		var count=0;
		$win.on('scroll resize',function(e){
			var type= e.type;
			if(type=='scroll'){
				(function(){
					count++;
					if(count%2==0){
						var $this=$(this),
							currenttop=$this.scrollTop(),
							i= 0,
							len=screen_pos.length;

						for(i;i<len;i++){
							var pos=screen_pos[i]['pos'],
								minpos=parseInt(pos - 350,0),
								maxpos=parseInt(pos + 350,0);

							if(currenttop>=minpos&&currenttop<=maxpos){
								$header_item.eq(i).addClass('menu-active').siblings().removeClass('menu-active');
								/*一屏动画*/
								if(i===0){
									$screen_indexcontent.addClass('index-contentactive');
								}else{
									$screen_indexcontent.removeClass('index-contentactive');
								}
								/*二屏动画*/
								if(i===1){
									$screen_productcontent.addClass('product-listactive');
								}else{
									$screen_productcontent.removeClass('product-listactive');
								}
							}
						}

					}
				}());
			}
			if(type=='resize'){
				(function(){
					//隐藏菜单导航
					var winwidth=$win.width();
					if(winwidth>=1200||(winwidth>=1200&&e.orientation=='landscape')){
						//隐藏已经存在的class
						$header_btn.removeClass('header-btnactive');
						$header_menu.removeClass('g-d-showi');
						isMobile=false;
					}else{
						isMobile=true;
					}


					//重新定位滚动条位置
					var i= 0,
						len=screen_pos.length,
						j= 0,
						pos=$win.scrollTop();
					for(i;i<len;i++){
						var temptop=screen_pos[i]["node"].offset().top;
						screen_pos[i]["pos"]=temptop;

						var minpos=parseInt(pos - 350,0),
							maxpos=parseInt(pos + 350,0);
						if(temptop>=minpos&&temptop<=maxpos){
							$header_item.eq(i).addClass('menu-active').siblings().removeClass('menu-active');
						}
					}


				}());

			}
		});



		//轮播动画
		Slide.slideToggle({
			$wrap:$('#slideimg_show'),
			$slide_img:$('#slide_img'),
			$btnwrap:$('#slideimg_btn'),
			$slide_tipwrap:$('#slide_tips'),
			minwidth:214,
			winwidth:214,
			isresize:false,
			size:3,
			times:5000,
			eff_time:500,
			btn_active:'slidebtn-active'
		});


	});
});



