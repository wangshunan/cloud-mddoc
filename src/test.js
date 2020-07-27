const qiniu = require('qiniu')
const QiniuManager = require('./utils/QiniuManager')

var accessKey = 'maBRzQ-5bJTmbVTiUdXTg266uKVXMpc9fTHXO1JS';
var secretKey = '1BjMm7WQpE4_XkjJa9dAHdTSkJOjN_0pLsVohErg';

var localFile = "/Users/wangs/Desktop/123456.md";
var key='123456.md';
var path = '/Users/wangs/Desktop/test.md'

const manager = new QiniuManager(accessKey, secretKey, 'clouddoc-wang')

// manager.uploadFile(key, localFile)
// manager.uploadFile(key, localFile).then((data) => {
//     console.log(data)
//     return manager.deleteFile(key)
// }).then((data) => {
//     console.log(data)
//     console.log('删除成功')
// })

// manager.getBucketDomain().then((data) => {
//     console.log(data)
// })

// manager.generateDownloadLink('123456.md').then((data) => {
//     console.log(data)
// })

manager.uploadFile(key, localFile).then(() => {
    console.log('成功')
}).catch(err => {
    console.error(err)
})