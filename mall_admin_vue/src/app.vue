<template>
    <div>
        <!--路径错误-->
        <template v-if="isfzf">
            <ch-panel-fzf></ch-panel-fzf>
        </template>
        <!--路径正确-->
        <template v-else>
            <template v-if="issupport">
                <!--是否登录-->
                <template v-if="islogin">
                    <ch-panel-container></ch-panel-container>
                </template>
                <!--未登录-->
                <template v-else>
                    <ch-panel-login></ch-panel-login>
                </template>
            </template>
            <!--非兼容视图-->
            <template v-else>
                <ch-panel-support></ch-panel-support>
            </template>
        </template>
    </div>
</template>
<script>
    /*导入脚本*/
    import Tool from './libs/tool';
    import Mock from 'mockjs';

    /*导入组件*/
    import ch_panel_support from './views/panel/support'
    import ch_panel_login from './views/panel/login'
    import ch_panel_container from './views/panel/container'
    import ch_panel_fzf from './views/panel/fzf'

    export default {
        data(){
            return this.$store.state.app_store
        },
        components: {
            'ch-panel-support': ch_panel_support,
            'ch-panel-login': ch_panel_login,
            'ch-panel-container': ch_panel_container,
            'ch-panel-fzf': ch_panel_fzf
        }
    };
</script>