const fs = require('fs')
const path = require('path')
const converter = require('../bin')
const expect = require('chai').expect

function getPath (address) {
  return path.resolve(__dirname, address)
}

describe('测试 stylus 转换器', () => {
  it('测试 CSS Selector', () => {
    fs.readFile(getPath('./stylus/selector.styl'), (err, res) => {
      if (err) return
      const result = res.toString()
      const scss = converter(result)
      fs.readFile(getPath('./scss/selector.scss'), (err, res) => {
        if (err) return
        expect(scss).to.be.equal(res.toString())
      })
    })
  })
})
