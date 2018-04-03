angular.module('app')
    .controller('IndexController', ['loginService', function (loginService) {

        this.quickitem = doQuickImage(loginService.getMenuData().slice(1));
        /*主内容快捷导航*/
        /*if(menudata!==null){
         this.quickitem=menudata.slice(1);
         }else{
         this.quickitem=[];
         }*/

        /*主内容侧边栏*/
        this.menuitem = []/*Mock.mock({
            'list|2-10': [{
                "name": /[a-z]{2,5}/,
                "value": /[0-9a-zA-Z]{2,10}/
            }]
        }).list*/;


        /*处理图像路径*/
        function doQuickImage(arr) {
            var len = arr.length,
                imgsrc_map = {
                    'app': 0/*首页*/,
                    'struct': 1/*机构 organization*/,
                    'organization': 1/*机构 organization*/,
                    'order': 2/*订单*/,
                    'finance': 3/*财务*/,
                    'equipment': 4/*设备*/,
                    'setting': 5/*设置*/,
                    'invoice': 6/*发货*/,
                    'purchase': 7/*采购*/,
                    'warehouse': 8/*仓库*/,
                    'equity':9/*股权投资人*/
                },
                i = 0,
                item;
            if (len !== 0) {
                for (i; i < len; i++) {
                    item = arr[i];
                    item['src'] = 'quick_' + imgsrc_map[item['href']] + '.png';
                }
            }
            return arr;
        }


    }]);