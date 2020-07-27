import { useState, useEffect } from 'react'

const useKeyPress = (targetKeyCode) => {
    const [keyPressed, setKeyPreesed] = useState(false)
    
    const keyUpHandle = ({keyCode}) => {
        if ( keyCode === targetKeyCode ) {
            setKeyPreesed(false)
        }
    } 

    const keyDownhandle = ({keyCode}) => {
        if ( keyCode === targetKeyCode ) {
            setKeyPreesed(true)
        }
    }

    useEffect(() => {
        document.addEventListener('keyup', keyUpHandle)
        document.addEventListener('keydown', keyDownhandle)

        return () => {
        document.removeEventListener('keyup', keyUpHandle)
        document.removeEventListener('keydown', keyDownhandle)
        }
    })

    return keyPressed
}

export default useKeyPress