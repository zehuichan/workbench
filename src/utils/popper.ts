import { ElTooltip } from 'element-plus'
import { merge } from 'es-toolkit'
import { createVNode, render, type ComponentInternalInstance, type VNode } from 'vue'

export let removePopper: ((() => void) & { trigger?: Element; vm?: VNode }) | null = null

const getOverflowTooltipProps = (props: any, content: any) => {
  return {
    content,
    ...props,
    popperOptions: {
      strategy: 'fixed',
      ...props.popperOptions,
    },
  }
}

export function createPopper(props: any, popperContent: any, trigger: Element, instance: ComponentInternalInstance) {
  if (removePopper?.trigger === trigger) {
    if (removePopper.vm && removePopper.vm.component && removePopper.vm.component.props) {
         merge(
          removePopper.vm.component.props,
          getOverflowTooltipProps(props, popperContent)
        )
    }
    return
  }
  removePopper?.()
  const parentNode = instance?.proxy?.$el
  const vm = createVNode(ElTooltip, {
    virtualTriggering: true,
    virtualRef: trigger,
    appendTo: parentNode,
    placement: 'top',
    transition: 'none', // Default does not require transition
    offset: 0,
    hideAfter: 0,
    ...getOverflowTooltipProps(props, popperContent),
  })
  if (instance && instance.appContext) {
      vm.appContext = { ...instance.appContext, ...instance }
  }

  const container = document.createElement('div')
  render(vm, container)
  if (vm.component && vm.component.exposed) {
      vm.component.exposed.onOpen()
  }
  const scrollContainer = parentNode?.querySelector(`.el-scrollbar__wrap`)
  removePopper = (() => {
    render(null, container)
    scrollContainer?.removeEventListener('scroll', removePopper as any) // Cast because removePopper has extra props
    removePopper = null
  }) as any
  
  if (removePopper) {
      removePopper.trigger = trigger
      removePopper.vm = vm
  }
  
  scrollContainer?.addEventListener('scroll', removePopper as any)
}
