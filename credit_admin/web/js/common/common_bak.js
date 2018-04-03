
/*自定义扩展*/
(function($){
	'use strict';
	/*工具函数类*/
	var public_tool=window.public_tool||{};


	/*本地存储*/
	//缓存对象
	public_tool.cache={};
	//判断是否支持本地存储
	public_tool.supportStorage=(function(){
		return sessionStorage?true:false;
	}());
	//设置本地存储
	public_tool.setParams=function(key,value,flag){
		if(this.supportStorage){
			if(flag){
				sessionStorage.setItem(key,value);
			}else{
				sessionStorage.setItem(key,JSON.stringify(value));
			}
		}
	};
	//获取本地存储
	public_tool.getParams=function(key,flag){
		if(this.supportStorage){
			if(flag){
				return sessionStorage.getItem(key)||null;
			}else{
				return JSON.parse(sessionStorage.getItem(key))||null;
			}
		}
		return null;
	};
	//删除本地存储
	public_tool.removeParams=function(key){
		if(this.supportStorage){
			sessionStorage.removeItem(key);
		}
	};
	//清除本地存储
	public_tool.clear=function(){
		if(this.supportStorage){
			sessionStorage.clear();
		}
	};
	//遍历本地存储
	public_tool.getEachParams=function(flag){
		if(this.supportStorage){
			var len=sessionStorage.length,
				i= 0,
				res=[],
				key,
				value;
			if(len!==0){
				for(i;i<len;i++){
					key=sessionStorage.key(i);
					if(flag){
						value=sessionStorage.getItem(key);
					}else{
						value=JSON.parse(sessionStorage.getItem(key));
					}
					res.push(value);
				}
				return res;
			}else{
				return null;
			}
		}
		return null;
	};


	/*弹窗*/
	//是否支持弹窗
	public_tool.supportDia=(function(){
		return (typeof dialog==='function'&&dialog)?true:false;
	}());
	//弹窗确认
	public_tool.dialog=function(){
		if(!this.supportDia){
			return null;
		}

		//缓存区对象
		var keyflag=false,
				seq_id=null,
				fn_cache={},
				res={};

		fn_cache.isFn=false;

		var dia=dialog({
			title:'温馨提示',
			cancelValue:'取消',
			okValue:'确定',
			width:300,
			ok:function(){
				var self=this;
				if(keyflag){
					if(fn_cache[seq_id].fn&&typeof fn_cache[seq_id].fn==='function'){
						fn_cache[seq_id].fn.call(self);
							delete fn_cache[seq_id].fn;
					}else{
						self.close();
						fn_cache[seq_id].fn=fn_cache[seq_id].FN;
					}
				}else{
					if(fn_cache.fn&&typeof fn_cache.fn==='function'){
						fn_cache.fn.call(self);
						delete fn_cache.fn;
					}else{
						self.close();
						fn_cache.fn=fn_cache.FN;
					}
				}
				return false;
			},
			cancel:function(){
				var self=this;
				self.close();
				return false;
			}
		});
		//设置对外接口
		/*设置回调*/
		var setFn=function(newfn,key){
			if(typeof key==='string'){
				keyflag=true;
				seq_id=key;
				fn_cache[seq_id]={};
				fn_cache[seq_id].isFn=true;
				fn_cache[seq_id].fn=fn_cache[seq_id].FN=newfn;
			}else{
				keyflag=false;
				seq_id=null;
				fn_cache.isFn=true;
				fn_cache.fn=fn_cache.FN=newfn;
			}
		}
		/*设置回调判断*/
		var isFn=function(key){
			return (key===seq_id	&&	key)?fn_cache[seq_id].isFn:fn_cache.isFn;
		}

		//返回对外接口
		res={
			dialog:dia,
			setFn:setFn,
			isFn:isFn
		}
		return res;
	};



	/*工具类*/
	//判断闰年
	public_tool.isLeapYear=function(y, m) {
		var m_arr = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
		var isly = (y % 4 == 0 && y % 100 != 0 )? true : y % 400 == 0 ? true : false;
		isly ? m_arr.splice(1, 1, 29) : m_arr.splice(1, 1, 28);
		return m?{isly: isly,months: m_arr,m: m_arr[parseInt(m, 10) - 1]}:{isly: isly,months: m_arr}
	};
	//将人民币转换成大写
	public_tool.toUpMoney=function(str,wraps){
		var cn_zero = "零",
			cn_one = "壹",
			cn_two = "贰",
			cn_three = "叁",
			cn_four = "肆",
			cn_five = "伍",
			cn_six = "陆",
			cn_seven = "柒",
			cn_height = "捌",
			cn_nine = "玖",
			cn_ten = "拾",
			cn_hundred = "佰",
			cn_thousand = "仟",
			cn_ten_thousand = "万",
			cn_hundred_million = "亿",
			cn_symbol="",
			cn_dollar = "元",
			cn_ten_cent = "角",
			cn_cent = "分",
			cn_integer = "整",
			integral,
			decimal,
			outputCharacters,
			parts,
			digits,
			radices,
			bigRadices,
			decimals,
			zeroCount,
			i,
			p,
			d,
			quotient,
			modulus,
			tvs=str.toString(),
			formatstr = tvs.replace(/^0+/,""),
			parts =formatstr.split(".");

		if (parts.length > 1) {
			integral = parts[0];
			decimal = parts[1];
			decimal = decimal.slice(0, 2);
		}else {
			integral = parts[0];
			decimal = "";
		}
		digits =[cn_zero, cn_one, cn_two, cn_three, cn_four, cn_five, cn_six, cn_seven, cn_height, cn_nine];
		radices =["", cn_ten, cn_hundred, cn_thousand];
		bigRadices =["", cn_ten_thousand, cn_hundred_million];
		decimals =[cn_ten_cent,cn_cent];
		outputCharacters = "";
		if (Number(integral) > 0) {
			zeroCount = 0;
			for (i = 0; i < integral.length; i++) {
				p = integral.length - i - 1;
				d = integral.substr(i, 1);
				quotient = p / 4;
				modulus = p % 4;
				if (d == "0") {
					zeroCount++;
				}else {
					if (zeroCount > 0){
						outputCharacters += digits[0];
					}
					zeroCount = 0;
					outputCharacters += digits[Number(d)] + radices[modulus];
				}
				if (modulus == 0 && zeroCount < 4){
					outputCharacters += bigRadices[quotient];
				}
			}
			outputCharacters += cn_dollar;
		}
		if (decimal != "") {
			for (i = 0; i < decimal.length; i++) {
				d = decimal.substr(i, 1);
				if (d != "0") {
					outputCharacters += digits[Number(d)] + decimals[i];
				}
			}
		}
		if (outputCharacters == "") {
			outputCharacters = cn_zero + cn_dollar;
		}
		if (decimal == "") {
			outputCharacters += cn_integer;
		}
		outputCharacters = cn_symbol + outputCharacters;

		if(wraps){
			return wraps.innerHTML=outputCharacters;
		}else{
			return outputCharacters;
		}
	};
	//银行卡格式化
	public_tool.cardFormat=function(str){
		var cardno=str.toString().replace(/\s*/g,'');
		if(cardno==''){
			return '';
		}
		cardno=cardno.split('');
		var len=cardno.length,
			i=0,
			j=1;
		for(i;i<len;i++){
			if(j%4==0&&j!=len){
				cardno.splice(i,1,cardno[i]+" ");
			}
			j++;
		}
		return cardno.join('');
	};
	//手机格式化
	public_tool.phoneFormat=function(str){
		var phoneno=str.toString().replace(/\s*/g,'');
		if(phoneno==''){
			return '';
		}
		phoneno=phoneno.split('');

		var len=phoneno.length,
			i=0;
		for(i;i<len;i++){
			var j=i+2;
			if(i!=0){
				if(i==2){
					phoneno.splice(i,1,phoneno[i]+" ");
				}else if(j%4==0&&j!=len+1){
					phoneno.splice(i,1,phoneno[i]+" ");
				}
			}
		}
		return phoneno.join('');
	};
	//密码强度(当前密码，提示信息，密码起始范围(数组))
	public_tool.pwdStrong=function(str,tip,scope){
		var score=0,
			txt=this.trims(str),
			len=txt==''?0:txt.length,
			reg1=/[a-zA-Z]+/,
			reg2=/[0-9]+/,
			reg3=/\W+\D+/;
		if(len>=scope[0]&&len<=scope[1]){
			if(reg1.test(txt) && reg2.test(txt) && reg3.test(txt)) {
				score=90;
			}else if(reg1.test(txt) || reg2.test(txt) || reg3.test(txt)) {
				if(reg1.test(txt) && reg2.test(txt)){
					score=60;
				}else if(reg1.test(txt) && reg3.test(txt)) {
					score=60;
				}else if(reg2.test(txt) && reg3.test(txt)) {
					score=60;
				}else{
					score=30;
				}
			}
			if(score<=50){
				tip.removeClass().addClass('g-c-gray2').html('低级');
			}else if(score<=79&&50<score){
				tip.removeClass().addClass('g-c-orange').html('中级');
			}else if(score>=80){
				tip.removeClass().addClass('g-c-red4').html('高级');
			}
		}else if(txt==""||txt=="null"){
			tip.removeClass().addClass('g-c-gray2').html('');
		}else if(txt!=""&&len<scope[0]){
			tip.removeClass().addClass('g-c-red4').html('密码长度至少大于'+scope[0]+'位');
		}else{
			tip.removeClass().addClass('g-c-gray2').html('');
		}
	};
	//读秒（定时函数引用，秒数，读秒按钮,可用状态下文字信息，切换的class名称）
	public_tool.getCount=function(tid,times,nodes,text,classname){
		var count=0,
			id=tid,
			t=times,
			n=nodes,
			timer=this.getTimer();
		n.html(times+'秒后重新获取').prop("disabled",true).addClass(classname);
		id=setInterval(function(){
			count=timer();
			count=count<=t?count:count%t;
			n.html((t-count)+'秒后重新获取');
			if(count==t||count==0){
				clearInterval(id);
				tid=null;
				id=null;
				n.prop("disabled",false).removeClass(classname).html(function(){
					if(nodes.attr('data-value')){
						return nodes.attr('data-value');
					}else{
						return text;
					}

				});
			};
		},1000);
	};
	//去除所有空格（字符串,需去除字符)：返回字符串
	public_tool.trimSep=function(str,sep){
		return str.replace(new RegExp('\\'+sep,'g'),'');
	};
	//去除所有空格（字符串）：返回字符串
	public_tool.trims=function(str){
		return str.replace(/\s*/g,'');
	};
	//去除前后空格(字符串)：返回字符串
	public_tool.trim=function(str){
		return str.replace(/^\s*\s*$/,'');
	};
	//计时器：返回整数
	public_tool.getTimer=function(){
		var i=0;
		return function(){
			return ++i;
		};
	};
	/*是否为正确身份证(身份证字符串)：返回布尔值*/
	public_tool.isIDCard=function(str){
		var area={
				'11':"北京",'12':"天津",'13':"河北",'14':"山西",'15':"内蒙古",'21':"辽宁",'22':"吉林",'23':"黑龙江",'31':"上海",'32':"江苏",'33':"浙江",'34':"安徽",'35':"福建",'36':"江西",'37':"山东",'41':"河南",'42':"湖北",'43':"湖南",'44':"广东",'45':"广西",'46':"海南",'50':"重庆",'51':"四川",'52':"贵州",'53':"云南",'54':"西藏",'61':"陕西",'62':"甘肃",'63':"青海",'64':"宁夏",'65':"新疆",'71':"台湾",'81':"香港",'82':"澳门",'91':"国外"
			},
			wf=[7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2],
			last=[1,0,'x',9,8,7,6,5,4,3,2],
			idcard=this.trims(str.toString()),
			len=idcard.length;
		//判断是否为有效位
		if(idcard===''||len<15||(len>15&&len<18)||len>18){
			return false;
		}else{
			//是否为为数字
			var nums=0,
				nlen=0;
			if(len===18){
				nums=idcard.slice(0,17).replace(/\D*/g,'');
			}else if(len===15){
				nums=idcard.slice(0,14).replace(/\D*/g,'');
			}
			nlen=nums.length;
			if(nlen<14||(nlen>14&&nlen<17)){
				return false;
			}
			//是否为有效地区
			if(area[idcard.slice(0,2)]==null){
				return false;
			}
			var years,
				months,
				days,
				sex;
			if(len===18){
				years=parseInt(idcard.slice(6,10));
				months=parseInt(idcard.slice(10,12));
				days=parseInt(idcard.slice(12,14));
				sex=parseInt(idcard.slice(16,17));
			}else if(len===15){
				years=parseInt(idcard.slice(6,8)) + 1900;
				months=parseInt(idcard.slice(8,10));
				days=parseInt(idcard.slice(10,12));
				sex=parseInt(idcard.slice(14));
			}
			//是否为有效月份
			if(months>12||months<1){
				return false;
			}
			//是否为有效天
			if(days<1){
				return false;
			}
			var leapyear=this.isLeapYear(years,months);
			if((leapyear.isly&&months===2&&days>29)||(!leapyear.isly&&months===2&&days>28)||(months!==2&&leapyear.m<days)){
				return false;
			}
			//是否为正确识别码
			if(len===18){
				var temparr=idcard.split(''),
					tempmax=0,
					i=0,
					haves=0,
					ids=parseInt(idcard.slice(17)),
					tempids=0;
				if(isNaN(ids)){
					ids='x';
				}
				for(i;i<17;i++){
					tempmax+=wf[i]*parseInt(temparr[i]);
				}
				haves=tempmax%11;
				tempids=last[haves];
				if(ids!=tempids){
					return false;
				}
			}
		}
		return true;
	};


	/*左侧菜单导航*/
	//加载左侧菜单
	public_tool.loadSideMenu=function($menu,$wrap){

		var self=this,
			//cacheMenu=self.getParams('menu_module'),
			currentfile=location.pathname,
			cp_prefix=currentfile.lastIndexOf('/'),
			cp_suffix=currentfile.lastIndexOf('.'),
			path=currentfile.slice(cp_prefix + 1,cp_suffix),
			url='',
			isindex=path===''?true:path.indexOf('index')!==-1;

		if(isindex){
			//如果判断是主页
			/*if(cacheMenu){
				self.removeParams('menu_module');
				cacheMenu=null;
			}*/
			url='../json/common/menu.json';
		}else{
			url='../../json/common/menu.json';
		}


		/*if(cacheMenu){
			/!*如果存在缓存，则读取缓存*!/
			//放入dom中
			$(cacheMenu).appendTo($menu.html(''));
			//初始化
			self.initSideMenu($wrap);
			return;
		}else{*/
			/*如果不存在缓存，则重新请求并放入缓存*/
			$.ajax({
				url:url||"../json/common/menu.json",
				async:true,
				type:"post",
				dataType:"json"
			}).done(function(data){
				var menu=data.menu,
					len=menu.length,
					menustr='',
					i=0,
					j=0,
					k=0,
					key='menuitem',
					suffix='.html',
					link='',
					item=null,
					sublen='',
					templen='',
					subitem=null;


				for(i;i<len;i++){
					item=menu[i];
					link=item.link;
					if(isindex){
						//当前页为首页的情况
					}else{
						//当前页为其他页的情况
					}


					if(i===0){
						//首页数据
						//如果是当前路径和当前模块一致
						if(path===''||(path==='index'&&link===path)){
							menustr='<li data-module="'+item.module+'"><a href=\"'+item.link+suffix+'\"><i class=\"'+item.class+'\"></i><span>'+item.name+'</span></a></li>';
						}else{
							//如果是当前路径和当前模块不一致
							menustr='<li data-module="'+item.module+'"><a href=\"../'+item.link+suffix+'\"><i class=\"'+item.class+'\"></i><span>'+item.name+'</span></a></li>';
						}
					}else{
						//其他模块
						//如果是当前路径和当前模块一致
						if(link===path){
							menustr+='<li data-module="'+item.module+'" class="has-sub"><a href=\"'+link+suffix+'\"><i class=\"'+item.class+'\"></i><span>'+item.name+'</span></a>';
						}else{
							menustr+='<li data-module="'+item.module+'" class="has-sub"><a href=\"../'+item.module+'/'+link+suffix+'\"><i class=\"'+item.class+'\"></i><span>'+item.name+'</span></a>';
						}
						//子菜单循环
						if(typeof (subitem=item[key])!=='undefined'){
							menustr+="<ul>";
							sublen=subitem.length;
							j=0;
							for(j;j<sublen;j++){

								item=subitem[j];
								if(link===path){
									menustr+='<li data-module="'+item.module+'"><a href=\"'+item.link+suffix+'\"><span>'+item.name+'</span></a></li>';
								}else{
									menustr+='<li data-module="'+item.module+'"><a href=\"../'+item.module+'/'+item.link+suffix+'\"><span>'+item.name+'</span></a></li>';
								}

								/*if(typeof (subitem=item[key])!=='undefined'){
								 menustr+="<ul>";
								 templen=subitem.length;
								 k=0;
								 for(k;k<templen;k++){
								 item=subitem[k];
								 if(link===path){
								 menustr+='<li><a href=\"'+item.link+suffix+'\"><span>'+item.name+'</span></a></li>';
								 }else{
								 menustr+='<li><a href=\"../'+item.module+'/'+item.link+suffix+'\"><span>'+item.name+'</span></a></li>';
								 }
								 }
								 menustr+="</ul>";
								 }*/
							}
							menustr+="</li></ul>";
						}
					}
				}

				//放入本地存储(除了首页之外)
				/*if(!isindex){
					self.setParams('menu_module',menustr);
				}*/

				//放入dom中
				$(menustr).appendTo($menu.html(''));

				//调用菜单渲染
				self.initSideMenu($wrap);

			}).fail(function(){
				console.log('error');
			});
		//}
	};
	//卸载左侧菜单条
	public_tool.removeSideMenu=function($menu){
		//清除dom节点
		$menu.html('');
		//清除本地存储缓存
		this.removeParams('menu_module');
	};
	//初始化左侧导航
	public_tool.initSideMenu=function($wrap){
		var self=this;
		if($wrap.length){
			var $items_with_subs = $wrap.find('li:has(> ul)'),
				toggle_others = $wrap.hasClass('toggle-others');

			$items_with_subs.filter('.active').addClass('expanded');

			$items_with_subs.each(function(i, el){
				var $li = $(el),
					$a = $li.children('a'),
					$sub = $li.children('ul');
				$li.addClass('has-sub');
				$a.on('click', function(ev){
					ev.preventDefault();

					if(toggle_others){
						/*其他节点操作*/
						self.siblingsSideMenu($li,$wrap);
					}

					if($li.hasClass('expanded') || $li.hasClass('opened')){
						/*收缩*/
						self.collapseSideMenu($li, $sub,$wrap);
					}else{
						/*展开*/
						self.expandSideMenu($li, $sub,$wrap);
					}

				});
			});
		}
	};
	//导航展开服务类
	public_tool.expandSideMenu=function($li,$sub,$wrap){
		var self=this;
		if($li.data('is-busy') || ($li.parent('.main-menu').length && $wrap.hasClass('collapsed'))){
			return;
		}

		$li.addClass('expanded').data('is-busy', true);
		$sub.show();

		var $sub_items 	  = $sub.children(),
			sub_height	= $sub.outerHeight(),

			win_y			 = $(window).height(),
			total_height	  = $li.outerHeight(),
			current_y		 = $wrap.scrollTop(),
			item_max_y		= $li.position().top + current_y,
			fit_to_viewpport  = $wrap.hasClass('fit-in-viewport');

		$sub_items.addClass('is-hidden');
		$sub.height(0);


		TweenMax.to($sub,0.2, {
			css: {
				height: sub_height
			},
			onUpdate:self.scrollUpdate.call(self,true,$wrap),
			onComplete: function(){
				$sub.height('');
			}
		});

		var interval_1 = $li.data('sub_i_1'),
			interval_2 = $li.data('sub_i_2');

		window.clearTimeout(interval_1);

		interval_1 = setTimeout(function(){
			$sub_items.each(function(i, el){
				var $sub_item = $(el);
				$sub_item.addClass('is-shown');
			});

			var finish_on = 150 * $sub_items.length,
				t_duration = parseFloat($sub_items.eq(0).css('transition-duration')),
				t_delay = parseFloat($sub_items.last().css('transition-delay'));

			if(t_duration && t_delay){
				finish_on = (t_duration + t_delay) * 1000;
			}

			window.clearTimeout(interval_2);

			interval_2 = setTimeout(function(){
				$sub_items.removeClass('is-hidden is-shown');

			}, finish_on);


			$li.data('is-busy', false);

		}, 0);

		$li.data('sub_i_1', interval_1);
		$li.data('sub_i_2', interval_2);

	};
	//导航收缩服务类
	public_tool.collapseSideMenu=function($li, $sub,$wrap){
		var self=this;
		if($li.data('is-busy')){
			return;
		}

		var $sub_items = $sub.children();

		$li.removeClass('expanded').data('is-busy', true);
		$sub_items.addClass('hidden-item');

		TweenMax.to($sub, 0.2, {
			css: {
				height: 0
			},
			onUpdate:self.scrollUpdate.call(self,true,$wrap),
			onComplete: function() {
				$li.data('is-busy', false).removeClass('opened');

				$sub.attr('style', '').hide();
				$sub_items.removeClass('hidden-item');

				$li.find('li.expanded ul').attr('style', '').hide().parent().removeClass('expanded');

				self.scrollUpdate(true,$wrap);
			}
		});

	};
	//导航切换服务类
	public_tool.siblingsSideMenu=function($li,$wrap){
		var self=this;
		$li.siblings().not($li).filter('.expanded, .opened').each(function(i, el){
			var $_li = $(el),
				$_sub = $_li.children('ul');

			self.collapseSideMenu($_li, $_sub,$wrap);
		});
	};
	//模拟滚动条更新
	public_tool.scrollUpdate=function(flag,$wrap){
		var self=this;
		if(isxs()){
			return;
		}
		if($.isFunction($.fn.perfectScrollbar)){
			if($wrap.hasClass('collapsed')){
				return;
			}

			$wrap.find('.sidebar-menu-inner').perfectScrollbar('update');

			if(flag){
				this.scrollDestroy($wrap);
				this.scrollInit($wrap);
			}
		}
	};
	//模拟滚动条初始化
	public_tool.scrollInit=function($wrap){
		if(isxs()){
			return;
		}


		if($.isFunction($.fn.perfectScrollbar)){
			if($wrap.hasClass('collapsed') || ! $wrap.hasClass('fixed')){
				return;
			}

			$wrap.find('.sidebar-menu-inner').perfectScrollbar({
				wheelSpeed: 2,
				wheelPropagation:true
			});
		}
	};
	//模拟滚动条摧毁
	public_tool.scrollDestroy=function($wrap){
		if($.isFunction($.fn.perfectScrollbar)){
			$wrap.find('.sidebar-menu-inner').perfectScrollbar('destroy');
		}
	};

	window.public_tool=public_tool;
})(jQuery);



