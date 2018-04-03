<template>
  <div class="wrapper">
        <div class="detail-wrap">
            <div class="detail-header">
                <h1>{{detail.pro_name}}</h1>
            </div>
            <div class="detail-page">
                <div class="box box-image">
                    <h2 class="detail-title">商品图片</h2>
                    <div class="box-content">
                        <img :src="detail.main[0]" class="image">
                    </div>
                </div>
                <section class="box">
                    <h2 class="detail-title">限时抢购</h2>
                    <div class="box-content">
                        <div class="plug clearfix">
                            <div class="price">
                                <span class="symbol">￥</span>
                                <span class="current-price">{{detail.price}}</span>
                                <span class="group">
                                  <span class="original-price" style="height:10px;">&nbsp;</span>
                                  <span class="salenum">{{detail.stock}} 件已售</span>
                                </span>
                            </div>
                            <div class="timer">
                                <p class="tt">活动倒计时</p>
                                <div id="timer"><span class="aliziDay"><b>0</b>天</span><span class="aliziDay"><b>09</b>时</span><span class="aliziDay"><b>53</b>分</span><span class="aliziDay"><b>08</b>秒</span></div>
                            </div>
                        </div>
                        <div class="content-title">
                            <h1>{{detail.pro_name}}</h1>
                            <p></p>
                        </div>
                        <div class="baoyou">
                            <span class="by">全国包邮</span>
                            <span class="huo">货到付款</span>
                            <span class="tui">七天无理由退款</span>
                        </div>
                        <div class="gou"><a href="#orderForm">立即抢购</a></div>
                    </div>
                </section>
                <section class="box">
                    <h2 class="detail-title">商品描述</h2>
                    <div class="box-content detail-content">
                        <figure v-for="descript in detail.descript"><img class="lazy" v-lazy="descript"></figure>
                    </div>
                </section>
                <section class="box">
                    <h2 class="detail-title">订单信息</h2>
                    <div class="box-content">
                        <div class="order theme-thin lang-zh-cn border clearfix">
                            <div class="main border full-row">
                                <div class="order-title border ellipsis"><i class="icon-cart"></i>澳洲名酒 BIN 407 03 S</div>
                                <div class="order-content border">
                                    <form action="/index.php?m=Order&amp;a=aliziBooking" method="post" id="orderForm">
                                        <input type="hidden" name="user_id" value="2">
                                        <input type="hidden" name="user_pid" value="2">
                                        <input type="hidden" name="sn" value="3OSMBR">
                                        <input type="hidden" name="item_id" value="233">
                                        <input type="hidden" name="item_name" value="澳洲名酒 BIN 407 03 S">
                                        <input type="hidden" name="item_price" id="item_price" value="2300.00">
                                        <input type="hidden" name="url" value="http://gg.vimenchina.cn/index.php?m=Order&amp;id=3OSMBR&amp;uid=2&amp;tpl=detail&amp;-7=&amp;from=singlemessage&amp;isappinstalled=0">
                                        <input type="hidden" name="redirect" value="http://gg.vimenchina.cn/index.php?m=Order&amp;id=3OSMBR&amp;uid=2&amp;tpl=detail&amp;-7=&amp;from=singlemessage&amp;isappinstalled=0">
                                        <input type="hidden" name="referer" value="">
                                        <input type="hidden" name="order_page" value="detail">
                                        <input type="hidden" name="channel_id" value="">
                                        <input type="hidden" name="qrcode_pay" value="0">
                                        <input type="hidden" name="math" value="+0">
                                        <input type="hidden" name="page" value="detail">
                                        <section class="order-box">
                                            <div class="rows clearfix rows-id-params rows-id-params-radio">
                                                <label class="rows-head">套餐选择<span class="order-request">*</span></label>
                                                <div class="rows-params">
                                                    <label value="2300.00" target="#item_price" fx="zuimao.quantity" fx-params="0" class=" ellipsis params active " title="2300元买两箱送两箱+复古皮质礼盒4个+施华洛银钻对杯">
                                                        <input type="radio" name="item_params" value="2300元买两箱送两箱+复古皮质礼盒4个+施华洛银钻对杯" checked="">2300元买两箱送两箱+复古皮质礼盒4个+施华洛银钻对杯</label>
                                                    <label value="1288.00" target="#item_price" fx="zuimao.quantity" fx-params="0" class=" ellipsis params " title="1288元买一箱送一箱+复古皮质礼盒2个">
                                                        <input type="radio" name="item_params" value="1288元买一箱送一箱+复古皮质礼盒2个">1288元买一箱送一箱+复古皮质礼盒2个</label>
                                                </div>
                                            </div>
                                            <div class="rows clearfix rows-id-quantity">
                                                <label class="rows-head">订购数量<span class="order-request ">*</span></label>
                                                <div class="rows-params">
                                                    <div class="quantity-group">
                                                        <a class="quantity-dec" href="javascript:;">-</a>
                                                        <input type="tel" class="quantity" size="4" value="1" name="quantity">
                                                        <a class="quantity-inc" href="javascript:;">+</a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="rows clearfix rows-id-price">
                                                <label class="rows-head">订单价格<span class="order-request request-none">*</span></label>
                                                <div class="rows-params"><span class="shipping" style="display:none;"><strong class="order-price">2300.00</strong>+<strong class="shipping-price">0</strong>(运费)=</span><strong class="total-price">2300.00</strong>元</div>
                                            </div>
                                        </section>
                                        <section class="order-box">
                                            <div class="rows clearfix rows-id-name">
                                                <label class="rows-head">收货人名<span class="order-request ">*</span></label>
                                                <div class="rows-params">
                                                    <input type="text" name="name" placeholder="输入您的姓名或称呼" autocomplete="off" request="1" class="input-text" value="">
                                                </div>
                                            </div>
                                            <div class="rows clearfix rows-id-mobile">
                                                <label class="rows-head">手机号码<span class="order-request ">*</span></label>
                                                <div class="rows-params">
                                                    <input type="tel" name="mobile" placeholder="输入您的手机号码" autocomplete="off" class="input-text" request="1" value="">
                                                </div>
                                            </div>
                                            <div class="rows clearfix rows-id-region">
                                                <label class="rows-head">选择地区<span class="order-request ">*</span></label>
                                                <div class="rows-params">
                                                    <input class="input-text" type="text" name="area" placeholder="请选择地区" autocomplete="off" request="1" readonly="true" id="expressArea">
                                                </div>
                                            </div>
                                            <div class="rows clearfix rows-id-address">
                                                <label class="rows-head">详细地址<span class="order-request ">*</span></label>
                                                <div class="rows-params">
                                                    <input type="text" name="address" placeholder="请填写您的详细地址" autocomplete="off" request="1" class="input-text" value="">
                                                </div>
                                            </div>
                                            <div class="rows clearfix rows-id-remark">
                                                <label class="rows-head">留言备注<span class="order-request request-none">*</span></label>
                                                <div class="rows-params">
                                                    <textarea name="remark" placeholder=" 如备用电话、商品数量、收货时间等，额外需求请留言" class="input-text" request="" rows="2"></textarea>
                                                </div>
                                            </div>
                                            <div class="rows clearfix rows-id-payment">
                                                <label class="rows-head">支付方式<span class="order-request ">*</span></label>
                                                <div class="rows-params">
                                                    <div class="payment clearfix">
                                                        <label value="1" target=":payment" fx="alizi.payment" fx-params="1" class="ellipsis params payment-1 active">
                                                            <input type="radio" name="payment" value="1" checked="">货到付款</label>
                                                    </div>
                                                    <div id="payment-info" class="order-alert clearfix">
                                                        <div class="payment-info">选择货到付款，安全放心</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                        <div class="rows clearfix">
                                            <input type="submit" id="sumit" class="btn-submit" value="确认提交">
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
<!--                         <div class="side order full-row">
                            <div class="order-title border ellipsis"><i class="icon-shipping"></i>最新订购</div>
                            <div class="order-delivery">
                                <div class="order-scroll" id="order-scroll">
                                    <ul class="full-row">
                                        <li>
                                            <p><span class="order-badge">吉林</span>刘*[139****9749]</p>
                                            <p><span class="order-date">4分钟前</span>澳洲名酒 BIN 407 03 S - 2300元买两箱送两箱+复古皮质礼盒4个+施华洛银钻对杯</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">贵州</span>王*[133****2779]</p>
                                            <p><span class="order-date">半小时前</span>澳洲名酒 BIN 407 03 S - 1288元买一箱送一箱+复古皮质礼盒2个</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">北京</span>仲*[159****5710]</p>
                                            <p><span class="order-date">4分钟前</span>澳洲名酒 BIN 407 03 S - 2300元买两箱送两箱+复古皮质礼盒4个+施华洛银钻对杯</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">宁夏</span>张*[152****6647]</p>
                                            <p><span class="order-date">3分钟前</span>澳洲名酒 BIN 407 03 S - 2300元买两箱送两箱+复古皮质礼盒4个+施华洛银钻对杯</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">辽宁</span>刘*[137****5686]</p>
                                            <p><span class="order-date">1分钟前</span>澳洲名酒 BIN 407 03 S - 1288元买一箱送一箱+复古皮质礼盒2个</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">辽宁</span>杨*[131****3430]</p>
                                            <p><span class="order-date">1分钟前</span>澳洲名酒 BIN 407 03 S - 1288元买一箱送一箱+复古皮质礼盒2个</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">广西</span>吴*[159****2171]</p>
                                            <p><span class="order-date">3分钟前</span>澳洲名酒 BIN 407 03 S - 1288元买一箱送一箱+复古皮质礼盒2个</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">上海</span>郑*[135****9343]</p>
                                            <p><span class="order-date">4分钟前</span>澳洲名酒 BIN 407 03 S - 1288元买一箱送一箱+复古皮质礼盒2个</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">上海</span>张*[188****2999]</p>
                                            <p><span class="order-date">1分钟前</span>澳洲名酒 BIN 407 03 S - 2300元买两箱送两箱+复古皮质礼盒4个+施华洛银钻对杯</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">浙江</span>仲*[135****9077]</p>
                                            <p><span class="order-date">3分钟前</span>澳洲名酒 BIN 407 03 S - 1288元买一箱送一箱+复古皮质礼盒2个</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">湖南</span>张*[189****5071]</p>
                                            <p><span class="order-date">2分钟前</span>澳洲名酒 BIN 407 03 S - 2300元买两箱送两箱+复古皮质礼盒4个+施华洛银钻对杯</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">四川</span>杨*[158****9072]</p>
                                            <p><span class="order-date">5分钟前</span>澳洲名酒 BIN 407 03 S - 2300元买两箱送两箱+复古皮质礼盒4个+施华洛银钻对杯</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">江苏</span>郑*[159****3331]</p>
                                            <p><span class="order-date">3分钟前</span>澳洲名酒 BIN 407 03 S - 2300元买两箱送两箱+复古皮质礼盒4个+施华洛银钻对杯</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">河北</span>钟*[132****4630]</p>
                                            <p><span class="order-date">5分钟前</span>澳洲名酒 BIN 407 03 S - 2300元买两箱送两箱+复古皮质礼盒4个+施华洛银钻对杯</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">四川</span>李*[137****9830]</p>
                                            <p><span class="order-date">5分钟前</span>澳洲名酒 BIN 407 03 S - 2300元买两箱送两箱+复古皮质礼盒4个+施华洛银钻对杯</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">云南</span>吴*[189****3742]</p>
                                            <p><span class="order-date">4分钟前</span>澳洲名酒 BIN 407 03 S - 1288元买一箱送一箱+复古皮质礼盒2个</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">云南</span>杨*[159****1237]</p>
                                            <p><span class="order-date">半小时前</span>澳洲名酒 BIN 407 03 S - 2300元买两箱送两箱+复古皮质礼盒4个+施华洛银钻对杯</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">湖南</span>柳*[188****1769]</p>
                                            <p><span class="order-date">2分钟前</span>澳洲名酒 BIN 407 03 S - 1288元买一箱送一箱+复古皮质礼盒2个</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">浙江</span>谢*[135****1648]</p>
                                            <p><span class="order-date">半小时前</span>澳洲名酒 BIN 407 03 S - 2300元买两箱送两箱+复古皮质礼盒4个+施华洛银钻对杯</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">上海</span>杨*[135****8145]</p>
                                            <p><span class="order-date">2分钟前</span>澳洲名酒 BIN 407 03 S - 2300元买两箱送两箱+复古皮质礼盒4个+施华洛银钻对杯</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">广东</span>柳*[139****4530]</p>
                                            <p><span class="order-date">4分钟前</span>澳洲名酒 BIN 407 03 S - 2300元买两箱送两箱+复古皮质礼盒4个+施华洛银钻对杯</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">四川</span>钟*[139****9583]</p>
                                            <p><span class="order-date">5分钟前</span>澳洲名酒 BIN 407 03 S - 2300元买两箱送两箱+复古皮质礼盒4个+施华洛银钻对杯</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">浙江</span>周*[158****8739]</p>
                                            <p><span class="order-date">5分钟前</span>澳洲名酒 BIN 407 03 S - 2300元买两箱送两箱+复古皮质礼盒4个+施华洛银钻对杯</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">江西</span>张*[135****2075]</p>
                                            <p><span class="order-date">4分钟前</span>澳洲名酒 BIN 407 03 S - 1288元买一箱送一箱+复古皮质礼盒2个</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">北京</span>陈*[137****4183]</p>
                                            <p><span class="order-date">4分钟前</span>澳洲名酒 BIN 407 03 S - 1288元买一箱送一箱+复古皮质礼盒2个</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">福建</span>钱*[131****7231]</p>
                                            <p><span class="order-date">3分钟前</span>澳洲名酒 BIN 407 03 S - 1288元买一箱送一箱+复古皮质礼盒2个</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">四川</span>黄*[136****1609]</p>
                                            <p><span class="order-date">3分钟前</span>澳洲名酒 BIN 407 03 S - 1288元买一箱送一箱+复古皮质礼盒2个</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">青海</span>周*[159****3148]</p>
                                            <p><span class="order-date">3分钟前</span>澳洲名酒 BIN 407 03 S - 1288元买一箱送一箱+复古皮质礼盒2个</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">贵州</span>方*[132****5862]</p>
                                            <p><span class="order-date">3分钟前</span>澳洲名酒 BIN 407 03 S - 2300元买两箱送两箱+复古皮质礼盒4个+施华洛银钻对杯</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">四川</span>仲*[139****8394]</p>
                                            <p><span class="order-date">2分钟前</span>澳洲名酒 BIN 407 03 S - 2300元买两箱送两箱+复古皮质礼盒4个+施华洛银钻对杯</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">山东</span>郑*[152****2164]</p>
                                            <p><span class="order-date">半小时前</span>澳洲名酒 BIN 407 03 S - 2300元买两箱送两箱+复古皮质礼盒4个+施华洛银钻对杯</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">福建</span>杨*[158****7546]</p>
                                            <p><span class="order-date">半小时前</span>澳洲名酒 BIN 407 03 S - 2300元买两箱送两箱+复古皮质礼盒4个+施华洛银钻对杯</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">河北</span>吴*[135****3697]</p>
                                            <p><span class="order-date">3分钟前</span>澳洲名酒 BIN 407 03 S - 2300元买两箱送两箱+复古皮质礼盒4个+施华洛银钻对杯</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">云南</span>郑*[132****3243]</p>
                                            <p><span class="order-date">3分钟前</span>澳洲名酒 BIN 407 03 S - 1288元买一箱送一箱+复古皮质礼盒2个</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">海南</span>朱*[188****5957]</p>
                                            <p><span class="order-date">3分钟前</span>澳洲名酒 BIN 407 03 S - 2300元买两箱送两箱+复古皮质礼盒4个+施华洛银钻对杯</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">湖南</span>钱*[137****3781]</p>
                                            <p><span class="order-date">1分钟前</span>澳洲名酒 BIN 407 03 S - 2300元买两箱送两箱+复古皮质礼盒4个+施华洛银钻对杯</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">上海</span>周*[188****1924]</p>
                                            <p><span class="order-date">半小时前</span>澳洲名酒 BIN 407 03 S - 2300元买两箱送两箱+复古皮质礼盒4个+施华洛银钻对杯</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">广东</span>李*[139****3144]</p>
                                            <p><span class="order-date">3分钟前</span>澳洲名酒 BIN 407 03 S - 2300元买两箱送两箱+复古皮质礼盒4个+施华洛银钻对杯</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">广东</span>刘*[139****6207]</p>
                                            <p><span class="order-date">半小时前</span>澳洲名酒 BIN 407 03 S - 2300元买两箱送两箱+复古皮质礼盒4个+施华洛银钻对杯</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">湖南</span>黄*[137****2901]</p>
                                            <p><span class="order-date">2分钟前</span>澳洲名酒 BIN 407 03 S - 2300元买两箱送两箱+复古皮质礼盒4个+施华洛银钻对杯</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">上海</span>钟*[188****1802]</p>
                                            <p><span class="order-date">3分钟前</span>澳洲名酒 BIN 407 03 S - 1288元买一箱送一箱+复古皮质礼盒2个</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">上海</span>朱*[133****5565]</p>
                                            <p><span class="order-date">2分钟前</span>澳洲名酒 BIN 407 03 S - 2300元买两箱送两箱+复古皮质礼盒4个+施华洛银钻对杯</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">宁夏</span>周*[131****7307]</p>
                                            <p><span class="order-date">5分钟前</span>澳洲名酒 BIN 407 03 S - 2300元买两箱送两箱+复古皮质礼盒4个+施华洛银钻对杯</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">宁夏</span>杨*[137****3253]</p>
                                            <p><span class="order-date">5分钟前</span>澳洲名酒 BIN 407 03 S - 1288元买一箱送一箱+复古皮质礼盒2个</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">江苏</span>吴*[188****7117]</p>
                                            <p><span class="order-date">3分钟前</span>澳洲名酒 BIN 407 03 S - 2300元买两箱送两箱+复古皮质礼盒4个+施华洛银钻对杯</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">江苏</span>柳*[137****7022]</p>
                                            <p><span class="order-date">4分钟前</span>澳洲名酒 BIN 407 03 S - 1288元买一箱送一箱+复古皮质礼盒2个</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">青海</span>王*[137****4816]</p>
                                            <p><span class="order-date">4分钟前</span>澳洲名酒 BIN 407 03 S - 1288元买一箱送一箱+复古皮质礼盒2个</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">宁夏</span>符*[137****8623]</p>
                                            <p><span class="order-date">2分钟前</span>澳洲名酒 BIN 407 03 S - 2300元买两箱送两箱+复古皮质礼盒4个+施华洛银钻对杯</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">黑龙江</span>吴*[132****4843]</p>
                                            <p><span class="order-date">1分钟前</span>澳洲名酒 BIN 407 03 S - 1288元买一箱送一箱+复古皮质礼盒2个</p>
                                        </li>
                                        <li>
                                            <p><span class="order-badge">北京</span>郑*[136****6717]</p>
                                            <p><span class="order-date">1分钟前</span>澳洲名酒 BIN 407 03 S - 2300元买两箱送两箱+复古皮质礼盒4个+施华洛银钻对杯</p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div> -->
                    </div>
                </section>
            </div>
        </div>
        <!--选择地区弹层-->
