/*导入相关组件*/
import Vue from 'vue';
import iView from 'iview';
import router from './router';
/*import Tool from './libs/tool';*/
import Util from './libs/util';
import App from './app.vue';
import store from './store';

/*导入iview样式*/
import 'iview/dist/styles/iview.css';

/*导入自定义扩展less*/
import './less/base.less';


/*使用iview*/
Vue.use(iView);



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



/*启动应用*/
new Vue({
    el: '#app_main',
    router: router,
    store: store,
    render: h => h(App)
});