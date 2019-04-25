# shdb: setHacked database - a database app.

find a dev here if you need help: https://discord.gg/RRHvYUe

```js
let shdb = require('shdb')
shdb.readDir('/path/to/database/directory').then(success => {
    console.log(success) // this will just say finished.
    console.log(shdb.database) // this will output all directories and files found under your data directory
    // if you want your database to update on file changes as they come in, you can do something like this
    let watched = []
    let trackDir = () => {
        Object.keys(shdb.database).forEach(databaseKey => {
            if (shdb.database[databaseKey].type === 'directory' && watched.indexOf(databaseKey) === -1) {
                watched.push(databaseKey)
                fs.watch(shdb.database[databaseKey].path, (eventType, filename) => {
                    shdb.readDir('/path/to/datadatabase/directory').then(success => {
                        console.log('file update')
                        trackDir()
                    }).catch(err => {
                        console.log(err)
                    })
                })
            }
        })
    }
    trackDir()
}).catch(err => {
    console.log(err)
})
```

![Alt Text](https://i.imgur.com/UqW3X39.gif)