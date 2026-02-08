export function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false
  const counter = new Map<T, number>()
  for (const value of a) {
    counter.set(value, (counter.get(value) || 0) + 1)
  }
  for (const value of b) {
    const count = counter.get(value)
    if (count === undefined || count === 0) {
      return false
    }
    counter.set(value, count - 1)
  }
  return true
}

export function diff<T extends object>(obj1: T, obj2: T): Partial<T> | undefined {
  function findDifferences(o1: any, o2: any): any {
    if (Array.isArray(o1) && Array.isArray(o2)) {
      if (!arraysEqual(o1, o2)) {
        return o2
      }
      return undefined
    }

    if (
      typeof o1 === 'object' &&
      typeof o2 === 'object' &&
      o1 !== null &&
      o2 !== null
    ) {
      const diffResult: any = {}

      const keys = new Set([...Object.keys(o1), ...Object.keys(o2)])
      keys.forEach((key) => {
        const valueDiff = findDifferences(o1[key], o2[key])
        if (valueDiff !== undefined) {
          diffResult[key] = valueDiff
        }
      })

      return Object.keys(diffResult).length > 0 ? diffResult : undefined
    }

    return o1 === o2 ? undefined : o2
  }

  return findDifferences(obj1, obj2)
}
