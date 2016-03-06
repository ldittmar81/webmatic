/* global isTempClient, client, storageVersion */

function loadConfigData(async, url, type, map, create, actual, callback) {
    $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        async: async,
        cache: false
    }).done(function (data) {
        var processedData;
        switch (type) {
            case "config":
                if (!async) {
                    saveDataToFile = true;
                    processedData = saveConfigFile(type, data, create, map, true);
                } else {
                    processedData = data;
                    optionsMap = data;
                    localStorage.setItem(map, JSON.stringify(data));
                }
                break;
            case "variables":
                processedData = saveConfigFile(type, data, create, map, actual);
                break;
            case "programs":
                processedData = saveConfigFile(type, data, create, map, actual);
                break
            case "favorites":
                processedData = saveConfigFile(type, data, create, map, actual);
                break
            case "rooms":
                processedData = saveConfigFile(type, data, create, map, actual);
                break
            case "functions":
                processedData = saveConfigFile(type, data, create, map, actual);
                break
            case "devices":
                processedData = data;
                devicesMap = data;
                localStorage.setItem(map, JSON.stringify(data));
                break
            case "configClient":
                optionsClientMap = data;
                localStorage.setItem(map, JSON.stringify(data));
                break;
            case "programsClient":
                programsClientMap = data;
                localStorage.setItem(map, JSON.stringify(data));
                break
            case "favoritesClient":
                favoritesClientMap = data;
                localStorage.setItem(map, JSON.stringify(data));
                break
            case "roomsClient":
                roomsClientMap = data;
                localStorage.setItem(map, JSON.stringify(data));
                break
            case "functionsClient":
                functionsClientMap = data;
                localStorage.setItem(map, JSON.stringify(data));
                break
            case "variablesClient":
                variablesClientMap = data;
                localStorage.setItem(map, JSON.stringify(data));
                break
        }

        if (typeof callback === "function") {
            callback(processedData);
        }
    }).fail(function (jqXHR, textStatus) {
        if (jqXHR.status === 404) {
            createConfigFile(type, map);
        } else {
            log("Request failed: " + textStatus, 2);
        }
    });

}

function saveConfigFile(type, newJsonObj, create, map, actual) {
    if (actual) {
        saveDataToFile = true;
        var returnJson = {};
        if (type === "rooms" || type === "favorites" || type === "functions") {
            var i = 0;
            $.each(newJsonObj, function (key, val) {
                if (key === "date") {
                    returnJson[key] = val;
                    return;
                }
                i++;
                var obj = {};
                var oldName = val;
                if (val.startsWith("room") || val.startsWith("func")) {
                    val = mapText(val);
                } else if (val.startsWith("%24%7B")) {
                    val = mapText(val.substring(6, val.length - 3));
                } else if (val.startsWith("${")) {
                    val = mapText(val.substring(2, val.length - 1));
                }
                obj['name'] = val;
                obj['oldname'] = oldName;
                obj['visible'] = true;
                obj['position'] = i;
                obj[type + '_divisor'] = "unsorted";

                returnJson[key] = obj;
            });
            returnJson['size'] = i;
            returnJson['divisors'] = {};

        } else if (type === "programs") {
            var i = 0;
            $.each(newJsonObj, function (key, val) {
                if (key === "date") {
                    returnJson[key] = val;
                    return;
                }
                i++;
                var obj = {};
                obj['name'] = val['name'];
                obj['oldname'] = val['name'];
                obj['visible'] = val['visible'];
                obj['oldvisible'] = val['visible'];
                obj['position'] = i;
                obj['active'] = val['active'];
                obj['operate'] = val['operate'];
                obj['oldoperate'] = val['operate'];
                obj['date'] = val['date'];
                obj['info'] = val['info'];
                obj['onlyPic'] = false;
                obj[type + '_divisor'] = "unsorted";
                returnJson[key] = obj;
            });
            returnJson['size'] = i;
            returnJson['divisors'] = {};
        } else if (type === "variables") {
            var i = 0;
            $.each(newJsonObj, function (key, val) {
                if (key === "date") {
                    returnJson[key] = val;
                    return;
                }
                i++;
                var obj = {};
                var name = val['name'];
                if (name.startsWith("%24%7B")) {
                    name = mapText(name.substring(6, name.length - 3));
                } else if (name.startsWith("${")) {
                    name = mapText(name.substring(2, name.length - 1));
                }
                obj['name'] = name;
                obj['oldname'] = val['name'];
                obj['visible'] = val['visible'];
                obj['oldvisible'] = val['visible'];
                obj['position'] = i;
                obj['value'] = val['value'];
                obj['active'] = val['active'];
                var valInfo = val['info'];
                if (valInfo.startsWith("%24%7B")) {
                    valInfo = mapText(valInfo.substring(6, valInfo.length - 3));
                } else if (valInfo.startsWith("${")) {
                    valInfo = mapText(valInfo.substring(2, valInfo.length - 1));
                }
                obj['operate'] = isReadOnlyVariable(valInfo);
                obj['oldoperate'] = obj['operate'];
                obj['date'] = val['date'];
                obj['info'] = valInfo;
                var valueType = val['valueType'];
                obj['valueType'] = valueType;
                obj['valueUnit'] = val['valueUnit'];
                obj['onlyPic'] = false;
                if (valueType === "16") {
                    obj['valueList'] = val['valueList'];
                    obj['listType'] = "auto";
                } else if (valueType === "2") {
                    var valueName0 = val['valueName0'];
                    if (valueName0.startsWith("${")) {
                        valueName0 = mapText(valueName0.substring(2, valueName0.length - 1));
                    }
                    obj['valueName0'] = valueName0;
                    var valueName1 = val['valueName1'];
                    if (valueName1.startsWith("${")) {
                        valueName1 = mapText(valueName1.substring(2, valueName1.length - 1));
                    }
                    obj['valueName1'] = valueName1;
                } else if (valueType === "4") {
                    obj['valueMin'] = val['valueMin'];
                    obj['valueMax'] = val['valueMax'];
                    obj['step'] = 1;
                    obj['faktor'] = 1;
                }
                obj[type + '_divisor'] = "unsorted";
                returnJson[key] = obj;
            });
            returnJson['size'] = i;
            returnJson['divisors'] = {};
        } else {
            returnJson = newJsonObj;
        }

        returnJson = refreshJSONObj(type, returnJson, create);

        localStorage.setItem(map, JSON.stringify(returnJson));
        if (saveDataToFile) {
            saveDataToFile = false;
            $.post('cgi/saveconfig.cgi', {name: type, text: JSON.stringify(returnJson)});
        }
        return returnJson;
    } else {
        setMap(type, newJsonObj);
        return newJsonObj;
    }
}

