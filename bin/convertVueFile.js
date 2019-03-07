const { converter } = require('../lib')

function convertVueFile(vueTemplate, options) {
  let newVueTemplate = vueTemplate;
  const styleRegEx = /<style(.*)>([\w\W]*?)<\/style>/g;
  let match;
  while ((match = styleRegEx.exec(newVueTemplate)) !== null) {
    if (match[1].includes('stylus')) {
      let style = match[2] || '';
      if (style.trim()) {
        style = converter(style, options);
      }
      const isScoped = match[1].includes('scoped');
      const styleText = `<style lang="scss"${isScoped ? ' scoped' : ''}>${style}</style>`;
      newVueTemplate = newVueTemplate.replace(match[0], styleText);
    }
  }
  return newVueTemplate;
}

module.exports = convertVueFile;
