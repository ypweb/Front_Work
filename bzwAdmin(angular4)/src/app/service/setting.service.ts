import {BASE_CONFIG} from '../config/base.config';
import {ToolService} from './tool.service';

import {Injectable} from '@angular/core';


/*注入类型*/
@Injectable()
export class SettingService {
  private modulekey = 'setting';

  /*加载系统列表*/
  loadBgTheme(){
    return BASE_CONFIG.contentBgList;
  }

  /*获取背景设置*/
  getBgTheme(){


  }
}
