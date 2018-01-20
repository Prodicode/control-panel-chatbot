var mongoAPI = require("./mongo");
var { exec } = require("child_process");
var { accessToken } = require("../keys");

module.exports = function(id, message){
  var curlCommand = 'curl -X POST -H "Content-Type: application/json" -d \' { "messaging_type": "RESPONSE", "recipient": { "id": \"'+id+'\" }, "message": {"text": "'+message+'"}} \' "https://graph.facebook.com/v2.6/me/messages?access_token='+accessToken+'"';

  exec(curlCommand, function(err, stdout, stderr){
    if (err) console.log(err);

    console.log('stdout: ${stdout}');
    console.log('stderr: ${stderr}');
  });
}
