
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
	//判断是否支持图片
	public_tool.supportImage=(function(){
		var wURL=window.URL;
		if(wURL){
			return typeof wURL.createObjectURL==='function'?true:false;
		}else{
			return false;
		}
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
	public_tool.sureDialog=function(tips){
		if(!this.supportDia){
			return null;
		}


		/*内部提示信息*/
		var innerdia;
		if(tips&&typeof tips==='object'){
			innerdia=tips;
		}else{
			innerdia=dialog({
				title:'温馨提示',
				okValue:'确定',
				width:300,
				ok:function(){
					this.close();
					return false;
				},
				cancel:false
			});
		}
		/*关键匹配*/
		var actionmap={
			'delete':'删除',
			'cancel':'取消',
			'change':'改变',
			'add':'添加',
			'update':'更新'
		};


		/*确认框类*/
		function sureDialogFun(){}

		/*设置函数*/
		sureDialogFun.prototype.sure=function (str,fn,tips,repalceflag) {
			var tipstr='',
				iskey=typeof actionmap[str]==='string',
				key=iskey?actionmap[str]:str;

			if(!tips){
				tips='';
			}

			if(typeof actionmap[str]==='string'){
				if(repalceflag){
					tipstr='<span class="g-c-bs-warning g-btips-warn">'+tips+'</span>';
				}else{
					tipstr='<span class="g-c-bs-warning g-btips-warn">'+tips+'是否真需要 "'+actionmap[str]+'" 此项数据</span>';
				}
			}else{
				if(repalceflag){
					tipstr='<span class="g-c-bs-warning g-btips-warn">'+tips+'</span>';
				}else{
					tipstr='<span class="g-c-bs-warning g-btips-warn">'+tips+'是否真需要 "'+str+'" 此项数据</span>';
				}
			}

			var tempdia=dialog({
				title:'温馨提示',
				content:tipstr,
				width:300,
				okValue: '确定',
				ok: function () {
					if(fn&&typeof fn==='function'){
						//执行回调
						fn.call(null,{
							action:key,
							dia:innerdia
						});
						this.close().remove();
					}
					return false;
				},
				cancelValue: '取消',
				cancel: function(){
					this.close().remove();
				}
			}).showModal();
		};

		return sureDialogFun;
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
		var phoneno=str.toString().replace(/\s*\D*/g,'');
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
	/*是否是合法手机号*/
	public_tool.isMobilePhone=function(str){
		return /^(13[0-9]|14[579]|15[012356789]|16[6]|17[01235678]|18[0-9]|19[89])[0-9]{8}$/.test(this.trims(str))?true:false;
	};
	/**/
	public_tool.isNum=function(str){
		var self=this;
		return /^[0-9]{0,}$/g.test(self.trims(str));
	};
	//自动补全纠错人民币(字符串,最大数位,是否可以返回为空)，返回一个数组['格式化后的数据',带小数点的未格式化数据]
	public_tool.moneyCorrect=function(str,max,flag){
		var self=this,
			money=this.trimSep(str.toString(),','),
			moneyarr,
			len=0,
			partz,
			partx,
			tempstr='';

		money=this.trims(money);
		if(money===''){
			if(flag){
				return ['',''];
			}else{
				return ['0.00','0.00'];
			}
		}
		if(flag&&(parseInt(money * 100,10)===0)){
			return ['',''];
		}
		if(money.lastIndexOf('.')!==-1){
			moneyarr=money.split('.');
			len=moneyarr.length;
			if(len>2){
				partz=moneyarr[len-2];
				partx=moneyarr[len-1];
			}else{
				partz=moneyarr[0];
				partx=moneyarr[1];
			}
			if(!self.isNum(partx)){
				partx=partx.replace(/\D*/g,'');
			}
			if(partx.length==0){
				partx='.00';
			}else if(partx.length==1){
				partx='.'+partx+'0';
			}else if(partx.length>=2){
				partx='.'+partx.slice(0,2);
			}
		}else{
			partz=money;
			partx='.00';
		}
		if(!self.isNum(partz)){
			partz=partz.replace(/\D*/g,'');
		}
		tempstr=partz+partx;
		var templen=partz.length;
		if(templen>3){
			var i=0,j=1;
			partz=partz.split('').reverse();
			for(i;i<templen;i++){
				if(j%3==0&&j!=templen){
					partz.splice(i,1,','+partz[i].toString());
				}
				j++;
			}
			partz=partz.reverse().join('');
		}else if(templen==0){
			partz='0';
		}
		if(partz.length>=2){
			if(partz.charAt(0)=='0'||partz.charAt(0)==0){
				partz=partz.slice(1);
			}
		}
		if(max){
			if(partz.indexOf(',')!==-1){
				var filterlen=partz.length,
					k= 0,
					filtercount=0;
				for(k;k<filterlen;k++){
					if(partx[k]===','){
						filtercount++;
					}
				}
				partz=partz.slice(filtercount);
			}
		}
		return [partz+partx,tempstr];
	};
	//光标定位至具体位置(需定位元素,[元素中字符],定位位置，[是否在特定位置的前或者后])
	public_tool.cursorPos=function(elem,str,index,flag){
		var vals='',
			len=0;
		if(!str){
			vals=elem.value||$(elem).val()||elem.innerHTML||$(elem).html();
			len=vals.length;
		}else{
			len = str.lengt
		}
		var pos=Number(index);

		if(isNaN(pos)){
			pos=str.indexOf(index);
		}

		//elem.focus();
		setTimeout(function() {
			if (elem.setSelectionRange) {
				if(!flag){
					elem.setSelectionRange(pos,pos);
				}else{
					elem.setSelectionRange(pos+1,pos+1);
				}
			} else {
				var range = elem.createTextRange();
				range.moveStart("character", -len);
				range.moveEnd("character", -len);
				if(!flag){
					range.moveStart("character", pos);
				}else{
					range.moveStart("character", pos+1);
				}
				range.moveEnd("character", 0);
				range.select();
			}
		},0);
	};
	///金额加法
	public_tool.moneyAdd=function(str1,str2){
		var r1,
			r2,
			m,
			c,
			txt1=str1.toString(),
			txt2=str2.toString();
		try {
			r1 = txt1.split(".")[1].length;
		} catch (e) {
			r1 = 0;
		}
		try {
			r2 = txt2.split(".")[1].length;
		} catch (e) {
			r2 = 0;
		}
		c = Math.abs(r1 - r2);
		m = Math.pow(10, Math.max(r1, r2))
		if (c > 0) {
			var cm = Math.pow(10, c);
			if (r1 > r2) {
				txt1 = Number(txt1.replace(/\.*/g,''));
				txt2 = Number(txt2.replace(/\.*/g,'')) * cm;
			}else{
				txt1 = Number(txt1.replace(/\.*/g,'')) * cm;
				txt2 = Number(txt2.replace(/\.*/g,''));
			}
		}else{
			txt1 = Number(txt1.replace(/\.*/g,''));
			txt2 = Number(txt2.toString().replace(/\.*/g,''));
		}
		return (txt1 + txt2) / m;
	};
	///金额减法
	public_tool.moneySub=function(str1,str2){
		var r1,
			r2,
			m,
			n;
		try{
			r1=str1.toString().split(".")[1].length;
		}catch(e){
			r1=0;
		}
		try{
			r2=str2.toString().split(".")[1].length;
		}catch(e){
			r2=0;
		}
		m=Math.pow(10,Math.max(r1,r2));
		n=(r1>=r2)?r1:r2;
		return ((str1*m-str2*m)/m).toFixed(n);
	};
	///金额乘法
	public_tool.moneyMul=function(str1,str2){
		var m = 0,
			s1 = str1.toString(),
			s2 = str2.toString();
		try {
			m += s1.split(".")[1].length;
		} catch (e) {
			m+=0;
		}
		try {
			m += s2.split(".")[1].length;
		} catch (e) {
			m+=0;
		}
		return Number(s1.replace(/\.*/g,'')) * Number(s2.replace(/\.*/g,'')) / Math.pow(10, m);
	};
	///金额除法
	public_tool.moneyDiv=function(str1,str2){
		var t1=0,
			t2=0,
			r1,
			r2,
			txt1=str1.toString(),
			txt2=str2.toString();
		try{
			t1=txt1.split(".")[1].length;
		}catch(e){}
		try{
			t2=txt2.split(".")[1].length;
		}catch(e){}
		r1=Number(txt1.replace(/\.*/g,''));
		r2=Number(txt1.replace(/\.*/g,''));
		return (r1/r2)*Math.pow(10,t2-t1);
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
		"200":{
			"name":"系统管理",
			"code":"admin",
			"match":"-admin-",
			"class":"menu-ux-admin",
			"module":"admin",
			"modid":"200"
		},
		"210":{
			"name":"用户管理",
			"code":"user",
			"match":"-user-",
			"class":"menu-ux-user",
			"matchignore":["bzw-user-add"],
			"module":"admin",
			"modid":"210"
		},
		"220":{
			"name":"公告管理",
			"code":"announcement",
			"match":"-announcement-",
			"class":"menu-ux-ad",
			"module":"announcement",
			"modid":"220"
		},
		"230":{
			"name":"供应商管理",
			"code":"provider",
			"match":"-provider-",
			"class":"menu-ux-distribution",
			"module":"provider",
			"modid":"230"
		},
		"240":{
			"name":"交易管理",
			"code":"trade",
			"match":"-trade-",
			"matchlist":['order-manager','comment-buyer','comment-saler'],
			"matchignore":["comment-saler"],
			"class":"menu-ux-record",
			"module":"trade",
			"modid":"240"
		},
		"250":{
			"name":"商品管理",
			"code":"goods",
			"match":"-goods-",
			"extendmenu":{
				"position":"before",
				"list":[{
					"modLink":"bzw-goods-manager",
					"modName": "商品管理"
				}]
			},
			"class":"menu-ux-shop",
			"module":"goods",
			"modid":"250"
		},
		"260":{
			"name":"商品属性",
			"code":"attribute",
			"match":"-attribute-",
			"class":"menu-ux-shop",
			"module":"attribute",
			"modid":"260"
		},
		"270":{
			"name":"商品类型管理",
			"code":"goodstype",
			"match":"-goodstype-",
			"class":"menu-ux-shop",
			"module":"goodstype",
			"modid":"270"
		},
		"280":{
			"name":"用户统计",
			"code":"userstats",
			"match":"-userstats-",
			"ignoremodule":true,
			"class":"menu-ux-chart",
			"module":"userstats",
			"modid":"280"
		},
		"290":{
			"name":"供应商统计",
			"code":"providerstats",
			"match":"-providerstats-",
			"ignoremodule":true,
			"class":"menu-ux-chart",
			"module":"providerstats",
			"modid":"290"
		},
		"300":{
			"name":"商品统计",
			"code":"goodsstats",
			"match":"-goodsstats-",
			"ignoremodule":true,
			"class":"menu-ux-chart",
			"module":"goodsstats",
			"modid":"300"
		},
		"310":{
			"name":"订单统计",
			"code":"orderstats",
			"ignoremodule":true,
			"match":"-orderstats-",
			"class":"menu-ux-chart",
			"module":"orderstats",
			"modid":"310"
		},
		"320":{
			"name":"平台管理",
			"code":"paltform",
			"match":"-paltform-",
			/*"ignoremodule":true,*/
			"class":"menu-ux-platform",
			"matchlist":['bzw-imei-list','bzw-imei-add','bzw-complaints-suggestions'],
			"module":"paltform",
			"modid":"320"
		},
		"330":{
			"name":"广告管理",
			"code":"advert",
			"match":"-advert-",
			"class":"menu-ux-ad",
			"module":"advert",
			"modid":"330"
		},
		"340":{
			"name":"活动设置",
			"code":"activity",
			"match":"-activity-",
			"matchlist":['module-set'],
			"class":"menu-ux-serve",
			"module":"activity",
			"modid":"340"
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
			self.routeMap.issamemodule=module===route.current.module;
			self.routeMap.issetting=history_path.issetting=route.issetting;
		}else{
			self.routeMap.issamemodule=false;
		}
		/*放入本地存储*/
		self.setParams('route_module',history_path);

		/*存入临时目录*/
		self.routeMap.isindex=isindex;
		self.routeMap.path=path;
		self.routeMap.module=module;

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
			self.loginTips(function () {
				self.clear();
				self.clearCacheData();
			});
			return false;
		}



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
				return true;
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

			/*静态注入*/
			/*var injectdata=self.injectSideMenu({
				url:self.routeMap.isindex?'../json/inject_menu.json':'../../json/inject_menu.json',
				async:false,
				type:'post',
				datatype:'json'
			}),
			injectstr=self.doSideMenu(injectdata,$menu,$wrap,{
				resolve:true
			});*/




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
				if(typeof injectstr!=='undefined'){
					/*如果有注入*/
					self.doSideMenu(data,$menu,$wrap,{
						render:true,
						result:injectstr,
						data:injectdata
					});
				}else{
					self.doSideMenu(data,$menu,$wrap);
				}
			}).fail(function(){
				console.log('error');
			});
		}

	};
	//处理菜单(inject:为注入对象)
	public_tool.doSideMenu=function(data,$menu,$wrap,inject){
		var self=this,
			matchClass=function(map,str){
				/*修正class*/
				if(typeof map!=='undefined'&&str!==map['class']){
					return map['class'];
				}
				return str;
			},
			matchModule=function (map,str) {
				var dlist=map['matchlist'];
				if(dlist){
					var d=0,
						dlen=dlist.length;

					for(d;d<dlen;d++){
						if(str.indexOf(dlist[d])!==-1){
							return '<li class="has-sub expanded"><a href=\"\"><i class=\"'+matchClass(link,item.modClass)+'\"></i><span>'+item.modName+'</span></a><ul style="display:block;">';
						}
					}
				}
				return '<li class="has-sub"><a href=\"\"><i class=\"'+matchClass(link,item.modClass)+'\"></i><span>'+item.modName+'</span></a><ul>';
			},
			matchIgnore=function (map,str) {
				/*忽略解析指定模块*/
				var iglist=map['matchignore'];
				if(iglist){
					var p=0,
						plen=iglist.length;

					for(p;p<plen;p++){
						if(str.indexOf(iglist[p])!==-1){
							return true;
						}
					}
					return false;
				}
				return false;
			},
			extendMenu=function (map,config) {
				var elist=map['extendmenu'];
				if(elist){
					var e=0,
						estr='',
						eitem=elist['list'],
						elen=eitem.length;

					if(config.isindex){
						for(e;e<elen;e++){
							estr+='<li><a href=\"'+map.code+'/'+eitem[e].modLink+config.suffix+'\"><span>'+eitem[e].modName+'</span></a></li>';
						}
					}else if(!config.isindex){
						if(config.ismodule){
							for(e;e<elen;e++){
								estr+='<li><a href=\"'+eitem[e].modLink+config.suffix+'\"><span>'+eitem[e].modName+'</span></a></li>';
							}
						}else{
							for(e;e<elen;e++){
								estr+='<li><a href=\"../'+map.code+'/'+eitem[e].modLink+config.suffix+'\"><span>'+eitem[e].modName+'</span></a></li>';
							}
						}
					}
					return config.menustr+estr;
				}
				return '';
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
			ignore=null,
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
			if(typeof link['ignoremodule']!=='undefined'){
				if(link['ignoremodule']){
					/*忽略模块*/
					continue;
				}
			}
			if("matchignore" in link){
				ignore=true;
			}else{
				ignore=null;
			}
			//解析菜单
			if(isindex){
				//当前页为首页的情况
				var issub=typeof (subitem=item[key])!=='undefined';

				if(i===0&&item.modId!==0){
					/*不匹配首页*/
					if(!inject||(inject&&inject.render)){
						menustr+='<li><a href=\"index'+suffix+'\"><i class=\"menu-ux-home\"></i><span>首页</span></a></li>';
					}
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
						menustr+=matchModule(link,path);
					}
					sublen=subitem.length;
					j=0;
					/*扩展菜单*/
					if('extendmenu' in link){
						if(link['extendmenu']['position']==='before'){
							menustr=extendMenu(link,{
								menustr:menustr,
								suffix:suffix,
								isindex:true
							});
						}
					}
					for(j;j<sublen;j++){
						item=subitem[j];
						/*判断是否存在忽略*/
						if(ignore&&matchIgnore(link,item.modLink)){
							/*存在忽略菜单即执行下一轮检查*/
							continue;
						}
						menustr+='<li><a href=\"'+link.code+'/'+item.modLink+suffix+'\"><span>'+item.modName+'</span></a></li>';
					}
					/*扩展菜单*/
					if('extendmenu' in link){
						if(link['extendmenu']['position']==='after'){
							menustr=extendMenu(link,{
								menustr:menustr,
								suffix:suffix,
								isindex:true
							});
						}
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
					if(!inject||(inject&&inject.render)){
						menustr+='<li><a href=\"../index'+suffix+'\"><i class=\"menu-ux-home\"></i><span>首页</span></a></li>';
					}
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
						menustr+=matchModule(link,path);
					}
					sublen=subitem.length;
					j=0;
					var ismodule=path.indexOf(link.match)!==-1;
					/*扩展菜单*/
					if('extendmenu' in link){
						if(link['extendmenu']['position']==='before'){
							menustr=extendMenu(link,{
								menustr:menustr,
								suffix:suffix,
								isindex:false,
								ismodule:ismodule
							});
						}
					}
					for(j;j<sublen;j++){
						item=subitem[j];
						/*判断是否存在忽略*/
						if(ignore&&matchIgnore(link,item.modLink)){
							/*存在忽略菜单即执行下一轮检查*/
							continue;
						}
						if(ismodule){
								menustr+='<li><a href=\"'+item.modLink+suffix+'\"><span>'+item.modName+'</span></a></li>';
						}else{
								menustr+='<li><a href=\"../'+link.code+'/'+item.modLink+suffix+'\"><span>'+item.modName+'</span></a></li>';
						}
					}
					/*扩展菜单*/
					if('extendmenu' in link){
						if(link['extendmenu']['position']==='after'){
							menustr=extendMenu(link,{
								menustr:menustr,
								suffix:suffix,
								isindex:false,
								ismodule:ismodule
							});
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

		if(inject&&inject.render){
			menustr+=inject.result;
			$.merge(data.result.menu,inject.data.result.menu);
		}


		if(inject&&inject.resolve){
			/*释放内存*/
			matchClass=null;
			matchModule=null;
			matchIgnore=null;
			extendMenu=null;
			return menustr;
		}

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

		/*释放内存*/
		matchClass=null;
		matchModule=null;
		matchIgnore=null;
		extendMenu=null;
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
		$menu.find("a[href*='"+self.routeMap.path+".html']").parent().addClass('sub-menu-active');
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
	//导航注入扩展
	public_tool.injectSideMenu=function (opt) {
		var res='';
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
			if(data){
				res=data;
			}
		}).fail(function(){
			console.log('error');
		});
		return res;
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
			if(list[i]['funcCode']===key||list[i]['funcCode'].indexOf(key)!==-1){
				ispower=true;
				break;
			}else if(list[i]['funcName']===key||list[i]['funcName'].indexOf(key)!==-1){
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
	/*判断权限是否获取正确*/
	public_tool.isRealPower=function(o1,o2) {
		if ( o1=== o2) {
			return true;
		}
		if ( ! ( o1 instanceof Object ) || ! ( o2 instanceof Object ) ) {
			return false;
		}
		if ( o1.constructor !== o2.constructor ) {
			return false;
		}
		for ( var p in o1 ) {
			if ( o1.hasOwnProperty( p ) ) {
				if ( ! o2.hasOwnProperty( p ) ) {
					return false;
				}
				if ( o1[ p ] === o2[ p ] ) {
					continue;
				}
				if ( typeof( o1[ p ] ) !== "undefined" ) {
					return false;
				}
			}
		}
		for (var  m in o2 ) {
			if ( o2.hasOwnProperty( m ) ) {
				if ( ! o1.hasOwnProperty( m ) ) {
					return false;
				}
				if ( o1[ m ] === o2[ m ] ) {
					continue;
				}
				if ( typeof( o2[ m ] ) !== "undefined" ) {
					return false;
				}
			}
		}
		return true;
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
				var name=self.initMap.loginMap.username;
				public_vars.$admin_show_wrap.html('您好：<span class="g-c-info">&nbsp;'+name+'&nbsp;&nbsp;</span><i class="fa-angle-down"></i>');
				return true;
			}else{
				/*清除缓存*/
				self.loginTips(function () {
					self.clear();
					self.clearCacheData();
				});
				return false;
			}
		}else{
			self.loginTips(function () {});
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
				now_sj=now[1],
				reqdomain=cacheLogin.reqdomain,
				currentdomain=cacheLogin.currentdomain;


			/*判断日期*/
			if(login_rq!==now_rq){
				//同一天有效
				return false;
			}else if(login_rq===now_rq){
				login_sj=login_sj.split(':');
				now_sj=now_sj.split(':');
				var login_hh=parseInt(login_sj[0],10),
					now_hh=parseInt(now_sj[0],10)/*,
					login_mm=parseInt(login_sj[1],10),
					now_mm=parseInt(now_sj[1],10)*/;

				if(now_hh-login_hh>2){
					return false;
				}

				/*if(login_hh!==now_hh){
					//同一小时有效
					return false;
				}else if(now_mm - login_mm >1){
					//多少分钟内有效
					return false;
				}*/
			}



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
	public_tool.loginOut=function(istips){
		var self=this,
			isindex=self.routeMap.isindex,
			module=self.routeMap.module;



		/*根据路径跳转*/
		if(istips){
			self.loginTips(function () {
				/*清除所有记录*/
				self.clear();
				self.clearCacheData();
			});
		}else {
			/*清除所有记录*/
			self.clear();
			self.clearCacheData();
			if(isindex){
				location.href='account/login.html';
			}else{
				if(module.indexOf('account')!==-1){
					location.href='login.html';
				}else{
					location.href='../account/login.html';
				}
			}
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
	public_tool.loginTips=function(fn){
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
						if(typeof fn==='function'){
							fn.call();
						}else{
							self.clear();
							self.clearCacheData();
						}
						location.href='account/login.html';
					}else{
						if(typeof fn==='function'){
							fn.call();
						}else{
							self.clear();
							self.clearCacheData();
						}
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

