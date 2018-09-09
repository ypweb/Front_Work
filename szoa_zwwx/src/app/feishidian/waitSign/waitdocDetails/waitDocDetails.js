/**
 * Created by Administrator on 2018/7/28.
 */
define(["util", "UrlBase", "Swiper"], function (Util, UrlBase) {

    //传参
    var hashData = {};
    var userInfo = {};
    //页面标题
    var docTitle_base = "";
    //正文自动打开次数
    var showDocTime = 0;

    //初始化
    function init() {
        Util.getUserInfoAndUrl({
            whenSuccess: function (user, hash) {
                hashData = hash;
                userInfo = user;
                initSwiper();
                if (hashData.pushMes == "1") {
                    hashData.workId = getWorkId();
                }
                getDocDetail();
                //绑定签收和退文按钮点击事件
                $("#qianshouDOC").on("click", function () {
                    signAndDistribute();
                })
                $("#tuiwenDOC").on("click", function () {
                    var param = "workId=" + hashData.workId + "," + "type=" + hashData.type + "," + "userId=" + userInfo.id;
                    var url = UrlBase.URL_TUIWEN + "#" + param;
                    window.location.href = url;
                })
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
    }

    //如果是系统推送消息进入页面，需要从新获取workid
    function getWorkId() {
        var workid = "";
        $.ajax({
            url: "/ajax.sword?ctrl=WeixinDocDital_getJhgzInfo",
            dataType: "json",
            async: false,
            data: {
                "id": hashData.workId,
                "userid": userInfo.id
            },
            success: function (data) {
                workid = data.message.data[0].id
            }
        })
        return workid;
    }

    //是否直接打开正文
    function isOpenFile() {
        var is = $("#zhengwen_tab").hasClass("active");
        if (is == true && showDocTime < 1) {
            showDocTime++;
            getDocFileUrl(hashData.workId, hashData.type, docTitle_base);
        } else {
            $.hideLoading();
        }
    }

    //初始化滑动
    function initSwiper() {
        var tabsSwiper = new Swiper('.swiper-container', {
            speed: 500,
            onSlideChangeStart: function () {
                $(".tabs .active").removeClass('active');
                $(".tabs a").eq(tabsSwiper.activeIndex).addClass('active');
            },
            onSlideChangeEnd: function () {
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

    //获取页面详情信息
    function getDocDetail() {
        //console.log(hashData)
        $.ajax({
            url: "/ajax.sword?ctrl=WeixinDocDital_docDetail",
            dataType: "json",
            data: {
                "id": hashData.workId,
                "userid": userInfo.id,
                "type": hashData.type
            },
            success: function (data) {
                console.log(data)
                if (data.message.docJson.success != 1) {
                    $.alert("页面走丢了！", "提示");
                    $.hideLoading();
                    window.history.go(-1);
                    return;
                }
                if (data.message.isJson.data.flag == true) {
                    $("#qstw_btn").addClass("g-d-hidei");
                }
                //console.log(data)
                var docData = data.message.docJson.data;
                var fujianArr = docData.attachment;
                docTitle_base = docData.title;
                bindDocZhengwen();
                bindFujian();
                //渲染附件
                for (var i = 0; i < fujianArr.length; i++) {
                    $("#docDetailFujian").append(template(fujianArr[i].title, fujianArr[i].employees, fujianArr[i].uploadtime, fujianArr[i].id))
                }
                //渲染标题
                document.title = docData.title;
                //渲染页面信息
                $("#unitname").append(docData.receivedinfo.unitname);
                $("#documentNo").append(docData.receivedinfo.documentNo);
                $("#employee").append(docData.receivedinfo.employee);
                $("#priority").append(docData.receivedinfo.priority);
                $("#SdocumentNo").append(docData.documentNo);
                removeHide();
            }
        });
    }

    //删除所有隐藏样式
    function removeHide() {
        $("#zhengwen_div").removeClass("g-d-hidei");
        $("#docDetailFujian").removeClass("g-d-hidei");
        $("#laiwen_div").removeClass("g-d-hidei");
        $.hideLoading();
    }

    //绑定附件点击事件
    function bindFujian() {
        $("#docDetailFujian").on("click", "li", function () {
            var data = $(this).data();
            //console.log(data)
            getFJFileUrl(data.id, data.titel)
        })
    }

    //绑定正文点击事件
    function bindDocZhengwen() {
        $("#zhengwen_div").on("click", function () {
            getDocFileUrl(hashData.workId, hashData.type, docTitle_base)
        })
    }

    //获取正文下载地址
    function getDocFileUrl(workId, type, titel) {
        $.hideLoading();
        $.showLoading("努力加载中...");
        // 获取文件下载路径
        $.ajax({
            url: "/ajax.sword?ctrl=WeixinDocDital_getDocFilePath",
            dataType: "json",
            data: {
                "workId": workId,
                "docType": type,
            },
            success: function (data) {
                var fileData = data.message.data;
                console.log(fileData)
                $.hideLoading();
                if (data.message.success == 1) {
                    var filePath=fileData.filepath;
                    var fix=filePath.substring(filePath.lastIndexOf("."));
                    var fixx=docTitle_base+fix
                    wx.invoke("previewFile", {
                        url: fileData.filepath, // 需要预览文件的地址(必填，可以使用相对路径)
                        name: fixx, // 需要预览文件的文件名(不填的话取url的最后部分)
                        // size: 9732096 // 需要预览文件的字节大小(必填)
                        // name: "",
                        size: fileData.filesize
                    });
                } else {
                    $.alert("获取文件失败！", "");
                }
            }
        });
    }

    //签收接口
    function signAndDistribute() {
        var val = $('input[name="docType"]:checked').val();
        //console.log(val)
        $.ajax({
            url: "/ajax.sword?ctrl=WeixinDocDital_signAndDistribute",
            dataType: "json",
            data: {
                "jhgzId": hashData.workId,
                "userid": userInfo.id,
                "type": val,
                "employee": "",
                "suggestion": "",
                "action": "2"
            },
            success: function (data) {
                if (!data.message || data.message.success != 1) {
                    $.alert("签收失败！")
                } else {
                    $.toast("签收成功！", 1000, function () {
                        if (hashData.pushMes && hashData.pushMes == "1") {
                            window.location.reload();
                        } else {
                            window.history.go(-1);
                        }
                    });
                }
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
                "workId": workId,
            },
            success: function (data) {
                var fileData = data.message.data;
                $.hideLoading();
                if (data.message.success != 1) {
                    $.alert("获取文件失败！")
                }
                var filePath=fileData.filepath;
                var fix=filePath.substring(filePath.lastIndexOf("."));
                var fixx=titel+fix;
                wx.invoke("previewFile", {
                    url: fileData.filepath, // 需要预览文件的地址(必填，可以使用相对路径)
                    name: fixx, // 需要预览文件的文件名(不填的话取url的最后部分)
                    // size: 9732096 // 需要预览文件的字节大小(必填)
                    // name: "",
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

    //格式化时间
    function formatTime(time) {
        if (time && time.length > 19) {
            time = time.substr(0, 19);
        }
        return time;
    }

    return init;
})
