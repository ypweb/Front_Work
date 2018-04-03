(function($){
	"use strict";
	$(function(){
		/*dom引用*/
		var $content_wrap=$('#content_wrap'),
			$content_show=$('#content_show'),
			$content_list=$('#content_list'),
			$content_page=$('#content_page');



		/*列表模板*/
		var	listTemplate='<li><a href="$LINKURL">'+
											'<div><img alt="" src="$IMGURL"></div>'+
											'<h4>$TITLE</h4>'+
											'<p>$CONTENT</p>'+
										'</a></li>';


		/*重置绝对定位容器的高度*/
		$content_wrap.css({
			'min-height':$content_show.height() + 200
		});



		/*请求数据*/
		getPageData({
			pagewrap:$content_page/*分页按钮容器*/,
			listwrap:$content_list/*数据存放容器*/,
			pagenumber:1/*分页默认显示第几页*/,
			total:0/*分页总记录数*/,
			pagesize:10/*分页每页显示记录数*/,
			template:listTemplate/*html列表模板*/,
			wrap:$content_wrap/*布局容器--绝对定位*/,
			show:$content_show/*布局容器--数据容器*/,
			ajaxconfig:{
				url:'../../json/test.json',
				dataType:'json',
				data:{
					'pagenumber':'1'
				},
				type:'post'
			}/*发送ajax所需参数*/
		});


	});


	/*请求数据服务类*/
	function getPageData(opt){

		/*获取配置对象*/
		var config=opt.ajaxconfig?opt.ajaxconfig:{
				url:'../../json/test.json',
				dataType:"json",
				data:{
					'pagenumber':opt.pagenumber
				},
				type:'post'
			},
			listdata=[],
			htmlstr='',
			resultset=[];

		/*请求数据*/

		$.ajax(config)
			.done(function(result){
				if(result.total!==0 && result.flag){

					listdata=result.List;
					opt.total=result.total;
					/*解析数据*/
					var len=listdata.length,
						i=0;
					if(len!==0){
						for(i;i<len;i++){
							htmlstr=opt.template;
							resultset.push(htmlstr.replace('$IMGURL',listdata[i]['imgurl'])
								.replace('$TITLE',listdata[i]['title'])
								.replace('$CONTENT',listdata[i]['content'])
								.replace('$LINKURL',listdata[i]['linkurl']));
						}
						$(resultset.join('')).appendTo(opt.listwrap.html(''));
						resultset.length=0;

						/*分页调用*/
						opt.pagewrap.pagination({
							pageSize:opt.pagesize,
							total:opt.total,
							pageNumber:opt.pagenumber,
							onSelectPage:function(pageNumber,pageSize){

								/*重新请求数据*/
								getPageData({
									pagewrap:opt.pagewrap,
									listwrap:opt.listwrap,
									pagenumber:pageNumber,
									total:opt.total,
									pagesize:pageSize,
									template:opt.template,
									wrap:opt.wrap,
									show:opt.show,
									ajaxconfig:{
										url:opt.ajaxconfig.url,
										dataType:opt.ajaxconfig.dataType,
										data:{
											'pagenumber':pageNumber
										},
										type:opt.ajaxconfig.type
									}
								});
							}
						});

						/*重置绝对定位容器的高度*/
						opt.wrap.css({
							'min-height':opt.show.height() + 200
						});
					}
				}else{
					opt.listwrap.html('');
					listdata.length=0;
					opt.pagewrap.html('');
				}
			})
			.fail(function(){
				opt.listwrap.html('');
				listdata.length=0;
				opt.pagewrap.html('');
			});

	}

})(jQuery);