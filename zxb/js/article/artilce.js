(function($){
	"use strict";
	$(function(){
		/*dom引用*/
		var $content_wrap=$('#content_wrap'),
			$content_show=$('#content_show');


		/*重置绝对定位容器的高度*/
		$content_wrap.css({
			'min-height':$content_show.height() + 200
		});

	});

})(jQuery);