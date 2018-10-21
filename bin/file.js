const fs = require('fs')
const debounce = require('lodash.debounce')
const convertStylus = require('./convertStylus')

let startTime = 0

function getStat(path, callback) {
  fs.stat(path, (err, stats) => {
    if (err) throw err
    callback(stats)
  })
}

function readDir(path, callback, errorHandler) {
  fs.readdir(path, (err, files) => {
    if (err) {
      errorHandler()
    } else {
      callback(files)
    }
  })
}

function mkDir(path, callback) {
  fs.mkdir(path, err => {
    if (err) throw err
    callback()
  })
}

function readAndMkDir(input, output, callback) {
  readDir(output, () => {
    readDir(input, callback)
  }, () => {
    mkDir(output, () => {
      readDir(input, callback)
    })
  })
}

function visitDirectory(input, output, inputParent, outputParent, options, callback) {
  const inputPath = inputParent ? inputParent + input : input
  const outputPath = outputParent ? outputParent + output : output
  getStat(inputPath, stats => {
    if (stats.isFile()) {
      convertStylus(inputPath, outputPath, options, callback)
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

function handleStylus(options, callback) {
  const input = options.input
  const output = options.output
  if (options.directory) {
    const baseInput = /\/$/.test(options.input)
      ? input.substring(0, input.length - 1)
      : input
    const baseOutput = /\/$/.test(options.output)
      ? output.substring(0, output.length - 1)
      : output
    visitDirectory(baseInput, baseOutput, '', '', options, callback)
  } else {
    convertStylus(input, output, options, callback)
  }
}

const handleCall = debounce(function (now, startTime, callback) {
  callback(now - startTime)
}, 500)

function converFile(options, callback) {
  startTime = Date.now()
  options.status = 'ready'
  handleStylus(options, () => {
    options.status = 'complete'
    handleStylus(options, now => {
      // handleCall(now, startTime, callback)
      callback(now - startTime)
    })
  })
}

module.exports = converFile;
