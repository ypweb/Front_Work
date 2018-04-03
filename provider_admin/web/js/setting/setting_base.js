/*admin_member:成员设置*/
(function ($) {
    'use strict';
    $(function () {
        /*初始化数据*/
        if (public_tool.initMap.isrender) {
            /*菜单调用*/
            var logininfo = public_tool.initMap.loginMap;
            public_tool.loadSideMenu(public_vars.$mainmenu, public_vars.$main_menu_wrap, {
                url: '../../json/menu.json',
                async: false,
                type: 'post',
                datatype: 'json'
            });


            /*dom引用和相关变量定义*/
            var module_id = 'yttx-setting-base'/*模块id，主要用于本地存储传值*/,
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
                $admin_id = $('#admin_id'),
                $admin_storeName = $('#admin_storeName'),
                $admin_logoImage = $('#admin_logoImage'),
                $admin_telephone = $('#admin_telephone'),
                $admin_companyName = $('#admin_companyName'),
                $admin_province = $('#admin_province'),
                $admin_city = $('#admin_city'),
                $admin_country = $('#admin_country'),
                $admin_address = $('#admin_address'),
                $admin_storeName_btn = $('#admin_storeName_btn'),
                $admin_logoImage_btn = $('#admin_logoImage_btn'),
                $admin_telephone_btn = $('#admin_telephone_btn'),
                $admin_address_btn = $('#admin_address_btn'),
                update_config = {
                    url: "http://10.0.5.226:8082/yttx-providerbms-api/provider/basicset/update",
                    dataType: 'JSON',
                    method: 'post',
                    data: {
                        userId: decodeURIComponent(logininfo.param.userId),
                        token: decodeURIComponent(logininfo.param.token),
                        operationType: 1,
                        updateValue: '',
                        providerId: decodeURIComponent(logininfo.param.providerId)
                    }
                },
                logo_config = {
                    url: "http://10.0.5.226:8082/yttx-providerbms-api/provider/logo/update",
                    dataType: 'JSON',
                    method: 'post',
                    data: {
                        userId: decodeURIComponent(logininfo.param.userId),
                        token: decodeURIComponent(logininfo.param.token),
                        operationType: 2,
                        logoImage: '',
                        providerId: decodeURIComponent(logininfo.param.providerId)
                    }
                };

            /*上传对象*/
            var logo_QN_Upload = new QiniuJsSDK(),
                ImageUpload_Token = getToken() || null,
                upload_bars = [];


            /*加载数据*/
            getSettingData();


            /*绑定logo上传*/
            if (ImageUpload_Token !== null) {
                var logo_image_upload = logo_QN_Upload.uploader({
                    runtimes: 'html5,html4,flash,silverlight',
                    browse_button: 'admin_logoImage_file',
                    uptoken: ImageUpload_Token.qiniuToken,// uptoken是上传凭证，由其他程序生成
                    multi_selection: false,
                    get_new_uptoken: false,// 设置上传文件的时候是否每次都重新获取新的uptoken
                    unique_names: false,// 默认false，key为文件名。若开启该选项，JS-SDK会为每个文件自动生成key（文件名）
                    save_key: false,//默认false。若在服务端生成uptoken的上传策略中指定了sava_key，则开启，SDK在前端将不对key进行任何处理
                    domain: ImageUpload_Token.qiniuDomain,//bucket域名，下载资源时用到，必需
                    flash_swf_url: '../../js/plugins/plupload/Moxie.swf',//引入flash，相对路径
                    silverlight_xap_url: '../../js/plugins/plupload/Moxie.xap',
                    max_retries: 3,// 上传失败最大重试次数
                    dragdrop: false,
                    chunk_size: '2mb',
                    auto_start: true,
                    max_file_size: '500kb',
                    filters: {
                        mime_types: [
                            {
                                title: "Image files",
                                extensions: "jpg,gif,png,jpeg"
                            }
                        ]
                    },
                    init: {
                        'PostInit': function () {
                        },
                        'FilesAdded': function (up, file) {
                            var temp_bars = this.files.length,
                                j = 0;
                            upload_bars.length = 0;
                            for (j; j < temp_bars; j++) {
                                upload_bars.push(this.files[j]['id']);
                            }
                        },
                        'BeforeUpload': function (up, file) {
                            show_loading_bar(30);
                        },
                        'UploadProgress': function (up, file) {
                        },
                        'FileUploaded': function (up, file, info) {
                            /*获取上传成功后的文件的Url*/

                            var domain = up.getOption('domain'),
                                name = JSON.parse(info);

                            $admin_logoImage.attr({
                                'data-image': domain + '/' + name.key
                            }).html('<img src="' + domain + '/' + name.key + "?imageView2/1/w/160/h/160" + '" alt="店铺LOGO">');
                        },
                        'Error': function (up, err, errTip) {
                            dia.content('<span class="g-c-bs-warning g-btips-warn">' + errTip + '</span>').show();
                            setTimeout(function () {
                                dia.close();
                            }, 3000);
                            console.log(errTip);
                        },
                        'UploadComplete': function (up, file) {
                            dia.content('<span class="g-c-bs-success g-btips-succ">上传成功</span>').show();
                            upload_bars.length = 0;
                            setTimeout(function () {
                                dia.close();
                            }, 2000);
                        },
                        'Key': function (up, file) {
                            /*调用滚动条*/
                            uploadShowBars(file['id']);
                            var str = "logo_" + moment().format("YYYYMMDDHHmmSSSS");
                            return str;
                        }
                    }
                });
            }


            /*绑定切换地址*/
            $.each([$admin_province, $admin_city, $admin_country], function () {
                var self = this,
                    selector = this.selector,
                    type = '';

                if (selector.indexOf('province') !== -1) {
                    type = 'province';
                } else if (selector.indexOf('city') !== -1) {
                    type = 'city';
                } else if (selector.indexOf('country') !== -1) {
                    type = 'country';
                }

                this.on('change', function () {
                    var $this = $(this),
                        value = $this.val();
                    if (type === 'province') {
                        getAddress(value, '', 'city', true);
                    } else if (type === 'city') {
                        getAddress(value, '', 'country', true);
                    }
                });
            });


            /*绑定修改*/
            $.each([$admin_storeName_btn, $admin_logoImage_btn, $admin_telephone_btn, $admin_address_btn], function () {
                var self = this,
                    selector = this.selector.split('_'),
                    tips = '';

                this.on('click', function () {
                    if (update_config['id'] === '') {
                        update_config['id'] = $admin_id.val();
                    }

                    if (selector[1] === 'storeName') {
                        update_config.data['operationType'] = 1;
                        update_config.data['updateValue'] = $admin_storeName.val();
                        tips = '店铺名称';
                    } else if (selector[1] === 'logoImage') {
                        var tempimg = $admin_logoImage.attr('data-image');
                        if (tempimg === '') {
                            dia.content('<span class="g-c-bs-warning g-btips-warn">请先上传图像</span>').show();
                            setTimeout(function () {
                                dia.close();
                            }, 2000);
                            return false;
                        }
                        logo_config.data['operationType'] = 2;
                        logo_config.data['logoImage'] = tempimg;
                        tips = '店铺LOGO';
                    } else if (selector[1] === 'telephone') {
                        var tempphone = public_tool.trims($admin_telephone.val());
                        if (!public_tool.isMobilePhone(tempphone)) {
                            dia.content('<span class="g-c-bs-warning g-btips-warn">联系电话不正确</span>').show();
                            setTimeout(function () {
                                dia.close();
                            }, 2000);
                            return false;
                        }
                        update_config.data['operationType'] = 3;
                        update_config.data['updateValue'] = tempphone;
                        tips = '联系电话';
                    } else if (selector[1] === 'address') {
                        var tempaddress = public_tool.trims($admin_province.val() + $admin_city.val() + $admin_country.val() + $admin_address.val());
                        if (tempaddress === '') {
                            dia.content('<span class="g-c-bs-warning g-btips-warn">地址详情不能为空</span>').show();
                            setTimeout(function () {
                                dia.close();
                            }, 2000);
                            return false;
                        }
                        update_config.data['operationType'] = 4;
                        update_config.data['updateValue'] = tempaddress;
                        tips = '地址详情';
                    }

                    $.ajax((function () {
                        if (tips === '店铺LOGO') {
                            return logo_config;
                        } else {
                            return update_config;
                        }
                    }())).done(function (resp) {
                        var code = parseInt(resp.code, 10);
                        if (code !== 0) {
                            dia.content('<span class="g-c-bs-warning g-btips-warn">' + (resp.message || '修改 "' + tips + '" 失败') + '</span>').show();
                            setTimeout(function () {
                                dia.close();
                            }, 2000);
                            console.log(resp.message);
                            return false;
                        }
                        dia.content('<span class="g-c-bs-success g-btips-succ">修改 "' + tips + '" 成功</span>').show();
                        if (tips === '店铺LOGO') {
                            $admin_logoImage.attr({'data-image': ''});
                        }
                        setTimeout(function () {
                            dia.close();
                        }, 2000);
                        /*更新数据*/
                        /*to do*/
                    }).fail(function (resp) {
                        dia.content('<span class="g-c-bs-warning g-btips-warn">' + (resp.message || '修改 "' + tips + '" 失败') + '</span>').show();
                        setTimeout(function () {
                            dia.close();
                        }, 2000);
                        console.log('error');
                    });


                });

            });


            /*格式化手机号*/
            $admin_telephone.on('keyup', function () {
                var phoneno = this.value.replace(/\D*/g, '');
                if (phoneno == '') {
                    this.value = '';
                    return false;
                }
                this.value = public_tool.phoneFormat(this.value);
            });


        }


        /*获取*/
        function getSettingData() {
            if (!public_tool.isSameDomain("http://10.0.5.226:8082")) {
                return false;
            }
            $.ajax({
                url: "http://10.0.5.226:8082/yttx-providerbms-api/provider/basicset/info",
                dataType: 'JSON',
                method: 'post',
                data: {
                    userId: decodeURIComponent(logininfo.param.userId),
                    providerId: decodeURIComponent(logininfo.param.providerId),
                    token: decodeURIComponent(logininfo.param.token)
                }
            }).done(function (resp) {
                var code = parseInt(resp.code, 10);
                if (code !== 0) {
                    if (code === 999) {
                        /*清空缓存*/
                        public_tool.loginTips(function () {
                            public_tool.clear();
                            public_tool.clearCacheData();
                        });
                        return false;
                    }
                    console.log(resp.message);
                    return false;
                }

                var result = resp.result;
                if (result && !$.isEmptyObject(result)) {
                    for (var i in result) {
                        switch (i) {
                            case 'id':
                                $admin_id.val(result[i]);
                                break;
                            case 'storeName':
                                $admin_storeName.val(result[i]);
                                break;
                            case 'address':
                                var tempaddress = result[i],
                                    area = tempaddress.match(/^(\d{0,18})/g),
                                    detail = '';

                                if (area !== null) {
                                    /*解析省，市，区*/
                                    area = area[0];
                                    detail = tempaddress.replace(area, '');
                                    if (area !== '') {
                                        (function () {
                                            var j = 0,
                                                len = area.length,
                                                arr = [],
                                                str = '';

                                            for (j; j < len; j++) {
                                                var tempj = j + 1;
                                                str += area[j];
                                                if (tempj % 6 === 0) {
                                                    arr.push(str);
                                                    str = '';
                                                }
                                            }
                                            if (arr.length !== 0) {
                                                if (arr[0] && arr[0].length === 6) {
                                                    getAddress(86, arr[0], 'province');
                                                    if (arr[1] && arr[1].length === 6) {
                                                        getAddress(arr[0], arr[1], 'city');
                                                        if (arr[2] && arr[2].length === 6) {
                                                            getAddress(arr[1], arr[2], 'country');
                                                        }
                                                    }
                                                } else {
                                                    getAddress(86, '', 'province', true);
                                                }
                                            } else {
                                                getAddress(86, '', 'province', true);
                                            }
                                        }());
                                    } else {
                                        getAddress(86, '', 'province', true);
                                    }
                                    $admin_address.val(detail);
                                } else {
                                    getAddress(86, '', 'province', true);
                                    $admin_address.val(tempaddress);
                                }
                                break;
                            case 'companyName':
                                $admin_companyName.html(result[i]);
                                break;
                            case 'telephone':
                                $admin_telephone.val(public_tool.phoneFormat(result[i]));
                                break;
                            case 'logoImage':
                                var tempimg = result[i],
                                    imgreg = /(jpeg|jpg|gif|png)/g;

                                if (tempimg.indexOf('qiniucdn.com') !== -1) {
                                    $admin_logoImage.html('<img src="' + result[i] + '?imageView2/1/w/160/h/160" alt="店铺LOGO">');
                                } else if (tempimg.indexOf('.') !== -1) {
                                    if (imgreg.test(tempimg)) {
                                        $admin_logoImage.html('<img src="' + result[i] + '" alt="店铺LOGO">');
                                    } else {
                                        $admin_logoImage.html('');
                                    }
                                } else {
                                    $admin_logoImage.html('');
                                }
                                break;
                        }
                    }
                } else {
                    /*初始化地址*/
                    getAddress(86, '', 'province', true);
                }


            }).fail(function (resp) {
                console.log('error');
            });
        }


        /*获取七牛token*/
        function getToken() {
            var result = null,
                tempurl1 = '120.',
                tempurl2 = '76.',
                tempurl3 = '237.',
                tempurl4 = '100:8080';
            $.ajax({
                url: 'http://' + tempurl1 + tempurl2 + tempurl3 + tempurl4 + '/yttx-public-api/qiniu/token/get',
                async: false,
                type: 'post',
                datatype: 'json',
                data: {
                    bizType: 2,
                    providerId: decodeURIComponent(logininfo.param.providerId),
                    userId: decodeURIComponent(logininfo.param.userId),
                    token: decodeURIComponent(logininfo.param.token)
                }
            }).done(function (resp) {
                var code = parseInt(resp.code, 10);
                if (code !== 0) {
                    console.log(resp.message);
                    return false;
                }
                result = resp.result;
            }).fail(function (resp) {
                console.log(resp.message);
            });
            return result;
        }


        /*上传进度条*/
        function uploadShowBars(id) {
            var len = upload_bars.length;
            if (len > 0) {
                var j = 0;
                for (j; j < len; j++) {
                    if (upload_bars[j] === id) {
                        var bars = parseInt(((j + 1) / len) * 100, 10);
                        setTimeout(function () {
                            show_loading_bar(bars);
                        }, 0);
                        break;
                    }
                }
            }
        }


        /*查询地址(上级id，选中值，查询的地域等级，是否级联查询)*/
        function getAddress(id, sel, type, getflag) {
            var tempurl1 = '120.',
                tempurl2 = '76.',
                tempurl3 = '237.',
                tempurl4 = '100:8080';
            $.ajax({
                url: "http://" + tempurl1 + tempurl2 + tempurl3 + tempurl4 + "/yttx-public-api/address/get",
                dataType: 'JSON',
                method: 'post',
                data: {
                    parentCode: id === '' ? 86 : id
                }
            })
                .done(function (resp) {
                    var code = parseInt(resp.code, 10);
                    if (code !== 0) {
                        console.log(resp.message);
                        return false;
                    }
                    /*是否是正确的返回数据*/
                    var res = resp.result;
                    if (!res) {
                        return false;
                    }
                    var list = res.list;

                    if (!list) {
                        return false;
                    }

                    var len = list.length,
                        str = '',
                        $wrap = '',
                        i = 0;

                    if (type === 'province') {
                        $wrap = $admin_province;
                    } else if (type === 'city') {
                        $wrap = $admin_city;
                    } else if (type === 'country') {
                        $wrap = $admin_country;
                    }

                    if (len !== 0) {
                        if (sel !== '') {
                            for (i; i < len; i++) {
                                var codes = list[i]["code"];
                                if (codes === sel) {
                                    str += '<option selected value="' + codes + '">' + list[i]["name"] + '</option>';
                                } else {
                                    str += '<option value="' + codes + '">' + list[i]["name"] + '</option>';
                                }
                            }
                        } else {
                            for (i; i < len; i++) {
                                if (i === 0) {
                                    sel = list[i]["code"];
                                    str += '<option selected value="' + list[i]["code"] + '">' + list[i]["name"] + '</option>';
                                } else {
                                    str += '<option value="' + list[i]["code"] + '">' + list[i]["name"] + '</option>';
                                }
                            }
                        }
                        $(str).appendTo($wrap.html(''));

                        if (sel !== '' && getflag) {
                            if (type === 'province') {
                                getAddress(sel, '', 'city', true);
                            } else if (type === 'city') {
                                getAddress(sel, '', 'country');
                            }
                        }
                    }
                })
                .fail(function (resp) {
                    console.log(resp.message);
                });
        }

    });


})(jQuery);