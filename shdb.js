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
                    fs.readFile(path, (err, data) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({
                                {
                                    'path': path,
                                    'type': mime.lookup(path),
                                    'data': data
                                }
                            });
                        }
                    });
                } else {
                    reject(`Error parsing path: ${path}`);
                }
            }
        });
    });
};
exports.initDBPromise = (path, conf = {}) => {
    return new Promise((resolve, reject) => {
        readdirRecursivePromise(path).then(files => {
            resolve(files);
        }).catch(err => {
            reject(err);
        });
    });
};