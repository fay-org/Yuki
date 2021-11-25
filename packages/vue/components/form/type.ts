import { tuple } from '../utils'
import type { ComputedRef, Ref } from 'vue'
import type { RuleItem } from 'proy'
import type { FormProps } from './props'

export const labelPosition = tuple('left', 'right', 'top')

export type LabelPosition = typeof labelPosition[number]

export const READONLY_FORM_KEY = Symbol('formKey')

export interface FormProvide {
  formProps: FormProps
}

export type Trigger = 'change' | 'blur'

export interface FormRule extends RuleItem {
  message?: string
  trigger?: Trigger
}

export type FormRules = Record<string, FormRule | FormRule[]>
