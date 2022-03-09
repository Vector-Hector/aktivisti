export enum ReportType {
  METRICS_POSTER = 'METRICS_POSTER',
  METRICS_FLYER = 'METRICS_FLYER',
  METRICS_DOOR2DOOR = 'METRICS_DOOR2DOOR',
  ACTIVE_EVENTS = 'ACTIVE_EVENTS',
  ACTIVE_USERS = 'ACTIVE_USERS'
}

enum _ReportTypeLabel {
  METRICS_POSTER = 'Plakate',
  METRICS_FLYER = 'Flyer',
  METRICS_DOOR2DOOR = 'Haustürgespräche',
  ACTIVE_EVENTS = 'Aktive Veranstaltungen',
  ACTIVE_USERS = 'Aktivierung Teilnehmer*innen'
}


export interface ReportTypeOption {
  key: ReportType,
  label: _ReportTypeLabel
}

export class ReportTypeUtil {
  static getLabel(reportType: ReportType): _ReportTypeLabel{
    return _ReportTypeLabel[reportType]
  }
}

export const reportTypeOptions: ReportTypeOption[] = Object.keys(ReportType).map((key) => ({
  key: key as ReportType,
  label: ReportTypeUtil.getLabel(key as ReportType)
}))
