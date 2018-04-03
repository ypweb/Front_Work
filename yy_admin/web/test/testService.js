/*测试模块服务*/
'use strict';
angular.module('test.service',[])
    .service('testService', function () {
        var self = this,
            reg_id = /[0-9]{1,2}//*id序列值*/,
            reg_name = /((周|杨|张|李|王|赵|马|朱|陈)(一|二|三|四|五|六|七|八|九|十){1,2}){1}//*姓名序列值*/,
            reg_datetime = moment().format('YYYY-MM-DD HH:mm:ss')/*当前世界*/,
            reg_money = /(^(([1-9]{1}\d{0,8})|0)((\.{0}(\d){0})|(\.{1}(\d){2}))$){1}//*人民币*/,
            reg_mobile = /(^(13[0-9]|14[579]|15[012356789]|16[6]|17[01235678]|18[0-9]|19[89])[0-9]{8}$){1}//*移动电话*/,
            reg_remark = /('最近太忙了，确认晚了，东西是很好的，呵呵，谢了。'|'物流公司的态度比较差,建议换一家！不过掌柜人还不错！'|'呵，货真不错，老公很喜欢！'|'很好的卖家，谢谢喽。我的同事们都很喜欢呢。下次再来哦 ！'|'掌柜人不错，质量还行，服务很算不错的。'|'没想到这么快就到了，尺寸正好，老板态度很好。'|'还不错，质量挺好的，速度也快！'|'终于找到家好店，服务好，质量不错，下次有机会再来买。'|'卖家人很好 这个还没用 看包装应该不错'|'店已经收藏了很久，不过是第一次下手。应该说还不错。'|'第二次来买了，货比我想像中要好！！老板人表扬下。'|'包装看起来很好，包得很用心，相信货一定很好，谢谢了！'|'货超值，呵，下次再来。帮你做个广告，朋友们：这家店的货值。'|'一个字！！值！！！'|'掌柜的服务态度真好，发货很快。商品质量也相当不错。太喜欢了，谢谢！'|'好卖家，真有耐心，我终于买到想要的东西了。谢谢卖家。'|'掌柜太善良了，真是干一行懂一行呀。在掌柜的指导下我都快变内行人士了！'|'卖家服务真周到。以后带同事一起来。'|'货到了，比图片上看到的好多了3Q！'|'忠心地感谢你，让我买到了梦寐以求的宝贝，太感谢了！'|'价格大众化，YY质量很好呀,款式、面料我都挺满意的．如果有需要我还会继续光顾你的店铺！'){1}//*常用备注*/,
            reg_content = /('<h1>时光不老我们不散<\/h1><p>一茶一酒一阙词，一程山水一路景。人生有一种相遇，是穿越了日暮黄昏，是沐浴了唐宋烟雨，在墨香飘荡的天地里，造就了生命中永恒的美丽。在浩渺的人海里，我们素昧平生，因了文字的引见，你走近了我，我靠近了你，你默默阅读我，我渐渐懂得你，从此，有一种温情途径四季，在彼此的夜空里绽放成最灿烂的烟火;有一种芳菲辗转流年，在彼此的云水里旖旎成最明媚的风景。<\/p><p>那种桃花落肩的轻盈，那种蒹葭摇曳的幽欢，那种烟花绽放的绚烂，那种柴门篱菊的闲情，无不让生命的绿窗丰盈绮丽。修云水禅心，其实不只为觅知音。生活因宁静而清欢，生命因懂得而精彩。我们用素笔将高山流水淡淡写意，将细水长天轻轻描摹，待有一天我们把文字的涵意参透，相逢一笑，相信我们再也不忍轻易道再见。<\/p><p>在低眉与回首间，我们不知不觉已用真情绘制的生命线，将天青色等烟雨的一脉情深，将春风得意马蹄疾的一怀欣喜，将把酒问青天的一腔豪迈，将飞絮绕香阁的一帘诗意，皆编织成活色生香的风月画屏。此去经年，若有烟柳弄晴，若有梅影横窗，若有斜阳映楼，若有清风拂帘，若有经卷在手……一切的一切，都将被我们哼唱成轻舟泛湖般的如歌行板。<\/p><p>世间有一种景百看不厌，有一种感觉永如初见，有一种情恒久悠远。文字，能让我们破茧成蝶，也能让我们涅槃重生。我们，在文字里打坐，在文字穿行，在文字里放歌。咫尺天涯，有一种牵挂不在云端，不在潭底，只在不离不弃的点滴里。滚滚红尘，我们不必问君从何处来，也不必问君往何处去。我们只需相聚时花间一壶酒，离别时依依满别情。<\/p><p>烟火人生，因了文字的纱笼，那二十四桥明月夜才格外令人留恋;因了文字的点拨，那广袤沙漠孤烟直才分外令人遐想。相信因文字结缘的人都会欣赏雪小禅的名言：“这世间，必有一种懂得，穿越灵魂，幽幽而来。你静静无言，他默默不语。相视一笑，刹那间就有一种感动，与上帝的慈悲相遇，与彼此的精神强度连在一起。不远，不近，你说，他懂;他说，你懂!”。<\/p><p>当古道上的风轻轻掠过，或许我们，会追忆青衫对饮成三人，追忆美人幽幽葬落花，追忆白衣打马哒哒过，追忆罗衫轻解上兰舟……我们左顾迤逦烟村，右盼空城晓角，爱上夜色阑珊，也爱上暖日明霞。<\/p><p>不管你在哪里，时光的长廊上，一份季节的怀想一直延伸向有你的远方。海内存知己天涯若比邻，心若相通，无言也懂。好想，我们一直相约在花海之间，你不往左，我不向右。我们，一起观赏花开花落的美景，一起聆听风起雨落的声音，一起携文字的暗香，挽芳草的葱茏，不惊不扰，走过流年。<\/p><p>天地间的生机盎然总牵系着清风雨露，旅途上的笙歌缭绕总交织着花飞蝶舞。其实，不远不近的惦记是一种最美的情思，不即不离的陪伴是一种最美的相约。我们都知道，在相遇相知的年华里，有一种相守的温暖，有一种相念的感动，有一种相知的幸福，有一种相惜的美好，属于你，也属于我。此岸、彼岸，总有一种声音凝着真情穿越千山万水，抚慰你，也抚慰我;海角、天涯，总有一种微笑沐着春风穿越岁月流年，温暖你，也温暖我。<\/p><p>指尖染香，握一世芳华。开掌合掌，开卷闭卷，朵朵心花随风轻扬。任风云来去，但愿我们不是匆匆路过，既已相遇，我们就别相忘于江湖。我们，不要让等待输给流年，不要让用心种下的花朵在岁月里枯萎，好吗?真的希望，我们心装明镜，游目骋怀，心，靠近一点，再近一点，即使离别，依然期待下一个转角还能遇见你。<\/p><p>沧海晴天，碧水照影，此情真意，此念真心。今后，我们一起观浪漫诗意的烟花弱柳，一起赏悠悠含笑的朵朵桃花，一起撷莲花之芬芳，采流云之轻盈，约春光之明媚，一路歌，一路行。于娴静如诗的岁月里，我们折柳作笛，轻歌曼舞地走向人生的一个又一个季节，让丰盈的爱一直绽放在光阴路上。<\/p><p>高山流水，琴箫和鸣，一笺心语寄于风月，有一种温暖是陪你走过，有一种缘分是永不分离。煮一壶茶，邀你话古今，让我们，以文字之眸阅尽古往今来，用季风之弦弹拨红尘悠扬，拿真情之伞撑起生命晴天。从此，恋恋风尘，你歇我唱，你唱我和，时光不老，我们不散。<\/p>'|'<h1>NBA历史得分榜<\/h1><div class="para" label-module="para">NBA历史得分榜，是统计职业球员在<a target="_blank" href="http:\/\/baike.baidu.com\/item\/NBA%E5%B8%B8%E8%A7%84%E8%B5%9B">NBA常规赛<\/a>总得到的所有分数的榜单。该榜单只统计职业球员在<a target="_blank" href="http:\/\/baike.baidu.com\/item\/NBA%E5%B8%B8%E8%A7%84%E8%B5%9B">NBA常规赛<\/a>获得的总的分数，不统计职业球员在<a target="_blank" href="http:\/\/baike.baidu.com\/item\/NBA%E5%AD%A3%E5%89%8D%E8%B5%9B">NBA季前赛<\/a>、<a target="_blank" href="http:\/\/baike.baidu.com\/item\/NBA%E5%AD%A3%E5%90%8E%E8%B5%9B\/36196" data-lemmaid="36196">NBA季后赛<\/a>和<a target="_blank" href="http:\/\/baike.baidu.com\/item\/NBA%E5%85%A8%E6%98%8E%E6%98%9F%E8%B5%9B">NBA全明星赛<\/a>获得到的分数。<\/div><div class="basic-info cmn-clearfix"><dl class="basicInfo-block basicInfo-left"><dt class="basicInfo-item name">中文名<\/dt><dd class="basicInfo-item value">NBA历史得分榜<\/dd><dt class="basicInfo-item name">外文名<\/dt><dd class="basicInfo-item value">NBA All-time Regular Season Points Stats<\/dd><\/dl><dl class="basicInfo-block basicInfo-right"><dt class="basicInfo-item name">类&nbsp;&nbsp;&nbsp;&nbsp;型<\/dt><dd class="basicInfo-item value">排行榜<\/dd><dt class="basicInfo-item name">国&nbsp;&nbsp;&nbsp;&nbsp;家<\/dt><dd class="basicInfo-item value">美国<\/dd><dt class="basicInfo-item name">统计范围<\/dt><dd class="basicInfo-item value">NBA常规赛<\/dd><\/dl><\/div>'|'<div class="para" label-module="para">☆更新至NBA常规赛(2016-2017赛季)2017年4月13日（北京时间）比赛结束。<\/div><table log-set-param="table_view" class="table-view log-set-param"><tbody><tr><th><div class="para" label-module="para">排名<\/div><\/th><th><div class="para" label-module="para">姓名<\/div><\/th><th><div class="para" label-module="para">得分<\/div><\/th><th><div class="para" label-module="para">效力球队（现役）<\/div><\/th><\/tr><tr><td width="42" valign="top">1<\/td><td width="146" valign="top"><div class="para" label-module="para"><a target="_blank" href="http:\/\/baike.baidu.com\/item\/%E5%8D%A1%E9%87%8C%E5%A7%86%C2%B7%E9%98%BF%E5%B8%83%E6%9D%9C%E5%B0%94-%E8%B4%BE%E5%B7%B4%E5%B0%94">卡里姆·阿布杜尔-贾巴尔<\/a><\/div><\/td><td width="74" valign="top">38387<\/td><td width="127" valign="top">&#12288;<\/td><\/tr><tr><td width="43" valign="top">2<\/td><td width="146" valign="top"><div class="para" label-module="para"><a target="_blank" href="http:\/\/baike.baidu.com\/item\/%E5%8D%A1%E5%B0%94%C2%B7%E9%A9%AC%E9%BE%99">卡尔·马龙<\/a><\/div><\/td><td width="74" valign="top"><div class="para" label-module="para">36928<\/div><\/td><td width="127" valign="top">&#12288;<\/td><\/tr><tr><td width="43" valign="top">3&#12288;<\/td><td width="146" valign="top"><div class="para" label-module="para"><a target="_blank" href="http:\/\/baike.baidu.com\/item\/%E7%A7%91%E6%AF%94%C2%B7%E5%B8%83%E8%8E%B1%E6%81%A9%E7%89%B9\/318773">科比·布莱恩特<\/a><\/div><\/td><td width="74" valign="top"><div class="para" label-module="para">33643<\/div><\/td><td width="127" valign="top">&#12288;<\/td><\/tr><tr><td width="43" valign="top">4&#12288;<\/td><td width="146" valign="top"><div class="para" label-module="para"><a target="_blank" href="http:\/\/baike.baidu.com\/item\/%E8%BF%88%E5%85%8B%E5%B0%94%C2%B7%E4%B9%94%E4%B8%B9">迈克尔·乔丹<\/a><\/div><\/td><td width="74" valign="top"><div class="para" label-module="para">32292<\/div><\/td><td width="127" valign="top">&#12288;<\/td><\/tr><tr><td width="42" valign="top">5&#12288;<\/td><td width="146" valign="top"><div class="para" label-module="para"><a target="_blank" href="http:\/\/baike.baidu.com\/item\/%E5%A8%81%E5%B0%94%E7%89%B9%C2%B7%E5%BC%A0%E4%BC%AF%E4%BC%A6">威尔特·张伯伦<\/a><\/div><\/td><td width="74" valign="top"><div class="para" label-module="para">31419<\/div><\/td><td width="127" valign="top">&#12288;<\/td><\/tr><tr><td colspan="1" rowspan="1" valign="top">6<\/td><td colspan="1" rowspan="1" valign="top"><a target="_blank" href="http:\/\/baike.baidu.com\/item\/%E5%BE%B7%E5%85%8B%C2%B7%E8%AF%BA%E7%BB%B4%E8%8C%A8%E5%9F%BA">德克·诺维茨基<\/a><\/td><td colspan="1" rowspan="1" valign="top">30260<\/td><td colspan="1" rowspan="1" valign="top">现役<a target="_blank" href="http:\/\/baike.baidu.com\/item\/%E8%BE%BE%E6%8B%89%E6%96%AF%E5%B0%8F%E7%89%9B%E9%98%9F">达拉斯小牛队<\/a><\/td><\/tr><\/tbody><\/table>'|'<div class="result-op c-container xpath-log" srcid="91" fk="nba得分排行榜" id="1" tpl="bk_polysemy" mu="http:\/\/baike.baidu.com\/item\/NBA%E5%8E%86%E5%8F%B2%E5%BE%97%E5%88%86%E6%A6%9C\/2177038?fr=aladdin" data-op="{y:7FDDFDDE}" data-click="{&quot;p1&quot;:&quot;1&quot;,&quot;rsv_bdr&quot;:&quot;0&quot;,&quot;fm&quot;:&quot;albk&quot;,&quot;rsv_stl&quot;:&quot;0&quot;,&quot;p5&quot;:1}"><h3 class="t c-gap-bottom-small"><a href="http:\/\/www.baidu.com\/link?url=oHfQY8Qk-mk2iT_qvQYdACbwCCTEsOMDgHiywp3ae--r0zCQxm7vMf92Rxm8Y0yVo6YBX9I6RSbDg1YOvJWGWp0Yb_KFj654pm_ewQF3G9E-pbHEOv3bSngWM_Ifwy3YX-aL9c1E63Oef9X9kYzJwa&amp;wd=&amp;eqid=ad8ff174002a4bc5000000065949fb07" target="_blank"><em>NBA<\/em>历史<em>得分榜<\/em>_百度百科<\/a><\/h3><div class="c-row"><div class="c-span6"><a href="http:\/\/www.baidu.com\/link?url=oHfQY8Qk-mk2iT_qvQYdACbwCCTEsOMDgHiywp3ae--r0zCQxm7vMf92Rxm8Y0yVo6YBX9I6RSbDg1YOvJWGWp0Yb_KFj654pm_ewQF3G9E-pbHEOv3bSngWM_Ifwy3YX-aL9c1E63Oef9X9kYzJwa" target="_blank" class="op-bk-polysemy-album op-se-listen-recommend" style="_height:121px"><img class="c-img c-img6" src="https:\/\/ss1.baidu.com\/6ONXsjip0QIZ8tyhnq\/it\/u=1893883627,2053715724&amp;fm=58"><\/a><\/div><div class="c-span18 c-span-last"><p><em>NBA<\/em>历史<em>得分榜<\/em>，是统计职业球员在<em>NBA<\/em>常规赛总得到的所有分数的榜单。该榜单只统计职业球员在<em>NBA<\/em>常规赛获得的总的分数，不统计职业球员在<em>NBA<\/em>季前赛、<em>NBA<\/em>季后赛和<em>NBA<\/em>全明星赛获得到的分数。<\/p><p><a class="c-gap-right-small op-se-listen-recommend" href="http:\/\/www.baidu.com\/link?url=aEJz0juV4SlmkJyHrLO67HDF5_paIjOIzkMj7BJvW80W8pPAJl_IKrbooJTpGWhafoW_rjscapMjiJ_tvBZAUjeXg2hwh5S0hR0qkYCiZqCnMQ9GQgxSIhfl5oTr8mcyoFZqw0PgtDBQifA-q4LrqK" target="_blank" title="历史得分榜">历史<em>得分榜<\/em><\/a><\/p><p class=" op-bk-polysemy-move"><span class="c-showurl">baike.baidu.com<\/span><span class="c-tools" id="tools_4782685847164316924_1" data-tools="{title:NBA历史得分榜_百度百科,url:http:\/\/baike.baidu.com\/item\/NBA%E5%8E%86%E5%8F%B2%E5%BE%97%E5%88%86%E6%A6%9C\/2177038?fr=aladdin}"><a class="c-tip-icon"><i class="c-icon c-icon-triangle-down-g"><\/i><\/a><\/span> - <a target="_blank" href="http:\/\/open.baidu.com\/" class="op_LAMP"><\/a><\/p><\/div><\/div><div class="c-gap-top c-recommend" style=""><i class="c-icon c-icon-bear-circle c-gap-right-small"><\/i><span class="c-gray">为您推荐：<\/span><a class="" href="\/s?tn=baidu&amp;rsv_idx=1&amp;wd=nba抢断排行榜&amp;rsv_crq=6&amp;bs=nba得分排行榜" title="nba抢断排行榜" target="_blank">nba抢断排行榜<\/a><a class="c-gap-left-large" href="\/s?tn=baidu&amp;rsv_idx=1&amp;wd=nba失误排行榜&amp;rsv_crq=6&amp;bs=nba得分排行榜" title="nba失误排行榜" target="_blank">nba失误排行榜<\/a><a class="c-gap-left-large" href="\/s?tn=baidu&amp;rsv_idx=1&amp;wd=nba历史三双榜&amp;rsv_crq=6&amp;bs=nba得分排行榜" title="nba历史三双榜" target="_blank">nba历史三双榜<\/a><a class="c-gap-left-large" href="\/s?tn=baidu&amp;rsv_idx=1&amp;wd=nba档案解密&amp;rsv_crq=6&amp;bs=nba得分排行榜" title="nba档案解密" target="_blank">nba档案解密<\/a><a class="c-gap-left-large" href="\/s?tn=baidu&amp;rsv_idx=1&amp;wd=阴钰辰&amp;rsv_crq=6&amp;bs=nba得分排行榜" title="阴钰辰" target="_blank">阴钰辰<\/a><\/div><\/div>'){1}//*常用文字*/;


        /*常用通用方法*/
        /*测试普通*/
        this.testDefault = function (type) {
            var res,
                template = Mock.mock({
                    "id": reg_id,
                    "token": /([0-9a-zA-Z]{6}){4}/,
                    "adminId": reg_id,
                    "organizationId": reg_id
                });

            if (type) {
                if (type === 'list') {
                    res = {
                        message: 'ok',
                        code: 0,
                        result: template
                    };
                } else if ('table') {
                    res = {
                        status: 200,
                        data: {
                            message: 'ok',
                            code: 0,
                            result: template
                        }
                    };
                } else {
                    res = {
                        message: 'ok',
                        code: 0,
                        result: template
                    };
                }
            } else {
                res = {
                    message: 'ok',
                    code: 0,
                    result: template
                };
            }
            return res;
        };

        /*测试列表*/
        this.testList = function (config) {
            return generateConfig(config, 'list');
        };

        /*测试表格*/
        this.testTableList = function (config) {
            return generateConfig(config, 'tablelist');
        };

        /*测试菜单*/
        this.testMenu = function () {
            var res = {
                    message: 'ok',
                    code: 0,
                    result:Mock.mock({
                        'menu|3-5':[{
                            'modId':reg_id
                        }]
                    })
                };
            return res;
        };


        /*生成范围*/
        function generateLimit(config) {
            var limit = 'list|';
            /*配置信息*/
            if (config) {
                var min = config.min,
                    max = config.max;

                if (typeof min === 'undefined') {
                    if (typeof max === 'undefined') {
                        limit = 'list|10';
                    } else {
                        limit = 'list|' + max;
                    }
                } else {
                    if (typeof max === 'undefined') {
                        limit = 'list|' + min;
                    } else {
                        limit = 'list|' + min + '-' + max;
                    }
                }
            } else {
                limit = 'list|10';
            }
            return limit;
        }

        /*生成配置信息*/
        function generateConfig(config, type) {
            var limit = generateLimit(config),
                res/*获取配置信息*/,
                list = {
                    count: 50
                }/*列表数据*/;

            /*配置动态生成列表数据*/
            list[limit] = [{
                "id": reg_id,
                "name": reg_name,
                "mobile": reg_mobile,
                "dateTime": reg_datetime,
                "number": /[0-9a-zA-Z]{18}/,
                "state": reg_id,
                "money": reg_money,
                "type": reg_id,
                "remark": reg_remark,
                "content": reg_content
            }];

            if (type === 'list') {
                res = {
                    message: 'ok',
                    code: 0
                }/*结果集*/;
                /*动态生成*/
                res['result'] = Mock.mock(list);
            } else if (type === 'table') {
                res = {
                    status: 200,
                    data: {
                        message: 'ok',
                        code: 0
                    }
                }/*结果集*/;
                /*动态生成*/
                res['data']['result'] = Mock.mock(list);
            }
            return res;
        }
    });