/*引导入口*/

/*---导入样式---*/
require('!style-loader!css-loader!less-loader!./assets/less/base.less');




/*---导入组件和相关脚本资源---*/
import Vue from 'vue'/*导入vue核心库*/
import App from './App'/*导入主容器*/
import router from './router'/*导入路由*/


Vue.config.productionTip = false;/*开发提示*/


/*创建vue实例,应用导出的主应用*/
new Vue({
  el: '#admin_container',/*挂载点*/
  router,/*路由配置*/
  components: { App },/*子组件*/
  template: '<App></App>'/*模板*/
});
