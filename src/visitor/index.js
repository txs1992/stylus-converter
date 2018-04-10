function visitGroup (node) {
  return 'visitGroup'
}

// handle stylus Syntax Tree
// 处理 stylus 语法树
function visitor (nodes) {
  let resultText = ''
  nodes.forEach(node => resultText += visitGroup(node, resultText))
  return resultText
}

export default visitor
