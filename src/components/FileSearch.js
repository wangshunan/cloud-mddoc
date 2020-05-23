import React, { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types'

const FileSearch = ({ title, onFileSearch }) => {
    const [ inputActive, setInputActive ] = useState(false) // 入力状態
    const [ value, setValue ] = useState('')                // 入力値
    let node = useRef(null)

    // 検索欄を閉じる
    const closeSearch = (e) => {
        e.preventDefault()
        setInputActive(false)
        setValue('')
    }

    // キーボード入力
    useEffect(() => {
        const handleInputEvent = (event) => {
            const { keyCode } = event
            if ( inputActive ) {
                switch(keyCode) {
                    case 13: 
                        onFileSearch(value)
                        break
                    case 27: 
                        closeSearch(event)
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

    useEffect(() => {
        if ( inputActive ) {
            node.current.focus()
        }
    }, [inputActive])

    return(
        <div className="alert alert-primary d-flex justify-content-center justify-content-between">
            { !inputActive &&
                <>
                    <span>{title}</span>
                    <button type="button" className="icon-button" onClick={() => { setInputActive(true) }}>
                        <FontAwesomeIcon title='検索' size="lg" icon={faSearch}/>
                    </button>
                </>
            }
            { inputActive &&
                <>
                    <input className="from-control" value={value} ref={node} onChange={(e) => { setValue(e.target.value) }} />
                    <button type="button" className="icon-button" onClick={closeSearch}>
                        <FontAwesomeIcon title='閉じる' size="lg" icon={faTimes}/>
                    </button>
                </>
            }
        </div>
    )
}

FileSearch.prototype = {
    title: PropTypes.string,
    onFileSearch: PropTypes.func.isRequired
}

FileSearch.defaultProps = {
    title: 'MyCloudDoc'
}

export default FileSearch