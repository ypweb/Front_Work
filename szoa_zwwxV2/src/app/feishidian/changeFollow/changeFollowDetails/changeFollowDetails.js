/**
 * Created by zhuhao on 2018/8/13.
 */
define(["util"], function (Util) {

    //传参
    var hashData = {};

    function init() {
        hashData = Util.getHashData();
        document.title = hashData.title;
        $.ajax({
            url: "/ajax.sword?ctrl=WeixinDocDitalV2_exchangeTrace",
            dataType: "json",
            async: false,
            data: {
                "workid": hashData.workId,
            },
            success: function (data) {
                if (data.message && data.message.success == "1") {
                    initJiaohuangz(data.message.data);
                } else {
                    $.alert("获取交换跟踪页面失败！")
                    window.location.back();
                }
            }
        });
    }

    //初始化交换跟踪
    function initJiaohuangz(list) {
        //交换跟踪数据对象
        var GZList = {};

        //页面元素获取
        var $follow_toggle = $('#follow_toggle'),
            $follow_select = $('#follow_select'),
            $follow_list = $('#follow_list'),
            $follow_tab = $('#follow_tab'),
            $follow_process = $('#follow_process'),
            $follow_process_sure = $('#follow_process_sure');

        var current_scorll_pos = null/*当前scorll位置*/;

        /*绑定切换显示隐藏*/
        $follow_toggle.on('click', function () {
            /*切换发送*/
            $(this).toggleClass('title-toggle');
            $follow_select.toggleClass('list-toggle');
        });

        /*绑定选中*/
        $follow_select.on('click', 'li', function () {
            var $this = $(this),
                text = $this.html();

            $this.addClass('select-active').siblings().removeClass('select-active');
            $follow_toggle.html(text);
            $follow_toggle.trigger('click');
        });

        /*绑定tab切换*/
        $follow_tab.on('click', function (e) {
            var target = e.target,
                nodename = target.nodeName.toLowerCase(),
                $this = null;

            if (nodename === 'div') {
                $this = $(target).parent();
            } else if (nodename === 'li') {
                $this = $(target);
            }
            $this.addClass('tabactive').siblings().removeClass('tabactive');
        });

        /*绑定查看意见*/
        $follow_list.on('click', function (e) {
            var target = e.target,
                nodename = target.nodeName.toLowerCase();

            /*过滤非标签*/
            if (nodename !== 'div') {
                return false;
            } else if (nodename === 'div' && target.className.indexOf('follow-tip') !== -1) {
                /*切换查看意见*/
                $(target).toggleClass('tip-toggle');
            }
        });

        /*绑定办文确定*/
        $follow_process_sure.on('click', function () {
            $follow_process.toggleClass('g-d-hidei');
            $follow_list.removeClass('g-d-hidei');
            $follow_tab.removeClass('g-d-hidei');
            if (current_scorll_pos !== null) {
                $(window).scrollTop(current_scorll_pos);
            }
        });

        //点击微信图标，直接发起会话
        $("#follow_process").on("click", ".action-wx", function () {
            var wxid = $(this).data().id;
            wx.openEnterpriseChat({
                userIds: wxid,    // 必填，参与会话的成员列表。格式为userid1;userid2;...，用分号隔开，最大限制为2000个。userid单个时为单聊，多个时为群聊。
                groupName: '',  // 必填，会话名称。单聊时该参数传入空字符串""即可。
                success: function (res) {
                    // 回调
                },
                fail: function (res) {
                    if (res.errMsg.indexOf('function not exist') > -1) {
                        $.alert('版本过低请升级')
                    }
                }
            });
        });

        if (list) {
            for (var i = 0; i < list.length; i++) {
                if (list[i].type === "fsgw") {
                    if (list.length - 1 == i) {
                        $("#follow_select").append(' <li class="select-active" data-id="index' + i + '">发送公文<p>' + list[i].sendtime + '</p></li>')
                        $("#follow_toggle").append('发送公文<p>' + list[i].sendtime + '</p>');
                        initOne(list[i]);
                    } else {
                        $("#follow_select").append(' <li data-id="index' + i + '">发送公文<p>' + list[i].sendtime + '</p></li>')
                    }
                } else if (list[i].type === "zb") {
                    if (list.length - 1 == i) {
                        $("#follow_select").append(' <li class="select-active" data-id="index' + i + '">转办<p>' + list[i].sendtime + '</p></li>')
                        $("#follow_toggle").append('转办<p>' + list[i].sendtime + '</p>');
                        initOne(list[i]);
                    } else {
                        $("#follow_select").append(' <li data-id="index' + i + '">转办<p>' + list[i].sendtime + '</p></li>')
                    }
                }
                GZList["index" + i] = list[i];
            }
        }

        //表头列表点击事件
        $("#follow_select").on("click", "li", function () {
            var index = $(this).data().id;
            initOne(GZList[index]);
        })

        //根据数据初始化交换跟踪详情
        function initOne(data) {
            //渲染发送总数和发送数
            $("#totalNb").html(data.sendTotal)
            $("#sendNb").html(data.ysdList.length)

            //渲染切换栏，已签收未签收 拒收
            if (data.wqsList.length < 1) {
                $("#wqs_nb").parent().addClass("g-d-hidei");
            } else {
                $("#wqs_nb").parent().removeClass("g-d-hidei");
            }
            if (data.yqsList.length < 1) {
                $("#yqs_nb").parent().addClass("g-d-hidei");
            } else {
                $("#yqs_nb").parent().removeClass("g-d-hidei");
            }
            if (data.yhfList.length < 1) {
                $("#yhf_nb").parent().addClass("g-d-hidei");
            } else {
                $("#yhf_nb").parent().removeClass("g-d-hidei");
            }
            if (data.jsList.length < 1) {
                $("#js_nb").parent().addClass("g-d-hidei");
            } else {
                $("#js_nb").parent().removeClass("g-d-hidei");
            }
            if (data.nosendList.length < 1) {
                $("#wsd_nb").parent().addClass("g-d-hidei");
            } else {
                $("#wsd_nb").parent().removeClass("g-d-hidei");
            }
            if (data.ychList.length < 1) {
                $("#ych_nb").parent().addClass("g-d-hidei");
            } else {
                $("#ych_nb").parent().removeClass("g-d-hidei");
            }

            $("#wqs_nb").html("未签收(" + data.wqsList.length + ")")
            $("#yqs_nb").html("已签收(" + data.yqsList.length + ")")
            $("#yhf_nb").html("已回复(" + data.yhfList.length + ")")
            $("#js_nb").html("拒收(" + data.jsList.length + ")")
            $("#wsd_nb").html("未送达(" + data.nosendList.length + ")")
            $("#ych_nb").html("已撤回(" + data.ychList.length + ")")

            //初始化切换栏选中为未签收
            $("#qianshou_nb_all .tabactive").removeClass("tabactive");
            $($("#qianshou_nb_all").find("li[class!='g-d-hidei']").get(0)).addClass("tabactive");

            //初始化切换栏列表的数据
            var listName = $("#qianshou_nb_all .tabactive").data().id;
            var initListData = data[listName];
            $("#follow_list").empty();
            for (var i = 0; i < initListData.length; i++) {
                $("#follow_list").append(qianshouTemplate(initListData[i]));
            }

            //绑定切换栏样式点击事件
            $("#qianshou_nb_all").off("click", "li").on("click", "li", function () {
                $("#qianshou_nb_all .tabactive").removeClass("tabactive");
                $(this).addClass("tabactive");
            })

            //给三个按钮分别绑定点击事件，刷新列表
            $("#wqs_nb").off("click").on("click", function () {
                $("#follow_list").empty();
                var weiqianshouList = data.wqsList;
                for (var i = 0; i < weiqianshouList.length; i++) {
                    $("#follow_list").append(qianshouTemplate(weiqianshouList[i]));
                }
            });
            $("#yqs_nb").off("click").on("click", function () {
                $("#follow_list").empty();
                var yiqianshouList = data.yqsList;
                for (var i = 0; i < yiqianshouList.length; i++) {
                    $("#follow_list").append(qianshouTemplate(yiqianshouList[i]));
                }
            })
            $("#yhf_nb").off("click").on("click", function () {
                $("#follow_list").empty();
                var yihuifuList = data.yhfList;
                for (var i = 0; i < yihuifuList.length; i++) {
                    $("#follow_list").append(qianshouTemplate(yihuifuList[i]));
                }
            });
            $("#js_nb").off("click").on("click", function () {
                $("#follow_list").empty();
                var jushouList = data.jsList;
                for (var i = 0; i < jushouList.length; i++) {
                    $("#follow_list").append(jushouTemplate(jushouList[i]));
                }
            });
            $("#wsd_nb").off("click").on("click", function () {
                $("#follow_list").empty();
                var nosendList = data.nosendList;
                for (var i = 0; i < nosendList.length; i++) {
                    $("#follow_list").append(qianshouTemplate(nosendList[i]));
                }
            });
            $("#ych_nb").off("click").on("click", function () {
                $("#follow_list").empty();
                var ychList = data.ychList;
                for (var i = 0; i < ychList.length; i++) {
                    $("#follow_list").append(qianshouTemplate(ychList[i]));
                }
            });

            //给列表绑定点击事件，点击显示联系人和联系电话
            /* $("#follow_list").off("click", ".follow-title").on("click", ".follow-title", function () {
             current_scorll_pos=$(window).scrollTop();
             var $this=$(this),
             msg = $this.data();

             $this.addClass('follow-active').parents('li').siblings().find('>div:first-child  .follow-title').removeClass('follow-active');
             showInfoMsg(msg);
             });*/


            //给列表绑定点击事件，点击显示联系人和联系电话
            $("#follow_list").off("click", ".follow-icon").on("click", ".follow-icon", function () {
                current_scorll_pos = $(window).scrollTop();
                var $this = $(this),
                    msg = $this.data();

                $this.prev().addClass('follow-active').parents('li').siblings().find('>div:first-child  .follow-title').removeClass('follow-active');
                showNameMsg(msg);
            });


            removeHide();
        }

        function showInfoMsg(msg) {
            if (!msg.id || msg.id == "undefined") {
                msg.id = "";
                $.alert("没有查询到联系人！")
                return;
            }
            if (!msg.name || msg.name == "undefined") {
                msg.name = "";
            }
            if (!msg.tel || msg.tel == "undefined") {
                msg.tel = "";
            }
            $("#follow_process ul").empty().append(weixinduihuaTemplate(msg));
            $follow_process.toggleClass('g-d-hidei');
            $follow_list.addClass('g-d-hidei');
            $follow_tab.addClass('g-d-hidei');
        }

        function showNameMsg(msg) {
            if (!msg.id || msg.id == "undefined") {
                msg.id = "";
                $.alert("没有查询到联系人！")
                return;
            }
            if (!msg.name || msg.name == "undefined") {
                msg.name = "";
            }
            if (!msg.tel || msg.tel == "undefined") {
                msg.tel = "";
            }
            var alertWords = '<div class="alertMsg">联系人：<span class="alertDetail">' + msg.name + '</span><div data-id="' + msg.id + '" class="wx-alert-icon"></div><div class="wx-alert-icon"></div></div><br><div class="alertMsg">联系电话：<a href="tel:' + msg.tel + '" class="alertDetail">' + msg.tel + '</a></div>';
            $.alert({
                text: alertWords,
                title: '',
                contenticons: [{
                    'class': 'weixin',
                    'onClick': function (event) {
                        if (event && event.data() && event.data().id) {
                            var wxid = event.data().id;
                            wx.openEnterpriseChat({
                                userIds: wxid,    // 必填，参与会话的成员列表。格式为userid1;userid2;...，用分号隔开，最大限制为2000个。userid单个时为单聊，多个时为群聊。
                                groupName: '',  // 必填，会话名称。单聊时该参数传入空字符串""即可。
                                success: function (res) {
                                },
                                fail: function (res) {
                                    if (res.errMsg.indexOf('function not exist') > -1) {
                                        $.alert('版本过低请升级')
                                    }
                                }
                            });
                        } else {
                            $.alert('未查询到用户信息！')
                        }
                    }
                }, {
                    'class': 'video',
                    'onClick': function (e) {
                    }
                }]
            });
            // $.alert(alertWords, "");
        }

        function weixinduihuaTemplate(msg) {
            var html = '<li>' +
                '<h2 class="text-main"><span>分办</span>' + msg.name + '</h2>' +
                '<p><span>开始时间：</span>2018-08-01</p>' +
                '<p><span>结束时间：</span>2018-08-15</p>' +
                '<div class="action-wx" data-id="' + msg.id + '"></div>' +
                '<div class="action-video"></div>' +
                '</li>';
            return html;
        }

        //无特殊信息模板
        function qianshouTemplate(data) {
            var html = '<li>' +
                '<div data-id="' + data.wxid + '" data-name="' + data.linkman + '" data-tel="' + data.tel + '" class="follow-theme"><div data-id="' + data.wxid + '" data-name="' + data.linkman + '" data-tel="' + data.tel + '" class="follow-title">' + data.department + '</div><div class="follow-icon" data-id="' + data.wxid + '" data-name="' + data.linkman + '" data-tel="' + data.tel + '"></div></div>' +
                '</li>';
            return html;
        }

        //拒收特殊类型模板
        function jushouTemplate(data) {
            var html = '<li>' +
                '<div data-id="' + data.wxid + '" data-name="' + data.linkman + '" data-tel="' + data.tel + '" class="follow-theme"><div data-id="' + data.wxid + '" data-name="' + data.linkman + '" data-tel="' + data.tel + '"  class="follow-title">' + data.department + '</div><div class="follow-icon" data-id="' + data.wxid + '" data-name="' + data.linkman + '" data-tel="' + data.tel + '" ></div></div>' +
                '<div class="follow-tip">' +
                '<p>' + data.reason + '</p>' +
                '</div>' +
                '</li>';
            return html;
        }
    }

    //控制显示
    function removeHide() {
        $("#jiaohuangenzong_swiper").removeClass("g-d-hidei");
        $.hideLoading();
    }

    return {
        init: init,
        initJiaohuangz: initJiaohuangz
    }
});