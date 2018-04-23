import Tool from './../libs/tool';

/*判断是否兼容*/
function isSupport() {
    return Tool.supportImage && Tool.supportStorage && Tool.supportBox();
}

export default {
    state: {
        debug: true, /*测试模式*/
        issupport: isSupport(), /*是否兼容*/
        islogin: false, /*是否登录*/
        isfzf: false/*是否路径正确即是否404错误*/
    },
    mutations: {},
    actions: {}
};