const fs = window.require('fs').promises
const { statSync, writeFileSync, readFileSync } = window.require('fs')
const fileHelper = {
    // bug -> then() not running
    readFile: (path) => {
        return fs.readFile(path, { encoding: 'utf8' })
    },
    readFileSync: (path) => {
        return readFileSync(path, { encoding: 'utf8' })
    },
    // bug -> then() not running
    writeFile: (path, content) => {
        return fs.writeFile(path, content, { encoding: 'utf8' })
    },
    writeFileSync: (path, content) => {
        return writeFileSync(path, content, { encoding: 'utf8' })
    },
    // bug -> then() not running
    renameFile: (path, newPath) => {
        return fs.rename(path, newPath)
    },
    deleteFile: (path) => {   
        return fs.unlink(path)
    },
    isFile: (path) => {
        try {
            statSync(path)
        } catch(e) {
            return false
        }
        return true
    }
}

export default fileHelper