/**
 * Created by zhuhao on 2018/8/31.
 */
define(function () {

    // http://m2151430a2.imwork.net:23490
    // 10.248.79.80:7005
    // 10.248.79.146:7005
    //项目部署访问路径
    var baseUrl = "http://10.248.79.80:7005";

    /***************************非试点：会议报名（已签收）页面地址相关*********************************/

        //转发会议页和已签收页url(会议报名和已签收是使用的同一套页面)
    var shareHuiYiUrl = baseUrl + "/zwwx/app/feishidian/haveSign/docDetails/views/docHuiyiDetails.html";
    //报名图标地址路径（自定义转发会议报名和已签收时使用）
    var baoMingIMGUrl = baseUrl + "/zwwx/resource/images/home/baoming.png";
    //修改会议报名地址（会议报名页面，修改已报名的报名表）
    var editBaoMing = "/zwwx/app/feishidian/haveSign/signUpMeeting/views/changeSignUpInfo.html";
    //新增报名（会议报名页面，点击报名按钮跳转报名页面）
    var addBaoMing = "/zwwx/app/feishidian/haveSign/signUpMeeting/views/signUp.html";

    /************************************非试点：待签收页面地址相关******************************************/

        //退文页面地址
    var tuiWen = "/zwwx/app/feishidian/waitSign/waitdocDetails/views/returnDoc.html";

    /****************************************试点：待办页面地址相关*****************************************/

        //转发待办页面url
    var shareDaiBan = baseUrl + "/zwwx/app/shidian/waitSign/waitDoDetails/views/waitDoDetails.html";
    //待办图标地址
    var daiBanIMGUrl = baseUrl + "/zwwx/resource/images/home/daiban.png";
    
    
    
    //跳转到待签收详情页
    var jumpWaitSignDetails = "/zwwx/app/feishidian/waitSign/waitdocDetails/views/waitDocDetails.html";
    //跳转到已签收详情页
    var jumpSignDoneDetails = "/zwwx/app/feishidian/haveSign/docDetails/views/docHuiyiDetails.html";
    //跳转到待办详情页
    var jumpWaitHandleDetails = "/zwwx/app/shidian/waitSign/waitDoDetails/views/waitDoDetails.html";
    //跳转到交换跟踪详情页
    var jumpExchangeDetails = "/zwwx/app/feishidian/changeFollow/changeFollowDetails/views/changeFollowDetails.html";    

    //跳转到待签收列表
    var jumpWaitSign = "/zwwx/app/feishidian/waitSign/signList/views/waitSignList.html";
    //跳转到报名列表
    var jumpHaveSign = "/zwwx/app/feishidian/haveSign/signList/views/haveSignList.html";
    //跳转到已签收列表
    var jumpSignDone = "/zwwx/app/feishidian/signDone/signList/views/signDoneList.html";
    //跳转到待办列表
    var jumpWaitHandle = "/zwwx/app/shidian/waitHandle/waitHandleList/views/waitHandleList.html";
    //跳转到交换跟踪列表
    var jumpExchange = "/zwwx/app/feishidian/changeFollow/changeList/views/changeList.html";
    //跳转到查询页面
    var jumpSearch = "/zwwx/app/feishidian/search/searchHome/views/search.html";
    //跳转查询后数据列表
    var jumpSearchResList = "/zwwx/app/feishidian/search/searchResList/views/searchResList.html";
    //跳转经办人选择
    var jumpSearchdoPerson = "/zwwx/app/feishidian/search/searchHome/views/doPerson.html";
    //跳转经办处室选择
    var jumpSearchdoDept = "/zwwx/app/feishidian/search/searchHome/views/doDept.html";

    //送出下一节点选择
    var jumpSendOut = "/zwwx/app/shidian/waitSign/waitDoDetails/views/sendOut.html";
    
    
    return {
        URL_SHARE_HUIYI: shareHuiYiUrl,
        URL_IMG_BAOMING: baoMingIMGUrl,
        URL_EDIT_BAOMING: editBaoMing,
        URL_ADD_BAOMING: addBaoMing,
        URL_TUIWEN: tuiWen,
        URL_SHARE_DAIBAN: shareDaiBan,
        URL_IMG_DAIBAN: daiBanIMGUrl,
        //跳转到列表页
        URL_JUMP_WAITSIGN:jumpWaitSign,
        URL_JUMP_HAVESIGN:jumpHaveSign,
        URL_JUMP_SIGNDONE:jumpSignDone,
        URL_JUMP_WAITHANDLE:jumpWaitHandle,
        URL_JUMP_EXCHANGE:jumpExchange,
        URL_JUMP_SEARCH:jumpSearch,
        //列表进入详情页
        URL_JUMP_WAITSIGNDETAILS:jumpWaitSignDetails,
        URL_JUMP_SIGNDONEDETAILS:jumpSignDoneDetails,
        URL_JUMP_WAITHANDLEDETAILS:jumpWaitHandleDetails,
        URL_JUMP_EXCHANGEDETAILS:jumpExchangeDetails,
        //查询
        URL_JUMP_SEARCHRESLIST:jumpSearchResList,
        URL_JUMP_SEARCHDOPERSON:jumpSearchdoPerson,
        URL_JUMP_SEARCHDODEPT:jumpSearchdoDept,
        URL_JUMP_SENDOUT:jumpSendOut,


    };
});