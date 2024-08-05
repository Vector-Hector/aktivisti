<script setup lang="ts">
import { computed } from 'vue'
import { Capacitor } from '@capacitor/core'
import { Share } from '@capacitor/share'
import {
  ionLogoFacebook,
  ionLogoTwitter,
  ionLogoWhatsapp,
  ionMail,
  ionShareSocial
} from '@quasar/extras/ionicons-v5'
import { QFab, QFabAction } from 'quasar'
import LabeledBtn from 'components/LabeledBtn.vue'
import {
  FACEBOOK_SHARE_URL,
  MAIL_SHARE_URL,
  TWITTER_SHARE_URL,
  WHATSAPP_SHARE_URL
} from 'src/constants'
import { appendAsQueryParams } from 'src/utils/url'

interface Props {
  title: string
  text: string
  url: string
  dialogTitle?: string
}

const props = defineProps<Props>()

const shareApiAvailable = computed(() => {
  // Capacitor plugin works with either the web share API or uses the native one
  return !!navigator.share || Capacitor.getPlatform() !== 'web'
})
const twitterShareUrl = computed(() => {
  const url = new URL(TWITTER_SHARE_URL)
  appendAsQueryParams(url, {
    text: props.text,
    url: props.url
  })
  return url.toString()
})
const facebookShareUrl = computed(() => {
  const url = new URL(FACEBOOK_SHARE_URL)
  appendAsQueryParams(url, {
    u: props.url
  })
  return url.toString()
})
const urlTextSnippet = computed(() => {
  return `\nMitmachen:\n${props.url}`
})
const mailShareUrl = computed(() => {
  const subjectLine = `Mach\' mit bei der Aktion von Die Linke: ${props.title}`
  return `${MAIL_SHARE_URL}?subject=${subjectLine}&body=${encodeURIComponent(
    `${props.text}${urlTextSnippet.value}`
  )}`
})
const whatsappShareUrl = computed(() => {
  const url = new URL(WHATSAPP_SHARE_URL)
  appendAsQueryParams(url, {
    text: `${props.text}${urlTextSnippet.value}`
  })
  return url.toString()
})

function navigate(url: string) {
  window.open(url, '_blank')
}
function share() {
  void Share.share({
    title: props.title,
    text: props.text,
    url: props.url,
    dialogTitle: props.dialogTitle
  })
}
</script>

<template>
  <LabeledBtn
    v-if="shareApiAvailable"
    @click="share"
    :icon="ionShareSocial"
    outline
    round
    external-label="Teilen"
  />
  <LabeledBtn v-else external-label="Teilen">
    <template v-slot:btn>
      <QFab outline round :icon="ionShareSocial" padding="sm" direction="left">
        <QFabAction
          class="share-fab"
          :icon="ionLogoTwitter"
          @click="navigate(twitterShareUrl)"
        />
        <QFabAction
          class="share-fab"
          :icon="ionLogoWhatsapp"
          @click="navigate(whatsappShareUrl)"
        />
        <QFabAction
          class="share-fab"
          :icon="ionLogoFacebook"
          @click="navigate(facebookShareUrl)"
        />
        <QFabAction
          class="share-fab"
          :icon="ionMail"
          @click="navigate(mailShareUrl)"
        />
      </QFab>
    </template>
  </LabeledBtn>
</template>
<style lang="scss" scoped>
.share-fab {
  background: white;
}
</style>
