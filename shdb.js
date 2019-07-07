const mime = require('mime-types')
const fs = require('fs')
const readDirPromise = (path, timeout = 10000) => new Promise((resolve, reject) => {
    try {
        let readDirPromiseTimeout = setTimeout(() => {
            reject('minor readDirPromise timeout')
        }, timeout)
        fs.readdir(path, (err, files) => {
            if (err) {
                clearTimeout(readDirPromiseTimeout)
                reject(`major fs.readdir error \n${util.inspect(err)}\npath: ${path}`)
            } else {
                clearTimeout(readDirPromiseTimeout)
                resolve({ 'path': path, 'files': files })
            }
        })
    } catch (err) {
        reject(`major readDirPromise error \n${util.inspect(err)}`)
    }
})
const statPromise = (path, timeout = 10000) => new Promise((resolve, reject) => {
    try {
        let statPromiseTimeout = setTimeout(() => {
            reject('minor statPromise timeout')
        }, timeout)
        fs.stat(path, (err, stats) => {
            if (err) {
                clearTimeout(statPromiseTimeout)
                reject(`major fs.stat error \n${util.inspect(err)}\npath: ${path}`)
            } else {
                clearTimeout(statPromiseTimeout)
                resolve({ 'path': path, 'stats': stats })
            }
        })
    } catch (err) {
        reject(`major statPromise error \n${util.inspect(err)}`)
    }
})
const drillDirPromise = (path, timeout = 10000) => new Promise((resolve, reject) => {
    try {
        let drillDirPromiseTimeout = setTimeout(() => {
            reject('minor drillDirPromise timeout')
        }, timeout)
        let recursiveReadReady = true
        let subDirectories = []
        let drillOutput = {
            files: {},
            directories: {}
        }
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
                    drillOutput.directories[stat.path] = { stats: stat }
                } else if (stat.stats.isFile() === true) {
                    drillOutput.files[stat.path] = { stats: stat }
                }
            })
            let recursiveRead = setInterval(() => {
                if (subDirectories.length <= 0 && recursiveReadReady === true) {
                    clearTimeout(drillDirPromiseTimeout)
                    // clearInterval(recursiveRead)
                    resolve(drillOutput)
                } else if (recursiveReadReady) {
                    recursiveReadReady = false
                    let newDirectory = subDirectories.pop()
                    readDirPromise(newDirectory).then(dir => {
                        let fileStats = []
                        dir.files.forEach((file, fileIndex) => {
                            fileStats.push(statPromise(`${dir.path}/${file}`))
                        })
                        return Promise.all(fileStats)
                    }).then(stats => {
                        stats.forEach((stat, statIndex) => {
                            if (stat.stats.isDirectory() === true) {
                                subDirectories.push(stat.path)
                                drillOutput.directories[stat.path] = { stats: stat }
                            } else if (stat.stats.isFile() === true) {
                                drillOutput.files[stat.path] = { stats: stat }
                            }
                        })
                        recursiveReadReady = true
                    }).catch(err => {
                        clearTimeout(drillDirPromiseTimeout)
                        clearInterval(recursiveRead)
                        reject(`major readDirPromise error \n${util.inspect(err)}\npath: ${newDirectory}`)
                    })
                }
            }, 1)
        }).catch(err => {
            clearTimeout(drillDirPromiseTimeout)
            reject(`major readDirPromise error \n${util.inspect(err)}\npath: ${path}`)
        })
    } catch (err) {
        reject(`major drillDirPromise error \n${util.inspect(err)}`)
    }
})
const syncDatabasePromise = (path, timeout = 10000) => new Promise((resolve, reject) => {
    try {
        let syncDatabasePromiseTimeout = setTimeout(() => {
            reject('minor syncDatabasePromise timeout')
        }, timeout)
        drillDirPromise(path).then(drillOutput => {
            let fileKeys = Object.keys(drillOutput.files)
            let filesToCheck = fileKeys.length
            let filesChecked = 0
            let directoryKeys = Object.keys(drillOutput.directories)
            let dirsToCheck = directoryKeys.length
            let dirsChecked = 0
            fileKeys.forEach((fileKey, fileKeyIndex) => {
                if (Object.keys(exports.database.files).indexOf(fileKey) !== -1) {
                    drillStat = JSON.stringify({ size: drillOutput.files[fileKey].stats.stats.size, mtime: drillOutput.files[fileKey].stats.stats.mtime })
                    dbStat = JSON.stringify({ size: exports.database.files[fileKey].stats.stats.size, mtime: exports.database.files[fileKey].stats.stats.mtime })
                    if (drillStat !== dbStat) {
                        // console.log(`file change detected: ${fileKey}`)
                        fs.readFile(fileKey, (err, data) => {
                            if (err) {
                                // console.log(`major error reading ${fileKey}`)
                                filesChecked += 1
                                if (filesChecked === filesToCheck && dirsChecked === dirsToCheck) {
                                    clearTimeout(syncDatabasePromiseTimeout)
                                    resolve('syncFinished')
                                }
                            } else {
                                exports.database.files[fileKey] = {
                                    stats: drillOutput.files[fileKey].stats,
                                    data: data,
                                    byteLength: data.byteLength,
                                    type: exports.database.files[fileKey].type
                                }
                                filesChecked += 1
                                if (filesChecked === filesToCheck && dirsChecked === dirsToCheck) {
                                    clearTimeout(syncDatabasePromiseTimeout)
                                    resolve('syncFinished')
                                }
                            }
                        })
                    } else {
                        filesChecked += 1
                        if (filesChecked === filesToCheck && dirsChecked === dirsToCheck) {
                            clearTimeout(syncDatabasePromiseTimeout)
                            resolve('syncFinished')
                        }
                    }
                } else {
                    fs.readFile(fileKey, (err, data) => {
                        if (err) {
                            // console.log(`major error reading ${fileKey}`)
                            filesChecked += 1
                            if (filesChecked === filesToCheck && dirsChecked === dirsToCheck) {
                                clearTimeout(syncDatabasePromiseTimeout)
                                resolve('syncFinished')
                            }
                        } else {
                            let lookup = mime.lookup(fileKey)
                            if (lookup === false) {
                                filesChecked += 1
                                if (filesChecked === filesToCheck && dirsChecked === dirsToCheck) {
                                    clearTimeout(syncDatabasePromiseTimeout)
                                    resolve('syncFinished')
                                }
                            } else {
                                // console.log(`new file detected: ${fileKey}`)
                                exports.database.files[fileKey] = {
                                    stats: drillOutput.files[fileKey].stats,
                                    data: data,
                                    byteLength: data.byteLength,
                                    type: lookup
                                }
                                filesChecked += 1
                                if (filesChecked === filesToCheck && dirsChecked === dirsToCheck) {
                                    clearTimeout(syncDatabasePromiseTimeout)
                                    resolve('syncFinished')
                                }
                            }
                        }
                    })
                }
            })
            directoryKeys.forEach((directoryKey, directoryKeyIndex) => {
                if (Object.keys(exports.database.directories).indexOf(directoryKey) !== -1) {
                    if (JSON.stringify(drillOutput.directories[directoryKey].stats) !== JSON.stringify(exports.database.directories[directoryKey].stats)) {
                        // console.log(`directory change detected: ${directoryKey}`)
                        exports.database.directories[directoryKey] = {
                            stats: drillOutput.directories[directoryKey].stats
                        }
                        dirsChecked += 1
                        if (filesChecked === filesToCheck && dirsChecked === dirsToCheck) {
                            clearTimeout(syncDatabasePromiseTimeout)
                            resolve('syncFinished')
                        }
                    } else {
                        dirsChecked += 1
                        if (filesChecked === filesToCheck && dirsChecked === dirsToCheck) {
                            clearTimeout(syncDatabasePromiseTimeout)
                            resolve('syncFinished')
                        }
                    }
                } else {
                    // console.log(`new directory detected: ${directoryKey}`)
                    exports.database.directories[directoryKey] = {
                        stats: drillOutput.directories[directoryKey].stats
                    }
                    dirsChecked += 1
                    if (filesChecked === filesToCheck && dirsChecked === dirsToCheck) {
                        clearTimeout(syncDatabasePromiseTimeout)
                        resolve(`init sync finished`)
                    }
                }
            })
        }).catch(err => {
            clearTimeout(syncDatabasePromiseTimeout)
            reject(err)
        })
    } catch (err) {
        reject(`major syncDatabasePromise error \n${util.inspect(err)}`)
    }
})

exports.database = { files: {}, directories: {} }
exports.drillDirPromise = drillDirPromise
exports.syncDatabasePromise = syncDatabasePromise