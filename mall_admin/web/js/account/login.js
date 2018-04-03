/*login*/
(function ($) {
    $(function () {

        if (public_tool.initMap.isrender) {

            /*如果存在缓存，则删除缓存*/
            public_tool.clear();
            public_tool.clearCacheData();

            //dom节点引用或者其他变量定义
            var debug = false,
                form_provider = document.getElementById('login_provider'),
                form_operator = document.getElementById('login_operator'),
                form_mall = document.getElementById('login_mall'),
                $loginform_provider = $(form_provider),
                $loginform_operator = $(form_operator),
                $findpwd_provider = $('#findpwd_provider'),
                $findpwd_operator = $('#findpwd_operator'),
                $loginform_mall = $(form_mall),
                $username_provider = $('#username_provider'),
                $username_operator = $('#username_operator'),
                $username_mall = $('#username_mall'),
                $pwd_provider = $('#passwd_provider'),
                $pwd_operator = $('#passwd_operator'),
                $pwd_mall = $('#passwd_mall'),
                $validcode_provider = $('#validcode_provider'),
                $validcode_mall = $('#validcode_mall'),
                $validcode_btn_provider = $('#validcode_btn_provider'),
                $validcode_btn_mall = $('#validcode_btn_mall');

            //dom节点引用或者其他变量定义
            var $login_menutab_wrap = $('#login_menutab_wrap'),
                $error_wrap = $('#error_wrap'),
                $login_panel_show1 = $('#login_panel_show1'),
                $login_panel_show2 = $('#login_panel_show2'),
                $login_panel_show3 = $('#login_panel_show3'),
                error_tpl = '<div class="alert alert-danger">\
								<button type="button" class="close" data-dismiss="alert">\
									<span aria-hidden="true">×</span>\
									<span class="sr-only">Close</span>\
								</button>\$info\
							</div>';


            /*绑定切换不同入口*/
            $login_menutab_wrap.on('click', 'li', function () {
                var $this = $(this),
                    type = $this.attr('data-type');

                if (type === 'provider') {
                    $login_panel_show1.removeClass('g-d-hidei');
                    $login_panel_show2.addClass('g-d-hidei');
                    $login_panel_show3.addClass('g-d-hidei');
                    resetTabForm('provider');
                } else if (type === 'operator') {
                    $login_panel_show1.addClass('g-d-hidei');
                    $login_panel_show2.removeClass('g-d-hidei');
                    $login_panel_show3.addClass('g-d-hidei');
                    resetTabForm('operator');
                } else if (type === 'mall') {
                    $login_panel_show1.addClass('g-d-hidei');
                    $login_panel_show2.addClass('g-d-hidei');
                    $login_panel_show3.removeClass('g-d-hidei');
                    resetTabForm('mall');
                }

                $this.addClass('menutab-active').siblings().removeClass('menutab-active');
            });

            //初始化效果
            setTimeout(function () {
                $(".fade-in-effect").addClass('in');
            }, 1);

            /*获取验证码*/
            getValidCode('provider');
            getValidCode('mall');

            /*生成找回密码的链接*/
            initLinkAddress([{
                $node: $findpwd_provider,
                'project_name': '/provider_admin',
                'module_name': '/account/findpwd.html'
            },
                {
                    $node: $findpwd_operator,
                    'project_name': '/operator_admin',
                    'module_name': '/account/findpwd.html'
                }], location.href);


            /*格式化手机号*/
            $username_provider.on('keyup', function () {
                var phoneno = this.value.replace(/\D*/g, '');
                if (phoneno == '') {
                    this.value = '';
                    return false;
                }
                this.value = public_tool.phoneFormat(this.value);
            });


            //供应商异步校验
            $loginform_provider.validate({
                rules: {
                    username_provider: {
                        required: true,
                        zh_phone: true
                    },
                    passwd_provider: {
                        required: true,
                        minlength: 6
                    },
                    validcode_provider: {
                        required: true
                    }
                },
                messages: {
                    username_provider: {
                        required: '请输入手机号',
                        zh_phone: '手机号格式不合法'
                    },
                    passwd_provider: {
                        required: '请输入密码',
                        minlength: '密码必须超过6位字符'
                    },
                    validcode_provider: {
                        required: '请输入验证码'
                    }
                },

                //提交表单
                submitHandler: function (form) {
                    show_loading_bar(70);

                    var opts = {
                        "closeButton": true,
                        "debug": false,
                        "positionClass": "toast-top-full-width",
                        "onclick": null,
                        "showDuration": "300",
                        "hideDuration": "1000",
                        "timeOut": "5000",
                        "extendedTimeOut": "1000",
                        "showEasing": "swing",
                        "hideEasing": "linear",
                        "showMethod": "fadeIn",
                        "hideMethod": "fadeOut"
                    };

                    var basedomain = 'http://10.0.5.226:8082',
                        basepathname = "/yttx-providerbms-api/user/login";
                    $.ajax({
                        url: debug ? "../../json/test.json" : basedomain + basepathname,
                        method: 'POST',
                        dataType: 'json',
                        async: false,
                        data: {
                            loginType: 4,
                            phone: public_tool.trims($username_provider.val()),
                            password: $pwd_provider.val(),
                            identifyingCode: $validcode_provider.val()
                        }
                    }).done(function (resp) {
                        if(debug){
                            var resp=testWidget.testSuccess('list');
                            resp['result']=testWidget.getMap({
                                map: {
                                    userId: 'id',
                                    token: 'guid',
                                    providerId: 'id'
                                },
                                maptype: 'object'
                            }).list;
                        }
                        var code = parseInt(resp.code, 10),
                            result = resp.result;


                        //显示错误
                        if (code !== 0) {
                            $error_wrap.html(error_tpl.replace('$info', resp.message));
                            $error_wrap.find('.alert').hide().slideDown();
                            $pwd_provider.select();
                            return false;
                        }


                        $error_wrap.html(error_tpl.replace('$info', resp.message));
                        $error_wrap.find('.alert').hide().slideDown();


                        //移除提示的错误信息
                        $error_wrap.find('.alert').slideUp('fast');


                        //放入本地存储
                        public_tool.setParams('login_module', {
                            'isLogin': true,
                            'datetime': moment().format('YYYY-MM-DD|HH:mm:ss'),
                            'reqdomain': basedomain,
                            'currentdomain': '',
                            'username': $username_provider.val() || '匿名用户',
                            'param': {
                                'userId': encodeURIComponent(result.userId),
                                'token': encodeURIComponent(result.token),
                                'providerId': encodeURIComponent(result.providerId)
                            }
                        });

                        //调用进度条组件
                        show_loading_bar({
                            delay: .5,
                            pct: 100,
                            finish: function () {
                                if (code === 0) {
                                    //成功后跳入主页面
                                    location.href = location.href.replace('/mall_admin', '/provider_admin').replace('/account/login.html', '/setting/yttx-setting-base.html');
                                }
                            }
                        });


                    }).fail(function () {
                        //移除提示的错误信息
                        $error_wrap.find('.alert').slideUp('fast');
                        //显示错误信息
                        $error_wrap.html(error_tpl.replace('$info', '登陆失败请重新登陆'));
                        $error_wrap.find('.alert').hide().slideDown();
                        $pwd_provider.select();
                    });
                    return false;

                }
            });


            //运营商异步校验
            $loginform_operator.validate({
                rules: {
                    username_operator: {
                        required: true
                    },
                    passwd_operator: {
                        required: true,
                        minlength: 6
                    }
                },

                messages: {
                    username_operator: {
                        required: '请输入用户名'
                    },
                    passwd_operator: {
                        required: '请输入密码',
                        minlength: '密码必须超过6位字符'
                    }
                },

                //提交表单
                submitHandler: function (form) {
                    show_loading_bar(70);

                    var opts = {
                        "closeButton": true,
                        "debug": false,
                        "positionClass": "toast-top-full-width",
                        "onclick": null,
                        "showDuration": "300",
                        "hideDuration": "1000",
                        "timeOut": "5000",
                        "extendedTimeOut": "1000",
                        "showEasing": "swing",
                        "hideEasing": "linear",
                        "showMethod": "fadeIn",
                        "hideMethod": "fadeOut"
                    };

                    var basedomain = 'http://10.0.5.226:8082',
                        basepathname = "/mall-agentbms-api/sysuser/login";
                    $.ajax({
                        url: debug ? "../../json/test.json" :basedomain + basepathname,
                        method: 'POST',
                        dataType: 'json',
                        async: false,
                        data: {
                            username: $username_operator.val(),
                            password: $pwd_operator.val()
                        }
                    }).done(function (resp) {
                        if(debug){
                            var resp=testWidget.testSuccess('list');
                            resp['result']=testWidget.getMap({
                                map: {
                                    grade:'rule,-1,-2,-3,-4,1,2,3,4',
                                    adminId:'id',
                                    roleId:'id',
                                    token: 'guid',
                                    sourcesChannel:'id'
                                },
                                maptype: 'object'
                            }).list;
                        }
                        var code = parseInt(resp.code, 10),
                            result = resp.result;


                        //显示错误
                        if (code !== 0) {
                            $error_wrap.html(error_tpl.replace('$info', resp.message));
                            $error_wrap.find('.alert').hide().slideDown();
                            $pwd_operator.select();
                            return false;
                        }

                        $error_wrap.html(error_tpl.replace('$info', resp.message));
                        $error_wrap.find('.alert').hide().slideDown();


                        //移除提示的错误信息
                        $error_wrap.find('.alert').slideUp('fast');


                        //放入本地存储
                        public_tool.setParams('login_module', {
                            'isLogin': true,
                            'datetime': moment().format('YYYY-MM-DD|HH:mm:ss'),
                            'reqdomain': basedomain,
                            'currentdomain': '',
                            'username': (function () {
                                var grade = result.grade;
                                if (grade === 3) {
                                    return $username_operator.val() + '(省级代理)' || '匿名用户';
                                } else if (grade === 2) {
                                    return $username_operator.val() + '(市级代理)' || '匿名用户';
                                } else if (grade === 1) {
                                    return $username_operator.val() + '(县级代理)' || '匿名用户';
                                } else if (grade === 4) {
                                    return $username_operator.val() + '(店长)' || '匿名用户';
                                } else if (grade === -1) {
                                    return $username_operator.val() + '(超级管理员)' || '匿名用户';
                                } else if (grade === -2) {
                                    return $username_operator.val() + '(默认)' || '匿名用户';
                                } else if (grade === -3) {
                                    return $username_operator.val() + '(总代理)' || '匿名用户';
                                } else if (grade === -4) {
                                    return $username_operator.val() + '(分仓管理员)' || '匿名用户';
                                }
                            }()),
                            'param': {
                                'adminId': encodeURIComponent(result.adminId),
                                'token': encodeURIComponent(result.token),
                                'roleId': encodeURIComponent(result.roleId),
                                'grade': encodeURIComponent(result.grade),
                                'sourcesChannel': encodeURIComponent(result.sourcesChannel)
                            }
                        });

                        //调用进度条组件
                        show_loading_bar({
                            delay: .5,
                            pct: 100,
                            finish: function () {
                                if (code === 0) {
                                    location.href = location.href.replace('/mall_admin', '/operator_admin').replace('/account/login.html', '/index.html');
                                }
                            }
                        });


                    }).fail(function () {
                        //移除提示的错误信息
                        $error_wrap.find('.alert').slideUp('fast');
                        //显示错误信息
                        $error_wrap.html(error_tpl.replace('$info', '登陆失败请重新登陆'));
                        $error_wrap.find('.alert').hide().slideDown();
                        $pwd_operator.select();
                    });
                    return false;

                }
            });


            //布住网异步校验
            $loginform_mall.validate({
                rules: {
                    username_mall: {
                        required: true
                    },
                    passwd_mall: {
                        required: true,
                        minlength: 6
                    },
                    validcode_mall: {
                        required: true
                    }
                },

                messages: {
                    username_mall: {
                        required: '请输入用户名'
                    },
                    passwd_mall: {
                        required: '请输入密码',
                        minlength: '密码必须超过6位字符'
                    },
                    validcode_mall: {
                        required: '请输入验证码'
                    }
                },

                //提交表单
                submitHandler: function (form) {
                    show_loading_bar(70);

                    var opts = {
                        "closeButton": true,
                        "debug": false,
                        "positionClass": "toast-top-full-width",
                        "onclick": null,
                        "showDuration": "300",
                        "hideDuration": "1000",
                        "timeOut": "5000",
                        "extendedTimeOut": "1000",
                        "showEasing": "swing",
                        "hideEasing": "linear",
                        "showMethod": "fadeIn",
                        "hideMethod": "fadeOut"
                    };

                    var basedomain = 'http://10.0.5.226:8082',
                        basepathname = "/mall-buzhubms-api/sysuser/login";
                    $.ajax({
                        url: debug ? "../../json/test.json" :basedomain + basepathname,
                        method: 'POST',
                        dataType: 'json',
                        async: false,
                        data: {
                            username: $username_mall.val(),
                            password: $pwd_mall.val(),
                            identifyingCode: $validcode_mall.val()
                        }
                    }).done(function (resp) {
                        if(debug){
                            var resp=testWidget.testSuccess('list');
                            resp['result']=testWidget.getMap({
                                map: {
                                    grade:'rule,-1,1,2',
                                    adminId:'id',
                                    roleId:'id',
                                    token: 'guid'
                                },
                                maptype: 'object'
                            }).list;
                        }
                        var code = parseInt(resp.code, 10),
                            result = resp.result;


                        //显示错误
                        if (code !== 0) {
                            $error_wrap.html(error_tpl.replace('$info', resp.message));
                            $error_wrap.find('.alert').hide().slideDown();
                            $pwd_mall.select();
                            return false;
                        }

                        $error_wrap.html(error_tpl.replace('$info', resp.message));
                        $error_wrap.find('.alert').hide().slideDown();


                        //移除提示的错误信息
                        $error_wrap.find('.alert').slideUp('fast');


                        //放入本地存储
                        public_tool.setParams('login_module', {
                            'isLogin': true,
                            'datetime': moment().format('YYYY-MM-DD|HH:mm:ss'),
                            'reqdomain': basedomain,
                            'currentdomain': '',
                            'username': (function () {
                                var grade = result.grade;
                                if (grade === -1) {
                                    return $username_mall.val() + '(超级管理员)' || '匿名用户';
                                } else {
                                    return $username_mall.val() || '匿名用户';
                                }
                            }()),
                            'param': {
                                'adminId': encodeURIComponent(result.adminId),
                                'token': encodeURIComponent(result.token),
                                'grade': encodeURIComponent(result.grade),
                                'roleId': encodeURIComponent(result.roleId)
                            }
                        });

                        //调用进度条组件
                        show_loading_bar({
                            delay: .5,
                            pct: 100,
                            finish: function () {
                                if (code === 0) {
                                    //成功后跳入主页面
                                    location.href = '../index.html';
                                }
                            }
                        });


                    }).fail(function () {
                        //移除提示的错误信息
                        $error_wrap.find('.alert').slideUp('fast');
                        //显示错误信息
                        $error_wrap.html(error_tpl.replace('$info', '登陆失败请重新登陆'));
                        $error_wrap.find('.alert').hide().slideDown();
                        $pwd_mall.select();
                    });
                    return false;

                }
            });


            //重置表单并设置获取焦点
            resetTabForm('mall');


            /*重新生成验证码*/
            $.each([$validcode_btn_provider, $validcode_btn_mall], function () {
                var selector = this.selector;
                this.on('click', function () {
                    if (selector.indexOf('provider') !== -1) {
                        getValidCode('provider');
                    } else if (selector.indexOf('mall') !== -1) {
                        getValidCode('mall');
                    }
                });
            });


        }

        /*获取验证码*/
        function getValidCode(type) {
            if(debug){
                (function () {
                    var code = Mock.mock(/[a-zA-Z0-9]{4}/),
                        imgsrc = Mock.Random.image('80x40', '#ffffff', '#666666', code),
                        img = document.createElement("img");

                    img.src = imgsrc;
                    if (type === 'provider') {
                        /*供应商入口*/
                        $validcode_btn_provider.html(img);
                    } else if (type === 'mall') {
                        /*布住网*/
                        $validcode_btn_mall.html(img);
                    } else {
                        /*其他*/
                        $validcode_btn_mall.html(img);
                    }
                }());
            }else{
                var xhr = new XMLHttpRequest();
                if (type === 'provider') {
                    /*供应商入口*/
                    xhr.open("post", 'http://10.0.5.226:8082/yttx-providerbms-api/user/identifying/code', true);
                } else if (type === 'mall') {
                    /*布住网*/
                    xhr.open("post", 'http://10.0.5.226:8082/mall-buzhubms-api/sysuser/identifying/code', true);
                } else {
                    /*其他*/
                    xhr.open("post", 'http://10.0.5.226:8082/mall-buzhubms-api/sysuser/identifying/code', true);
                }
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

                        if (type === 'provider') {
                            /*供应商入口*/
                            $validcode_btn_provider.html(img);
                        } else if (type === 'mall') {
                            /*布住网*/
                            $validcode_btn_mall.html(img);
                        } else {
                            /*其他*/
                            $validcode_btn_mall.html(img);
                        }
                    }
                };
                xhr.send();
            }
        }


        /*重置表单*/
        function resetTabForm(type) {
            if (type === 'provider') {
                form_provider.reset();
                $username_provider.select();
            } else if (type === 'operator') {
                form_operator.reset();
                $username_operator.select();
            } else if (type === 'mall') {
                form_mall.reset();
                $username_mall.select();
            }
        }


        /*初始化链接地址*/
        function initLinkAddress(arr, str) {
            if (!arr || arr.length === 0) {
                return false;
            }
            $.each(arr, function (index) {
                var item = arr[index],
                    tempstr = str.replace('/mall_admin', item['project_name']).replace('/account/login.html', item['module_name']);
                item['$node'].attr({
                    'href': tempstr
                });
            });
        }

    });
})(jQuery);