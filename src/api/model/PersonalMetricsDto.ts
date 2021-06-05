import { MetricCount } from 'src/api/model/EventMetricReportDto'

export interface PersonalMetricsDto {
  completed_addresses: number
  counts_per_metric: MetricCount[]
}
