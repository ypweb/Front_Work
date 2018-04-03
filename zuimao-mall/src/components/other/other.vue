<template>
  <div>
    <v-focus :focuses='this.$store.state.focuses'></v-focus>
    <v-adv></v-adv>
    <v-products :products='this.$store.state.products'></v-products>
  </div>
</template>
<script type="text/javascript">
import focus from '../focus/focus.vue'
import adv from '../adv/adv.vue'
import c_products from '../products/products.vue'
import Vue from 'vue'
export default {
  data () {
    return {
    }
  },
  components: {
    'v-focus': focus,
    'v-adv': adv,
    'v-products': c_products
  },
  methods: {
    get_hot_products: function() {
      this.$nextTick(function() {
        this.$store.commit({
          type: 'updateProducts',
          productsAPI: '../../static/products.json'
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
        type: 'updateTitle',
        title: '醉猫商城'
      })
    })
  }
}
</script>
