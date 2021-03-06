/*商品轮播图*/
(function($){
	'use strict';

	/*提示对象*/
	var sd_tip=new (public_tool.sureDialog())();

	function GoodsSlide(){}

	GoodsSlide.prototype.init=function(opt){
		$.extend(true,this,opt);
		var self=this;
		this.index=0;
		this.front=0;
		this.toolitem=this.$slide_tool.find('li');
		this.size=this.toolitem.size();

		if(this.size>=1){
			this.play(0);
			this.unbindEvent();
			this.bindEvent();
		}else{
			this.unbindEvent();
		}

	};

	GoodsSlide.prototype.bindEvent=function(){
		var self=this;

		/*绑定按钮*/
		this.$slide_tool.on('click','li',function(e){
			var target= e.target,
				nodename=target.nodeName.toLowerCase(),
				$this,
				index;

			if(self.isDelete&&nodename==='span'&&self.size>=2){
				/*提示处理*/
				sd_tip.sure('delete',function(cf){
					if(self.deleteFn&&typeof self.deleteFn==='function'){
						self.deleteFn.call(null,{
							$liitem:$(target).parent(),
							slideobj:self,
							tips:cf.dia
						});
					}else{
						$(target).parent().remove();
						self.init(self);
						cf.dia.content('<span class="g-c-bs-success g-btips-succ">删除数据成功</span>').show();
						setTimeout(function(){
							cf.dia.close();
						},2000);
					}
				});
				return false;
			}else{
				$this=$(this);
				index=$this.index();
				self.front=self.index;
				self.play(index);
			}
		});

		/*绑定删除*/
		if(this.isDelete&&this.size>=2){
			this.toolitem.hover(function(){
				$(this).find('span').addClass('slide-delete-active');
			},function(){
				$(this).find('span').removeClass('slide-delete-active');
			});
		}

		/*绑定左右切换*/
		this.$btnl.on('click',function(){
			if(self.index===0){
				return false;
			}
			self.front=self.index;
			self.index--
			self.play(self.index);
		});
		this.$btnr.on('click',function(){
			if(self.index===self.size - 1){
				return false;
			}
			self.front=self.index;
			self.index++;
			self.play(self.index);
		});
	};

	GoodsSlide.prototype.play=function(index){
		var self=this,
			$this=self.toolitem.eq(index);
		self.index=index;

		$this.addClass(self.active).siblings().removeClass(self.active);

		var $img=$this.find('img'),
			src=$img.attr('src');

		if(src.indexOf('qiniucdn.com')!==-1){
			if(src.indexOf('?imageView2')!==-1){
				src=src.split('?imageView2')[0]+'?imageView2/1/w/300/h/300';
			}else{
				src=src+'?imageView2/1/w/300/h/300';
			}
		}
		$('<div><img alt="" src="'+src+'" /></div>').appendTo(self.$image.html(''));

		/*索引范围判断*/
		if(self.len<self.size){
			var temphide=parseInt((self.len + 1)/2,10);
			if(index<=self.size - temphide + 1){
				if(index>self.len - temphide){
					if(index>self.front){
						for(var i=0;i<index - temphide;i++){
							self.toolitem.eq(i).addClass('g-d-hidei');
						}
					}else if(index<self.front){
						for(var j=self.size - 1;j>index - temphide;j--){
							self.toolitem.eq(j).removeClass('g-d-hidei');
						}
					}
				}else if(index<=self.len - 1){
					for(var k=0;k<index;k++){
						self.toolitem.eq(k).removeClass('g-d-hidei');
					}
				}
			}

		}

	};

	GoodsSlide.prototype.unbindEvent=function(){
		var self=this;
		this.$slide_tool.off('click');
		if(this.isDelete){
			this.toolitem.off('mouseenter mouseleave');
		}
		this.$btnl.off('click');
		this.$btnr.off('click');
	};

	/*构造函数*/
	GoodsSlide.prototype.GoodsSlide=function(opt){
		var self=this;

		this.init(opt);

	};


	//对外接口
	window.goodsSlide=window.goodsSlide||new GoodsSlide();

})(jQuery);