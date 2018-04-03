/*自定义扩展*/
(function ($) {
    'use strict';
    angular.module('tool.util', []).factory('toolUtil', ['$http', '$q', '$httpParamSerializerJQLike', 'BASE_CONFIG', function ($http, $q, $httpParamSerializerJQLike, BASE_CONFIG) {
        var system_unique_key = BASE_CONFIG.unique_key || 'yy_admin_unique_key',
            tools = {};
        /*本地存储*/
        //缓存对象
        tools.cache = {};
        /*返回系统唯一标识符*/
        tools.getSystemUniqueKey = function () {
            return system_unique_key;
        };
        //判断是否支持本地存储
        tools.supportBox = (function () {
            var elem = document.getElementsByTagName('body')[0],
                bs = window.getComputedStyle(elem, null).getPropertyValue("box-sizing") || document.defaultView.getComputedStyle(elem, null) || $(elem).css('boxSizing');
            return bs && bs === 'border-box' ? true : false;
        }());
        //判断是否支持本地存储
        tools.supportStorage = (function () {
            return localStorage && sessionStorage ? true : false;
        }());
        //判断是否支持图片
        tools.supportImage = (function () {
            var wURL = window.URL;
            if (wURL) {
                return typeof wURL.createObjectURL === 'function' ? true : false;
            } else {
                return false;
            }
        }());
        //递归查找缓存对象
        tools.paramsItem = function (config, type, action) {
            var self = this,
                key = config.key,
                cache = config.cache,
                value = '';

            if (type === 'set') {
                value = config.value;
                for (var i in cache) {
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
                for (var j in cache) {
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
                for (var k in cache) {
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
        tools.setParams = function (key, value, flag) {
            if (this.supportStorage) {
                if (key === system_unique_key) {
                    if (flag) {
                        /*为localstorage*/
                        sessionStorage.setItem(key, JSON.stringify(value));
                    } else {
                        /*默认为localstorage*/
                        localStorage.setItem(key, JSON.stringify(value));
                    }
                } else {
                    var cache = null,
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
            }
        };
        //获取本地存储
        tools.getParams = function (key, flag) {
            if (this.supportStorage) {
                if (key === system_unique_key) {
                    if (flag) {
                        return JSON.parse(sessionStorage.getItem(system_unique_key)) || null;
                    } else {
                        return JSON.parse(localStorage.getItem(system_unique_key)) || null;
                    }
                } else {
                    var cache = null,
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
            }
            return null;
        };
        //删除本地存储
        tools.removeParams = function (key, flag) {
            if (this.supportStorage) {
                if (key === system_unique_key) {
                    if (flag) {
                        sessionStorage.removeItem(key);
                    } else {
                        localStorage.removeItem(key);
                    }
                } else {
                    var cache = null,
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
            }
        };
        //清除本地存储
        tools.clear = function (flag) {
            if (this.supportStorage) {
                if (flag) {
                    sessionStorage.removeItem(system_unique_key);
                } else {
                    localStorage.removeItem(system_unique_key);
                }
            }
        };
        //清除本地存储
        tools.clearAll = function (flag) {
            if (this.supportStorage) {
                if (flag) {
                    sessionStorage.clear();
                } else {
                    localStorage.clear();
                }
            }
        };
        //遍历本地存储
        tools.getEachParams = function (flag) {
            if (this.supportStorage) {
                var cache = this.getParams(system_unique_key, flag);
                if (cache !== null) {
                    cache = JSON.parse(cache);
                    var res = [];
                    for (var i in cache) {
                        res.push(cache[i]);
                    }
                    return res;
                } else {
                    return null;
                }
            }
            return null;
        };


        /*弹窗*/
        //是否支持弹窗
        tools.supportDia = (function () {
            return (typeof dialog === 'function' && dialog) ? true : false;
        }());


        /*返回请求信息*/
        tools.requestHttp = function (config) {
            var req = config;

            /*适配配置*/
            if (config.set) {
                if (!config.debug) {
                    req.url = this.adaptReqUrl(req.url);
                }
            } else {
                /*debug模式则调用自定义json模式*/
                if (BASE_CONFIG.debug && req.url.indexOf('.json') === -1) {
                    req.url = 'json' + req.url + '.json';
                }
            }
            req.data = $httpParamSerializerJQLike(req.data);
            req['headers'] = {"Content-Type": "application/x-www-form-urlencoded"};

            var deferred = $q.defer(),
                promise = $http(req);

            promise.then(function (resp) {
                deferred.resolve(resp);
            }, function (resp) {
                deferred.reject(resp);
            });
            return deferred.promise;
        };
        /*适配请求信息*/
        tools.adaptReqUrl = function (url, flag) {
            /*debug模式则调用自定义json模式*/
            if (flag) {
                return url;
            } else {
                return BASE_CONFIG.basedomain + BASE_CONFIG.baseproject + url;
            }
        };


        /*加载动画*/
        tools.loading = function (config) {
            var type = config.type,
                model = config.model,
                delay = config.delay;


            if (type === 'show') {
                model.isloading = 'g-d-showi';
            } else if (type === 'hide') {
                model.isloading = 'g-d-hidei';
            }
            /*清除延时指针*/
            if (delay) {
                clearTimeout(delay);
                delay = null;
            }
        };


        /*工具类*/
        //判断闰年
        tools.isLeapYear = function (y, m) {
            var m_arr = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            var isly = (y % 4 == 0 && y % 100 != 0 ) ? true : y % 400 == 0 ? true : false;
            isly ? m_arr.splice(1, 1, 29) : m_arr.splice(1, 1, 28);
            return m ? {isly: isly, months: m_arr, m: m_arr[parseInt(m, 10) - 1]} : {isly: isly, months: m_arr}
        };
        //将人民币转换成大写
        tools.toUpMoney = function (str, wraps) {
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
                i,
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
                for (i = 0; i < integral.length; i++) {
                    p = integral.length - i - 1;
                    d = integral.substr(i, 1);
                    quotient = p / 4;
                    modulus = p % 4;
                    if (d == "0") {
                        zeroCount++;
                    } else {
                        if (zeroCount > 0) {
                            outputCharacters += digits[0];
                        }
                        zeroCount = 0;
                        outputCharacters += digits[Number(d)] + radices[modulus];
                    }
                    if (modulus == 0 && zeroCount < 4) {
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

            if (wraps) {
                return wraps.innerHTML = outputCharacters;
            } else {
                return outputCharacters;
            }
        };
        //银行卡格式化
        tools.cardFormat = function (str) {
            if (typeof str === 'undefined' || str === null) {
                return '';
            }
            var cardno = str.toString().replace(/\s*\D*/g, '');
            if (cardno == '') {
                return '';
            }
            cardno = cardno.split('');
            var len = cardno.length,
                i = 0,
                j = 1;
            for (i; i < len; i++) {
                if (j % 4 == 0 && j != len) {
                    cardno.splice(i, 1, cardno[i] + " ");
                }
                j++;
            }
            return cardno.join('');
        };
        //手机格式化
        tools.phoneFormat = function (str) {
            if (typeof str === 'undefined' || str === null) {
                return '';
            }
            var phoneno = str.toString().replace(/\s*\D*/g, '');
            if (phoneno == '') {
                return '';
            }
            phoneno = phoneno.split('');

            var len = phoneno.length,
                i = 0;
            for (i; i < len; i++) {
                var j = i + 2;
                if (i != 0) {
                    if (i == 2) {
                        phoneno.splice(i, 1, phoneno[i] + " ");
                    } else if (j % 4 == 0 && j != len + 1) {
                        phoneno.splice(i, 1, phoneno[i] + " ");
                    }
                }
            }
            return phoneno.join('');
        };
        //电话格式化
        tools.telePhoneFormat = function (str, type) {
            if (typeof str === 'undefined' || str === null) {
                return '';
            }
            var phoneno = str.toString().replace(/\s*\D*/g, '');
            if (phoneno == '') {
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
        //密码强度(当前密码，提示信息，密码起始范围(数组))
        tools.pwdStrong = function (str, tip, scope) {
            var score = 0,
                txt = this.trims(str),
                len = txt == '' ? 0 : txt.length,
                reg1 = /[a-zA-Z]+/,
                reg2 = /[0-9]+/,
                reg3 = /\W+\D+/;
            if (len >= scope[0] && len <= scope[1]) {
                if (reg1.test(txt) && reg2.test(txt) && reg3.test(txt)) {
                    score = 90;
                } else if (reg1.test(txt) || reg2.test(txt) || reg3.test(txt)) {
                    if (reg1.test(txt) && reg2.test(txt)) {
                        score = 60;
                    } else if (reg1.test(txt) && reg3.test(txt)) {
                        score = 60;
                    } else if (reg2.test(txt) && reg3.test(txt)) {
                        score = 60;
                    } else {
                        score = 30;
                    }
                }
                if (score <= 50) {
                    tip.removeClass().addClass('g-c-gray2').html('低级');
                } else if (score <= 79 && 50 < score) {
                    tip.removeClass().addClass('g-c-orange').html('中级');
                } else if (score >= 80) {
                    tip.removeClass().addClass('g-c-red4').html('高级');
                }
            } else if (txt == "" || txt == "null") {
                tip.removeClass().addClass('g-c-gray2').html('');
            } else if (txt != "" && len < scope[0]) {
                tip.removeClass().addClass('g-c-red4').html('密码长度至少大于' + scope[0] + '位');
            } else {
                tip.removeClass().addClass('g-c-gray2').html('');
            }
        };
        //读秒（定时函数引用，秒数，读秒按钮,可用状态下文字信息，切换的class名称）
        tools.getCount = function (tid, times, nodes, text, classname) {
            var count = 0,
                id = tid,
                t = times,
                n = nodes,
                timer = this.getTimer();
            n.html(times + '秒后重新获取').prop("disabled", true).addClass(classname);
            id = setInterval(function () {
                count = timer();
                count = count <= t ? count : count % t;
                n.html((t - count) + '秒后重新获取');
                if (count == t || count == 0) {
                    clearInterval(id);
                    tid = null;
                    id = null;
                    n.prop("disabled", false).removeClass(classname).html(function () {
                        if (nodes.attr('data-value')) {
                            return nodes.attr('data-value');
                        } else {
                            return text;
                        }

                    });
                }
                ;
            }, 1000);
        };
        //去除所有空格（字符串,需去除字符)：返回字符串
        tools.trimSep = function (str, sep) {
            return str.replace(new RegExp('\\' + sep, 'g'), '');
        };
        //去除所有空格（字符串）：返回字符串
        tools.trims = function (str) {
            return str.replace(/\s*/g, '');
        };
        //去除前后空格(字符串)：返回字符串
        tools.trim = function (str) {
            return str.replace(/^\s*\s*$/, '');
        };
        /*去除表单常用非法字符*/
        tools.trimHtmlIllegal = function (str) {
            var tempstr = str.replace(/["'\/！￥…（）——《》？：“”，。；：’‘、【】]/ig, '');
            return tempstr.replace(/(&#34;|&quot;|&#60;|&lt;|&#62;|&gt;|&#160;|&#180;|&acute;)/ig, '');
        };
        /*去除所有非法字符*/
        tools.trimIllegal = function (str) {
            var tempstr = str.replace(/[`~!@#$%^&*()_+<>?:"{},.\/;'[\]！￥…（）——《》？：“”，。；：’‘、【】]/ig, '');
            return tempstr.replace(/(&#34;|&quot;|&#60;|&lt;|&#62;|&gt;|&#160;|&#180;|&acute;)/ig, '');
        };
        //计时器：返回整数
        tools.getTimer = function () {
            var i = 0;
            return function () {
                return ++i;
            };
        };
        /*是否为正确身份证(身份证字符串)：返回布尔值*/
        tools.isIDCard = function (str) {
            var area = {
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
                var nums = 0,
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
                var years,
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
                var leapyear = this.isLeapYear(years, months);
                if ((leapyear.isly && months === 2 && days > 29) || (!leapyear.isly && months === 2 && days > 28) || (months !== 2 && leapyear.m < days)) {
                    return false;
                }
                //是否为正确识别码
                if (len === 18) {
                    var temparr = idcard.split(''),
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
                    if (ids != tempids) {
                        return false;
                    }
                }
            }
            return true;
        };
        /*是否是合法手机号*/
        tools.isMobilePhone = function (str) {
            var value = this.trims(str);
            if (value === '') {
                return true;
            }
            return /^(13[0-9]|14[579]|15[012356789]|16[6]|17[01235678]|18[0-9]|19[89])[0-9]{8}$/.test(value) ? true : false;
        };
        /*是否是合法手机号*/
        tools.isTelePhone = function (str, type) {
            /*/(\d{4})(\d{8})/*/
            /*^(0[0-9]{2,3})?([2-9][0-9]{6,7})+([0-9]{1,4})?$*/
            var value = this.trims(str);

            value = this.trimSep(value, '-');
            if (value === '') {
                return true;
            }
            if (type) {
                if (type === 3) {
                    return /(\d{3})(\d{8})/.test(value) ? true : false;
                } else if (type === 4) {
                    return /(\d{4})(\d{8})/.test(value) ? true : false;
                } else {
                    return /(\d{4})(\d{8})/.test(value) ? true : false;
                }
            } else {
                return /(\d{4})(\d{8})/.test(value) ? true : false;
            }
        };
        /*是否是合法银行卡号*/
        tools.isBankCard = function (str) {
            var value = this.trims(str);
            if (value === '') {
                return true;
            }
            return /^(\d{16}|\d{19})$/.test(value) ? true : false;
        };
        tools.isNum = function (str) {
            var self = this;
            return /^[0-9]{0,}$/g.test(self.trims(str));
        };
        //自动补全纠错人民币(字符串,最大数位,是否可以返回为空)，返回一个数组['格式化后的数据',带小数点的未格式化数据]
        tools.moneyCorrect = function (str, max, flag) {
            if (typeof str === 'undefined' || str === null) {
                if (flag) {
                    return ['', ''];
                } else {
                    return ['0.00', '0.00'];
                }
            }

            var self = this,
                money = this.trimSep(str.toString(), ','),
                moneyarr,
                len = 0,
                partz,
                partx,
                tempstr = '';

            money = this.trims(money);
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
                if (partx.length == 0) {
                    partx = '.00';
                } else if (partx.length == 1) {
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
            var templen = partz.length;
            if (templen > 3) {
                var i = 0, j = 1;
                partz = partz.split('').reverse();
                for (i; i < templen; i++) {
                    if (j % 3 == 0 && j != templen) {
                        partz.splice(i, 1, ',' + partz[i].toString());
                    }
                    j++;
                }
                partz = partz.reverse().join('');
            } else if (templen == 0) {
                partz = '0';
            }
            if (partz.length >= 2) {
                if (partz.charAt(0) == '0' || partz.charAt(0) == 0) {
                    partz = partz.slice(1);
                }
            }
            if (typeof max !== 'undefined' && max > 3) {
                var filterlen = partz.length;
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
        tools.cursorPos = function (elem, str, index, flag) {
            var vals = '',
                len = 0;
            if (!str) {
                vals = elem.value || $(elem).val() || elem.innerHTML || $(elem).html();
                len = vals.length;
            } else {
                len = str.lengt
            }
            var pos = Number(index);

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
                    var range = elem.createTextRange();
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
        tools.moneyAdd = function (str1, str2) {
            var r1,
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
            m = Math.pow(10, Math.max(r1, r2))
            if (c > 0) {
                var cm = Math.pow(10, c);
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
        tools.moneySub = function (str1, str2) {
            var r1,
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
        tools.moneyMul = function (str1, str2) {
            var m = 0,
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
        tools.moneyDiv = function (str1, str2) {
            var t1 = 0,
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
        ///返回数组索引
        tools.arrIndex = function (str, arr) {
            if (typeof str === 'undefined') {
                return -1;
            }
            if (!arr) {
                return -1;
            }
            var len = arr.length,
                i = 0;
            if (len === 0) {
                return -1;
            } else {
                for (i; i < len; i++) {
                    if (str === arr[i]) {
                        return i;
                    }
                }
                return -1;
            }
        };


        /*解析主菜单*/
        tools.resolveMainMenu = function (data, flag) {
            if (!data) {
                return null;
            } else {
                var len = data.length;
                if (len === 0) {
                    return null;
                }
                var menu_map = {
                        'yttx-organization': 'organization',
                        'yttx-order-manager': 'order',
                        'yttx-invoice-manager': 'invoice',
                        'yttx-purchase-manager': 'purchase',
                        'yttx-warehouse-manager': 'warehouse'
                    },
                    list = [],
                    module = {},
                    menu = {},
                    power = {},
                    i = 0;

                /*设置首页*/
                if (flag) {
                    var index = {
                        id: 0,
                        code: 'app',
                        name: '首页',
                        href: 'app',
                        module: 'app'
                    };
                    list.push(index);
                    menu[0] = index;

                    /*创建权限缓存*/
                    power[0] = {
                        id: 0,
                        code: 'app',
                        name: '首页',
                        module: 'app',
                        power: 0
                    };

                    /*创建模块缓存*/
                    module[0] = {
                        id: 0,
                        code: 'app',
                        name: '首页',
                        module: 'app'
                    };
                }

                for (i; i < len; i++) {
                    var mitem = data[i],
                        mid = mitem['modId'],
                        mlink = mitem['modLink'],
                        msub = mitem['modItem'],
                        mpower = mitem['permitItem'],
                        mname = mitem['modName'],
                        mcode = mitem['modCode'],
                        tempobj = {
                            id: mid,
                            code: mcode,
                            name: mname,
                            href: menu_map[mlink] || mlink,
                            module: menu_map[mlink] || mlink,
                            sub: msub
                        };

                    list.push(tempobj);

                    /*创建菜单缓存*/
                    menu[mid] = tempobj;

                    /*创建权限缓存*/
                    power[mid] = {
                        id: mid,
                        code: mcode,
                        name: mname,
                        module: menu_map[mlink] || mlink,
                        power: mpower
                    };

                    /*创建模块缓存*/
                    module[mid] = {
                        id: mid,
                        code: mcode,
                        name: mname,
                        module: menu_map[mlink] || mlink
                    };
                }
                return {
                    menu: menu,
                    power: power,
                    module: module,
                    list: list
                }
            }
        };
        /*加载主菜单*/
        tools.loadMainMenu = function (data) {
            if (!data) {
                return null;
            } else {
                var list = [];
                for (var i in data) {
                    list.push(data[i]);
                }
            }
            return list.length === 0 ? null : list;
        };


        //根据模块判断拥有的权限(拥有的权限),key:(索引，模块名称),cache:模块；此方法结果一般与isPower配合使用
        tools.getPowerListByModule = function (key, cache) {
            if (typeof key === 'undefined' || !cache) {
                /*没有缓存数据或者索引不存在*/
                return null;
            } else {
                /*查找权限*/
                var currentpower = null;
                for (var i in cache) {
                    if (key === cache[i]['module']) {
                        /*匹配模块关键字,返回匹配到的权限数组*/
                        currentpower = cache[i]['power'];
                        break;
                    } else if (key === cache[i]['id']) {
                        /*匹配模块关键字,返回匹配到的权限数组*/
                        currentpower = cache[i]['power'];
                        break;
                    }
                }

                if (currentpower !== null) {
                    var len = currentpower.length;
                    if (len === 0) {
                        /*权限为空*/
                        return null;
                    } else {
                        return currentpower;
                    }
                }
            }
        };
        //根据关键词判断权限flag:是否过滤没有的权限
        tools.isPower = function (key, list, flag) {
            if (!key || !list) {
                return false;
            }
            var ispower = false,
                i = 0,
                len = list.length;


            if (len === 0) {
                ispower = false;
            } else {
                if (flag) {
                    var ispermit;
                    for (i; i < len; i++) {
                        ispermit = parseInt(list[i]['isPermit'], 10);
                        if ((list[i]['funcCode'] === key || list[i]['funcCode'].indexOf(key) !== -1) && ispermit === 1) {
                            ispower = true;
                            break;
                        } else if ((list[i]['funcName'] === key || list[i]['funcName'].indexOf(key) !== -1) && ispermit === 1) {
                            ispower = true;
                            break;
                        }
                    }
                } else {
                    for (i; i < len; i++) {
                        if (list[i]['funcCode'] === key || list[i]['funcCode'].indexOf(key) !== -1) {
                            ispower = true;
                            break;
                        } else if (list[i]['funcName'] === key || list[i]['funcName'].indexOf(key) !== -1) {
                            ispower = true;
                            break;
                        }
                    }
                }
            }
            return ispower;
        };

        /*调用滚动条*/
        tools.autoScroll = function ($wrap, config) {
            /*是否存在节点，是否*/
            if (!$wrap) {
                return false;
            }
            /*调用*/
            if (config) {
                $wrap.mCustomScrollbar(config);
            } else {
                $wrap.mCustomScrollbar();
            }
        };

        /*登陆接口*/
        tools.isLogin = function (cache) {
            var self = this;
            if (cache === null) {
                cache = self.getParams(BASE_CONFIG.unique_key);
            }
            if (cache && cache.loginMap && cache.loginMap.isLogin) {
                return true;
            }
            return false;
        };
        /*判断缓存是否有效*/
        tools.validLogin = function (obj, str) {
            /*必须有缓存*/
            var self = this,
                cacheLogin = typeof obj !== 'undefined' ? obj : self.getParams('loginMap');

            if (cacheLogin) {
                /*如果已经存在登陆信息则获取登录时间*/
                var login_dt = cacheLogin.datetime;
                if (!login_dt) {
                    return false;
                }
                login_dt = login_dt.replace(/\s*/g, '').split('|');


                var login_rq = login_dt[0],
                    login_sj = login_dt[1],
                    now = moment().format('YYYY-MM-DD|HH:mm:ss').split('|'),
                    now_rq = now[0],
                    now_sj = now[1],
                    reqdomain = cacheLogin.reqdomain;


                /*判断日期*/
                if (login_rq !== now_rq) {
                    //同一天有效
                    return false;
                } else if (login_rq === now_rq) {
                    login_sj = login_sj.split(':');
                    now_sj = now_sj.split(':');
                    var login_hh = parseInt(login_sj[0], 10),
                        now_hh = parseInt(now_sj[0], 10)/*,
                     login_mm=parseInt(login_sj[1],10),
                     now_mm=parseInt(now_sj[1],10)*/;

                    if (now_hh - login_hh > 2) {
                        return false;
                    }
                    /*if(now_mm - login_mm >1){
                     //同一分钟有效
                     return false;
                     }*/
                }

                /*请求域与登陆域不一致*/
                if (str !== '' && reqdomain !== str) {
                    return false;
                }
                return true;
            }
            return false;
        };
        /*初始化判定*/
        tools.isSupport = function () {
            var self = this;
            /*判定兼容性*/
            if (self.supportStorage && self.supportImage && self.supportBox) {
                return true;
            } else {
                return false;
            }
        };
        return tools;
    }]);
})(jQuery);
