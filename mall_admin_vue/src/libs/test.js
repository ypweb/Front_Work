import Mock from './../../node_modules/mockjs';
import moment from './../../node_modules/moment';
import RULE_CONFIG from './testRule';

/*自定义测试类,需搭配mock测试库*/
let test = {};

/*通用私有方法--生成范围*/
function _generateLimit(config) {
    let limit;
    /*配置信息*/
    if (config) {
        let min = config.mapmin,
            max = config.mapmax,
            name = typeof config.mapname === 'undefined' ? 'list' : config.mapname,
            maptype = typeof config.maptype !== 'undefined' ? config.maptype : 'array';


        if (maptype === 'array') {
            if (typeof min === 'undefined') {
                if (typeof max === 'undefined') {
                    limit = name + '|10';
                } else {
                    limit = name + '|' + max;
                }
            } else {
                if (typeof max === 'undefined') {
                    limit = name + '|' + min;
                } else {
                    limit = name + '|' + min + '-' + max;
                }
            }
        } else if (maptype === 'object') {
            limit = name;
        }
    } else {
        limit = 'list|10';
    }
    return limit;
}

/*通用私有方法--指定正则匹配*/
function _generateRule(str) {
    let rule;
    if (typeof str === 'undefined') {
        rule = RULE_CONFIG.test_value;
    } else {
        if (str === 'id') {
            rule = RULE_CONFIG.test_id;
        } else if (str === 'guid') {
            rule = RULE_CONFIG.test_guid;
        } else if (str === 'sequence') {
            rule = RULE_CONFIG.test_sequence;
        } else if (str === 'name') {
            rule = RULE_CONFIG.test_name;
        } else if (str === 'goods') {
            rule = RULE_CONFIG.test_goods;
        } else if (str === 'goodstype') {
            rule = RULE_CONFIG.test_goodstype;
        } else if (str === 'mobile') {
            rule = RULE_CONFIG.test_mobile;
        } else if (str === 'phone') {
            rule = RULE_CONFIG.test_phone;
        } else if (str === 'datetime') {
            rule = moment().format('YYYY-MM-DD HH:mm:ss');
        } else if (str === 'state') {
            rule = RULE_CONFIG.test_id;
        } else if (str === 'money') {
            rule = RULE_CONFIG.test_money;
        } else if (str === 'unit') {
            rule = RULE_CONFIG.test_unit;
        } else if (str === 'bankcard') {
            rule = RULE_CONFIG.test_bankcard;
        } else if (str === 'email') {
            rule = RULE_CONFIG.test_email;
        } else if (str === 'type') {
            rule = RULE_CONFIG.test_id;
        } else if (str === 'flag') {
            rule = RULE_CONFIG.test_flag;
        } else if (str === 'or') {
            rule = RULE_CONFIG.test_or;
        } else if (str === 'remark') {
            rule = RULE_CONFIG.test_remark;
        } else if (str === 'value') {
            rule = RULE_CONFIG.test_value;
        } else if (str === 'text') {
            rule = RULE_CONFIG.test_text;
        } else if (str === 'content') {
            rule = RULE_CONFIG.test_content;
        } else if (str === 'info') {
            rule = RULE_CONFIG.test_info;
        } else if (str === 'province') {
            return Mock.Random.province();
        } else if (str === 'city') {
            return Mock.Random.city();
        } else if (str === 'country') {
            return Mock.Random.county();
        } else if (str === 'address') {
            return Mock.Random.county(true);
        } else if (str.indexOf('minmax') !== -1) {
            return () => {
                let temprule = str.split(',').slice(1),
                    min = parseInt(temprule[0], 10),
                    max = parseInt(temprule[1], 10),
                    mm = Math.random() * (max - min);
                return min + parseInt(mm.toString(), 10);
            };
        } else {
            rule = RULE_CONFIG.test_value;
        }
    }
    return Mock.mock(rule);
}

