import { defineComponent } from 'vue'
import { Pagination } from 'src/api/model/APIEnvelope'
import { OfficeFilterParams } from 'src/api/params/OfficeFilterParams'
import { OfficeDto } from 'src/api/model/OfficeDto'
import { officeOverviewStore } from 'src/store/OfficeOverviewStore'
import { distinctBy } from 'src/utils/array'

export default defineComponent({
  name: 'OfficeOverviewMixin',
  computed: {
    offices: {
      get() {
        return officeOverviewStore.offices
      },
      set(offices: OfficeDto[]) {
        officeOverviewStore.offices = offices
      }
    },
    filterParams: {
      get() {
        return officeOverviewStore.filterParams
      },
      set(filterParams: OfficeFilterParams) {
        officeOverviewStore.filterParams = filterParams
      }
    },
    pagination: {
      get() {
        return officeOverviewStore.pagination
      },
      set(pagination: Pagination) {
        officeOverviewStore.pagination = pagination
      }
    },
    officeHoveredOver: {
      get() {
        return officeOverviewStore.officeHoveredOver
      },
      set(office: OfficeDto) {
        officeOverviewStore.officeHoveredOver = office
      }

    }
  },
  methods: {
    async updateFilterParams(params: OfficeFilterParams) {
      this.filterParams = {
        ...this.filterParams,
        ...params
      }
      const {
        data: offices,
        pagination
      } = (await this.$apiClient.offices.list({...this.filterParams, ...this.pagination, offset: 0})).payload
      this.pagination = pagination!
      this.offices = offices
    },
    async fetchMoreOffices() {
      const {
        data: offices,
        pagination
      } = (await this.$apiClient.offices.list({
        ...this.filterParams, ...this.pagination,
        offset: (this.offices?.length ?? 0)
      })).payload
      this.offices = distinctBy(this.offices.concat(offices), (office) => office.id)
      this.pagination = pagination!
    }
  }
})
