/* global theme, font, isGetSite, readModus, lastClickType, lastClickID */

isGetSite = true;

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

// ------------------------- Initial call after page loading ------------------------
$(function () {

    // Disable all caching. Default in most browsers, but not in IE and Android (at least 2.2):
    $.ajaxSetup({cache: false});

    var id = getUrlParameter('id');

    var type = getUrlParameter('type');
    if (!type) {
        type = 1;
    }

    var read = getUrlParameter('read');
    if (read === undefined) {
        readModus = true;
    } else {
        readModus = read;
    }

    lastClickType = type;
    lastClickID = id;

    $('.ui-input-search .ui-input-text').val("");
    refreshPage($(this));

    changeTheme(theme);
    changeFont(font);
    changeTwoPage(false);
});