/*通用私有方法--生成集合*/
function _generateMap(config) {
    if (!config) {
        return false;
    }

    let map = config.map,
        map_obj = {},
        result = {},
        maptype = config.maptype;

    /*遍历属性*/
    for (let i in map) {
        switch (map[i]) {
            case 'id':
                map_obj[i] = RULE_CONFIG.test_id;
                break;
            case 'guid':
                map_obj[i] = RULE_CONFIG.test_guid;
                break;
            case 'name':
                map_obj[i] = RULE_CONFIG.test_name;
                break;
            case 'goods':
                map_obj[i] = RULE_CONFIG.test_goods;
                break;
            case 'goodstype':
                map_obj[i] = RULE_CONFIG.test_goodstype;
                break;
            case 'mobile':
                map_obj[i] = RULE_CONFIG.test_mobile;
                break;
            case 'phone':
                map_obj[i] = RULE_CONFIG.test_phone;
                break;
            case 'datetime':
                map_obj[i] = moment().format('YYYY-MM-DD|HH:mm:ss');
                break;
            case 'state':
                map_obj[i] = RULE_CONFIG.test_id;
                break;
            case 'money':
                map_obj[i] = RULE_CONFIG.test_money;
                break;
            case 'unit':
                map_obj[i] = RULE_CONFIG.test_unit;
                break;
            case 'bankcard':
                map_obj[i] = RULE_CONFIG.test_bankcard;
                break;
            case 'email':
                map_obj[i] = RULE_CONFIG.test_email;
                break;
            case 'type':
                map_obj[i] = RULE_CONFIG.test_id;
                break;
            case 'flag':
                map_obj[i] = RULE_CONFIG.test_flag;
                break;
            case 'or':
                map_obj[i] = RULE_CONFIG.test_or;
                break;
            case 'remark':
                map_obj[i] = RULE_CONFIG.test_remark;
                break;
            case 'value':
                map_obj[i] = RULE_CONFIG.test_value;
                break;
            case 'text':
                map_obj[i] = RULE_CONFIG.test_text;
                break;
            case 'content':
                map_obj[i] = RULE_CONFIG.test_content;
                break;
            case 'info':
                map_obj[i] = RULE_CONFIG.test_info;
                break;
            case 'province':
                map_obj[i] = () => {
                    let address = Mock.Random.county(true).split(' ');
                    /*存在市*/
                    if (map['city']) {
                        map_obj['city'] = address[1];
                        if (map['country']) {
                            map_obj['country'] = address[2];
                        }
                    }
                    return address[0];
                };
                break;
            case 'address':
                map_obj[i] = Mock.Random.county(true);
                break;
            case '':
                map_obj[i] = '';
                break;
            default:
                if (map[i].indexOf('rule') !== -1) {
                    map_obj[i] = () => {
                        let rule = map[i].split(',').slice(1).join('|'),
                            reg = '(' + rule + '){1}';
                        return new RegExp(reg);
                    }
                } else if (map[i].indexOf('minmax') !== -1) {
                    map_obj[i] = () => {
                        let rule = map[i].split(',').slice(1),
                            min = parseInt(rule[0], 10),
                            max = parseInt(rule[1], 10),
                            mm = Math.random() * (max - min);
                        return min + parseInt(mm.toString(), 10);
                    };
                } else {
                    map_obj[i] = RULE_CONFIG.test_value;
                }
                break;
        }
    }

    /*组合属性*/
    if (typeof maptype !== 'undefined') {
        if (maptype === 'array') {
            result[_generateLimit(config)] = [map_obj];
        } else if (maptype === 'object') {
            result[_generateLimit(config)] = map_obj;
        }
    } else {
        result[_generateLimit(config)] = [map_obj];
    }
    return Mock.mock(result);
}

/*通用私有方法--生成结果集*/
function _generateResult(datalist, config) {
    let result = {};
    if (config) {
        let type = config.type,
            message = typeof config.message === 'undefined' ? 'ok' : config.message,
            code = typeof config.code === 'undefined' ? 0 : config.code,
            count = typeof config.count === 'undefined' ? 50 : config.count;

        if (type === 'list') {
            result['message'] = message;
            datalist['count'] = count;
            result['code'] = code;
            result['result'] = datalist;
        } else if (type === 'table') {
            result['status'] = 200;
            result['data'] = {
                message: 'ok',
                count: 50,
                code: code,
                result: datalist
            };
        } else {
            result['status'] = 200;
            result['data'] = {
                message: 'ok',
                count: 50,
                code: code,
                result: datalist
            };
        }
    } else {
        result['status'] = 200;
        result['data'] = {
            message: 'ok',
            count: 50,
            code: 0,
            result: datalist
        };
    }
    return result;
}

/*通用私有方法--生成菜单*/
function _createMenu(flag) {
    let mlist = [{
            "code": "demo",
            "name": "组件示例",
            "link": "/demo-self",
            "id": 1,
            "subItem": [{
                "code": "demo-self",
                "link": "/demo-self",
                "name": "自定义组件"
            }, {
                "code": "demo-zorro",
                "link": "/demo-zorro",
                "name": "ng-zorro组件"
            }]
        }],
        plist = [{
            "code": "add",
            "name": "增加"
        }, {
            "code": "delete",
            "name": "删除"
        }, {
            "code": "update",
            "name": "修改"
        }, {
            "code": "query",
            "name": "查询"
        }],
        elist = [{
            "code": "audit",
            "name": "审核"
        }, {
            "code": "send",
            "name": "发货"
        }, {
            "code": "comment",
            "name": "评论"
        }, {
            "code": "forbid",
            "name": "禁用"
        }, {
            "code": "enable",
            "name": "启用"
        }, {
            "code": "up",
            "name": "上架"
        }, {
            "code": "down",
            "name": "下架"
        }, {
            "code": "detail",
            "name": "查看"
        }],
        i = 0,
        count = 0,
        len = mlist.length,
        elen = elist.length,
        menu = [];

    for (i; i < len; i++) {
        ((i) => {
            let rmax = parseInt((Math.random() * elen).toString(), 10),
                tempi = parseInt((i + 1).toString(), 10),
                id = tempi * 10,
                j = 0,
                mitem = _copyItem({
                    size: 1,
                    list: mlist.slice(i, tempi)
                })[0],
                pitem = _copyItem({
                    list: plist
                }).concat(_copyItem({
                    list: elist.slice(0, rmax)
                })),
                slen = pitem.length;


            mitem['id'] = id;
            /*设置默认权限*/
            for (j; j < slen; j++) {
                count++;
                pitem[j]['id'] = id;
                pitem[j]['prid'] = count;
                pitem[j]['isPermit'] = flag ? parseInt((Math.random() * 10).toString(), 10) % 2 : 1;
            }
            mitem['permitItem'] = pitem;
            menu.push(mitem);
        })(i);
    }
    return menu;
}

