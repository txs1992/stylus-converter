const fs = require('fs')
const { parse, converter, nodeToJSON } = require('../lib')
const findMixin = require('./findMixin')
const convertVueFile = require('./convertVueFile')
let callLen = 0
const GLOBAL_MIXIN_NAME_LIST = []
const GLOBAL_VARIABLE_NAME_LIST = []

function convertStylus(input, output, options, callback) {
  callLen++
  if (/\.styl$/.test(input) || /\.vue$/.test(input)) {
    fs.readFile(input, (err, res) => {
      if (err) throw err
      let result = res.toString()
      let outputPath = output
      if (/\.styl$/.test(input)) {
        try {
          if (options.status === 'complete') {
            result = converter(result, options, GLOBAL_VARIABLE_NAME_LIST, GLOBAL_MIXIN_NAME_LIST)
          } else {
            const ast = parse(result)
            const nodes = nodeToJSON(ast.nodes)
            nodes.forEach(node => {
              findMixin(node, GLOBAL_MIXIN_NAME_LIST)
              if (node.__type === 'Ident' && node.val.toJSON().__type === 'Expression') {
                if (GLOBAL_VARIABLE_NAME_LIST.indexOf(node.name) === -1) {
                  GLOBAL_VARIABLE_NAME_LIST.push(node.name)
                }
              }
            })
          }
        } catch (e) {
          result = ''
          callLen--
          console.error('Failed to convert', input)
          return;
        }
        outputPath = output.replace(/\.styl$/, '.' + options.conver)
      } else {
        //处理 vue 文件
        result = convertVueFile(result, options);
      }
      fs.writeFile(outputPath, result, err => {
        callLen--
        if (err) throw err
        if (!result) return
        if (callLen === 0) {
          if (options.status === 'complete') {
            callback(Date.now())
          } else {
            callback()
          }
        }
      })
    })
  } else {
    fs.copyFile(input, output, err => {
      callLen--
      if (err) throw err
      if (options.status !== 'complete') return
      if (callLen === 0) {
        if (options.status === 'complete') {
          callback(Date.now())
        } else {
          callback()
        }
      }
    })
  }
}

module.exports = convertStylus