var public_vars = public_vars || {};

;(function($, window, undefined){
	
	"use strict";
	//初始化加载
	$(function(){	

		public_vars.$body                 = $("body");
		public_vars.$pageContainer        = public_vars.$body.find(".page-container");
		public_vars.$horizontalNavbar     = public_vars.$body.find('.navbar.horizontal-menu');
		public_vars.$horizontalMenu       = public_vars.$horizontalNavbar.find('.navbar-nav');

		public_vars.$mainFooter           = public_vars.$body.find('footer.main-footer');
		
		public_vars.$userInfoMenuHor      = public_vars.$body.find('.navbar.horizontal-menu');
		public_vars.$userInfoMenu         = public_vars.$body.find('nav.navbar.user-info-navbar');
		
		public_vars.$settingsPane         = public_vars.$body.find('.settings-pane');
		public_vars.$settingsPaneIn       = public_vars.$settingsPane.find('.settings-pane-inner');


		
		public_vars.defaultColorsPalette = ['#68b828','#7c38bc','#0e62c7','#fcd036','#4fcdfc','#00b19d','#ff6264','#f7aa47'];



		//自定义扩展变量
		var $main_menu=$('#main_menu'),
			$main_menu_wrap=$('#main_menu_wrap'),
			$page_loading_wrap=$('#page_loading_wrap'),
			$main_content=$('#main_content');
		
		
		
		//加载成功隐藏动画
		if ($page_loading_wrap.length) {
			$(window).load(function() {
				$page_loading_wrap.addClass('loaded');
			});
		}
		
		//加载失败
		window.onerror = function() {
			$page_loading_wrap.addClass('loaded');
		};


		//加载左侧导航
		public_tool.loadSideMenu($main_menu,$main_menu_wrap);




		//计算左侧菜单滚动条
		if (public_vars.$mainFooter.hasClass('sticky')) {
			stickFooterToBottom($main_content,$main_menu_wrap);
			$(window).on('xenon.resized',{
				$content:$main_content,
				$wrap:$main_menu_wrap
			},stickFooterToBottom);
		}
		
		
		//模拟滚动条
		if ($.isFunction($.fn.perfectScrollbar)) {
			if ($main_menu_wrap.hasClass('fixed')){
				public_tool.scrollInit($main_menu_wrap);
			} 

			// Scrollable
			$("div.scrollable").each(function(i, el) {
				var $this = $(el),
					max_height = parseInt(attrDefault($this, 'max-height', 200), 10);

				max_height = max_height < 0 ? 200 : max_height;

				$this.css({
					maxHeight: max_height
				}).perfectScrollbar({
					wheelPropagation: true
				});
			});
		}


		//计算左侧菜单滚动条
		if (public_vars.$mainFooter.hasClass('fixed')) {
			$main_content.css({
				paddingBottom: public_vars.$mainFooter.outerHeight(true)
			});
		}
		
		
		
		//返回顶部
		$('body').on('click', 'a[rel="go-top"]', function(ev) {
			ev.preventDefault();

			var obj = {
				pos: $(window).scrollTop()
			};

			TweenLite.to(obj, 0.3, {
				pos: 0,
				ease: Power4.easeOut,
				onUpdate: function() {
					$(window).scrollTop(obj.pos);
				}
			});
		});
		
		
		
		
		//用户信息下拉列表
		if(public_vars.$userInfoMenu.length){
			public_vars.$userInfoMenu.find('.user-info-menu > li').css({
				minHeight: public_vars.$userInfoMenu.outerHeight() - 1
			});
		}


		//表单验证
		if($.isFunction($.fn.validate)) {
			$("form.validate").each(function(i, el) {
				var $this = $(el),
					opts = {
						rules: {},
						messages: {},
						errorElement: 'span',
						errorClass: 'validate-has-error',
						highlight: function (element) {
							$(element).closest('.form-group').addClass('validate-has-error');
						},
						unhighlight: function (element) {
							$(element).closest('.form-group').removeClass('validate-has-error');
						},
						errorPlacement: function (error, element)
						{
							if(element.closest('.has-switch').length) {
								error.insertAfter(element.closest('.has-switch'));
							}
							else if(element.parent('.checkbox, .radio').length || element.parent('.input-group').length) {
								error.insertAfter(element.parent());
							} else {
								error.insertAfter(element);
							}
						}
					},
					$fields = $this.find('[data-validate]');

				$fields.each(function(j, el2) {
					var $field = $(el2),
						name = $field.attr('name'),
						validate = attrDefault($field, 'validate', '').toString(),
						_validate = validate.split(',');


					for(var k in _validate){
						var rule = _validate[k],
							params,
							message;

						if(typeof opts['rules'][name] == 'undefined'){
							opts['rules'][name] = {};
							opts['messages'][name] = {};
						}



						if($.inArray(rule, ['required', 'url', 'email', 'number', 'date','zh_phone','poe','money','num']) != -1){
							opts['rules'][name][rule] = true;

							message = $field.data('message-' + rule);

							if(message){
								opts['messages'][name][rule] = message;
							}
						} else if(params = rule.match(/(\w+)\[(.*?)\]/i)) {
							if($.inArray(params[1], ['min', 'max', 'minlength', 'maxlength', 'dotminlength', 'dotmaxlength', 'equalTo']) != -1) {
								opts['rules'][name][params[1]] = params[2];


								message = $field.data('message-' + params[1]);

								if(message) {
									opts['messages'][name][params[1]] = message;
								}
							}
						}
					}
				});



				if(public_tool.cache){
					public_tool.cache['form_opt_'+i]=opts;
				}else{
					$this.validate(opts);
				}

			});
		}

		
		//登陆获取焦点隐藏默认文字
		$(".login-form .form-group:has(label)").each(function(i, el)
		{
			var $this = $(el),
				$label = $this.find('label'),
				$input = $this.find('.form-control');
			
			$input.on('focus', function()
			{
				$this.addClass('is-focused');
			});
			
			$input.on('keydown', function()
			{
				$this.addClass('is-focused');
			});
				
			$input.on('blur', function()
			{
				$this.removeClass('is-focused');
				
				if($input.val().trim().length > 0)
				{
					$this.addClass('is-focused');
				}
			});
			
			$label.on('click', function()
			{
				$input.focus();
			});
			
			if($input.val().trim().length > 0)
			{
				$this.addClass('is-focused');
			}
		});
		
		
		
		
		


	});
	
	

	function stickFooterToBottom($content,$wrap){
		public_vars.$mainFooter.add($content).add( $wrap).attr('style', '');

		if(isxs()){
			return false;
		}

		if(public_vars.$mainFooter.hasClass('sticky')){
			var win_height				 = jQuery(window).height(),
				footer_height			= public_vars.$mainFooter.outerHeight(true),
				main_content_height	  = public_vars.$mainFooter.position().top + footer_height,
				main_content_height_only = main_content_height - footer_height,
				extra_height			 = public_vars.$horizontalNavbar.outerHeight();


			if(win_height > main_content_height - parseInt(public_vars.$mainFooter.css('marginTop'), 10))
			{
				public_vars.$mainFooter.css({
					marginTop: win_height - main_content_height - extra_height
				});
			}
		}
	}



	
})(jQuery, window);

	//设置属性
	function attrDefault($el, data_var, default_val){
		if(typeof $el.data(data_var) !=='undefined'){
			return $el.data(data_var);
		}
		return default_val;
	}

