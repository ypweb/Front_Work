import Vue from 'vue';
import Vuex from 'vuex';

/*app数据*/
import app_store from './store/app';


//Vue.use(axios);
Vue.use(Vuex);

/*数据管理*/
const storeObj = new Vuex.Store({
    modules:{
        app_panel:app_store
    }
});


export default new Vuex.Store(storeObj);