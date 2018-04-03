<template>
  <div class="header-wrap" id="header_wrap">
    <div class="header-content">
      <div class="header-logo"></div>
      <div class="header-btn" v-on:click="toggleMiniView()"></div>
      <ul class="header-menu" v-bind:class="mediaView.isMobile ?'':'g-d-showi'">
        <router-link tag="li" v-for="(hitem,index) in headeritem" v-bind:to="hitem.href" replace
                     active-class="menu-active">
          <a>{{hitem.text}}</a>
        </router-link>
      </ul>
      <!--v-bind:class="mediaView.isMobile?'':'g-d-showi'"-->
    </div>
  </div>
</template>

<script>
  export default {
    name: 'cc_header',
    data() {
      return {
        headeritem: [{
          text: '首页',
          href: '/index',
        }, {
          text: '功能模块',
          href: '/product',
        }, {
          text: '新闻资讯',
          href: '/news',
        }, {
          text: '场景展示',
          href: '/scene',
        }, {
          text: '联系我们',
          href: '/contact',
        }],
        mediaView: {
          isMobile: false,
          viewWidth: 1200
        }
      }
    },
    mounted() {
      let self = this;
      /*初始化渲染*/
      this.viewRender();
      /*绑定滚动条*/
      window.addEventListener('resize',function () {
        self.viewRender();
      });
    },
    methods: {
      /*视口参数*/
      getView() {
        return document.querySelector('body').offsetWidth;
      },
      /*初始化*/
      viewRender() {
        let width = this.getView();
        if (width <= this.mediaView.viewWidth) {
          this.mediaView.isMobile = true;
        } else {
          this.mediaView.isMobile = false;
        }
      },
      /*切换手机模式*/
      toggleMiniView() {
        this.mediaView.isMobile = !this.mediaView.isMobile;
      }
    }
  }
</script>
