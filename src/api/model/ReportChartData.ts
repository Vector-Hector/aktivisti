import { ReportType } from 'src/api/model/ReportType'

export interface ReportChartData {
  uuid: string
  campaign: number
  stateAssociation: number
  subAssociation: number
  reportType: ReportType
}
