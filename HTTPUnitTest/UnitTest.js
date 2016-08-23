function UnitTest() {
    this.hash = '';
    this.sessionKey = 0;
}

UnitTest.prototype.Login = function(ip, port, account, password, doneCB) {
    var http = require('http');
    var crypto = require('crypto');
    var shasumKey = crypto.createHash('md5');
    shasumKey.update(password);

    var hashPassword = shasumKey.digest('hex');
    var url = '/DNIAPI?command=Login&account='+account+'&password='+hashPassword;

    var options = {
        host: ip,
        path: url,
        port: port
    };

    callback = function(response) {
        var header = JSON.stringify(response.headers);
        var split = header.split(';');
        var hash = '';

        for(var i = 0; i < split.length; ++i) {
            var n = split[i].indexOf("hash=");

            if (n !== -1) {
                hash = split[i].slice(n+5, split[i].length);
                break;
            }
        }

        var str = '';
        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            doneCB(str, hash);
        });
    };

    var req = http.request(options, callback);
    req.end();
};

UnitTest.prototype.SendRequest = function(ip, port, account, hash, url, doneCB) {
    var http = require('http');
    var cookie = 'account='+account+'; hash='+hash;

    var options = {
        host: ip,
        path: url,
        port: port,
        headers: {
            'Cookie': cookie
        }
    };

    callback = function(response) {
        var str = '';
        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            doneCB(str);
        });
    };

    var req = http.request(options, callback);
    req.end();
};
