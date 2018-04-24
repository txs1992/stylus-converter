// const Parser = require('stylus/lib/parser.js')
const fs = require('fs')
const path = require('path')
const converter = require('../bin')

function getPath (address) {
  return path.resolve(__dirname, address)
}

const cssSelector = `#app
  color: red
`
console.log(converter(cssSelector))

// fs.readFile(getPath('../test/test.styl'), (err, res) => {
//   if (err) return
//   const result = res.toString()
//   const ast = new Parser(res.toString()).parse()
//   const text = JSON.stringify(ast)
//   fs.writeFile(getPath('./test.json'), text, () => {})
// })
