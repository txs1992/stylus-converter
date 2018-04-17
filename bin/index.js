'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Parser = _interopDefault(require('stylus/lib/parser.js'));

function repeatString(str, num) {
  return num > 0 ? str.repeat(num) : '';
}

function nodesToJSON(nodes) {
  return nodes.map(function (node) {
    return node.toJSON();
  });
}

function trimFirst(str) {
  return str.replace(/(^\s*)/g, '');
}

function tirmFirstLength(str) {
  return str.length - trimFirst(str).length;
}

function trimLinefeed(str) {
  return str.replace(/^\n*/, '');
}

function trimFirstLinefeedLength(str) {
  return tirmFirstLength(trimLinefeed(str));
}

var oldLineno = 1;
var oldColumn = 1;

var TYPE_VISITOR_MAP = {
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

function handleLineno(lineno) {
  return repeatString('\n', lineno - oldLineno);
}

function handleColumn(column) {
  return repeatString(' ', column - oldColumn);
}

function handleLinenoAndColumn(_ref) {
  var lineno = _ref.lineno,
      column = _ref.column;

  return handleLineno(lineno) + handleColumn(column);
}

function findNodesType(list, type) {
  var nodes = nodesToJSON(list);
  return nodes.find(function (node) {
    return node.__type === type;
  });
}

function visitNode(node) {
  var handler = TYPE_VISITOR_MAP[node.__type];
  return handler ? handler(node) : '';
}

// 处理 nodes
function visitNodes() {
  var list = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

  var text = '';
  var nodes = nodesToJSON(list);
  nodes.forEach(function (node) {
    text += visitNode(node);
  });
  return text;
}

// 处理 import；handler import
function visitImport(node) {
  var before = handleLineno(node.lineno) + '@import ';
  oldLineno = node.lineno;
  var quote = '';
  var text = '';
  var nodes = nodesToJSON(node.path.nodes || []);
  nodes.forEach(function (node) {
    text += node.val;
    if (!quote && node.quote) quote = node.quote;
  });
  return '' + before + quote + text + quote + ';';
}

function visitSelector(node) {
  var text = handleLinenoAndColumn(node);
  oldLineno = node.lineno;
  return text + visitNodes(node.segments);
}

function visitGroup(node) {
  var selector = visitNodes(node.nodes);
  var blockEnd = findNodesType(node.nodes, 'Selector') && selector || '';
  var block = visitBlock(node.block, blockEnd);
  return selector + block;
}

function visitBlock(node, selector) {
  var before = ' {';
  var after = selector && '\n' + handleColumn(trimFirstLinefeedLength(selector) + 1) + '}';
  var text = '';
  text += visitNodes(node.nodes);
  return '' + before + text + after;
}

function visitLiteral(node) {
  return node.val || '';
}

function visitProperty(node) {
  var text = handleLinenoAndColumn(node);
  oldLineno = node.lineno;
  return text + visitNodes(node.segments) + ': ' + visitExpression(node.expr) + ';';
}

function visitIdent(node) {
  return node.name;
}

function visitExpression(node) {
  return visitNodes(node.nodes);
}

function visitCall(node) {
  return node.name + '(' + visitArguments(node.args) + ')';
}

function visitArguments(node) {
  var nodes = nodesToJSON(node.nodes);
  var text = '';
  nodes.forEach(function (node, idx) {
    var prefix = idx ? ', ' : '';
    text += prefix + visitNode(node);
  });
  return text;
}

function visitRGBA(node, prop) {
  return node.raw;
}

function visitUnit(node) {
  return node.val + node.type;
}

// 处理 stylus 语法树；handle stylus Syntax Tree
function visitor(ast, option) {
  return visitNodes(ast.nodes) || '';
}

function converter(result) {
  var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'scss';

  if (typeof result !== 'string') return result;
  var ast = new Parser(result).parse();
  return visitor(ast, option);
}

module.exports = converter;
