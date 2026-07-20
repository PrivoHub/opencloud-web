import { filesize } from 'filesize'
import { getLocaleFromLanguage } from './locale'

const mb = 1048576

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
    // PrivoHub: IEC units (KiB/MiB/GiB) rather than upstream's decimal base 10.
    // Storage quota is enforced by a ZFS refquota, which is binary, so decimal
    // formatting made the displayed usage disagree with the enforced cap by ~10%.
    base: 2,
    output: 'string'
  })
}
