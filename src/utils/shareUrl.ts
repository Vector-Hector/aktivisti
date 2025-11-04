import { useRouter } from 'vue-router'

export function getShareUrlFromEventId(eventId: string | number): string {
  const router = useRouter()
  const shareUrl = process.env.APP_SHARE_URL as string
  return (
    shareUrl +
    router.resolve({
      name: 'event-detail',
      params: {
        eventId: eventId
      }
    }).path
  )
}
