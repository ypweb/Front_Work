/*导入样式*/
import './assets/css/index.css';
import './assets/css/vue2-animate.min.css';

import Vue from 'vue'/*导入vue核心库*/
import App from './App'/*导入主容器*/
import router from './router'/*导入路由*/




Vue.config.productionTip = false;/*开发提示*/



/*创建vue实例,应用导出的主应用*/
new Vue({
  el: '#app_main',/*挂载点*/
  router,/*路由配置*/
  components: { App },/*子组件*/
  template: '<App></App>'/*模板*/
})

