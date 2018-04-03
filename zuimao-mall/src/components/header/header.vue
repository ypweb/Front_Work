<template>
    <div class="header">
        <div class="header-warpper">
            <router-link to="/invite" class="nav-wrap-left icon icon-user">
            </router-link>
            <div class="centermenu">
                <i>{{ this.$store.state.title }}</i>
            </div>
            <router-link to="/searchMenu" class="nav-wrap-right icon icon-search">
            </router-link>
        </div>
    </div>
</template>

<script>
export default {

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
@import './../../common/sass/global.scss';
.header
{
    position: fixed;
    z-index: 10;
    top: 0;
    right: 0;
    left: 0;
    height: 1.066667rem;
    margin: 0 auto;
    background: $primarycolor;
    .header-warpper
    {
        position: relative;

        display: flex;

        height: 100%;

        text-align: center;

        background: $primarycolor;

        align-items: center;
        justify-content: space-between;
        .icon
        {
            width: 0.666667rem;
            @include font-dpr(18px);
            color: #fff;
            line-height: 1.066667rem;
            padding: 0 .133333rem;
        }
        .nav-wrap-left,
        .nav-wrap-right
        {
            position: absolute;
        }
        .nav-wrap-right
        {
            right: 0;
        }
        .nav-wrap-left
        {
            left: 0;
        }
        .centermenu
        {
            display: block;
            @include font-dpr(18px);

            text-align: center;
            flex: 1;
            i
            {
                color: #eee;
            }
        }
    }
}
</style>
