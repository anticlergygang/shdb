# shdb - a database app.

find a dev here if you need help: https://discord.gg/p46mJWm

```js
let shdb = require('shdb')
shdb.syncDirToDatabase('/path/to/database/directory').then(success => { // init db
    console.log(success) // This will just say "finished".
    console.log(shdb.database) // This will output be an object of files found under your data directory inserted.
}).catch(err => {
    console.log(err)
})
```