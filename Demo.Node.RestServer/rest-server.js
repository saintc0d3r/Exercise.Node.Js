
var http = require('http');
var resourceLocator = require('./infrastructures/resource-locator');
var router = require('./infrastructures/url-router');

require('./resources/resources-registrar.js');
var httpPort = 8080;

http.createServer(function(request, response){
    var requestUrl = decodeURI(request.url);
    var requestMethod = request.method;

    console.log("DEBUG: Decoded url: "+ requestUrl + ", method: "+requestMethod);
    var params = router.first(requestUrl, requestMethod);
    console.log("DEBUG: Params = "+JSON.stringify(params));
    if (params){
        resourceLocator.locate(params, function(controller){
            console.log("DEBUG: Action = "+params.action);
            if (controller && controller[params.action]){
                controller[params.action](params, function(error, result){
                    if (error){
                        response.writeHead(404, {"Content-Type": "text/html"});
                        response.end(error);
                        return;
                    }
                    response.writeHead({"Content-Type": "application/json"});
                    response.end(JSON.stringify(result));
                });
            }
        });
    }
    else{
        var errorResponse = {error: "Unable to route '"+requestUrl+"' url, HTTP Method: "+requestMethod};
        console.log("ERROR: "+errorResponse.error);
        response.writeHead(404, {"Content-Type": "application/json"});
        response.end(JSON.stringify(errorResponse));
    }
}).listen(httpPort);
