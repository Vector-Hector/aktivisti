<template>
  <QInput :type="isPasswordVisible ? 'text' : 'password'" v-bind="$props">
    <template v-slot:append>
      <QIcon
        :name="isPasswordVisible ? ionEyeOffOutline : ionEyeOutline"
        class="cursor-pointer"
        @click="isPasswordVisible = !isPasswordVisible"
      />
    </template>
  </QInput>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { QIcon, QInput } from 'quasar'
import { ionEyeOffOutline, ionEyeOutline } from '@quasar/extras/ionicons-v5'

export default defineComponent({
  name: 'PasswordInput',
  components: {
    QInput,
    QIcon
  },
  data() {
    return {
      isPasswordVisible: false,
      ionEyeOutline,
      ionEyeOffOutline
    }
  }
})
</script>
