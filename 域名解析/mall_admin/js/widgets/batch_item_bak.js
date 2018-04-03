/*批量组件*/
;(function ($) {
    /*构造函数*/
    function BatchItem(){}
    /*子类*/
    function SubBatchItem() {
        /*保存已选中的列表值*/
        this.checkid=[];
        /*保存已选中的对象*/
        this.checkitem=[];
        /*保存已选中的类型的当前状态：比如：激活状态：1，禁止状态：0*/
        this.state=1;
        /*保存是否有选中*/
        this.check=0;
        /*类型映射状态*/
        this.stateobj={
            1:'激活',
            0:'禁止'
        };
    }
    /*空函数*/
    function nofn(){}


    /**/

    /*初始化函数*/
    BatchItem.prototype.init=function (opt) {
        var self=this;
        $.extend(true,this,{
            showactive:'admin-batchitem-showactive',
            checkactive:'admin-batchitem-checkactive',
            $batchtoggle:null,
            $batchshow:null,
            $checkall:null,
            $action:null,
            istable:false,
            isstate:false,
            $listwrap:null
        },opt);

        /*组件初始化*/
        this.widgetInit();
        /*绑定事件*/
        this.bind();
    };

    /*组件初始化*/
    BatchItem.prototype.widgetInit=function () {
        var self=this;
        /*确认组件*/
        if(!self['setSure']){
            console.log('aaa');
            var sureObj=public_tool.sureDialog(self.dia)/*回调提示对象*/;
            self.setSure=new sureObj();
        }
    };

    /*事件注册*/
    BatchItem.prototype.bind=function () {
        var self=this;
        if(self.$batchtoggle){
            if(self.$batchshow){
                /*绑定切换批量显示隐藏*/
                self.$batchtoggle.on('click',function () {
                    self.$batchshow.toggleClass(self.showactive);
                });
                if(self.$listwrap){
                    /*绑定全选与取消全选*/
                    if(self.$checkall){
                        self.$checkall.on('click',function (){
                            var $this=$(this),
                                state=parseInt($this.attr('data-check'),10);
                            if(state===0){
                                /*选中*/
                                self.check=1;
                                $this.attr({
                                    'data-check':1
                                }).addClass(self.checkactive);
                                /*执行全选*/
                                self.toggleCheckAll(1);
                            }else if(state===1){
                                /*取消选中*/
                                self.check=0;
                                $this.attr({
                                    'data-state':0
                                }).removeClass(self.checkactive);
                                /*执行取消全选*/
                                self.toggleCheckAll(0);
                            }
                        });
                    }
                    if(self.istable){
                        self.$listwrap.find('tbody').on('change','input[type="checkbox"]',function () {
                            self.toggleCheckItem($(this));
                        });
                    }else{
                        self.$listwrap.on('change','input[type="checkbox"]',function () {
                            self.toggleCheckItem($(this));
                        });
                    }

                }
            }
        }
    };

    /*事件注销*/
    BatchItem.prototype.unbind=function () {
        var self=this;
        self.$batchtoggle.off('click');
        self.$checkall.off('click');
        if(self.istable){
            self.$listwrap.find('tbody').off('change','input[type="checkbox"]');
        }else{
            self.$listwrap.off('change','input[type="checkbox"]');
        }
    };


    /*对外工具*/

    /*清除状态(用于依赖于状态的操作)*/
    BatchItem.prototype.clearState=function () {
        this.$checkall.attr({
            'data-state':1
        });
        this.state=1;
    };

    /*清空数据(清除已经选中的数据)*/
    BatchItem.prototype.clear=function () {
        this.checkid.length=0;
        this.check=0;
        this.$checkall.attr({
            'data-check':0
        }).removeClass(this.checkactive);

        /*清除选中*/
        var len=this.checkitem.length;
        if(len!==0){
            var i=0;
            for(i;i<len;i++){
                this.checkitem[i].prop('checked', false);
            }
            this.checkitem.length=0;
        }
    };

    /*全选和取消全选*/
    BatchItem.prototype.toggleCheckAll=function (check) {
        var self=this,
            $wrap;
        if(check===1){
            /*选中*/
            if(self.istable){
                $wrap=self.$listwrap.find('tbody');
            }else{
                $wrap=self.$listwrap;
            }
            if(self.isstate){
                /*依赖状态*/
                $wrap.find('tr').each(function (index, element) {
                    var $input=$(element).find('td:first input:checkbox');
                    if(index===0){
                        if($input.length==0){
                            self.clear();
                            return false;
                        }
                        if(!$input.is(':checked')){
                            self.checkid.push($input.prop('checked',true).val());
                            self.checkitem.push($input);
                        }
                        self.state=parseInt($input.attr('data-state'),10);
                    }else{
                        var tempstate=parseInt($input.attr('data-state'),10);
                        if(self.state===tempstate&&!$input.is(':checked')){
                            self.checkid.push($input.prop('checked',true).val());
                            self.checkitem.push($input);
                        }
                    }
                });
            }else{
                /*不依赖于状态*/
                $wrap.find('tr').each(function (index, element) {
                    var $input=$(element).find('td:first input:checkbox');
                    if(index===0){
                        if($input.length==0){
                            self.clear();
                            return false;
                        }
                    }
                    if(!$input.is(':checked')){
                        self.checkid.push($input.prop('checked',true).val());
                        self.checkitem.push($input);
                    }
                });
            }
        }else if(check===0){
            /*取消选中*/
            self.clear();
        }
    };

    /*绑定选中某个单独多选框*/
    BatchItem.prototype.toggleCheckItem=function ($input) {
        var self=this,
            len=self.checkid.length,
            ishave=-1,
            text=$input.val();

        if($input.is(':checked')){
            if(!self.$batchshow.hasClass(self.showactive)){
                self.$batchshow.addClass(self.showactive);
            }
            if (len === 0) {
                self.checkid.push(text);
                self.checkitem.push($input);
                if(self.isstate){
                    self.state=parseInt($input.attr('data-state'),10);
                }
                self.$checkall.attr({
                    'data-check':1
                }).addClass(self.checkactive);
            } else {
                if(self.isstate){
                    var tempstate=parseInt($input.attr('data-state'),10);
                    if(self.state===tempstate){
                        ishave=$.inArray(text,self.checkid);
                        if(ishave!==-1){
                            self.checkid.splice(ishave,1,text);
                            self.checkitem.splice(ishave,1,$input);
                        }else{
                            self.checkid.push(text);
                            self.checkitem.push($input);
                        }
                    }else{
                        $input.prop('checked',false);
                    }
                }else{
                    ishave=$.inArray(text,self.checkid);
                    if(ishave!==-1){
                        self.checkid.splice(ishave,1,text);
                        self.checkitem.splice(ishave,1,$input);
                    }else{
                        self.checkid.push(text);
                        self.checkitem.push($input);
                    }
                }
            }

        }else{
            ishave=$.inArray(text,self.checkid);
            if(ishave!==-1){
                self.checkid.splice(ishave,1);
                self.checkitem.splice(ishave,1);
                if(self.checkid.length===0){
                    self.clear();
                }
            }
        }
    };

    /*获取选中的数据*/
    BatchItem.prototype.getBatchData=function () {
        return this.checkid;
    };

    /*获取选中的文档节点*/
    BatchItem.prototype.getBatchNode=function () {
        return this.checkitem;
    };

    /*批量操作*/
    BatchItem.prototype.batchAction=function (fn) {
        
    };




    /*设置继承*/
    nofn.prototype=BatchItem.prototype;
    SubBatchItem.prototype=new nofn();

    /*设置地址对外接口*/
    if(public_tool){
        public_tool['BatchItem']=SubBatchItem;
    }else{
        window['BatchItem']=SubBatchItem;
    }
})(jQuery);