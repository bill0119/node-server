/**
 * Created by BILL.LI on 2017/6/13.
 */
 
"use strict";
 
const path = require('path');
const util = require('util');
const express = require('../node_modules/express');
var router = express.Router();

router.get('/', function (req, res) {
	console.log('route to /');
    var loginPath = '../views/login.jade';

    res.render(loginPath, null, function (err, html) {
        res.status(200).send(html);
    });
});

router.get('/index', function (req, res) {
    var indexPath = '../views/index.jade';

    res.render(indexPath, null, function (err, html) {
        res.status(200).send(html);
    });
});

module.exports = router;
