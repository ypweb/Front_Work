/*基本配置--主要为系统配置*/
let domain='http://10.0.5.226:8082',
  project='/mall-buzhubms-api',
  common_domain='http://112.74.207.132:8088',
  common_project='/yttx-public-api';

const BASE_CONFIG = {
  unique_key: 'mall_admin_unique_key'/*系统缓存key键*/,
  environment: 'dev'/*当前环境，pro:生产环境，dev:开发环境*/,
  domain: domain/*常用地址*/,
  project: project/*常用工程*/,
  common_domain: common_domain/*公用地址*/,
  common_project: common_project/*公用工程*/,
  url:`${domain}${project}`/*常用请求地址*/,
  common_url:`${common_domain}${common_project}`/*公用请求地址*/
};


export class BaseConfig {
  static getBaseConfig() {
    return BASE_CONFIG;
  }
}
