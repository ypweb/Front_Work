define(['zepto'],function($){
		'use strict';
		var win=window;
		
		////构造函数[入口函数]
		this.slideToggle=function(options){
			
				var settings = $.extend({},{
							 minwidth:1024,
							 size:5,
							 curindex:0,
							 isresize:true,
							 slide_id:null,
							 slide_hover_id:null,
							 $wrap:null,
							 $slide_img:null,
							 $items:null,
							 $btnwrap:null,
							 $btn:null,
							 isBackground:false,
							 winwidth:$(win).width(),
							 isTouch:false,
						   isMobile:(function(){
								 if(/(iPhone|iPod|Android|ios|iOS|iPad|Backerry|WebOS|Symbian|Windows Phone|Phone)/i.test(navigator.userAgent)){
									 return true;
								 }else{
									 return false;
								 }
							 }()),
							 btn_active:'slidebtn-active',
							 eff_time:500,
							 times:6000
				 },options),
				 self=this;
				 
				//初始化
				self.slideInit(settings);
				
				//事件绑定
				if(settings.size>1){
					/*tab 点击切换*/
					settings.$btnwrap.delegate('li', $.EventName.click,function(e){
						e.preventDefault();
						fEnter(settings);
						var $this=$(this);
						settings.curindex=$this.index();
						settings.$slide_img.animate({
							"left":-settings.curindex * settings.winwidth
						},settings.eff_time);
						
						$this.addClass(settings.btn_active)
						.siblings()
						.removeClass(settings.btn_active);
						fLeave(settings,self);
					});
					
					//绑定触摸事件
					if(settings.isMobile&&settings.isTouch){
						settings.$wrap.delegate('ul','swipeLeft swipeRight',function(e){
							e.preventDefault();
							fEnter(settings);
							var cindex=settings.curindex;
							if(e.type==='swipeLeft'){
								if(cindex===settings.size - 1){
									cindex=0;
								}else{
									cindex++;
								}
							}else if(e.type==='swipeRight'){
								if(cindex===0){
									cindex=settings.size - 1;
								}else{
									cindex--;
								}
							}
							settings.curindex=cindex;
							settings.$slide_img.animate({
								"left":-settings.curindex * settings.winwidth
							},settings.eff_time);
							
							settings.$btn.eq(settings.curindex).addClass(settings.btn_active)
							.siblings()
							.removeClass(settings.btn_active);
							fLeave(settings,self);
						});
					}
				}else if(settings.size===1){
						settings.$btn.css({'display':'none'});
				}

				//绑定窗口大小事件
				if(settings.isresize){
					$(win).resize(function(){
						settings.winwidth=$(this).width();
						settings.winwidth=settings.winwidth<settings.minwidth?settings.minwidth:settings.winwidth;
						settings.$items.css({"width":settings.winwidth});
						settings.$slide_img.css({
							"width":settings.size*settings.winwidth,
							"left":-settings.curindex*settings.winwidth
						});
					});
				}
				
		};
		
		
				 
		//初始化
		this.slideInit=function(settings){
				 var self=this;
				 settings.$items=settings.$slide_img.find("li");
				 settings.winwidth=settings.winwidth<settings.minwidth?settings.minwidth:settings.winwidth;
				 settings.$items.css({"width":settings.winwidth});
				 settings.size=settings.$items.size();
				 settings.$btn=settings.$btnwrap.find('li');
				 settings.$slide_img.css({
						"width":settings.size*settings.winwidth
				 });
				 if(settings.isBackground){
					 settings.$items.each(function(){
						 	var $this=$(this),src=$this.attr('data-src');
							$this.css({"background-image":'url('+src+')'});
					 });
				 }
				 settings.slide_id=setInterval(function(){
					 self.slidePlay(settings);
				 },settings.times);
		};
		
		//播放
		this.slidePlay=function(settings){
				settings.curindex++;
				settings.curindex=settings.curindex>=settings.size?0:settings.curindex;
				settings.$slide_img.animate({
					"left":-settings.curindex*settings.winwidth
				},settings.eff_time);
				
				settings.$btn.eq(settings.curindex).addClass(settings.btn_active).siblings().removeClass(settings.btn_active);
				
				
		};
		
		return this;
		
		
		//服务类
		//指针移入
		function fEnter(opt){
			clearInterval(opt.slide_id);
			opt.slide_id=null;
		}
		//指针移出
		function fLeave(opt,self){
			clearInterval(opt.slide_id);
			opt.slide_id=null;
			opt.slide_id=setInterval(function(){
				self.slidePlay(opt);
			},opt.times);
		}
});