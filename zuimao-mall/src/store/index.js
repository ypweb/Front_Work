import Vue from 'vue'
import Vuex from 'vuex'
import nowTimeIndex from '../assets/js/nowTimeIndex.js'
import axios from 'axios'
import VueAxios from 'vue-axios'
Vue.use(VueAxios, axios)
Vue.use(Vuex)
const store = new Vuex.Store({
  state: {
    activeIndex: nowTimeIndex.nowTimeIndex(),
    productsAPI: '../../static/products.json',
    products: [],
    focuses: [],
    onsale: Object.create(null),
    title: '醉猫商城',
    isShowNav: true,
    isShowFooter: true
  },
  mutations: {
    updateTimeIndex(state, payload) {
      state.activeIndex = payload.activeIndex;
    },
    updateProducts(state, payload) {
      axios.get(payload.productsAPI).then(res => {
        state.products = res.data.products[state.activeIndex];
      })
    },
    updateTitle(state, payload) {
      state.title = payload.title;
    },
    loadMoreProducts(state, payload) {
      axios.get(payload.productsAPI).then(res => {
        state.products = state.products.concat(res.data.products[state.activeIndex]);
      })
    },
    updateFocus(state, payload) {
      axios.get(payload.focusAPI).then(res => {
        state.focuses = res.data.focuses;
      })
    },
    updateOnsale(state, payload) {
      axios.get(payload.onsaleAPI).then(res => {
        state.onsale = res.data.onsale[state.activeIndex];
      })
    },
    showNav(state) {
      state.isShowNav = true;
    },
    hideNav(state) {
      state.isShowNav = false;
    },
    showFooter(state) {
      state.isShowFooter = true;
    },
    hideFooter(state) {
      state.isShowFooter = false;
    }
  },
  getters: {
    getProducts: state => state.products,
    getFocuses: state => state.focuses
  },
  actions: {
    showNav({commit}) {
      commit('showNav');
    },
    hideNav({commit}) {
      commit('hideNav');
    },
    showFooter({commit}) {
      commit('showFooter');
    },
    hideFooter({commit}) {
      commit('hideFooter');
    }
  },
  modules: {
    nowTimeIndex: nowTimeIndex
  }
})
export default store
