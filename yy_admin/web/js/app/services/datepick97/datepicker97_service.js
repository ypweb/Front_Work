/*datepicker 97时间日期服务*/
angular.module('app')
	.service('datePicker97Service',function () {
		/*初始化配置*/
		var self=this,
			isdate=WdatePicker && typeof WdatePicker==='function';


		/*单项调用*/
		this.datePicker=function (config) {
			if(!config){
				return false;
			}
            var model=config.model,
                fn=config.fn;

			if(isdate){
                if(config.init){
                    var initfn=config.initfn;
                    if(initfn && typeof initfn==='function'){
                        initfn.call(null,{
                            $node1:moment().format('YYYY-MM-DD')
                        });
                    }else{
                        if(model){
                            model.dateTime=moment().format('YYYY-MM-DD');
                        }else{
                            config.$node1.val(moment().format('YYYY-MM-DD'));
                        }
                    }
                }
                config.$node1.on('click',function () {
                    WdatePicker({
                        onpicked:function(dp){
                            if(fn && typeof fn==='function'){
                                fn.call(null,{
                                    $node1:dp.cal.getNewDateStr()
                                });
                            }else{
                                if(model){
                                    model.dateTime=dp.cal.getNewDateStr();
                                }else{
                                    config.$node1.val(dp.cal.getNewDateStr());
                                }
                            }
                        },
                        oncleared:function () {
                            if(fn && typeof fn==='function'){
                                fn.call(null,{
                                    $node1:''
                                });
                            }else{
                                if(model){
                                    model.dateTime='';
                                }else{
                                    config.$node1.val('');
                                }
                            }
                        },
                        maxDate:(function () {
                            var str='';
                            if(config.format){
                                str=config.format;
                            }else{
                                str='%y-%M-%d';
                            }
                            return str;
                        }()),
                        position:config.position?config.position:{left:0,top:2}
                    });
                });
			}
		};


		/*联合调用*/
		this.datePickerRange=function (config) {
			if(!isdate){
				return false;
			}
			if(!config){
				return false;
			}
            var model=config.model,
                fn=config.fn,
                initfn=config.initfn;
			$.each([config.$node1,config.$node2],function (index) {
                if(config.init){
                    if(index===0){
                        if(initfn && typeof initfn==='function'){
                            initfn.call(null,{
                                $node1:moment().format('YYYY-MM-DD')
                            });
                        }else{
                            if(model){
                                model.startTime=moment().format('YYYY-MM-DD');
                            }else{
                                config.$node1.val(moment().format('YYYY-MM-DD'));
                            }
                        }
                    }else if(index===1){
                        if(initfn && typeof initfn==='function'){
                            initfn.call(null,{
                                $node2:moment().format('YYYY-MM-DD')
                            });
                        }else{
                            if(model){
                                model.endTime=moment().format('YYYY-MM-DD');
                            }else{
                                config.$node2.val(moment().format('YYYY-MM-DD'));
                            }
                        }
                    }
                }
				this.on('click',function () {
					if(index===0){
						 WdatePicker({
							 onpicked:function(dp){
                                 if(fn && typeof fn==='function'){
                                     fn.call(null,{
                                         $node1:dp.cal.getNewDateStr()
                                     });
                                 }else{
                                     if(model){
                                         model.startTime=dp.cal.getNewDateStr();
                                     }else{
                                         config.$node1.val(dp.cal.getNewDateStr());
                                     }
                                 }
							 },
							 oncleared:function () {
                                 if(fn && typeof fn==='function'){
                                     fn.call(null,{
                                         $node1:''
                                     });
                                 }else{
                                     if(model){
                                         model.startTime='';
                                     }else{
                                         config.$node1.val('');
                                     }
                                 }
							 },
							 maxDate:(function () {
                                 var str='';
                                 if(model){
                                     if(model.endTime===''){
                                         str=moment().format('YYYY-MM-DD');
                                     }else{
                                         str='#F{$dp.$D(\''+config.$node2.selector.slice(1)+'\')}';
                                     }
                                 }else{
                                     if(config.$node2.val()===''){
                                         str=moment().format('YYYY-MM-DD');
                                     }else{
                                         str='#F{$dp.$D(\''+config.$node2.selector.slice(1)+'\')}';
                                     }
                                 }
                                 return str;
                             }()),
							 position:config.position?config.position:{left:0,top:2}
						 });
					 }else if(index===1){
						 WdatePicker({
							 onpicked:function(dp){
                                 if(fn && typeof fn==='function'){
                                     fn.call(null,{
                                         $node2:dp.cal.getNewDateStr()
                                     });
                                 }else{
                                     if(model){
                                         model.endTime=dp.cal.getNewDateStr();
                                     }else{
                                         config.$node2.val(dp.cal.getNewDateStr());
                                     }
                                 }
							 },
							 oncleared:function () {
                                 if(fn && typeof fn==='function'){
                                     fn.call(null,{
                                         $node2:''
                                     });
                                 }else{
                                     if(model){
                                         model.endTime='';
                                     }else{
                                         config.$node2.val('');
                                     }
                                 }
							 },
							 minDate:(function () {
                                 var str='';
                                 if(model){
                                     if(model.startTime===''){
                                         str=moment().format('YYYY-MM-DD');
                                     }else{
                                         str='#F{$dp.$D(\''+config.$node1.selector.slice(1)+'\')}';
                                     }
                                 }else{
                                     if(config.$node1.val()===''){
                                         str=moment().format('YYYY-MM-DD');
                                     }else{
                                         str='#F{$dp.$D(\''+config.$node1.selector.slice(1)+'\')}';
                                     }
                                 }
                                 return str;
                             }()),
							 position:config.position?config.position:{left:0,top:2}
						 });
					 }

				});
			});
		};
	});
