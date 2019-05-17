const mime = require('mime-types')
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
const drillDirPromise = path => {
    return new Promise((resolve, reject) => {
        let recursiveReadReady = true
        let subDirectories = []
        let resolveDirectories = []
        let subFiles = []
        readDirPromise(path).then(initDir => {
            let fileStats = []
            initDir.files.forEach((file, fileIndex) => {
                fileStats.push(statPromise(`${path}/${file}`))
            })
            return Promise.all(fileStats)
        }).then(stats => {
            stats.forEach((stat, statIndex) => {
                if (stat.stats.isDirectory() === true) {
                    subDirectories.push(stat.path)
                    resolveDirectories.push(stat.path)
                } else if (stat.stats.isFile() === true) {
                    subFiles.push(stat.path)
                }
            })
            let recursiveRead = setInterval(() => {
                if (subDirectories.length <= 0) {
                    clearInterval(recursiveRead)
                    resolve({ files: subFiles, directories: resolveDirectories })
                } else if (recursiveReadReady) {
                    recursiveReadReady = false
                    readDirPromise(subDirectories.pop()).then(dir => {
                        let fileStats = []
                        dir.files.forEach((file, fileIndex) => {
                            fileStats.push(statPromise(`${dir.path}/${file}`))
                        })
                        return Promise.all(fileStats)
                    }).then(stats => {
                        stats.forEach((stat, statIndex) => {
                            if (stat.stats.isDirectory() === true) {
                                subDirectories.push(stat.path)
                                resolveDirectories.push(stat.path)
                            } else if (stat.stats.isFile() === true) {
                                subFiles.push(stat.path)
                            }
                        })
                        recursiveReadReady = true
                    }).catch(err => {
                        reject(err)
                    })
                }
            }, 1)
        }).catch(err => {
            reject(err)
        })
    })
}
const updateDatabase = mainPath => {
    return new Promise((resolve, reject) => {
        readDirPromise(mainPath).then(dirInfo => {
            let statArr = [statPromise(mainPath)]
            dirInfo.files.forEach((path, pathIndex) => {
                statArr.push(statPromise(`${dirInfo['path']}/${path}`))
            })
            return Promise.all(statArr)
        }).then(statInfo => {
            let subDirectories = []
            let readyToRead = true
            statInfo.forEach((stat, statIndex) => {
                if (exports.database[stat.path.replace(mainPath, '') || '/']) {
                    if (JSON.stringify(stat.stats) !== JSON.stringify(exports.database[stat.path.replace(mainPath, '') || '/'].stats)) {
                        if (stat.stats.isDirectory()) {
                            exports.database[stat.path.replace(mainPath, '') || '/'] = { 'path': stat.path, 'linkPath': stat.path.replace(mainPath, ''), 'stats': stat.stats, type: 'directory' }
                            subDirectories.push(stat.path)
                        } else if (stat.stats.isFile()) {
                            if (mime.lookup(stat.path)) {
                                exports.database[stat.path.replace(mainPath, '')] = { 'path': stat.path, 'linkPath': stat.path.replace(mainPath, ''), 'type': mime.lookup(stat.path), 'stats': stat.stats, 'data': fs.readFileSync(stat.path) }
                            } else {
                                exports.database[stat.path.replace(mainPath, '')] = { 'path': stat.path, 'linkPath': stat.path.replace(mainPath, ''), 'type': 'unknown', 'stats': stat.stats, 'data': fs.readFileSync(stat.path) }
                            }
                        }
                    } else {
                        if (stat.stats.isDirectory()) {
                            subDirectories.push(stat.path)
                        }
                    }
                } else {
                    if (stat.stats.isDirectory()) {
                        exports.database[stat.path.replace(mainPath, '') || '/'] = { 'path': stat.path, 'linkPath': stat.path.replace(mainPath, ''), 'stats': stat.stats, type: 'directory' }
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
                            if (exports.database[stat.path.replace(mainPath, '') || '/']) {
                                if (JSON.stringify(stat.stats) !== JSON.stringify(exports.database[stat.path.replace(mainPath, '') || '/'].stats)) {
                                    if (stat.stats.isDirectory()) {
                                        exports.database[stat.path.replace(mainPath, '') || '/'] = { 'path': stat.path, 'linkPath': stat.path.replace(mainPath, ''), 'stats': stat.stats, type: 'directory' }
                                        subDirectories.push(stat.path)
                                    } else if (stat.stats.isFile()) {
                                        if (mime.lookup(stat.path)) {
                                            exports.database[stat.path.replace(mainPath, '')] = { 'path': stat.path, 'linkPath': stat.path.replace(mainPath, ''), 'type': mime.lookup(stat.path), 'stats': stat.stats, 'data': fs.readFileSync(stat.path) }
                                        } else {
                                            exports.database[stat.path.replace(mainPath, '')] = { 'path': stat.path, 'linkPath': stat.path.replace(mainPath, ''), 'type': 'unknown', 'stats': stat.stats, 'data': fs.readFileSync(stat.path) }
                                        }
                                    }
                                } else {
                                    if (stat.stats.isDirectory()) {
                                        subDirectories.push(stat.path)
                                    }
                                }
                            } else {
                                if (stat.stats.isDirectory()) {
                                    exports.database[stat.path.replace(mainPath, '') || '/'] = { 'path': stat.path, 'linkPath': stat.path.replace(mainPath, ''), 'stats': stat.stats, type: 'directory' }
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
        drillDirPromise(directory).then(files => {
            let count = 0
            // console.log(new Date().getTime())
            files.files.forEach((fileKey, fileKeyIndex) => {
                if (fileKey.indexOf('.DS_Store') === -1) {
                    const cipher = crypto.createCipher('aes256', password)
                    const input = fs.createReadStream(fileKey)
                    const output = fs.createWriteStream(`${fileKey}.enc`)
                    let stream = input.pipe(cipher).pipe(output)
                    stream.on('finish', () => {
                        fs.unlink(fileKey, () => {
                            count = count + 1
                            if (count >= files.files.length) {
                                resolve('finished')
                            }
                        })
                    })
                } else {
                    count = count + 1
                    if (count >= files.files.length) {
                        resolve('finished')
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
        drillDirPromise(directory).then(files => {
            let count = 0
            files.files.forEach((fileKey, fileKeyIndex) => {
                if (fileKey.indexOf('.DS_Store') === -1 && fileKey.indexOf('.enc') !== -1) {
                    const decipher = crypto.createDecipher('aes256', password)
                    const input = fs.createReadStream(fileKey)
                    const output = fs.createWriteStream(fileKey.replace('.enc', ''))
                    let stream = input.pipe(decipher).pipe(output)
                    stream.on('finish', () => {
                        fs.unlinkSync(fileKey)
                        count = count + 1
                        if (count >= files.files.length) {
                            resolve('finished')
                        }
                    })
                } else {
                    count = count + 1
                    if (count >= files.files.length) {
                        resolve('finished')
                    }
                }
            })
        }).catch(err => {
            reject(err)
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

exports.drillDirPromise = drillDirPromise
exports.cipherDir = cipherDir
exports.decipherDir = decipherDir
exports.cipherFile = cipherFile
exports.decipherFile = decipherFile
exports.database = database
exports.updateDatabase = updateDatabase