var getScrollTop = function(element) {
  if (element) {
    return element.scrollTop;
  } else {
    return document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
  }
}

var getVisibleHeight = function(element) {
  if (element) {
    return element.clientHeight;
  } else {
    return document.documentElement.clientHeight;
  }
}

var getScrollHeight = function (element) {
  if (element) {
    return element.scrollHeight;
  } else {
    return document.documentElement.scrollHeight;
  }
}

export default { getScrollTop, getVisibleHeight, getScrollHeight }
