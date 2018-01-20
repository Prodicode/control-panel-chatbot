var colors = require('colors');

module.exports = function(script, message){
  var scripts = ['app', 'mongo'];

  switch(script){
    case "app":
    console.log("[" + "App".green + "] " + message);
    break;
    case "mongo":
    console.log("[" + "MongoDB".green + "] " + message);
    break;
    default: console.log("Error"); break;
  }
};
