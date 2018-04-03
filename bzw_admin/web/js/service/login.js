/*登录服务*/
(function () {
    'use strict';

    /*定义或扩展模块*/
    angular
        .module('login', [])
        .service('loginService', loginService);


    /*服务依赖注入*/
    loginService.$inject = ['toolUtil', '$state', '$timeout', 'appService', 'testService'];


    /*服务实现*/
    function loginService(toolUtil, $state, $timeout, appService, testService) {
        var unique_key = toolUtil.getSystemUniqueKey()/*获取凭证*/,
            basedomain = toolUtil.getSystemDomain()/*获取请求域名*/,
            cache = toolUtil.getParams(unique_key)/*获取缓存*/,
            quickmenu = []/*缓存快捷子菜单*/,
            outbtn = null/*头部退出按钮引用*/,
            outid = null/*执行退出按钮时的延时监听*/;


        /*对外接口*/
        this.isLogin = isLogin/*是否登录*/;
        this.reqAction = reqAction/*处理登陆请求*/;
        this.loadMenuData = loadMenuData/*加载菜单数据*/;
        this.renderMenuData = renderMenuData/*直接获取数据源,flag:是否需要首页*/;
        this.getMenuData = getMenuData/*获取菜单数据,flag:是否需要首页*/;
        this.getValidCode = getValidCode/*获取验证码*/;
        this.setCache = setCache/*设置缓存,初始化缓存设置*/;
        this.loginOut = loginOut/*退出系统*/;
        this.clearCache = clearCache/*清除缓存*/;
        this.changeCache = changeCache/*更新成最新缓存*/;
        this.getCache = getCache/*获取已经存在的缓存*/;
        this.outAction = outAction/*设置退出按钮缓存或操作退出动作，此服务主要用于非app_ctrl控制部分*/;


        /*接口实现*/
        /*是否登录，hc：为已经登录的缓存信息*/
        function isLogin(hc) {
            var logininfo = false,
                islogin = false,
                flag = (hc && typeof hc !== 'undefined') ? true : false;

            if (flag) {
                logininfo = toolUtil.isLogin(hc);
            } else {
                logininfo = toolUtil.isLogin(cache);
            }

            if (logininfo) {
                if (flag && hc.loginMap) {
                    islogin = toolUtil.validLogin(hc.loginMap, basedomain);
                } else {
                    islogin = toolUtil.validLogin(cache.loginMap, basedomain);
                }
                /*如果缓存失效则清除缓存*/
                if (!islogin) {
                    clearCache();
                    toolUtil.clear();
                }
                return islogin;
            }
            return islogin;
        }

        /*处理登陆请求,model:为模型数据*/
        function reqAction(model) {
            toolUtil.requestHttp({
                url: '/sysuser/login',
                method: 'post',
                debug: model.debug,
                //encode:true,
                data: {
                    username: model.login.username,
                    password: model.login.password,
                    identifyingCode: model.login.identifyingCode
                }
            }).then(function (resp) {
                    if (model.debug) {
                        /*测试服务*/
                        var resp = testService.testToken();
                    }

                    var data = resp.data,
                        status = parseInt(resp.status, 10);

                    if (status === 200) {
                        var code = parseInt(data.code, 10),
                            result = data.result,
                            message = data.message;
                        if (code !== 0) {
                            if (typeof message !== 'undefined' && message !== '') {
                                model.login.loginerror = message;
                            }
                            model.login.islogin = false;
                        } else {
                            /*加载动画*/
                            toolUtil.loading({
                                type: 'show',
                                model: model.app_config
                            });
                            var tempcache = {
                                'isLogin': true,
                                'datetime': moment().format('YYYY-MM-DD|HH:mm:ss'),
                                'reqdomain': basedomain,
                                'username': model.login.username,
                                'param': {
                                    'adminId': encodeURIComponent(result.adminId),
                                    'token': encodeURIComponent(result.token),
                                    'organizationId': encodeURIComponent(result.organizationId)
                                }
                            };
                            /*设置缓存*/
                            setCache(tempcache)/*此处创建数据为空的初始化缓存*/;
                            /*设置个人信息*/
                            appService.getLoginMessage(model.message, function () {
                                var temparr = [{
                                    name: '用户名：',
                                    value: tempcache.username
                                }, {
                                    name: '登录时间：',
                                    value: tempcache.datetime
                                }];
                                return temparr;
                            });
                            /*加载菜单*/
                            loadMenuData(model, function () {
                                /*更新缓存*/
                                cache = toolUtil.getParams(unique_key);
                                toolUtil.loading({
                                    type: 'hide',
                                    model: model.app_config
                                });
                                /*重置登录信息*/
                                model.login.username = '';
                                model.login.password = '';
                                model.login.identifyingCode = '';
                                model.login.islogin = true;
                                model.login.loginerror = '';
                            });
                        }
                    } else {
                        model.login.islogin = false;
                    }
                },
                function (resp) {
                    /*重置登录信息*/
                    model.login.username = '';
                    model.login.password = '';
                    model.login.identifyingCode = '';
                    model.login.islogin = false;
                    var faildata = resp.data;
                    if (faildata) {
                        var message = faildata.message;
                        if (typeof message !== 'undefined' && message !== '') {
                            model.login.loginerror = message;
                        } else {
                            model.login.loginerror = '登录失败';
                        }
                    }else{
                        model.login.loginerror = '登录失败';
                    }
                });
        }

        /*加载菜单数据*/
        function loadMenuData(config, fn) {
            /*判断登陆缓存是否有效*/
            if (!cache.cacheMap.menuload) {
                toolUtil
                    .requestHttp({
                        url: '/module/menu',
                        method: 'post',
                        debug: config.debug, /*测试开关*/
                        data: cache.loginMap.param
                    })
                    .then(function (resp) {
                            /*测试菜单*/
                            if (config.debug) {
                                var resp = config.create ? testService.testMenu({
                                    create: true
                                }) : testService.testMenu();
                            }
                            var data = resp.data,
                                status = parseInt(resp.status, 10);
                            if (status === 200) {
                                var code = parseInt(data.code, 10),
                                    message = data.message;
                                if (code !== 0) {
                                    if (fn && typeof fn === 'function') {
                                        fn.call(null);
                                    }
                                    if (typeof message !== 'undefined' && message !== '') {
                                        console.log(message);
                                    }
                                    if (code === 999) {
                                        /*退出系统*/
                                        loginOut(true);
                                    }
                                } else {
                                    /*加载数据*/
                                    var result = data.result;
                                    if (typeof result !== 'undefined') {
                                        /*flag:是否设置首页*/
                                        var list = toolUtil.resolveMainMenu(result.menu, true);
                                        /*执行初始化导航*/
                                        if (config) {
                                            renderMenuData({
                                                menu: config.menu,
                                                viewmode: config.viewmode,
                                                flag: true,
                                                list: toolUtil.loadMainMenu(list['menu'])
                                            })
                                        }
                                        if (list !== null) {
                                            /*设置缓存*/
                                            cache['cacheMap'] = {
                                                menuload: true,
                                                powerload: true
                                            };
                                            cache['moduleMap'] = list['module'];
                                            cache['menuMap'] = list['menu'];
                                            cache['powerMap'] = list['power'];
                                            cache['menuSourceMap'] = list['menusource'];
                                            /*更新缓存*/
                                            toolUtil.setParams(unique_key, cache);
                                            if (fn && typeof fn === 'function') {
                                                fn.call(null);
                                            }
                                        }
                                    } else {
                                        if (fn && typeof fn === 'function') {
                                            fn.call(null);
                                        }
                                    }
                                }
                            }
                        },
                        function (resp) {
                            if (fn && typeof fn === 'function') {
                                fn.call(null);
                            }

                            var faildata = resp.data;
                            if (faildata) {
                                var message = faildata.message;
                                if (typeof message !== 'undefined' && message !== '') {
                                    console.log(message);
                                } else {
                                    console.log('请求菜单失败');
                                }
                            }else{
                                console.log('请求菜单失败');
                            }
                        });
            }
        }

        /*直接获取数据源,flag:是否需要首页*/
        function renderMenuData(model) {
            if (model.list && model.list !== null) {
                quickmenu = model.list;
                appService.renderMenu(model.menu, function () {
                    var tempmenu;
                    if (model.flag) {
                        tempmenu = quickmenu.slice(0);
                    } else {
                        tempmenu = quickmenu.slice(1);
                    }
                    return appService.calculateMenu(tempmenu);
                });
            } else {
                quickmenu = [];
            }
        }

        /*获取菜单数据,flag:是否需要首页*/
        function getMenuData(flag) {
            if (quickmenu.length === 0) {
                if (cache.cacheMap.menuload) {
                    /*直接加载缓存*/
                    var list = toolUtil.loadMainMenu(cache.menuMap);
                    if (list !== null) {
                        quickmenu = list;
                        if (flag) {
                            return quickmenu.slice(0);
                        } else {
                            return quickmenu.slice(1);
                        }
                    } else {
                        quickmenu = [];
                        return [];
                    }
                } else {
                    return [];
                }
            } else {
                if (flag) {
                    return quickmenu.slice(0);
                } else {
                    return quickmenu.slice(1);
                }
            }
        }

        /*获取验证码*/
        function getValidCode(config) {
            if (config.debug) {
                (function () {
                    var code = Mock.mock(/[a-zA-Z0-9]{4}/),
                        imgsrc = Mock.Random.image('80x40', '#ffffff', '#666666', code),
                        img = document.createElement("img");

                    img.src = imgsrc;
                    if (config.wrap) {
                        angular.element('#' + config.wrap).html(img) || $('#' + config.wrap).html(img);
                    } else if (config.fn && typeof config.fn === 'function') {
                        config.fn.call(null, img);
                    }
                }());
            } else {
                var xhr = new XMLHttpRequest(),
                    url = toolUtil.adaptReqUrl(config);
                xhr.open("post", url, true);
                xhr.responseType = "blob";
                xhr.onreadystatechange = function () {
                    if (this.status == 200) {
                        var blob = this.response,
                            img = document.createElement("img");

                        img.alt = '验证码';
                        try {
                            img.onload = function (e) {
                                window.URL.revokeObjectURL(img.src);
                            };
                            img.src = window.URL.createObjectURL(blob);
                        } catch (e) {
                            console.log('不支持URL.createObjectURL');
                        }

                        if (config.wrap) {
                            angular.element('#' + config.wrap).html(img) || $('#' + config.wrap).html(img);
                        } else if (config.fn && typeof config.fn === 'function') {
                            config.fn.call(null, img);
                        }
                    }
                };
                xhr.send();
            }
        }

        /*设置缓存*/
        function setCache(data) {
            if (cache) {
                cache.loginMap = data;
            } else {
                cache = {
                    cacheMap: {
                        menuload: false,
                        powerload: false,
                        menusoruce: false
                    }/*缓存加载情况记录*/,
                    routeMap: {
                        prev: '',
                        current: '',
                        history: []
                    }/*路由缓存*/,
                    moduleMap: {}/*模块缓存*/,
                    menuMap: {}/*菜单缓存*/,
                    powerMap: {}/*权限缓存*/,
                    loginMap: data/*登录认证缓存*/,
                    settingMap: {}/*设置缓存*/,
                    menuSourceMap: {}/*解析后的菜单源码缓存，用于菜单加载时直接应用，而不需要解析*/,
                    tempMap: {}/*临时缓存*/
                };
            }
            toolUtil.setParams(unique_key, cache);
        }

        /*退出系统*/
        function loginOut(flag) {
            clearCache();
            toolUtil.clear();
            /*路由*/
            if (flag) {
                $state.go('app');
            }
            return true;
        }

        /*清除缓存*/
        function clearCache() {
            cache = null;
            quickmenu = [];
        }

        /*更新成最新缓存*/
        function changeCache(flag) {
            cache = toolUtil.getParams(unique_key)/*获取缓存*/;
            if(flag){
                return cache;
            }
        }

        /*获取已经存在的缓存*/
        function getCache() {
            return cache;
        }

        /*设置退出按钮缓存或操作退出动作，此服务试用非app_ctrl控制部分*/
        function outAction(config) {
            if (outbtn === null && config.$btn) {
                outbtn = config.$btn;
            } else if (outbtn !== null) {
                if (config && typeof config.fn === 'function') {
                    fn.call(null);
                }
                outid = $timeout(function () {
                    outbtn.triggerHandler('click');
                    if (outid !== null) {
                        $timeout.cancel(outid);
                        outid = null;
                    }
                }, 0);
            }
        }


    }


}());