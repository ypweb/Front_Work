define(["util","UrlBase",], function (Util,UrlBase) {
    /*dom引用*/
    var $fileNo = $('#fileNo'),
        $fileTitle = $('#fileTitle'),
        $startTime = $('#startTime'),
        $endTime = $('#endTime'),
        $doLeader = $('#doLeader'),
        //经办处室按钮
        $doDept = $('#doDept'),
        $doDept_btn = $('#doDept_btn'),
        //经办人按钮
        $doPerson = $("#doPerson"),
        $doPerson_btn = $("#doPerson_btn");
    //重置，查询
    var $reset = $("#reset"),
        $query = $("#query");

    /*经办处室事件绑定*/
    $doDept_btn.on('click', function () {
        // window.location.href = "/zwwx/app/feishidian/search/searchHome/views/doDept.html";
        window.location.href = UrlBase.URL_JUMP_SEARCHDODEPT;

    });
    /*经办人事件绑定*/
    $doPerson_btn.on('click', function () {
        // window.location.href = "/zwwx/app/feishidian/search/searchHome/views/doPerson.html";
        window.location.href = UrlBase.URL_JUMP_SEARCHDOPERSON;
    });

    //重置
    $reset.on('click', function () {
        $fileNo.val("");
        $fileTitle.val("");
        $startTime.val("");
        $endTime.val("");
        $doLeader.val("");
        $doDept.val("");
        $doDept.attr({'data-id': ""});
        $doPerson.val("");
        $doPerson.attr({'data-id': ""});
        // Util.removeSessionParams('query_module');
        Util.removeSessionParams('query_module_dept');
        Util.removeSessionParams('query_module_employee');
    });
    //查询
    $query.on('click', function () {
        saveForm();
        // window.location.href = "/zwwx/app/feishidian/search/searchResList/views/searchResList.html";
        window.location.href = UrlBase.URL_JUMP_SEARCHRESLIST;
    });

    //跳转页面时保存表单数据
    function saveForm() {
        var tempForm = {};
        tempForm['fileNo'] = $fileNo.val();
        tempForm['fileTitle'] = $fileTitle.val();
        tempForm['startTime'] = $startTime.val();
        tempForm['endTime'] = $endTime.val();
        tempForm['doLeader'] = $doLeader.val();
        tempForm['doDept'] = $doDept.attr('data-id');
        tempForm['doPerson'] = $doPerson.attr('data-id');
        Util.setSessionParams('query_module', tempForm);
        //清楚列表滚动位置和页面计数记录用
        Util.setSessionParams("nowScroll", null);
        Util.setSessionParams("nowPage", null);
    }

    //初始化
    function init() {
    	wx.invoke("hideWatermark",{},function(res) {
    	    //关闭页面水印
    	});
        //创建日期初始化
        $startTime.calendar({
            dateFormat: "yyyy-mm-dd"
        });
        $endTime.calendar({
            dateFormat: "yyyy-mm-dd"
        });
        getCache();
        $.hideLoading();
    }

    //用于数据返回时的追加
    function getCache() {
        //追加经办处室数据
        var dept_obj = Util.getSessionParams('query_module_dept');
        if (dept_obj) {
            $doDept.val(dept_obj['name']).attr({
                'data-id': dept_obj['id']
            });
        }
        //追加经办人数据
        var employee_obj = Util.getSessionParams('query_module_employee');
        if (employee_obj) {
            $doPerson.val(employee_obj['employeeName']).attr({
                'data-id': employee_obj['employeeId']
            });
        }
    }

    return init;
});