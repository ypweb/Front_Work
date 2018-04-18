<template>
    <div>
        <!--路径错误-->
        <template v-if="isFZF">
            <ch-panel-fzf></ch-panel-fzf>
        </template>
        <!--路径正确-->
        <template v-else>
            <template v-if="isSupport">
                <!--是否登录-->
                <template v-if="isLogin">
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
        data() {
            return {
                debug:true,/*测试模式*/
                isSupport: this.getSupport(),/*是否兼容*/
                isLogin: true,/*是否登录*/
                isFZF:false/*是否路径正确即是否404错误*/
            };
        },
        mounted() {

            /*let list=Mock.mock({
                'list|5-10': [{
                    'id|+1': 1
                }]
            });
            console.log(list);*/
        },
        beforeDestroy() {
        },
        methods: {
            /*判断是否兼容*/
            getSupport(){
                return Tool.supportImage && Tool.supportStorage && Tool.supportBox();
            }
        },
        components: {
            'ch-panel-support': ch_panel_support,
            'ch-panel-login': ch_panel_login,
            'ch-panel-container': ch_panel_container,
            'ch-panel-fzf': ch_panel_fzf
        }
    };
</script>