<!--         <section id="areaLayer" class="express-area-box">
            <header>
                <h3>选择地区</h3>
                <a id="backUp" class="back icon-back" href="javascript:void(0)" title="返回"></a>
                <a id="closeArea" class="close icon-close" href="javascript:void(0)" title="关闭"></a>
            </header>
            <article id="areaBox">
                <ul id="areaList" class="area-list"></ul>
            </article>
        </section> -->
        <!--遮罩层-->
        <!-- <div id="areaMask" class="mask"></div> -->
        <div class="remark">浙ICP备16016059号</div>
        <div class="footer">Copyright © 2016 <a href="http://www.z-mao.com" target="_blank">http://www.z-mao.com</a> All Rights Reserved</div>
        <div class="foot-nav"><a class="up" href="#">TOP</a>
            <ul>
                <li class="foot-nav-1" style="width:49%"><a href="#orderForm"><strong class="icon edit">立即下单</strong></a></li>
                <li class="foot-nav-2" style="width:49%"><a href="tel:4007325555"><strong class="icon call">联系电话</strong></a></li>
            </ul>
        </div>
    </div>
</template>
<style lang="scss">
@import './../../common/sass/global.scss';
  .wrapper
{
    height: 100%;
    margin: 0;
    padding: 0;

    background-image: url('../../assets/images/bg.jpg');
    background-attachment: fixed;
    background-position: center;
    background-size: cover;
}
.lazy
{
    margin: auto;

    text-align: center;

    background: #fff;
}
.detail-wrap
{
    background-color: rgba(225, 225, 225, .5);
    .detail-header
    {
        height: 1.066667rem;
        padding: .266667rem;

        border-bottom: 1px solid rgba(225, 225, 225, .5);
        h1
        {
            font-weight: bold;
            line-height: 1.066667rem;

            color: #fff;

            @include font-dpr(20px);
        }
    }
    .detail-title
    {
        padding: .266667rem 25px;

        color: #545454;
        border-bottom: 1px solid #ccc;
        background: url(../../assets/images/vline.jpg) no-repeat 15px center;

        @include font-dpr(16px);

    }
    .detail-content
    {
        figure
        {
            font-size: 0;
        }
        figure img
        {
            width: 100%;
        }
    }
    .box-image
    {
        .image
        {
            width: 100%;
        }
    }
}

