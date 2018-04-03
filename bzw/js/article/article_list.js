(function ($) {
    $(function () {

        //dom对象引用
        var $header_menu = $('#header_menu'),
            $header_btn = $('#header_btn'),
            $content_type = $('#content_type'),
            $content_list = $('#content_list'),
            $content_page = $('#content_page'),
            $win = $(window),
            debug = false/*请求模式,默认为true,即测试模式，正式环境需将debug设置为false*/,
            base_domain = /*'http://10.0.5.218:8001/'*/'http://120.76.237.100:28000/',
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

        /*请求列表数据
         * todo
         * 注：需补充相关请求地址，正式环境需将debug设置为false
         * */
        getArticleList({
            list: {
                url: base_domain + 'web/article'/*todo*/,
                type: $content_type/*列表类型*/,
                wrap: $content_list/*数据容器*/,
                tpl: '<li>\
                        <a target="_blank" href="_href_">\
                            <div>\
                                <img alt="" src="_src_">\
                            </div>\
                            <h4>_title_</h4>\
                            <p>_content_</p>\
                        </a>\
                      </li>'/*数据模板*/
            },
            debug: debug/*数据请求模式：测试模式和正式模式*/,
            page: {
                wrap: $content_page/*分页容器*/,
                number: 1/*分页--默认显示第几页*/,
                total: 0/*分页--默认多少条记录*/,
                size: 6/*分页--每页显示记录数*/
            }
        });

    });


    /*请求列表数据*/
    function getArticleList(config) {
        if (!config) {
            return false;
        }
        var debug = config.debug,
            page = config.page,
            list = config.list,
            search = location.search.slice(1),
            param = {};

        /*组合参数*/
        search = search.split('&');
        var plen = search.length,
            pi = 0;
        for (pi; pi < plen; pi++) {
            var item = search[pi].split('=');
            param[item[0]] = decodeURIComponent(item[1]);
        }


        /*请求数据*/
        $.ajax({
                url: debug ? '../json/test.json' : list.url,
                dataType: 'json',
                data: debug ? {
                    'pageNumber': page.number/*第几页*/,
                    'pageSize': page.size/*每页数据量*/,
                    'category_id': param['id']
                } : {
                    'page': page.number/*第几页*/,
                    'pageSize': page.size/*每页数据量*/,
                    'category_id': param['id']
                },
                type: 'post'
            })
            .done(function (data) {
                var count,
                    listdata,
                    res = [],
                    len,
                    i = 0,
                    tpl = list.tpl;
                if (debug) {
                    /*测试模式*/
                    var data = testWidget.test({
                        map: {
                            id: 'guid',
                            icon: 'rule,1,2,3',
                            title: 'remark',
                            content: 'goods'
                        },
                        mapmin: 1,
                        mapmax: 6,
                        type: 'list'
                    });
                    var code = parseInt(data.code, 10);
                    if (code !== 0) {
                        console.log(data.message);
                        _resetList_(list, page, debug);
                        return false;
                    }
                    count = data.result.count;
                    listdata = data.result.list;
                } else {
                    if (!data) {
                        _resetList_(list, page, debug);
                        return false;
                    }
                    listdata = data.data;
                    count = data.total_count;
                }
                /*解析数据*/
                len = listdata.length;
                if (len !== 0) {
                    var item;
                    if (debug) {
                        if (len >= 6) {
                            /*测试模式:控制分页列表最多显示6个*/
                            listdata.length = 6;
                            len = 6;
                        }
                        for (i; i < len; i++) {
                            item = listdata[i];
                            res.push(tpl.replace('_href_', 'article.html?id=' + encodeURIComponent(item['id']) + '&type=' + param['type'])
                                .replace('_title_', item['title'])
                                .replace('_content_', item['content'])
                                .replace('_src_', '../images/' + item['icon'] + '.jpg'));
                        }
                    } else {
                        for (i; i < len; i++) {
                            item = listdata[i];
                            res.push(tpl.replace('_href_', 'article.html?id=' + encodeURIComponent(item['id']))
                                .replace('_title_', item['title'])
                                .replace('_content_', item['content'])
                                .replace('_src_', (function () {
                                    var imgurl = item['icon'];
                                    if (imgurl === '' || (imgurl !== '' && imgurl.indexOf(/(.)(png|jpeg|gif|jpg)/) !== -1)) {
                                        return '../images/1.jpg';
                                    }
                                    return imgurl;
                                }())));
                        }
                    }
                    $(res.join('')).appendTo(list.wrap.html(''));
                    list.type.html(param['type']);

                    /*分页调用*/
                    page.total = count;
                    if (debug) {
                        page.wrap.pagination({
                            pageSize: page.size,
                            total: page.total,
                            pageNumber: page.number,
                            onSelectPage: function (pageNumber, pageSize) {
                                page.size = pageSize;
                                page.number = pageNumber;
                                config.page = page;
                                getArticleList(config);
                            }
                        });
                    } else {
                        page.wrap.pagination({
                            total: page.total,
                            pageNumber: page.number,
                            onSelectPage: function (pageNumber) {
                                page.number = pageNumber;
                                config.page = page;
                                getArticleList(config);
                            }
                        });
                    }
                } else {
                    _resetList_(list, page, debug);
                }
            })
            .fail(function () {
                _resetList_(list, page, debug);
            });
    }


    /*私有服务--重置相关数据*/
    function _resetList_(list, page, debug) {
        /*清空数据列*/
        list.wrap.html('');
        list.type.html('');
        /*重置分页*/
        page.number = 1;
        page.total = 0;
        if (debug) {
            page.size = 6;
            page.wrap.pagination({
                pageSize: page.size,
                total: page.total,
                pageNumber: page.number
            });
        } else {
            page.wrap.pagination({
                total: page.total,
                pageNumber: page.number
            });
        }
    }

})(jQuery);