import {
  _get,
  trimFirst,
  nodesToJSON,
  repeatString,
  getCharLength,
  replaceFirstATSymbol
} from '../util.js'

let quote = `'`
let callName = ''
let oldLineno = 1
let oldColumn = 1
let transfrom = ''
let returnSymbol = ''
let indentationLevel = 0
let OBJECT_KEY_LIST = []
let PROPERTY_KEY_LIST = []
let PROPERTY_VAL_LIST = []
let VARIABLE_NAME_LIST = []

let isCall = false
let isObject = false
let isFunction = false
let isProperty = false
let isNamespace = false
let isKeyframes = false
let isExpression = false
let isIfExpression = false

let autoprefixer = true

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

const KEYFRAMES_LIST = [
  '@-webkit-keyframes ',
  '@-moz-keyframes ',
  '@-ms-keyframes ',
  '@-o-keyframes ',
  '@keyframes '
]

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
  Query: visitQuery,
  Media: visitMedia,
  Atrule: visitAtrule,
  Object: visitObject,
  Import: visitImport,
  Atrule: visitAtrule,
  Extend: visitExtend,
  Member: visitMember,
  Comment: visitComment,
  Feature: visitFeature,
  UnaryOp: visitUnaryOp,
  Literal: visitLiteral,
  Charset: visitCharset,
  Params: visitArguments,
  Property: visitProperty,
  'Boolean': visitBoolean,
  Selector: visitSelector,
  Supports: visitSupports,
  'Function': visitFunction,
  Arguments: visitArguments,
  Keyframes: visitKeyframes,
  QueryList: visitQueryList,
  Namespace: visitNamespace,
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
  if (!node) return ''
  const json = node.__type ? node : node.toJSON && node.toJSON()
  const handler = TYPE_VISITOR_MAP[json.__type]
  return handler ? handler(node) : ''
}

function recursiveSearchName(data, property, name) {
  return data[property]
    ? recursiveSearchName(data[property], property, name)
    : data[name]
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
  const nodes = nodesToJSON(node.nodes)
  let selector = ''
  nodes.forEach((node, idx) => {
    selector += idx ? `, ${visitNode(node)}`: visitNode(node)
  })
  // const selector = visitNodes(node.nodes)
  const block = visitBlock(node.block)
  if (isKeyframes && /-|\*|\+|\/|\$/.test(selector)) {
    const len = getCharLength(selector, ' ') - 2
    return `\n${repeatString(' ', len)}#{${trimFirst(selector)}}${block}`
  }
  return selector + block
}

