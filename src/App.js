import React, { useState, useEffect, useRef } from 'react'
import { faPlus, faFileImport } from '@fortawesome/free-solid-svg-icons'
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import FileSearch from './components/FileSearch'
import FileList from './components/FileList'
import defaultFiles from './utils/defaultFiles'
import BottomBtn from './components/BottomBtn'
import TabList from './components/TabList'


function App() {
	const [ files, setFiles ] = useState(defaultFiles)
	const [ activeFileID, setActiveFileID ] = useState('')
	const [ openedFileIDs, setopenedFileIDs ] = useState([])
	const [ unsavedFileIDs, setUnsaveFileIDs ] = useState([])

	const openedFiles = openedFileIDs.map(openID => {
		return files.find(file => file.id === openID)
	})

	const activeFile = files.find( file => file.id === activeFileID)

	const fileClick = (fileID) => {
		// set active file
		setActiveFileID(fileID)

		// add new file id to openedFiles
		if ( !openedFileIDs.includes(fileID) ) {
			setopenedFileIDs([ ...openedFileIDs, ...fileID])
		}
	}

	const tabClick = (fileID) => {
		// set active file
		setActiveFileID(fileID)
	}

	const tabClose = (id) => {
		// remove fileID from openedFileIDs
		const tabsWithout = openedFileIDs.filter(fileID => fileID !== id)
		setopenedFileIDs(tabsWithout)

		// set new active fileID
		setActiveFileID(tabsWithout.length > 0 ? tabsWithout[0] : [] )
	}

	const fileChange = (activeFileID, value) => {
		// update unsavedFileIDs 
		if ( files.find(file => file.id === activeFileID).body === value ) {
			setUnsaveFileIDs(unsavedFileIDs.filter(fileID => fileID !==activeFileID))
		} else if ( !unsavedFileIDs.includes(activeFileID) ) {
			setUnsaveFileIDs([ ...unsavedFileIDs, activeFileID ])
		}
	}

	return (
		<div className="App container-fluid px-0">
		<div className="row no-gutters">
			<div className="col-3 bg-light left-panel">
				<FileSearch 
					onFileSearch={(value) => { console.log(value)} }
				/>
				<FileList 
					files={files}
					onFileClick={fileClick}
					onSaveEdit={(id,value) => {console.log(id,value)}}
					onFileDelete={(id) => {console.log("deleting", id)}}
				/>
				<div className="row no-gutters button-group">
					<div className="col">
						<BottomBtn
							text="追加"
							colorClass="btn-info"
							btnIcon={faPlus}
						/>
					</div>
					<div className="col">
						<BottomBtn
							text="導入"
							colorClass="btn-success"
							btnIcon={faFileImport}
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