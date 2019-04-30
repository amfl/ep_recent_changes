var eejs = require('ep_etherpad-lite/node/eejs/');
var Changeset = require("ep_etherpad-lite/static/js/Changeset");
var Security = require('ep_etherpad-lite/static/js/security');

exports.eejsBlock_mySettings_dropdowns = function(hook_name, args, cb){
  args.content = args.content + eejs.require("ep_recent_changes/templates/recentChangesMenu.ejs");
  return cb();
};

