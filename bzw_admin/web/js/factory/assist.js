/*服务辅助工具类*/
(function ($) {
    'use strict';

    /*定义或扩展工厂模块*/
    angular
        .module('assist', [])
        .factory('assistCommon', assistCommon);


    /*工厂依赖注入*/
    assistCommon.$inject = ['toolUtil', 'toolDialog', '$timeout', 'loginService', 'testService'];


    /*工厂实现*/
    function assistCommon(toolUtil, toolDialog, $timeout, loginService, testService) {


        var tempparam = loginService.getCache().loginMap.param,
            cache_reset = {}/*缓存序列,存放重置按钮 dom节点引用*/,
            timerid = null,
            $modal = null;

        /*对外接口*/
        return {
            changeCache: changeCache/*更新缓存*/,
            loginOut: loginOut/*退出*/,

            toggleModal: toggleModal/*弹出层显示隐藏*/,

            /*表单类*/
            initForm: initForm/*初始化表单配置*/,
            addFormDelay: addFormDelay/*执行延时任务序列*/,
            clearFormDelay: clearFormDelay/*清除延时任务序列*/,
            clearFormValid: clearFormValid/*重置表单验证数据*/,
            formSubmit: formSubmit/*提交表单数据*/
        };


        /*更新缓存*/
        function changeCache(key, obj) {
            /*设置新缓存*/
            if (obj) {
                toolUtil.setParams(key, obj);
            } else {
                toolUtil.setParams(key, {});
            }
            /*更新登录缓存*/
            loginService.changeCache();
        }

        /*退出*/
        function loginOut() {
            loginService.outAction();
        }

        /*
         弹出层显示隐藏
         config配置说明
         config:{
         area:''/!*区域或类别，可能和wrap同功能*!/,
         wrap:''/!*容器*!/,
         display:''/!*动作：显示或隐藏*!/,
         delay:''/!*延迟*!/,
         clear:''/!*是否清除延时任务*!/
         }*/
        function toggleModal(config, fn) {
            var temp_timer = null;
            if (config.display === 'show') {
                if (typeof config.delay !== 'undefined') {
                    temp_timer = setTimeout(function () {
                        config.wrap.modal('show', {backdrop: 'static'});
                        clearTimeout(temp_timer);
                        temp_timer = null;
                    }, config.delay);
                    if (fn && typeof fn === 'function') {
                        fn.call(null);
                    }
                } else {
                    config.wrap.modal('show', {backdrop: 'static'});
                    if (fn && typeof fn === 'function') {
                        fn.call(null);
                    }
                }
            } else if (config.display === 'hide') {
                if (typeof config.delay !== 'undefined') {
                    temp_timer = setTimeout(function () {
                        config.wrap.modal('hide');
                        /*清除延时任务序列*/
                        if (config.clear) {
                            clearFormDelay();
                        }
                        clearTimeout(temp_timer);
                        temp_timer = null;
                    }, config.delay);
                } else {
                    config.wrap.modal('hide');
                    /*清除延时任务序列*/
                    if (config.clear) {
                        clearFormDelay();
                    }
                }
            }
        }


        /*表单服务类*/
        /*初始化表单配置*/
        function initForm(arr) {
            /*如果有配置则配置缓存*/
            for (var i in cache_reset) {
                cache_reset[i] = null/*释放内存*/;
                delete cache_reset[i]/*清除序列*/;
            }
            if (arr) {
                /*配置dom节点引用*/
                var j = 0,
                    len = arr.length;

                if (len !== 0) {
                    for (j; j < len; j++) {
                        /*缓存table节点*/
                        var index = arr[j];
                        cache_reset[index] = angular.element('#admin_form_reset' + index);
                    }
                }
            }
        }

        /*执行延时任务序列*/
        function addFormDelay(config) {
            var index = config.index;
            timerid = $timeout(function () {
                /*触发重置表单*/
                cache_reset[index].triggerHandler('click');
                clearFormDelay();
                if (config.fn && typeof config.fn === 'function') {
                    config.fn.call(null,index);
                }
            }, 0);
        }

        /*清除延时任务序列*/
        function clearFormDelay(tid) {
            if (typeof tid !== 'undefined' && tid !== null) {
                $timeout.cancel(tid);
                tid = null;
            } else {
                /*如果存在延迟任务则清除延迟任务*/
                if (timerid !== null) {
                    $timeout.cancel(timerid);
                    timerid = null;
                }
            }
        }

        /*重置表单数据*/
        function clearFormValid(forms) {
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
        }

        /*提交表单数据*/
        function formSubmit(config, paramfn) {
            if (tempparam) {
                /*初始化参数*/
                var req_param = {},
                    type = config.type/*表单所属模型*/,
                    action = config.action/*表单提交类型，新增，修改...*/,
                    debug = config.debug,
                    index = config.index/*重置表单时索引*/,
                    label = config.label || '表单'/*表单所属模型名称*/,
                    action_map = {
                        'add': '添加',
                        'edit': '编辑',
                        'update': '更新'
                    };

                /*修正表单提交类型*/
                action = action ? action : (config.id && config.id !== '') ? 'edit' : 'add';

                /*回调组合参数*/
                if (paramfn && typeof paramfn === 'function') {
                    req_param = paramfn.call(null);
                }
                /*参数登录适配*/
                req_param["adminId"] = tempparam.adminId;
                req_param["token"] = tempparam.token;

                var req_config = {
                    method: 'post',
                    debug: debug,
                    url: config.url,
                    data: req_param
                };

                toolUtil
                    .requestHttp(req_config)
                    .then(function (resp) {
                            if (debug) {
                                var resp = testService.testSuccess();
                            }
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
                                        if(config.istip){
                                            toolDialog.show({
                                                type: 'warn',
                                                value: action_map[action] + label + '失败'
                                            });
                                        }
                                        /*to do*/
                                        if (config.failfn && typeof config.failfn === 'function') {
                                            config.failfn.call(null, {
                                                action: action,
                                                type: type
                                            });
                                        }
                                    }
                                    if (code === 999) {
                                        /*退出系统*/
                                        loginOut();
                                    }
                                    return false;
                                } else {
                                    /*操作成功即加载数据*/
                                    /*to do*/
                                    if (config.successfn && typeof config.successfn === 'function') {
                                        config.successfn.call(null, {
                                            action: action,
                                            type: type,
                                            result:data.result
                                        });
                                    }
                                    /*提示操作结果*/
                                    if(config.istip){
                                        toolDialog.show({
                                            type: 'succ',
                                            value: action_map[action] + label + '成功'
                                        });
                                    }
                                }
                            } else {
                                if(config.istip){
                                    toolDialog.show({
                                        type: 'warn',
                                        value: action_map[action] + label + '失败'
                                    });
                                }
                            }
                        },
                        function (resp) {
                            var faildata = resp.data;
                            if (faildata) {
                                var message = faildata.message;
                                if (typeof message !== 'undefined' && message !== '') {
                                    toolDialog.show({
                                        type: 'warn',
                                        value: message
                                    });
                                }
                            } else {
                                if(config.istip){
                                    toolDialog.show({
                                        type: 'warn',
                                        value: action_map[action] + label + '失败'
                                    });
                                }
                            }
                        });
            } else {
                loginOut();
            }
        }


    }
})(jQuery);
