/**
 * Created by zhuhao on 2018/8/22.
 */
define([], function () {
    require(["css!BaseCssDir/base.css",
        "css!BaseCssDir/font.css",
        "css!BaseCssDir/global.css"],function () {
        $("body").children().attr("style","");
    })

})