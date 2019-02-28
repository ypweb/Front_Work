/**
 * Created by zhuhao on 2018/9/6.
 */
define(["UrlBase","FirstButtonAction"], function (UrlBase,FirstButtonAction) {

    var flowMsg={};
    /**
     * 按钮
     * 送出，保存，退件，退文，办结，送经办人
     * 意见+意见弹出框
     **/
    /*按钮dom绑定*/
    //功能按钮组
    var $tab_menu = $('#tab_menu'),         //切换按钮
        $zhezhaoceng = $('#zhezhaoceng'),   //遮罩层
        $button_menu = $('#button_menu');
    //意见按钮组
    var $tool_idea = $('#tool_idea'),
        $tool_ideawrap = $tool_idea.parent(),    //按钮容器
        $tool_mask_transparent = $('#tool_mask_transparent'),//遮罩层
        $tool_idealist = $('#tool_idealist'),  //意见整个容器div
        $tool_showidea = $('#tool_showidea'),  //意见列表
        $tool_editidea = $('#tool_editidea');   //其他意见
    //其他意见弹出框按钮
    var $tool_ideatextarea = $('#tool_ideatextarea'),//其他意见整个div
        $tool_closeidea = $('#tool_closeidea'),       //关闭
        $send_btn = $('#send_btn');             //最下边按钮容器
    //意见输入框
    var $get_idea = $('#get_idea');

    function init(hashData,userInfo,instance,flowMsgs) {
        flowMsg=flowMsgs;

        FirstButtonAction.InitButton(instance, $button_menu); //初始化功能按钮
        /*常用意见的追加*/
        addcomOptions();
        /*追加其他意见框内部按钮*/
        addSendBtn();

        /*按钮切换事件绑定以及功能实现*/
        //循环判断点击按钮或者遮罩层隐藏
        $.each([$zhezhaoceng, $tab_menu], function () {
            this.on('click', function () {
                $zhezhaoceng.toggleClass('g-d-hidei');
                $button_menu.toggleClass('g-d-hidei');
                $tab_menu.toggleClass('tool-list-active');
                if (!$tool_idealist.hasClass('g-d-hidei')) {
                    $tool_idealist.addClass('g-d-hidei');
                    $tool_mask_transparent.addClass('g-d-hidei');
                    $tool_idea.removeClass('tool-list-active');
                }
            })
        });
        //点击切换常用意见展开与收起
        $.each([$tool_mask_transparent, $tool_idea], function () {
            this.on('click', function () {
                $tool_idealist.toggleClass('g-d-hidei');
                $tool_mask_transparent.toggleClass('g-d-hidei');
                $tool_idea.toggleClass('tool-list-active');
                if (!$zhezhaoceng.hasClass('g-d-hidei')) {
                    $zhezhaoceng.addClass('g-d-hidei');
                    $button_menu.addClass('g-d-hidei');
                    $tab_menu.addClass('tool-list-active');
                }
            })
        });
        //点击其他意见，展示输入框
        $tool_editidea.on('click', function () {
            $tool_ideatextarea.removeClass('g-d-hidei');
            /*获取暂存意见，赋值*/
            //hashData获取数据
            var userId = userInfo.id,
                workid = hashData.workId,
                trackid = hashData.trackId;
            /*userInfo获取数据*/
            var username = userInfo.truename;
            /*实例流程获数据*/
            var nodeid = instance.curFlowInfo.curNodeID;
            var content = FirstButtonAction.getTempCom(username, userId, workid, nodeid, trackid);
            if (content) {
                $get_idea.val($(content).text());
            }
        });
        //关闭其他意见框，关闭输入框
        $tool_closeidea.on('click', function () {
            $tool_ideatextarea.addClass('g-d-hidei');
        });
        //功能按钮绑定
        $button_menu.on('click', "li", function () {
            var buttonType=$(this).data().type;
            if (buttonType&&buttonType==="tixing"){
                return;
            }
            //hashData获取数据
            var userId = userInfo.id,
                workid = hashData.workId,
                trackid = hashData.trackId,
                docType = hashData.type;
            /*userInfo获取数据*/
            var username = userInfo.truename,
                deptname = userInfo.deptName;
            /*实例流程获数据*/
            var nodeid = instance.curFlowInfo.curNodeID,
                nodename = instance.curFlowInfo.curNodeName,
                flowId = instance.curFlowInfo.flowId;
            //退件和发送意见前获取当前节点的前一个nodeID和后一个nodeID
            var fl = FirstButtonAction.returnNode(flowMsg, nodeid).split("-");
            // console.log(fl);
            //获取暂存意见
            var contentInfo = FirstButtonAction.getTempCom(username, userId, workid, nodeid, trackid);
            // console.log(contentInfo);
            var $this = $(this);
            var Temp = $this.attr("data-type");
            // console.log(Temp);
            switch (Temp) {
                case "Submit"://送出
                    var nextid = fl[1];
                    var action = "2", content = "", fworkid = "";
                    if (contentInfo === "请填写本次意见") {
                        if (nodeid.toUpperCase() === "START" || (nodeid.toUpperCase() === "NODE19" && docType === "1") || nodeid.toUpperCase() === "NODE12") {
                            /*不需要意见*/
                            if (parseInt(nextid) === 1) {
                                /*跳转页面，选环节，人*/
                                var param = "#userId=" + userId + "," + "userName=" + username + "," + "deptName=" + deptname + ","
                                    + "workId=" + workid + "," + "nodeId=" + nodeid + "," + "nodeName=" + nodename + "," + "trackId=" + trackid + ","
                                    + "content=" + content + "," + "action=" + action + "," + "docType=" + docType + "," + "flowId=" + flowId;
                                window.location.href = UrlBase.URL_JUMP_SENDOUT + param;
                            } else {
                                /*直接送出*/
                                fworkid = nextid;
                                FirstButtonAction.SaveOrSend(userId, username, deptname, workid, nodeid, nodename,
                                    trackid, content, action, fworkid, docType);
                            }
                        } else {
                            $.toast(contentInfo);
                        }
                    } else {
                        content = $(contentInfo).text();
                        var isToagent = FirstButtonAction.forSure(flowMsg, nodeid, userId);
                        //需要经办人确定
                        if (isToagent !== "" && parseInt(isToagent) === 1 || (parseInt(nextid) === 1 && nodeid.toUpperCase() === "NODE4") || nodeid.toUpperCase() === "NODE15" || (nodeid.toUpperCase() === "NODE19" && docType === "2") || nodeid.toUpperCase() === "Node11") {
                            //送经办人
                            /* var content="";
                             if(contentInfo!=="请填写本次意见"){
                             content=$(contentInfo).text();
                             }*/
                            FirstButtonAction.sendTransactor(userId, username, deptname, nodeid, workid, trackid, flowId, docType, content, nodename);
                        } else {
                            if (parseInt(nextid) === 1) {
                                /*跳转页面，选环节，人*/
                                var param = "#userId=" + userId + "," + "userName=" + username + "," + "deptName=" + deptname + ","
                                    + "workId=" + workid + "," + "nodeId=" + nodeid + "," + "nodeName=" + nodename + "," + "trackId=" + trackid + ","
                                    + "content=" + content + "," + "action=" + action + "," + "docType=" + docType + "," + "flowId=" + flowId;
                                window.location.href = UrlBase.URL_JUMP_SENDOUT + param;
                            } else {
                                fworkid = nextid;
                                /*直接送出*/
                                FirstButtonAction.SaveOrSend(userId, username, deptname, workid, nodeid, nodename,
                                    trackid, content, action, fworkid, docType);
                            }
                        }
                    }
                    break;
                case "Save"://保存
                    var action = "1", content = "", fworkid = "";
                    if (contentInfo !== "请填写本次意见") {
                        content = $(contentInfo).text();
                    }
                    FirstButtonAction.SaveOrSend(userId, username, deptname, workid, nodeid, nodename, trackid, content, action, fworkid, docType);
                    break;
                case "Reject"://退件
                    $.confirm({
                        title: '退件',
                        text: '是否退件？',
                        onOK: function () { //点击确认
                            var prevNodeid = fl[0];
                            if (parseInt(prevNodeid) === 0) {
                                $.toast("没有退件单位")
                            } else {
                                // console.log(username, userId, deptname, workid, nodeid, prevNodeid, trackid, docType);
                                FirstButtonAction.backStep(username, userId, deptname, workid, nodeid, prevNodeid, trackid, docType);
                            }
                        },
                        onCancel: function () {
                        }
                    });
                    break;
                case "SendEnd"://办结
                    $.confirm({
                        title: '办结',
                        text: '是否办结？',
                        onOK: function () { //点击确认
                            FirstButtonAction.endFlow(userId, username, deptname, nodeid, workid, trackid, flowId);
                        },
                    });
                    break;
                case "SendFileBack"://退文
                    var param = "#workId=" + workid + "," + "type=" + docType + "," + "userId=" + userId;
                    window.location.href = UrlBase.URL_TUIWEN + param;
                    break;
                case "SendSpecial"://送经办人
                    var content = "";
                    if (contentInfo !== "请填写本次意见") {
                        content = $(contentInfo).text();
                    }
                    FirstButtonAction.sendTransactor(userId, username, deptname, nodeid, workid, trackid, flowId, docType, content, nodename);
                    break;
                default:
                    break;
            }
        });

        //点击常用意见项送出
        $tool_showidea.on('click', 'li', function () {
            var $this = $(this);
            var content = $this.text();
            //送出
            send(content);
        });

        /*常用意见的追加*/
        function addcomOptions() {
            var userId = userInfo.id;
            var options = FirstButtonAction.getComOptions(userId);
            // console.log(options);
            var option_str = '',
                len = options.length;
            for (var i = 0; i < len; i++) {
                option_str += '<li><div>' + options[i] + '</div></li>';
            }
            $tool_showidea.append(option_str);
        }

        //根据是否为领导人追加意见框下边的按钮
        function addSendBtn() {
            var isLeader = userInfo.isLeader;
            if (parseInt(isLeader) === 1) {
                $send_btn.addClass("wx-btnaction-item3");
                $send_btn.append('<li class="wx-btnaction-sure" id="idea_send">送出</li>'
                    + '<li class="wx-btnaction-sure" id="idea_sendjbr">送经办人</li>'
                    + '<li class="wx-btnaction-sure" id="idea_save">保存</li>');
            } else {
                $send_btn.addClass("wx-btnaction-item2");
                $send_btn.append('<li class="wx-btnaction-sure" id="idea_send">送出</li>'
                    + '<li class="wx-btnaction-sure" id="idea_save">保存</li>');
            }
        }

        /*其他按钮操作*/
        $send_btn.on('click', 'li', function () {
            //hashData获取数据
            var userId = userInfo.id,
                workid = hashData.workId,
                trackid = hashData.trackId,
                docType = hashData.type;
            /*userInfo获取数据*/
            var username = userInfo.truename,
                deptname = userInfo.deptName;
            /*实例流程获数据*/
            var nodeid = instance.curFlowInfo.curNodeID,
                nodename = instance.curFlowInfo.curNodeName,
                flowId = instance.curFlowInfo.flowId;
            var $this = $(this);
            var id = $this.attr("id");
            if (id === "idea_save") {//保存
                var action = "1", fworkid = "";
                var content = $get_idea.val();
                FirstButtonAction.SaveOrSend(userId, username, deptname, workid, nodeid, nodename, trackid, content, action, fworkid, docType);
            } else if (id === "idea_send") {//送出
                var content = $get_idea.val();
                if (content === "") {
                    $.toast("送出前请填写意见", "cancel");
                } else {
                    send(content);
                }
            } else if (id === "idea_sendjbr") {//送经办人
                var content = $get_idea.val();
                FirstButtonAction.sendTransactor(userId, username, deptname, nodeid, workid, trackid, flowId, docType, content, nodename);
            }
        });

        /*常用意见下的送出操作*/
        function send(content) {
            //hashData获取数据
            var userId = userInfo.id,
                workid = hashData.workId,
                trackid = hashData.trackId,
                docType = hashData.type;
            /*userInfo获取数据*/
            var username = userInfo.truename,
                deptname = userInfo.deptName;
            /*实例流程获数据*/
            var nodeid = instance.curFlowInfo.curNodeID,
                nodename = instance.curFlowInfo.curNodeName,
                flowId = instance.curFlowInfo.flowId;
            var fl = FirstButtonAction.returnNode(flowMsg, nodeid).split("-");
            var nextid = fl[1];
            var action = "2", fworkid = "";
            var isToagent = FirstButtonAction.forSure(flowMsg, nodeid, userId);
            //需要经办人确定
            if (isToagent !== "" && parseInt(isToagent) === 1 || (parseInt(nextid) === 1 && nodeid.toUpperCase() === "NODE4") || nodeid.toUpperCase() === "NODE15" || (nodeid.toUpperCase() === "NODE19" && docType === "2") || nodeid.toUpperCase() === "Node11") {
                FirstButtonAction.sendTransactor(userId, username, deptname, nodeid, workid, trackid, flowId, docType, content, nodename);
            } else {
                if (parseInt(nextid) === 1) {
                    /*跳转页面，选环节，人*/
                    var param = "#userId=" + userId + "," + "userName=" + username + "," + "deptName=" + deptname + ","
                        + "workId=" + workid + "," + "nodeId=" + nodeid + "," + "nodeName=" + nodename + "," + "trackId=" + trackid + ","
                        + "content=" + content + "," + "action=" + action + "," + "docType=" + docType + "," + "flowId=" + flowId;
                    window.location.href = UrlBase.URL_JUMP_SENDOUT + param;
                } else {
                    fworkid = nextid;
                    /*直接送出*/
                    FirstButtonAction.SaveOrSend(userId, username, deptname, workid, nodeid, nodename,
                        trackid, content, action, fworkid, docType);
                }
            }
        }
    }

    return init;
})