// ------------------------- Initial call after page loading ------------------------

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

$(document).ready(function() {
  // Disable all caching. Default in most browsers, but not in IE and Android (at least 2.2):
  $.ajaxSetup({ cache: false });

  lastClickType = 1;
  lastClickID   = getUrlParameter('id');
  $('.ui-input-search .ui-input-text').val("");
  RefreshPage($(this), false);

  // Update Timer loslaufen lassen:
  RestartTimer();
});
