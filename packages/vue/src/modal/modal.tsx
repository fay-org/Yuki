import { watch, defineComponent, ref } from 'vue'
import { useState } from '@fect-ui/vue-hooks'
import { createName, ComponentInstance, createBem, useKeyboard, KeyCode } from '../utils'
import ModalWrapper from './modal-wrapper'
import { createModalContext } from './modal-context'
import Teleport from '../teleport'
import { props } from './props'
import type { Action } from './interface'

import './index.less'

const name = createName('Modal')
const bem = createBem('fect-modal')

export default defineComponent({
  name,
  inheritAttrs: false,
  props,
  emits: ['update:visible', 'cancel', 'confirm'],
  setup(props, { attrs, slots, emit }) {
    const modalRef = ref<ComponentInstance>()
    const teleportRef = ref<ComponentInstance>()

    const [selfVisible, setSelfVisible] = useState<boolean>(false)

    const { provider } = createModalContext()

    // modal close event collection
    const closeModal = (action: Action) => {
      setSelfVisible(false)
      emit(action as keyof typeof emit)
    }

    provider({ props, closeModal })

    watch(
      () => props.visible,
      (cur) => setSelfVisible(cur)
    )
    watch(selfVisible, (cur) => emit('update:visible', cur))

    const popupClickHandler = (e: MouseEvent) => {
      if (props.disableOverlayClick) return
      const element = modalRef.value!.$el
      if (element && element.contains(e.target as Node)) return
      closeModal('cancel')
    }

    useKeyboard(() => closeModal('cancel'), KeyCode.Escape, {
      target: teleportRef.value?.popupRef as HTMLDivElement,
      event: 'keydown'
    })

    return () => (
      <Teleport
        teleport={props.teleport}
        overlay={props.overlay}
        scroll={selfVisible.value}
        popupClass={bem(null)}
        transition="modal-fade"
        ref={teleportRef}
        show={selfVisible.value}
        onPopupClick={popupClickHandler}
      >
        <div class={bem('root')}>
          <ModalWrapper ref={modalRef} v-slots={slots} {...attrs} />
        </div>
      </Teleport>
    )
  }
})
