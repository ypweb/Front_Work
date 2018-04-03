angular.module('app')
    .controller('IndexController', ['loginService','testService', function (loginService,testService) {

        /*主内容侧边栏*/
        this.menuitem = testService.getMap({
            map:{
                'name':'name',
                'value':'value'
            },
            mapmin:5,
            mapmax:15
        }).list;
        
        /*获取快捷方式*/
        this.getQuickItem=function () {
            return  loginService.getMenuData();
        }
    }]);