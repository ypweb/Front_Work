(function ($) {
    "use strict";
    $(function () {
        /*dom引用*/
        var $header_wrap = $('#header_wrap'),
            $screen_btn = $('#screen_btn'),
            $screen_item = $screen_btn.children(),
            $screen1 = $('#screen1'),
            $screen2 = $('#screen2'),
            $screen3 = $('#screen3'),
            $screen4 = $('#screen4'),
            $screen5 = $('#screen5'),
            $win = $(window),
            screen_pos = [{
                node: $screen1,
                pos: 0
            }, {
                node: $screen2,
                pos: 0
            }, {
                node: $screen3,
                pos: 0
            }, {
                node: $screen4,
                pos: 0
            }, {
                node: $screen5,
                pos: 0
            }],
            $list4_wrap = $('#list4_wrap'),
            $tab3_btn = $('#tab3_btn'),
            $tab3_btn_left = $('#tab3_btn_left'),
            $tab3_btn_right = $('#tab3_btn_right'),
            $tab3_show = $('#tab3_show'),
            $list2_wrap = $('#list2_wrap'),
            isMobile = $win.width() >= 1000 ? false : true,
            $slideimg_show = $('#slideimg_show'),
            $slide_img = $('#slide_img'),
            $slideimg_btn = $('#slideimg_btn');

        //dom 表单对象引用
        var $case_form = $('#case_form'),
            $username = $('#username'),
            $phone = $('#phone'),
            $company = $('#company'),
            $province = $('#province'),
            $email = $('#email'),
            $case = $('#case'),
            $remark = $('#remark'),
            validobj = null,
            dia = dialog();


        //校验规则
        var ruleobj = [{
            ele: $username,
            datatype: "*",
            nullmsg: "姓名不能为空",
            errormsg: "",
            sucmsg: ""
        }, {
            ele: $phone,
            datatype: "selfphone",
            nullmsg: "手机不能为空",
            errormsg: "手机格式不规范",
            sucmsg: ""
        }, {
            ele: $company,
            datatype: "*",
            nullmsg: "公司不能为空",
            errormsg: "",
            sucmsg: ""
        }, {
            ele: $email,
            datatype: "selfemail",
            nullmsg: "邮箱不能为空",
            errormsg: "邮箱格式不规范",
            sucmsg: ""
        }, {
            ele: $remark,
            datatype: "*",
            nullmsg: "描述信息不能为空",
            errormsg: "",
            sucmsg: ""
        }];


        //初始化
        (function () {
            //初始化菜单
            var i = 0,
                len = screen_pos.length,
                j = 0,
                pos = $(window).scrollTop(),
                unindex = 0;


            for (i; i < len; i++) {
                if (!screen_pos[i]) {
                    continue;
                }
                var temptop = screen_pos[i]["node"].offset().top;

                screen_pos[i]["pos"] = temptop;

                var minpos = parseInt(pos - 350, 0),
                    maxpos = parseInt(pos + 350, 0);
                if (temptop >= minpos && temptop <= maxpos) {
                    $screen_item.eq(i).addClass('active').siblings().removeClass('active');

                    /*非第一屏则应用简略模式导航*/
                    if (!isMobile) {
                        if (i === 0) {
                            $header_wrap.removeClass('header-scroll');
                        } else {
                            $header_wrap.addClass('header-scroll');
                        }
                    } else {
                        if (i === 0) {
                            $header_wrap.removeClass('header-scroll');
                        } else if ($header_wrap.hasClass('header-scroll')) {
                            $header_wrap.removeClass('header-scroll');
                        }
                    }

                    /*第二屏加载动画*/
                    if (i === 1) {
                        $list2_wrap.addClass('list2-active');
                    } else {
                        $list2_wrap.removeClass('list2-active');
                    }
                } else {
                    unindex++;
                }
            }
            if (len === unindex) {
                i = 0;
                for (i; i < len; i++) {
                    if (!screen_pos[i]) {
                        continue;
                    }
                    minpos = parseInt(pos - 500, 0);
                    maxpos = parseInt(pos + 500, 0);
                    if (screen_pos[i]["pos"] >= minpos && screen_pos[i]["pos"] <= maxpos) {
                        $screen_item.eq(i).addClass('active').siblings().removeClass('active');

                        /*非第一屏则应用简略模式导航*/
                        if (!isMobile) {
                            if (i === 0) {
                                $header_wrap.removeClass('header-scroll');
                            } else {
                                $header_wrap.addClass('header-scroll');
                            }
                        } else {
                            if (i === 0) {
                                $header_wrap.removeClass('header-scroll');
                            } else if ($header_wrap.hasClass('header-scroll')) {
                                $header_wrap.removeClass('header-scroll');
                            }
                        }

                        /*第二屏加载动画*/
                        if (i === 1) {
                            $list2_wrap.addClass('list2-active');
                        } else {
                            $list2_wrap.removeClass('list2-active');
                        }
                    }
                }
                unindex = 0;
            }


            /**
             * 加载新闻数据
             */
            var TABLEN = 5,
                $tabs_items = $tab3_btn.children(),
                tab_index = 0,
                $tabs = $tabs_items.eq(tab_index),
                theme = $tabs.attr('data-theme'),
                tablen = $tabs_items.length;

            /*初始化加载信息*/
            if (tablen >= 1) {
                $tabs.addClass('tab3-active').siblings().removeClass('tab3-active');

                /*查询信息*/
                getNews({
                    url: '../json/test.json',
                    theme: theme,
                    $wrap: $tab3_show
                });

                if (tablen > TABLEN) {

                    if (tab_index === 0) {
                        $tab3_btn_left.addClass('tab3-btn-disabled');
                    } else if (tab_index === tablen - 1) {
                        $tab3_btn_right.addClass('tab3-btn-disabled');
                    }

                    /*绑定tab按钮事件*/
                    /*左按钮*/
                    $tab3_btn_left.on('click', function () {
                        var $this = $(this);
                        if ($this.hasClass('tab3-btn-disabled')) {
                            return false;
                        }
                        if (tab_index === 0) {
                            return false;
                        } else {
                            tab_index--;
                            if (tab_index === 0) {
                                $tab3_btn_left.addClass('tab3-btn-disabled');
                            }
                            if (tab_index === tablen - 2) {
                                $tab3_btn_right.removeClass('tab3-btn-disabled');
                            }
                            if (tab_index <= TABLEN) {
                                $tabs_items.eq(tab_index).removeClass('g-d-hidei');
                            }
                            theme = $tabs_items.eq(tab_index).attr('data-theme');
                            $tabs_items.eq(tab_index).addClass('tab3-active').siblings().removeClass('tab3-active');
                            /*查询信息*/
                            getNews({
                                url: '../json/test.json',
                                theme: theme,
                                $wrap: $tab3_show
                            });

                        }
                    });
                    /*右按钮*/
                    $tab3_btn_right.on('click', function () {
                        var $this = $(this);
                        if ($this.hasClass('tab3-btn-disabled')) {
                            return false;
                        }
                        if (tab_index === tablen - 1) {
                            return false;
                        } else {
                            tab_index++;
                            if (tab_index === tablen - 1) {
                                $tab3_btn_right.addClass('tab3-btn-disabled');
                            }
                            if (tab_index === 1) {
                                $tab3_btn_left.removeClass('tab3-btn-disabled');
                            }
                            if (tab_index >= TABLEN) {
                                $tabs_items.eq(tab_index - TABLEN).addClass('g-d-hidei');
                            }
                            theme = $tabs_items.eq(tab_index).attr('data-theme');
                            $tabs_items.eq(tab_index).addClass('tab3-active').siblings().removeClass('tab3-active');
                            /*查询信息*/
                            getNews({
                                url: '../json/test.json',
                                theme: theme,
                                $wrap: $tab3_show
                            });

                        }

                    });
                } else {
                    $tab3_btn_left.addClass('tab3-btn-disabled');
                    $tab3_btn_right.addClass('tab3-btn-disabled');
                }

                /*绑定行业tab选项*/
                $tab3_btn.on('click', 'span', function () {
                    var $this = $(this),
                        theme = $this.attr('data-theme');

                    /*同步索引*/
                    tab_index = $this.index();

                    /*索引极限*/
                    if (tablen > TABLEN) {
                        if (tab_index === 0) {
                            /*第一个的情况*/
                            $tab3_btn_left.addClass('tab3-btn-disabled');
                            $tab3_btn_right.removeClass('tab3-btn-disabled');
                        } else if (tab_index === tablen - 1) {
                            /*最后一个的情况*/
                            $tab3_btn_left.removeClass('tab3-btn-disabled');
                            $tab3_btn_right.addClass('tab3-btn-disabled');
                        } else {
                            $tab3_btn_left.removeClass('tab3-btn-disabled');
                            $tab3_btn_right.removeClass('tab3-btn-disabled');
                        }
                    }


                    /*状态切换*/
                    $this.addClass('tab3-active').siblings().removeClass('tab3-active');

                    /*数据请求*/
                    getNews({
                        url: '../json/test.json',
                        theme: theme,
                        $wrap: $tab3_show
                    });


                });

            } else {
                $tab3_btn_left.addClass('tab3-btn-disabled');
                $tab3_btn_right.addClass('tab3-btn-disabled');
                $tab3_btn.html('');
            }


            /*获取信息ajax*/
            function getNews(obj) {
                $.ajax({
                    url: obj.url,
                    type: 'post',
                    dataType: "json",
                    data: {
                        "Theme": obj.theme
                    }
                }).done(function (data) {
                        if (data.flag) {
                            //加载操作
                        } else {
                            obj.$wrap.html('');
                        }
                    })
                    .fail(function () {
                        obj.$wrap.html('');
                    });
            }

        }());


        /*轮播调用*/
        Slide.slideToggle({
            $wrap: $slideimg_show,
            $slide_img: $slide_img,
            $btnwrap: $slideimg_btn,
            isBackground: true,
            minwidth: 640,
            isresize: true,
            size: 3,
            times: 5000,
            eff_time: 500,
            btn_active: 'slidebtn-active'
        });

        //监听菜单导航
        $screen_btn.on($.EventName.click, 'a', function (e) {
            e.preventDefault();
            var $this = $(this),
                index = $this.index();

            if (!screen_pos[index]) {
                var href = $this.attr('href');
                if (href !== '') {
                    location.href = href;
                }
                return false;
            }

            /*滚动动画*/
            if (index === 0) {
                $('html,body').animate({'scrollTop': screen_pos[index]['pos'] + 'px'}, 500);
            } else {
                $('html,body').animate({'scrollTop': screen_pos[index]['pos'] - 30 + 'px'}, 500);
            }


            /*第二屏加载动画*/
            if (index === 1) {
                $list2_wrap.addClass('list2-active');
            } else {
                $list2_wrap.removeClass('list2-active');
            }

            return false;
        });


        //监听菜单滚动条滚动
        var count = 0;
        $win.on('scroll resize', function (e) {
            var type = e.type;
            if (type == 'scroll') {
                (function () {
                    count++;
                    if (count % 2 == 0) {
                        var currenttop = $win.scrollTop(),
                            i = 0,
                            len = screen_pos.length;

                        for (i; i < len; i++) {
                            if (!screen_pos[i]) {
                                continue;
                            }
                            var pos = screen_pos[i]['pos'],
                                minpos = parseInt(pos - 350, 0),
                                maxpos = parseInt(pos + 350, 0);

                            if (currenttop >= minpos && currenttop <= maxpos) {
                                $screen_item.eq(i).addClass('active').siblings().removeClass('active');
                                /*非第一屏则应用简略模式导航*/
                                if (!isMobile) {
                                    if (i === 0) {
                                        $header_wrap.removeClass('header-scroll');
                                    } else {
                                        $header_wrap.addClass('header-scroll');
                                    }
                                } else {
                                    if (i === 0) {
                                        $header_wrap.removeClass('header-scroll');
                                    } else if ($header_wrap.hasClass('header-scroll')) {
                                        $header_wrap.removeClass('header-scroll');
                                    }
                                }

                                /*第二屏加载动画*/
                                if (i === 1) {
                                    $list2_wrap.addClass('list2-active');
                                } else {
                                    $list2_wrap.removeClass('list2-active');
                                }
                            }
                        }

                    }
                }());
            }
            if (type == 'resize') {
                (function () {
                    isMobile = $win.width() >= 1000 ? false : true;
                    //重新定位滚动条位置
                    var i = 0,
                        len = screen_pos.length,
                        j = 0,
                        pos = $win.scrollTop();
                    for (i; i < len; i++) {
                        if (!screen_pos[i]) {
                            continue;
                        }
                        var temptop = screen_pos[i]["node"].offset().top;
                        screen_pos[i]["pos"] = temptop;

                        var minpos = parseInt(pos - 350, 0),
                            maxpos = parseInt(pos + 350, 0);
                        if (temptop >= minpos && temptop <= maxpos) {
                            $screen_item.eq(i).addClass('active').siblings().removeClass('active');

                            /*非第一屏则应用简略模式导航*/
                            if (!isMobile) {
                                if (i === 0) {
                                    $header_wrap.removeClass('header-scroll');
                                } else {
                                    $header_wrap.addClass('header-scroll');
                                }
                            } else {
                                if (i === 0) {
                                    $header_wrap.removeClass('header-scroll');
                                } else if ($header_wrap.hasClass('header-scroll')) {
                                    $header_wrap.removeClass('header-scroll');
                                }
                            }


                            /*第二屏加载动画*/
                            if (i === 1) {
                                $list2_wrap.addClass('list2-active');
                            } else {
                                $list2_wrap.removeClass('list2-active');
                            }
                        }
                    }

                    //设置不支持vh单位设备


                }());

            }
        });


        /*绑定最新问答*/
        $list4_wrap.on('click', 'dt', function (e) {
            var $this = $(this),
                $dd = $this.next('dd');
            if ($dd.is(':hidden')) {
                $dd.slideDown().siblings('dd:not(:hidden)').slideUp();
            } else {
                $dd.slideUp().siblings('dd:not(:hidden)').slideUp();
            }

        });


        /*select2 城市调用*/
        $province.select2();
        /*select2 案件类型调用*/
        $case.select2();


        /*绑定手机格式化*/
        $phone.on('keyup', function () {
            var phoneno = this.value.toString().replace(/\s*/g, '');
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
            this.value = phoneno.join('');
        });

        //表单校验
        validobj = $case_form.Validform({
            ajaxPost: true,
            datatype: {
                'selfemail': function (gets, obj, curform, regxp) {
                    var email = /^([0-9A-Za-z\-_\.]+)@([0-9a-z]+\.[a-z0-9]{2,7}((\.[a-z]{2})|(\.(com|net)))?)$/;
                    return email.test(gets.replace(/\s*/g, '')) ? true : false;
                },
                'selfphone': function (gets, obj, curform, regxp) {
                    var phone = /^(13[0-9]|14[579]|15[012356789]|16[6]|17[01235678]|18[0-9]|19[89])[0-9]{8}$/;
                    return phone.test(gets.replace(/\s*/g, '')) ? true : false;
                }
            },
            beforeSubmit: function (curform) {
                //拼合参数
                var params = {}, rules = /\s*/g;
                params['UserName'] = $username.val();
                params['Phone'] = (function () {
                    var val = $phone.val();
                    return val.replace(rules, '');
                }());
                params['Company'] = $company.val();
                params['Province'] = $province.val();
                params['Email'] = $email.val();
                params['Case'] = $case.val();
                params['Remark'] = $remark.val();
                /*to do*/
                //send ajax 填充具体业务逻辑
                //开发时开启下部代码
                $.ajax({
                    url: '../json/test.json',
                    type: 'post',
                    dataType: "json",
                    data: params
                }).done(function (data) {
                        if (data.flag) {
                            dia.content('<span class="g-c-succ">保存成功</span>').show();
                            setTimeout(function () {
                                dia.close();
                            }, 3000);
                        } else {
                            dia.content('<span class="g-c-warn">保存失败</span>').show();
                            setTimeout(function () {
                                dia.close();
                            }, 3000);
                        }
                    })
                    .fail(function () {
                        dia.content('<span class="g-c-err">保存失败</span>').show();
                        setTimeout(function () {
                            dia.close();
                        }, 3000);
                    });
                return false;
            },
            tiptype: function (msg, o) {
                var curtype = o.type,
                    curitem = o.obj,
                    id = curitem[0].id;

                if (id === 'phone' || id === 'username') {
                    if (curtype === 1 || curtype === 3) {
                        curitem.parent().next().next().text(msg);
                    } else if (curtype === 2) {
                        curitem.parent().next().next().text('');
                    }
                } else {
                    if (curtype === 1 || curtype === 3) {
                        curitem.parent().next().text(msg);
                    } else if (curtype === 2) {
                        curitem.parent().next().text('');
                    }
                }

            }
        });
        validobj.addRule(ruleobj);


    });

})(jQuery);