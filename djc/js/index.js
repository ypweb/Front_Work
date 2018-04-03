/**
 * Created by yipin on 2017/5/31 0031.
 */
(function ($) {
    'use strict';
    $(function () {
        /*dom节点缓存*/
        var mini_screen_height = 900/*一般视口高界限*/,
            mini_screen_width = 479/*隐藏菜单视口界限*/,
            mini_header_height = 50/*小屏头部高度*/,
            max_header_height = 100/*一般头部高度*/,
            $menu_toggle = $('#menu_toggle'),
            $menu_wrap = $('#menu_wrap'),
            $menu_item = $menu_wrap.children(),
            $index_view = $('#index_view'),
            $about_view = $('#about_view'),
            $introduction_view = $('#introduction_view'),
            $description_view = $('#description_view'),
            $contact_view = $('#contact_view'),
            $win = $(window),
            screen_pos = [
                {
                    node: $index_view,
                    pos: 0
                },
                {
                    node: $about_view,
                    pos: 0
                },
                {
                    node: $introduction_view,
                    pos: 0
                },
                {
                    node: $description_view,
                    pos: 0
                },
                {
                    node: $contact_view,
                    pos: 0
                }
            ],
            isMini = false;


        /*初始化*/
        (function () {
            var i = 0,
                len = screen_pos.length,
                j = 0,
                pos = $(window).scrollTop();

            /*初始化屏幕*/
            for (i; i < len; i++) {
                var temptop = screen_pos[i]["node"].offset().top + 2;
                screen_pos[i]["pos"] = temptop;

                var minpos = parseInt(pos - 150, 0),
                    maxpos = parseInt(pos + 150, 0);
                if (temptop >= minpos && temptop <= maxpos) {
                    $menu_item.eq(i).addClass('menu-active').siblings().removeClass('menu-active');
                }
            }

            /*初始化视口判断*/
            var winwidth = $win.width();
            if (winwidth <= mini_screen_width) {
                isMini = true;
            } else {
                isMini = false;
            }
            $menu_toggle.removeClass('header-btn-active');
            $menu_wrap.removeClass('g-d-showi');
        }());


        //监听菜单导航
        $menu_wrap.on('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            var target = e.target,
                node = target.nodeName.toLowerCase(),
                $li;
            if (node === 'a' || node === 'span') {
                $li = $(target).closest('li');
            } else if (node === 'li') {
                $li = $(target);
            } else {
                return false;
            }


            var index = $li.index();
            if (isMini) {
                $('html,body').animate({'scrollTop': screen_pos[index]['pos'] - mini_header_height + 'px'}, 500);
            } else {
                $('html,body').animate({'scrollTop': screen_pos[index]['pos'] - max_header_height + 'px'}, 500);
            }
            return false;
        });


        //监听移动模式下的菜单显示隐藏
        $menu_toggle.on('click', function () {
            var active = $menu_toggle.hasClass('header-btn-active');

            if (active) {
                /*非激活*/
                $menu_toggle.removeClass('header-btn-active');
                $menu_wrap.removeClass('g-d-showi');
            } else if (!active) {
                /*激活*/
                $menu_toggle.addClass('header-btn-active');
                $menu_wrap.addClass('g-d-showi');
            }

        });


        //监听菜单滚动条滚动
        (function () {
            var count = 0;
            $win.on('scroll resize', function (e) {
                var type = e.type;
                if (type === 'scroll') {
                    (function () {
                        count++;
                        if (count % 2 == 0) {
                            var $this = $(window),
                                currenttop = $this.scrollTop(),
                                i = 0,
                                len = screen_pos.length;

                            for (i; i < len; i++) {
                                var pos = screen_pos[i]['pos'],
                                    minpos = parseInt(pos - 150, 0),
                                    maxpos = parseInt(pos + 150, 0);

                                if (currenttop >= minpos && currenttop <= maxpos) {
                                    $menu_item.eq(i).addClass('menu-active').siblings().removeClass('menu-active');
                                }
                            }

                        }
                    }());
                } else if (type === 'resize') {
                    (function () {
                        //隐藏菜单导航
                        var winwidth = $win.width();
                        if (winwidth > mini_screen_width) {
                            //隐藏已经存在的class
                            isMini = false;
                            $menu_wrap.removeClass('g-d-showi');
                            $menu_toggle.removeClass('header-btn-active');
                        } else {
                            isMini = true;
                        }


                        //重新定位滚动条位置
                        var i = 0,
                            len = screen_pos.length,
                            j = 0,
                            pos = $win.scrollTop();
                        for (i; i < len; i++) {
                            var temptop = screen_pos[i]["node"].offset().top;
                            screen_pos[i]["pos"] = temptop;

                            var minpos = parseInt(pos - 150, 0),
                                maxpos = parseInt(pos + 150, 0);
                            if (temptop >= minpos && temptop <= maxpos) {
                                $menu_item.eq(i).addClass('menu-active').siblings().removeClass('menu-active');
                            }
                        }


                    }());

                }
            });
        }());


        /*百度地图调用*/
        getBaiDuMap();

    });

    /*百度地图调用*/
    function getBaiDuMap() {
        /*地图调用*/
        var map = new BMap.Map("address_wrap"),
            point = new BMap.Point(113.9533, 22.5368);

        /*初始化地图*/
        map.centerAndZoom(point, 16);

        /*设置相关开启项*/
        map.enableScrollWheelZoom();

        /*设置地图控件*/
        map.addControl(new BMap.ScaleControl({anchor: BMAP_ANCHOR_BOTTOM_LEFT}));
        map.addControl(new BMap.NavigationControl());

        /*设置定点覆盖物*/
        var marker = new BMap.Marker(point);
        map.addOverlay(marker);


        /*设置文字覆盖物*/
        var label = new BMap.Label("大决策信息技术有限公司",{
            position: point,
            offset: new BMap.Size(-70,30)
        });

        label.setStyle({
            color: "#336fd0",
            fontSize: "12px",
            height: "26px",
            maxWidth: "none",
            border:"1px solid #336fd0",
            lineHeight: "20px",
            borderRadius:"3px",
            padding:"3px 10px",
            boxShadow:"1px 1px 3px 0 #888",
            fontFamily: "微软雅黑"
        });
        marker.setLabel(label);
    }
})(jQuery);
