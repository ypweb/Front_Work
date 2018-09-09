/*!--
作者:易品
名称:标签切换
日期:2018-08-10
描述:标签菜单滑动切换
--*/
define(['jquery'], function ($) {
    "use strict";
    var swiper_instance = null/*实例化swiper对象*/,
        swiper_id = null/*swiper延时定时器*/,
        mask_id = null/*mask延时定时器*/;

    /*配置参数*/
    var tabMap = {
        selector: 'li'/*默认选择器为li*/,
        swiper_selector: '.swiper-container'/*swiper选择器*/,
        $tabswiper_btn: null/*菜单按钮*/,
        $tabswiper_panel: null/*菜单容器*/,
        $tabswiper_slide: null/*滑动容器*/,
        $tabswiper_grid: null/*宫格容器*/,
        $tabswiper_mask: null/*遮罩容器*/,
        $swiper_container: null/*swiper容器*/,
        $swiper_item: null/*swiper项*/,
        $body: null/*body容器*/,
        $tab_wrap: null/*菜单容器*/,
        $tab_item: null/*菜单项*/,
        $grid_item: null/*宫格项*/,
        $tab_title: null/*菜单标题*/,
        istitlehide: false/*是否隐藏标题*/,
        isswiper: true/*是否组合swiper插件*/,
        btn_width: 30/*侧边按钮宽*/,
        view_width: 0/*视口宽度*/,
        win_width: 0/*横排模式视口宽度*/,
        swiperVersion: '2'/*默认swiper版本*/,
        tabType: 'tab'/*切换方式:默认为tab类型，分为tab,swiper*/,
        index: 0/*当前高亮值*/,
        item: 3/*默认展现3个菜单*/,
        effect_time: 500/*动画切换时间*/,
        isbodyhide: true/*默认不开启点击body隐藏*/,
        render: null/*初始化渲染回调*/,
        tabFn: null/*点击渲染回调*/,
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
            '$tabswiper_btn': true,
            '$tabswiper_panel': true,
            '$tabswiper_slide': true,
            '$tabswiper_grid': true,
            '$tabswiper_mask': true
        };
        for (var i in tabMap) {
            if (i.indexOf('$') !== -1 && tabMap.hasOwnProperty(i)) {
                var tempobj = tabMap[i];
                if (tempobj === null) {
                    if (matchMap[i]) {
                        tabMap[i] = $('#' + i.replace(/\$*/g, ''));
                        if (tabMap[i].size() === 0) {
                            /*如果没有找到元素则直接用字符方式*/
                            tabMap[i] = $('#' + tempobj);
                        }
                    }
                }
            }
        }
        tabMap.$body = $('body');
        /*初始化渲染*/
        tabMap.$tab_title = tabMap.$tabswiper_grid.prev();
        if (tabMap.istitlehide) {
            tabMap.$tab_title.addClass('g-d-hidei');
        }
        /*初始化常量*/
        if (tabMap.item <= 0 || tabMap.item === null) {
            tabMap.item = 3;
        }
        tabMap.swiperVersion = tabMap.swiperVersion.toString();
        /*window切换屏大小设置*/
        resize();
        /*dom渲染*/
        render();
        /*list菜单渲染*/
        renderList();
        /*grid菜单渲染*/
        renderGrid();
        /*渲染swiper组件*/
        renderSwiper(swiperconfig);
        /*初始化绑定*/
        bind();
    }

    /*切换屏幕模式计算相关常量*/
    function resize() {
        tabMap.view_width = $(window).width();
        tabMap.win_width = tabMap.view_width - tabMap.btn_width;
        tabMap.item_width = Math.ceil(tabMap.win_width / tabMap.item);
        tabMap.total_width = tabMap.win_width * tabMap.count;
    }

    /*初始化渲染*/
    function render(index) {
        /*根据选择器查找元素*/
        if (tabMap.selector === 'li') {
            tabMap.$tab_wrap = tabMap.$tabswiper_slide.find('>ul');
            tabMap.$tab_item = tabMap.$tab_wrap.find('>li');
        } else if (tabMap.selector === 'a') {
            tabMap.$tab_wrap = tabMap.$tabswiper_slide.find('>div');
            tabMap.$tab_item = tabMap.$tab_wrap.find('>a');
        }
        tabMap.slide_size = tabMap.$tab_item.size();
        /*修正索引*/
        correctIndex();
        tabMap.count = Math.ceil(tabMap.slide_size / tabMap.item);
        if (tabMap.slide_size !== 0) {
            tabMap.$tabswiper_btn.removeClass('g-d-hidei');
        }
        if (tabMap.count <= 0) {
            tabMap.count = 1;
        }
        tabMap.total_width = tabMap.win_width * tabMap.count;
        tabMap.parent_class = (parseFloat(tabMap.slide_size / tabMap.item).toString().slice(0, 10)) * 100 + '%';
        tabMap.item_class = 'wx-tablist-item' + tabMap.slide_size;
        /*渲染回调*/
        if (tabMap.render && typeof tabMap.render === 'function') {
            tabMap.render.call(null, {
                tab_wrap: tabMap.$tab_wrap,
                index: tabMap.index,
                tab_item: tabMap.$tab_item
            });
        }
    }

    /*list菜单渲染*/
    function renderList() {
        tabMap.$tab_wrap.addClass(tabMap.item_class);
        tabMap.$tabswiper_slide.css({
            'width': tabMap.parent_class
        });
    }

    /*grid菜单渲染*/
    function renderGrid() {
        if (tabMap.$tab_item === null) {
            return false;
        }
        tabMap.$tab_item.clone().each(function () {
            $(this).removeAttr('id');
        }).appendTo(tabMap.$tabswiper_grid.html(''));
        tabMap.$grid_item = tabMap.$tabswiper_grid.find('li');
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
                        tabMap.$grid_item.eq(0).addClass('menu-border-br');
                    } else {
                        if ((j + 1) % item !== 0) {
                            tabMap.$grid_item.eq(j).addClass('menu-border-br');
                        } else {
                            tabMap.$grid_item.eq(j).addClass('menu-border-b');
                        }
                    }
                } else {
                    tabMap.$grid_item.eq(j).addClass('menu-border-r');
                }
            }
        } else if (tabMap.count <= 1) {
            tabMap.$grid_item.each(function (index) {
                if ((index + 1) % item !== 0) {
                    $(this).addClass('menu-border-r');
                }
            });
        }
    }

    /*swiper渲染*/
    function renderSwiper(swiperconfig) {
        /*绑定swipe事件*/
        if (swiper_instance === null) {
            /*没有绑定则绑定*/
            var tempconfig = {
                speed: tabMap.effect_time, /*滑块切换速度*/
                onSlideChangeStart: function () {
                    tabMap.tabType = 'swiper';
                    tabSlide(tabMap.tabFn);
                }/*开始切换时执行*/
            };
            /*配置swiper*/
            if (swiperconfig !== null) {
                $.extend(true, tempconfig, swiperconfig);
            }
            /*创建swiper实例*/
            try {
                if (tabMap.isswiper) {
                    if (Swiper && typeof Swiper === 'function') {
                        swiper_instance = new Swiper(tabMap.swiper_selector, tempconfig);
                        tabMap.tabType = 'swiper';
                        swiper_instance.activeIndex=tabMap.index;
                        tabMap.$swiper_container = $(tabMap.swiper_selector).find('>.swiper-wrapper');
                        tabMap.$swiper_item = tabMap.$swiper_container.find('>.swiper-slide');
                    }else{
                        tabMap.tabType='tab';
                    }
                } else {
                    tabMap.swiper_instance = null;
                    tabMap.tabType = 'tab';
                }
            } catch (e) {
                tabMap.swiper_instance = null;
                tabMap.tabType = 'tab';
            }
        }
        tabSlide(tabMap.tabFn);
    }

    /*计算移动值*/
    function position(index) {
        tabMap.index = typeof index === 'undefined' ? tabMap.index : index;
        if (tabMap.count >= 2) {
            if (tabMap.index >= 1) {
                if (tabMap.index <= tabMap.slide_size - 1) {
                    if (tabMap.item === 2) {
                        tabMap.cssleft = -(tabMap.index * tabMap.item_width);
                    } else {
                        tabMap.cssleft = -(tabMap.index - 1) * tabMap.item_width;
                    }
                }
            } else {
                tabMap.cssleft = 0;
            }
        }
        tabMap.$tabswiper_slide.css({
            left: tabMap.cssleft
        });
    }

    /*slide高亮渲染*/
    function tabSlide(fn,index) {
        if (tabMap.tabType === 'swiper') {
            /*swiper滑动模式*/
            tabMap.index = swiper_instance.activeIndex;
        }
        if (swiper_instance) {
            if (swiper_id !== null) {
                clearTimeout(swiper_id);
                swiper_id = null;
            }
            swiper_id = setTimeout(function () {
                /*修正值*/
                correctSwiper();
            }, 100);
        }
        if (typeof index !== 'undefined') {
            tabMap.index = index;
        }
        if (fn && typeof fn === 'function') {
            fn.call(null, {
                tab_wrap: tabMap.$tab_wrap,
                index: tabMap.index,
                tab_item: tabMap.$tab_item
            });
        }
        tabEffect();
    }


    /*tab切换效果*/
    function tabEffect() {
        tabMap.$tab_item.eq(tabMap.index).addClass('tabactive active').siblings().removeClass('tabactive active');
        tabMap.$grid_item.eq(tabMap.index).addClass('tabactive active').siblings().removeClass('tabactive active');
        position(tabMap.index);
        if (isColumn()) {
            toggle();
        }
    }


    /*是否是竖排模式*/
    function isColumn() {
        return tabMap.$tabswiper_panel.hasClass('wx-tabpanel-column');
    }

    /*切换显示模式*/
    function toggle() {
        /*切换至下一个状态*/
        tabMap.$tabswiper_panel.toggleClass('wx-tabpanel-column');
    }

    /*初始化绑定*/
    function bind() {
        /*绑定点击切换事件*/
        var event_adapt = (function () {
            /*适配点击事件*/
            var eobj = {};
            if (swiper_instance && swiper_instance.support.touch) {
                eobj['click'] = 'touchstart';
            } else {
                eobj['click'] = 'click';
            }
            return eobj;
        })();

        /*绑定点击切换事件*/
        $.each([tabMap.$tab_wrap, tabMap.$tabswiper_grid], function () {
            var own = this;
            this.on(event_adapt.click, function (e) {
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
                    tabMap.tabType = 'tab';
                    tabMap.index = tempindex;
                } else {
                    return false;
                }
                tabSlide(tabMap.tabFn);
            });
        });
        /*绑定显示隐藏菜单模式*/
        tabMap.$tabswiper_btn.on('click', function (e) {
            e.stopPropagation();
            /*切换菜单模式*/
            toggle();
        });

        /*绑定body事件隐藏菜单*/
        if (tabMap.isbodyhide) {
            tabMap.$body.on('click', function (e) {
                var target = e.target,
                    nodename = target.nodeName.toLowerCase(),
                    isdelay = false/*是否延迟*/;
                if (nodename === 'li' || nodename === 'a') {
                    if (target.parentNode.className.indexOf('wx-tablist-wrap') !== -1 || target.parentNode.className.indexOf('wx-tabcolumn-wrap') !== -1) {
                        return false;
                    }
                } else if (nodename === 'ul') {
                    if (target.className.indexOf('wx-tablist-wrap') !== -1 || target.className.indexOf('wx-tabcolumn-wrap') !== -1) {
                        return false;
                    }
                } else if (nodename === 'div') {
                    if (target.className.indexOf('wx-tablist-wrap') !== -1 || target.className.indexOf('wx-tabpanel-slide') !== -1 || target.className.indexOf('wx-tabpanel-list') !== -1 || target.className.indexOf('wx-tabpanel-grid') !== -1 || target.className.indexOf('wx-tabcolumn-wrap') !== -1 || target.className.indexOf('wx-tabpanel-wrap') !== -1 || target.className.indexOf('wx-tabpanel-toggle') !== -1) {
                        return false;
                    } else if (target.className.indexOf('wx-tabpanel-mask') !== -1) {
                        /*点击mask蒙版*/
                        isdelay = true;
                    }
                } else if (nodename === 'h1') {
                    if (target.parentNode.className.indexOf('wx-tabpanel-grid') !== -1) {
                        return false;
                    }
                }
                if (isColumn()) {
                    if (isdelay) {
                        if (mask_id !== null) {
                            clearTimeout(mask_id);
                            mask_id = null;
                        }
                        mask_id = setTimeout(function () {
                            toggle();
                        }, 250);
                    } else {
                        toggle();
                    }
                }
            });
        }

        /*绑定切换屏重现渲染*/
        $(window).on('resize', debouce(function () {
            resize();
            position();
            if (tabMap.swiper_instance) {
                swiper_instance.reInit();
                correctSwiper();
            }
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

    /*修正swiper位置*/
    function correctSwiper() {
        var index = tabMap.index;
        /*如果swiper版本是2*/
        if (getSwiperVersion() === 2) {
            tabMap.$swiper_item.eq(index).addClass('swiper-slide-visible swiper-slide-active').siblings().removeClass('swiper-slide-visible swiper-slide-active');
            var sleft = index === 0 ? 0 : -(index * tabMap.view_width);
            tabMap.$swiper_container.css({
                'transition-duration': tabMap.effect_time / 1000 + 's',
                'transform': 'translate3d(' + sleft + 'px, 0px, 0px)'
            });
        } else if (getSwiperVersion() === 3) {
            /*to do 3*/
        } else if (getSwiperVersion() === 4) {
            /*to do 4*/
        }
    }

    /*判断是否为当前swiper*/
    function isCurrentSwiper(index) {
        return tabMap.$swiper_item.eq(index).hasClass('swiper-slide-active');
    }


    /*获取swiper版本*/
    function getSwiperVersion() {
        if (tabMap.swiperVersion.indexOf('2') !== -1) {
            return 2;
        } else if (tabMap.swiperVersion.indexOf('3') !== -1) {
            return 3;
        } else if (tabMap.swiperVersion.indexOf('4') !== -1) {
            return 4;
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


    /*修正索引*/
    function correctIndex() {
        if (typeof tabMap.index === 'undefined' || tabMap.index === null) {
            tabMap.index = 0;
        } else {
            if (isNaN(tabMap.index)) {
                var findflag = false;
                tabMap.$tab_item.each(function (index) {
                    var $li = $(this),
                        id = $li.attr('id'),
                        cls = $li.attr('class');
                    if (id.indexOf(tabMap.index) !== -1 || cls.indexOf(tabMap.index) !== -1) {
                        findflag = true;
                        tabMap.index = index;
                        return false;
                    }
                });
                /*没有匹配则默认为0*/
                if (!findflag) {
                    tabMap.index = 0;
                }
            } else if (tabMap.index >= tabMap.slide_size) {
                if (tabMap.index >= 1000) {
                    tabMap.index = tabMap.slide_size - 1;
                } else {
                    tabMap.index = tabMap.index % tabMap.slide_size;
                }
            }
        }
    }


    /*对外接口*/
    return {
        init: init/*初始化接口*/,
        render: render/*重新计算渲染*/,
        toggle: toggle/*切换菜单模式*/,
        correctSwiper: correctSwiper/*修正切换组件问题*/,
        tabSlide: tabSlide/*切换动画接口*/,
        setTitle: setTitle/*设置标题*/,
        isColumn: isColumn/*是否是竖排模式*/,
        position: position/*计算内部位置*/,
        swiper_instance: swiper_instance/*swiper实例对象*/
    };
});