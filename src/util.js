export function repeatString (str, num) {
  return num > 0 ? str.repeat(num) : ''
}

export function nodesToJSON (nodes) {
  return nodes.map(node => node.toJSON())
}

export function handleLineno (old, lineno) {
  return repeatString('\n', lineno - old)
}

export function handleColumn (old, column) {
  return repeatString(' ', column - old)
}
