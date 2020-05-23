import React from 'react';
import { faPlus, faFileImport } from '@fortawesome/free-solid-svg-icons'
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import FileSearch from './components/FileSearch'
import FileList from './components/FileList'
import defaultFiles from './utils/defaultFiles'
import BottomBtn from './components/BottomBtn'

function App() {
  return (
    <div className="App container-fluid px-0">
      <div className="row no-gutters">
        <div className="col-3 bg-light left-panel">
			<FileSearch 
				onFileSearch={(value) => { console.log(value)} }
			/>
			<FileList 
				files={defaultFiles}
				onFileClick={(id) => {console.log(id)}}
				onSaveEdit={(id,value) => {console.log(id,value)}}
				onFileDelete={(id) => {console.log("deleting", id)}}
			/>
			<div className="row no-gutters">
				<div className="col bg-info">
					<BottomBtn
						text="追加"
						colorClass="btn-info"
						btnIcon={faPlus}
					/>
				</div>
				<div className="col bg-success">
					<BottomBtn
						text="導入"
						colorClass="btn-success"
						btnIcon={faFileImport}
					/>
				</div>
			</div>
        </div>
        <div className="col-9 bg-primary right-panel">
          <h1>this is the right panel</h1>
        </div> 
      </div>
    </div>
  );
}

export default App