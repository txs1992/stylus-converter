const fs = require('fs')
const converter = require('../lib')

let baseInput = ''
let baseOutput = ''
let converOptions = {}

function visitFile (options, callback) {
  fs.readFile(options.input, (err, res) => {
    if (err) throw err
    const result = converter(res.toString(), options)
    fs.writeFile(options.output, result, err => {
      if (err) throw err
      callback()
    })
  })
}

function getStat (path, callback) {
  fs.stat(path, (err, stats) => {
    if (err) throw err
    callback(stats)
  })
}

function readDir (path, callback, errorHandler) {
  fs.readdir(path, (err, files) => {
    if (err) {
      errorHandler()
    } else {
      callback(files)
    }
  })
}

function mkDir (path, callback) {
  fs.mkdir(path, err => {
    if (err) throw err
    callback()
  })
}

function readAndMkDir (input, output, callback) {
  readDir(output, () => {
    readDir(input, callback)
  }, () => {
    mkDir(output, () => {
      readDir(input, callback)
    })
  })
}

function handleFile (input, output, options) {
  fs.readFile(input, (err, res) => {
    if (err) throw err
    let result = res.toString()
    let outputPath = output
    if (/\.styl$/.test(input)) {
      result = converter(result, options)
      outputPath = output.replace(/\.styl$/, '.' + options.conver)
    }
    fs.writeFile(outputPath, result, err => {
      if (err) throw err
    })
  })
}

function visitDirectory (input, output, inputParent, outputParent, options) {
  const inputPath = inputParent ? inputParent + input : input
  const outputPath = outputParent ? outputParent + output : output
  getStat(inputPath, stats => {
    if (stats.isFile()) {
      handleFile(inputPath, outputPath, options)
    } else if (stats.isDirectory()) {
      readAndMkDir(inputPath, outputPath, files => {
        files.forEach(file => {
          if (inputParent) {
            visitDirectory(file, file, inputPath + '/', outputPath + '/', options)
          } else {
            visitDirectory(file, file, input + '/', output + '/', options)
          }
        })
      })
    }
  })
}

function converFile (options, callback) {
  if (options.directory) {
    const input = options.input
    const output = options.output
    const baseInput = /\/$/.test(options.input)
      ? input.substring(0, input.length -1)
      : input
    const baseOutput = /\/$/.test(options.output)
      ? output.substring(0, output.length -1)
      : output
    visitDirectory(baseInput, baseOutput, '', '', options)
  } else {
    visitFile(options, callback)
  }
}

module.exports = converFile;
