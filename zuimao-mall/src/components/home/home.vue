<template>
  <div>
    <swiper class="nav-menu" :options="swiperOption">
      <swiper-slide class="menu-item"><router-link to="/home/hot">进口红酒</router-link></swiper-slide>
      <swiper-slide class="menu-item"><router-link to="/home/other">进口红酒</router-link></swiper-slide>
      <swiper-slide class="menu-item"><router-link to="/home/other">进口红酒</router-link></swiper-slide>
      <swiper-slide class="menu-item"><router-link to="/home/other">进口红酒</router-link></swiper-slide>
      <swiper-slide class="menu-item"><router-link to="/home/other">进口红酒</router-link></swiper-slide>
      <swiper-slide class="menu-item"><router-link to="/home/other">进口红酒</router-link></swiper-slide>
    </swiper>
    <router-view></router-view>
  </div>
</template>
<style lang="scss">
@import './../../common/sass/global.scss';
@import './../../common/swiper-3.4.2.min.css';
.nav-menu
{
    width: 100%;
  .menu-item
    {
      @include font-dpr(12px);
      width: 20%;
      text-align: center;
      a
      {
        line-height: 1.2rem;

        display: inline-block;

        padding: 0 .133333rem;

        text-align: center;

        color: #4b4b4b;
      }
      .router-link-active
      {
        color: $primarycolor;
        border-bottom: 3px solid $primarycolor;
      }
    }
}
</style>
<script type="text/javascript">
  import { swiper, swiperSlide } from 'vue-awesome-swiper'
  import {mapState} from 'vuex'
  export default {
    data() {
      return {
        swiperOption: {
          autoplay: 0,
          slidesPerView: 'auto',
          direction: 'horizontal'
        }
      }
    },
    components: {
      'swiper': swiper,
      'swiper-slide': swiperSlide
    },
    computed: mapState(['isShowNav']),
    watch: {
      $route(to, from) {
        if (to.path.indexOf('home') !== -1) {
          this.$store.dispatch('showNav');
          // this.$store.dispatch('showFooter');
        } else {
          this.$store.dispatch('hideNav');
          // this.$store.dispatch('hideFooter');
        }
      }
    }
  }
</script>
