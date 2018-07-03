const converter = require('../lib')

function convertVueFile(vueTemplate, options) {
  const styleRegEx = /<style(.*)>((\n|.)*)<\/style>/
  const matches = vueTemplate.match(styleRegEx)
  if (Array.isArray(matches) && matches.length >= 2) {
    if(matches[1].includes('stylus')) {
      let style = matches[2]
      if (style.trim()) {
        style = converter(style, options)
      }
      const isScoped = matches[1].includes('scoped')
      const styleText = `<style lang="scss"${isScoped ? ' scoped' : ''}>${style}</style>`
      return vueTemplate.replace(styleRegEx, styleText)
    }
  }
  return vueTemplate;
}


module.exports = convertVueFile;
