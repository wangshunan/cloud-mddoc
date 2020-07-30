import React, { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types'
import useKeyPress from '../hooks/useKeyPress'
import useIpcRenderer from '../hooks/useIpcRenderer'

const FileSearch = ({ title, onFileSearch }) => {
    const [ inputActive, setInputActive ] = useState(false) // 入力状態
    const [ value, setValue ] = useState('')                // 入力値
    const enterKeyPress = useKeyPress(13)                   // Enter
    const escKeyPress = useKeyPress(27)                     // Esc
    let node = useRef(null)

    // 検索欄を閉じる
    const closeSearch = () => {
        setInputActive(false)
        setValue('')
        onFileSearch(null)
    }

    useIpcRenderer({
		'search-file': () => {setInputActive(true)}
	})

    // キーボード入力
    useEffect(() => {
        if ( enterKeyPress && inputActive ) {
            onFileSearch(value)
        }
        
        if ( escKeyPress && inputActive ) {
            closeSearch()
        }
    },[enterKeyPress, escKeyPress])

    useEffect(() => {
        if ( inputActive ) {
            node.current.focus()
        }
    }, [inputActive])

    return(
        <div className="alert alert-primary d-flex justify-content-center justify-content-between mb-0">
            { !inputActive &&
                <>
                    <span className="col-8">{title}</span>
                    <button type="button" className="icon-button col-4" style={{height: '26px'}} onClick={() => { setInputActive(true) }}>
                        <FontAwesomeIcon title='検索' size="lg" icon={faSearch}/>
                    </button>
                </>
            }
            { inputActive &&
                <>
                    <input className="from-control col-8 px-2" style={{height: '26px'}} value={value} ref={node} onChange={(e) => { setValue(e.target.value) }} />
                    <button type="button" className="icon-button col-4" onClick={closeSearch}>
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