/*通用私有方法--复制数组对象*/
function _copyItem(config) {
    let size = config.size,
        list = config.list,
        arr = [],
        k = 0;

    /*没有复制长度，则穿件新长度*/
    if (typeof size === 'undefined') {
        size = list.length;
    }

    /*默认为扩展对象*/
    for (k; k < size; k++) {
        let obj = {},
            item = list[k],
            m;
        for (m in item) {
            obj[m] = item[m];
        }
        arr.push(obj);
    }
    return arr;
}



/*公用接口--生成集合*/
test.getMap = function (config) {
    return _generateMap(config);
};

/*公用接口--生成集合*/
test.getResult=function (datalist, config) {
    return _generateResult(datalist, config);
};

/*公用接口--生成范围*/
test.getLimit=function (config) {
    return _generateLimit(config);
};

/*公用接口--生成正则值*/
test.getRule=function (str) {
    return _generateRule(str);
};

/*测试接口--普通*/
test.test=function (config) {
    return _generateResult(_generateMap(config), config);
};

/*测试接口--生成凭证*/
test.testToken=function (type) {
    let res,
        token = Mock.mock({
            "id": RULE_CONFIG.test_id,
            "token": RULE_CONFIG.test_token,
            "adminId": RULE_CONFIG.test_id,
            "organizationId": RULE_CONFIG.test_id,
            "organizationName": RULE_CONFIG.test_name
        });

    if (type) {
        if (type === 'list') {
            res = {
                message: 'ok',
                code: 0,
                result: token
            };
        } else if ('table') {
            res = {
                status: 200,
                data: {
                    message: 'ok',
                    code: 0,
                    result: token
                }
            };
        } else {
            res = {
                status: 200,
                data: {
                    message: 'ok',
                    code: 0,
                    result: token
                }
            };
        }
    } else {
        res = {
            status: 200,
            data: {
                message: 'ok',
                code: 0,
                result: token
            }
        };
    }
    return res;
};

/*测试接口--菜单*/
test.testMenu=function (config) {
    let menuobj = {};

    /*是否生成菜单*/
    if (config && config.create) {
        if (config.israndom === true) {
            /*是否开启随机设置模式*/
            menuobj['menu'] = _createMenu(true);
        } else {
            menuobj['menu'] = _createMenu(false);
        }
    } else {
        menuobj['menu'] = RULE_CONFIG.test_menu.slice(0);
        /*是否随机设置*/
        if (config && config.israndom === true) {
            /*是否开启随机设置模式*/
            let menuarray = menuobj['menu'],
                len = menuarray.length,
                i = 0;

            for (i; i < len; i++) {
                let menuitem = menuarray[i]['permitItem'],
                    sublen = menuitem.length,
                    j = 0;
                for (j; j < sublen; j++) {
                    menuitem[j]['isPermit'] = parseInt((Math.random() * 10).toString(), 10) % 2;
                }
            }
        }
    }


    /*是否随机设置*/
    /*if (config && config.israndom === true) {
     /!*var i = 0,
     menuitem,
     sublen,
     j;
     for (i; i < len; i++) {
     var menuitem = menu[i]['permitItem'],
     sublen = menuitem.length,
     j = 0;
     for (j; j < sublen; j++) {
     menuitem[j]['isPermit'] = parseInt(Math.random() * 10, 10) % 2;
     }
     }*!/
     _doMenuItem_(menuobj, true);
     } else {
     _doMenuItem_(menuobj, false);
     }*/
    return {
        status: 200,
        data: {
            code: "0",
            message: "查询成功",
            result: menuobj
        }
    };
};

/*测试接口--请求成功*/
test.testSuccess=function (type) {
    let res;

    if (type) {
        if (type === 'list') {
            res = {
                status: 200,
                message: 'ok',
                code: 0,
                count: 50,
                result: {}
            };
        } else if ('table') {
            res = {
                status: 200,
                data: {
                    message: 'ok',
                    code: 0,
                    count: 50,
                    result: {}
                }
            };
        } else {
            res = {
                status: 200,
                data: {
                    message: 'ok',
                    code: 0,
                    count: 50,
                    result: {}
                }
            };
        }
    } else {
        res = {
            status: 200,
            data: {
                message: 'ok',
                code: 0,
                count: 50,
                result: {}
            }
        };
    }
    return res;
};

export default test;