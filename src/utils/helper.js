export const flattenArr = (arr) => {
    return arr.reduce((map, item) => {
        map[item.id] = item
        return map
    }, {})
}

export const objToArr = (obj) => {
    return Object.keys(obj).map(key => obj[key])
}

export const getParentNode = (node, parentClassName) => {
    let currentNode = node

    while(currentNode !== null) {
        if ( currentNode.classList.contains(parentClassName) ) {
            return currentNode
        } else {
            currentNode = currentNode.parentNode
        }
    }

    return false
}

export const timestampToString = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}