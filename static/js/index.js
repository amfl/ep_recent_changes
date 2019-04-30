var _, $, jQuery;

var $ = require('ep_etherpad-lite/static/js/rjquery').$;
var _ = require('ep_etherpad-lite/static/js/underscore');
var cssFiles = ['ep_recent_changes/static/css/linenums.css'];
var padcookie = require('ep_etherpad-lite/static/js/pad_cookie').padcookie

// Global client state.
var recentlyChangedLineNums = [];

function aceEditorCSS(){
  return cssFiles;
}

function updateRecent() {
  // Very naive, completely refreshes every time instead of doing
  // anything remotely intelligent

  var outer = $('iframe[name=ace_outer]');
  var side = outer.contents().find('#sidedivinner');
  var linenos = side.find('div');
  linenos.each(function(index) {
    $(this).removeClass('recent').removeClass('recent_last');
  });

  if (recentlyChangedLineNums.length != 0) {
    linenos.eq(recentlyChangedLineNums[recentlyChangedLineNums.length - 1]).addClass('recent_last');
    for (var i=0; i<recentlyChangedLineNums.length; i++) {
      linenos.eq(recentlyChangedLineNums[i]).addClass('recent');
    }
  }
}
function lineChanged(hook, context) {
  // TODO Don't try and highlight the inital time the pad loads

  HISTORY_LEN = padcookie.getPref('recentChangesHistory');
  if (typeof(HISTORY_LEN) == "undefined") {
    HISTORY_LEN = 10; // Default value
    padcookie.setPref('recentChangesHistory', HISTORY_LEN);
  }
  // console.log("History len from cookie: " + HISTORY_LEN);

  // console.log(context);

  // Store interesting things in variables.
  var line = context.startLine;
  var delta = context.newLineEntries.length - context.deleteCount;

  // console.log("Changes start: " + line + " Delta: " + delta);

  // Check if the total number of lines has changed, and therefore
  // we need to make modifications to existing linemods.

  if (delta != 0) {
    // We need to shift everything after `line` up by this many.

    for (var i=0; i<recentlyChangedLineNums.length; i++) {
      if (recentlyChangedLineNums[i] > line) {
        recentlyChangedLineNums[i] += delta;
      }
    }
  }
  for (var i=0; i<=delta; i++) {
    // Add in all the newly inserted lines if they don't already exist in the list
    var newline = line + i
    var oldpos = recentlyChangedLineNums.indexOf(newline);
    if (oldpos != -1) {
      recentlyChangedLineNums.splice(oldpos, 1);
    }
    recentlyChangedLineNums.push(newline);
  }

  while (recentlyChangedLineNums.length > HISTORY_LEN) {
    // Remove the elements which we no longer care about
    //
    // TODO This is inefficient as it adjusts every element in the array
    // Convert to Queue.js (?) or something O(1) instead of O(N)
    recentlyChangedLineNums.shift();
  }

  updateRecent();

}

// Export all hooks
exports.aceEditorCSS = aceEditorCSS;
exports.lineChanged = lineChanged;
