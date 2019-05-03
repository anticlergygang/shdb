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
                    if (exports.database[stat.path.replace(mainPath, '') || '/'].stats.mtimeMs !== stat.stats.mtimeMs || exports.database[stat.path.replace(mainPath, '') || '/'].stats.ctimeMs !== stat.stats.ctimeMs || exports.database[stat.path.replace(mainPath, '') || '/'].stats.atimeMs !== stat.stats.atimeMs || exports.database[stat.path.replace(mainPath, '') || '/'].stats.birthtimeMs !== stat.stats.birthtimeMs) {
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
                        console.log(`update: ${stat.path}`)
                    } else {
                        console.log(`do nothing to: ${stat.path}`)
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
                    console.log(`update: ${stat.path}`)
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
                                if (exports.database[stat.path.replace(mainPath, '') || '/'].stats.mtimeMs !== stat.stats.mtimeMs || exports.database[stat.path.replace(mainPath, '') || '/'].stats.ctimeMs !== stat.stats.ctimeMs || exports.database[stat.path.replace(mainPath, '') || '/'].stats.atimeMs !== stat.stats.atimeMs || exports.database[stat.path.replace(mainPath, '') || '/'].stats.birthtimeMs !== stat.stats.birthtimeMs) {
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
                                    console.log(`update: ${stat.path}`)
                                } else {
                                    console.log(`do nothing to: ${stat.path}`)
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
                                console.log(`update: ${stat.path}`)
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
exports.database = database
exports.updateDatabase = updateDatabase