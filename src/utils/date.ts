// @ts-ignore
import lang from 'quasar/src/lang'

interface LocaleOptions {
  days?: string[]
  daysShort?: string[]
  months?: string[]
  monthsShort?: string[]
  pluralDay?: string
  firstDayOfWeek: number
  format24h: boolean
}

interface RegexData {
  map: Record<string, number>
  regex: RegExp
}

const regexCache: Record<string, any> = {}
const reverseToken =
  /(\[[^\]]*\])|d{1,4}|M{1,4}|m{1,2}|w{1,2}|Qo|Do|D{1,4}|YY(?:YY)?|H{1,2}|h{1,2}|s{1,2}|S{1,3}|Z{1,2}|a{1,2}|[AQExX]|([.*+:?^,\s${}()|\\]+)/g

/**
 * Near-to copy of quasar's getRegexData function
 * @param mask
 * @param dateLocale
 */
function getRegexData(mask: string, dateLocale: LocaleOptions): RegexData {
  const days = '(' + (dateLocale.days?.join('|') ?? '') + ')',
    key = mask + days

  if (regexCache[key] !== void 0) {
    return regexCache[key]
  }

  const daysShort = '(' + (dateLocale.daysShort?.join('|') ?? '') + ')',
    months = '(' + (dateLocale.months?.join('|') ?? '') + ')',
    monthsShort = '(' + (dateLocale.monthsShort?.join('|') ?? '') + ')'

  const map: Record<string, any> = {}
  let index = 0

  const regexText = mask.replace(reverseToken, (match) => {
    index++
    switch (match) {
      case 'YY':
        map.YY = index
        return '(-?\\d{1,2})'
      case 'YYYY':
        map.YYYY = index
        return '(-?\\d{1,4})'
      case 'M':
        map.M = index
        return '(\\d{1,2})'
      case 'MM':
        map.M = index // bumping to M
        return '(\\d{2})'
      case 'MMM':
        map.MMM = index
        return monthsShort
      case 'MMMM':
        map.MMMM = index
        return months
      case 'D':
        map.D = index
        return '(\\d{1,2})'
      case 'Do':
        map.D = index++ // bumping to D
        return '(\\d{1,2}(st|nd|rd|th))'
      case 'DD':
        map.D = index // bumping to D
        return '(\\d{2})'
      case 'H':
        map.H = index
        return '(\\d{1,2})'
      case 'HH':
        map.H = index // bumping to H
        return '(\\d{2})'
      case 'h':
        map.h = index
        return '(\\d{1,2})'
      case 'hh':
        map.h = index // bumping to h
        return '(\\d{2})'
      case 'm':
        map.m = index
        return '(\\d{1,2})'
      case 'mm':
        map.m = index // bumping to m
        return '(\\d{2})'
      case 's':
        map.s = index
        return '(\\d{1,2})'
      case 'ss':
        map.s = index // bumping to s
        return '(\\d{2})'
      case 'S':
        map.S = index
        return '(\\d{1})'
      case 'SS':
        map.S = index // bump to S
        return '(\\d{2})'
      case 'SSS':
        map.S = index // bump to S
        return '(\\d{3})'
      case 'A':
        map.A = index
        return '(AM|PM)'
      case 'a':
        map.a = index
        return '(am|pm)'
      case 'aa':
        map.aa = index
        return '(a\\.m\\.|p\\.m\\.)'

      case 'ddd':
        return daysShort
      case 'dddd':
        return days
      case 'Q':
      case 'd':
      case 'E':
        return '(\\d{1})'
      case 'Qo':
        return '(1st|2nd|3rd|4th)'
      case 'DDD':
      case 'DDDD':
        return '(\\d{1,3})'
      case 'w':
        return '(\\d{1,2})'
      case 'ww':
        return '(\\d{2})'

      case 'Z': // to split: (?:(Z)()()|([+-])?(\\d{2}):?(\\d{2}))
        map.Z = index
        return '(Z|[+-]\\d{2}:\\d{2})'
      case 'ZZ':
        map.ZZ = index
        return '(Z|[+-]\\d{2}\\d{2})'

      case 'X':
        map.X = index
        return '(-?\\d+)'
      case 'x':
        map.x = index
        return '(-?\\d{4,})'

      default:
        index--
        if (match[0] === '[') {
          match = match.substring(1, match.length - 1)
        }
        return match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }
  })

  const res = { map, regex: new RegExp('^' + regexText) }
  regexCache[key] = res

  return res
}

export function dateMaskMatches(
  dateString: string,
  mask: string,
  dateLocale?: LocaleOptions
) {
  const { regex } = getRegexData(mask, dateLocale ?? lang.props.date)
  return regex.exec(dateString) !== null
}
