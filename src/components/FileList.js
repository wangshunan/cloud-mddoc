import React, { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons'
import { faMarkdown } from '@fortawesome/free-brands-svg-icons'
import propTypes from 'prop-types'

const FileList = ( { files, onFileClick, onSaveEdit, onFileDelete} ) => {
    const [editStatus, setEditStatus] = useState(false)
    const [value, setValue] = useState('')

    const closeSetEdit = (e) => {
        e.preventDefault()
        setEditStatus(false)
        setValue('')
    }

    const openSetEdit = (id, value) => {
        setEditStatus(id);
        setValue(value);
    }

    useEffect(() => {
        const handleInputEvent = (event) => {
            const {keyCode} = event
            if ( editStatus ) {
                switch(keyCode) {
                    case 13:
                        const editItem = files.find(file => file.id === editStatus)
                        onSaveEdit(editItem.id, value)
                        setEditStatus(false)
                        setValue('')
                        break
                    case 27:
                        closeSetEdit(event)
                        break
                    default:
                        break
                }
            }
        }

        document.addEventListener('keyup', handleInputEvent)

        return () => {
            document.removeEventListener('keyup', handleInputEvent)
        }
    })

    return (
        <ul className="list-group list-group-flush file-list">
            {
                files.map(file => (
                    <li className="row list-group-item bg-light d-flex align-items-center file-item"
                        key={file.id}
                    >
                        { ( file.id !== editStatus ) &&
                            <>
                                <span className="col-2">
                                    <FontAwesomeIcon sile="lg" icon={faMarkdown}/>
                                </span>
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
                                <input className="from-control" value={value} onChange={(e) => { setValue(e.target.value) }} />
                                <button type="button" className="icon-button" onClick={closeSetEdit}>
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