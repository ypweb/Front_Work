/*权限服务*/
(function () {
    'use strict';

    /*定义或扩展模块*/
    angular
        .module('power', [])
        .service('powerService', powerService);

    /*服务依赖注入*/
    powerService.$inject = ['toolUtil', 'loginService', 'testService'];


    /*服务实现*/
    function powerService(toolUtil, loginService, testService) {
        /*获取缓存数据*/
        var self = this,
            isrender = false/*dom是否渲染*/,
            isall = false/*是否支持全选*/,
            isitem = false/*是否支持单个选中事件*/,
            debug = false/*测试模式*/,
            h_items = [],
            h_len = 0,
            colgroup = ''/*分组*/,
            thead = ''/*普通的头*/,
            all_thead = ''/*拥有全选的头*/;

        /*初始化执行*/
        (function () {
            /*有数据即调数据，没数据就创建数据*/
            if (thead !== '' && colgroup !== '' && h_items.length !== 0) {
                return false;
            }
            var powerCache=loginService.getCache()['powerMap'];
            if (powerCache) {
                var str = '',
                    strall = '',
                    index = 0;

                for (var i in powerCache) {
                    /*过滤首页*/
                    if (parseInt(i, 10) === 0) {
                        continue;
                    }
                    h_items.push(i);
                    strall += '<th class="g-t-c"><label><input data-index="' + index + '" data-modid="' + powerCache[i]["id"] + '" type="checkbox" name="' + powerCache[i]["module"] + '" />&nbsp;' + powerCache[i]["name"] + '</label></th>';
                    str += '<th data-index="' + index + '" class="g-t-c">' + powerCache[i]["name"] + '</th>';
                    index++;
                }

                if (h_items.length !== 0) {
                    var len = h_items.length,
                        j = 0,
                        colitem = parseInt(50 / len, 10);

                    /*初始化赋值*/
                    thead = '<tr>' + str + '</tr>';
                    all_thead = '<tr>' + strall + '</tr>';
                    h_len = len;

                    /*解析分组*/
                    if (colitem * len <= (50 - len)) {
                        colitem = len + 1;
                    }
                    for (j; j < len; j++) {
                        colgroup += '<col class="g-w-percent' + colitem + '" />';
                    }
                }
            } else {
                all_thead = thead = '<tr><th></th></tr>';
                colgroup = '<col class="g-w-percent50" />';
            }
        }());


        this.init = init/*初始化方法*/;
        this.createThead = createThead/*生成头部和分组*/;
        this.selectItemPower = selectItemPower/*设置单个权限选项操作 to do*/;
        this.reqUserPowerList = reqUserPowerList/*请求用户权限列表(主要是根据不同对象查询相关权限):config:请求参数，mode:模型*/;
        this.reqPowerList = reqPowerList/*请求权限列表(主要是根据不同对象查询相关权限):config:请求参数，mode:模型*/;
        this.resolvePowerList = resolvePowerList/*解析权限列表*/;
        this.selectAllPower = selectAllPower/*权限服务--全选权限（权限绑定）*/;
        this.filterPower = filterPower/*权限服务--过滤用户权限*/;
        this.getSelectPower = getSelectPower/*权限服务--获取选中选择权限*/;
        this.clearHeaderPower = clearHeaderPower/*清除头部选中*/;
        this.clearSelectPower = clearSelectPower/*权限服务--清除选中选择权限*/;
        this.getCurrentPower = getCurrentPower/*权限服务--获取当前用户的权限缓存,key(id，模块名称)*/;
        this.getPowerListByModule = getPowerListByModule/*根据模块判断拥有的权限(拥有的权限),key:(索引，模块名称),cache:模块；此方法结果一般与isPower配合使用*/;
        this.isPower = isPower/*根据关键词判断权限flag:是否过滤没有的权限*/;
        this.getIdByPath = getIdByPath/*根据路径获取ID*/;
        this.getSideMenu=getSideMenu/*根据模块id获取子子菜单*/;


        /*初始化方法*/
        function init(config) {
            var dom = config.dom;
            if (dom) {
                isrender = true;
                debug = config.debug ? true : false;
                /*复制dom引用*/
                for (var i in dom) {
                    self[i] = dom[i];
                }
                /*是否绑定全选*/
                if (config.isall) {
                    isall = true;
                    selectAllPower();
                }
                /*是否绑定单个选中*/
                if (config.isitem) {
                    isitem = true;
                    selectItemPower();
                }
                /*初始化头部和分组*/
                createThead();
            }
        }

        /*生成头部和分组*/
        function createThead() {
            /*flag:是否有全选*/
            /*有数据即调数据，没数据就创建数据*/
            $(colgroup).appendTo(self.$power_colgroup.html(''));
            if (isall) {
                $(all_thead).appendTo(self.$power_thead.html(''));
            } else {
                $(thead).appendTo(self.$power_thead.html(''));
            }
        }

        /*设置单个权限选项操作 to do*/
        function selectItemPower() {
            self.$power_tbody.on('click', 'input', function (e) {
                var target = e.target;

                /*标签*/
                var $operate = $(target),
                    check = $operate.is(':checked'),
                    prid = $operate.attr('data-prid'),
                    tempparam = loginService.getCache().loginMap.param,
                    param = {
                        adminId: tempparam.adminId,
                        token: tempparam.token,
                        organizationId: tempparam.organizationId,
                        prid: prid,
                        isPermit: check ? 1 : 0
                    };

                toolUtil
                    .requestHttp({
                        url: '/permission/state/update',
                        method: 'post',
                        debug: debug,
                        data: param
                    })
                    .then(function (resp) {
                            if (debug) {
                                var resp = testService.testSuccess();
                            }
                            var data = resp.data,
                                status = parseInt(resp.status, 10);

                            if (status === 200) {
                                var code = parseInt(data.code, 10),
                                    message = data.message;
                                if (code !== 0) {
                                    if (typeof message !== 'undefined' && message !== '') {
                                        console.log(message);
                                    } else {
                                        console.log('设置权限失败');
                                    }
                                    if (code === 999) {
                                        /*退出系统*/
                                        loginService.outAction();
                                    }
                                    /*恢复原来设置*/
                                    $operate.prop({
                                        'checked': !check
                                    });
                                }
                            }
                        },
                        function (resp) {
                            var message = resp.data.message;
                            if (typeof message !== 'undefined' && message !== '') {
                                console.log(message);
                            } else {
                                console.log('设置权限失败');
                            }
                            /*恢复原来设置*/
                            $operate.prop({
                                'checked': !check
                            });
                        });

            });
        }

        /*请求权限列表(主要是根据不同对象查询相关权限):config:请求参数，mode:模型*/
        function reqPowerList(config) {
            if (!isrender) {
                return false;
            }
            /*合并参数*/
            var tempparm = loginService.getCache().loginMap.param,
                param = {
                    adminId: tempparm.adminId,
                    token: tempparm.token,
                    organizationId: typeof config.organizationId !== 'undefined' ? config.organizationId : tempparm.organizationId
                };


            toolUtil
                .requestHttp({
                    url: '/organization/permission/select',
                    method: 'post',
                    debug: debug,
                    data: param
                })
                .then(function (resp) {
                        if (debug) {
                            var resp = config.israndom ? testService.testMenu({
                                israndom: config.israndom
                            }) : testService.testMenu();
                        }
                        var data = resp.data,
                            status = parseInt(resp.status, 10);

                        if (status === 200) {
                            var code = parseInt(data.code, 10),
                                message = data.message;
                            if (code !== 0) {
                                if (typeof message !== 'undefined' && message !== '') {
                                    console.log(message);
                                } else {
                                    console.log('请求权限失败');
                                }
                                if (code === 999) {
                                    /*退出系统*/
                                    loginService.outAction();
                                }
                            } else {
                                /*加载数据*/
                                var result = data.result;
                                if (!result) {
                                    self.$power_tbody.html('<tr><td colspan="' + h_len + '" class="g-c-gray9 g-fs4 g-t-c g-b-white">没有查询到权限信息</td></tr>');
                                    return false;
                                }
                                if (typeof result !== 'undefined') {
                                    var menu = result.menu;
                                    if (menu) {
                                        var len = menu.length;
                                        if (len === 0) {
                                            /*直接获取原始数据*/
                                            if (config.source) {
                                                if (config.sourcefn && typeof config.sourcefn === 'function') {
                                                    config.sourcefn.call(null, null);
                                                }
                                            } else {
                                                self.$power_tbody.html('<tr><td colspan="' + h_len + '" class="g-c-gray9 g-fs4 g-t-c g-b-white">没有查询到权限信息</td></tr>');
                                            }
                                            return true;
                                        } else {
                                            var templist = toolUtil.resolveMainMenu(menu);
                                            /*直接获取原始数据*/
                                            if (config.source) {
                                                if (config.sourcefn && typeof config.sourcefn === 'function') {
                                                    if (templist !== null) {
                                                        config.sourcefn.call(null, templist['power']);
                                                    } else {
                                                        config.sourcefn.call(null, null);
                                                    }
                                                }
                                                return true;
                                            } else {
                                                /*解析数据*/
                                                /*将查询数据按照模块解析出来*/
                                                if (templist !== null) {
                                                    var temp_power = templist['power'],
                                                        temp_html = '';
                                                    /*将模块数据解析转换成html数据*/
                                                    if (config.clear) {
                                                        temp_html = resolvePowerList({
                                                            menu: temp_power,
                                                            clear: true
                                                        });
                                                    } else {
                                                        temp_html = resolvePowerList({
                                                            menu: temp_power
                                                        });
                                                    }
                                                    $(temp_html).appendTo(self.$power_tbody.html(''));
                                                } else {
                                                    self.$power_tbody.html('<tr><td colspan="' + h_len + '" class="g-c-gray9 g-fs4 g-t-c g-b-white">没有查询到权限信息</td></tr>');
                                                }
                                            }

                                        }
                                    } else {
                                        /*直接获取原始数据*/
                                        if (config.source) {
                                            if (config.sourcefn && typeof config.sourcefn === 'function') {
                                                config.sourcefn.call(null, null);
                                            }
                                            return true;
                                        } else {
                                            /*填充子数据到操作区域,同时显示相关操作按钮*/
                                            self.$power_tbody.html('<tr><td colspan="' + h_len + '" class="g-c-gray9 g-fs4 g-t-c g-b-white">没有查询到权限信息</td></tr>');
                                        }
                                    }
                                } else {
                                    /*直接获取原始数据*/
                                    if (config.source) {
                                        if (config.sourcefn && typeof config.sourcefn === 'function') {
                                            config.sourcefn.call(null, null);
                                        }
                                        return true;
                                    } else {
                                        self.$power_tbody.html('<tr><td colspan="' + h_len + '" class="g-c-gray9 g-fs4 g-t-c g-b-white">没有查询到权限信息</td></tr>');
                                    }
                                }
                            }
                        }
                    },
                    function (resp) {
                        var message = resp.data.message;
                        if (typeof message !== 'undefined' && message !== '') {
                            console.log(message);
                        } else {
                            console.log('请求权限失败');
                        }
                        /*直接获取原始数据*/
                        if (config.source) {
                            if (config.sourcefn && typeof config.sourcefn === 'function') {
                                config.sourcefn.call(null, null);
                            }
                            return true;
                        } else {
                            self.$power_tbody.html('<tr><td colspan="' + h_len + '" class="g-c-gray9 g-fs4 g-t-c g-b-white">没有查询到权限信息</td></tr>');
                        }
                    });
        }

        /*请求用户权限列表(主要是根据不同对象查询相关权限):config:请求参数，mode:模型*/
        function reqUserPowerList(config) {
            if (!isrender) {
                return false;
            }
            /*合并参数*/
            var param = config.param,
                datalist = config.datalist;

            if (typeof datalist !== 'undefined') {
                /*如果存在直接数据源，则不请求数据*/
                (function () {
                    /*直接获取原始数据*/
                    if (config.source) {
                        if (config.sourcefn && typeof config.sourcefn === 'function') {
                            if (datalist !== null) {
                                config.sourcefn.call(null, datalist);
                            } else {
                                config.sourcefn.call(null, null);
                            }
                        }
                    } else {
                        /*解析数据*/
                        /*将查询数据按照模块解析出来*/
                        if (datalist !== null) {
                            var temp_html = '';
                            /*将模块数据解析转换成html数据*/
                            if (config.clear) {
                                temp_html = resolvePowerList({
                                    menu: datalist,
                                    clear: true
                                });
                            } else {
                                temp_html = resolvePowerList({
                                    menu: datalist
                                });
                            }
                            $(temp_html).appendTo(self.$power_tbody.html(''));
                        } else {
                            self.$power_tbody.html('<tr><td colspan="' + h_len + '" class="g-c-gray9 g-fs4 g-t-c g-b-white">没有查询到权限信息</td></tr>');
                        }
                    }
                }());
            } else {
                /*如果不存在直接数据源，则请求数据*/
                toolUtil
                    .requestHttp({
                        url: config.url,
                        method: 'post',
                        debug: debug,
                        data: param
                    })
                    .then(function (resp) {
                            if (debug) {
                                var resp = config.israndom ? testService.testMenu({
                                    israndom: config.israndom
                                }) : testService.testMenu();
                            }
                            var data = resp.data,
                                status = parseInt(resp.status, 10);

                            if (status === 200) {
                                var code = parseInt(data.code, 10),
                                    message = data.message;
                                if (code !== 0) {
                                    if (typeof message !== 'undefined' && message !== '') {
                                        console.log(message);
                                    } else {
                                        console.log('请求用户权限失败');
                                    }
                                    if (code === 999) {
                                        /*退出系统*/
                                        loginService.outAction();
                                    }
                                } else {
                                    /*加载数据*/
                                    var result = data.result;
                                    if (!result) {
                                        /*直接获取原始数据*/
                                        if (config.source) {
                                            if (config.sourcefn && typeof config.sourcefn === 'function') {
                                                config.sourcefn.call(null, null);
                                            }
                                        } else {
                                            self.$power_tbody.html('<tr><td colspan="' + h_len + '" class="g-c-gray9 g-fs4 g-t-c g-b-white">没有查询到权限信息</td></tr>');
                                        }
                                        return false;
                                    }
                                    if (typeof result !== 'undefined') {
                                        var menu = result.menu;
                                        if (menu) {
                                            var len = menu.length;
                                            if (len === 0) {
                                                /*直接获取原始数据*/
                                                if (config.source) {
                                                    if (config.sourcefn && typeof config.sourcefn === 'function') {
                                                        config.sourcefn.call(null, null);
                                                    }
                                                } else {
                                                    self.$power_tbody.html('<tr><td colspan="' + h_len + '" class="g-c-gray9 g-fs4 g-t-c g-b-white">没有查询到权限信息</td></tr>');
                                                }
                                                return true;
                                            } else {
                                                var templist = toolUtil.resolveMainMenu(menu);
                                                /*直接获取原始数据*/
                                                if (config.source) {
                                                    if (config.sourcefn && typeof config.sourcefn === 'function') {
                                                        if (templist !== null) {
                                                            config.sourcefn.call(null, templist['power']);
                                                        } else {
                                                            config.sourcefn.call(null, null);
                                                        }
                                                    }
                                                    return true;
                                                } else {
                                                    /*解析数据*/
                                                    /*将查询数据按照模块解析出来*/
                                                    if (templist !== null) {
                                                        var temp_power = templist['power'],
                                                            temp_html = '';
                                                        /*将模块数据解析转换成html数据*/
                                                        if (config.clear) {
                                                            temp_html = resolvePowerList({
                                                                menu: temp_power,
                                                                clear: true
                                                            });
                                                        } else {
                                                            temp_html = resolvePowerList({
                                                                menu: temp_power
                                                            });
                                                        }
                                                        $(temp_html).appendTo(self.$power_tbody.html(''));
                                                    } else {
                                                        self.$power_tbody.html('<tr><td colspan="' + h_len + '" class="g-c-gray9 g-fs4 g-t-c g-b-white">没有查询到权限信息</td></tr>');
                                                    }
                                                }

                                            }
                                        } else {
                                            /*直接获取原始数据*/
                                            if (config.source) {
                                                if (config.sourcefn && typeof config.sourcefn === 'function') {
                                                    config.sourcefn.call(null, null);
                                                }
                                                return true;
                                            } else {
                                                /*填充子数据到操作区域,同时显示相关操作按钮*/
                                                self.$power_tbody.html('<tr><td colspan="' + h_len + '" class="g-c-gray9 g-fs4 g-t-c g-b-white">没有查询到权限信息</td></tr>');
                                            }
                                        }
                                    } else {
                                        /*直接获取原始数据*/
                                        if (config.source) {
                                            if (config.sourcefn && typeof config.sourcefn === 'function') {
                                                config.sourcefn.call(null, null);
                                            }
                                            return true;
                                        } else {
                                            self.$power_tbody.html('<tr><td colspan="' + h_len + '" class="g-c-gray9 g-fs4 g-t-c g-b-white">没有查询到权限信息</td></tr>');
                                        }
                                    }
                                }
                            }
                        },
                        function (resp) {
                            var data = resp.data;
                            if (data) {
                                var message = data.message;
                                if (typeof message !== 'undefined' && message !== '') {
                                    console.log(message);
                                } else {
                                    console.log('请求权限失败');
                                }
                            }
                            /*直接获取原始数据*/
                            if (config.source) {
                                if (config.sourcefn && typeof config.sourcefn === 'function') {
                                    config.sourcefn.call(null, null);
                                }
                                return true;
                            } else {
                                self.$power_tbody.html('<tr><td colspan="' + h_len + '" class="g-c-gray9 g-fs4 g-t-c g-b-white">没有查询到权限信息</td></tr>');
                            }
                        });
            }
        }

        /*解析权限列表*/
        function resolvePowerList(config) {
            /*解析数据*/
            var powerCache=loginService.getCache()['powerMap'],
                len = h_items.length,
                i = 0,
                str = '',
                ispermit,
                request = (config && config.menu) ? true : false;

            if (len === 0) {
                str = '<tr><td class="g-c-gray9 g-fs4 g-t-c g-b-white">没有查询到权限信息</td></tr>';
            } else {
                if (request) {
                    var menuitem = config.menu,
                        temp_id = typeof config.id !== 'undefined' ? config.id : '';
                }
                for (i; i < len; i++) {

                    var index = parseInt(h_items[i], 10),
                        item = request ? menuitem[index] : powerCache[index];

                    if (typeof item === 'undefined' || !item) {
                        str += '<td class="g-b-white"></td>';
                        continue;
                    }

                    var power = item['power'],
                        j = 0,
                        sublen = power.length;

                    str += '<td class="g-b-white">';
                    for (j; j < sublen; j++) {
                        var subitem = power[j];
                        if (request) {
                            /*如果是请求*/
                            if (config.clear) {
                                /*全不选*/
                                if (subitem["disabled"]) {
                                    str += '<label class="btn btn-default g-gap-mb2 g-gap-mr2"><input data-roleid="' + temp_id + '" disabled data-prid="' + subitem["prid"] + '" data-modid="' + subitem["modId"] + '" type="checkbox" name="' + item["module"] + '" />&nbsp;' + subitem["funcName"] + '</label>';
                                } else {
                                    str += '<label class="btn btn-default g-gap-mb2 g-gap-mr2"><input data-roleid="' + temp_id + '" data-prid="' + subitem["prid"] + '" data-modid="' + subitem["modId"] + '" type="checkbox" name="' + item["module"] + '" />&nbsp;' + subitem["funcName"] + '</label>';
                                }
                            } else {
                                /*根据设置或者配置结果来*/
                                if (subitem["disabled"]) {
                                    str += '<label class="btn btn-default g-gap-mb2 g-gap-mr2"><input data-roleid="' + temp_id + '" data-prid="' + subitem["prid"] + '" data-modid="' + subitem["modId"] + '" disabled type="checkbox" name="' + item["module"] + '" />&nbsp;' + subitem["funcName"] + '</label>';
                                } else {
                                    ispermit = parseInt(subitem["isPermit"], 10);
                                    if (ispermit === 0) {
                                        /*没有权限*/
                                        str += '<label class="btn btn-default g-gap-mb2 g-gap-mr2"><input data-roleid="' + temp_id + '" data-prid="' + subitem["prid"] + '" data-modid="' + subitem["modId"] + '" type="checkbox" name="' + item["module"] + '" />&nbsp;' + subitem["funcName"] + '</label>';
                                    } else if (ispermit === 1) {
                                        /*有权限*/
                                        str += '<label class="btn btn-default g-gap-mb2 g-gap-mr2"><input data-roleid="' + temp_id + '" data-prid="' + subitem["prid"] + '" data-modid="' + subitem["modId"] + '" checked type="checkbox" name="' + item["module"] + '" />&nbsp;' + subitem["funcName"] + '</label>';
                                    }
                                }
                            }
                        } else {
                            /*非请求*/
                            if (config.clear) {
                                /*全不选*/
                                if (subitem["disabled"]) {
                                    str += '<label class="btn btn-default g-gap-mb2 g-gap-mr2"><input data-prid="' + subitem["prid"] + '" data-modid="' + subitem["modId"] + '" type="checkbox" disabled name="' + item["module"] + '" />&nbsp;' + subitem["funcName"] + '</label>';
                                } else {
                                    str += '<label class="btn btn-default g-gap-mb2 g-gap-mr2"><input data-prid="' + subitem["prid"] + '" data-modid="' + subitem["modId"] + '" type="checkbox" name="' + item["module"] + '" />&nbsp;' + subitem["funcName"] + '</label>';
                                }
                            } else {
                                if (subitem["disabled"]) {
                                    str += '<label class="btn btn-default g-gap-mb2 g-gap-mr2"><input data-prid="' + subitem["prid"] + '" data-modid="' + subitem["modId"] + '" type="checkbox" disabled name="' + item["module"] + '" />&nbsp;' + subitem["funcName"] + '</label>';
                                } else {
                                    /*根据设置或者配置结果来*/
                                    ispermit = parseInt(subitem["isPermit"], 10);
                                    if (ispermit === 0) {
                                        /*没有权限*/
                                        str += '<label class="btn btn-default g-gap-mb2 g-gap-mr2"><input data-prid="' + subitem["prid"] + '" data-modid="' + subitem["modId"] + '" type="checkbox" name="' + item["module"] + '" />&nbsp;' + subitem["funcName"] + '</label>';
                                    } else if (ispermit === 1) {
                                        /*有权限*/
                                        str += '<label class="btn btn-default g-gap-mb2 g-gap-mr2"><input data-prid="' + subitem["prid"] + '" data-modid="' + subitem["modId"] + '"  checked="true" type="checkbox" name="' + item["module"] + '" />&nbsp;' + subitem["funcName"] + '</label>';
                                    }

                                }
                            }
                        }

                    }
                    str += "</td>";
                }
            }
            return '<tr data-seq="' + Math.floor(Math.random() * 100000) + '">' + str + '</tr>';
        }

        /*权限服务--全选权限（权限绑定）*/
        function selectAllPower() {
            self.$power_thead.on('click', function (e) {
                e.stopPropagation();
                var target = e.target,
                    nodename = target.nodeName.toLowerCase();

                /*过滤*/
                if (nodename === 'tr') {
                    return null;
                }

                /*标签*/
                var $selectall,
                    index,
                    $operate,
                    check,
                    selectarr = [];

                if (nodename === 'label' || nodename === 'th' || nodename === 'td') {
                    $selectall = $(target).find('input');
                } else if (nodename === 'input') {
                    $selectall = $(target);
                }

                check = $selectall.is(':checked');
                index = $selectall.attr('data-index');
                $operate = self.$power_tbody.find('td').eq(index).find('input:not(:disabled)');

                if (check) {
                    $operate.each(function () {
                        var $this = $(this),
                            prid = $this.attr('data-prid');
                        $this.prop({
                            "checked": true
                        });
                        selectarr.push(prid);
                    });
                } else {
                    $operate.each(function () {
                        $(this).prop({
                            "checked": false
                        });
                    });
                    selectarr = null;
                }
                return selectarr;
            });
        }


        /*权限服务--过滤用户权限--(主要为父级和子级之间的关系):pdata:原数据(父级),cdata:过滤数据(子级)

         策略：
         1：获取父级用户权限，
         2：获取子级用户权限，
         3：遍历父级用户权限，对比子级用户权限，
         4：存在子级用户权限则勾选父级用户权限，根据子级用户权限的设置值分别设置父级用户权限，不存在子级用户权限则不勾选父级用户权限
         5：不存在子级模块，则父级用户权限全不勾选
         6：最终获取的是过滤后的父级对象
         * */
        function filterPower(pdata, cdata) {
            if (!pdata) {
                return false;
            }
            if (!cdata) {
                return false;
            }
            if (h_len === 0) {
                /*不存在模块*/
                return false;
            }

            var i = 0,
                parent_data = pdata;

            /*循环模块*/
            outerLabel:for (i; i < h_len; i++) {
                var model_id = parseInt(h_items[i], 10)/*模块标识*/,
                    parent_item = pdata[model_id]/*父级权限对象*/,
                    child_item = cdata[model_id]/*子级权限对象*/,
                    parent_power = parent_item['power']/*父级权限组*/,
                    parent_len = parent_power.length;

                /*如果子权限不存在情况*/
                if (!child_item || (!child_item['power'] || typeof child_item['power'] === 'undefined' || child_item['power'].length === 0)) {
                    /*不存在子级对象或者不存在子级权限，父级权限组全不勾选*/
                    var m = 0;
                    for (m; m < parent_len; m++) {
                        parent_power[m]['isPermit'] = 0;
                        if (m === parent_len - 1) {
                            continue outerLabel;
                        }
                    }
                }

                var child_power = child_item['power']/*子级权限组*/,
                    j = 0;

                /*循环父权限组*/
                innerLabel:for (j; j < parent_len; j++) {
                    var child_len = child_power.length,
                        p_item = parent_power[j],
                        p_code = p_item["funcCode"]/*父级权限相对应标识*/,
                        k = 0,
                        c_item,
                        c_code;

                    /*查找子权限*/
                    for (k; k < child_len; k++) {
                        c_item = child_power[k];
                        c_code = c_item["funcCode"];

                        /*是否是同一个权限值*/
                        if (p_code === c_code) {
                            /*如果存在相同的权限，且父权限没有权限，那么需要清除此子权限*/
                            p_item['isPermit'] = parseInt(c_item['isPermit'], 0);
                            continue innerLabel;
                        }
                        if (k === child_len - 1) {
                            /*循环到最后一个后还是没有找到相同项*/
                            /*设置父权限为未勾选*/
                            p_item['isPermit'] = 0;
                        }
                    }

                }
            }
            return parent_data;
        }

        /*权限服务--获取选中选择权限*/
        function getSelectPower(dom) {
            var $input;
            if (typeof dom !== 'undefined') {
                $input = $(dom);
            } else {
                if (!isrender) {
                    return null;
                }
                $input = self.$power_tbody.find('input:checked');
            }

            /*标签*/
            var prid,
                selectarr = [];

            $input.each(function () {
                var $this = $(this);

                prid = $this.attr('data-prid');
                selectarr.push(prid);
            });
            return selectarr.length === 0 ? null : selectarr;
        }


        /*清除头部选中*/
        function clearHeaderPower() {
            if (isall) {
                self.$power_thead.find('input:checked').each(function () {
                    $(this).prop({
                        'checked': false
                    });
                });
            }
        }

        /*权限服务--清除选中选择权限*/
        function clearSelectPower(dom) {
            var $input;
            if (typeof dom !== 'undefined') {
                $input = $(dom);
            } else {
                if (!isrender) {
                    return false;
                }
                $input = self.$power_tbody.find('input:checked');
            }

            /*清除主体*/
            $input.each(function () {
                $(this).prop({
                    'checked': false
                });
            });

            /*清除头部*/
            clearHeaderPower();
        }

        /*权限服务--获取当前用户的权限缓存,key(id，模块名称)*/
        function getCurrentPower(key) {
            var cache=loginService.getCache()['powerMap'];
            if (cache) {
                if (typeof key !== 'undefined') {
                    return getPowerListByModule(key, cache);
                }
                return cache;
            }
            return null;
        }

        /*根据模块判断拥有的权限(拥有的权限),key:(索引，模块名称),cache:模块；此方法结果一般与isPower配合使用*/
        function getPowerListByModule(key, cache) {
            if (typeof key === 'undefined' || !cache) {
                /*没有缓存数据或者索引不存在*/
                return null;
            } else {
                /*查找权限*/
                var currentpower = null;
                for (var i in cache) {
                    if (key === cache[i]['module']) {
                        /*匹配模块关键字,返回匹配到的权限数组*/
                        currentpower = cache[i]['power'];
                        break;
                    } else if (key === cache[i]['id']) {
                        /*匹配模块关键字,返回匹配到的权限数组*/
                        currentpower = cache[i]['power'];
                        break;
                    }
                }

                if (currentpower !== null) {
                    var len = currentpower.length;
                    if (len === 0) {
                        /*权限为空*/
                        return null;
                    } else {
                        return currentpower;
                    }
                }
            }
        }

        /*根据关键词判断权限flag:是否过滤没有的权限*/
        function isPower(key, list, flag) {
            if (!key || !list) {
                return false;
            }
            var ispower = false,
                i = 0,
                len = list.length;


            if (len === 0) {
                ispower = false;
            } else {
                if (flag) {
                    var ispermit;
                    for (i; i < len; i++) {
                        ispermit = parseInt(list[i]['isPermit'], 10);
                        if ((list[i]['funcCode'] === key || list[i]['funcCode'].indexOf(key) !== -1) && ispermit === 1) {
                            ispower = true;
                            break;
                        } else if ((list[i]['funcName'] === key || list[i]['funcName'].indexOf(key) !== -1) && ispermit === 1) {
                            ispower = true;
                            break;
                        }
                    }
                } else {
                    for (i; i < len; i++) {
                        if (list[i]['funcCode'] === key || list[i]['funcCode'].indexOf(key) !== -1) {
                            ispower = true;
                            break;
                        } else if (list[i]['funcName'] === key || list[i]['funcName'].indexOf(key) !== -1) {
                            ispower = true;
                            break;
                        }
                    }
                }
            }
            return ispower;
        }

        /*根据路径判断模块*/
        function getIdByPath(path) {
            if (!path) {
                /*不存在路径则返回首页*/
                return 0;
            }
            var temppath = path.slice(1);
            if (temppath.indexOf('/') !== -1) {
                if (temppath.indexOf('.') !== -1) {
                    temppath = temppath.split('/');
                    var len = temppath.length;
                    temppath = temppath[len - 1];
                    temppath = temppath.split('.')[0];
                } else {
                    temppath = temppath.split('/')[0];
                }
            }
            temppath = temppath.replace(/\/*/g, '');
            var item,
                cache=loginService.getCache()['moduleMap'];
            for (var i in cache) {
                item = cache[i];
                if (item && item['module'] === temppath) {
                    return item['id'];
                }
            }
            return 0;
        }

        /*根据模块id获取子子菜单*/
        function getSideMenu(module_id) {
            var menumap = loginService.getCache()['menuSourceMap'][module_id],
                i = 0,
                len = menumap.length,
                res = [];

            if (len !== 0) {
                for (i; i < len; i++) {
                    var item = menumap[i],
                        obj = {};
                    obj['name'] = item['modName'];
                    obj['href'] = item['modLink'];
                    obj['active'] = '';
                    obj['power'] = true;
                    res.push(obj);
                }
                return res;
            }
            return [];
        }


    }

}());
