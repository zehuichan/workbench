interface TreeHelperConfig {
  id: string
  children: string
  pid: string
}

// 默认配置
const DEFAULT_CONFIG: TreeHelperConfig = {
  id: 'id',
  children: 'children',
  pid: 'pid'
}

// 获取配置。  Object.assign 从一个或多个源对象复制到目标对象
const getConfig = (config: Partial<TreeHelperConfig>): TreeHelperConfig => Object.assign({}, DEFAULT_CONFIG, config)

// tree from list
// 列表中的树
export function listToTree<T = any>(list: any[], config: Partial<TreeHelperConfig> = {}): T[] {
  const conf = getConfig(config)
  const nodeMap = new Map()
  const result: T[] = []
  const { id, children, pid } = conf

  for (const node of list) {
    node[children] = node[children] || []
    nodeMap.set(node[id], node)
  }
  for (const node of list) {
    const parent = nodeMap.get(node[pid])
    ;(parent ? parent[children] : result).push(node)
  }
  return result
}

export function treeToList<T = any>(tree: any[], config: Partial<TreeHelperConfig> = {}): T[] {
  const conf = getConfig(config)
  const { children } = conf
  const result = [...tree]
  for (let i = 0; i < result.length; i++) {
    if (!result[i][children]) continue
    result.splice(i + 1, 0, ...result[i][children])
  }
  return result
}

export function findNode<T = any>(tree: any[], func: (n: T) => boolean, config: Partial<TreeHelperConfig> = {}): T | null {
  const conf = getConfig(config)
  const { children } = conf
  const list = [...tree]
  for (const node of list) {
    if (func(node)) return node
    node[children] && list.push(...node[children])
  }
  return null
}

export function findNodeAll<T = any>(tree: any[], func: (n: T) => boolean, config: Partial<TreeHelperConfig> = {}): T[] {
  const conf = getConfig(config)
  const { children } = conf
  const list = [...tree]
  const result: T[] = []
  for (const node of list) {
    func(node) && result.push(node)
    node[children] && list.push(...node[children])
  }
  return result
}

export function findPath<T = any>(tree: any[], func: (n: T) => boolean, config: Partial<TreeHelperConfig> = {}): T[] | null {
  const conf = getConfig(config)
  const path: T[] = []
  const list = [...tree]
  const visitedSet = new Set()
  const { children } = conf
  while (list.length) {
    const node = list[0]
    if (visitedSet.has(node)) {
      path.pop()
      list.shift()
    } else {
      visitedSet.add(node)
      node[children] && list.unshift(...node[children])
      path.push(node)
      if (func(node)) {
        return path
      }
    }
  }
  return null
}

export function findPathAll<T = any>(tree: any[], func: (n: T) => boolean, config: Partial<TreeHelperConfig> = {}): T[][] {
  const conf = getConfig(config)
  const path: T[] = []
  const list = [...tree]
  const result: T[][] = []
  const visitedSet = new Set()
  const { children } = conf
  while (list.length) {
    const node = list[0]
    if (visitedSet.has(node)) {
      path.pop()
      list.shift()
    } else {
      visitedSet.add(node)
      node[children] && list.unshift(...node[children])
      path.push(node)
      func(node) && result.push([...path])
    }
  }
  return result
}

export function filter<T = any>(tree: any[], func: (n: T) => boolean, config: Partial<TreeHelperConfig> = {}): T[] {
  // 获取配置
  const conf = getConfig(config)
  const { children } = conf

  function listFilter(list: any[]): T[] {
    return list
      .map((node) => ({ ...node }))
      .filter((node) => {
        // 递归调用 对含有children项  进行再次调用自身函数 listFilter
        node[children] = node[children] && listFilter(node[children])
        // 执行传入的回调 func 进行过滤
        return func(node) || (node[children] && node[children].length)
      })
  }

  return listFilter(tree)
}

