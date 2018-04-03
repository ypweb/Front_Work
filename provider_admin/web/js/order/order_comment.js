(function ($) {
    'use strict';
    $(function () {

        var table = null/*数据展现*/;

        /*初始化数据*/
        if (public_tool.initMap.isrender) {
            /*菜单调用*/
            var logininfo = public_tool.initMap.loginMap;
            public_tool.loadSideMenu(public_vars.$mainmenu, public_vars.$main_menu_wrap, {
                url: '../../json/menu.json',
                async: false,
                type: 'post',
                datatype: 'json'
            });


            /*dom引用和相关变量定义*/
            var $order_manage_wrap = $('#order_manage_wrap')/*表格*/,
                module_id = 'yttx-order-comment'/*模块id，主要用于本地存储传值*/,
                dia = dialog({
                    zIndex: 2000,
                    title: '温馨提示',
                    okValue: '确定',
                    width: 300,
                    ok: function () {
                        this.close();
                        return false;
                    },
                    cancel: false
                })/*一般提示对象*/,
                $admin_page_wrap = $('#admin_page_wrap')/*分页数据*/;


            /*列表请求配置*/
            var commentmanage_page = {
                    page: 1,
                    pageSize: 10,
                    total: 0
                },
                commentmanage_config = {
                    $order_manage_wrap: $order_manage_wrap,
                    $admin_page_wrap: $admin_page_wrap,
                    config: {
                        processing: true, /*大消耗操作时是否显示处理状态*/
                        deferRender: true, /*是否延迟加载数据*/
                        autoWidth: true, /*是否*/
                        paging: false,
                        ajax: {
                            url: "http://10.0.5.226:8082/yttx-providerbms-api/goodscomment/mycomment/list",
                            dataType: 'JSON',
                            method: 'post',
                            dataSrc: function (json) {
                                var code = parseInt(json.code, 10);
                                if (code !== 0) {
                                    if (code === 999) {
                                        /*清空缓存*/
                                        public_tool.loginTips(function () {
                                            public_tool.clear();
                                            public_tool.clearCacheData();
                                        });
                                    }
                                    console.log(json.message);
                                    return [];
                                }
                                var result = json.result;
                                /*设置分页*/
                                commentmanage_page.page = result.page;
                                commentmanage_page.pageSize = result.pageSize;
                                commentmanage_page.total = result.count;
                                /*分页调用*/
                                $admin_page_wrap.pagination({
                                    pageSize: commentmanage_page.pageSize,
                                    total: commentmanage_page.total,
                                    pageNumber: commentmanage_page.page,
                                    onSelectPage: function (pageNumber, pageSize) {
                                        /*再次查询*/
                                        var param = commentmanage_config.config.ajax.data;
                                        param.page = pageNumber;
                                        param.pageSize = pageSize;
                                        commentmanage_config.config.ajax.data = param;
                                        getColumnData(commentmanage_page, commentmanage_config);
                                    }
                                });
                                return result.list;
                            },
                            data: {
                                providerId: decodeURIComponent(logininfo.param.providerId),
                                userId: decodeURIComponent(logininfo.param.userId),
                                token: decodeURIComponent(logininfo.param.token),
                                page: 1,
                                pageSize: 10
                            }
                        },
                        info: false,
                        searching: true,
                        ordering: true,
                        columns: [
                            {
                                "data": "goodsThumbnail",
                                "render": function (data, type, full, meta) {
                                    var img = data,
                                        str = '';
                                    if (img.indexOf('qiniucdn.com') !== -1) {
                                        str = '<div class="admin-goods-thumbnail2">\
														<div class="goods-img">\
																<img alt="" src="' + img + '?imageView2/1/w/80/h/80" />\
														</div>\
														<div class="goods-remark">' + full["attribute"] + '</div>\
														<div class="goods-theme">' + full["goodsName"] + '</div>\
												 </div>';
                                    } else {
                                        img = validImages(data);
                                        if (img !== '') {
                                            str = '<div class="admin-goods-thumbnail2">\
															<div class="goods-img">\
																	<img alt="" src="' + img + '" />\
															</div>\
															<div class="goods-remark">' + full["attribute"] + '</div>\
															<div class="goods-theme">' + full["goodsName"] + '</div>\
												 	 </div>';
                                        } else {
                                            str = '<div class="admin-goods-thumbnail2">\
															<div class="goods-remark">' + full["attribute"] + '</div>\
															<div class="goods-theme">' + full["goodsName"] + '</div>\
													 </div>';
                                        }
                                    }
                                    return str;
                                }
                            },
                            {
                                "data": "commentTime",
                                "render": function (data, type, full, meta) {
                                    var str = '<ul class="admin-order-subitem2">\
											<li>评价内容:' + full["content"] + '</li>\
											<li>评价时间:' + data + '</li>\
											<li>评价图片:<div class="admin-img"><img alt="" src="' + (full["pictures"].join('" alt=""></div><div class="admin-img"><img src="')) + '" alt="" /></div></li>\
										</ul>';
                                    return str;
                                }
                            }/*,
							{
								"data":"replyTime",
								"render":function(data, type, full, meta ){
									var str='<ul class="admin-order-subitem2">\
											<li>回复内容: '+full["replyContent"]+'</li>\
											<li>回复时间: '+data+'</li>\
											<li>回复人: '+full["replyUserName"]+'</li>\
										</ul>';
									return str;
								}
							}*/
                        ]
                    }
                };


            /*初始化请求*/
            getColumnData(commentmanage_page, commentmanage_config);


        }


        /*获取数据*/
        function getColumnData(page, opt) {
            if (table === null) {
                if (!public_tool.isSameDomain("http://10.0.5.226:8082")) {
                    return false;
                }
                table = opt.$order_manage_wrap.DataTable(opt.config);
            } else {
                table.ajax.config(opt.config.ajax).load();
            }
        }


        /*判断图片合法格式*/
        function validImages(value) {
            var str = '';
            var tempimg = value,
                imgreg = /(jpeg|jpg|gif|png)/g;

            if (tempimg.indexOf('.') !== -1) {
                if (imgreg.test(tempimg)) {
                    str = value;
                } else {
                    str = '';
                }
            } else {
                str = '';
            }
            return str;
        }


    });


})(jQuery);