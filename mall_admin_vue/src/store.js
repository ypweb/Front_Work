import Vue from 'vue';
import Vuex from 'vuex';

/*app数据*/
import app_store from './store/app';
/*登录数据*/
import login_store from './store/login';

Vue.use(Vuex);

/*数据管理*/
const storeObj = {
    modules:{
        app_store:app_store/*布局面板数据*/,
        login_store:login_store/*登录数据*/
    }
};


export default new Vuex.Store(storeObj);