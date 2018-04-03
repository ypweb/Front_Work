/*日历组件*/
;(function ($) {
    /*构造函数*/
    function BaseDatePick() {
    }

    /*子类*/
    function SubDatePick() {
    }

    /*空函数*/
    function nofn() {
    }


    /*初始化函数*/
    BaseDatePick.prototype.datePick = function (selector) {
        if (WdatePicker && typeof WdatePicker === 'function') {
            var len = selector.length;
            $.each(selector, function (index) {
                var $this = $(this);
                $this.val('');
                $this.on('click', function (e) {
                    var curid = e.target.id,
                        temepid = curid.toLowerCase();
                    if ((temepid.indexOf('start') !== -1 || temepid.indexOf('from') !== -1 || index === 0) && len === 2) {
                        //绑定开始日期
                        WdatePicker({
                            onpicked: function (dp) {
                                e.target.value = dp.cal.getNewDateStr();
                            },
                            maxDate: '#F{$dp.$D(\'' + selector[1].selector.slice(1) + '\')}',
                            position: {left: 0, top: 2}
                        });
                    } else if ((temepid.indexOf('end') !== -1 || temepid.indexOf('to') !== -1 || index === 1) && len === 2) {
                        //绑定结束日期
                        WdatePicker({
                            onpicked: function (dp) {
                                e.target.value = dp.cal.getNewDateStr();
                            },
                            minDate: '#F{$dp.$D(\'' + selector[0].selector.slice(1) + '\')}',
                            maxDate: '%y-%M-%d',
                            position: {left: 0, top: 2}
                        });
                    } else if (len === 1) {
                        //绑定单个日期
                        WdatePicker({
                            onpicked: function (dp) {
                                e.target.value = dp.cal.getNewDateStr();
                            },
                            maxDate: '%y-%M-%d',
                            position: {left: 0, top: 2}
                        });
                    }
                });
            });
        }
    };


    /*设置继承*/
    nofn.prototype = BaseDatePick.prototype;
    SubDatePick.prototype = new nofn();

    /*设置地址对外接口*/
    if (window['datePickWidget']) {
        window['datePickWidget'] = window['datePickWidget'];
    } else {
        window['datePickWidget'] = new SubDatePick();
    }
})(jQuery);