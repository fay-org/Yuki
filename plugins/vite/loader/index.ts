/**
 * steps:
 *    - Read all exist markdown file at first time.
 *    - parser to router struct
 *    - return router struct is converted into a string and returned
 */

import path from 'path'
import { URLSearchParams } from 'url'
import fg from 'fast-glob'
import fs from 'fs/promises'
import { composeSfcBlocks } from 'vite-plugin-md'

import type { ModuleNode, Plugin, ViteDevServer } from 'vite'

const slash = (path: string) => path.replace(/\\/g, '/')

const defaultWd = slash(process.cwd())

const virtualModule = `virtual:router`

const virtualId = '/@virtual:router/modules'

/**
 * vite's watcher is use chokidar.
 * See the api document:  https://github.com/paulmillr/chokidar#api
 */
const ensureServerRuning = (server: ViteDevServer, markdowns: Map<string, StaticMarkdonMeta>) => {
  const { watcher } = server

  // Here is a footgun. we just think the suffix *.md is allowed
  const isTargetFile = (file: string) => path.extname(file).split('.')[1] === 'md'

  const invorkFSWatcher = (file, callback: (file: string, reloadPage: () => void) => void) => {
    file = slash(file)
    if (!isTargetFile(file)) return
    // https://vitejs.dev/guide/why.html#slow-updates
    const reloadPage = () => {
      if (!server) return
      const { ws, moduleGraph } = server
      const mods = moduleGraph.getModulesByFile(virtualModule)
      if (mods) {
        const seen = new Set<ModuleNode>()
        mods.forEach((mod) => moduleGraph.invalidateModule(mod, seen))
      }
      ws.send({ type: 'full-reload' })
    }
    callback(file, reloadPage)
  }

  watcher.on('change', (file) =>
    invorkFSWatcher(file, async (realFile, reloadPage) => {
      if (markdowns.has(realFile)) {
        const latest = await loadModule(realFile)
        joinMapStruct<StaticMarkdonMeta>([latest], (data, key) => markdowns.set(key, data))
        reloadPage()
      }
    })
  )

  watcher.on('unlink', (file) =>
    invorkFSWatcher(file, (realFile, reloadPage) => {
      if (markdowns.has(realFile)) {
        markdowns.delete(file)
        reloadPage()
      }
    })
  )

  watcher.on('add', (file) =>
    invorkFSWatcher(file, async (realFile, reloadPage) => {
      const latest = await loadModule(realFile)
      joinMapStruct<StaticMarkdonMeta>([latest], (data, key) => {
        if (!markdowns.has(key)) markdowns.set(key, data)
      })
      reloadPage()
    })
  )
}

const parserRequest = (id: string) => {
  const [moduleId, raw] = id.split('?', 2)
  const query = new URLSearchParams(raw)
  const pageId = query.get('id')
  return {
    moduleId,
    query,
    pageId
  }
}

const loadGlob = (entry: string, ext = '.md') => {
  return fg(slash(path.join(entry, `**/*${ext}`)), {
    onlyFiles: true,
    dot: true
  })
}

const loadModule = async (file: string) => {
  //
  const staticRaw = await fs.readFile(file, 'utf8')
  const {
    frontmatter: { title, index, name, group }
  } = await composeSfcBlocks(file, staticRaw)
  return {
    title,
    index,
    name: name?.toLocaleLowerCase(),
    group,
    file
  }
}

const loadStaticMarkdonModuleImpl = async () => {
  const zh = await loadGlob(slash(path.join(defaultWd, 'docs', 'zh-cn')))
  const en = await loadGlob(slash(path.join(defaultWd, 'docs', 'en-us')))
  // https://github1s.com/vitejs/vite/blob/HEAD/packages/vite/src/node/plugins/importMetaGlob.ts
  const serialization = async (files: string[]) => Promise.all(files.map(loadModule))
  const asyncLoad = () => Promise.all([serialization(zh), serialization(en)])
  return asyncLoad()
}

const resolver = (markdowns: Map<string, StaticMarkdonMeta>) => {
  const store: {
    'en-us': any[]
    'zh-cn': any[]
  } = {
    'en-us': [],
    'zh-cn': []
  }
  const imports: string[] = []
  const realDirName = (file) => path.dirname(file).split('/').pop()
  const realImport = (variable: string, file: string) => {
    const source = file.replace(slash(path.join(defaultWd, 'docs')), '')
    return `const ${variable} = () => import("${source}")`
  }
  const componentRE = /"(?:module|element)":("(.*?)")/g
  markdowns.forEach(({ group, index, title, name }, key) => {
    if (key.includes('en-us')) {
      const moduleName = `${name}_en_us`
      imports.push(realImport(moduleName, key))
      store['en-us'].push({ group, index, dirName: realDirName(key), name, title, module: moduleName })
    }
    if (key.includes('zh-cn')) {
      const moduleName = `${name}_zh_cn`
      imports.push(realImport(moduleName, key))
      store['zh-cn'].push({ group, index, dirName: realDirName(key), name, title, module: moduleName })
    }
  })
  const final = Object.values(store)
  const c = JSON.stringify(final).replace(componentRE, (_, $1) => {
    $1 = $1.replace(/\"/g, '')
    return _
  })
  console.log(c)
  const code = `${imports.join(';\n')};const routes =${JSON.stringify(final)}; \n\nexport default routes;`
  return code
}

type StaticMarkdonModule = Awaited<ReturnType<typeof loadStaticMarkdonModuleImpl>>[number]

type StaticMarkdonMeta = Omit<StaticMarkdonModule[number], 'file'>

const joinMapStruct = <K>(raw: StaticMarkdonModule, invork: (data: K, key: string) => void) => {
  raw.forEach((item) => {
    const { file, ...rest } = item
    invork(rest as K, file)
  })
}

export const loadStaticMarkdonModule = (): Plugin => {
  //
  const markdowns = new Map<string, StaticMarkdonMeta>()
  return {
    enforce: 'pre',
    name: 'virtual:loader',
    async buildStart() {
      const originalModule = await loadStaticMarkdonModuleImpl()
      joinMapStruct<StaticMarkdonMeta>(originalModule.flat(), (data, key) => {
        if (!markdowns.has(key)) markdowns.set(key, data)
      })
    },
    configureServer(server) {
      ensureServerRuning(server, markdowns)
    },
    resolveId(id) {
      if (virtualModule === id) return `${virtualId}?id=${id}`
      return null
    },
    async load(id) {
      const { moduleId, pageId } = parserRequest(id)
      if (moduleId === virtualId && pageId) {
        return resolver(markdowns)
      }
      return null
    }
  }
}
