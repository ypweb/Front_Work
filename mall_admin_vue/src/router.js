import Vue from 'vue'
import VueRouter from 'vue-router'

/*使用路由*/
Vue.use(VueRouter);

/*路由配置*/
const routeObj={
    mode:'history',
    routes:[{
        path: '/',
        meta: {
            title: ''
        },
        component: (resolve) => require(['./views/index.vue'], resolve)
    }]
};
/*导出路由*/
export default new VueRouter(routeObj);