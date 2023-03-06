import resolve from '@rollup/plugin-node-resolve'
import typescript from 'rollup-plugin-typescript2'
import commonjs from '@rollup/plugin-commonjs'
import del from 'rollup-plugin-delete'
import terser from '@rollup/plugin-terser'

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
    del({ targets: 'dist/*', runOnce: true }),
    resolve(),
    commonjs(),
    typescript({ useTsconfigDeclarationDir: true }),
    isProduction && (await terser()),
  ],
}))()
