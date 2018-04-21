const fs = require('fs')
const path = require('path')
const converter = require('../bin')

function getPath (address) {
  return path.resolve(__dirname, address)
}

fs.readFile(getPath('./test.styl'), (err, res) => {
  if (err) return
  const result = res.toString()
  const scss = converter(result)
  console.log(scss)
  // fs.writeFile('./test.scss', scss)
  // console.log()
  // converter(result)
})
