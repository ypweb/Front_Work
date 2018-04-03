/*配置依赖*/
require.config({
	baseUrl:'../js/',
	paths:{
		'jquery':'lib/jquery/jquery-2.1.4.min',
		'jquery_mobile':'lib/jquery/jquery-mobile.min'
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
require(['jquery','jquery_mobile'],function($,$jm) {
	$(function(){
		
		//dom对象引用
		var $header_wrap=$('#header_wrap'),
			$header_menu=$('#header_menu'),
			$header_item=$header_menu.children(),
			$header_btn=$('#header_btn'),
			$screen_index=$('#screen_index'),
			$screen_indexcontent=$screen_index.find('>div.index-content'),
			$screen_product=$('#screen_product'),
			$screen_productcontent=$screen_product.find('ul'),
			$screen_scene=$('#screen_scene'),
			$screen_3d=$('#screen_3d'),
			$screen_app=$('#screen_app'),
			$screen_contact=$('#screen_contact'),
			$help_detail=$('#help_detail'),
			$win=$(window),
			screen_pos=[{
				node:$screen_index,
				pos:0,
				minheight:700
			},{
				node:$screen_product,
				pos:0,
				minheight:750
			},{
				node:$screen_scene,
				pos:0,
				minheight:700
			},{
				node:$screen_app,
				pos:0,
				minheight:700
			},{
				node:$screen_contact,
				pos:0,
				minheight:700
			}],
			isMobile=false;





		//初始化
		(function(){
			//初始化菜单
			var i= 0,
				len=screen_pos.length,
				j= 0,
				pos=$win.scrollTop(),
				winheight=$win.height();


			for(i;i<len;i++){
				var temptop=screen_pos[i]["node"].offset().top;
				screen_pos[i]["pos"]=temptop,
				itemheight=screen_pos[i]["node"].height()/2;

				var minpos=parseInt(pos - itemheight/2,0),
					maxpos=parseInt(pos + itemheight,0);
				if(temptop>=minpos&&temptop<=maxpos){
					$header_item.eq(i).addClass('menu-active').siblings().removeClass('menu-active');
					/*二屏动画*/
					if(i===1){
						$screen_productcontent.addClass('product-listactive');
					}else{
						$screen_productcontent.removeClass('product-listactive');
					}
				}

				/*设置屏幕大小*/
				screen_pos[i]["node"].css({'height':function () {
					var minh=screen_pos[i]['minheight'],
						maxh=screen_pos[i]['maxheight']||null;
					if(minh<winheight){
						if(maxh&&winheight>maxh){
							return maxh;
						}
						return isMobile?winheight - 50:winheight - 120;
					}else{
						return minh;
					}
				}});


			}


			/*
			* 初始化pc或移动视口标识
			*
			* */
			var winwidth=$win.width();
			if(winwidth>=1200){
				isMobile=false;
				/*场景展现动画*/
				$screen_3d.addClass('scene-itempc');
			}else{
				isMobile=true;
				/*场景展现动画*/
				$screen_3d.removeClass('scene-itempc');
			}
			/*头部动画*/
			if(pos>120){
				$header_wrap.removeClass('header-wrapactive');
			}else{
				$header_wrap.addClass('header-wrapactive');
			}


		}());


		//监听菜单导航
		$header_menu.on($.EventName.click,'li',function(e){
			e.preventDefault();
			var $this=$(this),
				index=$this.index();
			if(isMobile){
				$('html,body').animate({'scrollTop':screen_pos[index]['pos'] - 50 +'px'},500);
			}else{
				$('html,body').animate({'scrollTop':screen_pos[index]['pos'] - 120 +'px'},500);
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
								itemheight=screen_pos[i]["node"].height()/2,
								minpos=parseInt(pos - itemheight/2,0),
								maxpos=parseInt(pos + itemheight,0);

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

						/*头部动画*/
						if(currenttop>120){
							$header_wrap.removeClass('header-wrapactive');
						}else{
							$header_wrap.addClass('header-wrapactive');
						}
					}
				}());
			}
			if(type=='resize'){
				(function(){
					//隐藏菜单导航
					var winwidth=$win.width(),
						winheight=$win.height();
					if(winwidth>=1200||(winwidth>=1200&&e.orientation=='landscape')){
						//隐藏已经存在的class
						$header_btn.removeClass('header-btnactive');
						$header_menu.removeClass('g-d-showi');
						isMobile=false;
						/*场景展现动画*/
						$screen_3d.addClass('scene-itempc');
					}else{
						isMobile=true;
						/*场景展现动画*/
						$screen_3d.removeClass('scene-itempc');
					}


					//重新定位滚动条位置
					var i= 0,
						len=screen_pos.length,
						j= 0,
						pos=$win.scrollTop();

					/*头部动画*/
					/*头部动画*/
					if(pos>120){
						$header_wrap.removeClass('header-wrapactive');
					}else{
						$header_wrap.addClass('header-wrapactive');
					}

					for(i;i<len;i++){
						var temptop=screen_pos[i]["node"].offset().top;
						screen_pos[i]["pos"]=temptop,
						itemheight=screen_pos[i]["node"].height()/2;

						var minpos=parseInt(pos - itemheight/2,0),
							maxpos=parseInt(pos + itemheight,0);
						if(temptop>=minpos&&temptop<=maxpos){
							$header_item.eq(i).addClass('menu-active').siblings().removeClass('menu-active');
						}

						/*设置屏幕大小*/
						screen_pos[i]["node"].css({'height':function () {
							var minh=screen_pos[i]['minheight'],
								maxh=screen_pos[i]['maxheight']||null;
							if(minh<winheight){
								if(maxh&&winheight>maxh){
									return maxh;
								}
								return isMobile?winheight - 50:winheight - 120;
							}else{
								return minh;
							}
						}});

					}


				}());

			}
		});
		

	});
});



