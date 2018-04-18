const fs = require('fs')
const path = require('path')
const converter = require('../bin')

function getPath (address) {
  return path.resolve(__dirname, address)
}

fs.readFile(getPath('./stylus-files/function.styl'), (err, res) => {
  if (err) return
  const result = res.toString()
  // console.log(converter(result))
  converter(result)
})
