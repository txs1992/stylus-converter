const { nodeToJSON, _get } = require('../lib')

const MIXIN_TYPES = [
  'Selector',
  'Property',
]

function isCallMixin(node) {
  return node.__type === 'Call' && node.block
}

function findMixin(node, mixins = [], fnList = []) {
  // val =》 obj, block -> obj, nodes -> arr
  if (node.__type === 'Function' && fnList.indexOf(node.name) < 0) {
    fnList.push(node.name)
  }
  if (fnList.length &&(MIXIN_TYPES.indexOf(node.__type) > -1 || isCallMixin(node))) {
    fnList.forEach(name => {
      if (mixins.indexOf(name) < 0) {
        mixins.push(name)
      }
    })
    fnList = []
  }
  if (_get(node, ['val', 'toJSON'])) {
    findMixin(node.val.toJSON(), mixins, fnList)
  }
  if (_get(node, ['expr', 'toJSON'])) {
    findMixin(node.expr.toJSON(), mixins, fnList)
  }
  if (_get(node, ['block', 'toJSON'])) {
    findMixin(node.block.toJSON(), mixins, fnList)
  }
  if (node.nodes) {
    const nodes = nodeToJSON(node.nodes)
    nodes.forEach(item => findMixin(item, mixins, fnList))
  }
  return mixins
}

module.exports = findMixin;