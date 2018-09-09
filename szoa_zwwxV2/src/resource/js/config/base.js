define(["WX","Config","weuiJS"], function (wx) {

    window.wx = wx;

    $.ajax({
        url: "/ajax.sword?ctrl=WeixinSDKV2_getSDKSignature",
        async: false,
        data: {
            "url": window.location.href
        },
        dataType: "json",
        success: function (data) {
            // console.log(data)
            var json = data.message;
            wx.config({
                beta: true,// 必须这么写，否则wx.invoke调用形式的jsapi会有问题
                debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: json.corpid, // 必填，企业微信的corpID
                timestamp: json.timestamp, // 必填，生成签名的时间戳
                nonceStr: json.noncestr, // 必填，生成签名的随机串
                signature: json.signature,// 必填，签名，见附录1
                jsApiList: ['chooseImage', 'previewFile', "hideOptionMenu", "shareAppMessage", "onMenuShareAppMessage","showWatermark","hideWatermark"]
                // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
            });
            //正式部署用
            /*var json = data.message;
            wx.config({
                 beta: true,// 必须这么写，否则wx.invoke调用形式的jsapi会有问题
                 debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                 appId: json.appId, // 必填，企业微信的corpID
                 timestamp: parseInt(json.timestamp), // 必填，生成签名的时间戳
                 nonceStr: json.nonceStr, // 必填，生成签名的随机串
                 signature: json.signature,// 必填，签名，见附录1
                 jsApiList: [ 'chooseImage','previewFile',"hideOptionMenu","shareAppMessage","onMenuShareAppMessage","showWatermark","hideWatermark"]
                 // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
            });*/
            wx.ready(function () {
                wx.checkJsApi({
                    jsApiList: ['chooseImage', 'openEnterpriseChat', 'previewFile', "hideOptionMenu", "shareAppMessage", "onMenuShareAppMessage", 'onHistoryBack',"showWatermark","hideWatermark"], // 需要检测的JS接口列表，所有JS接口列表见附录2,
                    success: function (res) {
                        // 以键值对的形式返回，可用的api值true，不可用为false
                        // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
                    }
                });
                wx.hideOptionMenu();
                wx.showMenuItems({
                    menuList: ["menuItem:favorite"]
                }); 
                wx.invoke("showWatermark",{},function(res) {
                    //打开页面水印
                });
            });
        }
    });
})