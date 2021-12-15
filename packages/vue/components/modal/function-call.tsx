import { App } from 'vue'
import { useState } from '@fect-ui/vue-hooks'
import FeModal from './modal'
import { withInstall, isBrowser, omit, assign, createPortal, useExpose } from '../utils'
import type { ComponentInstance } from '../utils'
import type { StaticModalOptions } from './interface'

const isFunc = (val: any) => typeof val === 'function'

let instance: ComponentInstance

const Modal = (otpions: StaticModalOptions) => {
  if (!isBrowser()) return
  const staticOptions = omit(assign({}, Modal.defaultOptions, otpions), 'close', 'confirm', 'content')

  if (!instance) {
    ;({ instance } = createPortal({
      setup() {
        const [visible, setVisible] = useState<boolean>(false)

        useExpose({ setVisible })

        const confirmHandler = () => {
          setVisible(false)
          if (otpions.confirm) {
            isFunc(otpions.confirm) && otpions.confirm()
          }
        }

        const cancelHandler = () => {
          setVisible(false)
          if (otpions.close) {
            isFunc(otpions.close) && otpions.close()
          }
        }

        return () => (
          <FeModal {...staticOptions} visible={visible.value} onCancel={cancelHandler} onConfirm={confirmHandler}>
            {otpions?.content}
          </FeModal>
        )
      }
    }))
  }

  return instance.setVisible(true)
}

Modal.defaultOptions = {
  title: '',
  width: '400px',
  cancel: 'cancel',
  done: 'done'
} as StaticModalOptions

Modal.Component = withInstall(FeModal)

Modal.install = (app: App) => {
  app.use(Modal.Component)
  app.config.globalProperties.$modal = Modal
}

export { Modal }
