/* global theme, font, isGetSite */
isGetSite = true;
// ------------------------- Initial call after page loading ------------------------
$(function () {
    var getUrlParameter = function getUrlParameter(sParam) {
        var sPageURL = decodeURIComponent(window.location.search.substring(1));
        var sURLVariables = sPageURL.split('&');
        var sParameterName;

        for (var i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
    };

    // Disable all caching. Default in most browsers, but not in IE and Android (at least 2.2):
    $.ajaxSetup({cache: false});

    lastClickType = 1;
    lastClickID = getUrlParameter('id');
    $('.ui-input-search .ui-input-text').val("");
    refreshPage($(this), false);

    // Update Timer loslaufen lassen:
    restartTimer();
    changeTheme(theme);
    changeFont(font);
    readModus = true;    
});
