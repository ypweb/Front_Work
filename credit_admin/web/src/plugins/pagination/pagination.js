(function($) {
  $.parser = {
    auto: true,
    onComplete: function(_1) {},
    plugins: ["pagination", "linkbutton"],
    parse: function(_2) {
      var aa = [];
      for (var i = 0; i < $.parser.plugins.length; i++) {
        var _3 = $.parser.plugins[i];
        var r = $(".easyui-" + _3, _2);
        if (r.length) {
          if (r[_3]) {
            r[_3]()
          } else {
            aa.push({
              name: _3,
              jq: r
            })
          }
        }
      }
      if (aa.length && window.easyloader) {
        var _4 = [];
        for (var i = 0; i < aa.length; i++) {
          _4.push(aa[i].name)
        }
        easyloader.load(_4, function() {
          for (var i = 0; i < aa.length; i++) {
            var _5 = aa[i].name;
            var jq = aa[i].jq;
            jq[_5]()
          }
          $.parser.onComplete.call($.parser, _2)
        })
      } else {
        $.parser.onComplete.call($.parser, _2)
      }
    },
    parseOptions: function(_6, _7) {
      var t = $(_6);
      var _8 = {};
      var s = $.trim(t.attr("data-options"));
      if (s) {
        if (s.substring(0, 1) != "{") {
          s = "{" + s + "}"
        }
        _8 = (new Function("return " + s))()
      }
      if (_7) {
        var _9 = {};
        for (var i = 0; i < _7.length; i++) {
          var pp = _7[i];
          if (typeof pp == "string") {
            if (pp == "width" || pp == "height" || pp == "left" || pp == "top") {
              _9[pp] = parseInt(_6.style[pp]) || undefined
            } else {
              _9[pp] = t.attr(pp)
            }
          } else {
            for (var _a in pp) {
              var _b = pp[_a];
              if (_b == "boolean") {
                _9[_a] = t.attr(_a) ? (t.attr(_a) == "true") : undefined
              } else {
                if (_b == "number") {
                  _9[_a] = t.attr(_a) == "0" ? 0 : parseFloat(t.attr(_a)) || undefined
                }
              }
            }
          }
        }
        $.extend(_8, _9)
      }
      return _8
    }
  };
  $(function() {
    var d = $("<div style=\"position:absolute;top:-1000px;width:100px;height:100px;padding:5px\"></div>").appendTo("body");
    $._boxModel = parseInt(d.width()) == 100;
    d.remove();
    if (!window.easyloader && $.parser.auto) {
      $.parser.parse()
    }
  });

  function _6f(_70) {
    var _71 = $.data(_70, "linkbutton").options;
    var t = $(_70).empty();
    t.addClass("l-btn").removeClass("l-btn-plain l-btn-selected l-btn-plain-selected");
    t.removeClass("l-btn-small l-btn-medium l-btn-large").addClass("l-btn-" + _71.size);
    if (_71.plain) {
      t.addClass("l-btn-plain")
    }
    if (_71.selected) {
      t.addClass(_71.plain ? "l-btn-selected l-btn-plain-selected" : "l-btn-selected")
    }
    t.attr("group", _71.group || "");
    t.attr("id", _71.id || "");
    var _72 = $("<span class=\"l-btn-left\"></span>").appendTo(t);
    var cclass = _71.iconCls;
    if (_71.text) {
      $("<span class=\"l-btn-text\"></span>").html(_71.text).appendTo(_72)
    }
    if (cclass) {
      if (cclass == "pagination-first") {
        $("<span class=\"l-btn-icon\"><&nbsp;首页</span>").addClass(cclass).appendTo(_72)
      } else if (cclass == "pagination-prev") {
        $("<span class=\"l-btn-icon\">上一页</span>").addClass(cclass).appendTo(_72)
      } else if (cclass == "pagination-next") {
        $("<span class=\"l-btn-icon\">下一页</span>").addClass(cclass).appendTo(_72)
      } else if (cclass == "pagination-last") {
        $("<span class=\"l-btn-icon\">尾页&nbsp;></span>").addClass(cclass).appendTo(_72)
      }
      _72.addClass("l-btn-icon-" + _71.iconAlign)
    }
    t.unbind(".linkbutton").bind("focus.linkbutton", function() {
      if (!_71.disabled) {
        $(this).addClass("l-btn-focus")
      }
    }).bind("blur.linkbutton", function() {
      $(this).removeClass("l-btn-focus")
    }).bind("click.linkbutton", function() {
      if (!_71.disabled) {
        if (_71.toggle) {
          if (_71.selected) {
            $(this).linkbutton("unselect")
          } else {
            $(this).linkbutton("select")
          }
        }
        _71.onClick.call(this)
      }
      return false
    });
    _73(_70, _71.selected);
    _74(_70, _71.disabled)
  };

  function _73(_75, _76) {
    var _77 = $.data(_75, "linkbutton").options;
    if (_76) {
      if (_77.group) {
        $("a.l-btn[group=\"" + _77.group + "\"]").each(function() {
          var o = $(this).linkbutton("options");
          if (o.toggle) {
            $(this).removeClass("l-btn-selected l-btn-plain-selected");
            o.selected = false
          }
        })
      }
      $(_75).addClass(_77.plain ? "l-btn-selected l-btn-plain-selected" : "l-btn-selected");
      _77.selected = true
    } else {
      if (!_77.group) {
        $(_75).removeClass("l-btn-selected l-btn-plain-selected");
        _77.selected = false
      }
    }
  };

  function _74(_78, _79) {
    var _7a = $.data(_78, "linkbutton");
    var _7b = _7a.options;
    $(_78).removeClass("l-btn-disabled l-btn-plain-disabled");
    if (_79) {
      _7b.disabled = true;
      var _7c = $(_78).attr("href");
      if (_7c) {
        _7a.href = _7c;
        $(_78).attr("href", "javascript:void(0)")
      }
      if (_78.onclick) {
        _7a.onclick = _78.onclick;
        _78.onclick = null
      }
      _7b.plain ? $(_78).addClass("l-btn-disabled l-btn-plain-disabled") : $(_78).addClass("l-btn-disabled")
    } else {
      _7b.disabled = false;
      if (_7a.href) {
        $(_78).attr("href", _7a.href)
      }
      if (_7a.onclick) {
        _78.onclick = _7a.onclick
      }
    }
  };

  function _81(_82) {
    var _83 = $.data(_82, "pagination");
    var _84 = _83.options;
    var bb = _83.bb = {};
    var _85 = $(_82).addClass("pagination").html("<div class=\"goto-pagination-wrap\"></div><table cellspacing=\"0\" cellpadding=\"0\" class=\"easyui-pagewrap\" border=\"0\"><tr></tr></table>");
    var tr = _85.find("tr");
    var gotopage=_85.find("div").addClass("g-d-hidei");
    var aa = $.extend([], _84.layout);
    if (!_84.showPageList) {
      _86(aa, "list")
    }
    if (!_84.showRefresh) {
      _86(aa, "refresh")
    }
    if (aa[0] == "sep") {
      aa.shift()
    }
    if (aa[aa.length - 1] == "sep") {
      aa.pop()
    }
    for (var _87 = 0; _87 < aa.length; _87++) {
      var _88 = aa[_87];
      if (_88 == "list") {
        var ps = $("<select class=\"pagination-page-list\"></select>");
        ps.bind("change", function() {
          _84.pageSize = parseInt($(this).val());
          _84.onChangePageSize.call(_82, _84.pageSize);
          _8e(_82, _84.pageNumber)
        });
        for (var i = 0; i < _84.pageList.length; i++) {
          $("<option></option>").text(_84.pageList[i]).appendTo(ps)
        }
        $("<td></td>").append(ps).appendTo(tr)
      } else {
        if (_88 == "sep") {
          $("<td><div class=\"pagination-btn-separator\"></div></td>").appendTo(tr)
        } else {
          if (_88 == "first") {
            bb.first = _89("first")
          } else {
            if (_88 == "prev") {
              bb.prev = _89("prev")
            } else {
              if (_88 == "next") {
                bb.next = _89("next")
              } else {
                if (_88 == "last") {
                  bb.last = _89("last")
                } else {
                  if (_88 == "manual") {
                    gotopage.removeClass('g-d-hidei');

                    /*
                     *
                     bb.num = $("<input class=\"pagination-num\" type=\"text\" value=\"1\" size=\"2\">");
                     bb.num.unbind(".pagination").bind("keydown.pagination", function(e) {
                     if (e.keyCode == 13) {
                     var _8a = parseInt($(this).val()) || 1;
                     _8e(_82, _8a);
                     return false
                     }
                     });
                     var $numstr=$('<div></div>');
                     $("<span></span>").html(_84.beforePageText).appendTo($numstr);
                     bb.num.appendTo($numstr);
                     $("<span></span>").html(bb.after).appendTo($numstr);
                     $numstr.insertBefore(_85);
                     *
                     * */
                    bb.num = $("<input class=\"pagination-num\" type=\"text\" value=\"1\" size=\"2\">").appendTo(gotopage);
                    bb.num.unbind(".pagination").bind("keydown.pagination", function(e) {
                      if (e.keyCode == 13) {
                        var _8a = parseInt($(this).val()) || 1;
                        _8e(_82, _8a);
                        return false
                      }
                    });
                    $("<span></span>").html(_84.beforePageText).insertBefore(bb.num);
                    bb.after = $("<span></span>");
                    bb.after.insertAfter(bb.num);
                  } else {
                    if (_88 == "refresh") {
                      bb.refresh = _89("refresh")
                    } else {
                      if (_88 == "links") {
                        $("<td class=\"pagination-links\"></td>").appendTo(tr)
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
    if (_84.buttons) {
      $("<td><div class=\"pagination-btn-separator\"></div></td>").appendTo(tr);
      if ($.isArray(_84.buttons)) {
        for (var i = 0; i < _84.buttons.length; i++) {
          var btn = _84.buttons[i];
          if (btn == "-") {
            $("<td><div class=\"pagination-btn-separator\"></div></td>").appendTo(tr)
          } else {
            var td = $("<td></td>").appendTo(tr);
            var a = $("<a href=\"javascript:void(0)\"></a>").appendTo(td);
            a[0].onclick = eval(btn.handler ||
              function() {});
            a.linkbutton($.extend({}, btn, {
              plain: true
            }))
          }
        }
      } else {
        var td = $("<td></td>").appendTo(tr);
        $(_84.buttons).appendTo(td).show()
      }
    }
    $("<div class=\"pagination-info\"></div>").appendTo(_85);
    $("<div style=\"clear:both;\"></div>").appendTo(_85);

    function _89(_8b) {
      var btn = _84.nav[_8b];
      var a = $("<a href=\"javascript:void(0)\"></a>").appendTo(tr);
      a.wrap("<td></td>");
      a.linkbutton({
        iconCls: btn.iconCls,
        plain: true
      }).unbind(".pagination").bind("click.pagination", function() {
        btn.handler.call(_82)
      });
      return a
    };

    function _86(aa, _8c) {
      var _8d = $.inArray(_8c, aa);
      if (_8d >= 0) {
        aa.splice(_8d, 1)
      }
      return aa
    }
  };

  function _8e(_8f, _90) {
    var _91 = $.data(_8f, "pagination").options;
    _92(_8f, {
      pageNumber: _90
    });
    _91.onSelectPage.call(_8f, _91.pageNumber, _91.pageSize)
  };

  function _92(_93, _94) {
    var _95 = $.data(_93, "pagination");
    var _96 = _95.options;
    var bb = _95.bb;
    $.extend(_96, _94 || {});
    var ps = $(_93).find("select.pagination-page-list");
    if (ps.length) {
      ps.val(_96.pageSize + "");
      _96.pageSize = parseInt(ps.val())
    }
    var _97 = Math.ceil(_96.total / _96.pageSize) || 1;
    if (_96.pageNumber < 1) {
      _96.pageNumber = 1
    }
    if (_96.pageNumber > _97) {
      _96.pageNumber = _97
    }
    if (bb.num) {
      bb.num.val(_96.pageNumber)
    }
    if (bb.after) {
      bb.after.html(_96.afterPageText.replace(/{pages}/, _97))
    }
    var td = $(_93).find("td.pagination-links");
    if (td.length) {
      td.empty();
      var _98 = _96.pageNumber - Math.floor(_96.links / 2);
      if (_98 < 1) {
        _98 = 1
      }
      var _99 = _98 + _96.links - 1;
      if (_99 > _97) {
        _99 = _97
      }
      _98 = _99 - _96.links + 1;
      if (_98 < 1) {
        _98 = 1
      }
      for (var i = _98; i <= _99; i++) {
        var a = $("<a class=\"pagination-link\" href=\"javascript:void(0)\"></a>").appendTo(td);
        a.linkbutton({
          plain: true,
          text: i
        });
        if (i == _96.pageNumber) {
          a.linkbutton("select")
        } else {
          a.unbind(".pagination").bind("click.pagination", {
            pageNumber: i
          }, function(e) {
            _8e(_93, e.data.pageNumber)
          })
        }
      }
    }
    var _9a = _96.displayMsg;
    _9a = _9a.replace(/{from}/, _96.total == 0 ? 0 : _96.pageSize * (_96.pageNumber - 1) + 1);
    _9a = _9a.replace(/{to}/, Math.min(_96.pageSize * (_96.pageNumber), _96.total));
    _9a = _9a.replace(/{total}/, _96.total);
    $(_93).find("div.pagination-info").html(_9a);
    if (bb.first) {
      bb.first.linkbutton({
        disabled: (_96.pageNumber == 1)
      })
    }
    if (bb.prev) {
      bb.prev.linkbutton({
        disabled: (_96.pageNumber == 1)
      })
    }
    if (bb.next) {
      bb.next.linkbutton({
        disabled: (_96.pageNumber == _97)
      })
    }
    if (bb.last) {
      bb.last.linkbutton({
        disabled: (_96.pageNumber == _97)
      })
    }
    _9b(_93, _96.loading)
  };

  function _9b(_9c, _9d) {
    var _9e = $.data(_9c, "pagination");
    var _9f = _9e.options;
    _9f.loading = _9d;
    if (_9f.showRefresh && _9e.bb.refresh) {
      _9e.bb.refresh.linkbutton({
        iconCls: (_9f.loading ? "pagination-loading" : "pagination-load")
      })
    }
  };
  $.fn._outerWidth = function(_c) {
    if (_c == undefined) {
      if (this[0] == window) {
        return this.width() || document.body.clientWidth
      }
      return this.outerWidth() || 0
    }
    return this.each(function() {
      if ($._boxModel) {
        $(this).width(_c - ($(this).outerWidth() - $(this).width()))
      } else {
        $(this).width(_c)
      }
    })
  };
  $.fn._outerHeight = function(_d) {
    if (_d == undefined) {
      if (this[0] == window) {
        return this.height() || document.body.clientHeight
      }
      return this.outerHeight() || 0
    }
    return this.each(function() {
      if ($._boxModel) {
        $(this).height(_d - ($(this).outerHeight() - $(this).height()))
      } else {
        $(this).height(_d)
      }
    })
  };
  $.fn._scrollLeft = function(_e) {
    if (_e == undefined) {
      return this.scrollLeft()
    } else {
      return this.each(function() {
        $(this).scrollLeft(_e)
      })
    }
  };
  $.fn._propAttr = $.fn.prop || $.fn.attr;
  $.fn._fit = function(_f) {
    _f = _f == undefined ? true : _f;
    var t = this[0];
    var p = (t.tagName == "BODY" ? t : this.parent()[0]);
    var _10 = p.fcount || 0;
    if (_f) {
      if (!t.fitted) {
        t.fitted = true;
        p.fcount = _10 + 1;
        $(p).addClass("panel-noscroll");
        if (p.tagName == "BODY") {
          $("html").addClass("panel-fit")
        }
      }
    } else {
      if (t.fitted) {
        t.fitted = false;
        p.fcount = _10 - 1;
        if (p.fcount == 0) {
          $(p).removeClass("panel-noscroll");
          if (p.tagName == "BODY") {
            $("html").removeClass("panel-fit")
          }
        }
      }
    }
    return {
      width: $(p).width(),
      height: $(p).height()
    }
  };
  $.fn.linkbutton = function(_7d, _7e) {
    if (typeof _7d == "string") {
      return $.fn.linkbutton.methods[_7d](this, _7e)
    }
    _7d = _7d || {};
    return this.each(function() {
      var _7f = $.data(this, "linkbutton");
      if (_7f) {
        $.extend(_7f.options, _7d)
      } else {
        $.data(this, "linkbutton", {
          options: $.extend({}, $.fn.linkbutton.defaults, $.fn.linkbutton.parseOptions(this), _7d)
        });
        $(this).removeAttr("disabled")
      }
      _6f(this)
    })
  };
  $.fn.linkbutton.methods = {
    options: function(jq) {
      return $.data(jq[0], "linkbutton").options
    },
    enable: function(jq) {
      return jq.each(function() {
        _74(this, false)
      })
    },
    disable: function(jq) {
      return jq.each(function() {
        _74(this, true)
      })
    },
    select: function(jq) {
      return jq.each(function() {
        _73(this, true)
      })
    },
    unselect: function(jq) {
      return jq.each(function() {
        _73(this, false)
      })
    }
  };
  $.fn.linkbutton.parseOptions = function(_80) {
    var t = $(_80);
    return $.extend({}, $.parser.parseOptions(_80, ["id", "iconCls", "iconAlign", "group", "size",
      {
        plain: "boolean",
        toggle: "boolean",
        selected: "boolean"
      }]), {
      disabled: (t.attr("disabled") ? true : undefined),
      text: $.trim(t.html()),
      iconCls: (t.attr("icon") || t.attr("iconCls"))
    })
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
    iconAlign: "left",
    size: "small",
    onClick: function() {}
  };
  $.fn.pagination = function(_a0, _a1) {
    if (typeof _a0 == "string") {
      return $.fn.pagination.methods[_a0](this, _a1)
    }
    _a0 = _a0 || {};
    return this.each(function() {
      var _a2;
      var _a3 = $.data(this, "pagination");
      if (_a3) {
        _a2 = $.extend(_a3.options, _a0)
      } else {
        _a2 = $.extend({}, $.fn.pagination.defaults, $.fn.pagination.parseOptions(this), _a0);
        $.data(this, "pagination", {
          options: _a2
        })
      }
      _81(this);
      _92(this)
    })
  };
  $.fn.pagination.methods = {
    options: function(jq) {
      return $.data(jq[0], "pagination").options
    },
    loading: function(jq) {
      return jq.each(function() {
        _9b(this, true)
      })
    },
    loaded: function(jq) {
      return jq.each(function() {
        _9b(this, false)
      })
    },
    refresh: function(jq, _a4) {
      return jq.each(function() {
        _92(this, _a4)
      })
    },
    select: function(jq, _a5) {
      return jq.each(function() {
        _8e(this, _a5)
      })
    }
  };
  $.fn.pagination.parseOptions = function(_a6) {
    var t = $(_a6);
    return $.extend({}, $.parser.parseOptions(_a6, [{
      total: "number",
      pageSize: "number",
      pageNumber: "number",
      links: "number"
    }, {
      loading: "boolean",
      showPageList: "boolean",
      showRefresh: "boolean"
    }]), {
      pageList: (t.attr("pageList") ? eval(t.attr("pageList")) : undefined)
    })
  };
  $.fn.pagination.defaults = {
    total: 1,
    pageSize: 10,
    pageNumber: 1,
    pageList: [5, 10, 15, 20, 30, 40, 50],
    loading: false,
    buttons: null,
    showPageList: true,
    showRefresh: true,
    links: 10,
    layout: ["list", "sep", "first", "prev", "sep", "manual", "sep", "next", "last", "sep", "refresh"],
    onSelectPage: function(_a7, _a8) {},
    onBeforeRefresh: function(_a9, _aa) {},
    onRefresh: function(_ab, _ac) {},
    onChangePageSize: function(_ad) {},
    beforePageText: "跳转至",
    afterPageText: "共 {pages} 页",
    displayMsg: "共{total}条&nbsp;&nbsp;第&nbsp;{from}&nbsp;到&nbsp;{to}&nbsp;条&nbsp;",
    nav: {
      first: {
        iconCls: "pagination-first",
        handler: function() {
          var _ae = $(this).pagination("options");
          if (_ae.pageNumber > 1) {
            $(this).pagination("select", 1)
          }
        }
      },
      prev: {
        iconCls: "pagination-prev",
        handler: function() {
          var _af = $(this).pagination("options");
          if (_af.pageNumber > 1) {
            $(this).pagination("select", _af.pageNumber - 1)
          }
        }
      },
      next: {
        iconCls: "pagination-next",
        handler: function() {
          var _b0 = $(this).pagination("options");
          var _b1 = Math.ceil(_b0.total / _b0.pageSize);
          if (_b0.pageNumber < _b1) {
            $(this).pagination("select", _b0.pageNumber + 1)
          }
        }
      },
      last: {
        iconCls: "pagination-last",
        handler: function() {
          var _b2 = $(this).pagination("options");
          var _b3 = Math.ceil(_b2.total / _b2.pageSize);
          if (_b2.pageNumber < _b3) {
            $(this).pagination("select", _b3)
          }
        }
      },
      refresh: {
        iconCls: "pagination-refresh",
        handler: function() {
          var _b4 = $(this).pagination("options");
          if (_b4.onBeforeRefresh.call(this, _b4.pageNumber, _b4.pageSize) != false) {
            $(this).pagination("select", _b4.pageNumber);
            _b4.onRefresh.call(this, _b4.pageNumber, _b4.pageSize)
          }
        }
      }
    }
  }
})(jQuery);