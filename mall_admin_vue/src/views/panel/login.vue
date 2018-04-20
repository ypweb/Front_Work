<template>
    <div class="cs-panel-login">
        <div class="login-wrap">
            <div class="login-group login-main">
                <Form ref="formLogin" :model="formLogin" :rules="ruleLogin" inline>
                    <FormItem prop="username_mall">
                        <Input type="text" v-model="formLogin.username_mall" placeholder="用户名">
                            <Icon type="ios-person-outline" color="#999" slot="prepend"></Icon>
                        </Input>
                    </FormItem>
                    <FormItem prop="passwd">
                        <Input type="password" v-model="formLogin.passwd" placeholder="密码">
                            <Icon type="ios-locked-outline" color="#999" slot="prepend"></Icon>
                        </Input>
                    </FormItem>
                    <FormItem prop="validcode_mall">
                        <Input type="text" class="login-valid" v-model="formLogin.validcode_mall" placeholder="验证码">
                            <Icon type="ios-locked-outline" color="#999" slot="prepend"></Icon>
                        </Input>
                        <div class="login-image"><img src=""></div>
                    </FormItem>
                    <FormItem>
                        <a class="g-c-gray10" href="#">忘记密码</a>
                        <Button class="g-f-r g-w-number4" type="primary" @click="loginSubmit('formLogin')">登录</Button>
                    </FormItem>
                </Form>
            </div>
            <div class="login-group login-side">

            </div>

        </div>
    </div>
</template>
<script>
    export default {
        name:'ch_panel_login',
        data () {
            return {
                formLogin: {
                    username_mall: '',
                    passwd: '',
                    validcode_mall:''
                },
                ruleLogin: {
                    username_mall: [
                        {
                            required: true,
                            message: '用户名不能为空',
                            trigger: 'blur'
                        }
                    ],
                    passwd: [
                        {
                            required: true,
                            message: '密码不能为空',
                            trigger: 'blur'
                        },
                        {
                            type: 'string',
                            min: 6,
                            message: '密码长度不能小于6位字符',
                            trigger: 'blur'
                        }
                    ],
                    validcode_mall: [
                        {
                            required: true,
                            message: '验证码不能为空',
                            trigger: 'blur'
                        },
                        {
                            type: 'string',
                            len: 4,
                            message: '验证码长度为4位字符',
                            trigger: 'blur'
                        }
                    ]
                }
            }
        },
        methods: {
            loginSubmit(name) {
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        this.$Message.success('登录成功!');
                    } else {
                        this.$Message.error('登录失败!');
                    }
                })
            }
        }
    }
</script>