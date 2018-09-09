/**
 * Created by zhuhao on 2018/8/9.
 */
define(["UrlBase","ChangeFollowDetails", "util", "tab_swiper", "InitDataUtil", "Swiper"], function (UrlBase,ChangeFollowDetails, Util, tab_swiper, InitDataUtil) {

    //传参
    var hashData = {};
    var userInfo={};
    //流程实例对象
    var instance = {}
    //页面title
    var docTitle_base = "";
    //打开正文次数
    var showDocTime = 0;
    //交换跟踪数据对象
    var GZList = {};
    var toggleFlag = 0;
    var isHaveFujian = false;

    function init() {
        Util.getUserInfoAndUrl({
            whenSuccess: function (user,hash) {
                hashData=hash;
                userInfo=user;
                openInstance();
                initData();
            },
            whenUserError:function (resultObj) {
                $.alert(resultObj.errorMsg,function () {
                    window.history.go(-1);
                })
            },
            whenZFError:function (resultObj) {
                $.alert(resultObj.errorMsg,function () {
                    wx.closeWindow();
                })
            }
        });
    }

    //获取流程实例锁
    function openInstance() {
        $.ajax({
            url: "/ajax.sword?ctrl=WeixinDocDitalV2_openInstance",
            dataType: "json",
            async: false,
            data: {
                "userid": userInfo.id,
                "userName": userInfo.truename,
                "workid": hashData.workId,
                "trackid": hashData.trackId
            },
            success: function (data) {
                if (data.message && data.message.data) {
                    instance = data.message.data;
                } else {
                    $.alert("暂无权限查看此公文！",function () {
                        window.history.go(-1);
                    })
                }
            }
        });
    }

    //关闭流程实例
    function closeInstance() {
        $.ajax({
            url: "/ajax.sword?ctrl=WeixinDocDitalV2_closeInstance",
            dataType: "json",
            data: {
                "userid": userInfo.id,
                "userName": userInfo.truename,
                "workid": hashData.workId,
                "trackid": hashData.trackId
            },
            success: function (data) {
                //console.log(data)
            }
        });
    }

    //获取所有表单数据
    function initData() {
        InitDataUtil.initAll(hashData,userInfo, instance, function (data) {
            var allData = data;
            //初始化意见栏
            initYijian(allData.yijianList.data);
            //初始化正文
            initZhengwen(allData.docFile, allData.pdfFile);
            //初始化参考资料栏
            initFujian(allData.biaodan);
            //初始化签发页
            initQianFa(allData.qianfa);
            //初始化便签贴
            initBianQianTie(allData.bianqiantie);
            //初始化表单或者会议信息
            initBiaodan(allData.biaodan, allData.banliliucheng);
            //初始化报名表
            initBaomingBiao(allData.baomingbiao);
            //初始化办理信息
            initBanliXinxi(allData.banlixinxi);
            //初始化交换跟踪
            initJHGZ(allData);
            //删除隐藏，展示页面
            removeHide();
            //初始化滑动页签
            initTabSwiper();
            //关闭流程实例
            closeInstance();
            //初始化自定义转发
            initZhuanFa();
        })
    }

    function initJHGZ(allData) {
        if (allData.jiaohuangz.isShow == true) {
            var list = allData.jiaohuangz.data.data;
            ChangeFollowDetails.initJiaohuangz(list);
        } else {
            $("#jiaohuangenzong_tab").remove();
            $("#jiaohuangenzong_swiper").remove();
        }
    }

    function initZhuanFa() {
        Util.initZhuanfa({
            data: {
                "workId": hashData.workId,
                "type": hashData.type,
                "unitId": userInfo.unitId,
                "trackId":hashData.trackId,
                "isLeader":hashData.isLeader
            },
            link: UrlBase.URL_SHARE_DAIBAN,
            title: docTitle_base,
            imgUrl: UrlBase.URL_IMG_DAIBAN,
            desc: docTitle_base,
            success: function () {
            },
            cancel: function () {
            }
        });
    }

    function initTabSwiper() {
        if (hashData.isJhgz=="1"){
            tab_swiper.init({
                index:"jiaohuangenzong_tab"
            });
        }else {
            tab_swiper.init();
        }
        tab_swiper.setTitle(document.title);
    }

    function removeHide() {
        $("#allTab").removeClass("g-d-hidei");
        $("#yijian_div").removeClass("g-d-hidei");
        $.hideLoading();
    }

    //初始化正文
    function initZhengwen(doc, pdf) {
        if (doc && doc.success == 1) {
            $("#zhengwen_div").append('<div id="zhengwen_doc" class="wx-download-text-wrap wx-download-edit">' +
                '<div class="download-bg">' +
                '<div class="download-text">可编辑文件</div>' +
                '<div class="download-icon"></div>' +
                '</div>' +
                '</div>');
        }
        if (pdf && pdf.success == 1) {
            $("#zhengwen_div").append('<div id="zhengwen_pdf" class="wx-download-text-wrap wx-download-format g-gap-mt5">' +
                '<div class="download-bg">' +
                '<div class="download-text">版式文件</div>' +
                '<div class="download-icon"></div>' +
                '</div>' +
                '</div>');
        }

        if (doc && doc.success != 1 && pdf && pdf.success != 1) {
            $("#zhengwen_div").parent().addClass("wx-empty-panel wx-empty-document");
        }

        //绑定文件正文点击事件
        $("#zhengwen_div").on("click", "#zhengwen_doc", function () {
            getDocFileUrl(hashData.workId, hashData.type, docTitle_base, "doc");
        });
        $("#zhengwen_div").on("click", "#zhengwen_pdf", function () {
            getDocFileUrl(hashData.workId, hashData.type, docTitle_base, "pdf");
        });
    }

    //初始化表单或者会议信息
    function initBiaodan(data, liuchengData, baomingData) {
        var $chengpixinxiGrid = $("#chengpixinxiGrid"); //用于表单信息追加
        var $chengpiliucheng = $("#chengpiliucheng");//追加呈批信息办理流程容器
        var $huiyiliucheng = $("#huiyiliucheng");//追加会议信息办理流程容器

        var docDetailList = data.data.data;
        if (data.showName == "呈批信息" || data.showName == "表单") {
            //初始化title
            docTitle_base = data.data.data.title;
            document.title = docTitle_base;

            if (data.showName == "呈批信息") {
                $("#biaodan_tab").html("呈批信息");
            } else if (data.showName == "表单") {
                $("#biaodan_tab").html("表单")
            }

            //删除会议相关标签
            $("#huiyixinxi_tab").remove();
            $("#huiyixinxi_swiper").remove();

            /*办理流程样式第二版*/
            $chengpiliucheng.append('<h2 id="liuchenglable" class="wx-labeltheme-wrap g-bc-white">办理流程<span class="theme-icon theme-icon-toggle"></span></h2>'
                + '<ul id="liuchengxiangxi" class="wx-processlist-vertical-wrap g-bc-white g-d-hidei"></ul>');

            if (parseInt(hashData.type) === 1) {
                $chengpixinxiGrid.append('<li>'
                    + '<h2 class="wx-labeltheme-wrap">发文信息</h2>'
                    + '<div class="wx-labelshow">'
                    + '<div><span>拟稿单位:</span><p>' + docDetailList.receivedinfo.unitname + '</p></div>'
                    + '<div><span>签发人:</span><p>' + docDetailList.receivedinfo.employee + '</p></div>'
                    + '<div><span>文件缓急:</span><p>' + docDetailList.receivedinfo.priority + '</p></div>'
                    + '<div><span>文件编号:</span><p>' + docDetailList.documentNo + '</p></div>'
                    + '</div>'
                    + '</li>');
            } else if (parseInt(hashData.type) === 2) {
                $chengpixinxiGrid.append('<li>'
                    + '<h2 class="wx-labeltheme-wrap">来文信息</h2>'
                    + '<div class="wx-labelshow">'
                    + '<div><span>来文单位:</span><p>' + docDetailList.receivedinfo.unitname + '</p></div>'
                    + '<div><span>来文字号:</span><p>' + docDetailList.receivedinfo.documentNo + '</p></div>'
                    + '<div><span>签发人:</span><p>' + docDetailList.receivedinfo.employee + '</p></div>'
                    + '<div><span>文件缓急:</span><p>' + docDetailList.receivedinfo.priority + '</p></div>'
                    + '<div><span>收文编号:</span><p>' + docDetailList.documentNo + '</p></div>'
                    + '</div>'
                    + '</li>');
            }
        } else if (data.showName == "会议信息") {
            //初始化title
            docTitle_base = data.data.data.meetingName
            document.title = docTitle_base;
            //删除表单页签
            $("#biaodan_tab").remove();
            $("#biaodan_swiper").remove();

            /*办理流程样式第二版*/
            $huiyiliucheng.append('<h2 id="liuchenglable" class="wx-labeltheme-wrap g-bc-white g-gap-mt5">办理流程<span class="theme-icon theme-icon-toggle"></span></h2>'
                + '<ul id="liuchengxiangxi" class="wx-processlist-vertical-wrap g-bc-white g-d-hidei"></ul>');
            var meetingList = docDetailList;
            $("#meetingName").html(meetingList.meetingName);
            $("#fileNo").html(meetingList.fwbh);
            $("#huanJi").html(meetingList.jihuan);
            $("#hostMan").html(meetingList.hostMan);
            $("#meetTime").html(meetingList.meetTime);
            $("#deadline").html(meetingList.deadline);
            $("#connectMan").html(meetingList.connectMan);
            $("#connectWay").html(meetingList.connectWay);
            $("#meetingPlace").html(meetingList.meetingPlace);
            $("#meetingPerson").html(meetingList.meetingPerson);
            $("#zhusong").html(meetingList.zhusong);
            $("#content").html(meetingList.content);
        }

        var $do = $("#liuchenglable");				//实现办理流程的展示与隐藏
        //办理流程隐藏|显示切换
        $do.on('click', function () {
            $("#liuchenglable span").toggleClass('toggle-active');
            $("#liuchengxiangxi").toggleClass('g-d-hidei');
        })
        initLiucheng(liuchengData);
    }

    //会议列表模板
    function meetTenplate(msg) {
        var meetman = msg.meetman;
        if (meetman === null) {
            meetman = "";
        }
        var job = msg.job;
        if (job === null) {
            job = "";
        }
        var meetdept = msg.meetdept;
        if (meetdept === null) {
            meetdept = "";
        }
        var ifleave = msg.ifleave;
        if (ifleave === null) {
            ifleave = "";
        }
        var leaveperson = msg.leaveperson;
        if (leaveperson === null) {
            leaveperson = "";
        }
        var bookerman = msg.bookerman;
        if (bookerman === null) {
            bookerman = "";
        }
        var bookmantel = msg.bookmantel;
        if (bookmantel === null) {
            bookmantel = "";
        }

        var param = "id=" + msg.id + "," + "meetman=" + meetman + "," + "job=" + job + "," + "meetdept=" + meetdept + "," + "ifleave=" + ifleave + "," + "leaveperson=" + leaveperson + "," + "bookerman=" + bookerman + "," + "bookmantel=" + bookmantel;

        var html = '<li>' +
            '<h2 class="wx-labeltheme-wrap"><span data-name="' + meetman + '" data-param="' + param + '" class="theme-icon theme-icon-edit"></span>' + job + '</h2>' +
            '<div class="wx-labelshow">' +
            '<div><span>参会单位：</span><p id="meetdept">' + meetdept + '</p></div>';
        if (ifleave === "是") {
            html += '<div>' +
                '<span>请假情况：</span><p id="ifleave">' + ifleave + '</p>' +
                '</div>' +
                '<div>' +
                '<span>请假原因：</span><p id="leaveperson" >' + leaveperson + '</p>' +
                '</div>';
        }
        html += '<div>' +
            '<span>填报人：</span><p id="bookerman">' + bookerman + '</p>' +
            '<em>Tel：</em><p id="bookmantel">' + bookmantel + '</p>' +
            '</div>' +
            '</div>' +
            '</li>';
        return html;
    }

    //初始化会议报名表
    function initBaomingBiao(data) {
        if (data.isShow == false) {
            $("#huiyibaoming_tab").remove();
            $("#baoming_swiper").remove();
            return;
        }
        var list = data.data;
        if (list && list.length > 0) {
            for (var i = 0; i < list.length; i++) {
                $("#huiyibaoming_div").append(meetTenplate(list[i]));
            }
        } else {
            $("#meetingBaomingTable").addClass("g-d-hidei")
            $("#huiyibaomingbiao_div").parent().addClass("wx-empty-panel wx-empty-document");
        }
    }

    //初始化交换跟踪
    function initJiaohuangz(list) {
        //页面元素获取
        var $follow_toggle = $('#follow_toggle'),
            $follow_select = $('#follow_select'),
            $follow_list = $('#follow_list');

        /*绑定切换显示隐藏*/
        $follow_toggle.on('click', function (e) {
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

        /*绑定查看意见*/
        $follow_list.on('click', function (e) {
            var target = e.target,
                nodename = target.nodeName.toLowerCase(),
                $this = null;

            /*过滤非标签*/
            if (nodename !== 'div') {
                return false;
            } else if (nodename === 'div' && target.className.indexOf('follow-tip') !== -1) {
                /*切换查看意见*/
                $(target).toggleClass('tip-toggle');
            }
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
            $($("#qianshou_nb_all").children("li").get(0)).addClass("tabactive");

            //初始化切换栏列表的数据
            var weiqianshouList = data.wqsList;
            $("#follow_list").empty();
            for (var i = 0; i < weiqianshouList.length; i++) {
                $("#follow_list").append(qianshouTemplate(weiqianshouList[i]));
            }

            //绑定切换栏样式点击事件
            $("#qianshou_nb_all").off("click", "li").on("click", "li", function () {
                $("#qianshou_nb_all .tabactive").removeClass("tabactive");
                $(this).addClass("tabactive");
            })

            //给三个按钮分别绑定点击事件，刷新列表
            $("#wqs_nb").off("click").on("click", function () {
                $("#follow_list").empty();
                for (var i = 0; i < weiqianshouList.length; i++) {
                    $("#follow_list").append(qianshouTemplate(weiqianshouList[i]));
                }
            })
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
            })
            $("#js_nb").off("click").on("click", function () {
                $("#follow_list").empty();
                var jushouList = data.jsList;
                for (var i = 0; i < jushouList.length; i++) {
                    $("#follow_list").append(jushouTemplate(jushouList[i]));
                }
            })
            $("#wsd_nb").off("click").on("click", function () {
                $("#follow_list").empty();
                var nosendList = data.nosendList;
                for (var i = 0; i < nosendList.length; i++) {
                    $("#follow_list").append(qianshouTemplate(nosendList[i]));
                }
            })
            $("#ych_nb").off("click").on("click", function () {
                $("#follow_list").empty();
                var ychList = data.ychList;
                for (var i = 0; i < ychList.length; i++) {
                    $("#follow_list").append(qianshouTemplate(ychList[i]));
                }
            })

            //给列表绑定点击事件，点击显示联系人和联系电话
            $("#follow_list").off("click", ".follow-theme").on("click", ".follow-theme", function () {
                var msg = $(this).data();
                showInfoMsg(msg);
            })
            $(".wx-followlist-wrap>li:after").off("click").on("click", function () {
                var msg = $(this).data();
                showInfoMsg(msg);
            })
        }

        function showInfoMsg(msg) {
            if (!msg.name || msg.name == "undefined") {
                msg.name = "";
            }
            if (!msg.tel || msg.tel == "undefined") {
                msg.tel = "";
            }
            var alertWords = '<div class="alertMsg">联系人：<span class="alertDetail">' + msg.name + '</span></div><br><div class="alertMsg">联系电话：<a href="tel:'+ msg.tel + '" class="alertDetail">'+ msg.tel +'</a></div>';
            $.alert(alertWords, "");
        }

        //无特殊信息模板
        function qianshouTemplate(data) {
            var html = '<li>' +
                '<div data-name="' + data.linkman + '" data-tel="' + data.tel + '" class="follow-theme">' + data.department + '</div>' +
                '</li>';
            return html;
        }

        //拒收特殊类型模板
        function jushouTemplate(data) {
            var html = '<li>' +
                '<div data-name="' + data.linkman + '" data-tel="' + data.tel + '" class="follow-theme">' + data.department + '</div>' +
                '<div class="follow-tip">' +
                '<p>' + data.reason + '</p>' +
                '</div>' +
                '</li>';
            return html;
        }
    }

    //渲染流程
    function initLiucheng(data) {
        var $liuchengxx = $("#liuchengxiangxi");		//实现办理流程信息追加
        var flowMsgList = data.data;
        var openInstanceNodeId = instance.curFlowInfo.curNodeID;
        var len = flowMsgList.length;
        for (var i = 0; i < len; i++) {
            /*追加流程第二版*/
            if (flowMsgList[i].isdo === "1") {
                if (i < len - 1) {
                    if (flowMsgList[i].cnodeid === openInstanceNodeId.toUpperCase() && parseInt(flowMsgList[i + 1].isdo)=== 0) {
                        $liuchengxx.append('<li class="process-now">'
                            + '<div class="process-icon"></div>'
                            + '<div class="process-show">'
                            + '<h1>' + flowMsgList[i].authorname + '</h1>'
                            + '<p>' + flowMsgList[i].nodename + '</p>'
                            + '</div>'
                            + '</li>');
                    } else {
                        $liuchengxx.append('<li class="process-already">'
                            + '<div class="process-icon"></div>'
                            + '<div class="process-show">'
                            + '<h1>' + flowMsgList[i].authorname + '</h1>'
                            + '<p>' + flowMsgList[i].nodename + '</p>'
                            + '</div>'
                            + '</li>');
                    }
                } else {
                    if (flowMsgList[i].cnodeid === openInstanceNodeId.toUpperCase()) {
                        $liuchengxx.append('<li class="process-now">'
                            + '<div class="process-icon"></div>'
                            + '<div class="process-show">'
                            + '<h1>' + flowMsgList[i].authorname + '</h1>'
                            + '<p>' + flowMsgList[i].nodename + '</p>'
                            + '</div>'
                            + '</li>');
                    } else {
                        $liuchengxx.append('<li class="process-already">'
                            + '<div class="process-icon"></div>'
                            + '<div class="process-show">'
                            + '<h1>' + flowMsgList[i].authorname + '</h1>'
                            + '<p>' + flowMsgList[i].nodename + '</p>'
                            + '</div>'
                            + '</li>');
                    }
                }
            } else {
                $liuchengxx.append('<li>'
                    + '<div class="process-icon"></div>'
                    + '<div class="process-show">'
                    + '<h1>' + flowMsgList[i].authorname + '</h1>'
                    + '<p>' + flowMsgList[i].nodename + '</p>'
                    + '</div>'
                    + '</li>');
            }
        }
    }

    //初始化便签贴
    function initBianQianTie(data) {
        if (data.isShow == false) {
            $("#bianqiantie_tab").remove();
            $("#bianqiantie_swiper").remove();
            return;
        }
        var data = data.data;
        if (!data.data || data.data.length < 1) {
            $("#bianqiantie_tab").remove();
            $("#bianqiantie_swiper").remove();
            return;
        }
        var NoteList = null;	//便签列表
        var $noteListGrid = $("#noteListGrid");//用于便签数据追加
        if (data.success === 1) {
            NoteList = data.data;
            for (var i = 0; i < NoteList.length; i++) {
                $noteListGrid.append('<li>'
                    + '<h1 class="note-theme">' + NoteList[i].name + '<span>' + NoteList[i].time + '</span></h1>'
                    + '<div class="note-show">'
                    + '<p>' + NoteList[i].content + '</p >'
                    + '</div>'
                    + '</li>');
            }
        } else {
            $.alert(data.message.errors);
        }
    }

    //初始化签发页
    function initQianFa(data) {

        if (data.isShow == false) {
            $("#qianfa_tab").remove();
            $("#qianfa_swiper").remove();
            return;
        }
        var qianfas = data.data.data;
        if (qianfas.result == "没有查询到数据" || qianfas.department == "") {
            $("#qianfa_tab").remove();
            $("#qianfa_swiper").remove();
            return;
        }
        $("#department").html(qianfas.department);//发文机关
        $("#type2").html(qianfas.type2);//公文种类
        $("#documentNo").html(qianfas.documentNo);//发文字号
        $("#doctype").html(qianfas.doctype);//公文类别
        $("#type1").html(qianfas.type1);//行文类别
        $("#sendTo").html(qianfas.sendTo); //主送机关
        $("#sendCC").html(qianfas.sendCC);// 抄报送
        $("#distributeDepartment").html(qianfas.distributeDepartment);// 印发部门
        $("#dissributeCount").html(qianfas.dissributeCount);// 印发份数
        $("#issueEmployee").html(qianfas.issueEmployee);//签发人
        $("#issueDate").html(qianfas.issueDate);	//签发日期
        $("#disributeDate").html(qianfas.disributeDate);	// 印发日期
        $("#publicType").html(qianfas.publicType);//公开方式
        $("#reply").html(qianfas.reply);// 需要回复
        $("#replyDate").html(qianfas.replyDate);//回复时限
    }

    //渲染意见栏
    function initYijian(arr) {
        //页面元素获取
        var $idea_btn = $('#idea_btn'),
            $idea_textarea = $('#idea_textarea'),
            $idea_sure = $('#idea_sure'),
            $idea_cancel = $('#idea_cancel');


        /*事件绑定*/
        $idea_btn.on('click', function (e) {
            var target = e.target,
                nodename = target.nodeName.toLowerCase(),
                $this = null,
                $li = null;

            /*过滤非标签*/
            if (nodename === 'p' || nodename === 'li' || nodename === 'ul') {
                return false;
            }


            if (nodename === 'span') {
                if (target.className.indexOf('theme-icon') !== -1) {
                    /*切换显示隐藏*/
                    $this = $(target);
                    $li = $this.parents('li');
                    $this.toggleClass('toggle-active');
                    $li.toggleClass('toggle-active');
                } else if (target.className.indexOf('download') !== -1) {
                    if (target.className.indexOf('toshow') !== -1) {
                        /*查看*/
                        console.log('查看');
                    } else {
                        /*下载*/
                        $this = $(target);
                        $this.addClass('toshow').html('查看');
                    }
                }

            } else if (nodename === 'h2' && target.className.indexOf('wx-labeltheme-wrap') !== -1) {
                /*切换显示隐藏*/
                $this = $(target).find('span');
                $li = $this.parents('li');
                $this.toggleClass('toggle-active');
                $li.toggleClass('toggle-active');
            } else if (nodename === 'div' && target.parentNode.className.indexOf('side-edit') !== -1) {
                /*切换发送*/
                $idea_textarea.toggleClass('g-d-hidei');
            }
        });

        /*确定，取消事件*/
        $.each([$idea_sure, $idea_cancel], function () {
            var own = this;
            this.on('click', function () {
                $idea_textarea.addClass('g-d-hidei');
            });
        })

        $("#yijian_div").on("click", ".yijian_show", function () {
            getDocFileUrl($(this).data().id, "0", docTitle_base, "");
        })

        if (arr && arr.length && arr.length > 0) {
            var index = 0;
            for (var i = arr.length - 1; i >= 0; i--) {
                if (arr[i].nodename == "拟稿" || arr[i].nodename == "核稿" || arr[i].nodename == "拟办" || arr[i].nodename == "分办") {
                    index = i;
                    break;
                }
            }
            if (index == 0) {
                $("#zhankaiyijian").addClass("g-d-hidei")
            }
            for (var i = 0; i < arr.length; i++) {
                if (i < index) {
                    $("#yijian_div .idea_li").append(yiJianTemplate(arr[i], false));
                } else {
                    $("#yijian_div .idea_li").append(yiJianTemplate(arr[i], true));
                }
            }
        } else {
            $("#idea_btn").addClass("g-d-hidei")
            $("#yijian_div").parent().addClass("wx-empty-panel wx-empty-document");
        }
    }

    //意见模板
    function yiJianTemplate(msg, isShow) {
        var html = '';
        if (isShow === true) {
            html += '<div class="mainshow">'
        } else {
            html += '<div>';
        }
        html += '<div class="main-info"><p>' + msg.opinion + '</p>';

        var arr = msg.attach;
        if (msg.attach && arr.length > 0) {
            html += '<ul>';
            for (var i = 0; i < arr.length; i++) {
                html += '<li>' + arr[i].file_name + '.' + arr[i].extention + '<span data-id="' + arr[i].id + '" class="yijian_show download toshow">查看</span></li>';
            }
            html += '</ul>';
        }
        html += '</div>' +
            '<div class="side-info">' +
            '<p><span>' + msg.deptname + '</span>' + msg.name + '</p>' +
            '<p>' + msg.created + '</p>' +
            '</div>' +
            '</div>'
        return html;
    }

    //渲染附件列表
    function initFujian(data) {
        var fujianArr = data.data.data.attachment
        if (fujianArr && fujianArr.length && fujianArr.length > 0) {
            isHaveFujian = true;
            for (var i = 0; i < fujianArr.length; i++) {
                $("#docDetailFujian").append(fujianTemplate(fujianArr[i].title, fujianArr[i].employees, fujianArr[i].uploadtime, fujianArr[i].id))
            }
        } else {
            $("#docDetailFujian").addClass("g-d-hidei")
        }
        //绑定附件点击事件
        $("#docDetailFujian").on("click", "li", function () {
            var data = $(this).data();
            getFJFileUrl(data.id, data.titel);
        });
        initGLXX();
    }

    //初始化关联信息
    function initGLXX() {
        var id = "";
        var curForms = instance.curFlowInfo.curForms;
        for (var i = 0; i < curForms.length; i++) {
            var curform = curForms[i];
            var name = curform.name;
            if (name == "表单" || name == "办文表单" || name == "呈批信息" || name == "会议信息") {
                id = curform.dataid;
            }
        }
        if (id != "") {
            getRelationsGW(id);
        }
    }

    //关联信息getRelationsGW
    function getRelationsGW(id) {
        var $guanlianxinxi = $("#guanlianxinxi");
        var guanlianList = null;
        $.ajax({
            url: "/ajax.sword?ctrl=WeixinDocDitalV2_getRelationsGW",
            dataType: "json",
            data: {
                "workid": id
            },
            success: function (data) {
                if (data.message.success === 1) {
                    guanlianList = data.message.data;
                    if (guanlianList && guanlianList.length < 1 && !isHaveFujian) {
                        $("#cankaoziliao_div").parent().addClass("wx-empty-panel wx-empty-document");
                        $("#cankaoziliao_div").addClass("g-d-hidei")
                    }
                $('<div class="wx-themelist-panel"><h2 class="wx-labeltheme-wrap g-bc-white g-gap-mt5 g-gap-mb5">关联信息</h2></div>').insertBefore($guanlianxinxi);
                    var guanl_str='';
                    for (var i = 0; i < guanlianList.length; i++) {
                        guanl_str+='<li>'
                            + '<div class="datalist-main">' + guanlianList[i].title + '</div>'
                            + '<div class="datalist-side">'
                            + '<div><span>操作：</span>取消关联</div>'
                            + '<div><span>编号：</span>' + guanlianList[i].code + '</div>'
                            + '</div>'
                            + '</li>';
                    }
                    $guanlianxinxi.append(guanl_str);
                } else {
                    if (!isHaveFujian) {
                        $("#cankaoziliao_div").parent().addClass("wx-empty-panel wx-empty-document");
                        $("#cankaoziliao_div").addClass("g-d-hidei")
                    }
                }
            }
        });
    }

    //附件模板
    function fujianTemplate(titel, name, time, id) {
        var html = '<li data-id="' + id + '" data-titel="' + titel + '">' +
            '<div class="wx-labelshow">' +
            '<div class="label-showinline"><span class="label-icon label-icon-download"></span><p>' + titel + '</p></div>' +
            '<div><span>上传人：</span>' + name + '</div>' +
            '<div><span>上传时间：</span>' + formatTime(time) + '</div>' +
            '</div>' +
            '</li>';
        return html;
    }

    //渲染办理信息
    function initBanliXinxi(data) {
        var $banlixinxiGrid = $("#banlixinxiGrid");  	//用于办理信息列表信息追加
        var proInfoList = data.data;

        if (proInfoList && proInfoList.length < 1) {
            $("#banlixinxi_div").parent().addClass("wx-empty-panel wx-empty-document");
            $("#banlixinxi_div").addClass("g-d-hidei")
            return;
        }
        pullRefresh();

        banliRender(proInfoList);

        //下拉刷新
        function pullRefresh() {
            //下拉刷新需要的全局变量
            var isScrollLeft = false;//判断是否有信息处于最左端状态
            var isScroll = false;//判断是否有信息处于左划状态
            var initX = 0;//起始X坐标
            var initY = 0;//起始Y坐标
            var endX = 0;//结束X坐标
            var endY = 0;//结束Y坐标
            var isLock = false;//是否锁定整个操作
            var isCanDo = true;//是否移动滑块
            var mutiChecked = false;//是否处于选择框弹出状态

            var $container = "<div id='container' class='scroller'></div>";
            var $loading = "<div class='loading2'>下拉刷新数据</div>";
            $("#banlixinxiGrid").wrap($container);
            $("#container").prepend($loading);
            var slide = function (option) {
                var defaults = {
                    container: '',
                    next: function () {
                    }
                };
                var length,
                    isStart = false,
                    isMove = false,
                    isTop = false,//是否在顶端
                    isTouchPad = (/hp-tablet/gi).test(navigator.appVersion),
                    hasTouch = 'ontouchstart' in window && !isTouchPad;
                var obj = document.querySelector(option.container);
                loading = obj.firstElementChild;
                var offset = loading.clientHeight;
                var objparent = obj.parentElement;
                /*操作方法*/
                var fn =
                    {
                        //移动容器
                        translate: function (diff) {
                            obj.style.webkitTransform = 'translate3d(0,' + diff + 'px,0)';
                            obj.style.transform = 'translate3d(0,' + diff + 'px,0)';
                        },
                        //设置效果时间
                        setTransition: function (time) {
                            obj.style.webkitTransition = 'all ' + time + 's';
                            obj.style.transition = 'all ' + time + 's';
                        },
                        //返回到初始位置
                        back: function () {
                            fn.translate(0 - offset);
                            //标识操作完成
                            isLock = false;
                            isStart = false;
                        },
                        addEvent: function (element, event_name, event_fn) {
                            if (element.addEventListener) {
                                element.addEventListener(event_name, event_fn, false);
                            } else if (element.attachEvent) {
                                element.attachEvent('on' + event_name, event_fn);
                            } else {
                                element['on' + event_name] = event_fn;
                            }
                        }
                    };
                fn.translate(0 - offset);
                fn.addEvent(obj, 'touchstart', start);
                fn.addEvent(obj, 'touchmove', move);
                fn.addEvent(obj, 'touchend', end);
                fn.addEvent(obj, 'mousedown', start)
                fn.addEvent(obj, 'mousemove', move)
                fn.addEvent(obj, 'mouseup', end)

                //滑动开始
                function start(e) {
                    isTop = $("#banlixinxiGrid").offset().top == $("#titleBar").height() ? true : false;
                    if (objparent.scrollTop <= 0 && isCanDo && !isStart) {
                        var even = typeof event == "undefined" ? e : event;
                        isStart = true;
                        isMove = true;
                        //保存当前鼠标Y坐标
                        initY = even.touches ? even.touches[0].pageY : even.pageY;
                        endY = even.touches ? even.touches[0].pageY : even.pageY;
                        //消除滑块动画时间
                        fn.setTransition(0);
                        loading.innerHTML = "↓下拉刷新数据";
                    }
                    return false;
                }

                //滑动中
                function move(e) {
                    if (objparent.scrollTop <= 0 && isCanDo && isMove) {
                        var even = typeof event == "undefined" ? e : event;
                        //保存当前鼠标Y坐标
                        /*endY = hasTouch ? even.touches[0].pageY : even.pageY;*/
                        endY = even.touches ? even.touches[0].pageY : even.pageY;
                        if (initY < endY) {
                            even.preventDefault();
                            //消除滑块动画时间
                            fn.setTransition(0);
                            //移动滑块
                            isLock = true;
                            if ((endY - initY - offset) / 2 <= 300) {
                                length = (endY - initY - offset) / 2;
                                if (endY - initY > offset && !isScroll && !mutiChecked && !isScrollLeft) {
                                    fn.translate(length);
                                }
                                if (endY - initY > 60) {
                                    loading.innerHTML = "↑ 释放立即刷新";
                                }
                            }
                            else {
                                length += 0.3;
                                fn.translate(length);
                            }
                        }
                    }
                }

                //滑动结束
                function end(e) {
                    if (isCanDo && isMove) {
                        isMove = false;
                        //判断滑动距离是否大于等于指定值
                        if (endY - initY > 60 && !isScroll && !mutiChecked) {
                            //设置滑块回弹时间
                            fn.setTransition(0.5);
                            //保留提示部分
                            fn.translate(0);
                            //执行回调函数
                            loading.innerHTML = "正在刷新数据...";
                            if (typeof option.next == "function") {
                                option.next.call(fn, e);
                            }
                        } else {
                            //返回初始状态
                            fn.back();
                        }
                        return false;
                    }
                }
            };
            slide({
                container: "#container", next: function (e) {
                    //松手之后执行逻辑,ajax请求数据，数据返回后隐藏加载中提示
                    var that = this;
                    setTimeout(function () {
                        $.ajax({
                            url: "/ajax.sword?ctrl=WeixinDocDitalV2_getProInfo",	//获取部门下对应人员
                            type: "get",
                            dataType: "json",
                            data: {
                                workId: hashData.workId
                            },
                            success: function (data) {
                                if (data.message.success === 1) {
                                    $("#banlixinxiGrid").children().remove();
                                    proInfoList = data.message.data;
                                    if (proInfoList.length < 1) {
                                        $("#banlixinxi_div").parent().addClass("wx-empty-panel wx-empty-document");
                                        $("#banlixinxi_div").addClass("g-d-hidei")
                                        // $("#banlixinxiGrid").append('<div class="noData">暂无数据!</div>');
                                        scollif = false;
                                    } else {
                                        banliRender(proInfoList);
                                        scollif = true;
                                    }
                                    loading.innerHTML = "刷新成功！";
                                    setTimeout(function () {
                                        that.back.call();
                                    }, 500);
                                } else if (res.message.success == 0) {
                                    loading.innerHTML = "刷新失败！";
                                    setTimeout(function () {
                                        that.back.call();
                                    }, 500);
                                }
                            },
                            error: function (res) {
                                $.alert("当前网络信号较差或无网络连接，请您检查网络设置！", function () {
                                    location.reload();
                                });
                            }
                        });
                    }, 500);
                }
            });
            return false;
        }
    }

    function banliRender(proInfoList) {
        var $banlixinxiGrid = $("#banlixinxiGrid");
        var handle_str='';
        for (var i = 0; i < proInfoList.length; i++) {
            var dotime = null;
            if (i === proInfoList.length - 1) {
                dotime = timeFn(proInfoList[i].startTime, proInfoList[i].endTime);
            } else {
                dotime = timeFn(proInfoList[i].starttime, proInfoList[i].endTime);
            }
            if(i===0){
                handle_str+='<li class="g-gap-mt5" data-title="'+proInfoList[i].action+'">' +
                    '<div class="main">' +proInfoList[i].name + '</div>' +
                    '<div class="side">' +
                    '<p><span>送达时间：</span>'+proInfoList[i].endTime+'</p>' +
                    '</div>' +
                    '<div class="side">' +
                    '<p><span>办理时长：</span>'+dotime+'</p></div>' +
                    '</li>';
            }else{
                handle_str+='<li data-title="'+proInfoList[i].action+'">' +
                    '<div class="main">' +proInfoList[i].name + '</div>' +
                    '<div class="side">' +
                    '<p><span>送达时间：</span>'+proInfoList[i].endTime+'</p>' +
                    '</div>' +
                    '<div class="side">' +
                    '<p><span>办理时长：</span>'+dotime+'</p></div>' +
                    '</li>';
            }
        }
        $banlixinxiGrid.append(handle_str);
    }

    //计算办理时长
    function timeFn(d1, d2) {//d1,d2作为一个变量传进来
        var dtime = null;
        //如果时间格式是正确的，那下面这一步转化时间格式就可以不用了
        var dateBegin = new Date(d1.replace(/-/g, "/"));//将-转化为/，使用new Date
        var dateEnd = new Date(d2.replace(/-/g, "/"));//获取当前时间
        var dateDiff = dateEnd.getTime() - dateBegin.getTime();//时间差的毫秒数
        var day = Math.floor(dateDiff / (24 * 3600 * 1000));//计算出相差天数
        var leave1 = dateDiff % (24 * 3600 * 1000);   //计算天数后剩余的毫秒数
        var hours = Math.floor(leave1 / (3600 * 1000));//计算出小时数
        //计算相差分钟数
        var leave2 = leave1 % (3600 * 1000);    //计算小时数后剩余的毫秒数
        var minutes = Math.floor(leave2 / (60 * 1000));//计算相差分钟数
        dtime = day + "天" + hours + "小时" + minutes + "分";
        return dtime;
    }

    //判断是否直接预览文件
    function isOpenFile() {
        var is = $("#zhengwen_tab").hasClass("active");
        if (is === true && showDocTime < 1) {
            showDocTime++;
            getDocFileUrl(hashData.workId, hashData.type, docTitle_base);
        } else {
            $.hideLoading();
        }
    }

    //获取文档正文下载地址
    function getDocFileUrl(workId, type, titel, fileType) {
        $.showLoading("努力加载中...");
        // 获取文件下载路径
        $.ajax({
            url: "/ajax.sword?ctrl=WeixinDocDitalV2_getDocFilePath",
            dataType: "json",
            data: {
                "workId": workId,
                "docType": type,
                "fileType": fileType
            },
            success: function (data) {
                var fileData = data.message.data;
                $.hideLoading();
                if (data.message.success !== 1) {
                    $.alert("获取文件失败！", "提示");
                    return;
                }
                wx.invoke("previewFile", {
                    url: fileData.filepath, // 需要预览文件的地址(必填，可以使用相对路径)
                    // name: titel, // 需要预览文件的文件名(不填的话取url的最后部分)
                    // size: 9732096 // 需要预览文件的字节大小(必填)
                    name: "",
                    size: fileData.filesize
                });
            }
        });
    }

    //获取附件下载地址
    function getFJFileUrl(workId, titel) {
        $.showLoading("努力加载中...");
        // 获取文件下载路径
        $.ajax({
            url: "/ajax.sword?ctrl=WeixinDocDitalV2_getFJFileUrl",
            dataType: "json",
            data: {
                "workId": workId
            },
            success: function (data) {
                var fileData = data.message.data;
                $.hideLoading();
                if (data.message.success !== 1) {
                    $.alert("获取文件失败！", "提示");
                    return;
                }
                wx.invoke("previewFile", {
                    url: fileData.filepath, // 需要预览文件的地址(必填，可以使用相对路径)
                    // name: titel, // 需要预览文件的文件名(不填的话取url的最后部分)
                    // size: 9732096 // 需要预览文件的字节大小(必填)
                    name: "",
                    size: fileData.filesize
                });
            }
        });
    }

    //时间格式化
    function formatTime(time) {
        if (time && time.length > 19) {
            time = time.substr(0, 19);
        }
        return time;
    }

    return init;
})