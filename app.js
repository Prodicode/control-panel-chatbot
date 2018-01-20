//Node.JS
var express = require('express');
var app = express();
var logger = require('./scripts/logger');
var auth = require('basic-auth');
var mongoAPI = require("./scripts/mongo.js");
var bodyParser = require("body-parser");
var messageSender = require("./scripts/messageSender");



app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(bodyParser.urlencoded({extended: false}));


app.get("/",  function(req, res){
  var user = auth(req);

  if(user === undefined || user['name'] !== "admin" || user['pass'] !== "chatbot"){
    //Wrong login
    res.statusCode = 401;
    res.setHeader("WWW-Authenticate", 'Basic realm="Login"');
    res.end("Unauthorized");
  }else{
    //User logged in correctly
    logger("app", "Admin authorized!");
    mongoAPI.dumpCommands(function(cmds){
      res.render("panel", { commands: cmds });
    });

  }


});

app.post("/new-command", function(req, res){
  var user = auth(req);

  if(user === undefined || user['name'] !== "admin" || user['pass'] !== "chatbot"){
    //Wrong login
    res.statusCode = 401;
    res.setHeader("WWW-Authenticate", 'Basic realm="Login"');
    res.end("Unauthorized");
  }else{
    var commandParam = req.body.command;
    var responseParam = req.body.response;
    mongoAPI.addCommand(commandParam, responseParam, function(){
      res.redirect("/");
    });
  }
});

app.post("/remove-command", function(req, res){
  var user = auth(req);

  if(user === undefined || user['name'] !== "admin" || user['pass'] !== "chatbot"){
    //Wrong login
    res.statusCode = 401;
    res.setHeader("WWW-Authenticate", 'Basic realm="Login"');
    res.end("Unauthorized");
  }else{
    var commandParam = req.body.command;
    mongoAPI.removeCommand(commandParam, function(){
      res.redirect("/");
    });

  }
});

app.post('/webhook', bodyParser.json() , (req, res) => {

  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {
    var messageWebhook = body.entry[0].messaging[0].message.text;
    var senderWebhook = body.entry[0].messaging[0].sender.id;
    console.log("Received message from "+senderWebhook+" containing: "+messageWebhook);
    mongoAPI.getResponse(messageWebhook, function(rsp){
      messageSender(senderWebhook, rsp);
    });
    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

app.get('/webhook', (req, res) => {

  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = "chatbot"

  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {

    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {

      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);

    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});


var PORT = process.env.PORT || 8080;

app.listen(PORT, function(){
  logger("app", "HTTP Server running!");
});
