// addCommand(command, response, callback)
// removeCommand(command, callback)
// dumpCommands(callback)
// getReponse(command, callback)

var MongoClient = require('mongodb').MongoClient;
var { mongoURI } = require("../keys");
var logger = require("./logger");

var exports = module.exports = {};

exports.addCommand = function(command, response, callback){
    var commandObject = { command: command, response: response };
    MongoClient.connect(mongoURI, function(err, client){
      if (err) throw err;
      var db = client.db("chatbot");
      db.collection("commands").update({}, {
        $push: {
          commands: commandObject
        }
      }, function(error){
        logger("mongo", "Successfully added new command!");
      if (callback)  callback();
      });
    });
};

exports.removeCommand = function(command, callback){
  MongoClient.connect(mongoURI, function(err, client){
    if (err) throw err;
    var db = client.db("chatbot");
    db.collection("commands").update({}, {
      $pull: {
        commands: {command: command}
      }
    }, function(error){
      logger("mongo", "Command removed successfully!");
      if (callback)  callback();
    });
  });
};

exports.dumpCommands = function(callback){
  MongoClient.connect(mongoURI, function(err, client){
    if (err) throw err;
    var db = client.db("chatbot");
    db.collection("commands").findOne({}, function(error, result){
      logger("mongo", "Successfully completed dump operation");
      callback(result.commands);
    });
  });
};

exports.getResponse = function(command, callback){
  var exists = false;
  MongoClient.connect(mongoURI, function(err, client){
    if (err) throw err;
    var db = client.db("chatbot");
    db.collection("commands").findOne({}, function(error, result){
      logger("mongo", "Successfully completed search operation");
      for (var i = 0;i<result.commands.length;i++){
        if(result.commands[i].command == command){
          callback(result.commands[i].response);
          exists = true;
        }
      }
      if(callback && !exists) callback("Invalid Command!");
    });
  });
};
