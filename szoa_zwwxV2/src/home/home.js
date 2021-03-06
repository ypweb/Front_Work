define(["util","UrlBase","WX","weuiJS","css!HomeCss"],function (Util,UrlBase,wx){
	var caId = "b339276f549b45498095a1ad74667e23";//试点饶文刚
	//var caId = "d5bc0615d3f34f28aaff5e089b329d8d"//试点赖镇先
	//var caId = "18d88313ee4342c0b04bd7cb1efafaed";//试点陈如桂
	//var caId = "d67929d133cc45f6bafc83235726bf89";//试点市领导秘书王少波
	//var caId = "11ab2a84cbc04dc58f58d8c6fb3f1377";//试点白昱
	//var caId = "ac3bd31066b14e41978dea04136a7f6f";//非试点赵雪菲
	//var caId = "412ed1ebad174629acbcc7507c0c5092";//非试点孙彦蓉
	//var caId = "ca72030438a24a05981bee6a0e51a87a";//非试点任斌昱
	//var caId = "85a901ef2dce40238573674026655868";//非试点臧磊
	function init(){
		$.hideLoading();
		$("#waitCssComplete").show();
		getUserInfo();//通过CA的用户id获取登录人的基本信息
    	bindClickEvent();
    }
    
    //获取用户信息
    function getUserInfo(){
    	$.ajax({
            url:"/ajax.sword?ctrl=WeixinCtrl_getUserInfo",
            dataType:"json",
            data:{
            	caId:caId
            },
            success:function (res) {
            	$.hideLoading();
            	if(res.message.returnValue=="0"){//请求成功，返回数据
            		var userInfo = res.message.data;
            		console.log(userInfo);
            		if(!userInfo){
            			return false;
            			$.alert("未获取到您的用户信息!");
            		}
            		Util.setParams('login_userInfo',userInfo);//把登录人userId存储到本地
                	var loginId = userInfo.id;//登录人在OA中的userId
                	Util.setParams('login_id',loginId);//把登录人userId存储到本地
                	var isPilotUnit = userInfo.isPilotUnit;//是否试点单位
                	var isLeaderSec = userInfo.isLeaderSec;//是否是领导秘书
                	var isLeader = "0";
                	var ifLeader = userInfo.checkIsLeader;
                	if(ifLeader==true){
                		isLeader = "1";
                	}
                	Util.setParams('login_isLeader',isLeader);//把登录人isLeader存储到本地
                	var isQsRen = userInfo.isQsRen;//是否是签收岗位
                	var userInformation = {
                			isPilotUnit:isPilotUnit,
            				isLeaderSec:isLeaderSec,
            				isQsRen:isQsRen
                	};
                	if(isPilotUnit == false){//非试点
                		$("#fsdMain").show();
                	}else if(isPilotUnit == true){//试点单位
                		$("#sdMain").show();
                		/*if(isQsRen==true){//有签收功能  暂时不需要签收
                			$("#sdqs").show();
                		}*/
                	}
            	}else{
            		$.alert("未获取到您的登录信息!");
            	}
            },
            error:function(){
            	$.hideLoading();
            	$.alert("当前网络信号较差或无网络连接，请您检查网络设置！",function(){
	        		location.reload();
	        	});
            }
        })
    }
    
    //绑定功能按钮点击事件
    function bindClickEvent(){
    	//绑定非试点功能
    	$("#fsdqs").click(function(){//非试点签收
    		Util.setSessionParams("nowScroll",null);
    		Util.setSessionParams("nowPage",null);
            window.location.href = UrlBase.URL_JUMP_WAITSIGN;
    	});
    	
    	$("#fsdyqs").click(function(){//非试点已签收
    		Util.setSessionParams("nowScroll",null);
    		Util.setSessionParams("nowPage",null);
            window.location.href = UrlBase.URL_JUMP_SIGNDONE;
    	});
    	
    	$("#fsdbm").click(function(){//非试点报名
    		Util.setSessionParams("nowScroll",null);
    		Util.setSessionParams("nowPage",null);
            window.location.href = UrlBase.URL_JUMP_HAVESIGN;
    	});
    	
    	//绑定试点功能
    	$("#sddb").click(function(){//试点待办
    		Util.setSessionParams("dbSearchCode",null);
    		Util.setSessionParams("nowScroll",null);
    		Util.setSessionParams("nowPage",null);
            window.location.href = UrlBase.URL_JUMP_WAITHANDLE;
    	});
    	
    	$("#sdjhgz,#fsdjhgz").click(function(){//非试点和试点交换跟踪
    		Util.setSessionParams("nowScroll",null);
    		Util.setSessionParams("nowPage",null);
            window.location.href = UrlBase.URL_JUMP_EXCHANGE;
    	});
    	
    	$("#sdcx,#fsdcx").click(function(){//试点查询
    		Util.removeSessionParams('query_module');
    		Util.removeSessionParams('query_module_dept');
    		Util.removeSessionParams('query_module_employee');
    		window.location.href = UrlBase.URL_JUMP_SEARCH;
    	});
    }
    
    function getToken() {
    	var urlTemp = window.location.href;
    	var urlFinal = encodeURIComponent(urlTemp);
        $.ajax({
            url: "/ajax.sword?ctrl=WeixinSDK_getSDKSignature",
            async:false,
            data:{
                "url":urlFinal
            },
            dataType: "json",
            success: function (data) {
                var json = data.message;
            	wx.config({
                    beta: true,// 必须这么写，否则wx.invoke调用形式的jsapi会有问题
                    debug: false, // 开启调试模式
                    appId: json.corpid, // 必填，企业微信的corpID
                    timestamp: json.timestamp, // 必填，生成签名的时间戳
                    nonceStr: json.noncestr, // 必填，生成签名的随机串
                    signature: json.signature,// 必填，签名，见附录1
                    jsApiList: [ 'chooseImage','previewFile',"hideOptionMenu","shareAppMessage","onMenuShareAppMessage"]
                });

	            wx.ready(function () {
	                wx.checkJsApi({
	                    jsApiList: [ 'chooseImage','previewFile',"hideOptionMenu","shareAppMessage","onMenuShareAppMessage"], // 需要检测的JS接口列表，所有JS接口列表见附录2,
	                    success: function (res) {
	                    	wx.hideOptionMenu();
	                        wx.showMenuItems({
	                            menuList: ["menuItem:favorite"]
	                        });
	                    }
	                });
	            });
            }
        });
    }
   
    //初始化方
    return init;
});

