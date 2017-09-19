const fs = require('fs');
const mime = require('mime-types');

const readdirRecursivePromise = path => {
    return new Promise((resolve, reject) => {
        fs.readdir(path, (err, directoriesPaths) => {
            if (err) {
                reject(err);
            } else {
                if (directoriesPaths.indexOf('.DS_Store') != -1) {
                    directoriesPaths.splice(directoriesPaths.indexOf('.DS_Store'), 1);
                }
                directoriesPaths.forEach((newPath, newPathIndex) => {
                    directoriesPaths[newPathIndex] = statPromise(`${path}/${newPath}`);
                });
                Promise.all(directoriesPaths).then(out => {
                    resolve(flattenArray(out));
                }).catch(err => {
                    reject(err);
                });
            }
        });
    });
};
const statPromise = path => {
    return new Promise((resolve, reject) => {
        fs.stat(path, (err, stats) => {
            if (err) {
                reject(err);
            } else {
                if (stats.isDirectory()) {
                    readdirRecursivePromise(path).then(out => {
                        resolve(out);
                    }).catch(err => {
                        reject(err);
                    });
                } else if (stats.isFile()) {
                    if (mime.lookup(path) === false) {
                        reject(`mime.lookup('${path}') === false`);
                    } else {
                        fs.readFile(path, (err, data) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve({
                                    'path': path,
                                    'type': mime.lookup(path),
                                    'data': data
                                });
                            }
                        });
                    }
                } else {
                    reject(`Error parsing path: ${path}`);
                }
            }
        });
    });
};
exports.gatherFilesPromise = directory => {
    return new Promise((resolve, reject) => {
        let resFiles = {};
        readdirRecursivePromise(directory).then(files => {
            files.forEach((file, i) => {
                resFiles[file.path] = {
                    'timestamp': (new Date).getTime(),
                    'type': file.type,
                    'size': file.data.byteLength,
                    'data': file.data
                };
            });
            resolve(resFiles);
        }).catch(err => {
            reject(err);
        });
    });
};