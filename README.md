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