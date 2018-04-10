import path from 'path'

export function getPath (address) {
  return path.resolve(__dirname, address)
}

export function repeatString (str, num) {
  return num > 0 ? str.repeat(num) : ''
}
