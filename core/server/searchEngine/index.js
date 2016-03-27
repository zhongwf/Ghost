'use strict';
var http = require('http');
var moment = require('moment');
var urlencode = require('urlencode');
var crypto = require('crypto');
var config = require('./config');

var accessKeyId = config.AccessKeyId;

var SignatureVersion = config.SignatureVersion;
var SignatureNonce =config.SignatureNonce;
var version = config.Version;
var hostname = config.hostname;

var uuid = require('uuid');

module.exports.getDateFromSearchEngine = function(indexName,query,callback){
    var mom = moment.utc().toISOString().substr(0,19);
    var Signature = '';
	SignatureNonce = uuid.v4().substr(0,17);
    var dataquery = urlencode(mom)+'Z';
    var str='AccessKeyId='+accessKeyId+'&SignatureMethod=HMAC-SHA1&SignatureNonce='+SignatureNonce+'&SignatureVersion='+SignatureVersion+'&Timestamp='+dataquery+'&Version='+version+'&index_name='+indexName+'&query='+urlencode(query);
    var stringtosing = 'GET'+'&'+urlencode('/')+'&'+urlencode(str);
    var scr = config.AccessSecret +'&'
    Signature = crypto.createHmac('sha1',scr).update(stringtosing).digest().toString('base64');
    var url = '/search?'+str+'&Signature='+urlencode(Signature);
    var options = {
        hostname: hostname,
        port: 80,
        path:url,
        method: 'get'
    };
	console.log("url" + url);
    http.get(options,function(res){
        var chunks = [];
        res.on('data', function (chunk) {
            chunks += chunk;
        });
        res.on('end',function(){
            var buf = new Buffer(chunks);
            var date = JSON.parse(buf.toString());
            if(date.status == 'OK'){
				console.log("ok");
                callback(null,date.result.items);
            }else {
				console.log("error" + date.errors[0].message);
                callback(date.errors);
            }
        })

    })
}

/*
getDateFromSearchEagin('BlogSearch','query=default:洪秀柱',function(a, b){
	console.log("return " + a + "," + b);
}
	);
	*/

