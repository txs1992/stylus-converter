export function repeatString (str, num) {
  return num > 0 ? str.repeat(num) : ''
}

export function nodesToJSON (nodes) {
  return nodes.map(node => node.toJSON())
}
