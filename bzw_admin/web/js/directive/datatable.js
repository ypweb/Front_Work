/*公共指令集*/
(function () {
    'use strict';


    /*定义指令*/
    angular
        .module('view')/*公共指令集名称*/
        .directive('viewDataTable', viewDataTable)/*datatable数据表格指令*/;


    /*指令依赖注入*/



    /*指令实现*/
    /*datatable数据表格指令*/
    function viewDataTable() {
        return {
            replace: false,
            restrict: 'EA',
            template: '<table></table>'
        };
    }

}());
   