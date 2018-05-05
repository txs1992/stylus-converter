#!/usr/bin/env node

const argv = require('optimist').argv;
const program = require('commander');
const converFile = require('./file');
const version = require('../package.json').version

function handleOptions () {
  const quote = argv.q|| argv.quote || 'single'
  const input = argv.i || argv.input
  const output = argv.o || argv.output
  const conver = argv.c || argv.conver || 'scss'
  const directory = argv.d || argv.directory || 'yes'
  const autoprefixer =  argv.p || argv.autoprefixer || 'yes'
  if (!input) throw new Error('Not input.')
  if (!output) throw new Error('Not output.')
  if (quote !== 'single' && quote !== 'dobule') throw new Error('The quote parameter has a problem, it can only be single or double.')
  if (conver !== 'scss') throw new Error('No other conversions are currently supported.')

  converFile({
    quote: quote === 'single' ? '\'' : '\"',
    input,
    output,
    conver,
    directory: directory === 'yes',
    autoprefixer: autoprefixer === 'yes'
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
    .action(handleOptions)
    .parse(process.argv);
