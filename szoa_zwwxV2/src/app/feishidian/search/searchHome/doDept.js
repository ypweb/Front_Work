define(["util", "weuiJS"], function (Util) {
    // var userId = "ZR78c7445b9dc0ba015b9e0553fb013c";
    var userId;
    var depts = null,
        deptId = null,
        deptName = null,
        dept_select = null,
        isselect = false;
    var $ok = $("#ok"),
        $quit = $("#quit"),
        $signdepts = $("#signdept"); //绑定部门按钮

    //  确定
    $ok.on('click', function () {
        if (deptId === null) {
            $.toast("请选择经办处室！", "text");
        } else {
            var tempdept = {};
            tempdept['id'] = deptId;
            tempdept['name'] = deptName;
            Util.setSessionParams('query_module_dept', tempdept);
            window.history.back(-1);
        }
    });
    // 取消
    $quit.on('click', function () {
        if (isselect) {
            var tempdept = {};
            tempdept['id'] = dept_select.id;
            tempdept['name'] = dept_select.name;
            Util.setSessionParams('query_module_dept', tempdept);
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
        getDeptsByUser();
    }

    //数据初始化，判断是否第一次来此界面
    function getCache() {
        if (!$.isEmptyObject(Util.getSessionParams('query_module_dept'))) {
            dept_select = Util.getSessionParams('query_module_dept');
            if (dept_select !== null) {
                isselect = true;
            }
        }
    }

    //获取部门
    function getDeptsByUser() {
        if (depts === null) {
            $.ajax({
                url: "/ajax.sword?ctrl=SearchCtrl_getDeptsByUser",	//获取部门
                dataType: "json",
                data: {
                    userId: userId
                },
                success: function (dept) {
                    depts = dept.message.data;
                    var str = '',
                        len = depts.length;
                    for (var i = 0; i < len; i++) {
                        var dataitem = depts[i];
                        if (isselect && dept_select.id === dataitem["id"]) { /*上一次过来存在数据*/
                            deptId = dept_select.id;
                            deptName = dept_select.name;
                            str += '<li  class="wx-btnlist-active" data-id="' +
                                dataitem["id"] + '"><div>' + depts[i].deptName + '</div></li>';
                        } else {
                            str += '<li data-id="' + dataitem["id"] + '"><div>' + depts[i].deptName +
                                '</div></li>';
                        }
                    }
                    /*追加第一栏数据*/
                    $(str).appendTo($signdepts.html(''));
                    $.hideLoading();
                }
            });
        } else {
            var str = '',
                len = depts.length;
            for (var i = 0; i < len; i++) {
                var dataitem = depts[i];
                if (isselect && dept_select.id === dataitem["id"]) {  /*上一次过来存在数据*/
                    deptId = dept_select.id;
                    deptName = dept_select.name;
                    str += '<li  class="wx-btnlist-active" data-id="' +
                        dataitem["id"] + '"><div>' + depts[i].deptName + '</div></li>';
                } else {
                    str += '<li data-id="' + dataitem["id"] + '"><div>' + depts[i].deptName + '</div></li>';
                }
            }
            /*追加第一栏数据*/
            $(str).appendTo($signdepts.html(''));
            $.hideLoading();
        }
    }

    //追加数据后数据选择实行切换
    $signdepts.on('click', function (e) {
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
        deptId = $this.attr('data-id');
        deptName = $this.text();
    });
    return init;
})


