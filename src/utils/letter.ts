/**
 * Capitalize the first letter of a string
 * @param string
 */
export function capitalizeFirstLetter(string: string): string {
  if (!string) return ''
  return string.charAt(0).toUpperCase() + string.slice(1)
}

/**
 * Convert the first letter of a string to lowercase.
 *
 * @param str The string to convert
 * @returns The string with the first letter in lowercase
 */
export function toLowerCaseFirstLetter(str: string): string {
  if (!str) return str // Return if the string is empty
  return str.charAt(0).toLowerCase() + str.slice(1)
}

/**
 * Generate camelCase key name
 * @param key
 * @param parentKey
 */
export function toCamelCase(key: string, parentKey?: string): string {
  if (!parentKey) {
    return key
  }
  return parentKey + key.charAt(0).toUpperCase() + key.slice(1)
}

export function kebabToCamelCase(str: string): string {
  return str
    .split('-')
    .filter(Boolean)
    .map((word, index) =>
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join('')
}
