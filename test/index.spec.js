const fs = require('fs')
const path = require('path')
const { converter } = require('../lib')
const expect = require('chai').expect
const convertVueFile = require('../bin/convertVueFile')

function getPath(address) {
  return path.resolve(__dirname, address)
}

describe('测试 CSS Selector', () => {
  it('CSS Selector', done => {
    fs.readFile(getPath('./stylus/selector.styl'), (err, res) => {
      if (err) return
      const result = res.toString()
      const scss = converter(result)
      fs.readFile(getPath('./scss/selector.scss'), (err, sres) => {
        if (err) return
        const toText = sres.toString()
        expect(scss).to.be.equal(toText)
        done()
      })
    })
  })
})

describe('测试 @Keyframes', () => {
  it('Autoprefixer Keyframes', done => {
    fs.readFile(getPath('./stylus/keyframes.styl'), (err, res) => {
      if (err) return
      const result = res.toString()
      const scss = converter(result)
      fs.readFile(getPath('./scss/autoprefixer-keyframes.scss'), (err, sres) => {
        if (err) return
        const toText = sres.toString()
        expect(scss).to.be.equal(toText)
        done()
      })
    })
  })

  it('Not Autoprefixer Keyframes', done => {
    fs.readFile(getPath('./stylus/keyframes.styl'), (err, res) => {
      if (err) return
      const result = res.toString()
      const scss = converter(result, { autoprefixer: false })
      fs.readFile(getPath('./scss/keyframes.scss'), (err, sres) => {
        if (err) return
        const toText = sres.toString()
        expect(scss).to.be.equal(toText)
        done()
      })
    })
  })
})


describe('测试 @Extend', () => {
  it('test @extend', done => {
    fs.readFile(getPath('./stylus/extend.styl'), (err, res) => {
      if (err) return
      const result = res.toString()
      const scss = converter(result)
      fs.readFile(getPath('./scss/extend.scss'), (err, sres) => {
        if (err) return
        const toText = sres.toString()
        expect(scss).to.be.equal(toText)
        done()
      })
    })
  })
})

describe('测试 @Media', () => {
  it('test @media', done => {
    fs.readFile(getPath('./stylus/media.styl'), (err, res) => {
      if (err) return
      const result = res.toString()
      const scss = converter(result)
      fs.readFile(getPath('./scss/media.scss'), (err, sres) => {
        if (err) return
        const toText = sres.toString()
        expect(scss).to.be.equal(toText)
        done()
      })
    })
  })
})

describe('测试 Funciton 与 Params', () => {
  it('test params', done => {
    fs.readFile(getPath('./stylus/params.styl'), (err, res) => {
      if (err) return
      const result = res.toString()
      const scss = converter(result)
      fs.readFile(getPath('./scss/params.scss'), (err, sres) => {
        if (err) return
        const toText = sres.toString()
        expect(scss).to.be.equal(toText)
        done()
      })
    })
  })

  it('test variable parameter', done => {
    fs.readFile(getPath('./stylus/variable-parameter.styl'), (err, res) => {
      if (err) return
      const result = res.toString()
      const scss = converter(result)
      fs.readFile(getPath('./scss/variable-parameter.scss'), (err, sres) => {
        if (err) return
        const toText = sres.toString()
        expect(scss).to.be.equal(toText)
        done()
      })
    })
  })
})

describe('测试 Comments', () => {
  it('test comment', done => {
    fs.readFile(getPath('./stylus/comment.styl'), (err, res) => {
      if (err) return
      const result = res.toString()
      const scss = converter(result, { isSignComment: true })
      fs.readFile(getPath('./scss/comment.scss'), (err, sres) => {
        if (err) return
        const toText = sres.toString()
        expect(scss).to.be.equal(toText)
        done()
      })
    })
  })
})

describe('测试 Mixins', () => {
  it('test mixin', done => {
    fs.readFile(getPath('./stylus/mixins.styl'), (err, res) => {
      if (err) return
      const result = res.toString()
      const scss = converter(result)
      fs.readFile(getPath('./scss/mixins.scss'), (err, sres) => {
        if (err) return
        const toText = sres.toString()
        expect(scss).to.be.equal(toText)
        done()
      })
    })
  })
})

