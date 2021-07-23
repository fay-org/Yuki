import { ref, watchEffect } from 'vue'
import { createNameSpace } from '../utils'
import { useProvider } from '@fect-ui/vue-hooks'
import {
  BreadcrumbsProvide,
  READONLY_BREADCRUMBS_KEY,
} from '../breadcrumbs/index'
import Link from '../link'
import Separator from './breadcrumbs-spearator'
import './index.less'

const [createComponent] = createNameSpace('BreadcrumbsItem')

export default createComponent({
  props: {
    to: {
      type: [String, Object],
      default: '',
    },
    href: {
      type: String,
      default: '',
    },
  },
  setup(props, { slots, attrs }) {
    const hasLink = ref<boolean>(false)

    const { context } = useProvider<BreadcrumbsProvide>(
      READONLY_BREADCRUMBS_KEY,
    )

    watchEffect(() => {
      /**
       * use Boolean to  display ,magic implicit convert is no encourage
       */
      const isNull = Boolean(props?.to) || props.href !== ''
      hasLink.value = isNull
    })

    if (!context) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(
          '[Fect] <BreadcrumbsItem> must be a child component of <Breadcrumbs>.',
        )
      }
      return
    }

    const withoutLinkRender = () => {
      return (
        <span class="fect-breadcrumbs__item">
          {slots.default?.()}
          <Separator>{context.separator}</Separator>
        </span>
      )
    }

    const linkRender = () => {
      return (
        <div class="fect-breadcrumbs__item">
          <Link to={props.to} href={props.href} class="withLink">
            {slots.default?.()}
          </Link>
          <Separator>{context.separator}</Separator>
        </div>
      )
    }

    return () => (
      <>{hasLink.value ? <>{linkRender()}</> : <>{withoutLinkRender()}</>}</>
    )
  },
})
