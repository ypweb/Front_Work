<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
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
<meta name="description" content="信用卡管理--文章详情">
<meta name="keywords" content="信用卡管理--文章详情">
<title>信用卡管理--文章详情</title>
<link rel="stylesheet" type="text/css" href="<%=path %>/mobile/css/community_detail.css">
</head>
<body>

    <!--文章详情-->
    <section class="article-show-wrap">
    		
        
        <!--标题-->
    		<h1>${view.title }</h1>
        <span>${view.createTimeStr }</span>
        <span>${view.browseSum }</span>
        <span>${view.commentSum }</span>
        
        
        
        <!--详情-->
        <div class="article-show">${view.content }</div>
    </section>


</body>
</html>
