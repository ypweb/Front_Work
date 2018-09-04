define(["util","FirstButtonAction", "weuiJS"], function (Util,FirstButtonAction) {
    var doList=null;
    var lineId = null,
        nextNodeId = null,
        nextNodeName = null;
    var deptsList = null;
    var nextUserId = null,
        nextUserName = null;
    var action = null,
        content = null,
        deptName = null,
        docType = null,
        flowId = null,
        nodeId = null,
        nodeName = null,
        trackId = null,
        userId = null,
        userName = null,
        workId = null;

    //数据追加按钮绑定
    var $doflow = $('#doflow'),
        $signfirst = $('#signfirst'),
        $signsecond = $('#signsecond');
    /*功能按钮绑定*/
    var $sendout = $('#sendout'),
        $cancel = $('#cancel');
    $sendout.on('click',function () {
        if(nextNodeId===null){
            $.toast("请选择办理环节","cancel");
        }else {
            saveOrsendNode();
        }
    })
    $cancel.on('click',function () {
        window.history.back(-1);
    })
    function init() {
        /*获取上一个页面传过来的参数*/
        var hashData = Util.getHashData();
        // console.log(hashData);
        action = hashData.action;
        content = hashData.content;
        deptName= hashData.deptName;
        docType= hashData.docType;
        flowId = hashData.flowId;
        nodeId= hashData.nodeId;
        nodeName= hashData.nodeName;
        trackId= hashData.trackId;
        userId= hashData.userId;
        userName= hashData.userName;
        workId= hashData.workId;
        getNextNodeInfo();      //获取办理环节
    }
    function getNextNodeInfo() {
        if (doList === null) {
            $.ajax({
                url: "/ajax.sword?ctrl=FirstButtonActionCtrl_getNextNodeInfo",
                dataType: "json",
                data: {
                    userId: userId,
                    workId: workId,
                    nodeid: nodeId,
                    trackId: trackId,
                    flowId: flowId
                },
                success: function (res) {
                    // console.log(res);
                    doList = res.message.data;
                    var str = '',
                        len = doList.length;
                    for (var i = 0; i < len; i++) {
                        var dataitem = doList[i];
                        str += '<li data-id="' + dataitem["authorid"] + '" data-lineid="'+dataitem["lineid"]+'" data-nodeid="'+dataitem["nodeid"]+'">' + '<div>' + doList[i].nodename + '</div></li>';
                    }
                    /*追加第一栏数据*/
                    $(str).appendTo($doflow.html(''));
                }
            });
        }else {
        var str = '',
            len = doList.length;
        for (var i = 0; i < len; i++) {
            var dataitem = doList[i];
            str += '<li data-id="' + dataitem["authorid"] + '" data-lineid="'+dataitem["lineid"]+'" data-nodeid="'+dataitem["nodeid"]+'">' +
                '<div>' + doList[i].nodename + '</div></li>';
        }
        /*追加第一栏数据*/
        $(str).appendTo($doflow.html(''));
        }
        $.hideLoading();
    }

    //绑定办理环节数据选择
    $doflow.on('click', function (e) {
        var ntarget = e.target,
            nodename = ntarget.nodeName.toLowerCase(),
            $this = null;
        //将点击事件绑定到li标签上
        if (nodename === 'ul') {
            return false;
        } else if (nodename === 'li') {
            $this = $(ntarget);
        } else if (nodename === 'div') {
            $this = $(ntarget).parent();
        }
        $this.addClass('wx-btnlist-active').siblings().removeClass('wx-btnlist-active');
        var groupId = $this.attr('data-id');
        lineId = $this.attr('data-lineid');
        nextNodeId = $this.attr('data-nodeid');
        nextNodeName = $this.text();
        // console.log(lineId+"**********"+nextNodeId+"***********"+nextNodeName);
        if(groupId){
            getUserGroupByiId(groupId);
        }else{
            //如果没有单位，清空单位数据
            deptsList=null;
            $signfirst.html("");
        }
        //清空人员数据
        $signsecond.html("");
        nextUserId = null;
        nextUserName = null;
    });

    function getUserGroupByiId(groupId) {
        $.showLoading("努力加载中...")
            $.ajax({
                url: "/ajax.sword?ctrl=FirstButtonActionCtrl_getUserGroupByiId",
                dataType: "json",
                data: {
                    groupId: groupId
                },
                success: function (depts) {
                    deptsList = depts.message.data;
                    // console.log(deptsList);
                    var str = '',
                        len = deptsList.length;
                    /*追加第一栏数据*/
                    for (var i = 0; i < len; i++) {
                        var dataitem = deptsList[i];
                            str += '<li data-id="' + dataitem["groupid"] + '"><div>' + deptsList[i].groupname + '</div></li>';
                    }
                    $(str).appendTo($signfirst.html(''));
                }
            });
        $.hideLoading();
    };

    /*二栏和三栏数据绑定事件*/
    $.each([$signfirst, $signsecond], function () {
        var self = this,
            isfirst = self.selector.indexOf('first') !== -1;//选择器判断是不是第一个
        self.on('click', function (e) {
            var ntarget = e.target,
                nodename = ntarget.nodeName.toLowerCase(),
                $this = null;
            if (nodename === 'ul') {
                return false;
            } else if (nodename === 'li') {
                $this = $(ntarget);
            } else if (nodename === 'div') {
                $this = $(ntarget).parent();
            }
            if (isfirst) {
                $this.addClass('wx-btnlist-active').siblings().removeClass('wx-btnlist-active');
                var index = $this.index(),
                    employees = deptsList[index]['children'],
                    sublen = employees.length,
                    str = '';
                // console.log(employees);
                for (var i = 0; i < sublen; i++) {
                    var subitem = employees[i];
                        str += '<li data-id="' + subitem["userid"] + '"><div>' + subitem["username"] + '</div></li>';
                }
                /*追加第二栏数据*/
                $(str).appendTo($signsecond.html(''));
            } else {
                //第二栏数据点击事件实现
                    nextUserId = $this.attr('data-id');
                    nextUserName = $this.text();
                    // console.log(nextUserId+"*************"+nextUserName);
                    $this.addClass('wx-btnlist-active').siblings().removeClass('wx-btnlist-active');
            }
        });
    });


    /*送出*/
    //userId,userName, deptName, workId,nodeId, nodeName,lineId,nextNodeId, nextNodeName,nextUser,nextUserName, trackId, content, action, docType
    function saveOrsendNode() {
        $.ajax({
            url: "/ajax.sword?ctrl=FirstButtonActionCtrl_saveOrsendNode",
            dataType: "json",
            data:{
                userId:userId,
                userName: userName,
                deptName:deptName,
                workId:workId,
                nodeId:nodeId,
                nodeName:nodeName,
                lineId:lineId,
                nextNodeId:nextNodeId,
                nextNodeName:nextNodeName,
                nextUser:nextUserId,
                nextUserName:nextUserName,
                trackId: trackId,
                content: content,
                action: action,
                docType:docType
            },
            success: function (data) {
                // console.log(data);
                if(data.message.success===1){
                    $.toast("送出成功");
                    setTimeout(window.history.go(-2),2000);
                }else{
                    $.toast(data.message.errors,"cancel");
                }
            }
        });
    }
    return init;
})