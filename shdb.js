const mime = require('mime-types')
const lzma = require('lzma-native')
const fs = require('fs')

let database = {}

const readDirPromise = path => {
    return new Promise((resolve, reject) => {
        fs.readdir(path, (err, files) => {
            if (err) {
                reject(err)
            } else {
                resolve({ 'path': path, 'files': files })
            }
        })
    })
}
const statPromise = path => {
    return new Promise((resolve, reject) => {
        fs.stat(path, (err, stats) => {
            if (err) {
                reject(err)
            } else {
                resolve({ 'path': path, 'stats': stats })
            }
        })
    })
}
const readDir = mainPath => {
    return new Promise((resolve, reject) => {
        let files = []
        let directories = [mainPath]
        readDirPromise(mainPath).then(dirInfo => {
            let statArr = []
            dirInfo.files.forEach((path, pathIndex) => {
                statArr.push(statPromise(`${dirInfo['path']}/${path}`))
            })
            return Promise.all(statArr)
        }).then(statInfo => {
            let subDirectories = []
            let readyToRead = true
            statInfo.forEach((stat, statIndex) => {
                if (exports.database !== {}) {
                    if (Object.keys(exports.database).indexOf(stat.path.replace(mainPath, '')) !== -1) {
                        if (stat.stats.mtime > exports.database[stat.path.replace(mainPath, '')].stats.mtime) {
                            if (stat.stats.isDirectory()) {
                                exports.database[stat.path.replace(mainPath, '') || '/'] = { 'path': stat.path, 'linkPath': stat.path.replace(mainPath, ''), 'stats': stat.stats }
                                subDirectories.push(stat.path)
                            } else if (stat.stats.isFile()) {
                                if (mime.lookup(stat.path)) {
                                    exports.database[stat.path.replace(mainPath, '')] = { 'path': stat.path, 'linkPath': stat.path.replace(mainPath, ''), 'type': mime.lookup(stat.path), 'stats': stat.stats, 'data': fs.readFileSync(stat.path) }
                                } else {
                                    exports.database[stat.path.replace(mainPath, '')] = { 'path': stat.path, 'linkPath': stat.path.replace(mainPath, ''), 'type': 'unknown', 'stats': stat.stats, 'data': fs.readFileSync(stat.path) }
                                }
                            }
                        } else {

                        }
                    } else {
                        if (stat.stats.isDirectory()) {
                            exports.database[stat.path.replace(mainPath, '') || '/'] = { 'path': stat.path, 'linkPath': stat.path.replace(mainPath, ''), 'stats': stat.stats }
                            subDirectories.push(stat.path)
                        } else if (stat.stats.isFile()) {
                            if (mime.lookup(stat.path)) {
                                exports.database[stat.path.replace(mainPath, '')] = { 'path': stat.path, 'linkPath': stat.path.replace(mainPath, ''), 'type': mime.lookup(stat.path), 'stats': stat.stats, 'data': fs.readFileSync(stat.path) }
                            } else {
                                exports.database[stat.path.replace(mainPath, '')] = { 'path': stat.path, 'linkPath': stat.path.replace(mainPath, ''), 'type': 'unknown', 'stats': stat.stats, 'data': fs.readFileSync(stat.path) }
                            }
                        }
                    }
                } else {
                    if (stat.stats.isDirectory()) {
                        exports.database[stat.path.replace(mainPath, '') || '/'] = { 'path': stat.path, 'linkPath': stat.path.replace(mainPath, ''), 'stats': stat.stats }
                        subDirectories.push(stat.path)
                    } else if (stat.stats.isFile()) {
                        if (mime.lookup(stat.path)) {
                            exports.database[stat.path.replace(mainPath, '')] = { 'path': stat.path, 'linkPath': stat.path.replace(mainPath, ''), 'type': mime.lookup(stat.path), 'stats': stat.stats, 'data': fs.readFileSync(stat.path) }
                        } else {
                            exports.database[stat.path.replace(mainPath, '')] = { 'path': stat.path, 'linkPath': stat.path.replace(mainPath, ''), 'type': 'unknown', 'stats': stat.stats, 'data': fs.readFileSync(stat.path) }
                        }
                    }
                }
            })
            let readInterval = setInterval(() => {
                if (subDirectories.length > 0 && readyToRead) {
                    readyToRead = false
                    readDirPromise(subDirectories.pop()).then(dirInfo => {
                        let statArr = []
                        dirInfo.files.forEach((path, pathIndex) => {
                            statArr.push(statPromise(`${dirInfo['path']}/${path}`))
                        })
                        return Promise.all(statArr)
                    }).then(statInfo => {
                        statInfo.forEach((stat, statIndex) => {
                            if (exports.database !== {}) {
                                if (Object.keys(exports.database).indexOf(stat.path.replace(mainPath, '')) !== -1) {
                                    if (stat.stats.mtime > exports.database[stat.path.replace(mainPath, '')].stats.mtime) {
                                        if (stat.stats.isDirectory()) {
                                            exports.database[stat.path.replace(mainPath, '') || '/'] = { 'path': stat.path, 'linkPath': stat.path.replace(mainPath, ''), 'stats': stat.stats }
                                            subDirectories.push(stat.path)
                                        } else if (stat.stats.isFile()) {
                                            if (mime.lookup(stat.path)) {
                                                exports.database[stat.path.replace(mainPath, '')] = { 'path': stat.path, 'linkPath': stat.path.replace(mainPath, ''), 'type': mime.lookup(stat.path), 'stats': stat.stats, 'data': fs.readFileSync(stat.path) }
                                            } else {
                                                exports.database[stat.path.replace(mainPath, '')] = { 'path': stat.path, 'linkPath': stat.path.replace(mainPath, ''), 'type': 'unknown', 'stats': stat.stats, 'data': fs.readFileSync(stat.path) }
                                            }
                                        }
                                    } else {

                                    }
                                } else {
                                    if (stat.stats.isDirectory()) {
                                        exports.database[stat.path.replace(mainPath, '') || '/'] = { 'path': stat.path, 'linkPath': stat.path.replace(mainPath, ''), 'stats': stat.stats }
                                        subDirectories.push(stat.path)
                                    } else if (stat.stats.isFile()) {
                                        if (mime.lookup(stat.path)) {
                                            exports.database[stat.path.replace(mainPath, '')] = { 'path': stat.path, 'linkPath': stat.path.replace(mainPath, ''), 'type': mime.lookup(stat.path), 'stats': stat.stats, 'data': fs.readFileSync(stat.path) }
                                        } else {
                                            exports.database[stat.path.replace(mainPath, '')] = { 'path': stat.path, 'linkPath': stat.path.replace(mainPath, ''), 'type': 'unknown', 'stats': stat.stats, 'data': fs.readFileSync(stat.path) }
                                        }
                                    }
                                }
                            } else {
                                if (stat.stats.isDirectory()) {
                                    exports.database[stat.path.replace(mainPath, '') || '/'] = { 'path': stat.path, 'linkPath': stat.path.replace(mainPath, ''), 'stats': stat.stats }
                                    subDirectories.push(stat.path)
                                } else if (stat.stats.isFile()) {
                                    if (mime.lookup(stat.path)) {
                                        exports.database[stat.path.replace(mainPath, '')] = { 'path': stat.path, 'linkPath': stat.path.replace(mainPath, ''), 'type': mime.lookup(stat.path), 'stats': stat.stats, 'data': fs.readFileSync(stat.path) }
                                    } else {
                                        exports.database[stat.path.replace(mainPath, '')] = { 'path': stat.path, 'linkPath': stat.path.replace(mainPath, ''), 'type': 'unknown', 'stats': stat.stats, 'data': fs.readFileSync(stat.path) }
                                    }
                                }
                            }
                        })
                        readyToRead = true
                    }).catch(err => {
                        clearInterval(readInterval)
                        reject(err)
                    })
                } else if (subDirectories.length === 0 && readyToRead) {
                    clearInterval(readInterval)
                    let data = {}
                    files.forEach((file, fileIndex) => {
                        data[file.linkPath] = file
                    })
                    directories.forEach((directory, directoryIndex) => {
                        data[directory.linkPath || '/'] = directory
                    })

                    resolve('finished')
                }
            }, 1)
        }).catch(err => {
            reject(err)
        })
    })
}
const cipherDir = (directory, password) => {
    return new Promise((resolve, reject) => {
        readDir(directory).then(files => {
            let count = 0
            // console.log(new Date().getTime())
            Object.keys(files).forEach((fileKey, fileKeyIndex) => {
                if (typeof files[fileKey] === 'object') {
                    if (files[fileKey].path.indexOf('.DS_Store') === -1) {
                        const cipher = crypto.createCipher('aes256', password)
                        const input = fs.createReadStream(files[fileKey].path)
                        const output = fs.createWriteStream(`${files[fileKey].path}.enc`)
                        let stream = input.pipe(cipher).pipe(output)
                        stream.on('finish', () => {
                            fs.unlink(files[fileKey].path, () => {
                                count = count + 1
                                if (count >= Object.keys(files).length) {
                                    resolve('finished')
                                }
                            })
                        })
                    } else {
                        count = count + 1
                        if (count >= Object.keys(files).length) {
                            resolve('finished')
                        }
                    }
                }
            })
        }).catch(err => {
            reject(err)
        })
    })
}
const decipherDir = (directory, password) => {
    return new Promise((resolve, reject) => {
        readDir(directory).then(files => {
            let count = 0
            Object.keys(files).forEach((fileKey, fileKeyIndex) => {
                if (typeof files[fileKey] === 'object') {
                    if (files[fileKey].path.indexOf('.DS_Store') === -1 && files[fileKey].path.indexOf('.enc') !== -1) {
                        const decipher = crypto.createDecipher('aes256', password)
                        const input = fs.createReadStream(files[fileKey].path)
                        const output = fs.createWriteStream(files[fileKey].path.replace('.enc', ''))
                        let stream = input.pipe(decipher).pipe(output)
                        stream.on('finish', () => {
                            fs.unlinkSync(files[fileKey].path)
                            count = count + 1
                            if (count >= Object.keys(files).length) {
                                resolve('finished')
                            }
                        })
                    } else {
                        count = count + 1
                        if (count >= Object.keys(files).length) {
                            resolve('finished')
                        }
                    }
                }
            })
        }).catch(err => {
            reject(err)
        })
    })
}
const readFile = path => {
    return new Promise((resolve, reject) => {
        statPromise(path).then(stat => {
            if (stat.stats.isFile()) {
                if (mime.lookup(stat.path)) {
                    resolve({ 'path': stat.path, 'linkPath': stat.path.replace(path, ''), 'type': mime.lookup(stat.path), 'stats': stat.stats, 'data': fs.readFileSync(stat.path) })
                } else {
                    resolve({ 'path': stat.path, 'linkPath': stat.path.replace(path, ''), 'type': 'unknown', 'stats': stat.stats, 'data': fs.readFileSync(stat.path) })
                }
            }
        }).catch(err => {
            // console.log(err)
        })
    })
}
const statsFile = path => {
    return new Promise((resolve, reject) => {
        statPromise(path).then(stat => {
            if (stat.stats.isFile()) {
                if (mime.lookup(stat.path)) {
                    resolve({ 'path': stat.path, 'linkPath': stat.path.replace(path, ''), 'type': mime.lookup(stat.path), 'stats': stat.stats })
                } else {
                    resolve({ 'path': stat.path, 'linkPath': stat.path.replace(path, ''), 'type': 'unknown', 'stats': stat.stats })
                }
            }
        }).catch(err => {
            // console.log(err)
        })
    })
}
const cipherFile = (path, password) => {
    return new Promise((resolve, reject) => {
        try {
            const cipher = crypto.createCipher('aes256', password)
            const input = fs.createReadStream(path)
            const output = fs.createWriteStream(`${path}.enc`)
            let stream = input.pipe(cipher).pipe(output)
            stream.on('finish', () => {
                fs.unlink(path, () => {
                    resolve('finished')
                })
            })
        } catch (err) {
            reject(err)
        }
    })
}
const decipherFile = (path, password) => {
    return new Promise((resolve, reject) => {
        try {
            const decipher = crypto.createDecipher('aes256', password)
            const input = fs.createReadStream(path)
            const output = fs.createWriteStream(path.replace('.enc', ''))
            let stream = input.pipe(decipher).pipe(output)
            stream.on('finish', () => {
                fs.unlink(path, () => {
                    resolve('finished')
                })
            })
        } catch (err) {
            reject(err)
        }
    })
}
const compressFile = path => {
    return new Promise((resolve, reject) => {
        try {
            shdb.readFile(path).then(fileObject => {
                lzma.compress(fileObject.data, 9).then(result => {
                    fs.writeFileSync(`${fileObject.path}.xz`, result)
                    fs.unlink(fileObject.path, () => {
                        resolve('finished')
                    })
                }).catch(err => {
                    reject(err)
                })
            }).catch(err => {
                reject(err)
            })
        } catch (err) {
            reject(err)
        }
    })
}
const decompressFile = path => {
    return new Promise((resolve, reject) => {
        try {
            lzma.decompress(fs.readFileSync(`${path}.xz`)).then(result => {
                fs.writeFileSync(path, result)
                fs.unlink(`${path}.xz`, () => {
                    resolve('finished')
                })
            }).catch(err => {
                // console.log(err)
            })
        } catch (err) {
            reject(err)
        }
    })
}
exports.database = database
exports.readDir = readDir
exports.cipherDir = cipherDir
exports.decipherDir = decipherDir
exports.readFile = readFile
exports.statsFile = statsFile
exports.cipherFile = cipherFile
exports.decipherFile = decipherFile
exports.compressFile = compressFile
exports.decompressFile = decompressFile