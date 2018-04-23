import {
  nodesToJSON,
  repeatString,
  replaceFirstATSymbol,
  trimFirstLinefeedLength
} from '../util.js'

let oldLineno = 1
let oldColumn = 1
let transfrom = ''
let returnSymbol = ''
let isFunction = false
let isProperty = false
let isExpression = false
let isIfExpression = false

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
  const endSymbol = handleColumn(node.block.column)
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

function visitProperty ({ expr, lineno, segments }) {
  const hasCall = findNodesType(expr && expr.nodes || [], 'Call')
  const suffix = hasCall ? '' : ';'
  let before = handleLineno(lineno)
  oldLineno = lineno
  isProperty = true
  const firstNode = segments.length && segments[0].toJSON() || {}
  const result = `${visitNodes(segments)}: ${visitExpression(expr)}`
  before += handleColumn(firstNode.column)
  isProperty = false
  return before + result + suffix
}

function visitIdent ({ val, name, mixin, lineno }) {
  const identVal = val && val.toJSON() || ''
  if (identVal.__type === 'Null' || !val) {
    if (mixin) return `#{$${name}}`
    return `${isExpression ? '$': ''}${name}`
  }
  if (identVal.__type === 'Function') return visitFunction(identVal)
  return `${replaceFirstATSymbol(name)} = ${visitNode(identVal)};`
}

function visitExpression (node) {
  isExpression = true
  const result = visitNodes(node.nodes)
  isExpression = false
  if (!returnSymbol || isIfExpression) return result
  let before = handleLineno(node.lineno)
  oldLineno = node.lineno
  before += handleColumn((node.column + 1) - result.replace(/\$/g, '').length)
  return before + returnSymbol + result
}

function visitCall ({ name, args, lineno, column }) {
  let before = handleLineno(lineno)
  const argsText = visitArguments(args)
  oldLineno = lineno
  if (!isProperty) {
    const exprLen = name.length + argsText.length + 1
    before += handleColumn(column - exprLen)
    before += '@include '
  }
  return `${before + name}(${argsText});`
}

function visitArguments (node) {
  const nodes = nodesToJSON(node.nodes)
  let text = ''
  const symbol = isFunction ? '$' : ''
  nodes.forEach((node, idx) => {
    const prefix = idx ? ', ' : ''
    text += prefix + symbol + visitNode(node)
  })
  return text || ''
}

function visitRGBA (node, prop) {
  return node.raw
}

function visitUnit ({ val, type }) {
  return type ? val + type : val
}

function visitBoolean (node) {
  return node.val
}

function visitIf (node, symbol = '@if ') {
  let before = ''
  isIfExpression = true
  const condNode = node.cond && node.cond.toJSON() || { column: 0 }
  const condText = symbol.replace(/@|\s*@/g, '') + visitNode(condNode).replace(/\$/g, '')
  isIfExpression = false
  const condLen = condNode.column - condText.length + 1
  if (symbol === '@if ') {
    before += handleLineno(node.lineno)
    oldLineno = node.lineno
    before += handleColumn(condLen)
  }
  const block = visitBlock(node.block, handleColumn(condLen))
  let elseText = ''
  if (node.elses && node.elses.length) {
    const elses = nodesToJSON(node.elses)
    elses.forEach(node => {
      oldLineno++
      if (node.__type === 'If') {
        elseText += visitIf(node, ' @else if ')
      } else {
        elseText += ' @else' + visitBlock(node, handleColumn(condLen))
      }
    })
  }
  return before + symbol + condText + block + elseText
}

function visitFunction (node) {
  isFunction = true
  const notMixin = !findNodesType(node.block.nodes, 'Property')
  const hasIf = findNodesType(node.block.nodes, 'If')
  let before = handleLineno(node.lineno)
  oldLineno = node.lineno
  let symbol = ''
  if (notMixin) {
    returnSymbol = '@return '
    symbol = '@function'
  } else {
    returnSymbol = ''
    symbol = '@mixin'
  }
  const fnName = `${symbol} ${node.name}(${visitArguments(node.params)})`
  const block = visitBlock(node.block)
  returnSymbol = ''
  isFunction = false
  return before + fnName + block
}

function visitBinOp ({ op, left, right }) {
  const leftExp = left && left.toJSON()
  const rightExp = right && right.toJSON()
  return `${visitNode(leftExp)} ${op} ${visitNode(rightExp)}`
}

// 处理 stylus 语法树；handle stylus Syntax Tree
export default function visitor (ast, option) {
  transfrom = option
  const result = visitNodes(ast.nodes) || ''
  oldLineno = 1
  return result
}
