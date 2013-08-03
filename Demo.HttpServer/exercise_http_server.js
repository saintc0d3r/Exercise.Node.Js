// -- Excercise I: Create Http server using node.js for the SPA web app.

// -- Refer to http, fs, path module
var http = require('http');
var fs = require('fs');
var path = require('path');

var mimeTypes = {'.html': 'text/html', '.js': 'text/js', '.css': 'text/css'};
var pagesCache = new PagesCache();
var whiteList = ['/', '/assets/css/bootstrap.min.css', '/assets/css/bootstrap-responsive.min.css' ];
var httpPort = 8080;

// Create the http server and get it to listen port 8080
http.createServer(function (request, response){
	// Ensure that the request.url is in the whitelist
	console.log("DEBUG: request.url="+request.url);
	if (whiteList.indexOf(request.url)===-1){
		response.writeHead(404);
		response.end("ERROR: Page not found!");
		return;
	}

	// Resolve the html file's path,
	var filePath = resolveFilePath(request.url);
	console.log("INFO: Resolved file's Path = "+filePath);

	// Check whether the file exist or not
	fs.exists(filePath, function(exists){
		if (!exists){
			// the file does not exist ! terminate the request
			response.writeHead(404);
			response.end("ERROR: "+filePath+" file is not found!");
			return;
		}

		var headers = {'Content-Type': mimeTypes[ path.extname(filePath) ]};

		// We'll need to read the file's content & also get the file's status
		fs.stat(filePath, function(error, stats){		
			if (error){
				response.writeHead(500);
				response.end("ERROR: Unable to determine '"+filePath+"'s status.");
				return;
			}

			// Try loading the file from cache if the file is in the cache and it's up to date
			if (pagesCache.isCached(filePath) && pagesCache.isUptodate(filePath, stats)){
				console.log("INFO: '"+filePath+"' is loaded from cache.");
				response.writeHead(200, headers);
				response.end(pagesCache.get(filePath));
				return;
			}

			// Create a read stream to read the file
			var fileStream = fs.createReadStream(filePath)
								.once('open', function(){
									console.log("INFO: Begin streaming '"+filePath+"'");
									// Write file's MIME Type into the response's header
									response.writeHead(200, headers);
									// Pipe the ReadStream to response object
									this.pipe(response);									
								})
								.once('error', function(){
									response.writeHead(500);
									response.end("ERROR: Unable to stream '"+filePath+"'");
									return;
								});
			
			// Put the page's content into the cache
			var bufferOffset = 0;
			var pageData = new Buffer(stats.size);
			fileStream.on('data', function(chunk){
				// copy the chunk's content into cache
				chunk.copy(pageData, bufferOffset);
				bufferOffset += chunk.length;
			}).once('end', function(){
				console.log("INFO: '"+filePath+"' has been cached.");
				// Keep the data into the cache
				pagesCache.put(filePath, pageData, Date.parse(stats.ctime));
			});

		});
	});	
}).listen(httpPort);

function resolveFilePath(requestUrl){
	// Check whether the decoded requestUrl = / or not
	var decodedUrl = decodeURI(requestUrl);
	if (path.basename(decodedUrl) ===''){

		return 'index.html';
	}

	return __dirname + decodedUrl;
}

// Create PagesCache class
function PagesCache(){
	var _cache = {};

	this.put = function(filePath, fileData, fileTimeStamp){
		// Put the page data into the cache
		_cache[filePath] = {data: fileData, timestamp: fileTimeStamp};
	};

	this.get = function(filePath){
		return this.isCached(filePath) ? _cache[filePath].data : null ;		
	}

	this.isCached = function(filePath){
		return _cache[filePath] != null && _cache[filePath].data != null;
	};

	this.isUptodate = function(filePath, fileStat){
		var timestamp = Date.parse(fileStat.ctime);

		return _cache[filePath] && _cache[filePath].timestamp >= timestamp;
	};
}