/*程序入口*/
(function ($) {
    $(function () {
        //dom对象引用及相关变量
        var debug = true/*请求模式,默认为true,即测试模式，正式环境需将debug设置为false*/,
            base_domain = /*'http://10.0.5.218:8001/'*/'http://120.76.237.100:28000/',
            $header_menu = $('#header_menu'),
            $header_item = $header_menu.children(),
            $header_btn = $('#header_btn'),
            $screen_index = $('#screen_index'),
            $screen_indexcontent = $screen_index.find('>div.index-content'),
            $screen_product = $('#screen_product'),
            $screen_productcontent = $screen_product.find('ul'),
            $screen_scene = $('#screen_scene'),
            $screen_news = $('#screen_news'),
            $screen_3d = $('#screen_3d'),
            $screen_contact = $('#screen_contact'),
            $tab_btn = $('#tab_btn'),
            $tab_btn_left = $('#tab_btn_left'),
            $tab_btn_right = $('#tab_btn_right'),
            $newstab_show = $('#newstab_show'),
            $newstab_more = $('#newstab_more'),
            $win = $(window),
            screen_pos = [{
                node: $screen_index,
                pos: 0
            }, {
                node: $screen_product,
                pos: 0
            }, {
                node: $screen_news,
                pos: 0
            }, {
                node: $screen_scene,
                pos: 0
            }, {
                node: $screen_contact,
                pos: 0
            }],
            isMobile = false,
            count = 0;


        //初始化
        (function () {
            //初始化菜单
            var i = 0,
                len = screen_pos.length,
                j = 0,
                pos = $(window).scrollTop();
            for (i; i < len; i++) {
                var temptop = screen_pos[i]["node"].offset().top;
                screen_pos[i]["pos"] = temptop;

                var minpos = parseInt(pos - 350, 0),
                    maxpos = parseInt(pos + 350, 0);
                if (temptop >= minpos && temptop <= maxpos) {
                    $header_item.eq(i).addClass('menu-active').siblings().removeClass('menu-active');
                    /*一屏动画*/
                    if (i === 0) {
                        $screen_indexcontent.addClass('index-contentactive');
                    } else {
                        $screen_indexcontent.removeClass('index-contentactive');
                    }
                    /*二屏动画*/
                    if (i === 1) {
                        $screen_productcontent.addClass('product-listactive');
                    } else {
                        $screen_productcontent.removeClass('product-listactive');
                    }
                }
            }


            /*
             * 初始化pc或移动视口标识
             *
             * */
            var winwidth = $win.width();
            if (winwidth >= 1200) {
                isMobile = false;
                $screen_3d.addClass('scene-itempc');
            } else {
                isMobile = true;
                $screen_3d.removeClass('scene-itempc');
            }


        }());


        //监听菜单导航
        $header_menu.on($.EventName.click, 'li', function (e) {
            e.preventDefault();
            var $this = $(this),
                index = $this.index();
            if (isMobile) {
                $('html,body').animate({'scrollTop': screen_pos[index]['pos'] - 50 + 'px'}, 500);
            } else {
                $('html,body').animate({'scrollTop': screen_pos[index]['pos'] - 120 + 'px'}, 500);
            }
            /*一屏动画*/
            if (index === 0) {
                $screen_indexcontent.addClass('index-contentactive');
            } else {
                $screen_indexcontent.removeClass('index-contentactive');
            }
            /*二屏动画*/
            if (index === 1) {
                $screen_productcontent.addClass('product-listactive');
            } else {
                $screen_productcontent.removeClass('product-listactive');
            }
            return false;
        });


        //监听导航切换显示隐藏
        $header_btn.on($.EventName.click, function () {
            if ($header_btn.hasClass('header-btnactive')) {
                //隐藏
                $header_btn.removeClass('header-btnactive');
                $header_menu.removeClass('g-d-showi');
            } else {
                //显示
                $header_btn.addClass('header-btnactive');
                $header_menu.addClass('g-d-showi');
            }
        });


        //监听菜单滚动条滚动
        $win.on('scroll resize', function (e) {
            var type = e.type;
            if (type === 'scroll') {
                (function () {
                    count++;
                    if (count % 2 === 0) {
                        var $this = $(this),
                            currenttop = $this.scrollTop(),
                            i = 0,
                            len = screen_pos.length;

                        for (i; i < len; i++) {
                            var pos = screen_pos[i]['pos'],
                                minpos = parseInt(pos - 350, 0),
                                maxpos = parseInt(pos + 350, 0);

                            if (currenttop >= minpos && currenttop <= maxpos) {
                                $header_item.eq(i).addClass('menu-active').siblings().removeClass('menu-active');
                                /*一屏动画*/
                                if (i === 0) {
                                    $screen_indexcontent.addClass('index-contentactive');
                                } else {
                                    $screen_indexcontent.removeClass('index-contentactive');
                                }
                                /*二屏动画*/
                                if (i === 1) {
                                    $screen_productcontent.addClass('product-listactive');
                                } else {
                                    $screen_productcontent.removeClass('product-listactive');
                                }
                            }
                        }

                    }
                }());
            }
            if (type === 'resize') {
                (function () {
                    //隐藏菜单导航
                    var winwidth = $win.width();
                    if (winwidth >= 1200 || (winwidth >= 1200 && e.orientation === 'landscape')) {
                        //隐藏已经存在的class
                        $header_btn.removeClass('header-btnactive');
                        $header_menu.removeClass('g-d-showi');
                        isMobile = false;
                        $screen_3d.addClass('scene-itempc');
                    } else {
                        isMobile = true;
                        $screen_3d.removeClass('scene-itempc');
                    }


                    //重新定位滚动条位置
                    var i = 0,
                        len = screen_pos.length,
                        j = 0,
                        pos = $win.scrollTop();
                    for (i; i < len; i++) {
                        var temptop = screen_pos[i]["node"].offset().top;
                        screen_pos[i]["pos"] = temptop;

                        var minpos = parseInt(pos - 350, 0),
                            maxpos = parseInt(pos + 350, 0);
                        if (temptop >= minpos && temptop <= maxpos) {
                            $header_item.eq(i).addClass('menu-active').siblings().removeClass('menu-active');
                        }
                    }


                }());

            }
        });


        /*初始化新闻资讯
         * todo
         * 注：需补充相关请求地址，正式环境需将debug设置为false
         * */
        getNewsTab({
            debug: debug,
            tab: {
                url: base_domain + 'web/category_index_list'/*todo*/,
                btn_left: $tab_btn_left,
                btn_right: $tab_btn_right,
                wrap: $tab_btn,
                tpl: '<span data-id="_id_" data-type="_type_">_name_</span>'/*tab html 模板*/
            },
            tabshow: {
                id: '',
                type: '',
                url: base_domain + 'web/article_index_list'/*todo*/,
                wrap: $newstab_show,
                more: $newstab_more,
                tpl: '<li>\
                        <div>\
                            <img alt="" src="_src_">\
                        </div>\
                        <h4>_title_</h4>\
                        <p>_content_<a target="_blank" href="_href_">详情</a></p>\
                      </li>'/*新闻资讯列表 html 模板*/
            }
        });
    });

    /*获取新闻资讯tab*/
    function getNewsTab(config) {
        if (!config) {
            return false;
        }
        var debug = config.debug;

        $.ajax({
            url: debug ? 'json/test.json' : config.tab.url,
            type: 'post',
            dataType: "json"
        }).done(function (result) {
            if (debug) {
                /*测试模式*/
                var result = testWidget.test({
                    map: {
                        name: 'value',
                        id: 'guid'
                    },
                    mapmin: 5,
                    mapmax: 10,
                    type: 'list'
                });
                var code = parseInt(result.code, 10);
                if (code !== 0) {
                    /*请求异常*/
                    console.log(result.message);
                    renderNewsTab(config, null);
                } else {
                    /*渲染数据*/
                    renderNewsTab(config, result.result.list);
                }
            } else {
                /*渲染数据*/
                renderNewsTab(config, result);
            }
        })
            .fail(function (result) {
                console.log(result);
                renderNewsTab(config, null);
            });
    }

    /*渲染新闻资讯tab*/
    function renderNewsTab(config, data) {
        if (!config) {
            return false;
        }

        var tab_config = config.tab,
            tabshow = config.tabshow;
        if (data === null) {
            /*没有数据*/
            _resetTab_(tab_config, tabshow);
        } else {
            /*渲染界面*/
            var TABLEN = 5/*tab显示数据项*/,
                debug = config.debug,
                list = data,
                tablen = list.length;

            /*生成dom*/
            (function () {
                var i = 0,
                    res = [],
                    tpl = tab_config.tpl;
                for (i; i < tablen; i++) {
                    var item = list[i];
                    res.push(tpl.replace('_id_', item['id'])
                        .replace('_name_', item['name']));
                    $(res.join('')).appendTo(tab_config.wrap.html(''));
                }
            }());

            /*绑定事件,请求数据*/
            (function () {

                var $tabs_items = tab_config.wrap.children(),
                    tab_index = 0,
                    $tabs = $tabs_items.eq(tab_index);


                if (tablen >= 1) {
                    /*初始化查询第一项数据*/
                    tabshow['id'] = $tabs.attr('data-id');
                    tabshow['type'] = $tabs.html();
                    getNewsData({
                        debug: debug,
                        tabshow: tabshow
                    });
                    $tabs.addClass('tab-active').siblings().removeClass('tab-active');

                    /*初始化其他数据*/
                    if (tablen > TABLEN) {
                        if (tab_index === 0) {
                            tab_config.btn_left.addClass('tab-btn-disabled');
                        } else if (tab_index === tablen - 1) {
                            tab_config.btn_right.addClass('tab-btn-disabled');
                        }

                        /*绑定tab按钮事件*/
                        /*左按钮*/
                        tab_config.btn_left.on('click', function () {
                            var $this = $(this);
                            if ($this.hasClass('tab-btn-disabled')) {
                                return false;
                            }
                            if (tab_index === 0) {
                                return false;
                            } else {
                                tab_index--;
                                var tempitem = $tabs_items.eq(tab_index);

                                if (tab_index === 0) {
                                    tab_config.btn_left.addClass('tab-btn-disabled');
                                }
                                if (tab_index === tablen - 2) {
                                    tab_config.btn_right.removeClass('tab-btn-disabled');
                                }
                                if (tab_index <= TABLEN) {
                                    tempitem.eq(tab_index).removeClass('g-d-hidei');
                                }

                                tabshow['id'] = tempitem.attr('data-id');
                                tabshow['type'] = tempitem.html();
                                tempitem.addClass('tab-active').siblings().removeClass('tab-active');
                                /*查询信息*/
                                getNewsData({
                                    debug: debug,
                                    tabshow: tabshow
                                });
                            }
                        });
                        /*右按钮*/
                        tab_config.btn_right.on('click', function () {
                            var $this = $(this);
                            if ($this.hasClass('tab-btn-disabled')) {
                                return false;
                            }
                            if (tab_index === tablen - 1) {
                                return false;
                            } else {
                                tab_index++;
                                var tempitem = $tabs_items.eq(tab_index);
                                if (tab_index === tablen - 1) {
                                    tab_config.btn_right.addClass('tab-btn-disabled');
                                }
                                if (tab_index === 1) {
                                    tab_config.btn_left.removeClass('tab-btn-disabled');
                                }
                                if (tab_index >= TABLEN) {
                                    $tabs_items.eq(tab_index - TABLEN).addClass('g-d-hidei');
                                }
                                tabshow['id'] = tempitem.attr('data-id');
                                tabshow['type'] = tempitem.html();
                                tempitem.addClass('tab-active').siblings().removeClass('tab-active');
                                /*查询信息*/
                                getNewsData({
                                    debug: debug,
                                    tabshow: tabshow
                                });
                            }

                        });
                    } else {
                        tab_config.btn_left.addClass('tab-btn-disabled');
                        tab_config.btn_right.addClass('tab-btn-disabled');
                    }

                    /*绑定行业tab选项*/
                    tab_config.wrap.on('click', 'span', function () {
                        var $this = $(this);

                        tabshow['id'] = $this.attr('data-id');
                        tabshow['type'] = $this.html();
                        /*同步索引*/
                        tab_index = $this.index();

                        /*索引极限*/
                        if (tablen > TABLEN) {
                            if (tab_index === 0) {
                                /*第一个的情况*/
                                tab_config.btn_left.addClass('tab-btn-disabled');
                                tab_config.btn_right.removeClass('tab-btn-disabled');
                            } else if (tab_index === tablen - 1) {
                                /*最后一个的情况*/
                                tab_config.btn_left.removeClass('tab-btn-disabled');
                                tab_config.btn_right.addClass('tab-btn-disabled');
                            } else {
                                tab_config.btn_left.removeClass('tab-btn-disabled');
                                tab_config.btn_right.removeClass('tab-btn-disabled');
                            }
                        }

                        /*状态切换*/
                        $this.addClass('tab-active').siblings().removeClass('tab-active');

                        /*数据请求*/
                        getNewsData({
                            debug: debug,
                            tabshow: tabshow
                        });
                    });

                } else {
                    /*异常项*/
                    _resetTab_(tab_config, tabshow);
                }
            }());
        }
    }

    /*获取新闻列表信息*/
    function getNewsData(config) {
        if (!config) {
            return false;
        }
        var debug = config.debug,
            tabshow = config.tabshow;

        if (!tabshow) {
            return false;
        } else {
            var id = tabshow.id,
                type = tabshow.type;
            if (id === '' || typeof id === 'undefined') {
                return false;
            }
        }

        $.ajax({
            url: debug ? 'json/test.json' : tabshow.url,
            type: 'post',
            dataType: "json",
            data: {
                "category_id": id
            }
        }).done(function (data) {
            /*渲染数据*/
            var list,
                len,
                i = 0,
                res = [],
                tpl = tabshow.tpl;

            if (debug) {
                /*测试模式*/
                var data = testWidget.test({
                    map: {
                        icon: 'rule,1,2,3',
                        title: 'goodstype',
                        content: 'text',
                        linkurl: 'value',
                        id: 'guid'
                    },
                    mapmin: 1,
                    mapmax: 6,
                    type: 'list'
                });
                var code = parseInt(data.code, 10);
                if (code !== 0) {
                    /*请求异常*/
                    console.log(data.message);
                    tabshow.wrap.html('');
                    tabshow.more.html('');
                    return false;
                } else {
                    list = data.result.list;
                    len = list.length;
                }
            } else {
                list = data;
                len = list.length;
            }
            /*渲染数据*/
            if (len !== 0) {
                if (debug) {
                    if (len >= 6) {
                        /*测试模式:控制最多显示六个*/
                        list.length = 6;
                        len = 6;
                    }
                    for (i; i < len; i++) {
                        var item = list[i];
                        res.push(tpl.replace('_src_', 'images/' + item['icon'] + '.jpg')
                            .replace('_title_', item['title'])
                            .replace('_content_', item['content'])
                            .replace('_href_', 'tpl/article.html?id=' + encodeURIComponent(item['id']) + '&type=' + encodeURIComponent(type)));
                    }
                } else {
                    for (i; i < len; i++) {
                        var item = list[i];
                        res.push(tpl.replace('_src_', (function () {
                            var imgurl = item['icon'];
                            if (imgurl === '' || (imgurl !== '' && imgurl.indexOf(/(.)(png|jpeg|gif|jpg)/) !== -1)) {
                                return 'images/1.jpg';
                            }
                            return imgurl;
                        }()))
                            .replace('_title_', item['title'])
                            .replace('_content_', item['content'])
                            .replace('_href_', 'tpl/article.html?id=' + encodeURIComponent(item['id'])));
                    }
                }

                $(res.join('')).appendTo(tabshow.wrap.html(''));
                $('<a target="_blank" href="tpl/article_list.html?id=' + encodeURIComponent(tabshow.id) + '&type=' + encodeURIComponent(type) + '">阅读更多&gt;&gt;</a>').appendTo(tabshow.more.html(''));
            } else {
                tabshow.wrap.html('');
                tabshow.more.html('');
            }
        })
            .fail(function () {
                tabshow.wrap.html('');
                tabshow.more.html('');
            });
    }


    /*私有服务--数据为空或数据异常时*/
    function _resetTab_(tab_config, tabshow) {
        /*解绑事件*/
        tab_config.btn_left.addClass('tab-btn-disabled').off('click')/*注销左按钮事件*/;
        tab_config.btn_right.addClass('tab-btn-disabled').off('click')/*注销右按钮事件*/;
        tab_config.wrap.off('click', 'span')/*注销tab按钮事件*/;
        /*清空数据*/
        tab_config.wrap.html('');
        tabshow.wrap.html('');
    }
})(jQuery);