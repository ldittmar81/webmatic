/* global storageVersion, debugModus, resultOptionsMap, lastStableVersion, webmaticVersion, isPreRelease, Base64 */

//Wiedererkennung von Clients (feste IP zwingend notwendig)
if (localStorage.getItem("webmaticrecognizeMap") === null || localStorage.getItem("webmaticrecognizeMap") === "undefined") {
    loadRecognization();
} else {
    recognizeMap = JSON.parse(localStorage.getItem("webmaticrecognizeMap"));
    client = ("REMOTE_ADDR" in recognizeMap ? recognizeMap["REMOTE_ADDR"] : "");
}

//Special Reload für Client-Einstellungen
$.ajax({
    type: 'GET',
    url: '../webmatic_user/reload' + client + '.json',
    async: false,
    cache: false
}).done(function (data) {
    reloadClient = (String(data).trim() === "true");
    if (reloadClient) {
        $.post('cgi/saveconfig.cgi', {name: "reload" + client, text: "false"});
    }
}).fail(function () {
    $.post('cgi/saveconfig.cgi', {name: "reload" + client, text: "false"});
});
if (localStorage.getItem("clearCache") !== null || reloadClient) {
    localStorage.clear();
}
if (localStorage.getItem("tempOptionsForClient") !== null) {
    client = localStorage.getItem("tempOptionsForClient");
    isTempClient = true;
    localStorage.clear();
    $.post('cgi/saveconfig.cgi', {name: "reload" + client, text: "true"});
}

//Initialwerte (Einstellungen) einlesen
//Global
if (localStorage.getItem("webmaticoptionsMap") === null || localStorage.getItem("webmaticoptionsMap") === "undefined") {
    localStorage.clear();
    if (isTempClient) {
        localStorage.setItem("clearCache", true);
    }
    localStorage.setItem("webmaticrecognizeMap", JSON.stringify(recognizeMap));
    loadConfigData(false, '../webmatic_user/config.json', 'config', 'webmaticoptionsMap', false, true);
} else {
    optionsMap = JSON.parse(localStorage.getItem("webmaticoptionsMap"));
    var ok = true;
    if (optionsMap['storageVersion'] !== storageVersion) {
        ok = false;
        localStorage.clear();
        localStorage.setItem("webmaticrecognizeMap", JSON.stringify(recognizeMap));
        newVersion = true;
    }
    loadConfigData(ok, '../webmatic_user/config.json', 'config', 'webmaticoptionsMap', false, true);
}

//Lokal
if (localStorage.getItem("webmaticoptionsclientMap") === null || localStorage.getItem("webmaticoptionsclientMap") === "undefined") {
    if (client !== "") {
        loadConfigData(false, '../webmatic_user/config' + client + '.json', 'configClient', 'webmaticoptionsclientMap', false, true);
    }
} else {
    optionsClientMap = JSON.parse(localStorage.getItem("webmaticoptionsclientMap"));
}

//Kombinieren
createOneMap("config");
clientsList = optionsMap["clientsList"];

//Check Icons
if (localStorage.getItem("picturesList") === null || localStorage.getItem("picturesList") === "undefined") {
    $.ajax({
        type: 'GET',
        url: 'cgi/check-image.cgi',
        dataType: 'json',
        async: false,
        cache: false
    }).done(function (data) {
        picturesList = data;
        localStorage.setItem("picturesList", JSON.stringify(picturesList));
    }).fail(function () {
        picturesListError = true;
    });
} else {
    picturesList = JSON.parse(localStorage.getItem("picturesList"));
    $.getJSON('cgi/check-image.cgi', function (data) {
        picturesList = data;
        localStorage.setItem("picturesList", JSON.stringify(picturesList));
    });
}

//Webmatic-Version erkennen
if (!debugModus) {
    if (resultOptionsMap['new_version'] !== "no") {
        if (resultOptionsMap['new_version'] === "alpha") {
            $.get("https://raw.githubusercontent.com/jens-maus/webmatic/master/ISALPHA", function (isalpha) {
                var versionURL = "";
                if (isalpha === "1") {
                    versionURL = "https://raw.githubusercontent.com/jens-maus/webmatic/master/VERSIONALPHA";
                } else {
                    versionURL = "https://raw.githubusercontent.com/jens-maus/webmatic/master/VERSION";
                }
                $.get(versionURL, function (data) {
                    newWebmaticVersion = String(data).trim();
                });
            });
            versionURL = "https://raw.githubusercontent.com/jens-maus/webmatic/master/VERSIONALPHA";
        } else {
            $.get("https://raw.githubusercontent.com/jens-maus/webmatic/master/VERSION", function (data) {
                newWebmaticVersion = String(data).trim();
                if (isPreRelease && newWebmaticVersion === lastStableVersion) {
                    newWebmaticVersion = webmaticVersion;
                }
            });
        }
    }
    $.get('../webmatic_user/ver.json', function (data) {
        if (String(data).trim() !== webmaticVersion) {
            createVerFile();
        }
    }).fail(function (jqXHR) {
        if (jqXHR.status === 404) {
            createVerFile();
        }
    });
}

//Design setzen
theme = resultOptionsMap["default_theme"];
if ($.inArray(theme, ["wma", "wmb", "wmc", "wmd", "wme", "wmf", "wmg", "wmh", "wmi", "wmj", "wmk", "wml"]) === -1) {
    theme = "wma";
}
font = resultOptionsMap["default_font"];
if ($.inArray(font, ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"]) === -1) {
    font = "a";
}

// Initialize refresh timer:
var refreshTimer = setInterval(function () {
    checkrefreshPage();
}, 1000);

function loadRecognization() {
    $.ajax({
        type: 'GET',
        url: 'cgi/recognizer.cgi',
        dataType: 'json',
        async: false,
        cache: false
    }).done(function (data) {
        if (data['REMOTE_ADDR'].match("^192\.168\.") || data['REMOTE_ADDR'].match("^10\.") || data['REMOTE_ADDR'].match("^172\.(1[6-9]|2[0-9]|3[0-1])\.")) {
            recognizeMap = data;
            client = data['REMOTE_ADDR'];
            localStorage.setItem("webmaticrecognizeMap", JSON.stringify(recognizeMap));
        } else {
            recognizeMap = {};
            client = "";
        }
    }).fail(function () {
        recognizeMap = {};
        client = "";
    });
}