<script setup lang="ts">
import { EventDto } from 'src/api/model/EventDto'
import { useEventTypes } from 'src/api/model/EventTypes'
import { useDateFormat } from 'src/utils/dateFormat'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Share from '../Share.vue'
import { getShareUrl } from 'src/utils/shareUrl'

interface Props {
  event: EventDto
}

const props = defineProps<Props>()

const { t } = useI18n()
const { eventTypeOptions } = useEventTypes()
const { dateFormat } = useDateFormat()

const eventTypeLabel = computed(() => {
  return eventTypeOptions.find(({ key }) => key === props.event.event_type)
    ?.label
})

const shareUrl = getShareUrl(props.event.id)
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
  <Share :title="shareTitle" :text="shareText" :url="shareUrl" />
</template>