.full-row
{
    width: 100% !important;
}

.ellipsis
{
    overflow: hidden;

    white-space: nowrap;
    text-overflow: ellipsis;
    word-wrap: break-word;
    word-break: break-all;
}

.theme-thin
{
    .rows-head
    {
        font-weight: normal;
        line-height: .666667rem;

        position: absolute;
        left: 0;

        width: 1.6rem;
        padding: 2px 0;

        text-align: right;

        border-bottom: none;

        @include font-dpr(12px);
    }

    .rows
    {
        position: relative;

        padding-top: .2rem;
    }
    .rows-params
    {
        line-height: .666667rem;

        overflow: hidden;

        margin-left: 1.8rem;

        @include font-dpr(14px);
        .payment label
        {
            padding-left: 32px;

            background-image: url(../../assets/images/payment.png);
            background-repeat: no-repeat;
            background-position: left -5px;
        }
        .payment label.active,
        .payment label:hover
        {
            background-position: -200px 0;
        }
        .params
        {
            float: left;

            max-width: 90%;
            margin-right: 4px;
            margin-bottom: 4px;
            padding: .226667rem;

            transition: all .3s linear 0s;
            white-space: nowrap;
            text-decoration: none;

            color: #666;
            border: 1px solid #ccc;
            border-radius: .1rem;
            background-color: #fff;

            @include font-dpr(12px);
            input[type='radio']
            {
                display: none;
            }
            &.active
            {
                color: #fff !important;
                border-color: #e30;
                background-color: #e30;
            }
        }
        .input-text
        {
            font-family: MicroSoft Yahei;

            display: inline-block;

            width: 7.0rem;
            height: .666667rem;
            margin-right: 1px;
            padding: 0;

            transition: all .2s linear 0s;
            vertical-align: middle;
            text-indent: .133333rem;

            color: #555;
            border: 1px solid #ccc;
            border-width: 1px;
            border-radius: 2px;
            outline: none;
            box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);
        }
        textarea.input-text
        {
            height: auto !important;
        }
    }
}

