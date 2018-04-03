<template>
  <div id="app_container">
    <cc-header></cc-header>
    <transition v-bind:name="loadAnimate">
      <router-view></router-view>
    </transition>
    <cc-footer></cc-footer>
  </div>
</template>

<script>
  /*导入组件*/
  import cc_header from './components/layout/header.vue'
  /*头部*/
  import cc_footer from './components/layout/footer.vue'
  /*底部*/


  /*导出主应用*/
  export default {
    name: 'App',
    data(){
      return {
        loadAnimate:'bounce'
      }
    },
    components: {
      'cc-header': cc_header,
      'cc-footer': cc_footer
    },
    watch: {
      '$route'(to, from) {
        let effectstr='bounce,bounceLeft,bounceRight,bounceDown,bounceUp,fade,fadeDown,fadeUp,fadeDownBig,fadeUpBig,fadeLeft,fadeRight,fadeLeftBig,fadeRightBig,rotate,rotateDownLeft,rotateDownRight,rotateUpLeft,rotateUpRight,slide,slideLeft,slideRight,slideDown,slideUp,zoom,zoomLeft,zoomRight,zoomDown,zoomUp',
          effectlist = effectstr.split(','),
          len = effectlist.length,
          ways = Math.floor(Math.random() * len);
        /*{
            name: 'bounce',
            in: 'bounceLeft',
            out: 'bounceRight'
          }, {
            name: 'bounce',
            in: 'bounceDown',
            out: 'bounceUp'
          }, {
            name: 'fade',
            in: 'fadeDown',
            out: 'fadeUp'
          }, {
            name: 'fade',
            in: 'fadeDownBig',
            out: 'fadeUpBig'
          }, {
            name: 'fade',
            in: 'fadeLeft',
            out: 'fadeRight'
          }, {
            name: 'fade',
            in: 'fadeLeftBig',
            out: 'fadeRightBig'
          }, {
            name: 'rotate',
            in: 'rotateDownLeft',
            out: 'rotateDownRight'
          }, {
            name: 'rotate',
            in: 'rotateUpLeft',
            out: 'rotateUpRight'
          }, {
            name: 'slide',
            in: 'slideLeft',
            out: 'slideRight'
          }, {
            name: 'slide',
            in: 'slideDown',
            out: 'slideUp'
          }, {
            name: 'zoom',
            in: 'zoomLeft',
            out: 'zoomRight'
          }, {
            name: 'zoom',
            in: 'zoomDown',
            out: 'zoomUp'
          }*/

        this.loadAnimate = effectlist[ways];
      }
    }
  }
</script>
