/**
 * Created by BILL.LI on 2017/6/13.
 */
 
"use strict";
 
const path = require('path');
const panic = require('./node_modules/nodepanic');
const webServer = require('./src/webServer.js');
 
var currentFile = path.basename(__filename);
 
function ServerMain() {
	panic.enablePanicOnCrash(process.cwd(), currentFile);
	this.webServer = new webServer.WebServer();
	this.webServer.Initial();
	this.webServer.Start();
}
 
 var serverMain = new ServerMain();