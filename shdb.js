const crypto = require('crypto')
const fs = require('fs')
const fsp = require('fs').promises
const path = require('path')

let database = {
    files: {}
}

const syncDirToDatabase = async (dir, filelist = []) => {
    const files = await fsp.readdir(dir)
    for (file of files) {
        const filepath = path.join(dir, file)
        const stat = await fsp.stat(filepath)
        if (stat.isDirectory()) {
            filelist = await syncDirToDatabase(filepath, filelist)
        } else {
            const fileHandle = await fsp.open(filepath)
            const data = await fileHandle.readFile()
            const stats = await fileHandle.stat()
            database.files[filepath] = {
                "data": data,
                "stats": stats
            }
            fileHandle.close()
        }
    }
    return 'finished'
}

exports.syncDirToDatabase = syncDirToDatabase
exports.database = database