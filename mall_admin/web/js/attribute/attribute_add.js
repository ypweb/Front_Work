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
                attradd_power = public_tool.getKeyPower('bzw-attribute-add', powermap);

            /*dom引用和相关变量定义*/
            var module_id = 'bzw-attribute-add'/*模块id，主要用于本地存储传值*/,
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
                resetform0 = null,
                attr_config = {
                    roleId: decodeURIComponent(logininfo.param.roleId),
                    adminId: decodeURIComponent(logininfo.param.adminId),
                    grade: decodeURIComponent(logininfo.param.grade),
                    token: decodeURIComponent(logininfo.param.token)
                };


            /*查询条件*/
            var $search_gtione = $('#search_gtione'),
                $search_gtitwo = $('#search_gtitwo'),
                $search_gtithree = $('#search_gtithree'),
                $admin_search_clear = $('#admin_search_clear'),
                goodstypeid = '';


            /*表单*/
            var admin_addgoodsattr_form = document.getElementById('admin_addgoodsattr_form'),
                $admin_addgoodsattr_form = $(admin_addgoodsattr_form),
                $admin_attributeadd = $('#admin_attributeadd'),
                $admin_addlabel_tips = $('#admin_addlabel_tips'),
                $admin_labelname = $('#admin_labelname'),
                $admin_addlabel_already = $('#admin_addlabel_already'),
                $admin_addlabel_list = $('#admin_addlabel_list'),
                $admin_attrsort = $('#admin_attrsort');


            /*重置表单*/
            admin_addgoodsattr_form.reset();
            /*根据权限判断显示添加属性按钮*/
            if (attradd_power) {
                $admin_attributeadd.removeClass('g-d-hidei');
            } else {
                $admin_attributeadd.addClass('g-d-hidei');
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
                        hasub = false;
                    if (selector.indexOf('one') !== -1) {
                        if (value === '') {
                            $search_gtitwo.html('');
                            $search_gtithree.html('');
                            goodstypeid = '';
                            /*查询不同条件下的已存在值*/
                            searchAttr();
                            return false;
                        }
                        hasub = $option.attr('data-hassub');
                        goodstypeid = value;
                        /*查询不同条件下的已存在值*/
                        searchAttr();
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
                            goodstypeid = $search_gtione.find(':selected').val();
                            /*查询不同条件下的已存在值*/
                            searchAttr();
                            return false;
                        }
                        hasub = $option.attr('data-hassub');
                        goodstypeid = value;
                        /*查询不同条件下的已存在值*/
                        searchAttr();
                        if (hasub === 'true') {
                            getGoodsTypes(value, 'three');
                        } else {
                            $search_gtithree.html('');
                        }
                    } else if (selector.indexOf('three') !== -1) {
                        if (value === '') {
                            goodstypeid = $search_gtitwo.find(':selected').val();
                            /*查询不同条件下的已存在值*/
                            searchAttr();
                            return false;
                        }
                        goodstypeid = value;
                        /*查询不同条件下的已存在值*/
                        searchAttr();
                    }
                });
            });


            /*清空查询条件*/
            $admin_search_clear.on('click', function () {
                $.each([$search_gtione, $search_gtitwo, $search_gtithree], function () {
                    this.val('');
                });
                /*清空分类值*/
                goodstypeid = '';
                /*查询不同条件下的已存在值*/
                searchAttr();
            }).trigger('click');


            /*绑定显示隐藏新增类型中的已存在编码和名称*/
            $.each([$admin_addlabel_already], function () {
                this.on('click', function (e) {
                    if ($admin_addlabel_list.hasClass('g-d-hidei')) {
                        $admin_addlabel_list.removeClass('g-d-hidei');
                    } else {
                        $admin_addlabel_list.addClass('g-d-hidei');
                    }
                });
            });


            /*绑定验证是否已经编写存在的分类编码*/
            $.each([$admin_labelname], function () {
                this.on('focusout', function () {
                    var self = this,
                        txt = this.value,
                        value = public_tool.trims(txt),
                        $ul,
                        $tip;

                    if (value !== '') {
                        $ul = $admin_addlabel_list;
                        $tip = $admin_addlabel_tips;

                        $ul.find('li').each(function () {
                            var $own = $(this),
                                litxt = $own.html();
                            if (litxt === value) {
                                $tip.html('"' + value + '" 已经存在，请填写其他标签');
                                self.value = '';
                                $own.addClass('admin-list-widget-active');
                                if ($ul.hasClass('g-d-hidei')) {
                                    $ul.removeClass('g-d-hidei')
                                }
                                setTimeout(function () {
                                    $tip.html('');
                                    $own.removeClass('admin-list-widget-active');
                                }, 3000);
                                return false;
                            }
                        });
                    }
                });
            });


            /*绑定非数字输入*/
            $.each([$admin_attrsort], function () {
                this.on('keyup', function () {
                    this.value = this.value.replace(/\D*/g, '');
                });
            });


            /*请求属性数据*/
            searchAttr();


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

                                $.extend(true, setdata, attr_config);

                                if (formtype === 'addgoodsattr') {
                                    $.extend(true, setdata, {
                                        name: $admin_labelname.val(),
                                        sort: $admin_attrsort.val()
                                    });
                                    if (goodstypeid === '') {
                                        delete setdata['goodsTypeId'];
                                    } else {
                                        setdata['goodsTypeId'] = goodstypeid;
                                    }
                                    config['url'] = "http://10.0.5.226:8082/mall-buzhubms-api/goodstag/add";
                                    config['data'] = setdata;
                                }

                                $.ajax(config).done(function (resp) {
                                    var code;
                                    if (formtype === 'addgoodsattr') {
                                        code = parseInt(resp.code, 10);
                                        if (code !== 0) {
                                            dia.content('<span class="g-c-bs-warning g-btips-warn">添加标签失败</span>').show();
                                            return false;
                                        } else {
                                            dia.content('<span class="g-c-bs-success g-btips-succ">添加标签成功</span>').show();
                                            /*请求数据,更新列表*/
                                            searchAttr();
                                            setTimeout(function () {
                                                dia.close();
                                                admin_addgoodsattr_form.reset();
                                            }, 2000);
                                        }
                                    }
                                }).fail(function (resp) {
                                    console.log('error');
                                    dia.content('<span class="g-c-bs-warning g-btips-warn">添加标签失败</span>').show();
                                    setTimeout(function () {
                                        dia.close();
                                        admin_addgoodsattr_form.reset();
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
            var temp_config = $.extend(true, {}, attr_config);
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


        /*查询标签或属性解析*/
        function doAttrItem(list) {
            var str = '',
                i = 0,
                len = list.length,
                curitem;

            for (i; i < len; i++) {
                curitem = list[i];
                str += '<li data-value="' + curitem["id"] + '">' + curitem["name"] + '</li>';
            }
            return str;
        }

        /*查询标签*/
        function searchAttr() {
            var str = '',
                baseconfig = {
                    url: "http://10.0.5.226:8082/mall-buzhubms-api/goodstag/list",
                    dataType: 'JSON',
                    method: 'post',
                    data: {}
                };

            $.extend(true, baseconfig.data, attr_config);
            if (goodstypeid !== '') {
                baseconfig.data['goodsTypeId'] = goodstypeid;
            }
            $.ajax(baseconfig)
                .done(function (resp) {
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
                    if (result && result.list) {
                        str = doAttrItem(result.list);
                        $(str).appendTo($admin_addlabel_list.html(''));
                    }
                })
                .fail(function (resp) {
                    console.log(resp.message);
                });
        }


    });


})(jQuery);