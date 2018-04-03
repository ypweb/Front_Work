function operatorCheck_old(config, flag) {
    var target,
        $label,
        type = config.type/*选择的是全选还是单个选项*/,
        record = config.record,
        ischeck,
        id;

    if (flag) {
        $label = config.target;
        if (flag === 'yes') {
            ischeck = false;
        } else if (flag === 'no') {
            ischeck = true;
        }
    } else {
        target = config.target;
        $label = $(target);
        ischeck = $label.hasClass('sub-menu-checkboxactive');
    }

    if (ischeck) {
        /*取消选中*/
        $label.removeClass('sub-menu-checkboxactive');
        if (type === 'all') {
            /*取消全选*/
            self.$admin_yystruct_menu.find('label').each(function () {
                $(this).removeClass('sub-menu-checkboxactive');
            });
            /*清除模型*/
            record['operator_cache'] = {};
        } else if (type === 'item') {
            /*取消单个*/
            id = $label.attr('data-id');
            /*变更模型*/
            delete record['operator_cache'][id];
        }
    } else {
        /*选中*/
        $label.addClass('sub-menu-checkboxactive');
        /*切换显示运营商店铺信息*/
        if (!record.operator_shopshow) {
            record.operator_shopshow = true;
        }
        if (type === 'all') {
            /*全选*/
            self.$admin_yystruct_menu.find('label').each(function () {
                var $this = $(this);
                $this.addClass('sub-menu-checkboxactive');
                id = $this.attr('data-id');
                /*变更模型*/
                record['operator_cache'][id] = {
                    'id': id,
                    'label': $this,
                    'ischeck': true,
                    'isall': false
                };
            });
            /*添加全选本身值（可以根据具体情况定制）*/
            /*
             id = $label.attr('data-id');
             record['operator_cache'][id] = {
             'id':id,
             'label':$label,
             'ischeck':true,
             'isall':true
             };
             */
        } else if (type === 'item') {
            /*选中单个*/
            id = $label.attr('data-id');
            /*变更模型*/
            record['operator_cache'][id] = {
                'id': id,
                'label': $label,
                'ischeck': true,
                'isall': false
            };
        }
    }
};

