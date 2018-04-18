import {
  nodesToJSON,
  repeatString,
  replaceFirstATSymbol,
  trimFirstLinefeedLength
} from '../util.js'

let isIfExpression = false
let oldLineno = 1
let oldColumn = 1
let transfrom = ''
let returnSymbol = ''

const COMPIL_CONFIT = {
  scss: {
    variable: '$'
  },
  less: {
    variable: '@'
  }
}

const TYPE_VISITOR_MAP = {
  If: visitIf,
  RGBA: visitRGBA,
  Unit: visitUnit,
  Call: visitCall,
  BinOp: visitBinOp,
  Ident: visitIdent,
  Group: visitGroup,
  Import: visitImport,
  Literal: visitLiteral,
  Params: visitArguments,
  Property: visitProperty,
  'Boolean': visitBoolean,
  'Function': visitFunction,
  Selector: visitSelector,
  Arguments: visitArguments,
  Expression: visitExpression
}

function handleLineno (lineno) {
  return repeatString('\n', lineno - oldLineno)
}

function handleColumn (column) {
  return repeatString(' ', column - oldColumn)
}

function handleLinenoAndColumn ({ lineno, column }) {
  return handleLineno(lineno) + handleColumn(column)
}

function findNodesType (list, type) {
  const nodes = nodesToJSON(list)
  return nodes.find(node => node.__type === type)
}

function visitNode (node) {
  const handler = TYPE_VISITOR_MAP[node.__type]
  return handler ? handler(node) : ''
}

// 处理 nodes
function visitNodes (list = []) {
  let text = ''
  const nodes = nodesToJSON(list)
  nodes.forEach(node => { text += visitNode(node) })
  return text
}

// 处理 import；handler import
function visitImport (node) {
  const before = handleLineno(node.lineno) + '@import '
  oldLineno = node.lineno
  let quote = ''
  let text = ''
  const nodes = nodesToJSON(node.path.nodes || [])
  nodes.forEach(node => {
    text += node.val
    if (!quote && node.quote) quote = node.quote
  })
  return `${before}${quote}${text}${quote};`
}

function visitSelector (node) {
  let text = handleLinenoAndColumn(node)
  oldLineno = node.lineno
  return text + visitNodes(node.segments)
}

function visitGroup (node) {
  const selector = visitNodes(node.nodes)
  const blockEnd = findNodesType(node.nodes, 'Selector') && selector || ''
  const endSymbol = handleColumn(node.column + 1 - trimFirstLinefeedLength(blockEnd))
  const block = visitBlock(node.block, endSymbol)
  return selector + block
}

function visitBlock (node, suffix = '') {
  const before = ' {'
  const after = `\n${suffix}}`
  const text = visitNodes(node.nodes)
  return `${before}${text}${after}`
}

function visitLiteral (node) {
  return node.val || ''
}

function visitProperty (node) {
  let before = handleLinenoAndColumn(node)
  oldLineno = node.lineno
  return `${before + visitNodes(node.segments)}: ${visitExpression(node.expr)};`
}

function visitIdent (node) {
  const val = node.val && node.val.toJSON() || ''
  if (val.__type === 'Null' || !val) return node.name
  if (val.__type === 'Function') {
    visitFunction(val)
  } else {
    const before = handleLineno(node.lineno)
    oldLineno = node.lineno
    return `${before + replaceFirstATSymbol(node.name)} = ${visitNode(val)};`
  }
}

function visitExpression (node) {
  const result = visitNodes(node.nodes)
  if (!returnSymbol || isIfExpression) return result
  let before = handleLineno(node.lineno)
  before += handleColumn(node.column - result.length)
  return before + returnSymbol + result
}

function visitCall (node) {
  let before = handleLineno(node.lineno)
  oldLineno = node.lineno
  return `${before + node.name}(${visitArguments(node.args)});`
}

function visitArguments (node) {
  const nodes = nodesToJSON(node.nodes)
  let text = ''
  nodes.forEach((node, idx) => {
    const prefix = idx ? ', ' : ''
    text += prefix + visitNode(node)
  })
  return text || ''
}

function visitRGBA (node, prop) {
  return node.raw
}

function visitUnit (node) {
  return node.val + node.type
}

function visitBoolean (node) {
  return node.val
}

function visitIf (node, symbol = '@if ') {
  let before = handleLineno(node.lineno)
  oldLineno = node.lineno
  isIfExpression = true
  const condText = visitExpression(node.cond)
  isIfExpression = false
  const condLen = node.column - condText.length
  console.log(condLen)
  before += handleColumn(condLen)
  const block = visitBlock(node.block, handleColumn(condLen))
  let elseText = ''
  if (node.elses && node.elses.length) {
    const elses = nodesToJSON(node.elses)
    elses.forEach(node => {
      if (node.__type === 'If') {
        elseText += visitIf(node, '@else if ')
      } else {
        elseText += '@else ' + visitBlock(node, handleColumn(condLen))
      }
    })
  }
  return before + symbol + condText + block + elseText
}

function visitFunction (node) {
  const isFn = !findNodesType(node.block.nodes, 'Property')
  const hasIf = findNodesType(node.block.nodes, 'If')
  const before = handleLineno(node)
  oldLineno = node.lineno
  const symbol = isFn ? '@function ' : '@mixin '
  const fnName = `${symbol}(${visitArguments(node.params)})`
  returnSymbol = '@return '
  const block = visitBlock(node.block, fnName.length)
  returnSymbol = ''
  console.log(before + fnName + block)
  return fnName + block
}

function visitBinOp (node) {
  return `${visitIdent(node.left)} ${node.op} ${visitIdent(node.right)}`
}

// 处理 stylus 语法树；handle stylus Syntax Tree
export default function visitor (ast, option) {
  transfrom = option
  const result = visitNodes(ast.nodes) || ''
  oldLineno = 1
  return result
}