.order
{
    .order-title
    {
        font-size: .6rem;

        padding: .266667rem;

        color: #fff;
        background-color: #666;
    }
    .total-price
    {
        font-size: .72rem;

        color: #f60;
    }
    .order-content
    {
        padding: .2rem;
    }
    .order-request
    {
        font-size: 12px;
        font-weight: bold;
        line-height: .666667rem;

        display: inline-block;
        float: left;

        margin-left: 3px;

        color: #f60;
    }
    .order-alert
    {
        line-height: .666667rem;

        margin-bottom: .666667rem;
        padding: .2rem;

        color: #c00;
        border: 1px solid #eed3d7;
        border-radius: 3px;
        background-color: #fbeedf;
        text-shadow: 0 1px 0 rgba(255, 255, 255, .5);

        @include font-dpr(14px);
    }
    .order-delivery
    {
        padding: 0 .266667rem;
    }
    .order-scroll
    {
        font-size: 12px;

        position: relative;

        overflow: hidden;

        height: 250px !important;
        li
        {
            padding: 10px;

            list-style: none;

            border-bottom: 1px dotted #ccc;
        }
        li:nth-child(even)
        {
            background: #f4f4f4;
        }
        p
        {
            margin: 0;
            line-height: 20px;
        }
        .order-badge
        {
            font-weight: normal;
            line-height: 10px;

            float: right;

            // margin-left: 20px;
            padding: 5px;

            color: #fff;
            border-radius: 5px;
            background-color: #f60;
        }
        .order-date
        {
            float: right;
        }
    }
    .btn-submit
    {
        font-family: MicroSoft Yahei;
        line-height: .666667rem;

        display: inline-block;

        width: 100%;
        margin-bottom: 0;
        padding: .2rem 0;

        cursor: pointer;
        text-align: center;
        vertical-align: middle;

        color: #fff;
        border: 1px solid #f60;
        border-radius: .106667rem;
        outline: none;
        background-color: #f60;

        @include font-dpr(18px);
        -webkit-appearance: none;
    }
}

