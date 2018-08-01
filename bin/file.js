const fs = require('fs')
const converter = require('../lib')
const convertVueFile = require('./convertVueFile')

let callLen = 0
let startTime = 0

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

function handleFile (input, output, options, callback) {
  callLen++
  if (/\.styl$/.test(input) || /\.vue$/.test(input)) {
    fs.readFile(input, (err, res) => {
      if (err) throw err
      let result = res.toString()
      let outputPath = output
      if (/\.styl$/.test(input)) {
        try {
          result = converter(result, options)
        } catch (e) {
          result = ''
          callLen--
          console.error('Failed to convert', input)
          return;
        }
        outputPath = output.replace(/\.styl$/, '.' + options.conver)
      } else {
        //处理 vue 文件
        result = convertVueFile(result, options);
      }
      fs.writeFile(outputPath, result, err => {
        callLen--
        if (err) throw err
        if (!result) return
        if (callLen === 0) callback(Date.now() - startTime)
      })
    })
  } else {
    fs.copyFile(input, output, err => {  
      callLen--
      if (err) throw err
      if (callLen === 0) callback(Date.now() - startTime)
    })
  }
}

function visitDirectory (input, output, inputParent, outputParent, options, callback) {
  const inputPath = inputParent ? inputParent + input : input
  const outputPath = outputParent ? outputParent + output : output
  getStat(inputPath, stats => {
    if (stats.isFile()) {
      handleFile(inputPath, outputPath, options, callback)
    } else if (stats.isDirectory()) {
      readAndMkDir(inputPath, outputPath, files => {
        files.forEach(file => {
          if (inputParent) {
            visitDirectory(file, file, inputPath + '/', outputPath + '/', options, callback)
          } else {
            visitDirectory(file, file, input + '/', output + '/', options, callback)
          }
        })
      })
    }
  })
}

function converFile (options, callback) {
  startTime = Date.now()
  const input = options.input
  const output = options.output
  if (options.directory) {
    const baseInput = /\/$/.test(options.input)
      ? input.substring(0, input.length -1)
      : input
    const baseOutput = /\/$/.test(options.output)
      ? output.substring(0, output.length -1)
      : output
    visitDirectory(baseInput, baseOutput, '', '', options, callback)
  } else {
    handleFile(input, output, options, callback)
  }
}

module.exports = converFile;
