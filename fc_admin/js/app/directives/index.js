angular.module('app')
    /*首页快捷方式指令*/
    .directive('uiMainQuick', ['$timeout', function ($timeout) {
        var outid = null;
        return {
            replace: false,
            restrict: 'EC',
            scope: {
                action: '&action'
            },
            template: '<div class="admin-welcome-banner"><img ng-src="images/index_banner.jpg" alt="" /></div>\
                        <h3 class="admin-layout-theme3">快捷入口</h3>\
                        <ul class="admin-quick-icon">\
                          <li ng-repeat="i in quick">\
                            <div class="g-br5" data-id="{{i.id}}" data-code="{{i.code}}" href="" ui-sref="{{i.href}}">\
                                <img alt="" ng-src="images/{{i.src}}" />\
                                <span>{{i.name}}</span>\
                            </div>\
                          </li>\
                        </ul>',
            link: function (scope, element, attrs) {
                var quickimg = scope.action();
                if (quickimg) {
                    if (quickimg.length === 0) {
                        outid = $timeout(function () {
                            scope.$apply(function () {
                                scope.quick = doQuickImage(scope.action());
                                if (outid !== null) {
                                    $timeout.cancel(outid);
                                    outid = null;
                                }
                            });
                        }, 500);
                    } else {
                        scope.quick = doQuickImage(quickimg);
                    }
                } else {
                    scope.quick = [];
                }
            }
        };

        /*处理图像路径*/
        function doQuickImage(arr) {
            var len = arr.length,
                imgsrc_map = {
                    'app': 0/*首页*/,
                    'organization': 1/*机构*/,
                    'struct': 1/*机构*/,
                    'order': 2/*订单*/,
                    'finance': 3/*财务*/,
                    'equipment': 4/*设备*/,
                    'setting': 5/*设置*/,
                    'invoice': 6/*发货*/,
                    'purchase': 7/*采购*/,
                    'warehouse': 8/*仓库*/,
                    'equity': 9/*股权投资人*/
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
   