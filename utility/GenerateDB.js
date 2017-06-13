/*
 * Created by BILL.C.LI on 2016/8/23.
 */

const path = require('path');
const fs = require('fs');
const utility = require('../../lib/utility.js');
const constJS = require('../../lib/const.js');
const sqlite3 = require('../../modules/sqlite3');

var maxDeviceNum = 0;
var startIPInt = utility.toInt('192.168.0.1');
var startDeviceIndex = 1;

if (utility.CheckFileExist('./DeviceInfo.db')) {
    fs.unlinkSync('./DeviceInfo.db');
}

var sql = sqlite3.verbose();
var db = new sql.Database('./DeviceInfo.db');

function CreateLeftNode(callback) {
    if (maxDeviceNum < startDeviceIndex) {
        callback();
        return;
    }

    db.serialize(function () {
        var cmd = 'INSERT INTO DeviceInfo VALUES(' + (startDeviceIndex++) + ',\'' + utility.fromInt(startIPInt++) + '\',\'N/A\',\'N/A\',0,\'N/A\',0,\'\',' +
            '\'DVS-110W02-3SFP\',' +'\'\',\'\',\'\',' + constJS.EnumDeviceStatus().CONNECTED + ',-1,-1,-1,-1,0,\'\',\'\',\'\',0,0);';

        console.log('Create left node '+cmd);
        db.run(cmd, function () {
            callback();
        });
    });
}

function CreateLeftLink(callback) {
    if(startDeviceIndex == 2) {
        callback();
        return;
    }

    db.serialize(function () {
        var cmd = 'INSERT INTO TopologyInfo VALUES(' + parseInt((startDeviceIndex - 1) / 2) + ',2,' + (startDeviceIndex - 1) + ',1,\'LLDP\',100000000,\'FullDuplex\',\'\',0);';

        console.log('Create left link : '+cmd);
        db.run(cmd, function () {
            CreateLeftDupLink(function() {
                callback();
            })
        });
    });
}

function CreateLeftDupLink(callback) {
    db.serialize(function () {
        var cmdDup = 'INSERT INTO TopologyInfo VALUES(' + (startDeviceIndex - 1) + ',1,' + parseInt((startDeviceIndex - 1) / 2) + ',2,\'LLDP\',100000000,\'FullDuplex\',\'\',0);';

        console.log('Create left dup link : '+cmdDup);
        db.run(cmdDup, function () {
            callback();
        });
    });
}

function CreateRightNode(callback) {
    if (startDeviceIndex == 2) {
        callback();
        return;
    }

    if (maxDeviceNum < startDeviceIndex) {
        callback();
        return;
    }

    db.serialize(function () {
        var cmd = 'INSERT INTO DeviceInfo VALUES(' + (startDeviceIndex++) + ',\'' + utility.fromInt(startIPInt++) + '\',\'N/A\',\'N/A\',0,\'N/A\',0,\'\',' +
            '\'DVS-110W02-3SFP\',' +'\'\',\'\',\'\',' + constJS.EnumDeviceStatus().CONNECTED + ',-1,-1,-1,-1,0,\'\',\'\',\'\',0,0);';

        console.log('Create right node : '+cmd);
        db.run(cmd, function () {
            callback();
        });
    });
}

function CreateRightLink(callback) {
    if(startDeviceIndex == 2) {
        callback();
        return;
    }

    db.serialize(function () {
        var cmd = 'INSERT INTO TopologyInfo VALUES(' + parseInt((startDeviceIndex - 1) / 2) + ',3,' + (startDeviceIndex - 1) + ',1,\'LLDP\',100000000,\'FullDuplex\',\'\',0);';

        console.log('Create right link : '+cmd);
        db.run(cmd, function () {
            CreateRightDupLink(function() {
                callback();
            })
        });
    });
}

function CreateRightDupLink(callback) {
    db.serialize(function () {
        var cmdDup = 'INSERT INTO TopologyInfo VALUES(' + (startDeviceIndex - 1) + ',1,' + parseInt((startDeviceIndex - 1) / 2) + ',3,\'LLDP\',100000000,\'FullDuplex\',\'\',0);';

        console.log('Create right dup link : '+cmdDup);
        db.run(cmdDup, function () {
            callback();
        });
    });
}

function BinaryTree() {
    if (maxDeviceNum < startDeviceIndex) {
        db.close(function () {
            db = null;
        });

        console.log('stop create node...');

        return;
    }

    CreateLeftNode(function() {
        CreateLeftLink(function() {
            CreateRightNode(function() {
                CreateRightLink(function() {
                    BinaryTree();
                });
            });
        });
    });
}

function Init() {
    db.serialize(function () {
        db.run('CREATE TABLE IF NOT EXISTS DeviceInfo (DeviceIndex INTEGER, IP TEXT, MAC TEXT, PHYSICAL TEXT, HTTPPort INTEGER, ' +
            'FirmwareVersion TEXT, Protocol INTEGER, Description TEXT, ModelName TEXT, SystemName TEXT, ' +
            'SystemLocation TEXT, SystemContact TEXT, Status INTEGER, X INTEGER, Y INTEGER, W INTEGER, H INTEGER, ' +
            'Time INTEGER, Account TEXT, Password TEXT, OID TEXT, ifNumber INTEGER, PortShift INTEGER)', function () {
        });

        var stmtDevice = db.prepare('INSERT INTO DeviceInfo(DeviceIndex,IP,MAC,PHYSICAL,HTTPPort,FirmwareVersion,Protocol,' +
            'Description,ModelName,SystemName,SystemLocation,SystemContact,Status,X,Y,W,H,Time,Account,Password,OID,' +
            'ifNumber,PortShift) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', function () {
        });

        db.run('CREATE TABLE IF NOT EXISTS TopologyInfo (DeviceIndex INTEGER, ifindex INTEGER, NeighborIndex INTEGER,' +
            ' nifindex INTEGER, Protocol TEXT, Speed INTEGER, Duplex TEXT, Aggregation TEXT, AggAttached INTEGER)', function () {
        });

        var stmtTopology = db.prepare('INSERT INTO TopologyInfo(DeviceIndex,ifindex,NeighborIndex,nifindex,Protocol,Speed,Duplex' +
            ',Aggregation,AggAttached) VALUES(?,?,?,?,?,?,?,?,?)', function () {
        });

        db.run('CREATE TABLE IF NOT EXISTS VlanInfo (VlanId INTEGER, DeviceMac TEXT, DeviceIp TEXT, DeviceName TEXT,' +
            ' MemPort TEXT, TagPort TEXT, UntagPort TEXT)', function () {
        });

        var stmtVlan = db.prepare('INSERT INTO VlanInfo(VlanId,DeviceMac,DeviceIp,DeviceName,MemPort,TagPort,UntagPort) VALUES(?,?,?,?,?,?,?)', function () {
        });

        db.run('CREATE TABLE IF NOT EXISTS VlanPvidInfo (DeviceIp TEXT, PvidList TEXT)', function () {
        });

        var stmtPvid = db.prepare('INSERT INTO VlanPvidInfo(DeviceIp,PvidList) VALUES(?,?)', function () {
        });

        stmtDevice.finalize();
        stmtTopology.finalize();
        stmtVlan.finalize();
        stmtPvid.finalize();

        console.log('Initial...');

        CreateLeftNode(function() {
            BinaryTree();
        });
    });
}

if (process.argv.length <= 2) {
    console.log('please input max device number');
} else {
    maxDeviceNum = parseInt(process.argv[2]);
    Init();
}
