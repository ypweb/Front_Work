import {Component} from '@angular/core';

@Component({
  template: `<div class="cl-f0f-container">
        <div class="f0f-content">
            <div class="f0f-show">
                <button routerLink="/index"  nz-button [nzType]="'default'">
                <i class="anticon anticon-left"></i><span>返回首页</span>
                </button>
            </div>
        </div>
</div>`
})
export class F0FComponent {

}
