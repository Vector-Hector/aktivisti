<!--FIXME(peter) 2023/12/12 The composition API doesn't support `beforeRouteEnter` so far so this a workaround
      see https://github.com/vuejs/rfcs/discussions/302-->
<script lang="ts">
interface IInstance extends ComponentPublicInstance {
  setpreviousBottomSheetState(value: BottomSheetState): void
}
export default {
  beforeRouteEnter(to, from, next) {
    if (
      !userStore.isTeamCaptainOrLocalCoordinator() &&
      !userStore.isAdminOrGlobalCoordinator()
    ) {
      ErrorBus.emit(
        NOT_AUTHORIZED,
        // FIXME(peter) Due to the workaround for the composition API, we need to use a string here for now, but needs to be internationalized in future
        'Um einen Kontakt zu registrieren, benötigst du eine Teamcaptain- oder Koordinator*innen-Berechtigung'
      )
      next({ name: 'login' })
    } else {
      const previousBottomSheetState = uiStore.getState().bottomSheetState
      next((vm) => {
        // @ts-ignore
        ;(vm as IInstance).previousBottomSheetState = previousBottomSheetState
        uiStore.setBottomSheetStateAtLeast(BottomSheetState.EXPANDED)
      })
    }
  }
}
</script>
<script setup lang="ts">
import { ComponentPublicInstance, onMounted, ref } from 'vue'
import { LeadDto } from 'src/api/model/LeadDto'
import {
  QBtn,
  QCheckbox,
  QForm,
  QInput,
  QPage,
  QScrollArea,
  QSelect,
  useQuasar
} from 'quasar'
import FormError from 'components/FormError.vue'
import { ionChevronDown } from '@quasar/extras/ionicons-v5'
import { BottomSheetState, uiStore } from 'src/store/UiStore'
import { userStore } from 'src/store/UserStore'
import { ErrorBus, NOT_AUTHORIZED } from 'src/utils/errorBus'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { apiClient } from 'src/api/ApiClient'
import { useEventDetailStore } from './event-map/detail/EventDetailStoreMixin'
import { SubOrganizationDto } from 'src/api/model/SubOrganizationDto'
import { OrganizationDto } from 'src/api/model/OrganizationDto'
import { useI18n } from 'vue-i18n'

interface Props {
  areaId: string
}
const props = defineProps<Props>()

const $q = useQuasar()
const $router = useRouter()
const { t } = useI18n()
const form = ref<InstanceType<typeof QForm> | null>(null)
const { event } = useEventDetailStore()
const subOrganizations = ref<SubOrganizationDto[]>([])
const suggestedSubOrganizations = ref<SubOrganizationDto[]>([])
const organizations = ref<OrganizationDto[]>([])

const previousBottomSheetState = ref(BottomSheetState.HALF)
const lead = ref<Partial<LeadDto>>({
  wants_to_become_member: false
})
const isSubmitting = ref(false)
const errors = ref<any>({})
const genders = [
  {
    value: 'm',
    label: t('createLead.male')
  },
  {
    value: 'f',
    label: t('createLead.female')
  },
  {
    value: 'o',
    label: t('createLead.divers')
  }
]

onMounted(async () => {
  const subOrgRequest = await apiClient.zetkinSubOrganizations.list({}, [
    'organization'
  ])
  if (event.value && event.value.sub_association) {
    const subOrgOfSubAssociationRequest =
      await apiClient.zetkinSubOrganizations.list({
        sub_association: event.value.sub_association
      })

    lead.value.sub_organization =
      subOrgOfSubAssociationRequest.payload.data[0]?.id
  }

  subOrganizations.value = subOrgRequest.payload.data
  suggestedSubOrganizations.value = subOrganizations.value
  organizations.value = subOrgRequest.payload.embedded.organization
})

onBeforeRouteLeave(() => {
  uiStore.setBottomSheetState(previousBottomSheetState.value)
})

async function saveLead() {
  isSubmitting.value = true
  errors.value = {}
  try {
    await apiClient.leads.create({
      ...lead.value,
      event_area: props.areaId
    })
    $q.notify({
      color: 'positive',
      message: t('createLead.successMessage')
    })
    // TODO: maybe add an explicit back route
    lead.value = {
      wants_to_become_member: false
    }
    form.value?.reset()
    $router.go(-1)
  } catch (error) {
    if (apiClient.isApiClientError(error) && error.response?.status === 400) {
      errors.value = error.response.data
    } else {
      errors.value = {
        non_field_error: [t('createLead.generalError')]
      }
    }
  }
  isSubmitting.value = false
}

