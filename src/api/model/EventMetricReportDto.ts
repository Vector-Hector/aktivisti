export interface EventMetricReportDto {
  completed_addresses: number
  counts_per_metric: MetricCount[]
  created_leads: number
  overall_addresses: number
}

export interface MetricCount {
  count: number,
  metric: number,
}

export interface MetricReportData {
  count: number,
  metricId: number,
  name: string
  targetCount: number
}
