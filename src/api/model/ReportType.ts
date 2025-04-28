import { useI18n } from 'vue-i18n'

export enum ReportType {
  METRICS_POSTER = 'METRICS_POSTER',
  METRICS_FLYER = 'METRICS_FLYER',
  METRICS_DOOR2DOOR = 'METRICS_DOOR2DOOR',
  ACTIVE_EVENTS = 'ACTIVE_EVENTS',
  ACTIVE_USERS = 'ACTIVE_USERS'
}
export interface ReportTypeOption {
  key: ReportType
  label: string
}
export function useReportType() {
  const { t } = useI18n()

  class ReportTypeUtil {
    static getLabel(reportType: ReportType) {
      return t('reports.reportTypes.' + reportType)
    }
  }

  const reportTypeOptions: ReportTypeOption[] = Object.keys(ReportType).map(
    (key) => ({
      key: key as ReportType,
      label: ReportTypeUtil.getLabel(key as ReportType)
    })
  )

  return {
    reportTypeOptions,
    ReportTypeUtil
  }
}
