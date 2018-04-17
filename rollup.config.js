import babel from 'rollup-plugin-babel'

export default {
  input: './src/index.js',
  output: {
    file: './bin/index.js',
    format: 'cjs'
  },
  plugins: [
    babel({
      exclude: 'node_modules/**',
      plugins: ['external-helpers']
    })
  ]
}
