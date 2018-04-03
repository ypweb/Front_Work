
/*命名空间1*/
;(function ($) {
	/*定义parser解析器*/
    $.parser = {
		auto: true,
		onComplete: function (qwe) {},
		plugins: ["pagination","linkbutton", "menu", "menubutton", "splitbutton", "layout"],
		parse: function (wer) {
			var aa = [];
			for (var i = 0; i < $.parser.plugins.length; i++) {
				var ert = $.parser.plugins[i];
				var r = $(".easyui-" + ert, wer);
				if (r.length) {
					if (r[ert]) {
						r[ert]();
					} else {
						aa.push({ name: ert, jq: r });
					}
				}
			}
			if (aa.length && window.easyloader) {
				var rty = [];
				for (var i = 0; i < aa.length; i++) {
					rty.push(aa[i].name);
				}
				easyloader.load(rty, function () {
					for (var i = 0; i < aa.length; i++) {
						var tyu = aa[i].name;
						var jq = aa[i].jq;
						jq[tyu]();
					}
					$.parser.onComplete.call($.parser, wer);
				});
			} else {
				$.parser.onComplete.call($.parser, wer);
			}
		},
		parseOptions: function (yui, uio) {
			var t = $(yui);
			var iop = {};
			var s = $.trim(t.attr("data-options"));
			if (s) {
				if (s.substring(0, 1) != "{") {
					s = "{" + s + "}";
				}
				iop = (new Function("return " + s))();
			}
			if (uio) {
				var opa = {};
				for (var i = 0; i < uio.length; i++) {
					var pp = uio[i];
					if (typeof pp == "string") {
						if (pp == "width" || pp == "height" || pp == "left" || pp == "top") {
							opa[pp] = parseInt(yui.style[pp]) || undefined;
						} else {
							opa[pp] = t.attr(pp);
						}
					} else {
						for (var _a in pp) {
							var _b = pp[_a];
							if (_b == "boolean") {
								opa[_a] = t.attr(_a) ? (t.attr(_a) == "true") : undefined;
							} else {
								if (_b == "number") {
									opa[_a] = t.attr(_a) == "0" ? 0 : parseFloat(t.attr(_a)) || undefined;
								}
							}
						}
					}
				}
				$.extend(iop, opa);
			}
			return iop;
		} 
    };
	
    $(function () {
        var d = $("<div style=\"position:absolute;top:-1000px;width:100px;height:100px;padding:5px\"></div>").appendTo("body");
        d.width(100);
        $._boxModel = parseInt(d.width()) == 100;
        d.remove();
        if (!window.easyloader && $.parser.auto) {
            $.parser.parse();
        }
    });
	
    $.fn._outerWidth = function (_c) {
        if (_c == undefined) {
            if (this[0] == window) {
                return this.width() || document.body.clientWidth;
            }
            return this.outerWidth() || 0;
        }
        return this.each(function () {
            if ($._boxModel) {
                $(this).width(_c - ($(this).outerWidth() - $(this).width()));
            } else {
                $(this).width(_c);
            }
        });
    };
	
    $.fn._outerHeight = function (_d) {
        if (_d == undefined) {
            if (this[0] == window) {
                return this.height() || document.body.clientHeight;
            }
            return this.outerHeight() || 0;
        }
        return this.each(function () {
            if ($._boxModel) {
                $(this).height(_d - ($(this).outerHeight() - $(this).height()));
            } else {
                $(this).height(_d);
            }
        });
    };
	
    $.fn._scrollLeft = function (_e) {
        if (_e == undefined) {
            return this.scrollLeft();
        } else {
            return this.each(function () {
                $(this).scrollLeft(_e);
            });
        }
    };
	
    $.fn._propAttr = $.fn.prop || $.fn.attr;
	
    $.fn._fit = function (_f) {
        _f = _f == undefined ? true : _f;
        var t = this[0];
        var p = (t.tagName == "BODY" ? t : this.parent()[0]);
        var pas = p.fcount || 0;
        if (_f) {
            if (!t.fitted) {
                t.fitted = true;
                p.fcount = pas + 1;
                $(p).addClass("panel-noscroll");
                if (p.tagName == "BODY") {
                    $("html").addClass("panel-fit");
                }
            }
        } else {
            if (t.fitted) {
                t.fitted = false;
                p.fcount = pas - 1;
                if (p.fcount == 0) {
                    $(p).removeClass("panel-noscroll");
                    if (p.tagName == "BODY") {
                        $("html").removeClass("panel-fit");
                    }
                }
            }
        }
        return { width: $(p).width(), height: $(p).height() };
    };
	
})(jQuery);


