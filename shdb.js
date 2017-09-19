const fs = require('fs');
const mime = require('mime-types');
const flattenArray = (arr, result = []) => {
    for (let i = 0, length = arr.length; i < length; i++) {
        const value = arr[i];
        if (Array.isArray(value)) {
            flattenArray(value, result);
        } else {
            result.push(value);
        }
    }
    return result;
};
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
                                    'timestamp': (new Date).getTime(),
                                    'path': path,
                                    'type': mime.lookup(path),
                                    'data': data,
                                    'size': data.byteLength
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
exports.gatherFilesRecursivePromise = directory => {
    return new Promise((resolve, reject) => {
        const resFiles = {};
        readdirRecursivePromise(directory).then(files => {
            files.forEach((file, fileIndex) => {
                resFiles[file.path] = {
                    'timestamp': file.timestamp,
                    'type': file.type,
                    'data': file.data,
                    'size': file.size
                }
            });
            resolve(resFiles);
        }).catch(err => {
            reject(err);
        });
    });
};