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
import { objToArr, flattenArr } from './utils/helper'
import fileHelper from './utils/fileHelper'

// require node.js mojules
const { join, basename, extname } = window.require('path')
const { remote } = window.require('electron')
const Store = window.require('electron-store')
const fileStore = new Store({'name': 'Files Data'})

const updataFilesToStore = (newFiles) => {
	// don't have to store any info file system
	const filesStoreObj = objToArr(newFiles).reduce((result, file) => {
		const { id, path, title, createdAt } = file
		result[id] = {
			id,
			path,
			title,
			createdAt,
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
				updataFilesToStore(afterDelete)
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

	const filesArr = objToArr(files)
	const getSavedLocation = (fileName) => {
		return join(remote.app.getPath('desktop'), `${fileName}.md`)
	}

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
				const alreadyAdded = Object.values(files).find(file => {
					return file.path === path
				})
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
			updataFilesToStore(newFiles)
			console.log(newFiles)
		})
	} 

	const fileClick = (fileID) => {
		// set active file
		setActiveFileID(fileID)

		// load file data to filesData
		const currentFile = files[fileID]
		if ( fileHelper.isFile(currentFile.path) ) {
			const value = fileHelper.readFileSync(currentFile.path)
			if ( !currentFile.body || currentFile.body !== value ) {
				const newFile = { ...files[fileID], body: value }
				setFiles({...files, [fileID]: newFile})
				console.log('readFile')
			}
		}

		// add new file id to openedFiles
		if ( !openedFileIDs.includes(fileID) ) {
			setOpenedFileIDs([ ...openedFileIDs, fileID])
		}

	}

	const tabClick = (fileID) => {
		// set active file
		setActiveFileID(fileID)
	}

	const tabClose = (id) => {
		// remove fileID from openedFileIDs
		const tabsWithout = openedFileIDs.filter(fileID => fileID !== id)
		setOpenedFileIDs(tabsWithout)

		// set new active fileID
		setActiveFileID(tabsWithout.length > 0 ? tabsWithout[0] : [] )
	}

	const fileChange = (activeFileID, value) => {
		// update unsavedFileIDs 
		if ( files[activeFileID].body === value ) {
			setUnsaveFileIDs(unsavedFileIDs.filter(fileID => fileID !==activeFileID))
		} else if ( !unsavedFileIDs.includes(activeFileID) ) {
			setUnsaveFileIDs([ ...unsavedFileIDs, activeFileID ])
		}
	}

	const deleteFile = (id) => {
		
		if ( fileHelper.isFile(files[id].path) ) {
			fileHelper.deleteFile(files[id].path)
		}
		// delete selected file
		const { [id]: value, ...afterDelete } = files
		setFiles(afterDelete)
		// close the tab if opened
		tabClose(id)
		updataFilesToStore(afterDelete)
	}

	const updateFileName = (id, title, isNew) => {
		const newPath = getSavedLocation(title)
		const modifiedFile = { ...files[id], title, isNew: false, path: newPath }
		const newFiles = { ...files, [id]: modifiedFile }

		if ( isNew ) {
			// update new fileName
			fileHelper.writeFileSync(newPath, newFiles[id].body)
			setFiles(newFiles)
			updataFilesToStore(newFiles)
		} else {
			// update old fileName
			const oldPath = files[id].path
			fileHelper.renameFile(oldPath, newPath).then(() => {
				setFiles(newFiles)
				updataFilesToStore(newFiles)
			})
		}
	}

	const fileSearch = (keyword) => {
		// filter out the new files
		const newFiles = files.filter(file => file.title.includes(keyword))
		setSearchFiles(newFiles)
	}

	const openedFiles = openedFileIDs.map(openID => {
		return files[openID]
	})
	const activeFile = files[activeFileID]
	const fileListArr = (searchedFiles.length > 0) ? searchedFiles : filesArr

	return (
		<div className="App container-fluid px-0">
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
				{ !activeFile &&
					<div className="nofile-page">
						Markdown ファイルを選択してください。
					</div> 
				}
				{ activeFile &&
					<>
						<TabList 
							files={openedFiles}
							activeId={activeFileID}
							unsaveIds={unsavedFileIDs}
							onTabClick={tabClick}
							onCloseTab={tabClose}
						/>
						<SimpleMDE 
							key={activeFile && activeFile.id}
							value={activeFile && activeFile.body}
							onChange={(value) => {fileChange(activeFileID, value)}}
							options={{
								minHeight: '475px'
							}}
						/>
					</>
				}
			</div> 
		</div>
		</div>
	)
}

export default App