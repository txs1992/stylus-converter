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

var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _TYPE_VISITOR_MAP;

var quote = '\'';
var conver = '';
var callName = '';
var oldLineno = 1;
var returnSymbol = '';
var indentationLevel = 0;
var OBJECT_KEY_LIST = [];
var FUNCTION_PARAMS = [];
var PROPERTY_KEY_LIST = [];
var PROPERTY_VAL_LIST = [];
var VARIABLE_NAME_LIST = [];

var isCall = false;
var isObject = false;
var isFunction = false;
var isProperty = false;
var isNamespace = false;
var isKeyframes = false;
var isArguments = false;
var isExpression = false;
var isIfExpression = false;

var autoprefixer = true;

var OPEARTION_MAP = {
  '&&': 'and',
  '!': 'not',
  '||': 'or'
};

var KEYFRAMES_LIST = ['@-webkit-keyframes ', '@-moz-keyframes ', '@-ms-keyframes ', '@-o-keyframes ', '@keyframes '];

var TYPE_VISITOR_MAP = (_TYPE_VISITOR_MAP = {
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
  Import: visitImport
}, defineProperty(_TYPE_VISITOR_MAP, 'Atrule', visitAtrule), defineProperty(_TYPE_VISITOR_MAP, 'Extend', visitExtend), defineProperty(_TYPE_VISITOR_MAP, 'Member', visitMember), defineProperty(_TYPE_VISITOR_MAP, 'Return', visitReturn), defineProperty(_TYPE_VISITOR_MAP, 'Object', visitObject), defineProperty(_TYPE_VISITOR_MAP, 'String', visitString), defineProperty(_TYPE_VISITOR_MAP, 'Feature', visitFeature), defineProperty(_TYPE_VISITOR_MAP, 'UnaryOp', visitUnaryOp), defineProperty(_TYPE_VISITOR_MAP, 'Literal', visitLiteral), defineProperty(_TYPE_VISITOR_MAP, 'Charset', visitCharset), defineProperty(_TYPE_VISITOR_MAP, 'Params', visitArguments), defineProperty(_TYPE_VISITOR_MAP, 'Comment', visitComment), defineProperty(_TYPE_VISITOR_MAP, 'Property', visitProperty), defineProperty(_TYPE_VISITOR_MAP, 'Boolean', visitBoolean), defineProperty(_TYPE_VISITOR_MAP, 'Selector', visitSelector), defineProperty(_TYPE_VISITOR_MAP, 'Supports', visitSupports), defineProperty(_TYPE_VISITOR_MAP, 'Function', visitFunction), defineProperty(_TYPE_VISITOR_MAP, 'Arguments', visitArguments), defineProperty(_TYPE_VISITOR_MAP, 'Keyframes', visitKeyframes), defineProperty(_TYPE_VISITOR_MAP, 'QueryList', visitQueryList), defineProperty(_TYPE_VISITOR_MAP, 'Namespace', visitNamespace), defineProperty(_TYPE_VISITOR_MAP, 'Expression', visitExpression), _TYPE_VISITOR_MAP);

function handleLineno(lineno) {
  return repeatString('\n', lineno - oldLineno);
}

function isFunctionMixin(nodes) {
  var jsonNodes = nodesToJSON(nodes);
  var node = jsonNodes.length && jsonNodes[0] || {};
  return node.__type === 'Property' || node.__type === 'Group';
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
  if (!node) return '';
  var json = node.__type ? node : node.toJSON && node.toJSON();
  var handler = TYPE_VISITOR_MAP[json.__type];
  return handler ? handler(node) : '';
}

function recursiveSearchName(data, property, name) {
  return data[property] ? recursiveSearchName(data[property], property, name) : data[name];
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
  var result = text.replace(/\.styl$/g, '.scss');
  return '' + before + quote + result + quote + ';';
}

function visitSelector(node) {
  var nodes = nodesToJSON(node.segments);
  var endNode = nodes[nodes.length - 1];
  var before = '';
  if (endNode.lineno) {
    before = handleLineno(endNode.lineno);
    oldLineno = endNode.lineno;
  }
  before += getIndentation();
  return before + visitNodes(node.segments);
}

