import {ToolService} from '../service/tool.service';
import {Component, Input} from '@angular/core';

import {LayoutService} from "../service/layout.service";
import {LoginService} from "../service/login.service";
import {SettingService} from "../service/setting.service";

@Component({
  selector: 'app-root',
  templateUrl: './layout.component.html'
})
export class LayoutComponent {
  /*是否登录*/

  /*布局模型*/
  layout = {
    isCollapsed: false/*当前收起状态*/,
    contentBgTheme: ToolService.getCacheMap({
      key: 'settingMap'
    })['contentBgTheme'] || 'default', /*显示区背景切换*/
    contentBgList: this.settingservice.loadBgTheme()/*显示区背景列表*/,
    support: this.layoutservice.isSupport()/*是否兼容*/
  };

  /*用户模型*/
  user = {
    islogin: this.loginservice.isLogin(),/*是否登录*/
    info: this.loginservice.getLoginInfo(this.user.islogin)/*登录信息*/
  };

  /*构造函数*/
  constructor(private layoutservice: LayoutService,
              private loginservice: LoginService,
              private settingservice: SettingService) {
  }


  /*切换背景*/
  toggleBgTheme(bgtheme) {
    this.layout['contentBgTheme'] = bgtheme.value;
    this.loginservice.setCache({
      'contentBgTheme': bgtheme.value
    }, 'setting');
  }


}
