/*依赖引入*/
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';


/*引入配置类*/
import {BaseConfig} from './config/base.config';
/*引入工具类*/
import {ToolUtil} from './tool/tool.util';

/*引入静态示例*/
import {DemoBtnComponent} from './demo/btn/btn.component';
import {DemoThemeComponent} from './demo/theme/theme.component';
import {DemoListgroupComponent} from './demo/listgroup/listgroup.component';
import {DemoThumbnailComponent} from './demo/thumbnail/thumbnail.component';
import {DemoOrderComponent} from './demo/order/order.component';
import {DemoGridlabelComponent} from './demo/gridlabel/gridlabel.component';
import {DemoAttrlabelComponent} from './demo/attrlabel/attrlabel.component';
import {DemoActionitemComponent} from './demo/actionitem/actionitem.component';
import {DemoFormComponent} from './demo/form/form.component';
import {DemoUploadComponent} from './demo/upload/upload.component';
import {DemoSlideComponent} from './demo/slide/slide.component';

/*引入动态示例*/

/*导入服务*/
let base_config = BaseConfig.getBaseConfig();
if (base_config.environment === 'dev') {
  console.log(base_config.url);
  let util=new ToolUtil();
  console.log(util.supportStorage());
  console.log(util.supportBox());
} else {
  console.log(base_config.url);
}

@NgModule({
  declarations: [
    /*静态demo*/
    AppComponent/*根应用*/,
    DemoBtnComponent/*测试--按钮组件*/,
    DemoThemeComponent/*测试--主题组件*/,
    DemoListgroupComponent/*测试--组合列表组件*/,
    DemoThumbnailComponent/*测试--缩略图组件*/,
    DemoOrderComponent/*测试--订单组件*/,
    DemoGridlabelComponent/*测试--弹出面板组件*/,
    DemoAttrlabelComponent/*测试--属性面板组件*/,
    DemoActionitemComponent/*测试--操作条组件*/,
    DemoFormComponent/*测试--表单组件*/,
    DemoUploadComponent/*测试--文件上传组件*/,
    DemoSlideComponent/*测试--轮播组件*/,
    DemoThemeComponent/*测试--主题组件*/
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
  /*
    providers: Provider[]这个选项是一个数组,需要我们列出我们这个模块的一些需要共用的服务,然后我们就可以在这个模块的各个组件中通过依赖注入使用了.
    declarations: Array<Type<any>|any[]>数组类型的选项, 用来声明属于这个模块的指令,管道等等,然后我们就可以在这个模块中使用它们了.
    imports: Array<Type<any>|ModuleWithProviders|any[]>数组类型的选项,我们的模块需要依赖的一些其他的模块,这样做的目的使我们这个模块可以直接使用别的模块提供的一些指令,组件等等.
    exports: Array<Type<any>|any[]>数组类型的选项,我们这个模块需要导出的一些组件,指令,模块等;如果别的模块导入了我们这个模块,那么别的模块就可以直接使用我们在这里导出的组件,指令模块等.
    entryComponents: Array<Type<any>|any[]>数组类型的选项,指定一系列的组件,这些组件将会在这个模块定义的时候进行编译Angular会为每一个组件创建一个ComponentFactory然后把它存储在ComponentFactoryResolver
    bootstrap: Array<Type<any>|any[]>数组类型选项, 指定了这个模块启动的时候应该启动的组件.当然这些组件会被自动的加入到entryComponents中去
    schemas: Array<SchemaMetadata|any[]>不属于Angular的组件或者指令的元素或者属性都需要在这里进行声明.
    id: string字符串类型的选项,模块的隐藏ID,它可以是一个名字或者一个路径;用来在getModuleFactory区别模块,如果这个属性是undefined那么这个模块将不会被注册.
*/
})


export class AppModule {

}
