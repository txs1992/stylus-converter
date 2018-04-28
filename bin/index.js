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

function replaceFirstATSymbol(str) {
  var temp = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '$';

  return str.replace(/^\$|/, temp);
}

function getCharLength(str, char) {
  return str.split(char).length - 1;
}

function _get(obj, pathArray, defaultValue) {
  if (obj == null) return defaultValue;

  var value = obj;

  pathArray = [].concat(pathArray);

  for (var i = 0; i < pathArray.length; i += 1) {
    var key = pathArray[i];
    value = value[key];
    if (value == null) {
      return defaultValue;
    }
  }

  return value;
}

var autoprefixer = true;
var oldLineno = 1;
var returnSymbol = '';
var isFunction = false;
var isProperty = false;
var isKeyframes = false;
var isExpression = false;
var isIfExpression = false;
var indentationLevel = 0;
var PROPERTY_KEY_LIST = [];
var PROPERTY_VAL_LIST = [];
var VARIABLE_NAME_LIST = [];

var OPEARTION_MAP = {
  '&&': 'and',
  '!': 'not',
  '||': 'or'
};

var KEYFRAMES_LIST = ['@-webkit-keyframes ', '@-moz-keyframes ', '@-ms-keyframes ', '@-o-keyframes ', '@keyframes '];

var TYPE_VISITOR_MAP = {
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
  Extend: visitExtend,
  UnaryOp: visitUnaryOp,
  Literal: visitLiteral,
  Params: visitArguments,
  Property: visitProperty,
  'Boolean': visitBoolean,
  'Function': visitFunction,
  Selector: visitSelector,
  Arguments: visitArguments,
  Keyframes: visitKeyframes,
  Expression: visitExpression
};

function handleLineno(lineno) {
  return repeatString('\n', lineno - oldLineno);
}

function getIndentation() {
  return repeatString(' ', indentationLevel * 2);
}

function handleLinenoAndIndentation(_ref) {
  var lineno = _ref.lineno;

  return handleLineno(lineno) + getIndentation();
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
  var text = handleLinenoAndIndentation(node);
  oldLineno = node.lineno;
  return text + visitNodes(node.segments);
}

function visitGroup(node) {
  var selector = visitNodes(node.nodes);
  var block = visitBlock(node.block);
  if (isKeyframes && /-|\*|\+|\/|\$/.test(selector)) {
    var len = getCharLength(selector, ' ') - 2;
    return '\n' + repeatString(' ', len) + '#{' + trimFirst(selector) + '}' + block;
  }
  return selector + block;
}

function visitBlock(node) {
  indentationLevel++;
  var before = ' {';
  var after = '\n' + repeatString(' ', (indentationLevel - 1) * 2) + '}';
  var text = visitNodes(node.nodes);
  indentationLevel--;
  return '' + before + text + after;
}

function visitLiteral(node) {
  return node.val || '';
}

function visitProperty(_ref2) {
  var expr = _ref2.expr,
      lineno = _ref2.lineno,
      segments = _ref2.segments;

  var hasCall = findNodesType(expr && expr.nodes || [], 'Call');
  var suffix = hasCall ? '' : ';';
  var before = handleLinenoAndIndentation({ lineno: lineno });
  oldLineno = lineno;
  isProperty = true;
  var segmentsText = visitNodes(segments);
  PROPERTY_KEY_LIST.unshift(segmentsText);
  if (_get(expr, ['nodes', 'length']) === 1) {
    var expNode = expr.nodes[0];
    var ident = expNode.toJSON && expNode.toJSON() || {};
    if (ident.__type === 'Ident') {
      var identVal = _get(ident, ['val', 'toJSON']) && ident.val.toJSON() || {};
      if (identVal.__type === 'Expression') {
        VARIABLE_NAME_LIST.push(ident.name);
        var beforeExpText = before + trimFirst(visitExpression(expr));
        var _expText = '' + before + segmentsText + ': $' + ident.name + ';';
        PROPERTY_VAL_LIST.unshift('$' + ident.name);
        isProperty = false;
        return beforeExpText + _expText;
      }
    }
  }
  var expText = visitExpression(expr);
  PROPERTY_VAL_LIST.unshift(expText);
  isProperty = false;
  return before + segmentsText + ': ' + (expText + suffix);
}

function visitIdent(_ref3) {
  var val = _ref3.val,
      name = _ref3.name,
      mixin = _ref3.mixin,
      lineno = _ref3.lineno,
      column = _ref3.column;

  var identVal = val && val.toJSON() || '';
  if (identVal.__type === 'Null' || !val) {
    if (isExpression) {
      var len = PROPERTY_KEY_LIST.indexOf(name);
      if (len > -1) return replaceFirstATSymbol(PROPERTY_VAL_LIST[len]);
    }
    if (mixin) return '#{$' + name + '}';
    return VARIABLE_NAME_LIST.indexOf(name) > -1 ? replaceFirstATSymbol(name) : name;
  }
  if (identVal.__type === 'Expression') {
    var before = handleLinenoAndIndentation(identVal);
    oldLineno = identVal.lineno;
    var nodes = nodesToJSON(identVal.nodes || []);
    var expText = '';
    nodes.forEach(function (node, idx) {
      expText += idx ? ' ' + visitNode(node) : visitNode(node);
    });
    VARIABLE_NAME_LIST.push(name);
    return '' + before + replaceFirstATSymbol(name) + ': ' + expText + ';';
  }
  if (identVal.__type === 'Function') return visitFunction(identVal);
  var identText = visitNode(identVal);
  return replaceFirstATSymbol(name) + ': ' + identText + ';';
}

