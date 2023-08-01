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
<script lang="ts">
import { defineComponent, PropType } from 'vue'
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

export default defineComponent({
  name: 'Share',
  components: {
    LabeledBtn,
    QFab,
    QFabAction
  },
  props: {
    title: {
      type: String as PropType<string>,
      required: false
    },
    text: {
      type: String as PropType<string>,
      required: false
    },
    url: {
      type: String as PropType<string>,
      required: false
    },
    dialogTitle: {
      type: String as PropType<string>,
      required: false
    }
  },
  data() {
    return {
      ionLogoTwitter,
      ionLogoFacebook,
      ionMail,
      ionLogoWhatsapp,
      ionShareSocial
    }
  },
  computed: {
    shareApiAvailable() {
      // Capacitor plugin works with either the web share API or uses the native one
      return !!navigator.share || Capacitor.getPlatform() !== 'web'
    },
    twitterShareUrl(): string {
      const url = new URL(TWITTER_SHARE_URL)
      appendAsQueryParams(url, {
        text: this.text,
        url: this.url
      })
      return url.toString()
    },
    facebookShareUrl(): string {
      const url = new URL(FACEBOOK_SHARE_URL)
      appendAsQueryParams(url, {
        u: this.url
      })
      return url.toString()
    },
    urlTextSnippet() {
      return `\nMitmachen:\n${this.url}`
    },
    mailShareUrl(): string {
      const subjectLine = `Mach\' mit bei der Aktion von DIE LINKE: ${this.title}`
      return `${MAIL_SHARE_URL}?subject=${subjectLine}&body=${
        encodeURIComponent(`${this.text}${this.urlTextSnippet}`)
      }`
    },
    whatsappShareUrl(): string {
      const url = new URL(WHATSAPP_SHARE_URL)
      appendAsQueryParams(url, {
        text: `${this.text}${this.urlTextSnippet}`
      })
      return url.toString()
    }
  },
  methods: {
    navigate(url: string) {
      window.open(url, '_blank')
    },
    share() {
      void Share.share({
        title: this.title,
        text: this.text,
        url: this.url,
        dialogTitle: this.dialogTitle
      })
    }
  }
})

}
</script>
<style lang="scss" scoped>
.share-fab {
  background: white;
}
</style>
