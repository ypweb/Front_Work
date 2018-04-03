/*datepicker 97时间日期服务*/
angular.module('app')
	.service('datePicker97Service',function () {
		/*初始化配置*/
		var self=this,
			isdate=WdatePicker && typeof WdatePicker==='function';

		this.datePicker=function (mode,config) {
			if(!mode && !config){
				return false;
			}
			if(isdate){
				WdatePicker({
					onpicked:function(dp){
						mode.dateTime=dp.cal.getNewDateStr();
					},
					oncleared:function () {
						mode.dateTime='';
					},
					maxDate:mode.dateTime===''?moment().format('YYYY-MM-DD'):config.format?config.format:'%y-%M-%d',
					position:config.position?config.position:{left:0,top:2}
				});
			}
		};

		this.datePickerRange=function (mode,config) {
			if(!isdate){
				return false;
			}
			if(!mode && !config){
				return false;
			}
			$.each([config.$node1,config.$node2],function (index) {
				this.on('click',function () {
					if(index===0){
						 WdatePicker({
							 onpicked:function(dp){
								 mode.startTime=dp.cal.getNewDateStr();
							 },
							 oncleared:function () {
								 mode.startTime='';
							 },
							 maxDate:mode.endTime===''?moment().format('YYYY-MM-DD'):'#F{$dp.$D(\''+config.$node2.selector.slice(1)+'\')}',
							 position:config.position?config.position:{left:0,top:2}
						 });
					 }else if(index===1){
						 WdatePicker({
							 onpicked:function(dp){
								 mode.endTime=dp.cal.getNewDateStr();
							 },
							 oncleared:function () {
								 mode.endTime='';
							 },
							 minDate:mode.startTime===''?moment().format('YYYY-MM-DD'):'#F{$dp.$D(\''+config.$node1.selector.slice(1)+'\')}',
							 maxDate:config.format?config.format:'%y-%M-%d',
							 position:config.position?config.position:{left:0,top:2}
						 });
					 }

				});
			});
		};
	});
