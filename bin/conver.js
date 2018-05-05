#!/usr/bin/env node

const argv = require('optimist').argv;
const program = require('commander');
const converFile = require('./file');
const version = require('../package.json').version

function handleOptions () {
  const quote = argv.Q || argv.quote || 'single'
  const input = argv.I || argv.input
  const output = argv.O || argv.output
  const conver = argv.C || argv.conver || 'scss'
  const directory = argv.D || argv.directory || 'yes'
  const autoprefixer =  argv.P || argv.autoprefixer || 'yes'
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
    .option('-Q, --quote', 'Add quote')
    .option('-I, --input', 'Add input')
    .option('-O, --output', 'Add output')
    .option('-C, --conver', 'Add conver type')
    .option('-D, --directory', 'Is directory type')
    .option('-P, --autoprefixer', 'Whether to add a prefix')
    .action(handleOptions)
    .parse(process.argv);