.box
{
    margin: .333333rem;
    padding: 5px 0;

    background-color: #fff;

    .box-content
    {
        .content-title
        {
            padding: 15px;

            border-bottom: 1px solid #eee;
            h1
            {
                font-weight: bold;

                color: #555;

                @include font-dpr(18px);
            }
        }
        .baoyou
        {
            line-height: 25px;

            overflow: hidden;

            height: 25px;
            padding: 10px 0 10px 10px;

            border-bottom: 1px #eee solid;
            span
            {
                font-size: 13px;

                display: inline;
                float: left;

                margin-right: 5px;
                padding-left: 22px;

                background-size: 20px 20px;
            }
        }
        .gou
        {
            font-size: 18px;
            line-height: 45px;

            height: 45px;
            margin: 5px;

            text-align: center;

            color: #fff;
            border-radius: 3px;
            background: #c60a1e;
            a
            {
                text-decoration: none;
                width: 100%;
                display: block;
                color: #fff;

                @include font-dpr(18px);
            }
        }
        .plug
        {
            .timer
            {
                font-weight: bold;
                line-height: 20px;

                float: left;

                width: 40%;
                height: 54px;

                text-align: center;

                color: #555;
                background: #eee;

                @include font-dpr(12px);
                .tt
                {
                    padding-top: 5px;

                    color: #f00;

                    @include font-dpr(14px);
                }
            }
            .price
            {
                float: left;

                width: 60%;
                height: 54px;

                vertical-align: bottom;

                color: #fff;
                background: #f61d4b;
                .symbol
                {
                    float: left;

                    padding-top: 28px;

                    vertical-align: bottom;

                    @include font-dpr(14px);
                }
                .current-price
                {
                    line-height: 54px;

                    float: left;

                    vertical-align: bottom;
                    letter-spacing: -3px;

                    @include font-dpr(34px);
                }
                .group
                {
                    float: left;

                    margin-left: 5px;
                }
                .original-price
                {
                    line-height: 20px;

                    display: block;

                    padding-top: 5px;

                    vertical-align: top;
                }
                .salenum
                {
                    line-height: 20px;
                    line-height: 25px;

                    height: 25px;
                    padding: 2px;

                    vertical-align: bottom;

                    border-radius: 1px;
                    background: #ca032e;

                    @include font-dpr(14px);
                }
            }
        }
    }
}
.by
{
    background: url(../../assets/images/you.jpg) no-repeat left 1px;
}
.huo
{
    background: url(../../assets/images/huo.jpg) no-repeat left 1px;
}
.tui
{
    background: url(../../assets/images/tui.jpg) no-repeat left 1px;
}
.icon-cart,
.icon-shipping
{
    display: inline-block;

    width: .8rem;
    height: .8rem;
    margin-right: .266667rem;

    vertical-align: middle;

    background: url(../../assets/images/icon.png) no-repeat;
    background-size: .8rem;
}
.icon-shipping
{
    background-position: center bottom;
}
.foot-nav
{
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;

    width: 100%;
    margin: 0 auto;

    background-color: $primarycolor;
    .icon
    {
        padding-left: 25px;
    }
    .edit
    {
        background-image: url(../../assets/images/edit-32.png);
    }
    .call
    {
        background-image: url(../../assets/images/call.png);
    }
    .up
    {
        display: inline-block;
        float: left;

        width: 50px;
        height: 25px;
        padding-top: 20px;

        text-align: center;
        text-decoration: none;

        color: #fff;
        border-right: 1px dashed #fff;
        background: url(../../assets/images/aliziTop.png) center top no-repeat;

        @include font-dpr(18px);
    }
    ul
    {
        line-height: 45px;

        overflow: hidden;

        width: auto;
        height: 45px;
        margin: 0 auto;
        padding: 0 0;

        list-style: none;

        opacity: .9;

        filter: alpha(opacity=90);
        li
        {
            float: left;

            width: 33.33%;

            text-align: center;
            a
            {
                font-size: 14px;

                display: block;

                width: 100%;

                text-decoration: none;

                color: #fff;
                border-left: 1px dashed #f3f3f3;
                strong
                {
                    font-weight: normal;

                    position: inherit;

                    display: inline;

                    background-repeat: no-repeat;
                    background-position: left center;
                    background-size: 20px 20px;

                    @include font-dpr(16px);
                }
            }
            &:first-child a
            {
                border-left: none;
            }
        }
    }
}

