<script setup lang="ts">
import { EventDto } from 'src/api/model/EventDto'
import { useEventTypes } from 'src/api/model/EventTypes'
import { useDateFormat } from 'src/utils/dateFormat'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import Share from '../Share.vue'

interface Props {
  event: EventDto
}
interface Emits {
  (e: 'clickQrCode', value: boolean): void
}
const props = defineProps<Props>()
const emits = defineEmits<Emits>()

function onClickQrCode(showQr: boolean): void {
  emits('clickQrCode', showQr)
}

const $router = useRouter()
const { t } = useI18n()
const { eventTypeOptions } = useEventTypes()
const { dateFormat } = useDateFormat()

const eventTypeLabel = computed(() => {
  return eventTypeOptions.find(({ key }) => key === props.event.event_type)
    ?.label
})

const shareUrl = computed(() => {
  const shareUrl = process.env.APP_SHARE_URL as string
  return (
    shareUrl +
    $router.resolve({
      name: 'event-detail',
      params: {
        eventId: props.event.id
      }
    }).path
  )
})
const shareTitle = computed(() => {
  return props.event.name
})
const shareDescription = computed(() => {
  if (props.event.description) {
    return `\n\n${props.event.description}`
  } else {
    return ''
  }
})
const shareText = computed(() => {
  const formattedDate = dateFormat(props.event.start_date, 'date')
  const formattedTime = dateFormat(props.event.start_date, 'time')
  return t('events.details.actions.share.shareText', {
    eventName: props.event.name,
    eventType: eventTypeLabel.value,
    eventDescription: shareDescription.value,
    eventDate: formattedDate,
    eventTime: formattedTime
  })
})
</script>
<template>
  <Share
    :title="shareTitle"
    :text="shareText"
    :url="shareUrl"
    @click-qr-code="onClickQrCode"
  />
</template>
