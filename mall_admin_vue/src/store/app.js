import Tool from './../libs/tool';
import axios from 'axios';

export default {
    namespaced: true,
    state: {
        debug: true, /*测试模式*/
        issupport: (Tool.supportImage && Tool.supportStorage && Tool.supportBox()), /*是否兼容*/
        islogin: false, /*是否登录*/
        isfzf: false/*是否路径正确即是否404错误*/
    },
    getters: {},
    mutations: {
        /*更换登录*/
        changeLogin(state, flag) {
            /*登录成功时进行持久保存*/
            if (flag) {
                let systemkey = Tool.getSystemUniqueKey(),
                    cache = Tool.getParams(systemkey);
                /*如果不存在缓存则创建缓存*/
                if (cache === null) {

                }
            }else{
                /*清空缓存*/
                Tool.clear();
            }
            state.islogin = flag;
        },
        /*更换兼容*/
        changeSupport(state, flag) {
            state.issupport = flag;
            if (!flag) {
                /*不兼容状态下需清除推出缓存*/
                Tool.clear();
                state.islogin = false;
            }
        },
        changeFZF(state, flag) {
            state.isfzf = flag;
        }
    },
    actions: {

    }
};