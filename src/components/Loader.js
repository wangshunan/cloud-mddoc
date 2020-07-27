import React from 'react'
import './Loader.scss'

const Loader = ({ text = 'loading' }) => (
    <div className="loading-background">
        <div className="loading-component text-center">
            <div className="spinner-border text-primary" role="status">
                <span className="sr-only">{text}</span>
            </div>
            <h5 className="text-primary">{text}</h5>
        </div>
    </div>
)

export default Loader