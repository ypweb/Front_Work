/**
 * Created by Administrator on 2018/7/30.
 */
define(["util"], function (Util) {

    //传参
    var hashData = {}

    //初始化
    function init() {
        $.ajax({
            url: "/ajax.sword?ctrl=WeixinDocDital_getReturnMsg",
            dataType: "json",
            success: function (data) {
                if (data.message.returnReason.success !== 1) {
                    $.alert("获取页面失败，请联系管理员！");
                    return;
                } else if (data.message.returnType.success !== 1) {
                    $.alert("获取页面失败，请联系管理员！");
                    return;
                }
                var returnTypeList = data.message.returnType.data;
                var returnReasonList = data.message.returnReason.data;
                showReturnType(returnTypeList);
                showReturnReason(returnReasonList);
                removeHide();
            }
        });
        hashData = Util.getHashData();
        bindTypeActive();
        bindYuanyinActive();
        bindTijiao();
    }

    //渲染退文类型
    function showReturnType(list) {
        for (var i = 0; i < list.length; i++) {
            $(".waitdoc-fromMsg-ul").append('<li><div>' + list[i] + '</div></li>');
        }
    }

    //渲染退文原因
    function showReturnReason(list) {
        for (var i = 0; i < list.length; i++) {
            $(".btn-Reason-ul").append('<li><div>' + list[i] + '</div></li>');
        }
    }

    //删除隐藏样式
    function removeHide() {
        $(".g-d-hidei").removeClass("g-d-hidei");
        $.hideLoading();
    }

    //绑定退文类型点击事件
    function bindTypeActive() {
        $(".waitdoc-fromMsg").on("click", "li", function () {
            $(".waitdoc-fromMsg .wx-btnlist-active").removeClass("wx-btnlist-active");
            $(this).addClass("wx-btnlist-active");
        })
    }

    //绑定退文原因点击事件
    function bindYuanyinActive() {
        $(".btn-Reason-ul").on("click", "li", function () {
            if ($(this).hasClass("wx-btnlist-active") == true) {
                $(this).removeClass("wx-btnlist-active");
            } else {
                $(this).addClass("wx-btnlist-active");
            }
        })
    }

    //绑定提交和取消按钮点击事件
    function bindTijiao() {
        $("#returnDocY").on("click", function () {
            returnDoc();
        });
        $("#returnDocN").on("click", function () {
            window.history.go(-1);
        });
    }

    //退文接口
    function returnDoc() {
        var returnType = $(".waitdoc-fromMsg .wx-btnlist-active div").html();
        var reasonArr = $(".btn-Reason .wx-btnlist-active div");
        var check = $('input[name="kaohe"]:checked').val();
        var reason = "";
        for (var i = 0; i < reasonArr.length; i++) {
            if (i == 0) {
                reason += $(reasonArr[i]).html();
            } else {
                reason += "<br/>" + $(reasonArr[i]).html();
            }
        }
        if (!returnType) {
            $.toast("请选择退文分类！", 1000);
            return;
        }
        if (!reason) {
            $.toast("请选择退文原因！", 1000);
            return;
        }
        var datas = {
            "id": hashData.workId,
            "reason": reason,
            "returnType": returnType,
            "check": "",
            "swid": "",
            "workId": "",
            "curNodeName": "",
            "userId": hashData.userId
        }

        /*id:登录人的id
         reason:退文原因
         returnType：退文类型
         check:是否绩效考核
         swid:空值
         workId:文件的实例id
         curNodeName:当前的办理节点id
         userId：登录人的id*/
        $.ajax({
            url: "/ajax.sword?ctrl=WeixinDocDital_returnDoc",
            // type: "post",
            dataType: "json",
            data: datas,
            success: function (data) {
                // console.log(data)
                if (data.message.success == 1) {
                    $.toast("退文成功！", 1000, function () {
                        window.history.go(-2);
                    });
                } else {
                    $.alert("退文失败！")
                }
            }
        });
    }

    return init;
})