/*define(["util","UrlBase","WX","weuiJS","css!HomeCss"],function (Util,UrlBase,wx){	
	var caId = "";
	window.wx=wx;
    function init(){
		$("#waitCssComplete").show();	
    	caId = Util.getSessionParams('ca_id');
    	if(caId=="" || caId==null || caId==undefined){	
    		getCode();
    	}else{
    		getUserInfo();//通过CA的用户id获取登录人的基本信息
    	}
    	bindClickEvent();
		getToken();         
    }
    
    function getCode(){
    	var linkUrl = window.location.href;
    	var code = linkUrl.substring(linkUrl.indexOf("?") + 6,linkUrl.indexOf("&"));
    	$.ajax({
            url: "/ajax.sword?ctrl=WeixinCtrl_getUserByCode",
            data:{
                code:code
            },
            dataType: "json",
            success: function (res) {
				var result = res.message.data;
            	if(res.message.success==1){
                	if(result){
                		caId =  result.userIdCode;
                		if(!caId){
                			$.hideLoading();
                			$.alert("获取用户信息不完整，请稍后重试！",function(){
            	        		location.reload();
            	        	});
                			return false;
                		}
                		Util.setSessionParams('ca_id',caId);//把登录人userId存储到本地
                		getUserInfo();
                	}else{
                		$.hideLoading();
                		$.alert("获取用户ID信息失败，请稍后重试！",function(){
        	        		location.reload();
        	        	});
                	}
            	}else{
            		$.hideLoading();
            		$.alert("未获取到授权网页中的用户信息！",function(){
    	        		location.reload();
    	        	});
            	}
            },
            error:function(){
            	$.hideLoading();
            	$.alert("当前网络信号较差或无网络连接，请您检查网络设置！",function(){
	        		location.reload();
	        	});
            }
    	});
    }
    
    //获取用户信息
    function getUserInfo(){
    	$.ajax({
            url:"/ajax.sword?ctrl=WeixinCtrl_getUserInfo",
            dataType:"json",
            data:{
            	caId:caId
            },
            success:function (res) {
            	$.hideLoading();
            	if(res.message.returnValue=="0"){//请求成功，返回数据
            		var userInfo = res.message.data;
            		if(!userInfo){
            			return false;
            			$.alert("未获取到您的用户信息!");
            		}
					Util.setParams('login_userInfo',userInfo);//把登录人userId存储到本地
                	var loginId = userInfo.id;//登录人在OA中的userId
                	Util.setParams('login_id',loginId);//把登录人userId存储到本地
                	var isPilotUnit = userInfo.isPilotUnit;//是否试点单位
                	var isLeaderSec = userInfo.isLeaderSec;//是否是领导秘书
                	var isQsRen = userInfo.isQsRen;//是否是签收岗位
                	var userInformation = {
                			isPilotUnit:isPilotUnit,
            				isLeaderSec:isLeaderSec,
            				isQsRen:isQsRen
                	};
                	if(isPilotUnit == false){//非试点
                		$("#fsdMain").show();
                	}else if(isPilotUnit == true){//试点单位
						//$(".usuallyFuncWords").text("暂无常用功能");
                		if(isQsRen==true){//有签收功能
                			//$("#sdqs").show();
                		}
                		$("#sdMain").show();
                	}
            	}else{
            		$.alert("未获取到您的登录信息!");
            	}
            },
            error:function(){
            	$.hideLoading();
            	$.alert("请您检查网络！");
            }
        })
    }
    
    //绑定功能按钮点击事件
    function bindClickEvent(){
    	//绑定非试点功能
    	$("#fsdqs").click(function(){//非试点签收
    		Util.setSessionParams("nowScroll",null);
    		Util.setSessionParams("nowPage",null);
            window.location.href = UrlBase.URL_JUMP_WAITSIGN;
    	});
    	
    	$("#fsdyqs").click(function(){//非试点已签收
    		Util.setSessionParams("nowScroll",null);
    		Util.setSessionParams("nowPage",null);
            window.location.href = UrlBase.URL_JUMP_SIGNDONE;
    	});
    	
    	$("#fsdbm").click(function(){//非试点报名
    		Util.setSessionParams("nowScroll",null);
    		Util.setSessionParams("nowPage",null);
            window.location.href = UrlBase.URL_JUMP_HAVESIGN;
    	});
    	
    	//绑定试点功能
    	$("#sddb").click(function(){//试点待办
    		Util.setSessionParams("dbSearchCode",null);
    		Util.setSessionParams("nowScroll",null);
    		Util.setSessionParams("nowPage",null);
            window.location.href = UrlBase.URL_JUMP_WAITHANDLE;
    	});
    	
    	$("#sdjhgz,#fsdjhgz").click(function(){//非试点和试点交换跟踪
    		Util.setSessionParams("nowScroll",null);
    		Util.setSessionParams("nowPage",null);
            window.location.href = UrlBase.URL_JUMP_EXCHANGE;
    	});
    	
    	$("#sdcx,#fsdcx").click(function(){//试点查询
    		Util.removeSessionParams('query_module');
    		Util.removeSessionParams('query_module_dept');
    		Util.removeSessionParams('query_module_employee');
    		window.location.href = UrlBase.URL_JUMP_SEARCH;
    	});
    }
    
    function getToken() {
		var urlTemp = window.location.href;
		var  urlFinal =  encodeURIComponent(urlTemp);
        $.ajax({
            url: "/ajax.sword?ctrl=WeixinSDK_getSDKSignature",
            async:false,
            data:{
               url:urlFinal,
            },
            dataType: "json",
            success: function (data) {
                var json = data.message;
                  wx.config({
                     beta: true,// 必须这么写，否则wx.invoke调用形式的jsapi会有问题
                     debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                     appId: json.appId, // 必填，企业微信的corpID
                     timestamp: parseInt(json.timestamp), // 必填，生成签名的时间戳
                     nonceStr: json.nonceStr, // 必填，生成签名的随机串
                     signature: json.signature,// 必填，签名，见附录1
                     jsApiList: ["hideOptionMenu","shareAppMessage","showWatermark"]
                     // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                });
                wx.ready(function () {
                    wx.checkJsApi({
                        jsApiList: ["hideOptionMenu","shareAppMessage","showWatermark","hideWatermark"], // 需要检测的JS接口列表，所有JS接口列表见附录2,
                        success: function (res) {
                            // 以键值对的形式返回，可用的api值true，不可用为false
                            // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
                        }
                    });
           
    	wx.invoke("hideWatermark",{},function(res) {
            //关闭页面水印
        });
                    wx.hideOptionMenu();
                    wx.showMenuItems({
                        menuList: ["menuItem:favorite"]
                    })
             
                });

            }
        });
    }
   
    //初始化方
    return init;
});*/