.quantity-group
{
    .quantity,
    .quantity-inc,
    .quantity-dec
    {
        font-size: .32rem;
        line-height: .666667rem;

        float: left;

        width: .666667rem;
        height: .666667rem;

        text-align: center;

        color: #333;
        border: 1px solid #ccc;
        background-color: #f4f4f4;
    }
    .quantity
    {
        width: .8rem;
        padding: 0 .266667rem;

        color: #333;
        border-width: 1px 0 1px 0;
        border-radius: 0;
        background-color: #fff;
    }
}


/*选择地区弹层*/

.express-area-box
{
    position: fixed;
    z-index: 15;
    bottom: -100%; // left: 50%;

    width: 10rem; // margin-left: -160px;

    color: #4d525d;
    background-color: #fff;
}

.express-area-box header
{
    position: relative;

    border-top: 1px solid #e2e2e2;
    border-bottom: 1px solid #e2e2e2;
}

.express-area-box header h3
{
    line-height: 1.2rem; // margin: 0 1.675rem;

    text-align: center;

    @include font-dpr(18px);
}

.express-area-box header .back,
.express-area-box header .close
{
    font-size: .32rem;
    line-height: 1.2rem;

    position: absolute;
    top: 0;

    height: 1.2rem;
    padding: 0 .266667rem;

    color: #4b4b4b;
}

