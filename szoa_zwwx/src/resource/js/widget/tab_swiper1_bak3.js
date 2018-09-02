/*
author:yipin,
date:2018-08-10
name:tab标签菜单切换
*/
define(['jquery'], function ($) {
    "use strict";
    var swiper_instance = null/*实例化swiper对象*/;
    /*配置参数*/
    var tabMap = {
        selector: 'li'/*默认选择器为li*/,
        $tab_btn: null/*菜单按钮*/,
        $tab_panel: null/*菜单容器*/,
        $tab_slide: null/*滑动容器*/,
        $body: null/*body容器*/,
        $tab_wrap: null/*菜单容器*/,
        $tab_item: null/*菜单项*/,
        $tab_title: null/*菜单标题*/,
        btn_width: 30/*侧边按钮宽*/,
        win_width: 0/*视口宽度*/,
        index: 0/*当前高亮值*/,
        item: 3/*默认展现3个菜单*/,
        effect_time: 500/*动画切换时间*/,
        isbodyhide: false/*默认不开启点击body隐藏*/,
        render: null/*初始化渲染:一般为回调函数*/,
        item_width: 0/*每个菜单的宽度*/,
        total_width: 0/*默认总宽度*/,
        parent_class: ''/*父级样式*/,
        item_class: ''/*平均分配样式，支持的菜单个数*/,
        slide_size: 0/*slide数量*/,
        count: 1/*菜单多少页*/,
        cssleft: 0/*当前菜单位置*/
    };


    /*初始化接口*/
    function init(config, swiperconfig) {
        if (config !== null) {
            /*初始化扩展*/
            $.extend(true, tabMap, config);
        }
        /*初始化jquery对象*/
        var matchMap = {
            '$tab_btn': true,
            '$tab_panel': true,
            '$tab_slide': true
        };
        for (var i in tabMap) {
            if (i.indexOf('$') !== -1 && tabMap.hasOwnProperty(i)) {
                var tempobj = tabMap[i];
                if (tempobj === null) {
                    if (matchMap[i]) {
                        tabMap[i] = $('#' + i.replace(/\$*/g, ''));
                    }
                }
            }
        }
        tabMap.$body = $('body');
        /*初始化渲染*/
        if (tabMap.render !== null && typeof tabMap.render === 'function') {
            tabMap.render.call(tabMap);
        }
        /*初始化渲染*/
        tabMap.$tab_title = tabMap.$tab_slide.prev();
        /*初始化常量*/
        if (tabMap.item <= 0 || tabMap.item === null) {
            tabMap.item = 3;
        }
        /*window切换屏大小设置*/
        resize();
        /*dom变换渲染*/
        render();
        /*初始化切换*/
        toggle('hor');
        /*初始化菜单项边框样式*/
        borderClass('hor');
        /*初始化绑定*/
        bind(swiperconfig);
    }

    /*切换屏幕模式计算相关常量*/
    function resize() {
        tabMap.win_width = $(window).width() - tabMap.btn_width;
        tabMap.item_width = Math.ceil(tabMap.win_width / tabMap.item);
        tabMap.total_width = tabMap.win_width * tabMap.count;
    }

    /*初始化渲染*/
    function render(index) {
        /*根据选择器查找元素*/
        if (tabMap.selector === 'li') {
            tabMap.$tab_wrap = tabMap.$tab_slide.find('>ul');
            tabMap.$tab_item = tabMap.$tab_wrap.find('>li');
        } else if (tabMap.selector === 'a') {
            tabMap.$tab_wrap = tabMap.$tab_slide.find('>div');
            tabMap.$tab_item = tabMap.$tab_wrap.find('>a');
        }
        if (typeof index === 'undefined' || index === null) {
            tabMap.$tab_item.eq(tabMap.index).addClass('tabactive active');
        } else {
            if (index >= tabMap.slide_size) {
                tabMap.$tab_item.eq(tabMap.slide_size - 1).addClass('tabactive active');
                tabMap.index = tabMap.slide_size - 1;
            } else {
                tabMap.$tab_item.eq(index).addClass('tabactive active');
                tabMap.index = index;
            }
        }

        tabMap.slide_size = tabMap.$tab_item.size();
        tabMap.count = Math.ceil(tabMap.slide_size / tabMap.item);
        if (tabMap.count <= 0) {
            tabMap.count = 1;
        }
        tabMap.total_width = tabMap.win_width * tabMap.count;
        tabMap.parent_class = (parseFloat(tabMap.slide_size / tabMap.item).toString().slice(0, 10)) * 100 + '%';
        tabMap.item_class = 'wx-tablist-item' + tabMap.slide_size;

    }

    /*切换模式*/
    function toggle(type) {
        if (type === 'hor') {
            /*横排模式*/
            tabMap.$tab_panel.removeClass('wx-tabpanel-column');
            tabMap.$tab_slide.css({
                'width': tabMap.parent_class,
                'left': tabMap.cssleft
            });
            tabMap.$tab_wrap.addClass(tabMap.item_class);
        } else if (type === 'ver') {
            /*竖排模式*/
            tabMap.$tab_panel.addClass('wx-tabpanel-column');
            tabMap.$tab_slide.css({
                'left': 0,
                'width': '100%'
            });
            tabMap.$tab_wrap.removeClass(tabMap.item_class);
        }
    }

    /*计算移动值*/
    function position(index) {
        tabMap.index = typeof index === 'undefined' ? tabMap.index : index;
        if (tabMap.count >= 2) {
            if (tabMap.index > 1) {
                if (tabMap.index <= tabMap.slide_size - 1) {
                    tabMap.cssleft = -(tabMap.index - 1) * tabMap.item_width;
                }
            } else {
                tabMap.cssleft = 0;
            }
        }
        if (!isColumn()) {
            tabMap.$tab_slide.css({
                left: tabMap.cssleft
            });
        } else {
            tabMap.$tab_slide.css({
                left: 0
            });
        }
    }

    /*生成竖排模式边框信息*/
    function borderClass(type) {
        if (type === 'hor') {
            /*横排模式*/
            tabMap.$tab_item.each(function () {
                $(this).removeClass('menu-border-br menu-border-b menu-border-r');
            });
        } else if (type === 'ver') {
            /*竖排模式*/
            var len = tabMap.slide_size,
                item = tabMap.item,
                last = len % item,
                j = 0,
                lastlen = (last === 0 ? item : last),
                jlen = len - lastlen;

            if (tabMap.count > 1) {
                /*普通循环*/
                for (j; j < len; j++) {
                    if (j < jlen) {
                        if (j === 0) {
                            tabMap.$tab_item.eq(0).addClass('menu-border-br');
                        } else {
                            if ((j + 1) % item !== 0) {
                                tabMap.$tab_item.eq(j).addClass('menu-border-br');
                            } else {
                                tabMap.$tab_item.eq(j).addClass('menu-border-b');
                            }
                        }
                    } else {
                        tabMap.$tab_item.eq(j).addClass('menu-border-r');
                    }
                }
            } else if (tabMap.count <= 1) {
                tabMap.$tab_item.each(function (index) {
                    if ((index + 1) % item !== 0) {
                        $(this).addClass('menu-border-r');
                    }
                });
            }
        }
    }

    /*是否是竖排模式*/
    function isColumn() {
        return tabMap.$tab_panel.hasClass('wx-tabpanel-column');
    }

    /*tab执行动画*/
    function tabSlide(index) {
        var tempindex = null,
            swipeid = null,
            istab = false;
        if (typeof index !== 'undefined') {
            /*为tab点击模式*/
            istab = true;
            tempindex = index;
            console.log(tempindex);
            swiper_instance.swipeTo(tempindex, tabMap.effect_time, false);
        } else {
            /*为tab滑动模式*/
            istab = false;
            tempindex = swiper_instance.activeIndex;
        }
        if (isColumn()) {
            /*如果是纵排模式则切换至横排模式*/
            if (istab) {
                setTimeout(function () {
                    borderClass('hor');
                    toggle('hor');
                    position(tempindex);
                }, 50);
            } else {
                borderClass('hor');
                toggle('hor');
                position(tempindex);
            }
        } else {
            position(tempindex);
        }
        tabMap.index = tempindex;
        tabMap.$tab_item.eq(tempindex).addClass('tabactive active').siblings().removeClass('tabactive active');

    }

    /*初始化绑定*/
    function bind(swiperconfig) {
        /*绑定swipe事件*/
        if (swiper_instance === null) {
            /*没有绑定则绑定*/
            var tempconfig = {
                speed: tabMap.effect_time, /*滑块切换速度*/
                /*queueStartCallbacks: true,*/ /*快速滑动中只执行一次*/
                onSlideChangeStart: function () {
                    tabSlide();
                }
            };
            /*配置swiper*/
            if (swiperconfig !== null) {
                $.extend(true, tempconfig, swiperconfig);
            }
            /*创建swiper实例*/
            swiper_instance = new Swiper('.swiper-container', tempconfig);
            swiper_instance.activeIndex = tabMap.index;
        }

        /*绑定点击切换事件*/
        var event_adapt = (function () {
            /*适配点击事件*/
            var eobj = {};
            if (swiper_instance.support.touch) {
                eobj['click'] = 'touchstart';
            } else {
                eobj['click'] = 'mousedown';
            }
            return eobj;
        })();
        tabMap.$tab_wrap.on(event_adapt.click, function (e) {
            e.stopPropagation();
            if (tabMap.selector === 'a') {
                e.preventDefault();
            }
            var target = e.target,
                nodename = target.nodeName.toLowerCase(),
                $this = null,
                tempindex = 0;

            if (nodename === 'a' || nodename === 'li') {
                $this = $(target);
                tempindex = $this.index();
            } else {
                return false;
            }
            tabSlide(tempindex);
        });

        /*绑定显示隐藏菜单模式*/
        tabMap.$tab_btn.on('click', function (e) {
            e.stopPropagation();
            /*切换菜单模式*/
            if (isColumn()) {
                /*横排模式*/
                toggle('hor');
                borderClass('hor');
            } else {
                /*竖排模式*/
                toggle('ver');
                borderClass('ver');
            }
        });

        /*绑定body事件隐藏菜单*/
        if (tabMap.isbodyhide) {
            tabMap.$body.on('click', function (e) {
                var target = e.target,
                    nodename = target.nodeName.toLowerCase();
                if (nodename === 'li' || nodename === 'a') {
                    if (target.parentNode.className.indexOf('wx-tablist-wrap') !== -1) {
                        return false;

                    }
                } else if (nodename === 'ul') {
                    if (target.className.indexOf('wx-tablist-wrap') !== -1) {
                        return false;
                    }
                } else if (nodename === 'div') {
                    if (target.className.indexOf('wx-tablist-wrap') !== -1 || target.className.indexOf('wx-tabpanel-slide') !== -1 || target.className.indexOf('wx-tabpanel-show') !== -1 || target.className.indexOf('wx-tabpanel-wrap') !== -1 || target.className.indexOf('wx-tabpanel-toggle') !== -1) {
                        return false;
                    }
                } else if (nodename === 'h1') {
                    if (target.parentNode.className.indexOf('wx-tabpanel-show') !== -1) {
                        return false;
                    }
                }
                if (isColumn()) {
                    /*如果是纵排模式则切换至横排模式*/
                    toggle('hor');
                    borderClass('hor');
                }
            });
        }


        /*绑定切换屏重现渲染*/
        $(window).on('resize', debouce(function () {
            resize();
            position();
            reInit();
        }, 200));

    }

    /*设置名称*/
    function setTitle(title) {
        if (title === null || typeof title === 'undefined') {
            tabMap.$tab_title.html('');
        } else {
            tabMap.$tab_title.html(title);
        }
    }

    /*
    * 内部防抖模块
    * func:需要执行的操作函数
    * delay:在多少时间内执行
    * immediate:否要立即执行
    * */
    function debouce(func, delay, immediate) {
        var timer = null;
        return function () {
            var own = this,
                args = arguments;
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            if (immediate) {
                var nowtimer = !timer;
                timer = setTimeout(function () {
                    timer = null;
                }, delay);
                if (nowtimer) {
                    func.apply(own, args);
                }
            } else {
                timer = setTimeout(function () {
                    func.apply(own, args);
                }, delay);
            }
        }
    }


    /*重新初始化*/
    function reInit() {
        if (swiper_instance !== null) {
            swiper_instance.reInit();
        }
    }

    /*对外接口*/
    return {
        init: init/*初始化接口*/,
        render: render/*重新计算渲染*/,
        toggle: toggle/*切换接口*/,
        setTitle: setTitle/*设置标题*/,
        isColumn: isColumn/*是否是竖排模式*/,
        position: position/*计算内部位置*/,
        swiper_instance: swiper_instance/*swiper实例对象*/
    };
});