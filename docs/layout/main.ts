import { createApp } from 'vue'
import Application from './application.vue'
import Fect from '@fect-ui/vue/src'
import Icon from '@fect-ui/vue-icons'
import { loadStaticMarkdownModuleAsync } from './common/loader'
import { combinedRoutes, createRouter } from './common/route'
import { createGlobalState } from './composables'
import { Playground, Preview } from './components/playground'
import Example from '../../example'
import '@fect-ui/themes'
import './common/var.css'
import { createWebHistory } from 'vue-router'

const createVueApp = async () => {
  const globalState = createGlobalState()

  // create app instance
  const app = createApp(Application)

  // load full static markdown module
  const staticModule = await loadStaticMarkdownModuleAsync()

  const routes = combinedRoutes(staticModule)
  // create router
  const router = createRouter({
    routes,
    histroy: createWebHistory()
  })

  app.config.errorHandler = (err) => {
    globalState.setRenderError(err)
  }

  router.onError((err) => {
    console.log(err)
    globalState.setRenderError(err)
    console.log(err, 'router err main')
  })

  const composeTitle = (base = 'Vue') => `${base} - Fect UI`

  router.beforeEach((to, _, next) => {
    document.title = composeTitle((to.meta?.title as string) || 'Vue')

    next()
  })

  app.use(router)
  app.use(Fect)
  app.use(Icon)
  app.use(globalState)
  app.use(Example)
  app.component(Playground.name, Playground)
  app.component(Preview.name, Preview)
  return { app, router }
}

createVueApp().then(({ app, router }) => router.isReady().then(() => app.mount('#app')))
