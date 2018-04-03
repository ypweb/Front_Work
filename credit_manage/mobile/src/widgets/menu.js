/*
name:menu
author:yipin
params:menu wrap id
菜单导航高亮
*/

define(['jquery'],function($){
		var menu={};

		//导航高亮
		var winurl=location.href,
			winsearch=location.search,
			winhash=location.hash,
			currenturl=winurl.lastIndexOf('/');

		menu['winurl']=winurl;
		if(currenturl!=-1){
			currenturl=winurl.slice(currenturl + 1);
			if(winsearch!==''){
				winsearch=currenturl.indexOf('?');
				currenturl=currenturl.slice(0,winsearch);
			}
			if(winhash!==''){
				winhash=currenturl.indexOf('#');
				currenturl=currenturl.slice(0,winhash);
			}

			menu['cururl']=currenturl;
		}

	    menu['menuLight']=function(wrap,classname){
			var $child=wrap.children(),
				len=$child.length,
				i=0;

			for(i;i<len;i++){
				var $this=$child.eq(i),
					href=$this.attr('href');
				if(currenturl.indexOf(href)!==-1){
					$this.addClass(classname);
					return false;
				}
			}
		};
		return menu;
});







