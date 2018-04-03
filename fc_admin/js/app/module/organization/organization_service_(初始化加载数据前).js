angular.module('app')
    .service('organizationService', ['toolUtil', 'toolDialog', 'BASE_CONFIG', 'loginService', 'powerService', 'addressService', '$timeout', 'testService', function (toolUtil, toolDialog, BASE_CONFIG, loginService, powerService, addressService, $timeout, testService) {

        /*获取缓存数据*/
        var self = this,
            module_id = 10/*模块id*/,
            cache = loginService.getCache(),
            structform_reset_timer = null,
            userform_reset_timer = null;


        /*权限服务--查询列表*/
        var powermap = powerService.getCurrentPower(module_id);


        /*初始化权限*/
        var init_power = {
            organization_add: toolUtil.isPower('organization-add', powermap, true)/*添加机构*/,
            organization_delete: toolUtil.isPower('organization-delete', powermap, true)/*删除机构*/,
            organization_edit: toolUtil.isPower('organization-edit', powermap, true)/*编辑机构*/,
            role_add: toolUtil.isPower('role-add', powermap, true), /*添加角色*/
            user_add: toolUtil.isPower('user-add', powermap, true)/*添加用户*/,
            user_view: toolUtil.isPower('user-view', powermap, true)/*查看用户*/,
            user_update: toolUtil.isPower('user-update', powermap, true)/*编辑用户*/
        };


        /*扩展服务--初始化jquery dom节点*/
        this.initJQDom = function (dom) {
            if (dom) {
                /*复制dom引用*/
                for (var i in dom) {
                    self[i] = dom[i];
                }
            }
        };
        /*扩展服务--初始化jquery dom节点(power)*/
        this.initForPower = function (config) {
            powerService.init(config);
            if (config.dom) {
                self.initJQDom(config.dom);
            }
        };
        /*扩展服务--查询操作权限*/
        this.getCurrentPower = function () {
            return init_power;
        };
        /*扩展服务--弹出层显示隐藏*/
        this.toggleModal = function (config, fn) {
            var temp_timer = null,
                type_map = {
                    'struct': self.$admin_struct_dialog,
                    'user': self.$admin_user_dialog,
                    'userdetail': self.$admin_userdetail_dialog
                };
            if (config.display === 'show') {
                if (typeof config.delay !== 'undefined') {
                    temp_timer = setTimeout(function () {
                        type_map[config.area].modal('show', {backdrop: 'static'});
                        clearTimeout(temp_timer);
                        temp_timer = null;
                    }, config.delay);
                    if (fn && typeof fn === 'function') {
                        fn.call(null);
                    }
                } else {
                    type_map[config.area].modal('show', {backdrop: 'static'});
                    if (fn && typeof fn === 'function') {
                        fn.call(null);
                    }
                }
            } else if (config.display === 'hide') {
                if (typeof config.delay !== 'undefined') {
                    temp_timer = setTimeout(function () {
                        type_map[config.area].modal('hide');
                        clearTimeout(temp_timer);
                        temp_timer = null;
                    }, config.delay);
                } else {
                    type_map[config.area].modal('hide');
                }
                /*清除延时任务序列*/
                if (config.area === 'struct' || config.area === 'user') {
                    self.clearFormDelay();
                }
            }
        };
        /*扩展服务--退出系统*/
        this.loginOut = function () {
            loginService.outAction();
        };


        /*导航服务--获取虚拟挂载点*/
        this.getRoot = function (record) {
            if (cache === null) {
                loginService.outAction();
                record['currentId1'] = '';
                record['currentName1'] = '';
                record['organizationId'] = '';
                record['organizationName'] = '';
                return false;
            }
            var islogin = loginService.isLogin(cache);
            if (islogin) {
                var logininfo = cache.loginMap;
                record['currentId1'] = logininfo.param.organizationId;
                record['currentName1'] = logininfo.username;
                record['organizationId'] = logininfo.param.organizationId;
                record['organizationName'] = logininfo.username;
            } else {
                /*退出系统*/
                cache = null;
                loginService.outAction();
                record['currentId1'] = '';
                record['currentName1'] = '';
                record['organizationId'] = '';
                record['organizationName'] = '';
            }
        };
        /*导航服务--获取导航*/
        this.getMenuList = function (config) {
            if (cache) {
                var type = config.type,
                    record,
                    tempparam = cache.loginMap.param,
                    param = {
                        token: tempparam.token,
                        adminId: tempparam.adminId,
                        isShowSelf: 0
                    },
                    layer,
                    id,
                    $wrap,
                    url = '';

                if (type === 'fc') {
                    /*判断是否为搜索模式*/
                    if (config.record.searchname1 !== '') {
                        self.initRecord({
                            record: config.record,
                            flag: true,
                            type: type
                        });
                        param['fullName'] = config.record.searchname1;
                    }
                    record = config.record;
                    layer = record.layer1;
                    /*查询分仓*/
                    if (record.organizationId === '' && record.currentId1 === '') {
                        return false;
                    }
                    id = record.organizationId === '' ? record.currentId1 : record.organizationId;
                    param['organizationId'] = id;

                    /*初始化加载*/
                    if (record.current1 === null) {
                        /*根目录则获取新配置参数*/
                        $wrap = self.$admin_struct_submenu;
                    } else {
                        /*非根目录则获取新请求参数*/
                        $wrap = record.current1.next();
                    }
                    url = '/organization/lowers/search';
                } else if (type === 'yy') {
                    /*判断是否为搜索模式*/
                    if (config.record.searchname2 !== '') {
                        self.initRecord({
                            record: config.record,
                            flag: true,
                            type: type
                        });
                        param['fullName'] = config.record.searchname2;
                    }
                    record = config.record;
                    layer = record.layer2;
                    /*查询运营*/
                    id = record.carrieroperatorId === '' ? record.currentId2 : record.carrieroperatorId;
                    if (id !== '') {
                        param['carrieroperatorId'] = id;
                    }

                    /*初始化加载*/
                    if (record.current2 === null) {
                        /*根目录则获取新配置参数*/
                        $wrap = self.$admin_yystruct_menu;
                    } else {
                        /*非根目录则获取新请求参数*/
                        $wrap = record.current2.next();
                    }
                    url = '/carrieroperator/lowers/search';
                }

                toolUtil
                    .requestHttp({
                        url: url,
                        method: 'post',
                        set: true,
                        data: param
                    })
                    .then(function (resp) {
                            var data = resp.data,
                                status = parseInt(resp.status, 10);

                            if (status === 200) {
                                var code = parseInt(data.code, 10),
                                    message = data.message;
                                if (code !== 0) {
                                    if (typeof message !== 'undefined' && message !== '') {
                                        console.log(message);
                                    }

                                    if (code === 999) {
                                        /*退出系统*/
                                        cache = null;
                                        loginService.outAction();
                                    }
                                } else {
                                    /*加载数据*/
                                    var result = data.result;
                                    if (typeof result !== 'undefined') {
                                        var list = result.list,
                                            str = '';
                                        if (list) {
                                            var len = list.length;
                                            if (len === 0) {
                                                if (type === 'fc') {
                                                    record.hasdata1 = false;
                                                    if (layer === 0) {
                                                        $wrap.html('<li><a>暂无数据</a></li>');
                                                        self.$admin_submenu_wrap.attr({
                                                            'data-list': false
                                                        });
                                                    } else {
                                                        $wrap.html('');
                                                        /*清除显示下级菜单导航图标*/
                                                        record.current1.attr({
                                                            'data-isrequest': true
                                                        }).removeClass('sub-menu-title sub-menu-titleactive');
                                                    }
                                                } else if (type === 'yy') {
                                                    record.hasdata2 = false;
                                                    if (layer === 0) {
                                                        $wrap.html('<li><a>暂无数据</a></li>');
                                                        self.$admin_yystruct_wrap.attr({
                                                            'data-list': false
                                                        });
                                                    } else {
                                                        $wrap.html('');
                                                        /*清除显示下级菜单导航图标*/
                                                        record.current2.attr({
                                                            'data-isrequest': true
                                                        }).removeClass('sub-menu-title sub-menu-titleactive');
                                                    }
                                                }
                                            } else {
                                                /*数据集合，最多嵌套层次*/
                                                str = self.resolveMenuList(list, BASE_CONFIG.submenulimit, {
                                                    layer: layer,
                                                    id: id,
                                                    type: type
                                                });
                                                if (type === 'fc') {
                                                    if (str !== '') {
                                                        record.hasdata1 = true;
                                                        if (layer === 0) {
                                                            /*搜索模式*/
                                                            self.$admin_submenu_wrap.attr({
                                                                'data-list': true
                                                            });
                                                        }
                                                        $(str).appendTo($wrap.html(''));
                                                    } else {
                                                        record.hasdata1 = false;
                                                        if (layer === 0) {
                                                            /*搜索模式*/
                                                            self.$admin_submenu_wrap.attr({
                                                                'data-list': false
                                                            });
                                                        }
                                                    }
                                                    if (layer !== 0 && record.current1) {
                                                        record.current1.attr({
                                                            'data-isrequest': true
                                                        });
                                                    }
                                                } else if (type === 'yy') {
                                                    if (str !== '') {
                                                        record.hasdata2 = true;
                                                        if (layer === 0) {
                                                            /*搜索模式*/
                                                            self.$admin_yystruct_wrap.attr({
                                                                'data-list': true
                                                            });
                                                        }
                                                        $(str).appendTo($wrap.html(''));
                                                        /*执行初始化操作*/

                                                    } else {
                                                        record.hasdata2 = false;
                                                        if (layer === 0) {
                                                            /*搜索模式*/
                                                            self.$admin_yystruct_wrap.attr({
                                                                'data-list': false
                                                            });
                                                        }
                                                    }
                                                    if (layer !== 0 && record.current2) {
                                                        record.current2.attr({
                                                            'data-isrequest': true
                                                        });
                                                    }
                                                }
                                            }
                                        } else {
                                            if (type === 'fc') {
                                                record.hasdata1 = false;
                                                if (layer === 0) {
                                                    $wrap.html('<li><a>暂无数据</a></li>');
                                                    self.$admin_submenu_wrap.attr({
                                                        'data-list': false
                                                    });
                                                }
                                            } else if (type === 'yy') {
                                                record.hasdata2 = false;
                                                if (layer === 0) {
                                                    $wrap.html('<li><a>暂无数据</a></li>');
                                                    self.$admin_yystruct_wrap.attr({
                                                        'data-list': false
                                                    });
                                                }
                                            }
                                        }
                                    } else {
                                        if (type === 'fc') {
                                            record.hasdata1 = false;
                                            if (layer === 0) {
                                                $wrap.html('<li><a>暂无数据</a></li>');
                                                self.$admin_submenu_wrap.attr({
                                                    'data-list': false
                                                });
                                            }
                                        } else if (type === 'yy') {
                                            record.hasdata2 = false;
                                            if (layer === 0) {
                                                $wrap.html('<li><a>暂无数据</a></li>');
                                                self.$admin_yystruct_wrap.attr({
                                                    'data-list': false
                                                });
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        function (resp) {
                            if (type === 'fc') {
                                record.hasdata1 = false;
                                if (layer === 0) {
                                    $wrap.html('<li><a>暂无数据</a></li>');
                                    self.$admin_submenu_wrap.attr({
                                        'data-list': false
                                    });
                                }
                            } else if (type === 'yy') {
                                record.hasdata2 = false;
                                if (layer === 0) {
                                    $wrap.html('<li><a>暂无数据</a></li>');
                                    self.$admin_yystruct_wrap.attr({
                                        'data-list': false
                                    });
                                }
                            }
                            var message = resp.data.message;
                            if (typeof message !== 'undefined' && message !== '') {
                                console.log(message);
                            } else {
                                console.log('请求菜单失败');
                            }
                        });
            } else {
                /*退出系统*/
                cache = null;
                loginService.outAction();
            }
        };
        /*导航服务--解析导航--开始解析*/
        this.resolveMenuList = function (obj, limit, config) {
            if (!obj || typeof obj === 'undefined') {
                return false;
            }
            if (typeof limit === 'undefined' || limit <= 0) {
                limit = 1;
            }
            var menulist = obj,
                str = '',
                i = 0,
                len = menulist.length,
                layer = config.layer;

            layer++;

            if (len !== 0) {
                for (i; i < len; i++) {
                    var curitem = menulist[i];
                    /*到达极限的前一项则不创建子菜单容器*/
                    if (limit >= 1 && layer >= limit) {
                        str += self.doItemMenuList(curitem, {
                                flag: false,
                                limit: limit,
                                layer: layer,
                                id: config.id,
                                type: config.type
                            }) + '</li>';
                    } else {
                        str += self.doItemMenuList(curitem, {
                                flag: true,
                                limit: limit,
                                layer: layer,
                                id: config.id,
                                type: config.type
                            }) + '<ul></ul></li>';
                    }
                }
                return str;
            } else {
                return '';
            }
        };
        /*导航服务--解析导航--公共解析*/
        this.doItemMenuList = function (obj, config) {
            var curitem = obj,
                id = curitem["id"],
                label = curitem["fullName"] || '',
                str = '',
                type = config.type,
                flag = config.flag,
                layer = config.layer,
                parentid = config.id;

            /*分子查询*/
            if (type === 'fc') {
                if (flag) {
                    str = '<li><a data-isrequest="false" data-parentid="' + parentid + '" data-layer="' + layer + '" data-id="' + id + '" class="sub-menu-title" href="#" title="">' + label + '</a>';
                } else {
                    str = '<li><a data-parentid="' + parentid + '"  data-layer="' + layer + '" data-id="' + id + '"  href="#" title="">' + label + '</a></li>';
                }
            } else if (type === 'yy') {
                str = '<li><a data-parentid="' + parentid + '" data-layer="' + layer + '" data-label="' + label + '" data-id="' + id + '" href="#" title=""><label class="sub-menu-checkbox" data-id="' + id + '"></label>' + label + '</a>';
            }
            return str;
        };
        /*导航服务--显示隐藏菜单*/
        this.toggleMenuList = function (e, config) {
            /*阻止冒泡和默认行为*/
            e.preventDefault();
            e.stopPropagation();

            /*过滤对象*/
            var target = e.target,
                node = target.nodeName.toLowerCase();
            if (node === 'ul' || node === 'li') {
                return false;
            }

            var record = config.record/*模型缓存*/,
                type = config.type/*业务类型*/;


            if (node === 'a') {
                /*正常操作*/
                var $this = $(target),
                    haschild = $this.hasClass('sub-menu-title'),
                    hasdata = $this.attr('data-id'),
                    $child,
                    isrequest = false,
                    temp_layer,
                    temp_id,
                    temp_label;

                if (typeof hasdata === 'undefined') {
                    /*过滤非法数据节点*/
                    return false;
                }

                temp_layer = $this.attr('data-layer');
                temp_id = hasdata;


                if (type === 'fc') {
                    temp_label = $this.html();
                    /*变更操作记录模型--激活高亮*/
                    if (record.current1 === null) {
                        record.current1 = $this;
                    } else {
                        record.prev1 = record.current1;
                        record.current1 = $this;
                        record.prev1.removeClass('sub-menuactive');
                    }
                    record.current1.addClass('sub-menuactive');

                    /*变更模型*/
                    record.layer1 = temp_layer;
                    record.organizationId = temp_id;
                    record.organizationName = temp_label;
                } else if (type === 'yy') {
                    temp_label = $this.attr('data-label');
                    /*变更操作记录模型--激活高亮*/
                    if (record.current2 === null) {
                        record.current2 = $this;
                    } else {
                        record.prev2 = record.current2;
                        record.current2 = $this;
                        record.prev2.removeClass('sub-menuactive');
                    }
                    record.current2.addClass('sub-menuactive');

                    /*变更模型*/
                    record.layer2 = temp_layer;
                    record.carrieroperatorId = temp_id;
                    record.carrieroperatorName = temp_label;
                }

                /*查询子集*/
                if (haschild) {
                    $child = $this.next();
                    if ($child.hasClass('g-d-showi')) {
                        /*隐藏*/
                        $child.removeClass('g-d-showi');
                        $this.removeClass('sub-menu-titleactive');
                        if (type === 'fc') {
                            record.hasdata1 = true;
                        } else if (type === 'yy') {
                            record.hasdata2 = true;
                        }
                    } else {
                        /*显示*/
                        $child.addClass('g-d-showi');
                        $this.addClass('sub-menu-titleactive');
                        isrequest = $this.attr('data-isrequest');
                        if (isrequest === 'false') {
                            /*重新加载*/
                            /*获取非根目录数据*/
                            self.getMenuList(config);
                        } else if (isrequest === 'true') {
                            /*已加载的直接遍历存入操作区域*/
                            if (type === 'fc') {
                                record.hasdata1 = true;
                            } else if (type === 'yy') {
                                record.hasdata2 = true;
                            }
                        }

                    }
                } else {
                    if (type === 'fc') {
                        record.hasdata1 = false;
                    } else if (type === 'yy') {
                        record.hasdata2 = false;
                    }
                }
            } else if (node === 'label') {
                /*选中操作*/
                self.operatorCheck({
                    type: 'item',
                    target: target,
                    record: config.record
                });
            }
        };
        /*导航服务--跳转至虚拟挂载点*/
        this.rootMenuList = function (e, config) {
            /*阻止冒泡和默认行为*/
            e.preventDefault();
            e.stopPropagation();

            /*过滤对象*/
            var target = e.target,
                node = target.nodeName.toLowerCase(),
                type = config.type;

            if (node === 'a') {
                var $this = $(e.target),
                    islist = $this.attr('data-list');

                /*更新操作模型*/
                self.initRecord({
                    record: config.record,
                    type: type,
                    flag: false
                });

                if ($this.hasClass('sub-menu-titleactive')) {
                    /*隐藏*/
                    $this.removeClass('sub-menu-titleactive');
                } else {
                    /*显示*/
                    $this.addClass('sub-menu-titleactive');
                    if (islist === 'true') {
                        if (type === 'fc') {
                            config.record.hasdata1 = true;
                        } else if (type === 'yy') {
                            config.record.hasdata2 = true;
                        }
                    } else if (islist === 'false') {
                        if (type === 'fc') {
                            config.record.hasdata1 = false;
                        } else if (type === 'yy') {
                            config.record.hasdata2 = false;
                        }
                    }
                }

                if (type === 'fc') {
                    config.record.current1 = $this;
                    /*切换显示隐藏*/
                    self.$admin_struct_submenu.toggleClass('g-d-showi');
                } else if (type === 'yy') {
                    config.record.current2 = $this;
                    /*切换显示隐藏*/
                    self.$admin_yystruct_menu.toggleClass('g-d-showi');
                }
            } else if (node === 'label') {
                self.operatorCheck({
                    target: target,
                    type: 'all',
                    record: config.record
                });
            }
        };


        /*操作记录服务--初始化操作参数(搜索模式或者重置操作参数模式)*/
        this.initRecord = function (config) {
            var flag = config.flag,
                record = config.record,
                type = config.type;


            if (type === 'fc') {
                /*是否重置数据*/
                if (flag) {
                    record.hasdata1 = false;
                }
                record.layer1 = 0;
                record.organizationId = record.currentId1;
                record.organizationName = record.currentName1;
                if (record.prev1 !== null) {
                    record.prev1.removeClass('sub-menuactive');
                    record.current1.removeClass('sub-menuactive');
                    record.prev1 = null;
                } else if (record.current1 !== null) {
                    record.current1.removeClass('sub-menuactive');
                }
                record.current1 = null;
            } else if (type === 'yy') {
                /*是否重置数据*/
                if (flag) {
                    record.hasdata2 = false;
                }
                record.layer2 = 0;
                record.carrieroperatorId = '';
                record.carrieroperatorName = '';

                if (record.prev2 !== null) {
                    record.prev2.removeClass('sub-menuactive');
                    record.current2.removeClass('sub-menuactive');
                    record.prev2 = null;
                } else if (record.current2 !== null) {
                    record.current2.removeClass('sub-menuactive');
                }
            }
        };

        /*机构服务--获取机构列表*/
        this.getOperateList = function (config, $span) {
            if (cache) {
                var param = $.extend(true, {}, cache.loginMap.param),
                    $item = $span.parent(),
                    $ul = $item.find('ul'),
                    layer = $item.attr('data-layer'),
                    id = $span.attr('data-id');


                param['isShowSelf'] = 0;
                if (config.record.searchname1 !== '') {
                    param['fullName'] = record.searchname1;
                }
                param['organizationId'] = id;


                toolUtil
                    .requestHttp({
                        url: '/organization/lowers/search',
                        method: 'post',
                        set: true,
                        data: param
                    })
                    .then(function (resp) {
                            var data = resp.data,
                                status = parseInt(resp.status, 10);

                            if (status === 200) {
                                var code = parseInt(data.code, 10),
                                    message = data.message;
                                if (code !== 0) {
                                    if (typeof message !== 'undefined' && message !== '') {
                                        console.log(message);
                                    } else {
                                        console.log('获取子机构失败');
                                    }

                                    if (code === 999) {
                                        /*退出系统*/
                                        cache = null;
                                        loginService.outAction();
                                    }
                                } else {
                                    /*加载数据*/
                                    var result = data.result;
                                    if (typeof result !== 'undefined') {
                                        var list = result.list,
                                            str = '';
                                        if (list) {
                                            var len = list.length;
                                            if (len === 0) {
                                                $ul.html('');
                                                /*清除显示下级菜单导航图标*/
                                                $span.attr({
                                                    'data-isrequest': true
                                                });
                                                $item.removeClass();
                                            } else {
                                                /*数据集合，最多嵌套层次*/
                                                $span.attr({
                                                    'data-isrequest': true,
                                                    'title': '查看'
                                                });
                                                $item.removeClass().addClass('ts-child');
                                                var i = 0;
                                                layer++;
                                                for (i; i < len; i++) {
                                                    var curitem = list[i];
                                                    str += '<li data-layerflag="child" data-layer="' + layer + '" data-parentid="' + id + '" data-label="' + curitem['fullName'] + '" data-id="' + curitem['id'] + '">' + curitem["fullName"] + '</li>';
                                                }
                                                if (str !== '') {
                                                    $(str).appendTo($ul.html(''));
                                                }
                                            }
                                        } else {
                                            $span.attr({
                                                'data-isrequest': true
                                            });
                                            $ul.html('');
                                            /*防止重复请求*/
                                            setTimeout(function () {
                                                $span.attr({
                                                    'data-isrequest': false
                                                });
                                            }, 2000);
                                        }
                                    } else {
                                        $span.attr({
                                            'data-isrequest': true
                                        });
                                        $item.removeClass();
                                        $ul.html('');
                                    }
                                }
                            }
                        },
                        function (resp) {
                            $span.attr({
                                'data-isrequest': true
                            });
                            $item.removeClass();
                            $ul.html('');
                            var message = resp.data.message;
                            if (typeof message !== 'undefined' && message !== '') {
                                console.log(message);
                            } else {
                                console.log('请求菜单失败');
                            }
                        });
            } else {
                cache = null;
                loginService.outAction();
            }
        };
        /*机构服务--操作机构*/
        this.actionStruct = function (config) {
            var modal = config.modal,
                struct = config.struct,
                record = config.record,
                type = modal.type;

            /*如果存在延迟任务则清除延迟任务*/
            self.clearFormDelay();
            /*通过延迟任务清空表单数据*/
            self.addFormDelay({
                type: modal.area
            });


            /*根据类型跳转相应逻辑*/
            if (type === 'edit') {
                /*查询相关存在的数据*/
                self.queryStructInfo(config);
            } else if (type === 'add') {
                /*显示弹窗*/
                self.toggleModal({
                    display: modal.display,
                    area: modal.area
                });
            }
        };
        /*机构服务--查询机构数据*/
        this.queryStructInfo = function (config) {
            if (cache === null) {
                return false;
            }
            var record = config.record,
                struct = config.struct,
                modal = config.modal,
                param = $.extend(true, {}, cache.loginMap.param),
                temp_id;

            /*判断参数*/
            if (record.organizationId !== '') {
                temp_id = record.organizationId;
            } else if (record.organizationId === '') {
                temp_id = record.currentId1;
            }
            param['id'] = temp_id;

            toolUtil
                .requestHttp({
                    url: '/organization/info',
                    method: 'post',
                    set: true,
                    data: param
                })
                .then(function (resp) {
                        var data = resp.data,
                            status = parseInt(resp.status, 10);

                        if (status === 200) {
                            var code = parseInt(data.code, 10),
                                message = data.message;
                            if (code !== 0) {
                                if (typeof message !== 'undefined' && message !== '') {
                                    console.log(message);
                                } else {
                                    console.log('请求数据失败');
                                }

                                if (code === 999) {
                                    /*退出系统*/
                                    cache = null;
                                    loginService.outAction();
                                }
                            } else {
                                /*加载数据*/
                                var result = data.result;
                                if (typeof result !== 'undefined') {
                                    var list = result.organization;
                                    if (list) {
                                        /*更新模型*/
                                        for (var i in list) {
                                            switch (i) {
                                                case 'id':
                                                    struct[i] = list[i];
                                                    struct['type'] = 'edit';
                                                    break;
                                                case 'fullName':
                                                    struct[i] = list[i];
                                                    break;
                                                case 'shortName':
                                                    struct[i] = list[i];
                                                    break;
                                                case 'linkman':
                                                    struct[i] = list[i];
                                                    break;
                                                case 'cellphone':
                                                    struct[i] = toolUtil.phoneFormat(list[i]);
                                                    break;
                                                case 'telephone':
                                                    struct[i] = toolUtil.telePhoneFormat(list[i], 4);
                                                    break;
                                                case 'province':
                                                    struct['province'] = list['province'];
                                                    struct['city'] = list['city'];
                                                    struct['country'] = list['country'];
                                                    /*判断是否需要重新数据，并依此更新相关地址模型*/
                                                    self.isReqAddress({
                                                        type: 'city',
                                                        address: config.address,
                                                        model: struct
                                                    }, true);
                                                    break;
                                                case 'address':
                                                    struct[i] = list[i];
                                                    break;
                                                case 'isAudited':
                                                    struct[i] = list[i];
                                                    break;
                                                case 'status':
                                                    struct[i] = list[i];
                                                    break;
                                                case 'remark':
                                                    struct[i] = list[i];
                                                    break;
                                                case 'isSettingLogin':
                                                    /*是否登录*/
                                                    var temp_login = list[i];
                                                    if (temp_login === '' || isNaN(temp_login) || typeof temp_login === 'undefined') {
                                                        temp_login = 0;
                                                    } else {
                                                        temp_login = parseInt(temp_login, 10);
                                                    }
                                                    struct[i] = temp_login;
                                                    if (temp_login === 1) {
                                                        /*设置*/
                                                        struct['username'] = list['username'];
                                                        /*修改时不设置密码*/
                                                        struct['password'] = '';
                                                        /*设置权限*/
                                                        /*是否指定权限*/
                                                        var temp_power = list['isDesignatedPermit'];
                                                        if (temp_power === '' || isNaN(temp_power) || typeof temp_power === 'undefined') {
                                                            /*默认为：全部权限*/
                                                            temp_power = 0;
                                                        } else {
                                                            temp_power = parseInt(temp_power, 10);
                                                        }
                                                        struct['isDesignatedPermit'] = temp_power;
                                                        /*全部权限时，清空权限ids缓存*/
                                                        if (temp_power === 0) {
                                                            struct['checkedFunctionIds'] = '';
                                                        } else if (temp_power === 1) {
                                                            /*初始化权限全选*/
                                                            powerService.clearHeaderPower();
                                                            /*指定权限时需要查询权限*/
                                                            /*查询权限--原始方案：先查询当前权限(子级权限) --> 再查父级权限  --> 存在父子级权限，过滤子级权限，
                                                             * 后来方案：先查父级权限 --> 再查询当前权限(子级权限)  --> 存在父子级权限，过滤子级权限*/
                                                            powerService.reqPowerList({
                                                                source: true, /*是否获取数据源*/
                                                                sourcefn: function (ps) {
                                                                    /*数据源*/
                                                                    var child_data,
                                                                        parent_data = ps;

                                                                    if (parent_data !== null) {
                                                                        /*存在数据源*/
                                                                        powerService.reqPowerList({
                                                                            source: true, /*是否获取数据源*/
                                                                            sourcefn: function (cs) {
                                                                                /*数据源*/
                                                                                child_data = cs;

                                                                                if (child_data !== null) {
                                                                                    /*存在数据源，开始过滤权限数据*/
                                                                                    var filter_data = powerService.filterPower(parent_data, child_data);
                                                                                    if (filter_data) {
                                                                                        /*过滤后的数据即映射到视图*/
                                                                                        var power_html = powerService.resolvePowerList({
                                                                                            menu: filter_data
                                                                                        });
                                                                                        /*更新模型*/
                                                                                        if (power_html) {
                                                                                            $(power_html).appendTo(self.$power_tbody.html(''));
                                                                                        }
                                                                                    } else {
                                                                                        toolDialog.show({
                                                                                            type: 'warn',
                                                                                            value: '过滤后的权限数据不正确'
                                                                                        });
                                                                                        return false;
                                                                                    }
                                                                                } else {
                                                                                    /*提示信息*/
                                                                                    toolDialog.show({
                                                                                        type: 'warn',
                                                                                        value: '没有子级权限数据'
                                                                                    });
                                                                                    return false;
                                                                                }
                                                                            },
                                                                            organizationId: list['id']
                                                                        });
                                                                    } else {
                                                                        /*提示信息*/
                                                                        toolDialog.show({
                                                                            type: 'warn',
                                                                            value: '没有父级权限数据'
                                                                        });
                                                                        return false;
                                                                    }
                                                                },
                                                                organizationId: list['parentId']
                                                            });
                                                        }
                                                    } else if (temp_login === 0) {
                                                        /*未设置*/
                                                        struct['username'] = '';
                                                        /*置空*/
                                                        struct['password'] = '';
                                                        /*设置权限*/
                                                        struct['isDesignatedPermit'] = 0;
                                                        /*设置权限值*/
                                                        struct['checkedFunctionIds'] = '';
                                                    }
                                                    break;
                                                case 'sysUserId':
                                                    struct[i] = list[i];
                                                    break;
                                                case 'parentId':
                                                    struct[i] = list[i];
                                                    break;
                                            }
                                        }
                                        /*单独查询绑定的加盟店*/
                                        self.queryCheckStruct({
                                            id: temp_id,
                                            record: record,
                                            struct: struct
                                        });
                                        /*显示弹窗*/
                                        self.toggleModal({
                                            display: modal.display,
                                            area: modal.area
                                        });
                                    } else {
                                        /*提示信息*/
                                        toolDialog.show({
                                            type: 'warn',
                                            value: '获取编辑数据失败'
                                        });
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
                            console.log('请求分仓失败');
                        }
                    });
        };
        /*机构服务--获取机构数据*/
        this.getStructPos = function (structpos) {
            if (!structpos) {
                return false;
            }
            var result = {},
                positem,
                id,
                count = 0;

            for (var i in structpos) {
                positem = structpos[i];
                id = positem['id'];

                if (id === '') {
                    return false;
                } else {
                    count++;
                    result[i] = id;
                }
            }
            if (count !== 2) {
                return false;
            }
            return result;
        };
        /*机构服务--清除机构数据*/
        this.clearStructPos = function (structpos, pos) {
            if (!structpos) {
                return false;
            }
            if (typeof pos !== 'undefined') {
                structpos[pos] = {
                    id: '',
                    $node: null,
                    active: '',
                    layer: '',
                    parentid: ''
                };
            } else {
                for (var i in structpos) {
                    structpos[i] = {
                        id: '',
                        $node: null,
                        active: '',
                        layer: '',
                        parentid: ''
                    };
                }
            }
        };


        /*表单类服务--执行延时任务序列*/
        this.addFormDelay = function (config) {
            /*映射对象*/
            var type = config.type,
                type_map = {
                    'struct': {
                        'timeid': structform_reset_timer,
                        'dom': self.$admin_struct_reset
                    },
                    'user': {
                        'timeid': userform_reset_timer,
                        'dom': self.$admin_user_reset
                    }
                };
            /*执行延时操作*/
            type_map[type]['timeid'] = $timeout(function () {
                /*触发重置表单*/
                type_map[type]['dom'].trigger('click');
            }, 0);
        };
        /*表单类服务--清除延时任务序列*/
        this.clearFormDelay = function (did) {
            if (did && did !== null) {
                $timeout.cancel(did);
                did = null;
            } else {
                /*如果存在延迟任务则清除延迟任务*/
                if (structform_reset_timer !== null) {
                    $timeout.cancel(structform_reset_timer);
                    structform_reset_timer = null;
                }
                if (userform_reset_timer !== null) {
                    $timeout.cancel(userform_reset_timer);
                    userform_reset_timer = null;
                }
            }
        };
        /*表单类服务--清空表单模型数据*/
        this.clearFormData = function (data, type) {
            if (!data) {
                return false;
            }

            if (typeof type !== 'undefined' && type !== '') {
                /*特殊重置*/
                if (type === 'struct') {
                    /*重置机构数据模型*/
                    (function () {
                        for (var i in data) {
                            if (i === 'isSettingLogin') {
                                /*是否设置登录名*/
                                data[i] = 0;
                            } else if (i === 'isDesignatedPermit') {
                                /*是否指定权限*/
                                data[i] = 0;
                            } else if (i === 'isAudited') {
                                /*是否已审核*/
                                data[i] = 0;
                            } else if (i === 'status') {
                                /*状态*/
                                data[i] = 0;
                            } else if (i === 'type') {
                                /*操作类型为新增*/
                                data[i] = 'add';
                            } else if (i === 'province' || i === 'city' || i === 'country') {
                                /*操作类型为新增*/
                                continue;
                            } else {
                                data[i] = '';
                            }
                        }
                    })(data);

                } else if (type === 'user') {
                    /*重置机构数据模型*/
                    (function () {
                        for (var i in data) {
                            if (i === 'status') {
                                /*状态*/
                                data[i] = 0;
                            } else if (i === 'type') {
                                /*操作类型为新增*/
                                data[i] = 'add';
                            } else if (i === 'shoptype') {
                                /*店铺类型*/
                                data[i] = 1;
                            } else if (i === 'province' || i === 'city' || i === 'country' || i === 'filter') {
                                /*操作类型为新增*/
                                continue;
                            } else {
                                data[i] = '';
                            }
                        }
                    })(data);
                }
            } else {
                /*通用重置*/
                (function () {
                    for (var i in data) {
                        if (i === 'type') {
                            /*操作类型为新增*/
                            data[i] = 'add';
                        } else {
                            data[i] = '';
                        }
                    }
                })(data);
            }
        };
        /*表单类服务--重置表单数据*/
        this.clearFormValid = function (forms) {
            if (forms) {
                var temp_cont = forms.$$controls;
                if (temp_cont) {
                    var len = temp_cont.length,
                        i = 0;
                    forms.$dirty = false;
                    forms.$invalid = true;
                    forms.$pristine = true;
                    forms.valid = false;

                    if (len !== 0) {
                        for (i; i < len; i++) {
                            var temp_item = temp_cont[i];
                            temp_item['$dirty'] = false;
                            temp_item['$invalid'] = true;
                            temp_item['$pristine'] = true;
                            temp_item['$valid'] = false;
                        }
                    }
                }
            }
        };
        /*表单类服务--提交表单数据*/
        this.formSubmit = function (config, type) {
            if (cache) {
                var action = '',
                    tempparam = cache.loginMap.param,
                    param = {
                        adminId: tempparam.adminId,
                        token: tempparam.token
                    },
                    req_config = {
                        method: 'post',
                        set: true
                    },
                    record = config.record,
                    tip_map = {
                        'add': '新增',
                        'edit': '编辑',
                        'user': '店铺',
                        'struct': '组织机构'
                    };

                /*适配参数*/
                if (type === 'struct') {
                    /*公共配置*/
                    param['fullName'] = config[type]['fullName'];
                    param['shortName'] = config[type]['shortName'];
                    param['linkman'] = config[type]['linkman'];
                    param['cellphone'] = toolUtil.trims(config[type]['cellphone']);
                    param['telephone'] = toolUtil.trimSep(config[type]['telephone'], '-');
                    param['province'] = config[type]['province'];
                    param['city'] = config[type]['city'];
                    param['country'] = config[type]['country'];
                    param['address'] = config[type]['address'];
                    param['isAudited'] = config[type]['isAudited'];
                    param['status'] = config[type]['status'];
                    param['remark'] = config[type]['remark'];
                    param['bindingShopIds'] = config[type]['bindingShopIds'];

                    /*处理特殊值*/
                    var isSettingLogin = parseInt(config[type]['isSettingLogin'], 10);
                    param['isSettingLogin'] = isSettingLogin;

                    if (isSettingLogin === 1) {
                        /*选中设置登录名*/
                        param['username'] = config[type]['username'];
                        param['password'] = config[type]['password'];
                        /*判断是否指定权限*/
                        var isDesignatedPermit = parseInt(config[type]['isDesignatedPermit'], 10);
                        param['isDesignatedPermit'] = isDesignatedPermit;
                        if (isDesignatedPermit === 1) {
                            param['checkedFunctionIds'] = config[type]['checkedFunctionIds'];
                        }
                    }


                    /*判断是新增还是修改*/
                    if (config[type]['id'] === '') {
                        action = 'add';
                        if (record.organizationId === '') {
                            param['parentId'] = record.currentId1;
                        } else {
                            param['parentId'] = record.organizationId;
                        }
                        req_config['url'] = '/organization/add';
                    } else {
                        action = 'edit';
                        param['id'] = config[type]['id'];
                        param['sysUserId'] = config[type]['sysUserId'];
                        param['parentId'] = config[type]['parentId'];
                        req_config['url'] = '/organization/update';
                    }
                }
                req_config['data'] = param;

                toolUtil
                    .requestHttp(req_config)
                    .then(function (resp) {
                            var data = resp.data,
                                status = parseInt(resp.status, 10);

                            if (status === 200) {
                                var code = parseInt(data.code, 10),
                                    message = data.message;
                                if (code !== 0) {
                                    if (typeof message !== 'undefined' && message !== '') {
                                        toolDialog.show({
                                            type: 'warn',
                                            value: message
                                        });
                                    } else {
                                        toolDialog.show({
                                            type: 'warn',
                                            value: tip_map[action] + tip_map[type] + '失败'
                                        });
                                    }
                                    if (code === 999) {
                                        /*退出系统*/
                                        cache = null;
                                        loginService.outAction();
                                    }
                                    return false;
                                } else {
                                    /*操作成功即加载数据*/
                                    /*to do*/
                                    if (type === 'struct') {
                                        self.getMenuList({
                                            record: config.record,
                                            table: config.table
                                        });
                                    } else if (type === 'user') {
                                        /*重新加载表格数据*/
                                        /*查询店铺信息*/
                                        if (config.record.structId === '') {

                                        } else {

                                        }
                                    }
                                    /*重置表单*/
                                    self.addFormDelay({
                                        type: type
                                    });
                                    /*提示操作结果*/
                                    toolDialog.show({
                                        type: 'succ',
                                        value: tip_map[action] + tip_map[type] + '成功'
                                    });
                                    /*弹出框隐藏*/
                                    self.toggleModal({
                                        display: 'hide',
                                        area: type,
                                        delay: 1000
                                    });
                                }
                            }
                        },
                        function (resp) {
                            var message = resp.data.message;
                            if (typeof message !== 'undefined' && message !== '') {
                                toolDialog.show({
                                    type: 'warn',
                                    value: message
                                });
                            } else {
                                toolDialog.show({
                                    type: 'warn',
                                    value: tip_map[action] + tip_map[type] + '失败'
                                });
                            }
                        });
            } else {
                /*退出系统*/
                cache = null;
                loginService.outAction();
            }
        };
        /*表单类服务--重置表单*/
        this.formReset = function (config, type) {
            if (type === 'struct') {
                /*重置表单模型,如果是2参数则为特殊重置，1个参数为通用重置*/
                self.clearFormData(config[type], type);
                /*重置权限信息*/
                self.clearSelectPower(config[type]);
            }
            /*重置验证提示信息*/
            self.clearFormValid(config.forms);
        };
        /*表单类服务--权限服务--确定所选权限*/
        this.getSelectPower = function (struct) {
            var temppower = powerService.getSelectPower();
            if (temppower) {
                struct.checkedFunctionIds = temppower.join();
            } else {
                struct.checkedFunctionIds = '';
            }
        };
        /*表单类服务--权限服务--取消所选权限*/
        this.clearSelectPower = function (struct) {
            struct.checkedFunctionIds = '';
            powerService.clearSelectPower();
        };
        /*表单类服务--权限服务--切换选中用户名*/
        this.clearLoginInfo = function (struct) {
            /*清空用户名密码*/
            struct.username = '';
            struct.password = '';
            /*重置权限设定为默认*/
            struct.isDesignatedPermit = 0;
            /*重置权限选中权限Ids*/
            struct.checkedFunctionIds = '';
        };
        /*表单类服务--权限服务--切换所选权限*/
        this.toggleSelectPower = function (config) {
            var struct = config.struct,
                record = config.record;

            /*重置权限选中权限Ids*/
            struct.checkedFunctionIds = '';
            /*清除头部信息*/
            powerService.clearHeaderPower();
            /*重新查询权限*/
            var type = struct.type;
            if (struct.isDesignatedPermit === 1) {
                /*选中指定权限则做过滤权限查询*/
                var cid,
                    pid;
                if (type === 'add') {
                    /*新增时查询权限*/
                    var tempid = self.getPCParams(record);
                    cid = tempid.cid;
                    pid = tempid.pid;
                } else if (type === 'edit') {
                    /*编辑时查询权限*/
                    cid = struct.id;
                    pid = struct.parentId;
                }

                powerService.reqPowerList({
                    source: true, /*是否获取数据源*/
                    sourcefn: function (ps) {
                        /*数据源*/
                        var child_data,
                            parent_data = ps;

                        if (parent_data !== null) {
                            /*存在数据源*/
                            powerService.reqPowerList({
                                source: true, /*是否获取数据源*/
                                sourcefn: function (cs) {
                                    /*数据源*/
                                    child_data = cs;
                                    if (child_data !== null) {
                                        /*存在数据源，开始过滤权限数据*/
                                        var filter_data = powerService.filterPower(parent_data, child_data);
                                        if (filter_data) {
                                            /*过滤后的数据即映射到视图*/
                                            var power_html = powerService.resolvePowerList({
                                                menu: filter_data
                                            });
                                            /*更新模型*/
                                            if (power_html) {
                                                $(power_html).appendTo(self.$power_tbody.html(''));
                                            }
                                        } else {
                                            toolDialog.show({
                                                type: 'warn',
                                                value: '过滤后的权限数据不正确'
                                            });
                                            return false;
                                        }
                                    } else {
                                        /*提示信息*/
                                        toolDialog.show({
                                            type: 'warn',
                                            value: '没有子级权限数据'
                                        });
                                        return false;
                                    }
                                },
                                organizationId: cid
                            });
                        } else {
                            /*提示信息*/
                            toolDialog.show({
                                type: 'warn',
                                value: '没有父级权限数据'
                            });
                            return false;
                        }
                    },
                    organizationId: pid
                });
            }

        };
        /*表单类服务--权限服务--获取当前父子id*/
        this.getPCParams = function (record) {
            var cid,
                pid;
            if (record.organizationId !== '') {
                cid = record.organizationId;
                if (record.current1 !== null && record.layer !== 0) {
                    pid = record.current1.attr('data-parentid');
                } else {
                    pid = record.currentId1;
                }
            } else if (record.currentId1 !== '') {
                cid = pid = record.currentId1;
            }
            return {
                cid: cid,
                pid: pid
            };
        };


        /*运营商服务--确定所选运营商*/
        this.getSelectOperator = function (config) {
            if (config) {
                var source = config.record.operator_shopid,
                    res = [];
                for (var i in source) {
                    res.push(source[i]);
                }
                if (res.length !== 0) {
                    config.struct.bindingShopIds = res.join();
                } else {
                    config.struct.bindingShopIds = '';
                }
            }
            console.log(config.record.operator_shopid);
        };
        /*运营商服务--取消(清空)所选运营商*/
        this.clearSelectOperator = function (config) {
            config.struct.bindingShopIds = '';
            self.operatorCheck({
                type: 'all',
                record: config.record,
                target: self.$all_yystruct
            }, 'no');
        };
        /*运营商服务--选中运营商服务，flag:下一个状态（操作一次以后将要切换的状态）(yes:选中，no:未选中)*/
        this.operatorCheck = function (config, flag) {
            var target,
                itemlabel,
                type = config.type/*选择的是全选还是单个选项*/,
                record = config.record,
                label_cache = record.operator_cache,
                ischeck;

            if (flag) {
                if (flag === 'yes') {
                    ischeck = false;
                } else if (flag === 'no') {
                    ischeck = true;
                }
            }
            if (type === 'all') {
                /*全选与取消全选操作*/
                itemlabel = self.$all_yystruct;
                if (!flag) {
                    ischeck = itemlabel.hasClass('sub-menu-checkboxactive');
                }
                if (ischeck) {
                    /*取消选中*/
                    itemlabel.removeClass('sub-menu-checkboxactive');
                } else {
                    /*选中*/
                    itemlabel.addClass('sub-menu-checkboxactive');
                    /*切换显示运营商店铺信息*/
                    if (!record.operator_shopshow) {
                        record.operator_shopshow = true;
                    }
                }
                /*判断模型状态*/
                switch (label_cache.state) {
                    case 'empty':
                        /*未选状态*/
                        (function () {
                            self.$admin_yystruct_menu.find('label').each(function () {
                                var $this = $(this),
                                    key = $this.attr('data-id');

                                /*变更模型*/
                                label_cache[key] = {
                                    'id': key,
                                    'label': $this,
                                    'ischeck': true,
                                    'isall': false
                                };
                                if (ischeck) {
                                    /*操作：选中-->取消选中；数据状态：为空状态；结果：循环label并改变模型状态*/
                                }else{
                                    /*操作：取消选中-->选中；数据状态：为空状态；结果：循环label并改变模型状态*/
                                    $this.addClass('sub-menu-checkboxactive');
                                }
                                /*查询店铺*/
                                self.queryShopById({
                                    record: config.record,
                                    id: key
                                });
                            });
                            /*变更模型状态为全选*/
                            label_cache.state = 'full';
                        }());
                        break;
                    case 'full':
                        /*全选状态*/
                        (function () {
                            for (var i in label_cache) {
                                if (i !== 'state') {
                                    if (ischeck) {
                                        /*操作：选中-->取消选中；数据状态：全选状态；结果：直接操作模型*/
                                        label_cache[i]['ischeck'] = false;
                                        label_cache[i]['label'].removeClass('sub-menu-checkboxactive');
                                    } else {
                                        /*操作：取消选中-->选中；数据状态：全选状态；结果：直接操作模型*/
                                        label_cache[i]['ischeck'] = true;
                                        label_cache[i]['label'].addClass('sub-menu-checkboxactive');
                                    }
                                }
                            }
                        }());
                        break;
                    case 'short':
                        /*不完全状态*/
                        (function () {
                            self.$admin_yystruct_menu.find('label').each(function () {
                                var $this = $(this),
                                    key = $this.attr('data-id');

                                if (ischeck) {
                                    /*操作：选中-->取消选中；数据状态：不完全状态；结果：循环label标签，并补充部分缺失模型*/
                                    $this.removeClass('sub-menu-checkboxactive');
                                    /*不存在模型则补充模型*/
                                    if (!label_cache[key]) {
                                        label_cache[key] = {
                                            'id': key,
                                            'label': $this,
                                            'ischeck': false,
                                            'isall': false
                                        };
                                        /*查询店铺*/
                                        self.queryShopById({
                                            record: config.record,
                                            id: key
                                        });
                                    } else {
                                        label_cache[key]['label'] = $this;
                                        label_cache[key]['ischeck'] = false;
                                    }
                                } else {
                                    /*操作：取消选中-->选中；数据状态：不完全状态；结果：循环label标签，并补充部分缺失模型*/
                                    $this.addClass('sub-menu-checkboxactive');
                                    /*不存在模型则补充模型*/
                                    if (!label_cache[key]) {
                                        label_cache[key] = {
                                            'id': key,
                                            'label': $this,
                                            'ischeck': true,
                                            'isall': false
                                        };
                                        /*查询店铺*/
                                        self.queryShopById({
                                            record: config.record,
                                            id: key
                                        });
                                    } else {
                                        label_cache[key]['label'] = $this;
                                        label_cache[key]['ischeck'] = true;
                                    }
                                }
                            });
                            /*循环完毕将数据状态变为完全状态*/
                            label_cache.state = 'full';
                        }());
                        break;
                }
            } else if (type === 'item') {
                /*单个操作与取消单个操作*/
                target = config.target;
                var id = target.getAttribute('data-id');
                /*判断是否存在模型*/
                if (label_cache[id]) {
                    /*存在模型即操作模型*/
                    var cacheitem = label_cache[id];

                    ischeck = cacheitem['ischeck'];
                    cacheitem['ischeck'] = !ischeck;
                    if (ischeck) {
                        cacheitem['label'].removeClass('sub-menu-checkboxactive');
                    } else {
                        cacheitem['label'].addClass('sub-menu-checkboxactive');
                        /*切换显示运营商店铺信息*/
                        if (!record.operator_shopshow) {
                            record.operator_shopshow = true;
                        }
                    }
                } else {
                    /*不存在模型*/
                    if (!flag) {
                        itemlabel = $(target);
                        ischeck = itemlabel.hasClass('sub-menu-checkboxactive');
                        if (ischeck) {
                            itemlabel.removeClass('sub-menu-checkboxactive');
                        } else {
                            itemlabel.addClass('sub-menu-checkboxactive');
                            /*切换显示运营商店铺信息*/
                            if (!record.operator_shopshow) {
                                record.operator_shopshow = true;
                            }
                        }
                        label_cache[id] = {
                            'id': id,
                            'label': itemlabel,
                            'ischeck': !ischeck,
                            'isall': false
                        };
                        /*查询店铺*/
                        self.queryShopById({
                            record: config.record,
                            id: id
                        });
                        if (label_cache.state === 'empty') {
                            label_cache.state = 'short';
                        }
                    }
                }
            }
        };
        /*运营商服务--通过选中的值反向关联选中运营商服务 to do*/
        this.reverseOperatorCheck = function (config) {
            var labelcache = {}/*label缓存*/,
                data = config.data/*已经存在的数据*/,
                flag = config.flag/*是否关联全选*/;

            if (data && !$.isEmptyObject(data)) {
                /*缓存label对象*/
                self.$admin_yystruct_menu.find('label').each(function () {
                    var $this = $(this),
                        id = $this.attr('data-id');

                    labelcache[id] = {
                        'id': id,
                        'label': $this
                    };
                });
                /*开始比对*/
                var temp_item;
                for (var i in data) {
                    temp_item = labelcache[i];
                    if (temp_item) {
                        /*匹配则高亮缓存值*/
                        temp_item['label'].addClass('sub-menu-checkboxactive');
                    }
                }
                /*选中全选*/
                if (flag) {
                    self.$all_yystruct.addClass('sub-menu-checkboxactive');
                }
            }
        };


        /*运营商服务--查询已经存在的运营商店铺*/
        this.queryCheckShop = function (config) {
            /*反向查询*/
            var record=config.record,
                label_cache=record.operator_cache;

            /*如果不是满数据状态，则执行全查询*/
            if(label_cache.state==='empty' || label_cache.state==='short'){
                self.operatorCheck({
                    type:'all',
                    record:config.record
                },'no');
            }

            if (cache) {
                var id = record.organizationId !== '' ? record.organizationId : record.currentId1,
                    tempparam = cache.loginMap.param,
                    param = {
                        token: tempparam.token,
                        adminId: tempparam.adminId,
                        organizationId: id
                    };

                toolUtil
                    .requestHttp({
                        url: '/organization/shopmaps',
                        method: 'post',
                        set: true,
                        data: param
                    })
                    .then(function (resp) {
                            var data = resp.data,
                                status = parseInt(resp.status, 10);

                            if (status === 200) {
                                var code = parseInt(data.code, 10),
                                    message = data.message;
                                if (code !== 0) {
                                    if (typeof message !== 'undefined' && message !== '') {
                                        console.log(message);
                                    }

                                    if (code === 999) {
                                        /*退出系统*/
                                        cache = null;
                                        loginService.outAction();
                                    }
                                } else {
                                    /*加载数据*/
                                    var result = data.result;
                                    if (typeof result !== 'undefined') {
                                        var list = result.list;
                                        if (list) {
                                            var len = list.length;
                                            if (len !== 0) {
                                                var i = 0,
                                                    shop_cache=record.operator_shopid,
                                                    str = '',
                                                    shopid;
                                                for (i; i < len; i++) {
                                                    shopid = list[i]['shopId'];
                                                    /*存在缓存则修改缓存*/
                                                    if(shop_cache[shopid]){
                                                        shop_cache[shopid]['ischeck']=true;
                                                        shop_cache[shopid]['li'].addClass('action-list-active');
                                                    }
                                                    if (i !== len - 1) {
                                                        str += shopid + ',';
                                                    } else {
                                                        str += shopid;
                                                    }
                                                }
                                                /*同步表单模型*/
                                                config.struct.bindingShopIds = str;
                                            }
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
                                console.log('请求绑定分仓失败');
                            }
                        });
            } else {
                /*退出系统*/
                cache = null;
                loginService.outAction();
            }
        };
        /*运营商服务--查询运营商店铺*/
        this.queryShopById = function (config) {
            if (cache) {
                var id = config.id,
                    tempparam = cache.loginMap.param,
                    param = {
                        token: tempparam.token,
                        adminId: tempparam.adminId,
                        carrieroperatorId: id
                    };

                toolUtil
                    .requestHttp({
                        url: '/carrieroperator/shops',
                        method: 'post',
                        set: true,
                        data: param
                    })
                    .then(function (resp) {
                            var data = resp.data,
                                status = parseInt(resp.status, 10);

                            if (status === 200) {
                                var code = parseInt(data.code, 10),
                                    message = data.message;
                                if (code !== 0) {
                                    if (typeof message !== 'undefined' && message !== '') {
                                        console.log(message);
                                    }

                                    if (code === 999) {
                                        /*退出系统*/
                                        cache = null;
                                        loginService.outAction();
                                    }
                                } else {
                                    /*加载数据*/
                                    var result = data.result;
                                    if (typeof result !== 'undefined') {
                                        var list = result.list;
                                        if (list) {
                                            var len = list.length;
                                            if (len !== 0) {
                                                var i = 0,
                                                    j = 0,
                                                    str = '',
                                                    shopobj = {},
                                                    shopitem,
                                                    shopid,
                                                    source = config.record.operator_shopid;

                                                for (i; i < len; i++) {
                                                    shopitem = list[i];
                                                    shopid = shopitem['id'];
                                                    shopobj[shopid] = {
                                                        shopid: shopid,
                                                        operator: id
                                                    };
                                                    str += '<li data-shopid="' + shopid + '" data-operator="' + id + '" >' + shopitem["fullName"] + '</li>';
                                                }
                                                /*更新到列表*/
                                                $(str).appendTo(self.$admin_shop_wrap);
                                                /*将序列缓存至模型*/
                                                self.$admin_shop_wrap.find('li [data-operator="' + id + '"]').each(function () {
                                                    var $this = $(this),
                                                        kid = $this('data-shopid');

                                                    if (!source[kid] && shopobj[kid]) {
                                                        source[shopid] = {
                                                            'shopid': kid,
                                                            'li': $this,
                                                            'operator': id,
                                                            'ischeck': false
                                                        }
                                                    }
                                                });
                                            }
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
                                console.log('请求绑定分仓失败');
                            }
                        });


            } else {
                /*退出系统*/
                cache = null;
                loginService.outAction();
            }
        };
        /*运营商服务--确定所选运营商店铺*/
        this.getSelectShop = function (config) {
            if (config) {
                var source = config.record.operator_shopid,
                    res = [];
                for (var i in source) {
                    if (source[i]['ischeck']) {
                        res.push(i);
                    }
                }
                if (res.length !== 0) {
                    config.struct.bindingShopIds = res.join();
                } else {
                    config.struct.bindingShopIds = '';
                }
            }
        };
        /*运营商服务--取消(清空)所选运营商店铺*/
        this.clearSelectShop = function (config) {
            var source = config.record.operator_shopid;
            /*清除模型样式*/
            for (var i in source) {
                var shopitem = source[i];
                shopitem['li'].removeClass('action-list-active');
                shopitem['ischeck'] = false;
            }
            /*清除模型*/
            config.struct.bindingShopIds = '';
        };
        /*运营商服务--选中或取消运营商店铺*/
        this.toggleShopCheck = function (e, config) {
            var target = e.target,
                node = target.nodeName.toLowerCase();

            if (node === 'ul') {
                return false;
            }
            if (node === 'li') {
                var source = config.record.operator_shopid,
                    shopid = target.getAttribute('data-shopid'),
                    shopitem = source[shopid],
                    operator,
                    $this;

                if (shopitem) {
                    if (shopitem['ischeck']) {
                        /*取消选中*/
                        shopitem['li'].removeClass('action-list-active');
                        shopitem['ischeck'] = false;
                    } else {
                        /*选中*/
                        shopitem['li'].addClass('action-list-active');
                        shopitem['ischeck'] = true;
                    }
                } else {
                    $this = $(target);
                    $this.addClass('action-list-active');
                    operator = $this.attr('data-operator');
                    source[shopid] = {
                        'shopid': shopid,
                        'li': $this,
                        'operator': operator,
                        'ischeck': true
                    };
                }
            }
        };


        /*用户服务--操作用户*/
        this.actionUser = function (config) {
            var modal = config.modal,
                type = modal.type,
                record = config.record,
                user = config.user;

            if (type === 'add') {
                /*判断是否是合法的节点，即是否有父机构*/
                if (record.structId === '' && record.organizationId === '') {
                    toolDialog.show({
                        type: 'warn',
                        value: '没有父机构或父机构不存在'
                    });
                    return false;
                }
            }
            /*如果存在延迟任务则清除延迟任务*/
            self.clearFormDelay();
            /*通过延迟任务清空表单数据*/
            self.addFormDelay({
                type: 'user'
            });
            /*显示弹窗*/
            self.toggleModal({
                display: modal.display,
                area: modal.area
            });
        };
        /*用户服务--查询用户数据*/
        this.queryUserInfo = function (config, id, action) {
            if (cache === null) {
                return false;
            }

            if (typeof id === 'undefined') {
                toolDialog.show({
                    type: 'warn',
                    value: '没有店铺信息'
                });
                return false;
            }

            var param = $.extend(true, {}, cache.loginMap.param);
            /*判断参数*/
            param['id'] = id;

            toolUtil
                .requestHttp({
                    url: '/organization/shop/info',
                    method: 'post',
                    set: true,
                    data: param
                })
                .then(function (resp) {
                        var data = resp.data,
                            status = parseInt(resp.status, 10);

                        if (status === 200) {
                            var code = parseInt(data.code, 10),
                                message = data.message;
                            if (code !== 0) {
                                if (typeof message !== 'undefined' && message !== '') {
                                    console.log(message);
                                } else {
                                    console.log('请求数据失败');
                                }

                                if (code === 999) {
                                    /*退出系统*/
                                    cache = null;
                                    loginService.outAction();
                                }
                            } else {
                                /*加载数据*/
                                var result = data.result;
                                if (typeof result !== 'undefined') {
                                    var list = result.shop;
                                    if (list) {
                                        if (action === 'update') {
                                            /*修改：更新模型*/
                                            var user = config.user;

                                            for (var i in list) {
                                                switch (i) {
                                                    case 'id':
                                                        user[i] = list[i];
                                                        user['type'] = 'edit';
                                                        break;
                                                    case 'fullName':
                                                        user[i] = list[i];
                                                        break;
                                                    case 'shortName':
                                                        user[i] = list[i];
                                                        break;
                                                    case 'name':
                                                        user[i] = list[i];
                                                        break;
                                                    case 'type':
                                                        var temp_type = list[i];
                                                        if (temp_type === '' || isNaN(temp_type)) {
                                                            temp_type = 1;
                                                            user['shoptype'] = temp_status;
                                                        } else {
                                                            user['shoptype'] = list[i];
                                                        }
                                                        break;
                                                    case 'cellphone':
                                                        user[i] = toolUtil.phoneFormat(list[i]);
                                                        break;
                                                    case 'telephone':
                                                        user[i] = toolUtil.telePhoneFormat(list[i], 4);
                                                        break;
                                                    case 'province':
                                                        user['province'] = list['province'];
                                                        user['city'] = list['city'];
                                                        user['country'] = list['country'];
                                                        /*判断是否需要重新数据，并依此更新相关地址模型*/
                                                        self.isReqAddress({
                                                            type: 'city',
                                                            address: config.address,
                                                            model: user
                                                        }, true);
                                                        break;
                                                    case 'address':
                                                        user[i] = list[i];
                                                        break;
                                                    case 'status':
                                                        var temp_status = list[i];
                                                        if (temp_status === '' || isNaN(temp_status)) {
                                                            temp_status = 0;
                                                            user[i] = temp_status;
                                                        } else {
                                                            user[i] = list[i];
                                                        }
                                                        break;
                                                    case 'remark':
                                                        user[i] = list[i];
                                                        break;
                                                    case 'organizationId':
                                                        user[i] = list[i];
                                                        break;
                                                }
                                            }
                                            /*显示弹窗*/
                                            self.toggleModal({
                                                display: 'show',
                                                area: 'user'
                                            });
                                        } else if (action === 'detail') {
                                            /*查看*/
                                            var str = '',
                                                detail_map = {
                                                    'fullName': '店铺全称',
                                                    'shortName': '店铺简称',
                                                    'address': '联系地址',
                                                    'name': '姓名',
                                                    'type': '店铺类型',
                                                    'cellphone': '店铺手机号码',
                                                    'telephone': '店铺电话号码',
                                                    'province': '省份',
                                                    'city': '市区',
                                                    'country': '县区',
                                                    'remark': '备注',
                                                    'addUserId': '添加的用户序列',
                                                    'id': '序列号',
                                                    'organizationId': '组织机构序列',
                                                    'addTime': '添加时间',
                                                    'status': '状态'
                                                };

                                            var r_province = '',
                                                r_country = '',
                                                r_city = '';

                                            for (var j in list) {
                                                if (typeof detail_map[j] !== 'undefined') {
                                                    if (j === 'type') {
                                                        var temptype = parseInt(list[j], 10),
                                                            typemap = {
                                                                1: '旗舰店',
                                                                2: '体验店',
                                                                3: '加盟店'
                                                            };
                                                        str += '<tr><td class="g-t-r">' + detail_map[j] + ':</td><td class="g-t-l">' + typemap[temptype] + '</td></tr>';
                                                    } else if (j === 'province' || j === 'country' || j === 'city') {
                                                        str += '<tr><td class="g-t-r">' + detail_map[j] + ':</td><td class="g-t-l">#' + j + '#</td></tr>';
                                                        if (j === 'province') {
                                                            self.queryByCode(list[j], function (name) {
                                                                r_province = name;
                                                            });
                                                        } else if (j === 'country') {
                                                            self.queryByCode(list[j], function (name) {
                                                                r_country = name;
                                                            });
                                                        } else if (j === 'city') {
                                                            self.queryByCode(list[j], function (name) {
                                                                r_city = name;
                                                            });
                                                        }
                                                    } else {
                                                        str += '<tr><td class="g-t-r">' + detail_map[j] + ':</td><td class="g-t-l">' + list[j] + '</td></tr>';
                                                    }
                                                }
                                            }
                                            if (str !== '') {
                                                setTimeout(function () {
                                                    str = str.replace(/#province#/g, r_province).replace(/#country#/g, r_country).replace(/#city#/g, r_city);
                                                    $(str).appendTo(self.$admin_userdetail_show.html(''));
                                                    /*显示弹窗*/
                                                    self.toggleModal({
                                                        display: 'show',
                                                        area: 'userdetail'
                                                    });
                                                }, 200);

                                            }
                                        }
                                    } else {
                                        /*提示信息*/
                                        toolDialog.show({
                                            type: 'warn',
                                            value: '获取编辑数据失败'
                                        });
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
                            console.log('请求用户失败');
                        }
                    });
        };


        /*地址服务--地址查询*/
        this.queryAddress = function (config) {
            addressService.queryRelation(config);
        };
        /*地址服务--判断是否需要查询新地址*/
        this.isReqAddress = function (config, flag, fn) {
            if (flag) {
                addressService.isReqAddress(config, flag, fn);
            } else {
                return addressService.isReqAddress(config);
            }
        };
        /*地址服务--根据code查询value地址*/
        this.queryByCode = function (code, fn) {
            if (fn) {
                addressService.queryByCode(code, fn);
            } else {
                return addressService.queryByCode(code, fn);
            }
        };


    }]);