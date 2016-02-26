var errorsDebugger = [];
window.onerror = function (msg, url, linenumber) {
    if (document.getElementById('errorsDebugger') === null) {
        alert(linenumber + ": " + msg + " (" + url + ")");
        errorsDebugger.push("<li>" + linenumber + ": " + msg + " (" + url + ")</li>");
    } else {
        $('#errorsDebugger').append("<li>" + linenumber + ": " + msg + " (" + url + ")</li>");
    }
};