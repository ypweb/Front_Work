define(["util","UrlBase","css!SignCss"],function (Util,UrlBase){
	var userId = "";//用户id
	var userInfo;//用户信息
	var identityId = "";//身份id
	var deptId = "";//部门id
	var unitId;//单位id
	var page = 1;
    var pageSize = 20;
    var isRefresh=0;//是否刷新  防止ios不刷新导致的查询问题
	//下拉刷新需要的全局变量
    var isScrollLeft = false;//判断是否有信息处于最左端状态
    var isScroll = false;//判断是否有信息处于左划状态
    var initX = 0;//起始X坐标
    var initY = 0;//起始Y坐标
    var endX = 0;//结束X坐标
    var endY = 0;//结束Y坐标
    var isLock = false;//是否锁定整个操作
    var isCanDo = true;//是否移动滑块
    var mutiChecked = false;//是否处于选择框弹出状态
    //上垃加载需要的全局变量
    var range = 0;//滚动条距顶部距离(页面超出窗口的高度)
	var scollif = true;
	var isPullUp = 0;//是否是上拉操作 0 否 1 是
	
	//初始化方法
    function init(){
    	//$.showLoading("努力加载中...");
    	isRefresh = 1;
    	userInfo = Util.getParams("login_userInfo");
    	if(userInfo){
    		identityId = userInfo.identityId;
    		deptId = userInfo.deptId;
    		userId = userInfo.userId;
    		//unitId = userInfo.unitId;
    	}else{
    		$.alert("未获取到用户信息！");
    		return false;
    	}
    	getHaveSignList();//获取已签收列表
    	pullRefresh();//下拉刷新
    	pullLoad();//上垃加载
    }
    
    //获取已签收列表数据
    function getHaveSignList(){
    	//获取缓存中的滚动高度和页码
    	var nowScroll = Util.getSessionParams("nowScroll");//点击行数据时候的位置
		var nowPage = Util.getSessionParams("nowPage");//点击行数据时候的当前页数
		if(nowPage && nowScroll && isRefresh==1){//判断缓存中是否有滚动高度和页码
			page = 1;
			pageSize = nowPage*20;
			$("#grid").css("opacity",0);
		}
		isRefresh = 0;
    	$.ajax({
	        url:"/ajax.sword?ctrl=WeixinCtrlV2_getSignDoneList",
	        dataType:"json",
	        data:{
	        	page:page,
	        	pageSize:pageSize,
	        	//userId:userId,
	        	//deptId:deptId,
	        	//identityId:identityId
	        	identityId:"7921FA848F7A42368FC3032493F497E1",
	        	userId:"7921FA848F7A42368FC3032493F497E1",
	        	deptId:"ZR78c7445b79ecad015b7ff5d2bb10f4"
	        },
	        success:function (res) {
	        	$.hideLoading();
	        	if(res.message.msg=="请求成功"){//请求成功，返回数据
		        	var haveSignList = res.message.data.resList;
		        	var listLength = haveSignList.length;
    	        	if(listLength<1 && isPullUp == 0){
    	        		$("#grid").append('<div class="noData">暂无数据!</div>');
    	        		scollif = false;
    	        	}else if(listLength<1 && isPullUp==1){
    	        		page = page-1;
    	        		$(".loadingMore").text("");
    	        	}else{
    	        		$(".noData").remove();
		        		$(".loadingMore").remove();
			        	for(var i=0;i<haveSignList.length;i++){
			        		//判断环节名称是否为空
    		        		var hjmc = haveSignList[i].hjmc;
    		        		if(!hjmc || hjmc=="null"){
    		        			hjmc = "";
    		        		}
			        		//判断标题是否为空
			        		var bt = haveSignList[i].bt;
    		        		if(!bt || bt=="null"){
    		        			bt = "";
    		        		}
    		        		//判断来文单位名称是否为空
    		        		var lwdwmc = haveSignList[i].lwdwmc;
    		        		if(!lwdwmc || lwdwmc=="null"){
    		        			lwdwmc = "";
    		        		}
			        		//判断来文字号数据是否存在
			        		var lwzh = haveSignList[i].lwzh;
    		        		if(!lwzh || lwzh=="null"){
    		        			lwzh = "";
    		        		}
    		        		//判断创建时间是否为空
    		        		var lrrq = haveSignList[i].lrrq;
    		        		if(!lrrq || lrrq=="null"){
    		        			lrrq = "";
    		        		}
			        		var color="#74cdf5";//默认平件
			        		var priorityStr = haveSignList[i].hjmc;
			        		if(priorityStr == "特提"){
			        			color = "#c92929";
			        		}else if(priorityStr == "特急"){
			        			color = "#e8595d";
			        		}else if(priorityStr == "加急"){
			        			color = "#f37c42";
			        		}else if(priorityStr == "急件"){
			        			color = "#f59d50";
			        		}else if(priorityStr == "平急"){
			        			color = "#f8d148";
			        		}else if(priorityStr == "平件"){
			        			color = "#74cdf5";
			        		}
			        		$("#grid").append('<div class="row-message">'+
			        				'<div class="row-message1">'+
			        					'<div class="rowLeft">'+
			        						'<div class="priorityStyle" style="background-color:'+color+'">'+hjmc+'</div>'+
			        					'</div>'+
			        					'<div class="rowRight">'+
			        						'<div class="title">'+bt+'</div>'+
			        						'<div class="authorname">'+lwdwmc+'</div>'+
			        					'</div>'+
			        			'</div>'+
			        			'<div class="row-message2">'+
			        				'<div class="rowBottom">'+
			        					'<div class="bottomLeft">'+lwzh+'</div>'+
			        					'<div class="bottomRight">创建时间：'+lrrq+'</div>'+
			        				'</div>'+
			        			'</div>'+
			        			'<div class="hideWorkId" style="display:none">'+haveSignList[i].workid+'</div>'+
			        			'<div class="hideType" style="display:none">'+haveSignList[i].type+'</div>'+
			        		'</div>');
			        	};
			        	if(nowPage && nowScroll){
		        			page = nowPage;
		        			pageSize = 20;
		        			$("html,body").scrollTop(nowScroll);
		        			setTimeout(function(){
		        				$("#grid").css("opacity",1);
		        			},200);
		        		}
			        	rowClick();
    	        	}
	        	}else{//失败
	        		if(page>1){
	        			page = page-1;
	        		}
	        		$(".loadingMore").text("查询失败，请稍后再试！");
	        		var message = res.message.msg;
	        		if(message){
	        			$.alert(message,function(){
		        			location.reload();
		        		});
	        		}else{
	        			$.alert("未获取到列表信息，请稍后再试！",function(){
		        			location.reload();
		        		});
	        		}
	        	}
	        	scollif=true;
	        },
	        error:function(res){
	        	scollif=true;
	        	$.hideLoading();
	        	$.alert("当前网络信号较差或无网络连接，请您检查网络设置！",function(){
	        		location.reload();
	        	});
	        }
	    })
    }
    
    //上拉加载
    function pullLoad(){
	   $(window).scroll(function(){         	 
           var srollPos = $(window).scrollTop();    
           var totalheight = parseFloat($(window).height()) + parseFloat(srollPos);
           //判断上拉的高度以决定是否加载更多
           if(($(document).height()-range) <= totalheight ) {
               if(scollif==true){
            	   scollif=false;
              	   isPullUp = 1;
              	   $(".loadingMore").remove();
              	   $("#grid").append('<div class="loadingMore">正在加载中...</div>');
              	   page = page+1;
            	   pageSize = 20;
            	   //清空缓存中的记录
            	   Util.setSessionParams("nowScroll",null);
         		   Util.setSessionParams("nowPage",null);
              	   getHaveSignList();
               }else if(scollif==false){
            	   //如果正在加载数据时 仍然上拉则不起作用
               }
           }
       });
    }
    
    //下拉刷新
    function pullRefresh() {
        //下拉刷新
        var $container = "<div id='container' class='scroller'></div>";
        var $loading = "<div class='loading2'>下拉刷新数据</div>";
        $("#grid").wrap($container);
        $("#container").prepend($loading);
        var slide = function (option) {
            var defaults = {
                container: '',
                next: function () {
                }
            };
            var length,
                isStart=false,
	    		isMove=false,
                isTop = false,//是否在顶端
                isTouchPad = (/hp-tablet/gi).test(navigator.appVersion),
                hasTouch = 'ontouchstart' in window && !isTouchPad;
            var obj = document.querySelector(option.container);
            loading = obj.firstElementChild;
            var offset = loading.clientHeight;
            var objparent = obj.parentElement;
            /*操作方法*/
            var fn =
            {
                //移动容器
                translate: function (diff) {
                    obj.style.webkitTransform = 'translate3d(0,' + diff + 'px,0)';
                    obj.style.transform = 'translate3d(0,' + diff + 'px,0)';
                },
                //设置效果时间
                setTransition: function (time) {
                    obj.style.webkitTransition = 'all ' + time + 's';
                    obj.style.transition = 'all ' + time + 's';
                },
                //返回到初始位置
                back: function () {
                    fn.translate(0 - offset);
                    //标识操作完成
                    isLock = false;
		            isStart=false;
                },
                addEvent: function (element, event_name, event_fn) {
                    if (element.addEventListener) {
                        element.addEventListener(event_name, event_fn, false);
                    } else if (element.attachEvent) {
                        element.attachEvent('on' + event_name, event_fn);
                    } else {
                        element['on' + event_name] = event_fn;
                    }
                }
            };
            fn.translate(0 - offset);
            fn.addEvent(obj, 'touchstart', start);
            fn.addEvent(obj, 'touchmove', move);
            fn.addEvent(obj, 'touchend', end);
            fn.addEvent(obj, 'mousedown', start)
            fn.addEvent(obj, 'mousemove', move)
            fn.addEvent(obj, 'mouseup', end)
            //滑动开始
            function start(e) {
                isTop = $("#grid").offset().top == $("#titleBar").height() ? true : false;        
                if (objparent.scrollTop <= 0 && isCanDo && !isStart) {
                    var even = typeof event == "undefined" ? e : event;
                    isStart=true;
		            isMove=true;
                    //保存当前鼠标Y坐标
                    initY = even.touches ? even.touches[0].pageY : even.pageY;
                    endY = even.touches ? even.touches[0].pageY : even.pageY;
                    //消除滑块动画时间
                    fn.setTransition(0);
                    loading.innerHTML = "↓下拉刷新数据";
                }
                return false;
            }
            //滑动中
            function move(e) {
                if (objparent.scrollTop <= 0 && isCanDo && isMove) {
                    var even = typeof event == "undefined" ? e : event;
                    //保存当前鼠标Y坐标
                    /*endY = hasTouch ? even.touches[0].pageY : even.pageY;*/
                    endY = even.touches ? even.touches[0].pageY : even.pageY;
                    if (initY < endY) {
                        even.preventDefault();
                        //消除滑块动画时间
                        fn.setTransition(0);
                        //移动滑块
                        isLock = true;
                        if ((endY - initY - offset) / 2 <= 300) {
                            length = (endY - initY - offset) / 2;
                            if (endY - initY > offset && !isScroll && !mutiChecked &&!isScrollLeft) {
                                fn.translate(length);
                            }
                            if (endY - initY > 60) {
                                loading.innerHTML = "↑ 释放立即刷新";
                            }                     
                        }
                        else {
                            length += 0.3;
                            fn.translate(length);
                        }
                    }
                }
            }
            //滑动结束
            function end(e) {
                if (isCanDo && isMove) {
                	isMove=false;
                    //判断滑动距离是否大于等于指定值
                    if (endY - initY > 60 && !isScroll && !mutiChecked) {
                        //设置滑块回弹时间
                        fn.setTransition(0.5);
                        //保留提示部分
                        fn.translate(0);
                        //执行回调函数
                        loading.innerHTML = "正在刷新数据...";
                        if (typeof option.next == "function") {
                            option.next.call(fn, e);
                        }
                    } else {
                        //返回初始状态
                        fn.back();
                    }
                    return false;
                }
            }
        }
        slide({
            container: "#container", next: function (e) {
                //松手之后执行逻辑,ajax请求数据，数据返回后隐藏加载中提示
                var that = this;
                scollif = false;
                setTimeout(function () {
                	page = 1;
                	pageSize = 20;
                	//清缓存记录
                	Util.setSessionParams("nowScroll",null);
            		Util.setSessionParams("nowPage",null);
            		$.ajax({
            	        url:"/ajax.sword?ctrl=WeixinCtrlV2_getSignDoneList",
            	        dataType:"json",
            	        data:{
            	        	page:page,
            	        	pageSize:pageSize,
            	        	//userId:userId,
            	        	//deptId:deptId,
            	        	//identityId:identityId
            	        	identityId:"7921FA848F7A42368FC3032493F497E1",
            	        	userId:"7921FA848F7A42368FC3032493F497E1",
            	        	deptId:"ZR78c7445b79ecad015b7ff5d2bb10f4"
            	        },
            	        success:function (res) {
            	        	if(res.message.msg=="请求成功"){//请求成功，返回数据
	            	        	$("#grid").children().remove();
	            	        	var haveSignList = res.message.data.resList;
	            	        	var listLength = haveSignList.length;
	            	        	if(listLength<1){
	            	        		$("#grid").append('<div class="noData">暂无数据!</div>');
	            	        	}else{
		            	        	for(var i=0;i<haveSignList.length;i++){
		            	        		//判断环节名称是否为空
		        		        		var hjmc = haveSignList[i].hjmc;
		        		        		if(!hjmc || hjmc=="null"){
		        		        			hjmc = "";
		        		        		}
		    			        		//判断标题是否为空
		    			        		var bt = haveSignList[i].bt;
		        		        		if(!bt || bt=="null"){
		        		        			bt = "";
		        		        		}
		        		        		//判断来文单位名称是否为空
		        		        		var lwdwmc = haveSignList[i].lwdwmc;
		        		        		if(!lwdwmc || lwdwmc=="null"){
		        		        			lwdwmc = "";
		        		        		}
		    			        		//判断来文字号数据是否存在
		    			        		var lwzh = haveSignList[i].lwzh;
		        		        		if(!lwzh || lwzh=="null"){
		        		        			lwzh = "";
		        		        		}
		        		        		//判断创建时间是否为空
		        		        		var lrrq = haveSignList[i].lrrq;
		        		        		if(!lrrq || lrrq=="null"){
		        		        			lrrq = "";
		        		        		}
		    			        		var color="#74cdf5";//默认平件
		    			        		var priorityStr = haveSignList[i].hjmc;
		    			        		if(priorityStr == "特提"){
		    			        			color = "#c92929";
		    			        		}else if(priorityStr == "特急"){
		    			        			color = "#e8595d";
		    			        		}else if(priorityStr == "加急"){
		    			        			color = "#f37c42";
		    			        		}else if(priorityStr == "急件"){
		    			        			color = "#f59d50";
		    			        		}else if(priorityStr == "平急"){
		    			        			color = "#f8d148";
		    			        		}else if(priorityStr == "平件"){
		    			        			color = "#74cdf5";
		    			        		}
		    			        		$("#grid").append('<div class="row-message">'+
		    			        				'<div class="row-message1">'+
		    			        					'<div class="rowLeft">'+
		    			        						'<div class="priorityStyle" style="background-color:'+color+'">'+hjmc+'</div>'+
		    			        					'</div>'+
		    			        					'<div class="rowRight">'+
		    			        						'<div class="title">'+bt+'</div>'+
		    			        						'<div class="authorname">'+lwdwmc+'</div>'+
		    			        					'</div>'+
		    			        			'</div>'+
		    			        			'<div class="row-message2">'+
		    			        				'<div class="rowBottom">'+
		    			        					'<div class="bottomLeft">'+lwzh+'</div>'+
		    			        					'<div class="bottomRight">创建时间：'+lrrq+'</div>'+
		    			        				'</div>'+
		    			        			'</div>'+
		    			        			'<div class="hideWorkId" style="display:none">'+haveSignList[i].workid+'</div>'+
		    			        			'<div class="hideType" style="display:none">'+haveSignList[i].type+'</div>'+
		    			        		'</div>');
		            	        	};
		            	        	scollif = true;
	            	        	}
	            	        	rowClick();
	            	        	loading.innerHTML = "刷新成功！";
	            	        	setTimeout(function () {
	            	        		that.back.call();
	            	        	},500);
            	        	}else{
            	        		scollif = true;
            	        		loading.innerHTML = "刷新失败！";
	            	        	setTimeout(function () {
	            	        		that.back.call();
	            	        	},500);
            	        	}
            	        },
            	        error:function(res){
            	        	$.alert("当前网络信号较差或无网络连接，请您检查网络设置！",function(){
            	        		location.reload();
            	        	});
            	        }
            	    });
                },500);
            }
        });
        return false;
    }
    
    //行数据点击事件
    function rowClick(){
    	$(".row-message").unbind("click").bind("click",function(){
    		var nowScroll = $(document).scrollTop();//当前滚动的高度
    		var nowPage = page;//当前页数
    		//将这两个参数放到sessionStorage中
    		Util.setSessionParams("nowScroll",nowScroll);
    		Util.setSessionParams("nowPage",nowPage);
    		//获取需要的参数
    		var workId = $(this).find(".hideWorkId").text();
    		var type = $(this).find(".hideType").text();
    		if(!workId || !type){
    			$.alert("没有获取到跳转页面需要的参数，请稍后重试！");
    			return false;
    		}
            var param="#workId="+workId+","+"type="+type+","+"userId="+userId+","+"unitId="+unitId;
			//跳转到详细页面  会议类型
        	window.location.href=UrlBase.URL_JUMP_SIGNDONEDETAILS+param;
    	});
    }
    
    //初始化方
    return init;
});