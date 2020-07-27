const { app, Menu, ipcMain, dialog } = require('electron')
const isDev = require('electron-is-dev')
const menuTemplate = require('./src/menuTemplate')
const AppWindow = require('./src/AppWindow')
const QiniuManager = require('./src/utils/QiniuManager')
const path = require('path')
const Store = require('electron-store')
const filesStore = new Store({name: 'Files Data'})
const settingsStore = new Store({name: 'settings'})

const createQiniuManager = () => {
    const accessKey = settingsStore.get('accessKey')
    const secretKey = settingsStore.get('secretKey')
    const bucketName = settingsStore.get('bucketName')

    return new QiniuManager(accessKey, secretKey, bucketName)
}

const splitFileName = (fileName) => {
    var pattern = /\.{1}[a-z]{1,}$/
    if ( pattern.exec(fileName) !== null ) {
        return (fileName.slice(0, pattern.exec(fileName).index))
    } else {
        return fileName
    }
}

const setLoading = (toggle) => {
    return mainWindow.webContents.send('loading-status', toggle)
}


let mainWindow, settingsWindow

app.on('ready', () => {
    const mainWindowConfig = {
        width: 1024,
        height: 680,
    }
    const urlLocation = isDev ? 'http://localhost:3000/' : 'dummyurl'
    mainWindow = new AppWindow(mainWindowConfig, urlLocation)
    mainWindow.on('closed', () => {
        mainWindow = null
    })

    // set the custom menu
    const menu = Menu.buildFromTemplate(menuTemplate)
    mainWindow.setMenu(menu)

    // hook up main events
    ipcMain.on('open-settings-window', () => {
        const windowConfig = {
            width: 500,
            height: 400,
            parent: mainWindow
        }

        const settingsFileLocation = `file://${path.join(__dirname, './settings/settings.html')}`
        settingsWindow = new AppWindow(windowConfig, settingsFileLocation)
        settingsWindow.on('closed', () => {
            mainWindow = null
        })
        // settingsWindow.removeMenu()
    })

    ipcMain.on('config-is-saved', () => {
        // watch out menu items index for mac and windows
        let targetSubMenu
        menu.items.filter(item => {
            if ( item.label === 'SyncSetting' ) {
                targetSubMenu = item.submenu
            }
        })

        const qiniuIsConfiged = ['accessKey', 'secretKey', 'bucketName'].every(config => !!settingsStore.get(config))
        const itemsIndex = [1, 2, 3]
        itemsIndex.forEach(number => {
            targetSubMenu.items[number].enabled = qiniuIsConfiged
        })

    })

    ipcMain.on('download-file', (event, data) => {
        setLoading(true)
        const manager = createQiniuManager()
        const filesObj = filesStore.get('files')
        let fileStatus = ''
        manager.getStat(data.key).then((resp) => {
            const serverUpdatedTime = Math.round(resp.putTime / 10000)
            let syncededTime = filesObj[data.id].syncedAt
            if ( serverUpdatedTime > syncededTime ) {
                console.log('newFile dowloaded')
                syncededTime = new Date().getTime()
                manager.downloadFile(data.key, data.path).then((result) => {
                    fileSatus = 'download-success'
                })
            } else {
                console.log('no newFile')
                fileSatus = 'no-new-file'
            }
            mainWindow.webContents.send('active-file-download', { status: fileStatus, id: data.id, downloadedAt: syncededTime })
        }, (e) => {
            console.log(e)
        }).finally(() => {
            setLoading(false)
        })
    })

    ipcMain.on('upload-file', (event, data) => {
        setLoading(true)
        const manager = createQiniuManager()
        manager.uploadFile(data.key, data.path).then(data => {
            const uploadedTime = new Date().getTime()
            mainWindow.webContents.send('active-file-uploaded', uploadedTime)
        }).catch((e) => {
            console.log(e)
            console.log('失败')
            dialog.showErrorBox('同期失敗', 'Qiniu設定をチェックしてください')
        }).finally(() => {
            setLoading(false)
        })
    })

    ipcMain.on('delete-file', (event, key) => {
        setLoading(true)
        const manager = createQiniuManager()

        manager.deleteFile(key).catch((e) => {
            console.log(e)
            let errMessage = 'Qiniu設定をチェックしてください'
            if ( e.statusCode === 612 ) {
                errMessage = 'ファイルが存在しない'
            }
            dialog.showErrorBox('クラウド上のファイル削除失敗', errMessage)
        }).finally(() => {
            setLoading(false)
        })
    })

    ipcMain.on('rename-file', (event, oldKey, newKey) => {
        const manager = createQiniuManager()
        setLoading(true)

        manager.rename(oldKey, newKey).then( () => {
            dialog.showMessageBox({ 
                type:'info', 
                title: '成功', 
                message:'ファイル名を変更しました' 
            })
        }).catch(() => {
            dialog.showErrorBox('エラー', 'クラウド上のファイル名を変更失敗しました')
        }).finally(() => {
            setLoading(false)
        })
    })

    ipcMain.on('upload-all-to-qiniu', (event) => {
        setLoading(true)
        const manager = createQiniuManager()
        const filesObj = filesStore.get('files')

        manager.uploadAllFile(filesObj).then(result => {
            dialog.showMessageBox({
                type: 'info',
                title: `成功`,
                message: `${result.length}個ファイルをアップロードしました。`
            })
            mainWindow.webContents.send('files-uploaded')
        }).catch(() => {
            dialog.showErrorBox('同期失敗', 'Qiniu設定をチェックしてください')
        }).finally(() => {
            setLoading(false)
        })
    })

    ipcMain.on('download-all-to-qiniu', (event) => {
        setLoading(true)
        const manager = createQiniuManager()

        const getSaveLoacation = (item) => {
            const saveLoaction = settingsStore.get('savedFileLocation')
            const filesObj = filesStore.get('files')
            let result = path.join(saveLoaction,  `/${item.key}`)
            if ( filesObj ) {
                Object.keys(filesObj).forEach(key => {
                    if ( splitFileName(item.key) === filesObj[key].title ) {
                        result = filesObj[key].path
                    }
                })
            }
            return result
        }

        manager.getServerFileList().then((resp) => {
            const downloadFileList = resp.items.map(item => {
                return {
                    key: item.key,
                    path: getSaveLoacation(item)
                }
            })
            manager.downloadAllFile(downloadFileList).then((result) => {
                dialog.showMessageBox({
                    type: 'info',
                    title: `成功`,
                    message: `${result.length}個ファイルをダウンロードしました。`
                })
                mainWindow.webContents.send('files-downloaded', downloadFileList)
            }).catch((e) => {
                dialog.showErrorBox('同期失敗', 'Qiniu設定をチェックしてください')
            })
        })
    })
}) 