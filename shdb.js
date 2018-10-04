const mime = require('mime-types')

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
                if (stat.stats.isDirectory()) {
                    subDirectories.push(stat.path)
                } else if (stat.stats.isFile()) {
                    if (mime.lookup(stat.path)) {
                        files.push({ 'path': stat.path, 'type': mime.lookup(stat.path), 'stats': stat.stats, 'data': fs.readFileSync(stat.path) })
                    } else {
                        files.push({ 'path': stat.path, 'type': 'unknown', 'stats': stat.stats, 'data': fs.readFileSync(stat.path) })
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
                            if (stat.stats.isDirectory()) {
                                subDirectories.push(stat.path)
                            } else if (stat.stats.isFile()) {
                                if (mime.lookup(stat.path)) {
                                    files.push({ 'path': stat.path, 'type': mime.lookup(stat.path), 'stats': stat.stats, 'data': fs.readFileSync(stat.path) })
                                } else {
                                    files.push({ 'path': stat.path, 'type': 'unknown', 'stats': stat.stats, 'data': fs.readFileSync(stat.path) })
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
                    resolve(files)
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
            let count = 1
            // console.log(new Date().getTime())
            files.forEach((file, fileIndex) => {
                if (file.path.indexOf('.DS_Store') === -1) {
                    const cipher = crypto.createCipher('aes256', password)
                    const input = fs.createReadStream(file.path)
                    const output = fs.createWriteStream(`${file.path}.enc`)
                    let stream = input.pipe(cipher).pipe(output)
                    stream.on('finish', () => {
                        fs.unlink(file.path, () => {
                            count = count + 1
                            if (count === files.length) {
                                resolve('finished')
                            }
                        })
                    })
                } else {
                    count = count + 1
                    if (count === files.length) {
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
        readDir(directory).then(files => {
            let count = 1
            files.forEach((file, fileIndex) => {
                if (file.path.indexOf('.DS_Store') === -1 && file.path.indexOf('.enc') !== -1) {
                    const decipher = crypto.createDecipher('aes256', password)
                    const input = fs.createReadStream(file.path)
                    const output = fs.createWriteStream(file.path.replace('.enc', ''))
                    let stream = input.pipe(decipher).pipe(output)
                    stream.on('finish', () => {
                        fs.unlink(file.path, () => {
                            count = count + 1
                            if (count >= files.length) {
                                resolve('finished')
                            }
                        })
                    })
                } else {
                    count = count + 1
                    if (count >= files.length) {
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

exports.readDir = readDir
exports.cipherDir = cipherDir
exports.decipherDir = decipherDir
exports.cipherFile = cipherFile
exports.decipherFile = decipherFile