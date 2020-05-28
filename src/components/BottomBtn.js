import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './BottomBtn.scss'

const BottomBtn = ({text, colorClass, btnIcon, onBtnClick}) => (
	<button type="button" className={`btn no-border btn-block ${colorClass}`} onClick={onBtnClick}>
		<FontAwesomeIcon size="lg" icon={btnIcon} className="mr-2"/>
		{text}
	</button>
)

BottomBtn.propTypes = {
	text: PropTypes.string,
	colorClass: PropTypes.string,
	btnIcon: PropTypes.object.isRequired,
	onBtnClick: PropTypes.func
}

BottomBtn.defaultProps = {
	text: '追加'
}

export default BottomBtn