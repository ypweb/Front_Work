<template>
  <div id="admin_container">
    <!--兼容视图-->
    <template v-if="isSupport">
      <!--是否登录-->
      <template v-if="isLogin">
        <ch-container-panel></ch-container-panel>
      </template>
      <!--未登录-->
      <template v-else>
        <ch-login-panel></ch-login-panel>
      </template>
    </template>
    <!--非兼容视图-->
    <template v-else>
      <ch-support-panel></ch-support-panel>
    </template>
  </div>
</template>
@import "layout/support_construct.less";
<script>
  /*导入组件*/
  import ch_support_panel from './components/layout/support_panel'
  import ch_login_panel from './components/layout/login_panel'
  import ch_container_panel from './components/layout/container_panel'
  import ch_ftf_panel from './components/layout/ftf_panel'

export default {
  name: 'App',
  data(){
    return {
      isSupport:false,
      isLogin:true
    }
  },
  components:{
    'ch-support-panel':ch_support_panel,
    'ch-login-panel':ch_login_panel,
    'ch-container-panel':ch_container_panel,
    'ch-ftf-panel':ch_ftf_panel
  }

}
</script>

