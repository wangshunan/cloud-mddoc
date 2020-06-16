const fs = window.require('fs').promises
const { statSync, writeFileSync, readFileSync } = window.require('fs')
const fileHelper = {
    readFile: (path) => {
        return fs.readFile(path, { encoding: 'utf8' })
    },
    readFileSync: (path) => {
        return readFileSync(path, { encoding: 'utf8' })
    },
    writeFile: (path, content) => {
        return fs.writeFileSync(path, content, { encoding: 'utf8' })
    },
    writeFileSync: (path, content) => {
        return writeFileSync(path, content, { encoding: 'utf8' })
    },
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