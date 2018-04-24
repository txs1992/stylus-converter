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
let indentationLevel = 0

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
  Each: visitEach,
  RGBA: visitRGBA,
  Unit: visitUnit,
  Call: visitCall,
  Block: visitBlock,
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
  let before = handleLineno(lineno)
  oldLineno = lineno
  isProperty = true
  const result = `${visitNodes(segments)}: ${visitExpression(expr)}`
  before += getIndentation()
  isProperty = false
  return before + result + suffix
}

function visitIdent ({ val, name, mixin, lineno, column }) {
  const identVal = val && val.toJSON() || ''
  if (identVal.__type === 'Null' || !val) {
    if (mixin) return `#{$${name}}`
    return `${isExpression ? '$': ''}${name}`
  }
  if (identVal.__type === 'Function') return visitFunction(identVal)
  let before = ''
  let identText = visitNode(identVal)
  return `${before + replaceFirstATSymbol(name)}: ${identText};`
}

function visitExpression (node) {
  isExpression = true
  const result = visitNodes(node.nodes)
  isExpression = false
  if (!returnSymbol || isIfExpression) return result
  let before = handleLineno(node.lineno)
  oldLineno = node.lineno
  before += getIndentation()
  return before + returnSymbol + result
}

function visitCall ({ name, args, lineno, column }) {
  let before = handleLineno(lineno)
  const argsText = visitArguments(args)
  oldLineno = lineno
  if (!isProperty) {
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
  const condNode = node.cond && node.cond.toJSON() || { column: 0 }
  const condText = symbol.replace(/@|\s*@/g, '') + visitNode(condNode)
  isIfExpression = false
  if (symbol === '@if ') {
    before += handleLineno(node.lineno)
    oldLineno = node.lineno
    before += getIndentation()
  }
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

function visitEach (node) {
  let before = handleLineno(node.lineno)
  oldLineno = node.lineno
  const expr = node.expr && node.expr.toJSON()
  const exprNodes = nodesToJSON(expr.nodes)
  let exprText = `@each $${node.val} in `
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
  return result
}
