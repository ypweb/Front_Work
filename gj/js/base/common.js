
/*自定义扩展*/
(function($){
	'use strict';
	/*工具函数类*/
	var system_unique_key=BASE_CONFIG.unique_key||'yy_admin_unique_key',
		tools={};
	/*本地存储*/
	//缓存对象
	tools.cache={};
	/*返回系统唯一标识符*/
	tools.getSystemUniqueKey=function () {
		return system_unique_key;
	};
	//判断是否支持本地存储
	tools.supportBox=(function(){
		var elem = document.getElementsByTagName('body')[0],
			bs = window.getComputedStyle(elem,null).getPropertyValue("box-sizing")||document.defaultView.getComputedStyle(elem,null)||$(elem).css('boxSizing');
		return bs&&bs==='border-box'?true:false;
	}());
	//判断是否支持本地存储
	tools.supportStorage=(function(){
		return localStorage&&sessionStorage?true:false;
	}());
	//判断是否支持图片
	tools.supportImage=(function(){
		var wURL=window.URL;
		if(wURL){
			return typeof wURL.createObjectURL==='function'?true:false;
		}else{
			return false;
		}
	}());
	//递归查找缓存对象
	tools.paramsItem=function (config,type,action) {
		var self=this,
			key=config.key,
			cache=config.cache,
			value='';

		if(type==='set'){
			value=config.value;
			for(var i in cache){
				if(i===key){
					cache[i]=value;
					return true;
				}else{
					if(typeof cache[i]==='object'){
						self.paramsItem({
							key:key,
							value:value,
							cache:cache[i]
						},type);
					}
				}
			}
		}else if(type==='get'){
			for(var j in cache){
				if(j===key){
					return cache[j];
				}else{
					if(typeof cache[j]==='object'){
						self.paramsItem({
							key:key,
							cache:cache[j]
						},type);
					}
				}
			}
		}else if(type==='find'){
			for(var k in cache){
				if(k===key){
					if(action==='delete'){
						delete cache[k];
					}else if(action==='other'){
						/*to do*/
					}
					return true;
				}else{
					if(typeof cache[k]==='object'){
						self.paramsItem({
							key:key,
							cache:cache[k]
						},type);
					}
				}
			}
		}
	};
	//设置本地存储
	tools.setParams=function(key,value,flag){
		if(this.supportStorage){
			if(key===system_unique_key){
				if(flag){
					/*为localstorage*/
					sessionStorage.setItem(key,JSON.stringify(value));
				}else{
					/*默认为localstorage*/
					localStorage.setItem(key,JSON.stringify(value));
				}
			}else{
				var cache=null,
					self=this;
				if(flag){
					cache=JSON.parse(sessionStorage.getItem(system_unique_key));
				}else{
					cache=JSON.parse(localStorage.getItem(system_unique_key));
				}
				if(cache!==null){
					if(typeof key!=='undefined'){
						self.paramsItem({
							key:key,
							value:value,
							cache:cache
						},'set');
					}
				}else{
					cache={};
					cache[key]=value;
				}
				if(flag){
					/*为localstorage*/
					sessionStorage.setItem(system_unique_key,JSON.stringify(cache));
				}else{
					/*默认为localstorage*/
					localStorage.setItem(system_unique_key,JSON.stringify(cache));
				}
			}
		}
	};
	//获取本地存储
	tools.getParams=function(key,flag){
		if(this.supportStorage){
			if(key===system_unique_key){
				if(flag){
					return JSON.parse(sessionStorage.getItem(system_unique_key))||null;
				}else{
					return JSON.parse(localStorage.getItem(system_unique_key))||null;
				}
			}else{
				var cache=null,
					self=this;
				if(flag){
					cache=sessionStorage.getItem(system_unique_key);
				}else{
					cache=localStorage.getItem(system_unique_key);
				}
				if(cache!==null){
					if(typeof key!=='undefined'){
						return self.paramsItem({
							key:key,
							cache:JSON.parse(cache)
						},'get');
					}
					return JSON.parse(cache);
				}else{
					return null;
				}
			}
		}
		return null;
	};
	//删除本地存储
	tools.removeParams=function(key,flag){
		if(this.supportStorage){
			if(key===system_unique_key){
				if(flag){
					sessionStorage.removeItem(key);
				}else{
					localStorage.removeItem(key);
				}
			}else{
				var cache=null,
					self=this;
				if(flag){
					cache=sessionStorage.getItem(system_unique_key);
				}else{
					cache=localStorage.getItem(system_unique_key);
				}
				if(cache!==null){
					if(typeof key!=='undefined'){
						self.paramsItem({
							key:key,
							cache:JSON.parse(cache)
						},'find','delete');
						if(flag){
							/*为localstorage*/
							sessionStorage.setItem(system_unique_key,JSON.stringify(cache));
						}else{
							/*默认为localstorage*/
							localStorage.setItem(system_unique_key,JSON.stringify(cache));
						}
					}
				}
			}
		}
	};
	//清除本地存储
	tools.clear=function(flag){
		if(this.supportStorage){
			if(flag){
				sessionStorage.removeItem(system_unique_key);
			}else{
				localStorage.removeItem(system_unique_key);
			}
		}
	};
	//清除本地存储
	tools.clearAll=function(flag){
		if(this.supportStorage){
			if(flag){
				sessionStorage.clear();
			}else{
				localStorage.clear();
			}
		}
	};
	//遍历本地存储
	tools.getEachParams=function(flag){
		if(this.supportStorage){
			var cache=this.getParams(system_unique_key,flag);
			if(cache!==null){
				cache=JSON.parse(cache);
				var res=[];
				for(var i in cache){
					res.push(cache[i]);
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
	tools.supportDia=(function(){
		return (typeof dialog==='function'&&dialog)?true:false;
	}());
	//弹窗确认
	tools.sureDialog=function(tips){
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
	tools.isLeapYear=function(y, m) {
		var m_arr = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
		var isly = (y % 4 == 0 && y % 100 != 0 )? true : y % 400 == 0 ? true : false;
		isly ? m_arr.splice(1, 1, 29) : m_arr.splice(1, 1, 28);
		return m?{isly: isly,months: m_arr,m: m_arr[parseInt(m, 10) - 1]}:{isly: isly,months: m_arr}
	};
	//将人民币转换成大写
	tools.toUpMoney=function(str,wraps){
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
	tools.cardFormat=function(str){
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
	tools.phoneFormat=function(str){
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
	tools.pwdStrong=function(str,tip,scope){
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
	tools.getCount=function(tid,times,nodes,text,classname){
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
	tools.trimSep=function(str,sep){
		return str.replace(new RegExp('\\'+sep,'g'),'');
	};
	//去除所有空格（字符串）：返回字符串
	tools.trims=function(str){
		return str.replace(/\s*/g,'');
	};
	//去除前后空格(字符串)：返回字符串
	tools.trim=function(str){
		return str.replace(/^\s*\s*$/,'');
	};
	//计时器：返回整数
	tools.getTimer=function(){
		var i=0;
		return function(){
			return ++i;
		};
	};
	/*是否为正确身份证(身份证字符串)：返回布尔值*/
	tools.isIDCard=function(str){
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
	tools.isMobilePhone=function(str){
		return /^(13[0-9]|14[579]|15[012356789]|16[6]|17[01235678]|18[0-9]|19[89])[0-9]{8}$/.test(this.trims(str))?true:false;
	};
	/**/
	tools.isNum=function(str){
		var self=this;
		return /^[0-9]{0,}$/g.test(self.trims(str));
	};
	//自动补全纠错人民币(字符串,最大数位,是否可以返回为空)，返回一个数组['格式化后的数据',带小数点的未格式化数据]
	tools.moneyCorrect=function(str,max,flag){
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
	tools.cursorPos=function(elem,str,index,flag){
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
	tools.moneyAdd=function(str1,str2){
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
	tools.moneySub=function(str1,str2){
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
	tools.moneyMul=function(str1,str2){
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
	tools.moneyDiv=function(str1,str2){
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





	//模拟滚动条更新
	tools.scrollUpdate=function(flag,$wrap){
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
	tools.scrollInit=function($wrap){
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
	tools.scrollDestroy=function($wrap){
		if($.isFunction($.fn.perfectScrollbar)){
			$wrap.find('.sidebar-menu-inner').perfectScrollbar('destroy');
		}
	};



	/*登陆缓存*/
	tools.initMap={
		isrender:false,
		loginMap:{}
	};
	/*登陆接口*/
	tools.isLogin=function(){
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
	tools.validLogin=function(obj){
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
	tools.loginOut=function(istips){
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
	tools.clearCacheData=function(){
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
	tools.loginTips=function(fn){
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
	tools.isRender=function(){
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
	tools.initLoading=function(){
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


	window.tools=tools;
})(jQuery);





