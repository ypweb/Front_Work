define(["util"], function (Util) {
    var deptsList = null,
        secondarr = {	//选择人员时将对应id保存于该数组，用于报名
            len: 0
        };
    var $signfirst = $('#signfirst'),//单位
        $signsecond = $('#signsecond'),//人员
        $ok = $("#ok"),//确定
        $cancel = $("#quit");//取消
    var meetId, userId;
    //点击确定按钮，进行报名
    $ok.on('click', function () {
        var arr = getSecondData();
        if (arr.length > 0) {
            var str = "";
            for (var i = 0; i < arr.length; i++) {
                if (i === arr.length - 1) {
                    str += arr[i];
                } else {
                    str += arr[i] + ";";
                }
            }
            $.ajax({
                url: "/ajax.sword?ctrl=SignUpMeetingCtrl_meetingEnrollData",		//选择人员进行报名
                dataType: "json",
                data: {
                    meetId: meetId,
                    userId: userId,
                    meetEnrollUserId: str
                },
                success: function (data) {
                    if (data.message.success === 1) {
                        $.toast("报名成功", 2000,function () {
                            window.history.go(-1);
                        });
                    } else {
                        $.toast(data.message.errors,"cancel")
                    }
                }
            });
        } else {
            $.alert("请先选择人员！")
        }
    });
    //取消
    $cancel.on('click', function () {
        window.history.go(-1);
    });

    //初始化
    function init() {
        var hashData = Util.getHashData();
        meetId = hashData.swid;
        userId = hashData.userId;
        receipients();
    }

    //报名前获取部门，用于选择报名
    function receipients() {
        if (deptsList === null) {
            $.ajax({
                url: "/ajax.sword?ctrl=SignUpMeetingCtrl_receipients",	//获取部门下对应人员
                dataType: "json",
                data: {
                    userId: userId
                },
                success: function (depts) {
                    deptsList = depts.message.data;
                    var str = '',
                        // substr='',
                        len = deptsList.length;
                    for (var i = 0; i < len; i++) {
                        var dataitem = deptsList[i];
                        // subdataitem=dataitem['employees'],
                        // sublen=subdataitem.length;
                        str += '<li data-id="' + dataitem["id"] + '"><div>' + deptsList[i].deptName + '</div></li>';
                    }
                    /*追加第一栏数据*/
                    $(str).appendTo($signfirst.html(''));
//                	/*追加第二栏数据*/
//                	$(substr).appendTo($signsecond.html(''));
                }
            });
        } else {
            var str = '',
                len = deptsList.length;
            for (var i = 0; i < len; i++) {
                var dataitem = deptsList[i];
                str += '<li data-id="' + dataitem["id"] + '"><div>' + deptsList[i].deptName + '</div></li>';
            }
            /*追加第一栏数据*/
            $(str).appendTo($signfirst.html(''));
        }
        $.hideLoading();
    };
    /*绑定事件*/
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
                    employees = deptsList[index]['employees'],
                    sublen = employees.length,
                    str = '';
                var dd = getSecondData();
                for (var i = 0; i < sublen; i++) {
                    var subitem = employees[i];
                    if (dd.length > 0) {//实现页签切换，人名标记
                        for (var j = 0; j < dd.length; j++) {
                            if (dd[j] === subitem["id"]) {
                                str += '<li class="wx-btnlist-active"data-id="' + subitem["id"] + '"><div>'
                                    + subitem["name"] + '</div></li>';
                                break;
                            } else if (j === dd.length - 1) {
                                str += '<li data-id="' + subitem["id"] + '"><div>' + subitem["name"] + '</div></li>';
                            }
                        }
                    } else {//第一来到页面初始化
                        str += '<li data-id="' + subitem["id"] + '"><div>' + subitem["name"] + '</div></li>';
                    }
                }
                /*追加第二栏数据*/
                $(str).appendTo($signsecond.html(''));
            } else {
                //第二栏数据点击事件实现
                var id = $this.attr('data-id');
                if ($this.hasClass('wx-btnlist-active')) {
                    $this.removeClass('wx-btnlist-active');
                    if (secondarr[id]) {
                        delete secondarr[id];
                        secondarr['len']--;
                    }
                } else {
                    $this.addClass('wx-btnlist-active');
                    if (!secondarr[id]) {
                        secondarr[id] = id;
                        secondarr['len']++;
                    }
                }
            }
        });
    });

    /*获取二列数据*/
    function getSecondData() {
        var secList = [];
        for (var i in secondarr) {
            if (i !== 'len' && secondarr.hasOwnProperty(i)) {
                secList.push(secondarr[i]);
            }
        }
        return secList;
    };
    return init;
});

