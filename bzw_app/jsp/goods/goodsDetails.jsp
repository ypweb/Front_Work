<%@ page language="java" import="java.util.*" pageEncoding="utf-8"%>
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
    <meta name="description" content="图文详情">
    <meta name="keywords" content="图文详情">
    <title>图文详情</title>
    <link rel="stylesheet" type="text/css" href="<%=path %>/css/goods_detail.css">
  </head>
  <body>
  <section class="goods-detail-show">
   ${imageText}
  </section>
  </body>
</html>