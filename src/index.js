import Parser from 'stylus/lib/parser.js'
import visitor from './visitor/index.js'
import { _get as get, nodesToJSON } from './util.js'

export function parse(result) {
  return new Parser(result).parse()
}

export function nodeToJSON(data) {
  return nodesToJSON(data)
}

export function _get(obj, pathArray, defaultValue) {
  return get(obj, pathArray, defaultValue)
}

export function converter(result, options = {
  quote: `'`,
  conver: 'sass',
  autoprefixer: true
}, globalVariableList = [], globalMixinList = []) {
  if (options.isSignComment) result = result.replace(/\/\/\s(.*)/g, '/* !#sign#! $1 */')

  // Add semicolons to properties with inline comments to ensure that they are parsed correctly
  result = result.replace(/^( *)(\S(.+?))( *)(\/\*.*\*\/)$/gm, '$1$2;$4$5');

  if (typeof result !== 'string') return result
  const ast = new Parser(result).parse()
  // 开发时查看 ast 对象。
  // console.log(JSON.stringify(ast))
  const text = visitor(ast, options, globalVariableList, globalMixinList)
  // Convert special multiline comments to single-line comments
  return text.replace(/\/\*\s!#sign#!\s(.*)\s\*\//g, '// $1')
}
