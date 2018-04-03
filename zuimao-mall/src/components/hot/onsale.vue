<template>
  <div class="onsale">
    <router-link class="onsale-main" :to="'/detail/'+onsale.onsale_main.pro_id">
        <span class="arrow"></span>
        <img :src="onsale.onsale_main.img_src"/>
    </router-link>
    <swiper id="onsale-list" class="swiper-container onsale-list" :options="swiperOption">
      <swiper-slide v-for="pro in onsale.onsale_pro">
        <router-link :to="'/detail/'+pro.pro_id" class="onsale-pro">
          <img :src="pro.img_src" alt="">
          <div class="onsale-price">
              <span class="ori-price icon-yen">{{ pro.price }}</span>
              /
              <span class="earn icon-zhuan">{{ pro.own }}</span>
          </div>
        </router-link>
      </swiper-slide>
    </swiper>
  </div>
</template>
<script type="text/javascript">
  import { swiper, swiperSlide } from 'vue-awesome-swiper'
  export default {
    data () {
      return {
        swiperOption: {
          slidesPerView: '3',
          direction: 'horizontal',
          resistance: false,
          slidesPerGroup: 3,
          spaceBetween: 5
        }
      }
    },
    props: [
      'onsale'
    ],
    components: {
      'swiper': swiper,
      'swiper-slide': swiperSlide
    }
  }
</script>
<style lang="scss">
@import './../../common/sass/global.scss';
.onsale {
    background-color: #fff;
    .onsale-list {
      .onsale-pro {
          font-size: 0;

          display: inline-block;

          vertical-align: bottom;
          img {
            width: 3.333333rem;
            height: 3.333333rem;
          }
          .onsale-price {
              @include font-dpr(14px);

              padding: .133333rem 0;

              text-align: center;

              color: #999;
              .icon-yen:before,
              .icon-zhuan:before {
                  @include font-dpr(12px);
                  margin-right: 5px;
                  margin-left: 5px;
              }
              .ori-price {
                  color: #4d4d4d;
              }
              .earn {
                  color: $primarycolor;
              }
          }
      }
    }
    .onsale-main {
        font-size: 0;

        position: relative;

        width: 10.0rem;
        height: 4.533333rem;
        img {
            width: 100%;
        }
        .arrow {
            position: absolute;
            bottom: 0;
            left: calc(50% - .133333rem);

            width: .266667rem;
            height: .16rem;

            background-image: url('../../assets/images/arrow.png');
            background-repeat: no-repeat;
            background-size: .266667rem .16rem;
        }
    }
}
</style>
