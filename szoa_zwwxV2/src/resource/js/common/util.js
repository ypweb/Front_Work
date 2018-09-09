define([], function () {
    var getParams = function (key) {
        return JSON.parse(localStorage.getItem(key)) || null;
    };

    var setParams = function (key, value) {
        localStorage.setItem(key,JSON.stringify(value));
    };
    
    var removeParams = function (key) {
        localStorage.removeItem(key);
    };

    var getSessionParams = function (key) {
        return JSON.parse(sessionStorage.getItem(key)) || null;
    };

    var setSessionParams = function (key, value) {
        sessionStorage.setItem(key,JSON.stringify(value));
    };

    var removeSessionParams = function (key) {
        sessionStorage.removeItem(key);
    };

    function getHashData() {
        var dataStr = window.location.hash;
        if(dataStr.indexOf("?")!=-1){
            dataStr=dataStr.substring(0,dataStr.indexOf("?"));
        }
        dataStr=decodeURI(dataStr);
        if(!dataStr){
            return {};
        }
        dataStr=dataStr.split("#")[1];
        var arr = dataStr.split(",");
        var obj={};
        for (var i=0;i<arr.length;i++){
            var paramStr=arr[i];
            var paramArr=paramStr.split("=");
            obj[paramArr[0]]=paramArr[1];
        }
        return obj;
    }
    
    function getMsgHashData(hashStr) {
        var dataStr = hashStr;
        if(!dataStr){
            return {};
        }
        var arr = dataStr.split(",");
        var obj={};
        for (var i=0;i<arr.length;i++){
            var paramStr=arr[i];
            var paramArr=paramStr.split("=");
            obj[paramArr[0]]=paramArr[1];
        }
        return obj;
    }
    
    function getUserInfoAndUrl (config) {
        var _config = {
            whenSuccess: function (userInfo,hashData) {

            },
            whenUserError:function (resultObj) {

            },
            whenZFError:function (resultObj) {

            }
        }
        _config = $.extend(true, _config, config);

    	var windowHref = window.location.href;
        var resultObj={};
        var hashData=getHashData();
        var isOnceOpenZF=getSessionParams("isOnceOpenZF");

        if(hashData.isZF&&hashData.isZF=="1"){//转发进入
            if(isOnceOpenZF=="1"){
                var userInfo = getParams("login_userInfo");
                if (hashData.unitId&&userInfo.unitId==hashData.unitId){
                    _config.whenSuccess(userInfo,hashData);
                }else {
                    resultObj.errorMsg="非本单位人员不允许访问！";
                    _config.whenZFError(resultObj);
                }
            }else {
                getUserByCACode(function (userInfo) {
                    if(!userInfo){
                        resultObj.errorMsg="未获取到您的用户信息!";
                        _config.whenZFError(resultObj);
                        return;
                    }
                    setSessionParams("isOnceOpenZF","1");
                    setParams('login_userInfo',userInfo);//把登录人userId存储到本地
                    var loginId = userInfo.id;//登录人在OA中的userId
                    setParams('login_id',loginId);//把登录人userId存储到本地
                    resultObj = {
                        userId:loginId,
                        userInfo:userInfo,
                        hashData:hashData
                    };
                    if (hashData.unitId&&userInfo.unitId==hashData.unitId){
                        _config.whenSuccess(userInfo,hashData);
                    }else {
                        resultObj.errorMsg="非本单位人员不允许访问！";
                        _config.whenZFError(resultObj);
                    }
                })
            }
        }else if(hashData.pushMes&&hashData.pushMes=="1"){//消息推送进入
            if(isOnceOpenZF=="1"){
                var userInfo = getParams("login_userInfo");
                _config.whenSuccess(userInfo,hashData);
            }else {
                getUserByCACode(function (userInfo) {
                    if(!userInfo){
                        resultObj.errorMsg="未获取到您的用户信息!";
                        _config.whenZFError(resultObj);
                        return;
                    }
                    setSessionParams("isOnceOpenZF","1");
                    setParams('login_userInfo',userInfo);//把登录人userId存储到本地
                    var loginId = userInfo.id;//登录人在OA中的userId
                    setParams('login_id',loginId);//把登录人userId存储到本地
                    resultObj = {
                        userId:loginId,
                        userInfo:userInfo,
                        hashData:hashData
                    };
                    _config.whenSuccess(userInfo,hashData);
                })
            }
        }else {//列表进入
            var userInfo = getParams("login_userInfo");
            if (hashData.unitId&&userInfo.unitId==hashData.unitId){
                _config.whenSuccess(userInfo,hashData);
            }else {
                resultObj.errorMsg="非本单位人员不允许访问！";
                _config.whenZFError(resultObj);
            }
        }

        function getUserByCACode(func) {
            var code = windowHref.substring(windowHref.indexOf("?") + 6,windowHref.indexOf("&"));
            if(!code){
                resultObj.errorMsg="没有找到获取用户信息的CODE!";
                _config.whenZFError(resultObj);
            }else {
                //根据code获取用户的caid
                $.ajax({
                    url: "/ajax.sword?ctrl=WeixinCtrlV2_getUserByCode",
                    data:{
                        code:code
                    },
                    async:false,
                    dataType: "json",
                    success: function (res) {
                        var result = res.message.data;
                        if(res.message.success==1){
                            if(result){
                                caId =  result.userIdCode;
                                if(!caId){
                                    resultObj.errorMsg="获取用户信息不完整，请稍后重试！";
                                    _config.whenZFError(resultObj);
                                    return;
                                }else{
                                    //根据caid获取用户信息
                                    $.ajax({
                                        url:"/ajax.sword?ctrl=WeixinCtrlV2_getUserInfo",
                                        dataType:"json",
                                        async: false,
                                        data:{
                                            caId:caId
                                        },
                                        success:function (res) {
                                            if(res.message.returnValue=="0"){//请求成功，返回数据
                                                var userInfo = res.message.data;
                                                func(userInfo)
                                                return;
                                            }else{
                                                resultObj.errorMsg="请求获取用户信息失败！";
                                                _config.whenZFError(resultObj);
                                                return;
                                            }
                                        },
                                        error:function(){
                                            resultObj.errorMsg="当前网络信号较差或无网络连接，请您检查网络设置！";
                                            _config.whenZFError(resultObj);
                                            return;
                                        }
                                    });
                                }
                            }else{
                                resultObj.errorMsg="获取用户ID信息失败，请稍后重试！";
                                _config.whenZFError(resultObj);
                                return;
                            }
                        }else{
                            resultObj.errorMsg="未获取到授权网页中的用户信息！";
                            _config.whenZFError(resultObj);
                            return;
                        }
                    },
                    error:function(){
                        resultObj.errorMsg="当前网络信号较差或无网络连接，请您检查网络设置！";
                        _config.whenZFError(resultObj);
                        return;
                    }
                });
            }
        }
    };

    function initZhuanfa(config) {
        var _config = {
            data: {},
            link: "",
            title: "",
            imgUrl: "",
            desc: "",
            success: function () {
            },
            cancel: function () {
            }
        }
        _config = $.extend(true, _config, config);
        var tencentUrl = "https://weixin.sz.gov.cn/connect/oauth2/authorize?appid=wlb2d439ef82&redirect_uri=";
        var tencentZFparam = "&response_type=code&scope=snsapi_base#wechat_redirect";
        var linkParam = _config.data;
        var linUrl = _config.link + "#";
        if (linkParam) {
            for (index in linkParam) {
                var value = linkParam[index];
                linUrl += index + "=" + value + ",";
            }
            linUrl+="isZF=1";
        }
        linUrl=encodeURIComponent(linUrl);
        // window.open(linUrl)
        var totalUrl = tencentUrl + linUrl + tencentZFparam;

        wx.onMenuShareAppMessage({
            title: _config.title, // 分享标题
            desc: _config.desc, // 分享描述
            link: totalUrl, // 分享链接
            imgUrl: _config.imgUrl, // 分享图标
            success: function () {
                // 用户确认分享后执行的回调函数
                _config.success();
            },
            cancel: function () {
                // 用户取消分享后执行的回调函数
                _config.cancel();
            }
        });

        setTimeout(function () {
            wx.showMenuItems({
                menuList: ["menuItem:share:appMessage"]
            });
        },2000)
    }

    return {
        removeParams:removeParams,
        removeSessionParams:removeSessionParams,
        setParams:setParams,
        getParams: getParams,
        getHashData:getHashData,
        getSessionParams:getSessionParams,
        setSessionParams:setSessionParams,
        getUserInfoAndUrl:getUserInfoAndUrl,
        initZhuanfa:initZhuanfa
    }
});




/*//设置本地存储
util.setParams = function (key, value) {  
    localStorage.setItem(key,JSON.stringify(value));
};


//获取本地存储
util.getParams = function (key) {
    return JSON.parse(localStorage.getItem(key)) || null;
};

//删除本地存储
util.removeParams = function (key, flag) {
    if (this.supportStorage) {
        if (flag) {
            sessionStorage.removeItem(key);
        } else {
            localStorage.removeItem(key);
        }
    }
};
//清除本地存储
util.clear = function (flag) {
    if (this.supportStorage) {
        if (flag) {
            sessionStorage.clear();
        } else {
            localStorage.clear();
        }
    }
};
//遍历本地存储
util.getEachParams = function (flag) {
    if (this.supportStorage) {
        var len = sessionStorage.length,
            i = 0,
            res = [],
            key,
            value;
        if (len !== 0) {
            for (i; i < len; i++) {
                key = sessionStorage.key(i);
                if (flag) {
                    value = JSON.parse(sessionStorage.getItem(key));
                } else {
                    value = JSON.parse(localStorage.getItem(key));
                }
                res.push(value);
            }
            return res;
        } else {
            return null;
        }
    }
    return null;
};
*/