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

function replaceFirstATSymbol(str) {
  var temp = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '$';

  return str.replace(/^\$|/, temp);
}

var oldLineno = 1;
var oldColumn = 1;
var returnSymbol = '';
var isFunction = false;
var isProperty = false;
var isExpression = false;
var isIfExpression = false;

var TYPE_VISITOR_MAP = {
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
  var endSymbol = handleColumn(node.block.column);
  var block = visitBlock(node.block, endSymbol);
  return selector + block;
}

function visitBlock(node) {
  var suffix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

  var before = ' {';
  var after = '\n' + suffix + '}';
  var text = visitNodes(node.nodes);
  return '' + before + text + after;
}

function visitLiteral(node) {
  return node.val || '';
}

function visitProperty(_ref2) {
  var expr = _ref2.expr,
      column = _ref2.column,
      lineno = _ref2.lineno,
      segments = _ref2.segments;

  var hasCall = findNodesType(expr && expr.nodes || [], 'Call');
  var suffix = hasCall ? '' : ';';
  var before = handleLineno(lineno);
  oldLineno = lineno;
  isProperty = true;
  var segmentText = visitNodes(segments);
  var result = segmentText + ': ' + visitExpression(expr);
  var trimSymbolSegment = segmentText.replace(/#|\$/g, '');
  before += handleColumn(column - (trimSymbolSegment.length - 1));
  isProperty = false;
  return before + result + suffix;
}

function visitIdent(_ref3) {
  var val = _ref3.val,
      name = _ref3.name,
      mixin = _ref3.mixin,
      lineno = _ref3.lineno;

  var identVal = val && val.toJSON() || '';
  if (identVal.__type === 'Null' || !val) {
    if (mixin) return '#{$' + name + '}';
    return '' + (isExpression ? '$' : '') + name;
  }
  var before = handleLineno(lineno);
  oldLineno = lineno;
  if (identVal.__type === 'Function') return visitFunction(identVal);
  return before + replaceFirstATSymbol(name) + ' = ' + visitNode(identVal) + ';';
}

function visitExpression(node) {
  isExpression = true;
  var result = visitNodes(node.nodes);
  isExpression = false;
  if (!returnSymbol || isIfExpression) return result;
  var before = '\n';
  before += handleColumn(node.column + 1 - result.length);
  return before + returnSymbol + result;
}

function visitCall(_ref4) {
  var name = _ref4.name,
      args = _ref4.args,
      lineno = _ref4.lineno,
      column = _ref4.column;

  var before = handleLineno(lineno);
  var argsText = visitArguments(args);
  oldLineno = lineno;
  if (!isProperty) {
    var exprLen = name.length + argsText.length + 1;
    before += handleColumn(column - exprLen);
    before += '@include ';
  }
  return before + name + '(' + argsText + ');';
}

function visitArguments(node) {
  var nodes = nodesToJSON(node.nodes);
  var text = '';
  var symbol = isFunction ? '$' : '';
  nodes.forEach(function (node, idx) {
    var prefix = idx ? ', ' : '';
    text += prefix + symbol + visitNode(node);
  });
  return text || '';
}

function visitRGBA(node, prop) {
  return node.raw;
}

function visitUnit(_ref5) {
  var val = _ref5.val,
      type = _ref5.type;

  return type ? val + type : val;
}

function visitBoolean(node) {
  return node.val;
}

function visitIf(node) {
  var symbol = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '@if ';

  var before = '';
  isIfExpression = true;
  var condText = visitExpression(node.cond);
  isIfExpression = false;
  var condLen = node.column - (condText.length + 2);
  if (symbol === '@if ') {
    before += handleLineno(node.lineno);
    oldLineno = node.lineno;
    before += handleColumn(condLen);
  }
  var block = visitBlock(node.block, handleColumn(condLen));
  var elseText = '';
  if (node.elses && node.elses.length) {
    var elses = nodesToJSON(node.elses);
    elses.forEach(function (node) {
      if (node.__type === 'If') {
        elseText += visitIf(node, ' @else if ');
      } else {
        elseText += ' @else' + visitBlock(node, handleColumn(condLen));
      }
    });
  }
  return before + symbol + condText + block + elseText;
}

function visitFunction(node) {
  isFunction = true;
  var notMixin = !findNodesType(node.block.nodes, 'Property');
  var hasIf = findNodesType(node.block.nodes, 'If');
  var before = handleLineno(node.lineno);
  var symbol = '';
  oldLineno = node.lineno;
  if (notMixin) {
    returnSymbol = '@return ';
    symbol = '@function';
  } else {
    returnSymbol = '';
    symbol = '@mixin';
  }
  var fnName = symbol + ' ' + node.name + '(' + visitArguments(node.params) + ')';
  var block = visitBlock(node.block);
  returnSymbol = '';
  isFunction = false;
  return before + fnName + block;
}

function visitBinOp(node) {
  return visitIdent(node.left) + ' ' + node.op + ' ' + visitIdent(node.right);
}

// 处理 stylus 语法树；handle stylus Syntax Tree
function visitor(ast, option) {
  var result = visitNodes(ast.nodes) || '';
  oldLineno = 1;
  return result;
}

function converter(result) {
  var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'scss';

  if (typeof result !== 'string') return result;
  var ast = new Parser(result).parse();
  return visitor(ast, option);
}

module.exports = converter;
