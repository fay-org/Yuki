import { defineComponent } from 'vue'
import { createName, createBem } from '../utils'

import './index.less'

const name = createName('Spinner')
const bem = createBem('fect-spinner')

export default defineComponent({
  name,
  props: {},
  setup(props, { slots }) {
    const renderDot = () => [...Array(12)].map((_, idx) => <span key={`spinner-${idx}`} />)

    return () => (
      <div class={bem(null)}>
        <div class={bem('container')}>{renderDot()}</div>
      </div>
    )
  }
})