function visitBlock (node) {
  indentationLevel++
  const before = ' {'
  const after = `\n${repeatString(' ', (indentationLevel - 1) * 2)}}`
  const text = visitNodes(node.nodes)
  let result = text
  if (isFunction && !/@return/.test(text)) {
    result = ''
    const symbol = repeatString(' ', indentationLevel * 2)
    if (!/\n/.test(text)) {
      result += '\n'
      oldLineno++
    }
    if (!/\s/.test(text)) result += symbol
    result += returnSymbol + text
  }
  if (isFunction) result = /;$/.test(result) ? result : result + ';'
  if (!/^\n\s*/.test(result)) result = '\n' + repeatString(' ', indentationLevel * 2) + result
  indentationLevel--
  return `${before}${result}${after}`
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
  PROPERTY_KEY_LIST.unshift(segmentsText)
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

function visitIdent ({ val, name, rest, mixin, lineno, column }) {
  const identVal = val && val.toJSON() || ''
  if (identVal.__type === 'Null' || !val) {
    if (isExpression) {
      if (isCall) return name
      const len = PROPERTY_KEY_LIST.indexOf(name)
      if (len > -1) return PROPERTY_VAL_LIST[len]
    }
    if (mixin) return `#{$${name}}`
    let nameText = VARIABLE_NAME_LIST.indexOf(name) > -1
      ? replaceFirstATSymbol(name)
      : name
    if (isFunction && (isExpression || !isProperty)) nameText = replaceFirstATSymbol(nameText)
    return rest ? `${nameText}...` : nameText
  }
  if (identVal.__type === 'Expression') {
    if (findNodesType(identVal.nodes, 'Object')) OBJECT_KEY_LIST.push(name)
    const before = handleLinenoAndIndentation(identVal)
    oldLineno = identVal.lineno
    const nodes = nodesToJSON(identVal.nodes || [])
    let expText = ''
    nodes.forEach((node, idx) => {
      expText += idx ? ` ${visitNode(node)}`: visitNode(node)
    })
    VARIABLE_NAME_LIST.push(name)
    return `${before}${replaceFirstATSymbol(name)}: ${expText};`
  }
  if (identVal.__type === 'Function') return visitFunction(identVal)
  let identText = visitNode(identVal)
  return `${replaceFirstATSymbol(name)}: ${identText};`
}

function visitExpression (node) {
  isExpression = true
  let before = handleLinenoAndIndentation(node)
  oldLineno = node.lineno
  let result = ''
  const nodes = nodesToJSON(node.nodes)
  nodes.forEach((node, idx) => {
    const nodeText = visitNode(node)
    result += idx ? ' ' + nodeText : nodeText
  })
  isExpression = false
  if (isCall && callName === 'url') return result.replace(/\s/g, '')
  if (!returnSymbol || isIfExpression) return result
  return before + returnSymbol + result
}

function visitCall ({ name, args, lineno, column }) {
  isCall = true
  callName = name
  let before = handleLineno(lineno)
  oldLineno = lineno
  const argsText = visitArguments(args)
  if (!isProperty && !isObject && !isNamespace) {
    before = before || '\n'
    before += getIndentation()
    before += '@include '
  }
  callName = ''
  isCall = false
  return `${before + name}(${argsText});`
}

function visitArguments (node) {
  const nodes = nodesToJSON(node.nodes)
  let text = ''
  nodes.forEach((node, idx) => {
    const prefix = idx ? ', ' : ''
    const result = isFunction ? replaceFirstATSymbol(visitNode(node)) : visitNode(node)
    text += prefix + result
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
    const prefix = idx ? ', ' : ''
    const nodeText = visitNode(node)
    VARIABLE_NAME_LIST.push(nodeText)
    paramsText += prefix + replaceFirstATSymbol(nodeText)
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
  const isExp = rightExp.__type === 'Expression'
  const expText = isExp ? `(${visitNode(rightExp)})`: visitNode(rightExp)
  return `${visitNode(leftExp)} ${OPEARTION_MAP[op] || op} ${expText}`
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

function visitKeyframes (node) {
  isKeyframes = true
  let before = handleLinenoAndIndentation(node)
  oldLineno = node.lineno
  let resultText = ''
  const name = visitNodes(node.segments)
  const isMixin = !!findNodesType(node.segments, 'Expression')
  const block = visitBlock(node.block)
  const text = isMixin ? `#{${name}}${block}` :  name + block
  if (autoprefixer) {
    KEYFRAMES_LIST.forEach(name => {
      resultText += before + name + text
    })
  } else {
    resultText += before + '@keyframes ' + text
  }
  isKeyframes = false
  return resultText
}

function visitExtend (node) {
  const before = handleLinenoAndIndentation(node)
  oldLineno = node.lineno
  const text = visitNodes(node.selectors)
  return `${before}@extend ${trimFirst(text)};`
}

function visitQueryList (node) {
  let text = ''
  const nodes = nodesToJSON(node.nodes)
  nodes.forEach((node, idx) => {
    const nodeText = visitNode(node)
    text += idx ? `, ${nodeText}` : nodeText
  })
  return text
}

function visitQuery (node) {
  const type = visitNode(node.type)
  const nodes = nodesToJSON(node.nodes)
  let text = ''
  nodes.forEach((node, idx) => {
    const nodeText = visitNode(node)
    text += idx ? ` and ${nodeText}` : nodeText
  })
  return type ? `${type} and ${text}` : text
}

function visitMedia (node) {
  const before = handleLinenoAndIndentation(node)
  oldLineno = node.lineno
  const val = _get(node, ['val'], {})
  const nodeVal = val.toJSON && val.toJSON() || {}
  const valText = visitNode(nodeVal)
  const block = visitBlock(node.block)
  return `${before}@media ${valText + block}`
}

function visitFeature (node) {
  const segmentsText = visitNodes(node.segments)
  const expText = visitExpression(node.expr)
  return `(${segmentsText}: ${expText})`
}

function visitComment (node) {
  const before = handleLinenoAndIndentation(node)
  oldLineno = node.lineno + 2
  return before + node.str
}

function visitMember ({ left, right }) {
  const searchName = recursiveSearchName(left, 'left', 'name')
  if (searchName && OBJECT_KEY_LIST.indexOf(searchName) > -1) {
    return `map-get(${visitNode(left)}, ${ quote + visitNode(right) + quote})`
  }
  return `${visitNode(left)}.${visitNode(right)}`
}

function visitAtrule (node) {
  let before = handleLinenoAndIndentation(node)
  oldLineno = node.lineno
  before += '@' + node.type
  return before + visitBlock(node.block)
}

function visitObject ({ vals, lineno }) {
  isObject = true
  indentationLevel++
  const before = repeatString(' ', indentationLevel * 2)
  let result = ``
  let count = 0
  for(let key in vals) {
    const resultVal = visitNode(vals[key]).replace(/;/, '')
    const symbol = count ? ',' : ''
    result += `${symbol}\n${before + quote + key + quote}: ${resultVal}`
    count++
  }
  const totalLineno = lineno + count + 2
  oldLineno = totalLineno > oldLineno ? totalLineno : oldLineno
  indentationLevel--
  isObject = false
  return `(${result}\n${repeatString(' ', indentationLevel * 2)})`
}

function visitCharset ({ val: { val: value, quote }, lineno }) {
  const before = handleLineno(lineno)
  oldLineno = lineno
  return `${before}@charset ${quote + value + quote};`
}

function visitNamespace ({ val, lineno }) {
  isNamespace = true
  const name = '@namespace '
  const before = handleLineno(lineno)
  oldLineno = lineno
  if (val.type === 'string') {
    const { val: value, quote: valQuote } = val.val
    isNamespace = false
    return before + name + valQuote + value + valQuote + ';'
  }
  return before + name + visitNode(val)
}

function visitAtrule ({ type, block, lineno, segments }) {
  const before = handleLineno(lineno)
  oldLineno = lineno
  const typeText = segments.length ? `@${type} ` : `@${type}`
  return `${before + typeText + visitNodes(segments) + visitBlock(block)}`
}

function visitSupports ({ block, lineno, condition }) {
  let before = handleLineno(lineno)
  oldLineno = lineno
  before += getIndentation()
  return `${before}@Supports ${visitNode(condition) + visitBlock(block)}`
}

// 处理 stylus 语法树；handle stylus Syntax Tree
export default function visitor (ast, options) {
  autoprefixer = options.autoprefixer == null ? true : options.autoprefixer
  quote = options.quote || `'`
  const result = visitNodes(ast.nodes) || ''
  oldLineno = 1
  OBJECT_KEY_LIST = []
  PROPERTY_KEY_LIST = []
  PROPERTY_VAL_LIST = []
  VARIABLE_NAME_LIST = []
  return result
}
