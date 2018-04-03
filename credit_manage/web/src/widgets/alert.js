/*
*author:yipin,
*name:common
*
* */

define(['zepto'],function($){
	  /*适配弹出框*/
		return {
			modal:function(d,t,flag){
					var $wrap=$('<div class="alert-mask"></div>'),
							$html=$('<div class="alert-modal"></div>'),
							$action='',
							title=d.title?d.title:'温馨提示',
							content=d.content?d.content:'',
							ok=d.ok?d.ok:'确定',
							no=d.no?d.no:'取消';
					
					$html.append('<div>' + title + '</div><div>' +content + '</div>');
					if(t==1){
						$action=$('<div class="modal-sure">' + ok + '</div>');
						$($('<div></div>').append($action)).appendTo($html);
					}else if(t==2){
						$action=$('<div class="modal-ok">' + ok + '</div><div class="modal-cancel">' + no + '</div>');
						$($('<div></div>').append($action)).appendTo($html);
					}
					$html.appendTo($wrap);					
					$(document.body).append($wrap);
					w.resize = function () {
							$html.css({
									top: parseInt(($wrap.height() - $html.height()) / 2),
									left: parseInt(($wrap.width() - $html.width()) / 2)
							});
					};
					w.resize();
					$(w).on('resize',w.resize);
					if(t===1||t===2){
						//存在按钮时，执行点击按钮
						$action.on($.EventName.click, function () {
								if ($(this).hasClass('modal-sure') && d.okfn){
									d.okfn();
								}	
								if ($(this).hasClass('modal-ok') && d.okfn){
									d.okfn();
								}	
								if ($(this).hasClass('modal-cancel') && d.nofn){
									d.nofn();
								}
								$wrap.remove();
						});
					}else if(t===0){
						//没有按钮时，返回一个对象引用
						return $wrap;
					}
					//没有点击按钮时
					if(flag&&$wrap){
						return $wrap;
					}
				}
		}
});