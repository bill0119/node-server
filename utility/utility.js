/*
 * Created by BILL.C.LI on 2016/8/23.
 */
 
function CheckFolderExistAndCreate(folderPath) {
    var path = require('path');
    var fs = require('fs');
    var list = folderPath.split(path.sep);
    var folderPathSep = '';

    if (list.length !== 0) {
        folderPathSep = list[0];

        if (!fs.existsSync(folderPathSep)){
            fs.mkdirSync(folderPathSep);
        }
    }

    for (var i = 1; i < list.length; ++i) {
        folderPathSep = path.join(folderPathSep, list[i]);

        if (!fs.existsSync(folderPathSep)){
            fs.mkdirSync(folderPathSep);
        }
    }
}

function RemoveFolder(folderPath) {
    var path = require('path');
    var fs = require('fs');
    try {
        var fileList = fs.readdirSync(folderPath);

        for (var i = 0; i < fileList.length; ++i) {
            var file = path.join(folderPath, fileList[i]);

            var stat = fs.statSync(file);
            if (stat && stat.isDirectory()){
                RemoveFolder(file);
            } else {
                fs.unlinkSync(file);
            }
        }

        fs.rmdirSync(folderPath);
    } catch(e) {
    }
}

function CheckPortOpen(protocol, port) {
    var command = '';

    //windows platform
    if (process.platform === 'win32') {
        command = 'netstat -nao | find "'+protocol+'" | find ":'+port+'"';
        const exec = child_process.exec;
        exec(command, function(error, stdout, stderr) {
            console.log(stdout);
        });
    }
}