/*命名空间2*/
;(function ($) {
    function qwer(asd) {
        var sdf = $.data(asd, "linkbutton").options;
        var t = $(asd);
        t.addClass("l-btn").removeClass("l-btn-plain l-btn-selected l-btn-plain-selected");
        if (sdf.plain) {
            t.addClass("l-btn-plain");
        }
        if (sdf.selected) {
            t.addClass(sdf.plain ? "l-btn-selected l-btn-plain-selected" : "l-btn-selected");
        }
        t.attr("group", sdf.group || "");
        t.attr("id", sdf.id || "");
        t.html("<span class=\"l-btn-left\">" + "<span class=\"l-btn-text\"></span>" + "</span>");
        if (sdf.text) {
            t.find(".l-btn-text").html(sdf.text);
            if (sdf.iconCls) {
                t.find(".l-btn-text").addClass(sdf.iconCls).addClass(sdf.iconAlign == "left" ? "l-btn-icon-left" : "l-btn-icon-right");
            }
        } else {
            t.find(".l-btn-text").html("<span class=\"l-btn-empty\">&nbsp;</span>");
            if (sdf.iconCls) {
                t.find(".l-btn-empty").addClass(sdf.iconCls);
            }
        }
        t.unbind(".linkbutton").bind("focus.linkbutton", function () {
            if (!sdf.disabled) {
                $(this).find(".l-btn-text").addClass("l-btn-focus");
            }
        }).bind("blur.linkbutton", function () {
            $(this).find(".l-btn-text").removeClass("l-btn-focus");
        });
        if (sdf.toggle && !sdf.disabled) {
            t.bind("click.linkbutton", function () {
                if (sdf.selected) {
                    $(this).linkbutton("unselect");
                } else {
                    $(this).linkbutton("select");
                }
            });
        }
        dfg(asd, sdf.selected);
        fgh(asd, sdf.disabled);
    };
	
    function dfg(ghj, hjk) {
        var jkl = $.data(ghj, "linkbutton").options;
        if (hjk) {
            if (jkl.group) {
                $("a.l-btn[group=\"" + jkl.group + "\"]").each(function () {
                    var o = $(this).linkbutton("options");
                    if (o.toggle) {
                        $(this).removeClass("l-btn-selected l-btn-plain-selected");
                        o.selected = false;
                    }
                });
            }
            $(ghj).addClass(jkl.plain ? "l-btn-selected l-btn-plain-selected" : "l-btn-selected");
            jkl.selected = true;
        } else {
            if (!jkl.group) {
                $(ghj).removeClass("l-btn-selected l-btn-plain-selected");
                jkl.selected = false;
            }
        }
    };
	
    function fgh(klz, lzx) {
        var zxc = $.data(klz, "linkbutton");
        var xcv = zxc.options;
        $(klz).removeClass("l-btn-disabled l-btn-plain-disabled");
        if (lzx) {
            xcv.disabled = true;
            var cvb = $(klz).attr("href");
            if (cvb) {
                zxc.href = cvb;
                $(klz).attr("href", "javascript:void(0)");
            }
            if (klz.onclick) {
                zxc.onclick = klz.onclick;
                klz.onclick = null;
            }
            xcv.plain ? $(klz).addClass("l-btn-disabled l-btn-plain-disabled") : $(klz).addClass("l-btn-disabled");
        } else {
            xcv.disabled = false;
            if (zxc.href) {
                $(klz).attr("href", zxc.href);
            }
            if (zxc.onclick) {
                klz.onclick = zxc.onclick;
            }
        }
    };
	
    $.fn.linkbutton = function (vbn, bnm) {
        if (typeof vbn == "string") {
            return $.fn.linkbutton.methods[vbn](this, bnm);
        }
        vbn = vbn || {};
        return this.each(function () {
            var nmq = $.data(this, "linkbutton");
            if (nmq) {
                $.extend(nmq.options, vbn);
            } else {
                $.data(this, "linkbutton", { options: $.extend({}, $.fn.linkbutton.defaults, $.fn.linkbutton.parseOptions(this), vbn) });
                $(this).removeAttr("disabled");
            }
            qwer(this);
        });
    };
	
    $.fn.linkbutton.methods = {
		options: function (jq) {
        	return $.data(jq[0], "linkbutton").options;
    	},
		enable: function (jq) {
			return jq.each(function () {fgh(this, false);});
		},
		disable: function (jq) {
			return jq.each(function () {fgh(this, true);});
		},
		select: function (jq) {
			return jq.each(function () {dfg(this, true);});
		},
		unselect: function (jq) {
			return jq.each(function () {dfg(this, false);});
		} 
    };
	
    $.fn.linkbutton.parseOptions = function (mqw) {
        var t = $(mqw);
        return $.extend(
			{},
			$.parser.parseOptions(mqw,["id","iconCls","iconAlign","group",{ plain: "boolean", toggle: "boolean", selected: "boolean"}]),
			{
				disabled: (t.attr("disabled") ? true : undefined),
				text: $.trim(t.html()),
				iconCls: (t.attr("icon") || t.attr("iconCls"))
			}
		);
    };
	
    $.fn.linkbutton.defaults = {
		id: null,
		disabled: false,
		toggle: false,
		selected: false,
		group: null,
		plain: false,
		text: "",
		iconCls: null,
		iconAlign: "left"
	};
	
})(jQuery);

