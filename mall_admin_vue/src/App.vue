<template>
  <div id="admin_container">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
  data(){
    return {
      isSupport:true,
      isLogin:true
    }
  },
  components:{
    'ac-login-panel':ac_login_panel,
    'ac-support-panel':ac_support_panel,
    'ac-container-panel':ac_container_panel,
    'ac-ftf-panel':ac_ftf_panel
  }

}
</script>

