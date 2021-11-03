import { defineComponent } from 'vue'
import { officeDetailStore } from 'src/store/OfficeDetailStore'
import { OfficeDto } from 'src/api/model/OfficeDto'

export default defineComponent({
  name: 'OfficeDetailMixin',
  computed: {
    office: {
      get() {
        return officeDetailStore.office
      },
      set(office: OfficeDto) {
        officeDetailStore.office = office
      }
    }
  }
})
