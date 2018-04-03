


/*程序入口*/

	$(function() {
			//页面元素获取
			var $applytype=$('#applytype'),
				$applyprovince=$('#applyprovince'),
				$applycity=$('#applycity');
			

			
			//省份和城市选择
			public_tool.areaSelect({
					$province:$applyprovince,
					$city:$applycity,
					$area:null
			});

	});
