import axios from 'axios';
import env from '../config/env';

/*自定义工具类*/
let tool = {};

/*定义相关常量*/
const basedomain = (env === 'development') ? 'http://10.0.5.226:8082' : 'http://112.74.207.132:8081';
const commomdomain = (env === 'development') ? 'http://112.74.207.132:8088' : 'http://112.74.207.132:8088';
const baseproject = '/mall-buzhubms-api';
const system_name = 'mall_admin';
const system_key = 'unique_key_2018';
const system_unique_key = `${system_name}_${system_key}`;


/*返回系统唯一标识符*/
tool.getSystemUniqueKey = function () {
    return system_unique_key;
};
//判断是否盒模型
tool.supportBox = function () {
    let elem = document.getElementsByTagName('body')[0],
        bs = window.getComputedStyle(elem, null).getPropertyValue("box-sizing") || document.defaultView.getComputedStyle(elem, null) || document.querySelector(elem).css('boxSizing');
    return bs && bs === 'border-box';
};
//判断是否支持本地存储
tool.supportStorage = (function () {
    return localStorage && sessionStorage;
}());
//判断是否支持图片
tool.supportImage = (function () {
    let wURL = window.URL;
    if (wURL) {
        return typeof wURL.createObjectURL === 'function';
    } else {
        return false;
    }
}());
//递归查找缓存对象
tool.paramsItem = function (config, type, action) {
    let self = this,
        key = config.key,
        cache = config.cache,
        value = '';

    if (type === 'set') {
        value = config.value;
        for (let i in cache) {
            if (i === key) {
                cache[i] = value;
                return true;
            } else {
                if (typeof cache[i] === 'object') {
                    self.paramsItem({
                        key: key,
                        value: value,
                        cache: cache[i]
                    }, type);
                }
            }
        }
    } else if (type === 'get') {
        for (let j in cache) {
            if (j === key) {
                return cache[j];
            } else {
                if (typeof cache[j] === 'object') {
                    self.paramsItem({
                        key: key,
                        cache: cache[j]
                    }, type);
                }
            }
        }
    } else if (type === 'find') {
        for (let k in cache) {
            if (k === key) {
                if (action === 'delete') {
                    delete cache[k];
                } else if (action === 'other') {
                    /*to do*/
                }
                return true;
            } else {
                if (typeof cache[k] === 'object') {
                    self.paramsItem({
                        key: key,
                        cache: cache[k]
                    }, type);
                }
            }
        }
    }
};
//设置本地存储
tool.setParams = function (key, value, flag) {
    if (key === system_unique_key) {
        if (flag) {
            /*为localstorage*/
            sessionStorage.setItem(key, JSON.stringify(value));
        } else {
            /*默认为localstorage*/
            localStorage.setItem(key, JSON.stringify(value));
        }
    } else {
        let cache = null,
            self = this;
        if (flag) {
            cache = JSON.parse(sessionStorage.getItem(system_unique_key));
        } else {
            cache = JSON.parse(localStorage.getItem(system_unique_key));
        }
        if (cache !== null) {
            if (typeof key !== 'undefined') {
                self.paramsItem({
                    key: key,
                    value: value,
                    cache: cache
                }, 'set');
            }
        } else {
            cache = {};
            cache[key] = value;
        }
        if (flag) {
            /*为localstorage*/
            sessionStorage.setItem(system_unique_key, JSON.stringify(cache));
        } else {
            /*默认为localstorage*/
            localStorage.setItem(system_unique_key, JSON.stringify(cache));
        }
    }
};
//获取本地存储
tool.getParams = function (key, flag) {
    if (key === system_unique_key) {
        if (flag) {
            return JSON.parse(sessionStorage.getItem(system_unique_key)) || null;
        } else {
            return JSON.parse(localStorage.getItem(system_unique_key)) || null;
        }
    } else {
        let cache = null,
            self = this;
        if (flag) {
            cache = sessionStorage.getItem(system_unique_key);
        } else {
            cache = localStorage.getItem(system_unique_key);
        }
        if (cache !== null) {
            if (typeof key !== 'undefined') {
                return self.paramsItem({
                    key: key,
                    cache: JSON.parse(cache)
                }, 'get');
            }
            return JSON.parse(cache);
        } else {
            return null;
        }
    }
};
//删除本地存储
tool.removeParams = function (key, flag) {
    if (key === system_unique_key) {
        if (flag) {
            sessionStorage.removeItem(key);
        } else {
            localStorage.removeItem(key);
        }
    } else {
        let cache = null,
            self = this;
        if (flag) {
            cache = sessionStorage.getItem(system_unique_key);
        } else {
            cache = localStorage.getItem(system_unique_key);
        }
        if (cache !== null) {
            if (typeof key !== 'undefined') {
                self.paramsItem({
                    key: key,
                    cache: JSON.parse(cache)
                }, 'find', 'delete');
                if (flag) {
                    /*为localstorage*/
                    sessionStorage.setItem(system_unique_key, JSON.stringify(cache));
                } else {
                    /*默认为localstorage*/
                    localStorage.setItem(system_unique_key, JSON.stringify(cache));
                }
            }
        }
    }
};
//清除本地存储
tool.clear = function (flag) {
    if (flag) {
        sessionStorage.removeItem(system_unique_key);
    } else {
        localStorage.removeItem(system_unique_key);
    }
};
//清除本地存储
tool.clearAll = function (flag) {
    if (flag) {
        sessionStorage.clear();
    } else {
        localStorage.clear();
    }
};
/*返回请求信息*/
tool.requestHttp = function (config) {
    let conf=config;

    //conf['baseUrl']='';
    let req = this.adaptReqUrl(conf);
    return axios.create(req);
};
/*适配请求信息*/
tool.adaptReqUrl = function (url, common, debug) {
    /*debug模式则调用自定义json模式*/
    if (debug) {
        return 'static/test.json';
    } else {
        if (common) {
            return `${commomdomain}${baseproject}${url}`;
        } else {
            return `${basedomain}${baseproject}${url}`;
        }
    }
};
/*适配请求配置*/
tool.adaptReqConfig = function (config) {
    if (config.common) {
        /*如果是公用请求*/
        if (!config.url.test(new RegExp('\\' + commomdomain, 'g'))) {
            /*如果地址需要适配则适配*/
            config.url = tool.adaptReqUrl(config.url, true, false);
        }
    } else {
        /*如果是常用请求*/
        if (!config.url.test(new RegExp('\\' + basedomain, 'g'))) {
            /*如果地址需要适配则适配*/
            config.url = tool.adaptReqUrl(config.url, false, false);
        }
    }
    return config;
};
/*判断闰年*/
tool.isLeapYear = function (y, m) {
    let m_arr = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let isly = (y % 4 === 0 && y % 100 !== 0) ? true : y % 400 === 0;
    isly ? m_arr.splice(1, 1, 29) : m_arr.splice(1, 1, 28);
    return m ? {isly: isly, months: m_arr, m: m_arr[parseInt(m, 10) - 1]} : {isly: isly, months: m_arr}
};
/*将人民币转换成大写*/
tool.toUpMoney = function (str, wraps) {
    let cn_zero = "零",
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
        cn_symbol = "",
        cn_dollar = "元",
        cn_ten_cent = "角",
        cn_cent = "分",
        cn_integer = "整",
        integral,
        decimal,
        outputCharacters,
        digits,
        radices,
        bigRadices,
        decimals,
        zeroCount,
        p,
        d,
        quotient,
        modulus,
        tvs = str.toString(),
        formatstr = tvs.replace(/^0+/, ""),
        parts = formatstr.split(".");

    if (parts.length > 1) {
        integral = parts[0];
        decimal = parts[1];
        decimal = decimal.slice(0, 2);
    } else {
        integral = parts[0];
        decimal = "";
    }
    digits = [cn_zero, cn_one, cn_two, cn_three, cn_four, cn_five, cn_six, cn_seven, cn_height, cn_nine];
    radices = ["", cn_ten, cn_hundred, cn_thousand];
    bigRadices = ["", cn_ten_thousand, cn_hundred_million];
    decimals = [cn_ten_cent, cn_cent];
    outputCharacters = "";
    if (Number(integral) > 0) {
        zeroCount = 0;
        for (let i = 0; i < integral.length; i++) {
            p = integral.length - i - 1;
            d = integral.substr(i, 1);
            quotient = p / 4;
            modulus = p % 4;
            if (d === "0") {
                zeroCount++;
            } else {
                if (zeroCount > 0) {
                    outputCharacters += digits[0];
                }
                zeroCount = 0;
                outputCharacters += digits[Number(d)] + radices[modulus];
            }
            if (modulus === 0 && zeroCount < 4) {
                outputCharacters += bigRadices[quotient];
            }
        }
        outputCharacters += cn_dollar;
    }
    if (decimal !== "") {
        for (let i = 0; i < decimal.length; i++) {
            d = decimal.substr(i, 1);
            if (d !== "0") {
                outputCharacters += digits[Number(d)] + decimals[i];
            }
        }
    }
    if (outputCharacters === "") {
        outputCharacters = cn_zero + cn_dollar;
    }
    if (decimal === "") {
        outputCharacters += cn_integer;
    }
    outputCharacters = cn_symbol + outputCharacters;

    if (wraps) {
        return wraps.innerHTML = outputCharacters;
    } else {
        return outputCharacters;
    }
};
/*银行卡格式化*/
tool.cardFormat = function (str) {
    if (typeof str === 'undefined' || str === null) {
        return '';
    }
    let cardno = str.toString().replace(/\s*\D*/g, '');
    if (cardno === '') {
        return '';
    }
    cardno = cardno.split('');
    let len = cardno.length,
        i = 0,
        j = 1;
    for (i; i < len; i++) {
        if (j % 4 === 0 && j !== len) {
            cardno.splice(i, 1, cardno[i] + " ");
        }
        j++;
    }
    return cardno.join('');
};
//手机格式化
tool.phoneFormat = function (str) {
    if (typeof str === 'undefined' || str === null) {
        return '';
    }
    let phoneno = str.toString().replace(/\s*\D*/g, '');
    if (phoneno === '') {
        return '';
    }
    phoneno = phoneno.split('');

    let len = phoneno.length,
        i = 0;
    for (i; i < len; i++) {
        let j = i + 2;
        if (i !== 0) {
            if (i === 2) {
                phoneno.splice(i, 1, phoneno[i] + " ");
            } else if (j % 4 === 0 && j !== len + 1) {
                phoneno.splice(i, 1, phoneno[i] + " ");
            }
        }
    }
    return phoneno.join('');
};
//电话格式化
tool.telePhoneFormat = function (str, type) {
    if (typeof str === 'undefined' || str === null) {
        return '';
    }
    let phoneno = str.toString().replace(/\s*\D*/g, '');
    if (phoneno === '') {
        return '';
    }
    phoneno = phoneno.split('');
    if (type) {
        if (type === 3) {
            if (phoneno.length >= 3) {
                phoneno.splice(2, 1, phoneno[2] + "-");
            }
        } else if (type === 4) {
            if (phoneno.length >= 4) {
                phoneno.splice(3, 1, phoneno[3] + "-");
            }
        } else {
            if (phoneno.length >= 4) {
                phoneno.splice(3, 1, phoneno[3] + "-");
            }
        }
    } else {
        if (phoneno.length >= 4) {
            phoneno.splice(3, 1, phoneno[3] + "-");
        }
    }
    return phoneno.join('');
};
//去除所有空格（字符串,需去除字符)：返回字符串
tool.trimSep = function (str, sep) {
    return str.replace(new RegExp('\\' + sep, 'g'), '');
};
//去除所有空格（字符串）：返回字符串
tool.trims = function (str) {
    return str.replace(/\s*/g, '');
};
//去除前后空格(字符串)：返回字符串
tool.trim = function (str) {
    return str.replace(/^\s*\s*$/, '');
};
/*去除表单常用非法字符*/
tool.trimHtmlIllegal = function (str) {
    let tempstr = str.replace(/["'\/！￥…（）——《》？：“”，。；：’‘、【】]/i, '');
    return tempstr.replace(/(&#34;|&quot;|&#60;|&lt;|&#62;|&gt;|&#160;|&#180;|&acute;)/i, '');
};
/*去除所有非法字符*/
tool.trimIllegal = function (str) {
    let tempstr = str.replace(/[`~!@#$%^&*()_+<>?:"{},.\/;'[\]！￥…（）——《》？：“”，。；：’‘、【】]/ig, '');
    return tempstr.replace(/(&#34;|&quot;|&#60;|&lt;|&#62;|&gt;|&#160;|&#180;|&acute;)/ig, '');
};
/*是否为正确身份证(身份证字符串)：返回布尔值*/
tool.isIDCard = function (str) {
    let area = {
            '11': "北京",
            '12': "天津",
            '13': "河北",
            '14': "山西",
            '15': "内蒙古",
            '21': "辽宁",
            '22': "吉林",
            '23': "黑龙江",
            '31': "上海",
            '32': "江苏",
            '33': "浙江",
            '34': "安徽",
            '35': "福建",
            '36': "江西",
            '37': "山东",
            '41': "河南",
            '42': "湖北",
            '43': "湖南",
            '44': "广东",
            '45': "广西",
            '46': "海南",
            '50': "重庆",
            '51': "四川",
            '52': "贵州",
            '53': "云南",
            '54': "西藏",
            '61': "陕西",
            '62': "甘肃",
            '63': "青海",
            '64': "宁夏",
            '65': "新疆",
            '71': "台湾",
            '81': "香港",
            '82': "澳门",
            '91': "国外"
        },
        wf = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2],
        last = [1, 0, 'x', 9, 8, 7, 6, 5, 4, 3, 2],
        idcard = this.trims(str.toString()),
        len = idcard.length;
    //判断是否为有效位
    if (idcard === '' || len < 15 || (len > 15 && len < 18) || len > 18) {
        return false;
    } else {
        //是否为为数字
        let nums = 0,
            nlen = 0;
        if (len === 18) {
            nums = idcard.slice(0, 17).replace(/\D*/g, '');
        } else if (len === 15) {
            nums = idcard.slice(0, 14).replace(/\D*/g, '');
        }
        nlen = nums.length;
        if (nlen < 14 || (nlen > 14 && nlen < 17)) {
            return false;
        }
        //是否为有效地区
        if (area[idcard.slice(0, 2)] == null) {
            return false;
        }
        let years,
            months,
            days,
            sex;
        if (len === 18) {
            years = parseInt(idcard.slice(6, 10));
            months = parseInt(idcard.slice(10, 12));
            days = parseInt(idcard.slice(12, 14));
            sex = parseInt(idcard.slice(16, 17));
        } else if (len === 15) {
            years = parseInt(idcard.slice(6, 8)) + 1900;
            months = parseInt(idcard.slice(8, 10));
            days = parseInt(idcard.slice(10, 12));
            sex = parseInt(idcard.slice(14));
        }
        //是否为有效月份
        if (months > 12 || months < 1) {
            return false;
        }
        //是否为有效天
        if (days < 1) {
            return false;
        }
        let leapyear = this.isLeapYear(years, months);
        if ((leapyear.isly && months === 2 && days > 29) || (!leapyear.isly && months === 2 && days > 28) || (months !== 2 && leapyear.m < days)) {
            return false;
        }
        //是否为正确识别码
        if (len === 18) {
            let temparr = idcard.split(''),
                tempmax = 0,
                i = 0,
                haves = 0,
                ids = parseInt(idcard.slice(17)),
                tempids = 0;
            if (isNaN(ids)) {
                ids = 'x';
            }
            for (i; i < 17; i++) {
                tempmax += wf[i] * parseInt(temparr[i]);
            }
            haves = tempmax % 11;
            tempids = last[haves];
            if (ids !== tempids) {
                return false;
            }
        }
    }
    return true;
};
/*是否是合法手机号*/
tool.isMobilePhone = function (str) {
    let value = this.trims(str);
    if (value === '') {
        return true;
    }
    return /^(13[0-9]|14[579]|15[012356789]|16[6]|17[01235678]|18[0-9]|19[89])[0-9]{8}$/.test(value);
};
/*是否是合法手机号*/
tool.isTelePhone = function (str, type) {
    let value = this.trims(str);

    value = this.trimSep(value, '-');
    if (value === '') {
        return true;
    }
    if (type) {
        if (type === 3) {
            return /(\d{3})(\d{8})/.test(value);
        } else if (type === 4) {
            return /(\d{4})(\d{8})/.test(value);
        } else {
            return /(\d{4})(\d{8})/.test(value);
        }
    } else {
        return /(\d{4})(\d{8})/.test(value);
    }
};
/*是否是合法银行卡号*/
tool.isBankCard = function (str) {
    let value = this.trims(str);
    if (value === '') {
        return true;
    }
    return /^(\d{16}|\d{19})$/.test(value);
};
tool.isNum = function (str) {
    return /^[0-9]{0,}$/g.test(this.trims(str));
};
//自动补全纠错人民币(字符串,最大数位,是否可以返回为空)，返回一个数组['格式化后的数据',带小数点的未格式化数据]
tool.moneyCorrect = function (str, max, flag) {
    if (typeof str === 'undefined' || str === null) {
        if (flag) {
            return ['', ''];
        } else {
            return ['0.00', '0.00'];
        }
    }

    let self = this,
        money = this.trimSep(str.toString(), ','),
        moneyarr,
        len = 0,
        partz,
        partx,
        tempstr = '';

    money = self.trims(money);
    if (money === '') {
        if (flag) {
            return ['', ''];
        } else {
            return ['0.00', '0.00'];
        }
    }
    if (flag && (parseInt(money * 100, 10) === 0)) {
        return ['', ''];
    }
    if (money.lastIndexOf('.') !== -1) {
        moneyarr = money.split('.');
        len = moneyarr.length;
        if (len > 2) {
            partz = moneyarr[len - 2];
            partx = moneyarr[len - 1];
        } else {
            partz = moneyarr[0];
            partx = moneyarr[1];
        }
        if (!self.isNum(partx)) {
            partx = partx.replace(/\D*/g, '');
        }
        if (partx.length === 0) {
            partx = '.00';
        } else if (partx.length === 1) {
            partx = '.' + partx + '0';
        } else if (partx.length >= 2) {
            partx = '.' + partx.slice(0, 2);
        }
    } else {
        partz = money;
        partx = '.00';
    }
    if (!self.isNum(partz)) {
        partz = partz.replace(/\D*/g, '');
    }
    tempstr = partz + partx;
    let templen = partz.length;
    if (templen > 3) {
        let i = 0,
            j = 1;
        partz = partz.split('').reverse();
        for (i; i < templen; i++) {
            if (j % 3 === 0 && j !== templen) {
                partz.splice(i, 1, ',' + partz[i].toString());
            }
            j++;
        }
        partz = partz.reverse().join('');
    } else if (templen === 0) {
        partz = '0';
    }
    if (partz.length >= 2) {
        if (partz.charAt(0) === '0' || partz.charAt(0) === 0) {
            partz = partz.slice(1);
        }
    }
    if (typeof max !== 'undefined' && max > 3) {
        let filterlen = partz.length;
        if ((filterlen + 3) > max) {
            partz = partz.slice(0, max - 3);
            filterlen = partz.length;
            if (partz.charAt(filterlen - 1) === ',') {
                partz = partz.slice(0, filterlen - 1);
            }
        }
    }
    return [partz + partx, tempstr];
};
//光标定位至具体位置(需定位元素,[元素中字符],定位位置，[是否在特定位置的前或者后])
tool.cursorPos = function (elem, str, index, flag) {
    let vals = '',
        len = 0;
    if (!str) {
        vals = elem.value || elem.innerHTML;
        len = vals.length;
    } else {
        len = str.length;
    }
    let pos = Number(index);

    if (isNaN(pos)) {
        pos = str.indexOf(index);
    }

    //elem.focus();
    setTimeout(function () {
        if (elem.setSelectionRange) {
            if (!flag) {
                elem.setSelectionRange(pos, pos);
            } else {
                elem.setSelectionRange(pos + 1, pos + 1);
            }
        } else {
            let range = elem.createTextRange();
            range.moveStart("character", -len);
            range.moveEnd("character", -len);
            if (!flag) {
                range.moveStart("character", pos);
            } else {
                range.moveStart("character", pos + 1);
            }
            range.moveEnd("character", 0);
            range.select();
        }
    }, 0);
};
///金额加法
tool.moneyAdd = function (str1, str2) {
    let r1,
        r2,
        m,
        c,
        txt1 = str1.toString(),
        txt2 = str2.toString();
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
    m = Math.pow(10, Math.max(r1, r2));
    if (c > 0) {
        let cm = Math.pow(10, c);
        if (r1 > r2) {
            txt1 = Number(txt1.replace(/\.*/g, ''));
            txt2 = Number(txt2.replace(/\.*/g, '')) * cm;
        } else {
            txt1 = Number(txt1.replace(/\.*/g, '')) * cm;
            txt2 = Number(txt2.replace(/\.*/g, ''));
        }
    } else {
        txt1 = Number(txt1.replace(/\.*/g, ''));
        txt2 = Number(txt2.toString().replace(/\.*/g, ''));
    }
    return (txt1 + txt2) / m;
};
///金额减法
tool.moneySub = function (str1, str2) {
    let r1,
        r2,
        m,
        n;
    try {
        r1 = str1.toString().split(".")[1].length;
    } catch (e) {
        r1 = 0;
    }
    try {
        r2 = str2.toString().split(".")[1].length;
    } catch (e) {
        r2 = 0;
    }
    m = Math.pow(10, Math.max(r1, r2));
    n = (r1 >= r2) ? r1 : r2;
    return ((str1 * m - str2 * m) / m).toFixed(n);
};
///金额乘法
tool.moneyMul = function (str1, str2) {
    let m = 0,
        s1 = str1.toString(),
        s2 = str2.toString();
    try {
        m += s1.split(".")[1].length;
    } catch (e) {
        m += 0;
    }
    try {
        m += s2.split(".")[1].length;
    } catch (e) {
        m += 0;
    }
    return Number(s1.replace(/\.*/g, '')) * Number(s2.replace(/\.*/g, '')) / Math.pow(10, m);
};
///金额除法
tool.moneyDiv = function (str1, str2) {
    let t1 = 0,
        t2 = 0,
        r1,
        r2,
        txt1 = str1.toString(),
        txt2 = str2.toString();
    try {
        t1 = txt1.split(".")[1].length;
    } catch (e) {
    }
    try {
        t2 = txt2.split(".")[1].length;
    } catch (e) {
    }
    r1 = Number(txt1.replace(/\.*/g, ''));
    r2 = Number(txt1.replace(/\.*/g, ''));
    return (r1 / r2) * Math.pow(10, t2 - t1);
};

export default tool;