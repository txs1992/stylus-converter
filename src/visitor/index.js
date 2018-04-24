import { get as _get } from 'noshjs'

import {
  trimFirst,
  nodesToJSON,
  repeatString,
  replaceFirstATSymbol
} from '../util.js'

let oldLineno = 1
let oldColumn = 1
let transfrom = ''
let returnSymbol = ''
let isFunction = false
let isProperty = false
let isExpression = false
let isIfExpression = false
let indentationLevel = 0
let PROPERTY_KEY_List = []
let PROPERTY_VAL_LIST = []
let VARIABLE_NAME_LIST = []

const COMPIL_CONFIT = {
  scss: {
    variable: '$'
  },
  less: {
    variable: '@'
  }
}

const OPEARTION_MAP = {
  '&&': 'and',
  '!': 'not',
  '||': 'or'
}

const TYPE_VISITOR_MAP = {
  If: visitIf,
  Each: visitEach,
  RGBA: visitRGBA,
  Unit: visitUnit,
  Call: visitCall,
  Block: visitBlock,
  BinOp: visitBinOp,
  Ident: visitIdent,
  Group: visitGroup,
  Import: visitImport,
  UnaryOp: visitUnaryOp,
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

function getIndentation () {
  return repeatString(' ', indentationLevel * 2)
}

function handleLinenoAndIndentation ({ lineno }) {
  return handleLineno(lineno) + getIndentation()
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
  let text = handleLinenoAndIndentation(node)
  oldLineno = node.lineno
  return text + visitNodes(node.segments)
}

function visitGroup (node) {
  const selector = visitNodes(node.nodes)
  const blockEnd = findNodesType(node.nodes, 'Selector') && selector || ''
  const block = visitBlock(node.block)
  return selector + block
}

function visitBlock (node) {
  indentationLevel++
  const before = ' {'
  const after = `\n${repeatString(' ', (indentationLevel - 1) * 2)}}`
  const text = visitNodes(node.nodes)
  indentationLevel--
  return `${before}${text}${after}`
}

function visitLiteral (node) {
  return node.val || ''
}

function visitProperty ({ expr, lineno, segments }) {
  const hasCall = findNodesType(expr && expr.nodes || [], 'Call')
  const suffix = hasCall ? '' : ';'
  const before = handleLinenoAndIndentation({ lineno })
  oldLineno = lineno
  isProperty = true
  const segmentsText = visitNodes(segments)
  PROPERTY_KEY_List.unshift(segmentsText)
  if (_get(expr, ['nodes', 'length']) === 1) {
    const expNode = expr.nodes[0]
    const ident = expNode.toJSON && expNode.toJSON() || {}
    if (ident.__type === 'Ident') {
      const identVal = _get(ident, ['val', 'toJSON']) && ident.val.toJSON() || {}
      if (identVal.__type === 'Expression') {
        VARIABLE_NAME_LIST.push(ident.name)
        const beforeExpText = before + trimFirst(visitExpression(expr))
        const expText = `${before}${segmentsText}: $${ident.name};`
        PROPERTY_VAL_LIST.unshift('$' + ident.name)
        isProperty = false
        return beforeExpText + expText
      }
    }
  }
  const expText = visitExpression(expr)
  PROPERTY_VAL_LIST.unshift(expText)
  isProperty = false
  return `${before + segmentsText}: ${expText + suffix}`
}

function visitIdent ({ val, name, mixin, lineno, column }) {
  const identVal = val && val.toJSON() || ''
  if (identVal.__type === 'Null' || !val) {
    const len = PROPERTY_KEY_List.indexOf(name)
    if (len > -1) return PROPERTY_VAL_LIST[len]
    if (mixin) return `#{$${name}}`
    return VARIABLE_NAME_LIST.indexOf(name) > -1 ? `$${name}` : name
  }
  if (identVal.__type === 'Expression') {
    const before = handleLinenoAndIndentation(identVal)
    oldLineno = identVal.lineno
    const nodes = nodesToJSON(identVal.nodes || [])
    let expText = ''
    nodes.forEach((node, idx) => {
      expText += idx ? ` ${visitNode(node)}`: visitNode(node)
    })
    VARIABLE_NAME_LIST.push(name)
    return `${before}$${name}: ${expText};`
  }
  if (identVal.__type === 'Function') return visitFunction(identVal)
  let identText = visitNode(identVal)
  return `${replaceFirstATSymbol(name)}: ${identText};`
}

function visitExpression (node) {
  isExpression = true
  let before = handleLinenoAndIndentation(node)
  oldLineno = node.lineno
  const result = visitNodes(node.nodes)
  isExpression = false
  if (!returnSymbol || isIfExpression) return result
  return before + returnSymbol + result
}

function visitCall ({ name, args, lineno, column }) {
  let before = handleLineno(lineno)
  oldLineno = lineno
  const argsText = visitArguments(args)
  if (!isProperty) {
    before = before || '\n'
    before += getIndentation()
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
  if (symbol === '@if ') {
    before += handleLinenoAndIndentation(node)
    oldLineno = node.lineno
  }
  const condNode = node.cond && node.cond.toJSON() || { column: 0 }
  const condText = visitNode(condNode)
  isIfExpression = false
  const block = visitBlock(node.block)
  let elseText = ''
  if (node.elses && node.elses.length) {
    const elses = nodesToJSON(node.elses)
    elses.forEach(node => {
      oldLineno++
      if (node.__type === 'If') {
        elseText += visitIf(node, ' @else if ')
      } else {
        elseText += ' @else' + visitBlock(node)
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
  const params = nodesToJSON(node.params.nodes || [])
  let paramsText = ''
  params.forEach((node, idx) => {
    const prefix = idx ? ', $' : '$'
    const nodeText = visitNode(node)
    VARIABLE_NAME_LIST.push(nodeText)
    paramsText += prefix + nodeText
  })
  const fnName = `${symbol} ${node.name}(${paramsText})`
  const block = visitBlock(node.block)
  returnSymbol = ''
  isFunction = false
  return before + fnName + block
}

function visitBinOp ({ op, left, right }) {
  const leftExp = left && left.toJSON()
  const rightExp = right && right.toJSON()
  return `${visitNode(leftExp)} ${OPEARTION_MAP[op] || op} ${visitNode(rightExp)}`
}

function visitUnaryOp ({ op, expr }) {
  return `${OPEARTION_MAP[op] || op}(${visitExpression(expr)})`
}

function visitEach (node) {
  let before = handleLineno(node.lineno)
  oldLineno = node.lineno
  const expr = node.expr && node.expr.toJSON()
  const exprNodes = nodesToJSON(expr.nodes)
  let exprText = `@each $${node.val} in `
  VARIABLE_NAME_LIST.push(node.val)
  exprNodes.forEach((node, idx) => {
    const prefix = node.__type === 'Ident' ? '$' : ''
    const exp = prefix + visitNode(node)
    exprText += idx ? `, ${exp}` : exp
  })
  if (/\.\./.test(exprText)) {
    exprText = exprText.replace('@each', '@for').replace('..', 'through').replace('in', 'from')
  }
  const blank = getIndentation()
  before += blank
  const block = visitBlock(node.block, blank).replace(`$${node.key}`, '')
  return before + exprText + block
}

// 处理 stylus 语法树；handle stylus Syntax Tree
export default function visitor (ast, option) {
  transfrom = option
  const result = visitNodes(ast.nodes) || ''
  oldLineno = 1
  PROPERTY_KEY_List = []
  PROPERTY_VAL_LIST = []
  VARIABLE_NAME_LIST = []
  return result
}