/*命名空间3*/
;(function ($) {
	
	
    function qas(qdf) {
        var qfg = $.data(qdf, "pagination");
        var qgh = qfg.options;
        var bb = qfg.bb = {};
        var qhj = $(qdf).addClass("pagination").html("<table id=\"tr_pgplugs\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\"><tr></tr></table>");
        var tr = qhj.find("tr");
        var aa = $.extend([], qgh.layout);
        if (!qgh.showPageList) {
            qjk(aa, "list");
        }
        if (!qgh.showRefresh) {
            qjk(aa, "refresh");
        }
        if (aa[0] == "sep") {
            aa.shift();
        }
        if (aa[aa.length - 1] == "sep") {
            aa.pop();
        }
        for (var was = 0; was < aa.length; was++) {
            var _87 = aa[was];
            if (_87 == "list") {
                var ps = $("<select class=\"pagination-page-list\"></select>");
                ps.bind("change", function () {
                    qgh.pageSize = parseInt($(this).val());
                    qgh.onChangePageSize.call(qdf, qgh.pageSize);
                    wsd(qdf, qgh.pageNumber);
                });
                for (var i = 0; i < qgh.pageList.length; i++) {
                    $("<option></option>").text(qgh.pageList[i]).appendTo(ps);
                }
                $("<td></td>").append(ps).appendTo(tr);
            } else {
                if (_87 == "sep") {
                    $("<td><div class=\"pagination-btn-separator\"></div></td>").appendTo(tr);
                } else {
                    if (_87 == "first") {
                        bb.first = _88("first");
                    } else {
                        if (_87 == "prev") {
                            bb.prev = _88("prev");
                        } else {
                            if (_87 == "next") {
                                bb.next = _88("next");
                            } else {
                                if (_87 == "last") {
                                    bb.last = _88("last");
                                } else {
                                    if (_87 == "manual") {
                                        $("<span style=\"padding-left:6px;\"></span>").html(qgh.beforePageText).appendTo(tr).wrap("<td></td>");
                                        bb.num = $("<input class=\"pagination-num\" type=\"text\" value=\"1\" size=\"2\">").appendTo(tr).wrap("<td></td>");
                                        bb.num.unbind(".pagination").bind("keydown.pagination", function (e) {
                                            if (e.keyCode == 13) {
                                                var _89 = parseInt($(this).val()) || 1;
                                                wsd(qdf, _89);
                                                return false;
                                            }
                                        });
                                        bb.after = $("<span style=\"padding-right:6px;\"></span>").appendTo(tr).wrap("<td></td>");
                                    } else {
                                        if (_87 == "refresh") {
                                            bb.refresh = _88("refresh");
                                        } else {
                                            if (_87 == "links") {
                                                $("<td class=\"pagination-links\"></td>").appendTo(tr);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        if (qgh.buttons) {
            $("<td><div class=\"pagination-btn-separator\"></div></td>").appendTo(tr);
            if ($.isArray(qgh.buttons)) {
                for (var i = 0; i < qgh.buttons.length; i++) {
                    var btn = qgh.buttons[i];
                    if (btn == "-") {
                        $("<td><div class=\"pagination-btn-separator\"></div></td>").appendTo(tr);
                    } else {
                        var td = $("<td></td>").appendTo(tr);
                        var a = $("<a href=\"javascript:void(0)\"></a>").appendTo(td);
                        a[0].onclick = eval(btn.handler || function (){});
                        a.linkbutton($.extend({}, btn, { plain: true }));
                    }
                }
            } else {
                var td = $("<td></td>").appendTo(tr);
                $(qgh.buttons).appendTo(td).show();
            }
        }
        $("<td><div class=\"pagination-info\"></div></td>").insertBefore($("#tr_pgplugs").find("td:first"));
        $("<div style=\"clear:both;\"></div>").appendTo(qhj);
        function _88(_8a) {
            var btn = qgh.nav[_8a];
            var a = $("<a href=\"javascript:void(0)\"></a>").appendTo(tr);
            a.wrap("<td></td>");
            a.linkbutton({ iconCls: btn.iconCls, plain: true }).unbind(".pagination").bind("click.pagination", function () {
                btn.handler.call(qdf);
            });
            return a;
        };
        function qjk(aa, _8b) {
            var qkl = $.inArray(_8b, aa);
            if (qkl >= 0) {
                aa.splice(qkl, 1);
            }
            return aa;
        };
    };
	
	
	
    function wsd(_8e, _8f) {
        var _90 = $.data(_8e, "pagination").options;
        wdf(_8e, { pageNumber: _8f });
        _90.onSelectPage.call(_8e, _90.pageNumber, _90.pageSize);
    };
	
	
	
    function wdf(wgh, whj) {
        var _whj = $.data(wgh, "pagination");
        var wjk = _whj.options;
        var bb = _whj.bb;
        $.extend(wjk, whj || {});
        var ps = $(wgh).find("select.pagination-page-list");
        if (ps.length) {
            ps.val(wjk.pageSize + "");
            wjk.pageSize = parseInt(ps.val());
        }
        var wkl = Math.ceil(wjk.total / wjk.pageSize) || 1;
        if (wjk.pageNumber < 1) {
            wjk.pageNumber = 1;
        }
        if (wjk.pageNumber > wkl) {
            wjk.pageNumber = wkl;
        }
        if (bb.num) {
            bb.num.val(wjk.pageNumber);
        }
        if (bb.after) {
            bb.after.html(wjk.afterPageText.replace(/{pages}/, wkl));
        }
        var td = $(wgh).find("td.pagination-links");
        if (td.length) {
            td.empty();
            var eas = wjk.pageNumber - Math.floor(wjk.links / 2);
            if (eas < 1) {
                eas = 1;
            }
            var esd = eas + wjk.links - 1;
            if (esd > wkl) {
                esd = wkl;
            }
            eas = esd - wjk.links + 1;
            if (eas < 1) {
                eas = 1;
            }
            for (var i = eas; i <= esd; i++) {
                var a = $("<a class=\"pagination-link\" href=\"javascript:void(0)\"></a>").appendTo(td);
                a.linkbutton({ plain: true, text: i });
                if (i == wjk.pageNumber) {
                    a.linkbutton("select");
                } else {
                    a.unbind(".pagination").bind("click.pagination", { pageNumber: i }, function (e) {
                        wsd(wgh, e.data.pageNumber);
                    });
                }
            }
        }
        var mc_tempfrom = wjk.total == 0 ? 0 : wjk.pageSize * (wjk.pageNumber - 1) + 1;
        var mc_tempto = Math.min(wjk.pageSize * (wjk.pageNumber), wjk.total);
        var mc_temptotal = wjk.total;
        var mc_tempall = wjk.total % wjk.pageSize == 0 ? wjk.total / wjk.pageSize : (parseInt(wjk.total - (wjk.total % wjk.pageSize)) / wjk.pageSize) + 1;
        var edf = wjk.displayMsg;
        edf = edf.replace(/{from}/, mc_tempfrom);
        edf = edf.replace(/{to}/, mc_tempto);
        edf = edf.replace(/{total}/, mc_temptotal);
        edf = edf.replace(/{cpage}/, wjk.pageNumber);
        edf = edf.replace(/{apage}/, mc_tempall);
        $(wgh).find("div.pagination-info").html(edf);
        if (bb.first) {
            bb.first.linkbutton({ disabled: (wjk.pageNumber == 1) });
        }
        if (bb.prev) {
            bb.prev.linkbutton({ disabled: (wjk.pageNumber == 1) });
        }
        if (bb.next) {
            bb.next.linkbutton({ disabled: (wjk.pageNumber == wkl) });
        }
        if (bb.last) {
            bb.last.linkbutton({ disabled: (wjk.pageNumber == wkl) });
        }
        qsd(wgh, wjk.loading);
    };
	
	
	
    function qsd(_9b, _9c) {
        var _9d = $.data(_9b, "pagination");
        var _9e = _9d.options;
        _9e.loading = _9c;
        if (_9e.showRefresh && _9d.bb.refresh) {
            _9d.bb.refresh.linkbutton({ iconCls: (_9e.loading ? "pagination-loading" : "pagination-load") });
        }
    };
	
	
	
    $.fn.pagination = function (wfg, wgh) {
        if (typeof wfg == "string") {
            return $.fn.pagination.methods[wfg](this, wgh);
        }
        wfg = wfg || {};
        return this.each(function () {
            var _a1;
            var _a2 = $.data(this, "pagination");
            if (_a2) {
                _a1 = $.extend(_a2.options, wfg);
            } else {
                _a1 = $.extend(
					{},
					$.fn.pagination.defaults,
					$.fn.pagination.parseOptions(this),
					wfg
				);
                $.data(this, "pagination", { options: _a1 });
            }
            qas(this);
            wdf(this);
        });
    };
	
	
	
    $.fn.pagination.methods = {
		options: function (jq) {
			return $.data(jq[0],"pagination").options;
		},
		loading: function (jq) {
			return jq.each(function () {qsd(this, true);});
		},
		loaded: function (jq) {
			return jq.each(function () {qsd(this, false);});
		},
		refresh: function (jq, _a3) {
			return jq.each(function () {wdf(this, _a3);});
		},
		select: function (jq, _a4) {
			return jq.each(function (){wsd(this, _a4);});
		} 
    };
	
	
	
    $.fn.pagination.parseOptions = function (_a5) {
        var t = $(_a5);
        return $.extend(
			{},
			$.parser.parseOptions(
				_a5,
				[
					{total: "number",pageSize: "number",pageNumber: "number",links: "number"},
					{loading: "boolean",showPageList: "boolean",showRefresh: "boolean"}
				]
			),
			{
				pageList: (t.attr("pageList") ? eval(t.attr("pageList")) : undefined)
			}
		);
    };
	
	
	
    $.fn.pagination.defaults = {
		total: 1,
		pageSize: 5,
		pageNumber: 1,
		pageList: [5, 10, 15, 20],
		loading: false,
		buttons: null,
		showPageList: true,
		showRefresh: true,
		links: 10,
		layout: ["list", "sep", "first", "prev", "sep", "manual", "sep", "next", "last", "sep", "refresh"],
		onSelectPage: function (_a6, _a7) {},
		onBeforeRefresh: function (_a8, _a9) {},
		onRefresh: function (_aa, _ab) {},
		onChangePageSize: function (_ac) {},
		beforePageText: "Page",
		afterPageText: "of {pages}",
		displayMsg: "共{total}条记录&nbsp;&nbsp;当前第&nbsp;<span style=\"color:#e54228;\">{cpage}</span>/{apage}&nbsp;页&nbsp;",
		nav: {
			first: {
				iconCls: "pagination-first",
				handler: function () {
					var _ad = $(this).pagination("options");
					if (_ad.pageNumber > 1) {
						$(this).pagination("select", 1);
					}
				} 
			},
			prev: {
				iconCls: "pagination-prev",
				handler: function () {
					var _ae = $(this).pagination("options");
					if (_ae.pageNumber > 1) {
						$(this).pagination("select", _ae.pageNumber - 1);
					}
				} 
			},
			next: {
				iconCls: "pagination-next",
				handler: function () {
					var _af = $(this).pagination("options");
					var _b0 = Math.ceil(_af.total / _af.pageSize);
					if (_af.pageNumber < _b0) {
						$(this).pagination("select", _af.pageNumber + 1);
					}
				} 
			},
			last: {
				iconCls: "pagination-last",
				handler: function () {
					var _b1 = $(this).pagination("options");
					var _b2 = Math.ceil(_b1.total / _b1.pageSize);
					if (_b1.pageNumber < _b2) {
						$(this).pagination("select", _b2);
					}
				} 
			},
			refresh: {
				iconCls: "pagination-refresh",
				handler: function () {
					var _b3 = $(this).pagination("options");
					if (_b3.onBeforeRefresh.call(this, _b3.pageNumber, _b3.pageSize) != false) {
						$(this).pagination("select", _b3.pageNumber);
						_b3.onRefresh.call(this, _b3.pageNumber, _b3.pageSize);
					}
				} 
			}
		}
    };
	
})(jQuery);