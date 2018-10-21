#!/usr/bin/env node

const ora = require('ora')
const argv = require('optimist').argv
const program = require('commander')
const converFile = require('./file')
const version = require('../package.json').version

const spinner = ora({
  color: 'yellow'
})

function handleOptions() {
  const quote = argv.q || argv.quote || 'single'
  const input = argv.i || argv.input
  const output = argv.o || argv.output
  const conver = argv.c || argv.conver || 'scss'
  const directory = argv.d || argv.directory || 'no'
  const autoprefixer = argv.p || argv.autoprefixer || 'yes'
  const isSignComment = argv.s || argv.singlecomments || 'no'
  const indentVueStyleBlock = argv.v || argv.indentVueStyleBlock || 0
  if (!input) throw new Error('The input parameter cannot be empty.')
  if (!output) throw new Error('The output parameter cannot be empty.')
  if (quote !== 'single' && quote !== 'dobule') throw new Error('The quote parameter has a problem, it can only be single or double.')
  if (conver.toLowerCase() !== 'scss') throw new Error('The conver parameter can only be scss.')

  spinner.start('Your file is being converted. Please wait...\n')
  converFile({
    quote: quote === 'single' ? '\'' : '\"',
    input,
    output,
    conver,
    directory: directory === 'yes',
    autoprefixer: autoprefixer === 'yes',
    isSignComment: isSignComment === 'yes',
    indentVueStyleBlock: Number(indentVueStyleBlock),
  }, time => {
    console.log('')
    spinner.succeed('Conversion completed and time spent ' + time + ' ms.')
  })
}

program
  .version(version)
  .option('-q, --quote', 'Add quote')
  .option('-i, --input', 'Add input')
  .option('-o, --output', 'Add output')
  .option('-c, --conver', 'Add conver type')
  .option('-d, --directory', 'Is directory type')
  .option('-p, --autoprefixer', 'Whether to add a prefix')
  .option('-s, --singlecomments ', 'Change single-line comments to multi-line comments')
  .option('-v, --indentVueStyleBlock ', 'Indent the entire style block of a vue file with a certain amount of spaces.')
  .action(handleOptions)
  .parse(process.argv);
