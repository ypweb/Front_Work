+function ($) {
    "use strict";

    /*处理icon渲染--私有方法*/
    function _iconRender(arr, type, dialog) {
        var len = arr.length,
            i = 0,
            iconstr = '',
            iconitem;

        if (type === 'icon') {
            for (i; i < len; i++) {
                iconitem = arr[i];
                iconstr += '<li class="weui-dialog-icon' + iconitem['class'] + '"></li>';
            }
            return '<div class="weui-dialog__iconwrap "><ul class="weui-dialog-iconitem">' + iconstr + '</ul></div>';
        } else if (type === 'contenticon') {
            dialog.find('.weui-dialog__bd .wx-alert-icon').each(function (i, ele) {
                iconitem = arr[i];
                $(ele).addClass('wx-alert-icon' + iconitem['class']);
            });
        }
    }

    /*处理icon事件--私有方法*/
    function _iconBind(config, arr, type) {
        var selector = '';
        if (type === 'icon') {
            selector = ".weui-dialog__iconwrap li";
        } else if (type === 'contenticon') {
            selector = ".weui-dialog__bd .wx-alert-icon";
        }
        config.dialog.find(selector).each(function (i, ele) {
            var el = $(ele);
            el.click(function () {
                //先关闭对话框，再调用回调函数
                if (config.params.autoClose) {
                    if (arr[i] !== null) {
                        clearTimeout(arr[i]);
                        arr[i] = null;
                    }
                    arr[i] = setTimeout(function () {
                        $.closeModal();
                    }, 500);
                    $.closeModal();
                }
                if (config.btns[i].onClick) {
                    if (type === 'icon') {
                        config.btns[i].onClick.call(config.dialog);
                    } else if (type === 'contenticon') {
                        config.btns[i].onClick.call(config.dialog,el);
                    }
                }
            });
        });
    }


    var defaults;

    $.modal = function (params, onOpen) {
        params = $.extend({}, defaults, params);


        var buttons = params.buttons,
            isicon = params.isicon ? params.isicon : false,
            icons = isicon ? params.icons : null,
            iscontenticon = params.iscontenticon ? params.iscontenticon : false,
            contenticons = iscontenticon ? params.contenticons : null;


        var buttonsHtml = buttons.map(function (d, i) {
            return '<a href="javascript:;" class="weui-dialog__btn ' + (d.className || "") + '">' + d.text + '</a>';
        }).join("");

        var tpl = null,
            dialog = null,
            iconid = [],
            contenticonid = [];


        tpl = '<div class="weui-dialog">' + (isicon ? _iconRender(icons, 'icon') : '') +
            '<div class="weui-dialog__hd"><strong class="weui-dialog__title">' + params.title + '</strong></div>' +
            (params.text ? '<div class="weui-dialog__bd">' + params.text + '</div>' : '') +
            '<div class="weui-dialog__ft">' + buttonsHtml + '</div>' +
            '</div>';

        dialog = $.openModal(tpl, onOpen);

        if (isicon) {
            _iconBind({
                dialog: dialog,
                params: params,
                btns: icons
            }, iconid, 'icon');
        }

        if (iscontenticon) {
            /*如果存在contenticon*/
            _iconRender(contenticons, 'contenticon', dialog);
            _iconBind({
                dialog: dialog,
                params: params,
                btns: contenticons
            }, contenticonid, 'contenticon');
        }

        dialog.find(".weui-dialog__btn").each(function (i, e) {
            var el = $(e);
            el.click(function () {
                //先关闭对话框，再调用回调函数
                if (params.autoClose) $.closeModal();

                if (buttons[i].onClick) {
                    buttons[i].onClick.call(dialog);
                }
            });
        });

        return dialog;
    };

    $.openModal = function (tpl, onOpen) {
        var mask = $("<div class='weui-mask'></div>").appendTo(document.body);
        mask.show();

        var dialog = $(tpl).appendTo(document.body);

        if (onOpen) {
            dialog.transitionEnd(function () {
                onOpen.call(dialog);
            });
        }

        dialog.show();
        mask.addClass("weui-mask--visible");
        dialog.addClass("weui-dialog--visible");


        return dialog;
    };

    $.closeModal = function () {
        $(".weui-mask--visible").removeClass("weui-mask--visible").transitionEnd(function () {
            $(this).remove();
        });
        $(".weui-dialog--visible").removeClass("weui-dialog--visible").transitionEnd(function () {
            $(this).remove();
        });
    };

    $.alert = function (text, title, onOK) {
        var config;
        if (typeof text === 'object') {
            config = text;
        } else {
            if (typeof title === 'function') {
                onOK = arguments[1];
                title = undefined;
            }

            config = {
                text: text,
                title: title,
                onOK: onOK
            }
        }
        /*modal通用配置*/
        var modal_config = {
            text: config.text,
            title: config.title,
            buttons: [{
                text: defaults.buttonOK,
                className: "primary",
                onClick: config.onOK
            }]
        };
        if (typeof config['icons'] !== 'undefined' && config['icons'].length !== 0) {
            $.extend(true, modal_config, {
                icons: config.icons,
                isicon: true,
            });
        }
        if (typeof config['contenticons'] !== 'undefined' && config['contenticons'].length !== 0) {
            $.extend(true, modal_config, {
                contenticons: config.contenticons,
                iscontenticon: true,
            });
        }
        return $.modal(modal_config);
    };

    $.confirm = function (text, title, onOK, onCancel) {
        var config;
        if (typeof text === 'object') {
            config = text
        } else {
            if (typeof title === 'function') {
                onCancel = arguments[2];
                onOK = arguments[1];
                title = undefined;
            }

            config = {
                text: text,
                title: title,
                onOK: onOK,
                onCancel: onCancel
            }
        }
        return $.modal({
            text: config.text,
            title: config.title,
            buttons: [
                {
                    text: defaults.buttonCancel,
                    className: "default",
                    onClick: config.onCancel
                },
                {
                    text: defaults.buttonOK,
                    className: "primary",
                    onClick: config.onOK
                }]
        });
    };

    //如果参数过多，建议通过 config 对象进行配置，而不是传入多个参数。
    $.prompt = function (text, title, onOK, onCancel, input) {
        var config;
        if (typeof text === 'object') {
            config = text;
        } else {
            if (typeof title === 'function') {
                input = arguments[3];
                onCancel = arguments[2];
                onOK = arguments[1];
                title = undefined;
            }
            config = {
                text: text,
                title: title,
                input: input,
                onOK: onOK,
                onCancel: onCancel,
                empty: false  //allow empty
            }
        }

        var modal = $.modal({
            text: '<p class="weui-prompt-text">' + (config.text || '') + '</p><input type="text" class="weui-input weui-prompt-input" id="weui-prompt-input" value="' + (config.input || '') + '" />',
            title: config.title,
            autoClose: false,
            buttons: [
                {
                    text: defaults.buttonCancel,
                    className: "default",
                    onClick: function () {
                        $.closeModal();
                        config.onCancel && config.onCancel.call(modal);
                    }
                },
                {
                    text: defaults.buttonOK,
                    className: "primary",
                    onClick: function () {
                        var input = $("#weui-prompt-input").val();
                        if (!config.empty && (input === "" || input === null)) {
                            modal.find('.weui-prompt-input').focus()[0].select();
                            return false;
                        }
                        $.closeModal();
                        config.onOK && config.onOK.call(modal, input);
                    }
                }]
        }, function () {
            this.find('.weui-prompt-input').focus()[0].select();
        });

        return modal;
    };

    //如果参数过多，建议通过 config 对象进行配置，而不是传入多个参数。
    $.login = function (text, title, onOK, onCancel, username, password) {
        var config;
        if (typeof text === 'object') {
            config = text;
        } else {
            if (typeof title === 'function') {
                password = arguments[4];
                username = arguments[3];
                onCancel = arguments[2];
                onOK = arguments[1];
                title = undefined;
            }
            config = {
                text: text,
                title: title,
                username: username,
                password: password,
                onOK: onOK,
                onCancel: onCancel
            }
        }

        var modal = $.modal({
            text: '<p class="weui-prompt-text">' + (config.text || '') + '</p>' +
            '<input type="text" class="weui-input weui-prompt-input" id="weui-prompt-username" value="' + (config.username || '') + '" placeholder="输入用户名" />' +
            '<input type="password" class="weui-input weui-prompt-input" id="weui-prompt-password" value="' + (config.password || '') + '" placeholder="输入密码" />',
            title: config.title,
            autoClose: false,
            buttons: [
                {
                    text: defaults.buttonCancel,
                    className: "default",
                    onClick: function () {
                        $.closeModal();
                        config.onCancel && config.onCancel.call(modal);
                    }
                }, {
                    text: defaults.buttonOK,
                    className: "primary",
                    onClick: function () {
                        var username = $("#weui-prompt-username").val();
                        var password = $("#weui-prompt-password").val();
                        if (!config.empty && (username === "" || username === null)) {
                            modal.find('#weui-prompt-username').focus()[0].select();
                            return false;
                        }
                        if (!config.empty && (password === "" || password === null)) {
                            modal.find('#weui-prompt-password').focus()[0].select();
                            return false;
                        }
                        $.closeModal();
                        config.onOK && config.onOK.call(modal, username, password);
                    }
                }]
        }, function () {
            this.find('#weui-prompt-username').focus()[0].select();
        });

        return modal;
    };

    defaults = $.modal.prototype.defaults = {
        title: "提示",
        text: undefined,
        buttonOK: "确定",
        buttonCancel: "取消",
        buttons: [{
            text: "确定",
            className: "primary"
        }],
        autoClose: true //点击按钮自动关闭对话框，如果你不希望点击按钮就关闭对话框，可以把这个设置为false
    };

}($);