.express-area-box header .back
{
    left: 0;

    display: none;
}

.express-area-box header .close
{
    right: 0;
}

.express-area-box article
{
    overflow-y: scroll;

    height: 6.666667rem;
}

.area-list li
{
    line-height: .4rem;

    box-sizing: border-box;
    padding: .3rem;

    text-align: justify;

    border-bottom: 1px solid #e2e2e2;

    @include font-dpr(14px);
}



/*遮罩层*/

.mask
{
    position: absolute;
    z-index: 12;
    top: 0;
    left: 0;

    display: none;

    width: 100%;
    height: 100%;

    background-color: rgba(0, 0, 0, .5);
}

.remark
{
    padding-top: 5px;

    text-align: center;

    color: #ccc;

    @include font-dpr(14px);
}

.footer
{
    margin-top: 10px;
    padding: 10px 0 40px 0;

    text-align: center;

    color: #fff;
    color: #666;

    @include font-dpr(14px);
    a
    {
        color: #fff;
    }
}

.clearfix
{
    overflow: hidden;
}

.clearfix:after
{
    display: block;
    clear: both;

    content: '';
}
</style>
<script type="text/javascript">
  import Vue from 'vue'
  import axios from 'axios'
  import VueAxios from 'vue-axios'
  import VueLazyload from 'vue-lazyload'
  Vue.use(VueAxios, axios)
  Vue.use(VueLazyload, {
    preLoad: 1.3,
    loading: '../static/images/loading.gif',
    attempt: 1,
    listenEvents: [ 'scroll' ]
  })
  export default {
    data () {
      return {
        detail: {}
      }
    },
    created () {
      let detailAPI = '../../../static/detail.json';
      let pro_id = this.$route.params.pro_id;
      axios.get(detailAPI, {
        params: {
          ID: pro_id
        }
      }).then(res => {
        this.detail = res.data[pro_id];
        this.$store.commit({
          type: 'updateTitle',
          title: this.detail.pro_name
        })
      });
    }
  }
</script>
