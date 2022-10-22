const api = require("./api.js");
const server_settings = require("./server_setting.json")
const http = require("http");

const requestListener = function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    var requestString = req.url;
    requestString = decodeURI(requestString);
    requestString = requestString.substring(1);
    apply_user_inp(requestString, r=>res.end(r))
};

const server = http.createServer(requestListener);
server.listen(server_settings.port, server_settings.host, () => {
    console.log(`Server is running on http://${server_settings.host}:${server_settings.port}`);
});


function callback_errmsg(message, callback)
{
    callback(JSON.stringify({"success": false, "Error": message}));
}

function apply_user_inp(inp, callback)
{
    var inp_json;
    try { inp_json = JSON.parse(inp)}
    catch (e) {callback_errmsg("JSON Parse Input Error", callback); return; }
    const command = inp_json["command"];
    if(inp_json["args"].length!=api.api_connector[command]["args"].length) {
        callback_errmsg(`The Function ${command} requires ${api.api_connector[command]["args"].length} Args! Got: ${inp_json["args"].length}`, callback);
        return;
    }
    var args = [];
  
    for (var i = 0; i<inp_json["args"].length; i++) {
        try {
            args.push(api.api_connector[command]["args"][i](inp_json["args"][i]));
        } catch {
            callback_errmsg(`Error parsing Argument ${i}!`, callback);
            return;
        }
    }
    args.push(result=>{
        try {
            callback(JSON.stringify(api.api_connector[command]["out"](result)))
        } catch(e) {
            console.log(e);
        }
    })
    api.api_connector[command]["fn"].apply(this, args)
}
