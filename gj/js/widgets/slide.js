(function ($) {
    'use strict';
    var win = window;

    /*构造类*/
    function Slide() {}

    Slide.prototype.slideToggle = function (options) {

        var settings = $.extend({}, {
                minwidth: 1024,
                size: 5,
                curindex: 0,
                easeName:'swing',
                isresize: true,
                slide_id: null,
                slide_hover_id: null,
                $wrap: null,
                $slide_img: null,
                $items: null,
                $btnwrap: null,
                $btn: null,
                isBackground: false,
                $slide_tipwrap: null,
                $slide_tip: null,
                tipheight: 0,
                itemheight: 0,
                initwidth: true,
                winwidth: $(win).width(),
                isblur: '',
                blurarr: [],
                img_alt: false,
                tip_text: [],
                isTouch: false,
                isMobile: (function () {
                    if (/(iPhone|iPod|Android|ios|iOS|iPad|Backerry|WebOS|Symbian|Windows Phone|Phone)/i.test(navigator.userAgent)) {
                        return true;
                    } else {
                        return false;
                    }
                }()),
                btn_action: false,
                btn_active: 'slidebtn-active',
                eff_time: 500,
                times: 6000,
                auto_animates: null
            }, options),
            self = this;

        /*是否创建新效果*/
        if(settings.easeName!=='swing' && settings.easeName!=='linear'){
            jQuery.extend(true,jQuery.easing,{
                easeInQuad: function (x, t, b, c, d) {
                    return c*(t/=d)*t + b;
                },
                easeOutQuad: function (x, t, b, c, d) {
                    return -c *(t/=d)*(t-2) + b;
                },
                easeInOutQuad: function (x, t, b, c, d) {
                    if ((t/=d/2) < 1) return c/2*t*t + b;
                    return -c/2 * ((--t)*(t-2) - 1) + b;
                },
                easeInCubic: function (x, t, b, c, d) {
                    return c*(t/=d)*t*t + b;
                },
                easeOutCubic: function (x, t, b, c, d) {
                    return c*((t=t/d-1)*t*t + 1) + b;
                },
                easeInOutCubic: function (x, t, b, c, d) {
                    if ((t/=d/2) < 1) return c/2*t*t*t + b;
                    return c/2*((t-=2)*t*t + 2) + b;
                },
                easeInQuart: function (x, t, b, c, d) {
                    return c*(t/=d)*t*t*t + b;
                },
                easeOutQuart: function (x, t, b, c, d) {
                    return -c * ((t=t/d-1)*t*t*t - 1) + b;
                },
                easeInOutQuart: function (x, t, b, c, d) {
                    if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
                    return -c/2 * ((t-=2)*t*t*t - 2) + b;
                },
                easeInQuint: function (x, t, b, c, d) {
                    return c*(t/=d)*t*t*t*t + b;
                },
                easeOutQuint: function (x, t, b, c, d) {
                    return c*((t=t/d-1)*t*t*t*t + 1) + b;
                },
                easeInOutQuint: function (x, t, b, c, d) {
                    if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
                    return c/2*((t-=2)*t*t*t*t + 2) + b;
                },
                easeInSine: function (x, t, b, c, d) {
                    return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
                },
                easeOutSine: function (x, t, b, c, d) {
                    return c * Math.sin(t/d * (Math.PI/2)) + b;
                },
                easeInOutSine: function (x, t, b, c, d) {
                    return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
                },
                easeInExpo: function (x, t, b, c, d) {
                    return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
                },
                easeOutExpo: function (x, t, b, c, d) {
                    return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
                },
                easeInOutExpo: function (x, t, b, c, d) {
                    if (t==0) return b;
                    if (t==d) return b+c;
                    if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
                    return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
                },
                easeInCirc: function (x, t, b, c, d) {
                    return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
                },
                easeOutCirc: function (x, t, b, c, d) {
                    return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
                },
                easeInOutCirc: function (x, t, b, c, d) {
                    if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
                    return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
                },
                easeInElastic: function (x, t, b, c, d) {
                    var s=1.70158;var p=0;var a=c;
                    if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
                    if (a < Math.abs(c)) { a=c; var s=p/4; }
                    else var s = p/(2*Math.PI) * Math.asin (c/a);
                    return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
                },
                easeOutElastic: function (x, t, b, c, d) {
                    var s=1.70158;var p=0;var a=c;
                    if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
                    if (a < Math.abs(c)) { a=c; var s=p/4; }
                    else var s = p/(2*Math.PI) * Math.asin (c/a);
                    return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
                },
                easeInOutElastic: function (x, t, b, c, d) {
                    var s=1.70158;var p=0;var a=c;
                    if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
                    if (a < Math.abs(c)) { a=c; var s=p/4; }
                    else var s = p/(2*Math.PI) * Math.asin (c/a);
                    if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
                    return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
                },
                easeInBack: function (x, t, b, c, d, s) {
                    if (s == undefined) s = 1.70158;
                    return c*(t/=d)*t*((s+1)*t - s) + b;
                },
                easeOutBack: function (x, t, b, c, d, s) {
                    if (s == undefined) s = 1.70158;
                    return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
                },
                easeInOutBack: function (x, t, b, c, d, s) {
                    if (s == undefined) s = 1.70158;
                    if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
                    return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
                },
                easeInBounce: function (x, t, b, c, d) {
                    return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
                },
                easeOutBounce: function (x, t, b, c, d) {
                    if ((t/=d) < (1/2.75)) {
                        return c*(7.5625*t*t) + b;
                    } else if (t < (2/2.75)) {
                        return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
                    } else if (t < (2.5/2.75)) {
                        return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
                    } else {
                        return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
                    }
                },
                easeInOutBounce: function (x, t, b, c, d) {
                    if (t < d/2) return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
                    return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
                }
            });
        }


        //初始化
        self.slideInit(settings);

        //事件绑定
        if (settings.size > 1) {


            if (settings.isMobile && settings.isTouch) {
                /*移动端*/
                //绑定指针悬停与离开停止动画
                settings.$wrap.on('mouseenter mouseleave', function (e) {
                    e.preventDefault();
                    if (e.type === 'mouseenter') {
                        mEnter(settings, self);
                    } else if (e.type === 'mouseleave') {
                        mLeave(settings, self);
                    }
                });
                //绑定触摸事件
                settings.$wrap.delegate('ul', 'swipeleft swiperight', function (e) {
                    e.preventDefault();
                    var cindex = settings.curindex;
                    if (e.type === 'swipeleft') {
                        if (cindex === settings.size - 1) {
                            cindex = 0;
                        } else {
                            cindex++;
                        }
                    } else if (e.type === 'swiperight') {
                        if (cindex === 0) {
                            cindex = settings.size - 1;
                        } else {
                            cindex--;
                        }
                    }
                    settings.curindex = cindex;
                    self.slidePlay(settings);
                });
            } else {
                //绑定指针悬停与离开停止动画
                settings.$wrap.hover(function (e) {
                    e.preventDefault();
                    pEnter(settings, self);
                }, function (e) {
                    e.preventDefault();
                    pLeave(settings, self);
                });

                /*tab 点击切换 pc机*/
                settings.$btnwrap.delegate('li', 'click', function (e) {
                    e.preventDefault();
                    var $this = $(this);

                    settings.curindex = $this.index();
                    settings.btn_action = true;
                    self.slidePlay(settings);


                    if (settings.img_alt) {
                        self.slideEffect(settings);
                    } else {
                        settings.$slide_tipwrap.css({
                            "opacity": "0.4",
                            "top": settings.itemheight
                        });
                    }
                });
            }
        } else if (settings.size === 1) {
            settings.$btn.css({'display': 'none'});
        }

        //绑定窗口大小事件
        $(win).resize(function () {
            if (settings.isresize) {
                settings.winwidth = $(this).width();
            } else {
                settings.winwidth = settings.$wrap.width();
            }
            settings.winwidth = settings.winwidth < settings.minwidth ? settings.minwidth : settings.winwidth;
            settings.$items.css({"width": settings.winwidth});
            settings.itemheight = settings.$wrap.height();
            settings.$slide_img.css({
                "width": settings.size * settings.winwidth,
                "left": -settings.curindex * settings.winwidth
            });
            settings.$slide_tipwrap.css({
                "opacity": "0.4",
                "top": settings.itemheight
            })
        });


    };

    /*初始化类*/
    Slide.prototype.slideInit = function (settings) {
        var self = this;

        settings.$items = settings.$slide_img.find("li");

        settings.winwidth = settings.winwidth < settings.minwidth ? settings.minwidth : settings.initwidth ? settings.winwidth = settings.$wrap.width() : settings.winwidth;
        settings.$items.css({"width": settings.winwidth});

        settings.size = settings.$items.size();


        settings.$btn = settings.$btnwrap.find('li');
        settings.$slide_img.css({
            "width": settings.size * settings.winwidth
        });
        settings.tipheight = settings.$slide_tipwrap.height();
        settings.itemheight = settings.$items.eq(0).height();
        settings.$slide_tip = settings.$slide_tipwrap.find("p");

        /*添加模糊效果*/
        if (settings.isblur !== '') {
            self.initImageFB(settings);
        }

        if (settings.isBackground) {
            settings.$items.each(function () {
                var $this = $(this),
                    src = $this.attr('data-src');
                $this.css({"background-image": 'url(' + src + ')'});
            });
        } else {
            if (settings.$items.eq(0).find("img").attr("alt")) {
                settings.img_alt = true;
                settings.$items.find("img").each(function (index) {
                    settings.tip_text.push($(this).attr("alt") || '');
                });
                settings.$slide_tip.text(settings.tip_text[0]);
            } else {
                settings.img_alt = false;
                settings.tip_text.length = 0;
                settings.$slide_tip.text('');
                settings.$slide_tipwrap.css({
                    "opacity": "0.4",
                    "top": settings.itemheight
                })
            }
        }
        settings.slide_id = setInterval(function () {
            self.slidePlay(settings, 'auto');
        }, settings.times);
    };

    /*播放类*/
    Slide.prototype.slidePlay = function (settings, type) {
        var self = this,
            isauto = type && type === 'auto' ? true : false;
        if (isauto) {
            settings.curindex++;
            settings.curindex = settings.curindex >= settings.size ? 0 : settings.curindex;
        }

        settings.$slide_img.animate({
            "left": -settings.curindex * settings.winwidth
        }, settings.eff_time,settings.easeName);

        settings.$btn.eq(settings.curindex).addClass(settings.btn_active).siblings().removeClass(settings.btn_active);

        if (settings.isblur !== '') {
            if (isauto) {

            } else {
                self.resetImageFB(settings);
            }
        }

        if (settings.img_alt) {
            self.slideEffect(settings);
        } else {
            settings.$slide_tipwrap.css({
                "opacity": "0.4",
                "top": settings.itemheight
            });
        }


    };

    /*效果类*/
    Slide.prototype.slideEffect = function (settings) {
        var self = this,
            is_show = parseInt(settings.$slide_tipwrap.css("top")) + settings.tipheight;

        if (settings.btn_action) {
            if (is_show === settings.itemheight) {

                settings.$slide_tipwrap.animate({
                    "opacity": "0.4",
                    "top": settings.itemheight
                }, settings.eff_time);

                setTimeout(function () {
                    settings.$slide_tip.text(settings.tip_text[settings.curindex]);
                }, settings.eff_time);

                settings.$slide_tipwrap.animate({
                    "opacity": "0.6",
                    "top": settings.itemheight - settings.tipheight
                }, settings.eff_time);
            } else {
                settings.$slide_tip.text(settings.tip_text[settings.curindex]);

                settings.$slide_tipwrap.animate({
                    "opacity": "0.6",
                    "top": settings.itemheight - settings.tipheight
                }, settings.eff_time);
            }
        } else {
            if (is_show === settings.itemheight) {

                settings.$slide_tipwrap.animate({
                    "opacity": "0.6",
                    "top": settings.itemheight
                }, settings.eff_time);

                setTimeout(function () {
                    settings.$slide_tip.text(settings.tip_text[settings.curindex]);
                }, settings.eff_time);

                settings.auto_animates = settings.$slide_tipwrap.animate({
                        "opacity": "0.6",
                        "top": settings.itemheight - settings.tipheight
                    }, settings.eff_time)
                    .delay(settings.times - (3 * settings.eff_time))
                    .animate({
                        "opacity": "0.4",
                        "top": settings.itemheight
                    }, settings.eff_time);

            } else {
                settings.auto_animates = settings.$slide_tipwrap.animate({
                    "opacity": "0.6",
                    "top": settings.itemheight - settings.tipheight
                }, settings.eff_time);
                settings.$slide_tip.text(settings.tip_text[settings.curindex]);

                settings.$slide_tipwrap.delay(settings.times - (2 * settings.eff_time))
                    .animate({
                        "opacity": "0.4",
                        "top": settings.itemheight
                    }, settings.eff_time);

            }
        }

    };


    /*模糊类初始化*/
    Slide.prototype.initImageFB = function (opt) {
        var tempcount = opt.isblur.toString().match(/\d+/g),
            k = 1,
            temparr = [];
        if (tempcount !== null) {
            tempcount = parseInt(tempcount[0], 10);
            if (tempcount > 20) {
                tempcount = 20;
                opt.isblur = 'g-filter-blur' + tempcount;
            }
        }
        for (k; k <= tempcount; k++) {
            temparr.push('g-filter-blur' + k);
        }
        opt.blurarr = temparr.slice(0);
        opt.$items.each(function () {
            $(this).find("img").addClass(temparr.join(' '));
        });
    };

    /*模糊类操作*/
    Slide.prototype.doImageFB = function (opt, type) {
        var isadd = type === 'add' ? true : false,
            temparr = isadd ? opt.blurarr.slice(0) : opt.blurarr.slice(0).reverse(),
            len = temparr.length,
            i = 0,
            $img = opt.$items.eq(opt.curindex).find('img');


        for (i; i < len; i++) {
            (function (i) {
                setTimeout(function () {
                    if (isadd) {
                        $img.addClass(temparr[i]);
                    } else {
                        $img.removeClass(temparr[i]);
                    }
                }, i * 40);
            })(i);
        }


    };

    /*模糊类重置*/
    Slide.prototype.resetImageFB = function (opt, type) {
        var temparr = opt.blurarr.slice(0),
            $item = opt.$items.eq(opt.curindex);

        if (type) {
            $item.find('img').addClass(temparr.join(' '));
        } else {
            $item.find('img').removeClass(temparr.join(' '));
            $item.siblings().find('img').addClass(temparr.join(' '));
        }
    };


    //服务类
    //指针移入
    function pEnter(opt, self) {
        opt.$slide_tipwrap.stop(opt.auto_animates, true, false);
        clearInterval(opt.slide_id);
        opt.slide_id = null;
        if (opt.isblur !== '') {
            self.doImageFB(opt, 'remove');
        }
    }

    function mEnter(opt, self) {
        clearInterval(opt.slide_id);
        opt.slide_id = null;
        if (opt.isblur !== '') {
            self.doImageFB(opt, 'remove');
        }
    }

    //指针移出
    function pLeave(opt, self) {
        clearInterval(opt.slide_id);
        opt.slide_id = null;
        opt.slide_id = setInterval(function () {
            opt.btn_action = false;
            self.slidePlay(opt, 'auto');
        }, opt.times);
        if (opt.isblur !== '') {
            self.doImageFB(opt, 'add');
        }
    }

    function mLeave(opt, self) {
        clearInterval(opt.slide_id);
        opt.slide_id = null;
        opt.slide_id = setInterval(function () {
            opt.btn_action = false;
            self.slidePlay(opt, 'auto');
        }, opt.times);
        if (opt.isblur !== '') {
            self.doImageFB(opt, 'add');
        }
    }


    win.slide = win.slide || new Slide();

})(jQuery);