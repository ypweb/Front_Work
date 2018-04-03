define(['jquery'],function($){
		'use strict';
		var win=window;
		
		////构造函数[入口函数]
		this.slideToggle=function(options){
			
				var settings = $.extend(true,{},{
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
							 $slide_tipwrap:null,
							 $slide_tip:null,
							 isBackground:false,
							 tipheight:0,
							 itemheight:0,
							 winwidth:$(win).width(),
							 img_alt:false,
							 tip_text:[],
							 btn_action:false,
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
							 times:6000,
							 auto_animates:null
				 },options),
				 self=this;
				 
				//初始化
				self.slideInit(settings);

				
				if(settings.size>1){
					/*tab 点击切换*/
					settings.$btnwrap.delegate('li', $.EventName.click,function(e){
						e.preventDefault();
						var $this=$(this);
						settings.curindex=$this.index();
						settings.btn_action=true;
						settings.$slide_img.animate({
							"left":-settings.curindex * settings.winwidth
						},settings.eff_time);
						
						$this.addClass(settings.btn_active)
						.siblings()
						.removeClass(settings.btn_active);
						
						//启动提示效果
						if(!settings.isBackground){
							if(settings.img_alt){
									self.slideEffect(settings);
							}else if(settings.$slide_tipwrap!==null){
								settings.$slide_tipwrap.css({
									"opacity":"0.4",
									"top":settings.itemheight
								});
							}
						}
					});
				
					/*mouse hover,out event*/
					//图片绑定鼠标事件
					if(settings.isMobile){
						//手机端
						settings.$wrap.on('mouseenter mouseleave',function(e){
							var type= e.type;
	
							if(type==='mouseenter'){
								//移入
								 if(settings.$slide_tipwrap!==null){
									 settings.$slide_tipwrap.stop(settings.auto_animates,true,false);
								 }
								 fEnter(settings);
							}else if(type==='mouseleave'){
								//移出
								fLeave(settings,self);
							}
						});
					}else{
						//pc端
						settings.$wrap.hover(function(){
						 if(settings.$slide_tipwrap!==null){
							 settings.$slide_tipwrap.stop(settings.auto_animates,true,false);
						 }
							
							fEnter(settings);
						},function(){
							fLeave(settings,self);
						});
					}
					
					
					//绑定触摸事件
					if(settings.isMobile&&settings.isTouch){
						settings.$wrap.delegate('ul','swipeleft swiperight',function(e){
							e.preventDefault();
							fEnter(settings);
							var cindex=settings.curindex;
							if(e.type==='swipeleft'){
								if(cindex===settings.size - 1){
									cindex=0;
								}else{
									cindex++;
								}
							}else if(e.type==='swiperight'){
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
				
				
				

				
				
				//window resize
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
				 if(settings.$slide_tipwrap!==null){
					 settings.tipheight=settings.$slide_tipwrap.height();
					 settings.$slide_tip=settings.$slide_tipwrap.find("p");
				 }
				 settings.itemheight=settings.$items.eq(0).height();
				 if(!settings.isBackground){
					 if(settings.$items.eq(0).find("img").attr("alt")){
						 settings.img_alt=true;
						 settings.$items.find("img").each(function(){
							 settings.tip_text.push($(this).attr("alt"));
						 });
						 settings.$slide_tip.text(settings.tip_text[0]);
					 }else{
						 settings.img_alt=false;
						 settings.tip_text.length=0;
						 if(settings.$slide_tipwrap!==null){
							 settings.$slide_tip.text('');
							 settings.$slide_tipwrap.css({
									"opacity":"0.4",
									"top":settings.itemheight
							 });
						 } 
					 }
				 }else{
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
				var self=this;
				settings.curindex++;
				settings.curindex=settings.curindex>=settings.size?0:settings.curindex;
				settings.$slide_img.animate({
					"left":-settings.curindex*settings.winwidth
				},settings.eff_time);
				
				settings.$btn.eq(settings.curindex).addClass(settings.btn_active).siblings().removeClass(settings.btn_active);
				
				//启动提示效果
				if(!settings.isBackground){
					if(settings.img_alt){
						self.slideEffect(settings);
					}else if(settings.$slide_tipwrap!==null){
						settings.$slide_tipwrap.css({
							"opacity":"0.4",
							"top":settings.itemheight
						});
					}
				}
				
		};
		
		//效果函数
		this.slideEffect=function(settings){
			var is_show;
			if(settings.$slide_tipwrap!==null){
				is_show=parseInt(settings.$slide_tipwrap.css("top"))+settings.tipheight;
			}
			
			if(is_show!==undefined){
				if(settings.btn_action){
					if(is_show===settings.itemheight){
						
						settings.$slide_tipwrap.animate({
							"opacity":"0.4",
							"top":settings.itemheight
						},settings.eff_time);
						
						setTimeout(function(){
							settings.$slide_tip.text(settings.tip_text[settings.curindex]);
						},settings.eff_time);
						
						settings.$slide_tipwrap.animate({
							"opacity":"0.6",
							"top":settings.itemheight-settings.tipheight
						},settings.eff_time);
					}else{
						settings.$slide_tip.text(settings.tip_text[settings.curindex]);
						
						settings.$slide_tipwrap.animate({
							"opacity":"0.6",
							"top":settings.itemheight-settings.tipheight
						},settings.eff_time);
					}
				}else{
					if(is_show===settings.itemheight){
						
						settings.$slide_tipwrap.animate({
							"opacity":"0.6",
							"top":settings.itemheight
						},settings.eff_time);
						
						setTimeout(function(){
							settings.$slide_tip.text(settings.tip_text[settings.curindex]);
						},settings.eff_time);
							
						settings.auto_animates=settings.$slide_tipwrap.animate({
							"opacity":"0.6",
							"top":settings.itemheight-settings.tipheight
						},settings.eff_time)
						.delay(settings.times-(3*settings.eff_time))
						.animate({
							"opacity":"0.4",
							"top":settings.itemheight
						},settings.eff_time);
						
					}else{
						settings.auto_animates=settings.$slide_tipwrap.animate({
							"opacity":"0.6",
							"top":settings.itemheight-settings.tipheight
						},settings.eff_time);
						settings.$slide_tip.text(settings.tip_text[settings.curindex]);
						
						settings.$slide_tipwrap.delay(settings.times-(2*settings.eff_time))
						.animate({
							"opacity":"0.4",
							"top":settings.itemheight
						},settings.eff_time);
						
					}		
				}
			}
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
				opt.btn_action=false;
				self.slidePlay(opt);
			},opt.times);
		}
		
});