import React, { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons'
import { faMarkdown } from '@fortawesome/free-brands-svg-icons'
import propTypes from 'prop-types'
import useKeyPress from '../hooks/useKeyPress'
import useContextMenu from '../hooks/useContextMenu'
import { getParentNode } from '../utils/helper'

const FileList = ( { files, onFileClick, onSaveEdit, onFileDelete} ) => {
    const [editStatus, setEditStatus] = useState(false)
    const [value, setValue] = useState('')
    const [newFileCreating, setNewFileCreating] = useState(false)

    let node = useRef(null)
    const enterKeyPress = useKeyPress(13)
    const escKeyPress = useKeyPress(27)
    const clickedItem = useContextMenu([
        {
            label: '開く',
            click: () => {
                const parentElement = getParentNode(clickedItem.current, 'file-item', files)
                if ( parentElement ) {
                    onFileClick(parentElement.dataset.id)
                }
            }
        },
        {
            label: 'タイトル変更',
            click: () => {

            }
        },        {
            label: '削除',
            click: () => {

            }
        },
    ], '.file-list', [files])


    const closeSetEdit = () => {
        if ( newFileCreating ) {
            const newFile = files.find(file => file.isNew === true)
            onFileDelete(newFile.id)
            setNewFileCreating(false)
        }

        setEditStatus(false)
        setValue('')
    }

    const openSetEdit = (id, value) => {
        setEditStatus(id);
        setValue(value);
    }

    const updateFileName = (file) => {
        if ( value.length > 0 ) {
            onSaveEdit(file.id, value, file.isNew)
        } else if ( file.isNew ){
            onFileDelete(file.id)
        }
        setNewFileCreating(false)
        setEditStatus(false)
        setValue('')
    }

    //
    useEffect(() => {
        if ( editStatus ) {
            node.current.focus()
        }
    }, [editStatus])

    //
    useEffect(() => {
        const newFile = files.find(file => file.isNew === true)
        if ( newFile ) {
            setEditStatus(newFile.id)
            setNewFileCreating(true)
            openSetEdit(newFile.id, newFile.title)
        }
        
    },[files])

    //
    useEffect(() => {
        if ( enterKeyPress && editStatus ) {
            const editItem = files.find(file => file.id === editStatus)
            updateFileName(editItem)
        }

        if ( escKeyPress && editStatus ) {
            closeSetEdit()
        }
    }, [enterKeyPress, escKeyPress])

    return (
        <ul className="list-group list-group-flush file-list">
            {
                files.map(file => (
                    <li className="row list-group-item bg-light d-flex align-items-center file-item px-0 mx-0"
                        key={file.id}
                        data-id={file.id}
                        data-title={file.title}
                    >
                        <span className="col-2">
                            <FontAwesomeIcon sile="lg" icon={faMarkdown}/>
                        </span>
                        { ( file.id !== editStatus ) &&
                            <>
                                <span className="col-6 c-link mx-0" onClick={() => {onFileClick(file.id)}}>
                                    {file.title}
                                </span>
                                <button type="button" className="col-2 icon-button" onClick={() => {openSetEdit(file.id, file.title)}}> 
                                    <FontAwesomeIcon title='編集' sile="lg" icon={faEdit}/>  
                                </button>
                                <button type="button" className="col-2 icon-button" onClick={() => {onFileDelete(file.id)}}> 
                                    <FontAwesomeIcon title="削除" sile="lg" icon={faTrash}/> 
                                </button>
                            </>
                        }

                        { ( file.id === editStatus ) &&
                            <>
                                <input className="from-control col-8 " value={value} ref={node} placeholder="ファイル名を入力してください" onChange={(e) => { setValue(e.target.value) }} />
                                <button type="button" className="icon-button col-2" onClick={closeSetEdit}>
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