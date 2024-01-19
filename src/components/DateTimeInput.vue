<script setup lang="ts">
import { computed } from 'vue'
import { date, QBtn, QDate, QIcon, QInput, QPopupProxy, QTime } from 'quasar'
import { ionCalendarOutline, ionTimeOutline } from '@quasar/extras/ionicons-v5'

interface Props {
  modelValue: string
  mask?: string
  inputProps?: typeof QInput.$props
  dateProps?: typeof QDate.$props
  timeProps?: typeof QTime.$props
}
const props = withDefaults(defineProps<Props>(), {
  mask: 'DD.MM.YYYY HH:mm'
})

interface Emits {
  (e: 'update:modelValue', datetime: string): void
}
const emit = defineEmits<Emits>()

const dateValid = computed(() => date.isValid(props.modelValue))
const dateTime = computed({
  get(): string {
    return props.modelValue
  },
  set(value: string) {
    emit('update:modelValue', value)
  }
})
const passthroughProps = computed(() => {
  return {
    ...props,
    modelValue: undefined,
    mask: undefined
  }
})
</script>

<template>
  <QInput v-bind="inputProps" v-model="dateTime">
    <template v-slot:prepend>
      <QIcon :name="ionCalendarOutline" class="cursor-pointer" />
      <QPopupProxy transition-show="scale" transition-hide="scale">
        <QDate v-bind="dateProps" v-model="dateTime" :mask="mask">
          <div class="row items-center justify-end">
            <QBtn v-close-popup label="Close" color="primary" flat />
          </div>
        </QDate>
      </QPopupProxy>
    </template>

    <template v-slot:append>
      <QIcon :name="ionTimeOutline" class="cursor-pointer" />
      <QPopupProxy transition-show="scale" transition-hide="scale">
        <QTime v-bind="timeProps" v-model="dateTime" :mask="mask" format24h>
          <div class="row items-center justify-end">
            <QBtn v-close-popup label="Close" color="primary" flat />
          </div>
        </QTime>
      </QPopupProxy>
    </template>
  </QInput>
</template>