function visitExpression(node) {
  isExpression = true;
  var before = handleLinenoAndIndentation(node);
  oldLineno = node.lineno;
  var result = '';
  var nodes = nodesToJSON(node.nodes);
  nodes.forEach(function (node, idx) {
    var nodeText = visitNode(node);
    result += idx ? ' ' + nodeText : nodeText;
  });
  isExpression = false;
  if (!returnSymbol || isIfExpression) return result;
  return before + returnSymbol + result;
}

function visitCall(_ref4) {
  var name = _ref4.name,
      args = _ref4.args,
      lineno = _ref4.lineno,
      column = _ref4.column;

  var before = handleLineno(lineno);
  oldLineno = lineno;
  var argsText = visitArguments(args);
  if (!isProperty) {
    before = before || '\n';
    before += getIndentation();
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
  if (symbol === '@if ') {
    before += handleLinenoAndIndentation(node);
    oldLineno = node.lineno;
  }
  var condNode = node.cond && node.cond.toJSON() || { column: 0 };
  var condText = visitNode(condNode);
  isIfExpression = false;
  var block = visitBlock(node.block);
  var elseText = '';
  if (node.elses && node.elses.length) {
    var elses = nodesToJSON(node.elses);
    elses.forEach(function (node) {
      oldLineno++;
      if (node.__type === 'If') {
        elseText += visitIf(node, ' @else if ');
      } else {
        elseText += ' @else' + visitBlock(node);
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
  oldLineno = node.lineno;
  var symbol = '';
  if (notMixin) {
    returnSymbol = '@return ';
    symbol = '@function';
  } else {
    returnSymbol = '';
    symbol = '@mixin';
  }
  var params = nodesToJSON(node.params.nodes || []);
  var paramsText = '';
  params.forEach(function (node, idx) {
    var prefix = idx ? ', $' : '$';
    var nodeText = visitNode(node);
    VARIABLE_NAME_LIST.push(nodeText);
    paramsText += prefix + nodeText;
  });
  var fnName = symbol + ' ' + node.name + '(' + paramsText + ')';
  var block = visitBlock(node.block);
  returnSymbol = '';
  isFunction = false;
  return before + fnName + block;
}

function visitBinOp(_ref6) {
  var op = _ref6.op,
      left = _ref6.left,
      right = _ref6.right;

  var leftExp = left && left.toJSON();
  var rightExp = right && right.toJSON();
  return visitNode(leftExp) + ' ' + (OPEARTION_MAP[op] || op) + ' ' + visitNode(rightExp);
}

function visitUnaryOp(_ref7) {
  var op = _ref7.op,
      expr = _ref7.expr;

  return (OPEARTION_MAP[op] || op) + '(' + visitExpression(expr) + ')';
}

function visitEach(node) {
  var before = handleLineno(node.lineno);
  oldLineno = node.lineno;
  var expr = node.expr && node.expr.toJSON();
  var exprNodes = nodesToJSON(expr.nodes);
  var exprText = '@each $' + node.val + ' in ';
  VARIABLE_NAME_LIST.push(node.val);
  exprNodes.forEach(function (node, idx) {
    var prefix = node.__type === 'Ident' ? '$' : '';
    var exp = prefix + visitNode(node);
    exprText += idx ? ', ' + exp : exp;
  });
  if (/\.\./.test(exprText)) {
    exprText = exprText.replace('@each', '@for').replace('..', 'through').replace('in', 'from');
  }
  var blank = getIndentation();
  before += blank;
  var block = visitBlock(node.block, blank).replace('$' + node.key, '');
  return before + exprText + block;
}

function visitKeyframes(node) {
  isKeyframes = true;
  var before = handleLinenoAndIndentation(node);
  oldLineno = node.lineno;
  var resultText = '';
  var name = visitNodes(node.segments);
  var isMixin = !!findNodesType(node.segments, 'Expression');
  var block = visitBlock(node.block);
  var text = isMixin ? '#{' + name + '}' + block : name + block;
  if (autoprefixer) {
    KEYFRAMES_LIST.forEach(function (name) {
      resultText += before + name + text;
    });
  } else {
    resultText += before + '@keyframes ' + text;
  }
  isKeyframes = false;
  return resultText;
}

function visitExtend(node) {
  var before = handleLinenoAndIndentation(node);
  oldLineno = node.lineno;
  var text = visitNodes(node.selectors);
  return before + '@extend ' + trimFirst(text) + ';';
}

// 处理 stylus 语法树；handle stylus Syntax Tree
function visitor(ast, options) {
  autoprefixer = options.autoprefixer == null ? true : options.autoprefixer;
  var result = visitNodes(ast.nodes) || '';
  oldLineno = 1;
  PROPERTY_KEY_LIST = [];
  PROPERTY_VAL_LIST = [];
  VARIABLE_NAME_LIST = [];
  return result;
}

function converter(result) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { transfrom: 'sass' };

  if (typeof result !== 'string') return result;
  var ast = new Parser(result).parse();
  // console.log(JSON.stringify(ast))
  return visitor(ast, options);
}

module.exports = converter;
