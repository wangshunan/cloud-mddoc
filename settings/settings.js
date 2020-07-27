const { remote, ipcRenderer } = require('electron')
const Store = require('electron-store')
const settingsStore = new Store({name: 'Settings'})
const qiniuConfigArr = ['#savedFileLocation', '#accessKey', '#secretKey', '#bucketName']

const $ = (selector) => {
    const result = document.querySelectorAll(selector)
    return result.length > 1 ? result : result[0]
}

document.addEventListener('DOMContentLoaded', () => {

    qiniuConfigArr.forEach( config => {
        let configValue = settingsStore.get(config.substr(1))
        if ( configValue ) {
            $(config).value = configValue
        }
    })

    $('#select-new-location').addEventListener('click', () => {
        remote.dialog.showOpenDialog({
            properties: ['openDirectory'],
            message: 'ファイル保存先'
        }).then( result => {
            const path = result.filePaths
            if ( path ) {
                $('#savedFileLocation').value = path
                settingsStore.set('savedFileLocation', path)
            }
        })
    })

    $('#settings-form').addEventListener('submit', () => {
        qiniuConfigArr.forEach(config => {
            let configValue = settingsStore.get(config.substr(1))
            let { id, value } = $(config)
            value = value ? value : ''
            if ( value !== configValue ) {
                settingsStore.set(id, value)
            }
        })

        // sent a event back to main process to enable menu items if qiniu is config
        ipcRenderer.send('config-is-saved')
        remote.getCurrentWindow().close()
    })

    $('.nav-tabs').addEventListener('click', (e) => {
        e.preventDefault()
        // remove all element active
        $('.nav-link').forEach(element => {
            element.classList.remove('active')
        })

        // add selected tab active
        e.target.classList.add('active')

        // don't show old tab items
        $('.config-area').forEach(element => {
            element.style.display = 'none'
        })

        // show new tab items
        $(e.target.dataset.tab).style.display = 'block'
    })
})
