/**
 * Created by BILL.C.LI on 2016/8/4.
 */

var IS_WIN = process.platform === 'win32';

exports.GetPID = function(pName, callback) {
    if (IS_WIN) {
        var exec = require('child_process').exec;
        exec('tasklist', function(err, stdout, stderr) {
            // stdout is a string containing the output of the command.
            // parse it and look for the apache and mysql processes.

            var pid = [];
            var split = stdout.split(pName);

            for (var i = 1; i < split.length; ++i) {
                var pidItem = split[i].split(" ");

                for (var j = 0; j < pidItem.length; ++j) {
                    if (pidItem[j] !== '') {
                        pid.push(pidItem[j]);
                        break;
                    }
                }
            }

            callback(pid);
        });
    }
};

exports.KillByPid = function(pid) {
    if (IS_WIN) {
        var cmd = 'taskkill /F /PID '+pid;
        var exec = require('child_process').exec;
        exec(cmd, function(err, stdout, stderr) {
        });
    }

};

exports.KillByName = function(name) {
    if (IS_WIN) {
        var cmd = 'taskkill /F /IM '+name;
        var exec = require('child_process').exec;
        exec(cmd, function(err, stdout, stderr) {
        });
    }

};
