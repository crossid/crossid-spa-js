import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'

const isProduction = process.env.NODE_ENV === 'production'

export default (async () => ({
  input: 'src/index.ts',
  output: [
    {
      dir: 'dist',
      format: 'esm',
    },
    {
      name: 'crossid',
      file: 'dist/crossid-spa-js.js',
      format: 'umd',
    },
  ],
  plugins: [
    resolve(),
    commonjs(),
    typescript(),
    isProduction && (await import('rollup-plugin-terser')).terser(),
  ],
}))()
