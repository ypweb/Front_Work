'use strict';

/*控制器设置基本配置*/
angular.module('app')
    .controller('AppController', ['toolUtil','loginService',function(toolUtil,loginService) {
        var self=this;

        /*设置提示*/
        $.extend(true,toastr.options,{
            positionClass: "toast-top-center"
        });
        /*绑定提交*/
        this.submitLogin=function () {
            /*校验成功*/
            toolUtil.requestHttp({
                url:'/sysuser/login',
                method:'post',
                set:true,
                data:self.login
            }).then(function(resp){
                    self.isLogin=loginService.reqAction(resp,self.login.username);
                    /*导航栏*/
                    if(self.isLogin){
                        /*在加载动画期间，延迟请求菜单数据*/
                        setTimeout(function () {
                            self.headeritem=loginService.getMenuData();
                        },500);
                    }else{
                        self.headeritem=[];
                    }
                },
                function(resp){
                    self.isLogin=false;
                    self.headeritem=[];
                    var message=resp.data.message;
                    if(typeof message !=='undefined'&&message!==''){
                        toastr.error(message);
                    }else{
                        toastr.error('登录失败');
                    }
                });
            return false;
        };
        /*获取验证码*/
        this.getValidCode=function () {
            loginService.getValidCode({
                wrap:'validcode_wrap',
                url:"/sysuser/identifying/code"
            });
        };
        /*退出*/
        this.loginOut=function (flag) {
            /*不合格缓存信息，需要清除缓存*/
            var isout=loginService.loginOut();
            /*更新模型*/
            if(isout){
                self.isLogin=false;
                self.login={
                    username:'',
                    password:'',
                    identifyingCode:''
                };
            }
            /*提示退出信息*/
            if(typeof flag!=='undefined'&&flag){
                toolUtil.loginTips({
                    reload:true
                });
            }else{
                toolUtil.loginTips();
            }
        };



        /*初始化加载*/
        /*兼容性控制*/
        this.isSupport=toolUtil.isSupport();

        if(this.isSupport){
            /*登陆控制*/
            this.isLogin=loginService.isLogin()/*是否存在*/;
            this.login={
                username:'',
                password:'',
                identifyingCode:''
            };
            /*导航栏*/
            if(this.isLogin){
                this.headeritem=loginService.getMenuData();
            }else{
                this.headeritem=[];
                this.login={
                    username:'',
                    password:'',
                    identifyingCode:''
                };
            }
        }

    }]);
