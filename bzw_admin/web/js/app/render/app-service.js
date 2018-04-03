/*主模块应用--服务*/
(function () {
    'use strict';

    /*创主模块应用服务*/
    angular
        .module('app')
        .service('appService', appService);


    /*服务注入依赖*/
    appService.$inject=['toolUtil'];


    /*服务实现*/
    function appService(toolUtil) {
        /*视口服务*/
        var viewmode = 'default'/*视口类型*/,
            container = 1080/*显示容器宽度*/,
            viewwidth = container - 367/*视口宽度*/,
            viewoffset = 0/*视口误差*/,
            viewside = 367/*logo + logout + padding*/,
            size = 18/*单个子宽度*/,
            gap = 60/*间距*/,
            count = 0/*多少个字符*/,
            item = 0,
            menudata/*菜单缓存*/;


        /*弹窗服务*/
        var $model = null;


        /*对外接口*/
        this.isSupport=isSupport/*兼容性*/;
        this.getSystemInfo=getSystemInfo/*获取系统信息*/;
        this.calculateMenu = calculateMenu/*视口服务--计算当前菜单的视口宽度*/;
        this.getViewWidth = getViewWidth/*视口服务--获取视口宽度*/;
        this.changeViewMode = changeViewMode/*视口服务--切换视口类型*/;
        this.renderMenu = renderMenu/*视口服务--菜单渲染*/;
        this.getLoginMessage = getLoginMessage/*视口服务--获取登录信息*/;
        this.getModalWrap = getModalWrap/*弹窗服务--获取弹窗容器dom引用*/;
        this.toggleModal = toggleModal/*弹窗服务--显示隐藏弹窗*/;
        this.configModal = configModal/*弹窗服务--配置弹窗*/;


        /*接口实现*/
        /*兼容性判断*/
        function isSupport() {
            return toolUtil.isSupport();
        }

        /*获取系统信息*/
        function getSystemInfo() {
            return toolUtil.getSystemInfo();
        }

        /*视口服务--获取视口宽度*/
        function getViewWidth() {
            if (viewmode === 'default') {
                container = 1080;
            } else if (viewmode === 'auto') {
                container = parseInt(angular.element('body').width(), 10);
                if (container < 1080) {
                    container = 1080;
                }
            } else if (viewmode === 'mini') {
                container = parseInt(angular.element('body').width(), 10);
                if (container > 640) {
                    container = 640;
                }
            }
            viewwidth = container - viewside;
        }

        /*视口服务--计算当前菜单的视口宽度,menu:菜单数组，flag:是否获取新缓存*/
        function calculateMenu(menu, flag) {
            var ismenu = false;
            if (count === 0) {
                menu ? ismenu = true : ismenu = false;
            } else if (count !== 0) {
                ismenu = true;
            }

            if (!ismenu) {
                return {
                    subshow: false,
                    mainmenu: [],
                    submenu: []
                };
            }

            /*计算当前视口宽度*/
            getViewWidth();

            /*判断缓存*/
            if (count === 0 || (menu && flag)) {
                menudata = menu.slice(0);
                item = menu.length;
            }

            /*过滤短量菜单*/
            if (viewmode === 'default') {
                if (item <= 4) {
                    return {
                        subshow: false,
                        mainmenu: menudata,
                        submenu: []
                    };
                }
            } else if (viewmode === 'auto') {
                if (viewwidth > 1500) {
                    if (item <= 10) {
                        return {
                            subshow: false,
                            mainmenu: menudata,
                            submenu: []
                        };
                    }
                } else if (viewwidth >= 1200 && viewwidth <= 1500) {
                    if (item <= 8) {
                        return {
                            subshow: false,
                            mainmenu: menudata,
                            submenu: []
                        };
                    }
                } else {
                    if (item <= 4) {
                        return {
                            subshow: false,
                            mainmenu: menudata,
                            submenu: []
                        };
                    }
                }
            } else if (viewmode === 'mini') {
                if (item <= 3) {
                    return {
                        subshow: false,
                        mainmenu: menudata,
                        submenu: []
                    };
                }
            }


            /*计算菜单视口宽度*/
            var i = 0,
                tempwidth = 0;

            /*初始化算*/
            count = 0;
            for (i; i < item; i++) {
                tempwidth += gap;
                tempwidth = parseInt(tempwidth, 10) - viewoffset;
                if (tempwidth >= viewwidth) {
                    return {
                        subshow: true,
                        mainmenu: menudata.slice(0, i),
                        submenu: menudata.slice(i)
                    };
                }
                var main = menudata[i]['name'].length;
                count += main;

                /*
                原算法
                var j = 0
                for (j; j < main; j++) {
                    tempwidth += size * (j + 1);
                    tempwidth = parseInt(tempwidth, 10);
                    if (tempwidth >= viewwidth) {
                        return {
                            subshow: true,
                            mainmenu: menudata.slice(0, i + 1),
                            submenu: menudata.slice(i + 1)
                        };
                    }
                }*/

                tempwidth = tempwidth + (size * main);
                tempwidth = parseInt(tempwidth, 10);
                if (tempwidth >= viewwidth) {
                    return {
                        subshow: true,
                        mainmenu: menudata.slice(0, i),
                        submenu: menudata.slice(i)
                    };
                }
            }
            return {
                subshow: false,
                mainmenu: menudata,
                submenu: []
            };
        }

        /*视口服务--切换视口类型*/
        function changeViewMode(value, fn) {
            viewmode = value;
            if (fn && typeof fn === 'function') {
                fn.call(null, calculateMenu());
            } else {
                return calculateMenu();
            }
        }

        /*视口服务--菜单渲染*/
        function renderMenu(model, fn) {
            if (!model) {
                return false;
            }
            var tempmenu = fn.call(null);
            model.headeritem = tempmenu.mainmenu;
            model.headersubitem = tempmenu.submenu;
            model.isshow = tempmenu.subshow;
        }

        /*视口服务--获取登录信息*/
        function getLoginMessage(model, fn) {
            if (!model) {
                return false;
            }
            var message = fn.call(null);
            if (message) {
                model.isshow = true;
                model.login = message;
            } else {
                model.isshow = false;
                model.login = [];
            }
        }



        /*弹窗服务--获取弹窗容器dom引用*/
        function getModalWrap() {
            if ($model === null) {
                $model = angular.element('#admin_modal_wrap');
            }
            return $model;
        }


        /*弹窗服务--配置弹窗*/
        function configModal(config) {
            if(config){
                return config;
            }else{
                return {
                    width: 'g-w-percent48',
                    url: 'view/modal/index.html'
                };
            }
        }

        /*弹窗服务--显示隐藏弹窗*/
        function toggleModal(config, fn) {
            var temp_timer = null;
            if (config.display === 'show') {
                if (typeof config.delay !== 'undefined') {
                    temp_timer = setTimeout(function () {
                        getModalWrap().modal('show', {backdrop: 'static'});
                        clearTimeout(temp_timer);
                        temp_timer = null;
                    }, config.delay);
                    if (fn && typeof fn === 'function') {
                        fn.call(null);
                    }
                } else {
                    getModalWrap().modal('show', {backdrop: 'static'});
                    if (fn && typeof fn === 'function') {
                        fn.call(null);
                    }
                }
            } else if (config.display === 'hide') {
                if (typeof config.delay !== 'undefined') {
                    temp_timer = setTimeout(function () {
                        getModalWrap().modal('hide');
                        /*清除延时任务序列*/
                        if (config.clear) {
                            //clearFormDelay();
                        }
                        clearTimeout(temp_timer);
                        temp_timer = null;
                    }, config.delay);
                } else {
                    getModalWrap().modal('hide');
                    /*清除延时任务序列*/
                    if (config.clear) {
                        //clearFormDelay();
                    }
                }
            }
        }
    }


}());