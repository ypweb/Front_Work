define(["util", "rule"], function (Util, Rule) {
    /*DOM按钮绑定*/
    var $sure = $("#sure"),				//确定
        $cancel = $("#cancel"),				//取消
        $cancelSignUp = $("#cancelSignUp"),	//取消报名
        $workcheck = $("#workcheck"),			//判断是否请假
        $workOffReason = $("#workOffReason"),	//请假原因
        $job = $("#personJob"),					//参会人职位
        $personName = $("#personName"), 		//参会人姓名
        $personDept = $("#personDept");		//部门
    //id:选择修改的参会人员信息id  jod:参会人职位  isLeave:是1,否2  leaveRerson:请假原因
    var id, job, isLeave, leaveRerson;
    //是否请假按钮切换
    $workcheck.on('click', 'label', function () {
        var $this = $(this),
            value = parseInt($this.find(':checked').val(), 10);
        if (value === 1) {
            isLeave = value;
            $workOffReason.prop("disabled", false);
        } else {
            isLeave = 2;
            $workOffReason.val("").prop("disabled", true);
        }
        $this.addClass("simulation-checked").siblings().removeClass("simulation-checked");
    });
    //确定修改
    $sure.on('click', function () {
        job = Rule.checkName($job.val());
        leaveRerson = Rule.checkName($workOffReason.val());
        $.ajax({
            url: "/ajax.sword?ctrl=SignUpMeetingCtrlV2_editRegistration",	//修改报名
            dataType: "json",
            data: {
                Id: id,
                Job: job,
                IsLeave: isLeave,
                LeaveRerson: leaveRerson
            },
            success: function (data) {
                if (data.message.success === 1) {
                    window.history.go(-1);
                } else {
                    $.alert(data.message.data.result);
                }
            }
        });
    });
    //取消
    $cancel.on('click', function () {
        window.history.go(-1);
    })
    //取消报名
    $cancelSignUp.on('click', function () {
        $.ajax({
            url: "/ajax.sword?ctrl=SignUpMeetingCtrlV2_cancelRegistration",	//取消报名
            dataType: "json",
            data: {
                Id: id
            },
            success: function (data) {
                if (data.message.success === 1) {
                    window.history.go(-1);
                } else {
                    $.alert(data.message.data.result);
                }
            }
        });
    });

    //初始化
    function init() {
        //页面跳转过来数据对应
        var hashData = Util.getHashData();
        id = hashData.id;
        if (hashData.ifleave === "否") {
            isLeave = 2;
        } else {
            isLeave = 1;
        }
        ;
        leaveRerson = hashData.leaveperson;
        $job.val(hashData.job);
        $personName.val(hashData.meetman);
        $personDept.val(hashData.meetdept);
        $workcheck.find('input').each(function () {
            var $this = $(this),
                value = parseInt($this.val(), 10);
            if (value === isLeave) {
                $this.parent().addClass('simulation-checked');
                if (isLeave === 2) {
                    $workOffReason.val("").prop("disabled", true);
                } else {
                    $workOffReason.val(leaveRerson);
                }
                return false;
            }
        });
        $.hideLoading();
    }

    return init;
});