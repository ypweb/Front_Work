/*http:请求，响应,配置*/
'use strict';
angular.module('http.interceptor',[]).factory('httpInterceptor',['BASE_CONFIG','$httpParamSerializerJQLike',function (BASE_CONFIG,$httpParamSerializerJQLike) {
	var http_config={};

	/*请求配置*/
	http_config.request=function (config) {
		var url=config.url,
			set=config.set;
		
		/*需要转换的*/
		if(set){
			var headers=config.headers,
				data=config.data;
			/*配置url*/
			if(typeof url!=='undefined'){
				config.url=BASE_CONFIG.basedomain + BASE_CONFIG.baseproject + url;
			}
			/*设置头信息*/
			if(typeof headers!=='undefined'){
				headers['Content-Type']="application/x-www-form-urlencoded";
			}else{
				config['headers']={ "Content-Type": "application/x-www-form-urlencoded" };
			}
			/*转换参数*/
			if(typeof data!=='undefined'&&data){
				config.data=$httpParamSerializerJQLike(data);
			}
			/*清除需要配置项*/
			delete config.set;
			return config;
		}
	};
	return http_config;
}]);

