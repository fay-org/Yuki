import { Bundler } from '../compiler/bundler'

export const compile = async () => {
  const bundler = new Bundler()
  await bundler.run()
}