function filterSubOrganizations(subOrgTitle: string, update: any) {
  if (!subOrgTitle) {
    update(() => {
      suggestedSubOrganizations.value = subOrganizations.value
    })
    return
  }

  const lowercasedValue = subOrgTitle.toLowerCase()

  update(() => {
    suggestedSubOrganizations.value = subOrganizations.value.filter(
      (subOrg) => {
        const subOrgTitleMatches = subOrg.title
          .toLowerCase()
          .includes(lowercasedValue)
        const organizationTitleMatches = organizations.value
          .find(({ id }) => id === subOrg.organization)
          ?.title.toLowerCase()
          .includes(lowercasedValue)
        return subOrgTitleMatches || organizationTitleMatches
      }
    )
  })
}

function formatSubOrganization(subOrganization: SubOrganizationDto) {
  const titleSubOrg = subOrganization.title
  const titleOrg = organizations.value.find(
    ({ id }) => id === subOrganization.organization
  )?.title

  return `${titleSubOrg} (${titleOrg})`
}

function addMandatorySymbol(string: string) {
  return `${string} *`
}
</script>

<template>
  <QPage class="flex-fill">
    <div class="container create-leads">
      <QScrollArea class="flex-fill d-flex">
        <div class="q-px-md q-pb-md">
          <QForm ref="form" @submit="saveLead">
            <QInput
              :label="addMandatorySymbol($t('createLead.firstName'))"
              v-model="lead.first_name"
              :rules="[$validationRules.isRequired]"
              :error-message="errors.first_name?.[0]"
              :error="!!errors.first_name?.length"
              :required="true"
            />
            <QInput
              :label="addMandatorySymbol($t('createLead.lastName'))"
              v-model="lead.last_name"
              :rules="[$validationRules.isRequired]"
              :error-message="errors.last_name?.[0]"
              :error="!!errors.last_name?.length"
              :required="true"
            />
            <QInput
              :label="addMandatorySymbol($t('createLead.email'))"
              v-model="lead.email"
              :rules="[$validationRules.isRequired, $validationRules.email]"
              :error-message="errors.email?.[0]"
              :error="!!errors.email?.length"
              type="email"
              :required="true"
            />
            <QInput
              :label="$t('createLead.phone')"
              v-model="lead.phone"
              :error-message="errors.phone?.[0]"
              :error="!!errors.phone?.length"
              type="tel"
            />
            <QSelect
              :label="$t('createLead.gender')"
              :dropdownIcon="ionChevronDown"
              v-model="lead.gender"
              emit-value
              :options="genders"
              option-value="value"
              option-label="label"
              :display-value="
                genders.find(({ value }) => value === lead.gender)?.label
              "
              :error-message="errors.gender?.[0]"
              :error="!!errors.gender?.length"
            />
            <QInput
              :label="addMandatorySymbol($t('createLead.zipCode'))"
              v-model="lead.zip_code"
              :minlength="5"
              :maxlength="5"
              :rules="[$validationRules.isRequired]"
              :error-message="errors.zip_code?.[0]"
              :error="!!errors.zip_code?.length"
              :required="true"
            />
            <QInput
              :label="$t('createLead.city')"
              v-model="lead.city"
              :error-message="errors.city?.[0]"
              :error="!!errors.city?.length"
            />
            <QSelect
              :label="addMandatorySymbol($t('createLead.subOrganization'))"
              :dropdownIcon="ionChevronDown"
              v-model="lead.sub_organization"
              :rules="[$validationRules.isRequired]"
              :options="suggestedSubOrganizations"
              option-value="id"
              :option-label="formatSubOrganization"
              emit-value
              map-options
              use-input
              fill-input
              hide-selected
              @filter="filterSubOrganizations"
              :error-message="errors.sub_organization?.[0]"
              :error="!!errors.sub_organization?.length"
              :required="true"
            />
            <QInput
              :label="$t('createLead.note')"
              v-model="lead.note"
              :maxlength="400"
              :error-message="errors.note?.[0]"
              :error="!!errors.note?.length"
              type="textarea"
            />
            <QCheckbox
              :label="$t('createLead.wantToBecomeMember')"
              v-model="lead.wants_to_become_member"
            />
            <div class="control-buttons">
              <FormError :error="errors.non_field_error" />
              <QBtn color="primary" type="submit" :disabled="isSubmitting">
                {{ $t('createLead.submit') }}
              </QBtn>
            </div>
          </QForm>
        </div>
      </QScrollArea>
    </div>
  </QPage>
</template>

<style lang="scss" scoped>
@import '../css/variables';

.create-leads {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
