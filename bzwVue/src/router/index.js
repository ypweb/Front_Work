import Vue from 'vue'
import Router from 'vue-router'


import cc_index from '@/components/page/index.vue'
import cc_product from '@/components/page/product.vue'
import cc_news from '@/components/page/news.vue'
import cc_scene from '@/components/page/scene.vue'
import cc_contact from '@/components/page/contact.vue'


Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'index',
      redirect:'/index'
    },{
      path: '/index',
      name: 'index',
      component:cc_index
    },{
      path: '/product',
      name: 'product',
      component:cc_product
    },{
      path: '/news',
      name: 'news',
      component:cc_news
    },{
      path: '/scene',
      name: 'scene',
      component:cc_scene
    },{
      path: '/contact',
      name: 'contact',
      component:cc_contact
    }
  ]
})
