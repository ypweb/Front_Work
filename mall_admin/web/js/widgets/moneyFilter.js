/*人民币输入控制*/
;(function ($) {
    /*构造函数*/
    function BaseMoneyFilter() {
    }

    /*子类*/
    function SubMoneyFilter() {
    }

    /*空函数*/
    function nofn() {
    }


    /*初始化函数*/
    BaseMoneyFilter.prototype.moneyFilter = function (nodelist, flag) {
        /*flag:是否格式化*/
        var nodelen = nodelist.length;
        /*只有范围2个值才做操作处理*/
        $.each(nodelist, function () {
            var self = this,
                selector = self.selector,
                key = selector.toLowerCase();

            self.on('keyup focusout', function (e) {
                var etype = e.type,
                    own = this,
                    item,
                    value = own.value,
                    minvalue,
                    maxvalue,
                    tempvalue,
                    minitem,
                    maxitem;

                if (etype === 'keyup') {
                    if (flag) {
                        value = value.replace(/[^0-9\.\,]*/g, '');
                    } else {
                        value = value.replace(/[^0-9\.]*/g, '');
                    }
                    own.value = value;
                } else if (etype === 'focusout') {
                    if (value === '') {
                        return false;
                    }
                    item = public_tool.moneyCorrect(value, 15, true);
                    if (nodelen === 2) {
                        if (key.indexOf('start') !== -1 || key.indexOf('from') !== -1) {
                            maxitem = public_tool.moneyCorrect(nodelist[1].val(), 15, true);
                            if (maxitem[1] !== '') {
                                tempvalue = parseInt(item[1] * 100, 10);
                                maxvalue = parseInt(maxitem[1] * 100, 10);
                                if (tempvalue > maxvalue) {
                                    if (flag) {
                                        own.value = maxitem[0];
                                    } else {
                                        own.value = maxitem[1];
                                    }
                                } else {
                                    if (flag) {
                                        own.value = item[0];
                                    } else {
                                        own.value = item[1];
                                    }
                                }
                            } else {
                                if (flag) {
                                    own.value = item[0];
                                } else {
                                    own.value = item[1];
                                }
                            }
                        } else if (key.indexOf('end') !== -1 || key.indexOf('to') !== -1) {
                            minitem = public_tool.moneyCorrect(nodelist[0].val(), 15, true);
                            if (minitem[1] !== '') {
                                tempvalue = parseInt(item[1] * 100, 10);
                                minvalue = parseInt(minitem[1] * 100, 10);
                                if (tempvalue < minvalue) {
                                    if (flag) {
                                        own.value = minitem[0];
                                    } else {
                                        own.value = minitem[1];
                                    }
                                } else {
                                    if (flag) {
                                        own.value = item[0];
                                    } else {
                                        own.value = item[1];
                                    }
                                }
                            } else {
                                if (flag) {
                                    own.value = item[0];
                                } else {
                                    own.value = item[1];
                                }
                            }
                        } else {
                            /*异常情况*/
                            if (flag) {
                                own.value = item[0];
                            } else {
                                own.value = item[1];
                            }
                        }
                    } else {
                        if (flag) {
                            own.value = item[0];
                        } else {
                            own.value = item[1];
                        }
                    }
                }
            });
        });
    };


    /*设置继承*/
    nofn.prototype = BaseMoneyFilter.prototype;
    SubMoneyFilter.prototype = new nofn();

    /*设置地址对外接口*/
    if (window['moneyFilterWidget']) {
        window['moneyFilterWidget'] = window['moneyFilterWidget'];
    } else {
        window['moneyFilterWidget'] = new SubMoneyFilter();
    }
})(jQuery);