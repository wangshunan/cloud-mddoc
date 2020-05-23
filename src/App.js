import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import FileSearch from './components/FileSearch'
import FileList from './components/FileList'
import defaultFiles from './utils/defaultFiles'

function App() {
  return (
    <div className="App container-fluid">
      <div className="row">
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
        </div> 
        <div className="col-9 bg-primary right-panel">
          <h1>this is the right panel</h1>
        </div> 
      </div>
    </div>
  );
}

export default App;
