
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
		return localStorage&&sessionStorage?true:false;
	}());
	//设置本地存储
	public_tool.setParams=function(key,value,flag){
		if(this.supportStorage){
			if(flag){
				/*为localstorage*/
				sessionStorage.setItem(key,JSON.stringify(value));
			}else{
				/*默认为localstorage*/
				localStorage.setItem(key,JSON.stringify(value));
			}
		}
	};
	//获取本地存储
	public_tool.getParams=function(key,flag){
		if(this.supportStorage){
			if(flag){
				return JSON.parse(sessionStorage.getItem(key))||null;
			}else{
				return JSON.parse(localStorage.getItem(key))||null;
			}
		}
		return null;
	};
	//删除本地存储
	public_tool.removeParams=function(key,flag){
		if(this.supportStorage){
			if(flag){
				sessionStorage.removeItem(key);
			}else{
				localStorage.removeItem(key);
			}
		}
	};
	//清除本地存储
	public_tool.clear=function(flag){
		if(this.supportStorage){
			if(flag){
				sessionStorage.clear();
			}else{
				localStorage.clear();
			}
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
						value=JSON.parse(sessionStorage.getItem(key));
					}else{
						value=JSON.parse(localStorage.getItem(key));
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
	/*菜单id映射*/
	public_tool.menuMap={
		"0":{
			"name":"主页",
			"code":"index",
			"match":"index",
			"class":"menu-ux-home",
			"module":"",
			"modid":"0"
		},
		"1":{
			"name":"系统管理",
			"code":"admin",
			"match":"-admin-",
			"class":"menu-ux-admin",
			"module":"admin",
			"modid":"1",
			"prid":{
				1:{
					"funcCode": "admin-message-management",
          "funcName": "消息管理"
				},
				2:{
					"funcCode": "admin-role-add",
          "funcName": "角色增加"
				},
				3:{
					"funcCode": "admin-role-update",
          "funcName": "角色修改"
				},
				4:{
					"funcCode": "admin-role-delete",
          "funcName": "角色删除"
				},
				5:{
					"funcCode": "admin-setting",
          "funcName": "系统设置"
				},
				6:{
					"funcCode": "admin-permission-management",
          "funcName": "权限管理"
				},
				7:{
					 "funcCode": "admin-member-add",
           "funcName": "成员增加"
				},
				8:{
					 "funcCode": "admin-member-update",
           "funcName": "成员修改"
				},
				9:{
					 "funcCode": "admin-member-delete",
           "funcName": "成员删除"
				}
			}
		},
		"6":{
			"name":"广告管理",
			"code":"ad",
			"match":"-ad-",
			"class":"menu-ux-ad",
			"module":"ad",
			"modid":"6",
			"prid":{
				10:{
					"funcCode": "ad-article-shelves",
          "funcName": "文章广告上架/下架"
				},
				11:{
					 "funcCode": "ad-article-update",
           "funcName": "文章广告修改"
				},
				12:{
					"funcCode": "ad-articlepic-shelves",
          "funcName": "文章图片广告上架/下架"
				},
				13:{
					"funcCode": "ad-articlepic-update",
          "funcName": "文章图片广告修改"
				},
				14:{
					"funcCode": "ad-homepic-shelves",
          "funcName": "首页图片广告上架/下架"
				},
				15:{
					"funcCode": "ad-homepic-update",
          "funcName": "首页图片广告修改"
				},
				16:{
					 "funcCode": "ad-servicepic-shelves",
           "funcName": "服务栏图片广告上架/下架"
				},
				17:{
					"funcCode": "ad-servicepic-update",
          "funcName": "服务栏图片广告修改"
				}
			}
		},
		"11":{
			"name":"用户管理",
			"code":"user",
			"match":"-user-",
			"class":"menu-ux-user",
			"module":"user",
			"modid":"11",
			"prid":{
				18:{
					"funcCode": "user-account-view",
					"funcName": "帐号查看"
				},
				19:{
					"funcCode": "user-account-update",
					"funcName": "帐号修改"
				},
				20:{
					"funcCode": "user-account-delete",
					"funcName": "帐号删除"
				},
				21:{
					"funcCode": "user-horse-add",
					"funcName": "马甲用户添加"
				},
				22:{
					"funcCode": "user-horse-update",
					"funcName": "马甲用户修改"
				},
				23:{
					"funcCode": "user-horse-delete",
					"funcName": "马甲用户删除"
				}
			}
		},
		"19":{
			"name":"内容管理",
			"code":"content",
			"match":"-content-",
			"class":"menu-ux-article",
			"module":"content",
			"modid":"19",
			"prid":{
				24:{
					"funcCode": "content-article-view",
					"funcName": "文章查看"
				},
				25:{
					"funcCode": "content-article-verify",
					"funcName": "文章审核"
				},
				26:{
					"funcCode": "content-article-stick",
					"funcName": "文章置顶"
				},
				27:{
					"funcCode": "content-article-delete",
					"funcName": "文章删除"
				},
				28:{
					"funcCode": "content-article-update",
					"funcName": "文章修改"
				},
				29:{
					"funcCode": "content-article-extend",
					"funcName": "文章推广"
				},
				30:{
					"funcCode": "content-comment-view",
					"funcName": "评论查看"
				},
				31:{
					"funcCode": "content-comment-verify",
					"funcName": "评论审核"
				},
				32:{
					"funcCode": "content-comment-spider",
					"funcName": "内容抓取"
				},
				33:{
					"funcCode": "content-article-publish",
					"funcName": "发布文章"
				},
				34:{
					"funcCode": "content-user-feedback",
					"funcName": "用户反馈"
				},
				35:{
					"funcCode": "content-channel-setting",
					"funcName": "频道设置"
				}
			}
		},
		"28":{
			"name":"服务栏管理",
			"code":"service",
			"match":"-service-",
			"class":"menu-ux-serve",
			"module":"service",
			"modid":"28",
			"prid":{
				36:{
					"funcCode": "service-add",
					"funcName": "增加服务"
				},
				37:{
					"funcCode": "service-update",
					"funcName": "修改服务"
				},
				38:{
					"funcCode": "service-delete",
					"funcName": "删除服务"
				}
			}
		},
		"30":{
			"name":"信用卡管理",
			"code":"credit",
			"match":"-credit-",
			"class":"menu-ux-credit",
			"module":"credit",
			"modid":"30",
			"prid":{
				39:{
					"funcCode": "credit-strategy-verify",
					"funcName": "攻略审核"
				},
				40:{
					"funcCode": "credit-strategy-add",
					"funcName": "攻略添加"
				},
				41:{
					"funcCode": "credit-strategy-update",
					"funcName": "攻略修改"
				},
				42:{
					"funcCode": "credit-strategy-delete",
					"funcName": "攻略删除"
				},
				43:{
					"funcCode": "credit-account-manage",
					"funcName": "帐单管理"
				},
				44:{
					"funcCode": "credit-lifting-view",
					"funcName": "提额策略查看"
				},
				45:{
					"funcCode": "credit-lifting-add",
					"funcName": "提额策略添加"
				},
				46:{
					"funcCode": "credit-lifting-update",
					"funcName": "提额策略修改"
				},
				47:{
					"funcCode": "credit-lifting-delete",
					"funcName": "提额策略删除"
				},
				48:{
					"funcCode": "credit-lifting-verify",
					"funcName": "提额策略审核"
				}
			}
		},
		"35":{
			"name":"财务管理",
			"code":"finance",
			"match":"-finance-",
			"class":"menu-ux-finance",
			"module":"finance",
			"modid":"30"
		}
	};
	/*路由映射*/
	public_tool.routeMap={
			issetting:false,
			path:'',
			module:'',
			isindex:false,
			issamemodule:false
	};
	/*获取路由信息*/
	public_tool.getRoute=function(){
		/*处理路径*/
		var self=this,
			currentfile=location.pathname,
			carr=currentfile.split('/'),
			clen=carr.length,
			cp_suffix=carr[clen - 1].lastIndexOf('.'),
			path=carr[clen - 1].slice(0,cp_suffix),
			isindex=path===''?true:path.indexOf('index')!==-1,
			module=isindex?'':carr[clen - 2];


		/*调用路由记录*/
		var history_path={
			issetting:false,
			/*当前文件*/
			current:{
				isindex:isindex,
				path:path,
				module:module
			},
			/*上一次文件路径*/
			prev:{
				isindex:false,
				path:'',
				module:''
			}
		},
		route=self.getParams('route_module')/*查找上一次记录*/;


		/*重新赋值*/
		if(route){
			history_path.prev=route.current;
			public_tool.routeMap.issamemodule=module===route.current.module;
			self.routeMap.issetting=history_path.issetting=route.issetting;
		}else{
			public_tool.routeMap.issamemodule=false;
		}
		/*放入本地存储*/
		self.setParams('route_module',history_path);

		/*存入临时目录*/
		public_tool.routeMap.isindex=isindex;
		public_tool.routeMap.path=path;
		public_tool.routeMap.module=module;

		if(route){
			/*判断是否设置权限*/
			self.isPermission(route.issetting);
		}
	};
	/*判断是否修改了权限*/
	public_tool.isPermission=function(flag){
		var self=this,
			flag=flag||self.routeMap.issetting;

		if(flag){
			var count= 3,
				tips=dialog({
					title:'温馨提示',
					width:300,
					ok:false,
					cancel:false,
					content:'<span class="g-c-bs-warning g-btips-warn">您已设置了新的系统权限，&nbsp;<span class="g-c-bs-info" id="permission_tips"></span>&nbsp;秒后将自动退出系统</span>'
				}).show(),
				pertip=null,
				tipsdom=document.getElementById('permission_tips');


			tipsdom.innerHTML=count;
			pertip=setInterval(function(){
				count--;
				tipsdom.innerHTML=count;
				if(count<0){
					clearInterval(pertip);
					pertip=null;
					tips.close().remove();
					tipsdom=null;
					self.loginOut();
				}
			},1000);
		}
	}



	/*加载左侧菜单*/
	public_tool.loadSideMenu=function($menu,$wrap,opt){

		var self=this,
		cacheMenu=self.getParams('menu_module')/*调用缓存*/,
			cacheLogin=self.getParams('login_module'),
			currentdomain=cacheLogin.currentdomain,
			baseurl=opt.url.split('/',3);

		cacheLogin.currentdomain=baseurl[0]+'//'+baseurl[2];
		self.removeParams('login_module');
		self.setParams('login_module',cacheLogin);

		/*检测是否改变了地址，且登陆地址和请求地址不一致*/
		if(!self.validLogin()){
			self.clear();
			self.clearCacheData();
			self.loginTips();
			return false;
		};


		/*判断路由模块*/
		if(public_tool.routeMap.issamemodule){
			if(cacheMenu){
				/*如果是同一模块侧直接获取缓存*/
				/*如果存在缓存，则读取缓存*/
				//放入dom中
				$(cacheMenu).appendTo($menu.html(''));
				//初始化
				self.initSideMenu($wrap);
				/*导航高亮*/
				self.highSideMenu($menu);
				/*解析权限*/
				var cacheSource=self.getParams('source_module');
				self.resolvePower(cacheSource,true);
				return;
			}else{
				/*不同模块则重新加载*/
				self.requestSideMenu($menu,$wrap,opt);
			}
		}else{
			self.requestSideMenu($menu,$wrap,opt);
		}
	};
	/*请求菜单*/
	public_tool.requestSideMenu= function ($menu,$wrap,opt) {
		var self=this,
			cacheSource=self.getParams('source_module');

		if(cacheSource){
			//存在数据源
			/*解析菜单*/
			self.doSideMenu(cacheSource,$menu,$wrap);
		}else{
			/*不存在资源则重新加载*/
			$.ajax({
				url:opt.url,
				async:opt.async,
				type:opt.type,
				data:opt.param,
				dataType:opt.datatype
			}).done(function(data){
				if(parseInt(data.code,10)!==0){
					//查询异常
					return false;
				}
				self.doSideMenu(data,$menu,$wrap);
			}).fail(function(){
				console.log('error');
			});
		}

	};
	//处理菜单
	public_tool.doSideMenu=function(data,$menu,$wrap){
		var self=this,
			matchClass=function(map,str){
				/*修正class*/
				if(typeof map!=='undefined'&&str!==map['class']){
					return map['class'];
				}
				return str;
			},
			menu=data.result.menu,
			len=menu.length,
			menustr='',
			i=0,
			j=0,
			key='modItem',
			suffix='.html',
			subactive="sub-menu-active",
			link='',
			item=null,
			sublen='',
			subitem=null,
			isindex=self.routeMap.isindex,
			module=self.routeMap.module,
			path=self.routeMap.path;

		for(i;i<len;i++){
			item=menu[i];
			link=self.menuMap[item.modId];
			if(typeof link==='undefined'){
				continue;
			}
			//解析菜单
			if(isindex){
				//当前页为首页的情况
				var issub=typeof (subitem=item[key])!=='undefined';

				if(i===0&&item.modId!==0){
					/*不匹配首页*/
					menustr+='<li><a href=\"index'+suffix+'\"><i class=\"menu-ux-home\"></i><span>首页</span></a></li>';
				}else if(i===0&&!issub){
					//匹配首页且没有子菜单
					menustr+='<li><a href=\"index'+item.modLink+suffix+'\"><i class=\"'+matchClass(link,item.modClass)+'\"></i><span>'+item.modName+'</span></a></li>';
				}

				if(issub){
					//子菜单循环
					if(path.indexOf(link.match)!==-1){
						menustr+='<li class="has-sub expanded"><a href=\"\"><i class=\"'+matchClass(link,item.modClass)+'\"></i><span>'+item.modName+'</span></a>';
						menustr+="<ul style='display:block;'>";
					}else{
						menustr+='<li class="has-sub"><a href=\"\"><i class=\"'+matchClass(link,item.modClass)+'\"></i><span>'+item.modName+'</span></a>';
						menustr+="<ul>";
					}
					sublen=subitem.length;
					j=0;
					for(j;j<sublen;j++){
						item=subitem[j];
							menustr+='<li><a href=\"'+link.code+'/'+item.modLink+suffix+'\"><span>'+item.modName+'</span></a></li>';
					}
					menustr+="</li></ul>";
				}else{
					menustr+='<li><a href=\"'+link.code+'/'+item.modLink+suffix+'\"><i class=\"'+matchClass(link,item.modClass)+'\"></i><span>'+item.modName+'</span></a>';
				}
			}else{
				//当前页为其他页的情况
				var issub=typeof (subitem=item[key])!=='undefined';


				if(i===0&&item.modId!==0){
					/*不匹配首页*/
					menustr+='<li><a href=\"../index'+suffix+'\"><i class=\"menu-ux-home\"></i><span>首页</span></a></li>';
				}else if(i===0&&!issub){
					//匹配首页且没有子菜单
					menustr+='<li><a href=\"../index'+item.modLink+suffix+'\"><i class=\"'+matchClass(link,item.modClass)+'\"></i><span>'+item.modName+'</span></a></li>';
				}

				if(issub){
					//子菜单循环
					if(path.indexOf(link.match)!==-1){
						menustr+='<li class="has-sub expanded"><a href=\"\"><i class=\"'+matchClass(link,item.modClass)+'\"></i><span>'+item.modName+'</span></a>';
						menustr+="<ul style='display:block;'>";
					}else{
						menustr+='<li class="has-sub"><a href=\"\"><i class=\"'+matchClass(link,item.modClass)+'\"></i><span>'+item.modName+'</span></a>';
						menustr+="<ul>";
					}
					sublen=subitem.length;
					j=0;
					var ismodule=path.indexOf(link.match)!==-1;
					for(j;j<sublen;j++){
						item=subitem[j];
						if(ismodule){
								menustr+='<li><a href=\"'+item.modLink+suffix+'\"><span>'+item.modName+'</span></a></li>';
						}else{
								menustr+='<li><a href=\"../'+link.code+'/'+item.modLink+suffix+'\"><span>'+item.modName+'</span></a></li>';
						}
					}
					menustr+="</li></ul>";
				}else{
					if(path.indexOf(link.match)!==-1){
						menustr+='<li><a href=\"'+item.modLink+suffix+'\"><i class=\"'+matchClass(link,item.modClass)+'\"></i><span>'+item.modName+'</span></a>';
					}else{
						menustr+='<li><a href=\"../'+link.code+'/'+item.modLink+suffix+'\"><i class=\"'+matchClass(link,item.modClass)+'\"></i><span>'+item.modName+'</span></a>';
					}
				}
			}
		}


		/*解析权限*/
		self.resolvePower(data,true);

		//放入菜单模块
		self.setParams('menu_module',menustr);
		//存入数据源
		self.setParams('source_module',data);

		//放入dom中
		$(menustr).appendTo($menu.html(''));

		//调用菜单渲染
		self.initSideMenu($wrap);
		/*导航高亮*/
		self.highSideMenu($menu);
	};
	//卸载左侧菜单条
	public_tool.removeSideMenu=function($menu){
		//清除dom节点
		$menu.html('');
		//清除本地存储缓存
		this.removeParams('menu_module');
		this.removeParams('source_module');
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
	//当前高亮菜单
	public_tool.highSideMenu=function($menu){
		var self=this;
		$menu.find("a[href='"+self.routeMap.path+".html']").parent().addClass('sub-menu-active');
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


	/*权限分配*/
	/*菜单权限映射*/
	public_tool.powerMap={};
	/*解析权限*/
	public_tool.resolvePower=function(data,flag){
		/*
		 * data:数据源
		 * flag:是否存入缓存
		 * */
		var self=this,
			cachePower;

		if(flag){
			cachePower=self.getParams('power_module')/*调用缓存*/
			if(cachePower){
				/*如果存在缓存，则读取缓存*/
				self.powerMap=cachePower;
			}else{
				self.handlePower(data,flag);
			}
		}else{
			return self.handlePower(data,flag);
		}
	};
	/*处理权限*/
	public_tool.handlePower=function(data,flag){
		var self=this;
		/*
		* data:数据源
		* flag:是否存入缓存
		* */
		/*解析权限*/
		var menu=data.result.menu,
			len=menu.length,
			i=0,
			prkey='permitItem',
			item=null,
			pritem=null,
			modid_map={},
			result={};

		for(i;i<len;i++){
			item=menu[i];
			/*解析权限*/
			var ispr=typeof (pritem=item[prkey])!=='undefined';
			if(ispr){
				var k= 0,
					prlen=pritem.length,
					poweritem={};
				for(k;k<prlen;k++){
					var temppt=pritem[k],
						prid=temppt.prid;
					poweritem[prid]=temppt;
				}
				if(typeof modid_map[item.modId]==='undefined'){
					modid_map[item.modId]=poweritem;
				}else{
					modid_map[item.modId]=$.extend(true,{},poweritem);
				}
			}
			result=$.extend(true,{},modid_map);
		}
		/*然后存入缓存*/
		if(flag){
			self.powerMap=$.extend(true,{},result);
			self.setParams('power_module',result);
		}else{
			return result;
		}
	};
	//根据模块判断拥有的权限
	public_tool.getPower=function(key){
		var self=this,
			havepower=$.isEmptyObject(self.powerMap);

		if(havepower){
			/*没有获取到权限*/
			return null;
		}else{
			var path,
				module,
				currentpower,
				menumap=self.menuMap,
				modid;
			if(typeof key!=='undefined'){
				modid=key;
			}else{
				path=self.routeMap.path;
				module=self.routeMap.module;
				if(module==''&&module=='account'){
					return null;
				}
				for(var i in menumap){
					if(path.indexOf(menumap[i].match)!==-1){
						modid=i;
						break;
					}
				}
			}

			currentpower= $.extend(true,{},self.powerMap[modid]);
			for(var j in currentpower){
				if(currentpower[j].isPermit===0){
					delete currentpower[j];
				}
			}
			return currentpower;
		}
		return null;
	};
	//根据关键词判断权限
	public_tool.getKeyPower=function(key,list){
		if(!key||!list){
			return false;
		}
		var ispower=false;
		for(var i in list){
			if(list[i]['funcName']===key){
				ispower=true;
				break;
			}
		}
		return ispower;
	};
	//根据模块判断拥有的权限
	public_tool.getAllPower=function(){
		var self=this,
			havepower=$.isEmptyObject(self.powerMap);

		if(havepower){
			/*没有获取到权限*/
			return null;
		}else{
			var module=self.routeMap.module;

				if(module==''&&module=='account'){
					return null;
				}
			var currentpower= $.extend(true,{},self.powerMap);
			for(var i in currentpower){
				var temppower=currentpower[i];
				for(var j in temppower){
					if(temppower[j].isPermit===0){
						delete temppower[j];
					}
				}
			}
			return currentpower;
		}
		return null;
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



	/*登陆缓存*/
	public_tool.initMap={
		isrender:false,
		loginMap:{}
	};
	/*登陆接口*/
	public_tool.isLogin=function(){
		var self=this,
			cacheLogin=self.getParams('login_module');

		self.initMap.loginMap={};
		if(cacheLogin){
			/*如果已经存在登陆信息同时判断登陆信息是否有效*/
			var tempvalid=self.validLogin(cacheLogin);
			if(tempvalid){
				self.initMap.loginMap= $.extend(true,{},cacheLogin);
				var name=self.initMap.loginMap.name||'匿名用户';
				public_vars.$admin_show_wrap.html('您好：<span class="g-c-info">&nbsp;'+name+'&nbsp;&nbsp;</span><i class="fa-angle-down"></i>');
				return true;
			}else{
				/*清除缓存*/
				self.clear();
				self.clearCacheData();
				self.loginTips();
				return false;
			}
		}else{
			self.loginTips();
			return false;
		}
		return false;
	};
	/*判断缓存是否有效*/
	public_tool.validLogin=function(obj){
		/*必须有缓存*/
		var self=this,
			cacheLogin=typeof obj!=='undefined'?obj:self.getParams('login_module');

		if(cacheLogin){
			/*如果已经存在登陆信息则获取登录时间*/
			var login_dt=cacheLogin.datetime;
			if(!login_dt){
				return false;
			}
			login_dt=login_dt.replace(/\s*/g,'').split('|');


			var login_rq=login_dt[0],
				login_sj=login_dt[1],
				now=moment().format('YYYY-MM-DD|HH:mm:ss').split('|'),
				now_rq=now[0],
				now_sj=now[1];

			/*判断日期*/
			if(login_rq!==now_rq){
				//同一天有效
				return false;
			}/*else if(login_rq===now_rq){
				login_sj=login_sj.split(':');
				now_sj=now_sj.split(':');
				var login_hh=login_sj[0],
					now_hh=now_sj[0],
					login_mm=login_sj[1],
					now_mm=now_sj[1];

				if(login_hh!==now_hh){
					//同一小时有效
					return false;
				}else if(now_mm - login_mm >30){
					//多少分钟内有效
					return false;
				}
				return true;
			}*/

			/*请求域与登陆域不一致*/
			if(currentdomain!==''&&reqdomain!==currentdomain){
				return false;
			}

			return true;
		}else{
			return false;
		}
		return false;
	};
	/*退出系统*/
	public_tool.loginOut=function(){
		var self=this,
			isindex=self.routeMap.isindex;

		/*清除所有记录*/
		self.clear();
		self.clearCacheData();

		/*根据路径跳转*/
		if(isindex){
			location.href='account/login.html';
		}else{
			location.href='../account/login.html';
		}
	};
	/*清除内存数据*/
	public_tool.clearCacheData=function(){
		var self=this;
		/*清除菜单权限映射*/
		if(!$.isEmptyObject(self.powerMap)){
			self.powerMap={};
		}
		/*初始化登陆缓存*/
		self.initMap={
			isrender:false,
			loginMap:{}
		};
		/*路由映射*/
		self.routeMap={
			issetting:false,
			path:'',
			module:'',
			isindex:false,
			issamemodule:false
		};
	};
	/*跳转提示*/
	public_tool.loginTips=function(){
		var self=this;

		/*如果没有登陆则提示跳转至登陆页*/
		public_vars.$page_support_wrap.removeClass('g-d-hidei');
		public_vars.$page_support.eq(1).addClass('page-support-active');
		var count= 2,
				tipid=null;


			public_vars.$goto_login.html(count);
			tipid=setInterval(function(){
				count--;
				public_vars.$goto_login.html(count);
				if(count<=0){
					/*清除定时操作*/
					clearInterval(tipid);
					tipid=null;
					count= 5;
					/*跳转到登陆位置*/
					if(self.routeMap.isindex){
						location.href='account/login.html';
					}else{
						location.href='../account/login.html';
					}
				}
			},1000);

	};


	/*初始化判定*/
	public_tool.isRender=function(){
		var self=this;
		/*判定兼容性*/
		if(self.supportStorage){
			/*调用路由*/
			self.getRoute();
			/*判断是否登陆*/
			if(self.routeMap.module.indexOf('account')!==-1){
				/*登陆模块不做判断*/
				self.initMap.isrender=true;
				return true;
			}else{
				var templogin=self.isLogin();
				templogin?self.initMap.isrender=true:self.initMap.isrender=false;
				return templogin;
			}
		}else{
			/*如果不支持本地存储则弹出升级浏览器提示*/
			public_vars.$page_support_wrap.removeClass('g-d-hidei');
			public_vars.$page_support.eq(0).addClass('page-support-active');
			self.initMap.isrender=false;
			return false;
		}
		self.initMap.isrender=false;
		return false;
	};
	/*加载进度条*/
	public_tool.initLoading=function(){
		/*首先加载动画*/
		public_vars.$page_loading_wrap.removeClass('g-d-hidei');
		//加载成功隐藏动画
		if (public_vars.$page_loading_wrap.length) {
			$(window).load(function() {
				public_vars.$page_loading_wrap.addClass('loaded');
			});
		}
		//加载失败
		window.onerror = function() {
			public_vars.$page_loading_wrap.addClass('loaded');
		};
	};


	window.public_tool=public_tool;
})(jQuery);



var public_vars = public_vars || {};

;(function($, window, undefined){
	
	"use strict";
	//初始化加载
	$(function(){
		//自定义扩展变量
		public_vars.$mainmenu=$('#main_menu');
		public_vars.$main_menu_wrap=$('#main_menu_wrap');
		public_vars.$page_loading_wrap=$('#page_loading_wrap');
		public_vars.$main_content=$('#main_content');
		public_vars.$logout_btn=$('#logout_btn');
		public_vars.$page_support_wrap=$('#page_support_wrap');
		public_vars.$page_support=public_vars.$page_support_wrap.children();
		public_vars.$goto_login=$('#goto_login'),
		public_vars.$admin_show_wrap=$('#admin_show_wrap');


		/*初始化判定*/
		public_tool.isRender();
		/*首先加载动画*/
		if(public_tool.initMap.isrender){
			/*加载动画*/
			public_tool.initLoading();

			/*其他加载*/
			public_vars.$body                 = $("body");
			public_vars.$pageContainer        = public_vars.$body.find(".page-container");
			public_vars.$horizontalNavbar     = public_vars.$body.find('.navbar.horizontal-menu');
			public_vars.$horizontalMenu       = public_vars.$horizontalNavbar.find('.navbar-nav');

			public_vars.$mainFooter           = public_vars.$body.find('footer.main-footer');

			public_vars.$userInfoMenuHor      = public_vars.$body.find('.navbar.horizontal-menu');
			public_vars.$userInfoMenu         = public_vars.$body.find('nav.navbar.user-info-navbar');

			/*登出操作*/
			if(public_vars.$logout_btn){
				public_vars.$logout_btn.on('click',function(){
					public_tool.loginOut();
				});
			}




			//计算左侧菜单滚动条
			if (public_vars.$mainFooter.hasClass('sticky')) {
				stickFooterToBottom(public_vars.$main_content,public_vars.$main_menu_wrap);
				$(window).on('xenon.resized',{
					$content:public_vars.$main_content,
					$wrap:public_vars.$main_menu_wrap
				},stickFooterToBottom);
			}


			//模拟滚动条
			if($.isFunction($.fn.perfectScrollbar)) {
				if (public_vars.$main_menu_wrap.hasClass('fixed')){
					public_tool.scrollInit(public_vars.$main_menu_wrap);
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
				public_vars.$main_content.css({
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
								if(element.hasClass('self-error-pos')){
									error.insertAfter(element.closest('.self-error-pos-wrap'));
								}else{
									if(element.closest('.has-switch').length) {
										error.insertAfter(element.closest('.has-switch'));
									}
									else if(element.parent('.checkbox, .radio').length || element.parent('.input-group').length) {
										error.insertAfter(element.parent());
									} else {
										error.insertAfter(element);
									}
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
			$(".login-form .form-group:has(label)").each(function(i, el){
				var $this = $(el),
					$label = $this.find('label'),
					$input = $this.find('.form-control');

				$input.on('focus', function() {
					$this.addClass('is-focused');
				});

				$input.on('keydown', function(){
					$this.addClass('is-focused');
				});

				$input.on('blur', function() {
					$this.removeClass('is-focused');

					if($input.val().trim().length > 0)
					{
						$this.addClass('is-focused');
					}
				});

				$label.on('click', function(){
					$input.focus();
				});

				if($input.val().trim().length > 0) {
					$this.addClass('is-focused');
				}
			});


		}

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

