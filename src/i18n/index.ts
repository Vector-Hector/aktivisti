import enUS from './en-US.json'
import de from './de.json'
import { DateTimeFormat } from '@intlify/core-base'

export default {
  'en-US': enUS,
  de: de
}
export const datetimeFormats = {
  'en-US': enUS.config.datetimeFormats as DateTimeFormat,
  de: de.config.datetimeFormats as DateTimeFormat
}
