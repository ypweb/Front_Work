import {Component} from '@angular/core';

@Component({
  templateUrl: './self.component.html'
})
export class DemoSelfComponent {
  /*tab模型*/
  tabitem = [
    {
      name: '主题',
      href: './'
    },{
      name: '按钮',
      href:'./demo-self-btn'
    },
    {
      name: '组合列表',
      href:'./demo-self-listgroup'
    },
    {
      name: '缩略图',
      href:'./demo-self-thumbnail'
    },
    {
      name: '订单',
      href:'./demo-self-order'
    },
    {
      name: '弹出面板',
      href:'./demo-self-gridlabel'
    },
    {
      name: '属性面板',
      href:'./demo-self-attrlabel'
    },
    {
      name: '操作条',
      href:'./demo-self-actionitem'
    },
    {
      name: '表单',
      href:'./demo-self-form'
    },
    {
      name: '文件上传',
      href:'./demo-self-upload'
    },
    {
      name: '轮播图',
      href:'./demo-self-slide'
    }
  ];
}