function visitGroup(node) {
  var before = handleLinenoAndIndentation(node);
  oldLineno = node.lineno;
  var nodes = nodesToJSON(node.nodes);
  var selector = '';
  nodes.forEach(function (node, idx) {
    var temp = visitNode(node);
    var result = /^\n/.test(temp) ? temp : temp.replace(/^\s*/, '');
    selector += idx ? ', ' + result : result;
  });
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
  var result = text;
  if (isFunction && !/@return/.test(text)) {
    result = '';
    var symbol = repeatString(' ', indentationLevel * 2);
    if (!/\n/.test(text)) {
      result += '\n';
      oldLineno++;
    }
    if (!/\s/.test(text)) result += symbol;
    result += returnSymbol + text;
  }
  if (isFunction) result = /;$/.test(result) ? result : result + ';';
  if (!/^\n\s*/.test(result)) result = '\n' + repeatString(' ', indentationLevel * 2) + result;
  indentationLevel--;
  return '' + before + result + after;
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
      rest = _ref3.rest,
      mixin = _ref3.mixin,
      lineno = _ref3.lineno;

  var identVal = val && val.toJSON() || '';
  if (identVal.__type === 'Null' || !val) {
    if (isExpression) {
      if (isCall) return name;
      var len = PROPERTY_KEY_LIST.indexOf(name);
      if (len > -1) return PROPERTY_VAL_LIST[len];
    }
    if (mixin) return name === 'block' ? '@content' : '#{$' + name + '}';
    var nameText = VARIABLE_NAME_LIST.indexOf(name) > -1 ? replaceFirstATSymbol(name) : name;
    if (FUNCTION_PARAMS.indexOf(name) > -1) nameText = replaceFirstATSymbol(nameText);
    return rest ? nameText + '...' : nameText;
  }
  if (identVal.__type === 'Expression') {
    if (findNodesType(identVal.nodes, 'Object')) OBJECT_KEY_LIST.push(name);
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
    var symbol = isProperty && node.nodes ? ',' : '';
    result += idx ? symbol + ' ' + nodeText : nodeText;
  });
  isExpression = false;
  if (isProperty && /\);/g.test(result)) result = result.replace(/\);/g, ')') + ';';
  if (isCall && callName === 'url') return result.replace(/\s/g, '');
  if (!returnSymbol || isIfExpression) return result;
  return before + returnSymbol + result;
}

function visitCall(_ref4) {
  var name = _ref4.name,
      args = _ref4.args,
      lineno = _ref4.lineno,
      block = _ref4.block;

  isCall = true;
  callName = name;
  var blockText = '';
  var before = handleLineno(lineno);
  oldLineno = lineno;
  if (!isProperty && !isObject && !isNamespace && !isKeyframes && !isArguments) {
    before = before || '\n';
    before += getIndentation();
    before += '@include ';
  }
  var argsText = visitArguments(args).replace(';', '');
  if (block) blockText = visitBlock(block);
  callName = '';
  isCall = false;
  return before + name + '(' + argsText + ')' + blockText + ';';
}

function visitArguments(node) {
  isArguments = true;
  var nodes = nodesToJSON(node.nodes);
  var text = '';
  nodes.forEach(function (node, idx) {
    var prefix = idx ? ', ' : '';
    var result = isFunction ? replaceFirstATSymbol(visitNode(node)) : visitNode(node);
    text += prefix + result;
  });
  isArguments = false;
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
  var condNode = node.cond && node.cond.toJSON() || {};
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
  var notMixin = !isFunctionMixin(node.block.nodes);
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
  FUNCTION_PARAMS = params.map(function (par) {
    return par.name;
  });
  var paramsText = '';
  params.forEach(function (node, idx) {
    var prefix = idx ? ', ' : '';
    var nodeText = visitNode(node);
    VARIABLE_NAME_LIST.push(nodeText);
    paramsText += prefix + replaceFirstATSymbol(nodeText);
  });
  var fnName = symbol + ' ' + node.name + '(' + paramsText + ')';
  var block = visitBlock(node.block);
  returnSymbol = '';
  isFunction = false;
  FUNCTION_PARAMS = [];
  return before + fnName + block;
}

