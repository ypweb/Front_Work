<%@ page language="java" contentType="text/html; charset=UTF-8"  import="java.util.*" pageEncoding="UTF-8"%>
<%@taglib prefix="c" 		uri="http://java.sun.com/jsp/jstl/core"%>
<%@taglib prefix="fn" 		uri="http://java.sun.com/jsp/jstl/functions"%>
<%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>
<!doctype html>
<html lang="zh">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=0,maximum-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=Edge">
<meta content="yes" name="apple-mobile-web-app-capable">
<meta content="telephone=no" name="format-detection">
<meta name="description" content="信用卡管理--服务列表">
<meta name="keywords" content="信用卡管理--服务列表">
<title>信用卡管理--服务列表</title>
<link rel="stylesheet" type="text/css" href="<%=path%>/mobile/css/serve.css">
</head>
<body>
	
   
   <!--广告轮播-->
   <section class="serve-slide-wrap part-slide">
   		<div class="slide-wrap">
            <div class="slide-toggle" id="slideimg_show">
                <!--轮播图片展示-->
                <ul id="slide_img" class="slideimg">
                    <li><a title="" href="#"><img alt="" src="<%=path%>/mobile/images/1.jpg" ></a></li>
                    <li><a title="" href="#"><img alt="" src="<%=path%>/mobile/images/2.jpg" ></a></li>
                    <li><a title="" href="#"><img alt="" src="<%=path%>/mobile/images/3.jpg" ></a></li>
                </ul>
                
                <!--轮播按钮-->
                <ul class="slideimg-btn" id="slideimg_btn">
                    <li class="slidebtn-active"><div></div></li>
                    <li><div></div></li>
                    <li><div></div></li>
                </ul>
            </div>
        </div>
   </section>
   
   
   <!--服务入口面板-->
    <ul id="serve_grid" class="serve-grid-wrap">
        <li>
        	<div class="serve-wrap">
                <div class="serve-item">
                    <a href="#" title="">
                        <div>
                          <img src="<%=path%>/mobile/images/shuaka.png" alt="">
                        </div>
                        <span>我要刷卡</span>
                    </a>
                </div>
            </div>
        </li>
        <li>
        	<div class="serve-wrap">
                <div class="serve-item">
                    <a href="#" title="">
                        <div>
                          <img src="<%=path%>/mobile/images/fuwu.png" alt="">
                        </div>
                        <span>银行服务</span>
                    </a>
                </div>
            </div>
        </li>
        <li>
        	<div class="serve-wrap">
                <div class="serve-item">
                    <a href="#" title="">
                        <div>
                          <img src="<%=path%>/mobile/images/daikuan.png" alt="">
                        </div>
                        <span>我要贷款</span>
                    </a>
                </div>
            </div>
        </li>
        <li>
        	<div class="serve-wrap">
                <div class="serve-item">
                    <a href="#" title="">
                        <div>
                          <img src="<%=path%>/mobile/images/zixun.png" alt="">
                        </div>
                        <span>理财资讯</span>
                    </a>
                </div>
            </div>
        </li>
        <li>
        	<div class="serve-wrap">
                <div class="serve-item">
                    <a href="#" title="">
                        <div>
                          <img src="<%=path%>/mobile/images/gonglue.png" alt="">
                        </div>
                        <span>提额攻略</span>
                    </a>
                </div>
            </div>
        </li>
        <li>
        	<div class="serve-wrap">
                <div class="serve-item">
                    <a href="#" title="">
                        <div>
                          <img src="<%=path%>/mobile/images/liwu.png" alt="">
                        </div>
                        <span>礼物</span>
                    </a>
                </div>
            </div>
        </li>
        <li>
        	<div class="serve-wrap">
                <div class="serve-item">
                    <a href="#" title="">
                        <div>
                          <img src="<%=path%>/mobile/images/shuaka.png" alt="">
                        </div>
                        <span>其他服务</span>
                    </a>
                  </div>
            </div>
          </li>
        <li>
        	<div class="serve-wrap">
                <div class="serve-item">
                    <a href="#" title="">
                        <div>
                          <img src="<%=path%>/mobile/images/fuwu.png" alt="">
                        </div>
                        <span>其他服务</span>
                    </a>
                  </div>
            </div>
        </li>
	</ul>
   
<script src="<%=path%>/js/lib/require/require.js" data-main="<%=path%>/mobile/js/serve/serve.js"></script>
</body>
</html>
