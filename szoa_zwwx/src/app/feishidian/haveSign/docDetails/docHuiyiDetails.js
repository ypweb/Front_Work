/**
 * Created by Administrator on 2018/7/28.
 */
define(["util", "UrlBase", "Swiper"], function (Util, UrlBase) {

    //传参
    var hashData = {};
    var userInfo = {};

    //页面title
    var docTitle_base = "";
    //打开正文次数
    var showDocTime = 0;

    //初始化方法
    function init() {
        Util.getUserInfoAndUrl({
            whenSuccess: function (user, hash) {
                hashData = hash;
                userInfo = user;
                notifyValidate();
                initSwiper();
                getDocDetail();
            },
            whenUserError: function (resultObj) {
                $.alert(resultObj.errorMsg, function () {
                    window.history.go(-1);
                })
            },
            whenZFError: function (resultObj) {
                $.alert(resultObj.errorMsg, function () {
                    wx.closeWindow();
                })
            }
        });

        /*// hashData = Util.getHashData();
         var userInfo = Util.getParams("login_userInfo");
         if (userInfo && userInfo != null) {
         unitId = userInfo.unitId;
         }
         if (hashData.isZF && hashData.isZF == "1") {
         if (!unitId || unitId == "undefined" || unitId == "") {
         $.alert("未获取到您的用户信息，请先打开工作台！");
         $.hideLoading();
         return;
         }
         if (hashData.unitId && hashData.unitId != unitId) {
         $.alert("非本单位人员不允许查看报名信息！");
         $.hideLoading();
         return;
         }
         }

         if (!userInfo.id || userInfo.id == "") {
         if (hashData.unitId && hashData.unitId != "") {
         var loginId = Util.getParams("login_id");
         if (loginId && loginId != "" && loginId != null) {
         userInfo.id = loginId;
         } else {
         $.alert("未获取到您的用户信息，请从工作台中的办公系统查看您的待签收信息！");
         $.hideLoading();
         return;
         }
         } else {
         $.alert("未获取到您的用户信息！", function () {
         window.history.go(-1);
         });
         }
         }*/

    }

    //初始化滑动切换页面
    function initSwiper() {
        var tabsSwiper = new Swiper('.swiper-container', {
            speed: 500,
            onSlideChangeStart: function () {
                $(".tabs .active").removeClass('active');
                $(".tabs a").eq(tabsSwiper.activeIndex).addClass('active');
            },
            onSlideChangeEnd: function () {
                //滑动操作完成，判断是否打开文件
                isOpenFile();
            }
        });

        $(".tabs a").on('touchstart mousedown', function (e) {
            e.preventDefault()
            $(".tabs .active").removeClass('active');
            $(this).addClass('active');
            tabsSwiper.swipeTo($(this).index());
        });

        $(".tabs a").click(function (e) {
            e.preventDefault();
        });
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

    //获取公文详情信息
    function getDocDetail() {
        $.ajax({
            url: "/ajax.sword?ctrl=WeixinDocDital_getDfbInfo",
            dataType: "json",
            data: {
                "id": hashData.workId,
                "type": hashData.type
            },
            success: function (data) {
                var docData = data.message.data;
                if (data.message.success != 1) {
                    $.alert("页面走丢了！", "提示");
                    $.hideLoading();
                    return;
                }
                meetEnrollInfo(docData.swid);
                var fujianArr = docData.attachment;
                docTitle_base = docData.title;
                //绑定各个点击事件
                bindDocZhengwen();
                bindFujian();
                bindBaomingBtn(docData.swid);
                //渲染附件
                for (var i = 0; i < fujianArr.length; i++) {
                    $("#docDetailFujian").append(template(fujianArr[i].title, fujianArr[i].employees, fujianArr[i].uploadtime, fujianArr[i].id))
                }
                //渲染标题
                document.title = docData.title;
                //渲染表单信息
                $("#unitname").append(docData.receivedinfo.unitname);
                $("#documentNo").append(docData.receivedinfo.documentNo);
                $("#employee").append(docData.receivedinfo.employee);
                $("#priority").append(docData.receivedinfo.priority);
                $("#SdocumentNo").append(docData.documentNo);
                removeHide();
                initZhuanfa();
            }
        });
    }

    function initZhuanfa() {
        Util.initZhuanfa({
            data: {
                "workId": hashData.workId,
                "type": hashData.type,
                "unitId": userInfo.unitId
            },//http://m2151430a2.imwork.net:23490//10.248.79.80:7005//10.248.79.146:7005
            link: UrlBase.URL_SHARE_HUIYI,
            title: docTitle_base,
            imgUrl: UrlBase.URL_IMG_BAOMING,
            desc: docTitle_base,
            success: function () {
            },
            cancel: function () {
            }
        });
    }

    //获取会议报名列表
    function meetEnrollInfo(swid) {
        $.ajax({
            url: "/ajax.sword?ctrl=WeixinDocDital_meetEnrollInfo",
            dataType: "json",
            data: {
                "meetId": swid,
                "type": hashData.type,
                "userId": userInfo.id
            },
            success: function (data) {
                var list = data.message.data;
                if (list && list.length && list.length > 0) {
                    for (var i = 0; i < list.length; i++) {
                        $("#huiyibaoming_div").append(meetTenplate(list[i]))
                    }
                    $("#baomingbiao_ul").removeClass("g-d-hidei")
                }
                //绑定修改按钮事件
                $("#huiyibaoming_div").on("click", ".theme-icon-edit", function () {
                    var param = $(this).data().param;
                    var url = UrlBase.URL_EDIT_BAOMING + "#" + param;
                    window.location.href = url;
                });
            }
        });
    }

    //删除所有隐藏样式
    function removeHide() {
        $("#zhengwen_div").removeClass("g-d-hide");
        $("#docDetailFujian").removeClass("g-d-hide");
        $("#laiwen_div").removeClass("g-d-hide");
        $(".wx-tablist-item3").removeClass("g-d-hidei");
        isOpenFile();
    }

    function notifyValidate() {
        $.ajax({
            url: "/ajax.sword?ctrl=WeixinDocDital_notifyValidate",
            dataType: "json",
            data: {
                "workid": hashData.workId
            },
            success: function (data) {
                var rul = data.message.data;
                if (rul && rul.result && rul.result == "true") {
                    $(".wx-tool-lb-wrap").removeClass("g-d-hide");
                } else {
                    $("#is_tab").html("表单")
                }
            }
        });
    }

    //绑定附件点击事件
    function bindFujian() {
        $("#docDetailFujian").on("click", "li", function () {
            var data = $(this).data();
            getFJFileUrl(data.id, data.titel);
        });
    }

    //绑定文件正文点击事件
    function bindDocZhengwen() {
        $("#zhengwen_div").on("click", function () {
            getDocFileUrl(hashData.workId, hashData.type, docTitle_base);
        });
    }

    //绑定报名按钮点击事件
    function bindBaomingBtn(swid) {
        $(".tool-menu-meeting").on("click", function () {
            var url = UrlBase.URL_ADD_BAOMING + "#";
            var param = "swid=" + swid + ",userId=" + userInfo.id;
            window.location.href = url + param;
        });
    }

    //获取文档正文下载地址
    function getDocFileUrl(workId, type, titel) {
        $.showLoading("努力加载中...");
        // 获取文件下载路径
        $.ajax({
            url: "/ajax.sword?ctrl=WeixinDocDital_getDocFilePath",
            // type: "post",
            dataType: "json",
            data: {
                "workId": workId,
                "docType": type
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
            url: "/ajax.sword?ctrl=WeixinDocDital_getFJFileUrl",
            // type: "post",
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

    //附件模板
    function template(titel, name, time, id) {
        var html = '<li data-id="' + id + '" data-titel="' + titel + '">' +
            '<div class="wx-labelshow">' +
            '<div class="label-showinline"><span class="label-icon label-icon-download"></span><p>' + titel + '</p></div>' +
            '<div><span>上传人：</span>' + name + '</div>' +
            '<div><span>上传时间：</span>' + formatTime(time) + '</div>' +
            '</div>' +
            '</li>';
        return html;
    }

    //时间格式化
    function formatTime(time) {
        if (time && time.length > 19) {
            time = time.substr(0, 19);
        }
        return time;
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

    return init;
});