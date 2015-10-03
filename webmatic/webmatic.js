// WebMatic
// (c) Frank Epple
// ----------------------- Click function handlers ----------------------------

// Variables to save last click:
var lastClickType = -1;
var lastClickID   = -1;

prevItem = 0;

// Initialize refresh timer:
refreshTimer = setInterval(function() {CheckRefreshPage();}, 1000);
lastTime = -1;

function CheckRefreshPage()
{
  // Statt Timer auf 60 Sekunden hier eigener Vergleich alle Sekunde. Nur so geht es, dass nach einem iOS WakeUp
  // des Browsers sofort ein Reload passiert, wenn mehr als 60 Sekunden vorbei sind.
  d = new Date();
  t = d.getTime();
  if (lastTime != -1)
  {
    if (t - lastTime > 60000)
    {
      RefreshPage(0, true);
      RefreshServiceMessages();
      lastTime = t;
    }
  }
  else
    lastTime = t;
}

function RestartTimer()
{
  // Zeit zurücksetzen, damit wieder neu gezählt wird:
  d = new Date();
  t = d.getTime();
  lastTime = t;
}

function RefreshPage(item, saveScrollPos)
{
  // Gleich mal den Timer neu starten, lieber vor dem Reload, damit sich die nicht in die Quere kommen.
  // Später dann besser nur einen Refresh zur selben Zeit zulassen:
  RestartTimer();

  // Markieren von selektiertem Menueintrag:
  if (item != 0)
  {
    if (prevItem != 0)
    {
      prevItem.removeClass("ui-btn-up-b");
      prevItem.removeClass("ui-btn-hover-b");
      prevItem.addClass("ui-btn-up-c");
      prevItem.attr("data-theme", "c");
    }
    item.removeClass("ui-btn-up-c");
    item.removeClass("ui-btn-hover-c");
    item.addClass("ui-btn-up-b");
    item.attr("data-theme", "b");
    prevItem = item;
  }

  if (lastClickType != -1 && lastClickID != -1)
  {
    oldScrollPos = -1;
    if (saveScrollPos)
      oldScrollPos = $(window).scrollTop();

    switch (lastClickType)
    {
      case 1:
        loadData('cgi/list.cgi?list=' + lastClickID, oldScrollPos);
        break;
      case 2:
        loadVariables(oldScrollPos);
        break;
      case 3:
        loadPrograms(oldScrollPos);
        break;
      case 4:
        loadGraphicIDs(oldScrollPos);
        break;
      case 5:
        loadData('debug.json', oldScrollPos);
        break;
    }
  }
}

function RefreshServiceMessages()
{
  $('#buttonService .ui-btn-text').html("<img src='img/misc/wait16.gif' width=12px height=12px>");
  //$('#headerButtonGroup').controlgroup('refresh', true);

  $.getJSON('cgi/service.cgi', function(data) {
    $("#serviceList").empty();
    errNr = 0;
    $.each(data.entries, function(i, msg) {
      msgName = msg['name'];
      msgType = msg['type'];
      msgDevice = msg['device'];
      msgError = msg['error'];
      msgValue = msg['value'];
      msgDate = msg['date'];
      msgReadable = GetErrorMessage(msgType, msgError, msgValue, msgDevice);

      $("#serviceList").append("<li><p class='ui-li-desc' style='text-align:right;'>" + msgDate + "</p><h1>" + msgName + "</h1><p>" + msgReadable + "</p></li>");
      errNr = errNr + 1;
    });
    $('#buttonService .ui-btn-text').text("(" + errNr + ")");
    if (errNr == 0)
    {
      $('#buttonService').buttonMarkup({theme: 'b'});
      $('#headerButtonGroup').controlgroup('refresh', true);
      $("#serviceList").append("<li><p>Keine Servicemeldungen vorhanden.</p></li>");
    }
    else
    {
      $('#buttonService').buttonMarkup({theme: 'e'});
      $('#headerButtonGroup').controlgroup('refresh', true);
    }
    $('#serviceList').listview('refresh', true);
  });
}

$(".menuListItem").live("click", function(){
  lastClickType = 1;
  lastClickID   = $(this).attr("id");
  RefreshPage($(this), false);
});

$(".menuItemVariables").live("click", function(){
  lastClickType = 2;
  lastClickID   = $(this).attr("id");
  RefreshPage($(this), false);
});

$(".menuItemPrograms").live("click", function(){
  lastClickType = 3;
  lastClickID   = $(this).attr("id");
  RefreshPage($(this), false);
});

$(".menuItemGraphicIDs").live("click", function(){
  lastClickType = 4;
  lastClickID   = $(this).attr("id");
  RefreshPage($(this), false);
});

$(".menuItemDebug").live("click", function(){
  lastClickType = 5;
  lastClickID   = 0;
  RefreshPage($(this), false);
});

$("#buttonRefresh").live("click", function(){
  RefreshPage(0, true);
  RefreshServiceMessages()
});

// Ein Button, bei dessen drücken ein Wert an die ID übertragen wird.
$("[id^=setButton]").live("click", function(){
  dataID = $(this).data("id");    // Homematic Geräte ID.
  refresh = $(this).data("refresh");  // Hinweis, ob ein Refresh stattfinden soll.
  value  = $(this).data("value"); // Wert.
  infoID = "info_" + dataID;      // Info Textfeld neben Button.

  $("#" + infoID).text("Übertrage...");
  $.getJSON('cgi/set.cgi?id=' + dataID + '&value=' + value , function(data) {
    if (refresh)
    {
      $("#" + infoID).text("OK!");
      RefreshPage(0, true);
    }
    else
      $("#" + infoID).text("Wert wird noch an Gerät übertragen und erst verzögert hier dargestellt.");
  });
});

// Ein Button, bei dessen drücken ein Wert an die ID übertragen wird.
$("[id^=setNumberButton]").live("click", function(){
  dataID = $(this).data("id");  // Homematic Geräte ID.
  refresh = $(this).data("refresh");  // Hinweis, ob ein Refresh stattfinden soll.
  valueID = "setValue_" + dataID; // Wertfeld, dessen Inhalt gesetzt werden soll.
  infoID = "info_" + dataID;  // Info Textfeld neben Button.
  value = $("#" + valueID).val(); // Wert aus Wertfeld auslesen.
  factor = $("#" + valueID).data("factor"); // Factor auslesen.

  valueDivided = parseFloat(value) / factor;
  $("#" + infoID).text("Übertrage...");
  $.getJSON('cgi/set.cgi?id=' + dataID + '&value=' + valueDivided, function(data) {
    if (refresh)
    {
      $("#" + infoID).text("OK!");
      RefreshPage(0, true);
    }
    else
      $("#" + infoID).text("Wert wird noch an Gerät übertragen und erst verzögert hier dargestellt.");
  });
});

// Ein Button, bei dessen drücken ein Bool an die ID übertragen wird.
$("[id^=setBoolButton]").live("click", function(){
  dataID = $(this).data("id");  // Homematic Geräte ID.
  valueID = "setValue_" + dataID; // Wertfeld, dessen Inhalt gesetzt werden soll.
  infoID = "info_" + dataID;  // Info Textfeld neben Button.
  value = $("#" + valueID).val(); // Wert aus Wertfeld auslesen.

  $("#" + infoID).text("Übertrage...");
  $.getJSON('cgi/set.cgi?id=' + dataID + '&value=' + value, function(data) {
    $("#" + infoID).text("OK!");
    RefreshPage(0, true);
  });
});

