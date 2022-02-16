<script setup lang="ts">
import {
  QCard,
  QDialog,
  QCardActions,
  QBtn
} from 'quasar'
import { useDialogPluginComponent } from 'quasar'
import LevelSelection from 'components/modals/SelectReportDialog/LevelSelection.vue'
import { ref } from 'vue'
import ReportFilter from 'components/filterInput/filters/ReportFilter.vue'
import { ReportType } from 'src/api/model/ReportType'

defineEmits([
  // REQUIRED by QDialog, we need to emit some events through useDialogPluginComponent
  ...useDialogPluginComponent.emits
])
const {dialogRef, onDialogHide, onDialogCancel, onDialogOK} = useDialogPluginComponent()

defineExpose({
  // REQUIRED by QDialog to expose `dialogRef`
  dialogRef,
  // REQUIRED by QDialog to expose `onDialogHide`
  onDialogHide
})

const campaignId = ref<number | null>(null)
const stateAssociationId = ref<number | null>(null)
const subAssociationId = ref<number | null>(null)
const reportType = ref<ReportType>(ReportType.METRICS_DOOR2DOOR)

function handleLevelSelect(campaign: number, stateAssociation: number, subAssociation: number) {
  campaignId.value = campaign
  stateAssociationId.value = stateAssociation
  subAssociationId.value = subAssociation
}

function handleReportTypeSelect(value: ReportType) {
  reportType.value = value
}

function handleAdd() {
  onDialogOK({
    campaignId: campaignId.value,
    stateAssociationId: stateAssociationId.value,
    subAssociationId: subAssociationId.value,
    reportType: reportType.value
  })
}
</script>

<template>
  <QDialog
    ref="dialogRef"
    @hide="onDialogHide"
  >
    <QCard>
      <QCardActions>
        <QCard>
          <LevelSelection
            @onSelect="handleLevelSelect"
          />
          <ReportFilter
            :model-value="reportType"
            @update:model-value="handleReportTypeSelect"
          />
          <QCardActions align="right">
            <QBtn color="primary" label="Abbrechen" @click="onDialogCancel" />
            <QBtn color="primary" label="Hinzufügen" @click="handleAdd" />
          </QCardActions>
        </QCard>
      </QCardActions>

    </QCard>
  </QDialog>

</template>
