<template>
  <div>
    <v-focus :focuses='this.$store.state.focuses'></v-focus>
    <v-adv></v-adv>
    <hot-time-nav @updateTimeIndex="get_hot"></hot-time-nav>
    <onsale :onsale='this.$store.state.onsale'></onsale>
    <v-products :products='this.$store.state.products'></v-products>
  </div>
</template>
<script type="text/javascript">
import focus from '../focus/focus.vue'
import adv from '../adv/adv.vue'
import hot_time_nav from './hot_time_nav.vue'
import c_products from '../products/products.vue'
import onsale from './onsale.vue'
import Vue from 'vue'
export default {
  data () {
    return {
    }
  },
  components: {
    'v-focus': focus,
    'v-adv': adv,
    'hot-time-nav': hot_time_nav,
    'v-products': c_products,
    'onsale': onsale
  },
  methods: {
    get_hot: function() {
      this.get_hot_products();
      this.get_onsale();
    },
    get_hot_products: function() {
      this.$nextTick(function() {
        this.$store.commit({
          type: 'updateProducts',
          productsAPI: '../../static/products.json'
        })
      })
    },
    get_onsale: function() {
      this.$nextTick(function() {
        this.$store.commit({
          type: 'updateOnsale',
          onsaleAPI: '../../static/onsale.json'
        })
      })
    }
  },
  created() {
    this.$nextTick(function() {
      this.$store.commit({
        type: 'updateFocus',
        focusAPI: '../../static/focuses.json'
      });
      this.$store.commit({
        type: 'updateOnsale',
        onsaleAPI: '../../static/onsale.json'
      });
      this.$store.commit({
        type: 'updateTitle',
        title: '醉猫商城'
      })
    })
  }
}
</script>
