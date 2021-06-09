import { appendAsQueryParams } from 'src/utils/url'
import { FACEBOOK_SHARE_URL, MAIL_SHARE_URL, TWITTER_SHARE_URL, WHATSAPP_SHARE_URL } from 'src/constants'
import { EventDto } from 'src/api/model/EventDto'

function makeShareText(event: EventDto, link: string, withLink = true) {
  const formattedDate = new Date(event.start_date).toLocaleString([], {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  return `${event.name}\n${formattedDate}\n${withLink ? link : ''}`
}

export function createTwitterShareUrl(linkedUrl: string, tags: string[], event: EventDto): string {
  const url = new URL(TWITTER_SHARE_URL)
  const text = makeShareText(event, linkedUrl, false)
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
    u: linkedUrl
  })
  return url.toString()
}

export function createWhatsappShareUrl(linkedUrl: string, event: EventDto): string {
  const url = new URL(WHATSAPP_SHARE_URL)
  const text = makeShareText(event, linkedUrl)
  appendAsQueryParams(url, {
    text: text
  })
  return url.toString()
}


export function createMailShareUrl(linkedUrl: string, event: EventDto): string {
  const subjectLine = 'Mach\' mit bei der Aktion von DIE LINKE'
  const text = makeShareText(event, linkedUrl, true)
  return `${MAIL_SHARE_URL}?subject=${subjectLine}&body=${encodeURIComponent(text)}`
}