function refreshJSONObj(type, newJsonObj, create) {
    var oldMap = getMap(type);
    if (type === "rooms" || type === "favorites" || type === "functions") {
        if (!create) {
            var returnJson = {};
            var size = newJsonObj["size"];
            $.each(newJsonObj, function (key, val) {
                if (key === "date" || key === "size" || key === "divisors") {
                    if (key === "divisors") {
                        if ('divisors' in oldMap) {
                            returnJson['divisors'] = oldMap['divisors'];
                        } else {
                            returnJson['divisors'] = val;
                        }
                    } else {
                        returnJson[key] = val;
                    }
                    return;
                }
                if (key in oldMap) {
                    var savedVal = oldMap[key];
                    val['visible'] = savedVal['visible'];
                    val['position'] = savedVal['position'];
                    if (val['oldname'] === savedVal['oldname']) {
                        var savedName = savedVal['name'];
                        if (savedName.startsWith("room") || savedName.startsWith("func")) {
                            savedName = mapText(savedName);
                        } else if (val.startsWith("%24%7B")) {
                            savedName = mapText(savedName.substring(6, savedName.length - 3));
                        } else if (val.startsWith("${")) {
                            savedName = mapText(savedName.substring(2, savedName.length - 1));
                        }
                        val['name'] = savedName;
                    } else {
                        saveDataToFile = true;
                    }
                    if (type + '_divisor' in savedVal) {
                        val[type + '_divisor'] = savedVal[type + '_divisor'];
                    } else {
                        val[type + '_divisor'] = "unsorted";
                        saveDataToFile = true;
                    }

                } else {
                    size++;
                    val['position'] = size;
                    saveDataToFile = true;
                }
                returnJson[key] = val;
            });
            returnJson["size"] = size;
            newJsonObj = returnJson;
        }
    } else if (type === "programs") {
        if (!create) {
            var returnJson = {};
            var size = newJsonObj["size"];
            $.each(newJsonObj, function (key, val) {
                if (key === "date" || key === "size" || key === "divisors") {
                    if (key === "divisors") {
                        if ('divisors' in oldMap) {
                            returnJson['divisors'] = oldMap['divisors'];
                        } else {
                            returnJson['divisors'] = val;
                        }
                    } else {
                        returnJson[key] = val;
                    }
                    return;
                }
                if (key in oldMap) {
                    var savedVal = oldMap[key];
                    val['position'] = savedVal['position'];
                    if (val['oldname'] === savedVal['oldname']) {
                        val['name'] = savedVal['name'];
                    } else {
                        saveDataToFile = true;
                    }
                    if (val['oldvisible'] === savedVal['oldvisible']) {
                        val['visible'] = savedVal['visible'];
                    } else {
                        saveDataToFile = true;
                    }
                    if (val['oldoperate'] === savedVal['oldoperate']) {
                        val['operate'] = savedVal['operate'];
                    } else {
                        saveDataToFile = true;
                    }
                    if ('onlyPic' in savedVal) {
                        val['onlyPic'] = savedVal['onlyPic'];
                    } else {
                        val['onlyPic'] = false;
                        saveDataToFile = true;
                    }
                    if (type + '_divisor' in savedVal) {
                        val[type + '_divisor'] = savedVal[type + '_divisor'];
                    } else {
                        val[type + '_divisor'] = "unsorted";
                        saveDataToFile = true;
                    }
                } else {
                    size++;
                    val['position'] = size;
                    saveDataToFile = true;
                }
                returnJson[key] = val;
            });
            returnJson["size"] = size;
            newJsonObj = returnJson;
        }
    } else if (type === "variables") {
        if (!create) {
            var returnJson = {};
            var size = newJsonObj["size"];
            $.each(newJsonObj, function (key, val) {
                if (key === "date" || key === "size" || key === "divisors") {
                    if (key === "divisors") {
                        if ('divisors' in oldMap) {
                            returnJson['divisors'] = oldMap['divisors'];
                        } else {
                            returnJson['divisors'] = val;
                        }
                    } else {
                        returnJson[key] = val;
                    }
                    return;
                }
                var valueType = val['valueType'];
                if (key in oldMap) {
                    var savedVal = oldMap[key];
                    val['position'] = savedVal['position'];
                    if (val['oldname'] === savedVal['oldname']) {
                        var name = savedVal['name'];
                        if (name.startsWith("%24%7B")) {
                            name = mapText(name.substring(6, name.length - 3));
                        } else if (name.startsWith("${")) {
                            name = mapText(name.substring(2, name.length - 1));
                        }
                        val['name'] = name;
                    } else {
                        saveDataToFile = true;
                    }
                    if (val['oldvisible'] === savedVal['oldvisible']) {
                        val['visible'] = savedVal['visible'];
                    } else {
                        saveDataToFile = true;
                    }
                    if (val['oldoperate'] === savedVal['oldoperate']) {
                        val['operate'] = savedVal['operate'];
                    } else {
                        saveDataToFile = true;
                    }
                    if ('onlyPic' in savedVal) {
                        val['onlyPic'] = savedVal['onlyPic'];
                    } else {
                        val['onlyPic'] = false;
                        saveDataToFile = true;
                    }
                    if (valueType === "16") {
                        if ('listType' in savedVal) {
                            val['listType'] = savedVal['listType'];
                        } else {
                            val['listType'] = "auto";
                            saveDataToFile = true;
                        }
                    } else if (valueType === "4") {
                        if ('step' in savedVal) {
                            val['step'] = savedVal['step'];
                        } else {
                            val['step'] = 1;
                            saveDataToFile = true;
                        }
                        if ('faktor' in savedVal) {
                            val['faktor'] = savedVal['faktor'];
                        } else {
                            val['faktor'] = 1;
                            saveDataToFile = true;
                        }
                    }
                    if (type + '_divisor' in savedVal) {
                        val[type + '_divisor'] = savedVal[type + '_divisor'];
                    } else {
                        val[type + '_divisor'] = "unsorted";
                        saveDataToFile = true;
                    }
                } else {
                    size++;
                    val['position'] = size;
                    saveDataToFile = true;
                }
                returnJson[key] = val;
            });
            returnJson["size"] = size;
            newJsonObj = returnJson;
        }
    } else if (type === "config" && !create) {
        newJsonObj['storageVersion'] = storageVersion;
        if (!("ccu_historian" in newJsonObj)) {
            newJsonObj['ccu_historian'] = "";
        }
        if (!("default_menugfxsize" in newJsonObj)) {
            newJsonObj['default_menugfxsize'] = "large";
        }
        if (!("no_more_settings" in newJsonObj)) {
            newJsonObj['no_more_settings'] = 0;
        }
        if (!("new_version" in newJsonObj)) {
            newJsonObj['new_version'] = "stable";
        }
        if (!("dont_leave" in newJsonObj)) {
            newJsonObj['dont_leave'] = false;
        }
        if (!("clientsList" in newJsonObj)) {
            newJsonObj['clientsList'] = !isTempClient ? clientsList : new Object();
        }
        if (!("default_sort_manually" in newJsonObj)) {
            newJsonObj['default_sort_manually'] = true;
        }
        clientsList = newJsonObj['clientsList'];
        if (client !== "" && !isTempClient && !(client in clientsList)) {
            clientsList[client] = client;
            newJsonObj['clientsList'] = clientsList;
        }
        if (!("two_sites" in newJsonObj)) {
            newJsonObj['two_sites'] = false;
        }
        if (!("transition" in newJsonObj)) {
            newJsonObj['transition'] = "flip";
        }
        if (!("columns" in newJsonObj)) {
            newJsonObj['columns'] = 1;
        }
        if (!("show_description" in newJsonObj)) {
            newJsonObj['show_description'] = true;
        }
        if (!("show_lastUsedTime" in newJsonObj)) {
            newJsonObj['show_lastUsedTime'] = true;
        }
        if (!("favorites_divisor" in newJsonObj)) {
            newJsonObj['favorites_divisor'] = false;
        }
        if (!("rooms_divisor" in newJsonObj)) {
            newJsonObj['rooms_divisor'] = false;
        }
        if (!("functions_divisor" in newJsonObj)) {
            newJsonObj['functions_divisor'] = false;
        }
        if (!("variables_divisor" in newJsonObj)) {
            newJsonObj['variables_divisor'] = false;
        }
        if (!("programs_divisor" in newJsonObj)) {
            newJsonObj['programs_divisor'] = false;
        }
    }

    setMap(type, newJsonObj);
    return newJsonObj;
}

