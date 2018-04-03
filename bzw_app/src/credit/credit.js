/**
 * Created by Administrator on 2016/5/31 0031.
 */
/*程序主入口*/
(function () {

    angular.module("creditApp",[]).controller("creditCtrl",creditCtrl);

    //注入
    creditCtrl.$inject=['historyApp'];

    //业务实现
    function creditCtrl(historyApp){
        var vm=this;
    }



    /*//菜单服务模块
    angular.module("menuApp",[]).controller("menuCtrl", menuCtrl);

    //业务实现
    function menuCtrl(){
        var vm=this,
            menuitem=[{
                "href":"../community/community.html",
                "class":"menu-sq"
            },{
                "href":"credit.html",
                "class":"menu-xyk"
            },{
                "href":"../community/share_community.html",
                "class":"menu-fw"
            },{
                "href":"#",
                "class":"menu-sc"
            },{
                "href":"#",
                "class":"menu-wo"
            }];
        vm.menuitem=menuitem;
    }


    //手动启动任务（非第一个任务需手动启动）
    angular.bootstrap(document.getElementById("app_menu"),["menuApp"]);*/


}());

