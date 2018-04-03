import {Component, Output, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {LoginService} from "../../service/login.service";

@Component({
  selector: 'admin-login-form',
  templateUrl: './login.component.html'
})

export class LoginComponent implements OnInit {

  /*测试模式*/
  debug = true;

  /*表单规则限制*/
  username_maxLength = 20;
  password_minLength = 6;
  validcode_minLength = 4;

  /*表单对象*/
  loginForm: FormGroup;

  /*登录信息*/
  login = {
    islogin: false, /*是否登录*/
    message: ''/*登录提示信息*/,
    validcode_wrap: 'login_validcode'/*验证码容器：正式*/,
    bgTheme: this.loginservice.getBgTheme()/*登录面板背景设置*/
  };


  /*构造函数*/
  constructor(private loginservice: LoginService, private fb: FormBuilder) {
  }


  /*接口实现:(钩子实现)*/
  ngOnInit() {
    /*初始化表单校验规则*/
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.maxLength(this.username_maxLength)]],
      password: ['', [Validators.required, Validators.minLength(this.password_minLength)]],
      identifyingCode: ['', [Validators.required, Validators.minLength(this.validcode_minLength)]]
    });
    /*初始化显示验证码*/
    setTimeout(() => this.getValidCode(), 0);
  }

  /*获取表单的内置提示信息*/
  getFormControl(name) {
    return this.loginForm.controls[name];
  }

  /*表单提交*/
  loginSubmit() {
    this.loginservice.loginSubmit({
      debug: this.debug,
      form: this.loginForm,
      login: this.login
    });
    for (const i in this.loginForm.controls) {
      this.loginForm.controls[i].markAsDirty();
    }
  }

  /*测试信息显示*/
  showMessage() {
    let toggle = Math.floor(Math.random() * 10) % 2 === 0;
    if (toggle) {
      this.login.message = Math.random().toString();
      setTimeout(() => {
        this.login.message = '';
      }, 3000);
    } else {
      this.login.message = '';
    }
  }


  /*获取验证码*/
  getValidCode() {
    this.loginservice.getValidCode({
      debug: this.debug,
      login: this.login,
      url: '/sysuser/identifying/code'
    });
  }


}

