import { defineComponent } from 'vue'
import { useSelectContext } from '../select/select-context'
import { selectOptionProps } from '../select/props'
import { createName, createBem } from '../utils'
import './index.less'

const name = createName('Option')
const bem = createBem('fect-option')

export default defineComponent({
  name,
  props: selectOptionProps,
  setup(props) {
    const { context } = useSelectContext()
    const { setVisible, updateSelectValue } = context!

    const handleClick = (e: Event) => {
      e.stopPropagation()
      e.preventDefault()
      if (props.disabled) return
      setVisible(false)
      updateSelectValue(props.value)
    }
    return () => (
      <div class={bem(null, { disabled: props.disabled })} onClick={handleClick}>
        {props.label}
      </div>
    )
  }
})
