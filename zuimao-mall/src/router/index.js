import Vue from 'vue'
import Router from 'vue-router'
import invite from './../components/invite/invite'
import search_menu from './../components/search_menu/search_menu'
import detail from './../components/detail/detail'
import home from './../components/home/home'
import hot from './../components/hot/hot'
import other from './../components/other/other'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/home/hot'
    },
    {
      path: '/home',
      redirect: '/home/hot'
    },
    {
      path: '/home',
      component: home,
      children: [
        {
          path: '/home/hot',
          name: 'hot',
          component: hot
        },
        {
          path: '/home/other',
          component: other
        }
      ]
    },
    {
      path: '/invite',
      component: invite
    },
    {
      path: '/search_menu',
      component: search_menu
    },
    {
      path: '/detail/:pro_id',
      component: detail
    }
  ]
})
