(function ($) {
    $(function () {

        //dom对象引用
        var debug = false/*请求模式,默认为true,即测试模式，正式环境需将debug设置为false*/,
            base_domain = /*'http://10.0.5.218:8001/'*/'http://120.76.237.100:28000/',
            $header_menu = $('#header_menu'),
            $header_btn = $('#header_btn'),
            $content_type = $('#content_type'),
            $content_title = $('#content_title'),
            $content_show = $('#content_show'),
            $win = $(window),
            isMobile = false;


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
        $win.on('resize', function (e) {
            //隐藏菜单导航
            var winwidth = $win.width();
            if (winwidth >= 1200 || (winwidth >= 1200 && e.orientation == 'landscape')) {
                //隐藏已经存在的class
                $header_btn.removeClass('header-btnactive');
                $header_menu.removeClass('g-d-showi');
                isMobile = false;
            } else {
                isMobile = true;
            }
        });

        /*请求数据
         * todo
         * 注：补充相关请求地址，正式环境需将debug设置为false
         * */
        getArticle({
            type: $content_type,
            wrap: $content_show/*数据容器*/,
            title: $content_title,
            debug: debug/*数据请求模式：测试模式和正式模式*/,
            url: base_domain + 'web/article_detail'/*todo*/
        });


    });

    /*获取文章数据*/
    function getArticle(config) {
        if (!config) {
            return false;
        }
        var debug = config.debug,
            search = location.search.slice(1),
            param = {},
            i = 0,
            len;


        search = search.split('&');
        len = search.length;
        for (i; i < len; i++) {
            var item = search[i].split('=');
            param[item[0]] = decodeURIComponent(item[1]);
        }
        $.ajax({
            url: debug ? '../json/test.json' : config.url,
            type: 'post',
            dataType: "json",
            data: {
                id: param['id']
            }
        }).done(function (data) {
                if (debug) {
                    /*测试模式*/
                    var data = testWidget.test({
                        map: {
                            title: 'text',
                            content: 'content',
                            type: 'rule,1'
                        },
                        mapmin: 1,
                        mapmax: 1,
                        type: 'list'
                    });
                    var code = parseInt(data.code, 10),
                        c_type;
                    if (code !== 0) {
                        /*请求异常*/
                        console.log(data.message);
                        config.title.html('');
                        config.type.html('');
                        config.wrap.html('');
                    } else {
                        /*渲染数据*/
                        var list = data.result.list[0];
                        config.title.html(list.title);
                        config.type.html(param['type']);
                        c_type = parseInt(list.type, 10);
                        if (c_type === 1) {
                            /*富文本*/
                            config.wrap.html(list.content);
                        } else if (c_type === 2) {
                            /*外部链接*/
                            $('<iframe href="' + list.content + '"></iframe>').appendTo(config.wrap.html(''));
                        }else{
                            config.wrap.html(list.content);
                        }
                    }
                } else {
                    if (data) {
                        config.title.html(data.title);
                        config.type.html(data.category_name);
                        c_type = parseInt(data.type, 10);
                        if (c_type === 1) {
                            /*富文本*/
                            config.wrap.html(data.content);
                        } else if (c_type === 2) {
                            /*外部链接*/
                            $('<div class="content-article-iframe-outer"><div class="content-article-iframe-inner"><iframe src="' + data.content + '"></iframe></div></div>').appendTo(config.wrap.html(''));

                        }else{
                            config.wrap.html(data.content);
                        }
                    } else {
                        config.title.html('');
                        config.type.html('');
                        config.wrap.html('');
                    }
                }

            })
            .fail(function () {
                config.title.html('');
                config.type.html('');
                config.wrap.html('');
            });
    }

})(jQuery);



