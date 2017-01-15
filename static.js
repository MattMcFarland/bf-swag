var fs		= require('fs');
var url		= require('url');
var path	= require('path');
var mime 	= require('mime');

module.exports = function(req, res, ctx, done) {
    var uri = url.parse(req.url);
    var pathname = uri.pathname;
    var filename = path.join(__dirname, 'client', pathname);
    fs.stat(filename, function(err, stat){
    	if(err){
    		return done(err);
    	}
    	if(stat.isDirectory()) return res.redirect(pathname + '/');
    	var type = mime.lookup(filename);
    	var charset = mime.charsets.lookup(type);
    	res.setHeader('Content-Type'	, type + (charset ? '; charset=' + charset : '' ));
    	res.setHeader('Content-Length', stat.size);
    	res.setHeader('Last-Modified'	, stat.mtime.toUTCString());

    	fs.createReadStream(filename).pipe(res);
    });

}
