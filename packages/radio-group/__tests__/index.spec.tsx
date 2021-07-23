import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import RadioGroup from '../index'
import Radio from '../../radio'

describe('RadioGroup', () => {
  it('should be render as element', () => {
    const radioGroup = mount(RadioGroup)
    expect(radioGroup.html()).toMatchSnapshot()
    expect(() => radioGroup.unmount()).not.toThrow()
  })

  it('should be support initialValue', () => {
    const wrapper = mount({
      render: () => (
        <RadioGroup initialValue={1}>
          <Radio value={1}></Radio>
          <Radio value={2}></Radio>
        </RadioGroup>
      ),
    })

    expect(wrapper.html()).toMatchSnapshot()
    const els = wrapper.findAll('.fect-radio__point')
    expect(els[0].classes('active')).toBeTruthy()
  })

  it('should be support useRow', () => {
    const wrapper = mount({
      render: () => <RadioGroup useRow={true}></RadioGroup>,
    })
    expect(wrapper.find('.fect-radio__group').classes('useRow')).toBe(true)
  })

  it('should be support disabled', () => {
    const wrapper = mount({
      render: () => (
        <RadioGroup disabled={true}>
          <Radio value={1} />
          <Radio value={2} />
        </RadioGroup>
      ),
    })

    const labels = wrapper.findAll('label')
    expect(labels[0].classes('disabled')).toBeTruthy()
    expect(labels[1].classes('disabled')).toBeTruthy()
  })

  it('should be support differentSizes', () => {
    const wrapper = mount({
      setup() {
        return { sizeList: ['mini', 'small', 'medium', 'large'] }
      },
      render() {
        return (
          <>
            {this.sizeList.map((item: any) => (
              <RadioGroup size={item} key={item}>
                <Radio value={item} />
              </RadioGroup>
            ))}
          </>
        )
      },
    })

    expect(wrapper.html()).toMatchSnapshot()
    expect(() => wrapper.unmount()).not.toThrow()
  })

  it('should be support emit change', async () => {
    const wrapper = mount({
      emits: ['change'],
      setup(props, { emit }) {
        const test = ref(0)
        const handlerChange = (next: any) => {
          test.value = next
          emit('change', next)
        }
        return {
          test,
          handlerChange,
        }
      },
      render() {
        return (
          <>
            <RadioGroup onChange={this.handlerChange}>
              <Radio value={1} />
              <Radio value={2} />
            </RadioGroup>
          </>
        )
      },
    })

    const labels = wrapper.findAll('[type="radio"]')
    await labels[0].trigger('change')
    expect(wrapper.vm.test).toBeTruthy()
  })
})
