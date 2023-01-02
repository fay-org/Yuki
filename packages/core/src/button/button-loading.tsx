import { defineComponent, PropType } from 'vue'
import { LoadingTypes } from '../utils'
import Loading from '../loading'

export default defineComponent({
  props: {
    loadType: {
      type: String as PropType<LoadingTypes>
    },
    color: String
  },
  setup(props) {
    return () => (
      <div class="fect-button__loading">
        <Loading loadType={props.loadType} color={props.color} />
      </div>
    )
  }
})
