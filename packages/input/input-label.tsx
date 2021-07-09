import { defineComponent } from 'vue'

const InputLabel = defineComponent({
  props: {
    fontSize: String,
    isRight: Boolean,
  },
  setup(props, { slots }) {
    return () => (
      <div
        class={`input-label ${props.isRight ? 'suffix' : ''}`}
        style={{ fontSize: props.fontSize }}
      >
        {slots.default?.()}
      </div>
    )
  },
})

export default InputLabel
