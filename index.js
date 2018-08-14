/*
* @HTTP SERVER 
*/

//Dependencies 
const http = require('http');
const https = require('https')
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const fs = require('fs');

const config = require('./config')

var server = function(req,res) {
    //Get and pars url 
    var parsedUrl = url.parse(req.url,true)
    //get the path & trim 
    var path = parsedUrl.pathname
    var trimmedPath = path.replace(/^\/|\/$/g,'')

    //Get the method
    var method = req.method.toUpperCase()

    //Query string
    var queryStringObject = parsedUrl.query

    //Headers
    var headers = req.headers

    //Get The payload
    var stringDecoder = new StringDecoder('utf8');
    var buffer = '';

    req.on('data',function(data){
        buffer += stringDecoder.write(data);    
    });

    req.on('end',function(){
        handler = typeof(routes[trimmedPath]) !== 'undefined' ? routes[trimmedPath] : handlers['notFound'];

        data = {
            parsedUrl : parsedUrl,
            trimmedPath : trimmedPath,
            headers : headers,
            queryStringObject: queryStringObject,
            payload : buffer
        }

        handler(data,function(statusCode,payload){
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            payload = typeof(payload) == 'object' ? payload : {}

            
            res.setHeader("content-type","application/json"); 
            res.writeHead(statusCode);
            res.end(JSON.stringify(payload));
        })

        //Return a respons
        
        //Log the path
    });
}

//instantiate http server
var httpServer = http.createServer(function(req,res){ 
    server(req,res)
});

//instantiate https server
var httpsServerOptions = {
    key : fs.readFileSync('./https/key.pem'),
    cert : fs.readFileSync('./https/cert.pem')
}

var httpsServer = https.createServer(httpsServerOptions, function(req,res){ 
    server(req,res)
});

//start http server
httpServer.listen(config.httpPort,function(){
    console.log(config.envName + " server listening on port " + config.httpPort);
});

//start https server
httpsServer.listen(config.httpsPort,function(){
    console.log(config.envName + " server listening on port " + config.httpsPort);
});

//handlers
var handlers = {}

//ping handler, should return 400 and no payload
handlers.ping = function(data,callback){
    callback(200)
}

//hello handler, should return a welcome message

handlers.hello  = function(data,callback) {
    callback(200, {'Message':`hello ${data.queryStringObject['name'] !== undefined ? data.queryStringObject['name'] : 'you'}`})
}

//notFound handler is called for undefined routes
handlers.notFound = function(data,callback) {
    callback(404);
}

//routes
var routes = {
    'ping' : handlers.ping,
    'hello' : handlers.hello
}
