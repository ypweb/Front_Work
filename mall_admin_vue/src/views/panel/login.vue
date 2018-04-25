<template>
    <div class="cs-panel-login">
        <div class="login-wrap">
            <div class="login-group login-main">
                <Form ref="formLogin" :model="formLogin" :rules="ruleLogin" inline>
                    <FormItem prop="username_mall">
                        <Input type="text" v-model="formLogin.username_mall" placeholder="用户名">
                        <Icon size="16" type="ios-person-outline" color="#999" slot="prepend"></Icon>
                        </Input>
                    </FormItem>
                    <FormItem prop="passwd">
                        <Input type="password" v-model="formLogin.passwd" placeholder="密码">
                        <Icon size="16" type="ios-locked-outline" color="#999" slot="prepend"></Icon>
                        </Input>
                    </FormItem>
                    <FormItem prop="validcode_mall">
                        <Input type="text" class="login-valid" v-model="formLogin.validcode_mall" placeholder="验证码">
                        <Icon size="10" class="cs-icon-security" type="image" color="#999" slot="prepend"></Icon>
                        </Input>
                        <div class="login-image" @click="getValidCode()"><img :src="validsrc"></div>
                    </FormItem>
                    <FormItem>
                        <a class="g-c-gray10" href="#">忘记密码</a>
                        <Button class="g-f-r g-w-number4" type="primary" @click="loginSubmit('formLogin')">登录</Button>
                    </FormItem>
                </Form>
            </div>
            <div class="login-group login-side" :class="sidebg">
                <div class="side-change" @click="changeSideBg()"></div>
                <div class="side-theme side-theme1">生活够简单</div>
                <div class="side-theme side-theme2">迅速、精准、优质、简单的购物APP</div>
            </div>

        </div>
    </div>
</template>
<script>
    /*导入测试*/
    import test from './../../libs/test';
    import Tool from './../../libs/tool';
    import Mock from './../../../node_modules/mockjs';


    export default {
        name: 'ch_panel_login',
        data() {
            return this.$store.state.login_store;
        },
        methods: {
            /*切换背景*/
            changeSideBg() {
                this.sidebg = this.getSideBg();
            },
            /*生成背景图片*/
            getSideBg() {
                let bg = Math.floor(Math.random() * 10);
                if (bg === 0) {
                    bg = 1;
                }
                return `login-side-bg${bg}`;
            },
            /*获取验证码*/
            getValidCode() {
                if (this.debug) {
                    /*测试模式*/
                    let code = Mock.mock(/[a-zA-Z0-9]{4}/),
                        imgsrc = Mock.Random.image('78x30', '#ffffff', '#666666', code);
                    this.validsrc = imgsrc;
                } else {
                    /*正式模式*/
                    let self = this,
                        xhr = new XMLHttpRequest(),
                        url = Tool.adaptReqUrl('/sysuser/identifying/code');
                    xhr.open("post", url, true);
                    xhr.responseType = "blob";
                    xhr.onreadystatechange = function () {
                        if (this.status === 200) {
                            let blob = this.response,
                                image = document.createElement("img");

                            image.alt = '验证码';
                            try {
                                self.validsrc = window.URL.createObjectURL(blob);
                            } catch (e) {
                                console.log('不支持URL.createObjectURL');
                            }
                        }
                    };
                    xhr.send();
                }

            },
            /*提交登录*/
            loginSubmit(name) {
                let self = this;
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        this.$Message.success(this.message);
                        this.$store.dispatch('app_store/requestLogin');
                        setTimeout(function () {
                            self.$store.commit('app_store/changeLogin',true);
                        }, 1000);
                    } else {
                        this.$Message.error(this.message);
                    }
                })
            }
        },
        mounted() {
            /*初始化渲染验证码*/
            this.getValidCode();
        }
    }
</script>