const api = require("./api.js");
const server_settings = require("./server_setting.json")
const http = require("http");
const fs = require("fs");
const express = require("express")
const testHTML = fs.readFileSync("test.html")
const fileUpload = require('express-fileupload');

const app = express();
app.use(fileUpload());

const requestListener = function (req, res) {
    apply_user_inp(req, r=>res.end(r), res)
};

app.get("", (req, res)=>res.end(testHTML))
const postListener = function (req, res) {
	console.log("IMAGE UPLOAD: "+req.body['username']+"_"+req.body['password']+"_"+req.body['id'])
    try {
        api.upload_file(
		req.body['username'] || '',
		req.body['password'] || '',
		req.body['id'] || -1, 
		req.files["image"]["data"], 
		c=>{
            console.log(c)
            res.end("{\"success\":true, \"id\":"+c+"}")
        })
    } catch(e) {
        console.log(e);
        res.end("{'success':false, 'err':1}")
    }
};

app.post("/upload_file", postListener)

const server = http.createServer(requestListener);
server.listen(server_settings.port);
app.listen(server_settings.img_port)
console.log(`Server is running on ${server_settings.port} and ${server_settings.img_port}`);

function callback_errmsg(message, callback)
{
    callback(JSON.stringify({"success": false, "Error": message}));
}

function apply_user_inp(req, callback, res)
{
    var inp = req.url;
    inp = decodeURIComponent(inp);
	console.log(inp);
    inp = inp.substring(1);
    var inp_json;
    try { inp_json = JSON.parse(inp)}
    catch (e) {callback_errmsg("JSON Parse Input Error", callback); return; }
    const command = inp_json["command"];
	try {
		if(inp_json["args"].length!=api.api_connector[command]["args"].length) {
			callback_errmsg(`The Function ${command} requires ${api.api_connector[command]["args"].length} Args! Got: ${inp_json["args"].length}`, callback);
			return;
		}
	}
    catch (e) {
        callback_errmsg(`The Function ${command} does not exist`, callback);
        return; 
    }
    var args = [];
    for (var i = 0; i<inp_json["args"].length; i++) {
        try {
            args.push(api.api_connector[command]["args"][i](inp_json["args"][i]));
        } catch (e) {
            callback_errmsg(`Error parsing Argument ${i}!`, callback);
        }
    }
    args.push(result=>{
        if (api.api_connector[command]["img_ret"]) {
            try {
                res.setHeader('Content-Type', 'image');
                res.writeHead(200);
                callback(result);
            } catch(e) {
                console.log(e);
            }
            return;
        }
        try {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.writeHead(200);
            callback(JSON.stringify(api.api_connector[command]["out"](result)))
        } catch(e) {
            console.log(e);
        }
    })
    api.api_connector[command]["fn"].apply(this, args)
}