// Ein Button, bei dessen drücken ein ValueList Item an die ID übertragen wird.
$("[id^=setValueListButton]").live("click", function(){
  dataID = $(this).data("id");  // Homematic Geräte ID.
  valueID = "setValue_" + dataID; // Wertfeld, dessen Inhalt gesetzt werden soll.
  infoID = "info_" + dataID;  // Info Textfeld neben Button.
  value = $("#" + valueID).val(); // Wert aus Wertfeld auslesen.

  $("#" + infoID).text("Übertrage...");
  $.getJSON('cgi/set.cgi?id=' + dataID + '&value=' + value, function(data) {
    $("#" + infoID).text("OK!");
    RefreshPage(0, true);
  });
});

// Ein Button, bei dessen drücken ein Bool an die ID übertragen wird.
$("[id^=setTextButton]").live("click", function(){
  dataID = $(this).data("id");  // Homematic Geräte ID.
  valueID = "setValue_" + dataID; // Wertfeld, dessen Inhalt gesetzt werden soll.
  infoID = "info_" + dataID;  // Info Textfeld neben Button.
  value = $("#" + valueID).val(); // Wert aus Wertfeld auslesen.
  // Alle " durch ' ersetzen, da sonst Probleme an verschiedenen Stellen:
  value = value.replace(/\"/g, "'");
  // Dann noch enocden, damit alles übertragen wird:
  value = encodeURIComponent(value);

  $("#" + infoID).text("Übertrage...");
  $.getJSON('cgi/set.cgi?id=' + dataID + '&value=' + value, function(data) {
    $("#" + infoID).text("OK!");
    RefreshPage(0, true);
  });
});

// Ein Button, bei dessen drücken ein "true" an die ID übertragen wird.
$("[id^=startProgramButton]").live("click", function(){
  dataID = $(this).data("id");  // Homematic Geräte ID.
  infoID = "info_" + dataID;  // Info Textfeld neben Button.

  $("#" + infoID).text("Starte...");
  $.getJSON('cgi/startprogram.cgi?id=' + dataID, function(data) {
    $("#" + infoID).text("OK!");
  });
});

// ----------------------- HTML Creation Helper ------------------------------

function AddSetButton(id, text, value, vorDate, onlyButton, noAction, refresh)
// Ein Button, bei dessen drücken ein Wert an die ID übertragen wird.
// onlyButton wird benutzt, wenn für das selbe Element mehrere Controls angezeigt werden sollen, aber nur einmal die Zusatzinfos. Z.B. Winmatic, Keymatic, Dimmer.
{
  html = "";
  if (!onlyButton)
    html = html + "<p class='ui-li-desc'>"

  if (noAction)
    html = html + "<a href='#' data-value='" + value + "' data-role='button' data-inline='true' data-theme='b'>" + text + "</a>";
  else
    html = html + "<a href='#' id='setButton_" + id + "' data-id='" + id + "' data-refresh='" + refresh + "' data-value='" + value + "' data-role='button' data-inline='true'>" + text + "</a>";

  if (!onlyButton)
    html = html + "<i>" + vorDate + "</i> <span id='info_" + id + "' class='valueOK'></span></p>";

  return html;
}

function AddStartProgramButton(id, text, vorDate)
// Ein Button, bei dessen drücken ein Programm ID ausgeführt wird.
{
  html = "<p class='ui-li-desc'><a href='#' id='startProgramButton_" + id + "' data-id='" + id + "' data-role='button' data-inline='true' data-icon='gear'>" + text + "</a></div>";
  html = html + "<i>" + vorDate + "</i> <span id='info_" + id + "' class='valueOK'></span></p>";
  return html;
}

function AddSetNumber(id, value, unit, min, max, step, factor, vorDate, refresh)
// Ein Slider und Button, bei dessen drücken der neue Wert an die ID übertragen wird.
// Factor wird für das Setzen verwendet, z.B. bei Jalousien muss 0-1 gesetzt werden, für die Anzeige
// ist aber 0 - 100 schöner.
//
// TODO: Was mit Float/Integer Unterscheidung? Slider evtl. aus, wenn der Bereich zu groß ist?
{
  html = "<div data-role='fieldcontain'>";
  html = html + "<input type='range' value='" + value * factor + "' min='" + min * factor + "' max='" + max * factor + "' step='" + step * factor + "' data-factor='" + factor + "' id='setValue_" + id + "' data-id='" + id + "' data-highlight='true' data-theme='d'/>";
  html = html + " (" + min * factor + " - " + max * factor + " " + unit + ") ";
  html = html + "<a href='#' id='setNumberButton_" + id + "' data-id='" + id + "' data-refresh='" + refresh + "' data-role='button' data-inline='true' data-icon='check'>Setzen</a>";
  html = html + "<i class='ui-li-desc'>" + vorDate + "</i> <span id='info_" + id + "' class='valueOK'></span>";
  html = html + "</div>";
  return html;
}

function AddSetBoolButtonList(valID, strValue, val0, val1, valUnit, vorDate, refresh)
{
  html = "<div data-role='fieldcontain'>";
  html = html + "<div data-role='controlgroup' data-type='horizontal'>";

  if (strValue == "false" || strValue == "")  // Leerstring heißt wohl auch false, z.B. bei Alarmzone.
  {
    theme = "data-theme = 'b'";
    idString = "";
  }
  else
  {
    theme = "";
    idString = "id='setButton_" + valID + "' data-id='" + valID + "' data-refresh='" + refresh + "'";
  }
  html = html + "<a href='#' " + idString + " data-value='false' data-role='button' data-inline='true' " + theme + ">" + val0 + "</a>";

  if (strValue == "true")
  {
    theme = "data-theme = 'b'";
    idString = "";
  }
  else
  {
    theme = "";
    idString = "id='setButton_" + valID + "' data-id='" + valID + "' data-refresh='" + refresh + "'";
  }
  html = html + "<a href='#' " + idString + " data-value='true' data-role='button' data-inline='true'" + theme + ">" + val1 + "</a>";

  html = html + "</div>";
  html = html + "</div>";
  html = html + " " + valUnit + " ";//<a href='#' id='setBoolButton_" + valID + "' data-id='" + valID + "' data-role='button' data-inline='true' data-icon='check'>Setzen</a>";
  html = html + "<i class='ui-li-desc'>" + vorDate + "</i> <span id='info_" + valID + "' class='valueOK'></span>";

  return html;
}

function AddSetBoolComboBox(valID, strValue, val0, val1, valUnit, vorDate)
{
  html = "<div data-role='fieldcontain'>";
  html = html + "<select id='setValue_" + valID + "' data-id='" + valID + "' data-native-menu='false' data-inline='true'>";
  if (strValue == "true")
    html = html + "<option value='false'>" + val0 + "</option><option selected value='true'>" + val1 + "</option>";
  else
    html = html + "<option selected value='false'>" + val0 + "</option><option value='true'>" + val1 + "</option>";
  html = html + "</select>";
  html = html + " " + valUnit + " <a href='#' id='setBoolButton_" + valID + "' data-id='" + valID + "' data-role='button' data-inline='true' data-icon='check'>Setzen</a>";
  html = html + "<i class='ui-li-desc'>" + vorDate + "</i> <span id='info_" + valID + "' class='valueOK'></span>";
  html = html + "</div>";

  return html;
}

function AddSetBoolSwitch(valID, strValue, val0, val1, valUnit, vorDate)
{
  html = "<div data-role='fieldcontain'>";
  html = html + "<div class='longerFlip'><select id='setValue_" + valID + "' data-id='" + valID + "' data-role='slider'>";
  if (strValue == "true")
    html = html + "<option value='false'>" + val0 + "</option><option selected value='true'>" + val1 + "</option>";
  else
    html = html + "<option selected value='false'>" + val0 + "</option><option value='true'>" + val1 + "</option>";
  html = html + "</select></div>";
  html = html + " " + valUnit + " <a href='#' id='setBoolButton_" + valID + "' data-id='" + valID + "' data-role='button' data-inline='true' data-icon='check'>Setzen</a>";
  html = html + "<i class='ui-li-desc'>" + vorDate + "</i> <span id='info_" + valID + "' class='valueOK'></span>";
  html = html + "</div>";

  return html;
}

function AddSetValueList(valID, strValue, valList, valUnit, vorDate, refresh)
{
  html = "<div data-role='fieldcontain'>";
  html = html + "<div data-role='controlgroup' data-type='horizontal'>";
  selIndex = parseInt(strValue);
  optionsArray = valList.split(";");
  for (i = 0; i < optionsArray.length; i++)
  {
    if (selIndex == i)
      html = html + "<a href='#' data-value='" + i + "' data-role='button' data-inline='true' data-theme='b'>" + optionsArray[i] + "</a>";
    else
      html = html + "<a href='#' id='setButton_" + valID + "' data-id='" + valID + "' data-refresh='" + refresh + "' data-value='" + i + "' data-role='button' data-inline='true'>" + optionsArray[i] + "</a>";
  }
  html = html + "</div>";
  html = html + "</div>";
  html = html + " " + valUnit + " "; //<a href='#' id='setValueListButton_" + valID + "' data-id='" + valID + "' data-role='button' data-inline='true' data-icon='check'>Setzen</a>";
  html = html + "<i class='ui-li-desc'>" + vorDate + "</i> <span id='info_" + valID + "' class='valueOK'></span>";

  return html;
}

function AddSetText(valID, val, valUnit, vorDate)
{
  html = "<div data-role='fieldcontain'>";
  // Wichtig sind hier "" für die Strings, weil da keine " vorkommen können, aber ':
  html = html + "<input type='text' id='setValue_" + valID + "' data-id='" + valID + "' value=\"" + val + "\" style='width:20em; display:inline-block;'/>";
  html = html + " " + valUnit + " <a href='#' id='setTextButton_" + valID + "' data-id='" + valID + "' data-role='button' data-inline='true' data-icon='check'>Setzen</a>";
  html = html + "<i class='ui-li-desc'>" + vorDate + "</i> <span id='info_" + valID + "' class='valueOK'></span>";
  html = html + "</div>";
  return html;
}

// ----------------------- Helper functions ----------------------------

function GetDateFromString(strDate)
{
  var dy = strDate.substring(0,2);
  var mn = strDate.substring(3,5) - 1; // -1, da 0 basiert.
  var yr = strDate.substring(6,10);
  var hr  = strDate.substring(11,13);
  var mi = strDate.substring(14,16);
  var sc  = strDate.substring(17,19);
  return new Date(yr, mn, dy, hr, mi, sc);
}

function GetTimeDiffString(diffDate, systemDate)
{
  dateTimeSystem = GetDateFromString(systemDate);
  dateTimeDiff = GetDateFromString(diffDate);
  timeDiff = (dateTimeSystem - dateTimeDiff) / 1000;  // In Sekunden konvertieren.

  if (timeDiff < 60)
    return "Vor " + Math.floor(timeDiff + 0.5) + " Sekunde/n";
  else if (timeDiff < 60*60)
    return "Vor " + Math.floor(timeDiff / 60 + 0.5) + " Minute/n";
  else if (timeDiff < 60*60*24)
    return "Vor " + Math.floor(timeDiff / (60 * 60) + 0.5) + " Stunde/n";
  else if (timeDiff < 60*60*24*30.5)
    return "Vor " + Math.floor(timeDiff / (60 * 60 * 24) + 0.5) + " Tag/en";
  else if (timeDiff < 60*60*24*30.5*12)
    return "Vor " + Math.floor(timeDiff / (60 * 60 * 24 * 30.5) + 0.5) + " Monat/en";
  else
  {
    y = Math.floor(timeDiff / (60 * 60 * 24 * 30.5 * 12) + 0.5);
    if (y == 43)
      return "Noch nicht verändert";
    else
      return "Vor " + y + " Jahr/en";
  }
}

function GetErrorMessage(errType, error, errValue, deviceHssType)
{
  noError = false;  // Wird verwendet, wenn "Unbekannter Fehler" nicht angezeigt werden soll.
  txt = "";

  if (errType == "ALARMDP")
  {
    if (error == "CONFIG_PENDING") return "<span class='valueInfo'>Konfigurationsdaten werden übertragen</span>";
    if (error == "LOWBAT") return "<span class='valueWarning'>Batteriestand niedrig</span>";
    if (error == "STICKY_UNREACH") return "<span class='valueInfo'>Kommunikation war gestört</span>";
    if (error == "UNREACH") return "<span class='valueError'>Kommunikation zur Zeit gestört</span>";
  }  
  else if (errType == "HSSDP")
  {
    if (error == "LOWBAT")
      txt = "Batterie leer";
    else if (error == "ERROR")
    {
      if (deviceHssType == "CLIMATECONTROL_VENT_DRIVE")
      {
        if (errValue == 1)
          txt = "Ventilantrieb schwergängig oder blockiert";
        else if (errValue == 2)
          txt = "Ventilantrieb nicht montiert oder Stellbereich zu groß";
        else if (errValue == 3)
          txt = "Stellbereich zu klein";
        else if (errValue == 4)
          txt = "Störungsposition angefahren, Batterien nahezu entladen";
      }
      else if (deviceHssType == "DIMMER")
      {
        if (errValue >= 1)
          txt = "Lastfehler";
      }
      else if (deviceHssType == "KEYMATIC")
      {
        if (errValue == 1)
          txt = "Einkuppeln fehlgeschlagen";
        else if (errValue == 2)
          txt = "Motorlauf abgebrochen";
      }
      else if (deviceHssType == "WINMATIC")
      {
        if (errValue == 1)
          txt = "Fehler Drehantrieb";
        else if (errValue == 2)
          txt = "Fehler Kippantrieb";
      }
      else if (deviceHssType == "ROTARY_HANDLE_SENSOR" || deviceHssType == "SHUTTER_CONTACT" || deviceHssType == "MOTION_DETECTOR")
      {
        if (errValue >= 1)
          txt = "Sabotage ausgelöst";
      }
    }
    else if (error == "ERROR_REDUCED")
    {
      if (errValue)
        txt = "Reduzierte Leistung";
      else
        noError = true;
    }
    else if (error == "ERROR_OVERLOAD")
    {
      if (errValue)
        txt = "Strom-Überlastung";
      else
        noError = true;
    }
    else if (error == "ERROR_OVERHEAT")
    {
      if (errValue)
        txt = "Überhitzung";
      else
        noError = true;
    }
    else if (error == "ERROR_POWER")
    {
      if (!errValue)
        txt = "Netzspannung fehlerhaft";
      else
        noError = true;
    }
    else if (error == "ERROR_SABOTAGE")
    {
      if (!errValue)
        txt = "Sabotage ausgelöst";
      else
        noError = true;
    }
    else if (error == "ERROR_BATTERY")
    {
      if (!errValue)
        txt = "Batterie fehlerhaft";
      else
        noError = true;
    }

    if (txt != "")
      txt = "<span class='valueError'>" + txt + "</span>";
  }
  
  // Konnte kein Text ermittelt werden, dann "Unbekannter Fehler" anzeigen:
  if (txt == "" && !noError)
    txt = "<span class='valueError'>Unbekannter Fehler: " + errValue + "</span>";
  return txt;
}

function ScrollToContentHeader()
{
  $('html, body').animate({scrollTop: $('#prim').offset().top - 60}, 200);
}

function ScrollToPosition(pos)
{
  $('html, body').animate({scrollTop: pos}, 200);
}

// ----------------------- Data loading functions ----------------------------

function loadData(url, oldScrollPos)
{
  if (oldScrollPos == -1)
    ScrollToContentHeader();

  // Listen leeren:
  $("#dataList").empty();
  $("#dataListHeader").empty();
  // "Lade..." anzeigen:
  $("#dataListHeader").append("<li><img src='img/misc/wait16.gif' width=12px height=12px class='ui-li-icon'>Lade...</li>");
  $("#dataListHeader").listview("refresh");
  // Icon Animation in Refresh Button:
  $('#buttonRefresh .ui-btn-text').html("<img src='img/misc/wait16.gif' width=12px height=12px>");

  $.getJSON(url, function(data) {
    systemDate = data['date'];

    $.each(data.entries, function(i, device) {
      deviceHTML = "<li class='dataListItem' id='" + device['id'] + "'><h2 class='ui-li-heading'>" + device['name'] + "</h2>";
      if (device['type'] == "CHANNEL")
      {
        deviceHssType = device['hssType'];
        /*if (deviceHssType == "ROTARY_HANDLE_SENSOR")
          deviceHTML = deviceHTML + "<img src='../../config/img/devices/250/17_hm-sec-rhs.png' class='ui-li-thumbnail'/>";
        else if (deviceHssType == "POWER")
          deviceHTML = deviceHTML + "<img src='../../config/img/devices/250/24_hm-cen-3-1.png' class='ui-li-thumbnail'/>";
        else if (deviceHssType == "CLIMATECONTROL_VENT_DRIVE")
          deviceHTML = deviceHTML + "<img src='../../config/img/devices/250/43_hm-cc-vd.png' class='ui-li-thumbnail'/>";
        else if (deviceHssType == "CLIMATECONTROL_REGULATOR")
          deviceHTML = deviceHTML + "<img src='../../config/img/devices/250/42_hm-cc-tc.png' class='ui-li-thumbnail'/>";
        else if (deviceHssType == "WEATHER")
          deviceHTML = deviceHTML + "<img src='../../config/img/devices/250/TH_CS.png' class='ui-li-thumbnail'/>";
        else if (deviceHssType == "SMOKE_DETECTOR_TEAM")
          deviceHTML = deviceHTML + "<img src='../../config/img/devices/250/52_hm-sec-sd-team.png' class='ui-li-thumbnail'/>";
        else if (deviceHssType == "SMOKE_DETECTOR")
          deviceHTML = deviceHTML + "<img src='../../config/img/devices/250/51_hm-sec-sd.png' class='ui-li-thumbnail'/>";
        else if (deviceHssType == "SWITCH")
          deviceHTML = deviceHTML + "<img src='../../config/img/devices/250/3_hm-lc-sw4-sm.png' class='ui-li-thumbnail'/>";*/

        //deviceHTML = deviceHTML + "<img src='img/types/" + deviceHssType + ".png' class='ui-li-thumbnail'>";
        $.each(device.channels, function(j, channel) {
          type = channel['type'];

          if (type == "HSSDP")
          {
            channelID = channel['id'];
            hssType = channel['hssType'];
            channelDate = channel['date'];
            vorDate = GetTimeDiffString(channelDate, systemDate);
            valString = channel['value'];
            valFloat = parseFloat(channel['value']);
            valBool = (valString == "true");
            if (hssType == "STATE")
            {
              canBeSet = false;
              stateText = "valFloat: " + valFloat + ", valString: " + valString;
              if (deviceHssType == "SHUTTER_CONTACT")
              {
                //if (valString == "true") deviceHTML = deviceHTML + "<a href='#' data-role='button' data-inline='true' data-theme='b'>Offen</a>";
                //else deviceHTML = deviceHTML + "<a href='#' data-role='button' data-inline='true' data-theme='b'>Geschlossen</a>";
              
                if (valString == "true") stateText = "<span class='valueError'>Offen</span>";
                else stateText = "<span class='valueOK'>Geschlossen</span>";
              }
              else if (deviceHssType == "SMOKE_DETECTOR_TEAM")
              {
                if (valString == "true") stateText = "<span class='valueError'>Gefahr</span>";
                else stateText = "<span class='valueOK'>O.K.</span>";
              }
              else if (deviceHssType == "TILT_SENSOR")
              {
                if (valString == "true") stateText = "<span class='valueWarning'>Offen</span>";
                else stateText = "<span class='valueOK'>Geschlossen</span>";
              }
              else if (deviceHssType == "WATERDETECTIONSENSOR")
              {
                if (valFloat == 0) stateText = "<span class='valueOK'>Trocken</span>";
                if (valFloat == 1) stateText = "<span class='valueWarning'>Feucht</span>";
                if (valFloat == 2) stateText = "<span class='valueError'>Nass</span>";
              }
              else if (deviceHssType == "ROTARY_HANDLE_SENSOR")
              {
                if (valFloat == 0) stateText = "<span class='valueOK'>Geschlossen</span>";
                if (valFloat == 1) stateText = "<span class='valueWarning'>Gekippt</span>";
                if (valFloat == 2) stateText = "<span class='valueError'>Offen</span>";
              }
              else if (deviceHssType == "KEYMATIC")
              {
                canBeSet = true;
                txtOn = "Auf";
                txtOff = "Zu";
              }
              else if (deviceHssType == "SWITCH")
              {
                canBeSet = true;
                txtOn = "Ein";
                txtOff = "Aus";
              }
              else if (deviceHssType == "ALARMACTUATOR")
              {
                canBeSet = true;
                txtOn = "Ein";
                txtOff = "Aus";
              }
              else if (deviceHssType == "DIGITAL_OUTPUT")
              {
                canBeSet = true;
                txtOn = "Ein";
                txtOff = "Aus";
              }
              else if (deviceHssType == "DIGITAL_ANALOG_OUTPUT")
              {
                canBeSet = true;
                txtOn = "Ein";
                txtOff = "Aus";
              }
              else if (deviceHssType == "DIGITAL_INPUT")
              {
                if (valFloat == "true") stateText = "Ein";
                else stateText = "Aus";
              }
              else
              {
                if (valFloat == "true") stateText = "Aus";
                else stateText = "Ein";
              }

              if (canBeSet)
              {
                deviceHTML = deviceHTML + AddSetBoolButtonList(channel['id'], valString, txtOff, txtOn, "", vorDate, true);
  /*              deviceHTML = deviceHTML + "<div class='longerFlip'>";
                deviceHTML = deviceHTML + "<select id='slider_" + channel['id'] + "' data-role='slider'>";
                if (valString == "true")
                {
                  deviceHTML = deviceHTML + "<option value='off'>" + txtOff + "</option><option selected='on'>" + txtOn + "</option>";
                }
                else
                {
                  deviceHTML = deviceHTML + "<option selected='off'>" + txtOff + "</option><option value='on'>" + txtOn + "</option>";
                }
                deviceHTML = deviceHTML + "</select></div><br><i class='ui-li-desc'>" + vorDate + "</i>";*/
              }
              else
              {
                deviceHTML = deviceHTML + "<p class='ui-li-desc'><img src='img/channels/unknown.png' style='max-height:20px'><span class='valueInfo'>" + stateText + " </span><span><i>" + vorDate + "</i></span></p>";
              }
            }
            else if (hssType == "VALUE")
            {
              deviceHTML = deviceHTML + "<p class='ui-li-desc'><img src='img/channels/unknown.png' style='max-height:20px'><span class='valueInfo'>" + valString + " </span> <span><i>" + vorDate + "</i></span></p>";
            }
            else if (hssType == "SENSOR" && deviceHssType == "SENSOR")
            {
              if (valString == "true") stateText = "<span class='valueError'>Offen</span>";
              else stateText = "<span class='valueOK'>Geschlossen</span>";
              deviceHTML = deviceHTML + "<p class='ui-li-desc'><img src='img/channels/unknown.png' style='max-height:20px'><span class='valueInfo'>" + stateText + " </span><span><i>" + vorDate + "</i></span></p>";
            }
            else if (hssType == "PRESS_SHORT")
            {
              deviceHTML = deviceHTML + AddSetButton(channel['id'], "Kurzer Tastendruck", true, vorDate, false, false, true);
              //deviceHTML = deviceHTML + "<p class='ui-li-desc'><a href='#' id='buttonShort_" + channel['id'] + "' data-role='button' data-inline='true'>Kurzer Tastendruck</a></div>";
              //deviceHTML = deviceHTML + "<i>" + vorDate + "</i></p>";
            }
            else if (hssType == "PRESS_LONG")
            {
              deviceHTML = deviceHTML + AddSetButton(channel['id'], "Langer Tastendruck", true, vorDate, false, false, true);
              //deviceHTML = deviceHTML + "<p class='ui-li-desc'><a href='#' id='buttonLong_" + channel['id'] + "' data-role='button' data-inline='true'>Langer Tastendruck</a>";
              //deviceHTML = deviceHTML + "<i>" + vorDate + "</i></p>";
            }
            else if (hssType == "SETPOINT")
            {
              //deviceHTML = deviceHTML + "<p class='ui-li-desc'><img src='img/channels/setpoint.png' style='max-height:20px'><input type='text' id='inputText_" + channel['id'] + "' data-id='" + channel['id'] + "' value='" + valFloat + "' style='width:5em; display:inline-block;'/><a href='#' id='setText_" + channel['id'] + "' data-id='" + channel['id'] + "' data-role='button' data-inline='true' data-icon='check'>Setzen</a> <i>" + vorDate + "</i></p>";
              deviceHTML = deviceHTML + AddSetNumber(channelID, valFloat, "°", 6, 30, 0.5, 1.0, vorDate, false);
              lowTemp = valFloat - 3.0;
              highTemp = lowTemp + 6.0;
              if (lowTemp < 6.0)
              {
                lowTemp = 6.0;
                highTemp = 11.0;
              }
              if (highTemp > 30.0)
              {
                lowTemp = 25.0;
                highTemp = 30.0;
              }
              deviceHTML = deviceHTML + "<div data-role='controlgroup' data-type='horizontal'>";
              for (i = lowTemp; i <= highTemp; i += 1.0)
                deviceHTML = deviceHTML + AddSetButton(channelID, i + "°", i, vorDate, true, i == valFloat, false);
              deviceHTML = deviceHTML + "</div>";
            }
            else if (hssType == "TEMPERATURE")
            {
              deviceHTML = deviceHTML + "<p class='ui-li-desc'><img src='img/channels/temperature.png' style='max-height:20px'><span class='valueInfo'>" + valFloat + " ° </span>Temperatur | <span><i>" + vorDate + "</i></span></p>";
            }
            else if (hssType == "HUMIDITY")
            {
              deviceHTML = deviceHTML + "<p class='ui-li-desc'><img src='img/channels/humidity.png' style='max-height:20px'><span class='valueInfo'>" + valFloat + " % </span>Luftfeuchtigkeit | <span><i>" + vorDate + "</i></span></p>";
            }
            else if (hssType == "VALVE_STATE")
            {
              deviceHTML = deviceHTML + "<p class='ui-li-desc'><img src='img/channels/valvestate.png' style='max-height:20px'><span class='valueInfo'>" + valFloat + " % </span>Ventilöffnung | <span><i>" + vorDate + "</i></span></p>";
            }
            else if (hssType == "BRIGHTNESS")
            {
              deviceHTML = deviceHTML + "<p class='ui-li-desc'><img src='img/channels/unknown.png' style='max-height:20px'><span class='valueInfo'>" + valFloat + " </span>Helligkeit | <span><i>" + vorDate + "</i></span></p>";
            }
            else if (hssType == "MOTION")
            {
              if (valString == "true")
                txt = "<span class='valueWarning'>Bewegung </span>";
              else
                txt = "<span class='valueOK'>Keine Bewegung </span>";
              deviceHTML = deviceHTML + "<p class='ui-li-desc'><img src='img/channels/unknown.png' style='max-height:20px'>" + txt + "<span><i>" + vorDate + "</i></span></p>";
            }
            else if (hssType == "LEVEL" && deviceHssType == "BLIND")
            {
              deviceHTML = deviceHTML + AddSetNumber(channelID, valFloat, "%", 0.0, 1.0, 0.01, 100.0, vorDate + " | -0.005% = Verriegelt, 0% = Geschlossen, 100% = Offen", true);
              deviceHTML = deviceHTML + "<div data-role='controlgroup' data-type='horizontal'>";
              deviceHTML = deviceHTML + AddSetButton(channelID, "Zu", 0.0, vorDate, true, valFloat == 0.0, true);
              deviceHTML = deviceHTML + AddSetButton(channelID, "20%", 0.2, vorDate, true, valFloat == 0.2, true);
              deviceHTML = deviceHTML + AddSetButton(channelID, "40%", 0.4, vorDate, true, valFloat == 0.4, true);
              deviceHTML = deviceHTML + AddSetButton(channelID, "60%", 0.6, vorDate, true, valFloat == 0.6, true);
              deviceHTML = deviceHTML + AddSetButton(channelID, "80%", 0.8, vorDate, true, valFloat == 0.8, true);
              deviceHTML = deviceHTML + AddSetButton(channelID, "Auf", 1.0, vorDate, true, valFloat == 1.0, true);
              deviceHTML = deviceHTML + "</div>";
            }
            else if (hssType == "STOP" && deviceHssType == "BLIND")
            {
              deviceHTML = deviceHTML + AddSetButton(channelID, "Stop", true, vorDate, false, false, true);
            }
            else if (hssType == "OPEN" && deviceHssType == "KEYMATIC")
            {
              deviceHTML = deviceHTML + AddSetButton(channelID, "Öffnen", true, vorDate, false, false, true);
            }
            else if (hssType == "LEVEL" && deviceHssType == "WINMATIC")
            {
              deviceHTML = deviceHTML + AddSetNumber(channelID, valFloat, "%", 0.0, 1.0, 0.01, 100.0, vorDate + " | 0% = Geschlossen, 100% = Offen", true);
              deviceHTML = deviceHTML + "<div data-role='controlgroup' data-type='horizontal'>";
              deviceHTML = deviceHTML + AddSetButton(channelID, "Verriegeln", -0.005, vorDate, true, valFloat == -0.005, true);
              deviceHTML = deviceHTML + AddSetButton(channelID, "Zu", 0.0, vorDate, true, valFloat == 0.0, true);
              deviceHTML = deviceHTML + AddSetButton(channelID, "20%", 0.2, vorDate, true, valFloat == 0.2, true);
              deviceHTML = deviceHTML + AddSetButton(channelID, "40%", 0.4, vorDate, true, valFloat == 0.4, true);
              deviceHTML = deviceHTML + AddSetButton(channelID, "60%", 0.6, vorDate, true, valFloat == 0.6, true);
              deviceHTML = deviceHTML + AddSetButton(channelID, "80%", 0.8, vorDate, true, valFloat == 0.8, true);
              deviceHTML = deviceHTML + AddSetButton(channelID, "Auf", 1.0, vorDate, true, valFloat == 1.0, true);
              deviceHTML = deviceHTML + "</div>";
            }
            else if (hssType == "STOP" && deviceHssType == "WINMATIC")
            {
              deviceHTML = deviceHTML + AddSetButton(channelID, "Stop", true, vorDate, false), true;
            }
            else if (hssType == "LEVEL" && deviceHssType == "AKKU")
            {
              deviceHTML = deviceHTML + "<p class='ui-li-desc'><img src='img/channels/unknown.png' style='max-height:20px'><span class='valueInfo'>" + valFloat * 100.0 + " % </span>Batterieladung | <span><i>" + vorDate + "</i></span></p>";
            }
            else if (hssType == "LEVEL" && deviceHssType == "DIMMER")
            {
              deviceHTML = deviceHTML + AddSetNumber(channelID, valFloat, "%", 0.0, 1.0, 0.01, 100.0, vorDate + " | 0% = Aus, 100% = An", true);
              deviceHTML = deviceHTML + "<div data-role='controlgroup' data-type='horizontal'>";
              deviceHTML = deviceHTML + AddSetButton(channelID, "Aus", 0.0, vorDate, true, valFloat == 0.0, true);
              deviceHTML = deviceHTML + AddSetButton(channelID, "20%", 0.2, vorDate, true, valFloat == 0.2, true);
              deviceHTML = deviceHTML + AddSetButton(channelID, "40%", 0.4, vorDate, true, valFloat == 0.4, true);
              deviceHTML = deviceHTML + AddSetButton(channelID, "60%", 0.6, vorDate, true, valFloat == 0.6, true);
              deviceHTML = deviceHTML + AddSetButton(channelID, "80%", 0.8, vorDate, true, valFloat == 0.8, true);
              deviceHTML = deviceHTML + AddSetButton(channelID, "An", 1.0, vorDate, true, valFloat == 1.0, true);
              deviceHTML = deviceHTML + "</div>";
            }
            else if(hssType == "U_SOURCE_FAIL" && deviceHssType == "POWER")
            {
              if (valString == "false")
                txt = "<span class='valueNoError'>Netzbetrieb</span>";
              else
                txt = "<span class='valueError'>Batteriebetrieb</span>";
              deviceHTML = deviceHTML + "<p class='ui-li-desc'><img src='img/channels/unknown.png' style='max-height:20px'>" + txt + " <span><i>" + vorDate + "</i></span></p>";
            }
            else if(hssType == "LOWBAT" && deviceHssType == "POWER")
            {
              if (valString == "false")
                txt = "<span class='valueOK'>Batterie OK</span>";
              else
                txt = "<span class='valueError'>Batterie leer</span>";
              deviceHTML = deviceHTML + "<p class='ui-li-desc'><img src='img/channels/unknown.png' style='max-height:20px'>" + txt + " <span><i>" + vorDate + "</i></span></p>";
            }
            else if(hssType == "U_USBD_OK" && deviceHssType == "POWER")
            {
              if (valString == "false")
                txt = "<span class='valueNoError'>USB nicht aktiv</span>";
              else
                txt = "<span class='valueOK'>USB aktiv</span>";
              deviceHTML = deviceHTML + "<p class='ui-li-desc'><img src='img/channels/unknown.png' style='max-height:20px'>" + txt + " <span><i>" + vorDate + "</i></span></p>";
            }
            else if(hssType == "BAT_LEVEL" && deviceHssType == "POWER")
            {
              deviceHTML = deviceHTML + "<p class='ui-li-desc'><img src='img/channels/unknown.png' style='max-height:20px'><span class='valueInfo'>" + valFloat * 100.0 + " % </span>Batterieladung | <span><i>" + vorDate + "</i></span></p>";
            }
            else if (hssType == "STATUS" && deviceHssType == "AKKU")
            {
              if (valFloat == 0)
                txt = "<span class='valueNoError'>Erhaltungsladung</span>";
              else if (valFloat == 1)
                txt = "<span class='valueNoError'>Akku lädt</span>";
              else if (valFloat == 2)
                txt = "<span class='valueNoError'>Versorgung durch Akku</span>";
              else
                txt = "<span class='valueWarning'>Status unbekannt</span>";
              deviceHTML = deviceHTML + "<p class='ui-li-desc'><img src='img/channels/unknown.png' style='max-height:20px'>" + txt + " <span><i>" + vorDate + "</i></span></p>";
            }
            else if (hssType == "STATE_UNCERTAIN")
            {
              if (valString == "true") txt = "<span class='valueWarning'>Zustand unbestimmt</span>";
              else txt = "<span class='valueNoError'>Zustand OK</span>";
              deviceHTML = deviceHTML + "<p class='ui-li-desc'><img src='img/channels/unknown.png' style='max-height:20px'>" + txt + " <span><i>" + vorDate + "</i></span></p>";
            }
            else if (hssType == "ERROR" || hssType.substring(0, 6) == "ERROR_")
            {
              if ((hssType == "ERROR" && valFloat > 0) || hssType.substring(0, 6) == "ERROR_")
              {
                if (hssType == "ERROR")
                  v = valFloat;
                else
                  v = valBool;
                txt = GetErrorMessage("HSSDP", hssType, v, deviceHssType);
                if (txt != "")
                  deviceHTML = deviceHTML + "<p class='ui-li-desc'><img src='img/channels/unknown.png' style='max-height:20px'>" + txt + " <span><i>" + vorDate + "</i></span></p>";
              }
            }
            else if (hssType == "ON_TIME" || hssType == "INHIBIT" || hssType == "ADJUSTING_COMMAND" || hssType == "ADJUSTING_DATA" || hssType == "RELOCK_DELAY" || hssType == "SPEED" || hssType == "LEVEL" || hssType == "RAMP_STOP" || hssType == "RAMP_TIME" || hssType == "OLD_LEVEL")
            {
              ; // Don't show.
            }
            else
            {
              deviceHTML = deviceHTML + "<p class='ui-li-desc'><img src='img/channels/unknown.png' style='max-height:20px'><span class='valueInfo'>" + valString + " </span>" + channel['hssType'] + " | <span><i>" + vorDate + "</i></span></p>";
            }
          }
          else if (type == "VARDP")
          {
            valName  = channel['name'];
            valID    = channel['id'];
            valInfo  = channel['info'];
            strValue = channel['value'];
            valType  = channel['valueType'];
            valUnit  = channel['valueUnit'];
            val0     = channel['valueName0'];
            val1     = channel['valueName1'];
            valMin   = channel['valueMin'];
            valMax   = channel['valueMax'];
            valList  = channel['valueList'];
            channelDate = channel['date'];
            vorDate = GetTimeDiffString(channelDate, systemDate);

            // <br> davor, weil es an der Stelle eine mit Gerät verknüpfte Variable ist:
            deviceHTML = deviceHTML + "<br><h2 class='ui-li-heading'>" + channel['name'] + "</h2>";
            // Wenn die Variable hinten (r) hat, dann ist sie Read-Only in den Favoriten:
            readOnly = false;
            if (valInfo.length >= 3)
            {
              lastThree = valInfo.substring(valInfo.length - 3, valInfo.length);
              if (lastThree == "(R)" || lastThree == "(r)")
              {
                readOnly = true;
                //valInfo = valInfo.substring(0, valInfo.length - 3); // Für Anzeige dann gleich das (R) weg.
              }
            }

            deviceHTML = deviceHTML + "<p>" + valInfo + "</p>";
            if (readOnly)
            {
              // Bestimmen, wie der sichtbare Werte aussehen soll:
              visVal = "";
              if (valType == "2")
              {
                // Bool.
                if (strValue == "true")
                  visVal = val1;
                else
                  visVal = val0;
              }
              else if (valType == "4")
                // Float, Integer.
                visVal = parseFloat(strValue);
              else if (valType == "16")
              {
                // Liste.
                optionsArray = valList.split(";");
                visVal = optionsArray[parseInt(strValue)];
              }
              else
                // String oder unbekannt.
                visVal = strValue;

              deviceHTML = deviceHTML + "<p><img src='img/channels/unknown.png' style='max-height:20px'><span class='valueInfo'>" + visVal + " " + valUnit + " </span></p><i class='ui-li-desc'>" + vorDate + "</i>";
            }
            else
            {
              if (valType == "2")
                // Bool.
                deviceHTML = deviceHTML + AddSetBoolButtonList(valID, strValue, val0, val1, valUnit, vorDate, true);
              else if (valType == "4")
                // Float, Integer.
                deviceHTML = deviceHTML + AddSetNumber(valID, strValue, valUnit, valMin, valMax, 0.001, 1.0, vorDate, true);
              else if (valType == "16")
                // Liste.
                deviceHTML = deviceHTML + AddSetValueList(valID, strValue, valList, valUnit, vorDate, true);
              else if (valType == "20")
                deviceHTML = deviceHTML + AddSetText(valID, strValue, valUnit, vorDate);
              else
                deviceHTML = deviceHTML + "Unbekannter Variablentyp!";
            }
          }
        });
      }
      else if (device['type'] == "VARDP")
      {
        valName  = device['name'];
        valID    = device['id'];
        valInfo  = device['info'];
        strValue = device['value'];
        valType  = device['valueType'];
        valUnit  = device['valueUnit'];
        val0     = device['valueName0'];
        val1     = device['valueName1'];
        valMin   = device['valueMin'];
        valMax   = device['valueMax'];
        valList  = device['valueList'];
        channelDate = device['date'];
        vorDate = GetTimeDiffString(channelDate, systemDate);
        // Wenn die Variable hinten (r) hat, dann ist sie Read-Only in den Favoriten:
        readOnly = false;
        if (valInfo.length >= 3)
        {
          lastThree = valInfo.substring(valInfo.length - 3, valInfo.length);
          if (lastThree == "(R)" || lastThree == "(r)")
          {
            readOnly = true;
            //valInfo = valInfo.substring(0, valInfo.length - 3); // Für Anzeige dann gleich das (R) weg.
          }
        }

        deviceHTML = deviceHTML + "<p>" + valInfo + "</p>";
        if (readOnly)
        {
          // Bestimmen, wie der sichtbare Werte aussehen soll:
          visVal = "";
          if (valType == "2")
          {
            // Bool.
            if (strValue == "true")
              visVal = val1;
            else
              visVal = val0;
          }
          else if (valType == "4")
            // Float, Integer.
            visVal = parseFloat(strValue);
          else if (valType == "16")
          {
            // Liste.
            optionsArray = valList.split(";");
            visVal = optionsArray[parseInt(strValue)];
          }
          else
            // String oder unbekannt.
            visVal = strValue;

          deviceHTML = deviceHTML + "<p><img src='img/channels/unknown.png' style='max-height:20px'><span class='valueInfo'>" + visVal + " " + valUnit + " </span></p><i class='ui-li-desc'>" + vorDate + "</i>";
        }
        else
        {
          if (valType == "2")
            // Bool.
            deviceHTML = deviceHTML + AddSetBoolButtonList(valID, strValue, val0, val1, valUnit, vorDate, true);
          else if (valType == "4")
            // Float, Integer.
            deviceHTML = deviceHTML + AddSetNumber(valID, strValue, valUnit, valMin, valMax, 0.001, 1.0, vorDate, true);
          else if (valType == "16")
            // Liste.
            deviceHTML = deviceHTML + AddSetValueList(valID, strValue, valList, valUnit, vorDate, true);
          else if (valType == "20")
            deviceHTML = deviceHTML + AddSetText(valID, strValue, valUnit, vorDate);
          else
            deviceHTML = deviceHTML + "Unbekannter Variablentyp!";
        }
      }
      else if (device['type'] == "PROGRAM")
      {
        prgID = device['id'];
        prgName = device['name'];
        prgInfo = device['info'];
        prgDate = device['date'];
        vorDate = GetTimeDiffString(prgDate, systemDate);

        deviceHTML = deviceHTML + "<p>" + prgInfo + "</p>";
        deviceHTML = deviceHTML + AddStartProgramButton(prgID, "Ausführen", vorDate);
      }
      deviceHTML = deviceHTML + "</li>";
      $("#dataList").append(deviceHTML);
    });
    // "Lade..." wieder entfernen und Überschrift anzeigen:
    $("#dataListHeader").empty();
    $("#dataListHeader").append("<li data-role='list-divider' role='heading'>" + data['name'] + "<p style='float:right;'>" + systemDate + "</p></li>");
    $("#dataListHeader").listview("refresh");

    // Animated Icon aus Refresh wieder entfernen:
    $('#buttonRefresh .ui-btn-text').html("&nbsp;");

    $("#dataList").listview("refresh");
    $("#dataList").trigger("create");
    $("[id^=button]").trigger("create");
    $("[id^=input]").trigger("create");

    if (oldScrollPos == -1)
      ScrollToContentHeader();
    else
      ScrollToPosition(oldScrollPos);
  });
}

function loadVariables(oldScrollPos)
{
  if (oldScrollPos == -1)
    ScrollToContentHeader();

  $("#dataList").empty();
  $("#dataListHeader").empty();
  // "Lade..." anzeigen:
  $("#dataListHeader").append("<li><img src='img/misc/wait16.gif' width=12px height=12px class='ui-li-icon'>Lade...</li>");
  $("#dataListHeader").listview("refresh");
  // Icon Animation in Refresh Button:
  $('#buttonRefresh .ui-btn-text').html("<img src='img/misc/wait16.gif' width=12px height=12px>");

  $.getJSON('cgi/systemvariables.cgi', function(data) {
    systemDate = data['date'];
    $.each(data.entries, function(i, variable) {
      valID    = variable['id'];
      valName  = variable['name'];
      valInfo  = variable['info'];
      strValue = variable['value'];
      valType  = variable['valueType'];
      valUnit  = variable['valueUnit'];
      val0     = variable['valueName0'];
      val1     = variable['valueName1'];
      valMin   = variable['valueMin'];
      valMax   = variable['valueMax'];
      valList  = variable['valueList'];
      channelDate = variable['date'];
      vorDate = GetTimeDiffString(channelDate, systemDate);
      contentString = "<li class='dataListItem' id='" + valID + "'><h2 class='ui-li-heading'>" + valName + "</h2>";

      contentString = contentString + "<p>" + valInfo + "</p>";

      // In der Variablenliste editieren zulassen:
      //if (valName.charAt(valName.length - 1) == "_")
      //  contentString = contentString + "<p class='ui-li-desc'><img src='img/channels/unknown.png' style='max-height:20px'><span class='valueInfo'>" + strValue + " " + valUnit + " </span><span><i>" + vorDate + "</i></span></p>";
      //else
      {
        if (valType == "2")
          // Bool.
          contentString = contentString + AddSetBoolButtonList(valID, strValue, val0, val1, valUnit, vorDate, true);
        else if (valType == "4")
          // Float, Integer.
          contentString = contentString + AddSetNumber(valID, strValue, valUnit, valMin, valMax, 0.001, 1.0, vorDate, true);
        else if (valType == "16")
          // Liste.
          contentString = contentString + AddSetValueList(valID, strValue, valList, valUnit, vorDate, true);
        else if (valType == "20")
          contentString = contentString + AddSetText(valID, strValue, valUnit, vorDate);
        else
          contentString = contentString + "Unbekannter Variablentyp!";
      }
      contentString = contentString + "</li>";
      $("#dataList").append(contentString);
  });

  // "Lade..." wieder entfernen und Überschrift anzeigen:
  $("#dataListHeader").empty();
  $("#dataListHeader").append("<li data-role='list-divider' role='heading'>Systemvariablen<p style='float:right;'>" + systemDate + "</p></li>").listview("refresh");
  $("#dataListHeader").listview("refresh");

  // Animated Icon aus Refresh wieder entfernen:
  $('#buttonRefresh .ui-btn-text').html("&nbsp;");

  $("#dataList").listview("refresh");
  $("#dataList").trigger("create");

    if (oldScrollPos == -1)
      ScrollToContentHeader();
    else
      ScrollToPosition(oldScrollPos);
  });
}

function loadPrograms(oldScrollPos)
{
  if (oldScrollPos == -1)
    ScrollToContentHeader();

  $("#dataList").empty();
  $("#dataListHeader").empty();
  // "Lade..." anzeigen:
  $("#dataListHeader").append("<li><img src='img/misc/wait16.gif' width=12px height=12px class='ui-li-icon'>Lade...</li>");
  $("#dataListHeader").listview("refresh");
  // Icon Animation in Refresh Button:
  $('#buttonRefresh .ui-btn-text').html("<img src='img/misc/wait16.gif' width=12px height=12px>");

  $.getJSON('cgi/programs.cgi', function(data) {
    systemDate = data['date'];
    $.each(data.entries, function(i, prog) {
      prgID = prog['id'];
      prgName = prog['name'];
      prgInfo = prog['info'];
      prgDate = prog['date'];
      vorDate = GetTimeDiffString(prgDate, systemDate);

      deviceHTML = "<li class='dataListItem' id='" + prgID + "'><h2 class='ui-li-heading'>" + prgName + "</h2><p>" + prgInfo + "</p>";
      deviceHTML = deviceHTML + AddStartProgramButton(prgID, "Ausführen", vorDate);
      deviceHTML = deviceHTML + "</li>";
      $("#dataList").append(deviceHTML);
    });

    // "Lade..." wieder entfernen und Überschrift anzeigen:
    $("#dataListHeader").empty();
    $("#dataListHeader").append("<li data-role='list-divider' role='heading'>Programme<p style='float:right;'>" + systemDate + "</p></li>").listview("refresh");
    $("#dataListHeader").listview("refresh");

    // Animated Icon aus Refresh wieder entfernen:
    $('#buttonRefresh .ui-btn-text').html("&nbsp;");

    $("#dataList").listview("refresh");
    $("#dataList").trigger("create");

    if (oldScrollPos == -1)
      ScrollToContentHeader();
    else
      ScrollToPosition(oldScrollPos);
  });
}

function loadGraphicIDs(oldScrollPos)
{
  if (oldScrollPos == -1)
    ScrollToContentHeader();

  $("#dataList").empty();
  $("#dataListHeader").empty();
  // "Lade..." anzeigen:
  $("#dataListHeader").append("<li><img src='img/misc/wait16.gif' width=12px height=12px class='ui-li-icon'>Lade...</li>");
  $("#dataListHeader").listview("refresh");
  // Icon Animation in Refresh Button:
  $('#buttonRefresh .ui-btn-text').html("<img src='img/misc/wait16.gif' width=12px height=12px>");

  $.getJSON('cgi/favorites.cgi', function(data) {
    $("#dataList").append("<li data-role='list-divider' role='heading'>Favoriten</li>");
    $.each(data, function(key, val) {
      $("#dataList").append("<li><img class='lazyFavoritesID' data-original='../webmatic_user/img/ids/favorites/" + key + ".png' src='img/menu/favorites.png' class='ui-li-thumbnail'><h1>" + val + "</h1><p>ID = " + key + ", Pfad = webmatic_user/img/ids/favorites/" + key + ".png</p></li>");
    });
    $("#dataList").listview("refresh");
    $("img.lazyFavoritesID").lazyload({event: "lazyLoadInstantly"});
    $("img").trigger("lazyLoadInstantly");

    $.getJSON('cgi/rooms.cgi', function(data) {
      $("#dataList").append("<li data-role='list-divider' role='heading'>Räume</li>");
      $.each(data, function(key, val) {
        $("#dataList").append("<li><img class='lazyRoomsID' data-original='../webmatic_user/img/ids/rooms/" + key + ".png' src='img/menu/rooms.png' class='ui-li-thumbnail'><h1>" + val + "</h1><p>ID = " + key + ", Pfad = webmatic_user/img/ids/rooms/" + key + ".png</p></li>");
      });
      $("#dataList").listview("refresh");
      $("img.lazyRoomsID").lazyload({event: "lazyLoadInstantly"});
      $("img").trigger("lazyLoadInstantly");

      $.getJSON('cgi/functions.cgi', function(data) {
        $("#dataList").append("<li data-role='list-divider' role='heading'>Gewerke</li>");
        $.each(data, function(key, val) {
          $("#dataList").append("<li><img class='lazyFunctionsID' data-original='../webmatic_user/img/ids/functions/" + key + ".png' src='img/menu/functions.png' class='ui-li-thumbnail'><h1>" + val + "</h1><p>ID = " + key + ", Pfad = webmatic_user/img/ids/functions/" + key + ".png</p></li>");
        });
        $("#dataList").listview("refresh");
        $("img.lazyFunctionsID").lazyload({event: "lazyLoadInstantly"});
        $("img").trigger("lazyLoadInstantly");

      });
    });

    // "Lade..." wieder entfernen und Überschrift anzeigen:
    $("#dataListHeader").empty();
    $("#dataListHeader").append("<li data-role='list-divider' role='heading'>Grafik IDs</li>");
    $("#dataListHeader").append("<li>Damit im Menu eigene Grafiken für Räume, Gewerke und Favoriten verwendet werden, müssen Grafiken mit der ID als Name in das Verzeichnis webmatic_user/img/ids eingespielt werden (z.B. <i>webmatic_user/img/ids/1436.png</i>). Die Grafiken sollten 80x80 Pixel groß sein (bzw. 160x160 für das iPad mit Retina Display) und brauchen das Format PNG. Man kann also auch mit Transparenz arbeiten. In dieser Liste kann man die IDs ablesen und auch sehen, ob bereits Grafiken vergeben wurden.</li>");
    $("#dataListHeader").listview("refresh");

    // Animated Icon aus Refresh wieder entfernen:
    $('#buttonRefresh .ui-btn-text').html("&nbsp;");

    $("#dataList").listview("refresh");
    $("#dataList").trigger("create");

    if (oldScrollPos == -1)
      ScrollToContentHeader();
    else
      ScrollToPosition(oldScrollPos);
  });
}

// ------------------------- Initial call after page loading ------------------------

$(document).ready(function() {
  // Disable all caching. Default in most browsers, but not in IE and Android (at least 2.2):
  $.ajaxSetup({ cache: false });

  $.getJSON('cgi/favorites.cgi', function(data) {
    $.each(data, function(key, val) {
      $("#listFavorites").append("<li class='menuListItem' id='" + key + "'><a href='#'><img class='lazyFavorites' data-original='../webmatic_user/img/ids/favorites/" + key + ".png' src='img/menu/favorites.png' class='ui-li-thumbnail'><span class='breakText'>" + val + "</span></a></li>");
    });
    $("#listFavorites").listview("refresh");
    $("img.lazyFavorites").lazyload({event: "lazyLoadInstantly"});
    $("img").trigger("lazyLoadInstantly");
  });

  $.getJSON('cgi/rooms.cgi', function(data) {
    $.each(data, function(key, val) {
      $("#listRooms").append("<li class='menuListItem' id='" + key + "'><a href='#'><img class='lazyRooms' data-original='../webmatic_user/img/ids/rooms/" + key + ".png' src='img/menu/rooms.png' class='ui-li-thumbnail'><span class='breakText'>" + val + "</span></a></li>");
    });
    $("#listRooms").listview("refresh");
    $("img.lazyRooms").lazyload({event: "lazyLoadInstantly"});
    $("img").trigger("lazyLoadInstantly");
  });

  $.getJSON('cgi/functions.cgi', function(data) {
    $.each(data, function(key, val) {
      $("#listFunctions").append("<li class='menuListItem' id='" + key + "'><a href='#'><img class='lazyFunctions' data-original='../webmatic_user/img/ids/functions/" + key + ".png' src='img/menu/functions.png' class='ui-li-thumbnail'><span class='breakText'>" + val + "</span></a></li>");
    });
    $("#listFunctions").listview("refresh");
    $("img.lazyFunctions").lazyload({event: "lazyLoadInstantly"});
    $("img").trigger("lazyLoadInstantly");
  });

  RefreshServiceMessages();

  // Update Timer loslaufen lassen:
  RestartTimer();
});
