var _           = require('lodash'),
    fs          = require('fs-extra'),
    http        = require('http'),
    path        = require('path'),
    util        = require('util'),
    Promise     = require('bluebird'),
    qiniu       = require('qiniu'),
 
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
 
var cf      = require('../../../core/server/config');
var uuid = require('uuid'); 
var serveStatic = require('express').static;
var utils       = require('../../../core/server/utils');

function QINIUStore(config) {
    options = config;
    qiniu.conf.ACCESS_KEY = options.AK;
    qiniu.conf.SECRET_KEY = options.SK;
}
 
util.inherits( QINIUStore, baseStore );

QINIUStore.prototype.getTargetDir = function (baseDir) { 
    return baseDir;
};


QINIUStore.prototype.save = function (image, targetDir) {
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

	
	
            var putPolicy = new qiniu.rs.PutPolicy( options.bucket );
            var uptoken = putPolicy.token();
            var key =  path.basename(targetFilename);

            // 上传文件到云存储
            Promise.promisify(qiniu.io.putFile)(uptoken, key, image.path, null, function(err, ret) {

                if(!err) {
                  // 上传成功， 处理返回值
				  console.log( 'uplaod ok...');
                  //var result = resolve( filename );
				  return filename;

                  // ret.key & ret.hash
                } else {
                  // 上传失败， 处理返回代码
                  console.log('QINIUStore save ERROR:' , err );
                  return reject( err );
                }
            });
			//var result = 'http://7xrinx.com1.z0.glb.clouddn.com/' + outFile; 
			//console.log( 'result ' + result);
		    //return result;

    }).then(function () { 
		console.log( 'then');
		//var result = "http://7xrinx.com1.z0.glb.clouddn.com/ghost-f903ef21-b621-40ca-afef-c87a9309e01e.jpg";
		//	console.log( 'result ' + result);
		//    return result;
			
		var fullUrl = (cf.paths.subdir + '/' + cf.paths.imagesRelPath + '/' +
            path.relative(cf.paths.imagesPath, targetFilename)).replace(new RegExp('\\' + path.sep, 'g'), '/');
	    console.log( 'fullUrl ' + fullUrl);
        return fullUrl;			
		
    }).catch(function (e) {
        errors.logError(e);
        return Promise.reject(e);
    });
};
 
QINIUStore.prototype.exists = function (filename ) {

    return new Promise(function (resolve, reject) {

        var key = options.prefix + filename;
        var client = new qiniu.rs.Client();
        
        // console.log( 'QINIUStore::CHECK key=', key );
        // console.log( 'QINIUStore::CHECK filename=', filename );

        client.stat( options.bucket , key, function(err, ret) {
          if (!err) {
            // ok 
            // ret has keys (hash, fsize, putTime, mimeType)
            // console.log( 'QINIUStore:: CHECK ret', ret );
            return resolve(true);

          } else if ( _.has( err, 'code') ) {

            if ( err.code === 612 ) {  // no such file or directory
                return resolve( false );

            } else {
                console.log('QINIUStore CHECK ERROR:' , err );
                return reject( err );
            }

          } else {
             console.log('QINIUStore CHECK ERROR:' , err );
             return reject( err );
          }

        });

    });
};

 

QINIUStore.prototype.getUniqueFileName = function (store, image, targetDir) {
    var ext = path.extname(image.name),
        name = uuid.v4(),
        self = this;

    return self.generateUnique(store, targetDir, name, ext, 0);
};
 
QINIUStore.prototype.serve = function () {
	return serveStatic(cf.paths.imagesPath, {maxAge: utils.ONE_YEAR_MS, fallthrough: false});
	/*
    return function (req, res, next ) {
		console.log('QINIUStore.prototype.serve....'  + req.path );
        res.redirect( 301, options.protocol + '://' + options.domain + '/' + req.path );
        // next();
    };
	*/
};
 
module.exports = QINIUStore;