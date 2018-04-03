(function ($) {
    $(function () {

        var table = null/*数据展现*/;

        /*初始化数据*/
        if (public_tool.initMap.isrender) {
            /*菜单调用*/
            var logininfo = public_tool.initMap.loginMap;
            public_tool.loadSideMenu(public_vars.$mainmenu, public_vars.$main_menu_wrap, {
                url: 'http://10.0.5.226:8082/mall-buzhubms-api/module/menu',
                async: false,
                type: 'post',
                param: {
                    roleId: decodeURIComponent(logininfo.param.roleId),
                    adminId: decodeURIComponent(logininfo.param.adminId),
                    grade: decodeURIComponent(logininfo.param.grade),
                    token: decodeURIComponent(logininfo.param.token)
                },
                datatype: 'json'
            });


            /*清除会员关系*/
            public_tool.removeParams('bzw-userC-relation');


            /*权限调用*/
            var powermap = public_tool.getPower(348),
                relation_power = public_tool.getKeyPower('bzw-userC-list', powermap)/*会员关系*/,
                forbid_power = public_tool.getKeyPower('bzw-userC-list', powermap)/*会员禁用*/,
                enable_power = public_tool.getKeyPower('bzw-userC-list', powermap)/*会员启用*/;


            /*dom引用和相关变量定义*/
            var debug = false,
                $admin_list_wrap = $('#admin_list_wrap')/*表格*/,
                module_id = 'bzw-userC-list'/*模块id，主要用于本地存储传值*/,
                dia = dialog({
                    zIndex: 2000,
                    title: '温馨提示',
                    okValue: '确定',
                    width: 300,
                    ok: function () {
                        this.close();
                        return false;
                    },
                    cancel: false
                })/*一般提示对象*/,
                $admin_page_wrap = $('#admin_page_wrap'),
                sureObj = public_tool.sureDialog(dia)/*回调提示对象*/,
                setSure = new sureObj(),
                mobile_bind = false;


            /*查询对象*/
            var $search_searchColumn = $('#search_searchColumn'),
                $search_searchContent = $('#search_searchContent'),
                $search_createTimeStart = $('#search_createTimeStart'),
                $search_createTimeEnd = $('#search_createTimeEnd'),
                $admin_search_btn = $('#admin_search_btn'),
                $admin_search_clear = $('#admin_search_clear');


            /*批量配置参数*/
            var $admin_batchitem_btn = $('#admin_batchitem_btn'),
                $admin_batchitem_show = $('#admin_batchitem_show'),
                $admin_batchitem_check = $('#admin_batchitem_check'),
                $admin_batchitem_action = $('#admin_batchitem_action'),
                $admin_userC_list = $('#admin_userC_list'),
                batchItem = new public_tool.BatchItem();

            /*批量初始化*/
            batchItem.init({
                $batchtoggle: $admin_batchitem_btn,
                $batchshow: $admin_batchitem_show,
                $checkall: $admin_batchitem_check,
                $action: $admin_batchitem_action,
                $listwrap: $admin_userC_list,
                setSure: setSure,
                powerobj: {
                    'forbid': forbid_power,
                    'enable': enable_power
                },
                fn: function (type) {
                    /*批量操作*/
                    batchUser({
                        action: type
                    });
                }
            });


            /*列表请求配置*/
            var user_page = {
                    page: 1,
                    pageSize: 10,
                    total: 0
                },
                user_config = {
                    $admin_list_wrap: $admin_list_wrap,
                    $admin_page_wrap: $admin_page_wrap,
                    config: {
                        processing: true, /*大消耗操作时是否显示处理状态*/
                        deferRender: true, /*是否延迟加载数据*/
                        autoWidth: true, /*是否*/
                        paging: false,
                        ajax: {
                            url: debug ? "../../json/test.json" : "http://10.0.5.226:8082/mall-buzhubms-api/shuser/list",
                            dataType: 'JSON',
                            method: 'post',
                            dataSrc: function (json) {
                                if (debug) {
                                    var json = testWidget.test({
                                        map: {
                                            id: 'sequence',
                                            nickname: 'value',
                                            phone: 'mobile',
                                            gender: 'rule,0,1,2',
                                            birthday: 'datetime',
                                            createTime: 'datetime',
                                            lastLoginTime: 'datetime',
                                            loginTimes: 'id',
                                            status: 'rule,0,1'
                                        },
                                        mapmin: 5,
                                        mapmax: 10,
                                        type: 'list'
                                    });
                                }
                                var code = parseInt(json.code, 10);
                                if (code !== 0) {
                                    if (code === 999) {
                                        /*清空缓存*/
                                        public_tool.loginTips(function () {
                                            public_tool.clear();
                                            public_tool.clearCacheData();
                                        });
                                    }
                                    console.log(json.message);
                                    return [];
                                }
                                var result = json.result;
                                if (typeof result === 'undefined') {
                                    return [];
                                }
                                /*设置分页*/
                                user_page.page = result.page;
                                user_page.pageSize = result.pageSize;
                                user_page.total = result.count;
                                /*分页调用*/
                                $admin_page_wrap.pagination({
                                    pageSize: user_page.pageSize,
                                    total: user_page.total,
                                    pageNumber: user_page.page,
                                    onSelectPage: function (pageNumber, pageSize) {
                                        /*再次查询*/
                                        var param = user_config.config.ajax.data;
                                        param.page = pageNumber;
                                        param.pageSize = pageSize;
                                        user_config.config.ajax.data = param;
                                        getColumnData(user_page, user_config);
                                    }
                                });
                                return result ? result.list || [] : [];
                            },
                            data: {
                                roleId: decodeURIComponent(logininfo.param.roleId),
                                adminId: decodeURIComponent(logininfo.param.adminId),
                                grade: decodeURIComponent(logininfo.param.grade),
                                token: decodeURIComponent(logininfo.param.token),
                                page: 1,
                                pageSize: 10
                            }
                        },
                        info: false,
                        searching: true,
                        order: [[4, "desc"], [5, "desc"]],
                        columns: [
                            {
                                "data": "id",
                                "orderable": false,
                                "searchable": false,
                                "render": function (data, type, full, meta) {
                                    return '<input data-status="' + full.status + '" value="' + data + '" name="userID" type="checkbox" />';
                                }
                            },
                            {
                                "data": "nickname"
                            },
                            {
                                "data": "phone",
                                "render": function (data, type, full, meta) {
                                    if (typeof data === 'undefined' || data === '') {
                                        return '';
                                    }
                                    return public_tool.phoneFormat(data);
                                }
                            },
                            {
                                "data": "gender",
                                "render": function (data, type, full, meta) {
                                    var gender = parseInt(data, 10),
                                        gender_map = {
                                            0: '男',
                                            1: '女',
                                            2: '保密'
                                        };
                                    return gender_map[gender] || '';
                                }
                            },
                            {
                                "data": "createTime"
                            },
                            {
                                "data": "status",
                                "render": function (data, type, full, meta) {
                                    var status = parseInt(data, 10);

                                    if (status === 0) {
                                        return '<div class="g-c-info">启用(正常)</div>';
                                    } else if (status === 1) {
                                        return '<div class="g-c-gray10">禁用(锁定)</div>';
                                    }
                                }
                            },
                            {
                                "data": "loginTimes"
                            },
                            {
                                "data": "id",
                                "render": function (data, type, full, meta) {
                                    var id = parseInt(data, 10),
                                        btns = '',
                                        status = parseInt(full.status, 10);

                                    if (status === 0 && forbid_power) {
                                        /*正常(可用)*/
                                        btns += '<span data-action="forbid" data-id="' + id + '"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
													<i class="fa-toggle-off"></i>\
													<span>禁用(锁定)</span>\
												</span>';
                                    } else if (status === 1 && enable_power) {
                                        /*锁定(禁用)*/
                                        btns += '<span data-action="enable" data-id="' + id + '"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
													<i class="fa-toggle-on"></i>\
													<span>启用(正常)</span>\
												</span>';
                                    }

                                    /*会员关系*/
                                    if (relation_power) {
                                        btns += '<span data-action="relation" data-id="' + id + '" data-nickname="' + full.nickname + '" data-status="' + full.status + '"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
													<i class="fa-sitemap"></i>\
													<span>会员关系</span>\
												</span>';
                                    }
                                    return btns;
                                }
                            }
                        ]
                    }
                };


            /*清空查询条件*/
            $admin_search_clear.on('click', function () {
                /*清除查询条件*/
                $.each([$search_searchColumn, $search_searchContent, $search_createTimeStart, $search_createTimeEnd], function () {
                    this.val('');
                });
                $search_searchContent.removeAttr('maxlength').off('keyup');
                mobile_bind = false;
                /*重置分页*/
                user_page.page = 1;
                user_page.total = 0;
                user_config.config.ajax.data['page'] = user_page.page;
            }).trigger('click');

            /*日历查询*/
            datePickWidget.datePick([$search_createTimeStart, $search_createTimeEnd]);

            /*联合查询*/
            $admin_search_btn.on('click', function () {
                var data = $.extend(true, {}, user_config.config.ajax.data);

                $.each([$search_searchColumn, $search_createTimeStart, $search_createTimeEnd], function () {
                    var text = this.val(),
                        selector = this.selector.slice(1),
                        key = selector.split('_'),
                        isColumn = selector.indexOf('Column') !== -1;

                    if (isColumn) {
                        /*关联类型和关键字*/
                        var content = public_tool.trims($search_searchContent.val());
                        if (text !== "" && content !== '') {
                            data[key[1]] = text;
                            data['searchContent'] = content;
                        } else {
                            delete data['searchColumn'];
                            delete data['searchContent'];
                        }
                    } else {
                        if (text === "") {
                            if (typeof data[key[1]] !== 'undefined') {
                                delete data[key[1]];
                            }
                        } else {
                            data[key[1]] = text;
                        }
                    }
                });
                user_config.config.ajax.data = $.extend(true, {}, data);
                getColumnData(user_page, user_config);
            });

            /*绑定切换查询类型和查询关键字关联查询*/
            $search_searchColumn.on('change', function () {
                var value = this.value;
                /*切换绑定内容限制*/
                if (value !== '') {
                    value = parseInt(value, 10);
                    if (value === 1) {
                        /*昵称*/
                        /*取消绑定手机事件*/
                        if (mobile_bind) {
                            $search_searchContent.removeAttr('maxlength').off('keyup');
                            mobile_bind = false;
                        }
                    } else if (value === 2) {
                        /*手机号*/
                        /*绑定手机处理事件*/
                        $search_searchContent.val('');
                        if (mobile_bind) {
                            /*已经绑定则不绑定*/
                            return false;
                        }
                        /*格式化手机号码*/
                        $search_searchContent.attr({
                            'maxlength': 11
                        }).on('keyup', function (e) {
                            this.value = this.value.replace(/\D*/g, '');
                        });
                        mobile_bind = true;
                    }
                } else {
                    $search_searchContent.val('');
                }
            });


            /*事件绑定*/
            /*绑定查看，修改操作*/
            var operate_item;
            $admin_list_wrap.delegate('span', 'click', function (e) {
                e.stopPropagation();
                e.preventDefault();

                var target = e.target,
                    $this,
                    id,
                    action,
                    $tr,
                    actionmap = {
                        "forbid": 2,
                        "enable": 1
                    },
                    actiontip = {
                        "forbid": '禁用',
                        "enable": '启用'
                    };

                //适配对象
                if (target.className.indexOf('btn') !== -1) {
                    $this = $(target);
                } else {
                    $this = $(target).parent();
                }
                $tr = $this.closest('tr');
                id = $this.attr('data-id');
                action = $this.attr('data-action');

                /*启用，禁用操作*/
                if (action === 'forbid' || action === 'enable') {
                    if (operate_item) {
                        operate_item.removeClass('item-lighten');
                        operate_item = null;
                    }
                    operate_item = $tr.addClass('item-lighten');
                    /*确认是否启用或禁用*/
                    setSure.sure(actiontip[action], function (cf) {
                        /*to do*/
                        setEnabled({
                            id: id,
                            action: action,
                            tip: cf.dia || dia,
                            type: 'base',
                            actiontip: actiontip,
                            actionmap: actionmap
                        });
                    }, action === 'forbid' ? "禁用后，该用户将不再能使用该账号，是否禁用？" : "启用后，该用户将能使用该账号，是否启用？", true);
                } else if (action === 'relation') {
                    public_tool.setParams('bzw-userC-relation', {
                        id: id,
                        nickname: $this.attr('data-nickname'),
                        status: $this.attr('data-status')
                    });
                    window.open('bzw-userC-relation.html');
                }
            });


            /*初始化请求*/
            getColumnData(user_page, user_config);
        }


        /*获取数据*/
        function getColumnData(page, opt) {
            if (table === null) {
                table = opt.$admin_list_wrap.DataTable(opt.config);
            } else {
                /*清除批量数据*/
                batchItem.clear();
                table.ajax.config(opt.config.ajax).load();
            }
        }


        /*启用禁用*/
        function setEnabled(obj) {
            var id = obj.id;

            if (typeof id === 'undefined') {
                return false;
            }
            var type = obj.type,
                tip = obj.tip,
                action = obj.action;
            if (type === 'batch') {
                id = id.join(',');
            }

            $.ajax({
                url: debug ? "../../json/test.json" : "http://10.0.5.226:8082/mall-buzhubms-api/shuser/operate",
                dataType: 'JSON',
                method: 'post',
                data: {
                    shUserIds: id,
                    operate: obj.actionmap[action],
                    roleId: decodeURIComponent(logininfo.param.roleId),
                    adminId: decodeURIComponent(logininfo.param.adminId),
                    grade: decodeURIComponent(logininfo.param.grade),
                    token: decodeURIComponent(logininfo.param.token)
                }
            })
                .done(function (resp) {
                    if (debug) {
                        var resp = testWidget.testSuccess('list');
                    }
                    var code = parseInt(resp.code, 10);
                    if (code !== 0) {
                        console.log(resp.message);
                        tip.content('<span class="g-c-bs-warning g-btips-warn">' + (resp.message || "操作失败") + '</span>').show();
                        if (type === 'base') {
                            if (operate_item) {
                                operate_item.removeClass('item-lighten');
                                operate_item = null;
                            }
                        } else if (type === 'batch') {
                            batchItem.clear();
                        }
                        setTimeout(function () {
                            tip.close();
                        }, 2000);
                        return false;
                    }
                    /*是否是正确的返回数据*/
                    /*添加高亮状态*/
                    tip.content('<span class="g-c-bs-success g-btips-succ">' + obj.actiontip[action] + '成功</span>').show();
                    setTimeout(function () {
                        tip.close();
                        if (type === 'base') {
                            if (operate_item) {
                                operate_item.removeClass('item-lighten');
                                operate_item = null;
                            }
                        } else if (type === 'batch') {
                            batchItem.clear();
                        }
                        setTimeout(function () {
                            getColumnData(user_page, user_config);
                        }, 1000);
                    }, 1000);
                })
                .fail(function (resp) {
                    console.log(resp.message);
                    tip.content('<span class="g-c-bs-warning g-btips-warn">' + (resp.message || "操作失败") + '</span>').show();
                    if (type === 'base') {
                        if (operate_item) {
                            operate_item.removeClass('item-lighten');
                            operate_item = null;
                        }
                    } else if (type === 'batch') {
                        batchItem.clear();
                    }
                    setTimeout(function () {
                        tip.close();
                    }, 2000);
                });
        }


        /*批量操作*/
        function batchUser(config) {

            var action = config.action;

            if (action === '' || typeof action === 'undefined') {
                return false;
            }
            var inputitems = batchItem.getBatchNode(),
                len = inputitems.length,
                i = 0;

            if (len === 0) {
                dia.content('<span class="g-c-bs-warning g-btips-warn">请选中操作数据</span>').show();
                setTimeout(function () {
                    dia.close();
                }, 2000);
                return false;
            }
            var tempid = batchItem.getBatchData(),
                filter = [],
                actionmap = {
                    "forbid": 2,
                    "enable": 1
                },
                actiontip = {
                    "forbid": '禁用',
                    "enable": '启用'
                };


            for (i; i < len; i++) {
                var tempinput = inputitems[i],
                    temp_state = parseInt(tempinput.attr('data-status'), 10);


                /*审核成功*/
                if (temp_state === 0) {
                    /*启用状态则禁用*/
                    if (action === 'enable') {
                        filter.push(tempid[i]);
                        continue;
                    }
                } else if (temp_state === 1) {
                    /*禁用状态则启用*/
                    if (action === 'forbid') {
                        filter.push(tempid[i]);
                        continue;
                    }
                }
            }

            if (filter.length !== 0) {
                console.log('过滤不正确状态');
                batchItem.filterData(filter);
                filter.length = 0;
                setTimeout(function () {
                    dia.close();
                    /*批量操作*/
                    tempid = batchItem.getBatchData();
                    if (tempid.length !== 0) {
                        if (action === 'forbid' || action === 'enable') {
                            /*确认是否启用或禁用*/
                            setSure.sure(actiontip[action], function (cf) {
                                /*to do*/
                                setEnabled({
                                    id: tempid,
                                    action: action,
                                    tip: cf.dia || dia,
                                    type: 'batch',
                                    actiontip: actiontip,
                                    actionmap: actionmap
                                });
                            }, action === 'forbid' ? "禁用后，该用户将不再能使用该账号，是否批量禁用？" : "启用后，该用户将能使用该账号，是否批量启用？", true);
                        }
                    }
                }, 2000);
            } else {
                tempid = batchItem.getBatchData();
                if (tempid.length !== 0) {
                    if (action === 'forbid' || action === 'enable') {
                        /*确认是否启用或禁用*/
                        setSure.sure(actiontip[action], function (cf) {
                            /*to do*/
                            setEnabled({
                                id: tempid,
                                action: action,
                                tip: cf.dia || dia,
                                type: 'batch',
                                actiontip: actiontip,
                                actionmap: actionmap
                            });
                        }, action === 'forbid' ? "禁用后，该用户将不再能使用该账号，是否批量禁用？" : "启用后，该用户将能使用该账号，是否批量启用？", true);
                    }
                }
            }
        }


    });


})(jQuery);