describe('测试 Variables', () => {
  it('test variable assignment', done => {
    fs.readFile(getPath('./stylus/variables.styl'), (err, res) => {
      if (err) return
      const result = res.toString()
      const scss = converter(result)
      fs.readFile(getPath('./scss/variables.scss'), (err, sres) => {
        if (err) return
        const toText = sres.toString()
        expect(scss).to.be.equal(toText)
        done()
      })
    })
  })

  it('test variable search', done => {
    fs.readFile(getPath('./stylus/variable-search.styl'), (err, res) => {
      if (err) return
      const result = res.toString()
      const scss = converter(result)
      fs.readFile(getPath('./scss/variable-search.scss'), (err, sres) => {
        if (err) return
        const toText = sres.toString()
        expect(scss).to.be.equal(toText)
        done()
      })
    })
  })
})

describe('测试 Each', () => {
  it('test each', done => {
    fs.readFile(getPath('./stylus/each.styl'), (err, res) => {
      if (err) return
      const result = res.toString()
      const scss = converter(result)
      fs.readFile(getPath('./scss/each.scss'), (err, sres) => {
        if (err) return
        const toText = sres.toString()
        expect(scss).to.be.equal(toText)
        done()
      })
    })
  })
})

describe('测试 @Font-face', () => {
  it('test @font-face', done => {
    fs.readFile(getPath('./stylus/font-face.styl'), (err, res) => {
      if (err) return
      const result = res.toString()
      const scss = converter(result)
      fs.readFile(getPath('./scss/font-face.scss'), (err, sres) => {
        if (err) return
        const toText = sres.toString()
        expect(scss).to.be.equal(toText)
        done()
      })
    })
  })
})

describe('测试 Object', () => {
  it('test object', done => {
    fs.readFile(getPath('./stylus/object.styl'), (err, res) => {
      if (err) return
      const result = res.toString()
      const scss = converter(result)
      fs.readFile(getPath('./scss/object.scss'), (err, sres) => {
        if (err) return
        const toText = sres.toString()
        expect(scss).to.be.equal(toText)
        done()
      })
    })
  })
})

describe('测试 @IF and @else', () => {
  it('test if/else', done => {
    fs.readFile(getPath('./stylus/if.styl'), (err, res) => {
      if (err) return
      const result = res.toString()
      const scss = converter(result)
      fs.readFile(getPath('./scss/if.scss'), (err, sres) => {
        if (err) return
        const toText = sres.toString()
        expect(scss).to.be.equal(toText)
        done()
      })
    })
  })
})

describe('测试 Boolean', () => {
  it('test boolean opeartion', done => {
    fs.readFile(getPath('./stylus/boolean.styl'), (err, res) => {
      if (err) return
      const result = res.toString()
      const scss = converter(result)
      fs.readFile(getPath('./scss/boolean.scss'), (err, sres) => {
        if (err) return
        const toText = sres.toString()
        expect(scss).to.be.equal(toText)
        done()
      })
    })
  })
})

describe('测试 @Charset', () => {
  it('test charset', done => {
    fs.readFile(getPath('./stylus/charset.styl'), (err, res) => {
      if (err) return
      const result = res.toString()
      const scss = converter(result)
      fs.readFile(getPath('./scss/charset.scss'), (err, sres) => {
        if (err) return
        const toText = sres.toString()
        expect(scss).to.be.equal(toText)
        done()
      })
    })
  })
})

describe('测试 @Namescope', () => {
  it('test namescope', done => {
    fs.readFile(getPath('./stylus/namescope.styl'), (err, res) => {
      if (err) return
      const result = res.toString()
      const scss = converter(result)
      fs.readFile(getPath('./scss/namescope.scss'), (err, sres) => {
        if (err) return
        const toText = sres.toString()
        expect(scss).to.be.equal(toText)
        done()
      })
    })
  })
})

describe('测试 @Page', () => {
  it('test page', done => {
    fs.readFile(getPath('./stylus/page.styl'), (err, res) => {
      if (err) return
      const result = res.toString()
      const scss = converter(result)
      fs.readFile(getPath('./scss/page.scss'), (err, sres) => {
        if (err) return
        const toText = sres.toString()
        expect(scss).to.be.equal(toText)
        done()
      })
    })
  })
})

