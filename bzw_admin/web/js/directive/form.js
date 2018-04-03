/*表单指令*/
(function () {
    'use strict';

    /*定义指令*/
    angular
        .module('view')
        .directive('viewMobilePhone', viewMobilePhone)/*手机号码指令，手机格式化指令*/
        .directive('viewBankCard', viewBankCard)/*银行卡指令，银行卡格式化指令*/
        .directive('viewCompareEqual', viewCompareEqual)/*比较指令，比较是否相等*/
        .directive('viewCompareUnequal', viewCompareUnequal)/*比较指令，比较是否不相等*/
        .directive('viewDoublePoint', viewDoublePoint)/*格式化两位小数*/
        .directive('viewTelePhone4', viewTelePhone4)/*格式化电话号码(4位)*/
        .directive('viewTelePhone3', viewTelePhone3)/*格式化电话号码(3位)*/
        .directive('viewIntNumber', viewIntNumber)/*只能输入整型数字*/
        .directive('viewAllNumber', viewAllNumber)/*只能输入数字(包括小数)*/
        .directive('viewSinglePercent', viewSinglePercent)/*单一百分百*/
        .directive('viewRelationPercent', viewRelationPercent)/*组合(关联)百分百*/
        .directive('viewFilterHtmlIllegal', viewFilterHtmlIllegal)/*html过滤，非法html指令*/
        .directive('viewFilterIllegal', viewFilterIllegal)/*字符过滤，非法字符指令*/;


    /*指令依赖注入*/
    viewMobilePhone.$inject = ['toolUtil'];
    viewBankCard.$inject = ['toolUtil'];
    viewCompareEqual.$inject = ['toolUtil'];
    viewCompareUnequal.$inject = ['toolUtil'];
    viewDoublePoint.$inject = ['toolUtil'];
    viewTelePhone4.$inject = ['toolUtil'];
    viewTelePhone3.$inject = ['toolUtil'];
    viewRelationPercent.$inject = ['toolUtil'];
    viewFilterHtmlIllegal.$inject = ['toolUtil'];
    viewFilterIllegal.$inject = ['toolUtil'];


    /*指令实现*/
    /*手机号码指令，手机格式化指令*/
    /*
     * demo:
     * <input type="text" data-view-mobile-phone="" />
     * */
    function viewMobilePhone(toolUtil) {
        return {
            replace: false,
            restrict: 'EA',
            require: 'ngModel',
            link: mobilePhone
        };

        /*link实现*/
        function mobilePhone(scope, elem, attrs, ctrl) {
            /*绑定事件*/
            angular.element(elem).bind('keyup focusout', function ($event) {
                var etype = $event.type,
                    self = this,
                    phoneno;
                if (etype === 'keyup') {
                    phoneno = self.value.replace(/\D*/g, '');
                    if (phoneno === '') {
                        self.value = '';
                        return false;
                    }
                    self.value = toolUtil.phoneFormat(phoneno);
                } else if (etype === 'focusout') {
                    /*手动执行脏检查*/
                    scope.$apply(function () {
                        ctrl.$setValidity("mpformaterror", toolUtil.isMobilePhone(self.value));
                    });
                }
            });
        }
    }

    /*银行卡指令，银行卡格式化指令*/
    /*
     * demo:
     * <input type="text" data-view-bank-card="" />
     * */
    function viewBankCard(toolUtil) {
        return {
            replace: false,
            restrict: 'EA',
            require: 'ngModel',
            link: bankCard
        };

        /*link实现*/
        function bankCard(scope, elem, attrs, ctrl) {
            /*绑定事件*/
            angular.element(elem).bind('keyup focusout', function ($event) {
                var etype = $event.type,
                    self = this;
                if (etype === 'keyup') {
                    var bankno = self.value.replace(/\D*/g, '');
                    if (bankno === '') {
                        self.value = '';
                        return false;
                    }
                    self.value = toolUtil.cardFormat(bankno);
                } else if (etype === 'focusout') {
                    /*手动执行脏检查*/
                    scope.$apply(function () {
                        ctrl.$setValidity("bcformaterror", toolUtil.isBankCard(self.value));
                    });
                }
            });
        }
    }

    /*比较指令，比较是否相等*/
    /*
     * demo:
     * <input type="text" data-view-compare-equal="" />
     * */
    function viewCompareEqual(toolUtil) {
        return {
            replace: false,
            restrict: 'EA',
            require: 'ngModel',
            link: compareEqual
        };

        /*link实现*/
        function compareEqual(scope, elem, attrs, ctrl) {
            /*绑定事件*/
            var equaldom = document.getElementById(attrs.equaldom);
            angular.element(elem).bind('keyup', function ($event) {
                var etype = $event.type,
                    self = this;
                if (etype === 'keyup') {
                    var str1 = toolUtil.trims(equaldom.value),
                        str2 = toolUtil.trims(self.value);
                    if (str2 !== '') {
                        /*手动执行脏检查*/
                        scope.$apply(function () {
                            ctrl.$setValidity("equalerror", str1 === str2);
                        });
                    } else {
                        /*手动执行脏检查*/
                        scope.$apply(function () {
                            ctrl.$setValidity("equalerror", true);
                        });
                    }
                }
            });
        }
    }

    /*比较指令，比较是否不相等*/
    /*
     * demo:
     * <input type="text" data-view-compare-unequal="" />
     * */
    function viewCompareUnequal(toolUtil) {
        return {
            replace: false,
            restrict: 'EA',
            require: 'ngModel',
            link: compareUnequal
        };

        /*link实现*/
        function compareUnequal(scope, elem, attrs, ctrl) {
            /*绑定事件*/
            var equaldom = document.getElementById(attrs.equaldom);
            angular.element(elem).bind('keyup', function ($event) {
                var etype = $event.type,
                    self = this;
                if (etype === 'keyup') {
                    var str1 = toolUtil.trims(equaldom.value),
                        str2 = toolUtil.trims(self.value);
                    /*手动执行脏检查*/
                    if (str2 !== '') {
                        scope.$apply(function () {
                            ctrl.$setValidity("unequalerror", str1 !== str2);
                        });
                    } else {
                        scope.$apply(function () {
                            ctrl.$setValidity("unequalerror", true);
                        });
                    }
                }
            });
        }
    }

    /*格式化两位小数*/
    /*
     * demo:
     * <input type="text" data-view-double-point="" />
     * */
    function viewDoublePoint(toolUtil) {
        return {
            replace: false,
            restrict: 'EA',
            require: 'ngModel',
            link: doublePoint
        };

        /*link实现*/
        function doublePoint(scope, elem, attrs, ctrl) {
            /*绑定事件*/
            var limit = attrs.limit || 12;
            angular.element(elem).bind('focusout', function ($event) {
                var etype = $event.type,
                    self = this;
                if (etype === 'focusout') {
                    /*手动执行脏检查*/
                    scope.$apply(function () {
                        self.value = toolUtil.moneyCorrect(self.value, limit, true)[0];
                    });
                }
            });
        }
    }

    /*格式化电话号码(4位)*/
    /*
     * demo:
     * <input type="text" data-view-tele-phone4="" />
     * */
    function viewTelePhone4(toolUtil) {
        return {
            replace: false,
            restrict: 'EA',
            require: 'ngModel',
            link: telePhone4
        };

        /*link实现*/
        function telePhone4(scope, elem, attrs, ctrl) {
            /*绑定事件*/
            angular.element(elem).bind('keyup focusout', function ($event) {
                var etype = $event.type,
                    self = this;
                if (etype === 'keyup') {
                    var phoneno = self.value.replace(/\D*/g, '');
                    if (phoneno === '') {
                        self.value = '';
                        return false;
                    }
                    self.value = toolUtil.telePhoneFormat(this.value, 4);
                } else if (etype === 'focusout') {
                    /*手动执行脏检查*/
                    scope.$apply(function () {
                        ctrl.$setValidity("tpformaterror", toolUtil.isTelePhone(self.value, 4));
                    });
                }
            });
        }
    }

    /*格式化电话号码(3位)*/
    /*
     * demo:
     * <input type="text" data-view-tele-phone3="" />
     * */
    function viewTelePhone3(toolUtil) {
        return {
            replace: false,
            restrict: 'EA',
            require: 'ngModel',
            link: telePhone3
        };

        /*link实现*/
        function telePhone3(scope, elem, attrs, ctrl) {
            /*绑定事件*/
            angular.element(elem).bind('keyup focusout', function ($event) {
                var etype = $event.type,
                    self = this;
                if (etype === 'keyup') {
                    var phoneno = self.value.replace(/\D*/g, '');
                    if (phoneno === '') {
                        self.value = '';
                        return false;
                    }
                    self.value = toolUtil.telePhoneFormat(self.value, 3);
                } else if (etype === 'focusout') {
                    /*手动执行脏检查*/
                    scope.$apply(function () {
                        ctrl.$setValidity("tpformaterror", toolUtil.isTelePhone(self.value, 3));
                    });
                }
            });
        }
    }

    /*只能输入整型数字*/
    /*
     * demo:
     * <input type="text" data-view-int-number="" />
     * */
    function viewIntNumber() {
        return {
            replace: false,
            restrict: 'EA',
            require: 'ngModel',
            link: intNumber
        };

        /*link实现*/
        function intNumber(scope, elem, attrs, ctrl) {
            /*绑定事件*/
            angular.element(elem).bind('focusout', function ($event) {
                var etype = $event.type,
                    self = this;

                if (etype === 'focusout') {
                    var data = self.value.replace(/\D*/g, '');
                    if (data === '') {
                        self.value = '';
                        return false;
                    }
                    scope.$apply(function () {
                        self.value = data;
                    });
                }
            });
        }
    }

    /*只能输入数字(包括小数)*/
    /*
     * demo:
     * <input type="text" data-view-all-number="" />
     * */
    function viewAllNumber() {
        return {
            replace: false,
            restrict: 'EA',
            require: 'ngModel',
            link: allNumber
        };

        /*link实现*/
        function allNumber(scope, elem, attrs, ctrl) {
            /*绑定事件*/
            angular.element(elem).bind('focusout', function ($event) {
                var etype = $event.type,
                    self = this;

                if (etype === 'focusout') {
                    var data = self.value.replace(/[^0-9\.]*/g, '');
                    if (data === '') {
                        self.value = '';
                        return false;
                    }
                    if (data.indexOf('.') !== -1) {
                        (function () {
                            data = data.split('.');
                            var len = data.length;
                            if (len !== 2) {
                                data.length = 2;
                            }
                            if (data[0] === '') {
                                data = data[1];
                            } else if (data[1] === '') {
                                data = data[0];
                            } else {
                                data = data.join('.');
                            }
                        }());
                    }
                    scope.$apply(function () {
                        self.value = data;
                    });
                }
            });
        }
    }

    /*单一百分百*/
    /*
     * demo:
     * <input type="text" data-view-single-percent="" />
     * */
    function viewSinglePercent() {
        return {
            replace: false,
            restrict: 'EA',
            require: 'ngModel',
            link: singlePercent
        };

        /*link实现*/
        function singlePercent(scope, elem, attrs, ctrl) {
            /*绑定事件*/
            angular.element(elem).bind('focusout', function ($event) {
                var etype = $event.type,
                    self = this,
                    data;

                if (etype === 'focusout') {
                    data = self.value.replace(/[^0-9\.]*/g, '');
                    if (data === '') {
                        self.value = '';
                        return false;
                    }
                    if (data.indexOf('.') !== -1) {
                        (function () {
                            data = data.split('.');
                            var len = data.length;
                            if (len !== 2) {
                                data.length = 2;
                            }
                            if (data[0] === '') {
                                data = data[1];
                            } else if (data[1] === '') {
                                data = data[0];
                            } else {
                                data = data.join('.');
                            }
                        }());
                    }
                    if (data === '' || isNaN(data)) {
                        self.value = '';
                        return false;
                    }
                    data = (data * 10000) / 10000;
                    if (data > 100) {
                        data = 100;
                    }
                    scope.$apply(function () {
                        self.value = data;
                    });
                }
            });


        }
    }

    /*组合(关联)百分百*/
    /*
     * demo:
     * <input type="text" data-view-relation-percent="" />
     * */
    function viewRelationPercent(toolUtil) {
        return {
            replace: false,
            restrict: 'EA',
            require: 'ngModel',
            link: relationPercent
        };

        /*link实现*/
        function relationPercent(scope, elem, attrs, ctrl) {

            var relation = attrs.relation/*关联参数*/,
                isrelation = false/*是否是关联*/,
                current = attrs.current || attrs.id/*当前引用标识*/,
                relationlen = 0,
                currentindex = -1,
                relationarr,
                relationdom = [];

            /*判断是否是关联*/
            if (typeof relation !== 'undefined') {
                (function () {
                    relationarr = relation.split(',');
                    currentindex = toolUtil.arrIndex(current, relationarr);
                    relationlen = relationarr.length;
                    var i = 0;
                    if (relationlen >= 2) {
                        isrelation = true;
                        for (i; i < relationlen; i++) {
                            relationdom.push(document.getElementById(relationarr[i]));
                        }
                    }
                }());
            }


            /*绑定事件*/
            angular.element(elem).bind('focusout', function ($event) {
                var etype = $event.type,
                    self = this,
                    data;

                if (etype === 'focusout') {
                    data = self.value.replace(/[^0-9\.]*/g, '');
                    if (data === '') {
                        self.value = '';
                        return false;
                    }
                    if (data.indexOf('.') !== -1) {
                        (function () {
                            data = data.split('.');
                            var len = data.length;
                            if (len !== 2) {
                                data.length = 2;
                            }
                            if (data[0] === '') {
                                data = data[1];
                            } else if (data[1] === '') {
                                data = data[0];
                            } else {
                                data = data.join('.');
                            }
                        }());
                    }
                    if (data === '' || isNaN(data)) {
                        self.value = '';
                        return false;
                    }
                    data = (data * 10000) / 10000;
                    if (data > 100) {
                        data = 100;
                    }
                    if (isrelation) {
                        (function () {
                            var j = 0,
                                res = 0,
                                tempstr = 0,
                                keep = 0;
                            if (data === 100) {
                                /*当前设置为100%时*/
                                for (j; j < relationlen; j++) {
                                    if (j !== currentindex) {
                                        relationdom[j].value = '0';
                                    }
                                }
                            } else {
                                /*当前设置为其他情况时*/
                                for (j; j < relationlen; j++) {
                                    /*计算非当前值*/
                                    tempstr = relationdom[j].value;
                                    if (tempstr !== '') {
                                        if ((res * 10000 + tempstr * 10000) > 100 * 10000) {
                                            keep = (res * 10000 + tempstr * 10000) - 100 * 10000;
                                            var k = j + 1;
                                            if (j === currentindex) {
                                                data = (tempstr * 10000 - keep) / 10000;
                                                if (k < relationlen) {
                                                    for (k; k < relationlen; k++) {
                                                        relationdom[k].value = '0';
                                                    }
                                                }
                                            } else {
                                                relationdom[j].value = (tempstr * 10000 - keep) / 10000;
                                                if (k < relationlen) {
                                                    for (k; k < relationlen; k++) {
                                                        if (j !== currentindex) {
                                                            relationdom[k].value = '0';
                                                        }
                                                    }
                                                }
                                            }
                                            break;
                                        } else {
                                            res = (res * 10000 + tempstr * 10000) / 10000;
                                        }
                                    }
                                }
                            }
                        }());
                    }
                    scope.$apply(function () {
                        self.value = data;
                    });
                }
            });
        }
    }

    /*html过滤，非法html指令*/
    /*
     * demo:
     * <input type="text" data-view-filter-html-illegal="" />
     * */
    function viewFilterHtmlIllegal(toolUtil) {
        return {
            replace: false,
            restrict: 'EA',
            require: 'ngModel',
            link: filterHtmlIllegal
        };

        /*link实现*/
        function filterHtmlIllegal(scope, elem, attrs, ctrl) {
            /*绑定事件*/
            angular.element(elem).bind('keyup', function () {
                var self = this;
                self.value = toolUtil.trimHtmlIllegal(self.value);
            });
        }
    }

    /*字符过滤，非法字符指令*/
    /*
     * demo:
     * <input type="text" data-view-filter-illegal="" />
     * */
    function viewFilterIllegal(toolUtil) {
        return {
            replace: false,
            restrict: 'EA',
            require: 'ngModel',
            link:filterIllegal
        };

        /*link实现*/
        function filterIllegal(scope, elem, attrs, ctrl) {
            /*绑定事件*/
            angular.element(elem).bind('keyup', function () {
                var self = this;
                self.value = toolUtil.trimIllegal(self.value);
            });
        }
    }


}());