import Parser from 'stylus/lib/parser.js'
import { get as _get } from 'noshjs'

import visitor from './visitor/index.js'
import { nodesToJSON } from './util.js'

export default function converter (result) {
  if (typeof result !== 'string') return result
  const ast = new Parser(result).parse()
  if (_get(ast, ['nodes', 'length'])) {
    return visitor(nodesToJSON(ast.nodes))
  }
  return result
}