describe('测试 @Supports', () => {
  it('test supports', done => {
    fs.readFile(getPath('./stylus/supports.styl'), (err, res) => {
      if (err) return
      const result = res.toString()
      const scss = converter(result)
      fs.readFile(getPath('./scss/supports.scss'), (err, sres) => {
        if (err) return
        const toText = sres.toString()
        expect(scss).to.be.equal(toText)
        done()
      })
    })
  })
})

describe('测试 @return', () => {
  it('test return', done => {
    fs.readFile(getPath('./stylus/return.styl'), (err, res) => {
      if (err) return
      const result = res.toString()
      const scss = converter(result)
      fs.readFile(getPath('./scss/return.scss'), (err, sres) => {
        if (err) return
        const toText = sres.toString()
        expect(scss).to.be.equal(toText)
        done()
      })
    })
  })
})

describe('测试 @Import', () => {
  it('test @import', done => {
    fs.readFile(getPath('./stylus/import.styl'), (err, res) => {
      if (err) return
      const result = res.toString()
      const scss = converter(result)
      fs.readFile(getPath('./scss/import.scss'), (err, sres) => {
        if (err) return
        const toText = sres.toString()
        expect(scss).to.be.equal(toText)
        done()
      })
    })
  })
})

describe('A vue file', () => {
  it('should be converted correctly', done => {
    fs.readFile(getPath('./vue/stylus/basic.vue'), (err, res) => {
      if (err) return
      const result = res.toString()
      const scss = convertVueFile(result)
      fs.readFile(getPath('./vue/scss/basic.vue'), (err, sres) => {
        if (err) return
        const toText = sres.toString()
        expect(scss).to.be.equal(toText)
        done()
      })
    })
  })

  it('should be converted deep selectors', done => {
    fs.readFile(getPath('./vue/stylus/deep.vue'), (err, res) => {
      if (err) return
      const result = res.toString()
      const scss = convertVueFile(result)
      fs.readFile(getPath('./vue/scss/deep.vue'), (err, sres) => {
        if (err) return
        const toText = sres.toString()
        expect(scss).to.be.equal(toText)
        done()
      })
    })
  })

  it('should retain it\'s style scoped attribute', done => {
    fs.readFile(getPath('./vue/stylus/scoped.vue'), (err, res) => {
      if (err) return
      const result = res.toString()
      const scss = convertVueFile(result)
      fs.readFile(getPath('./vue/scss/scoped.vue'), (err, sres) => {
        if (err) return
        const toText = sres.toString()
        expect(scss).to.be.equal(toText)
        done()
      })
    })
  })

  it('should handle indentation of the style block ', done => {
    fs.readFile(getPath('./vue/stylus/indented.vue'), (err, res) => {
      if (err) return
      const result = res.toString()
      const scss = convertVueFile(result, { indentVueStyleBlock: 2 });
      fs.readFile(getPath('./vue/scss/indented.vue'), (err, sres) => {
        if (err) return
        const toText = sres.toString()
        expect(scss).to.be.equal(toText)
        done()
      })
    })
  })

  it('should handle multiple style blocks', done => {
    fs.readFile(getPath('./vue/stylus/multiple-style-blocks.vue'), (err, res) => {
      if (err) return
      const result = res.toString()
      const scss = convertVueFile(result);
      fs.readFile(getPath('./vue/scss/multiple-style-blocks.vue'), (err, sres) => {
        if (err) return
        const toText = sres.toString()
        expect(scss).to.be.equal(toText)
        done()
      })
    })
  })

  it('should handle handle empty style blocks', done => {
    fs.readFile(getPath('./vue/stylus/empty.vue'), (err, res) => {
      if (err) return
      const result = res.toString()
      const scss = convertVueFile(result, { indentVueStyleBlock: 2 });
      fs.readFile(getPath('./vue/scss/empty.vue'), (err, sres) => {
        if (err) return
        const toText = sres.toString()
        expect(scss).to.be.equal(toText)
        done()
      })
    })
  })
})

describe('测试 @Functions', () => {
  it('test @functions', done => {
    fs.readFile(getPath('./stylus/functions.styl'), (err, res) => {
      if (err) return
      const result = res.toString()
      const scss = converter(result)
      fs.readFile(getPath('./scss/functions.scss'), (err, sres) => {
        if (err) return
        const toText = sres.toString()
        expect(scss).to.be.equal(toText)
        done()
      })
    })
  })
})
