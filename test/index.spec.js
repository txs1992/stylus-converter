const fs = require('fs')
const path = require('path')
const converter = require('../bin')
const expect = require('chai').expect

function getPath (address) {
  return path.resolve(__dirname, address)
}

function trimLast(str) {
  return str.replace(/\n*$/g, '')
}

describe('测试 CSS Selector', () => {
  it('CSS Selector', done => {
    fs.readFile(getPath('./stylus/selector.styl'), (err, res) => {
      if (err) return
      const result = trimLast(res.toString())
      const sass = converter(result)
      fs.readFile(getPath('./sass/selector.sass'), (err, sres) => {
        if (err) return
        const toText = trimLast(sres.toString())
        expect(sass).to.be.equal(toText)
        done()
      })
    })
  })
})

describe('测试 @Keyframes', () => {
  it('Autoprefixer Keyframes', done => {
    fs.readFile(getPath('./stylus/keyframes.styl'), (err, res) => {
      if (err) return
      const result = trimLast(res.toString())
      const sass = converter(result)
      fs.readFile(getPath('./sass/autoprefixer-keyframes.sass'), (err, sres) => {
        if (err) return
        const toText = trimLast(sres.toString())
        expect(sass).to.be.equal(toText)
        done()
      })
    })
  })

  it('Not Autoprefixer Keyframes', done => {
    fs.readFile(getPath('./stylus/keyframes.styl'), (err, res) => {
      if (err) return
      const result = trimLast(res.toString())
      const sass = converter(result, { autoprefixer: false })
      fs.readFile(getPath('./sass/keyframes.sass'), (err, sres) => {
        if (err) return
        const toText = trimLast(sres.toString())
        expect(sass).to.be.equal(toText)
        done()
      })
    })
  })
})


describe('测试 @Extend', () => {
  it('test @extend', done => {
    fs.readFile(getPath('./stylus/extend.styl'), (err, res) => {
      if (err) return
      const result = trimLast(res.toString())
      const sass = converter(result)
      fs.readFile(getPath('./sass/extend.sass'), (err, sres) => {
        if (err) return
        const toText = trimLast(sres.toString())
        expect(sass).to.be.equal(toText)
        done()
      })
    })
  })
})

describe('测试 @Media', () => {
  it('test @media', done => {
    fs.readFile(getPath('./stylus/media.styl'), (err, res) => {
      if (err) return
      const result = trimLast(res.toString())
      const sass = converter(result)
      fs.readFile(getPath('./sass/media.sass'), (err, sres) => {
        if (err) return
        const toText = trimLast(sres.toString())
        expect(sass).to.be.equal(toText)
        done()
      })
    })
  })
})

describe('测试 Funciton 与 Params', () => {
  it('test params', done => {
    fs.readFile(getPath('./stylus/params.styl'), (err, res) => {
      if (err) return
      const result = trimLast(res.toString())
      const sass = converter(result)
      fs.readFile(getPath('./sass/params.sass'), (err, sres) => {
        if (err) return
        const toText = trimLast(sres.toString())
        expect(sass).to.be.equal(toText)
        done()
      })
    })
  })

  it('test variable parameter', done => {
    fs.readFile(getPath('./stylus/variable-parameter.styl'), (err, res) => {
      if (err) return
      const result = trimLast(res.toString())
      const sass = converter(result)
      fs.readFile(getPath('./sass/variable-parameter.sass'), (err, sres) => {
        if (err) return
        const toText = trimLast(sres.toString())
        expect(sass).to.be.equal(toText)
        done()
      })
    })
  })
})

describe('测试 Comments', () => {
  it('test comment', done => {
    fs.readFile(getPath('./stylus/comment.styl'), (err, res) => {
      if (err) return
      const result = trimLast(res.toString())
      const sass = converter(result)
      fs.readFile(getPath('./sass/comment.sass'), (err, sres) => {
        if (err) return
        const toText = trimLast(sres.toString())
        expect(sass).to.be.equal(toText)
        done()
      })
    })
  })
})

describe('测试 Mixins', () => {
  it('test mixin', done => {
    fs.readFile(getPath('./stylus/comment.styl'), (err, res) => {
      if (err) return
      const result = trimLast(res.toString())
      const sass = converter(result)
      fs.readFile(getPath('./sass/comment.sass'), (err, sres) => {
        if (err) return
        const toText = trimLast(sres.toString())
        expect(sass).to.be.equal(toText)
        done()
      })
    })
  })
})

describe('测试 Variables', () => {
  it('test variable assignment', done => {
    fs.readFile(getPath('./stylus/variables.styl'), (err, res) => {
      if (err) return
      const result = trimLast(res.toString())
      const sass = converter(result)
      fs.readFile(getPath('./sass/variables.sass'), (err, sres) => {
        if (err) return
        const toText = trimLast(sres.toString())
        expect(sass).to.be.equal(toText)
        done()
      })
    })
  })

  it('test variable search', done => {
    fs.readFile(getPath('./stylus/variable-search.styl'), (err, res) => {
      if (err) return
      const result = trimLast(res.toString())
      const sass = converter(result)
      fs.readFile(getPath('./sass/variable-search.sass'), (err, sres) => {
        if (err) return
        const toText = trimLast(sres.toString())
        expect(sass).to.be.equal(toText)
        done()
      })
    })
  })
})

describe('测试 Each', () => {
  it('test each', done => {
    fs.readFile(getPath('./stylus/each.styl'), (err, res) => {
      if (err) return
      const result = trimLast(res.toString())
      const sass = converter(result)
      fs.readFile(getPath('./sass/each.sass'), (err, sres) => {
        if (err) return
        const toText = trimLast(sres.toString())
        expect(sass).to.be.equal(toText)
        done()
      })
    })
  })
})

describe('测试 @Font-face', () => {
  it('test @font-face', done => {
    fs.readFile(getPath('./stylus/font-face.styl'), (err, res) => {
      if (err) return
      const result = trimLast(res.toString())
      const sass = converter(result)
      fs.readFile(getPath('./sass/font-face.sass'), (err, sres) => {
        if (err) return
        const toText = trimLast(sres.toString())
        expect(sass).to.be.equal(toText)
        done()
      })
    })
  })
})

describe('测试 Object', () => {
  it('test object', done => {
    fs.readFile(getPath('./stylus/object.styl'), (err, res) => {
      if (err) return
      const result = trimLast(res.toString())
      const sass = converter(result)
      fs.readFile(getPath('./sass/object.sass'), (err, sres) => {
        if (err) return
        const toText = trimLast(sres.toString())
        expect(sass).to.be.equal(toText)
        done()
      })
    })
  })
})
