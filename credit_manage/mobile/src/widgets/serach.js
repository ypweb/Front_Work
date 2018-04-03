/***
name:search
author:yipin
params:obj={
	btn:清除内容按钮
	btnclass:清除内容按钮样式
	tips:提示函数
	fn:提交内容时的回调函数
}
搜索框相关事件初始化
***/

define(['jquery'],function($){
	$.fn.searchInit=function(obj){

		var $btn=obj['btn'],
			btnclass=obj['btnclass'],
			tips=obj['tips'],
			$input=this;

		if($input.val()!=''){
			$btn.addClass(btnclass);
		}else{
			$btn.removeClass(btnclass);
		}
		this.on('blur keyup keydown',function(e){
			var type=e.type,
				txt=$input.val();
			if(type=='blur'){
				if(txt==''){
					$btn.removeClass(btnclass);
				}
			}else if(type=='keyup'){
				if(txt==''){
					$btn.removeClass(btnclass);
				}else{
					$btn.addClass(btnclass);
				}
			}else if(type=='keydown'){
				if(e.which==13){
					e.preventDefault();
					if(txt==''){
						if(tips!==undefined){
							tips.content('<span class="g-btips-warn g-c-warn">搜索内容不能为空 </span>').show();
							setTimeout(function(){
								tips.close();
							},3000);
						}
					}else{
						obj['fn'].call(null,txt);
					}
					return false;
				}
			}
		});
		$btn.on('click',function(){
			var txt=$input.val();
			if(txt!==''){
				$input.val('').focus();
				$btn.removeClass(btnclass);
			}
		});
		return this;
	}
});