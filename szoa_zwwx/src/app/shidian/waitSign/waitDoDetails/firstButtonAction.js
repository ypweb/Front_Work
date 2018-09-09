define([], function () {

    /*退件按钮追加判断*/
    var DOCUMENT_NODE5 = "Node5";//排版校对
    var DOCUMENT_NODE9 = "Node9";//用印
    var SYSTEM_REJECT = "Reject"; //退件
    //按钮组数据追加
    function InitButton(instance, $button_menu) {
        // function InitButton() {
        var btnList = instance.curFlowInfo.curButtons;
        var NodeID = instance.curFlowInfo.curNodeID;
        var len = btnList.length;
        var btn_str = '';
        for (var i = 0; i < len; i++) {
            // console.log(btnList[i]);
            if (btnList[i].name == '送出') {
                btn_str += '<li class="tool-menu-send menu-extend-send" data-type="' + btnList[i].id + '" data-title="' + btnList[i].name + '"><span></span></li>'
            } else if (btnList[i].name == '保存') {
                btn_str += '<li class="tool-menu-save" data-type="' + btnList[i].id + '" data-title="' + btnList[i].name + '"><span></span></li>'
            } else if (btnList[i].name == '退件') {
                btn_str += '<li class="tool-menu-return" data-type="' + btnList[i].id + '" data-title="' + btnList[i].name + '"><span></span></li>'
            } else if (btnList[i].name == '送经办人') {
                btn_str += '<li class="tool-menu-handle tool-menu-item4" data-type="SendSpecial" data-title="' + btnList[i].name + '"><span></span></li>'
            } else if (btnList[i].name == '办结') {
                btn_str += '<li class="tool-menu-finish tool-menu-item2" data-type="SendEnd" data-title="' + btnList[i].name + '"><span></span></li>'
            } else if (btnList[i].name == '退文') {
                if ((NodeID == DOCUMENT_NODE5 || NodeID == DOCUMENT_NODE9) && btnList[i].id == SYSTEM_REJECT) {
                    continue;
                } else { //退文
                    btn_str += '<li class="tool-menu-back" data-type="SendFileBack" data-title="' + btnList[i].name + '"><span></span></li>'
                }
            }
        }
        $button_menu.append(btn_str);
    }

    //保存或送出
    function SaveOrSend(userId, username, deptname, workid, nodeid, nodename, trackid, content, action, fworkid, docType) {
        $.ajax({
            url: "/ajax.sword?ctrl=FirstButtonActionCtrl_save",
            dataType: "json",
            data: {
                userId: userId,
                username: username,
                deptname: deptname,
                workid: workid,
                nodeid: nodeid,
                nodename: nodename,
                trackid: trackid,
                content: content,
                action: action,
                fworkid: fworkid,
                docType: docType
            },
            success: function (data) {
                // console .log(data);
                if (data.message.success === 1) {
                    $.toast(data.message.data.result);
                    if (data.message.data.result === "发送成功!") {
                        setTimeout(window.history.back(-1), 1000);
                    }
                } else {
                    $.toast(data.message.errors, "cancel");
                }
            }
        });
    }

    /*常用意见*/
    function getComOptions(userId) {
        var options = null;
        $.ajax({
            url: "/ajax.sword?ctrl=FirstButtonActionCtrl_getComOptions",
            dataType: "json",
            async: false,
            data: {
                userId: userId
            },
            success: function (data) {
                if (data.message.success === 1) {
                    options = data.message.data;
                } else {
                    options = "";
                }
            }
        });
        return options;
    }

    /*获取当前办理节点的上一个nodeid和下一个id*/
    function returnNode(flowList, nodeid) {
        var prevnodeid = "",
            nextid = "";
        for (var i = 0; i < flowList.length; i++) {
            if (i < flowList.length - 1) {
                if (flowList[i].cnodeid === nodeid.toUpperCase() && parseInt(flowList[i + 1].isdo) === 0) {
                    if (i > 0) {
                        var nnid = flowList[i - 1].nodeid;
                        if (nnid.charAt(0) === "L") {
                            prevnodeid = nnid.split("~")[1];
                        } else {
                            prevnodeid = nnid;
                        }
                        // previd=flowList[i-1].cnodeid.charAt(0)+flowList[i-1].cnodeid.substring(1).toLowerCase();
                    } else {
                        prevnodeid = "0";
                    }
                    nextid = flowList[i + 1].id;
                    break;
                }
            } else {
                if (i > 0) {
                    var nnid = flowList[i - 1].nodeid;
                    if (nnid.charAt(0) === "L") {
                        prevnodeid = nnid.split("~")[1];
                    } else {
                        prevnodeid = nnid;
                    }
                    // previd=flowList[i-1].cnodeid.charAt(0)+flowList[i-1].cnodeid.substring(1).toLowerCase();
                } else {
                    prevnodeid = "0";
                }
                nextid = "1"
            }
        }
        return prevnodeid + "-" + nextid;
    }

    //退件
    function backStep(userName, userId, deptName, workId, nodeId, rejectNodeId, trackId, docType) {
        $.ajax({
            url: "/ajax.sword?ctrl=FirstButtonActionCtrl_backStep",
            dataType: "json",
            data: {
                userName: userName,
                userId: userId,
                deptName: deptName,
                workId: workId,
                nodeId: nodeId,
                rejectNodeId: rejectNodeId,
                trackId: trackId,
                docType: docType
            },
            success: function (data) {
                console.log(data);
                if (data.message.success === 1) {
                    $.toast("退件成功", function () {
                        window.history.back(-1)
                    });
                } else {
                    $.toast(data.message.errors, "cancel")
                }
            }
        })
    }

    /*办结*/
    function endFlow(userId, userName, deptName, nodeId, workId, trackId, flowId) {
        $.ajax({
            url: "/ajax.sword?ctrl=FirstButtonActionCtrl_endFlow",
            dataType: "json",
            data: {
                userId: userId,
                userName: userName,
                deptName: deptName,
                nodeId: nodeId,
                workId: workId,
                trackId: trackId,
                flowId: flowId
            },
            success: function (data) {
                if (data.message.success === 1) {
                    $.toast("办结成功", function () {
                        window.history.back(-1)
                    });
                } else {
                    $.toast(data.message.errors, "cancel")
                }
            }
        })
    }

    /*送经办人*/
    function sendTransactor(userId, userName, deptName, NodeId, workId, trackId, flowId, doctype, adviceContent, nodeName) {
        $.ajax({
            url: "/ajax.sword?ctrl=FirstButtonActionCtrl_sendTransactor",
            dataType: "json",
            data: {
                userId: userId,
                userName: userName,
                deptName: deptName,
                NodeId: NodeId,
                workId: workId,
                trackId: trackId,
                flowId: flowId,
                doctype: doctype,
                adviceContent: adviceContent,
                nodeName: nodeName
            },
            success: function (data) {
                if (data.message.success === 1) {
                    $.toast("送出成功", function () {
                        window.history.back(-1)
                    });
                } else {
                    $.toast(data.message.errors, "cancel")
                }
            }
        })
    }

    /*获取暂存意见*/
    function getTempCom(username, userid, workId, nodeId, trackId) {
        var temp = null;
        $.ajax({
            url: "/ajax.sword?ctrl=FirstButtonActionCtrl_getTempCom",
            dataType: "json",
            async: false,
            data: {
                username: username,
                userid: userid,
                workId: workId,
                nodeId: nodeId,
                trackId: trackId
            },
            success: function (data) {
                // console.log(data)
                if (data.message.errors === "无保存意见") {
                    temp = "请填写本次意见"
                } else {
                    temp = data.message.data.opinion;
                }
            }
        });
        return temp;
    }

    function forSure(flowMsg, nodeid, userId) {
        if (flowMsg.length > 0) {
            for (var i = 0; i < flowMsg.length; i++) {
                var msgInfo = flowMsg[i];
                console.log(msgInfo);
                var cnodeid = msgInfo.cnodeid;
                var authorid = msgInfo.authorid ? msgInfo.authorid.split(";") : '';
                if (cnodeid === nodeid.toUpperCase()) {
                    for (var j = 0; j < authorid.length; j++) {
                        var id = authorid[j];
                        if (id.charAt(0) === "U") {
                            id = id.split("_")[1];
                        }
                        if (id === userId) {
                            return msgInfo.istoagent;
                        }
                    }
                }
            }
        } else {
            return "";
        }
    }

    return {
        InitButton: InitButton,
        SaveOrSend: SaveOrSend,
        returnNode: returnNode,
        backStep: backStep,
        endFlow: endFlow,
        sendTransactor: sendTransactor,
        getTempCom: getTempCom,
        forSure: forSure,
        getComOptions: getComOptions
    }
})