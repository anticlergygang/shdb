# shdb
https://discord.gg/RRHvYUe

```js
shdb.readdir('/path/to/dir').then(filesArray => {
    // an array of file objects that look like this
    // {
    //     path: '/Path/to.file',
    //     type: 'file mime-type',
    //     stats: {statsObject},
    //     data: <buffer >
    // }
}).catch(err => {
    console.log(err)
})

shdb.cipherdir('/path/to/dir', 'aes256-password').then(finished => {
    // directory cipher is finished when this promise resolves
}).catch(err => {
    console.log(err)
})

shdb.decipherdir('/path/to/dir', 'aes256-password').then(finished => {
    // directory decipher is finished when this promise resolves
}).catch(err => {
    console.log(err)
})
```

![Alt Text](https://i.imgur.com/UqW3X39.gif)

```js
/*  
    
    This is the code in the gif above because it's kinda blury.
    This code just recursivly reads a directory and cyphers all of the files inside,
        then 3 seconds later it deciphers it all.
    
    Change '/Users/anti/passthepotion', and process.env.DIRCIPHERKEY to something that will
    work for you.

    THIS COULD MAKE YOU LOSE DATA IF YOU DO IT WRONG, there now you can't say I didn't warn you.

*/ 

const shdb = require('shdb')

shdb.cipherdir('/Users/anti/passthepotion', process.env.DIRCIPHERKEY).then(out => {
    setTimeout(() => {
        shdb.decipherdir('/Users/anti/passthepotion', process.env.DIRCIPHERKEY).then(out => {
            console.log(out)
        }).catch(err => {
            console.log(err)
        })
    }, 3000)
}).catch(err => {
    console.log(err)
})
```