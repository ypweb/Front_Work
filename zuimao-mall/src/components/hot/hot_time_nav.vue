<template>
  <div class="fixed-wrap">
    <swiper ref="hot-time-nav" id="hot-time-nav" class="swiper-wrapper hot-time-nav" :options="swiperOption">
      <swiper-slide class="nav-item">
          <i class="time">昨日</i>
          <span class="statu">别错过</span>
      </swiper-slide>
      <swiper-slide class="nav-item">
          <i class="time">20:00</i>
          <span class="statu">昨日精选</span>
      </swiper-slide>
      <swiper-slide class="nav-item">
          <i class="time">21:00</i>
          <span class="statu">昨日精选</span>
      </swiper-slide>
      <swiper-slide class="nav-item">
          <i class="time">09:00</i>
          <span class="statu">抢购中</span>
      </swiper-slide>
      <swiper-slide class="nav-item">
          <i class="time">10:00</i>
          <span class="statu">抢购中</span>
      </swiper-slide>
      <swiper-slide class="nav-item">
          <i class="time">11:00</i>
          <span class="statu">抢购中</span>
        </swiper-slide>
      <swiper-slide class="nav-item">
          <i class="time">12:00</i>
          <span class="statu">抢购中</span>
        </swiper-slide>
      <swiper-slide class="nav-item">
          <i class="time">14:00</i>
          <span class="statu">抢购中</span>
        </swiper-slide>
      <swiper-slide class="nav-item">
          <i class="time">16:00</i>
          <span class="statu">抢购中</span>
        </swiper-slide>
      <swiper-slide class="nav-item">
          <i class="time">19:00</i>
          <span class="statu">抢购中</span>
        </swiper-slide>
      <swiper-slide class="nav-item">
          <i class="time">20:00</i>
          <span class="statu">抢购中</span>
        </swiper-slide>
      <swiper-slide class="nav-item">
          <i class="time">21:00</i>
          <span class="statu">抢购中</span>
        </swiper-slide>
      <swiper-slide class="nav-item">
          <img class="tomorrow" src="./../../assets/images/tomorrow.png">
      </swiper-slide>
    </swiper>
  </div>
</template>
<script type="text/javascript">
import { swiper, swiperSlide } from 'vue-awesome-swiper'
import topNavfixed from '../../assets/js/navfixed.js'
export default {
  data () {
    return {
      swiperOption: {
        autoplay: 0,
        slidesPerView: 5,
        centeredSlides: true,
        spaceBetween: 20,
        initialSlide: this.$store.state.activeIndex,
        direction: 'horizontal',
        onSlideChangeEnd: this.getTimeIndex
      }
    }
  },
  components: {
    'swiper': swiper,
    'swiper-slide': swiperSlide
  },
  methods: {
    getTimeIndex: function() {
      this.$nextTick(function() {
        this.$store.commit({
          type: 'updateTimeIndex',
          activeIndex: this.$refs['hot-time-nav'].swiper.activeIndex
        })
        this.current = this.$refs['hot-time-nav'].swiper.activeIndex;
        // 触发事件updateTimeIndex, 调用hot组件中的get_hot_products()
        this.$emit('updateTimeIndex', this.current);
        // console.log(this.$store.state.products)
      })
    }
  },
  mounted () {
    this.$nextTick(function () {
      let hotTimeNav = this.$refs['hot-time-nav'].$el;
      topNavfixed.topNavfixed(hotTimeNav);
    })
  },
  watch: {
  }
}
</script>
<style lang="scss">
@import './../../common/sass/global.scss';
@import './../../common/swiper-3.4.2.min.css';
.fixed-wrap{
  height: calc(1.16rem + 3px);
  width: 100%;
}
.hot-time-nav
{
    z-index: 999;
    overflow: hidden;
    background-color: #fff;
    height: calc(1.16rem + 3px);
    .swiper-slide-active
    {
      color: $primarycolor;
      border-bottom: 3px solid $primarycolor;
    }
    .nav-item
    {
        @include ver_center;
        height: 1.16rem;
        text-align: center;
        color: #4d4d4d;
        flex-direction: column;
      .tomorrow
      {
        width: 1.76rem;
      }
      .time
      {
        @include font-dpr(12px);
        font-weight: bold;
      }
      .statu
      {
        @include font-dpr(10px);
      }
    }
}

</style>
