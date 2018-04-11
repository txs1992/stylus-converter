import { get as _get } from 'noshjs'

import {
  nodesToJSON,
  handleLineno,
  handleColumn
} from '../util.js'

let oldLineno = 1
let oldColumn = 1

const COMPIL_CONFIT = {
  scss: {
    variable: '$'
  },
  less: {
    variable: '@'
  }
}

const TYPE_VISITOR_MAP = {
  Group: visitGroup,
  Import: visitImport,
  Selector: visitSelector
}

function handleNode (node) {
  const handler = TYPE_VISITOR_MAP[node.__type]
  return handler ? handler(node) : ''
}

// 处理 nodes
function handleNodes (nodes) {
  let text = ''
  const nodes = nodesToJSON(node.path.nodes || [])
  nodes.forEach(node => { text += handleNode(node) })
  return text
}

// 处理 stylus 语法树；handle stylus Syntax Tree
function visitor (ast) {
  return handleNodes(ast.nodes) || ''
}

export default visitor

// 处理 import；handler import
function visitImport (node) {
  const last = '@import '
  let quote = ''
  let text = handleColumn(oldColumn， node.column)
  const nodes = nodesToJSON(node.path.nodes || [])
  nodes.forEach(node => {
    text += node.val
    if (!quote && node.quote) quote = node.quote
    if (node.lineno) oldLineno = node.lineno
  })
  oldColumn = 1
  return `${last}${quote}${text}${quote};`
}

function visitSelector (node) {
  let text = ''
}

function visitGroup (node) {
  let text = handleColumn(oldColumn, node.column) + handleNodes(node.nodes)
}