export function forEach<T = any>(tree: any[], func: (n: T) => any, config: Partial<TreeHelperConfig> = {}): void {
  const conf = getConfig(config)
  const list = [...tree]
  const { children } = conf
  for (let i = 0; i < list.length; i++) {
    //func 返回true就终止遍历，避免大量节点场景下无意义循环，引起浏览器卡顿
    if (func(list[i])) {
      return
    }
    children && list[i][children] && list.splice(i + 1, 0, ...list[i][children])
  }
}

/**
 * @description: Extract tree specified structure
 * @description: 提取树指定结构
 */
export function treeMap<T = any, R = any>(treeData: T[], opt: { children?: string; conversion: (n: T) => R }): R[] {
  return treeData.map((item) => treeMapEach(item, opt))
}

/**
 * @description: Extract tree specified structure
 * @description: 提取树指定结构
 */
export function treeMapEach<T = any, R = any>(data: T, { children = 'children', conversion }: { children?: string; conversion: (n: T) => R }): R {
  const haveChildren =
    Array.isArray((data as any)[children]) && (data as any)[children].length > 0
  const conversionData = conversion(data) || {}
  if (haveChildren) {
    return {
      ...conversionData,
      [children]: (data as any)[children].map((i: any) =>
        treeMapEach(i, {
          children,
          conversion
        })
      )
    } as any
  } else {
    return {
      ...conversionData
    } as any
  }
}

/**
 * 递归遍历树结构
 * @param treeDatas 树
 * @param callBack 回调
 * @param parentNode 父节点
 */
export function eachTree<T = any>(treeDatas: T[], callBack: (n: T, parent: T) => T | void, parentNode: T = {} as T) {
  treeDatas.forEach((element) => {
    const newNode = callBack(element, parentNode) || element
    if ((element as any).children) {
      eachTree((element as any).children, callBack, newNode as T)
    }
  })
}

/**
 * 遍历树形结构，并返回所有节点中指定的值。
 * @param tree 树形结构数组
 * @param getValue 获取节点值的函数
 * @param options 作为子节点数组的可选属性名称。
 * @returns 所有节点中指定的值的数组
 */
export function traverseTreeValues<T = any, V = any>(tree: T[], getValue: (n: T) => V, options?: { childProps: string }): V[] {
  const result: V[] = []

  const { childProps } = options || {
    childProps: 'children',
  }

  const dfs = (treeNode: T) => {
    const value = getValue(treeNode)
    result.push(value)
    const children = (treeNode as any)?.[childProps]
    if (!children) {
      return
    }
    if (children.length > 0) {
      for (const child of children) {
        dfs(child)
      }
    }
  }

  for (const treeNode of tree) {
    dfs(treeNode)
  }
  return result.filter(Boolean)
}

/**
 * 根据条件重新映射给定树结构的节
 * @param tree 要过滤的树结构的根节点数组。
 * @param mapper 用于map每个节点的条件。
 * @param options 作为子节点数组的可选属性名称。
 */
export function mapTree<T = any>(tree: T[], mapper: (n: T) => T, options?: { childProps: string }): T[] {
  const { childProps } = options || {
    childProps: 'children',
  }
  return tree.map((node) => {
    const mapperNode = mapper(node)
    if ((mapperNode as any)[childProps]) {
      (mapperNode as any)[childProps] = mapTree((mapperNode as any)[childProps], mapper, options)
    }
    return mapperNode
  })
}


/**
 * 根据条件过滤给定树结构的节点，并以原有顺序返回所有匹配节点的数组。
 * @param tree 要过滤的树结构的根节点数组。
 * @param filter 用于匹配每个节点的条件。
 * @param options 作为子节点数组的可选属性名称。
 * @returns array 包含所有匹配节点的数组。
 */
export function filterTree<T = any>(tree: T[], filter: (n: T) => boolean, options?: { childProps: string }): T[] {
  const { childProps } = options || {
    childProps: 'children',
  }

  const _filterTree = (nodes: T[]): T[] => {
    return nodes.filter((node) => {
      if (filter(node)) {
        if ((node as any)[childProps]) {
          (node as any)[childProps] = _filterTree((node as any)[childProps])
        }
        return true
      }
      return false
    })
  }

  return _filterTree(tree)
}
