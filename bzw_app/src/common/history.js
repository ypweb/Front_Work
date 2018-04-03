/**
 * Created by Administrator on 2016/5/31 0031.
 */
/*程序主入口*/
(function () {


    //历史服务模块(默认启动第一个模块，其他需要手动启动)
    angular.module("historyApp",[]).directive("historyDirective",historyDir);

    //注入参数
    historyDir.$inject=['$location','$window'];
    //业务实现
    function historyDir($location,$window){
        var winurl=$location.absUrl(),
            last_prefix=winurl.lastIndexOf('/'),
            current_url=winurl.slice(last_prefix + 1),
            prev_step='',
            current_step='',
            last_suffix=current_url.indexOf('.'),
            pervstr='',
            nextstr='',
            themestr='<p class="theme">'+(function(){
                    var theme='',title=$window.document.title;
                    if(title&&title!==''){
                        theme=title;
                        if(theme.indexOf('-')){
                            theme=theme.slice(theme.lastIndexOf('-') + 1);
                        }
                    }
                    return theme;
                }())+'</p>';

        //获取当前路径名称
        if(last_suffix!==-1){
            current_url=current_url.slice(0,last_suffix);
        }

        //判断当前路径位置
        if(current_url.indexOf('detail')!==-1){
            //进入二级页面
            prev_step=$window.sessionStorage.getItem('current_step');
            current_step=current_url;

            pervstr='<a href="'+winurl.slice(0,last_prefix)+'/'+prev_step+'.html" class="prev-btn"></a>';

        }else{
            //进入一级页面
            prev_step='';
            current_step=current_url;
            pervstr='';
        }

        //将路径存储在web存储中
        $window.sessionStorage.setItem('prev_step',prev_step);
        $window.sessionStorage.setItem('current_step',current_step);


        //同步模型
        return {
         template:'aaaa'   /*template:pervstr+themestr+nextstr*/
        }
    }

}());

