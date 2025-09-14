import { useQuasar } from 'quasar'
import { apiClient } from 'src/api/ApiClient'
import type { EventDto } from 'src/api/model/EventDto'
import { useI18n } from 'vue-i18n'

export function useDeleteEventDialog() {
  const { t } = useI18n()
  const $q = useQuasar()

  async function openDeleteEventDialog(event: EventDto): Promise<void> {
    return new Promise((resolve) => {
      $q.dialog({
        title: t('eventDeleteDialog.title', [event.name]),
        message: t('eventDeleteDialog.description', [`<b>"${event.name}"</b>`]),
        html: true,
        cancel: true
      }).onOk(() => {
        apiClient.events
          .delete(event.id.toString())
          .then(() => resolve())
          .catch((error) => {
            $q.notify({
              color: 'negative',
              message: t('eventDeleteDialog.generalError')
            })
            throw error
          })
      })
    })
  }
  return {
    openDeleteEventDialog
  }
}
