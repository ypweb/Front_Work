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
        var h_items = [],
            h_len = 0,
            colgroup = []/*分组*/,
            thead = []/*普通的头*/,
            all_thead = []/*拥有全选的头*/,
            tbody = [];


        /*初始化执行*/
        init();


        this.init = init/*初始化方法*/;
        this.createColgroup = createColgroup/*生成分组*/;
        this.createThead = createThead/*生成头部*/;
        this.createTbody = createTbody/*生成主体*/;
        this.reqUserPowerList = reqUserPowerList/*请求用户权限列表(主要是根据不同对象查询相关权限):config:请求参数，mode:模型*/;
        this.reqPowerList = reqPowerList/*请求权限列表(主要是根据不同对象查询相关权限):config:请求参数，mode:模型*/;
        this.resolvePowerList = resolvePowerList/*解析权限列表*/;
        this.filterPower = filterPower/*权限服务--过滤用户权限*/;
        this.getCurrentPower = getCurrentPower/*权限服务--获取当前用户的权限缓存,key(id，模块名称)*/;
        this.getPowerListByModule = getPowerListByModule/*根据模块判断拥有的权限(拥有的权限),key:(索引，模块名称),cache:模块；此方法结果一般与isPower配合使用*/;
        this.isPower = isPower/*根据关键词判断权限flag:是否过滤没有的权限*/;
        this.getIdByPath = getIdByPath/*根据路径获取ID*/;
        this.getSideMenu = getSideMenu/*根据模块id获取子子菜单*/;


        /*初始化方法*/
        function init(flag) {
            /*有数据即调数据，没数据就创建数据*/
            if (flag && thead.length !== 0 && colgroup.length !== 0 && h_items.length !== 0) {
                return false;
            }
            var powerCache = loginService.getCache()['powerMap'];
            if (powerCache) {
                var index = 0;

                for (var i in powerCache) {
                    /*过滤首页*/
                    if (parseInt(i, 10) === 0) {
                        continue;
                    }
                    h_items.push(i);
                    all_thead.push({
                        index: index,
                        id: powerCache[i]["id"],
                        isPermit: 0,
                        module: powerCache[i]["module"],
                        name: powerCache[i]["name"]
                    });
                    thead.push({
                        index: index,
                        name: powerCache[i]["name"]
                    });
                    index++;
                }

                if (h_items.length !== 0) {
                    var len = h_items.length,
                        j = 0,
                        colitem = parseInt(50 / len, 10);

                    /*初始化赋值*/
                    h_len = len;

                    /*解析分组*/
                    if (colitem * len <= (50 - len)) {
                        colitem = len + 1;
                    }
                    for (j; j < len; j++) {
                        colgroup.push({
                            'col_class': "g-w-percent" + colitem
                        });
                    }
                }
            } else {
                all_thead = [{
                    index: 0,
                    id: 0,
                    module: 0,
                    isPermit: 0,
                    name: ''
                }];
                thead = [{
                    index: 0,
                    name: ''
                }];
                colgroup = [{
                    'col_class': "g-w-percent50"
                }];
            }
        }

        /*生成分组*/
        function createColgroup() {
            /*flag:是否有全选*/
            return colgroup.slice(0);
        }

        /*生成头部*/
        function createThead(flag) {
            /*flag:是否有全选*/
            return flag ? all_thead.slice(0) : thead.slice(0);
        }

        /*生成头部*/
        function createTbody() {
            return tbody.slice(0);
        }

        /*请求权限列表(主要是根据不同对象查询相关权限):config:请求参数，mode:模型*/
        function reqPowerList(config, fn) {
            /*合并参数*/
            var debug = config.debug,
                create = config.create,
                israndom = config.israndom,
                tempparm = loginService.getCache().loginMap.param,
                param = {
                    adminId: tempparm.adminId,
                    token: tempparm.token,
                    organizationId: typeof config.organizationId !== 'undefined' ? config.organizationId : tempparm.organizationId
                };
            /*合并参数*/
            if(config.param){
                for(var k in config.param){
                    param[k]=config.param[k];
                }
            }

            toolUtil
                .requestHttp({
                    url: '/organization/permission/select',
                    method: 'post',
                    debug: debug,
                    data: param
                })
                .then(function (resp) {
                        if (debug) {
                            var resp = israndom ? testService.testMenu({
                                israndom: israndom,
                                create: create
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
                                    tbody.length = 0;
                                    if (fn && typeof fn === 'function') {
                                        fn.call(null);
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
                                                tbody.length = 0;
                                                if (fn && typeof fn === 'function') {
                                                    fn.call(null);
                                                }
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
                                                    var temp_power = templist['power'];
                                                    /*将模块数据解析转换成html数据*/
                                                    resolvePowerList({
                                                        menu: temp_power
                                                    });
                                                } else {
                                                    tbody.length = 0;
                                                }
                                                if (fn && typeof fn === 'function') {
                                                    fn.call(null);
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
                                            tbody.length = 0;
                                            if (fn && typeof fn === 'function') {
                                                fn.call(null);
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
                                        tbody.length = 0;
                                        if (fn && typeof fn === 'function') {
                                            fn.call(null);
                                        }
                                    }
                                }
                            }
                        }
                    },
                    function (resp) {
                        var faildata = resp.data;
                        if (faildata) {
                            var message = faildata.message;
                            if (typeof message !== 'undefined' && message !== '') {
                                console.log(message);
                            } else {
                                console.log('请求权限失败');
                            }
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
                            tbody.length = 0;
                            if (fn && typeof fn === 'function') {
                                fn.call(null);
                            }
                        }
                    });
        }

        /*请求用户权限列表(主要是根据不同对象查询相关权限):config:请求参数，mode:模型*/
        function reqUserPowerList(config) {
            /*合并参数*/
            var debug = config.debug,
                param = config.param,
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
                            /*将模块数据解析转换成html数据*/
                            resolvePowerList({
                                menu: datalist
                            });
                        } else {
                            tbody.length = 0;
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
                                            tbody.length = 0;
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
                                                    tbody.length = 0;
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
                                                        var temp_power = templist['power'];
                                                        /*将模块数据解析转换成html数据*/
                                                        resolvePowerList({
                                                            menu: temp_power
                                                        });
                                                    } else {
                                                        tbody.length = 0;
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
                                                tbody.length = 0;
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
                                            tbody.length = 0;
                                        }
                                    }
                                }
                            }
                        },
                        function (resp) {
                            var faildata = resp.data;
                            if (faildata) {
                                var message = faildata.message;
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
                                tbody.length = 0;
                            }
                        });
            }
        }

        /*解析权限列表*/
        function resolvePowerList(config) {
            tbody.length = 0;
            /*解析数据*/
            var powerCache = loginService.getCache()['powerMap'],
                len = h_items.length,
                i = 0,
                ispermit,
                request = (config && config.menu) ? true : false;

            if (len === 0) {
                tbody.length = 0;
            } else {
                if (request) {
                    var menuitem = config.menu;
                }
                for (i; i < len; i++) {
                    var index = parseInt(h_items[i], 10),
                        item = request ? menuitem[index] : powerCache[index];

                    if (typeof item === 'undefined' || !item) {
                        tbody.push({});
                        continue;
                    }

                    var power = item['power'],
                        j = 0,
                        sublen = power.length,
                        itemobj = {};

                    for (j; j < sublen; j++) {
                        var subitem = power[j],
                            tempobj = {};
                        /*根据设置或者配置结果来*/
                        ispermit = parseInt(subitem["isPermit"], 10);
                        if (isNaN(ispermit)) {
                            ispermit = 0;
                        }
                        tempobj["isPermit"] = ispermit;
                        tempobj["index"] = i;
                        tempobj["prid"] = subitem["prid"];
                        tempobj["modId"] = subitem["modId"];
                        tempobj["module"] = item["module"];
                        tempobj["funcName"] = subitem["funcName"];
                        itemobj[subitem["prid"]] = tempobj;
                    }
                    tbody.push(itemobj);
                }
            }
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

        /*权限服务--获取当前用户的权限缓存,key(id，模块名称)*/
        function getCurrentPower(key) {
            var cache = loginService.getCache()['powerMap'];
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
                cache = loginService.getCache()['moduleMap'];
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
