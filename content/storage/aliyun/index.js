var serveStatic = require('express').static,
    _           = require('lodash'),
    fs          = require('fs-extra'),
    http        = require('http'),
    path        = require('path'),
    util        = require('util'),
    Promise     = require('bluebird')
 
    options     = {},
 
    mimeTypes   = {
        '.jpg':  'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif':  'image/gif',
        '.png':  'image/png',
        '.svg':  'image/svg+xml',
        '.svgz': 'image/svg+xml'
    },
 
    mountPoint = '/content/images',
    baseStore = require('../../../core/server/storage/base');
            // 上传文件到云存储
var OSS = require('aliyun-oss');
			
var cf = require('../../../core/server/config');
var utils = require('../../../core/server/utils');
var uuid = require('uuid');  

util.inherits( ALIYUNStore, baseStore );

function ALIYUNStore(config) {
    options = config;
}
 


ALIYUNStore.prototype.getTargetDir = function (baseDir) { 
    return baseDir;
};


ALIYUNStore.prototype.save = function (image, targetDir) {
    targetDir = targetDir || this.getTargetDir(cf.paths.imagesPath);
    var targetFilename;
	 

    return this.getUniqueFileName(this, image, targetDir).then(function (filename) {
		console.log("image.path" + image.path);
		console.log("filename" + filename); 
        targetFilename = filename;
        return Promise.promisify(fs.mkdirs)(targetDir);
    }).then(function () {
        return Promise.promisify(fs.copy)(image.path, targetFilename);
    }).then(function (filename) {
console.log( 'aliyun working');
	
	



var oss = OSS.createClient(options);

var key =  path.basename(targetFilename);
			      
oss.putObject({
  bucket: options.bucket,
  object: key,
  source: targetFilename
}, function (err, res) {
    console.log('aliyun oss upload err:' +err);
	console.log('aliyun oss upload ok:' +res);
});


			//var result = 'http://7xrinx.com1.z0.glb.clouddn.com/' + outFile; 
			//console.log( 'result ' + result);
		    //return result;

    }).then(function () { 
		console.log( 'then');
		//var result = "http://7xrinx.com1.z0.glb.clouddn.com/ghost-f903ef21-b621-40ca-afef-c87a9309e01e.jpg";
		//	console.log( 'result ' + result);
		//    return result;
			
		//var fullUrl = (cf.paths.subdir + '/' + cf.paths.imagesRelPath + '/' +
        //    path.relative(cf.paths.imagesPath, targetFilename)).replace(new RegExp('\\' + path.sep, 'g'), '/');
		var fullUrl = ('http://s-blog.oss-cn-beijing.aliyuncs.com/' +
            path.relative(cf.paths.imagesPath, targetFilename)).replace(new RegExp('\\' + path.sep, 'g'), '/');
	    console.log( 'fullUrl ' + fullUrl);
        return fullUrl;			
		
    }).catch(function (e) {
        console.log(e);
        return Promise.reject(e);
    });
};
 
ALIYUNStore.prototype.exists = function (filename ) {

    return new Promise(function (resolve, reject) {

        var key = options.prefix + filename; 
        
        // console.log( 'ALIYUNStore::CHECK key=', key );
        // console.log( 'ALIYUNStore::CHECK filename=', filename );

        return resolve( false );

    });
};

 

ALIYUNStore.prototype.getUniqueFileName = function (store, image, targetDir) {
    var ext = path.extname(image.name),
        name = uuid.v4(),
        self = this;

    return self.generateUnique(store, targetDir, name, ext, 0);
};
 
ALIYUNStore.prototype.serve = function () {
	return serveStatic(cf.paths.imagesPath, {maxAge: utils.ONE_YEAR_MS, fallthrough: false});
	/*
    return function (req, res, next ) {
		console.log('ALIYUNStore.prototype.serve....'  + req.path );
        res.redirect( 301, options.protocol + '://' + options.domain + '/' + req.path );
        // next();
    };
	*/
};
 
module.exports = ALIYUNStore;