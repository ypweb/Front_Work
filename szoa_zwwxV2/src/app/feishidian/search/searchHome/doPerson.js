define(["util"], function (Util) {
    // var userId = "ZR78c7445b9dc0ba015b9e0553fb013c";
    var userId;
    //获取经办人
    var deptsList = null,
        deptId = null,
        deptName = null,
        employeeId = null,
        employeeName = null,
        employee_select = null,
        isselect = false;
    var $signfirst = $('#signfirst'),               //单位
        $signsecond = $('#signsecond'),             //人员
        $doPerson_sure = $('#doPerson_sure'),       //确定
        $doPerson_cancel = $('#doPerson_cancel');   //取消
    // 确定
    $doPerson_sure.on('click', function () {
        if (deptId === null) {
            $.toast("请选择单位！", "text");
        } else if (employeeId === null) {
            $.toast("请选择人员！", "text");
        } else {
            var tempdept = {};
            tempdept['deptId'] = deptId;
            tempdept['deptName'] = deptName;
            tempdept['employeeId'] = employeeId;
            tempdept['employeeName'] = employeeName;
            Util.setSessionParams('query_module_employee', tempdept);
            window.history.back(-1);
        }
    });
    //取消
    $doPerson_cancel.on('click', function () {
        if (isselect) {
            var tempdept = {};
            tempdept['deptId'] = employee_select.deptId;
            tempdept['deptName'] = employee_select.deptName;
            tempdept['employeeId'] = employee_select.employeeId;
            tempdept['employeeName'] = employee_select.employeeName;
            Util.setSessionParams('query_module_employee', tempdept);
            window.history.back(-1);
        } else {
            window.history.back(-1);
        }
    });

    //初始化
    function init() {
        userId = Util.getParams("login_id");//获取userId
        if (!userId) {
            $.hideLoading();
            $.alert("未获取到您的用户信息，请从工作台中的办公系统查看您的报名信息！");
            return false;
        }
        getCache();
        receipients();
    }

    //数据初始化，判断是否第一次来此界面
    function getCache() {
        if (!$.isEmptyObject(Util.getSessionParams('query_module_employee'))) {
            employee_select = Util.getSessionParams('query_module_employee');
            if (employee_select !== null) {
                isselect = true;
            }
        }
    }

    //获取经办人
    function receipients() {
        //判断试点单位/非试点单位
      /*  var type,
            login_userInfo_obj = Util.getParams('login_userInfo'),
            temp = login_userInfo_obj.isPilotUnit;
        if (temp) {
            type = 1;
        } else {
            type = 2;
        }*/
        if (deptsList === null) {
            $.ajax({
                url: "/ajax.sword?ctrl=SignUpMeetingCtrl_receipients",	//获取部门下对应人员
                // url: "/ajax.sword?ctrl=SearchCtrl_receipients",	//获取部门下对应人员
                dataType: "json",
                data: {
                    userId: userId,
                    // type: type
                },
                success: function (depts) {
                    deptsList = depts.message.data;
                    var str = '',
                        subdataitem = null,
                        len = deptsList.length;
                    /*追加第一栏数据*/
                    for (var i = 0; i < len; i++) {
                        var dataitem = deptsList[i];
                        if (isselect && employee_select.deptId === dataitem["id"]) {
                            deptId = employee_select.deptId;
                            deptName = employee_select.deptName;
                            subdataitem = dataitem['employees'],
                                str += '<li class="wx-btnlist-active" data-id="' + dataitem["id"] + '"><div>' +
                                    deptsList[i].deptName + '</div></li>';
                        } else {
                            str += '<li data-id="' + dataitem["id"] + '"><div>' + deptsList[i].deptName + '</div></li>';
                        }
                    }
                    $(str).appendTo($signfirst.html(''));
                    /*追加第二栏数据*/
                    if (subdataitem !== null) {
                        var substr = '',
                            sublen = subdataitem.length;
                        for (var i = 0; i < sublen; i++) {
                            var subitem = subdataitem[i];
                            if (employee_select.employeeId !== null && employee_select.employeeId === subitem["id"]) {
                                employeeId = employee_select.employeeId;
                                employeeName = employee_select.employeeName;
                                substr += '<li class="wx-btnlist-active" data-id="' + subitem["id"] + '"><div>' +
                                    subitem["name"] + '</div></li>';
                            } else {
                                substr += '<li data-id="' + subitem["id"] + '"><div>' + subitem["name"] + '</div></li>';
                            }
                        }
                    }
                    $(substr).appendTo($signsecond.html(''));
                }
            });
        } else {
            /*追加第一栏数据*/
            var str = '',
                subdataitem = null,
                len = deptsList.length;
            for (var i = 0; i < len; i++) {
                var dataitem = deptsList[i];
                if (isselect && employee_select.deptId === dataitem["id"]) {
                    deptId = employee_select.deptId;
                    deptName = employee_select.deptName;
                    subdataitem = dataitem['employees'],
                        str += '<li class="wx-btnlist-active" data-id="' + dataitem["id"] + '"><div>' +
                            deptsList[i].deptName + '</div></li>';
                } else {
                    str += '<li data-id="' + dataitem["id"] + '"><div>' + deptsList[i].deptName + '</div></li>';
                }
            }
            $(str).appendTo($signfirst.html(''));
            /*追加第二栏数据*/
            if (subdataitem !== null) {
                var substr = '', sublen = subdataitem.length;
                for (var i = 0; i < sublen; i++) {
                    var subitem = subdataitem[i];
                    if (employee_select.employeeId !== null && employee_select.employeeId === subitem["id"]) {
                        employeeId = employee_select.employeeId;
                        employeeName = employee_select.employeeName;
                        substr += '<li class="wx-btnlist-active" data-id="' + subitem["id"] + '"><div>' +
                            subitem["name"] + '</div></li>';
                    } else {
                        substr += '<li data-id="' + subitem["id"] + '"><div>' + subitem["name"] + '</div></li>';
                    }
                }
            }
            $(substr).appendTo($signsecond.html(''));
        }
        $.hideLoading();
    };
    //绑定事件
    $.each([$signfirst, $signsecond], function () {
        var self = this,
            isfirst = self.selector.indexOf('first') !== -1;//选择器判断是不是第一个
        self.on('click', function (e) {
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
            if (isfirst) {/*第一栏点击事件实现*/
                $this.addClass('wx-btnlist-active').siblings().removeClass('wx-btnlist-active');
                deptId = $this.attr('data-id');
                deptName = $this.text();
                var index = $this.index(),
                    employees = deptsList[index]['employees'],
                    sublen = employees.length,
                    str = '';
                for (var i = 0; i < sublen; i++) {
                    var subitem = employees[i];
                    if (employeeId !== null && employeeId === subitem["id"]) {
                        str += '<li class="wx-btnlist-active" data-id="' + subitem["id"] + '"><div>'
                            + subitem["name"] + '</div></li>';
                    } else {
                        str += '<li data-id="' + subitem["id"] + '"><div>' + subitem["name"] + '</div></li>';
                    }
                }
                /*追加第二栏数据*/
                $(str).appendTo($signsecond.html(''));
            } else {
                //第二栏数据点击事件实现
                $this.addClass('wx-btnlist-active').siblings().removeClass('wx-btnlist-active');
                employeeId = $this.attr('data-id');
                employeeName = $this.text();
            }
        });
    });
    return init;
})