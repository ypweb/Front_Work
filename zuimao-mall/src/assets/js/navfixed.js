function topNavfixed(element) {
  var offsetTopFixed = document.querySelector('.header').clientHeight;
  var isScrolled = false;
  var _offsetTop;
  window.onscroll = function() {
    if (!isScrolled) {
      _offsetTop = element.offsetTop;
      isScrolled = true;
    }
    var scrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
    if (scrollTop + offsetTopFixed >= _offsetTop) {
      element.style.position = 'fixed';
      element.style.top = offsetTopFixed + 'px';
    }
    if (scrollTop + offsetTopFixed < _offsetTop) {
      element.removeAttribute('style');
    }
  };
}

export default { topNavfixed }
