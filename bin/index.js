'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var noshjs = require('noshjs');
var Parser = _interopDefault(require('stylus/lib/parser.js'));

function nodesToJSON (nodes) {
  return nodes.map(node => node.toJSON())
}

// 处理 import
// handler import
function visitImport (node) {
  const last = '@import ';
  let text = '';
  const nodes = nodesToJSON(node.path.nodes || []);
  nodes.forEach(node => {
    text += node.val;
  });
  return `${last}'${text}';\n`
}

// handle stylus Syntax Tree
// 处理 stylus 语法树
function visitor (nodes) {
  let resultText = '';
  nodes.forEach(node => {
    switch (node.__type) {
      case 'Import':
        resultText += visitImport(node);
        break;
    }
  });
  return resultText
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