function operatorCheck_new(config, flag) {
    var target,
        $label,
        type = config.type/*选择的是全选还是单个选项*/,
        record = config.record,
        label_cache = record.operator_cache,
        ischeck,
        id;

    if (flag) {
        $label = config.target;
        if (flag === 'yes') {
            ischeck = false;
        } else if (flag === 'no') {
            ischeck = true;
        }
    } else {
        target = config.target;
        $label = $(target);
        ischeck = $label.hasClass('sub-menu-checkboxactive');
    }

    if (ischeck) {
        /*取消选中*/
        $label.removeClass('sub-menu-checkboxactive');
        if (type === 'all') {
            /*取消全选*/
            /*判断模型状态*/
            switch (label_cache.state) {
                case 'empty':
                    /*未选状态:不做操作*/
                    break;
                case 'full':
                    /*全选状态:直接操作模型*/
                    (function () {
                        for (var i in label_cache) {
                            if (i !== 'state') {
                                label_cache[i]['ischeck'] = false;
                                label_cache[i]['label'].removeClass('sub-menu-checkboxactive');
                            }
                        }
                    }());
                    break;
                case 'short':
                    /*不完全状态:循环label标签，并补充部分缺失模型*/
                    (function () {
                        self.$admin_yystruct_menu.find('label').each(function () {
                            var $this = $(this),
                                temp_id = $this.attr('data-id');
                            $this.removeClass('sub-menu-checkboxactive');
                            /*不存在模型则补充模型*/
                            if (!label_cache[temp_id]) {
                                label_cache[temp_id] = {
                                    'id': temp_id,
                                    'label': $this,
                                    'ischeck': false,
                                    'isall': false
                                };
                            } else {
                                label_cache[temp_id]['label'] = $this;
                                label_cache[temp_id]['ischeck'] = false;
                            }
                        });
                        /*循环完毕将数据状态变为完全状态*/
                        label_cache.state = 'full';
                    }());
                    break;
            }
        } else if (type === 'item') {
            /*取消单个*/
            id = $label.attr('data-id');
            /*判断模型状态*/
            switch (label_cache.state) {
                case 'empty':
                    /*未选状态:不做操作*/
                    break;
                case 'full':
                    /*全选状态:同步模型*/
                    label_cache[id]['ischeck'] = false;
                    label_cache[id]['label'] = $label;
                    break;
                case 'short':
                    /*不完全状态*/
                    if (!label_cache[id]) {
                        label_cache[id] = {
                            'id': id,
                            'label': $label,
                            'ischeck': false,
                            'isall': false
                        };
                    } else {
                        label_cache[id]['label'] = $label;
                        label_cache[id]['ischeck'] = false;
                    }
                    break;
            }
        }
        /*取消*/
    } else {
        /*选中*/
        $label.addClass('sub-menu-checkboxactive');
        /*切换显示运营商店铺信息*/
        if (!record.operator_shopshow) {
            record.operator_shopshow = true;
        }
        if (type === 'all') {
            /*判断模型状态*/
            switch (label_cache.state) {
                case 'empty':
                    /*未选状态:循环label并改变模型状态*/
                    (function () {
                        /*全选*/
                        self.$admin_yystruct_menu.find('label').each(function () {
                            var $this = $(this);
                            $this.addClass('sub-menu-checkboxactive');
                            id = $this.attr('data-id');
                            /*变更模型*/
                            label_cache[id] = {
                                'id': id,
                                'label': $this,
                                'ischeck': true,
                                'isall': false
                            };
                        });
                        /*变更模型状态为全选*/
                        label_cache.state = 'full';
                    }());
                    break;
                case 'full':
                    /*全选状态:直接操作模型*/
                    (function () {
                        for (var i in label_cache) {
                            if (i !== 'state') {
                                label_cache[i]['ischeck'] = true;
                                label_cache[i]['label'].addClass('sub-menu-checkboxactive');
                            }
                        }
                    }());
                    break;
                case 'short':
                    /*不完全状态:循环label标签，并补充部分缺失模型*/
                    (function () {
                        self.$admin_yystruct_menu.find('label').each(function () {
                            var $this = $(this),
                                temp_id = $this.attr('data-id');
                            $this.addClass('sub-menu-checkboxactive');
                            /*不存在模型则补充模型*/
                            if (!label_cache[temp_id]) {
                                label_cache[temp_id] = {
                                    'id': temp_id,
                                    'label': $this,
                                    'ischeck': true,
                                    'isall': false
                                };
                            } else {
                                label_cache[temp_id]['label'] = $this;
                                label_cache[temp_id]['ischeck'] = true;
                            }
                        });
                        /*循环完毕将数据状态变为完全状态*/
                        label_cache.state = 'full';
                    }());
                    break;
            }
            /*添加全选本身值（可以根据具体情况定制）*/
            /*
             id = $label.attr('data-id');
             label_cache[id] = {
             'id':id,
             'label':$label,
             'ischeck':true,
             'isall':true
             };
             */
        } else if (type === 'item') {
            /*选中单个*/
            id = $label.attr('data-id');
            /*判断模型状态*/
            switch (label_cache.state) {
                case 'empty':
                    /*未选状态*/
                    label_cache[id] = {
                        'id': id,
                        'label': $label,
                        'ischeck': true,
                        'isall': false
                    };
                    label_cache.state = 'short';
                    break;
                case 'full':
                    /*全选状态*/
                    label_cache[id]['label'] = $label;
                    label_cache[id]['ischeck'] = true;
                    break;
                case 'short':
                    /*不完全状态*/
                    if (!label_cache[id]) {
                        label_cache[id] = {
                            'id': id,
                            'label': $label,
                            'ischeck': true,
                            'isall': false
                        };
                    } else {
                        label_cache[id]['label'] = $label;
                        label_cache[id]['ischeck'] = true;
                    }
                    break;
            }
        }
    }
};