/* global textMap */

var imageMap = {
    ABS_HUMIDITY: "humidity.png",
    ACTUAL_HUMIDITY: "humidity.png",
    ACTUAL_TEMPERATURE: "temperature.png",
    HUM_MAX_24H: "humidity.png",
    HUM_MIN_24H: "humidity.png",
    HUMIDITY: "humidity.png",
    TEMP_MAX_24H: "temperature.png",
    TEMP_MIN_24H: "temperature.png",
    TEMPERATURE: "temperature.png"
};

//1 = true/false -> Error/OK
//2 = 0/1/other -> OK/Warning/Error
//3 = true/false -> Warning/OK
//4 = 0/other -> Hide/Warning
//5 = true/false Error/NoError
//6 = true/false Warning/NoError
//7 = 0/1/2/other -> NoError/NoError/NoError/Warning 
//8 = true/false -> Error/Hide
//9 = 0/other -> Hide/Error
//10 = true/false -> Warning/Hide
var typeState = {
    AKKU__STATUS: 7,
    ALARMACTUATOR__STATE: 1,
    ALARMACTUATOR__ERROR_POWER: 9,
    ALARMACTUATOR__ERROR_SABOTAGE: 9,
    ALARMACTUATOR__ERROR_BATTERY: 9,
    ALARMACTUATOR__LOWBAT: 10,
    CLIMATECONTROL_RT_TRANSCEIVER__FAULT_REPORTING: 4,
    CLIMATECONTROL_RT_TRANSCEIVER__WINDOW_STATE: 8,
    CLIMATECONTROL_VENT_DRIVE__ERROR: 4,
    DIGITAL_INPUT__STATE: 3,
    DIMMER__ERROR: 9,
    DIMMER__ERROR_REDUCED: 8,
    DIMMER__ERROR_OVERHEAT: 8,
    DIMMER__ERROR_OVERLOAD: 8,
    MOTION_DETECTOR__MOTION: 3,
    MOTION_DETECTOR__ERROR: 9,
    POWER__LOWBAT: 10,
    ROTARY_HANDLE_SENSOR__STATE: 2,
    ROTARY_HANDLE_SENSOR__ERROR: 4,
    ROTARY_HANDLE_SENSOR__LOWBAT: 10,
    SENSOR__SENSOR: 1,
    SENSOR_FOR_CARBON_DIOXIDE__STATE: 2,
    SHUTTER_CONTACT__STATE: 3,
    SHUTTER_CONTACT__LOWBAT: 10,
    SHUTTER_CONTACT__ERROR: 4,
    SMOKE_DETECTOR__STATE: 1,
    SMOKE_DETECTOR_TEAM__STATE: 1,
    THERMALCONTROL_TRANSMIT__LOWBAT_REPORTING: 10,
    THERMALCONTROL_TRANSMIT__COMMUNICATION_REPORTING: 10,
    THERMALCONTROL_TRANSMIT__WINDOW_OPEN_REPORTING: 10,
    TILT_SENSOR__STATE: 3,
    TILT_SENSOR__LOWBAT: 10,
    U_SOURCE_FAIL__POWER: 5,
    VIRTUAL_DIMMER__ERROR: 9,
    VIRTUAL_DIMMER__ERROR_REDUCED: 8,
    VIRTUAL_DIMMER__ERROR_OVERHEAT: 8,
    VIRTUAL_DIMMER__ERROR_OVERLOAD: 8,
    WATERDETECTIONSENSOR__STATE: 2,
    WATERDETECTIONSENSOR__LOWBAT: 10,
    WEATHER__LOWBAT: 10,
    WEATHER__RAINING: 3,
    WINMATIC__STATE_UNCERTAIN: 6,
    KEYMATIC__STATE_UNCERTAIN: 6
};

var typeInput = {
    ALARMACTUATOR__STATE: "BoolButtonList",
    BLIND__STOP: "ButtonNoRefresh",
    CLIMATECONTROL_REGULATOR__STATE: "BoolButtonList",
    DIGITAL_ANALOG_OUTPUT__STATE: "BoolButtonList",
    DIGITAL_OUTPUT__STATE: "BoolButtonList",
    DIMMER__OLD_LEVEL: "Button",
    KEY__PRESS_LONG: "Button",
    KEY__PRESS_SHORT: "Button",
    KEYMATIC__OPEN: "Button",
    KEYMATIC__STATE: "BoolButtonList",
    SIGNAL_CHIME__STATE: "BoolButtonList",
    SIGNAL_LED__STATE: "BoolButtonList",
    SWITCH__STATE: "BoolButtonList",
    SWITCH__TOGGLE: "Button",
    VIRTUAL_DIMMER__OLD_LEVEL: "Button",
    VIRTUAL_KEY__PRESS_SHORT: "Button",
    VIRTUAL_KEY__PRESS_LONG: "Button",
    WINMATIC__STOP: "ButtonNoRefresh"
};

