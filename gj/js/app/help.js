/**
 * Created by Administrator on 2017/5/31 0031.
 */
(function ($) {
    'use strict';

    $(function () {
        /*获取dom节点缓存*/
        var $search_wrap = $('#search_wrap'),
            $search_input = $('#search_input'),
            $search_clear = $('#search_clear'),
            $deposit_wrap = $('#deposit_wrap'),
            $trade_wrap = $('#trade_wrap'),
            $account_wrap = $('#account_wrap'),
            $capital_wrap = $('#capital_wrap'),
            $center_wrap = $('#center_wrap'),
            $client_wrap = $('#client_wrap'),
            $show_detail_wrap = $('#show_detail_wrap'),
            $show_detail_title = $('#show_detail_title'),
            $show_detail_content = $('#show_detail_content');


        /*绑定输入域初始化和值输入*/
        $search_input.val('').on('keyup', function (e) {
            var text = this.value;
            if (text === '') {
                $search_wrap.removeClass('search-active');
            } else {
                $search_wrap.addClass('search-active');
                var code = e.keyCode;
                if (code === 13) {
                    /*搜索
                     * to do
                     * * */
                    helpSearch({
                        $deposit_wrap: $deposit_wrap,
                        $trade_wrap: $trade_wrap,
                        $account_wrap: $account_wrap,
                        $capital_wrap: $capital_wrap,
                        $center_wrap: $center_wrap,
                        $client_wrap: $client_wrap
                    });
                }
            }
        });


        /*绑定清除内容*/
        $search_clear.on('click', function () {
            $search_input.val('');
            $search_wrap.removeClass('search-active');
        });


        /*绑定查看详情*/
        $.each([$deposit_wrap, $trade_wrap, $account_wrap, $capital_wrap, $center_wrap, $client_wrap], function () {
            this.on('click', function (e) {
                var target = e.target,
                    node = target.nodeName.toLowerCase();

                if (node !== 'p') {
                    return false;
                } else {
                    helpDetail({
                        $show_detail_wrap: $show_detail_wrap,
                        $show_detail_title: $show_detail_title,
                        $show_detail_content: $show_detail_content,
                        id: $(target).attr('data-id')
                    })
                }
            });
        });
    });




    /*搜索*/
    function helpSearch(config) {
        $.ajax({
            url: '../json/test.json',
            method: 'post',
            data: {},
            dataType: 'JSON'
        }).done(function (resp) {
            /*测试代码*/
            var resp = testSearch();
            if (resp.code === 0) {
                var result = resp.result;
                if (result) {
                    var list = result.list;
                    if (list) {
                        var len = list.length,
                            i = 0;
                        for (i; i < len; i++) {
                            var theme = list[i]['theme'],
                                searchlist = list[i]['list'],
                                $wrap = config['$' + theme + '_wrap'],
                                j = 0,
                                sublen = searchlist.length;

                            if (sublen === 0) {
                                $wrap.html('');
                            } else {
                                var str = '';
                                for (j; j < sublen; j++) {
                                    var item = searchlist[j];
                                    str += '<p data-id="' + item["id"] + '">' + item["title"] + '</p>';
                                }
                                if (str !== '') {
                                    $(str).appendTo($wrap.html(''));
                                } else {
                                    $wrap.html('');
                                }
                            }
                        }
                    }
                } else {
                    console.log('没有搜索结果');
                }
            } else {
                console.log('搜索失败');
            }
        }).fail(function (resp) {
            console.log('搜索错误');
        });
    }

    /*查看详情*/
    function helpDetail(config) {
        $.ajax({
            url: '../json/test.json',
            method: 'post',
            data: {
                id:config.id
            },
            dataType: 'JSON'
        }).done(function (resp) {
            /*测试代码*/
            var resp = testDetail();
            if (resp.code === 0) {
                var result = resp.result;
                console.log(result);
                if (result) {
                    config.$show_detail_title.html(result.title);
                    config.$show_detail_content.html(result.content);
                    config.$show_detail_wrap.modal('show', {backdrop: 'static'});
                } else {
                    console.log('没有搜索结果');
                }
            } else {
                console.log('搜索失败');
            }
        }).fail(function (resp) {
            console.log('搜索错误');
        });
    }


    /*测试搜索*/
    function testSearch() {
        var title=/(人民币普通股票|人民币特种股票|外资股|买卖证券的惟一交易点|防止投资者股票被盗卖|自动领取红利|证券经营机构提供的对账服务|什么是ST,PT股票|开放式基金和封闭式基金|对所有有效委托进行集中处理|以股市指数为买卖基础的期货|多头行情转为空头行情|业绩与盈余有良好表现|低于面前的价格发行){1}/,res = {
            message: 'ok',
            code: 0,
            result: Mock.mock({
                'list|5': [{
                    'theme': 'deposit',
                    'list|2-10': [{
                        "id": /[0-9]{1,2}/,
                        "title": title
                    }]
                }, {
                    'theme': 'trade',
                    'list|2-10': [{
                        "id": /[0-9]{1,2}/,
                        "title": title
                    }]
                }, {
                    'theme': 'account',
                    'list|2-10': [{
                        "id": /[0-9]{1,2}/,
                        "title": title
                    }]
                }, {
                    'theme': 'capital',
                    'list|2-10': [{
                        "id": /[0-9]{1,2}/,
                        "title": title
                    }]
                }, {
                    'theme': 'center',
                    'list|2-10': [{
                        "id": /[0-9]{1,2}/,
                        "title": title
                    }]
                }, {
                    'theme': 'client',
                    'list|2-10': [{
                        "id": /[0-9]{1,2}/,
                        "title": title
                    }]
                }]
            })
        };
        return res;
    }

    /*测试查看详情*/
    function testDetail() {
        var info = /(<p>独立寒秋，湘江北去，橘子洲头。<\/p><p>看万山红遍，层林尽染；<\/p><p>漫江碧透，百舸争流。<\/p><p>鹰击长空，鱼翔浅底，万类霜天竞自由。<\/p><p>怅寥廓，问苍茫大地，谁主沉浮？<\/p><p>携来百侣曾游，忆往昔峥嵘岁月稠。<\/p><p>恰同学少年，风华正茂；<\/p><p>书生意气，挥斥方遒。<\/p><p>指点江山，激扬文字，粪土当年万户侯。<\/p><p>曾记否，到中流击水，浪遏飞舟?<\/p>|<p>十年生死两茫茫，不思量，自难忘。<\/p><p>千里孤坟，无处话凄凉。<\/p><p>纵使相逢应不识，尘满面，鬓如霜。<\/p><p>夜来幽梦忽还乡，小轩窗，正梳妆，相顾无言，惟有泪千行。<\/p><p>料得年年肠断处，明月夜，短松冈。<\/p>|<p>关关雎鸠，在河之洲。<\/p><p>窈窕淑女，君子好逑。<\/p> <p>参差荇菜，左右流之。<\/p><p>窈窕淑女，寤寐求之。<\/p><p>求之不得，寤寐思服。<\/p><p>悠哉悠哉，辗转反侧。<\/p><p>参差荇菜，左右采之。<\/p><p>窈窕淑女，琴瑟友之。<\/p><p>参差荇菜，左右芼之。<\/p><p>窈窕淑女，钟鼓乐之。<\/p>|<p>对酒当歌，人生几何？ 譬如朝露，去日苦多。<\/p> <p>慨当以慷，忧思难忘。 何以解忧？唯有杜康。<\/p><p>青青子衿，悠悠我心。 但为君故，沉吟至今。<\/p><p>呦呦鹿鸣，食野之苹。 我有嘉宾，鼓瑟吹笙。<\/p><p>明明如月，何时可掇？ 忧从中来，不可断绝。<\/p><p>越陌度阡，枉用相存。 契阔谈宴，心念旧恩。<\/p><p>月明星稀，乌鹊南飞。 绕树三匝，何枝可依？<\/p><p>山不厌高，海不厌深。 周公吐哺，天下归心。<\/p>|<p>春江潮水连海平，海上明月共潮生。<\/p><p>滟滟随波千万里，何处春江无月明！<\/p><p>江流宛转绕芳甸，月照花林皆似霰。<\/p> <p>空里流霜不觉飞，汀上白沙看不见。<\/p><p>江天一色无纤尘，皎皎空中孤月轮。<\/p> <p>江畔何人初见月？江月何年初照人？<\/p><p>人生代代无穷已，江月年年只相似。<\/p><p>不知江月待何人，但见长江送流水。<\/p><p>白云一片去悠悠，青枫浦上不胜愁。<\/p><p>谁家今夜扁舟子？何处相思明月楼？<\/p><p>可怜楼上月徘徊，应照离人妆镜台。<\/p><p>玉户帘中卷不去，捣衣砧上拂还来。<\/p><p>此时相望不相闻，愿逐月华流照君。<\/p><p>鸿雁长飞光不度，鱼龙潜跃水成文。<\/p><p>昨夜闲潭梦落花，可怜春半不还家。<\/p><p>江水流春去欲尽，江潭落月复西斜。<\/p><p>斜月沉沉藏海雾，碣石潇湘无限路。<\/p><p>不知乘月几人归，落月摇情满江树。<\/p>|<p>枯藤老树昏鸦，<\/p><p>小桥流水人家，<\/p> <p>古道西风瘦马。<\/p><p>夕阳西下，<\/p><p>断肠人在天涯。<\/p>){1}/,
            res = {
                message: 'ok',
                code: 0,
                result: Mock.mock({
                    "id": /[0-9]{1,2}/,
                    "dateTime": moment().format('YYYY-MM-DD'),
                    "title": /[a-zA-Z]{1,50}/,
                    "content": info
                })
            };
        return res;
    }
})(jQuery);
