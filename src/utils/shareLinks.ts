import { appendAsQueryParams } from 'src/utils/url'
import { FACEBOOK_SHARE_URL, MAIL_SHARE_URL, TWITTER_SHARE_URL, WHATSAPP_SHARE_URL } from 'src/constants'


export function createTwitterShareUrl(text: string, linkedUrl: string, tags: string[]): string {
  const url = new URL(TWITTER_SHARE_URL)
  appendAsQueryParams(url, {
    text,
    url: linkedUrl,
    tags
  })
  return url.toString()
}

export function createFacebookShareUrl(linkedUrl: string): string {
  const url = new URL(FACEBOOK_SHARE_URL)
  appendAsQueryParams(url, {
    u: linkedUrl,
  })
  return url.toString()
}

export function createWhatsappShareUrl(linkedUrl: string): string {
  const url = new URL(WHATSAPP_SHARE_URL)
  appendAsQueryParams(url, {
    text: linkedUrl,
  })
  return url.toString()
}


export function createMailShareUrl(linkedUrl: string): string {
  const subjectLine = 'Mach\' mit bei der Aktion von DIE LINKE'
  return `${MAIL_SHARE_URL}?subject=${subjectLine}&body=${linkedUrl}`
}
