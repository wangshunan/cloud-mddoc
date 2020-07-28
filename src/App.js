import React, { useState } from 'react'
import { faPlus, faFileImport } from '@fortawesome/free-solid-svg-icons'
import { v4 as uuidv4 } from 'uuid'
import SimpleMDE from "react-simplemde-editor";
// css
import "easymde/dist/easymde.min.css";
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'
// custom
import FileSearch from './components/FileSearch'
import FileList from './components/FileList'
import BottomBtn from './components/BottomBtn'
import TabList from './components/TabList'
import Loader from './components/Loader'
import { objToArr, flattenArr, timestampToString } from './utils/helper'
import fileHelper from './utils/fileHelper'
import useIpcRenderer from './hooks/useIpcRenderer'

// require node.js mojules
const { join, basename, extname, dirname } = window.require('path')
const { remote, ipcRenderer } = window.require('electron')
const Store = window.require('electron-store')
const fileStore = new Store({'name': 'Files Data'})
const settingsStore = new Store({name: 'Settings'})
const getAutoSync = () => ['accessKey', 'secretKey', 'bucketName', 'enableAutoSync'].every(config => !!settingsStore.get(config))

const updateFilesToStore = (newFiles) => {
	// don't have to store any info file system
	const filesStoreObj = objToArr(newFiles).reduce((result, file) => {
		const { id, path, title, createdAt, isSynced, syncedAt } = file
		result[id] = {
			id,
			path,
			title,
			createdAt,
			isSynced,
			syncedAt
		}
		return result
	}, {})

	fileStore.set('files', filesStoreObj)
}

const getFileStoreData = () => {
	const newFiles = fileStore.get('files')
	if ( newFiles ) {
		// delete invalid fileData from fileStore
		objToArr(newFiles).forEach(file => {
			if (!fileHelper.isFile(file.path)) {
				delete newFiles[file.id]
				const { [file.id]: value, ...afterDelete } = newFiles
				updateFilesToStore(afterDelete)
			}
		})

	}
	return fileStore.get('files') || {}
}

