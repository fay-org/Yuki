import { computed, ref, watch, defineComponent, nextTick, onMounted } from 'vue'
import { useState } from '@fect-ui/vue-hooks'
import { createName, createBem, pick, getDomRect, CustomCSSProperties, ComponentInstance, assign } from '../utils'
import Input from '../input'
import Tooltip from '../tooltip'
import type { ToolTipProps } from '../tooltip/interface'
import GridGroup from '../grid-group'
import { createSelectContext } from './select-context'
import ArrowIcon from './arrow-icon'
import ClearIcon from './clear-icon'
import SelectMultiple from './select-multiple'
import { props } from './props'

import './index.less'

const name = createName('Select')
const bem = createBem('fect-select')

export default defineComponent({
  name,
  props,
  emits: ['change', 'update:modelValue'],
  setup(props, { slots, emit }) {
    const toolTipRef = ref<ComponentInstance>()
    const selectRef = ref<HTMLDivElement>()
    const gridRef = ref<ComponentInstance>()
    const { provider, children } = createSelectContext()

    const [value, setValue] = useState<string | string[]>(props.modelValue || props.value)
    const [visible, setVisible] = useState<boolean>(false)
    const [dropdownWidth, setDropdownWidth] = useState<string>('')
    const [showClear, setShowClear] = useState<boolean>(false)
    const [multipleHeight, setMultipleHeight] = useState<string>('')

    let selectWrapperHeight: number

    const updateDropDown = () => {
      nextTick(() => {
        if (gridRef.value) {
          const gridEl = gridRef.value.$el as HTMLElement
          const rect = getDomRect(gridEl)
          if (rect.height <= selectWrapperHeight) {
            setMultipleHeight(() => `${selectWrapperHeight}px`)
          } else {
            setMultipleHeight(() => `${rect.height + 6}px`)
          }
        }
        if (props.multiple) {
          nextTick(() => {
            toolTipRef.value?.updateRect()
          })
        }
      })
    }

    const updateSelectValue = (val: string) => {
      setValue((pre) => {
        if (props.multiple) {
          const previous = Array.isArray(pre) ? pre : [pre]
          if (!pre.includes(val)) return [...previous, val]
          return previous.filter((item) => item !== val)
        } else {
          return val
        }
      })
    }

    const updateSelectVisible = () => {
      if (props.multiple) return
      setVisible(false)
    }

    provider({ updateSelectVisible, updateSelectValue, updateDropDown, size: props.size, parentValue: value })

    const multipleClearClickHandler = (val: string) => {
      updateSelectValue(val)
      updateDropDown()
    }

    watch(
      () => props.modelValue,
      (cur) => setValue(cur)
    )

    watch(value, (cur) => {
      emit('change', cur)
      emit('update:modelValue', cur)
    })

    const queryChecked = computed(() => {
      const list = Array.isArray(value.value) ? value.value : [value.value]
      return children.filter((child) => list.includes(child.value as string))
    })

    const renderNodes = () => {
      const { clearable } = props
      const list = queryChecked.value
      return (
        <GridGroup ref={gridRef} class={bem('multiple')} gap={0.5}>
          {list.map((_) => (
            <SelectMultiple onClear={() => multipleClearClickHandler(_.value as string)} clearable={clearable}>
              {_.label}
            </SelectMultiple>
          ))}
        </GridGroup>
      )
    }

    onMounted(() => {
      const rect = getDomRect(selectRef)
      const height = rect.height || rect.top - rect.bottom
      const width = rect.width || rect.right - rect.left
      selectWrapperHeight = height
      setDropdownWidth(`${width}px`)
    })

    const renderSelectWrapper = () => {
      const { multiple, clearable, disabled } = props
      const selectInputProps = pick(props, ['disabled', 'size', 'placeholder'])
      // eslint-disable-next-line prefer-destructuring
      const checkedValue = queryChecked.value.map((_) => _.label)[0]
      if (!multiple) {
        assign(selectInputProps, { modelValue: checkedValue })
      }

      const showClearIcon = clearable && !disabled && checkedValue && showClear.value && !multiple

      const clearValueHandelr = (e: Event) => {
        if (showClearIcon) {
          e.stopImmediatePropagation()
          e.stopPropagation()
          setValue('')
          setVisible(false)
        }
      }

      const renderSelectSuffixIcon = () => {
        if (showClearIcon) return <ClearIcon class={bem('arrow', 'clear')} />
        return <ArrowIcon class={bem('arrow', { active: visible.value })} />
      }

      return (
        <div
          class={bem('content')}
          ref={selectRef}
          onMouseenter={() => setShowClear(true)}
          onMouseleave={() => setShowClear(false)}
        >
          {multiple && renderNodes()}
          <Input
            class={bem('input')}
            readonly
            role="combobox"
            aria-haspopup="listbox"
            onSuffix-icon-click={clearValueHandelr}
            aria-expanded={visible.value}
            {...selectInputProps}
            v-slots={{ ['suffix-icon']: () => renderSelectSuffixIcon() }}
          />
        </div>
      )
    }

    return () => {
      const _slots = {
        content: () => <div style={{ width: dropdownWidth.value }}>{slots.default?.()}</div>,
        default: () => renderSelectWrapper()
      }

      const tooltipProps: Partial<ToolTipProps> = {
        portalClass: bem('dropdown'),
        visible: visible.value,
        placement: 'bottom',
        trigger: 'click',
        disabled: props.disabled,
        visibleArrow: props.visibleArrow
      }

      const setContentHeight = () => {
        return {
          '--select-content-height': multipleHeight.value || 'calc(var(--select-ratio) * var(--fect-gap))'
        } as CustomCSSProperties
      }

      return (
        <div class={bem(null, { disabled: props.disabled, size: props.size })} style={setContentHeight()}>
          <Tooltip ref={toolTipRef} onChange={(cur) => setVisible(cur)} v-slots={_slots} {...tooltipProps} />
        </div>
      )
    }
  }
})
