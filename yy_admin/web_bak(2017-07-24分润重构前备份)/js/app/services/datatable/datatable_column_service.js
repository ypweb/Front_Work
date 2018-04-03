/*表格服务*/
'use strict';
angular.module('app')
	.service('dataTableColumnService',function () {
		/*初始化配置*/
		var self=this;

		/*初始化*/
		this.initColumn=function (tablecolumn,tablecache) {
			/*检验数据合法性*/
			if(!tablecolumn && !tablecache){
				return;
			}
			/*初始化数据*/
			self.init(tablecolumn,tablecache);
		};

		/*初始化配置*/
		this.init=function (tablecolumn,tablecache) {
			/*初始化组件*/
			self.initWidget(tablecolumn,tablecache);
			/*绑定相关事件*/
			self.bind(tablecolumn,tablecache);
		};
		

		/*初始化组件*/
		this.initWidget=function (tablecolumn,tablecache) {
			/*隐藏*/
			var tempid,
				str='',
				i=0;


			for(i;i<tablecolumn.hide_len;i++){
				tempid=tablecolumn.hide_list[i];
				str+='<li data-value="'+tempid+'">第'+(tempid + 1)+'列</li>';
				tablecache.column(tempid).visible(false);
			}
			if(str!==''){
				/*赋值控制下拉选项*/
				$(str).appendTo(tablecolumn.$column_ul.html(''));
			}
			/*设置分组*/
			tablecolumn.$colgroup.html(self.createColgroup(tablecolumn,tablecolumn.hide_len));
		};
		
		/*绑定相关事件*/
		this.bind=function (tablecolumn,tablecache) {
			/*绑定切换列控制按钮*/
			tablecolumn.$column_btn.on('click',function () {
				tablecolumn.$column_wrap.toggleClass('g-d-hidei');
			});
			/*绑定操作列数据*/
			tablecolumn.$column_ul.on('click','li',function () {
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

				var count=tablecolumn.$column_ul.find('.action-list-active').size();

				/*设置分组*/
				tablecolumn.$colgroup.html(self.createColgroup(tablecolumn,tablecolumn.hide_len - count));
			});
		};
		
		/*取消绑定*/
		this.unbind=function (cache) {
			cache.$column_btn.off('click');
			cache.$column_ul.off('click','li');
		};

		/*重新生成分组*/
		this.createColgroup=function (tablecolumn,glen) {
			var str='';
			/*部分隐藏*/
			var j=0,
				len,
				colitem,
				tempcol=0;

			if(tablecolumn.ischeck){
				len=tablecolumn.init_len - glen - 1;
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
				self.emptyColSpan(tablecolumn,len + 1);
			}else{
				len=tablecolumn.init_len - glen;
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
				self.emptyColSpan(tablecolumn,len);
			}
			for(j;j<len;j++){
				str+='<col class="g-w-percent'+colitem+'" />';
			}
			return tablecolumn.ischeck?'<col class="g-w-percent5" />'+str:str;
		};

		/*数据为空时判断主体合并值*/
		this.emptyColSpan=function (tablecolumn,len) {
			var isdata=tablecolumn.column_api.isEmpty();
			if(isdata){
				tablecolumn.$bodywrap.find('td').attr({
					'colspan':len
				});
			}
		};
	});
