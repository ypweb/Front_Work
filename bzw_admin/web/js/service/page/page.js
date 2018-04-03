/*分页服务*/
(function ($) {
    'use strict';

    /*定义或扩展模块*/
    angular
        .module('app')
        .service('pageService', pageService);

    /*服务依赖注入*/

    /*服务实现*/
    function pageService() {
        /*基本缓存*/
        var sequence = {}/*缓存序列,存放table dom节点引用*/;

        /*对外接口*/
        /*基本服务类*/
        this.initPage = initPage/*初始化分页缓存*/;
        this.resetPage = resetPage/*重置分页*/;
        this.renderPage = renderPage/*渲染分页*/;


        /*接口实现*/
        /*初始化表格缓存*/
        function initPage(config) {
            /*清除缓存*/
            for (var i in sequence) {
                sequence[i] = null/*释放内存*/;
                delete sequence[i]/*清除序列*/;
            }
            /*如果有配置则配置缓存*/
            if (config) {
                var pobj = config.sequence,
                    j = 0,
                    len = pobj.length;

                if (typeof len !== 'undefined' && len !== 0) {
                    var item,
                        index;
                    for (j; j < len; j++) {
                        item = pobj[j];
                        index = item["index"];
                        sequence[index] = $('#admin_list_page' + index);
                    }
                }
            }
        }

        /*重置分页*/
        function resetPage(config) {
            var index = config.index,
                page = config.page;

            /*不存在缓存则创建缓存*/
            if (!sequence[index]) {
                return;
            }

            /*初始化模型*/
            page.total = 0;
            page.page = 1;
            /*初始化调用分页*/
            sequence[index].pagination({
                pageNumber: page.page,
                pageSize: page.pageSize,
                total: page.total
            });
        }

        /*渲染分页*/
        function renderPage(config) {
            var index = config.index,
                page = config.page,
                count = config.count;

            /*不存在缓存则创建缓存*/
            if (!sequence[index]) {
                return;
            }

            /*初始化模型*/
            page.total = count;
            /*初始化调用分页*/
            sequence[index].pagination({
                pageNumber: page.page,
                pageSize: page.pageSize,
                total: page.total,
                onSelectPage: function (pageNumber, pageSize) {
                    /*更新模型*/
                    page.page = pageNumber;
                    page.pageSize = pageSize;
                    /*再次查询*/
                    config.onSelectPage.call(null, pageNumber, pageSize);
                }
            });
        }

    }

})(jQuery);