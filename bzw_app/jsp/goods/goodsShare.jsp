  <%@ page language="java" import="java.util.*" pageEncoding="utf-8"%>
    <%@ page import="java.util.*,com.yttx.goodsC.facade.view.GoodsCommentView" %>
      <%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
String imageSrc = request.getAttribute("imageSrc")==null?null:request.getAttribute("imageSrc").toString();
String imageTitle = request.getAttribute("imageTitle")==null?null:request.getAttribute("imageTitle").toString();
String commentCount = request.getAttribute("commentCount")==null?null:request.getAttribute("commentCount").toString();
List<GoodsCommentView> list = request.getAttribute("commentList")==null?null:(List<GoodsCommentView>)request.getAttribute("commentList");
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
    <title>布住网</title>
    <link rel="stylesheet" type="text/css" href="<%=path %>/css/goods_share.css">
    </head>
    <body class="btnb-gap-wrap">

    <%if(imageTitle==null){%>
        <!--为空情况-->
        <section class="share-null-wrap"></section>

    <%}else{ %>

        <!--头部-->
        <header class="app-header">
            <p class="theme">商品详情</p>
        </header>


        <!--分享组件--banner(注:只取一张图)-->
        <section class="share-plugin-bannerwrap">
            <img alt="" src="<%=imageSrc%>">
        </section>

        <!--分享组件--标题，价格组件（注:只要标题，不要价格）-->
        <section class="share-plugin-titlewrap">
            <div>
                <p><%=imageTitle%></p>
            </div>
        </section>


        <!--评论（注:<dd>为循环列表）-->
        <section class="share-comment-wrap">
            <h3>商品评论(<%=commentCount%>)</h3>
            <dl>
              <%
               GoodsCommentView comment = null;
                  for(int i=0;i<list.size();i++){
                      comment = list.get(i);
              %>
                  <dd>
                    <h4><%=comment.getNickName()%></h4>
                    <i><%=comment.getAddTime()%></i>
                    <span><%=comment.getContent()%></span>
                    <p><%=comment.getTypeName()%></p>
                  </dd>
              <%} %>
            </dl>
        </section>


        <!--分享详情-->
        <section class="share-show-wrap">
            <h2 class="share-title-pagr">图文详情</h2>
            <!--详情-->
            <div class="share-show">
            ${imageText}
            </div>
        </section>


        <!--下载按钮-->
        <section class="share-download-wrap">
            <a class="share-download-btn" href="http://a.app.qq.com/o/simple.jsp?pkgname=com.yttxstore">下载</a>
        </section>


    <%} %>
    </body>
    </html>