import { useWindowSize } from '@vueuse/core'

import { upperFirst } from 'es-toolkit'

import { isNumber, isString, isStringNumber } from '@/utils'

export const stopPropagation = (event: Event) => event.stopPropagation()

export function preventDefault(event: Event, isStopPropagation?: boolean) {
  /* istanbul ignore else */
  if (typeof event.cancelable !== 'boolean' || event.cancelable) {
    event.preventDefault()
  }

  if (isStopPropagation) {
    stopPropagation(event)
  }
}

export function getBoundingClientRect(element: Element): DOMRect | number {
  if (!element || !element.getBoundingClientRect) {
    return 0
  }
  return element.getBoundingClientRect()
}

const trim = function(s: string) {
  return (s || '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '')
}

export function hasClass(el: Element, cls: string): boolean {
  if (!el || !cls) return false

  if (cls.indexOf(' ') !== -1)
    throw new Error('className should not contain space.')
  if (el.classList) {
    return el.classList.contains(cls)
  } else {
    return ` ${el.className} `.indexOf(` ${cls} `) > -1
  }
}

export function addClass(el: Element, cls: string) {
  if (!el) return
  let curClass = el.className
  const classes = (cls || '').split(' ')

  for (let i = 0, j = classes.length; i < j; i++) {
    const clsName = classes[i]
    if (!clsName) continue

    if (el.classList) {
      el.classList.add(clsName)
    } else if (!hasClass(el, clsName)) {
      curClass += ` ${clsName}`
    }
  }
  if (!el.classList) {
    el.className = curClass
  }
}

export function removeClass(el: Element, cls: string) {
  if (!el || !cls) return
  const classes = cls.split(' ')
  let curClass = ` ${el.className} `

  for (let i = 0, j = classes.length; i < j; i++) {
    const clsName = classes[i]
    if (!clsName) continue

    if (el.classList) {
      el.classList.remove(clsName)
    } else if (hasClass(el, clsName)) {
      curClass = curClass.replace(` ${clsName} `, ' ')
    }
  }
  if (!el.classList) {
    el.className = trim(curClass)
  }
}

export function hackCss(attr: string, value: string) {
  const prefix = ['webkit', 'Moz', 'ms', 'OT']

  const styleObj: Record<string, string> = {}
  prefix.forEach((item) => {
    styleObj[`${item}${upperFirst(attr)}`] = value
  })
  return {
    ...styleObj,
    [attr]: value,
  }
}

/**
 * Get the left and top offset of the current element
 * left: the distance between the leftmost element and the left side of the document
 * top: the distance from the top of the element to the top of the document
 * right: the distance from the far right of the element to the right of the document
 * bottom: the distance from the bottom of the element to the bottom of the document
 * rightIncludeBody: the distance between the leftmost element and the right side of the document
 * bottomIncludeBody: the distance from the bottom of the element to the bottom of the document
 */
export function getViewportOffset(element: Element) {
  const doc = document.documentElement

  const docScrollLeft = doc.scrollLeft
  const docScrollTop = doc.scrollTop
  const docClientLeft = doc.clientLeft
  const docClientTop = doc.clientTop

  const pageXOffset = window.pageXOffset
  const pageYOffset = window.pageYOffset

  const box = getBoundingClientRect(element)

  if (typeof box === 'number') {
    // Handling the case where getBoundingClientRect returns 0
    return {
       left: 0,
       top: 0,
       right: 0,
       bottom: 0,
       rightIncludeBody: 0,
       bottomIncludeBody: 0
    }
  }

  const { left: retLeft, top: rectTop, width: rectWidth, height: rectHeight } = box

  const scrollLeft = (pageXOffset || docScrollLeft) - (docClientLeft || 0)
  const scrollTop = (pageYOffset || docScrollTop) - (docClientTop || 0)
  const offsetLeft = retLeft + pageXOffset
  const offsetTop = rectTop + pageYOffset

  const left = offsetLeft - scrollLeft
  const top = offsetTop - scrollTop

  const clientWidth = window.document.documentElement.clientWidth
  const clientHeight = window.document.documentElement.clientHeight
  return {
    left: left,
    top: top,
    right: clientWidth - rectWidth - left,
    bottom: clientHeight - rectHeight - top,
    rightIncludeBody: clientWidth - left,
    bottomIncludeBody: clientHeight - top,
  }
}

export function getPadding(el: HTMLElement) {
  const style = window.getComputedStyle(el, null)
  const paddingLeft = Number.parseInt(style.paddingLeft, 10) || 0
  const paddingRight = Number.parseInt(style.paddingRight, 10) || 0
  const paddingTop = Number.parseInt(style.paddingTop, 10) || 0
  const paddingBottom = Number.parseInt(style.paddingBottom, 10) || 0
  return {
    left: paddingLeft,
    right: paddingRight,
    top: paddingTop,
    bottom: paddingBottom,
  }
}

export function getEventTargetNode(event: Event, container: Element, queryCls?: string) {
  let targetElem: Element | undefined
  let target = event.target as Element | null

  while (target && target.nodeType && target !== document) {
    if (queryCls && hasClass(target, queryCls)) {
      targetElem = target
    } else if (target === container) {
      return {
        flag: queryCls ? !!targetElem : true,
        container,
        targetElem: targetElem
      }
    }

    target = target.parentNode as Element | null
  }

  return { flag: false }
}

export function addUnit(value: string | number | undefined, defaultUnit = 'px') {
  if (!value) return ''
  if (isNumber(value) || isStringNumber(value)) {
    return `${value}${defaultUnit}`
  } else if (isString(value)) {
    return value
  }
}

export const { width: windowWidth, height: windowHeight } = useWindowSize()
