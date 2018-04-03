define(['jquery'],function($){
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
					     isBackground:false,
							 $slide_tipwrap:null,
							 $slide_tip:null,
							 tipheight:0,
							 itemheight:0,
							 winwidth:$(win).width(),
							 img_alt:false,
							 tip_text:[],
						   isMobile:(function(){
								 if(/(iPhone|iPod|Android|ios|iOS|iPad|Backerry|WebOS|Symbian|Windows Phone|Phone)/i.test(navigator.userAgent)){
									 return true;
								 }else{
									 return false;
								 }
							 }()),
							 btn_action:false,
							 btn_active:'slidebtn-active',
							 eff_time:500,
							 times:6000,
							 auto_animates:null
				 },options),
				 self=this;
				 
				//初始化
				self.slideInit(settings);

				/*tab 点击切换*/
				settings.$btnwrap.delegate('li', $.EventName.click,function(e){
					e.preventDefault();
					var $this=$(this);
					settings.curindex=$this.index();
					settings.btn_action=true;
					
					settings.$slide_img.animate({
						"left":-settings.curindex*settings.winwidth
					},settings.eff_time);
					
					$this.addClass(settings.btn_active)
					.siblings()
					.removeClass(settings.btn_active);
					
					if(settings.img_alt){
							self.slideEffect(settings);
					}else{
						settings.$slide_tipwrap.css({
							"opacity":"0.4",
							"top":settings.itemheight
						});
					}
				
				});
				
				/*mouse hover,out event*/
				//图片绑定鼠标事件
			    if(settings.size>1){
					if(settings.isMobile){
						//手机端
						settings.$wrap.on('mouseenter mouseleave',function(e){
							var type= e.type;

							if(type=='mouseenter'){
								//移入
								settings.$slide_tipwrap.stop(settings.auto_animates,true,false);
								clearInterval(settings.slide_id);
								settings.slide_id=null;

							}else if(type=='mouseleave'){
								//移出
								clearInterval(settings.slide_id);
								settings.slide_id=null;
								settings.slide_id=setInterval(function(){
									settings.btn_action=false;
									self.slidePlay(settings);
								},settings.times);
							}
						});
					}else{
						//pc端
						settings.$wrap.hover(function(){
							settings.$slide_tipwrap.stop(settings.auto_animates,true,false);
							clearInterval(settings.slide_id);
							settings.slide_id=null;
						},function(){
							clearInterval(settings.slide_id);
							settings.slide_id=null;
							settings.slide_id=setInterval(function(){
								settings.btn_action=false;
								self.slidePlay(settings);
							},settings.times);
						});
					}
				}

				//window resize
				if(settings.isresize){
					$(win).resize(function(){
						settings.winwidth=$(this).width();
						settings.winwidth=settings.winwidth<settings.minwidth?settings.minwidth:settings.winwidth;
						settings.$items.width(settings.winwidth);
						settings.$slide_img.css({
							"width":settings.size*settings.winwidth,
							"left":-settings.curindex*settings.winwidth
						});
					});
				}

		
		
		}
				 
		//初始化
		this.slideInit=function(settings){
				 var self=this;
				 settings.$items=settings.$slide_img.find("li");
				 settings.winwidth=settings.winwidth<settings.minwidth?settings.minwidth:settings.winwidth;
				 settings.$items.width(settings.winwidth);
				 settings.size=settings.$items.size();
				 settings.$btn=settings.$btnwrap.find('li');
				 settings.$slide_img.css({
						"width":settings.size*settings.winwidth
				 });
				 settings.tipheight=settings.$slide_tipwrap.height();
				 settings.itemheight=settings.$items.eq(0).height();
				 settings.$slide_tip=settings.$slide_tipwrap.find("p");
				 if(settings.$items.eq(0).find("img").attr("alt")){
					 settings.img_alt=true;
					 settings.$items.find("img").each(function(index){
						 settings.tip_text.push($(this).attr("alt"));
					 });
					 settings.$slide_tip.text(settings.tip_text[0]);
				 }else{
					 settings.img_alt=false;
					 settings.tip_text.length=0;
					 settings.$slide_tip.text('');
					 settings.$slide_tipwrap.css({
							"opacity":"0.4",
							"top":settings.itemheight
					 })
				 }

			     if(settings.size>1){
					 settings.slide_id=setInterval(function(){
						 self.slidePlay(settings);
					 },settings.times);
				 }else{
					 settings.$btnwrap.addClass('g-d-hidei');
				 }

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
				
				if(settings.img_alt){
					self.slideEffect(settings);
				}else{
					settings.$slide_tipwrap.css({
						"opacity":"0.4",
						"top":settings.itemheight
					});
				}
		};
		
		//效果函数
		this.slideEffect=function(settings){	
			var is_show=parseInt(settings.$slide_tipwrap.css("top"))+settings.tipheight;

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
		
		return this;
});