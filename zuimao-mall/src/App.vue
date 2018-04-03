<template>
  <div id="app">
    <v-header></v-header>
    <div class="content">
      <router-view></router-view>
      <v-footer v-show="isShowFooter"></v-footer>
    </div>
  </div>
</template>
<script>
import header from './components/header/header.vue'
import footer from './components/footer/footer.vue'
import {mapState} from 'vuex'
export default {
  name: 'app',
  components: {
    'v-header': header,
    'v-footer': footer
  },
  computed: mapState(['isShowFooter']),
  watch: {
    $route(to, from) {
      if (to.path.indexOf('home') !== -1) {
        this.$store.dispatch('showFooter');
      } else {
        this.$store.dispatch('hideFooter');
      }
    }
  }
}
</script>

<style lang="scss">
@import './common/iconfont/iconfont.css';
@import './assets/css/reset.css';
@import './common/sass/global.scss';
html {
    font-size: 75px;
    min-width: 320px;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.content{
 margin-top: 1.066667rem;
}
</style>
