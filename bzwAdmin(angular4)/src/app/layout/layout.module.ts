/*配置模块*/
/*import {BASE_CONFIG} from "../config/base.config";*/

/*系统模块*/
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {NgZorroAntdModule} from 'ng-zorro-antd';


/*---模块类---*/
/*路由组件*/
import {SideMenuModule} from "./side/sidemenu.module";
import {LayoutRouterModule} from '../route/route.module';



/*---组件类---*/
/*布局组件*/
import {LayoutComponent} from './layout.component';
/*侧边栏模块*/
import {SideMenuComponent} from './side/sidemenu.component';
/*首页组件*/
import {IndexComponent} from '../web/index/index.component';
/*404组件*/
import {F0FComponent} from '../route/f0f.component';
/*示例组件*/
import {DemoSelfComponent} from '../demo/self/self.component';
import {DemoSelfThemeComponent} from "../demo/self/component/theme.component";
import {DemoSelfBtnComponent} from "../demo/self/component/btn.component";
import {DemoSelfListGroupComponent} from "../demo/self/component/listgroup.component";
import {DemoSelfThumbnailComponent} from "../demo/self/component/thumbnail.component";
import {DemoSelfOrderComponent} from "../demo/self/component/order.component";
import {DemoSelfGridLabelComponent} from "../demo/self/component/gridlabel.component";
import {DemoSelfAttrLabelComponent} from "../demo/self/component/attrlabel.component";
import {DemoSelfActionItemComponent} from "../demo/self/component/actionitem.component";
import {DemoSelfFormComponent} from "../demo/self/component/form.component";
import {DemoSelfUploadComponent} from "../demo/self/component/upload.component";
import {DemoSelfSlideComponent} from "../demo/self/component/slide.component";

/*服务类*/
import {LayoutService} from "../service/layout.service";
import {LoginService} from "../service/login.service";
import {TestService} from "../service/test.service";
import {SettingService} from "../service/setting.service";
import {LoginComponent} from "./login/login.component";
import {LoginModule} from "./login/login.module";


/**/
@NgModule({
  imports: [
    /*系统模块*/
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgZorroAntdModule.forRoot({extraFontName: 'anticon', extraFontUrl: './assets/fonts/fonts/iconfont'}),
    /*登录模块*/
    LoginModule,
    /*侧边栏模块*/
    SideMenuModule,
    /*扩展路由*/
    LayoutRouterModule
  ],
  declarations: [
    /*登录模块*/
    LoginComponent,
    /*布局组件*/
    LayoutComponent,
    /*侧边栏模块*/
    SideMenuComponent,
    /*首页组件*/
    IndexComponent,
    /*404组件*/
    F0FComponent,
    /*示例组件*/
    DemoSelfComponent,
    DemoSelfThemeComponent,
    DemoSelfBtnComponent,
    DemoSelfListGroupComponent,
    DemoSelfThumbnailComponent,
    DemoSelfOrderComponent,
    DemoSelfGridLabelComponent,
    DemoSelfAttrLabelComponent,
    DemoSelfActionItemComponent,
    DemoSelfFormComponent,
    DemoSelfUploadComponent,
    DemoSelfSlideComponent
  ],
  providers:[LayoutService,LoginService,TestService,SettingService],
  bootstrap: [LayoutComponent]
})
export class LayoutModule {
}
