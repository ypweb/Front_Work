/*表格服务*/
'use strict';
angular.module('app')
    .service('dataTableColumn',['toolUtil','toolDialog','$sce',function (toolUtil,toolDialog,$sce) {

        /*初始化配置*/
        var self=this,
            init_hidelist=null,
            init_len=0,
            hide_len=0,
            ischeck=false,
            fn_list=null,
            selectwrap=null,
            bodywrap=null,
            tablecache=null,
            $btn=null,
            $ul=null;


        /*初始化*/
        this.initColumn=function (table,$scope) {
            /*检验数据合法性*/
            if(!table){
                return;
            }
            if(!$scope){
                return;
            }
            /*清除缓存数据*/
            self.unbind();
            self.clear();
            /*复制数据*/
            self.initExtend(table);

            /*初始化数据*/
            if(hide_len===0){
                /*设置下拉模型*/
                table['selectshow']=false;
                /*设置分组和表头模型*/
                self.createGroup();
                self.createThead();
            }else{
                /*设置下拉模型*/
                table['selectshow']=true;
                var time_id=null,
                    count=0;

                /*启动监听*/
                time_id=setInterval(function () {
                    count++;
                    if(fn_list){
                        tablecache=fn_list.getTable.call(null);
                        if(tablecache!==null){
                            clearInterval(time_id);
                            time_id=null;

                            /*初始化组件*/
                            self.initWidget(table,$scope);
                            /*绑定相关事件*/
                            self.bind(table,$scope);
                            count=null
                        }else if(count>=600){
                            /*计时器，防止请求超时，不断的监听相关数据:6s时间界限*/
                            clearInterval(time_id);
                            time_id=null;
                        }
                    }
                },1000/60);
            }
        };

        /*初始化数据复制*/
        this.initExtend=function (table) {
            /*复制数据*/
            init_hidelist=table.hide_list.slice(0).sort(function (a,b) {
                return a - b;
            });
            ischeck=table.ischeck;
            init_len=table.init_len;
            hide_len=init_hidelist.length;
            fn_list=table.api;
            selectwrap=$(table.selectwrap);
            bodywrap=$(table.bodywrap);
            $btn=selectwrap.prev();
            $ul=selectwrap.find('ul');
        };

        /*初始化组件*/
        this.initWidget=function (table,$scope) {
            /*隐藏*/
            var tempid,
                str='',
                i=0;

            for(i;i<hide_len;i++){
                tempid=init_hidelist[i];
                str+='<li data-value="'+tempid+'">第'+(tempid + 1)+'列</li>';
                tablecache.column(tempid).visible(false);
            }
            if(str!==''){
                /*赋值控制下拉选项*/
                $(str).appendTo($ul.html(''));
            }
            /*设置分组和表头模型*/
            /*更新模型*/
            $scope.$apply(function () {
                table.colgroup=$sce.trustAsHtml(self.createColgroup(hide_len));
            });
        };

        /*绑定相关事件*/
        this.bind=function (table,$scope) {
            $btn.on('click',function () {
                selectwrap.toggleClass('g-d-hidei');
            });
            $ul.on('click','li',function () {
                /*切换显示相关列*/
                var $this=$(this),
                    active=$this.hasClass('action-list-active'),
                    index=$this.attr('data-value');

                if(active){
                    $this.removeClass('action-list-active');
                    tablecache.column(index).visible(false);
                }else{
                    $this.addClass('action-list-active');
                    tablecache.column(index).visible(true);
                }

                var count=$ul.find('.action-list-active').size();

                /*更新模型*/
                $scope.$apply(function () {
                    table.colgroup=$sce.trustAsHtml(self.createColgroup(hide_len - count));
                });
            });
        };

        /*解绑事件*/
        this.unbind=function () {
            /*解绑事件*/
            if(selectwrap){
                $btn.off('click');
                $ul.off('click');
            }
        };

        /*重置数据*/
        this.clear=function () {
            /*重置缓存数据*/
            init_hidelist=null;
            init_len=0;
            hide_len=0;
            ischeck=false;
            selectwrap=null;
            bodywrap=null;
            fn_list=null;
            tablecache=null;
            $btn=null;
            $ul=null;
        };

        /*重新生成分组*/
        this.createColgroup=function (glen) {
            var str='';
            /*部分隐藏*/
            var j=0,
                len,
                colitem,
                tempcol=0;

            if(ischeck){
                len=init_len - glen - 1;
                tempcol=45 % len;
                if(tempcol!==0){
                    colitem=parseInt((45 - tempcol)/len,10);
                }else{
                    colitem=parseInt(45/len,10);
                }
                /*解析分组*/
                if(colitem * len<=(45 - len)){
                    colitem=len + 1;
                }
                /*设置主体值*/
                self.emptyColSpan(len + 1);
            }else{
                len=init_len - glen;
                tempcol=50 % len;
                if(tempcol!==0){
                    colitem=parseInt((50 - tempcol)/len,10);
                }else{
                    colitem=parseInt(50/len,10);
                }
                /*解析分组*/
                if(colitem * len<=(50 - len)){
                    colitem=len + 1;
                }
                /*设置主体值*/
                self.emptyColSpan(len);
            }
            for(j;j<len;j++){
                str+='<col class="g-w-percent'+colitem+'" />';
            }
            return ischeck?'<col class="g-w-percent5" />'+str:str;
        };

        /*重新生成头信息*/
        this.createThead=function (arr) {
            var str='';
            if(typeof arr==='undefined'){
                /*全隐藏*/
                for(var i in init_thead){
                    str+=init_thead[i];
                }
            }else{
                var head=$.extend(true,{},init_thead),
                    hidelist=arr.sort(function (a,b) {
                        return a - b;
                    }),
                    len=hidelist.length,
                    j=0;

                /*解析头部*/
                for(j;j<len;j++){
                    delete head[hidelist[j]];
                }
                for(var o in head){
                    str+=head[o];
                }
            }
            return '<tr>'+str+'</tr>';
        };
        /*数据为空时判断主体合并值*/
        this.emptyColSpan=function (len) {
            var isdata=fn_list.isEmpty();
            if(!isdata){
                bodywrap.find('td').attr({
                    'colspan':len
                });
            }
        };
    }]);
