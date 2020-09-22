# shdb - a database app.

find a dev here if you need help: https://discord.gg/p46mJWm

```js
const syncDirToDatabase = async (dir, filelist = []) => {
	/*
		This function returns the string "success" and will also update the shdb.database object with the files found under the directory suppied in the paramter.
	*/
}

/*

Warning, the functions below can result in data loss, so be careful when using them. You should take a look at the underlying code and understand it before using these functions.

*/

const lockFile = async (path, password) => {
	/*
		This function returns the string "success" and will also lock a file with a password.
	*/
}
const unLockFile = async (path, password) => {
	/*
		This function returns the string "success" and will also unlock a file with a password.
	*/
}
const lockDir = async (directoryPath, password, filelist = []) => {
	/*
		This function returns the string "success" and will also lock every file in a directory with a password.
	*/
}
const unLockDir = async (directoryPath, password, filelist = []) => {
	/*
		This function returns the string "success" and will also unlock every file in a directory with a password.
	*/
}

//database example, change '/path/to/database/directory' to some random test folder.
//    remeber to use absolute paths for everything.

let shdb = require('shdb')
shdb.syncDirToDatabase('/path/to/database/directory').then(success => { // init db
    console.log(success) // This will just say "finished".
    console.log(shdb.database) // This will output be an object of files found under your data directory inserted.
}).catch(err => {
    console.log(err)
})

//folderLock example

let shdb = require('shdb')
shdb.lockDir('C:\\Users\\anti\\Desktop\\test', 'password').then(success => {
	console.log(success)                    
}).catch(err => {
	console.log(err)
})
shdb.unLockDir('C:\\Users\\anti\\Desktop\\test', 'password').then(success => {
	console.log(success)                    
}).catch(err => {
	console.log(err)
})
```