const { app, shell, ipcMain, ipcRenderer, remote } = require('electron')
const Store = require('electron-store')
const settingsStore = new Store({name: 'settings'})

const qiniuIsConfiged = ['accessKey', 'secretKey', 'bucketName'].every(config => !!settingsStore.get(config))
let enableAutoSync = settingsStore.get('enableAutoSync')

let template = [
  {
    label: 'Edite',
    submenu: [
      {
        label: 'Create',
        accelerator: 'CmdOrCtrl+N',
        click: ( menuItem, browserWindow, event ) => {
          browserWindow.webContents.send('create-new-file')
        }
      },
      {
        label: 'Save',
        accelerator: 'CmdOrCtrl+S',
        click: ( menuItem, browserWindow, event ) => {
          browserWindow.webContents.send('save-edit-file')
        }
      },
      {
        label: 'Search',
        accelerator: 'CmdOrCtrl+F',
        click: ( menuItem, browserWindow, event ) => {
          browserWindow.webContents.send('search-file')
        }
      },
      {
        label: 'Import',
        accelerator: 'CmdOrCtrl+O',
        click: ( menuItem, browserWindow, event ) => {
          browserWindow.webContents.send('import-file')
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      },
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.reload();
        }
      },
      {
        label: 'Toggle Full Screen',
        accelerator: (function() {
          if (process.platform === 'darwin')
            return 'Ctrl+Command+F';
          else
            return 'F11';
        })(),
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
        }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: (function() {
          if (process.platform === 'darwin')
            return 'Alt+Command+I';
          else
            return 'Ctrl+Shift+I';
        })(),
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.toggleDevTools();
        }
      },
    ]
  },
  {
    label: 'SyncSetting',
    submenu: [
      {
        label: 'Settings',
        accelerator: 'Ctrl+,',
        click: () => {
          ipcMain.emit('open-settings-window')
        }
      },
      {
        label: 'AutoSync',
        type: 'checkbox',
        enabled: qiniuIsConfiged,
        checked: enableAutoSync,
        click: () => {
          const enable = settingsStore.get('enableAutoSync')
          settingsStore.set('enableAutoSync', !enable)
        }
      },
      {
        label: 'Upload All',
        enabled: qiniuIsConfiged,
        click: () => {
          ipcMain.emit('upload-all-to-qiniu')
        }
      },
      {
        label: 'Download All',
        enabled: qiniuIsConfiged,
        click: () => {
          ipcMain.emit('download-all-to-qiniu')
        }
      },
    ]
  },
  {
    label: 'Help',
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: function() { shell.openExternal('http://electron.atom.io') }
      },
    ]
  },
  
]

if (process.platform === 'darwin') {
  const name = app.getName()
  template.unshift({
    label: name,
    submenu: [{
      label: `关于 ${name}`,
      role: 'about'
    }, {
      type: 'separator'
    }, {
      label: 'settings',
      accelerator: 'Command+,',
      click: () => {
        ipcMain.emit('open-settings-window')
      }
    }, {
      label: 'services',
      role: 'services',
      submenu: []
    }, {
      type: 'separator'
    }, {
      label: `hide ${name}`,
      accelerator: 'Command+H',
      role: 'hide'
    }, {
      label: 'hideothers',
      accelerator: 'Command+Alt+H',
      role: 'hideothers'
    }, {
      label: 'unhide',
      role: 'unhide'
    }, {
      type: 'separator'
    }, {
      label: 'exit',
      accelerator: 'Command+Q',
      click: () => {
        app.quit()
      }
    }]
  })
}


module.exports = template