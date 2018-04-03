angular.module('app')
    .service('structService', ['toolUtil', 'toolDialog', 'BASE_CONFIG', 'loginService', 'powerService', 'addressService', 'dataTableColumnService', 'dataTableCheckAllService', 'dataTableItemActionService', 'testService', '$timeout', function (toolUtil, toolDialog, BASE_CONFIG, loginService, powerService, addressService, dataTableColumnService, dataTableCheckAllService, dataTableItemActionService, testService, $timeout) {

        /*获取缓存数据*/
        var self = this,
            module_id = 10/*模块id*/,
            cache = loginService.getCache(),
            structform_reset_timer = null,
            userform_reset_timer = null,
            struct_page_timer = null;



        /*权限服务--查询列表*/
        var powermap = powerService.getCurrentPower(module_id);


        /*初始化权限*/
        var init_power = {
            organization_add: toolUtil.isPower('organization-add', powermap, true)/*添加机构*/,
            organization_edit: toolUtil.isPower('organization-edit', powermap, true)/*编辑机构*/,
            role_add: toolUtil.isPower('role-add', powermap, true), /*添加*/
            user_add: toolUtil.isPower('user-add', powermap, true)/*添加用户*/,
            user_view: toolUtil.isPower('user-view', powermap, true)/*查看用户*/,
            user_update: toolUtil.isPower('user-update', powermap, true)/*编辑用户*/,
            batch_delete: toolUtil.isPower('batch-delete', powermap, true)/*删除用户*/,
            operator_adjustment: toolUtil.isPower('operator-adjustment', powermap, true)/*调整运营商*/
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
                    'struct': self.$struct_struct_dialog,
                    'user': self.$struct_user_dialog,
                    'userdetail': self.$struct_userdetail_dialog
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


        /*导航服务--获取虚拟挂载点*/
        this.getRoot = function (record) {
            if (cache === null) {
                toolUtil.loginTips({
                    clear: true,
                    reload: true
                });
                record['currentId'] = '';
                record['currentName'] = '';
                record['organizationId'] = '';
                record['organizationName'] = '';
                return false;
            }
            var islogin = loginService.isLogin(cache);
            if (islogin) {
                var logininfo = cache.loginMap;
                record['currentId'] = logininfo.param.organizationId;
                record['currentName'] = !logininfo.param.organizationName ? logininfo.username : decodeURIComponent(logininfo.param.organizationName);
                record['organizationId'] = logininfo.param.organizationId;
                record['organizationName'] = !logininfo.param.organizationName ? logininfo.username : decodeURIComponent(logininfo.param.organizationName);
            } else {
                /*退出系统*/
                cache = null;
                toolUtil.loginTips({
                    clear: true,
                    reload: true
                });
                record['currentId'] = '';
                record['currentName'] = '';
                record['organizationId'] = '';
                record['organizationName'] = '';
            }
        };
        /*导航服务--获取导航*/
        this.getMenuList = function (config) {
            if (cache) {
                if (config.record.organizationId === '' || typeof config.record.organizationId === 'undefined') {
                    return false;
                }

                var record = config.record,
                    param = $.extend(true, {}, cache.loginMap.param);

                /*判断是否为搜索模式*/
                if (config.record.searchname !== '') {
                    self.initRecord(config.record, true);
                    param['fullName'] = record.searchname;
                }

                /*清除操作机构记录*/
                self.initStructPos(config.structpos);

                var layer = record.layer,
                    id = record.organizationId,
                    $wrap;

                param['isShowSelf'] = 0;
                param['organizationId'] = id;


                /*初始化加载*/
                if (record.current === null) {
                    /*根目录则获取新配置参数*/
                    $wrap = self.$admin_struct_submenu;
                } else {
                    /*非根目录则获取新请求参数*/
                    $wrap = record.current.next();
                }

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
                                    }

                                    if (code === 999) {
                                        /*退出系统*/
                                        cache = null;
                                        toolUtil.loginTips({
                                            clear: true,
                                            reload: true
                                        });
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
                                                record.hasdata = false;
                                                if (layer === 0) {
                                                    $wrap.html('<li><a>暂无数据</a></li>');
                                                    self.$admin_submenu_wrap.attr({
                                                        'data-list': false
                                                    });
                                                } else {
                                                    $wrap.html('');
                                                    /*清除显示下级菜单导航图标*/
                                                    record.current.attr({
                                                        'data-isrequest': true
                                                    }).removeClass('sub-menu-title sub-menu-titleactive');
                                                }
                                                /*始化机构操作区域*/
                                                self.initOperate(config);
                                            } else {
                                                /*数据集合，最多嵌套层次*/
                                                str = self.resolveMenuList(list, BASE_CONFIG.submenulimit, {
                                                    layer: layer,
                                                    id: id
                                                });
                                                if (str !== '') {
                                                    record.hasdata = true;
                                                    if (layer === 0) {
                                                        /*搜索模式*/
                                                        self.$admin_submenu_wrap.attr({
                                                            'data-list': true
                                                        });
                                                    }
                                                    $(str).appendTo($wrap.html(''));
                                                    /*始化机构操作区域*/
                                                    self.initOperate(config, true);
                                                    /*调用滚动条*/
                                                    if(record.iscroll_flag){
                                                        record.iscroll_flag=false;
                                                        toolUtil.autoScroll(self.$submenu_scroll_wrap,{
                                                            setWidth: false,
                                                            setHeight: 450,
                                                            theme: "minimal-dark",
                                                            axis: "y",
                                                            scrollbarPosition: "inside",
                                                            scrollInertia: '500'
                                                        });
                                                    }
                                                } else {
                                                    record.hasdata = false;
                                                    if (layer === 0) {
                                                        /*搜索模式*/
                                                        self.$admin_submenu_wrap.attr({
                                                            'data-list': false
                                                        });
                                                    }
                                                    /*始化机构操作区域*/
                                                    self.initOperate(config);
                                                }
                                                if (layer !== 0 && record.current) {
                                                    record.current.attr({
                                                        'data-isrequest': true
                                                    });
                                                }
                                            }
                                        } else {
                                            record.hasdata = false;
                                            if (layer === 0) {
                                                $wrap.html('<li><a>暂无数据</a></li>');
                                                self.$admin_submenu_wrap.attr({
                                                    'data-list': false
                                                });
                                            }
                                            /*始化机构操作区域*/
                                            self.initOperate(config);
                                        }
                                    } else {
                                        record.hasdata = false;
                                        if (layer === 0) {
                                            $wrap.html('<li><a>暂无数据</a></li>');
                                            self.$admin_submenu_wrap.attr({
                                                'data-list': false
                                            });
                                        }

                                        /*始化机构操作区域*/
                                        self.initOperate(config);
                                    }
                                }
                            }
                        },
                        function (resp) {
                            record.hasdata = false;
                            if (layer === 0) {
                                $wrap.html('<li><a>暂无数据</a></li>');
                                self.$admin_submenu_wrap.attr({
                                    'data-list': false
                                });
                            }
                            /*始化机构操作区域*/
                            self.initOperate(config);
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
                toolUtil.loginTips({
                    clear: true,
                    reload: true
                });
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
                                id: config.id
                            }) + '</li>';
                    } else {
                        str += self.doItemMenuList(curitem, {
                                flag: true,
                                limit: limit,
                                layer: layer,
                                id: config.id
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
                type = curitem["type"] || '',
                str = '',
                flag = config.flag,
                layer = config.layer,
                parentid = config.id;

            /*全部类型*/
            if (flag) {
                if (type === 1) {
                    str = '<li><a data-isrequest="false" data-parentid="' + parentid + '" data-layer="' + layer + '" data-id="' + id + '" data-5S="5S" class="sub-menu-title" href="#" title="">' + label + '</a>';
                } else {
                    str = '<li><a data-isrequest="false" data-parentid="' + parentid + '" data-layer="' + layer + '" data-id="' + id + '" data-common="普通" class="sub-menu-title" href="#" title="">' + label + '</a>';
                }
            } else {
                if (type === 1) {
                    str = '<li><a data-parentid="' + parentid + '"  data-layer="' + layer + '" data-id="' + id + '" data-5S="5S" href="#" title="">' + label + '</a></li>';
                } else {
                    str = '<li><a data-parentid="' + parentid + '" data-commom="普通"  data-layer="' + layer + '" data-id="' + id + '" href="#" title="">' + label + '</a></li>';
                }
            }
            return str;
        };
        /*导航服务--校验导航--校验导航服务的正确性*/
        this.validSubMenuLayer = function (layer) {
            if (typeof layer === 'undefined') {
                return false;
            }
            var layer = parseInt(layer, 10);
            if (layer < 1) {
                return false;
            }
            if (layer > BASE_CONFIG.submenulimit) {
                return false;
            }
            return true;
        };
        /*导航服务--显示隐藏菜单*/
        this.toggleSubMenu = function (e, config) {
            /*阻止冒泡和默认行为*/
            e.preventDefault();
            e.stopPropagation();

            /*过滤对象*/
            var target = e.target,
                node = target.nodeName.toLowerCase();
            if (node === 'ul' || node === 'li') {
                return false;
            }

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
            temp_id = $this.attr('data-id');
            temp_label = $this.html();


            /*模型缓存*/
            var record = config.record;

            /*变更操作记录模型--激活高亮*/
            if (record.current === null) {
                record.current = $this;
            } else {
                record.prev = record.current;
                record.current = $this;
                record.prev.removeClass('sub-menuactive');
            }
            record.current.addClass('sub-menuactive');

            /*变更模型*/
            record.layer = temp_layer;
            record.organizationId = temp_id;
            record.organizationName = temp_label;
            record.structId = '';
            record.structnode = null;
            record.structName = '';

            /*查询子集*/
            if (haschild) {
                $child = $this.next();
                if ($child.hasClass('g-d-showi')) {
                    /*隐藏*/
                    $child.removeClass('g-d-showi');
                    $this.removeClass('sub-menu-titleactive');
                    record.hasdata = true;
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
                        if (haschild) {
                            record.hasdata = true;
                            /*始化机构操作区域*/
                            self.initOperate(config, true);
                        } else {
                            record.hasdata = false;
                            /*始化机构操作区域*/
                            self.initOperate(config);
                        }
                    }

                }
            } else {
                record.hasdata = false;
                /*始化机构操作区域*/
                self.initOperate(config);
            }
        };
        /*导航服务--跳转至虚拟挂载点*/
        this.rootSubMenu = function (e, config) {
            var $this = $(e.target),
                islist = $this.attr('data-list'),
                record = config.record;

            /*更新操作模型*/
            self.initRecord(record);
            record.current = $this;
            /*清除操作机构记录*/
            self.initStructPos(config.structpos);

            /*切换显示隐藏*/
            self.$admin_struct_submenu.toggleClass('g-d-showi');
            if ($this.hasClass('sub-menu-titleactive')) {
                /*隐藏*/
                $this.removeClass('sub-menu-titleactive');
            } else {
                /*显示*/
                $this.addClass('sub-menu-titleactive');
                if (islist === 'true') {
                    record.hasdata = true;
                    self.initOperate(config, true);
                } else if (islist === 'false') {
                    record.hasdata = false;
                    self.initOperate(config);
                }
            }
        };
        /*导航服务--拷贝本级数据(to do)*/
        this.copySubMenu = function ($wrap) {
            var data = $wrap.find('>li >a'),
                len = data.size();

            if (len !== 0) {
                /*有数据节点*/
                var list = [];
                data.each(function () {
                    var citem = $(this),
                        label = citem.html(),
                        id = citem.attr('data-id'),
                        layer = citem.attr('data-layer'),
                        parentid = citem.attr('data-parentid');
                    list.push({
                        parentid: parentid,
                        layer: layer,
                        label: label,
                        id: id
                    });
                });
                return list;
            } else {
                return null;
            }
        };


        /*操作记录服务--初始化操作参数(搜索模式或者重置操作参数模式)*/
        this.initRecord = function (record, flag) {
            /*是否重置数据*/
            if (flag) {
                record.hasdata = false;
            }
            record.layer = 0;
            record.organizationId = record.currentId;
            record.organizationName = record.currentName;
            record.structId = '';
            record.structName = '';
            record.structnode = null;
            if (record.prev !== null) {
                record.prev.removeClass('sub-menuactive');
                record.current.removeClass('sub-menuactive');
                record.prev = null;
            } else if (record.current !== null) {
                record.current.removeClass('sub-menuactive');
            }
            record.current = null;
        };
        /*操作记录服务--初始化操作参数(搜索模式或者重置操作参数模式)*/
        this.initStructPos = function (structpos) {
            for (var i in structpos) {
                structpos[i] = {
                    id: '',
                    $node: null,
                    active: '',
                    layer: '',
                    parentid: ''
                };
            }
        };

        /*机构服务--初始化机构操作区域，flag：是否可以直接拿数据(文档数据)*/
        this.initOperate = function (config, flag) {
            if (!config) {
                return false;
            }
            var record = config.record;
            if (!record.hasdata) {
                self.renderOperate(config, {
                    data: null,
                    type: 'query'
                });
            } else {
                /*渲染机构*/
                if (flag) {
                    var $child = record.current !== null ? record.current.next() : self.$admin_struct_submenu,
                        data = self.copySubMenu($child);
                    if (data !== null) {
                        self.renderOperate(config, {
                            data: data,
                            type: 'query'
                        });
                    } else {
                        self.renderOperate(config, {
                            data: null,
                            type: 'query'
                        });
                    }
                } else {
                    self.renderOperate(config, {
                        data: null,
                        type: 'query'
                    });
                }
            }
            /*查询店铺信息*/
            if (record.structId === '') {
                self.getColumnData(config.table, record.organizationId);
            } else {
                self.getColumnData(config.table, record.structId);
            }
        };
        /*机构服务--填充数据至操作区域*/
        this.renderOperate = function (model, config) {
            if (!model && !config) {
                return false;
            }
            /*伪分页模型*/
            var structpage = model.structpage,
                type = config.type;

            if (type === 'query') {
                /*重新查询数据*/
                if (config.data !== null) {
                    (function () {
                        var data = config.data,
                            i = 0,
                            len = data.length,
                            parentid,
                            layer,
                            label,
                            id,
                            curitem;

                        /*设置伪分页模型*/
                        structpage.total = len;
                        structpage.page = 1;
                        structpage.list.length = 0;

                        /*更新缓存*/
                        for (i; i < len; i++) {

                            curitem = data[i];
                            id = curitem['id'];
                            label = curitem['label'];
                            parentid = curitem['parentid'];
                            layer = curitem['layer'];

                            structpage.list.push('<li class="ts-reload" data-layerflag="parent" data-parentid="' + parentid + '" data-label="' + label + '" data-id="' + id + '" data-layer="' + layer + '">' + label + '<span  data-layerflag="parent" title="加载数据" data-isrequest="false" data-parentid="' + parentid + '" data-label="' + label + '" data-id="' + id + '" data-layer="' + layer + '"></span><ul></ul></li>');
                        }
                    }());
                } else {
                    self.$admin_struct_list.html('');
                    /*设置伪分页模型*/
                    structpage.total = 0;
                    structpage.page = 1;
                    structpage.list.length = 0;
                }
            }


            /*渲染分页*/
            if (!structpage.init) {
                /*没有初始化时初始化调用*/
                structpage.init = true;
                self.$admin_structpage_wrap.pagination({
                    pageNumber: structpage.page,
                    pageSize: structpage.pageSize,
                    total: structpage.total,
                    onSelectPage: function (pageNumber, pageSize) {
                        /*再次查询*/
                        structpage.page = pageNumber;
                        structpage.pageSize = pageSize;

                        /*存在操作情况，这重置操作情况--查询店铺信息*/
                        if (model.record.structId !== '') {
                            self.getColumnData(model.table, model.record.organizationId);
                        }
                        /*清除分页前的操作模型*/
                        self.initStructPos(model.structpos);
                        /*变更模型*/
                        if (struct_page_timer !== null) {
                            $timeout.cancel(struct_page_timer);
                            struct_page_timer = null;
                        }
                        struct_page_timer = $timeout(function () {
                            model.record.structId = '';
                            model.record.structName = '';
                            model.record.structnode = null;
                            model.record.layer = 0;
                        }, 0);

                        /*伪分页数据*/
                        self.renderOperate(model, {
                            type: 'load'
                        });
                    }
                });
                /*清除延迟指针*/
                if (struct_page_timer !== null) {
                    $timeout.cancel(struct_page_timer);
                    struct_page_timer = null;
                }
            } else {
                self.$admin_structpage_wrap.pagination({
                    pageNumber: structpage.page,
                    pageSize: structpage.pageSize,
                    total: structpage.total
                });
            }


            /*生成数据*/
            if (structpage.total === 0) {
                self.$admin_struct_list.html('');
            } else if (structpage.total !== 0) {
                var begin,
                    end,
                    str = '',
                    list = structpage.list.slice(0);

                if (structpage.pageSize >= structpage.total) {
                    begin = 0;
                    end = structpage.total;
                } else {
                    begin = (structpage.page - 1) * structpage.pageSize;
                    end = structpage.page * structpage.pageSize;
                    if (end > structpage.total) {
                        end = structpage.total;
                    }
                }
                for (begin; begin < end; begin++) {
                    str += list[begin];
                }
                if (str !== '') {
                    $(str).appendTo(self.$admin_struct_list.html(''));
                }
            }
        };
        /*机构服务--点击机构事件*/
        this.toggleStructList = function (e, config) {
            e.preventDefault();

            var target = e.target,
                node = target.nodeName.toLowerCase(),
                isreload = true,
                id,
                label,
                layer,
                record = config.record;

            if (node === 'span') {
                var $span = $(target),
                    $item = $span.parent(),
                    isrequest = false;

                id = $span.attr('data-id');
                label = $span.attr('data-label');
                layer = $span.attr('data-layer');

                /*变更模型*/
                record.structId = id;
                record.structName = label;
                record.structnode = $span;
                record.layer = layer;

                /*数据状态*/
                isreload = $item.hasClass('ts-reload');
                if (isreload) {
                    /*显示*/
                    isrequest = $span.attr('data-isrequest');
                    if (isrequest === 'false') {
                        /*获取非根目录数据*/
                        self.getOperateList({
                            record: config.record,
                            table: config.table
                        }, $span);
                    }
                } else {
                    /*普通状态*/
                    var haschild = $item.hasClass('ts-child');
                    if (haschild) {
                        if ($item.hasClass('ts-active')) {
                            /*隐藏*/
                            $item.removeClass('ts-active');
                        } else {
                            /*显示*/
                            $item.addClass('ts-active');
                        }
                    }
                }
            } else if (node === 'li') {
                self.setStructPos(config, $(target));
            }
            return false;
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
                if (config.record.searchname !== '') {
                    param['fullName'] = record.searchname;
                }
                param['organizationId'] = id;

                /*查询店铺信息*/
                self.getColumnData(config.table, id);

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
                                        toolUtil.loginTips({
                                            clear: true,
                                            reload: true
                                        });
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
                toolUtil.loginTips({
                    clear: true,
                    reload: true
                });
            }
        };
        /*机构服务--设置机构数据,$node:node节点，structpos:位置模型*/
        this.setStructPos = function (config, $li) {
            if (!config && !$li) {
                return false;
            }

            var record = config.record,
                structpos = config.structpos,
                type = '',
                pos = '',
                active,
                valid = self.validStructPos(structpos),
                activemap = {
                    up: 'ts-posup',
                    down: 'ts-posdown'
                };

            /*适配位置参数*/
            if ($li.hasClass(activemap['up'])) {
                pos = 'up';
                type = 'delete';
            } else {
                if ($li.hasClass(activemap['down'])) {
                    pos = 'down';
                    type = 'delete';
                } else {
                    /*都不存在的情况需要判断之前是否已经选中了相关*/
                    if (valid.flag) {
                        /*已经有值：表示操作最后项*/
                        pos = 'down';
                        type = 'add';
                    } else {
                        /*没有值则根据相关值操作*/
                        pos = valid.pos;
                        type = 'add';
                    }
                }
            }
            active = activemap[pos];

            /*处理异常*/
            if (pos === '') {
                pos = 'up';
                type = 'add';
                active = activemap[pos];
            }

            var temppos = structpos[pos],
                id = temppos['id'],
                label;

            /*操作*/
            if (type === 'add') {
                /*添加*/
                var parentid = $li.attr('data-parentid'),
                    layer = $li.attr('data-layer'),
                    sibling,
                    siblingitem,
                    siblingid;

                /*过滤层级和父标识*/
                if (pos === 'up') {
                    sibling = 'down';
                } else if (pos === 'down') {
                    sibling = 'up';
                }
                siblingitem = structpos[sibling];
                siblingid = siblingitem['id'];

                if (id === '') {
                    /*过滤层级关系不一致的情况*/
                    if (siblingid !== '' && siblingitem['layer'] !== layer && siblingitem['parentid'] !== parentid) {
                        toolDialog.show({
                            type: 'warn',
                            value: '只能操作同一父级且同级别下的机构'
                        });
                        return false;
                    }
                    /*直接新增*/
                    /*修改样式*/
                    $li.addClass(active);
                    /*赋值*/
                    id = $li.attr('data-id');
                    label = $li.attr('data-label');
                } else {
                    /*过滤层级关系不一致的情况*/
                    if (siblingitem['layer'] !== layer && siblingitem['parentid'] !== parentid) {
                        toolDialog.show({
                            type: 'warn',
                            value: '只能操作同一父级且同级别下的机构'
                        });
                        return false;
                    }
                    /*更新新增*/
                    /*修改样式*/
                    temppos['$node'].removeClass(temppos['active']);
                    $li.addClass(active);
                    /*清空,释放内存*/
                    temppos['$node'] = null;
                    /*赋值*/
                    id = $li.attr('data-id');
                    label = $li.attr('data-label');
                }

                /*赋值*/
                temppos['id'] = id;
                temppos['$node'] = $li;
                temppos['active'] = active;
                temppos['layer'] = layer;
                temppos['parentid'] = parentid;


                /*模型变更*/
                record.structId = id;
                record.structName = label;
                record.layer = layer;
                record.structnode = $li;
            } else if (type === 'delete') {
                /*删除*/
                /*修改样式*/
                temppos['$node'].removeClass(temppos['active']);
                /*清空,释放内存*/
                temppos['$node'] = null;
                temppos['id'] = '';
                temppos['active'] = '';
                temppos['layer'] = '';
                temppos['parentid'] = '';

                /*模型变更*/
                record.structId = '';
                record.structName = '';
                record.layer = 0;
                record.structnode = null;
            }
        };
        /*机构服务--校验机构数据*/
        this.validStructPos = function (structpos) {
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
                    result['pos'] = i;
                    result['flag'] = false;
                    return result;
                } else {
                    count++;
                    if (count === 1) {
                        result['pos'] = i;
                        result['flag'] = false;
                    } else if (count === 2) {
                        result['flag'] = true;
                    }
                }
            }
            return result;
        };
        /*机构服务--操作机构*/
        this.actionStruct = function (config) {
            var modal = config.modal,
                struct = config.struct,
                record = config.record,
                type = modal.type;


            /*判断是否是合法的节点，即是否有父机构*/
            if (record.organizationId === '') {
                toolDialog.show({
                    type: 'warn',
                    value: '没有父机构或父机构不存在'
                });
                return false;
            }

            /*如果存在延迟任务则清除延迟任务*/
            self.clearFormDelay();
            /*通过延迟任务清空表单数据*/
            self.addFormDelay({
                type: 'struct'
            });

            /*根据类型跳转相应逻辑*/
            if (type === 'edit') {
                /*查询相关存在的数据*/
                self.queryOperateInfo(config);
            } else if (type === 'add') {
                /*默认为全选权限,不查询权限*/

                /*显示弹窗*/
                self.toggleModal({
                    display: modal.display,
                    area: modal.area
                });
            }
        };
        /*机构服务--删除机构*/
        this.deleteStruct = function (config) {
            if (cache === null) {
                return false;
            }
            var record = config.record,
                table = config.table,
                tempparam = cache.loginMap.param,
                id = '',
                param = {
                    token: tempparam.token,
                    adminId: tempparam.adminId
                };

            /*判断参数*/
            if (record.structId !== '') {
                id = record.structId;
            } else if (record.structId === '') {
                id = record.organizationId;
            }

            if (id === '' || id === null || record.layer === 0) {
                toolDialog.show({
                    type: 'warn',
                    value: '没有机构或机构不存在'
                });
                return false;
            }

            param['id'] = id;


            /*确认是否删除*/
            toolDialog.sureDialog('', function () {
                /*执行删除机构操作*/
                toolUtil
                    .requestHttp({
                        url: '/organization/delete'/*'json/test.json'*//*测试地址*/,
                        method: 'post',
                        set: true,
                        debug: false, /*测试标识*/
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
                                        toolDialog.show({
                                            type: 'warn',
                                            value: '删除机构失败 (' + message + ')'
                                        });
                                    } else {
                                        toolDialog.show({
                                            type: 'warn',
                                            value: '删除机构失败'
                                        });
                                    }

                                    if (code === 999) {
                                        /*退出系统*/
                                        cache = null;
                                        toolUtil.loginTips({
                                            clear: true,
                                            reload: true
                                        });
                                    }
                                } else {
                                    /*加载数据*/
                                    /*重置操作记录*/
                                    if (record.searchname === '') {
                                        self.initRecord(record);
                                    }
                                    /*初始化菜单信息*/
                                    self.getMenuList(config);
                                    /*提示信息*/
                                    toolDialog.show({
                                        type: 'succ',
                                        value: '删除机构成功'
                                    });
                                }
                            }
                        },
                        function (resp) {
                            var message = resp.data.message;
                            if (typeof message !== 'undefined' && message !== '') {
                                console.log(message);
                            } else {
                                console.log('删除机构失败');
                            }
                        });
            }, '是否真要删除机构数据', true);
        };
        /*机构服务--查询机构数据*/
        this.queryOperateInfo = function (config) {
            if (cache === null) {
                return false;
            }
            var record = config.record,
                struct = config.struct,
                modal = config.modal,
                param = $.extend(true, {}, cache.loginMap.param);

            /*判断参数*/
            if (record.structId !== '') {
                param['id'] = record.structId;
            } else if (record.structId === '') {
                param['id'] = record.organizationId;
            }

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
                                    toolUtil.loginTips({
                                        clear: true,
                                        reload: true
                                    });
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
                                                case 'adscriptionRegion':
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
                                                                url: '',
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
                            console.log('请求机构失败');
                        }
                    });
        };
        /*机构服务--调整机构位置*/
        this.adjustStructPos = function (config) {
            var structpos = config.structpos,
                ispos = self.getStructPos(structpos);

            if (!ispos) {
                toolDialog.show({
                    type: 'warn',
                    value: '请选择所要调整的位置的2个对象'
                });
                return false;
            } else {
                /*to do request*/
                if (cache) {
                    var param = $.extend(true, {}, cache.loginMap.param);

                    param['organizationIdUp'] = ispos['up'];
                    param['organizationIdDown'] = ispos['down'];
                    toolUtil
                        .requestHttp({
                            url: '/organization/position/setting',
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
                                            toolUtil.loginTips({
                                                clear: true,
                                                reload: true
                                            });
                                        } else {
                                            toolDialog.show({
                                                type: 'warn',
                                                value: '位置调整失败'
                                            });
                                            /*清除模型数据*/
                                            self.initStructPos(structpos);
                                        }
                                    } else {
                                        toolDialog.show({
                                            type: 'succ',
                                            value: '位置调整成功'
                                        });
                                        /*重新加载数据*/
                                        if (config.record.searchname == '') {
                                            self.initRecord(config.record);
                                        }
                                        self.getMenuList({
                                            record: config.record,
                                            table: config.table,
                                            structpos: config.structpos,
                                            structpage: config.structpage
                                        });
                                    }
                                }
                            },
                            function (resp) {
                                /*清除模型数据*/
                                self.initStructPos(structpos);
                                var message = resp.data.message;
                                if (typeof message !== 'undefined' && message !== '') {
                                    console.log(message);
                                } else {
                                    console.log('位置调整失败');
                                }
                            });

                } else {
                    /*退出系统*/
                    cache = null;
                    toolUtil.loginTips({
                        clear: true,
                        reload: true
                    });
                }
            }
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
                    param['adscriptionRegion'] = config[type]['adscriptionRegion'];
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
                        if (record.structId === '') {
                            param['parentId'] = record.organizationId;
                        } else {
                            param['parentId'] = record.structId;
                        }
                        req_config['url'] = '/organization/add';
                    } else {
                        action = 'edit';
                        param['id'] = config[type]['id'];
                        param['sysUserId'] = config[type]['sysUserId'];
                        param['parentId'] = config[type]['parentId'];
                        req_config['url'] = '/organization/update';
                    }
                } else if (type === 'user') {
                    /*公共配置*/
                    param['fullName'] = config[type]['fullName'];
                    param['shortName'] = config[type]['shortName'];
                    param['name'] = config[type]['name'];
                    param['type'] = config[type]['shoptype'];
                    param['cellphone'] = toolUtil.trims(config[type]['cellphone']);
                    param['telephone'] = toolUtil.trimSep(config[type]['telephone'], '-');
                    param['province'] = config[type]['province'];
                    param['city'] = config[type]['city'];
                    param['country'] = config[type]['country'];
                    param['address'] = config[type]['address'];
                    param['status'] = config[type]['status'];
                    param['remark'] = config[type]['remark'];

                    /*判断是新增还是修改*/
                    if (config[type]['id'] === '') {
                        action = 'add';
                        param['organizationId'] = record.structId !== '' ? record.structId : record.organizationId !== '' ? record.organizationId : record.currentId;
                        param['fullName'] = config[type]['fullName'];
                        req_config['url'] = '/organization/shop/add';
                    } else {
                        action = 'edit';
                        param['organizationId'] = config[type]['organizationId'];
                        param['id'] = config[type]['id'];
                        req_config['url'] = '/organization/shop/update';
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
                                        toolUtil.loginTips({
                                            clear: true,
                                            reload: true
                                        });
                                    }
                                    return false;
                                } else {
                                    /*操作成功即加载数据*/
                                    /*to do*/
                                    if (type === 'struct') {
                                        self.getMenuList({
                                            record: config.record,
                                            table: config.table,
                                            structpos: config.structpos,
                                            structpage: config.structpage
                                        });
                                    } else if (type === 'user') {
                                        /*重新加载表格数据*/
                                        /*查询店铺信息*/
                                        if (config.record.structId === '') {
                                            self.getColumnData(config.table, config.record.organizationId);
                                        } else {
                                            self.getColumnData(config.table, config.record.structId);
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
                toolUtil.loginTips({
                    clear: true,
                    reload: true
                });
            }
        };
        /*表单类服务--重置表单*/
        this.formReset = function (config, type) {
            if (type === 'struct') {
                /*重置表单模型,如果是2参数则为特殊重置，1个参数为通用重置*/
                self.clearFormData(config[type], type);
                /*重置权限信息*/
                self.clearSelectPower(config[type]);
            } else if (type === 'user') {
                /*特殊情况--成员*/
                self.clearFormData(config[type], type);
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
            if (record.structId !== '') {
                cid = record.structId;
                if (record.structnode !== null) {
                    pid = record.structnode.attr('data-parentid');
                }
            } else if (record.organizationId !== '') {
                cid = record.organizationId;
                if (record.current !== null && record.layer !== 0) {
                    pid = record.current.attr('data-parentid');
                } else {
                    pid = record.currentId;
                }
            } else if (record.currentId !== '') {
                cid = pid = record.currentId;
            }
            return {
                cid: cid,
                pid: pid
            };
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
                                    toolUtil.loginTips({
                                        clear: true,
                                        reload: true
                                    });
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
        /*用户服务--批量删除*/
        this.batchDeleteUser = function (config, id) {
            if (cache === null) {
                return false;
            }
            var record = config.record,
                table = config.table,
                type;
            if (typeof id === 'undefined') {
                var batchdata = dataTableCheckAllService.getBatchData(table.tablecheckall),
                    len = batchdata.length;
                if (len === 0) {
                    toolDialog.show({
                        type: 'warn',
                        value: '请选中相关数据'
                    });
                    return false;
                }
                type = 'batch';
            } else {
                if (isNaN(id)) {
                    toolDialog.show({
                        type: 'warn',
                        value: '请选中相关数据'
                    });
                    return false;
                }
                type = 'base';
            }
            toolDialog.show({
                type: 'warn',
                value: '功能正在开发中...'
            });
            return false;
            var param = $.extend(true, {}, cache.loginMap.param);

            /*判断参数*/
            if (record.structId !== '') {
                param['organizationId'] = record.structId;
            } else if (record.structId === '') {
                param['organizationId'] = record.organizationId;
            }

            if (type === 'batch') {
                param['shopIds'] = batchdata.join(',');
            } else if (type === 'base') {
                param['shopIds'] = id;
            }

            /*确认是否删除*/
            toolDialog.sureDialog('', function () {
                /*执行删除操作*/
                toolUtil
                    .requestHttp({
                        url: '/organization/shop/delete',
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
                                        /*提示信息*/
                                        toolDialog.show({
                                            type: 'warn',
                                            value: message
                                        });
                                    } else {
                                        /*提示信息*/
                                        toolDialog.show({
                                            type: 'warn',
                                            value: '删除店铺失败'
                                        });
                                    }

                                    if (code === 999) {
                                        /*退出系统*/
                                        cache = null;
                                        toolUtil.loginTips({
                                            clear: true,
                                            reload: true
                                        });
                                    }
                                } else {
                                    /*提示信息*/
                                    toolDialog.show({
                                        type: 'succ',
                                        value: '删除店铺成功'
                                    });

                                    /*清空全选*/
                                    dataTableCheckAllService.clear(table.tablecheckall);
                                    /*重新加载数据*/
                                    /*查询店铺信息*/
                                    if (record.structId === '') {
                                        self.getColumnData(table, record.organizationId);
                                    } else {
                                        self.getColumnData(table, record.structId);
                                    }
                                }
                            }
                        },
                        function (resp) {
                            var message = resp.data.message;
                            if (typeof message !== 'undefined' && message !== '') {
                                console.log(message);
                            } else {
                                console.log('删除店铺失败');
                            }
                        });
            }, type === 'base' ? '是否真要删除店铺数据' : '是否真要批量删除店铺数据', true);
        };


        /*数据服务--请求数据--获取表格数据*/
        this.getColumnData = function (table, id) {
            if (cache === null) {
                return false;
            } else if (!table) {
                return false;
            }
            /*如果存在模型*/
            var data = $.extend(true, {}, table.list1_config.config.ajax.data);
            if (typeof id !== 'undefined') {
                /*设置值*/
                data['organizationId'] = id;
                /*参数赋值*/
                table.list1_config.config.ajax.data = data;

                if (table.list_table === null) {
                    /*初始请求*/
                    var temp_param = cache.loginMap.param;
                    table.list1_config.config.ajax.data['adminId'] = temp_param.adminId;
                    table.list1_config.config.ajax.data['token'] = temp_param.token;
                    table.list_table = self.$admin_list_wrap.DataTable(table.list1_config.config);
                    /*调用列控制*/
                    dataTableColumnService.initColumn(table.tablecolumn, table.list_table);
                    /*调用全选与取消全选*/
                    dataTableCheckAllService.initCheckAll(table.tablecheckall);
                    /*调用按钮操作*/
                    dataTableItemActionService.initItemAction(table.tableitemaction);
                } else {
                    /*清除批量数据*/
                    dataTableCheckAllService.clear(table.tablecheckall);
                    table.list_table.ajax.config(table.list1_config.config.ajax).load();
                }
            } else if (typeof id === 'undefined' && table.list_table !== null && typeof data['organizationId'] !== 'undefined') {
                /*清除批量数据*/
                dataTableCheckAllService.clear(table.tablecheckall);
                table.list_table.ajax.config(table.list1_config.config.ajax).load();
            }
        };
        /*数据服务--过滤表格数据*/
        this.filterDataTable = function (list_table, user) {
            if (list_table === null) {
                return false;
            }
            var filter = user.filter;
            list_table.search(filter).columns().draw();
        };
        /*数据服务--表格全选与取消全选*/
        this.initCheckAll = function (tablecheckall) {
            dataTableCheckAllService.initCheckAll(tablecheckall);
        };
        /*数据服务--表格单项操作*/
        this.initItemAction = function (tableitemaction, $scope) {
            dataTableItemActionService.initItemAction(module_id, tableitemaction, $scope);
        };
        /*数据服务--操作按钮*/
        this.doItemAction = function (model, config) {
            var id = config.id,
                action = config.action;

            if (action === 'detail') {
                self.queryUserInfo(null, id, action);
            } else if (action === 'delete') {
                self.batchDeleteUser(model, id);
            } else if (action === 'update') {
                self.queryUserInfo(model, id, action);
            }
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