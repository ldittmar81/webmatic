
/* global userFolder, isPreRelease, storageVersion, debugModus, resultOptionsMap, lastStableVersion, webmaticVersion */

//Wiedererkennung von Clients
$.ajax({
    type: 'GET',
    url: '../' + userFolder + '/manClient.json',
    async: false,
    cache: false
}).done(function (data) {
    manClient = (String(data).trim() === "true");
}).fail(function () {
    $.post('cgi/saveconfig.cgi', {name: "manClient", text: "false", folder: userFolder});
});
if (localStorage.getItem(isPreRelease + "webmaticrecognizeMap") === null || localStorage.getItem(isPreRelease + "webmaticrecognizeMap") === "undefined") {
    loadRecognization();
} else {
    recognizeMap = JSON.parse(localStorage.getItem(isPreRelease + "webmaticrecognizeMap"));
    if (!("REMOTE_ADDR" in recognizeMap) || (manClient && "HTTP_USER_AGENT" in recognizeMap) || (!manClient && !("HTTP_USER_AGENT" in recognizeMap))) {
        localStorage.removeItem(isPreRelease + "webmaticrecognizeMap");
        loadRecognization();
    } else {
        client = recognizeMap["REMOTE_ADDR"];
    }
}

//Special Reload für Client-Einstellungen
$.ajax({
    type: 'GET',
    url: '../' + userFolder + '/reload' + client + '.json',
    async: false,
    cache: false
}).done(function (data) {
    reloadClient = (String(data).trim() === "true");
    if (reloadClient) {
        $.post('cgi/saveconfig.cgi', {name: "reload" + client, text: "false", folder: userFolder});
    }
}).fail(function () {
    $.post('cgi/saveconfig.cgi', {name: "reload" + client, text: "false", folder: userFolder});
});
if (localStorage.getItem(isPreRelease + "clearCache") !== null || reloadClient) {
    localStorage.clear();
}
if (localStorage.getItem(isPreRelease + "tempOptionsForClient") !== null) {
    client = localStorage.getItem(isPreRelease + "tempOptionsForClient");
    isTempClient = true;
    localStorage.clear();
    $.post('cgi/saveconfig.cgi', {name: "reload" + client, text: "true", folder: userFolder});
}

//Initialwerte (Einstellungen) einlesen
//Global
if (localStorage.getItem(isPreRelease + "webmaticoptionsMap") === null || localStorage.getItem(isPreRelease + "webmaticoptionsMap") === "undefined") {
    localStorage.clear();
    if (isTempClient) {
        localStorage.setItem(isPreRelease + "clearCache", true);
    }
    localStorage.setItem(isPreRelease + "webmaticrecognizeMap", JSON.stringify(recognizeMap));
    loadConfigData(false, '../' + userFolder + '/config.json', 'config', 'webmaticoptionsMap', false, true);
} else {
    optionsMap = JSON.parse(localStorage.getItem(isPreRelease + "webmaticoptionsMap"));
    var ok = true;
    if (optionsMap['storageVersion'] !== storageVersion) {
        ok = false;
        localStorage.clear();
        localStorage.setItem(isPreRelease + "webmaticrecognizeMap", JSON.stringify(recognizeMap));
        newVersion = true;
    }
    loadConfigData(ok, '../' + userFolder + '/config.json', 'config', 'webmaticoptionsMap', false, true);
}

//Lokal
if (localStorage.getItem(isPreRelease + "webmaticoptionsclientMap") === null || localStorage.getItem(isPreRelease + "webmaticoptionsclientMap") === "undefined") {
    if (client !== "") {
        loadConfigData(false, '../' + userFolder + '/config' + client + '.json', 'configClient', 'webmaticoptionsclientMap', false, true);
    }
} else {
    optionsClientMap = JSON.parse(localStorage.getItem(isPreRelease + "webmaticoptionsclientMap"));
}

//Kombinieren
createOneMap("config");
clientsList = optionsMap["clientsList"];
if (client !== "" && !isTempClient && !(client in clientsList)) {
    clientsList[client] = client;
    optionsMap["clientsList"] = clientsList;
    saveOptionsToServer("clientsList", clientsList);
}

//Check Icons
if (localStorage.getItem(isPreRelease + "picturesList") === null || localStorage.getItem(isPreRelease + "picturesList") === "undefined") {
    $.ajax({
        type: 'GET',
        url: 'cgi/check-image.cgi?folder=' + userFolder,
        dataType: 'json',
        async: false,
        cache: false
    }).done(function (data) {
        picturesList = data;
        localStorage.setItem(isPreRelease + "picturesList", JSON.stringify(picturesList));
    }).fail(function () {
        picturesListError = true;
    });
} else {
    picturesList = JSON.parse(localStorage.getItem(isPreRelease + "picturesList"));
    $.getJSON('cgi/check-image.cgi?folder=' + userFolder, function (data) {
        picturesList = data;
        localStorage.setItem(isPreRelease + "picturesList", JSON.stringify(picturesList));
    });
}

//Webmatic-Version erkennen
if (!debugModus) {
    if (resultOptionsMap['new_version'] !== "no") {
        if (resultOptionsMap['new_version'] === "alpha") {
            $.get("https://raw.githubusercontent.com/ldittmar81/webmatic/master/ISALPHA", function (isalpha) {
                var versionURL = "";
                if (isalpha === "1") {
                    versionURL = "https://raw.githubusercontent.com/ldittmar81/webmatic/master/VERSIONALPHA";
                } else {
                    versionURL = "https://raw.githubusercontent.com/ldittmar81/webmatic/master/VERSION";
                }
                $.get(versionURL, function (data) {
                    newWebmaticVersion = String(data).trim();
                });
            });
            versionURL = "https://raw.githubusercontent.com/ldittmar81/webmatic/master/VERSIONALPHA";
        } else {
            $.get("https://raw.githubusercontent.com/ldittmar81/webmatic/master/VERSION", function (data) {
                newWebmaticVersion = String(data).trim();
                if (isPreRelease && newWebmaticVersion === lastStableVersion) {
                    newWebmaticVersion = webmaticVersion;
                }
            });
        }
    }
    $.get('../' + userFolder + '/ver.json', function (data) {
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
    if (!manClient) {
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
                localStorage.setItem(isPreRelease + "webmaticrecognizeMap", JSON.stringify(recognizeMap));
            } else {
                recognizeMap = {};
                client = "";
            }
        }).fail(function () {
            recognizeMap = {};
            client = "";
        });
    } else {
        client = prompt(mapText("CLIENT_CODE"));
        var conf = false;
        if (!client) {
            conf = true;
        } else {
            client = client.replace(/['" \\/]/g, "_");
        }
        while (!conf) {

            conf = confirm(mapText("CLIENT_CODE_COMFIRM_1") + " \"" + client + "\". " + mapText("CLIENT_CODE_COMFIRM_2"));
            if (!conf) {
                client = prompt(mapText("CLIENT_CODE"));
                if (!client) {
                    conf = true;
                } else {
                    client = client.replace(/['" \\/]/g, "_");
                }
            }
        }

        if (client) {
            recognizeMap = {};
            recognizeMap['REMOTE_ADDR'] = client;
            localStorage.setItem(isPreRelease + "webmaticrecognizeMap", JSON.stringify(recognizeMap));
        } else {
            recognizeMap = {};
            client = "";
        }
    }
}