import Tool from './../libs/tool';
import Test from './../libs/test';
import moment from './../../node_modules/moment';
import axios from 'axios';

export default {
    namespaced: true,
    state: {
        debug: true, /*测试模式*/
        issupport: (Tool.supportImage && Tool.supportStorage && Tool.supportBox()), /*是否兼容*/
        islogin: false, /*是否登录*/
        isfzf: false/*是否路径正确即是否404错误*/,
        cache: Tool.getParams(Tool.getSystemUniqueKey())/*缓存信息*/
    },
    getters: {},
    mutations: {
        /*更换登录*/
        changeLogin(state, flag) {
            if (!flag) {
                /*清空缓存*/
                this.commit('clear');
            }
            state.islogin = flag;
        },
        /*判断登录*/
        isLogin(state, flag) {
            /*登录成功时进行持久保存*/
            state.islogin = flag;
            if (flag) {
                if (state.cache === null) {
                    /*如果不存在缓存则创建缓存*/
                } else {
                    /*如果存在缓存需要判断缓存是否有效，有效则更新缓存,失效则清空重新创建*/
                    let logininfo = this.commit('validLogin');
                    if (!logininfo) {
                        /*清空缓存*/
                        this.commit('clear');
                    } else {
                        /*登录并持久化保存数据*/
                    }
                }
            } else {
                /*清空缓存*/
                this.commit('clear');
            }
            return flag;
        },
        /*更换兼容*/
        changeSupport(state, flag) {
            state.issupport = flag;
            if (!flag) {
                /*不兼容状态下需清除推出缓存*/
                this.commit('clear');
                state.islogin = false;
            }
        },
        changeFZF(state, flag) {
            state.isfzf = flag;
        },
        /*校验缓存是否有效*/
        validLogin(state) {
            if (state.cache !== null) {
                /*存在缓存*/
                let login_dt = state.cache.datetime;
                if (!login_dt) {
                    /*非法时间*/
                    return false;
                }
                login_dt = login_dt.replace(/\s*/g, '').split('|');

                let login_rq = login_dt[0],
                    login_sj = login_dt[1],
                    now = moment().format('YYYY-MM-DD|HH:mm:ss').split('|'),
                    now_rq = now[0],
                    now_sj = now[1];

                /*判断日期*/
                if (login_rq !== now_rq) {
                    //同一天有效
                    return false;
                } else if (login_rq === now_rq) {
                    login_sj = login_sj.split(':');
                    now_sj = now_sj.split(':');
                    let login_hh = parseInt(login_sj[0], 10),
                        now_hh = parseInt(now_sj[0], 10);

                    if (now_hh - login_hh > 2) {
                        /*超过2个小时退出*/
                        return false;
                    }
                }
            } else {
                /*不存在缓存*/
                return false;
            }
        },
        /*设置缓存*/
        setCache(state, data) {
            if (state.cache !== null) {
                state.cache.loginMap = data;
            } else {
                state.cache = {
                    cacheMap: {},
                    routeMap: {
                        prev: '',
                        current: ''
                    },
                    moduleMap: {},
                    menuMap: {},
                    powerMap: {},
                    loginMap: data,
                    settingMap: {},
                    tempMap: {}
                };
            }
            Tool.setParams(Tool.getSystemUniqueKey(), state.cache);
        },
        /*清空缓存*/
        clear(state) {
            /*清空缓存*/
            Tool.clear();
            state.cache = null;
        }
    },
    actions: {
        /*请求登录*/
        /*data: {
                    username: rootState.login_store.state.formLogin.username_mall,
                    password: rootState.login_store.state.formLogin.passwd,
                    identifyingCode: rootState.login_store.state.formLogin.validcode_mall
                }*/
        requestLogin(store) {
            console.log('aaaa');
            let self = this;
            const {commit, dispatch, state, rootState} = store;
            console.log('bbbb');
            /*解构赋值*/
            /*console.log(Tool.adaptReqUrl('/mall-buzhubms-api/sysuser/login', false, state.debug));
            return false;*/
            axios.post({
                url: Tool.adaptReqUrl('/mall-buzhubms-api/sysuser/login', false, state.debug),
                dataType: 'json',
                data: {
                    username: rootState.login_store.formLogin.username_mall,
                    password: rootState.login_store.formLogin.passwd,
                    identifyingCode: rootState.login_store.formLogin.validcode_mall
                }
            }).then(resp => {
                console.log('cccc');
                if (state.debug) {
                    let resp = Test.testSuccess('list');
                    resp['result'] = Test.getMap({
                        map: {
                            grade: 'rule,-1,1,2',
                            adminId: 'id',
                            roleId: 'id',
                            token: 'guid'
                        },
                        maptype: 'object'
                    }).list;
                }

                let data = resp.data,
                    status = parseInt(resp.status, 10);
                console.log('dddd');
                if (status === 200) {
                    let code = parseInt(data.code, 10),
                        result = data.result,
                        message = data.message;
                    if (code !== 0) {
                        if (typeof message !== 'undefined' && message !== '') {
                            rootState.login_store.message = message;
                        } else {
                            rootState.login_store.message = '登录失败';
                        }
                        self.commit('changeLogin', false);
                        return false;
                    } else {
                        /*设置缓存*/
                        self.commit('setCache', {
                            'isLogin': true,
                            'datetime': moment().format('YYYY-MM-DD|HH:mm:ss'),
                            'reqdomain': '',
                            'username': rootState.login_store.formLogin.username_mall,
                            'param': {
                                'adminId': encodeURIComponent(result.adminId),
                                'token': encodeURIComponent(result.token),
                                'organizationId': encodeURIComponent(result.organizationId),
                                'organizationName': encodeURIComponent(result.organizationName || '')
                            }
                        });
                        rootState.login_store.message = '登录成功';
                        self.commit('changeLogin', true);
                        /*清除掉登录数据
                        todo
                        */
                        return true;
                    }
                }
            }).catch(error => {
                rootState.login_store.message = '登录成功';
                console.log(error);
            })
        }
    }
};