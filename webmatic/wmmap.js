// Übersetzungen von HomeMatic IDs zu sprechenden Texten für alle
// Controls, die nicht direkt im webmatic.js abgehandelt werden.

var textMap = {
HUMIDITY:"Luftfeuchtigkeit",
TEMPERATURE:"Temperatur",
WIND_SPEED:"Windgeschwindigkeit",
DEW_POINT:"Taupunkt",
ABS_HUMIDITY:"Absolute Luftfeuchtigkeit",
VALVE_STATE:"Ventilöffnung",
BRIGHTNESS:"Helligkeit",
TEMP_MIN_24H:"Min. Temperatur (24 Std)",
TEMP_MAX_24H:"Max. Temperatur (24 Std)",
HUM_MIN_24H:"Min. Luftfeuchtigkeit (24 Std)",
HUM_MAX_24H:"Max. Luftfeuchtigkeit (24 Std)",
MISS_24H:"Fehlende Datenpakete (24 Std)",
PROG_TIMER:"-",
COUNTER:"-",
SUM:"-",
MEAN5MINUTES:"Durchschnittsverbrauch (5 Min)",
MAX5MINUTES:"Maximalverbrauch (5 Min)",
SUM_1H:"Verbrauch letzte Stunde",
MAX_1H:"Maximalverbrauch letzte Stunde",
SUM_24H:"Verbrauch (24 Std)",
MAX_24H:"Maximalverbrauch (24 Std)",
METER:"Zählerstand",
FILLING_LEVEL:"Füllstand",
ALL_LEDS:"-"
};

var imageMap = {
HUMIDITY:"humidity.png",
TEMPERATURE:"temperature.png"
};

function MapText(text)
// Funktion zum mappen der IDs auf Texte.
{
  newText = "";
  newText = textMap[text];

  // Wenn nichts gefunden, dann Originaltext zurück:
  if (!newText)
    return text;
  else
    return newText;
}

function MapImage(text)
// Funktion zum mappen von IDs auf Grafiken:
{
  gfx = "";
  gfx = imageMap[text];

  // Wenn keines gefunden, dann unknown.png zurück:
  if (!gfx)
    return "unknown.png";
  else
    return gfx;
}
