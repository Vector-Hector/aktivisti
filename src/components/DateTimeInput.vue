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
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { date, QBtn, QDate, QIcon, QInput, QPopupProxy, QTime } from 'quasar'
import { ionCalendarOutline, ionTimeOutline } from '@quasar/extras/ionicons-v5'

export default defineComponent({
  name: 'DateTimeInput',
  props: {
    modelValue: {
      type: String as PropType<string>,
      required: true
    },
    mask: {
      type: String as PropType<string>,
      default: 'DD.MM.YYYY HH:mm'
    },
    inputProps: {
      type: Object as PropType<typeof QInput.$props>
    },
    dateProps: {
      type: Object as PropType<typeof QDate.$props>
    },
    timeProps: {
      type: Object as PropType<typeof QTime.$props>
    }
  },
  emits: ['update:modelValue'],
  components: {
    QIcon,
    QDate,
    QTime,
    QPopupProxy,
    QInput,
    QBtn
  },
  computed: {
    dateValid(): boolean {
      return date.isValid(this.modelValue)
    },
    dateTime: {
      get(): string {
        return this.modelValue
      },
      set(value: string) {
        this.$emit('update:modelValue', value)
      }
    },
    passthroughProps(): any {
      return {
        ...this.$props,
        modelValue: undefined,
        mask: undefined
      }
    }
  },
  data() {
    return {
      ionCalendarOutline,
      ionTimeOutline
    }
  }
})
</script>