function App() {
	const [ files, setFiles ] = useState(getFileStoreData)
	const [ searchedFiles, setSearchFiles ] = useState([])
	const [ activeFileID, setActiveFileID ] = useState('')
	const [ openedFileIDs, setOpenedFileIDs ] = useState([])
	const [ unsavedFileIDs, setUnsaveFileIDs ] = useState([])
	const [ isLoading, setLoading ] = useState(false) 

	const filesArr = objToArr(files)
	const getSavedLocation = (fileName) => {
		const saveLocation = settingsStore.get('savedFileLocation') || remote.app.getPath('desktop')
		return join(saveLocation, `${fileName}.md`)
	}

	const fileListArr = (searchedFiles.length > 0) ? searchedFiles : filesArr

	const createNewFile = () => {
		const newFile = filesArr.find(file => file.isNew === true)
		if ( !newFile ) {
			const newID = uuidv4()
			const newFile = {
				id: newID,
				title: '',
				path: '',
				body: '## 入力してください',			
				createdAt: new Date().getTime(),
				isNew: true
			}
			setFiles({...files, [newID]: newFile })
		}
	}

	const importFiles = () => {
		remote.dialog.showOpenDialog({
			title:'ファイルを選択してください',
			properties:['openFile', 'multiSelections'],
			filters: [{
				name: 'Markdown files',
				extensions:['md']
			}]
		}).then( result => {
			const paths = result.filePaths
			const alreadyPaths = paths.filter(path => {
				const alreadyAdded = Object.values(files).find(file => file.path === path)
				return !alreadyAdded
			})

			const importFilesArr = alreadyPaths.map(path => {
				return {
					id: uuidv4(),
					title: basename(path, extname(path)),
					path: path,
					isNew: false,
					createdAt: new Date().getTime()
				}
			})

			const newFiles = { ...files, ...flattenArr(importFilesArr) }
			setFiles(newFiles)
			updateFilesToStore(newFiles)
		})
	} 

	const fileClick = (fileID) => {
		// set active file
		setActiveFileID(fileID)

		// load file data to filesData
		const { title, id, path, body, syncedAt } = files[fileID]
		const isOpened = openedFileIDs.includes(fileID)

		if ( getAutoSync() && !isOpened && syncedAt ) {
			ipcRenderer.send('download-file', { key: `${title}.md`, path, id})
		} else if ( !isOpened ) {
			readLocalFile(files[id])
		}

		// add new file id to openedFiles
		if ( !isOpened ) {
			setOpenedFileIDs([ ...openedFileIDs, fileID])
		}
	}

	const readLocalFile = (file) => {
		const { id, path, body } = file
		if ( fileHelper.isFile(path) ) {
			const value = fileHelper.readFileSync(path)
			if ( !body || body !== value ) {
				const newFile = { ...files[id], body: value }
				const newFiles = {...files, [id]: newFile}
				setFiles(newFiles)
				updateFilesToStore(newFiles)
			}
		}
	}

	const tabClick = (fileID) => {
		const value = fileHelper.readFileSync(files[fileID].path)
		// update tab status
		if ( files[fileID].body !== value && !unsavedFileIDs.includes(activeFileID) ) {
			setUnsaveFileIDs([ ...unsavedFileIDs, fileID ])
		}
		// set active file
		setActiveFileID(fileID)
	}

	const tabClose = (id) => {
		// remove fileID from openedFileIDs
		const tabsWithout = openedFileIDs.filter(fileID => fileID !== id)
		setOpenedFileIDs(tabsWithout)
		// set new active fileID
		setActiveFileID(tabsWithout.length > 0 ? tabsWithout[0] : [])
		setUnsaveFileIDs(unsavedFileIDs.filter(fileID => fileID !== activeFileID))
	}

	const fileChange = (value) => {
		// update unsavedFileIDs 
		if ( files[activeFileID].body !== value ) {	
			const modifiedFile = { ...files[activeFileID], body: value }
			const newFiles = { ...files, [activeFileID]: modifiedFile }
			setFiles(newFiles)

			if ( !unsavedFileIDs.includes(activeFileID) ) {
				setUnsaveFileIDs([ ...unsavedFileIDs, activeFileID ])
			}
		} 
	}

	const deleteFile = (id) => {

		// delete could file
		if ( getAutoSync() && files[id].syncedAt ) {
			ipcRenderer.send('delete-file', `${files[id].title}.md`)
		}

		// delete local file
		if ( fileHelper.isFile(files[id].path) ) {
			fileHelper.deleteFile(files[id].path)
			
			// delete selected file form files
			const { [id]: value, ...afterDelete } = files
			setFiles(afterDelete)

			// close the tab if opened
			tabClose(id)
			updateFilesToStore(afterDelete)
		}
	}

	const saveCurrentFile = () => {
		if ( files[activeFileID] ) {
			const { path, body, title } = files[activeFileID]
			fileHelper.writeFileSync(path, body)
			setUnsaveFileIDs(unsavedFileIDs.filter(fileID => fileID !== activeFileID))
			if ( getAutoSync() ) {
				ipcRenderer.send('upload-file', { key: `${title}.md`, path })
			}
		}
	}

	const updateFileName = (id, title, isNew) => {
		const newPath = isNew ? getSavedLocation(title) : join(dirname(files[id].path), `${title}.md`)
		const modifiedFile = { ...files[id], title, isNew: false, path: newPath }
		const newFiles = { ...files, [id]: modifiedFile }

		if ( fileHelper.isFile(newPath) ) {
			remote.dialog.showErrorBox('エラー', 'ファイルが存在しています')
			setFiles(getFileStoreData())
			return
		}

		if ( isNew ) {
			// update new fileName
			fileHelper.writeFileSync(newPath, newFiles[id].body)
			setFiles(newFiles)
			updateFilesToStore(newFiles)
		} else {
			// update old fileName
			const oldPath = files[id].path
			const oldKey = basename(oldPath)
			const newKey = basename(newPath)

			if ( getAutoSync() && files[id].syncedAt ) {
				ipcRenderer.send('rename-file', oldKey, newKey)
			}

			fileHelper.renameFile(oldPath, newPath).then(() => {
				setFiles(newFiles)
				updateFilesToStore(newFiles)
			})
		}
	}

	const fileSearch = (keyword) => {
		// filter out the new files
		const newFiles = objToArr(files).filter(file => file.title.includes(keyword))
		setSearchFiles(newFiles)
	}

	const openedFiles = openedFileIDs.map(openID => {
		return files[openID]
	})

	const activeFileUploaded = (event, uploadedTime) => {
		const modifiedFile = { ...files[activeFileID], isSynced: true, syncedAt: uploadedTime }
		const newFiles = { ...files, [activeFileID]: modifiedFile }
		setFiles(newFiles)
		updateFilesToStore(newFiles)
	}

	const activeFileDownload = (event, message) => {
		const { id, path } = files[message.id]
		const value = fileHelper.readFileSync(path)
		try {
			const syncedTime = message.downloadedAt
			const newfile = { ...files[id], body: value, isSynced: true, syncedAt: syncedTime }
			const newFiles = { ...files, [id]: newfile }
			setFiles(newFiles)
			updateFilesToStore(newFiles)
		} catch (error) {
			console.log(error)
		}
	}

	const filesUploaded = () => {
		const newFiles = objToArr(files).reduce((result, file) => {
			const currentTime = new Date().getTime()
			result[file.id] = {
				...files[file.id],
				isSynced: true,
				syncedAt: currentTime
			}

			return result
		}, {})

		setFiles(newFiles)
		updateFilesToStore(newFiles)
	}

	const filesDownloaded = (event, downloadedList) => {
		let newFiles = []

		downloadedList.forEach(item => {
			const title = item.key.substr(0, item.key.length - 3)
			let exist = false

			filesArr.forEach(file => {
				if ( file.title === title ) {					
					exist = true
					const newFile = { ...files[file.id], isSynced: true, syncedAt: new Date().getTime() }
					readLocalFile(file)
					if (openedFileIDs.includes(file.id)) tabClose(file.id)
				}
			})

			if ( !exist ) {
				const newID = uuidv4()
				const newFile = {
					id: newID,
					title: title,
					path: item.path,
					isSynced: false,
					createdAt: new Date().getTime()
				}
				newFiles = {...newFiles, [newID]: newFile}
			}
		})
		
		newFiles = {...files, ...newFiles}

		setFiles(newFiles)
		updateFilesToStore(newFiles)
		setLoading(false)
	}

	// add menu listener
	useIpcRenderer({
		'create-new-file': createNewFile,
		'import-file': importFiles,
		'save-edit-file': saveCurrentFile,
		'active-file-uploaded': activeFileUploaded,
		'active-file-download': activeFileDownload,
		'loading-status': (message, status) => { setLoading(status) },
		'files-uploaded': filesUploaded,
		'files-downloaded': filesDownloaded
	})

	return (
		<div className="App container-fluid px-0">
			{ isLoading &&
				<Loader
					text="loding..."
				/>
			}
			<div className="row no-gutters">
				<div className="col-3 bg-light left-panel">
					<FileSearch 
						onFileSearch={fileSearch}
					/>
					<FileList 
						files={fileListArr}
						onFileClick={fileClick}
						onSaveEdit={updateFileName}
						onFileDelete={deleteFile}
					/>
					<div className="row no-gutters button-group">
						<div className="col">
							<BottomBtn
								text="追加"
								colorClass="btn-info"
								btnIcon={faPlus}
								onBtnClick={createNewFile}
							/>
						</div>
						<div className="col">
							<BottomBtn
								text="導入"
								colorClass="btn-success"
								btnIcon={faFileImport}
								onBtnClick={importFiles}
							/>
						</div>
					</div>
				</div>
				<div className="col-9 right-panel">
					{ !files[activeFileID] &&
						<div className="nofile-page">
							Markdown ファイルを選択してください。
						</div> 
					}
					{ files[activeFileID] &&
						<>
							<TabList 
								files={openedFiles}
								activeId={activeFileID}
								unsaveIds={unsavedFileIDs}
								onTabClick={tabClick}
								onCloseTab={tabClose}
							/>
							<SimpleMDE
								key={files[activeFileID] && activeFileID}
								value={files[activeFileID] && files[activeFileID].body}
								onChange={(value) => {
									fileChange(value)
								}}
								options={{
									minHeight: '475px',
									autofocus: true
								}}
							/>
							{ files[activeFileID].isSynced && 
								<span className="sync-satatus">已同步，上次同步时间{timestampToString(files[activeFileID].syncedAt)}</span>
							}
							{ !files[activeFileID].isSynced &&
								<span className="sync-satatus">未同步</span>
							}
						</>
					}
				</div> 
			</div>
		</div>
	)
}

export default App