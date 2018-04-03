/*配置模块*/
import {BASE_CONFIG} from '../config/base.config';
/*系统模块*/
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

/*首页模块*/
import {IndexComponent} from '../web/index/index.component';
/*404模块*/
import {F0FComponent} from './f0f.component';
/*demo模块*/
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





/*路径配置*/
const appRoutes: Routes = [
  {
    /*空路径*/
    path: '',
    redirectTo: '/index',
    pathMatch: 'full'
  },
  {
    /*不存在路径或者错误路径*/
    path: '**',
    component: F0FComponent
  }
];

if (BASE_CONFIG.environment==='dev') {
  /*扩展路径*/
  appRoutes.unshift({
    /*自定义组件*/
    path: 'demo-self',
    component: DemoSelfComponent,
    children: [
      {
        path: '',
        component: DemoSelfThemeComponent
      }, {
        path: 'demo-self-btn',
        component: DemoSelfBtnComponent
      }, {
        path: 'demo-self-listgroup',
        component: DemoSelfListGroupComponent
      }, {
        path: 'demo-self-thumbnail',
        component: DemoSelfThumbnailComponent
      }, {
        path: 'demo-self-order',
        component: DemoSelfOrderComponent
      }, {
        path: 'demo-self-gridlabel',
        component: DemoSelfGridLabelComponent
      }, {
        path: 'demo-self-attrlabel',
        component: DemoSelfAttrLabelComponent
      }, {
        path: 'demo-self-actionitem',
        component: DemoSelfActionItemComponent
      }, {
        path: 'demo-self-form',
        component: DemoSelfFormComponent
      }, {
        path: 'demo-self-upload',
        component: DemoSelfUploadComponent
      }, {
        path: 'demo-self-slide',
        component: DemoSelfSlideComponent
      }
    ]
  });
}
appRoutes.unshift({
  /*首页*/
  path: 'index',
  component: IndexComponent
});


@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes,
      {enableTracing: true}
    )
  ],
  exports: [
    RouterModule
  ]
})
export class LayoutRouterModule {
}
