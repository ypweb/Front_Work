import { Injectable } from '@angular/core';
import {ToolService} from "./tool.service";


/*引入jquery*/
/*declare var $: any;*/

/*注入类型*/
@Injectable()
export class LayoutService{

  /*是否兼容*/
  isSupport(){
    return ToolService.supportBox() && ToolService.supportJSON() && ToolService.supportStorage() && ToolService.supportImage()
  }
}
