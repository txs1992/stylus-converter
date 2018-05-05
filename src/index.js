import Parser from 'stylus/lib/parser.js'

import visitor from './visitor/index.js'
import { nodesToJSON } from './util.js'

export default function converter (result, options = {
  quote: `'`,
  conver: 'sass',
  autoprefixer: true
}) {
  if (typeof result !== 'string') return result
  const ast = new Parser(result).parse()
  // console.log(JSON.stringify(ast))
  return visitor(ast, options)
}
