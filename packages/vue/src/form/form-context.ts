import { inject } from 'vue'
import { createProvider, useProvider } from '@fect-ui/vue-hooks'
import { pickContextProps } from '../utils'
import type { FormContext, FormItemCotnext, FormItemInstance } from './interface'

const READONLY_FORM_KEY = Symbol('formKey')

const READONLY_FORM_ITEM_KEY = Symbol('formItemKey')

export const createFormContext = () => createProvider<FormItemInstance>(READONLY_FORM_KEY)

export const useFormContext = () => useProvider<FormContext>(READONLY_FORM_KEY)

export const createFormItemContext = () => createProvider(READONLY_FORM_ITEM_KEY)

export const useFormItemCotnext = () => useProvider<FormItemCotnext>(READONLY_FORM_ITEM_KEY)

export const useFormStateContext = (): Pick<FormItemCotnext, 'behavior' | 'validate'> | undefined => {
  const parentState = inject<FormItemCotnext | null>(READONLY_FORM_ITEM_KEY, null)
  if (!parentState) return
  const { behavior, validate } = parentState
  return { behavior, validate }
}

export const pickFormStateProps = <T, K, S>(props: T, parent: K, formState: S): T =>
  pickContextProps(pickContextProps(props, parent), formState)
