import React, { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons'
import { faMarkdown } from '@fortawesome/free-brands-svg-icons'
import propTypes from 'prop-types'
import useKeyPress from '../hooks/UseKeyPress'

const FileList = ( { files, onFileClick, onSaveEdit, onFileDelete} ) => {
    const [editStatus, setEditStatus] = useState(false)
    const [value, setValue] = useState('')

    const enterKeyPress = useKeyPress(13)
    const escKeyPress = useKeyPress(27)

    const closeSetEdit = () => {
        setEditStatus(false)
        setValue('')
    }

    const openSetEdit = (id, value) => {
        setEditStatus(id);
        setValue(value);
    }


    useEffect(() => {
        if ( enterKeyPress && editStatus ) {
            const editItem = files.find(file => file.id === editStatus)
            onSaveEdit(editItem.id, value)
            setEditStatus(false)
            setValue('')
        }

        if ( escKeyPress && editStatus ) {
            closeSetEdit()
        }
    })

    return (
        <ul className="list-group list-group-flush file-list">
            {
                files.map(file => (
                    <li className="row list-group-item bg-light d-flex align-items-center file-item"
                        key={file.id}
                    >
                        <span className="col-2">
                            <FontAwesomeIcon sile="lg" icon={faMarkdown}/>
                        </span>
                        { ( file.id !== editStatus ) &&
                            <>
                                <span className="col-8 c-link" onClick={() => {onFileClick(file.id)}}>
                                    {file.title}
                                </span>
                                <button type="button" className="col-1 icon-button" onClick={() => {openSetEdit(file.id, file.title)}}> 
                                    <FontAwesomeIcon title='編集' sile="lg" icon={faEdit}/>  
                                </button>
                                <button type="button" className="col-1 icon-button" onClick={() => {onFileDelete(file.id)}}> 
                                    <FontAwesomeIcon title="削除" sile="lg" icon={faTrash}/> 
                                </button>
                            </>
                        }

                        { ( file.id === editStatus ) &&
                            <>
                                <input className="from-control col-9" value={value} onChange={(e) => { setValue(e.target.value) }} />
                                <button type="button" className="icon-button col-1" onClick={closeSetEdit}>
                                    <FontAwesomeIcon title='閉じる' size="lg" icon={faTimes}/>
                                </button>
                            </>
                        }

                    </li>
                ))
            }
        </ul>
    )
}

FileList.propTypes = {
    files: propTypes.array,
    onFileClick: propTypes.func,
    onSaveEdit: propTypes.func,
    onFileDelete: propTypes.func
}

export default FileList