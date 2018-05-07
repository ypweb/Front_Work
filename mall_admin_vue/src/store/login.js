
export default {
    namespaced: true,
    state: {
        debug: true, /*本地测试模式*/
        sidebg: 'login-side-bg4'/*生成登录背景图片,默认第1张照片*/,
        validsrc: '',
        message:'',
        formLogin: {
            username_mall: '',
            passwd: '',
            validcode_mall: ''
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
    },
    getters: {},
    mutations: {

    },
    actions: {

    }
};