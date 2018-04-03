<template>
    <div class="footer-nav">
      <router-link to="/home"><span class="iconfont icon-paiming"></span><p class="text-tit">排行榜</p></router-link>
      <router-link to="/home"><span class="iconfont icon-liaotian"></span><p class="text-tit">圈子</p></router-link>
      <router-link to="/home"><span class="iconfont icon-follow"></span><p class="text-tit">关注</p></router-link>
      <router-link  to="/home"class="current"><span class="iconfont icon-hongjiu"></span><p class="text-tit">红酒商城</p>
      </router-link>
      <router-link to="/home"><span class="iconfont icon-all-line"></span><p class="text-tit">活动</p></router-link>
      <router-link to="/home"><span class="iconfont icon-vip"></span><p class="text-tit">VIP</p></router-link>
      <router-link to="/home"><span class="iconfont icon-huiyuan-copy"></span><p class="text-tit">我的</p></router-link>
    </div>
</template>

<style lang='scss'>
  @import '../../common/sass/global.scss';
  @mixin bot-nav
  {
    position: fixed;
    bottom: 0;

    display: -webkit-box;
    display:    -moz-box;
    display: -ms-flexbox;
    display: flex;

    width: 100%;

    -webkit-box-pack: justify;
       -moz-box-pack: justify;
    -ms-flex-pack: justify;
    -webkit-box-align: center;
       -moz-box-align: justify;
    -ms-flex-align: center;
    justify-content: space-between;
    align-content: center;
    a
    {
        display: block;

        box-sizing: border-box;
        height: .8rem;

        text-align: center;

        -webkit-box-flex: 1;
           -moz-box-flex: 1;
        -webkit-flex: 1;
            -ms-flex: 1;
                flex: 1;
    }
}

.footer-nav
{
    z-index: 100;

    height: 1.28rem;

    border-top: 1px solid #eee;
    background: #fff;

    @include bot-nav;
    a
    {
        color: #c9c9c9;
        .iconfont
        {
            font-size: .64rem;
            line-height: .8rem;

            display: block;

            width: 100%;
            margin: 0;
            padding: 0;

            vertical-align: top;
            &:before
            {
                font-size: .64rem;
            }
        }
        .text-tit
        {
            @include font-dpr(12px);
        }
    }
    .current
    {
        color: $primarycolor;
        p
        {
            color: $primarycolor;
        }
    }
}
</style>
