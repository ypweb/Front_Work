(function ($) {
    'use strict';
    $(function () {

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


            /*权限调用*/
            var powermap = public_tool.getPower(),
                attradd_power = public_tool.getKeyPower('bzw-attribute-addval', powermap),
                attredit_power = public_tool.getKeyPower('bzw-attribute-edit', powermap),
                attrdelete_power = public_tool.getKeyPower('bzw-goods-attributedelete', powermap);


            /*dom引用和相关变量定义*/
            var module_id = 'bzw-attribute-addval'/*模块id，主要用于本地存储传值*/,
                goods_params = {
                    roleId: decodeURIComponent(logininfo.param.roleId),
                    adminId: decodeURIComponent(logininfo.param.adminId),
                    grade: decodeURIComponent(logininfo.param.grade),
                    token: decodeURIComponent(logininfo.param.token)
                },
                $admin_addattr_btn = $('#admin_addattr_btn'),
                $admin_list_wrap = $('#admin_list_wrap'),
                $admin_page_wrap = $('#admin_page_wrap'),
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
                $admin_errortip_wrap = $('#admin_errortip_wrap'),
                resetform0 = null,
                sureObj = public_tool.sureDialog(dia)/*回调提示对象*/,
                setSure = new sureObj(),
                label_config = {
                    url: "http://10.0.5.226:8082/mall-buzhubms-api/goodstag/list",
                    dataType: 'JSON',
                    method: 'post',
                    data: {
                        page: 1,
                        pageSize: 10,
                        total: 0
                    }
                },
                labelalready_config = {
                    url: "http://10.0.5.226:8082/mall-buzhubms-api/goodstag/list",
                    dataType: 'JSON',
                    method: 'post',
                    data: {
                        pageSize: 10000
                    }
                },
                attr_config = {
                    url: "http://10.0.5.226:8082/mall-buzhubms-api/goodsattributes/list",
                    dataType: 'JSON',
                    method: 'post',
                    data: {
                        pageSize: 10000
                    }
                },
                goodslabel_record = {}/*当前操作的标签索引记录*/,
                goodslabelindex = null/*当前操作的标签序列*/;


            /*查询条件*/
            var $search_name = $('#search_name'),
                $search_sort = $('#search_sort'),
                $search_gtione = $('#search_gtione'),
                $search_gtitwo = $('#search_gtitwo'),
                $search_gtithree = $('#search_gtithree'),
                $admin_search_btn = $('#admin_search_btn'),
                $admin_search_clear = $('#admin_search_clear'),
                goodstypeid = '';


            /*新增类弹出框*/
            var $addgoodsattr_wrap = $('#addgoodsattr_wrap'),
                admin_addgoodsattr_form = document.getElementById('admin_addgoodsattr_form'),
                $admin_addgoodsattr_form = $(admin_addgoodsattr_form),
                $admin_attrparentname = $('#admin_attrparentname'),
                $admin_addattr_tips = $('#admin_addattr_tips'),
                $admin_attrname = $('#admin_attrname'),
                $admin_addattr_already = $('#admin_addattr_already'),
                $admin_addattr_list = $('#admin_addattr_list'),
                $admin_labelname = $('#admin_labelname'),
                $admin_addlabel_already = $('#admin_addlabel_already'),
                $admin_addlabel_list = $('#admin_addlabel_list'),
                $admin_attrsort = $('#admin_attrsort');

            /*扩展查询条件*/
            $.extend(true, label_config.data, goods_params);
            $.extend(true, labelalready_config.data, goods_params);
            $.extend(true, attr_config.data, goods_params);


            /*重置表单*/
            admin_addgoodsattr_form.reset();


            /*根据权限判断显示添加属性按钮*/
            if (attradd_power) {
                $admin_addattr_btn.removeClass('g-d-hidei');
            } else {
                $admin_addattr_btn.addClass('g-d-hidei');
            }

            /*查询分类并绑定分类查询*/
            $.each([$search_gtione, $search_gtitwo, $search_gtithree], function () {
                var selector = this.selector;
                /*初始化查询一级分类*/
                if (selector.indexOf('one') !== -1) {
                    getGoodsTypes('', 'one', true);
                }
                this.on('change', function () {
                    var $option = $(this).find(':selected'),
                        value = this.value,
                        hasub = false,
                        $tempoption;
                    if (selector.indexOf('one') !== -1) {
                        if (value === '') {
                            $search_gtitwo.html('');
                            $search_gtithree.html('');
                            goodstypeid = '';
                            goodsWithLabel('');
                            return false;
                        }
                        hasub = $option.attr('data-hassub');
                        goodstypeid = value;
                        goodsWithLabel(value, $option.html());
                        if (hasub === 'true') {
                            getGoodsTypes(value, 'two');
                            $search_gtithree.html('');
                        } else {
                            $search_gtitwo.html('');
                            $search_gtithree.html('');
                        }
                    } else if (selector.indexOf('two') !== -1) {
                        if (value === '') {
                            $search_gtithree.html('');
                            $tempoption = $search_gtione.find(':selected');
                            goodstypeid = $tempoption.val();
                            goodsWithLabel(goodstypeid, $tempoption.html());
                            return false;
                        }
                        hasub = $option.attr('data-hassub');
                        goodstypeid = value;
                        goodsWithLabel(value, $option.html());
                        if (hasub === 'true') {
                            getGoodsTypes(value, 'three');
                        } else {
                            $search_gtithree.html('');
                        }
                    } else if (selector.indexOf('three') !== -1) {
                        if (value === '') {
                            $tempoption = $search_gtitwo.find(':selected');
                            goodstypeid = $tempoption.val();
                            goodsWithLabel(goodstypeid, $tempoption.html());
                            return false;
                        }
                        goodstypeid = value;
                        goodsWithLabel(value, $option.html());
                    }
                });
            });


            /*请求属性数据*/
            requestAttr(label_config, 'label');


            /*清空查询条件*/
            $admin_search_clear.on('click', function () {
                $.each([$search_name, $search_sort, $search_gtione, $search_gtitwo, $search_gtithree], function () {
                    this.val('');
                });
                /*清空分类值*/
                goodstypeid = '';
                goodsWithLabel('');
            }).trigger('click');


            /*联合查询*/
            $admin_search_btn.on('click', function () {
                var data = $.extend(true, {}, label_config.data);

                $.each([$search_name, $search_sort], function () {
                    var text = this.val(),
                        selector = this.selector.slice(1),
                        key = selector.split('_');

                    if (text === "") {
                        if (typeof data[key[1]] !== 'undefined') {
                            delete data[key[1]];
                        }
                    } else {
                        data[key[1]] = text;
                    }
                });
                /*分类处理*/
                if (goodstypeid === '') {
                    delete data['goodsTypeId'];
                } else {
                    data['goodsTypeId'] = goodstypeid;
                }
                label_config.data = $.extend(true, {}, data);
                requestAttr(label_config, 'label');
            });


            /*绑定操作分类列表*/
            var operate_item;
            $admin_list_wrap.on('click keyup focusout', function (e) {
                var target = e.target,
                    etype = e.type,
                    nodename = target.nodeName.toLowerCase(),
                    $this,
                    $li,
                    $wrap,
                    label,
                    index,
                    layer,
                    id,
                    action,
                    inputtype,
                    inputtxt;

                if (nodename === 'td' || nodename === 'tr' || nodename === 'ul' || nodename === 'div' || nodename === 'li') {
                    return false;
                }

                if (etype === 'click') {
                    /*点击分支*/
                    if (nodename === 'span' || nodename === 'i') {
                        if (nodename === 'i') {
                            target = target.parentNode;
                        }
                        if (target.className.indexOf('btn') !== -1) {
                            /*操作*/
                            $this = $(target);
                            $li = $this.closest('li');
                            id = $li.attr('data-id');
                            action = $this.attr('data-action'),
                                layer = parseInt($this.attr('data-layer'), 10);

                            if (operate_item) {
                                operate_item.removeClass('item-lighten');
                                operate_item = null;
                            }
                            operate_item = $li.addClass('item-lighten');
                            /*执行操作*/
                            if (action === 'edit') {
                                /*进入编辑状态*/
                                $li.addClass('typeitem-editwrap');
                                if (layer === 1) {
                                    /*标签层:赋值操作索引*/
                                    goodslabelindex = $this.attr('data-index');
                                    goodslabel_record[goodslabelindex] = $li.find('>.typeitem-edit');
                                }
                            } else if (action === 'cance') {
                                /*取消编辑状态*/
                                $li.removeClass('typeitem-editwrap');
                                /*恢复被修改的数据至没修改之前状态*/
                                if (layer === 1) {
                                    goodslabelindex = $this.attr('data-index');
                                    resetGoodsAttrData(goodslabelindex, 'label');
                                } else {
                                    resetGoodsAttrData($li, 'attr');
                                }
                            } else if (action === 'confirm') {
                                goodslabelindex = $this.attr('data-index');
                                var result;
                                if (layer === 1) {
                                    result = validGoodsAttrData($li, 'label');
                                } else {
                                    result = validGoodsAttrData($li, 'attr');
                                }
                                if (result === null) {
                                    return false;
                                }
                                /*提交编辑*/
                                setSure.sure('编辑', function (cf) {
                                    /*to do*/
                                    if (layer === 1) {
                                        goodsAttrEdit({
                                            id: id,
                                            tip: cf.dia || dia,
                                            $li: $li,
                                            result: result,
                                            type: 'label'
                                        });
                                    } else {
                                        goodsAttrEdit({
                                            id: id,
                                            tip: cf.dia || dia,
                                            $li: $li,
                                            result: result,
                                            type: 'attr'
                                        });
                                    }
                                });
                            } else if (action === 'delete') {
                                /*确认是否启用或禁用*/
                                setSure.sure('delete', function (cf) {
                                    /*to do*/
                                    if (layer === 1) {
                                        goodsAttrDelete({
                                            id: id,
                                            tip: cf.dia || dia,
                                            $li: $li
                                        }, 'label');
                                    } else {
                                        goodsAttrDelete({
                                            id: id,
                                            tip: cf.dia || dia,
                                            $li: $li
                                        }, 'attr');
                                    }

                                });
                            } else if (action === 'add') {
                                /*新增分类*/
                                label = $li.attr('data-label');
                                goodsAttrAdd({
                                    label: label,
                                    id: id,
                                    $li: $li
                                })
                            }
                        } else if (target.className.indexOf('main-typeicon') !== -1) {
                            /*展开或收缩*/
                            $this = $(target);
                            $li = $this.closest('li');
                            id = $li.attr('data-id');
                            layer = $li.attr('data-layer');
                            $wrap = $li.find('>ul');
                            var isload = parseInt($this.attr('data-loadsub'), 10);
                            if (isload === 0) {
                                /*加载子分类*/
                                doSubAttr(id, function (subitem) {
                                    if (subitem !== null) {
                                        /*加载子类*/
                                        var subtype = doAttr(subitem, {
                                            limit: 2,
                                            layer: layer,
                                            parentid: id
                                        });
                                        if (subtype) {
                                            /*查询子分类属性*/
                                            searchAttr({
                                                type: 'attr',
                                                dataitem: subitem
                                            });
                                            /*设置已经查询到数据标识*/
                                            $(subtype).appendTo($wrap);
                                            /*设置已经加载*/
                                            $this.attr({
                                                'data-loadsub': 1
                                            });
                                            subtype = null;
                                        }
                                    }
                                });
                            }
                            $this.toggleClass('main-sub-typeicon');
                            $wrap.toggleClass('g-d-hidei');
                        }
                        return false;
                    } else if (nodename === 'input') {
                        if (target.type.indexOf('text') !== -1) {
                            return false;
                        }
                    }
                } else if (etype === 'keyup') {
                    /*键盘分支*/
                    if (nodename === 'input') {
                        $this = $(target);
                        inputtype = $this.attr('name');
                        if (inputtype === 'typesort') {
                            inputtxt = $this.val().replace(/\D*/g, '');
                            $this.val(inputtxt);
                        }
                    }
                } else if (etype === 'focusout') {
                    if (nodename === 'input') {
                        $this = $(target);
                        inputtype = $this.attr('name'),
                            inputtxt = $this.attr('data-value');
                        if (inputtxt !== $this.val()) {
                            if (inputtype === 'attrname') {
                                validSameName({
                                    $input: $this,
                                    type: 'itemattr'
                                });
                            } else if (inputtype === 'labelname') {
                                validSameName({
                                    $input: $this,
                                    type: 'label'
                                });
                            }
                        }
                    }
                }
            });


            /*绑定显示隐藏新增类型中的已存在编码和名称*/
            $.each([$admin_addattr_already, $admin_addlabel_already], function () {
                var self = this,
                    selector = this.selector;

                this.on('click', function (e) {
                    if (selector.indexOf('addattr') !== -1) {
                        if ($admin_addattr_list.hasClass('g-d-hidei')) {
                            $admin_addattr_list.removeClass('g-d-hidei');
                        } else {
                            $admin_addattr_list.addClass('g-d-hidei');
                        }
                    } else if (selector.indexOf('addlabel') !== -1) {
                        if ($admin_addlabel_list.hasClass('g-d-hidei')) {
                            $admin_addlabel_list.removeClass('g-d-hidei');
                        } else {
                            $admin_addlabel_list.addClass('g-d-hidei');
                        }
                    }
                });

            });


            /*绑定验证是否已经编写存在的分类编码*/
            $.each([$admin_attrname], function () {
                var selector = this.selector;
                this.on('focusout', function () {
                    validSameName({
                        $input: $(this),
                        type: 'attr'
                    });
                });
            });


            /*绑定非数字输入*/
            $.each([$search_sort, $admin_attrsort], function () {
                this.on('keyup', function () {
                    this.value = this.value.replace(/\D*/g, '');
                });
            });


            /*绑定添加地址*/
            /*表单验证*/
            if ($.isFunction($.fn.validate)) {
                /*配置信息*/
                var form_opt0 = {},
                    formcache = public_tool.cache;


                if (formcache.form_opt_0) {
                    $.each([formcache.form_opt_0], function (index) {
                        var formtype,
                            config = {
                                dataType: 'JSON',
                                method: 'post'
                            };
                        if (index === 0) {
                            formtype = 'addgoodsattr';
                        }
                        $.extend(true, (function () {
                            if (formtype === 'addgoodsattr') {
                                return form_opt0;
                            }
                        }()), (function () {
                            if (formtype === 'addgoodsattr') {
                                return formcache.form_opt_0;
                            }
                        }()), {
                            submitHandler: function (form) {
                                var setdata = {};

                                $.extend(true, setdata, goods_params);

                                if (formtype === 'addgoodsattr') {
                                    $.extend(true, setdata, {
                                        goodsTagId: $admin_attrparentname.attr('data-value'),
                                        name: $admin_attrname.val(),
                                        sort: $admin_attrsort.val()
                                    });
                                    config['url'] = "http://10.0.5.226:8082/mall-buzhubms-api/goodsattributes/add";
                                    config['data'] = setdata;
                                }

                                $.ajax(config).done(function (resp) {
                                    var code;
                                    if (formtype === 'addgoodsattr') {
                                        code = parseInt(resp.code, 10);
                                        if (code !== 0) {
                                            dia.content('<span class="g-c-bs-warning g-btips-warn">添加属性失败</span>').show();
                                            return false;
                                        } else {
                                            dia.content('<span class="g-c-bs-success g-btips-succ">添加属性成功</span>').show();
                                            requestAttr(label_config, 'label');
                                            /*请求数据,更新列表*/
                                            setTimeout(function () {
                                                dia.close();
                                                $addgoodsattr_wrap.modal('hide');
                                            }, 2000);
                                        }
                                    }
                                }).fail(function (resp) {
                                    console.log('error');
                                    dia.content('<span class="g-c-bs-warning g-btips-warn">添加属性失败</span>').show();
                                    setTimeout(function () {
                                        dia.close();
                                        $addgoodsattr_wrap.modal('hide');
                                    }, 2000);
                                });
                                return false;
                            }
                        });
                    });

                }


                /*提交验证*/
                if (resetform0 === null) {
                    resetform0 = $admin_addgoodsattr_form.validate(form_opt0);
                }

            }


        }


        /*级联类型查询*/
        function getGoodsTypes(value, type, flag) {
            var typemap = {
                'one': '一级',
                'two': '二级',
                'three': '三级'
            };
            var temp_config = $.extend(true, {}, goods_params);
            temp_config['parentId'] = value;
            $.ajax({
                url: "http://10.0.5.226:8082/mall-buzhubms-api/goodstype/list",
                dataType: 'JSON',
                async: false,
                method: 'post',
                data: temp_config
            }).done(function (resp) {
                var code = parseInt(resp.code, 10);
                if (code !== 0) {
                    if (code === 999) {
                        /*清空缓存*/
                        public_tool.loginTips(function () {
                            public_tool.clear();
                            public_tool.clearCacheData();
                        });
                    }
                    console.log(resp.message);
                    return false;
                }


                var result = resp.result;

                if (result) {
                    var list = result.list;
                    if (!list) {
                        return false;
                    }
                } else {
                    return false;
                }

                var len = list.length,
                    i = 0,
                    str = '';

                if (len !== 0) {
                    for (i; i < len; i++) {
                        var item = list[i];
                        if (i === 0) {
                            str += '<option value="" selected >请选择' + typemap[type] + '分类</option><option  data-hasSub="' + item["hasSub"] + '" value="' + item["id"] + '" >' + item["name"] + '</option>';
                        } else {
                            str += '<option data-hasSub="' + item["hasSub"] + '" value="' + item["id"] + '" >' + item["name"] + '</option>';
                        }
                    }
                    if (type === 'one') {
                        $(str).appendTo($search_gtione.html(''));
                        if (flag) {
                            $search_gtitwo.html('<option value="" selected >请选择二级分类</option>');
                            $search_gtithree.html('<option value="" selected >请选择三级分类</option>');
                        }
                    } else if (type === 'two') {
                        $(str).appendTo($search_gtitwo.html(''));
                    } else if (type === 'three') {
                        $(str).appendTo($search_gtithree.html(''));
                    }
                } else {
                    console.log(resp.message || 'error');
                    if (type === 'one') {
                        $search_gtione.html('<option value="" selected >请选择一级分类</option>');
                        $search_gtitwo.html('<option value="" selected >请选择二级分类</option>');
                        $search_gtithree.html('<option value="" selected >请选择三级分类</option>');
                    } else if (type === 'two') {
                        $search_gtitwo.html('<option value="" selected >请选择二级分类</option>');
                        $search_gtithree.html('<option value="" selected >请选择三级分类</option>');
                    } else if (type === 'three') {
                        $search_gtithree.html('<option value="" selected >请选择三级分类</option>');
                    }
                }
            }).fail(function (resp) {
                console.log(resp.message || 'error');
                if (type === 'one') {
                    $search_gtione.html('<option value="" selected >请选择一级分类</option>');
                    $search_gtitwo.html('<option value="" selected >请选择二级分类</option>');
                    $search_gtithree.html('<option value="" selected >请选择三级分类</option>');
                } else if (type === 'two') {
                    $search_gtitwo.html('<option value="" selected >请选择二级分类</option>');
                    $search_gtithree.html('<option value="" selected >请选择三级分类</option>');
                } else if (type === 'three') {
                    $search_gtithree.html('<option value="" selected >请选择三级分类</option>');
                }
            });
        }


        /*类型查询与标签选中关联*/
        function goodsWithLabel(id, value) {
            if (typeof id === 'undefined') {
                return false;
            }
            if (goodslabelindex !== null) {
                /*编辑状态下：关联状态*/
                var $edititem = goodslabel_record[goodslabelindex].find('.typeitem').eq(1);
                if (id === '') {
                    $edititem.attr({
                        'data-type': ''
                    }).html('无(可共用)');
                } else {
                    if (typeof value === 'undefined') {
                        $edititem.attr({
                            'data-type': id
                        }).html('有');
                    } else {
                        $edititem.attr({
                            'data-type': id
                        }).html(value);
                    }
                }
            }
        }

        /*删除操作*/
        function goodsAttrDelete(obj, type) {
            var id = obj.id;

            if (typeof id === 'undefined' || id === '') {
                return false;
            }
            var tip = obj.tip,
                $li = obj.$li;

            var delete_config = {
                dataType: 'JSON',
                method: 'post',
                data: {
                    id: id
                }
            };

            $.extend(true, delete_config['data'], goods_params);

            if (type === 'label') {
                /*标签类*/
                delete_config['url'] = 'http://10.0.5.226:8082/mall-buzhubms-api/goodstag/delete';
            } else if (type === 'attr') {
                /*属性类*/
                delete_config['url'] = 'http://10.0.5.226:8082/mall-buzhubms-api/goodsattributes/delete';
            }

            $.ajax(delete_config)
                .done(function (resp) {
                    var code = parseInt(resp.code, 10);
                    if (code !== 0) {
                        console.log(resp.message);
                        tip.content('<span class="g-c-bs-warning g-btips-warn">' + (resp.message || "操作失败") + '</span>').show();
                        setTimeout(function () {
                            tip.close();
                            if (operate_item) {
                                operate_item.removeClass('item-lighten');
                                operate_item = null;
                            }
                        }, 2000);
                        return false;
                    }
                    tip.content('<span class="g-c-bs-success g-btips-succ">删除成功</span>').show();
                    setTimeout(function () {
                        tip.close();
                        setTimeout(function () {
                            operate_item = null;
                            if (type === 'label') {
                                /*设置标签需要重新加载*/
                                $admin_addlabel_list.attr({
                                    'data-select': 'false'
                                });
                            }
                            /*重新加载数据*/
                            requestAttr(label_config, 'label');
                        }, 1000);
                    }, 1000);
                })
                .fail(function (resp) {
                    console.log(resp.message);
                    tip.content('<span class="g-c-bs-warning g-btips-warn">' + (resp.message || "操作失败") + '</span>').show();
                    setTimeout(function () {
                        tip.close();
                        if (operate_item) {
                            operate_item.removeClass('item-lighten');
                            operate_item = null;
                        }
                    }, 2000);
                });
        }

        /*编辑操作*/
        function goodsAttrEdit(obj) {
            var id = obj.id;

            if (typeof id === 'undefined' || id === '') {
                return false;
            }
            var tip = obj.tip,
                $li = obj.$li,
                type = obj.type;

            var editdata = obj.result,
                edit_config = {
                    dataType: 'JSON',
                    method: 'post',
                    data: {}
                };

            $.extend(true, edit_config['data'], goods_params);

            if (type === 'label') {
                /*标签类*/
                edit_config['url'] = 'http://10.0.5.226:8082/mall-buzhubms-api/goodstag/update';
                edit_config['data']['id'] = id;
                edit_config['data']['name'] = editdata[0];
                if (editdata[1] === null) {
                    edit_config['data']['goodsTypeId'] = '';
                } else if (editdata[1] === '') {
                    edit_config['data']['goodsTypeId'] = 0;
                } else {
                    edit_config['data']['goodsTypeId'] = editdata[1];
                }
                edit_config['data']['sort'] = editdata[2];
            } else if (type === 'attr') {
                /*属性类*/
                edit_config['url'] = 'http://10.0.5.226:8082/mall-buzhubms-api/goodsattributes/update';
                edit_config['data']['id'] = id;
                edit_config['data']['name'] = editdata[0];
                edit_config['data']['sort'] = editdata[1];
                edit_config['data']['goodsTagId'] = $li.attr('data-parentid');
            }


            $.ajax(edit_config)
                .done(function (resp) {
                    var code = parseInt(resp.code, 10);
                    if (code !== 0) {
                        console.log(resp.message);
                        tip.content('<span class="g-c-bs-warning g-btips-warn">' + (resp.message || "操作失败") + '</span>').show();
                        setTimeout(function () {
                            tip.close();
                            if (operate_item) {
                                operate_item.removeClass('item-lighten');
                                operate_item = null;
                            }
                        }, 2000);
                        return false;
                    }
                    tip.content('<span class="g-c-bs-success g-btips-succ">编辑成功</span>').show();
                    /*更新页面数据*/
                    updateGoodsAttrDataByEdit($li, type);
                    setTimeout(function () {
                        tip.close();
                        setTimeout(function () {
                            if (operate_item) {
                                operate_item.removeClass('item-lighten');
                                operate_item = null;
                                $li.removeClass('typeitem-editwrap');
                                /*清除操作记录*/
                                if (type === 'label') {
                                    delete  goodslabel_record[goodslabelindex];
                                    goodslabelindex = null;
                                }
                            }
                        }, 1000);
                    }, 1000);
                })
                .fail(function (resp) {
                    console.log(resp.message);
                    tip.content('<span class="g-c-bs-warning g-btips-warn">' + (resp.message || "操作失败") + '</span>').show();
                    setTimeout(function () {
                        tip.close();
                        if (operate_item) {
                            operate_item.removeClass('item-lighten');
                            operate_item = null;
                        }
                    }, 2000);
                });
        }

        /*新增分类*/
        function goodsAttrAdd(config) {
            /*重置表单*/
            admin_addgoodsattr_form.reset();
            /*设置数据*/
            $admin_attrparentname.attr({
                'data-value': config.id
            }).html(config.label);
            searchAttr({
                type: 'attr',
                id: config.id
            });
            $addgoodsattr_wrap.modal('show', {
                backdrop: 'static'
            });
        }

        /*验证数据状态(编辑状态)*/
        function validGoodsAttrData($li, type) {
            var $edit = $li.find('>.typeitem-edit'),
                $edititem = $edit.find('.typeitem'),
                i = 0,
                result = [],
                $item = $edititem,
                value = '';

            if (type === 'label') {
                for (i; i < 3; i++) {
                    $item = $edititem.eq(i);
                    if (i === 0 || i === 2) {
                        value = $item.find('input').val();
                        if (value === '') {
                            tipsGoodsAttrError($admin_errortip_wrap, i, type);
                            break;
                        } else {
                            result.push(value);
                        }
                    } else if (i === 1) {
                        if ($item.attr('data-type') === $item.attr('data-value')) {
                            /*未作改变*/
                            result.push(null);
                        } else {
                            /*修改值*/
                            result.push($item.attr('data-type'));
                        }
                    }
                }
                if (result.length < 3) {
                    return null;
                } else {
                    return result;
                }
            } else if (type === 'attr') {
                for (i; i < 2; i++) {
                    $item = $edititem.eq(i);
                    value = $item.find('input').val();
                    if (value === '' || typeof value === 'undefined') {
                        tipsGoodsAttrError($admin_errortip_wrap, i, type);
                        break;
                    } else {
                        result.push(value);
                    }
                }
                if (result.length < 2) {
                    return null;
                } else {
                    return result;
                }
            }
            return null;
        }

        /*验证提示信息(编辑状态)*/
        function tipsGoodsAttrError($wrap, index, type) {
            if (!$wrap) {
                $wrap = $admin_errortip_wrap;
            }
            var tips = '';
            if (type === 'label') {
                if (index === 0) {
                    tips = '标签名称没有填写';
                } else if (index === 2) {
                    tips = '排序不能为空';
                }
            } else if (type === 'attr') {
                if (index === 0) {
                    tips = '属性名称没有填写';
                } else if (index === 1) {
                    tips = '排序不能为空';
                }
            }
            $wrap.html(tips);
            setTimeout(function () {
                $wrap.html('');
            }, 3000);
        }

        /*恢复默认(原来)数据(编辑状态)*/
        function resetGoodsAttrData($li, type) {
            var $edit,
                $edititem,
                i = 0;
            if (type === 'label') {
                $edititem = goodslabel_record[$li].find('.typeitem')
            } else if (type === 'attr') {
                $edit = $li.find('>.typeitem-edit');
                $edititem = $edit.find('.typeitem');
            }
            var $item,
                oldvalue,
                $this;
            if (type === 'label') {
                for (i; i < 3; i++) {
                    $item = $edititem.eq(i);
                    if (i === 0 || i === 2) {
                        $this = $item.find('input');
                        oldvalue = $this.attr('data-value');
                        $this.val(oldvalue);
                    } else if (i === 1) {
                        /*取消操作索引*/
                        $item.attr({
                            'data-type': $item.attr('data-value')
                        });
                    }
                }
                /*清除操作记录*/
                delete goodslabel_record[$li];
                goodslabelindex = null;
            } else if (type === 'attr') {
                for (i; i < 2; i++) {
                    $item = $edititem.eq(i);
                    $this = $item.find('input');
                    oldvalue = $this.attr('data-value');
                    $this.val(oldvalue);
                }
            }
        }

        /*更新原来值(编辑状态)*/
        function updateGoodsAttrDataByEdit($li, type) {
            var $showwrap = $li.find('>.typeitem-default'),
                $editwrap = $li.find('>.typeitem-edit'),
                $showitem = $showwrap.find('.typeitem'),
                $edititem = $editwrap.find('.typeitem'),
                i = 0,
                issub = $li.hasClass('admin-subtypeitem'),
                $curitem,
                $this,
                newvalue;


            if (type === 'label') {
                /*标签层*/
                for (i; i < 3; i++) {
                    /*更新值*/
                    if (issub) {
                        if (i === 1) {
                            $showitem.eq(i + 1).html($edititem.eq(i).html());
                        } else {
                            $curitem = $edititem.eq(i);
                            $this = $curitem.find('input');
                            newvalue = $this.val();
                            $showitem.eq(i + 1).html(newvalue);
                            $this.attr({
                                'data-value': newvalue
                            });
                        }
                    } else {
                        if (i === 1) {
                            $showitem.eq(i).html($edititem.eq(i).html());
                        } else {
                            $curitem = $edititem.eq(i);
                            $this = $curitem.find('input');
                            newvalue = $this.val();
                            $showitem.eq(i).html(newvalue);
                            $this.attr({
                                'data-value': newvalue
                            });
                        }
                    }
                }
            } else if (type === 'attr') {
                /*属性层*/
                for (i; i < 2; i++) {
                    $curitem = $edititem.eq(i);
                    $this = $curitem.find('input');
                    newvalue = $this.val();

                    /*更新值*/
                    $this.attr({
                        'data-value': newvalue
                    });
                    if (issub) {
                        $showitem.eq(i + 1).html(newvalue);
                    } else {
                        $showitem.eq(i).html(newvalue);
                    }
                }
            }


        }

        /*解析属性--开始解析*/
        function resolveAttr(obj, limit) {
            if (!obj || typeof obj === 'undefined') {
                return false;
            }
            if (typeof limit === 'undefined' || limit <= 0) {
                limit = 1;
            }
            var attrlist = obj,
                str = '',
                i = 0,
                len = attrlist.length,
                layer = 1;

            if (len !== 0) {
                for (i; i < len; i++) {
                    var curitem = attrlist[i],
                        hassub = curitem["hasSub"];
                    if (hassub) {
                        str += doItems(curitem, {
                            flag: true,
                            limit: limit,
                            index: i,
                            layer: layer
                        }) + '<ul class="admin-typeitem-wrap admin-subtype-wrap g-d-hidei"></ul></li>';
                    } else {
                        str += doItems(curitem, {
                            flag: false,
                            limit: limit,
                            index: i,
                            layer: layer
                        });
                    }
                }
                return str;
            } else {
                return false;
            }
        }

        /*解析属性--递归解析*/
        function doAttr(obj, config) {
            if (!obj || typeof obj === 'undefined') {
                return false;
            }
            var attrlist = obj,
                str = '',
                i = 0,
                len = attrlist.length;

            var layer = config.layer,
                limit = config.limit,
                parentid = config.parentid;
            if (typeof layer !== 'undefined') {
                layer++;
            }

            if (limit >= 1 && layer > limit) {
                return false;
            }

            if (len !== 0) {
                for (i; i < len; i++) {
                    var curitem = attrlist[i],
                        hassub = curitem["hasSub"];
                    if (typeof hassub !== 'undefined') {
                        str += doItems(curitem, {
                            flag: true,
                            limit: limit,
                            layer: layer,
                            parentid: parentid
                        }) + '<ul class="admin-typeitem-wrap admin-subtype-wrap g-d-hidei"></ul></li>';
                    } else {
                        str += doItems(curitem, {
                            flag: false,
                            limit: limit,
                            layer: layer,
                            parentid: parentid
                        });
                    }
                }
                return str;
            } else {
                return false;
            }
        }

        /*解析属性--公共解析*/
        function doItems(obj, config) {
            var curitem = obj,
                id = curitem["id"],
                label = curitem["name"],
                str = '',
                stredit = '',
                flag = config.flag,
                limit = config.limit,
                layer = config.layer,
                goodstype = null,
                goodsname = '',
                index = null,
                parentid = null;

            if (layer === 1) {
                if (typeof curitem["goodsTypeId"] !== 'undefined') {
                    goodstype = curitem["goodsTypeId"];
                    goodsname = curitem["goodsTypeName"];
                }
                index = config.index;
            } else {
                parentid = config.parentid;
            }


            if (flag) {
                if (layer > 1) {
                    /*属性类*/
                    str += '<li class="admin-subtypeitem" data-parentid="' + parentid + '" data-label="' + label + '" data-layer="' + layer + '" data-id="' + id + '">\
							<div class="typeitem-default"><span class="typeitem subtype-mgap' + (layer - 1) + ' main-typeicon g-w-percent3"></span>\
							<div class="typeitem subtype-pgap' + layer + ' g-w-percent32">' + label + '</div>';
                } else {
                    str += '<li class="admin-subtypeitem" data-label="' + label + '" data-layer="' + layer + '" data-index="' + index + '" data-id="' + id + '">';
                    /*标签类*/
                    if (goodstype !== null) {
                        str += '<div class="typeitem-default"><span data-loadsub="0" class="typeitem main-typeicon g-w-percent3"></span>\
							<div class="typeitem g-w-percent22" >' + label + '</div><div class="typeitem g-w-percent10">' + goodsname + '</div>';
                    } else {
                        str += '<div class="typeitem-default"><span data-loadsub="0" class="typeitem main-typeicon g-w-percent3"></span>\
							<div class="typeitem g-w-percent22" >' + label + '</div><div class="typeitem g-w-percent10">无(可共用)</div>';
                    }
                }
            } else {
                if (layer > 1) {
                    /*属性类*/
                    str += '<li data-parentid="' + parentid + '" data-label="' + label + '" data-layer="' + layer + '" data-id="' + id + '">\
					<div class="typeitem-default"><div class="typeitem subtype-pgap' + layer + ' g-w-percent32">' + label + '</div>';
                } else {
                    /*标签类*/
                    str += '<li data-label="' + label + '" data-layer="' + layer + '" data-index="' + index + '" data-id="' + id + '">';
                    if (goodstype !== null) {
                        str += '<div class="typeitem-default"><div class="typeitem g-w-percent22">' + label + '</div><div class="typeitem g-w-percent10">' + goodsname + '</div>';
                    } else {
                        str += '<div class="typeitem-default"><div class="typeitem g-w-percent22">' + label + '</div><div class="typeitem g-w-percent10">无(可共用)</div>';
                    }
                }
            }
            str += '<div class="typeitem g-w-percent5">' + curitem["sort"] + '</div>';


            /*编辑状态*/
            if (layer > 1) {
                /*属性类*/
                stredit += '<div class="typeitem-edit"><div class="typeitem g-w-percent32"><input type="text" name="attrname" data-value="' + label + '"  placeholder="请输入属性名称" value="' + label + '" /></div>\
								<div class="typeitem g-w-percent5"><input type="text" name="attrsort" data-value="' + curitem["sort"] + '" maxlength="6" value="' + curitem["sort"] + '" /></div>';
            } else {
                /*标签类*/
                if (goodstype !== null) {
                    stredit += '<div class="typeitem-edit"><div class="typeitem g-w-percent22"><input type="text" name="labelname" data-value="' + label + '"  placeholder="请输入标签名称" value="' + label + '" /></div>\
							<div class="typeitem g-w-percent10" data-type="' + goodstype + '"  data-value="' + goodstype + '">' + goodsname + '</div>\
								<div class="typeitem g-w-percent5"><input type="text" name="attrsort" data-value="' + curitem["sort"] + '" maxlength="6" value="' + curitem["sort"] + '" /></div>';
                } else {
                    stredit += '<div class="typeitem-edit"><div class="typeitem g-w-percent22"><input type="text" name="labelname" data-value="' + label + '"  placeholder="请输入标签名称" value="' + label + '" /></div>\
							<div class="typeitem g-w-percent10" data-type="" data-value="">无(可共用)</div>\
								<div class="typeitem g-w-percent5"><input type="text" name="attrsort" data-value="' + curitem["sort"] + '" maxlength="6" value="' + curitem["sort"] + '" /></div>';
                }
            }


            str += '<div class="typeitem g-w-percent10">';
            stredit += '<div class="typeitem g-w-percent10">';


            if (attredit_power) {
                if (layer === 1) {
                    /*标签类*/
                    str += '<span data-action="edit" data-layer="' + layer + '" data-index="' + index + '" data-id="' + id + '"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
							<i class="fa-pencil"></i>&nbsp;&nbsp;编辑\
						</span>';

                    /*编辑状态*/
                    stredit += '<span data-action="confirm" data-layer="' + layer + '" data-index="' + index + '" data-id="' + id + '"  class="btn btn-white btn-icon btn-xs g-br2 g-c-bs-success">\
									<i class="fa-check"></i>&nbsp;&nbsp;确定\
								</span>\
								<span data-action="cance" data-layer="' + layer + '" data-index="' + index + '" data-id="' + id + '"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray10">\
									<i class="fa-close"></i>&nbsp;&nbsp;取消\
								</span>';
                } else {
                    /*属性类*/
                    str += '<span data-action="edit" data-layer="' + layer + '" data-parentid="' + parentid + '" data-id="' + id + '"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
							<i class="fa-pencil"></i>&nbsp;&nbsp;编辑\
						</span>';

                    /*编辑状态*/
                    stredit += '<span data-action="confirm" data-layer="' + layer + '" data-id="' + id + '" data-parentid="' + parentid + '"   class="btn btn-white btn-icon btn-xs g-br2 g-c-bs-success">\
									<i class="fa-check"></i>&nbsp;&nbsp;确定\
								</span>\
								<span data-action="cance" data-layer="' + layer + '" data-id="' + id + '" data-parentid="' + parentid + '" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray10">\
									<i class="fa-close"></i>&nbsp;&nbsp;取消\
								</span>';
                }

            }
            if (attradd_power) {
                if (flag) {
                    str += '<span data-action="add" data-id="' + id + '" data-parentid="' + parentid + '" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
							<i class="fa-plus"></i>&nbsp;&nbsp;新增属性\
						</span>';
                } else {
                    if (layer < limit) {
                        str += '<span data-action="add" data-id="' + id + '"  class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
									<i class="fa-plus"></i>&nbsp;&nbsp;新增属性\
								</span>';
                    }
                }
            }

            if (attrdelete_power) {
                str += '<span data-action="delete" data-id="' + id + '" data-layer="' + layer + '" class="btn btn-white btn-icon btn-xs g-br2 g-c-gray8">\
							<i class="fa-trash"></i>&nbsp;&nbsp;删除\
						</span>';
            }

            str += '</div></div>';
            stredit += '</div></div>';

            return flag ? str + stredit : str + stredit + '</li>';
        }

        /*请求并判断是否存在子菜单*/
        function doSubAttr(id, fn) {
            var list = null;
            if (typeof id === 'undefined') {
                return null;
            }
            attr_config.data['goodsTagId'] = id;
            $.ajax(attr_config)
                .done(function (resp) {
                    var code = parseInt(resp.code, 10);
                    if (code !== 0) {
                        console.log(resp.message);
                        return null;
                    }
                    var result = resp.result;
                    if (result) {
                        list = result.list;
                        if (list.length !== 0) {
                            fn.call(null, list);
                        }
                    }
                })
                .fail(function (resp) {
                    console.log(resp.message);
                });
        }

        /*请求属性*/
        function requestAttr(config, type) {
            /*清除操作记录*/
            goodslabel_record = {};
            goodslabelindex = null;
            /*请求数据*/
            $.ajax(config)
                .done(function (resp) {
                    var code = parseInt(resp.code, 10);
                    if (code !== 0) {
                        console.log(resp.message);
                        dia.content('<span class="g-c-bs-warning g-btips-warn">' + (resp.message || "操作失败") + '</span>').show();
                        setTimeout(function () {
                            dia.close();
                        }, 2000);
                        return false;
                    }
                    var result = resp.result;
                    if (result) {
                        /*分页调用*/
                        if (type === 'label') {
                            if (result.count !== 0) {
                                config.data.total = result.count;
                                $admin_page_wrap.pagination({
                                    pageSize: config.data.pageSize,
                                    total: config.data.total,
                                    pageNumber: config.data.page,
                                    onSelectPage: function (pageNumber, pageSize) {
                                        /*再次查询*/
                                        config.data.pageSize = pageSize;
                                        config.data.page = pageNumber;
                                        requestAttr(config, type);
                                    }
                                });
                            } else {
                                config.data.total = 0;
                            }
                        }
                        if (result.list) {
                            /*初始化标签*/
                            if (type === 'label') {
                                var isselect = $admin_addlabel_list.attr('data-select');
                                if (isselect === 'false') {
                                    if (label_config.data.pageSize < label_config.data.total) {
                                        searchAttr({
                                            type: type
                                        });
                                        $admin_addlabel_list.attr({
                                            'data-select': 'true'
                                        });
                                    } else {
                                        searchAttr({
                                            type: type,
                                            dataitem: result.list
                                        });
                                        $admin_addlabel_list.attr({
                                            'data-select': 'true'
                                        });
                                    }
                                }
                            } else if (type === 'attr') {
                                var id = config.data['goodsTagId'];
                                if (id === '' || typeof id === 'undefined') {
                                    return false;
                                }
                                searchAttr({
                                    type: type,
                                    id: id,
                                    dataitem: result.list
                                });
                            }
                            /*解析属性*/
                            var str = resolveAttr(result.list, 2);
                            if (str) {
                                $('<ul class="admin-typeitem-wrap admin-maintype-wrap">' + str + '</ul>').appendTo($admin_list_wrap.html(''));
                            } else {
                                $admin_list_wrap.addClass('g-t-c').html('暂无数据，请&nbsp;<span class="g-c-info">添加标签</span>');
                            }
                        } else {
                            $admin_list_wrap.addClass('g-t-c').html('暂无数据，请&nbsp;<span class="g-c-info">添加标签</span>');
                        }
                    } else {
                        $admin_list_wrap.addClass('g-t-c').html('暂无数据，请&nbsp;<span class="g-c-info">添加标签</span>');
                    }
                })
                .fail(function (resp) {
                    console.log(resp.message);
                    dia.content('<span class="g-c-bs-warning g-btips-warn">' + (resp.message || "操作失败") + '</span>').show();
                    setTimeout(function () {
                        dia.close();
                    }, 2000);
                });

        }

        /*查询标签或属性解析*/
        function doAttrItem(config) {
            var dataitem = config['dataitem'],
                type = config['type'],
                id = config['id'],
                str = '',
                i = 0,
                len = dataitem.length,
                curitem;

            if (type === 'label') {
                for (i; i < len; i++) {
                    curitem = dataitem[i];
                    str += '<li data-value="' + curitem["id"] + '">' + curitem["name"] + '</li>';
                }
                return str;
            } else if (type === 'attr') {
                for (i; i < len; i++) {
                    curitem = dataitem[i];
                    if (parseInt(id, 10) === parseInt(curitem["id"], 10)) {
                        dataitem = curitem["attrlist"];
                        break;
                    }
                }
                len = dataitem.length;
                i = 0;
                for (i; i < len; i++) {
                    curitem = dataitem[i];
                    str += '<li data-value="' + curitem["id"] + '">' + curitem["name"] + '</li>';
                }
                return str;
            }
        }

        /*查询标签或属性*/
        function searchAttr(config) {
            var type = config.type;

            if (typeof type === 'undefined') {
                return false;
            }
            var id = config.id,
                dataitem = config.dataitem,
                str = '';
            if (typeof dataitem !== 'undefined') {
                if (type === 'label') {
                    str = doAttrItem({
                        type: 'label',
                        dataitem: dataitem
                    });
                    $(str).appendTo($admin_addlabel_list.html(''));
                } else if (type === 'attr') {
                    str = doAttrItem({
                        type: 'attr',
                        dataitem: dataitem,
                        id: id
                    });
                    $(str).appendTo($admin_addattr_list.html(''));
                }
            } else {
                $.ajax((function () {
                    if (type === 'attr') {
                        attr_config['data']['goodsTagId'] = id;
                        return attr_config;
                    } else if (type === 'label') {
                        return labelalready_config;
                    }
                })())
                    .done(function (resp) {
                        var code = parseInt(resp.code, 10);
                        if (code !== 0) {
                            console.log(resp.message);
                            return false;
                        }
                        var result = resp.result;
                        if (result && result.list) {
                            if (type === 'label') {
                                str = doAttrItem({
                                    type: type,
                                    dataitem: result.list
                                });
                                $(str).appendTo($admin_addlabel_list.html(''));
                            } else if (type === 'attr') {
                                str = doAttrItem({
                                    type: type,
                                    dataitem: result.list,
                                    id: id
                                });
                                $(str).appendTo($admin_addattr_list.html(''));
                            }
                        }
                    })
                    .fail(function (resp) {
                        console.log(resp.message);
                    });
            }
        }

        /*验证名称是否重复*/
        function validSameName(config) {
            var input = config.$input,
                txt = input.val(),
                value = public_tool.trims(txt),
                $ul,
                $tip,
                type = config.type,
                theme = '';

            if (value !== '') {
                if (type === 'attr') {
                    $ul = $admin_addattr_list;
                    $tip = $admin_addattr_tips;
                    theme = '属性';
                } else if (type === 'label') {
                    $ul = $admin_addlabel_list;
                    $tip = $admin_errortip_wrap;
                    theme = '标签';
                } else if (type === 'itemattr') {
                    $tip = $admin_errortip_wrap;
                    $ul = $admin_addattr_list;
                    theme = '属性';
                }

                if (theme !== '') {
                    $ul.find('li').each(function () {
                        var $own = $(this),
                            litxt = $own.html();
                        if (litxt === value) {
                            $tip.html('"' + value + '" 已经存在，请填写其他"' + theme + '"');
                            input.val('');
                            if (type === 'attr' || type === 'label') {
                                $own.addClass('admin-list-widget-active');
                                if ($ul.hasClass('g-d-hidei')) {
                                    $ul.removeClass('g-d-hidei')
                                }
                            }
                            setTimeout(function () {
                                $tip.html('');
                                if (type === 'attr' || type === 'label') {
                                    $own.removeClass('admin-list-widget-active');
                                }
                            }, 3000);
                            return false;
                        }
                    });
                }
            }
        }


    });


})(jQuery);