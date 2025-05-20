<script setup lang="ts">
import { QPage, QScrollArea } from 'quasar'
</script>

<template>
  <QScrollArea class="flex flex-fill">
    <QPage>
      <div class="container">
        <br />
        <br />
        <h2>{{ $t('imprint.ownerHeading') }}</h2>
        <p>
          {{ $t('imprint.ownerName') }}<br />
          {{ $t('imprint.ownerAddress') }}<br />
          {{
            `${$t('imprint.ownerPhoneLabel')}: ${$t('imprint.ownerPhoneNumber')}`
          }}<br />
          <a :href="`mailto:${$t('imprint.ownerEmail')}`" class="text-link">
            {{ $t('imprint.ownerEmail') }}</a
          ><br />
        </p>
        <h2>{{ $t('imprint.techHeading') }}</h2>
        <p>
          <b>{{ $t('imprint.techName') }}</b
          ><br />
          {{ $t('imprint.techAddress') }}<br />
          <a :href="$t('imprint.techWebsite')" target="_blank">{{
            $t('imprint.techWebsite')
          }}</a>
        </p>
        <h2>{{ $t('imprint.hostingHeading') }}</h2>
        <p>
          <b>{{ $t('imprint.hostingName') }}</b
          ><br />
          {{ $t('imprint.hostingAddress') }}<br />
          <a :href="`mailto:${$t('imprint.hostingEmail')}`" class="text-link">{{
            $t('imprint.hostingEmail')
          }}</a
          ><br />
          <a :href="$t('imprint.hostingWebsite')" target="_blank">
            {{ $t('imprint.hostingWebsite') }}
          </a>
        </p>
        <h2>{{ $t('imprint.taxHeading') }}</h2>
        <p>
          {{ $t('imprint.taxText') }}
        </p>

        <h2>{{ $t('imprint.privacyHeading') }}</h2>
        <i18n-t keypath="imprint.privacyText.content" tag="p">
          <template #link>
            <a
              :href="$t('imprint.privacyText.linkAddress')"
              target="_blank"
              class="text-link"
            >
              {{ $t('imprint.privacyText.linkLabel') }}
            </a>
          </template>
        </i18n-t>
        <h2>{{ $t('imprint.liabilityHeading') }}</h2>
        <i18n-t keypath="imprint.liabilityText.content" tag="p">
          <template #link>
            <a
              :href="$t('imprint.liabilityText.linkAddress')"
              target="_blank"
              class="text-link"
            >
              {{ $t('imprint.liabilityText.linkLabel') }}
            </a>
          </template>
        </i18n-t>
      </div>
    </QPage>
  </QScrollArea>
</template>

<style lang="scss" scoped>
h2 {
  margin: 0;
  font-size: 1.6rem;
}

.scroll-container {
  flex: 1;
  display: flex;
}
</style>
