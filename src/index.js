import Parser from 'stylus/lib/parser.js'
import { get as _get } from 'noshjs'

import visitor from './visitor/index.js'

export default function converter (result) {
  console.log(typeof result)
  if (typeof result !== 'string') return result
  console.log('\n--converter')
  const ast = new Parser(result).parse()
  console.log(ast)
  if (_get(ast, ['nodes', 'length'])) {
    return visitor(ast.nodes)
  }
  return result
}
