const qiniu = require('qiniu')
const axios = require('axios')
const fs = require('fs')

class QiniuManager {
    constructor(accessKey, secretKey, bucket) {
        //
        this.mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
        this.bucket = bucket

        //
        this.config = new qiniu.conf.Config()
        // 空间对应的机房
        this.config.zone = qiniu.zone.Zone_z0

        this.bucketManager = new qiniu.rs.BucketManager(this.mac, this.config)
    }

    uploadFile(key, localFilePath) {
        //
        const options = {
            scope: this.bucket + ':' + key,
        }
        const putPolicy = new qiniu.rs.PutPolicy(options)
        const uploadToken = putPolicy.uploadToken(this.mac)
        const formUploader = new qiniu.form_up.FormUploader(this.config)
        const putExtra = new qiniu.form_up.PutExtra()

        return new Promise((resolve, reject) => {
            // 文件上传
            formUploader.putFile(uploadToken, key, localFilePath, putExtra, this._handleCallback(resolve, reject))
        })
    }

    deleteFile(key) {
        return new Promise((resolve, reject) => {
            this.bucketManager.delete(this.bucket, key, this._handleCallback(resolve,reject))    
        })
    }

    getBucketDomain() {
        const reqURL = `http://api.qiniu.com/v6/domain/list?tbl=${this.bucket}`
        const digest = qiniu.util.generateAccessToken(this.mac, reqURL)

        return new Promise((resolve, reject) => {
            qiniu.rpc.postWithoutForm(reqURL, digest, this._handleCallback(resolve, reject))
        })
    }

    generateDownloadLink(key) {
        const domainPromise = this.publicBucketDomain ? 
                                Promise.resolve([this.publicBucketDomain]) : this.getBucketDomain()
        
        return domainPromise.then(data => {
            if ( Array.isArray(data) && data.length > 0 ) {
                const pattern = /^https?/
                this.publicBucketDomain = pattern.test(data) ? data : `http://${data}`
                return this.bucketManager.publicDownloadUrl(this.publicBucketDomain, key)
            } else {
                throw Error(data + '域名无效')
            }
        })
    }

    downloadFile(key, downloadPath) {
        // step 1 get the download link
        return this.generateDownloadLink(key).then(link => {
            // step 2 send the request to download link, return a readable stream
            const timeStamp = new Date().getTime()
            const url = `${link}?timestamp=${timeStamp}`
            return axios({
                url,
                method: 'GET',
                responseType: 'stream',
                headers: {'Cache-Control': 'no-cache'}
            }).then(response => {
                // step 3 create a writeable stream and pipe to it
                const writer = fs.createWriteStream(downloadPath)
                response.data.pipe(writer)

                // step 4 return a promise based result
                return new Promise((resolve, reject) => {
                    writer.on('finish', resolve)
                    writer.on('error', reject)
                })
            }).catch(err => {
                return Promise.reject({ err: err.response })
            })
        })
    }

    uploadAllFile(filesObj) {

        const uploadPromiseArr = Object.keys(filesObj).map(key => {
            const file = filesObj[key]
            return this.uploadFile(`${file.title}.md`, file.path)
        })

        return Promise.all(uploadPromiseArr)
    }

    downloadAllFile(fileList) {
        const downloadPromiseArr = fileList.map(file => {
            return this.downloadFile(file.key, file.path)
        })
        return Promise.all(downloadPromiseArr)
    }

    getServerFileList() {
        return new Promise((resolve, reject) => {
            this.bucketManager.listPrefix(this.bucket, {}, this._handleCallback(resolve, reject))
        })
    }

    getStat(key) {
        return new Promise((resolve, reject) => {
            this.bucketManager.stat(this.bucket, key, this._handleCallback(resolve, reject))
        })
    }

    deleteFile(key) {
        return new Promise((resolve, reject) => {
            this.bucketManager.delete(this.bucket, key, this._handleCallback(resolve, reject))
        })
    }

    rename(oldKey, newKey) {
        var options = {
            force: true
        }
        return new Promise((resolve, reject) => {
            this.bucketManager.move(this.bucket, oldKey, this.bucket, newKey, options, this._handleCallback(resolve, reject))
        })
    }

    _handleCallback(resolve, reject) {
        return (respErr, respBody, respInfo) => {
            if (respErr) {
              throw respErr;
            }
            if (respInfo.statusCode === 200) {
              resolve(respBody)
            } else {
              reject({
                statusCode: respInfo.statusCode,
                body: respBody
              })
            }
          }
    }
}

module.exports = QiniuManager