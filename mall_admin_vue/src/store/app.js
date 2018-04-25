import Tool from './../libs/tool';
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
            /*登录成功时进行持久保存*/
            if (flag) {
                if (state.cache === null) {
                    /*如果不存在缓存则创建缓存*/
                } else {
                    /*如果存在缓存需要判断缓存是否有效，有效则更新缓存,失效则清空重新创建*/
                    let logininfo = this.commit('validLogin');
                    if (logininfo) {

                    } else {
                        /*清空缓存*/
                        this.commit('clear');
                    }
                }
            } else {
                /*清空缓存*/
                this.commit('clear');
            }
            state.islogin = flag;
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

            }else{
                
            }
        },
        /*清空缓存*/
        clear(state) {
            /*清空缓存*/
            Tool.clear();
            state.cache = null;
        }
    },
    actions: {}
};