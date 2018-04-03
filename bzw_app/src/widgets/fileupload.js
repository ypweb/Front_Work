/***
name:file upload plugin
author:yipin
表单文件上传组件
***/

define(['jquery'],function($){
	
	return {
				/*
				初始化方法
				参数：opt:基本的配置参数(类型，图片最大限制，实际大小，需要大小，正则表达式),
				fn:回调函数，上传图片之后的操作
				*/
				fileUpload:function(opt,fn){
						//初始化参数
						var self=this;

						this.type='';
						this.realdata;
						this.needdata;
						this.pattern;
						this.$input;
						this.fn=fn;
						this.maxCount;
						
						//合并参数
						$.extend(this,opt);

						if(!this.tiptime){
							this.tiptime=5000;
						}
						if(!this.dia&&typeof this.dia!=='function'){
							this.dia=dialog();
						}
						//初始化
						this.init();
						
				},
				/*
				初始化内部数据
				*/
				init:function(){
					this.size=this.size * 1024;
					//限制类型
					if(this.type==''||this.type==null){
							this.type='png|jpg|jpeg|gif';
					}else if(this.type.indexOf(',')!=-1){
							this.type=this.type.replace(/,/g,'|');
					}
					this.pattern=new RegExp('^image\/('+this.type+')$');
					this.bindEvents();
				},
				/*
				事件绑定
				*/
				bindEvents:function(){
					//绑定点击事件并路由
					var self=this;
					this.$input.on('change',function(){

						self.uploadHTML5(this.files);
					});
				},
				/*
				html5 方法
				*/
				uploadHTML5:function(arr){
						if(typeof this.count=='function'&&this.count){
								if(this.count()>=this.maxSize){
									this.dia.content('<span class="g-c-err">最多只能上传"&nbsp;'+this.maxSize+'&nbsp;"张图片</span>').showModal();
									return false;
								}
						}
						var filearr=arr[0],
						self=this;
						if(typeof filearr.type=='string'&&!this.pattern.test(filearr.type)){
							this.dia.content('只能上传"&nbsp;<span class="g-c-err">'+this.type.replace(/\|/g,'&nbsp;,&nbsp;')+'&nbsp;</span>"类型图片').showModal();
							setTimeout(function(){
								self.dia.close();
							},self.tiptime);
							return false;
						}
						if(filearr.size>this.size){
							this.realdata=(filearr.size/1024).toString();
							this.needdata=(this.size/1024).toString();
							if(this.realdata.indexOf('.')==-1){
								this.realdata=this.realdata+'.00';
							}
							this.realdata=this.realdata.split('.');
							if(this.needdata.indexOf('.')==-1){
								this.needdata=this.needdata+'.00';
							}
							this.needdata=this.needdata.split('.');
							this.dia.content('上传的图片太大(<span class="g-c-err">' + this.realdata[0]+'.'+this.realdata[1].slice(0,2)+'kb</span>),需小于(<span class="g-c-info">' + this.needdata[0]+'.'+this.needdata[1].slice(0,2) + 'kb</span>)').showModal();
							setTimeout(function(){
								self.dia.close();
							},self.tiptime);
							return false;
						}
						var reader = new FileReader();                           
						reader.readAsDataURL(filearr);
						//执行回调
						reader.onload =function(){
								return self.fn.call(arr,reader);
						};	
					
				}
		}
});
