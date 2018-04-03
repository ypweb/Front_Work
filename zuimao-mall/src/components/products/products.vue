<template>
    <div class="product-list">
      <div v-for="pro in products" class="product ">
          <router-link :to="'/detail/'+pro.pro_id" class="product-img">
              <img :src="pro.img_src">
          </router-link>
          <div class="caption">
              <div class="pro-title">
                  <i :class="'icon-'+pro.tag"></i>
                  <b>{{ pro.pro_title }}</b>
              </div>
              <div class="price">
                  <span class="ori-price icon-yen">{{ pro.price }}</span>/<span class="earn icon-zhuan">{{ pro.own }}</span>
              </div>
              <div class="more">
                <span class="pcs">
                  库存{{ pro.stock }}
                </span>
                <div class="more-actions">
                    <i class="icon-put"></i>
                    <i class="icon-image"></i>
                    <i class="icon-report"></i>
                </div>
              </div>

          </div>
      </div>
    </div>
</template>
<script type="text/javascript">
  import Vue from 'vue'
  import axios from 'axios'
  import VueAxios from 'vue-axios'
  import scrollLoad from '../../assets/js/scrollLoad.js'
  Vue.use(VueAxios, axios)
  export default {
    data () {
      return {
        scrollTop: 0
      }
    },
    props: [
      'products'
    ],
    mounted() {
      let self = this;
      let sw = true;
      window.addEventListener('touchend', function() {
        console.log('ScrollTop', scrollLoad.getScrollTop());
        self.scrollTop = scrollLoad.getScrollTop();
        console.log('offsetHeight', scrollLoad.getVisibleHeight());
        console.log('ScrollHeight', scrollLoad.getScrollHeight());
        if (scrollLoad.getScrollTop() + scrollLoad.getVisibleHeight() >= scrollLoad.getScrollHeight() - 100) {
          self.$store.commit({
            type: 'loadMoreProducts',
            productsAPI: '../../static/products.json'
          })
        }
      })
    }
  }
</script>
<style lang="scss">
@import './../../common/sass/global.scss';
.product-list {
  background: #f4f4f4;
  .product {
    width: 100%;
    margin-bottom: 0.266667rem;
    background-color: #fff;
    .product-img {
        width: 10rem;
        height: 4.533333rem;
      &>img{
        width: 100%;
        height: 100%;
      }
    }
    .caption {
      @include font-dpr(16px);
      font-weight: bold;
      line-height: 1.5em;
      padding: 0.133333rem;
      color: #333;
      .pro-title{
        display: -webkit-box;
        display: -ms-flexbox;
        display: -webkit-flex;
        display:         flex;
        align-items: center;
        .icon-hot:before {
          color: $primarycolor;
          margin-right:5px;
        }
      }
      .price {
        @include font-dpr(16px);
        color: #999;
        .icon-yen:before,
        .icon-zhuan:before {
            @include font-dpr(13px);
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
      .more {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .pcs {
          @include font-dpr(12px);
          color: #ccc;
        }
        .more-actions {
            @include font-dpr(20px);

            display: flex;

            width: 30%;

            color: #333;

            justify-content: space-between;
        }
      }
    }
  }
}
</style>
