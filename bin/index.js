'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Parser = _interopDefault(require('stylus/lib/parser.js'));

function repeatString (str, num) {
  return num > 0 ? str.repeat(num) : ''
}

function nodesToJSON (nodes) {
  return nodes.map(node => node.toJSON())
}

function trimFirst (str) {
  return str.replace(/(^\s*)/g, '')
}

function tirmFirstLength (str) {
  return str.length - trimFirst(str).length
}

function trimLinefeed (str) {
  return str.replace(/^\n*/, '')
}

function trimFirstLinefeedLength (str) {
  return tirmFirstLength(trimLinefeed(str))
}

let oldLineno = 1;
let oldColumn = 1;

const TYPE_VISITOR_MAP = {
  Unit: visitUnit,
  RGBA: visitRGBA,
  Call: visitCall,
  Ident: visitIdent,
  Group: visitGroup,
  Import: visitImport,
  Selector: visitSelector,
  Literal: visitLiteral,
  Property: visitProperty,
  Expression: visitExpression,
  Arguments: visitArguments
};

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
  const nodes = nodesToJSON(list);
  return nodes.find(node => node.__type === type)
}

function visitNode (node) {
  const handler = TYPE_VISITOR_MAP[node.__type];
  return handler ? handler(node) : ''
}

// 处理 nodes
function visitNodes (list = []) {
  let text = '';
  const nodes = nodesToJSON(list);
  nodes.forEach(node => { text += visitNode(node); });
  return text
}

// 处理 import；handler import
function visitImport (node) {
  const before = handleLineno(node.lineno) + '@import ';
  oldLineno = node.lineno;
  let quote = '';
  let text = '';
  const nodes = nodesToJSON(node.path.nodes || []);
  nodes.forEach(node => {
    text += node.val;
    if (!quote && node.quote) quote = node.quote;
  });
  return `${before}${quote}${text}${quote};`
}

function visitSelector (node) {
  let text = handleLinenoAndColumn(node);
  oldLineno = node.lineno;
  return text + visitNodes(node.segments)
}

function visitGroup (node) {
  const selector = visitNodes(node.nodes);
  const blockEnd = findNodesType(node.nodes, 'Selector') && selector || '';
  const block = visitBlock(node.block, blockEnd);
  return selector + block
}

function visitBlock (node, selector) {
  const before = ' {';
  const after = selector && `\n${handleColumn(trimFirstLinefeedLength(selector) + 1)}}`;
  let text = '';
  text += visitNodes(node.nodes);
  return `${before}${text}${after}`
}

function visitLiteral (node) {
  return node.val || ''
}

function visitProperty (node) {
  let text = handleLinenoAndColumn(node);
  oldLineno = node.lineno;
  return `${text + visitNodes(node.segments)}: ${visitExpression(node.expr)};`
}

function visitIdent (node) {
  return node.name
}

function visitExpression (node) {
  return visitNodes(node.nodes)
}

function visitCall (node) {
  return `${node.name}(${visitArguments(node.args)})`
}

function visitArguments (node) {
  const nodes = nodesToJSON(node.nodes);
  let text = '';
  nodes.forEach((node, idx) => {
    const prefix = idx ? ', ' : '';
    text += prefix + visitNode(node);
  });
  return text
}

function visitRGBA (node, prop) {
  return node.raw
}

function visitUnit (node) {
  return node.val + node.type
}

// 处理 stylus 语法树；handle stylus Syntax Tree
function visitor (ast, option) {
  return visitNodes(ast.nodes) || ''
}

function converter (result, option = 'scss') {
  if (typeof result !== 'string') return result
  const ast = new Parser(result).parse();
  return visitor(ast, option)
}

module.exports = converter;
