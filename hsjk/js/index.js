/**
 * Created by yipin on 2017/5/31 0031.
 */
(function ($) {
    'use strict';
    $(function () {
        /*常用变量*/
        var $circle_btn = $('#circle_btn'),
            $action_index = $('#action_index'),
            $action_hospital = $('#action_hospital'),
            $action_live = $('#action_live'),
            $action_tour = $('#action_tour'),
            $action_drug = $('#action_drug'),
            $action_tcm = $('#action_tcm'),
            $action_terminal = $('#action_terminal');


        var panel_dom = {
                0: '#action_hospital',
                1: '#action_live',
                2: '#action_tour',
                3: '#action_drug',
                4: '#action_tcm',
                5: '#action_terminal'
            },
            easeing_types = ['In', 'Out', 'InOut'],
            easeing_names = ['Quad', 'Cubic', 'Quart', 'Quint', 'Sine', 'Expo', 'Circ', 'Back', 'Elastic'],
            etype_len = easeing_types.length,
            ename_len = easeing_names.length,
            panel_arr = [$action_hospital, $action_live, $action_tour, $action_drug, $action_tcm, $action_terminal],
            panel_len = panel_arr.length;


        /*初始化*/
        $circle_btn.on('click', 'li', function () {
            var $this = $(this),
                index = $this.index(),
                i = 0;

            $action_index.addClass('g-d-hidei');
            for (i; i < panel_len; i++) {
                if (index === i) {
                    panel_arr[i].removeClass('g-d-hidei');

                    var animate_type = Math.floor(Math.random() * 40)/*随机类型*/,
                        animate_value = Math.floor(Math.random() * 1000)/*随机值*/,
                        easetype = Math.floor(Math.random() * 10),
                        easename = Math.floor(Math.random() * 10),
                        config = {
                            targets: panel_dom[i],
                            direction: 'alternate',
                            duration: Math.floor(Math.random() * 200 + 300) + Math.floor(Math.random() * 200 + 300)
                        }/*配置对象*/;


                    /*判断类型*/
                    if (easetype >= etype_len) {
                        easetype = etype_len - 1;
                    }
                    if (easename >= ename_len) {
                        easename = ename_len - 1;
                    }

                    /*判断范围*/
                    if (animate_value >= 300 && 600 >= animate_value) {
                        animate_value = Math.floor(animate_value / 2);
                    } else if (animate_value >= 601 && 800 >= animate_value) {
                        animate_value = Math.floor(animate_value / 3);
                    } else if (animate_value >= 801 && 1000 >= animate_value) {
                        animate_value = Math.floor(animate_value / 4);
                    } else if (animate_value <= 200) {
                        animate_value = animate_value + 100;
                    }

                    /*随机位置*/
                    if (0 <= animate_type && animate_type <= 5) {
                        /*水平移*/
                        config['translateX'] = animate_value % 2 === 0 ?
                            -animate_value : animate_value;
                    } else if (6 <= animate_type && animate_type <= 10) {
                        /*垂直移*/
                        config['translateY'] = animate_value % 2 === 0 ?
                            -animate_value : animate_value;
                    } else if (11 <= animate_type && animate_type <= 15) {
                        /*水平，垂直移*/
                        config['translateX'] = animate_value % 2 === 0 ?
                            -(animate_value * Math.floor(Math.random() * 1.5)) : animate_value * Math.floor(Math.random() * 1.8);
                        config['translateY'] = animate_value % 2 === 0 ?
                            -(animate_value * Math.floor(Math.random() * 1.6)) : animate_value * Math.floor(Math.random() * 1.4);
                    } else if (16 <= animate_type && animate_type <= 20) {
                        /*水平扭曲*/
                        config['skewX'] = animate_value % 2 === 0 ?
                            -Math.floor(Math.random() * 10) : Math.floor(Math.random() * 10);
                    } else if (21 <= animate_type && animate_type <= 25) {
                        /*垂直扭曲*/
                        config['skewY'] = animate_value % 2 === 0 ?
                            -Math.floor(Math.random() * 10) : Math.floor(Math.random() * 10);
                    } else if (26 <= animate_type && animate_type <= 30) {
                        /*水平，垂直扭曲*/
                        config['skewX'] = animate_value % 2 === 0 ?
                            -Math.floor(Math.random() * 10) : Math.floor(Math.random() * 10);
                        config['skewY'] = animate_value % 2 === 0 ?
                            -Math.floor(Math.random() * 10) : Math.floor(Math.random() * 10);
                    } else if (31 <= animate_type && animate_type <= 35) {
                        /*缩放*/
                        config['scale'] = animate_value % 2 === 0 ?
                            Math.random() * 1.5 : Math.random() + 0.5;
                    } else if (36 <= animate_type && animate_type <= 40) {
                        /*旋转*/
                        config['rotate'] = animate_value % 2 === 0 ?
                            -Math.floor(Math.random() * 60) : Math.floor(Math.random() * 60);
                    }

                    /*设置效果类型*/
                    config['easing'] = 'ease' + easeing_types[easetype] + easeing_names[easename];

                    /*执行动画*/
                    anime(config);
                } else {
                    panel_arr[i].addClass('g-d-hidei');
                }
            }

        })


        /*dom节点缓存*/


    });

})(jQuery);