function createConfigFile(type, map) {
    saveDataToFile = true;
    if (type === "config") {
        var text = '{';
        text += '"storageVersion" : ' + storageVersion + ',';
        text += '"favorites" : true,';
        text += '"rooms" : true,';
        text += '"functions" : true,';
        text += '"variables" : true,';
        text += '"programs" : true,';
        text += '"others" : true,';
        text += '"collapsed" : "rooms",';
        text += '"systemvar_readonly" : true,';
        text += '"default_theme" : "wma",';
        text += '"default_font" : "a",';
        text += '"ccu_historian" : "",';
        text += '"default_menugfxsize" : "large",';
        text += '"no_more_settings" : 0,';
        text += '"new_version" : "stable",';
        text += '"dont_leave" : false,';
        text += '"clientsList" : {' + (client !== "" && !isTempClient ? '"' + client + '":"' + client + '"' : '') + '},';
        text += '"default_sort_manually" : true,';
        text += '"two_sites" : false,';
        text += '"transition" : "flip",';
        text += '"columns" : 1,';
        text += '"show_description" : true,';
        text += '"show_lastUsedTime" : true,';
        text += '"favorites_divisor" : false,';
        text += '"rooms_divisor" : false,';
        text += '"functions_divisor" : false,';
        text += '"variables_divisor" : false,';
        text += '"programs_divisor" : false';
        text += '}';

        optionsMap = saveConfigFile(type, JSON.parse(text), true, map, true);
    } else if (type.endsWith("Client")) {
        var text = '{}';
        type = type.slice(0, -6);
        if (client !== "") {
            switch (type) {
                case "config":
                    optionsClientMap = saveConfigFile(type + client, JSON.parse(text), true, map, true);
                    break;
                case "variables":
                    variablesClientMap = saveConfigFile(type + client, JSON.parse(text), true, map, true);
                    break;
                case "programs":
                    programsClientMap = saveConfigFile(type + client, JSON.parse(text), true, map, true);
                    break
                case "favorites":
                    favoritesClientMap = saveConfigFile(type + client, JSON.parse(text), true, map, true);
                    break
                case "rooms":
                    roomsClientMap = saveConfigFile(type + client, JSON.parse(text), true, map, true);
                    break
                case "functions":
                    functionsClientMap = saveConfigFile(type + client, JSON.parse(text), true, map, true);
                    break
                case "devices":
                    devicesClientMap = saveConfigFile(type + client, JSON.parse(text), true, map, true);
                    break
            }
        }
    } else {
        loadConfigData(false, 'cgi/' + type + '.cgi', type, map, true, true);
    }
}


