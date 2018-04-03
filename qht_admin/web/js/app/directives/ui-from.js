/*表单指令*/
angular.module('ui.form',[])
    /*手机号码指令，手机格式化指令*/
    .directive('uiMobilePhone',['toolUtil',function(toolUtil) {
        return {
            replace:false,
            restrict: 'EC',
            require: 'ngModel',
            link:function (scope, elem, attrs,ctrl) {
                /*绑定事件*/
                elem.on('keyup focusout',function (e){
                    var etype=e.type;
                    if(etype==='keyup'){
                        var phoneno=this.value.replace(/\D*/g,'');
                        if(phoneno===''){
                            this.value='';
                            return false;
                        }
                        this.value=toolUtil.phoneFormat(this.value);
                    }else if(etype==='focusout'){
                        /*手动执行脏检查*/
                        scope.$apply(function(){
                            ctrl.$setValidity("mpformaterror",toolUtil.isMobilePhone(elem.val()));
                        });
                    }
                });
            }
        }
    }])
    /*格式化两位小数*/
    .directive('uiDoublePoint',['toolUtil',function(toolUtil) {
        return {
            replace:false,
            restrict: 'EC',
            require: 'ngModel',
            link:function (scope, elem, attrs,ctrl) {
                /*绑定事件*/
                elem.on('focusout',function (e){
                    var etype=e.type;
                    if(etype==='focusout'){
                        /*手动执行脏检查*/
                        scope.$apply(function(){
                            elem.val(toolUtil.moneyCorrect(elem.val(),12,true)[0]);
                        });
                    }
                });
            }
        }
    }]);