/**
 * Created by BILL.LI on 2017/6/13.
 */
 
"use strict";

const path = require('path');
const http = require('http');
const index = require('../routes/index.js');
const logger = require('../node_modules/morgan');
const cookieParser = require('../node_modules/cookie-parser');
const bodyParser = require('../node_modules/body-parser');
const express = require('../node_modules/express');

function WebServer() {
	this.express = null;
	this.httpServer = null;
}
	
WebServer.prototype.Initial = function() {
	console.log('initial server...');
	this.express = express();
	
	this.express.use(function (req, res, next) {
		// TODO : filter host request
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		next();
	});
	
	// add jade UI
	//var cakeypath = path.join(process.cwd(), 'ssl', 'mykey.pem');
	//var certkeypath = path.join(process.cwd(), 'ssl', 'mycert.pem');
	//var privkey = fs.readFileSync(cakeypath, 'utf8');
	//var certkey = fs.readFileSync(certkeypath, 'utf8');
	var viewPath = path.join(process.cwd(), 'views');
	var publicPath = path.join(process.cwd(), 'public');
	
	this.express.set('view engine', 'jade');
	this.express.set('views', viewPath);
	this.express.use('/', index);
	this.express.use(express.static(publicPath));
	this.express.use(logger('dev'));
	this.express.use(bodyParser.json());
	this.express.use(bodyParser.urlencoded({extended: false}));
	this.express.use(cookieParser());
	this.express.set('etag', false);
	this.express.set('port', 80);
}

WebServer.prototype.Start = function() {
	var self = this;
	
	function ListeningHTTP() {
		var addr = self.httpServer.address();
		var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
		console.log('HTTP Listening on ' + bind);
	}

	// HTTP
	this.httpServer = http.createServer(this.express);
	this.httpServer.listen(80);
	this.httpServer.on('listening', ListeningHTTP);
	this.httpServer.on('close', function () {
	});
}

exports.WebServer = WebServer;