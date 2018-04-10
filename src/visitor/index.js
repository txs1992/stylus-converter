import { get as _get } from 'noshjs'

import { nodesToJSON } from '../util.js'

function visitGroup (node) {
  return 'visitGroup'
}

// 处理 import
// handler import
function visitImport (node) {
  const last = '@import '
  let text = ''
  const nodes = nodesToJSON(node.path.nodes || [])
  nodes.forEach(node => {
    text += node.val
  })
  return `${last}'${text}';\n`
}

// handle stylus Syntax Tree
// 处理 stylus 语法树
function visitor (nodes) {
  let resultText = ''
  nodes.forEach(node => {
    switch (node.__type) {
      case 'Import':
        resultText += visitImport(node)
        break;
    }
  })
  return resultText
}

export default visitor
