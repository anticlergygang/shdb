const mime = require('mime-types')

const readdirPromise = path => {
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

exports.readdir = mainPath => {
    return new Promise((resolve, reject) => {
        let files = []
        readdirPromise(mainPath).then(dirInfo => {
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
                        files.push({ 'path': stat.path, 'type': mime.lookup(stat.path), 'stats': stat.stats, 'data': fs.readFileSync(stat.path)})
                    }
                }
            })
            let readInterval = setInterval(() => {
                if (subDirectories.length > 0 && readyToRead) {
                    readyToRead = false
                    readdirPromise(subDirectories.pop()).then(dirInfo => {
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
                                    files.push({ 'path': stat.path, 'type': mime.lookup(stat.path), 'stats': stat.stats, 'data': fs.readFileSync(stat.path)})
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