var unitMap = {
    ABS_HUMIDITY: "g/m<sup>3</sup>",
    DEW_POINT: "°C",
    HUM_MAX_24H: "%",
    HUM_MIN_24H: "%",
    HUMIDITY: "%",
    HUMIDITYF: "%",
    LEVEL: "%",
    ON_TIME: "s",
    PROG_DIM_DOWN: "s",
    PROG_DIM_UP: "s",
    PROG_TIMER: "s",
    RAIN_CTR: "mm",
    RAIN_CTR_24H: "mm",
    RAMP_TIME: "s",
    SETPOINT: "°C",
    TEMP_MAX_24H: "°C",
    TEMP_MIN_24H: "°C",
    TEMPERATURE: "°C",
    TEMPERATUR_COMFORT_VALUE: "°C",
    TEMPERATUR_LOWERING_VALUE: "°C",
    TEMPERATUR_WINDOW_OPEN_VALUE: "°C",
    VALVE_OFFSET_VALUE: "%",
    VALVE_STATE: "%",
    WIND_MAX_24H: "km/h",
    WIND_SPEED: "km/h"
};

// Funktion zum mappen der IDs auf Texte.
function mapText(text, defaultText) {
    var newText = "";
    newText = textMap[text.toUpperCase()];

    if (defaultText && !newText) {
        newText = textMap[defaultText.toUpperCase()];
    }

    // Wenn nichts gefunden, dann Originaltext zurück:
    if (!newText) {
        return text;
    } else {
        return newText;
    }
}

function mapUnit(unit, hssType) {

    if (unit === "100%") {
        return "%";  // Manche Geräte haben als Einheit 100%. Würde zu seltsamen Darstellungen führen.
    } else if (typeof (unit) === "undefined" || unit === "") {
        var result = unitMap[hssType.toUpperCase()];
        return typeof (result) === "undefined" ? "" : result;
    }
    return unit;
}

// Funktion zum mappen von IDs auf Grafiken:
function mapImage(text) {
    var gfx = "";
    gfx = imageMap[text.toUpperCase()];

    // Wenn keines gefunden, dann unknown.png zurück:
    if (!gfx) {
        return "unknown.png";
    } else {
        return gfx;
    }
}

//Statusanzeige
function mapState(hssType, deviceHssType, valFloat, valBool) {
    var type = typeState[deviceHssType.toUpperCase() + "__" + hssType.toUpperCase()];

    if (type) {
        switch (type) {
            case 1:
                return valBool ? "Error" : "OK";
            case 2:
                if (valFloat === 0.0) {
                    return "OK";
                } else if (valFloat === 1.0) {
                    return "Warning";
                } else {
                    return "Error";
                }
            case 3:
                return valBool ? "Warning" : "OK";
            case 4:
                if (valFloat === 0.0) {
                    return "Hide";
                } else {
                    return "Warning";
                }
            case 5:
                return valBool ? "Error" : "NoError";
            case 6:
                return valBool ? "Warning" : "NoError";
            case 7:
                if (valFloat === 0.0) {
                    return "NoError";
                } else if (valFloat === 1.0) {
                    return "NoError";
                } else if (valFloat === 2.0) {
                    return "NoError";
                } else {
                    return "Warning";
                }
            case 8:
                return valBool ? "Error" : "Hide";
            case 9:
                if (valFloat === 0.0) {
                    return "Hide";
                } else {
                    return "Error";
                }
            case 10:
                return valBool ? "Warning" : "Hide";
        }
    }

    if (hssType === "STATE") {
        return valBool ? "OFF" : "ON";
    }

    return "";
}

//Eingabefelder und Buttons erstellen
function mapInput(deviceHssType, channel, vorDate, deviceID, operate) {
    var channelId = channel['id'];
    var hssType = channel['hssType'];
    var valString = channel['value'];

    var input = typeInput[deviceHssType.toUpperCase() + "__" + hssType.toUpperCase()];

    var txt = textMap[deviceHssType.toUpperCase() + "__" + hssType.toUpperCase()];

    if (input) {
        switch (input) {
            case "BoolButtonList":
                return addSetBoolButtonList(deviceID, channelId, valString, mapText(deviceHssType + "__" + hssType + "__false"), mapText(deviceHssType + "__" + hssType + "__true"), "", vorDate, true, operate);
            case "Button":
                return addSetButton(deviceID, channelId, mapText(deviceHssType + "__" + hssType), true, vorDate, false, false, true, operate);
            case "ButtonNoRefresh":
                return addSetButton(deviceID, channelId, mapText(deviceHssType + "__" + hssType), true, vorDate, false, false, false, operate);
        }
    } else if (channel['writeable'] && (!txt || txt !== "-")) {

        var valType = channel['valueType'];
        var valRead = channel['readable'] === "true";

        var valUnit = channel['valueUnit'];

        if (valType === "2" && valRead) {
            return addSetBoolButtonList(deviceID, channelId, valString, mapText(deviceHssType + "__" + hssType + "__false", textMap['OFF']), mapText(deviceHssType + "__" + hssType + "__true", textMap['ON']), "", vorDate, true, operate);
        }
        if (valType === "2" && !valRead) {
            return addSetButton(deviceID, channelId, mapText(deviceHssType + "__" + hssType, textMap['RUN']), true, vorDate, false, false, true, operate);
        }
        if (valType === "4" && valRead) {
            var valMin = parseFloat(channel['valueMin']);
            var valMax = parseFloat(channel['valueMax']);
            return addSetNumber(deviceID, channelId, valString, valUnit, valMin, valMax, 0.001, 1.0, vorDate + " | " + valMin + " " + valUnit + " = " + mapText("OFF") + ", " + valMax + " " + valUnit + " = " + mapText("ON"), false, operate);
        }
        if (valType === "16" && valRead) {
            return addSetValueList(deviceID, channelId, valString, channel['valueList'], valUnit, vorDate, true, operate);
        }
    }

    return "";
}


