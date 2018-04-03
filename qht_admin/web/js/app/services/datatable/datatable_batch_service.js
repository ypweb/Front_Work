/*表格服务*/
'use strict';
angular.module('app')
	.service('dataTableCacheService',function () {
		var self=this;

		/*table缓存*/
		this.tableCache={};
		/*设置缓存*/
		this.setCache=function (key,cache) {
			if(!key && !cache){
				return false;
			}
			self.tableCache[key]=$.extend(true,{},cache);
		};
		/*获取缓存*/
		this.getCache=function (key) {
			if(!key){
				return null;
			}
			if(self.isKey(key)){
				return self.tableCache[key];
			}else{
				return null;
			}
		};
		/*设置表格*/
		this.setTable=function (key,table) {
			if(!key && !table){
				return false;
			}
			if(self.isKey(key)){
				self.tableCache[key]['tablecache']=table;
			}else{
				self.tableCache[key]={};
				self.tableCache[key]['tablecache']=table;
			}
		};
		/*获取表格*/
		this.getTable=function (key) {
			if(!key){
				return null;
			}
			if(self.isKey(key)){
				if(self.tableCache[key]['tablecache']){
					return self.tableCache[key]['tablecache'];
				}else{
					return null;
				}
			}else{
				return null;
			}
		};
		/*获取某一个属性值*/
		this.getAttr=function (key,str) {
			if(!key){
				return null;
			}
			if(self.isKey(key)){
				if(self.isColumn(key,str)){
					return self.tableCache[key][str];
				}
				return null;
			}else{
				return null;
			}
		};
		/*设置某一个属性值*/
		this.setAttr=function (key,str,cache) {
			if(!key){
				return false;
			}
			if(self.isKey(key)){
				self.tableCache[key][str]=cache;
			}
		};
		/*覆盖某个索引*/
		this.setKey=function (key,cache,flag) {
			if(!key && !cache){
				return false;
			}
			self.tableCache[key]=$.extend(true,{},cache);
			if(flag){
				/*是否销毁缓存*/
				cache=null;
			}
		};
		/*判断是否存索引*/
		this.isKey=function (key) {
			if(typeof self.tableCache[key]==='undefined'){
				return false;
			}else{
				return true;
			}
		};
		/*是否存在列缓存,一般是搭配是否存在索引一起使用*/
		this.isColumn=function (key,str) {
			if(typeof str!=='undefined'){
				if(typeof self.tableCache[key][str]==='undefined'){
					return false;
				}else{
					if(self.tableCache[key][str]===null){
						return false;
					}
					return true;
				}
			}else{
				if(typeof self.tableCache[key]['hide_len']==='undefined'){
					return false;
				}else{
					return true;
				}
			}
		};
	})
	.service('dataTableColumnService',['dataTableCacheService','$sce',function (dataTableCacheService,$sce) {
		/*初始化配置*/
		var self=this,
			temp_cache=null,
			temp_init=null,
			temp_count=0;

		/*初始化*/
		this.initColumn=function (key,table,$scope) {
			/*检验数据合法性*/
			if(!table){
				return;
			}
			if(!$scope){
				return;
			}
			/*判断是否存在缓存*/
			if(dataTableCacheService.isKey(key)){
				/*设置下拉模型*/
				table['selectshow']=true;

				/*重置临时数据*/
				temp_cache=null;

				/*如果不存在缓存则创建缓存*/
				if(!dataTableCacheService.isColumn(key)){
					/*初始化数据*/
					self.init(key,table,$scope);
				}
			}else{
				/*重新启动初始化,启动监听*/
				temp_init=setTimeout(function () {
					temp_count++;
					clearTimeout(temp_init);
					temp_init=null;
					/*设置时间限制，超过这个限制则停止初始化:6s*/
					if(temp_count<=120){
						self.initColumn(key,table,$scope);
					}
				},50);
			}
		};

		/*初始化配置*/
		this.init=function (key,table,$scope) {
			/*创建缓存*/
			var selectwrap=$(table.selectwrap);

			/*复制临时缓存*/
			temp_cache={
				init_hidelist:table.hide_list.slice(0).sort(function (a,b) {
					return a - b;
				}),
				ischeck:table.ischeck,
				init_len:table.init_len,
				hide_len:init_hidelist.length,
				api:table.api,
				selectwrap:selectwrap,
				bodywrap:$(table.bodywrap),
				$btn:selectwrap.prev(),
				$ul:selectwrap.find('ul')
			};

			/*初始化组件*/
			self.initWidget(key,table,$scope);
			/*绑定相关事件*/
			self.bind(key,table,$scope);
		};
		

		/*初始化组件*/
		this.initWidget=function (key,table,$scope) {
			/*隐藏*/
			var tempid,
				str='',
				i=0;

			temp_cache['tablecache']=dataTableCacheService.getTable(key);

			for(i;i<temp_cache.hide_len;i++){
				tempid=temp_cache.init_hidelist[i];
				str+='<li data-value="'+tempid+'">第'+(tempid + 1)+'列</li>';
				temp_cache.tablecache.column(tempid).visible(false);
			}
			if(str!==''){
				/*赋值控制下拉选项*/
				$(str).appendTo(temp_cache.$ul.html(''));
			}
			/*设置分组和表头模型*/
			/*更新模型*/
			$scope.$apply(function () {
				table.colgroup=$sce.trustAsHtml(self.createColgroup(temp_cache.hide_len));
			});
		};
		
		/*绑定相关事件*/
		this.bind=function (key,table,$scope) {
			/*绑定切换列控制按钮*/
			temp_cache.$btn.on('click',function () {
				temp_cache.selectwrap.toggleClass('g-d-hidei');
			});
			/*绑定操作列数据*/
			temp_cache.$ul.on('click','li',function () {
				/*切换显示相关列*/
				var $this=$(this),
					active=$this.hasClass('action-list-active'),
					index=$this.attr('data-value');

				if(active){
					$this.removeClass('action-list-active');
					temp_cache.tablecache.column(index).visible(false);
				}else{
					$this.addClass('action-list-active');
					temp_cache.tablecache.column(index).visible(true);
				}

				var count=temp_cache.$ul.find('.action-list-active').size();

				/*更新模型*/
				$scope.$apply(function () {
					table.colgroup=$sce.trustAsHtml(self.createColgroup(temp_cache.hide_len - count));
				});
			});
			/*复制数据,并设置缓存*/
			dataTableCacheService.setKey(key,temp_cache,true);
		};

		/*重新生成分组*/
		this.createColgroup=function (glen) {
			var str='';
			/*部分隐藏*/
			var j=0,
				len,
				colitem,
				tempcol=0;

			if(temp_cache.ischeck){
				len=temp_cache.init_len - glen - 1;
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
				len=temp_cache.init_len - glen;
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
			return temp_cache.ischeck?'<col class="g-w-percent5" />'+str:str;
		};

		/*数据为空时判断主体合并值*/
		this.emptyColSpan=function (len) {
			var isdata=temp_cache.api.isEmpty();
			if(!isdata){
				temp_cache.bodywrap.find('td').attr({
					'colspan':len
				});
			}
		};
	}])
	.service('dataTableCheckAllService',function () {
		/*全选服务*/
		/*初始化*/
	});
