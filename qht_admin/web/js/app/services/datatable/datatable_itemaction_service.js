/*表格服务*/
'use strict';
angular.module('app')
	.service('dataTableItemActionService',function () {
		/*单项服务*/
		var self=this;

		this.action_map={
			'add':{
				name:'添加'
			},
			'delete':{
				name:'删除'
			},
			'update':{
				name:'更新'
			},
			'query':{
				name:'查询'
			},
			'detail':{
				name:'查看'
			},
			'forbid':{
				name:'禁用'
			},
			'enable':{
				name:'启用'
			},
			'up':{
				name:'上架'
			},
			'down':{
				name:'下架'
			},
			'sure':{
				name:'确定'
			},
			'cance':{
				name:'取消'
			},
			'audit':{
				name:'审核'
			},
			'toggle':{
				name:'切换'
			}
		};

		/*初始化*/
		this.initItemAction=function (itemaction) {
			/*检验数据合法性*/
			if(!itemaction){
				return;
			}

			/*初始化数据*/
			self.init(itemaction);


		};

		/*初始化配置*/
		this.init=function (itemaction) {
			/*绑定相关事件*/
			self.bind(itemaction);
		};

		/*事件注册*/
		this.bind=function (itemaction) {
			/*有容器存在*/
			if(itemaction.$bodywrap){
				/*绑定操作选项*/
				itemaction.$bodywrap.on('click','span',function (e){
					e.stopPropagation();
					e.preventDefault();

					var target= e.target,
						$this,
						id,
						action;

					//适配对象
					if(target.className.indexOf('btn-operate')===-1){
						/*过滤非btn-operate按钮*/
						return false;
					}else{
						$this=$(target);
					}

					id=$this.attr('data-id');
					action=$this.attr('data-action');
					/*过滤非id,action按钮*/
					if(!id && !action){
						return false;
					}
					/*操作分支*/
					self.adaptCase(itemaction,{
						$btn:$this,
						id:id,
						action:action
					});
				});
			}
		};
		
		/*分支适配*/
		this.adaptCase=function (itemaction,config) {
			/*特殊操作*/
			/*to do*/
			/*回调*/
			if(itemaction.itemaction_api){
				itemaction.itemaction_api.doItemAction.call(null,config);
			}
		};


	});
