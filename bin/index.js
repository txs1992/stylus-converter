'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var noshjs = require('noshjs');
var Parser = _interopDefault(require('stylus/lib/parser.js'));

function repeatString (str, num) {
  return num > 0 ? str.repeat(num) : ''
}

function nodesToJSON (nodes) {
  return nodes.map(node => node.toJSON())
}

function handleLineno (old, lineno) {
  return repeatString('\n', lineno - old)
}

let oldLineno = 1;

// handle stylus Syntax Tree
// 处理 stylus 语法树
function visitor (nodes) {
  let resultText = '';
  nodes.forEach(node => {
    // 处理换行
    resultText += handleLineno(oldLineno, node.lineno);
    switch (node.__type) {
      case 'Import': resultText += visitImport(node); break;
      case 'Ident': resultText += visitIdent(node);
        break;
    }
  });
  return resultText
}

// 处理 import
// handler import
function visitImport (node) {
  const last = '@import ';
  let text = '';
  const nodes = nodesToJSON(node.path.nodes || []);
  nodes.forEach(node => {
    text += node.val;
    if (node.lineno) oldLineno = node.lineno;
  });
  return `${last}'${text}';`
}

function visitIdent (node) {

}

function converter (result) {
  if (typeof result !== 'string') return result
  const ast = new Parser(result).parse();
  if (noshjs.get(ast, ['nodes', 'length'])) {
    return visitor(nodesToJSON(ast.nodes))
  }
  return result
}

module.exports = converter;
