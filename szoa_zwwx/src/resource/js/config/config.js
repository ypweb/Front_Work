/**
 * require.config()接受一个配置对象，这个对象除了有前面说过的paths属性之外，
 * 还有一个shim属性，专门用来配置不兼容的模块。具体来说，每个模块要定义
 * （1）exports值（输出的变量名），表明这个模块外部调用时的名称；
 * （2）deps数组，表明该模块的依赖性。
 * */
require.config({
	urlArgs: "r=" + (new Date()).getTime(),
    baseUrl: "/zwwx/",
    paths: {
        /****************************公共外部插件****************************/
    	"Config":"resource/js/config/config",
    	"jquery": "resource/js/lib/jquery/jquery.min",
        "Swiper":"resource/js/lib/swiper/idangerous.swiper.min",
        "WX":"resource/js/lib/js_sdk",
        "weuiJS":"resource/js/lib/weui/js/jquery-weui.min",
        
        /****************************公共内部插件****************************/
        "Base":"resource/js/config/base",
        "CssBase":"resource/js/config/cssBase",
        "UrlBase":"resource/js/config/urlBase",
        "BaseCssDir":"resource/css",
        "util" :"resource/js/common/util",
        "rule" :"resource/js/common/rule",
        'tab_swiper': "resource/js/widget/tab_swiper",

        /****************************业务代码引入****************************/
        "HomeCtrl":"home/home",
        "WaitDocDetails":"app/feishidian/waitSign/waitdocDetails/waitDocDetails",
        "SignUpCtrl":"app/feishidian/haveSign/signUpMeeting/signUp",						//报名
        "ChangeSignUpInfoCtrl":"app/feishidian/haveSign/signUpMeeting/changeSignUpInfo",	//修改报名信息
        "ReturnDoc":"app/feishidian/waitSign/waitdocDetails/returnDoc",
        "WaitSignList":"app/feishidian/waitSign/signList/waitSignList",
        "DocHuiyiDetails":"app/feishidian/haveSign/docDetails/docHuiyiDetails",
        "ExchangeListCtrl":"app/shidian/exchangeList/exchangeList",
        "WaitDoDetails":"app/shidian/waitSign/waitDoDetails/waitDoDetails",
        "DaibanTryCtrl":"app/shidian/daibanTry/daibanTry",
        "SearchCtrl":"app/feishidian/search/searchHome/search",           //查询
        "DoDeptCtrl":"app/feishidian/search/searchHome/doDept",           //选择经办处室
        "DoPersonCtrl":"app/feishidian/search/searchHome/doPerson",       //选择经办人
        "waitSomeInfoCtrl":"app/shidian/waitSign/waitDocDetails/waitSomeInfo",
        "InitDataUtil":"app/shidian/waitSign/waitDoDetails/initDataUtil",
        "ChangeFollowDetails":"app/feishidian/changeFollow/changeFollowDetails/changeFollowDetails",
        "haveSignList":"app/feishidian/haveSign/signList/haveSignList",
        "signDoneList":"app/feishidian/signDone/signList/signDoneList",
        "waitHandleList":"app/shidian/waitHandle/waitHandleList/waitHandleList",
        "changeList":"app/feishidian/changeFollow/changeList/changeList",
        "searchResList":"app/feishidian/search/searchResList/searchResList",
        "InterfaceTryCtrl":"app/interfaceTry/interfaceTry",   //接口测试，无用
        "FirstButtonAction":"app/shidian/waitSign/waitDoDetails/firstButtonAction",//首期按钮功能开发
        "SendOutCtrl":"app/shidian/waitSign/waitDoDetails/sendOut",  //送出新页面开发

        /****************************CSS引入****************************/
        "HomeCss":"home/home",   //home.css 前台引用方式 css!HomeCss
        "ChangeCss":"app/feishidian/css/change",
        "SignCss":"app/feishidian/css/sign",
        "HandleCss":"app/shidian/css/handle"
    },
    map: {
    	 '*': {
             'css': 'resource/js/lib/require/plugin/require-css/css'
         }
    },
    shim: {
        'weuiJS':{
            deps:['jquery']
        },
    }
});