import { computed } from 'vue'
import { officeDetailStore } from 'src/store/OfficeDetailStore'
import { OfficeDto } from 'src/api/model/OfficeDto'

export function useOfficeDetailMixin() {
  const office = computed({
    get(): OfficeDto | null {
      return officeDetailStore.office
    },
    set(office: OfficeDto | null) {
      officeDetailStore.office = office
    }
  })

  return { office }
}