function visitBinOp(_ref6) {
  var op = _ref6.op,
      left = _ref6.left,
      right = _ref6.right;

  var leftExp = left && left.toJSON();
  var rightExp = right && right.toJSON();
  var isExp = rightExp.__type === 'Expression';
  var expText = isExp ? '(' + visitNode(rightExp) + ')' : visitNode(rightExp);
  return visitNode(leftExp) + ' ' + (OPEARTION_MAP[op] || op) + ' ' + expText;
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
  var blockJson = node.block.toJSON();
  if (blockJson.nodes.length && blockJson.nodes[0].toJSON().__type === 'Expression') {
    throw new Error('Syntax Error Please check if your @keyframes ' + name + ' are correct.');
  }
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

function visitQueryList(node) {
  var text = '';
  var nodes = nodesToJSON(node.nodes);
  nodes.forEach(function (node, idx) {
    var nodeText = visitNode(node);
    text += idx ? ', ' + nodeText : nodeText;
  });
  return text;
}

function visitQuery(node) {
  var type = visitNode(node.type);
  var nodes = nodesToJSON(node.nodes);
  var text = '';
  nodes.forEach(function (node, idx) {
    var nodeText = visitNode(node);
    text += idx ? ' and ' + nodeText : nodeText;
  });
  return type ? type + ' and ' + text : text;
}

function visitMedia(node) {
  var before = handleLinenoAndIndentation(node);
  oldLineno = node.lineno;
  var val = _get(node, ['val'], {});
  var nodeVal = val.toJSON && val.toJSON() || {};
  var valText = visitNode(nodeVal);
  var block = visitBlock(node.block);
  return before + '@media ' + (valText + block);
}

function visitFeature(node) {
  var segmentsText = visitNodes(node.segments);
  var expText = visitExpression(node.expr);
  return '(' + segmentsText + ': ' + expText + ')';
}

function visitComment(node) {
  var before = handleLinenoAndIndentation(node);
  var matchs = node.str.match(/\n/g);
  oldLineno = node.lineno;
  if (Array.isArray(matchs)) oldLineno += matchs.length;
  var text = node.suppress ? node.str : node.str.replace(/^\/\*/, '/*!');
  return before + text;
}

function visitMember(_ref8) {
  var left = _ref8.left,
      right = _ref8.right;

  var searchName = recursiveSearchName(left, 'left', 'name');
  if (searchName && OBJECT_KEY_LIST.indexOf(searchName) > -1) {
    return 'map-get(' + visitNode(left) + ', ' + (quote + visitNode(right) + quote) + ')';
  }
  return visitNode(left) + '.' + visitNode(right);
}

function visitAtrule(node) {
  var before = handleLinenoAndIndentation(node);
  oldLineno = node.lineno;
  before += '@' + node.type;
  return before + visitBlock(node.block);
}

function visitObject(_ref9) {
  var vals = _ref9.vals,
      lineno = _ref9.lineno;

  isObject = true;
  indentationLevel++;
  var before = repeatString(' ', indentationLevel * 2);
  var result = '';
  var count = 0;
  for (var key in vals) {
    var resultVal = visitNode(vals[key]).replace(/;/, '');
    var symbol = count ? ',' : '';
    result += symbol + '\n' + (before + quote + key + quote) + ': ' + resultVal;
    count++;
  }
  var totalLineno = lineno + count + 2;
  oldLineno = totalLineno > oldLineno ? totalLineno : oldLineno;
  indentationLevel--;
  isObject = false;
  return '(' + result + '\n' + repeatString(' ', indentationLevel * 2) + ')';
}

function visitCharset(_ref10) {
  var _ref10$val = _ref10.val,
      value = _ref10$val.val,
      quote = _ref10$val.quote,
      lineno = _ref10.lineno;

  var before = handleLineno(lineno);
  oldLineno = lineno;
  return before + '@charset ' + (quote + value + quote) + ';';
}

function visitNamespace(_ref11) {
  var val = _ref11.val,
      lineno = _ref11.lineno;

  isNamespace = true;
  var name = '@namespace ';
  var before = handleLineno(lineno);
  oldLineno = lineno;
  if (val.type === 'string') {
    var _val$val = val.val,
        value = _val$val.val,
        valQuote = _val$val.quote;

    isNamespace = false;
    return before + name + valQuote + value + valQuote + ';';
  }
  return before + name + visitNode(val);
}

function visitAtrule(_ref12) {
  var type = _ref12.type,
      block = _ref12.block,
      lineno = _ref12.lineno,
      segments = _ref12.segments;

  var before = handleLineno(lineno);
  oldLineno = lineno;
  var typeText = segments.length ? '@' + type + ' ' : '@' + type;
  return '' + (before + typeText + visitNodes(segments) + visitBlock(block));
}

function visitSupports(_ref13) {
  var block = _ref13.block,
      lineno = _ref13.lineno,
      condition = _ref13.condition;

  var before = handleLineno(lineno);
  oldLineno = lineno;
  before += getIndentation();
  return before + '@Supports ' + (visitNode(condition) + visitBlock(block));
}

function visitString(_ref14) {
  var val = _ref14.val,
      quote = _ref14.quote;

  return quote + val + quote;
}

function visitReturn(node) {
  if (isFunction) return visitExpression(node.expr).replace(/\n\s*/g, '');
  return '@return $' + visitExpression(node.expr).replace(/\$|\n\s*/g, '');
}

// 处理 stylus 语法树；handle stylus Syntax Tree
function visitor(ast, options) {
  quote = options.quote;
  conver = options.conver;
  autoprefixer = options.autoprefixer;
  var result = visitNodes(ast.nodes) || '';
  var indentation = ' '.repeat(options.indentVueStyleBlock);
  result = result.replace(/(.*\S.*)/g, indentation + '$1');
  oldLineno = 1;
  FUNCTION_PARAMS = [];
  OBJECT_KEY_LIST = [];
  PROPERTY_KEY_LIST = [];
  PROPERTY_VAL_LIST = [];
  VARIABLE_NAME_LIST = [];
  return result + '\n';
}

function converter(result) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
    quote: '\'',
    conver: 'sass',
    autoprefixer: true
  };

  if (options.isSignComment) result = result.replace(/\/\/\s(.*)/g, '/* !#sign#! $1 */');
  if (typeof result !== 'string') return result;
  var ast = new Parser(result).parse();
  // 开发时查看 ast 对象。
  // console.log(JSON.stringify(ast))
  var text = visitor(ast, options);
  // Convert special multiline comments to single-line comments
  return text.replace(/\/\*\s!#sign#!\s(.*)\s\*\//g, '// $1');
}

module.exports = converter;
