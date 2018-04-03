/*批量组件*/
;(function ($) {
    'use strict';
    var cache_checkall = null/*存放全选按钮*/,
        cache_list = []/*存放选中值*/,
        cache_node = []/*存放选中节点*/,
        cache_parent = []/*存放选中节点父高亮节点*/;
    /*构造函数*/
    function SimulationBatch() {
    }

    /*子类*/
    function SubSimulationBatch() {
    }

    /*空函数*/
    function nofn() {
    }


    /**/

    /*初始化配置函数*/
    SimulationBatch.prototype.config = function (opt) {
        var self = this;
        $.extend(true, this, {
            checkactive: 'simulation-batch-check-active'/*全选按钮选中*/,
            itemactive: 'item-lighten'/*单个数据高亮*/,
            highactive: 'item-lightenbatch'/*批量数据高亮*/,
            isself: false/*是否全选本身也参与数据处理*/,
            ismutil: false/*是否存在多个全选*/,
            selector: '>tr'/*默认选择器*/,
            parent: 'tr'/*默认上节点*/
        }, opt);
    };

    /*组件初始化*/
    SimulationBatch.prototype.widgetInit = function () {
        /*to do*/
    };

    /*事件注册--绑定全选与取消全选--适应外部事件绑定*/
    SimulationBatch.prototype.bindMutilAll = function (config) {
        var $wrap = config.$wrap/*执行子选项查找操作的容器*/,
            $checkall = config.$checkall/*全选按钮*/,
            $parent = config.$parent/*全选父级高亮容器*/;

        if ($wrap && $checkall) {
            var check = parseInt($checkall.attr('data-check'), 10);
            if (check === 0) {
                /*选中*/
                /*清除上一次记录*/
                this.clear($checkall);
                /*重选*/
                if (this.isself) {
                    cache_list.push($checkall.attr('data-id'));
                    cache_node.push($checkall.attr({
                        'data-check': 1
                    }).addClass(this.checkactive));
                    if ($parent) {
                        cache_parent.push($parent.removeClass(this.itemactive).addClass(this.highactive));
                    } else {
                        cache_parent.push($checkall.closest(this.parent).removeClass(this.itemactive).addClass(this.highactive));
                    }
                } else {
                    cache_checkall.attr({
                        'data-check': 1
                    }).addClass(this.checkactive);
                }
                /*执行全选*/
                this.toggleAll({
                    chk: 1,
                    $wrap: $wrap
                });
            } else if (check === 1) {
                /*执行取消全选*/
                this.clear();
            }
        }
    };

    /*事件注册--绑定单项选择--适应外部事件绑定*/
    SimulationBatch.prototype.bindMutilItem = function (config) {
        this.toggleItem(config);
    };


    /*事件注册--绑定全选与取消全选--适应内部事件绑定*/
    SimulationBatch.prototype.bindAll = function (config) {
        var $wrap = config.$wrap,
            $checkall = config.$checkall;

        if (cache_checkall === null) {
            if (!$checkall) {
                /*第一次绑定时非法模式*/
                return false;
            }
            cache_checkall = $checkall;
        }
        /*注册事件*/
        if ($wrap) {
            var self = this;
            cache_checkall.on('click', function () {
                var $this = $(this),
                    check = parseInt($this.attr('data-check'), 10);
                if (check === 0) {
                    /*选中*/
                    $this.attr({
                        'data-check': 1
                    }).addClass(this.checkactive);
                    /*执行全选*/
                    self.toggleAll({
                        chk: 1,
                        $wrap: $wrap
                    });
                } else if (check === 1) {
                    /*执行取消全选*/
                    self.clear();
                }
            });
        }
    };

    /*事件注册--绑定单项选择-适应内部事件绑定*/
    SimulationBatch.prototype.bindItem = function ($checkItem) {
        if ($checkItem) {
            var self = this;
            $checkItem.on('click', function () {
                self.toggleItem({
                    $input: $(this)
                });
            });
        }
    };


    /*事件注册--绑定操作回调*/
    SimulationBatch.prototype.action = function () {
        /*to do*/
    };


    /*对外工具*/
    /*清空数据(清除已经选中的数据),适合文档操作类*/
    SimulationBatch.prototype.clear = function ($checkall) {
        /*清除选中*/
        var len = cache_node.length;
        if (len !== 0) {
            var i = len - 1;
            for (i; i >= 0; i--) {
                this.deleteData(i);
            }
            cache_node.length = 0;
            cache_parent.length = 0;
        }
        cache_list.length = 0;
        /*清除全选:非自选模式*/
        if (!this.isself) {
            cache_checkall.attr({
                'data-check': 0
            }).removeClass(this.checkactive);
            /*更新值*/
            if ($checkall) {
                cache_checkall = $checkall;
            }
        }
    };

    /*摧毁数据:适应直接清除数据，不做文档操作*/
    SimulationBatch.prototype.destroy = function () {
        /*清除选中*/
        cache_list.length = 0;
        cache_node.length = 0;
        cache_parent.length = 0;
        cache_checkall = null;
    };

    /*过滤数据(清除并过滤已经选中的数据)*/
    SimulationBatch.prototype.filter = function (key, fn) {
        /*清除选中*/
        var len = cache_list.length;
        if (len !== 0 && typeof key !== 'undefined') {
            if ($.isArray(key)) {
                var j = 0,
                    jlen = key.length,
                    k = 0,
                    klen = cache_node.length;

                for (j; j < jlen; j++) {
                    for (k; k < klen; k++) {
                        if (cache_list[k] === key[j]) {
                            this.deleteData(k);
                            k = 0;
                            klen = cache_list.length;
                            break;
                        }
                    }
                }
                if (cache_list.length === 0) {
                    this.clear();
                    /*执行回调*/
                    if (fn && typeof fn === 'function') {
                        fn.call(null, 0);
                    }
                }
            } else {
                var i = len - 1;
                for (i; i >= 0; i--) {
                    if (cache_list[i] === key) {
                        this.deleteData(i);
                        break;
                    }
                }
                if (cache_list.length === 0) {
                    this.clear();
                    /*执行回调*/
                    if (fn && typeof fn === 'function') {
                        fn.call(null, 0);
                    }
                }
            }
        }
    };

    /*过滤数据(清除并过滤已经选中的数据)，依赖状态*/
    SimulationBatch.prototype.filterStatus = function (config) {
        var self = this,
            attrkey/*需要比对的属性*/,
            attrvalue/*需要比对的属性值*/,
            isgroup = false,
            ismutil = false,
            len = cache_node.length,
            i,
            $input,
            data_key,
            data_value;

        if (len === 0) {
            return '';
        }
        /*,分割多个组合条件，#分割多个值*/
        if (config.attrkey.indexOf(',') !== -1) {
            attrkey = config.attrkey.split(',');
            attrvalue = (function () {
                var tempvalue = config.attrvalue.split(','),
                    templen = tempvalue.length,
                    k = 0;
                for (k; k < templen; k++) {
                    if (tempvalue.indexOf('#') !== -1) {
                        tempvalue.splice(k, 1, (function () {
                            var tempmutil = tempvalue[k].split('#'),
                                p = 0,
                                mutillen = tempmutil.length;
                            for (p; p < mutillen; p++) {
                                tempmutil.splice(p, 1, parseInt(tempmutil[p], 10));
                            }
                            return tempmutil;
                        }()));
                    } else {
                        tempvalue.splice(k, 1, parseInt(tempvalue[k], 10));
                    }
                }
                return tempvalue;
            }());
            isgroup = true;
        } else {
            attrkey = config.attrkey;
            attrvalue = (function () {
                if (config.attrvalue.indexOf('#') !== -1) {
                    var tempmutil = config.attrvalue.split('#'),
                        p = 0,
                        mutillen = tempmutil.length;
                    for (p; p < mutillen; p++) {
                        tempmutil.splice(p, 1, parseInt(tempmutil[p], 10));
                    }
                    return tempmutil;
                } else {
                    return parseInt(config.attrvalue, 10);
                }
            }())
        }
        i = len - 1;
        if (isgroup) {
            /*关联多个状态*/
            for (i; i >= 0; i--) {
                /*遍历所选数据列:array类型*/
                $input = cache_node[i];
                (function () {
                    var j = 0,
                        sublen = attrkey.length;

                    for (j; j < sublen; j++) {
                        /*遍历attrkey所提供组合属性，array类型*/
                        data_key = $input.attr('data-' + attrkey[j]);
                        if (typeof data_key !== 'undefined' && data_key !== '') {
                            /*存在属性值*/
                            data_value = attrvalue[j];
                            if (typeof data_value !== 'undefined' && data_value !== '') {
                                /*标准值*/
                                data_key = parseInt(data_key, 10);
                                if ($.isArray(data_value)) {
                                    ismutil = self.mutilData(data_value, data_key);
                                    if (ismutil) {
                                        self.deleteData(i);
                                        break;
                                    }
                                } else if (data_value !== data_key) {
                                    /*数据不匹配则过滤调*/
                                    self.deleteData(i);
                                    break;
                                }
                            } else {
                                self.deleteData(i);
                                break;
                            }
                        } else {
                            /*不存在则直接过滤掉*/
                            self.deleteData(i);
                            break;
                        }
                    }
                }());
            }
        } else {
            /*单个状态*/
            for (i; i >= 0; i--) {
                $input = cache_node[i];
                data_value = $input.attr('data-' + attrkey);
                if (typeof data_value !== 'undefined' && data_value !== '') {
                    data_value = parseInt(data_value, 10);
                    /*数据不匹配则过滤调*/
                    if ($.isArray(attrvalue)) {
                        ismutil = self.mutilData(attrvalue, data_value);
                        if (ismutil) {
                            self.deleteData(i);
                        }
                    } else if (data_value !== attrvalue) {
                        self.deleteData(i);
                    }
                } else {
                    self.deleteData(i);
                }
            }
        }
        /*没有数据则恢复默认状态*/
        if (!self.isself && cache_list.length === 0 && cache_checkall) {
            cache_checkall.attr({
                'data-check': 0
            }).removeClass(self.checkactive);
            return '';
        } else if (cache_list.length === 0) {
            return '';
        }
        return cache_list;
    };

    /*全选和取消全选*/
    SimulationBatch.prototype.toggleAll = function (config) {
        var chk = config.chk,
            $wrap = config.$wrap;
        if ($wrap) {
            var self = this;
            if (chk === 1) {
                /*选中*/
                /*不依赖于状态*/
                $wrap.find(self.selector).each(function (index, element) {
                    var $this = $(element),
                        $input = $this.find('div.simulation-batch-check-item');
                    if ($input.size() !== 0) {
                        var check = parseInt($input.attr('data-check'), 10);
                        if (check === 0) {
                            var text = $input.attr('data-id');
                            cache_list.push(text);
                            cache_parent.push($this.removeClass(self.itemactive).addClass(self.highactive));
                            cache_node.push($input.attr({
                                'data-check': 1
                            }).addClass(self.checkactive));
                        }
                    }
                });
            }
        }
    };

    /*绑定选中某个单独多选框*/
    SimulationBatch.prototype.toggleItem = function (config) {
        var $input = config.$input/*执行子选项操作的按钮*/,
            $checkall = config.$checkall/*全选按钮*/,
            $parent = config.$parent/*全选父级高亮容器*/,
            self = this,
            len = cache_list.length,
            ishave = -1,
            text = $input.attr('data-id'),
            check = parseInt($input.attr('data-check'), 10);

        if (check === 0) {
            /*选中*/
            if (len === 0) {
                /*高亮全选*/
                if (self.isself) {
                    /*自选模式：则先添加全选*/
                    if (self.ismutil && !$checkall) {
                        $checkall = $input.closest('div.simulation-batch-check-all');
                    }
                    cache_list.push($checkall.attr('data-id'));
                    cache_node.push($checkall.attr({
                        'data-check': 1
                    }).addClass(self.checkactive));
                    if ($parent) {
                        cache_parent.push($parent.removeClass(self.itemactive).addClass(self.highactive));
                    } else {
                        cache_parent.push($input.closest(self.parent).removeClass(self.itemactive).addClass(self.highactive));
                    }
                } else {
                    /*非自选模式需要判断全选是否传入*/
                    if (self.ismutil || (!self.ismutil && cache_checkall === null)) {
                        if ($checkall) {
                            cache_checkall = $checkall;
                        } else {
                            cache_checkall = $input.closest('div.simulation-batch-check-all');
                        }
                        cache_checkall.attr({
                            'data-check': 1
                        }).addClass(self.checkactive);
                    }
                }
                cache_list.push(text);
                cache_node.push($input.attr({
                    'data-check': 1
                }).addClass(self.checkactive));
                cache_parent.push($input.closest(self.parent).removeClass(self.itemactive).addClass(self.highactive));
            } else {
                ishave = $.inArray(text, cache_list);
                if (ishave !== -1) {
                    /*存在则更新缓存*/
                    cache_list.splice(ishave, 1, text);
                    cache_node.splice(ishave, 1, $input);
                    cache_parent.splice(ishave, 1, $input.closest(self.parent).removeClass(self.itemactive).addClass(self.highactive));
                } else {
                    /*不存在则存入缓存*/
                    cache_list.push(text);
                    cache_node.push($input.attr({
                        'data-check': 1
                    }).addClass(self.checkactive));
                    cache_parent.push($input.closest(self.parent).removeClass(self.itemactive).addClass(self.highactive));
                }
            }
        } else if (check === 1) {
            /*取消选中*/
            ishave = $.inArray(text, cache_list);
            if (ishave !== -1) {
                self.deleteData(ishave);
                if (cache_list.length === 0) {
                    self.clear();
                }
            }
        }
    };

    /*判断设置全选*/
    SimulationBatch.prototype.getCheckAll = function () {
        return cache_checkall;
    };


    /*获取选中的数据*/
    SimulationBatch.prototype.getParent = function () {
        return cache_parent;
    };

    /*获取选中的数据*/
    SimulationBatch.prototype.getList = function () {
        return cache_list;
    };

    /*获取选中的文档节点*/
    SimulationBatch.prototype.getNode = function () {
        return cache_node;
    };

    /*更新全选缓存*/
    SimulationBatch.prototype.deleteData = function (key) {
        /*to do:可能需要恢复状态*/
        /*删除操作*/
        cache_node[key].attr({
            'data-check': 0
        }).removeClass(this.checkactive);
        cache_parent[key].removeClass(this.itemactive + ' ' + this.highactive);
        cache_node.splice(key, 1);
        cache_list.splice(key, 1);
        cache_parent.splice(key, 1);
    };

    /*匹配多值，返回false则不匹配，返回true则匹配*/
    SimulationBatch.prototype.mutilData = function (arr, str) {
        if (typeof arr === 'undefined') {
            /*不匹配*/
            return false;
        }
        var mutil_len = arr.length,
            m = 0;

        if (mutil_len === 0) {
            /*不匹配*/
            return false;
        } else {
            for (m; m < mutil_len; m++) {
                if (arr[m] === str) {
                    /*匹配*/
                    return true;
                }
                if (m === mutil_len - 1) {
                    /*全部不匹配*/
                    return false;
                }
            }
        }
    };


    /*设置继承*/
    nofn.prototype = SimulationBatch.prototype;
    SubSimulationBatch.prototype = new nofn();

    /*设置地址对外接口*/
    if (window['simulationBatch']) {
        window['simulationBatch'] = window['simulationBatch'];
    } else {
        window['simulationBatch'] = new SubSimulationBatch();
    }
})(jQuery);