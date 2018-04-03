import Vue from 'vue'
import App from './App'
import router from './router'
import flexible from 'lib-flexible'
import axios from 'axios'
import VueAxios from 'vue-axios'
import store from './store'
Vue.config.productionTip = false
Vue.use({axios, VueAxios})
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
