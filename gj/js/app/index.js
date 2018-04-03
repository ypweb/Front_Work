/**
 * Created by Administrator on 2017/5/31 0031.
 */
(function ($) {
    'use strict';

    $(function () {
        /*dom节点缓存*/
        var $notice_list_wrap = $('#notice_list_wrap');


        //轮播dom节点
        var $slideimg_show = $('#slideimg_show'),
            $slide_tips = $('#slide_tips'),
            $slide_img = $('#slide_img'),
            $slideimg_btn = $('#slideimg_btn');


        //轮播动画
        slide.slideToggle({
            $wrap: $slideimg_show,
            $slide_img: $slide_img,
            $btnwrap: $slideimg_btn,
            $slide_tipwrap: $slide_tips,
            minwidth: 1000,
            isresize: false,
            size: 3,
            times: 5000,
            eff_time: 500,
            btn_active: 'slidebtn-active'
        });


        /*初始化加载公告数据*/
        getNoticeList({
            $list: $notice_list_wrap
        });

    });


    function getNoticeList(config) {
        $.ajax({
            url: "json/test.json",
            dataType: 'JSON',
            method: 'post'
        }).done(function (resp) {
            /*测试代码*/
            var resp = testNoticeList();

            var code = parseInt(resp.code, 10);
            if (code !== 0) {
                if (code === 999) {
                    /*清空缓存*/
                    config.$list.html('');
                }
                console.log(resp.message);
                return false;
            }
            var result = resp.result;
            if (!result) {
                return false;
            }
            var list = result.list;
            if (!list) {
                return false;
            }
            var len = list.length,
                i = 0,
                str = '',
                listitem;

            for (i; i < len; i++) {
                listitem = list[i];
                if (i % 2 === 0) {
                    str += '<li class="notice-lr"><span>' + listitem["dateTime"] + '</span><p>' + listitem["content"] + '</p></li>';
                } else {
                    str += '<li class="notice-ll"><span>' + listitem["dateTime"] + '</span><p>' + listitem["content"] + '</p></li>';
                }
            }

            if(str!==''){
                $(str).appendTo(config.$list);
            }else{
                config.$list.html('');
            }
        }).fail(function (resp) {
            console.log(resp.message || 'error');
            return false;
        });
    }


    /*测试代码*/
    function testNoticeList() {

        var info=/(欢迎您光临|对不起，让您久等了|我能为您做什么？|对不起，我没有听明白，请您再讲一遍|很抱歉，您要办的事不符合规定，我们不能办理|不买没关系，欢迎您随便参观|这种商品暂时缺货，方便的话，请您留下姓名和电话，一有货马上通知您 ，好吗？|欢迎您以后常来){1}/,
            res = {
            message: 'ok',
            code: 0,
            result: Mock.mock({
                'list|5-15': [{
                    "id": /[0-9]{1,2}/,
                    "dateTime": moment().format('YYYY-MM-DD'),
                    "content":info
                }]
            })
        };
        return res;
    }


})(jQuery);
