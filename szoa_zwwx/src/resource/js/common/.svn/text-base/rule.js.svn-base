/*
 * 正则表达式验证非法字符
*/
define([], function () {
 
	//过滤标签，替换为相应的实体
	function checkName(s) { 
		var pattern = new RegExp("[<>]") 
		var rs = ""; 			 
		for (var i = 0; i < s.length; i++) { 
			if(s.substr(i, 1)==="<"){
				rs = rs+s.substr(i, 1).replace(pattern, "&lt"); 
			}else{
				rs = rs+s.substr(i, 1).replace(pattern, "&gt"); 
			}
			
		} 
		return rs; 
	} 
	
	//过滤特殊字符
	function checkByte(s) { 
		var pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]") 
		var rs = ""; 			 
		for (var i = 0; i < s.length; i++) { 
			rs = rs+s.substr(i, 1).replace(pattern, ''); 
		} 
		return rs; 
	}
	
    return {
    	checkName:checkName,
    	checkByte: checkByte
    }
});