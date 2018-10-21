export function repeatString(str, num) {
  return num > 0 ? str.repeat(num) : ''
}

export function nodesToJSON(nodes) {
  return nodes.map(node =>
    Object.assign(
      {
        // default in case not in node
        nodes: []
      },
      node.toJSON()
    )
  )
}

export function trimEdeg(str) {
  return str.replace(/(^\s*)|(\s*$)/g, '')
}

export function trimFirst(str) {
  return str.replace(/(^\s*)/g, '')
}

export function tirmFirstLength(str) {
  return str.length - trimFirst(str).length
}

export function trimLinefeed(str) {
  return str.replace(/^\n*/, '')
}

export function trimFirstLinefeedLength(str) {
  return tirmFirstLength(trimLinefeed(str))
}

export function replaceFirstATSymbol(str, temp = '$') {
  return str.replace(/^\$|/, temp)
}

export function getCharLength(str, char) {
  return str.split(char).length - 1
}

export function _get(obj, pathArray, defaultValue) {
  if (obj == null) return defaultValue

  let value = obj

  pathArray = [].concat(pathArray)

  for (let i = 0; i < pathArray.length; i += 1) {
    const key = pathArray[i]
    value = value[key]
    if (value == null) {
      return defaultValue
    }
  }

  return value
}
