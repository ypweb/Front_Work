/*导入相关组件*/
import Vue from 'vue';
import iView from 'iview';
import VueRouter from 'vue-router';
import Routers from './router';
import Vuex from 'vuex';
import Tool from './libs/tool';
import Util from './libs/util';
import App from './app.vue';

/*导入iview样式*/
import 'iview/dist/styles/iview.css';

/*导入自定义扩展less*/
import './less/base.less';


/*使用路由*/
Vue.use(VueRouter);
/*使用vuex*/
Vue.use(Vuex);
/*使用iview*/
Vue.use(iView);



/*路由配置*/
const RouterConfig = {
    mode: 'history',
    routes: Routers
};
const router = new VueRouter(RouterConfig);

/*路由加载前*/
router.beforeEach((to, from, next) => {
    iView.LoadingBar.start();
    Util.title(to.meta.title);
    next();
});

/*路由加载后*/
router.afterEach(() => {
    iView.LoadingBar.finish();
    window.scrollTo(0, 0);
});

/*数据管理*/
const store = new Vuex.Store({
    state: {

    },
    getters: {

    },
    mutations: {

    },
    actions: {

    }
});


new Vue({
    el: '#app_main',
    router: router,
    store: store,
    render: h => h(App)
});