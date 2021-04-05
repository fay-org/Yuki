import { defineComponent } from 'vue'
    
import SiderBar from './siderbar'
const Layout = defineComponent({
  setup(props, { slots }) {
    return () => (
      <div className="layout">
        <aside className="sidebar">
          <SiderBar />
        </aside>
        <div className="side-shadow" />
        <main className="main">
          <div>{slots.default?.()}</div>
        </main>
        <style jsx>{`
          .layout {
            min-height: calc(100vh - 108px);
            max-width: 782pt;
            margin: 0 auto;
            padding: 0 16pt;
            display: flex;
            box-sizing: border-box;
          }

          .sidebar {
            width: 200px;
            margin-right: 20px;
            -webkit-overflow-scrolling: touch;
            -webkit-flex-shrink: 0;
            position: fixed;
            top: 140px;
            bottom: 2rem;
            transition: transform 200ms ease-out;
            z-index: 100;
          }
          .side-shadow {
            width: 220px;
            flex-shrink: 0;
            height: 100vh;
          }

          .main {
            display: flex;
            max-width: calc(100% - 220px);
            flex-direction: column;
            padding-left: 20px;
            padding-top: 25px;
            flex: 0 0 100%;
            padding-bottom: 150px;
          }

          @media only screen and (max-width: 650px) {
            .layout {
              max-width: 100%;
              width: 100%;
              padding: 5rem 1rem;
            }

            .sidebar {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              z-index: 10;
              width: 100vw;
              padding: 0;
              display: none;
              overflow: hidden;
              transition: height 250ms ease;
            }

            .main {
              width: 90vw;
              max-width: 90vw;
              padding: 0;
            }

            .side-shadow {
              display: none;
              visibility: hidden;
            }
          }
        `}</style>
      </div>
    )
  },
})

export default Layout
