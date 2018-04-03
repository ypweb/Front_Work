/*表格服务*/
'use strict';
angular.module('app')
	.service('dataTableCheckAllService',function () {
		/*全选服务*/
		var self=this,
			temp_init=null,
			temp_count=0;


		/*初始化*/
		this.initCheckAll=function (tablecheckall) {
			/*检验数据合法性*/
			if(!tablecheckall){
				return;
			}

			/*初始化数据*/
			self.init(tablecheckall);
		};

		/*初始化配置*/
		this.init=function (tablecheckall) {
			/*绑定相关事件*/
			self.bind(tablecheckall);
		};

		/*事件注册*/
		this.bind=function (tablecheckall) {
			/*有全选项和子选项*/
			if(tablecheckall.$checkall && tablecheckall.$bodywrap){
				/*绑定全选与取消全选*/
				tablecheckall.$checkall.on('click',function (){
					var $this=$(this),
						tempstate=parseInt($this.attr('data-check'),10);
					if(tempstate===0){
						/*选中*/
						tablecheckall.checkvalue=1;
						$this.attr({
							'data-check':1
						}).addClass(tablecheckall.checkactive);
						/*执行全选*/
						self.toggleCheckAll(tablecheckall,1);
					}else if(tempstate===1){
						/*取消选中*/
						tablecheckall.checkvalue=0;
						$this.attr({
							'data-check':0
						}).removeClass(tablecheckall.checkactive);
						/*执行取消全选*/
						self.toggleCheckAll(tablecheckall,0);
					}
				});

				/*绑定单项选择*/
				tablecheckall.$bodywrap.on('change','input[type="checkbox"]',function () {
					self.toggleCheckItem(tablecheckall,$(this));
				});


			}
		};
		
		/*取消绑定*/
		this.unbind=function (cache) {
			/*绑定全选与取消全选*/
			cache.$checkall.off('click');

			/*绑定单项选择*/
			cache.$bodywrap.off('change','input[type="checkbox"]');
		};

		/*清除数据*/
		this.clear=function (tablecheckall) {
			tablecheckall.checkid.length=0;
			tablecheckall.checkvalue=0;
			tablecheckall.$checkall.attr({
				'data-check':0
			}).removeClass(tablecheckall.checkactive);

			/*清除选中*/
			var len=tablecheckall.checkitem.length;
			if(len!==0){
				var i=0;
				for(i;i<len;i++){
					tablecheckall.checkitem[i].closest('tr').removeClass(tablecheckall.highactive);
					tablecheckall.checkitem[i].prop('checked', false);
				}
				tablecheckall.checkitem.length=0;
			}
		};


		/*过滤数据(清除并过滤已经选中的数据)*/
		this.filterData=function (tablecheckall,key) {
			/*清除选中*/
			var checkid=tablecheckall.checkid,
				len=checkid.length;
			if(len!==0 && typeof key!=='undefined'){
				var checkitem=tablecheckall.checkitem;
				if($.isArray(key)){
					var j=0,
						jlen=key.length,
						k=0,
						klen=checkitem.length;

					outer:for(j;j<jlen;j++){
						for(k;k<klen;k++){
							if(checkid[k]===key[j]){
								checkitem[k].closest('tr').removeClass(tablecheckall.highactive);
								checkitem[k].prop('checked', false);
								checkitem.splice(k,1);
								checkid.splice(k,1);
								k=0;
								klen=checkid.length;
								continue outer;
							}
						}
					}
					if(tablecheckall.checkid.length===0){
						self.clear(tablecheckall);
					}
				}else{
					var i=len - 1;
					for(i;i>=0;i--){
						if(checkid[i]===key){
							checkitem[i].closest('tr').removeClass(tablecheckall.highactive);
							checkitem[i].prop('checked', false);
							checkitem.splice(i,1);
							checkid.splice(i,1);
							break;
						}
					}
					if(checkid.length===0){
						self.clear(tablecheckall);
					}
				}
			}
		};


		/*全选和取消全选*/
		this.toggleCheckAll=function (tablecheckall,chk) {
			if(chk===1){
				/*选中*/
				/*不依赖于状态*/
				tablecheckall.$bodywrap.find('tr').each(function (index, element) {
					console.log(element);
					var $input=$(element).find('td:first input:checkbox');
					if(index===0){
						if($input.size()===0){
							self.clear(tablecheckall);
							return false;
						}
					}
					if(!$input.is(':checked')){
						tablecheckall.checkid.push($input.prop('checked',true).val());
						tablecheckall.checkitem.push($input);
						$input.closest('tr').addClass(tablecheckall.highactive);
					}
				});
			}else if(chk===0){
				/*取消选中*/
				self.clear(tablecheckall);
			}
		};


		/*绑定选中某个单独多选框*/
		this.toggleCheckItem=function (tablecheckall,$input) {
			var checkid=tablecheckall.checkid,
				checkitem=tablecheckall.checkitem,
				len=checkid.length,
				ishave=-1,
				text=$input.val();

			if($input.is(':checked')){
				if (len === 0) {
					checkid.push(text);
					checkitem.push($input);
					$input.closest('tr').addClass(tablecheckall.highactive);
					tablecheckall.$checkall.attr({
						'data-check':1
					}).addClass(tablecheckall.checkactive);
				} else {
					ishave=$.inArray(text,checkid);
					$input.closest('tr').addClass(tablecheckall.highactive);
					if(ishave!==-1){
						checkid.splice(ishave,1,text);
						checkitem.splice(ishave,1,$input);
					}else{
						checkid.push(text);
						checkitem.push($input);
					}
				}

			}else{
				ishave=$.inArray(text,checkid);
				if(ishave!==-1){
					checkid.splice(ishave,1);
					checkitem[ishave].closest('tr').removeClass(tablecheckall.highactive);
					checkitem.splice(ishave,1);
					if(checkid.length===0){
						self.clear(tablecheckall);
					}
				}
			}
		};


		/*获取选中的数据*/
		this.getBatchData=function (tablecheckall) {
			return tablecheckall.checkid;
		};


		/*获取选中的文档节点*/
		this.getBatchNode=function (tablecheckall) {
			return tablecheckall.checkitem;
		};

	});
