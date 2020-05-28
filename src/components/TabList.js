import React, { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes,faCircle } from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import './TabList.scss'

const TabList = ({files, activeId, unsaveIds, onTabClick, onCloseTab}) => {
    return (
        <ul className="nav nav-pills">
            {files.map( file => {
                const withUnsavedMark = unsaveIds.includes(file.id)
                const fClassName = classNames({
                    'nav-link': true,
                    'active' : file.id == activeId,
                    'withUnsaved': withUnsavedMark
                })

                return (
                    <li className="row tab-list nav-item mx-0 d-flex justify-content-center justify-content-between" key={file.id}>
                        <a href="#" className={fClassName} onClick={(e)=> {e.preventDefault(); onTabClick(file.id)}}>
                            {file.title}
                            <span className=" ml-2 close-icon " onClick={(e) => {e.stopPropagation(); onCloseTab(file.id)}}>
                                <FontAwesomeIcon title='閉じる' size="1x" icon={faTimes}/>
                            </span>
                            { withUnsavedMark && 
                            <span className="ml-2 unsaved-icon">
                                <FontAwesomeIcon title='閉じる' size="xs" icon={faCircle}/>
                            </span>}
                        </a>
                    </li>
                )
            })}
        </ul>
    )
}

TabList.propTypes = {
    files: PropTypes.array,
    activeId: PropTypes.string,
    unsaveIds: PropTypes.array,
    onTabClick: PropTypes.func,
    onCloseTab: PropTypes.func
}

TabList.defaultPropos = {
    unsaveIds: []
}

export default TabList