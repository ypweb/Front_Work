/**
 * Created by Administrator on 2017/5/31 0031.
 */
(function ($) {
    'use strict';

    $(function () {
        /*获取dom节点缓存*/
        var $list_wrap = $('#list_wrap'),
            $list_page_wrap = $('#list_page_wrap');


        /*绑定查询数据*/
        queryList({
            $list_wrap: $list_wrap,
            $list_page_wrap: $list_page_wrap,
            ispage: true
        });

    });


    /*搜索*/
    function queryList(config) {
        $.ajax({
            url: '../json/test.json',
            method: 'post',
            data: {},
            dataType: 'JSON'
        }).done(function (resp) {
            /*测试代码*/
            var resp = testList();
            if (resp.code === 0) {
                var result = resp.result;
                if (result) {
                    var list = result.list;
                    if (list) {
                        var len = list.length,
                            i = 0,
                            str = '',
                            item;
                        for (i; i < len; i++) {
                            item = list[i];
                            str += '<li><a href="detail.html" title=""><span>' + item["dateTime"] + '</span>' + item["title"] + '</a></li>';
                        }
                        if (str === '') {
                            config.$list_wrap.html('');
                        } else {
                            $(str).appendTo(config.$list_wrap.html(''));
                        }
                        if (config.ispage) {
                            config.$list_page_wrap.pagination({
                                total: resp.count,
                                pageSize:5,
                                pageNumber:1,
                                onSelectPage: function (pageNumber, pageSize) {
                                    /*再次查询*/
                                    queryList({
                                        ispage: false,
                                        $list_wrap: config.$list_wrap
                                    });
                                }
                            });
                        }
                    }
                } else {
                    console.log('没有查询结果');
                }
            } else {
                console.log('查询失败');
            }
        }).fail(function (resp) {
            console.log('查询错误');
        });
    }


    /*测试搜索*/
    function testList() {
        var title = /(人民币普通股票|人民币特种股票|外资股|买卖证券的惟一交易点|防止投资者股票被盗卖|自动领取红利|证券经营机构提供的对账服务|什么是ST,PT股票|开放式基金和封闭式基金|对所有有效委托进行集中处理|以股市指数为买卖基础的期货|多头行情转为空头行情|业绩与盈余有良好表现|低于面前的价格发行){1}/, res = {
            message: 'ok',
            code: 0,
            count: 100,
            result: Mock.mock({
                'list|5': [{
                    "id": /[0-9]{1,2}/,
                    "title": title,
                    "dateTime": moment().format('YY-MM-DD')
                }]
            })
        };
        return res;
    }

})(jQuery);
