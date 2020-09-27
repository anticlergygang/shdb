const crypto = require('crypto')
const fs = require('fs')
const fsp = require('fs').promises
const path = require('path')
const mime = require('mime-types')
let database = {
    files: {}
}
const syncDirToDatabase = async (directoryPath, filelist = []) => {
    const files = await fsp.readdir(directoryPath)
    for (file of files) {
        const filepath = path.join(directoryPath, file)
        const stat = await fsp.stat(filepath)
        if (stat.isDirectory()) {
            filelist = await syncDirToDatabase(filepath, filelist)
        } else {
            const fileHandle = await fsp.open(filepath)
            const data = await fileHandle.readFile()
            const stats = await fileHandle.stat()
            database.files[filepath] = {
                "data": data,
                "stats": stats,
                "type": mime.lookup(filepath)
            }
            fileHandle.close()
        }
    }
    return 'success'
}
crypto.scryptp = (password, salt, length) => {
    return new Promise((resolve, reject) => {
        crypto.scrypt(password, salt, length, (err, derivedKey) => {
            if (err) {
                reject(err)
            } else {
                resolve(derivedKey)
            }
        })
    })
}
const lockFile = async (path, password) => {
    try {
        const inputFileHandle = await fsp.open(path, 'r')
        const inputFileData = await inputFileHandle.readFile()
        const closeInputFile = await inputFileHandle.close()
        const fileWriteStream = fs.createWriteStream(`${path}.enc`)
        const salt = crypto.randomBytes(24)
        fileWriteStream.write(salt)
        const key = await crypto.scryptp(password, salt, 24)
        const iv = crypto.randomBytes(16)
        fileWriteStream.write(iv)
        const cipher = crypto.createCipheriv('aes-192-cbc', key, iv)
        cipher.on('readable', () => {
            let chunk
            while (null !== (chunk = cipher.read())) {
                fileWriteStream.write(chunk)
            }
        })
        cipher.on('end', () => {
            fileWriteStream.end()
            fsp.unlink(path)
        })
        cipher.write(inputFileData)
        cipher.end()
        return 'success'
    } catch (err) {
        console.log(err)
    }
}
const unLockFile = async (path, password) => {
    try {
        const inputFileHandle = await fsp.open(path, 'r')
        const inputFileData = await inputFileHandle.readFile()
        const closeInputFile = await inputFileHandle.close()
        const fileWriteStream = fs.createWriteStream(path.slice(0, -4))
        const salt = inputFileData.slice(0, 24)
        const key = await crypto.scryptp(password, salt, 24)
        const iv = inputFileData.slice(24, 40)
        const decipher = crypto.createDecipheriv('aes-192-cbc', key, iv)
        decipher.on('readable', () => {
            while (null !== (chunk = decipher.read())) {
                fileWriteStream.write(chunk)
            }
        })
        decipher.on('end', () => {
            fileWriteStream.end()
            fsp.unlink(path)
        })
        const encryptedData = inputFileData.slice(40)
        decipher.write(encryptedData)
        decipher.end()
        return 'success'
    } catch (err) {
        console.log(err)
    }
}
const lockDir = async (directoryPath, password, filelist = []) => {
    const files = await fsp.readdir(directoryPath)
    for (file of files) {
        const filepath = path.join(directoryPath, file)
        const stat = await fsp.stat(filepath)
        if (stat.isDirectory()) {
            filelist = await lockDir(filepath, password, filelist)
        } else {
            lockFile(filepath, password)
        }
    }
    return 'success'
}
const unLockDir = async (directoryPath, password, filelist = []) => {
    const files = await fsp.readdir(directoryPath)
    for (file of files) {
        const filepath = path.join(directoryPath, file)
        const stat = await fsp.stat(filepath)
        if (stat.isDirectory()) {
            filelist = await unLockDir(filepath, password, filelist)
        } else {
            unLockFile(filepath, password)
        }
    }
    return 'success'
}
exports.syncDirToDatabase = syncDirToDatabase
exports.database = database
exports.lockFile = lockFile
exports.unLockFile = unLockFile
exports.lockDir = lockDir
exports.unLockDir = unLockDir