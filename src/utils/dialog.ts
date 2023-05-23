import type { QVueGlobals } from 'quasar';
import { apiClient } from 'src/api/ApiClient';
import type { EventDto } from 'src/api/model/EventDto';

export async function openDeleteDialog($q: QVueGlobals, event: EventDto): Promise<void> {
  return new Promise((resolve) => {
    $q.dialog({
        title: `${event.name} wirklich löschen?`,
        message: `Das Event <b>"${event.name}"</b> wird gelöscht und kann nicht wiederhergestellt werden.`,
        html: true,
        cancel: true
    }).onOk(() => {
      apiClient.events.delete(event.id.toString())
        .then(() => resolve())
        .catch((error) => {
          $q.notify({
            color: 'negative',
            message: 'Die Aktion konnte nicht gelöscht werden.'
          })
          throw error
        })
    })
  })
}
