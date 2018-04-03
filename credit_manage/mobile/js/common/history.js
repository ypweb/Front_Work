/**
name:credit_manage / history;
 author:yipin;
 date:2016-06-07;
 version:1.0.0**/
!function(){function a(a,b){var c=a.absUrl(),d=c.lastIndexOf("/"),e=c.slice(d+1),f="",g="",h=e.indexOf("."),i="";'<p class="theme">'+function(){var a="",c=b.document.title;return c&&""!==c&&(a=c,a.indexOf("-")&&(a=a.slice(a.lastIndexOf("-")+1))),a}()+"</p>";return-1!==h&&(e=e.slice(0,h)),-1!==e.indexOf("detail")?(f=b.sessionStorage.getItem("current_step"),g=e,i='<a href="'+c.slice(0,d)+"/"+f+'.html" class="prev-btn"></a>'):(f="",g=e,i=""),b.sessionStorage.setItem("prev_step",f),b.sessionStorage.setItem("current_step",g),{template:"aaaa"}}angular.module("historyApp",[]).directive("historyDirective",a),a.$inject=["$location","$window"]}();