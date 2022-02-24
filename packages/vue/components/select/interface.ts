import type { ExtractPropTypes } from 'vue'
import type { ComponentInstance } from '../utils'
import { selectOptionProps, props } from './props'

export interface SelectContext {
  setVisible: (status: boolean) => void
  setParentValue: (val: string | number) => void
  updateSelectValue: (val: string | number) => void
}

export type SelectPropInstance = ComponentInstance<ExtractPropTypes<typeof selectOptionProps>>

export type SelectProps = Partial<ExtractPropTypes<typeof props>>
