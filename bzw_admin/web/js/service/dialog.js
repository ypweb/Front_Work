/*弹窗服务*/
(function () {
    'use strict';
    /*定义或扩展模块*/
    angular
        .module('tool')
        .service('toolDialog', toolDialog);

    /*服务依赖注入*/


    /*服务实现*/
    function toolDialog() {
        var flag = typeof (dialog === 'function' && dialog) ? true : false,
        /*关键匹配*/
            actionmap = {
                'delete': '删除',
                'cancel': '取消',
                'change': '改变',
                'add': '添加',
                'update': '更新'
            },
            _single_dia_ = dia()/*内部私有对象*/;


        /*服务对外接口*/
        this.dia = dia;
        this.show = show;
        this.showModal=showModal;
        this.hide = hide;
        this.sureDialog = sureDialog;

        /*实现或接口--提示框*/
        function dia(config) {
            if (flag) {
                if (config) {
                    return typeof _single_dia_ === 'function' ? _single_dia_(config) : dialog(config);
                } else {
                    return typeof _single_dia_ === 'function' ? _single_dia_ : dialog({
                        zIndex: 2000,
                        title: '温馨提示',
                        okValue: '确定',
                        width: 300,
                        ok: function () {
                            this.close();
                            return false;
                        },
                        cancel: false
                    });
                }
            }
            return null;
        }

        /*实现或接口--提示类型*/
        function show(config) {
            var type = config.type,
                value = config.value;

            if (_single_dia_) {
                if (type === 'succ') {
                    _single_dia_.content('<span class="g-c-succ g-btips-succ">' + value + '</span>').show();
                } else if (type === 'warn') {
                    _single_dia_.content('<span class="g-c-warn g-btips-warn">' + value + '</span>').show();
                } else if (type === 'error') {
                    _single_dia_.content('<span class="g-c-err g-btips-error">' + value + '</span>').show();
                } else {
                    _single_dia_.content('<span class="g-c-succ g-btips-succ">' + value + '</span>').show();
                }
            }
        }

        /*实现或接口--提示类型*/
        function showModal(config) {
            var type = config.type,
                value = config.value;

            if (_single_dia_) {
                if (type === 'succ') {
                    _single_dia_.content('<span class="g-c-succ g-btips-succ">' + value + '</span>').showModal();
                } else if (type === 'warn') {
                    _single_dia_.content('<span class="g-c-warn g-btips-warn">' + value + '</span>').showModal();
                } else if (type === 'error') {
                    _single_dia_.content('<span class="g-c-err g-btips-error">' + value + '</span>').showModal();
                } else {
                    _single_dia_.content('<span class="g-c-succ g-btips-succ">' + value + '</span>').showModal();
                }
            }
        }

        /*实现或接口--关闭提示*/
        function hide() {
            if (_single_dia_) {
                _single_dia_.close();
            }
        }

        /*实现或接口--确认函数*/
        function sureDialog(str, fn, tips, repalceflag) {
            //是否支持弹窗
            if (!flag) {
                return null;
            }
            var tipstr = '',
                iskey = typeof actionmap[str] === 'string',
                key = iskey ? actionmap[str] : str;

            if (!tips) {
                tips = '';
            }

            if (typeof actionmap[str] === 'string') {
                if (repalceflag) {
                    tipstr = '<span class="g-c-warn g-btips-warn">' + tips + '</span>';
                } else {
                    tipstr = '<span class="g-c-warn g-btips-warn">' + tips + '是否真需要 "' + actionmap[str] + '" 此项数据</span>';
                }
            } else {
                if (repalceflag) {
                    tipstr = '<span class="g-c-warn g-btips-warn">' + tips + '</span>';
                } else {
                    tipstr = '<span class="g-c-warn g-btips-warn">' + tips + '是否真需要 "' + str + '" 此项数据</span>';
                }
            }

            dialog({
                title: '温馨提示',
                content: tipstr,
                width: 300,
                okValue: '确定',
                ok: function () {
                    if (fn && typeof fn === 'function') {
                        //执行回调
                        fn.call(null, {
                            action: key,
                            dia: _single_dia_
                        });
                        this.close().remove();
                    }
                    return false;
                },
                cancelValue: '取消',
                cancel: function () {
                    this.close().remove();
                }
            }).showModal();
        }


    }

}());
