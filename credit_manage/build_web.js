((function(files){
	
		//配置信息
	var configs={
		appDir:'',/*根目录，此目录下的文件都会被复制到dir目录下*/
		dir:'',/*输出目录*/
		baseUrl:'',/*查找文件的锚点*/
		modules:'',/*模块名称*/
		fileExclusionRegExp: /^(r|build)\.js|(lib|widgets)|.*\.(less|css|png|jpg|jpeg|gif|html|eot|svg|ttf|woff|json)$/,/*不要复制的文件*/
		optimizeCss:'none',/*是否优化css文件*/
		removeCombined:true,/*是否删除已合并文件*/
		optimize:"uglify",/*压缩方式*/
		useStrict: false,/*是否开启严格模式*/
		paths:'',
		shim:''
	},
		//模块配置
		pathlist={
			"serve":{
				'jquery':'../../../js/lib/jquery/jquery',
				'jquery_mobile':'../../../js/lib/jquery/jquery-mobile',
				'slide':'../../src/widgets/slide',
				'grid':'../../src/widgets/grid'
			},
			"index":{
				'jquery':'../../../js/lib/jquery/jquery',
				'jquery_mobile':'../../../js/lib/jquery/jquery-mobile',
				'slide':'../../src/widgets/slide'
			},
			"credit":{
				'zepto':'../../../js/lib/zepto/zepto'
			}
			
		},
		//模块依赖
		shimlist={
			"serve":{
				'jquery_mobile':{
					deps:['jquery']
				}
			},
			"index":{
				'jquery_mobile':{
					deps:['jquery']
				}
			}
		},
		param={
			config:configs,
			path:pathlist,
			shim:shimlist
		};
		
	return doBatches(param,files);
	
	//服务类
	function doBatches(obj,files){
		//输出目录
		var dir='web/js/'+files,
		//查找文件位置
			baseurl='web/src/'+files,
		//模块名称
			module={name:files},
			result=obj.config,
			path=obj.path,
			shim=obj.shim;
		
		//注入obj对象配置信息
		result.dir=dir;
		result.baseUrl=baseurl;
		result.modules=[module];
		result.paths=path[files]||'';
		result.shim=shim[files]||'';
		//返回配置好的对象信息
		return result;
	}
	
	
})('serve'))



/*
路径：D:\apm_serve\www\htdocs\Myself_Web\YTTX\credit_manage

命令： node r.js -o build.js


*/