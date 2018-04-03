let domain = 'http://10.0.5.226:8082',
  project = '/mall-buzhubms-api',
  common_domain = 'http://112.74.207.132:8088',
  common_project = '/yttx-public-api';

export const BASE_CONFIG = {
  indexshow: true/*是否显示首页*/,
  unique_key: 'mall_admin_unique_key'/*系统缓存key键*/,
  environment: 'dev'/*当前环境，pro:生产环境，dev:开发环境*/,
  domain: domain/*常用地址*/,
  project: project/*常用工程*/,
  common_domain: common_domain/*公用地址*/,
  common_project: common_project/*公用工程*/,
  url: `${domain}${project}`/*常用请求地址*/,
  common_url: `${common_domain}${common_project}`/*公用请求地址*/,
  cache_type:false/*缓存类型是否为localstorage:默认为localstorage,即false*/,
  cache_list:['cache','route','module','menu','power','login','setting','menusource','temp'],/*缓存模块列表:缓存加载情况记录，路由模块，模块，菜单，权限，登录认证，设置，解析后的菜单源码，临时*/
  contentBgList: [{
    name: '默认',
    value: 'default'
  }, {
    name: '小星',
    value: 'dot'
  }, {
    name: '斜线',
    value: 'whitecross'
  }, {
    name: '滤镜',
    value: 'filter'
  }, {
    name: '块状',
    value: 'block'
  }]/*默认的系统背景设置*/
};
