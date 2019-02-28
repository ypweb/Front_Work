/**
 * Created by zhuhao on 2018/8/14.
 */
define([], function () {

    function initAll(hashData, userInfo, instance, fun) {
        $.ajax({
            url: "/ajax.sword?ctrl=WXDaiBanDocDital_getAllData",
            dataType: "json",
            async: true,
            data: {
                "userid": userInfo.id,
                "type": hashData.type,
                "userName": userInfo.truename,
                "workid": hashData.workId,
                "trackid": hashData.trackId,
                "flowid": instance.curFlowInfo.flowId,
                "isLeader": userInfo.isLeader,
                "curNodeID": instance.curFlowInfo.curNodeID
            },
            success: function (data) {
                var dataStr = data.message;
                var allData = JSON.parse(dataStr);
                fun(allData);
            }
        });
    }

    function eachAll(hashData, userInfo, instance, fun) {
        var allData = {};
        var resTime = 0;

        initYijian();
        initZhengwen();
        liuchengAndQianfa();
        initBianqiantie();
        initBiaodan();
        initBanlixinxi();
        initFankuixinxi();

        function initYijian() {
            $.ajax({
                url: "/ajax.sword?ctrl=WXDaiBanDocDital_yijian",
                dataType: "json",
                async: true,
                data: {
                    "userid": userInfo.id,
                    "workid": hashData.workId,
                    "flowid": instance.curFlowInfo.flowId
                },
                success: function (data) {
                    //console.log(data)
                    resTime++;
                    $.extend(allData, data.message);
                    if (resTime == 7) {
                        fun(allData)
                    }
                }
            });
        }

        function initZhengwen() {
            $.ajax({
                url: "/ajax.sword?ctrl=WXDaiBanDocDital_zhengWen",
                dataType: "json",
                async: true,
                data: {
                    "type": hashData.type,
                    "workid": hashData.workId
                },
                success: function (data) {
                    //console.log(data)
                    resTime++;
                    $.extend(allData, data.message);
                    if (resTime == 7) {
                        fun(allData)
                    }
                }
            });
        }

        function liuchengAndQianfa() {
            $.ajax({
                url: "/ajax.sword?ctrl=WXDaiBanDocDital_liuchengAndQianfa",
                dataType: "json",
                async: true,
                data: {
                    "workid": hashData.workId,
                    "curNodeID": instance.curFlowInfo.curNodeID
                },
                success: function (data) {
                    //console.log(data)
                    resTime++;
                    $.extend(allData, data.message.liucheng);
                    $.extend(allData, data.message.qianfa);
                    if (resTime == 7) {
                        fun(allData)
                    }
                }
            });
        }

        function initBianqiantie() {
            $.ajax({
                url: "/ajax.sword?ctrl=WXDaiBanDocDital_bianqiantie",
                dataType: "json",
                async: true,
                data: {
                    "userid": userInfo.id,
                    "workid": hashData.workId,
                    "isLeader": userInfo.isLeader
                },
                success: function (data) {
                    //console.log(data)
                    resTime++;
                    $.extend(allData, data.message);
                    if (resTime == 7) {
                        fun(allData)
                    }
                }
            });
        }

        function initBiaodan() {
            $.ajax({
                url: "/ajax.sword?ctrl=WXDaiBanDocDital_biaodan",
                dataType: "json",
                async: true,
                data: {
                    "userid": userInfo.id,
                    "type": hashData.type,
                    "workid": hashData.workId,
                    "isLeader": userInfo.isLeader
                },
                success: function (data) {
                    //console.log(data)
                    resTime++;
                    $.extend(allData, data.message);
                    if (resTime == 7) {
                        fun(allData)
                    }
                }
            });
        }

        function initBanlixinxi() {
            $.ajax({
                url: "/ajax.sword?ctrl=WXDaiBanDocDital_banlixinxi",
                dataType: "json",
                async: true,
                data: {
                    "workid": hashData.workId
                },
                success: function (data) {
                    //console.log(data)
                    resTime++;
                    $.extend(allData, data.message);
                    if (resTime == 7) {
                        fun(allData)
                    }
                }
            });
        }

        function initFankuixinxi() {
            $.ajax({
                url: "/ajax.sword?ctrl=WXDaiBanDocDital_fankuixinxi",
                dataType: "json",
                async: true,
                data: {
                    "workid": hashData.workId,
                    "curNodeID": instance.curFlowInfo.curNodeID
                },
                success: function (data) {
                    //console.log(data)
                    resTime++;
                    $.extend(allData, data.message);
                    if (resTime == 7) {
                        fun(allData)
                    }
                }
            });
        }
    }

    return {
        initAll: initAll,
        eachAll: eachAll
    };
});