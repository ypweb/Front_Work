import {BASE_CONFIG} from '../config/base.config';
import {ToolService} from './tool.service';
import {TestService} from './test.service';

import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

declare var moment: any;


/*注入类型*/
@Injectable()
export class LoginService {
  private cache = ToolService.getCache();
  private modulekey = 'login';
  private bgTheme = 'default';

  constructor(private test: TestService, private http: HttpClient) {
    console.log(this.cache);
  }

  /*
  缓存模板
  cache = {
    cacheMap: {
      menuload: false,
      powerload: false,
      menusoruce: false
    }/!*缓存加载情况记录*!/,
    routeMap: {
      prev: '',
      current: '',
      history: []
    }/!*路由缓存*!/,
    moduleMap: {}/!*模块缓存*!/,
    menuMap: {}/!*菜单缓存*!/,
    powerMap: {}/!*权限缓存*!/,
    loginMap: {
      'isLogin': true,
      'datetime':'',
      'reqdomain': '',
      'username': '',
      'param': {
        'adminId': '',
        'token': '',
        'organizationId': ''
      }
    }/!*登录认证缓存*!/,
    settingMap: {}/!*设置缓存*!/,
    menuSourceMap: {}/!*解析后的菜单源码缓存，用于菜单加载时直接应用，而不需要解析*!/,
    tempMap: {}/!*临时缓存*!/
  };*/


  /*是否登录*/
  isLogin(cache?) {
    let logininfo = false,
      islogin = false,
      flag = cache && typeof cache !== 'undefined';

    if (flag) {
      logininfo = ToolService.isLogin(cache);
    } else {
      logininfo = ToolService.isLogin(this.cache);
    }

    if (logininfo) {
      if (flag && cache.loginMap) {
        islogin = ToolService.validLogin(cache.loginMap);
      } else {
        islogin = ToolService.validLogin(cache.loginMap);
      }
      /*如果缓存失效则清除缓存*/
      if (!islogin) {
        this.clearCache();
        ToolService.clear();
      }
      return islogin;
    }
    return islogin;
  }

  /*清除缓存*/
  clearCache() {
    this.cache = null;
  }


  /*获取缓存*/
  getCache() {
    this.cache = ToolService.getCache();
    return this.cache;
  }

  /*更新缓存*/
  setCache(value, key) {
    /*没有索引不操作*/
    if (!key) {
      return false;
    }
    /*判断缓存索引是否正确*/
    if (!BASE_CONFIG.cache_list.includes(key)) {
      return false;
    }
    /*设置缓存*/
    if (value !== null) {
      this.cache[`${key}Map`] = value;
      this.cache[`${BASE_CONFIG.cache_list[0]}Map`][key] = true;
    } else {
      this.cache[`${BASE_CONFIG.cache_list[0]}Map`][key] = false;
    }
    ToolService.setCache(this.cache);
    return true;
  }


  /*顶部导航获取登录信息*/
  getLoginInfo(flag) {
    let list = [{
      name: '用户名',
      value: 'zhangsan'
    }, {
      name: '登录时间',
      value: '2018-01-29'/*moment().format('YYYY-MM-DD|HH:mm:ss')*/
    }, {
      name: '',
      value: '退出'
    }];
    return flag ? list : [];
  }

  /*登录面板获取背景*/
  getBgTheme() {
    let bg = Math.floor(Math.random() * (BASE_CONFIG.contentBgList.length - 1));
    if (isNaN(bg)) {
      return this.bgTheme;
    }
    return BASE_CONFIG.contentBgList[bg].value;
  }

  /*ToolService.adaptReqUrl({
      debug: debug,
      url: '/sysuser/login',
    })*/
  /*{
      headers: {"Content-Type": "application/x-www-form-urlencoded"},
      data:config.value
  }*/
  /*if (debug) {
            data = this.test.testToken('list');
          }*/

  /*请求登录*/
  loginSubmit(config) {
    let param = config.form.value,
      debug = config.debug,
      result = null;

    this.http.get(
      ToolService.adaptReqUrl({
        debug: debug,
        url: '/sysuser/login',
      })
      , {
        params: param
      }).subscribe(response => {
      let resp = debug ? this.test.testToken() : response,
        data = resp.data,
        status = parseInt(resp.status, 10);

      console.log(status);
      if (status === 200) {
        let code = parseInt(data.code, 10),
          result = data.result,
          message = data.message;
        if (code !== 0) {
          if (typeof message !== 'undefined' && message !== '') {
            config.login.message = message;
          }
          config.islogin = false;
        } else {
          /*组装缓存*/
          let tempcache = {
            'islogin': true,
            'datetime': moment().format('YYYY-MM-DD|HH:mm:ss'),
            'reqdomain': encodeURIComponent(BASE_CONFIG.domain),
            'username': encodeURIComponent(config.form.controls.username.value),
            'adminId': encodeURIComponent(result.adminId),
            'token': encodeURIComponent(result.token),
            'organizationId': encodeURIComponent(result.organizationId)
          };
          console.log(tempcache);
          //设置缓存
          config.islogin = this.setCache(tempcache, 'login')/*此处创建数据为空的初始化缓存*/;
          //设置个人信息
          /*appService.getLoginMessage(model.message, function () {
            var temparr = [{
              name: '用户名：',
              value: tempcache.username
            }, {
              name: '登录时间：',
              value: tempcache.datetime
            }];
            return temparr;
          });*/
          //加载菜单
          /*loadMenuData(model, function () {
            /!*更新缓存*!/
            cache = toolUtil.getParams(unique_key);
            toolUtil.loading({
              type: 'hide',
              model: model.app_config
            });
            /!*重置登录信息*!/
            model.login.username = '';
            model.login.password = '';
            model.login.identifyingCode = '';
            model.login.islogin = true;
            model.login.loginerror = '';
          });*/
          config.login.message = '登录成功';
          setTimeout(() => {
            config.login.message = '';
          }, 3000);
        }
      } else {
        config.login.islogin = false;
        config.login.message = '登录失败';
        setTimeout(() => {
          config.login.message = '';
        }, 3000);
      }
    }, error => {
      console.log(error);
      config.login.islogin = false;
      config.login.message = error;
      setTimeout(() => {
        config.login.message = '';
      }, 3000);
    });
  }


  /*获取验证码*/
  getValidCode(config) {
    let image = document.createElement("img"),
      imagedom;
    image.alt = '验证码';
    if (config.debug) {
      /*测试模式*/
      let code = this.test.getMock().mock(/[a-zA-Z0-9]{4}/),
        imgsrc = this.test.getMock().Random.image('82x28', '#ffffff', '#666666', code);
      image.src = imgsrc;
      if (config.login) {
        imagedom = document.getElementById(config.login.validcode_wrap);
        imagedom.innerHTML = '';
        imagedom.appendChild(image);
      }
    } else {
      /*正式模式*/
      let xhr = new XMLHttpRequest(),
        url = ToolService.adaptReqUrl(config);
      xhr.open("post", url, true);
      xhr.responseType = "blob";
      xhr.onreadystatechange = function () {
        if (this.status === 200) {
          let blob = this.response;
          try {
            image.onload = function (e) {
              window.URL.revokeObjectURL(image.src);
            };
            image.src = window.URL.createObjectURL(blob);
          } catch (e) {
            console.log('不支持URL.createObjectURL');
          }
          if (config.login) {
            imagedom = document.getElementById(config.login.validcode_wrap);
            imagedom.innerHTML = '';
            imagedom.appendChild(image);
          }
        }
      };
      xhr.send();
    }
  }


}
