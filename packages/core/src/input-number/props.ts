import { omit, assign } from '@fect-ui/shared'
import { props } from '../input/props'

export const inputNumberProps = assign(omit(props, ['prefix', 'suffix', 'type', 'modelValue']), {
  max: { type: Number, default: Infinity },
  min: { type: Number, default: Infinity },
  modelValue: { type: Number },
  step: {
    type: Number,
    default: 1
  },
  precision: Number,
  strictly: {
    type: Boolean,
    default: false
  }
})
