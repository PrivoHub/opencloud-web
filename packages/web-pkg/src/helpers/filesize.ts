import { filesize } from 'filesize'
import { getLocaleFromLanguage } from './locale'

const mb = 1000000

// Returns formatted size
export const formatFileSize = (size: number | string, currentLanguage: string) => {
  const parsedSize = typeof size === 'string' ? parseInt(size) : size
  if (parsedSize < 0) {
    return '--'
  }

  if (isNaN(parsedSize)) {
    return '?'
  }

  return filesize(parsedSize, {
    round: parsedSize < mb ? 0 : 1,
    locale: getLocaleFromLanguage(currentLanguage),
    // Decimal units (kB/MB/GB), same as upstream: storage sizes are quoted and
    // enforced in powers of 1000, so displayed usage matches the quota.
    base: 10,
    output: 'string'
  })
}
