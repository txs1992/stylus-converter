export function repeatString (str, num) {
  return num > 0 ? str.repeat(num) : ''
}

export function nodesToJSON (nodes) {
  return nodes.map(node => node.toJSON())
}

export function trimEdeg (str) {
  return str.replace(/(^\s*)|(\s*$)/g, '')
}

export function trimFirst (str) {
  return str.replace(/(^\s*)/g, '')
}

export function tirmFirstLength (str) {
  return str.length - trimFirst(str).length
}

export function trimLinefeed (str) {
  return str.replace(/^\n*/, '')
}

export function trimFirstLinefeedLength (str) {
  return tirmFirstLength(trimLinefeed(str))
}
