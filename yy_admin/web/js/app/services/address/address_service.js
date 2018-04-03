/*地址服务*/
'use strict';
angular.module('app')
    .service('addressService', ['toolUtil', 'BASE_CONFIG', function (toolUtil, BASE_CONFIG) {
        /*初始化配置*/
        var self = this;

        /*关联查询*/
        this.queryRelation = function (config, fn) {
            var type = config.type/*类型：负责判断查询，省，市，区*/,
                address = config.address/*模型：负责更新数据*/,
                model = config.model,
                isinit = config.isinit,
                id;

            /*
             适配参数
             顶级分类，数据模型为空，业务模型为空
             */
            if (type === 'province' && angular.equals({}, address[type]) && model[type] === '') {
                /*初始化查询*/
                id = 86;
            } else if (type === 'city') {
                id = model['province'];
            } else if (type === 'country') {
                id = model['city'];
            }
            /*更新模型*/
            /*this.updateAddress(type, address);
            config.address = address;
            console.log(type);*/


            /*组合请求参数*/
            toolUtil
                .requestHttp({
                    url: BASE_CONFIG.commondomain + BASE_CONFIG.commonproject + '/address/get',
                    method: 'post',
                    async: false,
                    data: {
                        parentCode: id
                    }
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
                                    console.log('退出系统');
                                }
                            } else {
                                /*加载数据*/
                                var result = data.result;
                                if (typeof result !== 'undefined') {
                                    var list = result.list;
                                    if (list) {
                                        var len = list.length;
                                        if (len !== 0) {
                                            /*清空模型*/
                                            if(!isinit){
                                                self.emptyAddressModel(type, address, model);
                                            }
                                            /*数据集合，最多嵌套层次*/
                                            var i = 0,
                                                tempaddress = {},
                                                address_item,
                                                list_item;
                                            if (model[type] !== '') {
                                                /*模型有选中数据情况*/
                                                for (i; i < len; i++) {
                                                    address_item = {};
                                                    list_item = list[i];

                                                    address_item['key'] = list_item['name'];
                                                    address_item['value'] = list_item['code'];
                                                    /*判断临时缓存是否存在*/
                                                    if (!tempaddress[list_item['code']]) {
                                                        tempaddress[list_item['code']] = address_item;
                                                    }
                                                }
                                                /*更新模型*/
                                                address[type] = tempaddress;
                                                /*更新验证模型*/
                                                if (address['valid_address']) {
                                                    address['valid_address'][type] = true;
                                                }

                                            } else {
                                                /*模型无选中数据则取第一个（初始化查询情况下）*/
                                                for (i; i < len; i++) {
                                                    address_item = {};
                                                    list_item = list[i];
                                                    address_item['key'] = list_item['name'];
                                                    address_item['value'] = list_item['code'];
                                                    if (i === 0 && isinit) {
                                                        /*匹配即更新模型*/
                                                        model[type] = list_item['code'];
                                                    }
                                                    /*判断临时缓存是否存在*/
                                                    if (!tempaddress[list_item['code']]) {
                                                        tempaddress[list_item['code']] = address_item;
                                                    }
                                                }
                                                /*更新模型*/
                                                address[type] = tempaddress;
                                                /*更新验证模型*/
                                                if (address['valid_address']) {
                                                    address['valid_address'][type] = true;
                                                }
                                            }
                                            /*循环完毕根据类型判断是否开启下级查询*/
                                            if (type === 'province' && isinit) {
                                                /*查询市级*/
                                                if (fn && typeof fn === 'function') {
                                                    self.queryRelation({
                                                        model: config.model,
                                                        address: config.address,
                                                        type: 'city',
                                                        isinit: isinit
                                                    }, fn);
                                                } else {
                                                    self.queryRelation({
                                                        model: config.model,
                                                        address: config.address,
                                                        type: 'city',
                                                        isinit: isinit
                                                    });
                                                }
                                            } else if (type === 'city' && isinit) {
                                                if (fn && typeof fn === 'function') {
                                                    self.queryRelation({
                                                        model: config.model,
                                                        address: config.address,
                                                        type: 'country',
                                                        isinit: isinit
                                                    }, fn);
                                                } else {
                                                    self.queryRelation({
                                                        model: config.model,
                                                        address: config.address,
                                                        type: 'country',
                                                        isinit: isinit
                                                    });
                                                }
                                            } else if (type === 'country' && fn && typeof fn === 'function') {
                                                /*判断是否有回调*/
                                                fn.call(null);
                                            }
                                        } else {
                                            if (type === 'province') {
                                                /*清空模型*/
                                                self.emptyAddressModel(type, address, model);
                                                /*执行回调(主要为经纬度回调)*/
                                                if (fn && typeof fn === 'function') {
                                                    /*判断是否有回调:此处主要为查询经纬度操作*/
                                                    fn.call(null);
                                                }
                                                return false;
                                            } else if (type === 'city' && !isinit) {
                                                /*清空模型*/
                                                self.emptyAddressModel(type, address, model);
                                                /*执行回调(主要为经纬度回调)*/
                                                if (fn && typeof fn === 'function') {
                                                    /*判断是否有回调:此处主要为查询经纬度操作*/
                                                    fn.call(null);
                                                }
                                                return false;
                                            } else {
                                                /*清空模型*/
                                                self.emptyAddressModel(type, address, model);
                                                /*执行回调(主要为经纬度回调)*/
                                                if (fn && typeof fn === 'function') {
                                                    /*判断是否有回调:此处主要为查询经纬度操作*/
                                                    fn.call(null);
                                                }
                                                return false;
                                            }
                                        }
                                    } else {
                                        /*清空模型*/
                                        self.emptyAddressModel(type, address, model);
                                    }
                                } else {
                                    /*清空模型*/
                                    self.emptyAddressModel(type, address, model);
                                }
                            }
                        }
                    },
                    function (resp) {
                        /*置空模型*/
                        /*清空模型*/
                        self.emptyAddressModel(type, address, model);
                        var data = resp.data,
                            message = data.message;
                        if (typeof message !== 'undefined' && message !== '') {
                            console.log(message);
                        } else {
                            console.log('请求失败');
                        }
                    });
        };

        /*查询省*/
        this.queryProvince = function () {
            var address = config.address/*模型：负责更新数据*/,
                model = config.model,
                type = 'province';

            /*组合请求参数*/
            toolUtil
                .requestHttp({
                    url: BASE_CONFIG.commondomain + BASE_CONFIG.commonproject + '/address/get',
                    method: 'post',
                    async: false,
                    data: {
                        parentCode: 86
                    }
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
                                    console.log('退出系统');
                                }
                            } else {
                                /*加载数据*/
                                var result = data.result;
                                if (typeof result !== 'undefined') {
                                    var list = result.list;
                                    if (list) {
                                        var len = list.length;
                                        if (len !== 0) {
                                            /*数据集合，最多嵌套层次*/
                                            var i = 0,
                                                tempaddress = {};
                                            var address_item,
                                                list_item;
                                            if (model[type] !== '') {
                                                /*有数据情况*/
                                                for (i; i < len; i++) {
                                                    address_item = {};
                                                    list_item = list[i];
                                                    address_item['key'] = list_item['name'];
                                                    address_item['value'] = list_item['code'];
                                                    /*判断临时缓存是否存在*/
                                                    if (!tempaddress[list_item['code']]) {
                                                        tempaddress[list_item['code']] = address_item;
                                                    }
                                                }
                                                /*更新模型*/
                                                address[type] = tempaddress;
                                            } else {
                                                /*无数据则取第一个*/
                                                for (i; i < len; i++) {
                                                    address_item = {};
                                                    list_item = list[i];
                                                    address_item['key'] = list_item['name'];
                                                    address_item['value'] = list_item['code'];
                                                    if (i === 0) {
                                                        /*匹配即更新模型*/
                                                        model[type] = list_item['code'];
                                                    }
                                                    /*判断临时缓存是否存在*/
                                                    if (!tempaddress[list_item['code']]) {
                                                        tempaddress[list_item['code']] = address_item;
                                                    }
                                                }
                                                /*更新模型*/
                                                address[type] = tempaddress;
                                            }
                                        }
                                    } else {
                                        /*置空模型*/
                                        address[type] = {};
                                    }
                                } else {
                                    /*置空模型*/
                                    address[type] = {};
                                }
                            }
                        }
                    },
                    function (resp) {
                        /*置空模型*/
                        address[type] = {};
                        var data = resp.data,
                            message = data.message;
                        if (typeof message !== 'undefined' && message !== '') {
                            console.log(message);
                        } else {
                            console.log('请求失败');
                        }
                    });
        };

        /*判断是否需要查询
         主要用于性能优化，减少地址查询消耗，
         初始化查询中不会用到此服务，
         返回是否需要重新请求数据的标识符和对应的类型*/
        this.isReqAddress = function (config, flag, fn) {

            var type = config.type/*类型：负责判断查询，省，市，区*/,
                address = config.address/*模型：负责更新数据*/,
                model = config.model;

            /*模型为空，需重新请求数据*/
            if (model[type] === '') {
                if (flag) {
                    if (fn) {
                        self.queryRelation(config, fn);
                    } else {
                        self.queryRelation(config);
                    }
                    return false;
                } else {
                    return {
                        isreq: true,
                        type: type
                    };
                }
            }
            /*数据源没有匹配的模型数据需重新请求数据*/
            if (address[type][model[type]]) {
                if (flag) {
                    if (fn) {
                        self.queryRelation(config, fn);
                    } else {
                        self.queryRelation(config);
                    }
                    return false;
                } else {
                    return {
                        isreq: false,
                        type: type
                    };
                }
            } else {
                if (flag) {
                    if (fn) {
                        self.queryRelation(config, fn);
                    } else {
                        self.queryRelation(config);
                    }
                    return false;
                } else {
                    return {
                        isreq: true,
                        type: type
                    };
                }
            }
        };


        /*根据code查询value,code:查询值,fn:回调函数*/
        this.queryByCode = function (code, fn) {
            if (typeof code === 'undefined') {
                return '';
            }
            var address_str = '';
            toolUtil
                .requestHttp({
                    url: BASE_CONFIG.commondomain + BASE_CONFIG.commonproject + '/address/name',
                    method: 'post',
                    data: {
                        code: code
                    }
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
                                    console.log('退出系统');
                                }
                                if (fn && typeof fn === 'function') {
                                    fn.call(null, '');
                                } else {
                                    return address_str = '';
                                }
                            } else {
                                /*加载数据*/
                                var result = data.result;
                                if (typeof result !== 'undefined') {
                                    var name = result.name;
                                    if (name) {
                                        if (fn && typeof fn === 'function') {
                                            fn.call(null, name);
                                        } else {
                                            return address_str = name;
                                        }
                                    } else {
                                        if (fn && typeof fn === 'function') {
                                            fn.call(null, '');
                                        } else {
                                            return address_str = '';
                                        }
                                    }
                                } else {
                                    if (fn && typeof fn === 'function') {
                                        fn.call(null, '');
                                    } else {
                                        return address_str = '';
                                    }
                                }
                            }
                        }
                    },
                    function (resp) {
                        /*置空模型*/
                        var data = resp.data,
                            message = data.message;
                        if (typeof message !== 'undefined' && message !== '') {
                            console.log(message);
                        } else {
                            console.log('请求失败');
                        }
                        if (fn && typeof fn === 'function') {
                            fn.call(null, '');
                        } else {
                            return address_str = '';
                        }
                    });
        };


        /*清空模型*/
        this.emptyAddressModel = function (type, address, model) {
            if (type === 'province') {
                /*更新表单模型*/
                model['province'] = '';
                model['city'] = '';
                model['country'] = '';
                /*更新地址模型*/
                delete address['province'];
                address['province'] = {};
                delete address['city'];
                address['city'] = {};
                delete address['country'];
                address['country'] = {};
                /*切换验证状态*/
                if (address['valid_address']) {
                    address['valid_address']['province'] = false;
                    address['valid_address']['city'] = false;
                    address['valid_address']['country'] = false;
                }
            } else if (type === 'city') {
                /*更新表单模型*/
                model['city'] = '';
                model['country'] = '';
                /*更新地址模型*/
                delete address['city'];
                address['city'] = {};
                delete address['country'];
                address['country'] = {};
                /*切换验证状态*/
                if (address['valid_address']) {
                    address['valid_address']['city'] = false;
                    address['valid_address']['country'] = false;
                }
            } else if (type === 'country') {
                /*更新表单模型*/
                model['country'] = '';
                /*更新地址模型*/
                delete address['country'];
                address['country'] = {};
                /*切换验证状态*/
                if (address['valid_address']) {
                    address['valid_address']['country'] = false;
                }
            }
        }


    }]);
